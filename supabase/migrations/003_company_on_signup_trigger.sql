-- Create company row automatically when a new auth user is inserted.
-- Runs in the same transaction as the auth.users INSERT so the FK on
-- companies.owner_id is always satisfied — no race condition possible.
--
-- company_name and company_phone are passed via options.data in signUp()
-- and land in auth.users.raw_user_meta_data.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.companies (owner_id, name, phone)
  values (
    new.id,
    new.raw_user_meta_data->>'company_name',
    new.raw_user_meta_data->>'company_phone'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
