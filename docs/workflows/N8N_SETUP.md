# n8N WORKFLOW CONFIGURATION GUIDE
## Complete Setup and Data Structures

**Version:** 1.0.0  
**Updated:** June 2026

---

## Workflow Overview

The n8n workflow automates the signup process:

1. Receives webhook request from API
2. Builds base profile data
3. Saves profile to database
4. Checks user role
5. Builds role-specific data
6. Saves to role-specific table
7. Creates wallet (NGN 0 balance)
8. Builds welcome email
9. Sends email notification
10. Returns success response

**Total Nodes:** 12  
**Execution Time:** ~2-5 seconds

---

## Prerequisites

### n8n Setup Options

**Option A: n8n Cloud (Recommended for Quick Start)**
- Go to https://n8n.cloud
- Sign up for free account
- No installation needed

**Option B: Self-Hosted n8n**
```bash
# Using Docker
docker run -it --rm --name n8n -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n

# Then go to http://localhost:5678
```

---

## Workflow Nodes & Configuration

### Node 1: Webhook (Trigger)

**Type:** Webhook  
**Method:** POST  
**Event:** Whenever it's called

**Configuration:**
1. Click node
2. Copy webhook URL
3. Add to backend `.env.local`:
   ```env
   N8N_WEBHOOK_URL=https://n8n.cloud/webhook/xxxxx
   ```

**Expected Payload:**
```json
{
  "user_id": "uuid",
  "email": "user@example.com",
  "full_name": "User Name",
  "role": "patient",
  // Role-specific fields as per role
}
```

---

### Node 2: Build Base Profile

**Type:** Set  
**Purpose:** Prepare profile data for database

**Configuration:**
```
Key: profile
Value (JSON):
{
  "id": "{{ $json.user_id }}",
  "email": "{{ $json.email }}",
  "full_name": "{{ $json.full_name }}",
  "role": "{{ $json.role }}",
  "created_at": "{{ now().toISOString() }}"
}
```

**Output:**
```json
{
  "profile": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "patient@example.com",
    "full_name": "John Doe",
    "role": "patient",
    "created_at": "2024-06-01T10:30:00Z"
  }
}
```

---

### Node 3: Save Base Profile

**Type:** Supabase  
**Action:** Insert  
**Table:** profiles

**Configuration:**
1. Select Supabase credential
2. Table: `profiles`
3. Columns:
   - `id`: `{{ $json.profile.id }}`
   - `email`: `{{ $json.profile.email }}`
   - `full_name`: `{{ $json.profile.full_name }}`
   - `role`: `{{ $json.profile.role }}`
   - `created_at`: `{{ $json.profile.created_at }}`

---

### Nodes 4-7: Role Checks (Conditional)

**Type:** If statement  
**Purpose:** Route data to correct role handler

**Node 4: Is Patient?**
```
Condition: $json.role === 'patient'
If true → Build Patient Data
If false → Next check
```

**Node 5: Is Doctor?**
```
Condition: $json.role === 'doctor'
If true → Build Doctor Data
If false → Next check
```

**Node 6: Is Nurse?**
```
Condition: $json.role === 'nurse'
If true → Build Nurse Data
If false → Next check
```

**Node 7: Is Partner?**
```
Condition: $json.role === 'partner'
If true → Build Partner Data
If false → Next check
```

---

## Data Structures by Role

### Patient Data Structure

```json
{
  "profile_id": "550e8400-e29b-41d4-a716-446655440000",
  "date_of_birth": "{{ $json.date_of_birth || null }}",
  "gender": "{{ $json.gender || null }}",
  "blood_type": "{{ $json.blood_type || null }}",
  "height_cm": "{{ $json.height_cm || null }}",
  "weight_kg": "{{ $json.weight_kg || null }}",
  "allergies": "{{ $json.allergies || null }}",
  "chronic_conditions": "{{ $json.chronic_conditions || null }}",
  "created_at": "{{ now().toISOString() }}"
}
```

**Save to Table:** `patients`

### Doctor Data Structure

```json
{
  "profile_id": "550e8400-e29b-41d4-a716-446655440000",
  "license_number": "{{ $json.license_number }}",
  "specialization": "{{ $json.specialization }}",
  "sub_specialization": "{{ $json.sub_specialization || null }}",
  "years_of_experience": "{{ $json.years_of_experience || 0 }}",
  "medical_school": "{{ $json.medical_school || null }}",
  "graduation_year": "{{ $json.graduation_year || null }}",
  "verified_by_admin": false,
  "documents_verified_count": 0,
  "created_at": "{{ now().toISOString() }}"
}
```

**Save to Table:** `doctors`

**Required Fields:**
- license_number
- specialization

**Medical Specializations:**
- Cardiology
- Internal Medicine
- Emergency Medicine
- Orthopedics
- Pediatrics
- Obstetrics & Gynecology
- Psychiatry
- Surgery
- Neurology
- Oncology
- Radiology
- Dermatology
- Ophthalmology
- ENT (Otolaryngology)
- Pulmonology
- Gastroenterology
- Urology
- Pathology
- Anesthesiology
- General Practice

### Nurse Data Structure

```json
{
  "profile_id": "550e8400-e29b-41d4-a716-446655440000",
  "license_number": "{{ $json.license_number }}",
  "registration_number": "{{ $json.registration_number || null }}",
  "specialization": "{{ $json.specialization || 'General' }}",
  "years_of_experience": "{{ $json.years_of_experience || 0 }}",
  "nursing_school": "{{ $json.nursing_school || null }}",
  "graduation_year": "{{ $json.graduation_year || null }}",
  "verified_by_admin": false,
  "documents_verified_count": 0,
  "created_at": "{{ now().toISOString() }}"
}
```

**Save to Table:** `nurses`

**Required Fields:**
- license_number

**Specializations:**
- General
- ICU (Intensive Care)
- Emergency
- Pediatric
- Psychiatric
- Community Health
- Operating Room
- Midwifery

### Partner Data Structure

```json
{
  "profile_id": "550e8400-e29b-41d4-a716-446655440000",
  "company_name": "{{ $json.company_name }}",
  "business_type": "{{ $json.business_type || null }}",
  "business_registration_number": "{{ $json.business_registration_number || null }}",
  "business_address": "{{ $json.business_address || null }}",
  "is_super_admin": false,
  "admin_level": "partner",
  "can_verify_documents": false,
  "is_active": true,
  "created_at": "{{ now().toISOString() }}"
}
```

**Save to Table:** `partners`

**Required Fields:**
- company_name

### Wallet Creation

**Table:** `wallets`

```json
{
  "profile_id": "550e8400-e29b-41d4-a716-446655440000",
  "balance": 0.00,
  "currency": "NGN",
  "is_active": true,
  "is_frozen": false,
  "created_at": "{{ now().toISOString() }}"
}
```

---

## Email Configuration

### Node 8: Build Welcome Email

**Type:** Set

**Configuration:**
```
Subject: Welcome to Emergency Echo
To: {{ $json.email }}
Body:
"
Hello {{ $json.full_name }},

Welcome to Emergency Echo! Your account has been created successfully.

Please verify your email address by clicking the link in your verification email.

Best regards,
Emergency Echo Team
"
```

### Node 9: Send Email

**Type:** Email  
**Service:** Gmail, SendGrid, or SMTP

#### Option A: Gmail (Recommended)

**Setup:**
1. Go to Google Account → Security
2. Enable "Less secure app access"
3. Generate app-specific password
4. In n8n:
   - Email Service: Gmail
   - Email: your-email@gmail.com
   - Password: app-specific-password

#### Option B: SendGrid

**Setup:**
1. Go to SendGrid.com, create account
2. Get API key
3. In n8n:
   - Email Service: SendGrid
   - API Key: Your SendGrid API key
   - From Email: noreply@emergencyecho.com

#### Option C: SMTP (Generic)

**Setup:**
1. In n8n, select SMTP
2. Host: smtp.gmail.com (or your provider)
3. Port: 587 (or 465)
4. User: your-email@gmail.com
5. Password: app-password

---

## Workflow Testing

### Test Payload - Patient

```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "patient@test.com",
  "full_name": "Test Patient",
  "role": "patient"
}
```

**Expected Output:**
- Profile created in `profiles` table
- Record created in `patients` table
- Wallet created in `wallets` table (0 NGN balance)
- Verification email sent

### Test Payload - Doctor

```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440001",
  "email": "doctor@test.com",
  "full_name": "Dr. Test Doctor",
  "role": "doctor",
  "specialization": "Cardiology",
  "license_number": "MDCN/2024/TEST001",
  "years_of_experience": 5
}
```

**Expected Output:**
- Profile created in `profiles` table
- Record created in `doctors` table
- verified_by_admin = false
- documents_verified_count = 0
- Wallet created with 0 NGN balance

### Test Payload - Nurse

```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440002",
  "email": "nurse@test.com",
  "full_name": "Nurse Test",
  "role": "nurse",
  "license_number": "NMCN/2024/TEST001",
  "specialization": "ICU"
}
```

---

## Deployment Checklist

- [ ] Supabase credential configured in n8n
- [ ] Webhook URL copied to backend `.env.local`
- [ ] Email service configured (Gmail/SendGrid/SMTP)
- [ ] All 12 nodes connected properly
- [ ] Test payload executed successfully
- [ ] Workflow activated (toggle on)
- [ ] Database records verified after test
- [ ] Email received successfully
- [ ] Error logging configured
- [ ] Documentation updated

---

## Troubleshooting

### Workflow not triggering
- [ ] Check webhook URL is in `.env.local`
- [ ] Verify N8N_WEBHOOK_URL is correct
- [ ] Check workflow is activated (toggle on)
- [ ] Test webhook using curl:
  ```bash
  curl -X POST https://n8n.cloud/webhook/xxxxx \
    -H "Content-Type: application/json" \
    -d '{"user_id":"test","role":"patient"}'
  ```

### Database records not created
- [ ] Check Supabase credential in n8n
- [ ] Verify table names are correct
- [ ] Check RLS policies aren't blocking insertion
- [ ] Review error logs in n8n

### Email not sending
- [ ] Verify email service credentials
- [ ] Check "From" email address is valid
- [ ] For Gmail: ensure app-specific password is used
- [ ] Check n8n email logs for errors

### Webhook connection failed
- [ ] Verify n8n instance is running
- [ ] Check firewall isn't blocking webhook
- [ ] Test webhook URL directly in browser (should show 404)

---

## Monitoring

### Log Webhook Calls

Add a logging node after webhook trigger to log all requests:

**Type:** Set
```
Key: webhook_log
Value: {
  "timestamp": "{{ now().toISOString() }}",
  "email": "{{ $json.email }}",
  "role": "{{ $json.role }}"
}
```

### Alert on Failure

Add notification node after save operations to alert on errors:

**Type:** Email  
**Condition:** IF workflow execution fails
```
Send to: admin@emergencyecho.com
Subject: n8n Workflow Failed
Body: Workflow for {{ $json.email }} failed at {{ $json.role }} processing
```

---

## Advanced Configuration

### Rate Limiting

To prevent abuse, add delay between webhook calls:

**Type:** Wait  
**Wait Time:** 100ms

Place after webhook trigger.

### Data Validation

Add validation node before saving:

**Type:** If statement
```
Condition: $json.email.includes('@')
  AND $json.role in ['patient','doctor','nurse','partner']
If false: Send error response
```

### Duplicate Prevention

Add check to prevent duplicate emails:

**Type:** Supabase
**Action:** Select
**Query:** WHERE email = {{ $json.email }}

If result exists, send "User already exists" error.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | June 2026 | Initial workflow |

---

**Last Updated:** June 2026  
**Maintained By:** Emergency Echo Team
