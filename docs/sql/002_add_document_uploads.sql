-- EMERGENCY ECHO - DOCUMENT UPLOAD & VERIFICATION SCHEMA
-- Created: June 2026
-- Purpose: Add document upload and verification system for healthcare professionals

-- ============================================
-- TABLE: DOCUMENT_UPLOADS
-- Purpose: Track all document uploads and verification status
-- ============================================
CREATE TABLE IF NOT EXISTS document_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('doctor', 'nurse')),
  document_type TEXT NOT NULL,
  
  -- File Information
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  storage_bucket TEXT DEFAULT 'documents',
  
  -- Upload Status
  upload_status TEXT DEFAULT 'uploaded' CHECK (upload_status IN ('uploading', 'uploaded', 'processing', 'failed')),
  
  -- Verification Status
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verification_notes TEXT,
  verified_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  verified_at TIMESTAMP,
  
  -- Rejection Info
  rejection_reason TEXT,
  rejected_at TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_document_uploads_user_id ON document_uploads(user_id);
CREATE INDEX idx_document_uploads_role ON document_uploads(role);
CREATE INDEX idx_document_uploads_verification_status ON document_uploads(verification_status);
CREATE INDEX idx_document_uploads_document_type ON document_uploads(document_type);
CREATE INDEX idx_document_uploads_created_at ON document_uploads(created_at);
CREATE INDEX idx_document_uploads_user_role_status ON document_uploads(user_id, role, verification_status);

-- ============================================
-- UPDATE DOCTORS TABLE
-- Purpose: Add document verification tracking
-- ============================================
ALTER TABLE doctors 
  ADD COLUMN IF NOT EXISTS documents_verified_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS verified_by_admin BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS verified_by_admin_at TIMESTAMP;

-- Add index for verification status
CREATE INDEX IF NOT EXISTS idx_doctors_verified_by_admin ON doctors(verified_by_admin);
CREATE INDEX IF NOT EXISTS idx_doctors_documents_verified_count ON doctors(documents_verified_count);

-- ============================================
-- UPDATE NURSES TABLE
-- Purpose: Add document verification tracking
-- ============================================
ALTER TABLE nurses 
  ADD COLUMN IF NOT EXISTS documents_verified_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS verified_by_admin BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS verified_by_admin_at TIMESTAMP;

-- Add index for verification status
CREATE INDEX IF NOT EXISTS idx_nurses_verified_by_admin ON nurses(verified_by_admin);
CREATE INDEX IF NOT EXISTS idx_nurses_documents_verified_count ON nurses(documents_verified_count);

-- ============================================
-- ROW-LEVEL SECURITY (RLS) FOR DOCUMENTS
-- ============================================

-- Enable RLS on document_uploads table
ALTER TABLE document_uploads ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own documents
CREATE POLICY "Users can view own documents" ON document_uploads
  FOR SELECT USING (user_id = auth.uid());

-- Allow admins to view all documents for verification
CREATE POLICY "Admins can view all documents" ON document_uploads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM partners 
      WHERE profile_id = auth.uid() 
      AND can_verify_documents = true
    )
  );

-- Allow users to upload their own documents
CREATE POLICY "Users can insert own documents" ON document_uploads
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Allow admins to update documents (for verification)
CREATE POLICY "Admins can update documents" ON document_uploads
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM partners 
      WHERE profile_id = auth.uid() 
      AND can_verify_documents = true
    )
  );

-- Allow service role to do everything
CREATE POLICY "Service role can access all documents" ON document_uploads
  FOR ALL USING (current_setting('role') = 'postgres');

-- ============================================
-- HELPER FUNCTIONS FOR DOCUMENTS
-- ============================================

-- Function to update updated_at on document_uploads
CREATE OR REPLACE FUNCTION update_document_uploads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE TRIGGER trigger_update_document_uploads_updated_at
BEFORE UPDATE ON document_uploads
FOR EACH ROW
EXECUTE FUNCTION update_document_uploads_updated_at();

-- ============================================
-- DOCUMENT REQUIREMENTS REFERENCE
-- ============================================

-- DOCTORS REQUIRE (4 documents):
-- 1. government_id - National ID, Passport, or Driver's License
-- 2. annual_license - MDCN Annual Practicing License
-- 3. medical_degree - Bachelor's Degree Certificate
-- 4. registration_certificate - Medical Council Registration

-- NURSES REQUIRE (3 documents):
-- 1. government_id - National ID, Passport, or Driver's License
-- 2. annual_license - NMCN Annual Practicing License
-- 3. nursing_degree - Nursing Qualification Certificate

-- ============================================
-- USEFUL QUERIES FOR ADMIN
-- ============================================

-- Get all pending documents for verification
-- SELECT * FROM document_uploads 
-- WHERE verification_status = 'pending'
-- ORDER BY created_at ASC;

-- Get all documents for a specific user
-- SELECT * FROM document_uploads
-- WHERE user_id = 'user-uuid'
-- ORDER BY created_at DESC;

-- Get all pending documents for doctors
-- SELECT * FROM document_uploads
-- WHERE role = 'doctor' AND verification_status = 'pending'
-- ORDER BY created_at ASC;

-- Count of unverified doctors (missing documents)
-- SELECT COUNT(*) FROM doctors
-- WHERE verified_by_admin = false;

-- Auto-mark doctor as verified when all documents verified
-- UPDATE doctors
-- SET verified_by_admin = true, verified_by_admin_at = CURRENT_TIMESTAMP
-- WHERE profile_id = 'doctor-uuid'
-- AND (
--   SELECT COUNT(*) FROM document_uploads
--   WHERE user_id = 'doctor-uuid' AND verification_status = 'pending'
-- ) = 0;

-- ============================================
-- SQL MIGRATION 002 COMPLETE
-- Tables updated: 2 (doctors, nurses)
-- Tables created: 1 (document_uploads)
-- Indexes created: 6
-- Policies created: 5
-- ============================================
