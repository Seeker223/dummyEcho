# API Endpoints - Complete Reference for All Roles

## Signup Endpoint

### POST `/api/auth/signup-all-roles`

Create a new user account for any role.

#### Request Body

**Common Fields (All Roles):**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "full_name": "John Doe",
  "username": "johndoe",
  "title": "Mr.",
  "state": "Lagos",
  "role": "patient"  // patient | doctor | nurse | partner | user
}
```

---

## Role-Specific Examples

### 1. PATIENT Signup
```json
{
  "email": "patient@example.com",
  "password": "securePassword123",
  "full_name": "John Doe",
  "username": "johndoe",
  "title": "Mr.",
  "state": "Lagos",
  "role": "patient",
  
  // Patient-specific fields
  "age": 35,
  "phone_number": "+2348012345678",
  "gender": "male",
  "blood_type": "O+",
  "genotype": "AA"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Patient signup successful. Please check your email to verify your account.",
  "user_id": "uuid-here",
  "echo_id": "EE_abc123def456...",
  "email": "patient@example.com",
  "role": "patient"
}
```

---

### 2. DOCTOR Signup
```json
{
  "email": "dr.smith@example.com",
  "password": "securePassword123",
  "full_name": "Dr. Smith Johnson",
  "username": "drsmith",
  "title": "Dr.",
  "state": "Lagos",
  "role": "doctor",
  
  // Doctor-specific fields
  "license_id": "MDCN/2024/12345",
  "specialization": "Emergency Medicine",
  "phone_number": "+2348012345678"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Doctor signup successful. Please check your email to verify your account.",
  "user_id": "uuid-here",
  "echo_id": "EE_xyz789...",
  "email": "dr.smith@example.com",
  "role": "doctor"
}
```

---

### 3. NURSE Signup
```json
{
  "email": "nurse.mary@example.com",
  "password": "securePassword123",
  "full_name": "Mary Okonkwo",
  "username": "marynurse",
  "title": "Mrs.",
  "state": "Abuja",
  "role": "nurse",
  
  // Nurse-specific fields
  "license_id": "NMCN/2024/54321",
  "certification": "RN - Registered Nurse",
  "department": "ICU",
  "phone_number": "+2349012345678"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Nurse signup successful. Please check your email to verify your account.",
  "user_id": "uuid-here",
  "echo_id": "EE_mno123...",
  "email": "nurse.mary@example.com",
  "role": "nurse"
}
```

---

### 4. PARTNER Signup
```json
{
  "email": "partner@pharmacy.com",
  "password": "securePassword123",
  "full_name": "Ahmed Hassan",
  "username": "pharmacyowner",
  "title": "Mr.",
  "state": "Kano",
  "role": "partner",
  
  // Partner-specific fields
  "business_name": "Hassan Pharmacy Ltd",
  "business_category": "pharmacy",
  "business_city": "Kano"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Partner signup successful. Please check your email to verify your account.",
  "user_id": "uuid-here",
  "echo_id": "EE_pqr456...",
  "email": "partner@pharmacy.com",
  "role": "partner"
}
```

---

### 5. GENERAL USER Signup
```json
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

**Response:**
```json
{
  "success": true,
  "message": "User signup successful. Please check your email to verify your account.",
  "user_id": "uuid-here",
  "echo_id": "EE_stu789...",
  "email": "user@example.com",
  "role": "user"
}
```

---

## Complete Profile Endpoint

### POST `/api/profile/complete-profile`

Update/complete role-specific profile information after initial signup.

#### General Format
```json
{
  "user_id": "uuid-from-signup-response",
  "role": "patient",  // patient | doctor | nurse | partner
  "profile_data": {
    // Role-specific fields
  }
}
```

---

## Complete Profile Examples

### PATIENT - Complete Medical Kit
```json
{
  "user_id": "uuid-here",
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
      {
        "name": "Metformin",
        "dosage": "500mg",
        "frequency": "twice daily"
      }
    ],
    
    "drug_allergies": ["Penicillin"],
    "food_allergies": ["Shellfish"],
    "other_allergies": ["Latex"],
    
    "vaccinations": [
      {
        "vaccine_type": "COVID-19",
        "date": "2024-01-15",
        "status": "completed"
      }
    ],
    
    "mental_health_history": "No major issues",
    "current_mental_health_status": "stable",
    "family_genetic_conditions": ["Sickle Cell"],
    
    "smoking_status": "never",
    "alcohol_consumption": "occasional",
    "diet_type": "omnivore",
    "exercise_frequency": 3,
    "occupation": "Software Engineer",
    
    // Female-specific (if gender = "female")
    "is_pregnant": false,
    "obstetric_history": null,
    "menstruation_status": "regular"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Patient profile updated successfully"
}
```

---

### DOCTOR - Complete Credentials
```json
{
  "user_id": "uuid-here",
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
    "government_id_status": "pending",
    
    "annual_license": "https://storage.example.com/license.pdf",
    "annual_license_status": "pending",
    
    "medical_degree": "https://storage.example.com/degree.pdf",
    "medical_degree_status": "pending",
    
    "registration_certificate": "https://storage.example.com/cert.pdf",
    "registration_certificate_status": "pending"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Doctor profile updated successfully"
}
```

---

### NURSE - Complete Credentials
```json
{
  "user_id": "uuid-here",
  "role": "nurse",
  "profile_data": {
    "license_id": "NMCN/2024/54321",
    "license_number": "NMCN/2024/54321",
    "certification": "RN - Registered Nurse",
    "department": "ICU",
    "phone_number": "+2349012345678",
    "hospital_affiliation": "Federal Medical Centre",
    "years_of_experience": 8,
    
    "government_id": "https://storage.example.com/gov-id.pdf",
    "government_id_status": "pending",
    
    "annual_license": "https://storage.example.com/license.pdf",
    "annual_license_status": "pending",
    
    "nursing_degree": "https://storage.example.com/degree.pdf",
    "nursing_degree_status": "pending"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Nurse profile updated successfully"
}
```

---

### PARTNER - Complete Business Info
```json
{
  "user_id": "uuid-here",
  "role": "partner",
  "profile_data": {
    "business_name": "Hassan Pharmacy Ltd",
    "business_category": "pharmacy",
    "business_city": "Kano",
    "phone_number": "+2347012345678",
    "business_address": "123 Business Street",
    "business_registration_number": "RC/2024/123456"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Partner profile updated successfully"
}
```

---

## Email Verification

### POST `/api/auth/verify-email`

Verify user email with token from verification link.

**Request:**
```json
{
  "token": "ee_verification_token_from_email_link"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

## Resend Verification Email

### POST `/api/auth/resend-verification`

Request a new verification email.

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

## Error Responses

### Invalid Role
```json
{
  "error": "Invalid role. Must be one of: patient, doctor, nurse, partner, user"
}
```

### Missing Required Fields
```json
{
  "error": "Missing required fields for doctor role: license_id, specialization, phone_number"
}
```

### Password Too Weak
```json
{
  "error": "Password must be at least 8 characters"
}
```

### Email Already Exists
```json
{
  "error": "Email already registered"
}
```

### Profile Update Failed
```json
{
  "error": "Failed to update patient profile",
  "details": "Database error details"
}
```

---

## Implementation Notes

1. **Required Fields Validation:**
   - All roles require: email, password, full_name, state, role
   - Patient: age, phone_number, gender, blood_type
   - Doctor: license_id, specialization, phone_number
   - Nurse: license_id, certification, department, phone_number
   - Partner: business_name, business_category, business_city

2. **Document Uploads:**
   - Pass file URLs or base64 encoded strings
   - Status fields auto-set to "pending" if not provided
   - Admin review required for verification

3. **OB/GYN Fields:**
   - Only for patients with gender = "female"
   - Automatically cleared for male patients

4. **Wallet Creation:**
   - Automatically created for all roles
   - Initial balance: 0 NGN

5. **Email Verification:**
   - Required before using account
   - Token expires after 24 hours
   - Can request resend
