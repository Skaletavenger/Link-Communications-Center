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

CREATE POLICY "allow_all_authenticated" ON public.loans
  FOR ALL USING (auth.role() IS NOT NULL);

COMMIT;
