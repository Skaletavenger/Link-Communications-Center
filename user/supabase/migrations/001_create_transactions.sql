-- Migration: create transactions table for Airtel payments
CREATE TABLE IF NOT EXISTS public.transactions (
  id text PRIMARY KEY,
  user_id text,
  product_id text,
  amount numeric,
  phone text,
  airtel_transaction_id text,
  status text,
  reference text,
  created_at timestamptz DEFAULT now()
);

-- Optional index on airtel_transaction_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_transactions_airtel_tx ON public.transactions (airtel_transaction_id);
