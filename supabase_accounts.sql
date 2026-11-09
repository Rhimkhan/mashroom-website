-- ===============================================================
-- AKHIL FOODS - SUPABASE USER ACCOUNTS & ORDERS MIGRATION
-- Adds user_id column to public.orders and configures RLS policies
-- Safe to execute multiple times (idempotent)
-- DO NOT RUN AUTOMATICALLY; RUN MANUALLY IN SUPABASE SQL EDITOR IF NEEDED
-- ===============================================================

-- 1. Add user_id column to orders table referencing auth.users(id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'orders' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 2. Create index on orders(user_id) for fast customer order lookups
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);

-- 3. Ensure Row Level Security is enabled on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 4. Policy: Authenticated users can view only their own orders
DROP POLICY IF EXISTS "Authenticated users can view their own orders" ON public.orders;
CREATE POLICY "Authenticated users can view their own orders" ON public.orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 5. Policy: Allow customer order placement
DROP POLICY IF EXISTS "Enable order placement" ON public.orders;
CREATE POLICY "Enable order placement" ON public.orders
  FOR INSERT
  WITH CHECK (true);

