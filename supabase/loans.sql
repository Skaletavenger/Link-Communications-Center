-- Supabase SQL to create `loans` table and example seeds.
-- Run this in your Supabase SQL editor for project `coyrlfrwjbhidlxjlzxc`.

BEGIN;

CREATE TABLE IF NOT EXISTS public.loans (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  brand text NOT NULL,
  model text NOT NULL,
  storage_variant text,
  device_price numeric(12,2) NOT NULL,
  daily_deposit numeric(12,2),
  daily_amount numeric(12,2),
  monthly_deposit numeric(12,2),
  monthly_amount numeric(12,2),
  image_url text,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security and example policy (adjust to your auth setup)
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

-- Example RLS policy: allow authenticated users to select
-- Replace with stricter policies as needed.
CREATE POLICY "allow_select_authenticated" ON public.loans
  FOR SELECT USING (auth.role() IS NOT NULL);

-- Example seed data (replace these rows with the exact 15 records you want)
-- Inserted as examples; edit values to match your provided figures.
INSERT INTO public.loans (brand, model, storage_variant, device_price, daily_deposit, daily_amount, monthly_deposit, monthly_amount, image_url, is_available)
VALUES
  ('TECNO', 'Spark 9', '4GB/64GB', 350000.00, 1000.00, 1500.00, 25000.00, 30000.00, 'https://via.placeholder.com/400x300?text=TECNO+Spark+9', true),
  ('INFINIX', 'Hot 12', '4GB/64GB', 320000.00, 900.00, 1400.00, 23000.00, 28000.00, 'https://via.placeholder.com/400x300?text=INFINIX+Hot+12', true),
  ('ITEL', 'S18', '3GB/32GB', 200000.00, 600.00, 900.00, 15000.00, 18000.00, 'https://via.placeholder.com/400x300?text=ITEL+S18', true);

COMMIT;

-- Note: This file creates the table and example seeds. If you want me to
-- generate the exact 15 rows, provide the full list of models and figures
-- and I will update this file accordingly.
