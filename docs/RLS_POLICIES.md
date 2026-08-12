# Emergency Echo - Row Level Security (RLS) Policies

This document describes the Row-Level Security (RLS) policies that should be configured in Supabase to ensure data privacy and security.

## Overview

Row-Level Security (RLS) is enabled at the database level to ensure users can only access their own data and admin-authorized data. This prevents unauthorized data access even if authentication is somehow bypassed.

## RLS Policies by Table

### profiles

**Purpose**: Store user profile information

**Access Rules**:
- Users can view their own profile
- Users can update their own profile
- Admins can view and update all profiles
- Patients can view doctor profiles (for appointments)

**Recommended Policies**:

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Patients can view doctor profiles (for directory/search)
CREATE POLICY "Patients can view doctors"
  ON profiles FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'patient'
    )
    AND role = 'doctor'
  );
```

### document_uploads

**Purpose**: Store file uploads for credential verification

**Access Rules**:
- Users can view their own documents
- Users can create documents for themselves
- Admins can view and update all documents
- Service role (backend) can insert/update for API operations

**Recommended Policies**:

```sql
-- Enable RLS
ALTER TABLE document_uploads ENABLE ROW LEVEL SECURITY;

-- Users can view their own documents
CREATE POLICY "Users can view own documents"
  ON document_uploads FOR SELECT
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Users can insert their own documents
CREATE POLICY "Users can insert own documents"
  ON document_uploads FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Only admins can update verification status
CREATE POLICY "Admins can update documents"
  ON document_uploads FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Admins can delete documents
CREATE POLICY "Admins can delete documents"
  ON document_uploads FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
```

### email_verifications

**Purpose**: Store email verification tokens

**Access Rules**:
- Service role only (backend operations)
- Users should NOT have direct access
- Tokens are ephemeral (expire after 24 hours)

**Recommended Policies**:

```sql
-- Enable RLS
ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;

-- No public policies - only service role can access
-- This table should only be accessed from backend via service role key

-- Deny all public/auth access
CREATE POLICY "Service role only"
  ON email_verifications FOR ALL
  USING (FALSE);

-- NOTE: Service role (SUPABASE_SERVICE_ROLE_KEY) bypasses RLS
-- so it can still insert/update/delete via backend code
```

### patients (if exists)

**Purpose**: Patient-specific profile information

**Access Rules**:
- Patients can view their own record
- Doctors can view their patients
- Admins can view all patients

**Recommended Policies**:

```sql
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Patients can view themselves
CREATE POLICY "Patients can view own record"
  ON patients FOR SELECT
  USING (user_id = auth.uid());

-- Doctors can view their patients (via appointment/relationship)
CREATE POLICY "Doctors can view assigned patients"
  ON patients FOR SELECT
  USING (
    user_id IN (
      SELECT patient_id FROM doctor_patients 
      WHERE doctor_id = auth.uid()
    )
  );

-- Admins can view all patients
CREATE POLICY "Admins can view all patients"
  ON patients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
```

### doctors (if exists)

**Purpose**: Doctor-specific profile and verification info

**Access Rules**:
- Doctors can view/update their own record
- Patients can view approved doctors
- Admins can view and update all doctors

**Recommended Policies**:

```sql
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

-- Doctors can view/update their own record
CREATE POLICY "Doctors can view own record"
  ON doctors FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Doctors can update own record"
  ON doctors FOR UPDATE
  USING (user_id = auth.uid());

-- Patients can view verified doctors
CREATE POLICY "Patients can view verified doctors"
  ON doctors FOR SELECT
  USING (
    verified_by_admin = true
    AND
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'patient'
    )
  );

-- Admins can view all doctors
CREATE POLICY "Admins can view all doctors"
  ON doctors FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Admins can update all doctors
CREATE POLICY "Admins can update doctors"
  ON doctors FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
```

### nurses (if exists)

**Purpose**: Nurse-specific profile and verification info

**Access Rules**: Similar to doctors

**Recommended Policies**:

```sql
ALTER TABLE nurses ENABLE ROW LEVEL SECURITY;

-- Nurses can view/update their own record
CREATE POLICY "Nurses can view own record"
  ON nurses FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Nurses can update own record"
  ON nurses FOR UPDATE
  USING (user_id = auth.uid());

-- Healthcare providers can view verified nurses
CREATE POLICY "Doctors can view assigned nurses"
  ON nurses FOR SELECT
  USING (verified_by_admin = true);

-- Admins can view and update all nurses
CREATE POLICY "Admins can view all nurses"
  ON nurses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can update nurses"
  ON nurses FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
```

---

## Service Role Bypass

The **service role key** (SUPABASE_SERVICE_ROLE_KEY) bypasses all RLS policies. This is intentional and used for:

- Backend API operations that need to create/update data on behalf of users
- Admin operations that modify multiple records
- System processes (cleanup, migrations, etc.)

**Important**: The service role key is ONLY used on the backend (server-side code) and never exposed to clients.

### Example Backend Usage

```javascript
// Backend code (API route)
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // Service role key - never expose to client
)

// This bypasses RLS and can create/update any record
await supabase
  .from('profiles')
  .insert({
    id: userId,
    email: userEmail,
    full_name: userName,
    role: 'patient'
  })
```

---

## Testing RLS Policies

### Test with Admin User

```sql
-- Login as admin user
SET session auth.uid = 'admin-user-id-here';

-- Admin should be able to view all profiles
SELECT * FROM profiles;  -- Should return all rows

-- Admin should be able to update any profile
UPDATE profiles SET full_name = 'New Name' WHERE id = 'any-user-id';
-- Should work
```

### Test with Regular User

```sql
-- Login as regular user
SET session auth.uid = 'regular-user-id-here';

-- Regular user should only see their own profile
SELECT * FROM profiles;  -- Should return only own row

-- Regular user should NOT be able to see other users' documents
SELECT * FROM document_uploads WHERE user_id != auth.uid();
-- Should return empty (blocked by RLS)
```

### Test with Client SDK

```javascript
// In browser/client code
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(ANON_KEY)  // Anon key respects RLS

// Login as user
await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// Try to view another user's profile
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', 'other-user-id')  // Different user

// Should return empty array or error (RLS blocks access)
```

---

## Debugging RLS Issues

### Enable RLS Debugging

```sql
-- Check if RLS is enabled on a table
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'profiles';

-- Should show "t" (true) for rowsecurity
```

### Common RLS Problems

1. **Getting empty results when expecting data**
   - Check if the session user ID (`auth.uid()`) is set correctly
   - Verify the policy condition matches your use case
   - Check if RLS is actually enabled on the table

2. **Service role queries failing**
   - Verify you're using the correct service role key
   - Service role should bypass RLS entirely
   - If still failing, check for other constraints (NOT NULL, UNIQUE, etc.)

3. **Admin can't access other users' data**
   - Verify admin user has `role = 'admin'` in profiles table
   - Check that the policy correctly checks for admin role
   - Test with SELECT first before testing UPDATE

---

## Performance Considerations

RLS policies add a small performance overhead. To optimize:

1. **Use indexed columns** in policy conditions
   - Index `auth.uid()` if checking user ownership
   - Index `role` column for admin checks

2. **Avoid complex subqueries** in policies
   - Simple conditions are faster
   - Cache frequently accessed relationships

3. **Monitor slow queries** with RLS
   - Use Supabase dashboard to identify slow policies
   - Refactor overly complex conditions

---

## Security Best Practices

1. **Always enable RLS** on tables with sensitive data
2. **Test policies thoroughly** before production
3. **Deny by default** - only allow what's explicitly needed
4. **Use service role carefully** - only for necessary operations
5. **Audit policy changes** - log who modified what
6. **Document your policies** - so team understands data access

---

## Related Documentation

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [SECURITY_SETUP.md](../SECURITY_SETUP.md) - Overall security configuration
- [API_ENDPOINTS_REFERENCE.md](../API_ENDPOINTS_REFERENCE.md) - API route documentation
