-- Add document upload table
CREATE TABLE IF NOT EXISTS document_uploads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('doctor', 'nurse')),
  document_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  storage_bucket TEXT DEFAULT 'documents',
  upload_status TEXT DEFAULT 'uploaded' CHECK (upload_status IN ('uploaded', 'processing', 'verified', 'rejected')),
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verification_notes TEXT,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  rejected_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX idx_document_uploads_user_id ON document_uploads(user_id);
CREATE INDEX idx_document_uploads_role ON document_uploads(role);
CREATE INDEX idx_document_uploads_verification_status ON document_uploads(verification_status);
CREATE INDEX idx_document_uploads_document_type ON document_uploads(document_type);

-- Enable RLS
ALTER TABLE document_uploads ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own documents" ON document_uploads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upload their own documents" ON document_uploads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all documents" ON document_uploads
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Admins can update document verification" ON document_uploads
  FOR UPDATE USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Update doctors and nurses tables to reference document uploads
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS documents_verified_count INTEGER DEFAULT 0;
ALTER TABLE nurses ADD COLUMN IF NOT EXISTS documents_verified_count INTEGER DEFAULT 0;
