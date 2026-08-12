# EMERGENCY ECHO
## Complete Role-Based Healthcare Platform with n8n & Supabase

**Version:** 1.0.0  
**Status:** Production Ready  
**Last Updated:** June 2026

---

## 🏥 What is Emergency Echo?

Emergency Echo is a comprehensive healthcare platform that enables:
- **Patients** to find and consult with doctors and nurses
- **Doctors** to register, verify credentials, and offer consultations
- **Nurses** to register and provide nursing services
- **Partners** to manage the platform and verify professionals
- **Admins** to review and approve healthcare credentials

---

## ✨ Key Features

✅ **Multi-Role User System**
- 5 roles: Patient, Doctor, Nurse, Partner, User
- Role-specific registration and data collection
- Customized UI/UX per role

✅ **Secure Authentication**
- Supabase Auth (Email + Password)
- Email verification required
- Token-based admin access
- Row-level security (RLS) policies

✅ **Document Management System**
- Healthcare professionals upload credentials
- Document storage in Supabase
- Admin verification dashboard
- Approval/rejection workflow

✅ **Automated Workflows**
- n8n integration for automation
- Auto email notifications
- Profile creation automation
- Wallet initialization

✅ **Professional Verification**
- 4 documents for doctors
- 3 documents for nurses
- Admin approval required
- Verification status tracking

✅ **Financial Management**
- Wallet system (NGN currency)
- Balance tracking
- Transaction history

---

## 🎯 Quick Navigation

### 📖 Complete Documentation
👉 **[START HERE: docs/INDEX.md](docs/INDEX.md)** - Complete documentation index

### 📚 Key Documents
- **[docs/implementation/IMPLEMENTATION.md](docs/implementation/IMPLEMENTATION.md)** - Full step-by-step setup (30min-2hrs)
- **[docs/api-reference/ENDPOINTS.md](docs/api-reference/ENDPOINTS.md)** - All API endpoints with examples
- **[docs/frontend/COMPONENTS.md](docs/frontend/COMPONENTS.md)** - React components guide
- **[docs/workflows/N8N_SETUP.md](docs/workflows/N8N_SETUP.md)** - n8n workflow configuration
- **[docs/sql/](docs/sql/)** - SQL migrations and schema

---

## 🚀 Quick Start (30 minutes)

### Prerequisites
- Node.js 18+
- Supabase account (free tier OK)
- npm or yarn

### Step 1: Clone & Install
```bash
cd EMERGENCY_ECHO
cd frontend
npm install
```

### Step 2: Setup Supabase
1. Go to https://supabase.com
2. Create new project
3. Create "documents" storage bucket (Private)
4. Copy API keys

### Step 3: Configure Environment
```bash
cp .env.local.example .env.local
# Edit .env.local with your Supabase keys
```

### Step 4: Create Database
1. Go to Supabase SQL Editor
2. Run: `supabase/migrations/001_create_auth_tables.sql`
3. Run: `supabase/migrations/002_add_document_uploads.sql`

### Step 5: Start Development
```bash
npm run dev
# Open http://localhost:3000
```

**Full detailed setup:** See [IMPLEMENTATION.md](docs/implementation/IMPLEMENTATION.md)

---

## 📁 Project Structure

```
EMERGENCY_ECHO/
├── docs/                                    [COMPLETE DOCUMENTATION]
│   ├── INDEX.md                            👈 START HERE
│   ├── implementation/IMPLEMENTATION.md    Full setup guide
│   ├── sql/                                SQL migrations
│   ├── api-reference/ENDPOINTS.md          API documentation
│   ├── frontend/COMPONENTS.md              Component guide
│   └── workflows/N8N_SETUP.md              Workflow guide
│
├── frontend/                                [NEXT.JS APPLICATION]
│   ├── src/
│   │   ├── pages/api/                      API routes (7 endpoints)
│   │   │   ├── auth/                       Authentication
│   │   │   ├── documents/                  Document management
│   │   │   └── profile/                    Profile completion
│   │   ├── components/                     React components
│   │   │   ├── SignupForm.jsx              Multi-role signup
│   │   │   └── DocumentUpload.jsx          File upload interface
│   │   └── pages/
│   │       ├── admin/                      Admin dashboard
│   │       ├── verify-email.jsx            Email verification
│   │       └── [...slug].jsx               Dynamic pages
│   ├── .env.local                          Configuration
│   ├── package.json                        Dependencies
│   └── next.config.mjs                     Next.js config
│
├── supabase/
│   └── migrations/                         Database schemas
│       ├── 001_create_auth_tables.sql      Base auth tables
│       └── 002_add_document_uploads.sql    Document system
│
├── n8n-workflows/                          Automation
│   └── complete-signup-all-roles.json      Signup workflow
│
├── README.md                                This file
├── REDESIGN_NOTES.md                       Project notes
└── [other config files]
```

---

## 🛠️ Technology Stack

### Frontend
- **Next.js 16.2.6** - React framework
- **React 19** - UI library
- **styled-components 6.3.9** - CSS-in-JS
- **Supabase JS Client** - Backend integration

### Backend (Serverless)
- **Next.js API Routes** - Serverless endpoints
- **Supabase PostgreSQL** - Database
- **Supabase Storage** - File storage
- **Supabase Auth** - Authentication

### Automation
- **n8n** - Workflow automation
- **Email Service** - Gmail/SendGrid/SMTP

### Infrastructure
- **Vercel** - Frontend deployment
- **Supabase Cloud** - Database & storage
- **n8n Cloud** - Workflow hosting

---

## 📊 Database Schema

### Tables (8 total)
1. **profiles** - Base user information
2. **patients** - Patient-specific data
3. **doctors** - Doctor credentials & specialization
4. **nurses** - Nurse credentials
5. **partners** - Business partner info
6. **wallets** - Financial accounts
7. **email_verifications** - Email tokens
8. **document_uploads** - Document tracking

### Features
- **20+ Indexes** for performance
- **RLS Policies** for security
- **Automatic Timestamps** for audit trail
- **Referential Integrity** with foreign keys

---

## 🔌 API Endpoints

### Authentication (3 endpoints)
- `POST /api/auth/signup-all-roles` - Create account
- `POST /api/auth/verify-email` - Confirm email
- `POST /api/auth/resend-verification` - Resend token

### Documents (3 endpoints)
- `POST /api/documents/upload` - Upload credentials
- `GET /api/documents/list` - List for admin review
- `POST /api/documents/verify` - Approve/reject

### Profile (1 endpoint)
- `POST /api/profile/complete-profile` - Add role-specific data

**Full documentation:** [ENDPOINTS.md](docs/api-reference/ENDPOINTS.md)

---

## 👥 User Roles

| Role | Purpose | Features | Documents |
|------|---------|----------|-----------|
| **Patient** | Seek healthcare | Find doctors/nurses, book consultations | ❌ |
| **Doctor** | Provide consultations | Register, upload credentials, accept patients | ✅ 4 docs |
| **Nurse** | Provide nursing care | Register, upload credentials, accept assignments | ✅ 3 docs |
| **Partner** | Manage business | Admin access, verify documents | ❌ |
| **User** | General account | Basic account | ❌ |

---

## 📋 Document Types

### For Doctors (4 Required)
1. Government ID (National ID, Passport, or Driver's License)
2. Annual License (MDCN Annual Practicing License)
3. Medical Degree (Bachelor's Degree Certificate)
4. Registration Certificate (Medical Council Registration)

### For Nurses (3 Required)
1. Government ID
2. Annual License (NMCN)
3. Nursing Degree Certificate

---

## 🔐 Security Features

✅ **Authentication**
- Supabase Auth with email/password
- Email verification required
- Token-based sessions

✅ **Authorization**
- Row-level security (RLS) on all tables
- Role-based access control
- Admin token validation

✅ **Data Protection**
- Private storage bucket for documents
- Service role key backend-only
- File type & size validation
- Input validation on all endpoints

✅ **Audit Trail**
- Timestamps on all records
- Verification tracking
- Admin action logging

---

## 🧪 Testing

### Manual Testing
See [IMPLEMENTATION.md - Testing & Validation](docs/implementation/IMPLEMENTATION.md#testing--validation)

### Test Users
```
Patient:  patient@test.com / Test@123456
Doctor:   doctor@test.com / Test@123456
Nurse:    nurse@test.com / Test@123456
```

### Testing Flows
1. Signup as each role
2. Verify email
3. Complete profile
4. Upload documents (for doctor/nurse)
5. Admin review & approval

---

## 🚀 Deployment

### Frontend (Vercel)
```bash
npm run build
# Deploy to Vercel
```

### Database (Supabase)
- Already hosted in cloud
- Automatic backups
- Connection pooling

### n8n (Hosted)
- Use n8n Cloud or self-host
- Configure webhook URL
- Activate workflow

**Full deployment guide:** [IMPLEMENTATION.md - Deployment Checklist](docs/implementation/IMPLEMENTATION.md#deployment-checklist)

---

## 📞 Support

### Documentation
- **[docs/INDEX.md](docs/INDEX.md)** - Documentation index
- **[docs/implementation/IMPLEMENTATION.md](docs/implementation/IMPLEMENTATION.md)** - Complete setup
- **[docs/api-reference/ENDPOINTS.md](docs/api-reference/ENDPOINTS.md)** - API reference
- **[docs/frontend/COMPONENTS.md](docs/frontend/COMPONENTS.md)** - Components guide

### Troubleshooting
See [IMPLEMENTATION.md - Troubleshooting](docs/implementation/IMPLEMENTATION.md#troubleshooting)

### External Resources
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [n8n Documentation](https://docs.n8n.io)

---

## 🎓 Learning Resources

### For Different Roles

**Frontend Developers:**
1. Start: [docs/frontend/COMPONENTS.md](docs/frontend/COMPONENTS.md)
2. Then: [docs/api-reference/ENDPOINTS.md](docs/api-reference/ENDPOINTS.md)
3. Finally: [docs/implementation/IMPLEMENTATION.md](docs/implementation/IMPLEMENTATION.md)

**Backend/Full-Stack:**
1. Start: [docs/implementation/IMPLEMENTATION.md](docs/implementation/IMPLEMENTATION.md)
2. Then: [docs/sql/](docs/sql/) - Database
3. Then: [docs/api-reference/ENDPOINTS.md](docs/api-reference/ENDPOINTS.md)
4. Finally: [docs/workflows/N8N_SETUP.md](docs/workflows/N8N_SETUP.md)

**Database Engineers:**
1. Start: [docs/sql/001_create_auth_tables.sql](docs/sql/001_create_auth_tables.sql)
2. Then: [docs/sql/002_add_document_uploads.sql](docs/sql/002_add_document_uploads.sql)

---

## 📈 Project Metrics

- **8** Database tables
- **20+** Indexes
- **7** API endpoints
- **3** React components
- **2** SQL migrations
- **12** n8n workflow nodes
- **~100** Pages of documentation
- **50+** Code examples

---

## ✅ Implementation Status

### Completed ✅
- [x] Database schema with RLS
- [x] User authentication system
- [x] Multi-role registration
- [x] Email verification flow
- [x] Document upload system
- [x] Document verification workflow
- [x] Admin dashboard
- [x] Profile completion
- [x] Wallet system
- [x] n8n automation
- [x] Complete documentation

### Ready for Development
- [x] Frontend components
- [x] API endpoints
- [x] Database migrations
- [x] Environment configuration

### Optional Enhancements
- [ ] Payment processing
- [ ] Video consultations
- [ ] Appointment scheduling
- [ ] Medical records
- [ ] Prescription management
- [ ] Insurance integration
- [ ] Mobile app
- [ ] Analytics dashboard

---

## 🎯 Next Steps

1. **[Read the documentation index](docs/INDEX.md)**
2. **[Follow the implementation guide](docs/implementation/IMPLEMENTATION.md)**
3. **Setup Supabase and database**
4. **Configure environment variables**
5. **Start the development server**
6. **Test the complete signup flow**
7. **Deploy to production**

---

## 📄 License

Emergency Echo - Healthcare Platform  
Version 1.0.0 - June 2026

---

## 👥 Support & Community

For questions or issues:
1. Check [docs/INDEX.md](docs/INDEX.md) for documentation
2. Review [docs/implementation/IMPLEMENTATION.md#troubleshooting](docs/implementation/IMPLEMENTATION.md#troubleshooting)
3. Check environment configuration
4. Review browser console errors
5. Check terminal logs

---

## 🎉 Getting Started

**👉 [Start with docs/INDEX.md](docs/INDEX.md)**

Everything you need is documented in the `docs/` folder:
- Complete implementation guide
- API endpoint reference  
- Frontend components guide
- SQL schemas
- n8n workflow setup

---

**Last Updated:** June 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

🚀 **Ready to build?** Start with [docs/implementation/IMPLEMENTATION.md](docs/implementation/IMPLEMENTATION.md)
