-- ===============================================================
-- AKHIL FOODS - SUPABASE ROW LEVEL SECURITY (RLS) POLICIES
-- Execute this script in your Supabase Dashboard -> SQL Editor
-- ===============================================================

-- 1. Ensure Contact Messages table exists with proper schema
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id TEXT PRIMARY KEY DEFAULT ('msg_' || replace(gen_random_uuid()::text, '-', '')),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS) on all core tables
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contact_messages ENABLE ROW LEVEL SECURITY;

-- 3. Drop all existing / legacy permissive policies
DROP POLICY IF EXISTS "Public products read access" ON public.products;
DROP POLICY IF EXISTS "Public can view products" ON public.products;
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
DROP POLICY IF EXISTS "Products readable by everyone" ON public.products;
DROP POLICY IF EXISTS "Service role product write" ON public.products;

DROP POLICY IF EXISTS "Public orders insert access" ON public.orders;
DROP POLICY IF EXISTS "Orders read access" ON public.orders;
DROP POLICY IF EXISTS "Orders update access" ON public.orders;
DROP POLICY IF EXISTS "Allow anon inserts" ON public.orders;
DROP POLICY IF EXISTS "Allow anon reads" ON public.orders;
DROP POLICY IF EXISTS "Orders access restricted" ON public.orders;

DROP POLICY IF EXISTS "Public contact insert access" ON public.contact_messages;
DROP POLICY IF EXISTS "Contact messages insert access" ON public.contact_messages;
DROP POLICY IF EXISTS "Contact messages read access" ON public.contact_messages;

-- 4. PRODUCTS TABLE RLS:
-- Products are readable by everyone (public visitors, anon role, and service role).
-- Products are writable ONLY by service role (service_role automatically bypasses RLS; write policies are revoked from anon and authenticated).
CREATE POLICY "Products readable by everyone"
  ON public.products
  FOR SELECT
  TO public
  USING (true);

-- Explicitly revoke write permissions from anon and public roles
REVOKE INSERT, UPDATE, DELETE ON TABLE public.products FROM anon, authenticated, public;
GRANT SELECT ON TABLE public.products TO anon, authenticated, public;

-- 5. ORDERS TABLE RLS:
-- Orders are NOT readable or writable by the anon or public roles.
-- Only the server-side service_role (via Next.js API routes using SUPABASE_SERVICE_ROLE_KEY) can read or write orders.
-- In PostgreSQL, enabling RLS with no policies granted to anon denies all operations by default.
REVOKE ALL ON TABLE public.orders FROM anon;
REVOKE ALL ON TABLE public.orders FROM public;

-- 6. CONTACT MESSAGES TABLE RLS:
-- Contact messages are NOT readable or writable by the anon or public roles.
-- Only the server-side service_role (via Next.js API routes using SUPABASE_SERVICE_ROLE_KEY) can read or write messages.
REVOKE ALL ON TABLE public.contact_messages FROM anon;
REVOKE ALL ON TABLE public.contact_messages FROM public;

-- 7. Status Verification Queries:
-- Confirm RLS is enabled on all tables (rowsecurity = true)
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename IN ('products', 'orders', 'contact_messages');

-- List all active RLS policies
SELECT schemaname, tablename, policyname, roles, cmd 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename IN ('products', 'orders', 'contact_messages');
