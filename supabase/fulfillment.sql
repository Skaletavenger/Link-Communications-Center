-- Run this in Supabase SQL Editor.
-- Adds customer-visible delivery/fulfillment tracking to orders.

alter table transactions add column if not exists fulfillment_status text not null default 'received';
alter table transactions add column if not exists delivery_method text;
alter table transactions add column if not exists delivery_note text;
alter table transactions add column if not exists fulfillment_updated_at timestamptz;

alter table transactions drop constraint if exists transactions_fulfillment_status_check;
alter table transactions add constraint transactions_fulfillment_status_check
  check (fulfillment_status in ('received', 'processing', 'ready_for_pickup', 'out_for_delivery', 'completed'));

alter table transactions drop constraint if exists transactions_delivery_method_check;
alter table transactions add constraint transactions_delivery_method_check
  check (delivery_method is null or delivery_method in ('pickup', 'delivery'));

create index if not exists transactions_fulfillment_idx on transactions (fulfillment_status);
