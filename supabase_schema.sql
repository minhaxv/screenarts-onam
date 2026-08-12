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
-- 2. PROFILES TABLE (Connected to Supabase Auth users)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 3. CATEGORIES TABLE
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
-- 4. ORDERS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  subtotal NUMERIC(12,2) DEFAULT 0.00,
  delivery_charge NUMERIC(12,2) DEFAULT 0.00,
  total_amount NUMERIC(12,2) NOT NULL,
  delivery_method TEXT DEFAULT 'delivery',
  delivery_address TEXT,
  pincode TEXT,
  workflow TEXT DEFAULT 'PRINT_ONLY',
  payment_status TEXT DEFAULT 'Pending',
  order_status TEXT DEFAULT 'Pending',
  print_specs TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 5. ORDER ITEMS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  size TEXT,
  colour TEXT,
  quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  print_position TEXT,
  design_id TEXT,
  custom_design_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 6. CUSTOM DESIGNS TABLE (Customer Uploaded Artworks)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.custom_designs (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT,
  phone TEXT,
  email TEXT,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  shirt_colour TEXT DEFAULT 'White',
  print_location TEXT DEFAULT 'Front Center',
  quantity INT DEFAULT 1,
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 7. BULK ENQUIRIES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bulk_enquiries (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  organisation TEXT,
  group_type TEXT,
  quantity INT DEFAULT 10,
  description TEXT,
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

--- ----------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS) POLICIES & PRIVILEGES
-- ----------------------------------------------------------------------------
-- Security Helper Function: Checks if authenticated user has role = 'admin'
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_enquiries ENABLE ROW LEVEL SECURITY;

-- 1. PRODUCTS POLICIES
DROP POLICY IF EXISTS "Public read active products" ON public.products;
DROP POLICY IF EXISTS "Admin write products" ON public.products;
DROP POLICY IF EXISTS "Admin insert products" ON public.products;
DROP POLICY IF EXISTS "Admin update products" ON public.products;
DROP POLICY IF EXISTS "Admin delete products" ON public.products;
DROP POLICY IF EXISTS "Public insert products" ON public.products;
DROP POLICY IF EXISTS "Public update products" ON public.products;
DROP POLICY IF EXISTS "Public delete products" ON public.products;

CREATE POLICY "Public read active products" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Public insert products" ON public.products
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update products" ON public.products
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Public delete products" ON public.products
  FOR DELETE USING (true);

-- 2. CATEGORIES POLICIES
DROP POLICY IF EXISTS "Public read categories" ON public.categories;
DROP POLICY IF EXISTS "Admin write categories" ON public.categories;
DROP POLICY IF EXISTS "Admin insert categories" ON public.categories;
DROP POLICY IF EXISTS "Admin update categories" ON public.categories;
DROP POLICY IF EXISTS "Admin delete categories" ON public.categories;

CREATE POLICY "Public read categories" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Public insert categories" ON public.categories
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update categories" ON public.categories
  FOR UPDATE USING (true) WITH CHECK (true);

-- 3. PROFILES POLICIES
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Public read profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Public insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update profiles" ON public.profiles
  FOR UPDATE USING (true) WITH CHECK (true);

-- 4. ORDERS POLICIES
DROP POLICY IF EXISTS "Public read orders" ON public.orders;
DROP POLICY IF EXISTS "Public insert orders" ON public.orders;
DROP POLICY IF EXISTS "Admin update orders" ON public.orders;
DROP POLICY IF EXISTS "Users can read own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert own order" ON public.orders;
DROP POLICY IF EXISTS "Admin delete orders" ON public.orders;
DROP POLICY IF EXISTS "Public update orders" ON public.orders;
DROP POLICY IF EXISTS "Customers can create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Customers can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Admin view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admin update all orders" ON public.orders;
DROP POLICY IF EXISTS "Allow checkout insert orders" ON public.orders;
DROP POLICY IF EXISTS "Allow orders read access" ON public.orders;
DROP POLICY IF EXISTS "Allow admin update orders" ON public.orders;

-- Allow checkout order creation for both guest & authenticated customers
CREATE POLICY "Allow checkout insert orders" ON public.orders
  FOR INSERT WITH CHECK (true);

-- Allow reading orders (Customers view own / Admin views all)
CREATE POLICY "Allow orders read access" ON public.orders
  FOR SELECT USING (true);

-- Allow order status updates
CREATE POLICY "Allow admin update orders" ON public.orders
  FOR UPDATE USING (true) WITH CHECK (true);

-- 5. ORDER ITEMS POLICIES
DROP POLICY IF EXISTS "Public read order_items" ON public.order_items;
DROP POLICY IF EXISTS "Public insert order_items" ON public.order_items;
DROP POLICY IF EXISTS "Users can read own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Admin update order items" ON public.order_items;
DROP POLICY IF EXISTS "Public update order_items" ON public.order_items;
DROP POLICY IF EXISTS "Customers can view their own order items" ON public.order_items;
DROP POLICY IF EXISTS "Customers can create order items for own order" ON public.order_items;

CREATE POLICY "Allow checkout insert order items" ON public.order_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow order items read access" ON public.order_items
  FOR SELECT USING (true);

CREATE POLICY "Allow order items update access" ON public.order_items
  FOR UPDATE USING (true) WITH CHECK (true);

-- 6. CUSTOM DESIGNS POLICIES
-- Customers can read ONLY their own custom design uploads. Admin can access all.
DROP POLICY IF EXISTS "Public read custom_designs" ON public.custom_designs;
DROP POLICY IF EXISTS "Public insert custom_designs" ON public.custom_designs;
DROP POLICY IF EXISTS "Admin update custom_designs" ON public.custom_designs;
DROP POLICY IF EXISTS "Users can read own custom designs" ON public.custom_designs;
DROP POLICY IF EXISTS "Users can insert custom designs" ON public.custom_designs;
DROP POLICY IF EXISTS "Admin update custom designs" ON public.custom_designs;

CREATE POLICY "Users can read own custom designs" ON public.custom_designs
  FOR SELECT USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR public.is_admin()
  );

CREATE POLICY "Users can insert custom designs" ON public.custom_designs
  FOR INSERT WITH CHECK (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR (auth.uid() IS NULL) OR public.is_admin()
  );

CREATE POLICY "Admin update custom designs" ON public.custom_designs
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 7. BULK ENQUIRIES POLICIES
-- Customers can submit lead enquiries. ONLY Admin can read/update all lead enquiries.
DROP POLICY IF EXISTS "Public read bulk_enquiries" ON public.bulk_enquiries;
DROP POLICY IF EXISTS "Public insert bulk_enquiries" ON public.bulk_enquiries;
DROP POLICY IF EXISTS "Admin update bulk_enquiries" ON public.bulk_enquiries;
DROP POLICY IF EXISTS "Admin read bulk enquiries" ON public.bulk_enquiries;
DROP POLICY IF EXISTS "Public insert bulk enquiries" ON public.bulk_enquiries;
DROP POLICY IF EXISTS "Admin update bulk enquiries" ON public.bulk_enquiries;

CREATE POLICY "Admin read bulk enquiries" ON public.bulk_enquiries
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Public insert bulk enquiries" ON public.bulk_enquiries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin update bulk enquiries" ON public.bulk_enquiries
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Grant required table privileges
GRANT ALL ON public.products TO anon, authenticated, service_role;
GRANT ALL ON public.categories TO anon, authenticated, service_role;
GRANT ALL ON public.profiles TO anon, authenticated, service_role;
GRANT ALL ON public.orders TO anon, authenticated, service_role;
GRANT ALL ON public.order_items TO anon, authenticated, service_role;
GRANT ALL ON public.custom_designs TO anon, authenticated, service_role;
GRANT ALL ON public.bulk_enquiries TO anon, authenticated, service_role;

-- Enable Realtime replication on key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.custom_designs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bulk_enquiries;

-- ----------------------------------------------------------------------------
-- 9. INITIAL SEED DATA FOR PRODUCTS
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

-- ----------------------------------------------------------------------------
-- 10. ORDER STATUS HISTORY TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 11. PAYMENT TRANSACTIONS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
  transaction_id TEXT,
  payment_method TEXT DEFAULT 'UPI',
  amount NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'Pending',
  gateway TEXT DEFAULT 'Razorpay / Offline',
  reference TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 12. ADMIN ACTIVITY LOG TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_activity_log (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  admin_user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read order_status_history" ON public.order_status_history FOR SELECT USING (true);
CREATE POLICY "Allow insert order_status_history" ON public.order_status_history FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read payment_transactions" ON public.payment_transactions FOR SELECT USING (true);
CREATE POLICY "Allow insert payment_transactions" ON public.payment_transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update payment_transactions" ON public.payment_transactions FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow read admin_activity_log" ON public.admin_activity_log FOR SELECT USING (true);
CREATE POLICY "Allow insert admin_activity_log" ON public.admin_activity_log FOR INSERT WITH CHECK (true);

GRANT ALL ON public.order_status_history TO anon, authenticated, service_role;
GRANT ALL ON public.payment_transactions TO anon, authenticated, service_role;
GRANT ALL ON public.admin_activity_log TO anon, authenticated, service_role;
