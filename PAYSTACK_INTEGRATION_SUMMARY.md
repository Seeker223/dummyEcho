# Paystack Payment Flow Integration

## Overview
Successfully wired the Paystack workflow (from `n8n-workflows/paystack-workflow.json`) into the EmergencyEcho user payment flows.

## Changes Made

### 1. **PaymentScreen.jsx** - Consultation Payments
**File:** `frontend/src/features/workflow/screens/PaymentScreen.jsx`

**What Changed:**
- Previously: Bank Transfer and Card Payment methods were placeholder stubs that showed "processing" but didn't actually charge anything
- Now: Both methods call the Paystack workflow via n8n webhook (`ee-paystack-init`)
- Redirects user to Paystack checkout to complete payment
- Stores pending transaction record in Supabase

**Flow:**
1. User selects "Bank Transfer" or "Card Payment"
2. Clicks "Pay NGN {price}"
3. Paystack checkout initializes via n8n
4. User completes payment on Paystack
5. Paystack redirects to `/paystack-callback` with transaction reference

### 2. **WalletAddFundsScreen.jsx** - Wallet Top-ups  
**File:** `frontend/src/features/workflow/screens/WalletAddFundsScreen.jsx`

**What Changed:**
- Updated to use centralized callback URL at `/paystack-callback`
- Ensures consistent verification flow across both payment types

### 3. **New: Paystack Verification API**
**File:** `frontend/src/pages/api/paystack/verify.js`

**Purpose:**
- Server-side endpoint that verifies Paystack transactions
- Receives transaction reference after Paystack redirects
- Calls Paystack API to verify payment success
- Credits wallet balance if successful
- Updates transaction status in database

**Endpoint:** `POST /api/paystack/verify`

**Request Body:**
```json
{
  "reference": "transaction_reference_from_paystack",
  "type": "topup" | "consultation",
  "user_id": "optional_user_id",
  "consultation_meta": {
    "minutes": 5,
    "return_to": "doctor-live"
  }
}
```

**Response:**
```json
{
  "success": true,
  "reference": "transaction_reference",
  "amount": 1000,
  "status": "verified",
  "user_id": "user_id"
}
```

### 4. **New: Paystack Callback Page**
**File:** `frontend/src/pages/paystack-callback.jsx`

**Purpose:**
- Landing page after Paystack payment completion
- Shows verification spinner while checking with backend
- Handles success and error states
- Redirects to appropriate screen after verification

**Flow:**
1. Paystack redirects with `?reference=XXXX` query param
2. Page extracts reference and calls `/api/paystack/verify`
3. Backend verifies and credits wallet
4. Shows success and redirects to wallet or consultation screen

## Database Changes

### wallet_transactions Table
New transaction records now include:
- `status`: 'pending' → 'success' / 'failed' after verification
- `metadata`: Includes Paystack reference and payment method
- `type`: 'topup' or 'debit' (for consultations)
- `paid_at`: Timestamp from Paystack

### wallets Table
- `balance`: Updated after verification succeeds

## Environment Variables

**Already Available:**
- `NEXT_PUBLIC_N8N_PAYSTACK_INIT` - n8n webhook URL for payment initialization
- `NEXT_PUBLIC_APP_URL` - Base URL for callback redirect

**Optional:**
- `PAYSTACK_SECRET_KEY` - For server-side verification (defaults to test key in verify.js)

## Testing the Flow

### Wallet Top-up:
1. Navigate to `/app/wallet-add-funds`
2. Enter amount (≥ 500 NGN)
3. Click "Add funds"
4. Get redirected to Paystack checkout
5. Complete payment on Paystack
6. Redirected to `/paystack-callback` for verification
7. Wallet balance updates

### Consultation Payment (Bank Transfer/Card):
1. Navigate to `/app/doctor-live` or similar
2. Click "Purchase Echo" button
3. Select "Bank Transfer" or "Card Payment"
4. Choose duration and click "Pay"
5. Get redirected to Paystack checkout
6. Complete payment
7. Redirected to `/paystack-callback` for verification
8. Consultation proceeds or wallet credited

## Next Steps / Future Enhancements

1. **Webhook Verification** - Add Paystack webhook listener for additional validation
2. **Retry Logic** - Handle network failures during verification
3. **Timeout Handling** - Manage cases where Paystack redirects but verification fails
4. **Transaction History** - Display consultation payments in transaction history
5. **Receipts** - Email payment receipts to user
6. **Refunds** - Implement refund handling if needed
7. **Analytics** - Track payment method usage (wallet vs Paystack)

## n8n Workflow Integration

The workflow (`paystack-workflow.json`) provides:

### Endpoint 1: `POST /webhook/ee-paystack-init`
- **Input:** `{ email, amount (in kobo), user_id, callback_url }`
- **Output:** `{ success, authorization_url, reference }`
- **Steps:**
  1. Parse and validate request
  2. Build Paystack transaction payload
  3. Call Paystack `/transaction/initialize` API
  4. Save pending transaction record
  5. Return authorization URL

### Endpoint 2: `POST /webhook/ee-withdraw`
- Handles wallet-to-bank withdrawals (separate flow)
- Not yet integrated into UI

## Files Modified
- `frontend/src/features/workflow/screens/PaymentScreen.jsx`
- `frontend/src/features/workflow/screens/WalletAddFundsScreen.jsx`

## Files Created
- `frontend/src/pages/api/paystack/verify.js`
- `frontend/src/pages/paystack-callback.jsx`
- `PAYSTACK_INTEGRATION_SUMMARY.md` (this file)

## Status
✅ Integration complete and ready to test
