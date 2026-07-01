-- Supabase SQL to create/migrate `loans` table with new schema
-- Run this in your Supabase SQL editor for project `coyrlfrwjbhidlxjlzxc`

BEGIN;

-- Create table if it doesn't exist (initial setup)
CREATE TABLE IF NOT EXISTS public.loans (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  brand text NOT NULL,
  model text NOT NULL,
  storage_variant text,
  total_cash_price numeric(12,2) NOT NULL DEFAULT 0,
  initial_deposit_percent numeric(5,2) DEFAULT 50,
  daily_payment_amount numeric(12,2) DEFAULT 0,
  daily_plan_duration_days integer DEFAULT 30,
  monthly_payment_amount numeric(12,2) DEFAULT 0,
  monthly_plan_duration_months integer DEFAULT 12,
  loan_policy text DEFAULT '',
  image_url text,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Migration: add new columns if they don't exist (for existing databases)
ALTER TABLE public.loans
  ADD COLUMN IF NOT EXISTS total_cash_price numeric(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS initial_deposit_percent numeric(5,2) DEFAULT 50,
  ADD COLUMN IF NOT EXISTS daily_payment_amount numeric(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS daily_plan_duration_days integer DEFAULT 30,
  ADD COLUMN IF NOT EXISTS monthly_payment_amount numeric(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS monthly_plan_duration_months integer DEFAULT 12,
  ADD COLUMN IF NOT EXISTS loan_policy text DEFAULT '';

-- Migrate data from old columns to new columns (if old columns exist)
-- This is a one-time operation for existing records
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='loans' AND column_name='device_price') THEN
    UPDATE public.loans SET total_cash_price = COALESCE(device_price, 0) WHERE total_cash_price = 0;
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

-- RLS policy: allow authenticated users to select
CREATE POLICY IF NOT EXISTS "allow_select_authenticated" ON public.loans
  FOR SELECT USING (auth.role() IS NOT NULL);

-- Example seed data with new schema
INSERT INTO public.loans (brand, model, storage_variant, total_cash_price, initial_deposit_percent, daily_payment_amount, daily_plan_duration_days, monthly_payment_amount, monthly_plan_duration_months, loan_policy, image_url, is_available)
VALUES
  ('TECNO', 'Spark 9', '4GB/64GB', 350000.00, 50, 1500.00, 90, 30000.00, 12, 'Phone must be returned if 3 consecutive payments are missed.', 'https://via.placeholder.com/400x300?text=TECNO+Spark+9', true),
  ('INFINIX', 'Hot 12', '4GB/64GB', 320000.00, 50, 1400.00, 90, 28000.00, 12, 'Standard loan terms apply.', 'https://via.placeholder.com/400x300?text=INFINIX+Hot+12', true),
  ('ITEL', 'S18', '3GB/32GB', 200000.00, 50, 900.00, 90, 18000.00, 12, 'Device warranty included.', 'https://via.placeholder.com/400x300?text=ITEL+S18', true)
ON CONFLICT DO NOTHING;

-- Create loan settings table and seed single row
CREATE TABLE IF NOT EXISTS public.loan_settings (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  daily_deposit_percent numeric(5,2) DEFAULT 10,
  monthly_deposit_percent numeric(5,2) DEFAULT 20,
  min_loan_duration_days int DEFAULT 30,
  max_loan_duration_days int DEFAULT 365,
  contact_phone text DEFAULT '+256700000000',
  updated_at timestamptz DEFAULT now()
);

INSERT INTO public.loan_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

-- Create loan applications table
CREATE TABLE IF NOT EXISTS public.loan_applications (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  loan_id bigint REFERENCES public.loans(id),
  plan_type text CHECK (plan_type IN ('daily','monthly')),
  full_name text NOT NULL,
  phone text NOT NULL,
  nin text,
  duration int NOT NULL,
  total_repayment numeric(12,2),
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

COMMIT;

