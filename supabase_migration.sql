-- ============================================
-- TABLE: faq
-- ============================================
CREATE TABLE IF NOT EXISTS public.faq (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: gallery
-- ============================================
CREATE TABLE IF NOT EXISTS public.gallery (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('wedding', 'prewedding', 'lainnya')),
  image VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: packages
-- ============================================
CREATE TABLE IF NOT EXISTS public.packages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price VARCHAR(50) NOT NULL,
  description TEXT,
  features JSONB DEFAULT NULL,
  popular BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: reviews
-- ============================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id SERIAL PRIMARY KEY,
  customer_name VARCHAR(100) NOT NULL,
  service_type VARCHAR(20) NOT NULL CHECK (service_type IN ('wedding', 'pre-wedding', 'lainnya')),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  image VARCHAR(255) DEFAULT NULL,
  location VARCHAR(100) DEFAULT NULL,
  date DATE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: users
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(10) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES (Optional - untuk performance)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_gallery_category ON public.gallery(category);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_packages_popular ON public.packages(popular);

-- ============================================
-- ROW LEVEL SECURITY (RLS) - Supabase Best Practice
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for FAQ (Public read, Admin write)
CREATE POLICY "FAQ: Public can view" ON public.faq
  FOR SELECT USING (true);

CREATE POLICY "FAQ: Admin can insert" ON public.faq
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "FAQ: Admin can update" ON public.faq
  FOR UPDATE USING (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "FAQ: Admin can delete" ON public.faq
  FOR DELETE USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- RLS Policies for Gallery (Public read, Admin write)
CREATE POLICY "Gallery: Public can view" ON public.gallery
  FOR SELECT USING (true);

CREATE POLICY "Gallery: Admin can insert" ON public.gallery
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Gallery: Admin can update" ON public.gallery
  FOR UPDATE USING (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Gallery: Admin can delete" ON public.gallery
  FOR DELETE USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- RLS Policies for Packages (Public read, Admin write)
CREATE POLICY "Packages: Public can view" ON public.packages
  FOR SELECT USING (true);

CREATE POLICY "Packages: Admin can insert" ON public.packages
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Packages: Admin can update" ON public.packages
  FOR UPDATE USING (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Packages: Admin can delete" ON public.packages
  FOR DELETE USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- RLS Policies for Reviews (Public read, Admin write)
CREATE POLICY "Reviews: Public can view" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Reviews: Admin can insert" ON public.reviews
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Reviews: Admin can update" ON public.reviews
  FOR UPDATE USING (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Reviews: Admin can delete" ON public.reviews
  FOR DELETE USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- RLS Policies for Users (Restricted)
CREATE POLICY "Users: Users can view their own data" ON public.users
  FOR SELECT USING (
    auth.jwt() ->> 'username' = username OR
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Users: Anyone can register" ON public.users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users: Users can update own data" ON public.users
  FOR UPDATE USING (
    auth.jwt() ->> 'username' = username OR
    auth.jwt() ->> 'role' = 'admin'
  );

-- ============================================
-- NOTES FOR IMPORT
-- ============================================
-- 1. Copy this entire script
-- 2. Go to Supabase Dashboard → SQL Editor
-- 3. Paste and click "Run"
-- 4. All tables will be created with proper security policies
-- 5. Verify in Table Editor that all 5 tables exist
--
-- IMPORTANT:
-- - RLS is ENABLED by default (Supabase best practice)
-- - Public can READ all data (FAQ, Gallery, Packages, Reviews)
-- - Only ADMIN can CREATE/UPDATE/DELETE
-- - Users table is protected (users can only see their own data)
--
-- After import, you need to:
-- 1. Get Supabase URL and ANON_KEY from dashboard
-- 2. Update backend .env file
-- 3. Migrate backend code from MySQL to Supabase client
