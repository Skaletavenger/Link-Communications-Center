-- Run this in Supabase SQL Editor.
-- The payment API routes (MTN MoMo + Airtel Money) write to this table,
-- but it was never created — every payment attempt has been silently
-- failing to save (errors were caught and only logged to the server console).

create table if not exists transactions (
  id text primary key,
  user_id text,
  product_id text,
  amount numeric not null,
  phone text not null,
  reference text not null,
  provider text not null check (provider in ('mtn', 'airtel')),
  status text not null default 'pending',
  airtel_transaction_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists transactions_reference_idx on transactions (reference);
create index if not exists transactions_status_idx on transactions (status);
create index if not exists transactions_provider_idx on transactions (provider);

alter table transactions enable row level security;

-- Allow the app (anon key) to insert and read its own payment attempts.
-- Tighten this later if you add customer auth-based ownership checks.
-- Note: CREATE POLICY doesn't support IF NOT EXISTS, so we drop-then-create
-- to keep this script safely re-runnable.
drop policy if exists "Allow insert from app" on transactions;
create policy "Allow insert from app" on transactions
  for insert to anon with check (true);

drop policy if exists "Allow read from app" on transactions;
create policy "Allow read from app" on transactions
  for select to anon using (true);

drop policy if exists "Allow update from app" on transactions;
create policy "Allow update from app" on transactions
  for update to anon using (true);
