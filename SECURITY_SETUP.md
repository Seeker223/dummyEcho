# Emergency Echo - Security Setup Guide

This guide walks through configuring all security-critical environment variables and validating your deployment is secure.

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Variables Setup](#environment-variables-setup)
3. [Supabase Configuration](#supabase-configuration)
4. [n8n Webhook Integration](#n8n-webhook-integration)
5. [Rate Limiting & CORS](#rate-limiting--cors)
6. [Input Sanitization](#input-sanitization)
7. [Admin Authentication](#admin-authentication)
8. [Testing & Validation](#testing--validation)
9. [Production Deployment](#production-deployment)

---

## Pre-Deployment Checklist

Before deploying to production, ensure:

- [ ] All environment variables from `.env.production.template` are configured
- [ ] Supabase project is created and credentials are obtained
- [ ] n8n workflows are set up and webhook URLs are active
- [ ] Rate limiting is enabled on auth endpoints
- [ ] CORS is configured for your production domain
- [ ] Admin authentication is using Supabase bearer tokens
- [ ] No hardcoded secrets remain in the codebase
- [ ] Database has Row-Level Security (RLS) policies configured
- [ ] Application has been tested with all features in staging

---

## Environment Variables Setup

### 1. Local Development Setup

```bash
# Copy the template to your local environment file
cp frontend/.env.production.template frontend/.env.local

# Edit the file and add your actual values
# For development, you can use test/staging credentials
```

### 2. Vercel Environment Variables

If deploying to Vercel:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable from `.env.production.template`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (Production only)
   - `N8N_SIGNUP_WEBHOOK_URL`
   - `N8N_LOGIN_WEBHOOK_URL`
   - `N8N_EMAIL_WEBHOOK_URL`
   - `N8N_PASSWORD_RESET_WEBHOOK_URL`
   - `NEXT_PUBLIC_APP_URL`
   - `CORS_ALLOWED_ORIGINS`

4. Set the environment to **Production** for sensitive variables

### 3. Variable Validation

The application automatically validates required variables on startup:

```
If validation fails, you'll see:
  ERROR: Missing required environment variables
  CRITICAL: Missing SUPABASE_SERVICE_ROLE_KEY
```

---

## Supabase Configuration

### Getting Your Credentials

1. Go to **Supabase Dashboard** → Your Project
2. Click **Settings** → **API**
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service role secret** → `SUPABASE_SERVICE_ROLE_KEY`

### Important Security Notes

- **Anon Key**: Can be public (exposed in JavaScript), used for client-side auth
- **Service Role Key**: MUST be secret, only used on backend for admin operations
- Never commit these keys to version control
- Rotate keys regularly (Supabase: Settings → API → Rotate Key)

### Required Database Setup

Ensure these tables exist with proper structure:

```sql
-- Profiles table (required)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  email VARCHAR NOT NULL UNIQUE,
  full_name VARCHAR,
  role VARCHAR CHECK (role IN ('patient', 'doctor', 'nurse', 'partner', 'admin')),
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Document uploads (required for credential verification)
CREATE TABLE IF NOT EXISTS document_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  document_type VARCHAR,
  file_path VARCHAR,
  verification_status VARCHAR CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Email verifications (required for email verification flow)
CREATE TABLE IF NOT EXISTS email_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  email VARCHAR NOT NULL,
  token VARCHAR NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## n8n Webhook Integration

### Setting Up Webhooks

1. **Create n8n Workflows**:
   - Signup workflow
   - Login workflow
   - Email verification workflow
   - Password reset workflow

2. **Add Webhook Trigger** to each workflow:
   - Right-click → **Add Node** → **Webhook**
   - Set **Request Method**: POST
   - Set **Authentication**: None (or add API key validation)
   - Copy the **Webhook URL**

3. **Add to Environment Variables**:

```env
N8N_SIGNUP_WEBHOOK_URL=https://n8n.example.com/webhook/abc123/signup
N8N_LOGIN_WEBHOOK_URL=https://n8n.example.com/webhook/abc123/login
N8N_EMAIL_WEBHOOK_URL=https://n8n.example.com/webhook/abc123/email
N8N_PASSWORD_RESET_WEBHOOK_URL=https://n8n.example.com/webhook/ee-password-reset
```

### Expected Request/Response Formats

#### Signup Request
```json
{
  "email": "user@example.com",
  "password_hash": "hashed_password",
  "full_name": "John Doe",
  "role": "doctor",
  "phone": "+1234567890"
}
```

#### Signup Response
```json
{
  "success": true,
  "message": "Account created successfully",
  "user_id": "uuid"
}
```

#### Login Request
```json
{
  "email": "user@example.com",
  "password": "plaintext_password"
}
```

#### Login Response
```json
{
  "access_token": "jwt_token",
  "refresh_token": "refresh_token",
  "user_id": "uuid",
  "role": "doctor"
}
```

### Security Best Practices

1. **Validate** webhook payloads on n8n side
2. **Add authentication** (API key header) to webhooks
3. **Log all** webhook invocations for audit trails
4. **Implement timeout** (max 30 seconds) for n8n workflows
5. **Validate passwords** use bcrypt or argon2 hashing
6. **Test webhooks** with invalid/malicious payloads

---

## Rate Limiting & CORS

### Rate Limiting Configuration

The application implements per-IP rate limiting:

- **Signup**: 5 requests/minute
- **Login**: 10 requests/minute
- **Email Verification**: 3 requests/minute
- **Password Reset**: 3 requests/minute

Rate limit headers are returned:
```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 2
X-RateLimit-Reset: 2025-01-15T10:30:00Z
```

For production high-traffic deployments, migrate to Redis:

```javascript
// In middleware/rateLimiter.js (future enhancement)
import { Ratelimit } from '@upstash/ratelimit'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'),
})
```

### CORS Configuration

CORS headers are automatically applied to all API routes:

```env
# Allow your production domain
CORS_ALLOWED_ORIGINS=https://app.example.com,https://api.example.com

# Development automatically allows localhost
```

---

## Input Sanitization

All user inputs are automatically sanitized:

```javascript
// Email inputs are sanitized
sanitizeEmail("test@example.com") 
// → "test@example.com"

// Names remove special characters
sanitizeName("John O'Connor") 
// → "John O'Connor"

// HTML tags are escaped
sanitizeString("<script>alert('xss')</script>")
// → "&lt;script&gt;alert('xss')&lt;/script&gt;"
```

### Tested Attack Vectors

- SQL injection
- XSS (Cross-Site Scripting)
- HTML injection
- Script tag injection
- Event handler injection
- Data URL attacks

---

## Admin Authentication

### How It Works

1. Admin users have `role = 'admin'` in the `profiles` table
2. Admin endpoints require a valid **Supabase JWT bearer token**
3. Token is verified and user role is checked on every request
4. Response: 403 Forbidden if user is not admin

### Testing Admin Access

```bash
# 1. Get admin user's session token (from login or SDK)
TOKEN="eyJ0eXAiOiJKV1QiLCJhbGc..."

# 2. Make request with Authorization header
curl -H "Authorization: Bearer $TOKEN" \
  https://your-app.com/api/admin/analytics

# 3. Expected response (if user is admin)
{
  "patients": 42,
  "doctors": { "verified": 15, "unverified": 5, "total": 20 },
  "nurses": { ... },
  "documents": { ... }
}
```

---

## Testing & Validation

### 1. Test Environment Variables

```bash
# The app automatically validates on startup
npm run dev

# You should see no errors about missing variables
```

### 2. Test Rate Limiting

```bash
# Make 6 rapid signup requests
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/signup-all-roles \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"test","full_name":"Test","role":"patient"}'
done

# 6th request should return 429 Too Many Requests
```

### 3. Test CORS

```bash
# Request from different origin
curl -H "Origin: https://other-domain.com" \
  -H "Access-Control-Request-Method: POST" \
  -X OPTIONS http://localhost:3000/api/auth/signup-all-roles -v

# Should return CORS headers (or 403 if not in allowed origins)
```

### 4. Test Input Sanitization

```bash
# Try SQL injection
curl -X POST http://localhost:3000/api/auth/signup-all-roles \
  -H "Content-Type: application/json" \
  -d '{"email":"test\'; DROP TABLE users; --@example.com","password":"test","full_name":"Test","role":"patient"}'

# Should be safely escaped/rejected
```

### 5. Test Admin Authentication

```bash
# Without token (should fail)
curl http://localhost:3000/api/admin/analytics
# → 401 Unauthorized

# With non-admin token (should fail)
curl -H "Authorization: Bearer patient-token" \
  http://localhost:3000/api/admin/analytics
# → 403 Forbidden

# With admin token (should succeed)
curl -H "Authorization: Bearer admin-token" \
  http://localhost:3000/api/admin/analytics
# → 200 OK with analytics data
```

---

## Production Deployment

### Pre-Deployment Verification

```bash
# 1. Build the project
npm run build

# 2. Check for build errors
# (Should complete without errors)

# 3. Verify no secrets in code
grep -r "eyJ\|sk_live\|AKIA" frontend/src --exclude-dir=node_modules

# 4. Run security audit
npm audit
# (Address high/critical vulnerabilities)
```

### Deployment Steps

1. **Set all environment variables** in your deployment platform
2. **Deploy to production** (Vercel, Railway, etc.)
3. **Verify environment variables** are set:
   - Dashboard → Settings → Environment Variables
   - All required vars should be listed
4. **Test production endpoints**:
   - Signup with valid email
   - Login with credentials
   - Upload documents
   - Access admin dashboard

### Monitoring

After deployment, monitor:

- **Authentication errors** - Check logs for failed login attempts
- **Rate limiting** - Monitor 429 responses (normal under attack)
- **CORS errors** - Check browser console for cross-origin blocks
- **API errors** - Monitor 500/502 errors from n8n webhooks
- **Missing variables** - Watch for startup errors about env vars

### Rollback Plan

If issues occur:

1. Check logs for specific error messages
2. Review `SECURITY_SETUP.md` section relevant to error
3. Verify all environment variables are correctly set
4. Test with staging environment first
5. Redeploy with fixes

---

## Support

For security issues or questions:

1. Check this guide's relevant section
2. Review `API_ENDPOINTS_REFERENCE.md` for endpoint details
3. Check application logs for error messages
4. Review browser console for client-side errors

Never share credentials or secret keys when asking for help.
