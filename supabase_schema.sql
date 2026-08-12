-- ============================================================================
-- SCREENARTS ONAM PLATFORM — COMPLETE SUPABASE POSTGRESQL SCHEMA & SEED DATA
-- Run this script in your Supabase SQL Editor (https://app.supabase.com/project/_/sql)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. PRODUCTS TABLE (Single Source of Truth for Storefront & Admin)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  original_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  category JSONB DEFAULT '["men"]'::jsonb,
  tags JSONB DEFAULT '["Kerala","Onam"]'::jsonb,
  colours JSONB DEFAULT '["white","cream","green"]'::jsonb,
  sizes JSONB DEFAULT '["S","M","L","XL","XXL"]'::jsonb,
  size_type TEXT DEFAULT 'adult',
  print_location TEXT DEFAULT 'front',
  print_ratio TEXT DEFAULT '4:5',
  image_type TEXT DEFAULT 'vector',
  images JSONB DEFAULT '{"front": "/images/custom-flatlay.png"}'::jsonb,
  is_new BOOLEAN DEFAULT true,
  is_bestseller BOOLEAN DEFAULT false,
  in_stock BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  rating NUMERIC(3,2) DEFAULT 5.00,
  reviews_count INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. CATEGORIES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tagline TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 3. ORDERS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  total_amount NUMERIC(12,2) NOT NULL,
  delivery_method TEXT DEFAULT 'delivery',
  delivery_address TEXT,
  pincode TEXT,
  payment_status TEXT DEFAULT 'Pending',
  order_status TEXT DEFAULT 'Received',
  print_specs TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 4. ENABLE ROW LEVEL SECURITY (RLS) & PUBLIC READ ACCESS
-- ----------------------------------------------------------------------------
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active products for customer storefront
DROP POLICY IF EXISTS "Public read active products" ON public.products;
CREATE POLICY "Public read active products"
  ON public.products FOR SELECT
  USING (true);

-- Allow full permissions for insert/update/delete on products
DROP POLICY IF EXISTS "Admin write products" ON public.products;
CREATE POLICY "Admin write products"
  ON public.products FOR ALL
  USING (true)
  WITH CHECK (true);

-- Allow public read categories
DROP POLICY IF EXISTS "Public read categories" ON public.categories;
CREATE POLICY "Public read categories"
  ON public.categories FOR SELECT
  USING (true);

-- Allow public insert orders
DROP POLICY IF EXISTS "Public insert orders" ON public.orders;
CREATE POLICY "Public insert orders"
  ON public.orders FOR INSERT
  WITH CHECK (true);

-- Grant privileges to anon, authenticated, and service_role
GRANT ALL ON public.products TO anon, authenticated, service_role;
GRANT ALL ON public.categories TO anon, authenticated, service_role;
GRANT ALL ON public.orders TO anon, authenticated, service_role;

-- Enable Realtime replication for instant sync across browser tabs
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;

-- ----------------------------------------------------------------------------
-- 5. INITIAL SEED DATA FOR PRODUCTS
-- ----------------------------------------------------------------------------
INSERT INTO public.products (
  id, name, slug, price, original_price, description, category, tags, colours, sizes, size_type, print_location, print_ratio, image_type, images, is_new, is_bestseller, is_active
) VALUES
(
  'prod-mahabali-minimal',
  'Mahabali Minimalist Vector Tee',
  'mahabali-minimalist-vector-tee',
  499.00,
  799.00,
  'Clean line-art Mahabali graphic on premium 100% combed cotton. Printed with eco-friendly inks at ScreenArts Calicut.',
  '["men","women"]'::jsonb,
  '["Mahabali","Minimal","Kerala"]'::jsonb,
  '["white","cream","green","black"]'::jsonb,
  '["S","M","L","XL","XXL"]'::jsonb,
  'adult',
  'front',
  '4:5',
  'vector',
  '{"front": "/images/products/mahabali-front.jpg"}'::jsonb,
  true,
  true,
  true
),
(
  'prod-kerala-vibes-kasavu',
  'Kerala Vibes Kasavu Border Edition',
  'kerala-vibes-kasavu-border-edition',
  699.00,
  999.00,
  'Gold foil printed Kasavu border accent with Onam typography. Authentic Kerala aesthetic crafted in Calicut.',
  '["men","women","family"]'::jsonb,
  '["Kasavu","Gold Foil","Kerala Vibes"]'::jsonb,
  '["white","cream","gold"]'::jsonb,
  '["XS","S","M","L","XL","XXL"]'::jsonb,
  'adult',
  'front',
  '4:5',
  'lifestyle',
  '{"front": "/images/products/kerala-vibes-front.jpg"}'::jsonb,
  true,
  true,
  true
),
(
  'prod-onam-loading',
  'Onam 2026 Loading... Youth Tee',
  'onam-2026-loading-youth-tee',
  399.00,
  599.00,
  'Fun trending typography for college groups, kids, and youth celebrations.',
  '["kids","college","men"]'::jsonb,
  '["Youth","Onam 2026","Typography"]'::jsonb,
  '["white","black","green","yellow"]'::jsonb,
  '["S","M","L","XL"]'::jsonb,
  'adult',
  'front',
  '3:4',
  'vector',
  '{"front": "/images/products/onam-loading-front.jpg"}'::jsonb,
  false,
  true,
  true
),
(
  'prod-pookalam-art',
  'Geometric Pookalam Floral Art Tee',
  'geometric-pookalam-floral-art-tee',
  549.00,
  849.00,
  'Modern geometric interpretation of traditional Onam floral carpets.',
  '["women","couples"]'::jsonb,
  '["Pookalam","Floral","Geometric"]'::jsonb,
  '["cream","white","yellow"]'::jsonb,
  '["S","M","L","XL"]'::jsonb,
  'adult',
  'front',
  '1:1',
  'vector',
  '{"front": "/images/products/pookalam-front.jpg"}'::jsonb,
  true,
  false,
  true
),
(
  'prod-naadan-swag',
  'Naadan Swag Malayalam Typography Tee',
  'naadan-swag-malayalam-typography-tee',
  449.00,
  699.00,
  'Bold Malayalam lettering design for festive Onam gatherings.',
  '["men","college"]'::jsonb,
  '["Malayalam","Typography","Swag"]'::jsonb,
  '["black","white","green"]'::jsonb,
  '["S","M","L","XL","XXL"]'::jsonb,
  'adult',
  'front',
  '4:5',
  'vector',
  '{"front": "/images/products/naadan-front.jpg"}'::jsonb,
  false,
  false,
  true
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  description = EXCLUDED.description,
  colours = EXCLUDED.colours,
  sizes = EXCLUDED.sizes,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();
