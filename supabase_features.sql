-- ====================================================================
-- AKHIL FOODS - SUPABASE FEATURES SCHEMA
-- Safe to run multiple times (idempotent / IF NOT EXISTS)
-- Tables: products (stock column), reviews, wholesale_inquiries
-- Row Level Security (RLS) & Permissions
-- ====================================================================

-- 1. Ensure stock columns exist on public.products
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'products') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'stock_count') THEN
            ALTER TABLE public.products ADD COLUMN stock_count integer NOT NULL DEFAULT 50;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'stock') THEN
            ALTER TABLE public.products ADD COLUMN stock integer NOT NULL DEFAULT 50;
        END IF;
    END IF;
END $$;


-- 2. Reviews Table (Public can view ONLY approved reviews; Writes strictly via server)
CREATE TABLE IF NOT EXISTS public.reviews (
    id text PRIMARY KEY,
    product_id text NOT NULL,
    order_number text NOT NULL,
    customer_name text NOT NULL,
    phone text NOT NULL,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment text NOT NULL,
    photo_url text,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookup by product and status
CREATE INDEX IF NOT EXISTS idx_reviews_product_status ON public.reviews(product_id, status);
CREATE INDEX IF NOT EXISTS idx_reviews_order_number ON public.reviews(order_number);

-- Enable RLS on reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Public can read ONLY approved reviews
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'reviews' AND policyname = 'Public can view approved reviews'
    ) THEN
        CREATE POLICY "Public can view approved reviews"
        ON public.reviews
        FOR SELECT
        USING (status = 'approved');
    END IF;
END $$;

-- Grants for reviews table
GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT ALL ON public.reviews TO service_role;


-- 3. Wholesale Inquiries Table (No public access; Access strictly via server service_role)
CREATE TABLE IF NOT EXISTS public.wholesale_inquiries (
    id text PRIMARY KEY,
    business_name text NOT NULL,
    contact_person text NOT NULL,
    phone text NOT NULL,
    city text NOT NULL,
    quantity_needed text NOT NULL,
    message text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for sorting inquiries by date
CREATE INDEX IF NOT EXISTS idx_wholesale_created_at ON public.wholesale_inquiries(created_at DESC);

-- Enable RLS on wholesale_inquiries
ALTER TABLE public.wholesale_inquiries ENABLE ROW LEVEL SECURITY;

-- Grants for wholesale_inquiries (strictly service_role, no public read or write policies)
REVOKE ALL ON public.wholesale_inquiries FROM anon, authenticated;
GRANT ALL ON public.wholesale_inquiries TO service_role;
