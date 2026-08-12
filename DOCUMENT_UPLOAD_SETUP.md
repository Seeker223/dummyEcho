# Document Upload & Verification System Setup

## Overview

This system allows doctors and nurses to upload credentials (ID, licenses, degrees), which are stored in Supabase Storage and reviewed by admins before verification.

---

## Architecture

```
Healthcare Professional
    ↓
Upload Document (Frontend)
    ↓
API Route (/api/documents/upload)
    ↓
Validate File (type, size)
    ↓
Upload to Supabase Storage
    ↓
Record in database (document_uploads table)
    ↓
Admin Review Dashboard (/admin/document-verification)
    ↓
Approve/Reject Document
    ↓
Update doctor/nurse profile (verified_by_admin = true)
```

---

## Prerequisites

1. **Supabase Project** (already set up)
2. **Node.js packages:**
   ```bash
   npm install formidable
   ```

---

## Step 1: Setup Supabase Storage

### 1.1 Create Storage Bucket

1. Go to Supabase dashboard → **Storage**
2. Click **Create new bucket**
3. Name: `documents`
4. Privacy: **Private** (only authenticated users can access)
5. Click **Create bucket**

### 1.2 Configure Bucket Settings

1. Click on `documents` bucket
2. Go to **Policies**
3. Add policy for uploads:
   ```sql
   CREATE POLICY "Users can upload their own documents"
   ON storage.objects
   FOR INSERT
   WITH CHECK (
     auth.uid()::text = (storage.foldername(name))[1]
   );
   ```

4. Add policy for reading own documents:
   ```sql
   CREATE POLICY "Users can read their own documents"
   ON storage.objects
   FOR SELECT
   USING (
     auth.uid()::text = (storage.foldername(name))[1]
   );
   ```

---

## Step 2: Update Database

### 2.1 Run SQL Migration

1. Go to Supabase → **SQL Editor**
2. Create new query
3. Copy contents of `supabase/migrations/002_add_document_uploads.sql`
4. Run the query

**Tables created:**
- `document_uploads` - Track all document uploads
- Updated `doctors` & `nurses` with verification fields

---

## Step 3: Install Dependencies

```bash
cd frontend
npm install formidable
```

---

## Step 4: Environment Configuration

Add to `.env.local`:

```env
# Supabase Storage
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Admin verification
ADMIN_VERIFICATION_TOKEN=your-secure-admin-token
NEXT_PUBLIC_ADMIN_TOKEN=your-secure-admin-token
```

---

## Step 5: API Endpoints

### Upload Document

**POST `/api/documents/upload`**

**Request (multipart/form-data):**
```
file: <binary file>
user_id: uuid
role: "doctor" | "nurse"
document_type: "government_id" | "annual_license" | "medical_degree" | "registration_certificate" | "nursing_degree"
```

**Response:**
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "document": {
    "id": "uuid",
    "document_type": "government_id",
    "file_name": "ID_Scan.pdf",
    "verification_status": "pending",
    "created_at": "2024-06-01T10:30:00Z"
  }
}
```

### List Documents (Admin)

**GET `/api/documents/list`**

**Query Parameters:**
- `role` (optional): "doctor" or "nurse"
- `verification_status` (optional): "pending", "verified", "rejected"
- `page` (optional): default 1
- `limit` (optional): default 20

**Headers:**
```
x-admin-token: your-admin-token
```

**Response:**
```json
{
  "success": true,
  "documents": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "role": "doctor",
      "document_type": "government_id",
      "file_name": "ID.pdf",
      "file_size": 2048000,
      "verification_status": "pending",
      "created_at": "2024-06-01T10:30:00Z",
      "profiles": {
        "full_name": "Dr. John Smith",
        "email": "dr.smith@example.com"
      },
      "doctors": {
        "license_number": "MDCN/2024/12345",
        "specialization": "Emergency Medicine"
      }
    }
  ],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
```

### Verify Document

**POST `/api/documents/verify`**

**Request:**
```json
{
  "document_id": "uuid",
  "verification_status": "verified" | "rejected",
  "verification_notes": "Optional notes about the document"
}
```

**Headers:**
```
x-admin-token: your-admin-token
```

**Response:**
```json
{
  "success": true,
  "message": "Document verified successfully",
  "document_id": "uuid",
  "verification_status": "verified"
}
```

---

## Step 6: Frontend Components

### 1. Document Upload Component

Use in doctor/nurse onboarding:

```jsx
import DocumentUpload from '@/components/DocumentUpload';

export default function OnboardingPage() {
  return <DocumentUpload userId={userId} role="doctor" />;
}
```

### 2. Admin Dashboard

Visit `/admin/document-verification` to review documents.

**Features:**
- Filter by role (doctor/nurse)
- Filter by verification status (pending/verified/rejected)
- View document details
- Approve/reject with notes
- Pagination (20 per page)

---

## Document Types Required

### Doctor (4 documents)
1. **Government ID** - National ID, passport, or driver's license
2. **Annual License** - MDCN annual practicing license
3. **Medical Degree** - Bachelor's degree certificate
4. **Registration Certificate** - Medical council registration

### Nurse (3 documents)
1. **Government ID** - National ID, passport, or driver's license
2. **Annual License** - NMCN annual practicing license
3. **Nursing Degree** - Nursing qualification certificate

---

## File Upload Flow

### User Uploads Document

```
1. User clicks on document card
2. Selects file from computer
3. File validated:
   - Type: PDF, DOC, DOCX, JPG, PNG
   - Size: Max 10MB
4. Shows upload progress
5. Sends to /api/documents/upload
6. File stored in Supabase Storage: documents/doctor/uuid/government_id/1234567890.pdf
7. Record created in document_uploads table
8. User sees "✓ Uploaded" status
```

### Admin Reviews Documents

```
1. Admin visits /admin/document-verification
2. Sees list of pending documents
3. Filters by role or status
4. Clicks "Review" on document
5. Sees document details and user info
6. Opens document preview (if needed)
7. Writes verification notes
8. Clicks "Approve" or "Reject"
9. If all documents approved:
   - doctors.verified_by_admin = true
   - Doctor can now offer consultations
```

---

## Database Schema

### document_uploads table
```sql
id                        UUID (primary key)
user_id                   UUID (references profiles)
role                      TEXT ('doctor' | 'nurse')
document_type             TEXT
file_path                 TEXT (Supabase path)
file_name                 TEXT
file_size                 INTEGER (bytes)
mime_type                 TEXT
storage_bucket            TEXT ('documents')
upload_status             TEXT ('uploaded', 'processing', 'verified', 'rejected')
verification_status       TEXT ('pending', 'verified', 'rejected')
verification_notes        TEXT
verified_by               UUID (admin user)
verified_at               TIMESTAMP
rejected_reason           TEXT
created_at                TIMESTAMP
updated_at                TIMESTAMP
```

---

## Verification Workflow

### Auto-Approval Logic

When admin approves a document:
1. Update document_uploads: verification_status = "verified"
2. Check if ALL documents for that user are verified
3. If yes, update doctors/nurses table: verified_by_admin = true
4. Profile now shows as "Verified" on platform

### Rejection Workflow

When admin rejects a document:
1. Update document: verification_status = "rejected"
2. Send rejection email to user with reason
3. User must re-upload document
4. Process repeats

---

## Security Checklist

- ✅ Files stored in private Supabase bucket
- ✅ Only users can upload their own documents
- ✅ File type validation (server-side)
- ✅ File size validation (10MB max)
- ✅ Admin access controlled via token
- ✅ RLS policies on document_uploads table
- ✅ Verified admins update profiles
- ✅ All actions logged with timestamps

---

## Testing

### Test Doctor Upload

```bash
# 1. Go to doctor onboarding
# 2. Try upload:
#    - Valid: PDF, DOC, JPG under 10MB ✓
#    - Invalid: EXE, ZIP files ✗
#    - Too large: >10MB file ✗

# 3. Check Supabase Storage
#    Path: documents/doctor/uuid/document_type/timestamp.pdf

# 4. Check database
#    SELECT * FROM document_uploads WHERE user_id = 'uuid'
```

### Test Admin Verification

```bash
# 1. Login as admin
# 2. Visit /admin/document-verification
# 3. See pending documents
# 4. Click "Review"
# 5. Approve/Reject with notes
# 6. Document status updates
# 7. Check database for verified_by_admin = true
```

---

## Troubleshooting

### "File upload failed"
- Check file size (max 10MB)
- Check file type (PDF, DOC, DOCX, JPG, PNG)
- Check internet connection

### "Storage bucket not found"
- Create `documents` bucket in Supabase
- Check bucket is set to Private
- Verify RLS policies are enabled

### "Unauthorized: Admin access required"
- Check ADMIN_VERIFICATION_TOKEN env variable
- Verify token matches in .env.local
- Token must be set for both frontend and backend

### "File not stored in database"
- Check Supabase service role key is correct
- Check document_uploads table exists
- Verify RLS policies on document_uploads

---

## Next Steps

1. ✅ Setup Supabase Storage bucket
2. ✅ Run database migrations
3. ✅ Install formidable package
4. ✅ Configure environment variables
5. ✅ Test file uploads
6. ✅ Test admin verification dashboard
7. 📧 Add email notifications for approvals
8. 📊 Add document verification analytics
9. 🔄 Add automatic document expiration (yearly)
10. 📱 Add mobile document scanning
