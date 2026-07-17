-- Run in Supabase SQL Editor (already applied).
-- Lets admin bin (hide) orders without deleting payment records.

alter table transactions add column if not exists archived boolean not null default false;
create index if not exists transactions_archived_idx on transactions (archived);
