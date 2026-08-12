# API ENDPOINTS REFERENCE
## Complete API Endpoint Documentation

**Base URL:** `http://localhost:3000/api` (development) or your deployment URL

---

## Authentication Endpoints

### 1. Signup (All Roles)

**Endpoint:** `POST /auth/signup-all-roles`

**Purpose:** Create a new user account with role-specific data

**Request Headers:**
```
Content-Type: application/json
```

**Request Body (Patient):**
```json
{
  "email": "patient@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe",
  "role": "patient",
  "phone": "+234-900-1234567"
}
```

**Request Body (Doctor):**
```json
{
  "email": "doctor@example.com",
  "password": "SecurePass123!",
  "full_name": "Dr. Chioma Okafor",
  "role": "doctor",
  "phone": "+234-800-1234567",
  "specialization": "Cardiology",
  "license_number": "MDCN/2024/00001",
  "years_of_experience": 5
}
```

**Request Body (Nurse):**
```json
{
  "email": "nurse@example.com",
  "password": "SecurePass123!",
  "full_name": "Nurse Adekunle",
  "role": "nurse",
  "phone": "+234-810-1234567",
  "license_number": "NMCN/2024/00001",
  "specialization": "ICU"
}
```

**Request Body (Partner):**
```json
{
  "email": "partner@example.com",
  "password": "SecurePass123!",
  "full_name": "Partner Name",
  "role": "partner",
  "phone": "+234-700-1234567",
  "company_name": "Healthcare Partners Ltd",
  "business_registration_number": "BN/2024/001"
}
```

**Successful Response (200):**
```json
{
  "success": true,
  "message": "User created successfully",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "patient@example.com",
  "role": "patient"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Email already exists"
}
```

**Other Error Codes:**
- `400` - Validation error (invalid email, weak password, missing fields)
- `409` - Email already exists
- `500` - Database error
- `503` - Supabase or n8n service unavailable

**Validation Rules:**
- Email: Valid format (xxx@xxx.xxx)
- Password: Minimum 8 characters
- Role: One of (patient, doctor, nurse, partner, user)
- Required fields vary by role

---

### 2. Verify Email

**Endpoint:** `POST /auth/verify-email`

**Purpose:** Confirm email ownership using token from email link

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Successful Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "patient@example.com"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

**Error Codes:**
- `400` - Invalid token or token expired (>24 hours)
- `404` - Token not found
- `500` - Database error

**Token Details:**
- Expires after: 24 hours
- Format: Random 32-character string
- Generated during signup
- One-time use only

---

### 3. Resend Verification Email

**Endpoint:** `POST /auth/resend-verification`

**Purpose:** Generate new verification token and resend email

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "patient@example.com"
}
```

**Successful Response (200):**
```json
{
  "success": true,
  "message": "Verification email sent",
  "email": "patient@example.com",
  "token": "new-token-generated"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Email not found"
}
```

**Error Codes:**
- `400` - Email not found or invalid
- `429` - Too many requests (wait before retrying)
- `500` - Email service error

---

## Document Endpoints

### 4. Upload Document

**Endpoint:** `POST /documents/upload`

**Purpose:** Upload credential documents for healthcare professionals

**Request Headers:**
```
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
```
file: <binary file>
user_id: 550e8400-e29b-41d4-a716-446655440000
role: doctor
document_type: government_id
```

**Document Types:**

**Doctors:**
- `government_id` - National ID, Passport, or Driver's License
- `annual_license` - MDCN Annual Practicing License
- `medical_degree` - Bachelor's Degree Certificate
- `registration_certificate` - Medical Council Registration

**Nurses:**
- `government_id` - National ID, Passport, or Driver's License
- `annual_license` - NMCN Annual Practicing License
- `nursing_degree` - Nursing Qualification Certificate

**Successful Response (200):**
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "document": {
    "id": "650e8400-e29b-41d4-a716-446655440001",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "document_type": "government_id",
    "file_name": "ID_Scan.pdf",
    "file_size": 2048000,
    "verification_status": "pending",
    "created_at": "2024-06-01T10:30:00Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Invalid file type. Allowed: PDF, DOC, DOCX, JPG, PNG"
}
```

**Validation Rules:**
- File types: PDF, DOC, DOCX, JPG, PNG only
- File size: Maximum 10MB
- Role: doctor or nurse
- Document type: Must match role requirements

**Error Codes:**
- `400` - Validation error (file type, size, or format)
- `401` - Unauthorized (invalid user_id)
- `413` - Payload too large (file > 10MB)
- `500` - Storage or database error

**File Storage Path:**
```
documents/{role}/{user_id}/{document_type}/{timestamp}.{extension}
Example: documents/doctor/550e8400-e29b-41d4-a716-446655440000/government_id/1717231800.pdf
```

---

### 5. List Documents (Admin)

**Endpoint:** `GET /documents/list`

**Purpose:** Retrieve documents for admin verification

**Request Headers:**
```
x-admin-token: your-admin-token
Content-Type: application/json
```

**Query Parameters:**
```
?role=doctor&verification_status=pending&page=1&limit=20
```

**Parameters:**
- `role` (optional): Filter by "doctor" or "nurse"
- `verification_status` (optional): "pending", "verified", or "rejected"
- `page` (optional): Page number (default 1)
- `limit` (optional): Items per page (default 20, max 100)

**Successful Response (200):**
```json
{
  "success": true,
  "documents": [
    {
      "id": "650e8400-e29b-41d4-a716-446655440001",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "role": "doctor",
      "document_type": "government_id",
      "file_name": "ID_Scan.pdf",
      "file_size": 2048000,
      "verification_status": "pending",
      "created_at": "2024-06-01T10:30:00Z",
      "profiles": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "full_name": "Dr. Chioma Okafor",
        "email": "doctor@example.com",
        "phone": "+234-800-1234567"
      },
      "doctors": {
        "id": "750e8400-e29b-41d4-a716-446655440002",
        "specialization": "Cardiology",
        "license_number": "MDCN/2024/00001"
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

**Error Response (401):**
```json
{
  "success": false,
  "error": "Invalid admin token"
}
```

**Error Codes:**
- `400` - Invalid query parameters
- `401` - Missing or invalid admin token
- `500` - Database error

---

### 6. Verify Document (Admin)

**Endpoint:** `POST /documents/verify`

**Purpose:** Approve or reject documents during admin review

**Request Headers:**
```
x-admin-token: your-admin-token
Content-Type: application/json
```

**Request Body (Approve):**
```json
{
  "document_id": "650e8400-e29b-41d4-a716-446655440001",
  "verification_status": "verified",
  "verification_notes": "All documents in order. Approved for practice."
}
```

**Request Body (Reject):**
```json
{
  "document_id": "650e8400-e29b-41d4-a716-446655440001",
  "verification_status": "rejected",
  "verification_notes": "Document is unclear. Please resubmit a clearer scan."
}
```

**Successful Response (200):**
```json
{
  "success": true,
  "message": "Document verified successfully",
  "document": {
    "id": "650e8400-e29b-41d4-a716-446655440001",
    "verification_status": "verified",
    "verified_at": "2024-06-01T11:45:00Z",
    "verified_by": "admin-user-id"
  },
  "professional_verified": true,
  "notes": "All documents for this professional verified. Profile marked as verified."
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Document not found"
}
```

**Error Codes:**
- `400` - Invalid request or document not found
- `401` - Missing or invalid admin token
- `422` - Invalid verification status
- `500` - Database error

**Verification Logic:**
- When document approved: Sets `verification_status = "verified"`
- Checks if ALL documents for that professional are verified
- If all verified: Sets `verified_by_admin = true` on doctor/nurse profile
- Professional can then offer consultations/services

---

## Profile Endpoints

### 7. Complete Profile

**Endpoint:** `POST /profile/complete-profile`

**Purpose:** Add role-specific information to user profile

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer {auth_token}
```

**Request Body (Patient):**
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "date_of_birth": "1990-05-15",
  "gender": "male",
  "blood_type": "O+",
  "height_cm": 175,
  "weight_kg": 75,
  "allergies": "Penicillin",
  "chronic_conditions": "Hypertension",
  "emergency_contact_name": "Jane Doe",
  "emergency_contact_phone": "+234-900-7654321",
  "emergency_contact_relation": "Sister"
}
```

**Request Body (Patient - Female with OB/GYN):**
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "date_of_birth": "1985-03-20",
  "gender": "female",
  "blood_type": "A+",
  "pregnancy_status": "not_pregnant",
  "number_of_pregnancies": 2,
  "number_of_children": 1,
  "contraception_method": "oral_pills",
  "last_menstrual_period": "2024-05-28",
  "menstrual_cycle_length": 28
}
```

**Request Body (Doctor):**
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "medical_school": "University of Lagos",
  "graduation_year": 2015,
  "board_certification": "ECFMG",
  "hospital_affiliation": "Lagos State University Teaching Hospital",
  "clinic_name": "Cardio Clinic Lagos",
  "clinic_address": "123 Main Street, Lagos",
  "clinic_phone": "+234-800-1234567",
  "consultation_fee": 5000
}
```

**Request Body (Nurse):**
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "nursing_school": "College of Nursing, Ibadan",
  "graduation_year": 2018,
  "certifications": "BScN, ACLS",
  "hospital_affiliation": "Federal Teaching Hospital",
  "hourly_rate": 3000
}
```

**Successful Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "role": "patient",
  "profile_complete": true
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "User not found"
}
```

**Error Codes:**
- `400` - Validation error or user not found
- `401` - Unauthorized (user not authenticated)
- `500` - Database error

---

## Error Handling

### Standard Error Response Format

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional context if available",
  "code": "ERROR_CODE"
}
```

### HTTP Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Request successful |
| 400 | Bad Request | Invalid parameters or validation error |
| 401 | Unauthorized | Missing or invalid authentication |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Email already exists |
| 413 | Payload Too Large | File size exceeds limit |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Database or server error |
| 503 | Service Unavailable | Supabase or n8n down |

---

## Authentication

### Required Headers for Protected Endpoints

```
Authorization: Bearer {auth_token}
```

For admin endpoints:

```
x-admin-token: {admin_verification_token}
```

---

## Rate Limiting

- **Signup:** 5 attempts per 15 minutes per IP
- **Email Verification:** 3 attempts per 15 minutes per email
- **Document Upload:** 10 uploads per hour per user
- **Admin Endpoints:** 100 requests per hour per admin

---

## Testing with cURL

### Signup Example
```bash
curl -X POST http://localhost:3000/api/auth/signup-all-roles \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "full_name": "Test User",
    "role": "patient"
  }'
```

### Document Upload Example
```bash
curl -X POST http://localhost:3000/api/documents/upload \
  -F "file=@ID.pdf" \
  -F "user_id=550e8400-e29b-41d4-a716-446655440000" \
  -F "role=doctor" \
  -F "document_type=government_id"
```

### List Documents Example (Admin)
```bash
curl -X GET "http://localhost:3000/api/documents/list?verification_status=pending&role=doctor" \
  -H "x-admin-token: your-admin-token"
```

### Verify Document Example (Admin)
```bash
curl -X POST http://localhost:3000/api/documents/verify \
  -H "Content-Type: application/json" \
  -H "x-admin-token: your-admin-token" \
  -d '{
    "document_id": "650e8400-e29b-41d4-a716-446655440001",
    "verification_status": "verified",
    "verification_notes": "Approved"
  }'
```

---

## Webhook Integration (n8n)

When a user signs up, the API triggers an n8n webhook:

```
POST {N8N_WEBHOOK_URL}
```

**Payload:**
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "patient@example.com",
  "full_name": "John Doe",
  "role": "patient"
}
```

The webhook creates the base profile and sends verification email.

---

**Last Updated:** June 2026  
**Version:** 1.0.0
