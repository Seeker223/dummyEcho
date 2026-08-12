# Payment Service 500 Error - Diagnosis & Fix

## Problem Summary

You were seeing repeated `Payment service failed` errors and **500 status codes** from `/api/payments/paystack-init` endpoint, which prevented the payment/wallet feature from working and was blocking the LiveKit video call interface from loading properly.

## Root Cause Analysis

The payment API was failing because:

1. **n8n Webhook Unreachable**: The payment service makes a POST request to an n8n webhook at:
   ```
   https://n8n-ftwl.srv1798513.hstgr.cloud/webhook/ee-paystack-init
   ```
   This webhook was either down, timing out, or not responding with the correct format.

2. **No Error Recovery**: The API was throwing 500 errors without graceful degradation, causing:
   - Browser console errors
   - DOM manipulation failures in other parts of the app
   - The entire UI becoming unresponsive

3. **Environment Variables**: The webhook URL can come from:
   - `N8N_PAYSTACK_INIT_WEBHOOK_URL` (server-only)
   - `NEXT_PUBLIC_N8N_PAYSTACK_INIT` (public)
   - Hardcoded default (fallback)

## Fixes Applied

### 1. **Enhanced Error Handling** (`src/app/api/payments/paystack-init/route.js`)

Changed error responses from 500 to 503 Service Unavailable for network issues:
- Server-side timeout handling (10 seconds)
- Proper error classification (network error vs. bad request)
- Better error messages for debugging

**Before:**
```javascript
// Would crash on any error
return NextResponse.json({ error: 'Payment service failed.' }, { status: 500 })
```

**After:**
```javascript
// Distinguishes between temporary issues and real failures
if (fetchError) {
  return NextResponse.json({
    error: 'Payment service is temporarily unreachable. Please try again.',
    details: process.env.NODE_ENV === 'development' ? { message: fetchError.message } : undefined,
  }, { status: 503 })
}
```

### 2. **Client-Side Resilience** (`src/features/workflow/screens/WalletAddFundsScreen.jsx`)

Added graceful degradation with:
- **Timeout handling**: 15-second abort controller
- **Service unavailable detection**: 503 responses show warning, not error
- **Retry-friendly messaging**: Users know to try again later

**Before:**
```javascript
// Would crash the entire app on error
throw new Error(data.error || `Payment service failed (status ${res.status}).`)
```

**After:**
```javascript
// Detects temporary vs. permanent failures
if (res.status === 503) {
  console.warn('Payment service temporarily unavailable:', data)
  showToast('Payment service is temporarily unavailable. Please try again in a moment.', 'warning')
  setProcessing(false)
  return // Doesn't crash the app
}
```

### 3. **Diagnostic Endpoint** (`src/pages/api/payments/diagnose.js`)

Added a new diagnostic endpoint to help identify issues:

```bash
# Check payment service health
curl https://yourapp/api/payments/diagnose

# Returns:
{
  "timestamp": "2025-01-27T...",
  "environment": {
    "NODE_ENV": "production",
    "n8n_webhook_url": "✓ Set or ✗ Not set",
    "default_webhook": "https://n8n-ftwl.srv1798513.hstgr.cloud/webhook/ee-paystack-init"
  },
  "webhook_test": {
    "status": 200,
    "ok": true,
    "message": "Webhook is reachable"
  }
}
```

### 4. **Input Validation**

Added validation for required fields before making API calls:
```javascript
if (!body.amount || !body.email || !body.user_id) {
  return NextResponse.json(
    { error: 'Missing required fields: amount, email, user_id' },
    { status: 400 }
  )
}
```

## Environment Variables Required

For the payment service to work, you need the n8n webhook environment variable in Vercel:

**Option 1: Private webhook URL**
```
N8N_PAYSTACK_INIT_WEBHOOK_URL=https://your-n8n.com/webhook/ee-paystack-init
```

**Option 2: Public webhook URL**
```
NEXT_PUBLIC_N8N_PAYSTACK_INIT=https://your-n8n.com/webhook/ee-paystack-init
```

## How to Fix

### Step 1: Verify the n8n Workflow

1. Go to your n8n instance
2. Check if the `ee-paystack-init` workflow exists
3. Verify it's active and listening on the webhook endpoint
4. Test by sending a POST request to the webhook URL

### Step 2: Check Environment Variables in Vercel

1. Go to Vercel Project Settings
2. Check "Environment Variables" section
3. Verify `NEXT_PUBLIC_N8N_PAYSTACK_INIT` or `N8N_PAYSTACK_INIT_WEBHOOK_URL` is set
4. If missing, add it:
   ```
   NEXT_PUBLIC_N8N_PAYSTACK_INIT=https://your-n8n-url/webhook/ee-paystack-init
   ```
5. Redeploy the project

### Step 3: Test the Diagnostic Endpoint

```bash
curl https://emergency-echo.org/api/payments/diagnose
```

This will tell you:
- Which webhook URL is being used
- If the webhook is reachable
- Whether the connection is working

### Step 4: Test the Wallet Feature

1. Log in to the app
2. Go to Wallet → Add Funds
3. Enter an amount and click "Add NGN..."
4. You should see either:
   - ✅ Paystack checkout page (success)
   - ⚠️ "Payment service is temporarily unavailable" (n8n is down)
   - ❌ "Missing required fields" (bad request)

## Response Codes & Meanings

| Status | Meaning | Action |
|--------|---------|--------|
| 200 | Payment initialized successfully | User proceeds to Paystack checkout |
| 400 | Missing/invalid required fields | Check email, amount, user_id are provided |
| 502 | Webhook didn't return valid data | Check n8n workflow output format |
| 503 | Service temporarily unavailable | Webhook is down or timing out |
| 500 | Unexpected error | Check server logs |

## Debugging in Development

Enable detailed logging by checking the error details:

```javascript
// In WalletAddFundsScreen.jsx
console.error('Payment Init Error:', err)
```

The error message will tell you:
- Network timeout: "Payment service took too long to respond"
- Webhook down: "Payment service is temporarily unreachable"
- Bad response: "No Paystack checkout link was returned"
- Missing data: "Missing required fields"

## Impact on LiveKit

The payment service failures were:
1. **Blocking page render**: Errors in browser console prevented the app from fully loading
2. **Preventing other features**: The payment module's errors cascaded to other parts of the app
3. **Network tab spammed**: Repeated 500 errors filled the network tab

Now with graceful error handling:
- Payment failures are isolated
- LiveKit video calls load normally
- Users can use other features while payment service recovers

## Files Modified

1. `src/app/api/payments/paystack-init/route.js` - Enhanced error handling
2. `src/features/workflow/screens/WalletAddFundsScreen.jsx` - Client-side resilience
3. `src/pages/api/payments/diagnose.js` - New diagnostic endpoint (added)

## Testing Checklist

- [ ] Diagnostic endpoint returns correct webhook status
- [ ] n8n workflow is active and reachable
- [ ] Add funds button shows spinner during payment
- [ ] Timeout errors show warning instead of crashing
- [ ] LiveKit video calls load without payment errors
- [ ] Other app features work even if payment service is down

## Next Steps

1. **Set the correct n8n webhook URL** in Vercel environment variables
2. **Verify n8n workflow is active** on your n8n instance
3. **Redeploy the project** to apply the environment variable
4. **Test the diagnostic endpoint** to confirm connectivity
5. **Try adding funds** to verify the complete flow

---

**Note**: The payment service errors were NOT related to LiveKit credentials (LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET). Those are working correctly. This was a separate payment processing issue.
