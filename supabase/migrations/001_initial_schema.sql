-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Companies (one per HVAC business)
create table companies (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  name text not null,
  owner_id uuid references auth.users(id) on delete cascade not null,
  phone text not null,
  google_review_link text,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  subscription_status text not null default 'trialing' check (subscription_status in ('trialing', 'active', 'past_due', 'canceled')),
  twilio_phone_number text
);

-- Leads (inbound SMS inquiries)
create table leads (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  company_id uuid references companies(id) on delete cascade not null,
  customer_name text,
  customer_phone text not null,
  message text not null,
  ai_response text,
  responded_at timestamptz,
  status text not null default 'new' check (status in ('new', 'responded', 'converted', 'lost'))
);

-- Quotes (good/better/best tiers)
create table quotes (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  company_id uuid references companies(id) on delete cascade not null,
  lead_id uuid references leads(id) on delete set null,
  job_description text not null,
  tiers jsonb not null default '[]',
  selected_tier text check (selected_tier in ('good', 'better', 'best')),
  status text not null default 'draft' check (status in ('draft', 'sent', 'accepted', 'declined')),
  customer_name text not null,
  customer_phone text,
  customer_email text,
  total_amount integer
);

-- Jobs (scheduled/completed work)
create table jobs (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  company_id uuid references companies(id) on delete cascade not null,
  quote_id uuid references quotes(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  description text not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'in_progress', 'complete', 'invoiced')),
  completed_at timestamptz,
  review_sent_at timestamptz,
  scheduled_for timestamptz,
  technician_name text
);

-- RLS Policies
alter table companies enable row level security;
alter table leads enable row level security;
alter table quotes enable row level security;
alter table jobs enable row level security;

create policy "Users can manage their own company" on companies
  for all using (owner_id = auth.uid());

create policy "Company members can manage leads" on leads
  for all using (
    company_id in (select id from companies where owner_id = auth.uid())
  );

create policy "Company members can manage quotes" on quotes
  for all using (
    company_id in (select id from companies where owner_id = auth.uid())
  );

create policy "Company members can manage jobs" on jobs
  for all using (
    company_id in (select id from companies where owner_id = auth.uid())
  );

-- Indexes for common queries
create index leads_company_id_status_idx on leads(company_id, status);
create index leads_created_at_idx on leads(created_at desc);
create index jobs_company_id_status_idx on jobs(company_id, status);
create index jobs_completed_at_idx on jobs(completed_at) where completed_at is not null and review_sent_at is null;
