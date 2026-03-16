-- Fix companies RLS: replace the combined FOR ALL policy with explicit
-- per-operation policies so INSERT is covered by WITH CHECK (not USING).
-- Company creation during signup is handled via the service-role API route
-- (/api/auth/create-company) which bypasses RLS, so the INSERT policy here
-- covers any future direct authenticated inserts.

drop policy "Users can manage their own company" on companies;

create policy "Users can select their own company" on companies
  for select using (owner_id = auth.uid());

create policy "Users can update their own company" on companies
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "Users can delete their own company" on companies
  for delete using (owner_id = auth.uid());

create policy "Users can insert their own company" on companies
  for insert with check (owner_id = auth.uid());
