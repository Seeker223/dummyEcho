-- EMERGENCY ECHO - AUTHENTICATION & ROLE MANAGEMENT SCHEMA
-- Created: June 2026
-- Purpose: Create base tables for user authentication and role management

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- TABLE: PROFILES
-- Purpose: Base user profile information
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('patient', 'doctor', 'nurse', 'partner', 'user')),
  avatar_url TEXT,
  verified_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes on profiles for performance
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_created_at ON profiles(created_at);

-- ============================================
-- TABLE: PATIENTS
-- Purpose: Patient-specific healthcare information
-- ============================================
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  blood_type TEXT,
  height_cm NUMERIC,
  weight_kg NUMERIC,
  allergies TEXT,
  chronic_conditions TEXT,
  current_medications TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relation TEXT,
  
  -- OB/GYN Fields (Female Only)
  pregnancy_status TEXT,
  due_date DATE,
  number_of_pregnancies INTEGER,
  number_of_children INTEGER,
  contraception_method TEXT,
  last_menstrual_period DATE,
  menstrual_cycle_length INTEGER,
  
  -- Insurance Info
  insurance_provider TEXT,
  insurance_policy_number TEXT,
  insurance_group_number TEXT,
  
  -- Medical History
  family_medical_history TEXT,
  past_surgeries TEXT,
  vaccination_status TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_patients_profile_id ON patients(profile_id);
CREATE INDEX idx_patients_date_of_birth ON patients(date_of_birth);

-- ============================================
-- TABLE: DOCTORS
-- Purpose: Doctor-specific credentials and information
-- ============================================
CREATE TABLE IF NOT EXISTS doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Credentials
  license_number TEXT NOT NULL UNIQUE,
  specialization TEXT NOT NULL,
  sub_specialization TEXT,
  years_of_experience INTEGER,
  
  -- Qualifications
  medical_school TEXT,
  graduation_year INTEGER,
  board_certification TEXT,
  
  -- Practice Info
  hospital_affiliation TEXT,
  clinic_name TEXT,
  clinic_address TEXT,
  clinic_phone TEXT,
  consultation_fee NUMERIC,
  
  -- Verification Status
  documents_verified_count INTEGER DEFAULT 0,
  verified_by_admin BOOLEAN DEFAULT false,
  verified_by_admin_at TIMESTAMP,
  
  -- System Status
  is_accepting_patients BOOLEAN DEFAULT false,
  ratings_average NUMERIC(3,2),
  total_consultations INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_doctors_profile_id ON doctors(profile_id);
CREATE INDEX idx_doctors_license_number ON doctors(license_number);
CREATE INDEX idx_doctors_specialization ON doctors(specialization);
CREATE INDEX idx_doctors_verified_by_admin ON doctors(verified_by_admin);

-- ============================================
-- TABLE: NURSES
-- Purpose: Nurse-specific credentials and information
-- ============================================
CREATE TABLE IF NOT EXISTS nurses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Credentials
  license_number TEXT NOT NULL UNIQUE,
  registration_number TEXT,
  specialization TEXT,
  years_of_experience INTEGER,
  
  -- Qualifications
  nursing_school TEXT,
  graduation_year INTEGER,
  certifications TEXT,
  
  -- Practice Info
  hospital_affiliation TEXT,
  clinic_name TEXT,
  clinic_address TEXT,
  clinic_phone TEXT,
  hourly_rate NUMERIC,
  
  -- Verification Status
  documents_verified_count INTEGER DEFAULT 0,
  verified_by_admin BOOLEAN DEFAULT false,
  verified_by_admin_at TIMESTAMP,
  
  -- System Status
  is_accepting_assignments BOOLEAN DEFAULT false,
  ratings_average NUMERIC(3,2),
  total_assignments INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_nurses_profile_id ON nurses(profile_id);
CREATE INDEX idx_nurses_license_number ON nurses(license_number);
CREATE INDEX idx_nurses_specialization ON nurses(specialization);
CREATE INDEX idx_nurses_verified_by_admin ON nurses(verified_by_admin);

-- ============================================
-- TABLE: PARTNERS
-- Purpose: Business partner/admin information
-- ============================================
CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Business Info
  company_name TEXT NOT NULL,
  business_type TEXT,
  business_registration_number TEXT UNIQUE,
  tax_identification_number TEXT UNIQUE,
  
  -- Contact Info
  business_address TEXT,
  business_phone TEXT,
  website TEXT,
  
  -- Admin Fields
  is_super_admin BOOLEAN DEFAULT false,
  admin_level TEXT DEFAULT 'partner' CHECK (admin_level IN ('partner', 'moderator', 'super_admin')),
  can_verify_documents BOOLEAN DEFAULT false,
  can_manage_users BOOLEAN DEFAULT false,
  
  -- Business Status
  is_active BOOLEAN DEFAULT true,
  approved_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_partners_profile_id ON partners(profile_id);
CREATE INDEX idx_partners_company_name ON partners(company_name);
CREATE INDEX idx_partners_admin_level ON partners(admin_level);

-- ============================================
-- TABLE: WALLETS
-- Purpose: User financial accounts and balance tracking
-- ============================================
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Balance
  balance NUMERIC(15, 2) DEFAULT 0.00,
  currency TEXT DEFAULT 'NGN' CHECK (currency IN ('NGN', 'USD', 'EUR', 'GBP')),
  
  -- Account Status
  is_active BOOLEAN DEFAULT true,
  is_frozen BOOLEAN DEFAULT false,
  
  -- Transaction History
  total_credits NUMERIC(15, 2) DEFAULT 0.00,
  total_debits NUMERIC(15, 2) DEFAULT 0.00,
  last_transaction_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_wallets_profile_id ON wallets(profile_id);
CREATE INDEX idx_wallets_currency ON wallets(currency);

-- ============================================
-- TABLE: EMAIL_VERIFICATIONS
-- Purpose: Track email verification tokens
-- ============================================
CREATE TABLE IF NOT EXISTS email_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  is_used BOOLEAN DEFAULT false,
  used_at TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email_verifications_token ON email_verifications(token);
CREATE INDEX idx_email_verifications_profile_id ON email_verifications(profile_id);
CREATE INDEX idx_email_verifications_expires_at ON email_verifications(expires_at);

-- ============================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE nurses ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;

-- PROFILES TABLE POLICIES
-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid()::text = id::text);

-- Allow anonymous users to check if email exists (for signup)
CREATE POLICY "Anonymous can view profile by email" ON profiles
  FOR SELECT USING (true);

-- Allow service role to do everything
CREATE POLICY "Service role can access all profiles" ON profiles
  FOR ALL USING (current_setting('role') = 'postgres');

-- PATIENTS TABLE POLICIES
-- Allow users to view and update own patient profile
CREATE POLICY "Users can view own patient profile" ON patients
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "Users can update own patient profile" ON patients
  FOR UPDATE USING (profile_id = auth.uid());

-- Allow service role to do everything
CREATE POLICY "Service role can access all patient records" ON patients
  FOR ALL USING (current_setting('role') = 'postgres');

-- DOCTORS TABLE POLICIES
-- Allow doctors to view and update own profile
CREATE POLICY "Doctors can view own profile" ON doctors
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "Doctors can update own profile" ON doctors
  FOR UPDATE USING (profile_id = auth.uid());

-- Allow patients to view verified doctors
CREATE POLICY "Patients can view verified doctors" ON doctors
  FOR SELECT USING (verified_by_admin = true);

-- Allow service role to do everything
CREATE POLICY "Service role can access all doctors" ON doctors
  FOR ALL USING (current_setting('role') = 'postgres');

-- NURSES TABLE POLICIES
-- Allow nurses to view and update own profile
CREATE POLICY "Nurses can view own profile" ON nurses
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "Nurses can update own profile" ON nurses
  FOR UPDATE USING (profile_id = auth.uid());

-- Allow patients to view verified nurses
CREATE POLICY "Patients can view verified nurses" ON nurses
  FOR SELECT USING (verified_by_admin = true);

-- Allow service role to do everything
CREATE POLICY "Service role can access all nurses" ON nurses
  FOR ALL USING (current_setting('role') = 'postgres');

-- PARTNERS TABLE POLICIES
-- Allow partners to view and update own profile
CREATE POLICY "Partners can view own profile" ON partners
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "Partners can update own profile" ON partners
  FOR UPDATE USING (profile_id = auth.uid());

-- Allow service role to do everything
CREATE POLICY "Service role can access all partners" ON partners
  FOR ALL USING (current_setting('role') = 'postgres');

-- WALLETS TABLE POLICIES
-- Allow users to view own wallet
CREATE POLICY "Users can view own wallet" ON wallets
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "Users can update own wallet" ON wallets
  FOR UPDATE USING (profile_id = auth.uid());

-- Allow service role to do everything
CREATE POLICY "Service role can access all wallets" ON wallets
  FOR ALL USING (current_setting('role') = 'postgres');

-- EMAIL_VERIFICATIONS TABLE POLICIES
-- Allow service role to do everything
CREATE POLICY "Service role can access all email verifications" ON email_verifications
  FOR ALL USING (current_setting('role') = 'postgres');

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to create wallet on user signup
CREATE OR REPLACE FUNCTION create_wallet_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO wallets (profile_id)
  VALUES (NEW.id)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create wallet when profile is created
CREATE TRIGGER trigger_create_wallet
AFTER INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION create_wallet_for_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on profiles
CREATE TRIGGER trigger_update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at on patients
CREATE TRIGGER trigger_update_patients_updated_at
BEFORE UPDATE ON patients
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at on doctors
CREATE TRIGGER trigger_update_doctors_updated_at
BEFORE UPDATE ON doctors
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at on nurses
CREATE TRIGGER trigger_update_nurses_updated_at
BEFORE UPDATE ON nurses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at on partners
CREATE TRIGGER trigger_update_partners_updated_at
BEFORE UPDATE ON partners
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at on wallets
CREATE TRIGGER trigger_update_wallets_updated_at
BEFORE UPDATE ON wallets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VERIFICATION SQL QUERIES
-- ============================================

-- View all tables created
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- View all indexes
-- SELECT indexname FROM pg_indexes WHERE schemaname = 'public';

-- View RLS policies
-- SELECT schemaname, tablename, policyname FROM pg_policies;

-- ============================================
-- SQL MIGRATION COMPLETE
-- Total tables: 7
-- Total indexes: 14
-- Total policies: 20+
-- ============================================
