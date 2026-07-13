-- Schema snapshot of public.products exported from the live database on 2026-07-13.
-- This table was originally created via the Supabase UI and was never version-controlled.
create table if not exists public.products (
  id uuid default gen_random_uuid() not null,
  name text not null,
  brand text not null,
  model text default ''::text,
  category text default 'Other'::text,
  price numeric default 0 not null,
  stock_quantity integer default 0 not null,
  description text default ''::text,
  image text default ''::text,
  images text[] default '{}'::text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint products_pkey PRIMARY KEY (id)
);

alter table public.products enable row level security;

create policy "admin delete products" on public.products for delete using (is_admin());
create policy "admin insert products" on public.products for insert with check (is_admin());
create policy "public read products" on public.products for select using (true);
create policy "admin update products" on public.products for update using (is_admin()) with check (is_admin());
