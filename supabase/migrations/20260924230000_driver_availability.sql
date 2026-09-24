-- Driver Availability & Stripe Refund Support
-- Adds driver_availability table and refund tracking to bookings

-- ============================================================
-- 1. DRIVER AVAILABILITY TABLE
-- Tracks blocked/custom-hours dates per driver
-- ============================================================
CREATE TABLE IF NOT EXISTS public.driver_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_hour INTEGER NOT NULL DEFAULT 6 CHECK (start_hour >= 0 AND start_hour <= 23),
  end_hour INTEGER NOT NULL DEFAULT 18 CHECK (end_hour >= 1 AND end_hour <= 24),
  is_blocked BOOLEAN NOT NULL DEFAULT true,
  note TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_hours CHECK (end_hour > start_hour)
);

-- Unique constraint: one entry per driver per date
CREATE UNIQUE INDEX IF NOT EXISTS idx_driver_availability_unique
  ON public.driver_availability(driver_id, date);

-- Index for fast date range lookups
CREATE INDEX IF NOT EXISTS idx_driver_availability_driver_date
  ON public.driver_availability(driver_id, date);

CREATE INDEX IF NOT EXISTS idx_driver_availability_date
  ON public.driver_availability(date);

-- ============================================================
-- 2. ADD REFUND TRACKING TO BOOKINGS (if not exists)
-- ============================================================
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS stripe_refund_id TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS refund_amount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS damage_deduction NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS return_step TEXT DEFAULT '';

-- ============================================================
-- 3. ADD STRIPE WEBHOOK TRACKING TO PAYMENT TRANSACTIONS
-- ============================================================
ALTER TABLE public.payment_transactions
  ADD COLUMN IF NOT EXISTS stripe_refund_id TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS refund_amount NUMERIC DEFAULT 0;

-- ============================================================
-- 4. ENABLE RLS ON DRIVER AVAILABILITY
-- ============================================================
ALTER TABLE public.driver_availability ENABLE ROW LEVEL SECURITY;

-- Public can read driver availability (for booking calendar display)
DROP POLICY IF EXISTS "public_read_driver_availability" ON public.driver_availability;
CREATE POLICY "public_read_driver_availability"
ON public.driver_availability FOR SELECT TO public
USING (true);

-- Drivers can manage their own availability
DROP POLICY IF EXISTS "driver_manage_own_availability" ON public.driver_availability;
CREATE POLICY "driver_manage_own_availability"
ON public.driver_availability FOR ALL TO authenticated
USING (driver_id = auth.uid())
WITH CHECK (driver_id = auth.uid());

-- ============================================================
-- 5. FUNCTION: Get driver availability for a date range
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_driver_availability(
  p_driver_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE(
  date DATE,
  is_blocked BOOLEAN,
  start_hour INTEGER,
  end_hour INTEGER,
  note TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    da.date,
    da.is_blocked,
    da.start_hour,
    da.end_hour,
    da.note
  FROM public.driver_availability da
  WHERE da.driver_id = p_driver_id
    AND da.date >= p_start_date
    AND da.date <= p_end_date
  ORDER BY da.date;
END;
$$;

-- ============================================================
-- 6. FUNCTION: Check if driver is available on a date
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_driver_available(
  p_driver_id UUID,
  p_date DATE,
  p_start_hour INTEGER DEFAULT 0,
  p_end_hour INTEGER DEFAULT 24
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  availability_record RECORD;
BEGIN
  SELECT * INTO availability_record
  FROM public.driver_availability
  WHERE driver_id = p_driver_id AND date = p_date;

  -- No record = fully available
  IF NOT FOUND THEN
    RETURN TRUE;
  END IF;

  -- Fully blocked
  IF availability_record.is_blocked THEN
    RETURN FALSE;
  END IF;

  -- Check hour overlap
  IF p_start_hour >= availability_record.end_hour OR p_end_hour <= availability_record.start_hour THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$;
