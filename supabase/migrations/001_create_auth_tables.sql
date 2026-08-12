-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('patient', 'doctor', 'nurse', 'user')),
  submission_key TEXT NOT NULL UNIQUE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create patients table (extended patient data)
CREATE TABLE IF NOT EXISTS patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(user_id) ON DELETE CASCADE,
  submission_key TEXT NOT NULL UNIQUE,
  full_name TEXT,
  date_of_birth DATE,
  phone_number TEXT,
  address TEXT,
  blood_type TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  medical_conditions TEXT[],
  allergies TEXT[],
  medications TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create doctors table (extended doctor data)
CREATE TABLE IF NOT EXISTS doctors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(user_id) ON DELETE CASCADE,
  submission_key TEXT NOT NULL UNIQUE,
  full_name TEXT,
  license_number TEXT UNIQUE,
  specialization TEXT,
  hospital_affiliation TEXT,
  phone_number TEXT,
  verified_by_admin BOOLEAN DEFAULT FALSE,
  license_verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create nurses table (extended nurse data)
CREATE TABLE IF NOT EXISTS nurses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(user_id) ON DELETE CASCADE,
  submission_key TEXT NOT NULL UNIQUE,
  full_name TEXT,
  license_number TEXT UNIQUE,
  certification TEXT,
  hospital_affiliation TEXT,
  phone_number TEXT,
  verified_by_admin BOOLEAN DEFAULT FALSE,
  license_verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wallets table
CREATE TABLE IF NOT EXISTS wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(user_id) ON DELETE CASCADE,
  balance DECIMAL(10, 2) DEFAULT 0,
  currency TEXT DEFAULT 'NGN',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email verification table
CREATE TABLE IF NOT EXISTS email_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  verification_token TEXT NOT NULL UNIQUE,
  is_verified BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE nurses ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can read their own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for wallets
CREATE POLICY "Users can read their own wallet" ON wallets
  FOR SELECT USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_doctors_user_id ON doctors(user_id);
CREATE INDEX idx_nurses_user_id ON nurses(user_id);
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_email_verifications_user_id ON email_verifications(user_id);
CREATE INDEX idx_email_verifications_token ON email_verifications(verification_token);
