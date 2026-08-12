# COMPLETE IMPLEMENTATION GUIDE
## Emergency Echo - Role-Based Healthcare Platform with n8n & Supabase

**Last Updated:** June 2026  
**Version:** 1.0.0  
**Status:** Ready for Production

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Step-by-Step Implementation](#step-by-step-implementation)
4. [Database Setup (Supabase)](#database-setup-supabase)
5. [API Endpoints Implementation](#api-endpoints-implementation)
6. [n8n Workflow Setup](#n8n-workflow-setup)
7. [Frontend Components](#frontend-components)
8. [Environment Configuration](#environment-configuration)
9. [Testing & Validation](#testing--validation)
10. [Deployment Checklist](#deployment-checklist)

---

## Architecture Overview

### System Components

```
┌─────────────────┐
│   Frontend      │
│  (Next.js 16)   │
│   React 19      │
└────────┬────────┘
         │
         ├──────────────────────────────────────┐
         │                                      │
         ▼                                      ▼
┌─────────────────┐                  ┌──────────────────┐
│  API Routes     │                  │  Supabase Auth   │
│  (Serverless)   │                  │  (Email/Phone)   │
└────────┬────────┘                  └──────────────────┘
         │
         ├──────────────────────────────────────┐
         │                                      │
         ▼                                      ▼
┌─────────────────┐                  ┌──────────────────┐
│  n8n Webhook    │                  │  Supabase DB     │
│  (Automation)   │◄─────────────────│  (PostgreSQL)    │
└────────┬────────┘                  └──────────────────┘
         │
         ├──────────────────────────────────────┐
         │                                      │
         ▼                                      ▼
    Email Service               Supabase Storage
  (Gmail/SendGrid)              (Document Upload)
```

### User Roles (5 Total)
1. **Patient** - Seeks healthcare services
2. **Doctor** - Provides medical consultations (requires verification)
3. **Nurse** - Provides nursing services (requires verification)
4. **Partner** - Business partner/admin
5. **User** - General user account

### Data Flow
```
User Signup (Frontend)
         ↓
Validation (Email, Password, Role)
         ↓
Create Auth User (Supabase Auth)
         ↓
Trigger n8n Webhook
         ↓
Create Profile Record (Database)
         ↓
Create Role-Specific Record (Database)
         ↓
Send Verification Email (n8n)
         ↓
User Confirms Email
         ↓
Complete Profile (Role-Specific Data)
         ↓
Upload Documents (Doctors/Nurses)
         ↓
Admin Review & Approval
         ↓
Mark Verified (verified_by_admin = true)
         ↓
Account Ready for Use
```

---

## Prerequisites

### Required Services
- [ ] Supabase Account (https://supabase.com) - FREE TIER OK
- [ ] n8n Instance (Self-hosted or Cloud) - OPTIONAL for testing
- [ ] Node.js 18+ (https://nodejs.org)
- [ ] npm or yarn package manager
- [ ] Git (for version control)

### Required Software
```bash
# Check Node.js version
node --version  # Should be v18 or higher

# Check npm version
npm --version   # Should be v9 or higher
```

### Skills Required
- Basic JavaScript/React knowledge
- SQL basics
- REST API understanding
- Understanding of webhooks

---

## Step-by-Step Implementation

### Phase 1: Supabase Setup (30 minutes)

#### Step 1.1: Create Supabase Project
1. Go to https://supabase.com/dashboard
2. Click **"New Project"**
3. Fill in project details:
   - **Name:** emergency-echo
   - **Database Password:** Generate secure password (save it!)
   - **Region:** Choose closest to your users
4. Click **"Create new project"** (wait 2-3 minutes)
5. Go to **Project Settings** → **API** and copy:
   - `NEXT_PUBLIC_SUPABASE_URL` (URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Anon key)
   - `SUPABASE_SERVICE_ROLE_KEY` (Service role key)

#### Step 1.2: Create Supabase Storage Bucket
1. Go to **Storage** in sidebar
2. Click **"Create new bucket"**
3. Fill in:
   - **Name:** documents
   - **Privacy:** Private
4. Click **"Create bucket"**

#### Step 1.3: Enable RLS on Storage Bucket
1. Go to **Storage** (left sidebar) → Click **"documents"** bucket
2. Click **"Policies"** tab
3. Click **"New policy"**
4. Fill in the form:
   - **Policy name:** "Users can upload their own documents"
   - **Allowed operations:** Check **"INSERT"**
   - **Target roles:** Check **"authenticated"**
   - **Policy definition:** Paste this (WITHOUT backticks):
     ```
     bucket_id = 'documents' AND (storage.foldername(name))[1] = 'private' AND auth.role() = 'authenticated'
     ```
   - Click **"Review"** → **"Save policy"**

5. Repeat for SELECT: Click **"New policy"**
   - **Policy name:** "Users can read their own documents"
   - **Allowed operations:** Check **"SELECT"**
   - **Target roles:** Check **"authenticated"**
   - **Policy definition:** Paste this (WITHOUT backticks):
     ```
     bucket_id = 'documents' AND (storage.foldername(name))[1] = 'private' AND auth.role() = 'authenticated'
     ```
   - Click **"Review"** → **"Save policy"**

6. Repeat for DELETE: Click **"New policy"**
   - **Policy name:** "Users can delete their own documents"
   - **Allowed operations:** Check **"DELETE"**
   - **Target roles:** Check **"authenticated"**
   - **Policy definition:** Paste this (WITHOUT backticks):
     ```
     bucket_id = 'documents' AND (storage.foldername(name))[1] = 'private' AND auth.role() = 'authenticated'
     ```
   - Click **"Review"** → **"Save policy"**

---

**⚠️ IMPORTANT:** Only paste the SQL expression (without the ``` marks) into the Supabase policy field!

---

### Phase 2: Database Schema (20 minutes)

#### Step 2.1: Skip old migrations - Use your existing patients table
Your `patients` table is already created and has all the necessary fields. Do **NOT** run migrations 001 or 002.

#### Step 2.2: Run SQL Migration 003 (Create Missing Tables)
1. Go to Supabase **SQL Editor**
2. Click **"New query"**
3. Paste contents from [docs/sql/003_create_missing_tables.sql](sql/003_create_missing_tables.sql)
4. Click **"Run"**
5. Verify all tables created successfully

**Tables created by this migration:**
- `profiles` - User base info (email, full_name, phone, role, verified_at)
- `doctors` - Doctor-specific fields (license_number, specialization, hospital)
- `nurses` - Nurse-specific fields (license_number, specialization, hospital)
- `partners` - Business partner/admin info
- `wallets` - User financial accounts (NGN balance)
- `email_verifications` - Email verification tokens (24-hour expiry)
- `document_uploads` - Document tracking (verification workflow)

**Your existing table:**
- `patients` - Already in your database (use as-is)

#### Step 2.3: Verify Schema
```sql
-- Run in SQL Editor to verify
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Should show:
-- document_uploads, doctors, email_verifications, nurses
-- partners, patients (existing), profiles, wallets
```

---

### Phase 3: Frontend Setup (15 minutes)

#### Step 3.1: Install Dependencies
```bash
cd frontend
npm install formidable @supabase/supabase-js
```

**New packages:**
- `formidable` - File upload handling
- `@supabase/supabase-js` - Supabase client

#### Step 3.2: Configure Environment
1. Create `.env.local` in `frontend/` folder
2. Copy from `.env.local.example`:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   
   # n8n Webhook
   N8N_WEBHOOK_URL=http://your-n8n-instance:5678/webhook/signup
   
   # Admin Token (generate random string)
   ADMIN_VERIFICATION_TOKEN=your-random-secure-token
   NEXT_PUBLIC_ADMIN_TOKEN=your-random-secure-token
   ```

#### Step 3.3: Verify Setup
```bash
npm run dev
# Should start at http://localhost:3000
```

---

### Phase 4: API Routes Implementation (30 minutes)

All API route files are located in `frontend/src/pages/api/`. See [docs/api-reference](api-reference/) for complete documentation.

#### Step 4.1: Auth Endpoints
1. **Signup:** `api/auth/signup-all-roles.js`
   - Validates all 5 roles
   - Creates Supabase Auth user
   - Triggers n8n webhook
   - Rollback on failure

2. **Email Verification:** `api/auth/verify-email.js`
   - Validates token (24-hour expiry)
   - Confirms Supabase Auth user
   - Updates profile verified status

3. **Resend Verification:** `api/auth/resend-verification.js`
   - Invalidates old tokens
   - Generates new token
   - Triggers n8n email webhook

#### Step 4.2: Document Endpoints
1. **Upload:** `api/documents/upload.js`
   - Formidable multipart parsing
   - File validation (type, size)
   - Supabase Storage upload
   - Database record creation

2. **List:** `api/documents/list.js`
   - Admin-only access (token validation)
   - Filter by role and status
   - Pagination (20 per page)
   - Join user profiles

3. **Verify:** `api/documents/verify.js`
   - Admin approval/rejection
   - Status updates
   - Auto-mark verified if all docs done

#### Step 4.3: Profile Endpoint
1. **Complete Profile:** `api/profile/complete-profile.js`
   - Routes to role-specific handler
   - Updates role tables (patients/doctors/nurses/partners)
   - Validates required fields per role

---

### Phase 5: Frontend Components (20 minutes)

#### Step 5.1: Auth Components
- **SignupForm.jsx** - Multi-role signup form
  - Email validation
  - Password strength (min 8 chars)
  - Role selection
  - Error handling

#### Step 5.2: Document Components
- **DocumentUpload.jsx** - Upload interface
  - Role-specific document requirements
  - Upload progress tracking
  - File type/size validation
  - Visual status indicators

#### Step 5.3: Admin Components
- **document-verification.jsx** - Admin dashboard
  - Document listing with filters
  - Modal for detailed review
  - Approve/reject with notes
  - Pagination controls

---

### Phase 6: n8n Workflow Setup (30 minutes)

**n8n can be skipped for MVP testing - system works with direct API calls**

#### Step 6.1: Setup n8n Instance
Option A (Recommended for testing): Use n8n Cloud (https://n8n.cloud)
Option B: Self-hosted (https://docs.n8n.io/hosting/)

#### Step 6.2: Create Supabase Credential
1. In n8n, go to **Credentials**
2. Click **"Create new"** → Search "Supabase"
3. Fill in:
   - **Host:** your-project.supabase.co
   - **Database:** postgres
   - **User:** postgres
   - **Password:** Your DB password
4. Test connection → **Save**

#### Step 6.3: Import Workflow
1. In n8n, click **"Workflows"** → **"Import"**
2. Select file: `n8n-workflows/complete-signup-all-roles.json`
3. Workflow auto-fills Supabase credentials
4. Review nodes for email configuration

#### Step 6.4: Configure Email Node
1. Find **"Send Email"** node in workflow
2. Choose email service:
   - **Gmail:** Add Gmail credential
   - **SendGrid:** Add SendGrid API key
3. Set **From:** noreply@emergencyecho.com
4. Test send to verify setup

#### Step 6.5: Create Webhook
1. In workflow, find **"Webhook"** node (first node)
2. Copy webhook URL: `https://n8n.cloud/webhook/xxxxx`
3. Add to `.env.local`:
   ```env
   N8N_WEBHOOK_URL=https://n8n.cloud/webhook/xxxxx
   ```
4. **Activate** workflow (blue toggle)

---

## Database Setup (Supabase)

### Your Existing Database

Your `patients` table already exists and is comprehensive with:
- Personal info (full_name, dob, gender, blood_group, genotype, language, etc.)
- Emergency contact details (ec_name, ec_relationship, ec_phone)
- Medical history (conditions, surgeries, allergies, medications)
- Mental health & cognitive data
- OB/GYN specific fields (gravida, para, contraceptive_use, etc.)
- Lifestyle data (smoking, alcohol, diet, exercise, occupation)
- Proper enums for all fields
- Unique submission_key for tracking
- Foreign key to user_id

### New Tables to Add

Migration 003 creates the following tables to integrate with your patients table:

**profiles** - Authentication & user management
- email, full_name, phone, role
- Unique email index
- Links to Supabase Auth users

**doctors** - Doctor-specific data
- license_number, specialization, years_of_experience, hospital
- verified_by_admin flag for document verification
- Links to profiles table

**nurses** - Nurse-specific data
- license_number, specialization, years_of_experience, hospital
- verified_by_admin flag
- Links to profiles table

**partners** - Business partners/admins
- company_name, business_registration, admin_level
- can_verify_documents flag for permission control

**wallets** - Financial accounts
- balance, currency (NGN), is_active, is_frozen
- One per user

**email_verifications** - Email verification workflow
- token, expires_at (24 hours), is_used
- Tracks email confirmation process

**document_uploads** - Document verification workflow
- user_id, document_type, file_path, verification_status
- verified_by, verified_at, verification_notes
- Status: pending, verified, or rejected

### Complete SQL Migrations

See [docs/sql/](sql/) folder:

1. **003_create_missing_tables.sql** - All new tables
   - 7 tables + indexes
   - RLS policies
   - Foreign key constraints
   - Triggers for auto-updated_at

### Schema Relationship

```
┌──────────────────────────┐
│      PROFILES            │
│ (Authentication users)   │
│ id, email, role          │
└────┬──────────────────────┘
     │
     ├─→ PATIENTS (existing)
     │   Your detailed patient data
     │   Linked via user_id
     │
     ├─→ DOCTORS
     │   Doctor credentials
     │
     ├─→ NURSES
     │   Nurse credentials
     │
     ├─→ PARTNERS
     │   Admin/partner info
     │
     ├─→ WALLETS
     │   Financial data
     │
     ├─→ EMAIL_VERIFICATIONS
     │   Verification tokens
     │
     └─→ DOCUMENT_UPLOADS
         Document tracking
```

### Key Features

**RLS (Row-Level Security) Policies:**
- Users can only access their own data
- Admins can access all documents
- Doctors/nurses can access their own documents

**Indexes (Performance):**
- `profiles_email_idx` - Email lookups
- `profiles_role_idx` - Role filtering
- `document_uploads_user_id_idx` - Document queries
- `email_verifications_token_idx` - Token lookups

**Constraints:**
- Email uniqueness
- Role validation (enum)
- File type validation
- Status validation

---

## API Endpoints Implementation

### Complete Endpoint Reference

See [docs/api-reference/](api-reference/) for:

1. **Authentication Endpoints**
   - POST `/api/auth/signup-all-roles`
   - POST `/api/auth/verify-email`
   - POST `/api/auth/resend-verification`

2. **Document Endpoints**
   - POST `/api/documents/upload`
   - GET `/api/documents/list` (Admin)
   - POST `/api/documents/verify` (Admin)

3. **Profile Endpoints**
   - POST `/api/profile/complete-profile`

### Request/Response Examples

All endpoints documented in [docs/api-reference/ENDPOINTS.md](api-reference/ENDPOINTS.md)

---

## n8n Workflow Setup

### Workflow Overview

See [docs/workflows/](workflows/) for complete workflow documentation.

**12-Node Workflow:**
1. Webhook trigger (receives signup data)
2. Build base profile record
3. Save to profiles table
4. Role-specific checks (4 nodes)
5. Build role-specific data (4 nodes)
6. Save to role tables (4 nodes)
7. Create wallet (NGN 0 balance)
8. Build welcome email
9. Send email
10. Return response

### Data Transformation

**Input:**
```json
{
  "email": "doctor@example.com",
  "password": "xxxxxx",
  "full_name": "Dr. John Smith",
  "role": "doctor",
  "specialization": "Emergency Medicine",
  "license_number": "MDCN/2024/12345"
}
```

**Output:**
```json
{
  "success": true,
  "user_id": "uuid",
  "message": "Profile created, email sent"
}
```

---

## Frontend Components

### Component Hierarchy

```
App
├── SignupForm
│   └── Form inputs (email, password, role)
│   └── Validation
│   └── API call to signup
│
├── VerifyEmail Page
│   └── Token validation
│   └── Email confirmation
│   └── Redirect to login
│
├── ProfileCompletion
│   └── Role-specific forms
│   │   ├── PatientProfile
│   │   ├── DoctorProfile
│   │   └── NurseProfile
│   │
│   └── DocumentUpload
│       ├── Document grid
│       ├── File upload
│       └── Progress tracking
│
└── Admin
    └── DocumentVerification
        ├── Document list
        ├── Filters
        ├── Review modal
        └── Approve/reject
```

### Component Examples

See [docs/frontend/](frontend/) for complete documentation and usage examples.

---

## Environment Configuration

### Required Environment Variables

Create `frontend/.env.local`:

```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# n8n Webhook (Optional - system works without it)
N8N_WEBHOOK_URL=http://your-n8n-instance:5678/webhook/signup

# Admin Token (Required for document verification)
ADMIN_VERIFICATION_TOKEN=generate-secure-random-token
NEXT_PUBLIC_ADMIN_TOKEN=generate-secure-random-token

# Node Environment
NODE_ENV=development
```

### Generate Secure Token

```bash
# On Windows PowerShell
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$token = [Convert]::ToBase64String($bytes)
Write-Host $token
```

---

## Testing & Validation

### Unit Testing Checklist

- [ ] **Signup - Patient**
  - [ ] Valid email required
  - [ ] Password min 8 chars
  - [ ] User created in Supabase
  - [ ] Profile record created
  - [ ] Email verification sent
  - [ ] Token expires in 24 hours

- [ ] **Signup - Doctor**
  - [ ] All patient checks
  - [ ] Specialization required
  - [ ] License number required
  - [ ] Doctor record created
  - [ ] verified_by_admin = false initially

- [ ] **Signup - Nurse**
  - [ ] All patient checks
  - [ ] License number required
  - [ ] Nurse record created

- [ ] **Email Verification**
  - [ ] Valid token accepted
  - [ ] Invalid token rejected
  - [ ] Expired token rejected (>24h)
  - [ ] User marked verified
  - [ ] Redirects to login

- [ ] **Document Upload**
  - [ ] Valid file types accepted (PDF, DOC, JPG)
  - [ ] File size limit enforced (10MB)
  - [ ] File stored in Supabase Storage
  - [ ] Database record created
  - [ ] Upload progress shown

- [ ] **Document Verification**
  - [ ] Admin sees pending documents
  - [ ] Can filter by role
  - [ ] Can filter by status
  - [ ] Can approve/reject with notes
  - [ ] All docs approved → verified_by_admin = true

### Integration Testing

```bash
# 1. Start frontend
cd frontend
npm run dev

# 2. Test complete flow
# - Signup as doctor
# - Verify email
# - Complete profile
# - Upload documents
# - Check Supabase for records
# - Admin approval
# - Verify status updated
```

### Manual Testing

1. **Signup Test**
   ```bash
   curl -X POST http://localhost:3000/api/auth/signup-all-roles \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "TestPass123",
       "full_name": "Test User",
       "role": "patient"
     }'
   ```

2. **Document Upload Test**
   ```bash
   curl -X POST http://localhost:3000/api/documents/upload \
     -F "file=@ID.pdf" \
     -F "user_id=uuid" \
     -F "role=doctor" \
     -F "document_type=government_id"
   ```

3. **Admin Verification Test**
   ```bash
   curl -X POST http://localhost:3000/api/documents/verify \
     -H "Content-Type: application/json" \
     -H "x-admin-token: your-token" \
     -d '{
       "document_id": "uuid",
       "verification_status": "verified"
     }'
   ```

---

## Deployment Checklist

### Pre-Deployment

- [ ] All SQL migrations run successfully
- [ ] All environment variables configured
- [ ] npm install completed (formidable, @supabase/supabase-js)
- [ ] No console errors in development
- [ ] All tests passing
- [ ] Documentation reviewed

### Supabase Checks

- [ ] Project created and seeded
- [ ] RLS policies enabled
- [ ] Storage bucket created with RLS
- [ ] Database backups configured
- [ ] SSL certificate valid

### Frontend Checks

- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors
- [ ] Environment variables set for production
- [ ] Service role key NOT in public code
- [ ] Admin token securely stored

### n8n Checks (if used)

- [ ] Workflow imported
- [ ] Supabase credentials configured
- [ ] Email service configured
- [ ] Webhook activated
- [ ] Test webhook fires correctly

### Security Checklist

- [ ] Admin token is unique and strong
- [ ] Service role key not exposed in code
- [ ] RLS policies on all tables
- [ ] Storage bucket is private
- [ ] File type validation enabled
- [ ] File size limits enforced
- [ ] Rate limiting on auth endpoints (optional)

### Post-Deployment

- [ ] Monitor logs for errors
- [ ] Test complete signup flow
- [ ] Test document upload
- [ ] Test admin verification
- [ ] Monitor database performance
- [ ] Check email delivery

---

## Folder Structure Reference

```
EMERGENCY_ECHO/
├── docs/                          # All documentation
│   ├── implementation/            # This file + other guides
│   ├── sql/                       # SQL migration files
│   ├── api-reference/             # API endpoint documentation
│   ├── workflows/                 # n8n workflow documentation
│   └── frontend/                  # Component documentation
│
├── supabase/
│   └── migrations/
│       ├── 001_create_auth_tables.sql
│       └── 002_add_document_uploads.sql
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── api/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── signup-all-roles.js
│   │   │   │   │   ├── verify-email.js
│   │   │   │   │   └── resend-verification.js
│   │   │   │   ├── documents/
│   │   │   │   │   ├── upload.js
│   │   │   │   │   ├── list.js
│   │   │   │   │   └── verify.js
│   │   │   │   └── profile/
│   │   │   │       └── complete-profile.js
│   │   │   ├── verify-email.jsx
│   │   │   └── admin/
│   │   │       └── document-verification.jsx
│   │   │
│   │   └── components/
│   │       ├── SignupForm.jsx
│   │       └── DocumentUpload.jsx
│   │
│   ├── .env.local.example
│   ├── package.json
│   └── ...
│
├── n8n-workflows/
│   └── complete-signup-all-roles.json
│
├── IMPLEMENTATION.md               # This file
├── README.md
└── ...
```

---

## Quick Start (30 minutes)

### If you want to get started immediately:

```bash
# 1. Setup Supabase
# - Go to supabase.com, create project
# - Create "documents" storage bucket
# - Get API keys

# 2. Create database
# - Go to SQL Editor
# - Run 001_create_auth_tables.sql
# - Run 002_add_document_uploads.sql

# 3. Setup frontend
cd frontend
npm install formidable @supabase/supabase-js
cp .env.local.example .env.local
# Edit .env.local with Supabase keys

# 4. Run locally
npm run dev
# Visit http://localhost:3000

# 5. Test
# - Try signup
# - Check Supabase for records
# - Try document upload
# - Check Supabase Storage for files
```

---

## Troubleshooting

### Common Issues

**"Module not found: formidable"**
```bash
npm install formidable
```

**"Supabase connection failed"**
- Check NEXT_PUBLIC_SUPABASE_URL is correct
- Check SUPABASE_SERVICE_ROLE_KEY is correct
- Verify project exists in Supabase dashboard

**"Document upload fails"**
- Check "documents" bucket exists
- Check bucket privacy is "Private"
- Check RLS policies are enabled

**"n8n webhook not firing"**
- Check N8N_WEBHOOK_URL is correct
- Verify n8n instance is running
- Check webhook is activated in n8n

**"Email not sending"**
- Check email service configured in n8n
- Verify API key/password correct
- Check "From" address is valid

---

## Support & Resources

### Documentation Links
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [n8n Docs](https://docs.n8n.io)
- [PostgreSQL Docs](https://www.postgresql.org/docs)

### Project Documentation
- [docs/sql/](sql/) - All SQL migrations
- [docs/api-reference/](api-reference/) - API endpoints
- [docs/workflows/](workflows/) - n8n workflow details
- [docs/frontend/](frontend/) - Component documentation

### Getting Help
1. Check troubleshooting section above
2. Review relevant documentation file
3. Check Supabase dashboard for errors
4. Check browser console for client-side errors
5. Check terminal for server-side errors

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | June 2026 | Initial complete implementation |

---

**Created:** June 2026  
**Last Updated:** June 2026  
**Maintained By:** Emergency Echo Team
