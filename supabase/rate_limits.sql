-- Run this in Supabase SQL Editor.
-- Backs the app's rate limiting (payment endpoints + chat) with a simple
-- sliding-window counter, so no third-party service (Redis etc.) is needed.

create table if not exists rate_limits (
  key text primary key,           -- e.g. "pesapal:41.210.12.4"
  count integer not null default 1,
  window_start timestamptz not null default now()
);

alter table rate_limits enable row level security;

drop policy if exists "Allow app read/write" on rate_limits;
create policy "Allow app read/write" on rate_limits
  for all to anon using (true) with check (true);
