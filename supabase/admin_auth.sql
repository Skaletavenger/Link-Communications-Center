-- Real admin authentication for Link Communications Center.
-- HOW TO USE (in this order):
--   1. Supabase Dashboard -> Authentication -> Users -> Add user:
--      create your admin account (email + password, check "Auto Confirm User").
--   2. Edit YOUR-ADMIN-EMAIL-HERE below to that email address.
--   3. Run this whole file in Supabase Dashboard -> SQL Editor.
-- After this runs, only the admin account can write to products, loans and
-- site_content. Public visitors can still read them, and the contact form
-- still accepts submissions (but only the admin can read messages).

-- 1. Admin registry. RLS with no policies = untouchable via the public API.
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;

-- 2. Helper used by all the policies below.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;
grant execute on function public.is_admin() to anon, authenticated;

-- 3. Register the admin account (EDIT THE EMAIL FIRST).
insert into public.admin_users (user_id)
select id from auth.users where email = 'YOUR-ADMIN-EMAIL-HERE'
on conflict (user_id) do nothing;

-- 4. products / loans / site_content: public read, admin-only writes.
--    Drops every existing policy on these tables first, so whatever
--    inconsistent state they were in, they end up in a known-good one.
do $$
declare
  t text;
  pol record;
begin
  foreach t in array array['products', 'loans', 'site_content'] loop
    execute format('alter table public.%I enable row level security', t);
    for pol in
      select policyname from pg_policies where schemaname = 'public' and tablename = t
    loop
      execute format('drop policy %I on public.%I', pol.policyname, t);
    end loop;
    execute format('create policy "public read %s" on public.%I for select using (true)', t, t);
    execute format('create policy "admin insert %s" on public.%I for insert with check (public.is_admin())', t, t);
    execute format('create policy "admin update %s" on public.%I for update using (public.is_admin()) with check (public.is_admin())', t, t);
    execute format('create policy "admin delete %s" on public.%I for delete using (public.is_admin())', t, t);
  end loop;
end $$;

-- 5. contact_messages: anyone can submit, only the admin can read or delete.
do $$
declare pol record;
begin
  execute 'alter table public.contact_messages enable row level security';
  for pol in
    select policyname from pg_policies where schemaname = 'public' and tablename = 'contact_messages'
  loop
    execute format('drop policy %I on public.contact_messages', pol.policyname);
  end loop;
end $$;
create policy "public insert contact_messages" on public.contact_messages for insert with check (true);
create policy "admin read contact_messages" on public.contact_messages for select using (public.is_admin());
create policy "admin delete contact_messages" on public.contact_messages for delete using (public.is_admin());

-- Sanity check: should list 4 policies each for products/loans/site_content,
-- 3 for contact_messages.
select tablename, policyname, cmd from pg_policies
where schemaname = 'public'
  and tablename in ('products', 'loans', 'site_content', 'contact_messages')
order by tablename, cmd;
