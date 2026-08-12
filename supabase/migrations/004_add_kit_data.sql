-- Add kit_data JSONB column to role tables for flexible medical kit storage
ALTER TABLE patients ADD COLUMN IF NOT EXISTS kit_data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS kit_data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE nurses ADD COLUMN IF NOT EXISTS kit_data JSONB DEFAULT '{}'::jsonb;

-- Also add avatar_url to profiles if not already there
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
