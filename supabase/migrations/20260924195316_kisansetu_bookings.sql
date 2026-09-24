-- KisanSetu Bookings & Payments Schema

-- 1. ENUMS
DROP TYPE IF EXISTS public.booking_status CASCADE;
CREATE TYPE public.booking_status AS ENUM ('pending', 'accepted', 'declined', 'active', 'completed', 'cancelled');

DROP TYPE IF EXISTS public.payment_status CASCADE;
CREATE TYPE public.payment_status AS ENUM ('pending', 'partial', 'paid', 'refunded', 'failed');

-- 2. USER PROFILES (if not exists)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  role TEXT DEFAULT 'buyer',
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_ref TEXT NOT NULL UNIQUE DEFAULT 'BKG' || UPPER(SUBSTRING(gen_random_uuid()::TEXT, 1, 8)),
  buyer_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  equipment_name TEXT NOT NULL,
  equipment_category TEXT NOT NULL DEFAULT '',
  equipment_image TEXT DEFAULT '',
  supplier_name TEXT NOT NULL DEFAULT '',
  supplier_phone TEXT DEFAULT '',
  supplier_location TEXT DEFAULT '',
  buyer_name TEXT NOT NULL DEFAULT '',
  buyer_phone TEXT DEFAULT '',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days INTEGER NOT NULL DEFAULT 1,
  daily_rate NUMERIC(10,2) NOT NULL DEFAULT 0,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  deposit NUMERIC(10,2) NOT NULL DEFAULT 0,
  platform_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  amount_paid NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_status public.payment_status DEFAULT 'pending'::public.payment_status,
  payment_method TEXT DEFAULT '',
  booking_status public.booking_status DEFAULT 'pending'::public.booking_status,
  meeting_point TEXT DEFAULT '',
  meeting_time TEXT DEFAULT '',
  driver_name TEXT,
  driver_phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. PAYMENT TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  payment_intent_id TEXT NOT NULL UNIQUE,
  stripe_charge_id TEXT,
  stripe_customer_id TEXT,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. INDEXES
CREATE INDEX IF NOT EXISTS idx_bookings_buyer_id ON public.bookings(buyer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_supplier_id ON public.bookings(supplier_id);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_ref ON public.bookings(booking_ref);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_status ON public.bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_booking_id ON public.payment_transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_payment_intent_id ON public.payment_transactions(payment_intent_id);

-- 6. UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- 7. ENABLE RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- 8. RLS POLICIES

-- user_profiles
DROP POLICY IF EXISTS "users_manage_own_user_profiles" ON public.user_profiles;
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles FOR ALL TO authenticated
USING (id = auth.uid()) WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "public_read_user_profiles" ON public.user_profiles;
CREATE POLICY "public_read_user_profiles"
ON public.user_profiles FOR SELECT TO public
USING (true);

-- bookings: buyers and suppliers can see their own bookings
DROP POLICY IF EXISTS "users_view_own_bookings" ON public.bookings;
CREATE POLICY "users_view_own_bookings"
ON public.bookings FOR SELECT TO authenticated
USING (buyer_id = auth.uid() OR supplier_id = auth.uid());

DROP POLICY IF EXISTS "buyers_create_bookings" ON public.bookings;
CREATE POLICY "buyers_create_bookings"
ON public.bookings FOR INSERT TO authenticated
WITH CHECK (buyer_id = auth.uid());

DROP POLICY IF EXISTS "users_update_own_bookings" ON public.bookings;
CREATE POLICY "users_update_own_bookings"
ON public.bookings FOR UPDATE TO authenticated
USING (buyer_id = auth.uid() OR supplier_id = auth.uid())
WITH CHECK (buyer_id = auth.uid() OR supplier_id = auth.uid());

-- Allow public read for booking confirmation page (by booking_ref)
DROP POLICY IF EXISTS "public_view_bookings" ON public.bookings;
CREATE POLICY "public_view_bookings"
ON public.bookings FOR SELECT TO public
USING (true);

-- payment_transactions
DROP POLICY IF EXISTS "users_view_own_transactions" ON public.payment_transactions;
CREATE POLICY "users_view_own_transactions"
ON public.payment_transactions FOR SELECT TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "users_create_own_transactions" ON public.payment_transactions;
CREATE POLICY "users_create_own_transactions"
ON public.payment_transactions FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- 9. TRIGGERS
DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_payment_transactions_updated_at ON public.payment_transactions;
CREATE TRIGGER update_payment_transactions_updated_at
  BEFORE UPDATE ON public.payment_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 10. HANDLE NEW USER TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'buyer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
