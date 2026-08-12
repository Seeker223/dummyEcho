# Email Verification Token Fix - Final Solution

## Problem
Email verification codes were not displaying in the sent emails. The email template was blank where the verification code should appear.

## Root Cause
The email payload was sending the verification code using **wrong parameter names** (`code`, `verification_code`) that didn't match what the n8n email template expected.

## Solution
Based on the working implementation from commit `0710e75`, the n8n email webhook expects:

```json
{
  "email": "user@example.com",
  "token": "123456",
  "full_name": "User Name",
  "type": "email-verification"
}
```

### Key Changes Made

**1. Signup Endpoint** (`/src/app/api/auth/signup-all-roles/route.js`)
- Now sends `token` (not `code`) to the email webhook
- Includes `type: 'email-verification'` parameter
- Passes `full_name` for personalization

**2. Resend Verification Endpoint** (`/src/app/api/auth/resend-verification/route.js`)  
- Updated to use `token` parameter
- Simplified payload to essential fields only

### Email Template Variable
The n8n email template uses: **`{{token}}`**

This should now properly display in emails like: "Your verification code is: {{token}}"

## Testing
After deployment, when a user signs up:
1. User receives email with subject "EmergencyEcho — Your Verification Code"
2. The 6-digit verification code should display under "YOUR VERIFICATION CODE"
3. Email contains account role, email address, and "Go to Verification Screen" button

## Verification Codes
- **Format**: 6-digit numeric code (e.g., `234567`)
- **Generation**: `Math.floor(100000 + Math.random() * 900000)`
- **Expiration**: 10 minutes (configured in n8n workflow)
- **Passed to n8n as**: `token` parameter

## What Changed from Previous Attempt
| Previous (Broken) | Fixed (Current) |
|------------------|-----------------|
| `"code": "123456"` | `"token": "123456"` |
| `"verification_code": "123456"` | (removed - redundant) |
| `"action": "send_verification"` | `"type": "email-verification"` |
| Multiple parameter names | Single consistent parameter |

## Files Modified
- `frontend/src/app/api/auth/signup-all-roles/route.js`
- `frontend/src/app/api/auth/resend-verification/route.js`

## Branch
Changes committed to: `login-error-debugging`
Ready to merge to: `main`

---

**Status**: ✅ Ready for testing  
**Test Action**: Sign up with new email → Check inbox → Verify code displays
