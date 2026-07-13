-- Schema snapshot of public.user_profiles exported from the live database on 2026-07-13.
-- This table was originally created via the Supabase UI and was never version-controlled.
create table if not exists public.user_profiles (
  id uuid not null,
  email text not null,
  username text,
  username_set boolean default false,
  email_verified boolean default false,
  created_at timestamptz default now(),
  constraint user_profiles_username_key UNIQUE (username),
  constraint user_profiles_pkey PRIMARY KEY (id),
  constraint user_profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

alter table public.user_profiles enable row level security;

create policy "Users can manage own profile" on public.user_profiles for all using ((auth.uid() = id));
