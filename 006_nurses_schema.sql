-- 006_nurses_schema.sql

-- Add missing columns to the nurses table to match the n8n workflow payload
ALTER TABLE public.nurses ADD COLUMN IF NOT EXISTS license_number text;
ALTER TABLE public.nurses ADD COLUMN IF NOT EXISTS certification text;
ALTER TABLE public.nurses ADD COLUMN IF NOT EXISTS department text;
ALTER TABLE public.nurses ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE public.nurses ADD COLUMN IF NOT EXISTS phone_number text;
ALTER TABLE public.nurses ADD COLUMN IF NOT EXISTS hospital_affiliation text;
ALTER TABLE public.nurses ADD COLUMN IF NOT EXISTS years_of_experience integer;

-- Document Upload Columns
ALTER TABLE public.nurses ADD COLUMN IF NOT EXISTS government_id text;
ALTER TABLE public.nurses ADD COLUMN IF NOT EXISTS government_id_status text DEFAULT 'pending';

ALTER TABLE public.nurses ADD COLUMN IF NOT EXISTS annual_license text;
ALTER TABLE public.nurses ADD COLUMN IF NOT EXISTS annual_license_status text DEFAULT 'pending';

ALTER TABLE public.nurses ADD COLUMN IF NOT EXISTS nursing_degree text;
ALTER TABLE public.nurses ADD COLUMN IF NOT EXISTS nursing_degree_status text DEFAULT 'pending';

-- Verification
ALTER TABLE public.nurses ADD COLUMN IF NOT EXISTS verified_by_admin boolean DEFAULT false;
ALTER TABLE public.nurses ADD COLUMN IF NOT EXISTS verification_notes text;
