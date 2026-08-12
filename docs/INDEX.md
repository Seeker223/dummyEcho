# DOCUMENTATION INDEX & QUICK REFERENCE
## Emergency Echo - Complete Implementation Guide

**Project:** Emergency Echo  
**Version:** 1.0.0  
**Last Updated:** June 2026  
**Status:** Production Ready

---

## 📚 Documentation Structure

```
docs/
├── implementation/
│   └── IMPLEMENTATION.md          [START HERE] Complete setup guide
├── sql/
│   ├── 001_create_auth_tables.sql    Database schema & auth
│   ├── 002_add_document_uploads.sql  Document system schema
│   └── storage-rls.sql               Storage bucket policies
├── api-reference/
│   └── ENDPOINTS.md                  All API endpoint documentation
├── workflows/
│   └── N8N_SETUP.md                  n8n workflow configuration
├── frontend/
│   └── COMPONENTS.md                 React components guide
└── INDEX.md                          This file
```

---

## 🚀 Quick Start (Choose Your Path)

### Path A: I want to get started in 30 minutes
1. Read [IMPLEMENTATION.md - Quick Start Section](implementation/IMPLEMENTATION.md#quick-start-30-minutes)
2. Follow the 5-step setup
3. Test locally at `http://localhost:3000`

### Path B: I want detailed setup with explanations
1. Read [IMPLEMENTATION.md - Architecture Overview](implementation/IMPLEMENTATION.md#architecture-overview)
2. Follow [Phase 1-6 Implementation](implementation/IMPLEMENTATION.md#step-by-step-implementation)
3. Reference specific docs as needed

### Path C: I'm implementing a specific component
1. For **API**: See [ENDPOINTS.md](api-reference/ENDPOINTS.md)
2. For **Frontend**: See [COMPONENTS.md](frontend/COMPONENTS.md)
3. For **Database**: See [SQL files](sql/)
4. For **Workflows**: See [N8N_SETUP.md](workflows/N8N_SETUP.md)

---

## 📖 Documentation Map

### Core Documentation

| Document | Purpose | Read Time | Who Should Read |
|----------|---------|-----------|-----------------|
| [IMPLEMENTATION.md](implementation/IMPLEMENTATION.md) | Complete setup guide with all phases | 30 min | Everyone (START HERE) |
| [ENDPOINTS.md](api-reference/ENDPOINTS.md) | API endpoint reference & examples | 20 min | Developers, QA, Frontend devs |
| [N8N_SETUP.md](workflows/N8N_SETUP.md) | n8n workflow configuration | 15 min | Backend/automation devs |
| [COMPONENTS.md](frontend/COMPONENTS.md) | React components & usage | 25 min | Frontend developers |

### SQL Documentation

| File | Purpose | Tables | Indexes |
|------|---------|--------|---------|
| [001_create_auth_tables.sql](sql/001_create_auth_tables.sql) | User authentication schema | 7 tables | 14 indexes |
| [002_add_document_uploads.sql](sql/002_add_document_uploads.sql) | Document upload system | 1 new table | 6 indexes |
| [storage-rls.sql](sql/storage-rls.sql) | Storage bucket security | - | RLS policies |

---

## 🎯 Implementation Checklist

### Phase 1: Supabase Setup (30 min)
- [ ] Create Supabase project
- [ ] Create "documents" storage bucket
- [ ] Copy API keys to `.env.local`
- [ ] Enable RLS on storage bucket

### Phase 2: Database Schema (20 min)
- [ ] Run `001_create_auth_tables.sql`
- [ ] Run `002_add_document_uploads.sql`
- [ ] Verify tables created (8 total)
- [ ] Verify indexes created (20 total)

### Phase 3: Frontend Setup (15 min)
- [ ] Install dependencies: `npm install formidable @supabase/supabase-js`
- [ ] Create `.env.local` from `.env.local.example`
- [ ] Fill in all environment variables
- [ ] Run `npm run dev` and verify http://localhost:3000

### Phase 4: API Routes (30 min)
- [ ] Signup endpoint: `/api/auth/signup-all-roles.js`
- [ ] Email verification: `/api/auth/verify-email.js`
- [ ] Resend verification: `/api/auth/resend-verification.js`
- [ ] Document upload: `/api/documents/upload.js`
- [ ] Document listing: `/api/documents/list.js`
- [ ] Document verification: `/api/documents/verify.js`
- [ ] Profile completion: `/api/profile/complete-profile.js`

### Phase 5: Frontend Components (20 min)
- [ ] SignupForm component
- [ ] DocumentUpload component
- [ ] Admin dashboard component
- [ ] Email verification page

### Phase 6: n8n Workflow (30 min)
- [ ] Setup n8n instance (or use n8n Cloud)
- [ ] Create Supabase credential
- [ ] Import workflow
- [ ] Configure email service
- [ ] Activate workflow

### Testing & Validation
- [ ] Test signup flow for each role
- [ ] Test email verification
- [ ] Test document upload
- [ ] Test admin approval
- [ ] Check database records
- [ ] Verify email sending

---

## 🔧 Common Tasks

### Add a New User Role

**Files to modify:**
1. Database schema (add role table)
2. API endpoint (add role validation)
3. n8n workflow (add role check)
4. Frontend (add form fields)

**Steps:**
1. Edit [001_create_auth_tables.sql](sql/001_create_auth_tables.sql)
2. Add role check in [signup-all-roles.js](../frontend/src/pages/api/auth/signup-all-roles.js)
3. Add role handler in n8n workflow
4. Update SignupForm with new fields

### Add Document Type

**Files to modify:**
1. DocumentUpload component
2. Database schema (if new table needed)

**Steps:**
1. Add to `documentTypesConfig` in [DocumentUpload.jsx](../frontend/src/components/DocumentUpload.jsx)
2. Update document upload validation

### Setup Email Service

**Steps:**
1. Choose service: Gmail, SendGrid, or SMTP
2. Configure in n8n workflow email node
3. Test email sending
4. Update from address in workflow

See [N8N_SETUP.md - Email Configuration](workflows/N8N_SETUP.md#email-configuration)

### Enable Admin Verification

**Required environment variables:**
```env
ADMIN_VERIFICATION_TOKEN=your-secure-token
NEXT_PUBLIC_ADMIN_TOKEN=your-secure-token
```

**Steps:**
1. Generate secure random token
2. Add to `.env.local`
3. Visit `/admin/document-verification`
4. Documents should load

---

## 📋 Data Structures Reference

### User Roles (5 Total)

| Role | Base Fields | Role-Specific Fields | Requires Documents |
|------|-------------|---------------------|-------------------|
| Patient | email, password, name | DOB, gender, blood_type, medical_history | No |
| Doctor | email, password, name | License, specialization, credentials | Yes (4 docs) |
| Nurse | email, password, name | License, specialization | Yes (3 docs) |
| Partner | email, password, name | Company, business type | No |
| User | email, password, name | - | No |

### Document Types by Role

**Doctor (4 Required):**
- government_id
- annual_license
- medical_degree
- registration_certificate

**Nurse (3 Required):**
- government_id
- annual_license
- nursing_degree

---

## 🔐 Security Configuration

### Environment Variables (REQUIRED)

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=anon-key
SUPABASE_SERVICE_ROLE_KEY=service-role-key

# n8n (Optional)
N8N_WEBHOOK_URL=https://n8n.cloud/webhook/xxxxx

# Admin (Required)
ADMIN_VERIFICATION_TOKEN=secure-random-token
NEXT_PUBLIC_ADMIN_TOKEN=secure-random-token
```

### Security Policies

- ✅ All user data protected by RLS
- ✅ Documents in private storage bucket
- ✅ Admin endpoints require token
- ✅ File uploads validated (type + size)
- ✅ Email verification required
- ✅ Service role key in backend only

---

## 🧪 Testing Samples

### Test Signup - Patient
```bash
curl -X POST http://localhost:3000/api/auth/signup-all-roles \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@test.com",
    "password": "Test@123456",
    "full_name": "Test Patient",
    "role": "patient"
  }'
```

### Test Signup - Doctor
```bash
curl -X POST http://localhost:3000/api/auth/signup-all-roles \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@test.com",
    "password": "Test@123456",
    "full_name": "Dr. Test",
    "role": "doctor",
    "specialization": "Cardiology",
    "license_number": "MDCN/2024/TEST001"
  }'
```

### Test Document Upload
```bash
curl -X POST http://localhost:3000/api/documents/upload \
  -F "file=@document.pdf" \
  -F "user_id=550e8400-e29b-41d4-a716-446655440000" \
  -F "role=doctor" \
  -F "document_type=government_id"
```

See [ENDPOINTS.md - Testing with cURL](api-reference/ENDPOINTS.md#testing-with-curl) for more examples.

---

## 📊 File Structure

```
EMERGENCY_ECHO/
├── docs/                           [ALL DOCUMENTATION]
│   ├── implementation/
│   │   └── IMPLEMENTATION.md       [START HERE]
│   ├── sql/
│   │   ├── 001_create_auth_tables.sql
│   │   ├── 002_add_document_uploads.sql
│   │   └── storage-rls.sql
│   ├── api-reference/
│   │   └── ENDPOINTS.md
│   ├── workflows/
│   │   └── N8N_SETUP.md
│   └── frontend/
│       └── COMPONENTS.md
│
├── supabase/
│   └── migrations/
│       ├── 001_create_auth_tables.sql
│       └── 002_add_document_uploads.sql
│
├── frontend/                       [NEXT.JS APP]
│   ├── src/
│   │   ├── pages/
│   │   │   ├── api/
│   │   │   │   ├── auth/
│   │   │   │   ├── documents/
│   │   │   │   └── profile/
│   │   │   ├── admin/
│   │   │   ├── verify-email.jsx
│   │   │   └── [[...slug]].jsx
│   │   └── components/
│   │       ├── SignupForm.jsx
│   │       └── DocumentUpload.jsx
│   └── .env.local
│
├── n8n-workflows/
│   └── complete-signup-all-roles.json
│
└── README.md
```

---

## 🎓 Learning Path

### For Frontend Developers
1. Start: [COMPONENTS.md](frontend/COMPONENTS.md)
2. Then: [ENDPOINTS.md](api-reference/ENDPOINTS.md) - API reference
3. Then: [IMPLEMENTATION.md](implementation/IMPLEMENTATION.md) - Full context

### For Backend/Full-Stack Developers
1. Start: [IMPLEMENTATION.md](implementation/IMPLEMENTATION.md)
2. Then: [001_create_auth_tables.sql](sql/001_create_auth_tables.sql) - Database
3. Then: [ENDPOINTS.md](api-reference/ENDPOINTS.md) - API design
4. Then: [N8N_SETUP.md](workflows/N8N_SETUP.md) - Automation

### For Database Engineers
1. Start: [001_create_auth_tables.sql](sql/001_create_auth_tables.sql)
2. Then: [002_add_document_uploads.sql](sql/002_add_document_uploads.sql)
3. Then: [IMPLEMENTATION.md - Database Setup](implementation/IMPLEMENTATION.md#database-setup-supabase)

### For DevOps/Deployment
1. Start: [IMPLEMENTATION.md - Deployment Checklist](implementation/IMPLEMENTATION.md#deployment-checklist)
2. Then: [IMPLEMENTATION.md - Environment Configuration](implementation/IMPLEMENTATION.md#environment-configuration)

---

## 🐛 Troubleshooting

### Issue: "formidable" module not found
```bash
npm install formidable
```
See [IMPLEMENTATION.md Phase 3](implementation/IMPLEMENTATION.md#phase-3-frontend-setup-15-minutes)

### Issue: Supabase connection failed
Check `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`  
See [IMPLEMENTATION.md Phase 1](implementation/IMPLEMENTATION.md#phase-1-supabase-setup-30-minutes)

### Issue: Document upload fails
- Check file size (max 10MB)
- Check file type (PDF, DOC, JPG, PNG)
- Verify "documents" bucket exists and is Private
- Check RLS policies enabled

### Issue: n8n workflow not triggering
- Verify webhook URL in `.env.local`
- Check workflow is activated (toggle on)
- Test webhook with curl
- Check n8n logs for errors

See [IMPLEMENTATION.md - Troubleshooting](implementation/IMPLEMENTATION.md#troubleshooting) for more.

---

## 📞 Support Resources

### Official Documentation
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [n8n Docs](https://docs.n8n.io)
- [PostgreSQL Docs](https://www.postgresql.org/docs)

### Project Documentation (In This Folder)
- [IMPLEMENTATION.md](implementation/IMPLEMENTATION.md) - Complete setup
- [ENDPOINTS.md](api-reference/ENDPOINTS.md) - API reference
- [COMPONENTS.md](frontend/COMPONENTS.md) - Frontend guide
- [N8N_SETUP.md](workflows/N8N_SETUP.md) - Workflow guide

### Getting Help
1. Check relevant documentation file
2. Check troubleshooting section
3. Review error messages carefully
4. Check logs (browser console for frontend, terminal for backend)
5. Verify environment configuration

---

## 📝 Document Conventions

### Code Examples
```bash
# Bash commands
npm install package-name
```

```javascript
// JavaScript/JSX code
const example = "code";
```

```json
// JSON responses
{ "key": "value" }
```

```sql
-- SQL queries
SELECT * FROM table;
```

### Links
- **Internal**: `[Text](path/to/doc.md)`
- **Sections**: `[Text](doc.md#section-name)`
- **External**: `[Text](https://example.com)`

---

## 🎯 Key Concepts

### Authentication Flow
```
User Signup → Supabase Auth → n8n Webhook → Profile Created → Email Sent → User Verifies Email
```

### Document Verification Flow
```
User Uploads Doc → Supabase Storage → Database Record → Admin Reviews → Approval/Rejection → Professional Verified
```

### Role-Based Architecture
```
Profiles (Base) → Patient/Doctor/Nurse/Partner/User (Role-Specific) → Documents/Wallet (Related Data)
```

---

## ✅ Verification Checklist (After Setup)

- [ ] All 8 database tables created
- [ ] All 20+ indexes created
- [ ] API endpoints respond without errors
- [ ] Can signup as each role
- [ ] Email verification token works
- [ ] Can upload documents
- [ ] Admin can review documents
- [ ] Storage bucket has files
- [ ] n8n workflow fires on signup
- [ ] Emails send successfully
- [ ] No console errors
- [ ] RLS policies working
- [ ] Environment variables set

---

## 🚀 Next Steps

### After Initial Setup
1. ✅ Complete all checklists
2. ✅ Run integration tests
3. ✅ Test all user roles
4. ✅ Verify email delivery
5. 📧 Setup monitoring
6. 📊 Setup analytics
7. 🔐 Enable rate limiting
8. 📱 Add mobile app support

### Enhancements
- Add user roles/permissions system
- Add payment processing
- Add video consultations
- Add appointment scheduling
- Add medical records storage
- Add prescription management
- Add prescription delivery
- Add health insurance integration

---

## 📄 License & Attribution

Emergency Echo - Healthcare Platform  
Version 1.0.0, June 2026

---

## 📚 Documentation Metadata

| Property | Value |
|----------|-------|
| Total Documentation | 7 files |
| Total Pages | ~100 pages |
| Code Examples | 50+ |
| Tables Created | 8 |
| API Endpoints | 7 |
| React Components | 3+ |
| SQL Migrations | 2 |
| n8n Workflow Nodes | 12 |

---

**Last Updated:** June 2026  
**Version:** 1.0.0  
**Status:** Complete & Production Ready

👉 **START HERE:** [IMPLEMENTATION.md](implementation/IMPLEMENTATION.md)
