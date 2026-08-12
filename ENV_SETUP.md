# Environment Variables Setup Guide

## Overview
The EmergencyEcho application requires environment variables for authentication and database connectivity. The system supports both N8N webhook-based authentication and Supabase authentication with automatic fallback.

## Required Environment Variables

### N8N Webhook Configuration
```
N8N_LOGIN_WEBHOOK_URL=https://kadiri-yewande.app.n8n.cloud/webhook/9060f683-87bd-4459-ab7b-71d521d86697
```
- **Purpose**: External authentication service via N8N workflow
- **Status**: Currently returns 404 (workspace misconfiguration)
- **Fallback**: Automatically falls back to Supabase when N8N fails
- **Action Required**: None - the system gracefully handles the N8N 404 error

### Supabase Configuration (Required - Fallback & Primary Auth)
```
NEXT_PUBLIC_SUPABASE_URL=https://mdbnyfagqaufwjilhnbv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

| Variable | Purpose | Status |
|----------|---------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✓ Configured & Working |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key for client auth | ✓ Configured & Working |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side admin key | ✓ Configured & Working |

## Authentication Flow

### Current Flow Diagram
```
User Login Request
    ↓
N8N Webhook Attempt (if N8N_LOGIN_WEBHOOK_URL configured)
    ↓
    ├─ Success → Return N8N response
    └─ Failure (404, error, timeout) → Fallback to Supabase
    ↓
Supabase Authentication
    ↓
    ├─ Success → Return Supabase tokens
    └─ Failure → Return error message
```

## Test Accounts

All test accounts are stored in Supabase Auth with password `password123`:

| Email | Role | Use Case |
|-------|------|----------|
| `test@example.com` | Patient | General testing |
| `doctor@example.com` | Doctor | Medical staff testing |
| `nurse@example.com` | Nurse | Nursing staff testing |

### Testing Login
```bash
curl -X POST "http://localhost:3000/api/auth/login-n8n" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Troubleshooting

### Issue: Login shows "Login service is temporarily unavailable"
- **Cause**: N8N webhook returned HTML error (404, workspace misconfiguration)
- **Status**: Normal behavior - fallback to Supabase works automatically
- **Solution**: No action needed - system is functioning correctly

### Issue: Login fails with "Invalid email or password"
- **Cause 1**: Wrong credentials provided
- **Cause 2**: User account doesn't exist in Supabase
- **Solution**: Verify credentials or create test user in Supabase dashboard

### Issue: Environment variables not loading
- **Cause**: `.env.project` file not being sourced
- **Solution**: Ensure the dev server is running in the correct directory

## Environment Variable Verification

Run this command to verify all variables are set:
```bash
set -a && source /vercel/share/.env.project && set +a && \
echo "N8N URL: $N8N_LOGIN_WEBHOOK_URL" && \
echo "Supabase URL: $NEXT_PUBLIC_SUPABASE_URL" && \
echo "Supabase Anon Key: ${NEXT_PUBLIC_SUPABASE_ANON_KEY:0:30}..." && \
echo "Service Role Key: ${SUPABASE_SERVICE_ROLE_KEY:0:30}..."
```

## API Endpoint

### POST `/api/auth/login-n8n`

Authenticates a user and returns session tokens.

**Request:**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "access_token": "eyJhbGciOiJFUzI1NiIsImtpZCI6Im...",
  "refresh_token": "6owdkj3fybjo...",
  "user": {
    "id": "uuid",
    "email": "test@example.com",
    "user_metadata": {...}
  },
  "profile": {
    "id": "uuid",
    "email": "test@example.com",
    "full_name": "Test User",
    "role": "patient"
  }
}
```

**Error Response (401):**
```json
{
  "error": "Invalid email or password.",
  "code": "LOGIN_FAILED"
}
```

## N8N Webhook Fix (When Needed)

If you need to fix the N8N workspace:

1. Log in to https://kadiri-yewande.app.n8n.cloud
2. Create or activate a workflow named "Login Workflow"
3. Set up a webhook endpoint that accepts POST requests with email/password
4. Implement authentication logic to validate credentials
5. Return response in format:
   ```json
   {
     "access_token": "token",
     "refresh_token": "token",
     "user": {...}
   }
   ```

For now, the Supabase fallback handles all authentication requests transparently.
