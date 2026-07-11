-- Clean slate for loans feature
-- Run this in Supabase SQL editor

BEGIN;

-- Drop and recreate loans table from scratch
DROP TABLE IF EXISTS public.loan_applications CASCADE;
DROP TABLE IF EXISTS public.loan_settings CASCADE;
DROP TABLE IF EXISTS public.loans CASCADE;

CREATE TABLE public.loans (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  brand text NOT NULL,
  model text NOT NULL,
  storage_variant text,
  device_price numeric(12,2) NOT NULL DEFAULT 0,
  daily_deposit numeric(12,2) DEFAULT 0,
  daily_amount numeric(12,2) DEFAULT 0,
  monthly_deposit numeric(12,2) DEFAULT 0,
  monthly_amount numeric(12,2) DEFAULT 0,
  image_url text,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read" ON public.loans
  FOR SELECT USING (true);

-- NOTE: this app has no real server-side admin authentication yet (the
-- admin panel currently only checks a PIN client-side in JavaScript), so
-- there is no Supabase Auth session to actually restrict writes to.
-- The previous policy here used `auth.role() IS NOT NULL`, which looks
-- like it restricts writes to logged-in users, but Supabase's anon key
-- always evaluates auth.role() to 'anon' (never NULL) - so that policy
-- was accidentally wide open to everyone, while *appearing* restricted.
-- This is written honestly as public until real admin authentication
-- exists (tracked separately) - see the transactions/site_content tables
-- for the same pattern.
CREATE POLICY "allow_all_writes" ON public.loans
  FOR ALL USING (true) WITH CHECK (true);

COMMIT;
