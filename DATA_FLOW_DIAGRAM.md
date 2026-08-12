# Complete Data Flow - Frontend to Supabase via n8n

## Overview
This document shows exactly what data flows from the Vercel frontend through n8n to Supabase for each user role.

---

## 1. PATIENT DATA FLOW

### Stage 1: Initial Signup (Frontend → API Route)
```json
POST /api/auth/signup-all-roles
{
  "email": "patient@example.com",
  "password": "securePassword123",
  "full_name": "John Doe",
  "username": "johndoe",
  "title": "Mr.",
  "state": "Lagos",
  "role": "patient",
  "age": 35,
  "phone_number": "+2348012345678",
  "gender": "male",
  "blood_type": "O+",
  "genotype": "AA"
}
```

### Stage 2: API Creates Auth User & Calls n8n
```
Supabase Auth (Backend)
↓ (creates user)
Auth User: {
  id: "uuid-12345",
  email: "patient@example.com",
  email_confirmed: false,
  user_metadata: {
    full_name: "John Doe",
    role: "patient",
    username: "johndoe",
    title: "Mr."
  }
}
↓ (calls webhook)
```

### Stage 3: n8n Webhook Receives Full Data
```json
POST http://localhost:5678/webhook/ee-signup
{
  "user_id": "uuid-12345",
  "email": "patient@example.com",
  "full_name": "John Doe",
  "username": "johndoe",
  "title": "Mr.",
  "state": "Lagos",
  "role": "patient",
  "age": 35,
  "phone_number": "+2348012345678",
  "gender": "male",
  "blood_type": "O+",
  "genotype": "AA"
}
```

### Stage 4: n8n Processes Data
```
Build Base Profile Data (Node 2)
↓ Generates:
{
  user_id: "uuid-12345",
  email: "patient@example.com",
  full_name: "John Doe",
  username: "johndoe",
  title: "Mr.",
  state: "Lagos",
  role: "patient",
  submission_key: "EE_abc123def456...",
  created_at: "2024-06-01T10:30:00Z",
  echo_id: "EE_abc123def456..."
}
↓
Save Base Profile → profiles table
↓
Check Role: Is Patient? → YES
↓
Build Patient Medical Kit Data (transforms incoming data)
↓
Save to patients table
```

### Stage 5: Data Saved to Supabase

#### profiles table
```sql
INSERT INTO profiles VALUES (
  id: "generated-uuid",
  user_id: "uuid-12345",
  email: "patient@example.com",
  full_name: "John Doe",
  username: "johndoe",
  title: "Mr.",
  state: "Lagos",
  role: "patient",
  submission_key: "EE_abc123def456...",
  is_verified: false,
  created_at: "2024-06-01T10:30:00Z",
  updated_at: "2024-06-01T10:30:00Z"
)
```

#### patients table
```sql
INSERT INTO patients VALUES (
  id: "generated-uuid",
  user_id: "uuid-12345",
  submission_key: "EE_abc123def456...",
  full_name: "John Doe",
  age: 35,
  date_of_birth: null,
  phone_number: "+2348012345678",
  gender: "male",
  blood_type: "O+",
  genotype: "AA",
  emergency_contact_name: null,
  emergency_contact_phone: null,
  language_preference: "english",
  medical_conditions: [],
  chronic_conditions: [],
  past_surgeries: [],
  previous_hospitalizations: [],
  medications: [],
  drug_allergies: [],
  food_allergies: [],
  other_allergies: [],
  vaccinations: [],
  mental_health_history: null,
  current_mental_health_status: null,
  cognitive_issues: [],
  family_genetic_conditions: [],
  inherited_diseases: [],
  smoking_status: null,
  alcohol_consumption: null,
  diet_type: null,
  exercise_frequency: null,
  occupation: null,
  assistive_devices: [],
  -- Female-specific (cleared for males)
  is_pregnant: null,
  pregnancy_trimester: null,
  obstetric_history: null,
  number_of_children: null,
  menstruation_status: null,
  menstrual_cycle_days: null,
  contraception_method: null,
  contraception_duration: null,
  created_at: "2024-06-01T10:30:00Z",
  updated_at: "2024-06-01T10:30:00Z"
)
```

#### wallets table
```sql
INSERT INTO wallets VALUES (
  id: "generated-uuid",
  user_id: "uuid-12345",
  balance: 0,
  currency: "NGN",
  created_at: "2024-06-01T10:30:00Z",
  updated_at: "2024-06-01T10:30:00Z"
)
```

### Stage 6: Response to Frontend
```json
{
  "success": true,
  "message": "Patient signup successful. Please check your email to verify your account.",
  "user_id": "uuid-12345",
  "echo_id": "EE_abc123def456...",
  "email": "patient@example.com",
  "role": "patient"
}
```

### Stage 7: Complete Medical Kit Update (Later)
```json
POST /api/profile/complete-profile
{
  "user_id": "uuid-12345",
  "role": "patient",
  "profile_data": {
    "age": 35,
    "date_of_birth": "1989-05-15",
    "phone_number": "+2348012345678",
    "gender": "male",
    "blood_type": "O+",
    "genotype": "AA",
    "emergency_contact_name": "Jane Doe",
    "emergency_contact_phone": "+2348087654321",
    "language_preference": "english",
    "medical_conditions": ["Diabetes Type 2", "Hypertension"],
    "chronic_conditions": ["Asthma"],
    "past_surgeries": ["Appendectomy 2015"],
    "previous_hospitalizations": ["Malaria 2023"],
    "medications": [
      {"name": "Metformin", "dosage": "500mg", "frequency": "twice daily"},
      {"name": "Lisinopril", "dosage": "10mg", "frequency": "once daily"}
    ],
    "drug_allergies": ["Penicillin"],
    "food_allergies": ["Shellfish"],
    "other_allergies": ["Latex"],
    "vaccinations": [
      {"vaccine_type": "COVID-19", "date": "2024-01-15", "status": "completed"}
    ],
    "mental_health_history": "No major issues",
    "current_mental_health_status": "stable",
    "family_genetic_conditions": ["Sickle Cell Trait"],
    "smoking_status": "never",
    "alcohol_consumption": "occasional",
    "diet_type": "omnivore",
    "exercise_frequency": 3,
    "occupation": "Software Engineer",
    "pets": ["Dog"]
  }
}
```

---

## 2. DOCTOR DATA FLOW

### Stage 1: Signup
```json
POST /api/auth/signup-all-roles
{
  "email": "dr.smith@example.com",
  "password": "securePassword123",
  "full_name": "Dr. Smith Johnson",
  "username": "drsmith",
  "title": "Dr.",
  "state": "Lagos",
  "role": "doctor",
  "license_id": "MDCN/2024/12345",
  "specialization": "Emergency Medicine",
  "phone_number": "+2348012345678"
}
```

### Stage 2: n8n Webhook
```json
{
  "user_id": "uuid-67890",
  "email": "dr.smith@example.com",
  "full_name": "Dr. Smith Johnson",
  "username": "drsmith",
  "title": "Dr.",
  "state": "Lagos",
  "role": "doctor",
  "license_id": "MDCN/2024/12345",
  "specialization": "Emergency Medicine",
  "phone_number": "+2348012345678"
}
```

### Stage 3: Saved to Supabase

#### profiles table
```sql
INSERT INTO profiles VALUES (
  user_id: "uuid-67890",
  email: "dr.smith@example.com",
  full_name: "Dr. Smith Johnson",
  username: "drsmith",
  title: "Dr.",
  state: "Lagos",
  role: "doctor",
  submission_key: "EE_xyz789abc456...",
  is_verified: false
)
```

#### doctors table
```sql
INSERT INTO doctors VALUES (
  user_id: "uuid-67890",
  submission_key: "EE_xyz789abc456...",
  full_name: "Dr. Smith Johnson",
  license_number: "MDCN/2024/12345",
  specialization: "Emergency Medicine",
  state: "Lagos",
  phone_number: "+2348012345678",
  hospital_affiliation: null,
  years_of_experience: null,
  government_id: null,
  government_id_status: "pending",
  annual_license: null,
  annual_license_status: "pending",
  medical_degree: null,
  medical_degree_status: "pending",
  registration_certificate: null,
  registration_certificate_status: "pending",
  verified_by_admin: false
)
```

### Stage 4: Complete Credentials (Later)
```json
POST /api/profile/complete-profile
{
  "user_id": "uuid-67890",
  "role": "doctor",
  "profile_data": {
    "license_id": "MDCN/2024/12345",
    "license_number": "MDCN/2024/12345",
    "specialization": "Emergency Medicine",
    "phone_number": "+2348012345678",
    "hospital_affiliation": "Lagos State Teaching Hospital",
    "years_of_experience": 12,
    "bio": "Board-certified emergency specialist",
    "government_id": "https://storage.example.com/gov-id.pdf",
    "government_id_status": "verified",
    "annual_license": "https://storage.example.com/license.pdf",
    "annual_license_status": "verified",
    "medical_degree": "https://storage.example.com/degree.pdf",
    "medical_degree_status": "verified",
    "registration_certificate": "https://storage.example.com/cert.pdf",
    "registration_certificate_status": "verified"
  }
}
```

---

## 3. NURSE DATA FLOW

### Stage 1: Signup
```json
POST /api/auth/signup-all-roles
{
  "email": "nurse.mary@example.com",
  "password": "securePassword123",
  "full_name": "Mary Okonkwo",
  "username": "marynurse",
  "title": "Mrs.",
  "state": "Abuja",
  "role": "nurse",
  "license_id": "NMCN/2024/54321",
  "certification": "RN - Registered Nurse",
  "department": "ICU",
  "phone_number": "+2349012345678"
}
```

### Stage 2: n8n Webhook
```json
{
  "user_id": "uuid-54321",
  "email": "nurse.mary@example.com",
  "full_name": "Mary Okonkwo",
  "username": "marynurse",
  "title": "Mrs.",
  "state": "Abuja",
  "role": "nurse",
  "license_id": "NMCN/2024/54321",
  "certification": "RN - Registered Nurse",
  "department": "ICU",
  "phone_number": "+2349012345678"
}
```

### Stage 3: Saved to Supabase

#### nurses table
```sql
INSERT INTO nurses VALUES (
  user_id: "uuid-54321",
  submission_key: "EE_mno123pqr456...",
  full_name: "Mary Okonkwo",
  license_number: "NMCN/2024/54321",
  certification: "RN - Registered Nurse",
  department: "ICU",
  state: "Abuja",
  phone_number: "+2349012345678",
  hospital_affiliation: null,
  years_of_experience: null,
  government_id: null,
  government_id_status: "pending",
  annual_license: null,
  annual_license_status: "pending",
  nursing_degree: null,
  nursing_degree_status: "pending",
  verified_by_admin: false
)
```

---

## 4. PARTNER DATA FLOW

### Stage 1: Signup
```json
POST /api/auth/signup-all-roles
{
  "email": "partner@pharmacy.com",
  "password": "securePassword123",
  "full_name": "Ahmed Hassan",
  "username": "pharmacyowner",
  "title": "Mr.",
  "state": "Kano",
  "role": "partner",
  "business_name": "Hassan Pharmacy Ltd",
  "business_category": "pharmacy",
  "business_city": "Kano"
}
```

### Stage 2: n8n Webhook
```json
{
  "user_id": "uuid-99999",
  "email": "partner@pharmacy.com",
  "full_name": "Ahmed Hassan",
  "username": "pharmacyowner",
  "title": "Mr.",
  "state": "Kano",
  "role": "partner",
  "business_name": "Hassan Pharmacy Ltd",
  "business_category": "pharmacy",
  "business_city": "Kano"
}
```

### Stage 3: Saved to Supabase

#### partners table
```sql
INSERT INTO partners VALUES (
  user_id: "uuid-99999",
  submission_key: "EE_pqr456stu789...",
  business_name: "Hassan Pharmacy Ltd",
  business_category: "pharmacy",
  business_city: "Kano",
  business_state: "Kano",
  phone_number: null,
  business_address: null,
  business_registration_number: null,
  verified_by_admin: false
)
```

---

## 5. GENERAL USER DATA FLOW

### Stage 1: Signup
```json
POST /api/auth/signup-all-roles
{
  "email": "user@example.com",
  "password": "securePassword123",
  "full_name": "Alice Adeyemi",
  "username": "aliceade",
  "title": "Ms.",
  "state": "Oyo",
  "role": "user"
}
```

### Stage 2: n8n Webhook
```json
{
  "user_id": "uuid-11111",
  "email": "user@example.com",
  "full_name": "Alice Adeyemi",
  "username": "aliceade",
  "title": "Ms.",
  "state": "Oyo",
  "role": "user"
}
```

### Stage 3: Saved to Supabase

#### profiles table only
```sql
INSERT INTO profiles VALUES (
  user_id: "uuid-11111",
  email: "user@example.com",
  full_name: "Alice Adeyemi",
  username: "aliceade",
  title: "Ms.",
  state: "Oyo",
  role: "user",
  submission_key: "EE_vwx012yz...",
  is_verified: false
)
```

---

## Complete Data Mapping

### What Frontend Sends to API
| Field | Patient | Doctor | Nurse | Partner | User |
|-------|---------|--------|-------|---------|------|
| email | ✅ | ✅ | ✅ | ✅ | ✅ |
| password | ✅ | ✅ | ✅ | ✅ | ✅ |
| full_name | ✅ | ✅ | ✅ | ✅ | ✅ |
| username | ✅ | ✅ | ✅ | ✅ | ✅ |
| title | ✅ | ✅ | ✅ | ✅ | ✅ |
| state | ✅ | ✅ | ✅ | ✅ | ✅ |
| age | ✅ | ❌ | ❌ | ❌ | ❌ |
| phone_number | ✅ | ✅ | ✅ | ❌ | ❌ |
| gender | ✅ | ❌ | ❌ | ❌ | ❌ |
| blood_type | ✅ | ❌ | ❌ | ❌ | ❌ |
| genotype | ✅ | ❌ | ❌ | ❌ | ❌ |
| license_id | ❌ | ✅ | ✅ | ❌ | ❌ |
| specialization | ❌ | ✅ | ❌ | ❌ | ❌ |
| certification | ❌ | ❌ | ✅ | ❌ | ❌ |
| department | ❌ | ❌ | ✅ | ❌ | ❌ |
| business_name | ❌ | ❌ | ❌ | ✅ | ❌ |
| business_category | ❌ | ❌ | ❌ | ✅ | ❌ |
| business_city | ❌ | ❌ | ❌ | ✅ | ❌ |

### What n8n Stores in Database
| Table | Patient | Doctor | Nurse | Partner | User |
|-------|---------|--------|-------|---------|------|
| profiles | ✅ | ✅ | ✅ | ✅ | ✅ |
| patients | ✅ | ❌ | ❌ | ❌ | ❌ |
| doctors | ❌ | ✅ | ❌ | ❌ | ❌ |
| nurses | ❌ | ❌ | ✅ | ❌ | ❌ |
| partners | ❌ | ❌ | ❌ | ✅ | ❌ |
| wallets | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## Email Flow

### Welcome Email Sent by n8n
**From:** noreply@emergencyecho.com  
**To:** user's registered email  
**Subject:** Welcome to EmergencyEcho

**Body:**
```
Hi [full_name],

Your EmergencyEcho account is ready.

Your EmergencyEcho ID: [EE_abc123def456...]

Role: [PATIENT/DOCTOR/NURSE/PARTNER/USER]

Save this ID — you will need it when speaking with EchoAI.

Start your journey: http://localhost:3000/dashboard

Stay safe,
The EmergencyEcho Team
```

### Verification Email (Later)
**Link:** `http://localhost:3000/verify-email?token=ee_verification_token`

---

## Error Handling Flow

### If Validation Fails at API
```json
400 Bad Request
{
  "error": "Missing required fields for doctor role: license_id, specialization"
}
```
→ Database: No changes
→ Frontend: Display error message

### If n8n Webhook Fails
```
API → Create Auth User → SUCCESS
API → Call n8n → FAIL
→ API rolls back: Delete Auth User
→ Frontend: "Failed to process signup. Please try again."
```

### If Database Insert Fails
```
n8n → Save Profile → SUCCESS
n8n → Is Patient? → YES
n8n → Save Patient → FAIL
→ n8n: Error logged
→ Profile exists but incomplete
→ Frontend: Error response
```

---

## Query Examples

### Get Complete Patient Profile
```sql
SELECT
  p.*,
  pt.*,
  w.balance
FROM profiles p
LEFT JOIN patients pt ON p.user_id = pt.user_id
LEFT JOIN wallets w ON p.user_id = w.user_id
WHERE p.user_id = 'uuid-12345'
```

### Get All Doctors by Specialization
```sql
SELECT p.*, d.*
FROM profiles p
JOIN doctors d ON p.user_id = d.user_id
WHERE d.specialization = 'Emergency Medicine'
  AND d.verified_by_admin = true
```

### Get User Wallet Balance
```sql
SELECT balance, currency
FROM wallets
WHERE user_id = 'uuid-12345'
```
