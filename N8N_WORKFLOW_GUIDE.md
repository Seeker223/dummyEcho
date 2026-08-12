# Updated n8n Workflow - Complete Signup for All Roles

## Overview
This comprehensive n8n workflow handles signup and role-specific profile creation for all user types in Emergency Echo.

---

## Workflow Structure

```
Signup Webhook
    ↓
Build Base Profile (Common data for all roles)
    ↓
Save Base Profile to Supabase
    ↓
    ├─→ Is Patient? → Build Patient Medical Kit → Save Patient
    ├─→ Is Doctor? → Build Doctor Profile → Save Doctor
    ├─→ Is Nurse? → Build Nurse Profile → Save Nurse
    ├─→ Is Partner? → Build Partner Data → Save Partner
    ├─→ Create User Wallet
    └─→ Build Welcome Email
         ↓
    Build Signup Response
         ↓
    Respond to Vercel
```

---

## 1. PATIENT ROLE - Complete Data Structure

### Minimal Signup Data
```json
{
  "user_id": "uuid",
  "email": "patient@example.com",
  "full_name": "John Doe",
  "username": "johndoe",
  "title": "Mr.",
  "state": "Lagos",
  "role": "patient"
}
```

### Complete Medical Kit (from frontend)
```json
{
  "age": 35,
  "date_of_birth": "1989-05-15",
  "phone_number": "+2348012345678",
  "gender": "male",
  "blood_type": "O+",
  "genotype": "AA",
  "emergency_contact_name": "Jane Doe",
  "emergency_contact_phone": "+2348087654321",
  "language_preference": "english",
  
  // Medical History
  "medical_conditions": ["Diabetes Type 2", "Hypertension"],
  "chronic_conditions": ["Asthma"],
  "past_surgeries": ["Appendectomy 2015"],
  "previous_hospitalizations": ["Malaria treatment 2023"],
  
  // Medications
  "medications": [
    {"name": "Metformin", "dosage": "500mg", "frequency": "twice daily"},
    {"name": "Lisinopril", "dosage": "10mg", "frequency": "once daily"}
  ],
  
  // Allergies
  "drug_allergies": ["Penicillin", "Sulfonamides"],
  "food_allergies": ["Shellfish", "Peanuts"],
  "other_allergies": ["Latex"],
  
  // Vaccinations
  "vaccinations": [
    {"vaccine_type": "COVID-19", "date": "2024-01-15", "status": "completed"},
    {"vaccine_type": "Yellow Fever", "date": "2023-06-20", "status": "completed"},
    {"vaccine_type": "Polio", "date": "2024-03-10", "status": "completed"}
  ],
  
  // Mental Health
  "mental_health_history": "No major depression or anxiety",
  "current_mental_health_status": "stable",
  "cognitive_issues": [],
  
  // Family History
  "family_genetic_conditions": ["Sickle Cell Trait"],
  "inherited_diseases": ["Heart disease (paternal grandfather)"],
  
  // Lifestyle
  "smoking_status": "never",
  "smoking_frequency": null,
  "alcohol_consumption": "occasional",
  "diet_type": "omnivore",
  "exercise_frequency": 3,
  "occupation": "Software Engineer",
  "pets": ["Dog"],
  
  // Assistive Devices
  "wheelchair_user": false,
  "hearing_aid_user": false,
  "pacemaker_user": false,
  "prosthetic_user": false,
  "other_assistive_devices": [],
  
  // Female-Specific (OB/GYN) - Only for females
  "is_pregnant": false,
  "pregnancy_trimester": null,
  "obstetric_history": null,
  "number_of_children": 0,
  "menstruation_status": null,
  "menstrual_cycle_days": null,
  "contraception_method": null,
  "contraception_duration": null
}
```

### Tables Created
- `profiles` - Base user profile
- `patients` - Extended patient medical data
- `wallets` - User balance (NGN currency)

---

## 2. DOCTOR ROLE - Complete Data Structure

### Initial Signup Data
```json
{
  "user_id": "uuid",
  "email": "dr.smith@example.com",
  "full_name": "Dr. Smith Johnson",
  "username": "drsmith",
  "title": "Dr.",
  "state": "Lagos",
  "role": "doctor"
}
```

### Profile Completion Data (from frontend)
```json
{
  "license_id": "MDCN/2024/12345",
  "license_number": "MDCN/2024/12345",
  "specialization": "Emergency Medicine",
  "phone_number": "+2348012345678",
  "hospital_affiliation": "Lagos State Teaching Hospital",
  "years_of_experience": 12,
  "bio": "Board-certified emergency medicine specialist",
  
  // Document Uploads (file URLs or base64)
  "government_id": "https://storage.example.com/doc1.pdf",
  "government_id_status": "pending",
  
  "annual_license": "https://storage.example.com/doc2.pdf",
  "annual_license_status": "pending",
  
  "medical_degree": "https://storage.example.com/doc3.pdf",
  "medical_degree_status": "pending",
  
  "registration_certificate": "https://storage.example.com/doc4.pdf",
  "registration_certificate_status": "pending"
}
```

### Specialization Options (20+)
- Emergency Medicine
- General Practice
- Pediatrics
- Obstetrics & Gynecology
- Cardiology
- Neurology
- Orthopedics
- Psychiatry
- Oncology
- Dermatology
- Gastroenterology
- Pulmonology
- Nephrology
- Rheumatology
- Infectious Disease
- Anesthesiology
- Radiology
- Surgery
- Pathology
- Psychiatry

### Tables Created
- `profiles` - Base doctor profile
- `doctors` - Extended doctor credentials & documents
- `wallets` - Doctor balance (for consultations)

---

## 3. NURSE ROLE - Complete Data Structure

### Initial Signup Data
```json
{
  "user_id": "uuid",
  "email": "nurse.mary@example.com",
  "full_name": "Mary Okonkwo",
  "username": "marynurse",
  "title": "Mrs.",
  "state": "Abuja",
  "role": "nurse"
}
```

### Profile Completion Data (from frontend)
```json
{
  "license_id": "NMCN/2024/54321",
  "license_number": "NMCN/2024/54321",
  "certification": "RN - Registered Nurse",
  "department": "ICU",
  "phone_number": "+2349012345678",
  "hospital_affiliation": "Federal Medical Centre Abuja",
  "years_of_experience": 8,
  
  // Document Uploads
  "government_id": "https://storage.example.com/doc1.pdf",
  "government_id_status": "pending",
  
  "annual_license": "https://storage.example.com/doc2.pdf",
  "annual_license_status": "pending",
  
  "nursing_degree": "https://storage.example.com/doc3.pdf",
  "nursing_degree_status": "pending"
}
```

### Department/Specialization Options
- ICU (Intensive Care Unit)
- Emergency Care
- Pediatrics
- Maternity/OB
- Surgery
- Orthopedics
- Oncology
- Community Health
- Mental Health
- Geriatric Care

### Tables Created
- `profiles` - Base nurse profile
- `nurses` - Extended nurse credentials & documents
- `wallets` - Nurse balance

---

## 4. PARTNER ROLE - Complete Data Structure

### Initial Signup Data
```json
{
  "user_id": "uuid",
  "email": "partner@pharmacy.com",
  "full_name": "Ahmed Hassan",
  "username": "pharmacyowner",
  "title": "Mr.",
  "state": "Kano",
  "role": "partner"
}
```

### Business Profile Data (from frontend)
```json
{
  "business_name": "Hassan Pharmacy Ltd",
  "business_category": "pharmacy",
  "business_city": "Kano",
  "phone_number": "+2347012345678",
  "business_address": "123 Business Street, Kano",
  "business_registration_number": "RC/2024/123456"
}
```

### Business Categories
- `pharmacy` - Pharmaceutical business
- `lab` - Laboratory/Diagnostic services
- `fitness` - Fitness & Wellness center
- `wellness` - Wellness/Health center

### Tables Created
- `profiles` - Base partner profile
- `partners` - Extended business information
- `wallets` - Business balance

---

## 5. GENERAL USER ROLE - Data Structure

### Initial Signup Data
```json
{
  "user_id": "uuid",
  "email": "user@example.com",
  "full_name": "Alice Adeyemi",
  "username": "aliceade",
  "title": "Ms.",
  "state": "Oyo",
  "role": "user"
}
```

### Optional Profile Data
```json
{
  "phone_number": "+2347012345678",
  "location": "Ibadan, Oyo State",
  "bio": "Community health volunteer"
}
```

### Tables Created
- `profiles` - Base user profile
- `wallets` - User balance

---

## Auto-Created Resources (All Roles)

### 1. Wallet
```json
{
  "user_id": "uuid",
  "balance": 0,
  "currency": "NGN",
  "created_at": "2024-06-01T10:30:00Z"
}
```

### 2. Welcome Email
```
To: user@example.com
Subject: Welcome to EmergencyEcho

Hi John Doe,

Your EmergencyEcho account is ready.

Your EmergencyEcho ID: EE_abc123def456...

Role: PATIENT

Save this ID — you will need it when speaking with EchoAI.

Start your journey: http://localhost:3000/dashboard

Stay safe,
The EmergencyEcho Team
```

---

## Import Instructions

### 1. In n8n
1. Go to **Workflows** → **New**
2. Click **Import from File** or **Import from URL**
3. Upload `complete-signup-all-roles.json`
4. Click **Save** and **Activate**

### 2. Set Supabase Credentials
1. In the imported workflow, each Supabase node will show a warning
2. Click on each node (Save Patient, Save Doctor, etc.)
3. Select/Create **Supabase** credential with:
   - Project URL
   - Service Role Key

### 3. Get Webhook URL
1. Click **Signup Webhook** node
2. Copy the webhook URL
3. Set in frontend `.env.local`:
   ```
   N8N_WEBHOOK_URL=<copied-url>
   ```

---

## Testing

### Test Patient Signup
```bash
curl -X POST http://localhost:5678/webhook/ee-signup \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-patient-uuid",
    "email": "patient@test.com",
    "full_name": "Test Patient",
    "username": "testpat",
    "title": "Mr.",
    "state": "Lagos",
    "role": "patient",
    "age": 35,
    "phone_number": "+2348012345678",
    "blood_type": "O+",
    "medical_conditions": ["Diabetes"]
  }'
```

### Expected Response
```json
{
  "success": true,
  "user_id": "test-patient-uuid",
  "echo_id": "EE_abc123...",
  "role": "patient",
  "email": "patient@test.com",
  "full_name": "Test Patient",
  "message": "Patient profile created successfully. Check your email to verify your account."
}
```

---

## Error Handling

The workflow includes error handling for:
- ✅ Invalid role selection
- ✅ Missing required fields
- ✅ Database constraint violations
- ✅ Invalid email format
- ✅ Duplicate user/email detection

---

## Database Table Extensions Required

Make sure your Supabase migrations include:

1. `partners` table (for business partners)
2. Extended `patients` table (medical fields)
3. Extended `doctors` table (license & documents)
4. Extended `nurses` table (license & documents)
5. `wallets` table (for all roles)

Run the SQL migration from SETUP_GUIDE.md and add the `partners` table:

```sql
CREATE TABLE partners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(user_id),
  submission_key TEXT NOT NULL UNIQUE,
  business_name TEXT,
  business_category TEXT CHECK (business_category IN ('pharmacy', 'lab', 'fitness', 'wellness')),
  business_city TEXT,
  business_state TEXT,
  phone_number TEXT,
  business_address TEXT,
  business_registration_number TEXT,
  verified_by_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_partners_user_id ON partners(user_id);
CREATE INDEX idx_partners_business_category ON partners(business_category);
```

---

## Next Steps

1. Import workflow into n8n
2. Configure Supabase credentials
3. Create `partners` table in Supabase
4. Get webhook URL and update frontend `.env.local`
5. Test each role signup flow
6. Setup email sending in n8n (Gmail/SendGrid)
