-- MIGRATION 007: Update call_queue for payment and routing
-- Adds new columns for consultation routing and payment tracking.

-- 1. Add new columns to call_queue
ALTER TABLE public.call_queue ADD COLUMN IF NOT EXISTS consultation_type TEXT CHECK (consultation_type IN ('video', 'voice'));
ALTER TABLE public.call_queue ADD COLUMN IF NOT EXISTS consultation_duration INTEGER CHECK (consultation_duration IN (5, 10, 15, 30));
ALTER TABLE public.call_queue ADD COLUMN IF NOT EXISTS clinician_id UUID REFERENCES auth.users(id);
ALTER TABLE public.call_queue ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(10, 2) DEFAULT 0;

-- 2. Update the status check constraint to include 'pending_payment' and 'accepted'
-- PostgreSQL doesn't allow altering a constraint directly, so we drop and recreate.
ALTER TABLE public.call_queue DROP CONSTRAINT IF EXISTS call_queue_status_check;

ALTER TABLE public.call_queue 
  ADD CONSTRAINT call_queue_status_check 
  CHECK (status IN ('pending_payment', 'waiting', 'accepted', 'brief_ready', 'in_consultation', 'complete', 'cancelled'));

-- 3. Add an index for quick queries by clinician_id
CREATE INDEX IF NOT EXISTS idx_call_queue_clinician ON public.call_queue(clinician_id);

-- Optional Verification Query
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'call_queue';
