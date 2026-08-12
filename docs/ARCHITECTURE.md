# SYSTEM ARCHITECTURE & DATA FLOWS
## Emergency Echo Platform Visual Guide

**Version:** 1.0.0  
**Updated:** June 2026

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         EMERGENCY ECHO                              │
│                     Healthcare Platform                             │
└─────────────────────────────────────────────────────────────────────┘
         │
         ├────────────────────┬──────────────────┬──────────────────┐
         │                    │                  │                  │
         ▼                    ▼                  ▼                  ▼
    ┌─────────┐          ┌──────────┐    ┌─────────────┐    ┌──────────┐
    │Frontend │          │API Routes│    │ Supabase    │    │   n8n    │
    │ (Next.js)          │(Serverless)  │ (Database)  │    │ (Workflow)
    │ React 19 │          │ 7 Endpoints │ PostgreSQL  │    │ Automation
    └────┬────┘          └──────┬──────┘ └──────┬──────┘    └────┬─────┘
         │                      │               │                 │
         │ HTTP/REST           │               │    Webhook      │
         └──────────────────────┴───────────────┴─────────────────┘
```

### Component Interaction

```
┌──────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Next.js)                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Pages:                        Components:                       │
│  • Signup Page          →       SignupForm                      │
│  • Verify Email         →       Auto-verify token               │
│  • Profile Completion   →       Role-specific forms             │
│  • Document Upload      →       DocumentUpload component        │
│  • Admin Dashboard      →       DocumentVerification component  │
│                                                                  │
└────┬─────────────────────────────────────────────────────────────┘
     │
     │ API Calls (JSON)
     │
     ▼
┌──────────────────────────────────────────────────────────────────┐
│                   API ROUTES (Next.js)                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Signup Endpoints:                                               │
│  • POST /api/auth/signup-all-roles                              │
│  • POST /api/auth/verify-email                                  │
│  • POST /api/auth/resend-verification                           │
│                                                                  │
│  Document Endpoints:                                             │
│  • POST /api/documents/upload                                   │
│  • GET /api/documents/list                                      │
│  • POST /api/documents/verify                                   │
│                                                                  │
│  Profile Endpoint:                                               │
│  • POST /api/profile/complete-profile                           │
│                                                                  │
└────┬─────────────────────────────────────────────────────────────┘
     │
     ├─────────────────────┬──────────────────┬──────────────────┐
     │                     │                  │                  │
     ▼                     ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────────┐  ┌──────────────┐  ┌──────────┐
│ Supabase     │  │ Supabase Auth    │  │ Supabase     │  │  n8n     │
│ Database     │  │ (User mgmt)      │  │ Storage      │  │ Webhook  │
│ (PostgreSQL) │  │ (Email login)    │  │ (Documents)  │  │ (Email)  │
└──────────────┘  └──────────────────┘  └──────────────┘  └──────────┘
```

---

## 📊 Database Schema Diagram

```
                        ┌──────────────┐
                        │  PROFILES    │
                        ├──────────────┤
                        │ id (PK)      │
                        │ email        │
                        │ full_name    │
                        │ phone        │
                        │ role         │
                        │ verified_at  │
                        └────┬─────────┘
                             │
                ┌────────────┼────────────┐
                │            │            │
       ┌────────▼────┐  ┌────▼────┐  ┌──▼────────┐
       │  PATIENTS   │  │ DOCTORS │  │  NURSES   │
       ├─────────────┤  ├─────────┤  ├───────────┤
       │ DOB         │  │ License │  │ License   │
       │ Gender      │  │ Spec.   │  │ Spec.     │
       │ Blood Type  │  │ Hospital│  │ Hospital  │
       │ Allergies   │  │ Verified│  │ Verified  │
       │ OB/GYN*     │  │ by admin│  │ by admin  │
       └─────────────┘  └────┬────┘  └───────────┘
                             │
                    ┌────────▼────────┐
                    │ DOCUMENT_       │
                    │ UPLOADS         │
                    ├─────────────────┤
                    │ user_id (FK)    │
                    │ document_type   │
                    │ file_path       │
                    │ verification    │
                    │ verified_by     │
                    │ verified_at     │
                    └─────────────────┘

       ┌──────────────┐        ┌─────────────────┐
       │  PARTNERS    │        │  WALLETS        │
       ├──────────────┤        ├─────────────────┤
       │ Company Name │        │ balance         │
       │ Business Reg │        │ currency (NGN)  │
       │ Admin Level  │        │ is_active       │
       │ Permissions  │        │ is_frozen       │
       └──────────────┘        └─────────────────┘

       ┌────────────────────────────────┐
       │ EMAIL_VERIFICATIONS             │
       ├────────────────────────────────┤
       │ token (unique)                  │
       │ is_used                         │
       │ expires_at (24 hours)           │
       └────────────────────────────────┘

Notes:
- All tables have created_at, updated_at, RLS policies
- Foreign keys maintain referential integrity
- Indexes on email, role, verification status for performance
- OB/GYN fields only populated for female patients
```

---

## 🔄 Data Flows

### Flow 1: User Signup

```
┌──────────────────────────────────────────────────────────────────┐
│                    USER SIGNUP FLOW                              │
└──────────────────────────────────────────────────────────────────┘

1. FRONTEND
   ┌─────────────────────┐
   │ SignupForm          │
   │ User fills form:    │
   │ • email             │
   │ • password          │
   │ • full_name         │
   │ • role              │
   │ + role-specific     │
   └──────────┬──────────┘
              │
              │ validate locally
              │
              ▼
   ┌─────────────────────┐
   │ Validation          │
   │ • Email format      │
   │ • Password 8+ chars │
   │ • Required fields   │
   │ • Unique role data  │
   └──────────┬──────────┘
              │
              │ if invalid → show errors → user fixes
              │ if valid → proceed
              │
              ▼

2. BACKEND (API ROUTE)
   ┌─────────────────────────────────────────┐
   │ POST /api/auth/signup-all-roles         │
   │                                         │
   │ 1. Validate request                     │
   │ 2. Create Supabase Auth user            │
   │ 3. Build profile record                 │
   │ 4. Check role                           │
   │ 5. Build role-specific record           │
   │ 6. Trigger n8n webhook                  │
   │ 7. Return user_id                       │
   │ 8. If error: Delete auth user (rollback)│
   └──────────┬──────────────────────────────┘
              │
              ├─────────────────┬──────────────────┐
              │                 │                  │
              ▼                 ▼                  ▼
         ┌─────────┐       ┌────────────┐   ┌──────────────┐
         │Supabase │       │Supabase    │   │ n8n          │
         │Auth     │       │Database    │   │ Webhook      │
         └─────────┘       └────────────┘   └──────────────┘

3. N8N WORKFLOW
   ┌──────────────────────────────────┐
   │ Webhook receives signup data     │
   │                                  │
   │ 1. Build base profile            │
   │ 2. Save to profiles table        │
   │ 3. Check role (if/then)          │
   │ 4. Build role-specific data      │
   │ 5. Save to role table            │
   │ 6. Create wallet (NGN 0)         │
   │ 7. Build email                   │
   │ 8. Send email                    │
   └──────────────────────────────────┘

4. DATABASE RECORDS CREATED
   ├─ profiles table         → 1 row
   ├─ [role] table           → 1 row (patients/doctors/nurses/partners)
   ├─ wallets table          → 1 row
   ├─ email_verifications    → 1 row (with token)
   └─ Supabase Auth          → 1 user

5. USER RECEIVES
   ├─ Email with verification link
   └─ Contains: /verify-email?token=xxxx

6. FRONTEND SHOWS
   ├─ Success message
   └─ "Check your email to verify"
```

### Flow 2: Email Verification

```
┌──────────────────────────────────────────────────────────────────┐
│              EMAIL VERIFICATION FLOW                             │
└──────────────────────────────────────────────────────────────────┘

1. USER RECEIVES EMAIL
   ┌────────────────────────┐
   │ Click verification link│
   │ /verify-email?token=X  │
   └──────────┬─────────────┘
              │
              ▼

2. FRONTEND (Page Load)
   ┌───────────────────────────────────────┐
   │ 1. Extract token from URL params      │
   │ 2. Show "Verifying..." message        │
   │ 3. Call /api/auth/verify-email        │
   └───────────┬───────────────────────────┘
               │
               ▼

3. BACKEND VALIDATION
   ┌─────────────────────────────────────────┐
   │ POST /api/auth/verify-email             │
   │                                         │
   │ 1. Find token in email_verifications    │
   │ 2. Check if expired (24 hours)          │
   │ 3. Check if already used               │
   │ 4. Mark as used                         │
   │ 5. Confirm Supabase Auth user          │
   │ 6. Update profiles.verified_at          │
   │ 7. Return success                       │
   └──────────┬──────────────────────────────┘
              │
              ├─ If valid → Success
              │
              ├─ If expired → Error: "Token expired"
              │
              └─ If already used → Error: "Already verified"

4. FRONTEND RESPONSE
   ├─ Success:
   │  ├─ Show "✓ Email verified successfully!"
   │  ├─ Show "Redirecting to login..."
   │  └─ Redirect to /login after 3 seconds
   │
   └─ Error:
      ├─ Show error message
      └─ Offer "Resend Verification Email" button

5. DATABASE UPDATE
   └─ email_verifications.is_used = true
   └─ email_verifications.used_at = NOW()
   └─ profiles.verified_at = NOW()
```

### Flow 3: Document Upload & Verification

```
┌──────────────────────────────────────────────────────────────────┐
│          DOCUMENT UPLOAD & VERIFICATION FLOW                     │
└──────────────────────────────────────────────────────────────────┘

PHASE 1: UPLOAD
──────────────

1. HEALTHCARE PROFESSIONAL
   ┌────────────────────────┐
   │ DocumentUpload         │
   │ Component              │
   │ Role: doctor/nurse     │
   │ Shows required docs    │
   │ • government_id        │
   │ • annual_license       │
   │ • degree certificate   │
   │ • [more if doctor]     │
   └──────────┬─────────────┘
              │
              │ Click on document card
              │
              ▼
   ┌────────────────────────┐
   │ File Picker            │
   │ Select PDF/JPG/DOC     │
   │ Max 10 MB              │
   └──────────┬─────────────┘
              │
              │ Validate: type, size
              │
              ▼
   ┌────────────────────────┐
   │ Show upload progress   │
   │ [████████░░] 80%       │
   └──────────┬─────────────┘
              │
              ▼
   ┌────────────────────────────────┐
   │ POST /api/documents/upload     │
   │ Multipart form data            │
   │ • file                         │
   │ • user_id                      │
   │ • role                         │
   │ • document_type                │
   └──────────┬─────────────────────┘
              │
              ▼

2. BACKEND PROCESSING
   ┌──────────────────────────────────────┐
   │ 1. Parse multipart with Formidable  │
   │ 2. Validate file type & size         │
   │ 3. Upload to Supabase Storage        │
   │    Path: documents/role/user_id/     │
   │           doc_type/timestamp.ext     │
   │ 4. Record in database:               │
   │    INSERT document_uploads           │
   │ 5. Return document_id                │
   └──────────┬──────────────────────────┘
              │
              ├─ Success → document_uploads table
              │             (status: pending)
              │
              └─ Error → Return error message

3. FRONTEND FEEDBACK
   ├─ Success: Show ✓ Uploaded (green)
   └─ Error: Show error message + retry option

PHASE 2: ADMIN REVIEW
─────────────────────

1. ADMIN DASHBOARD
   ┌──────────────────────────────────┐
   │ /admin/document-verification     │
   │                                  │
   │ Filters:                          │
   │ • Role: [Doctor v] [Nurse v]     │
   │ • Status: [Pending v]            │
   │                                  │
   │ GET /api/documents/list          │
   │ Headers: x-admin-token           │
   └──────────┬───────────────────────┘
              │
              ▼
   ┌──────────────────────────────────┐
   │ Table of documents               │
   │ Name | Role | Type | Status      │
   │ ...                              │
   │ [Review] button                  │
   └──────────┬───────────────────────┘
              │
              │ Click [Review]
              │
              ▼
   ┌──────────────────────────────────┐
   │ Modal opens:                     │
   │ • Professional info              │
   │ • Credentials shown              │
   │ • Document preview               │
   │ • [Approve] [Reject]             │
   │ • Notes field (required if        │
   │   rejecting)                     │
   └──────────┬───────────────────────┘
              │
              │ Admin selects Approve or Reject
              │ Adds notes
              │
              ▼

2. SUBMISSION
   ┌──────────────────────────────────┐
   │ POST /api/documents/verify       │
   │ {                                │
   │   document_id: "xxx",            │
   │   verification_status: "verified"│
   │   verification_notes: "..."      │
   │ }                                │
   └──────────┬───────────────────────┘
              │
              ▼

3. BACKEND PROCESSING
   ┌────────────────────────────────────┐
   │ 1. Validate admin token           │
   │ 2. Find document record           │
   │ 3. Update verification_status     │
   │ 4. Set verified_by (admin user)   │
   │ 5. Set verified_at (timestamp)    │
   │ 6. Check if ALL docs for          │
   │    professional are verified      │
   │ 7. If all verified:               │
   │    UPDATE doctors/nurses          │
   │    SET verified_by_admin = true   │
   │ 8. Return success                 │
   └────────────┬─────────────────────┘
                │
                ▼

4. DATABASE UPDATES
   ├─ document_uploads
   │  ├─ verification_status = "verified"
   │  ├─ verified_by = admin_user_id
   │  └─ verified_at = NOW()
   │
   └─ [If all docs verified]
      doctors/nurses
      ├─ verified_by_admin = true
      └─ verified_by_admin_at = NOW()

5. PROFESSIONAL NOTIFIED
   ├─ If Approved: Can now offer services
   └─ If Rejected: Needs to resubmit

6. STATUS CHANGES
   ├─ Documents.status:
   │  pending → verified ✓
   │  pending → rejected ✗
   │
   └─ Professional.status:
      unverified → verified (when all docs approved)
```

---

## 🔐 Security Flows

### Authorization Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              AUTHORIZATION & SECURITY FLOW                      │
└─────────────────────────────────────────────────────────────────┘

REQUEST TYPES:
──────────────

1. PUBLIC ENDPOINTS
   ├─ POST /api/auth/signup-all-roles
   ├─ POST /api/auth/verify-email
   ├─ POST /api/auth/resend-verification
   └─ No auth required
      User can be anonymous

2. AUTHENTICATED ENDPOINTS
   ├─ POST /api/documents/upload
   ├─ GET /api/documents/list (admin)
   └─ Requires: x-admin-token header
      Header value must match:
      process.env.ADMIN_VERIFICATION_TOKEN

3. USER-SPECIFIC ENDPOINTS
   ├─ POST /api/profile/complete-profile
   └─ Requires: User session
      (Supabase Auth token in session)

REQUEST FLOW:
─────────────

Public Request:
┌─────────────┐
│ Frontend    │
│ (Anonymous) │
└──────┬──────┘
       │ No headers needed
       │
       ▼
┌─────────────────────────┐
│ API Route               │
│ Skip auth checks        │
│ Process request         │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Supabase Auth           │
│ (Not consulted)         │
└─────────────────────────┘

Admin Request:
┌─────────────┐
│ Frontend    │
│ (Admin User)│
└──────┬──────┘
       │ Header: x-admin-token
       │ Value: admin-token-value
       │
       ▼
┌──────────────────────────────┐
│ API Route                    │
│ Check admin token            │
│ if (token !== env.TOKEN)     │
│   return 401 Unauthorized    │
└──────┬───────────────────────┘
       │
       ├─ Valid → Continue
       │
       └─ Invalid → Error

User-Specific Request:
┌────────────────────┐
│ Frontend           │
│ (Authenticated)    │
└──────┬─────────────┘
       │ Session + Supabase token
       │
       ▼
┌──────────────────────────────┐
│ API Route                    │
│ Get current user from        │
│ Supabase Auth (session)      │
│ Get user.id                  │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Check Supabase RLS Policies  │
│ User can only access         │
│ their own data               │
└──────┬───────────────────────┘
       │
       ├─ Authorized → Continue
       │
       └─ Not authorized → Error

DATABASE RLS:
─────────────

Example RLS Policy:
┌────────────────────────────────┐
│ CREATE POLICY                  │
│ "Users can view own documents" │
│ ON document_uploads            │
│ WHERE user_id = auth.uid()     │
│                                │
│ User can ONLY see documents    │
│ where user_id = their user_id  │
└────────────────────────────────┘

Storage RLS:
┌────────────────────────────────┐
│ CREATE POLICY                  │
│ "Users can upload own docs"    │
│ ON storage.objects             │
│ WHERE                           │
│ bucket_id = 'documents' AND    │
│ auth.uid() = (foldername)[1]   │
│                                │
│ File path must be:             │
│ documents/{user_id}/...        │
└────────────────────────────────┘
```

---

## 🔄 Role-Based Data Structures

```
PATIENT SIGNUP
──────────────
{
  profiles:
  {
    email, full_name, phone,
    role: "patient",
    verified_at: null
  },
  patients:
  {
    profile_id,
    date_of_birth, gender,
    blood_type, allergies,
    chronic_conditions, etc
  },
  wallets:
  {
    profile_id,
    balance: 0,
    currency: "NGN"
  },
  email_verifications:
  {
    profile_id, email,
    token: "xxxx",
    expires_at: now + 24h
  }
}

DOCTOR SIGNUP
─────────────
{
  profiles:
  {
    email, full_name, phone,
    role: "doctor",
    verified_at: null
  },
  doctors:
  {
    profile_id,
    license_number, specialization,
    years_of_experience,
    verified_by_admin: false,
    documents_verified_count: 0
  },
  document_uploads: [
    {
      user_id, role: "doctor",
      document_type: "government_id",
      verification_status: "pending"
    },
    {
      user_id, role: "doctor",
      document_type: "annual_license",
      verification_status: "pending"
    },
    // ... 2 more documents required
  ],
  wallets:
  {
    profile_id,
    balance: 0,
    currency: "NGN"
  },
  email_verifications:
  {
    profile_id, email, token, expires_at
  }
}

NURSE SIGNUP
────────────
{
  profiles:
  {
    email, full_name, phone,
    role: "nurse",
    verified_at: null
  },
  nurses:
  {
    profile_id,
    license_number, specialization,
    years_of_experience,
    verified_by_admin: false,
    documents_verified_count: 0
  },
  document_uploads: [
    {
      user_id, role: "nurse",
      document_type: "government_id",
      verification_status: "pending"
    },
    {
      user_id, role: "nurse",
      document_type: "annual_license",
      verification_status: "pending"
    },
    {
      user_id, role: "nurse",
      document_type: "nursing_degree",
      verification_status: "pending"
    }
  ],
  wallets:
  {
    profile_id,
    balance: 0,
    currency: "NGN"
  }
}
```

---

## 📈 Scalability Considerations

```
┌──────────────────────────────────────┐
│      CURRENT ARCHITECTURE            │
│      (Production Ready)              │
└──────────────────────────────────────┘

Frontend:
├─ Deployed on Vercel
├─ Auto-scaling
├─ CDN globally distributed
└─ Can handle 100k+ concurrent

Backend (Serverless):
├─ Next.js API routes
├─ Vercel Functions
├─ Auto-scaling
└─ Unlimited concurrent requests

Database:
├─ Supabase PostgreSQL
├─ Connection pooling
├─ 20+ indexes for performance
└─ Backup & replication

Storage:
├─ Supabase Storage
├─ CDN enabled
├─ Unlimited file storage
└─ Auto-backup

Automation:
├─ n8n Cloud
├─ Can queue 1000+ workflows
├─ Auto-retry on failure
└─ Full audit trail

SCALING UP:
──────────
1. Supabase: Upgrade to Pro plan
2. Vercel: Enable automatic scaling
3. n8n: Upgrade to higher tier
4. Add caching layer (Redis)
5. Add search engine (Elasticsearch)
6. Add CDN for assets (Cloudflare)
7. Add monitoring (Sentry, Datadog)
```

---

## 🎯 Service Dependencies

```
EMERGENCY ECHO DEPENDENCIES:
──────────────────────────────

Primary (Required):
├─ Supabase (Database, Auth, Storage)
│  └─ PostgreSQL backend
│  └─ Realtime updates
│  └─ RLS for security
│
├─ Vercel (Frontend Hosting)
│  └─ Next.js deployment
│  └─ Serverless functions
│  └─ CDN
│
└─ n8n (Automation)
   └─ Workflow engine
   └─ Email sending
   └─ Profile creation

Optional (Can be skipped for MVP):
├─ Email Service (Gmail/SendGrid/SMTP)
│  └─ Can test without it
│  └─ Use console logs instead
│
└─ Additional Services
   ├─ Payment gateway (Stripe, Flutterwave)
   ├─ SMS service (Twilio)
   ├─ Video call service (Agora, Vonage)
   └─ Analytics (Google Analytics, Mixpanel)

FALLBACK OPTIONS:
─────────────────
If Supabase is down:
└─ Can temporarily use PostgreSQL directly

If Vercel is down:
└─ Can deploy to AWS Lambda, Google Cloud, etc.

If n8n is down:
└─ Can still create accounts (profiles won't be auto-created)
└─ Emails won't send (but can still verify)

REQUIRED INTERNET:
──────────────────
├─ Frontend: Always online
├─ Backend: Always online
├─ Database: Always online
└─ n8n: Must be online when webhook fires
```

---

**Last Updated:** June 2026  
**Version:** 1.0.0

For detailed information, see [docs/implementation/IMPLEMENTATION.md](../docs/implementation/IMPLEMENTATION.md)
