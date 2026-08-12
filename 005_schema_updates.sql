-- 005_schema_updates.sql

-- Add license_id to nurses to match the doctors schema
ALTER TABLE public.nurses ADD COLUMN IF NOT EXISTS license_id text;

-- Add license_id to partners (if applicable, though they have business_registration)
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS license_id text;

-- (Optional) If you also wanted to ensure kit_data was added to partners as a fallback
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS kit_data JSONB DEFAULT '{}'::jsonb;
