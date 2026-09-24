-- KisanSetu Marketplace Schema
-- Adds equipment, labour, provider capabilities, images, wishlist, saved searches

-- ============================================================
-- 1. ENUMS
-- ============================================================
DROP TYPE IF EXISTS public.equipment_condition CASCADE;
CREATE TYPE public.equipment_condition AS ENUM ('excellent', 'good', 'fair', 'needs_repair');

DROP TYPE IF EXISTS public.listing_status CASCADE;
CREATE TYPE public.listing_status AS ENUM ('draft', 'pending', 'active', 'paused', 'rejected');

DROP TYPE IF EXISTS public.listing_type CASCADE;
CREATE TYPE public.listing_type AS ENUM ('rent', 'buy', 'both');

DROP TYPE IF EXISTS public.labour_skill CASCADE;
CREATE TYPE public.labour_skill AS ENUM (
  'harvesting', 'sowing', 'planting', 'weeding', 'spraying',
  'ploughing', 'irrigation', 'loading_unloading', 'crop_cutting', 'other'
);

-- ============================================================
-- 2. EXTEND user_profiles with provider fields
-- ============================================================
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS village TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS district TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS state TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS pin_code TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS farm_size TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS crops_grown TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS is_provider BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS provider_type TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS business_name TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS experience_years INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS latitude NUMERIC(10,7),
  ADD COLUMN IF NOT EXISTS longitude NUMERIC(10,7),
  ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT '';

-- ============================================================
-- 3. EQUIPMENT CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.equipment_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT DEFAULT '🚜',
  description TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 4. EQUIPMENT LISTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.equipment_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '',
  brand TEXT DEFAULT '',
  model TEXT DEFAULT '',
  year INTEGER,
  condition public.equipment_condition DEFAULT 'good'::public.equipment_condition,
  horsepower INTEGER,
  fuel_type TEXT DEFAULT 'diesel',
  hours_used INTEGER DEFAULT 0,
  last_serviced DATE,
  engine_condition TEXT DEFAULT '',
  tyre_condition TEXT DEFAULT '',
  known_issues TEXT DEFAULT '',
  description TEXT DEFAULT '',
  -- Location
  location TEXT NOT NULL DEFAULT '',
  district TEXT DEFAULT '',
  state TEXT DEFAULT '',
  pin_code TEXT DEFAULT '',
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  -- Pricing
  listing_type public.listing_type DEFAULT 'both'::public.listing_type,
  rent_per_hour NUMERIC(10,2) DEFAULT 0,
  rent_per_day NUMERIC(10,2) DEFAULT 0,
  rent_per_acre NUMERIC(10,2) DEFAULT 0,
  buy_price NUMERIC(12,2) DEFAULT 0,
  deposit NUMERIC(10,2) DEFAULT 0,
  -- Driver
  has_driver BOOLEAN DEFAULT false,
  driver_name TEXT DEFAULT '',
  driver_phone TEXT DEFAULT '',
  driver_experience TEXT DEFAULT '',
  driver_rate_per_day NUMERIC(10,2) DEFAULT 0,
  -- Delivery
  delivery_available BOOLEAN DEFAULT false,
  delivery_radius_km INTEGER DEFAULT 0,
  delivery_charge NUMERIC(10,2) DEFAULT 0,
  -- Status
  status public.listing_status DEFAULT 'pending'::public.listing_status,
  is_available BOOLEAN DEFAULT true,
  views INTEGER DEFAULT 0,
  -- Ratings (denormalized for performance)
  avg_rating NUMERIC(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 5. EQUIPMENT IMAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.equipment_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT DEFAULT '',
  is_primary BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 6. LABOUR LISTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.labour (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  profile_image TEXT DEFAULT '',
  skills TEXT[] DEFAULT ARRAY[]::TEXT[],
  experience_years INTEGER DEFAULT 0,
  team_size INTEGER DEFAULT 1,
  min_team_size INTEGER DEFAULT 1,
  max_team_size INTEGER DEFAULT 1,
  languages TEXT[] DEFAULT ARRAY['Hindi']::TEXT[],
  -- Location
  location TEXT NOT NULL DEFAULT '',
  district TEXT DEFAULT '',
  state TEXT DEFAULT '',
  working_radius_km INTEGER DEFAULT 20,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  -- Pricing
  wage_per_day NUMERIC(10,2) NOT NULL DEFAULT 0,
  wage_per_acre NUMERIC(10,2) DEFAULT 0,
  -- Availability
  available_days TEXT[] DEFAULT ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday']::TEXT[],
  -- Status
  status public.listing_status DEFAULT 'active'::public.listing_status,
  is_available BOOLEAN DEFAULT true,
  avg_rating NUMERIC(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  completed_jobs INTEGER DEFAULT 0,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 7. WISHLIST
-- ============================================================
CREATE TABLE IF NOT EXISTS public.wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('equipment', 'labour', 'agri')),
  item_id UUID NOT NULL,
  item_name TEXT DEFAULT '',
  item_image TEXT DEFAULT '',
  item_price NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, item_type, item_id)
);

-- ============================================================
-- 8. SAVED SEARCHES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  search_type TEXT DEFAULT 'equipment',
  query TEXT DEFAULT '',
  filters JSONB DEFAULT '{}'::JSONB,
  notify_on_match BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 9. REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  reviewer_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  reviewee_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('equipment', 'labour')),
  item_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT DEFAULT '',
  condition_rating INTEGER CHECK (condition_rating >= 1 AND condition_rating <= 5),
  accuracy_rating INTEGER CHECK (accuracy_rating >= 1 AND accuracy_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 10. INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_equipment_provider_id ON public.equipment(provider_id);
CREATE INDEX IF NOT EXISTS idx_equipment_category ON public.equipment(category);
CREATE INDEX IF NOT EXISTS idx_equipment_status ON public.equipment(status);
CREATE INDEX IF NOT EXISTS idx_equipment_district ON public.equipment(district);
CREATE INDEX IF NOT EXISTS idx_equipment_state ON public.equipment(state);
CREATE INDEX IF NOT EXISTS idx_equipment_is_available ON public.equipment(is_available);
CREATE INDEX IF NOT EXISTS idx_equipment_images_equipment_id ON public.equipment_images(equipment_id);
CREATE INDEX IF NOT EXISTS idx_labour_provider_id ON public.labour(provider_id);
CREATE INDEX IF NOT EXISTS idx_labour_district ON public.labour(district);
CREATE INDEX IF NOT EXISTS idx_labour_state ON public.labour(state);
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON public.wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id ON public.saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_item_id ON public.reviews(item_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON public.reviews(reviewer_id);

-- ============================================================
-- 11. UPDATED_AT TRIGGERS
-- ============================================================
DROP TRIGGER IF EXISTS update_equipment_updated_at ON public.equipment;
CREATE TRIGGER update_equipment_updated_at
  BEFORE UPDATE ON public.equipment
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_labour_updated_at ON public.labour;
CREATE TRIGGER update_labour_updated_at
  BEFORE UPDATE ON public.labour
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 12. ENABLE RLS
-- ============================================================
ALTER TABLE public.equipment_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labour ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 13. RLS POLICIES
-- ============================================================

-- equipment_categories: public read, admin write
DROP POLICY IF EXISTS "public_read_equipment_categories" ON public.equipment_categories;
CREATE POLICY "public_read_equipment_categories"
ON public.equipment_categories FOR SELECT TO public USING (true);

-- equipment: public read active listings, providers manage own
DROP POLICY IF EXISTS "public_read_active_equipment" ON public.equipment;
CREATE POLICY "public_read_active_equipment"
ON public.equipment FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "providers_manage_own_equipment" ON public.equipment;
CREATE POLICY "providers_manage_own_equipment"
ON public.equipment FOR ALL TO authenticated
USING (provider_id = auth.uid())
WITH CHECK (provider_id = auth.uid());

-- equipment_images: public read, providers manage own
DROP POLICY IF EXISTS "public_read_equipment_images" ON public.equipment_images;
CREATE POLICY "public_read_equipment_images"
ON public.equipment_images FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "providers_manage_own_equipment_images" ON public.equipment_images;
CREATE POLICY "providers_manage_own_equipment_images"
ON public.equipment_images FOR ALL TO authenticated
USING (
  equipment_id IN (
    SELECT id FROM public.equipment WHERE provider_id = auth.uid()
  )
)
WITH CHECK (
  equipment_id IN (
    SELECT id FROM public.equipment WHERE provider_id = auth.uid()
  )
);

-- labour: public read, providers manage own
DROP POLICY IF EXISTS "public_read_labour" ON public.labour;
CREATE POLICY "public_read_labour"
ON public.labour FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "providers_manage_own_labour" ON public.labour;
CREATE POLICY "providers_manage_own_labour"
ON public.labour FOR ALL TO authenticated
USING (provider_id = auth.uid())
WITH CHECK (provider_id = auth.uid());

-- wishlist: users manage own
DROP POLICY IF EXISTS "users_manage_own_wishlist" ON public.wishlist;
CREATE POLICY "users_manage_own_wishlist"
ON public.wishlist FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- saved_searches: users manage own
DROP POLICY IF EXISTS "users_manage_own_saved_searches" ON public.saved_searches;
CREATE POLICY "users_manage_own_saved_searches"
ON public.saved_searches FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- reviews: public read, authenticated create own
DROP POLICY IF EXISTS "public_read_reviews" ON public.reviews;
CREATE POLICY "public_read_reviews"
ON public.reviews FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "users_create_own_reviews" ON public.reviews;
CREATE POLICY "users_create_own_reviews"
ON public.reviews FOR INSERT TO authenticated
WITH CHECK (reviewer_id = auth.uid());

DROP POLICY IF EXISTS "users_manage_own_reviews" ON public.reviews;
CREATE POLICY "users_manage_own_reviews"
ON public.reviews FOR ALL TO authenticated
USING (reviewer_id = auth.uid())
WITH CHECK (reviewer_id = auth.uid());

-- ============================================================
-- 14. SEED EQUIPMENT CATEGORIES
-- ============================================================
INSERT INTO public.equipment_categories (name, slug, icon, sort_order) VALUES
  ('Tractor', 'tractor', '🚜', 1),
  ('Harvester', 'harvester', '🌾', 2),
  ('Rotavator', 'rotavator', '⚙️', 3),
  ('Seed Drill', 'seed-drill', '🌱', 4),
  ('Sprayer', 'sprayer', '💧', 5),
  ('Plough', 'plough', '🔧', 6),
  ('Thresher', 'thresher', '🌿', 7),
  ('Transplanter', 'transplanter', '🌾', 8),
  ('Power Tiller', 'power-tiller', '⚙️', 9),
  ('Trailer', 'trailer', '🚛', 10),
  ('Disc Harrow', 'disc-harrow', '🔩', 11),
  ('Irrigation Pump', 'irrigation-pump', '💧', 12),
  ('Other', 'other', '🛠️', 13)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 15. SEED DEMO EQUIPMENT (linked to first user if exists)
-- ============================================================
DO $$
DECLARE
  demo_provider_id UUID;
  tractor_cat_id UUID;
  harvester_cat_id UUID;
  rotavator_cat_id UUID;
  eq1_id UUID := gen_random_uuid();
  eq2_id UUID := gen_random_uuid();
  eq3_id UUID := gen_random_uuid();
BEGIN
  SELECT id INTO demo_provider_id FROM public.user_profiles LIMIT 1;
  SELECT id INTO tractor_cat_id FROM public.equipment_categories WHERE slug = 'tractor' LIMIT 1;
  SELECT id INTO harvester_cat_id FROM public.equipment_categories WHERE slug = 'harvester' LIMIT 1;
  SELECT id INTO rotavator_cat_id FROM public.equipment_categories WHERE slug = 'rotavator' LIMIT 1;

  IF demo_provider_id IS NOT NULL THEN
    INSERT INTO public.equipment (
      id, provider_id, category_id, name, category, brand, model, year,
      condition, horsepower, fuel_type, location, district, state,
      listing_type, rent_per_day, buy_price, deposit,
      has_driver, delivery_available, status, is_available
    ) VALUES
    (
      eq1_id, demo_provider_id, tractor_cat_id,
      'Mahindra Yuvo 575 DI Tractor', 'Tractor', 'Mahindra', 'Yuvo 575 DI', 2022,
      'good'::public.equipment_condition, 47, 'diesel',
      'Hadapsar, Pune', 'Pune', 'Maharashtra',
      'both'::public.listing_type, 2500, 750000, 10000,
      true, true, 'active'::public.listing_status, true
    ),
    (
      eq2_id, demo_provider_id, harvester_cat_id,
      'John Deere W70 Combine Harvester', 'Harvester', 'John Deere', 'W70', 2023,
      'excellent'::public.equipment_condition, 110, 'diesel',
      'Sinhagad Road, Pune', 'Pune', 'Maharashtra',
      'rent'::public.listing_type, 8000, 3200000, 25000,
      true, false, 'active'::public.listing_status, true
    ),
    (
      eq3_id, demo_provider_id, rotavator_cat_id,
      'Maschio Rotary Tiller 5ft', 'Rotavator', 'Maschio', 'Rotary Tiller', 2021,
      'good'::public.equipment_condition, NULL, 'pto',
      'Baner, Pune', 'Pune', 'Maharashtra',
      'both'::public.listing_type, 800, 85000, 2000,
      false, true, 'active'::public.listing_status, true
    )
    ON CONFLICT (id) DO NOTHING;

    -- Add primary images
    INSERT INTO public.equipment_images (equipment_id, url, alt_text, is_primary, sort_order) VALUES
    (eq1_id, 'https://images.unsplash.com/photo-1644828320537-35456847a8c6', 'Mahindra Yuvo 575 DI Tractor', true, 0),
    (eq2_id, 'https://images.unsplash.com/photo-1653474351870-0c89db2d1654', 'John Deere W70 Combine Harvester', true, 0),
    (eq3_id, 'https://images.unsplash.com/photo-1616760268759-9baf33753d5c', 'Maschio Rotary Tiller', true, 0)
    ON CONFLICT DO NOTHING;

    -- Seed demo labour
    INSERT INTO public.labour (
      id, provider_id, name, skills, experience_years, team_size,
      min_team_size, max_team_size, languages, location, district, state,
      working_radius_km, wage_per_day, status, is_available, completed_jobs
    ) VALUES
    (
      gen_random_uuid(), demo_provider_id,
      'Ramesh Yadav — Harvesting Expert',
      ARRAY['harvesting', 'crop_cutting']::TEXT[],
      8, 1, 1, 5,
      ARRAY['Hindi', 'Marathi']::TEXT[],
      'Solapur, Maharashtra', 'Solapur', 'Maharashtra',
      30, 600, 'active'::public.listing_status, true, 124
    ),
    (
      gen_random_uuid(), demo_provider_id,
      'Priya Devi Labour Team',
      ARRAY['sowing', 'planting', 'weeding']::TEXT[],
      5, 8, 4, 15,
      ARRAY['Kannada', 'Hindi']::TEXT[],
      'Belgaum, Karnataka', 'Belgaum', 'Karnataka',
      25, 550, 'active'::public.listing_status, true, 87
    )
    ON CONFLICT (id) DO NOTHING;
  ELSE
    RAISE NOTICE 'No users found — demo equipment not seeded. Will be seeded when first user registers.';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Demo data seeding failed: %', SQLERRM;
END $$;
