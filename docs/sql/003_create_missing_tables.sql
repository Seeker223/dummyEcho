-- MIGRATION 003: Create Missing Tables for Emergency Echo
-- This migration creates all tables needed to work with your existing patients table
-- Prerequisites: patients table must already exist

-- ============================================================
-- PROFILES TABLE (Base user info)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('patient', 'doctor', 'nurse', 'partner', 'user')),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT profiles_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles USING btree (email) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles USING btree (role) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS profiles_created_at_idx ON public.profiles USING btree (created_at) TABLESPACE pg_default;

-- ============================================================
-- DOCTORS TABLE (Doctor-specific data)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.doctors (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL,
  user_id UUID NOT NULL,
  patient_id UUID,
  license_number TEXT UNIQUE,
  specialization TEXT,
  years_of_experience INTEGER,
  hospital TEXT,
  verified_by_admin BOOLEAN NOT NULL DEFAULT false,
  documents_verified_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT doctors_pkey PRIMARY KEY (id),
  CONSTRAINT doctors_profile_id_fk FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT doctors_patient_id_fk FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS doctors_user_id_idx ON public.doctors USING btree (user_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS doctors_patient_id_idx ON public.doctors USING btree (patient_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS doctors_profile_id_idx ON public.doctors USING btree (profile_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS doctors_verified_idx ON public.doctors USING btree (verified_by_admin) TABLESPACE pg_default;

-- ============================================================
-- NURSES TABLE (Nurse-specific data)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.nurses (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL,
  user_id UUID NOT NULL,
  patient_id UUID,
  license_number TEXT UNIQUE,
  specialization TEXT,
  years_of_experience INTEGER,
  hospital TEXT,
  verified_by_admin BOOLEAN NOT NULL DEFAULT false,
  documents_verified_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT nurses_pkey PRIMARY KEY (id),
  CONSTRAINT nurses_profile_id_fk FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT nurses_patient_id_fk FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS nurses_user_id_idx ON public.nurses USING btree (user_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS nurses_patient_id_idx ON public.nurses USING btree (patient_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS nurses_profile_id_idx ON public.nurses USING btree (profile_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS nurses_verified_idx ON public.nurses USING btree (verified_by_admin) TABLESPACE pg_default;

-- ============================================================
-- PARTNERS TABLE (Business partner/admin accounts)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.partners (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL,
  company_name TEXT,
  business_registration TEXT,
  admin_level TEXT,
  can_verify_documents BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT partners_pkey PRIMARY KEY (id),
  CONSTRAINT partners_profile_id_fk FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS partners_profile_id_idx ON public.partners USING btree (profile_id) TABLESPACE pg_default;

-- ============================================================
-- WALLETS TABLE (User financial accounts)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE,
  balance DECIMAL(10, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'NGN',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_frozen BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT wallets_pkey PRIMARY KEY (id),
  CONSTRAINT wallets_profile_id_fk FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS wallets_profile_id_idx ON public.wallets USING btree (profile_id) TABLESPACE pg_default;

-- ============================================================
-- EMAIL_VERIFICATIONS TABLE (Email verification tokens)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.email_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  is_used BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT email_verifications_pkey PRIMARY KEY (id),
  CONSTRAINT email_verifications_profile_id_fk FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS email_verifications_token_idx ON public.email_verifications USING btree (token) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS email_verifications_profile_id_idx ON public.email_verifications USING btree (profile_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS email_verifications_expires_at_idx ON public.email_verifications USING btree (expires_at) TABLESPACE pg_default;

-- ============================================================
-- DOCUMENT_UPLOADS TABLE (Document tracking & verification)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.document_uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  profile_id UUID NOT NULL,
  patient_id UUID,
  document_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT,
  file_size INTEGER,
  mime_type TEXT,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verification_notes TEXT,
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT document_uploads_pkey PRIMARY KEY (id),
  CONSTRAINT document_uploads_patient_id_fk FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE,
  CONSTRAINT document_uploads_profile_id_fk FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS document_uploads_user_id_idx ON public.document_uploads USING btree (user_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS document_uploads_patient_id_idx ON public.document_uploads USING btree (patient_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS document_uploads_profile_id_idx ON public.document_uploads USING btree (profile_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS document_uploads_status_idx ON public.document_uploads USING btree (verification_status) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS document_uploads_document_type_idx ON public.document_uploads USING btree (document_type) TABLESPACE pg_default;

-- ============================================================
-- TRIGGERS for auto-updating updated_at timestamps
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist, then recreate
DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS doctors_updated_at ON doctors;
DROP TRIGGER IF EXISTS nurses_updated_at ON nurses;
DROP TRIGGER IF EXISTS partners_updated_at ON partners;
DROP TRIGGER IF EXISTS wallets_updated_at ON wallets;
DROP TRIGGER IF EXISTS document_uploads_updated_at ON document_uploads;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER doctors_updated_at BEFORE UPDATE ON doctors
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER nurses_updated_at BEFORE UPDATE ON nurses
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER partners_updated_at BEFORE UPDATE ON partners
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER wallets_updated_at BEFORE UPDATE ON wallets
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER document_uploads_updated_at BEFORE UPDATE ON document_uploads
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nurses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_uploads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role can access all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own patient records" ON public.patients;
DROP POLICY IF EXISTS "Users can update their own patient records" ON public.patients;
DROP POLICY IF EXISTS "Doctors can view patient records for consultation" ON public.patients;
DROP POLICY IF EXISTS "Service role can access all patients" ON public.patients;
DROP POLICY IF EXISTS "Doctors can view their own records" ON public.doctors;
DROP POLICY IF EXISTS "Admins can view all doctor records" ON public.doctors;
DROP POLICY IF EXISTS "Nurses can view their own records" ON public.nurses;
DROP POLICY IF EXISTS "Admins can view all nurse records" ON public.nurses;
DROP POLICY IF EXISTS "Users can view their own wallet" ON public.wallets;
DROP POLICY IF EXISTS "Users can view their own verification records" ON public.email_verifications;
DROP POLICY IF EXISTS "Users can view their own documents" ON public.document_uploads;
DROP POLICY IF EXISTS "Admins can view all documents" ON public.document_uploads;
DROP POLICY IF EXISTS "Users can insert their own documents" ON public.document_uploads;
DROP POLICY IF EXISTS "Admins can update document verification" ON public.document_uploads;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Service role can access all profiles"
ON public.profiles FOR ALL
USING (current_setting('role') = 'postgres');

-- Patients policies
CREATE POLICY "Users can view their own patient records"
ON public.patients FOR SELECT
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own patient records"
ON public.patients FOR UPDATE
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Doctors can view patient records for consultation"
ON public.patients FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM doctors
    WHERE doctors.profile_id = auth.uid()
  )
);

CREATE POLICY "Service role can access all patients"
ON public.patients FOR ALL
USING (current_setting('role') = 'postgres');

-- Doctors policies
CREATE POLICY "Doctors can view their own records"
ON public.doctors FOR SELECT
USING (auth.uid() = profile_id);

CREATE POLICY "Admins can view all doctor records"
ON public.doctors FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM partners
    WHERE profile_id = auth.uid()
    AND can_verify_documents = true
  )
);

-- Nurses policies
CREATE POLICY "Nurses can view their own records"
ON public.nurses FOR SELECT
USING (auth.uid() = profile_id);

CREATE POLICY "Admins can view all nurse records"
ON public.nurses FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM partners
    WHERE profile_id = auth.uid()
    AND can_verify_documents = true
  )
);

-- Wallets policies
CREATE POLICY "Users can view their own wallet"
ON public.wallets FOR SELECT
USING (auth.uid() = profile_id);

-- Email verifications policies
CREATE POLICY "Users can view their own verification records"
ON public.email_verifications FOR SELECT
USING (auth.uid() = profile_id);

-- Document uploads policies
CREATE POLICY "Users can view their own documents"
ON public.document_uploads FOR SELECT
USING (auth.uid() = profile_id);

CREATE POLICY "Admins can view all documents"
ON public.document_uploads FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM partners
    WHERE profile_id = auth.uid()
    AND can_verify_documents = true
  )
);

CREATE POLICY "Users can insert their own documents"
ON public.document_uploads FOR INSERT
WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Admins can update document verification"
ON public.document_uploads FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM partners
    WHERE profile_id = auth.uid()
    AND can_verify_documents = true
  )
);
