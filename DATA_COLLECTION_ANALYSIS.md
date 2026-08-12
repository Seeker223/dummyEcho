# EMERGENCY_ECHO Frontend - Data Collection Analysis

## Overview
This document details all data collected during signup, registration, and profile completion across all user roles in the EMERGENCY_ECHO application.

---

## 1. INITIAL SIGNUP (All Users)

### Location: `SignupScreen.jsx`
### Flow: Multi-step process with 2-3 steps depending on role

#### **Step 1: Personal Information**
- **Role** (career role): patient, doctor, nurse, partner (required)
- **Title**: Mr., Dr., Nurse, etc. (optional)
- **Full Name** (required)
- **Username** (required, 3+ characters)
- **Email** (required, unique)
- **State**: Lagos, Abuja, Kano, Rivers (default: Lagos)

#### **Step 2: Security**
- **Password** (required, 8+ characters, with strength meter)
- **Confirm Password** (required, must match)
- **Password Strength Indicators**:
  - Weak (red): Less than 12 characters with basic mix
  - Fair (orange): 12-16 characters with good variety
  - Strong (green): 16+ characters with special characters

#### **Step 3: Role-Specific Kit** (Clinical roles only - Doctor & Nurse)
Completed in professional kit section after signup

**In authService.js registerUser():**
```javascript
{
  id: "u-${Date.now()}",
  role: "patient|doctor|nurse|partner",
  accessRole: "user|admin",
  username: string,
  email: string,
  password: string,
  // Additional fields populated during profile completion
}
```

---

## 2. ROLE SELECTION

### Location: `RoleScreen.jsx`

The application supports 4 primary roles:

| Role | Description | Onboarding Type |
|------|-------------|-----------------|
| **Patient** | Get AI-guided triage and connect to clinicians | Basic profile + Medical kit |
| **Doctor** | Review requests and support urgent cases | Professional kit required |
| **Nurse** | Support triage and urgent care workflows | Professional kit required |
| **Partner** | Labs, pharmacies, gyms, wellness providers | Business information |

---

## 3. ROLE-SPECIFIC DATA COLLECTION

### 3.1 DOCTOR ROLE

#### Location: `ApplyDoctorScreen.jsx`

**Required Fields:**
- **License ID** (e.g., MDCN-XXXX, minimum 3 characters)
- **Specialization** (dropdown, default: Emergency Medicine)
- **State** (Lagos, Abuja, Kano, Rivers)
- **Professional Kit Completion Flag** (`professionalKitComplete: true`)

**Available Specializations:**
- General Practice / Family Medicine
- Pediatrics
- Obstetrics & Gynecology
- General Surgery
- Emergency Medicine
- Cardiology
- Neurology
- Psychiatry / Mental Health
- Dermatology
- Orthopedics
- Radiology
- Anesthesiology
- Oncology
- Urology
- Ophthalmology
- ENT (Otolaryngology)
- ICU / Critical Care
- Community & Public Health
- Internal Medicine

**Required Document Uploads:**
1. **Government ID** (`DocumentKinds.GOV_ID`)
   - Type: NIN, Driver's licence, Voter's card
   - Metadata: `{ idType }` 
   - Status: pending/verified/rejected

2. **Annual Licence** (`DocumentKinds.ANNUAL_LICENSE`)
   - Required for all doctors
   - Status: pending/verified/rejected

3. **Medical Degree** (`DocumentKinds.DEGREE`)
   - Type: BSc, MBBS, etc.
   - Metadata: `{ qualification }`
   - Status: pending/verified/rejected

4. **Full Registration Certificate** (`DocumentKinds.FULL_REG_CERT`)
   - Status: pending/verified/rejected

**Data Structure Stored:**
```javascript
{
  role: "doctor",
  licenseId: string,
  specialization: string,
  state: string,
  professionalKitComplete: boolean,
  // Profile fields
  title: string,
  fullName: string,
  avatarUrl: string,
}
```

---

### 3.2 NURSE ROLE

#### Location: `ApplyNurseScreen.jsx`

**Required Fields:**
- **License ID** (e.g., NMCN-XXXX, minimum 3 characters)
- **Department** (dropdown, default: General Nursing / Midwifery)
- **Professional Kit Completion Flag** (`professionalKitComplete: true`)

**Department/Specialization Options:**
Same as doctor specializations (see 3.1)

**Required Document Uploads:**
1. **Government ID** (`DocumentKinds.GOV_ID`)
   - Type: NIN, Driver's licence, Voter's card
   - Metadata: `{ idType }`
   - Status: pending/verified/rejected

2. **Annual Licence** (`DocumentKinds.ANNUAL_LICENSE`)
   - Required for all nurses
   - Status: pending/verified/rejected

3. **Nursing Degree** (`DocumentKinds.DEGREE`)
   - Type: RN, RM, BSc, etc.
   - Metadata: `{ qualification }`
   - Status: pending/verified/rejected

**Data Structure Stored:**
```javascript
{
  role: "nurse",
  licenseId: string,
  specialization: string,  // stored as "department"
  professionalKitComplete: boolean,
  // Profile fields
  title: string,
  fullName: string,
  avatarUrl: string,
}
```

---

### 3.3 PARTNER ROLE

#### Location: `ApplyPartnerScreen.jsx`

**Fields:**
- **Business Name** (required, e.g., "Reddington Lab")
- **Category** (dropdown)
  - Pharmacy
  - Lab
  - Fitness
  - Wellness
- **City** (dropdown)
  - Lagos
  - Abuja
  - Ibadan
  - Port Harcourt

**Data Structure:**
```javascript
{
  role: "partner",
  businessName: string,
  category: string,
  city: string,
}
```

---

### 3.4 USER ROLE (Patient)

#### Location: `ApplyUserScreen.jsx`

Default flow for "patient" role. Shows prompt to fill Digital Medical Kit for better personalization.

---

## 4. PROFILE COMPLETION

### 4.1 BASIC PROFILE

#### Location: `ProfileBasicScreen.jsx`

**Fields:**
- **Title** (optional, e.g., Dr., Mr., Mrs.)
- **Full Name** (required)
- **Email** (required, validated)
- **Phone** (optional, minimum 8 characters)
- **Age** (optional, numeric)
- **Profile Photo** (optional, file upload converted to base64)

**Data Structure:**
```javascript
{
  title: string,
  fullName: string,
  email: string,
  phone: string,
  age: string,
  avatarUrl: string,  // base64 data URL
}
```

---

### 4.2 EMERGENCY CONTACT

#### Location: `ProfileEmergencyScreen.jsx`

**Fields:**
- **Contact Name** (required)
- **Phone** (required, minimum 8 characters)
- **Relationship** (optional, e.g., Parent, Spouse)

**Data Structure:**
```javascript
{
  emergencyContactName: string,
  emergencyContactPhone: string,
  emergencyContactRelationship: string,
}
```

---

### 4.3 LANGUAGE PREFERENCE

#### Location: `LanguageScreen.jsx`

**Field:**
- **Language** (dropdown, UI-only for now)
  - English
  - Pidgin
  - Yoruba
  - Igbo
  - Hausa

**Data Structure:**
```javascript
{
  language: string,
}
```

---

## 5. DIGITAL MEDICAL KIT (Patient Only)

#### Location: `KitScreen.jsx` - `PatientKitScreen()`

The comprehensive medical history form for patients. This is the most extensive data collection point.

### 5.1 ABOUT / BASIC MEDICAL INFO

- **Full Name**: string
- **Date of Birth (DOB)**: string (ISO format)
- **Sex/Gender**: male, female (affects conditional fields)
- **Blood Type**: O+, O-, A+, A-, B+, B-, AB+, AB-
- **Genotype**: AA, AS, SS, AC, SC, "I don't know"
- **Language**: English, Pidgin, Yoruba, Igbo, Hausa
- **Marital Status**: string
- **Religion**: string
- **Nationality**: string
- **Address**: string

### 5.2 EMERGENCY CONTACTS

- **Emergency Contact Name**: string
- **Emergency Contact Phone**: string
- **Emergency Contact Phone 2** (secondary): string
- **Emergency Contact Relationship**: string

### 5.3 MEDICAL CONDITIONS

**Fields:**
- **Conditions List** (multi-select from predefined list)
- **Conditions Other** (free text for unlisted conditions)

**Predefined Medical Conditions:**
- High blood pressure
- Diabetes (sugar disease)
- Asthma (breathing problem)
- Epilepsy (seizures / fits)
- Sickle cell disease
- Heart disease
- Kidney disease
- Liver disease
- Cancer
- Tuberculosis (TB)
- HIV / AIDS
- Thyroid problem
- Autoimmune disease
- Brain or nerve condition
- Mental health condition
- None of these

### 5.4 SURGICAL HISTORY

**Fields:**
- **Surgeries List** (multi-select)
- **Surgeries Other** (free text)

**Predefined Surgeries:**
- Appendix removed
- Hernia repair
- Caesarean section (C-section)
- Bone or joint surgery
- Heart surgery
- Brain surgery
- Ear, nose or throat surgery
- Eye surgery
- Stomach or bowel surgery
- Womb removed
- Gallbladder removed
- I've never had an operation

### 5.5 ALLERGIES

**Fields:**
- **Drug Allergies** (multi-select with autocomplete)
- **Food Allergies** (multi-select with autocomplete)
- **Other Allergies** (free text)

**Drug Allergy Options:**
- Penicillin, Amoxicillin, Ibuprofen, Aspirin, Codeine
- Metformin, Warfarin, Sulfonamides
- Contrast dye (used in scans), Latex (rubber gloves)

**Food Allergy Options:**
- Peanuts, Tree nuts, Milk/Dairy, Eggs
- Wheat/Bread/Gluten, Shellfish (prawns, crab)
- Fish, Soy, Sesame

### 5.6 MEDICATIONS

**Fields:**
- **Prescription Medications** (multi-select with autocomplete)
- **Over-the-Counter Medications** (multi-select with autocomplete)
- **Herbal Medications** (multi-select with autocomplete)
- **Medication Notes** (free text)

**Prescription Medication Examples:**
- Metformin, Amlodipine, Lisinopril, Atorvastatin
- Furosemide, Levothyroxine, Omeprazole, Metoprolol
- Aspirin 75mg, Insulin
- Artemether-Lumefantrine (malaria), Cotrimoxazole

**OTC Medication Examples:**
- Paracetamol, Ibuprofen, Loratadine
- Antacid, Oral rehydration salts, Multivitamins
- Vitamin C, Zinc

**Herbal Medicine Examples:**
- Moringa, Ginger, Turmeric, Aloe vera
- Black seed (Nigella), Bitter leaf, Scent leaf
- Garlic supplements

### 5.7 HOSPITAL STAYS & TRANSFUSIONS

**Fields:**
- **Hospital Admissions** (yes/no)
- **Admission Details** (free text)
- **Blood Transfusions** (yes/no)
- **Transfusion Details** (free text)

### 5.8 VACCINATIONS

**Fields:**
- **Vaccines List** (multi-select)
- **Vaccine Notes** (free text)

**Vaccine Options:**
- Tetanus (lockjaw)
- Hepatitis B, Hepatitis A
- Yellow fever, COVID-19, Polio
- Measles, HPV (cervical cancer vaccine)
- Chickenpox, Flu (influenza), Meningitis
- Typhoid, "I'm not sure"

### 5.9 MENTAL HEALTH HISTORY

**Fields:**
- **Mental Health History** (multi-select)
- **Current Mental Status** (free text)
- **Cognitive Issues** (multi-select)
- **Mental Health Notes** (free text)

**Mental Health History Options:**
- Depression (persistent sadness)
- Anxiety (constant worry or panic)
- Bipolar disorder (extreme mood swings)
- Schizophrenia, PTSD (trauma)
- ADHD (difficulty focusing), OCD
- Eating disorder, None of these

**Cognitive Issues Options:**
- Forgetting things more than usual
- Difficulty concentrating
- Dementia (memory loss getting worse over time)
- None of these

### 5.10 ADVANCE DIRECTIVES / WISHES

**Fields:**
- **Directives List** (multi-select)
- **Directive Notes** (free text)

**Directive Options:**
- I do NOT want to be resuscitated if my heart stops (DNR)
- I agree to donate my organs
- I do NOT want to receive blood transfusions
- I have special dietary needs
- I have cultural or religious preferences for my care
- I have a written care plan with my doctor

### 5.11 FAMILY MEDICAL HISTORY

**Fields:**
- **Family History** (multi-select)
- **Family History Notes** (free text)

**Family History Options:**
- High blood pressure, Diabetes, Heart disease
- Stroke, Cancer, Sickle cell
- Haemophilia (bleeding disorder)
- Mental health problems
- A genetic / inherited condition
- None that I know of

### 5.12 ASSISTIVE DEVICES

**Fields:**
- **Assistive Devices** (multi-select)
- **Assistive Devices Notes** (free text)

**Device Options:**
- Wheelchair, Hearing aid, Pacemaker (heart device)
- Insulin pump, Cochlear implant (hearing device)
- Oxygen machine or breathing support at home
- Artificial limb, Glasses or contact lenses, None

### 5.13 LIFESTYLE

**Fields:**
- **Smoking Status**: yes/no
- **Alcohol Use**: yes/no
- **Substance Use** (multi-select)
- **Substance Use Details** (free text)
- **Diet**: string
- **Exercise Frequency**: string
- **Occupation Category**: string
- **Living Situation**: string
- **Pets**: yes/no
- **Pet Types** (multi-select if yes)
- **Other Pet Types** (free text)
- **Lifestyle Notes** (free text)

**Substance Options:**
- Cannabis (weed), Cigarettes/tobacco, Shisha/hookah
- Cocaine, Strong painkillers (not prescribed)
- Khat (miraa), Sleeping pills (not prescribed)
- Alcohol (heavily), None of these

**Pet Options:**
- Dog, Cat, Bird, Reptile, Rodent, Farm animals

### 5.14 OBSTETRICS & GYNECOLOGY (Females Only)

**Gender-Conditional:** Only appears if `sex !== 'male'`

**Fields:**
- **Gravida**: number (times pregnant)
- **Para**: number (times delivered)
- **Miscarriages**: number
- **Pregnancy Complications** (multi-select)
- **Last Menstrual Period (LMP)**: date string
- **Menstrual Regularity**: string
- **Contraception Use**: yes/no
- **Menopause Status**: yes/no
- **OB/GYN Notes**: free text

**Pregnancy Complications Options:**
- High blood pressure during pregnancy
- Diabetes during pregnancy, Heavy bleeding
- Baby came early (premature)
- Baby was in wrong position
- I needed a blood transfusion after delivery
- No problems

**Male-Patient Handling:**
If patient is male, all O&G fields are automatically cleared:
- `lmp: ''`
- `contraceptionUse: ''`
- `obgynNotes: ''`
- `gravida: 0`
- `para: 0`
- `miscarriages: 0`
- `pregnancyComplications: []`
- `menstrualRegularity: ''`
- `menopause: ''`

---

## 6. COMPLETE USER DATA STRUCTURE

### Default Users (in authService.js):

```javascript
// PATIENT EXAMPLE
{
  id: 'p-1001',
  role: 'patient',
  title: 'Mr.',
  fullName: 'Junior Okafor',
  username: 'junior.patient',
  email: 'junior.patient@echo.test',
  password: 'patient123',
  age: '24',
  phone: '08030000001',
  gender: 'male',
  language: 'english',
  avatarUrl: 'https://...',
  // Digital Medical Kit fields (optional)
  bloodType: 'O+',
  genotype: 'AA',
  // Emergency contacts
  emergencyContactName: string,
  emergencyContactPhone: string,
  emergencyContactRelationship: string,
  // Medical history
  conditionsList: [],
  surgeriesList: [],
  drugAllergies: [],
  foodAllergies: [],
  rxMeds: [],
  otcMeds: [],
  herbalMeds: [],
  // ... (all kit fields above)
}

// DOCTOR EXAMPLE
{
  id: 'd-2001',
  role: 'doctor',
  professionalKitComplete: true,
  title: 'Dr.',
  fullName: 'Sarah Johnson',
  username: 'sarah.doctor',
  email: 'sarah.doctor@echo.test',
  password: 'doctor123',
  specialization: 'Emergency Medicine',
  phone: '08030000002',
  avatarUrl: 'https://...',
  licenseId: 'MDCN-XXXX',
  state: 'Lagos',
}

// NURSE EXAMPLE
{
  id: 'n-3001',
  role: 'nurse',
  professionalKitComplete: true,
  title: 'Nurse',
  fullName: 'Grace Mensah',
  username: 'grace.nurse',
  email: 'grace.nurse@echo.test',
  password: 'nurse1234',
  specialization: 'General Nursing / Midwifery',
  phone: '08030000003',
  avatarUrl: 'https://...',
  licenseId: 'NMCN-XXXX',
}

// PARTNER EXAMPLE
{
  role: 'partner',
  businessName: 'Reddington Lab',
  category: 'Lab',
  city: 'Lagos',
}
```

---

## 7. DOCUMENT STORAGE

### Document Service: `documentService.js`

**Stored Locally:** `localStorage.ee_documents:v1`

**Document Kinds (Enums):**
```javascript
DocumentKinds = {
  GOV_ID: 'gov_id',
  ANNUAL_LICENSE: 'annual_license',
  DEGREE: 'degree',
  FULL_REG_CERT: 'full_registration_certificate',
}
```

**Document Object Structure:**
```javascript
{
  id: string,                      // doc-${timestamp}-${random}
  userId: string,
  kind: string,                    // DocumentKinds enum
  status: string,                  // pending | verified | rejected
  uploadedAt: string,              // ISO timestamp
  reviewedAt: string | null,
  reviewerId: string | null,
  reviewNote: string,
  fileName: string,
  fileType: string,                // MIME type
  fileSize: number,
  meta: object,                    // Additional metadata
  // Example meta for Gov ID:
  // { idType: 'NIN' | "Driver's licence" | "Voter's card" }
  // Example meta for Degree:
  // { qualification: 'BSc' | 'MBBS' | 'RN' | 'RM' }
}
```

---

## 8. DATA STORAGE & VALIDATION

### Storage Method: **localStorage**

**Keys Used:**
- `ee_dummy_users` - All user accounts
- `ee_active_user` - Currently logged-in user session
- `ee_admin_roles:v1` - Enabled career roles configuration
- `ee_admin_access_roles:v1` - Enabled access roles configuration
- `ee_documents:v1` - Uploaded documents
- `ee_language` - User's language preference

### Validation Rules:

**Username:**
- Minimum 3 characters
- Must be unique across all users
- Stored as lowercase

**Email:**
- Must be valid format (contains @ and .)
- Must be unique across all users
- Stored as lowercase

**Password:**
- Minimum 8 characters
- Strength meter available (visual feedback)
- Never returned from backend/stored in session

**Age:**
- Must be numeric if provided
- Optional field

**Phone:**
- Minimum 8 characters if provided
- Optional field

**License ID (Clinical):**
- Minimum 3 characters
- Format examples: MDCN-XXXX, NMCN-XXXX

**Numeric Fields (OB/GYN):**
- Gravida, Para, Miscarriages must be numbers
- Defaults to 0

**Gender-Based Field Clearing:**
- If patient is male, all O&G fields are automatically cleared to prevent invalid data

---

## 9. CONDITIONAL DATA FLOWS

### Patient vs Clinical Roles:

| Aspect | Patient | Doctor | Nurse |
|--------|---------|--------|-------|
| **Signup Steps** | 2 steps | 3 steps | 3 steps |
| **License Required** | No | Yes (MDCN) | Yes (NMCN) |
| **Documents Required** | No | 4 documents | 3 documents |
| **Digital Kit** | Optional but encouraged | No | No |
| **Specialization** | N/A | Required | Required |
| **State Selection** | Yes | Yes | No |

### Gender-Conditional Fields:

- **OB/GYN Section:** Only shows if `sex !== 'male'`
- **Pregnancy Fields:** Hidden for males and cleared on save
- **Menstruation Fields:** Hidden for males

### Role-Based Data Access Control:

**Enabled Roles:** Configurable via admin panel
- Default: patient, doctor, nurse, partner
- Can be restricted if certain roles are unavailable

**Access Roles:** user vs admin
- Default: user
- Controls administrative privileges

---

## 10. SUMMARY TABLE - DATA COLLECTION BY ROLE

| Data Field | Patient | Doctor | Nurse | Partner |
|------------|---------|--------|-------|---------|
| Username | ✓ | ✓ | ✓ | ✓ |
| Email | ✓ | ✓ | ✓ | ✓ |
| Password | ✓ | ✓ | ✓ | ✓ |
| Full Name | ✓ | ✓ | ✓ | Business Name |
| Title | ✓ | ✓ | ✓ | - |
| Phone | ✓ | ✓ | ✓ | - |
| Age | ✓ | - | - | - |
| License ID | - | ✓ | ✓ | - |
| Specialization | - | ✓ | ✓ (Dept) | - |
| State | ✓ | ✓ | - | ✓ (City) |
| Category | - | - | - | ✓ |
| Documents | - | 4 | 3 | - |
| Emergency Contact | ✓ | - | - | - |
| Blood Type | ✓ (optional) | - | - | - |
| Medical History | ✓ (detailed) | - | - | - |
| Medications | ✓ (detailed) | - | - | - |
| Allergies | ✓ (detailed) | - | - | - |
| Surgical History | ✓ (detailed) | - | - | - |
| Family History | ✓ (detailed) | - | - | - |
| Lifestyle Info | ✓ (detailed) | - | - | - |
| OB/GYN Data | ✓ (if female) | - | - | - |

---

## 11. KEY INSIGHTS

1. **Two-Tier Data Collection:**
   - **Quick Signup:** Minimal fields (email, password, role, name)
   - **Extended Profile:** Role-specific and medical data collected over time

2. **Digital Medical Kit is Extensive:**
   - Over 60 individual data fields
   - Covers full medical, surgical, medication, family, lifestyle, and reproductive history
   - Designed to support AI-based triage and personalized guidance

3. **Document Verification System:**
   - Professional roles require document uploads
   - Documents tracked with verification status
   - Supports metadata for document classification

4. **Privacy-Conscious Design:**
   - Password never stored in session
   - Passwords can be reset through email verification
   - Gender-based field conditional clearing prevents invalid data

5. **Flexible Role System:**
   - Roles can be enabled/disabled by admins
   - Access roles separate from career roles
   - Role-specific data structures

6. **Localization Ready:**
   - Language preference collection
   - Multiple UI language options supported

---

## 12. POTENTIAL DATA CONCERNS & NOTES

1. **localStorage Only:** All user data stored in browser localStorage (no backend)
2. **Password Storage:** Passwords stored in plaintext in localStorage (security issue for production)
3. **No Encryption:** Patient medical data not encrypted at rest
4. **Base64 Images:** Profile photos stored as base64 data URLs (scalability concern)
5. **Document Files:** File handling through FileReader API, no actual file server
6. **No Data Persistence:** Data lost if localStorage cleared

---

## Source Files Reference

| Component | Purpose | Path |
|-----------|---------|------|
| Signup Flow | Multi-step signup | `SignupScreen.jsx` |
| Doctor Onboarding | Doctor-specific profile | `ApplyDoctorScreen.jsx` |
| Nurse Onboarding | Nurse-specific profile | `ApplyNurseScreen.jsx` |
| Partner Setup | Partner/business setup | `ApplyPartnerScreen.jsx` |
| Patient Profile | Patient profile completion | `ApplyUserScreen.jsx` |
| Basic Profile | Name, email, phone, photo | `ProfileBasicScreen.jsx` |
| Emergency Contact | Emergency contact info | `ProfileEmergencyScreen.jsx` |
| Medical Kit | Comprehensive medical history | `KitScreen.jsx` |
| Language | Language preference | `LanguageScreen.jsx` |
| Auth Service | User management logic | `authService.js` |
| Auth Context | React context for auth state | `AuthContext.jsx` |
| Document Service | Document upload & tracking | `documentService.js` |
| Specialties | Medical specialty lists | `specialties.js` |

