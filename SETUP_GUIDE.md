# Emergency Echo - Signup & Authentication Setup Guide

## Overview
This guide covers setting up a complete signup and email confirmation flow using **Supabase** (database) + **n8n** (workflow automation) + **Next.js** (frontend).

---

## Architecture

```
Next.js Frontend (Signup Form)
         ↓
    API Route (/api/auth/signup)
         ↓
   Supabase Auth (User Creation)
         ↓
   n8n Webhook (Profile + Email)
         ↓
Supabase Database (profiles, patients, doctors, nurses, wallets)
```

---

## Prerequisites

1. **Supabase Account** - [Create here](https://app.supabase.com)
2. **n8n Instance** - Self-hosted or cloud
3. **Node.js 18+** - For Next.js
4. **Email Service** - Gmail, SendGrid, or n8n built-in email

---

## Step 1: Setup Supabase

### 1.1 Create Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Create a new project
3. Wait for project to initialize
4. Copy your project URL and API keys

### 1.2 Create Database Tables

1. Go to **SQL Editor** in Supabase dashboard
2. Click **New Query**
3. Copy the contents of `supabase/migrations/001_create_auth_tables.sql`
4. Paste into the SQL editor and run

**Tables created:**
- `profiles` - All user roles (patient, doctor, nurse, user)
- `patients` - Extended patient data
- `doctors` - Extended doctor data
- `nurses` - Extended nurse data
- `wallets` - User wallets for in-app currency
- `email_verifications` - Email verification tokens

### 1.3 Get Your Keys

1. Go to **Settings** → **API**
2. Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 2: Setup n8n Workflow

### 2.1 Install & Run n8n

**Using Docker:**
```bash
docker run -d \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  --name n8n \
  n8nio/n8n
```

**Or using npm:**
```bash
npm install -g n8n
n8n start
```

Access at `http://localhost:5678`

### 2.2 Setup Supabase Credentials in n8n

1. In n8n, go to **Credentials**
2. Create new **Supabase** credential
3. Fill in:
   - Project URL
   - API Key (service_role key)

### 2.3 Import Signup Workflow

1. Go to **Workflows**
2. Click **New**
3. Click **Import**
4. Copy the workflow JSON from the user request (the n8n workflow provided)
5. Paste and import

**Workflow steps:**
1. Webhook receives signup data
2. Generate unique Echo ID + submission key
3. Save profile to Supabase
4. Check if patient → create patient record & wallet
5. Build welcome email
6. Return success response

### 2.4 Get Webhook URL

1. Click the **Signup Webhook** node
2. Copy the webhook URL
3. This goes into `N8N_WEBHOOK_URL` in `.env.local`

---

## Step 3: Setup Next.js Frontend

### 3.1 Install Dependencies

```bash
cd frontend
npm install
npm install @supabase/supabase-js
```

### 3.2 Create .env.local

Copy `.env.local.example` to `.env.local` and fill in:

```env
# Supabase (from Step 1.3)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# n8n Webhook URLs
N8N_WEBHOOK_URL=http://localhost:5678/webhook/ee-signup
N8N_WEBHOOK_RESEND_EMAIL=http://localhost:5678/webhook/ee-resend-email
N8N_PASSWORD_RESET_WEBHOOK_URL=http://localhost:5678/webhook/ee-password-reset

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3.3 Use Signup Component

In any page, import and use the signup form:

```jsx
import SignupForm from '@/components/SignupForm';

export default function SignupPage() {
  return <SignupForm />;
}
```

---

## Step 4: Email Configuration

### Option A: Gmail (via n8n)

1. In n8n, add **Gmail** credentials
2. In n8n workflow, add **Send Email** node
3. Connect to **Build Welcome Email** node

### Option B: SendGrid (via n8n)

1. Create SendGrid API key
2. In n8n, add **SendGrid** credentials
3. Add **Send Email** node to workflow

### Option C: Custom SMTP (via n8n)

1. In n8n, add **SMTP** credentials
2. Fill in your mail server details
3. Add **Send Email** node

**Recommended:** Gmail with App Password (no 3rd party access needed)

---

## Step 5: Test the Flow

### 5.1 Start Services

```bash
# Terminal 1: Next.js frontend
cd frontend
npm run dev

# Terminal 2: n8n (if local)
n8n start
```

### 5.2 Test Signup

1. Go to `http://localhost:3000`
2. Fill signup form with:
   - Name: John Doe
   - Email: test@example.com
   - Password: testPassword123
   - Role: patient

3. Click **Sign Up**

### 5.3 Expected Flow

1. ✅ User created in Supabase Auth
2. ✅ Profile created in `profiles` table
3. ✅ Patient record created in `patients` table
4. ✅ Wallet created in `wallets` table
5. ✅ Welcome email sent
6. ✅ Response returned to frontend

---

## Database Schema Reference

### profiles
```sql
id              UUID (primary key)
user_id         UUID (unique, from auth)
email           TEXT (unique)
full_name       TEXT
role            TEXT ('patient' | 'doctor' | 'nurse' | 'user')
submission_key  TEXT (unique, Echo ID)
is_verified     BOOLEAN
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### patients
```sql
id                      UUID (primary key)
user_id                 UUID (references profiles)
submission_key          TEXT (unique)
full_name               TEXT
date_of_birth           DATE
phone_number            TEXT
address                 TEXT
blood_type              TEXT
emergency_contact_name  TEXT
emergency_contact_phone TEXT
medical_conditions      TEXT[] (array)
allergies               TEXT[] (array)
medications             TEXT[] (array)
created_at              TIMESTAMP
updated_at              TIMESTAMP
```

### doctors / nurses
Similar structure to patients with:
- license_number
- specialization / certification
- hospital_affiliation
- verified_by_admin
- license_verified_at

### wallets
```sql
id          UUID (primary key)
user_id     UUID (references profiles)
balance     DECIMAL
currency    TEXT (default 'NGN')
created_at  TIMESTAMP
updated_at  TIMESTAMP
```

### email_verifications
```sql
id                  UUID (primary key)
user_id             UUID (references profiles)
email               TEXT
verification_token  TEXT (unique)
is_verified         BOOLEAN
expires_at          TIMESTAMP (24 hours)
verified_at         TIMESTAMP
created_at          TIMESTAMP
```

---

## API Endpoints

### POST /api/auth/signup
**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "full_name": "John Doe",
  "role": "patient"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Signup successful. Please check your email.",
  "user_id": "uuid",
  "email": "user@example.com",
  "role": "patient"
}
```

### POST /api/auth/verify-email
**Request:**
```json
{
  "token": "ee_verification_token_here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

### POST /api/auth/resend-verification
**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification email sent. Please check your inbox."
}
```

---

## Troubleshooting

### "N8N webhook failed"
- Check n8n is running: `http://localhost:5678`
- Verify webhook URL in `.env.local`
- Check n8n Supabase credentials

### "Email not sent"
- Verify email service configured in n8n
- Check email node credentials
- Review n8n execution logs

### "Profile not created"
- Check Supabase credentials in n8n
- Verify table exists: run SQL migration again
- Check user_id format matches

### "User already exists"
- Email must be unique in Supabase Auth
- Try different email address

---

## Next Steps

1. **Extend roles** - Add custom fields to doctor/nurse tables
2. **Email templates** - Create branded emails in n8n
3. **Admin verification** - Add license verification flow for doctors/nurses
4. **Profile completion** - Add wizard to complete patient/doctor profiles
5. **2FA** - Add two-factor authentication to profiles

---

## Security Checklist

- ✅ Use `service_role_key` only on backend (API routes)
- ✅ Never expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code
- ✅ Enable RLS policies on all tables
- ✅ Validate all inputs on backend
- ✅ Use HTTPS in production
- ✅ Keep n8n webhook URL secret
- ✅ Store `.env.local` in `.gitignore`

---

## Support Resources

- [Supabase Docs](https://supabase.com/docs)
- [n8n Docs](https://docs.n8n.io)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
