-- Equipment Availability & Booking Dates
-- Prevents double-bookings at the database level

-- ============================================================
-- 1. EQUIPMENT AVAILABILITY TABLE
-- Tracks booked date ranges per equipment
-- ============================================================
CREATE TABLE IF NOT EXISTS public.equipment_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'booked' CHECK (status IN ('booked', 'blocked', 'maintenance')),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- ============================================================
-- 2. INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_equipment_availability_equipment_id
  ON public.equipment_availability(equipment_id);

CREATE INDEX IF NOT EXISTS idx_equipment_availability_dates
  ON public.equipment_availability(equipment_id, start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_equipment_availability_booking_id
  ON public.equipment_availability(booking_id);

-- ============================================================
-- 3. DOUBLE-BOOKING PREVENTION FUNCTION
-- Returns TRUE if the date range overlaps with any existing booking
-- ============================================================
CREATE OR REPLACE FUNCTION public.check_equipment_availability(
  p_equipment_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_exclude_booking_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  overlap_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO overlap_count
  FROM public.equipment_availability ea
  WHERE ea.equipment_id = p_equipment_id
    AND ea.status IN ('booked', 'blocked', 'maintenance')
    AND ea.start_date <= p_end_date
    AND ea.end_date >= p_start_date
    AND (p_exclude_booking_id IS NULL OR ea.booking_id != p_exclude_booking_id);

  RETURN overlap_count = 0;
END;
$$;

-- ============================================================
-- 4. TRIGGER: PREVENT DOUBLE BOOKING ON INSERT/UPDATE
-- ============================================================
CREATE OR REPLACE FUNCTION public.prevent_double_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT public.check_equipment_availability(
    NEW.equipment_id,
    NEW.start_date,
    NEW.end_date,
    CASE WHEN TG_OP = 'UPDATE' THEN NEW.booking_id ELSE NULL END
  ) THEN
    RAISE EXCEPTION 'Equipment is already booked for the selected dates (% to %)',
      NEW.start_date, NEW.end_date;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_double_booking ON public.equipment_availability;
CREATE TRIGGER trg_prevent_double_booking
  BEFORE INSERT OR UPDATE ON public.equipment_availability
  FOR EACH ROW EXECUTE FUNCTION public.prevent_double_booking();

-- ============================================================
-- 5. ENABLE RLS
-- ============================================================
ALTER TABLE public.equipment_availability ENABLE ROW LEVEL SECURITY;

-- Public can read availability (to show calendar to all visitors)
DROP POLICY IF EXISTS "public_read_equipment_availability" ON public.equipment_availability;
CREATE POLICY "public_read_equipment_availability"
ON public.equipment_availability FOR SELECT TO public
USING (true);

-- Authenticated users can insert (when booking)
DROP POLICY IF EXISTS "auth_insert_equipment_availability" ON public.equipment_availability;
CREATE POLICY "auth_insert_equipment_availability"
ON public.equipment_availability FOR INSERT TO authenticated
WITH CHECK (true);

-- Authenticated users can update/delete their own availability entries
DROP POLICY IF EXISTS "auth_manage_equipment_availability" ON public.equipment_availability;
CREATE POLICY "auth_manage_equipment_availability"
ON public.equipment_availability FOR ALL TO authenticated
USING (true)
WITH CHECK (true);
