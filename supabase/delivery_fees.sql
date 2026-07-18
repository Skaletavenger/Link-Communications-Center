-- Run in Supabase SQL Editor.
-- Delivery pricing fields for checkout (zone = distance tier, speed = urgency).

alter table transactions add column if not exists delivery_zone text;
alter table transactions add column if not exists delivery_fee numeric not null default 0;
alter table transactions add column if not exists delivery_speed text;
alter table transactions add column if not exists delivery_address text;
