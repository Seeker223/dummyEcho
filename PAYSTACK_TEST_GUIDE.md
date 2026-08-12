# Paystack Payment Integration - Testing Guide

## Quick Summary of Changes

You now have a complete Paystack payment integration wired into your EmergencyEcho app:

### What Was Wired
1. **PaymentScreen** - Consultation payments (Bank Transfer & Card) now actually use Paystack
2. **WalletAddFundsScreen** - Wallet top-ups use Paystack with consistent callback
3. **Verification API** - Backend verifies payments and credits wallets automatically
4. **Callback Page** - User lands here after Paystack payment to complete verification

### Files Modified
- `frontend/src/features/workflow/screens/PaymentScreen.jsx` - Added Paystack integration
- `frontend/src/features/workflow/screens/WalletAddFundsScreen.jsx` - Updated callback URL

### Files Created
- `frontend/src/pages/api/paystack/verify.js` - Payment verification endpoint
- `frontend/src/pages/paystack-callback.jsx` - Callback landing page
- `PAYSTACK_INTEGRATION_SUMMARY.md` - Technical documentation

## Testing the Integration

### Prerequisites
1. ✅ n8n workflow `ee-paystack-init` must be active
2. ✅ Paystack API key must be configured in n8n
3. ✅ `NEXT_PUBLIC_N8N_PAYSTACK_INIT` environment variable is set
4. ✅ Dev server is running (`npm run dev` in frontend folder)

### Test Scenario 1: Wallet Top-up via Paystack Card

**Steps:**
1. Navigate to `/app/wallet-add-funds`
2. Enter amount: `2000` (≥ 500 minimum)
3. Click "Add 2,000 to wallet"
4. You're redirected to **Paystack Checkout**
5. Use [Paystack Test Card](https://paystack.com/docs/payments/test-authentication/):
   - Card: `4084 0343 6267 3647`
   - Expiry: `12 / 25`
   - CVV: `408`
   - OTP: `123456`
6. Complete payment
7. **Redirected to `/paystack-callback`** for verification
8. Spinner shows "Verifying your payment..."
9. After verification: **"Payment successful! Wallet updated."**
10. Redirected to `/app/wallet`
11. ✅ Wallet balance should increase by 2,000 NGN

### Test Scenario 2: Consultation Payment (Card)

**Steps:**
1. Navigate to `/app/doctor-live` (or similar consultation screen)
2. Click "Purchase Echo" button
3. Select duration: "Quick Consult (5 Minutes)" = 1,000 NGN
4. Payment Method: "Card Payment"
5. Click "Pay NGN 1,000 & Continue Call →"
6. You're redirected to **Paystack Checkout**
7. Complete payment using test card (see above)
8. **Redirected to `/paystack-callback`**
9. Verification happens
10. ✅ Should see success message and redirect back to consultation

### Test Scenario 3: Consultation Payment (Bank Transfer)

**Steps:**
1. Navigate to `/app/doctor-live`
2. Click "Purchase Echo"
3. Select duration: "Standard Consult (10 Minutes)" = 950 NGN
4. Payment Method: "Bank Transfer"
5. Click "Pay NGN 950 & Continue Call →"
6. Redirected to **Paystack** with bank transfer option
7. Complete payment
8. **Redirected to `/paystack-callback`**
9. ✅ Verification and redirect success

### Test Scenario 4: Error Handling

**Simulate Payment Failure:**
1. Go through checkout flow
2. At Paystack, click browser back button before completing
3. You'll be sent to `/paystack-callback` without a valid reference
4. ✅ Should show "No transaction reference found"
5. Click "Go to Wallet" to return

**Simulate Invalid Reference:**
1. Manually navigate to `/paystack-callback?reference=invalid_ref_12345`
2. ✅ Should show "Transaction not found"

## Database Verification

### Check Pending Transactions (Before Payment):
```sql
SELECT * FROM wallet_transactions 
WHERE status = 'pending' 
AND type = 'debit'
ORDER BY created_at DESC;
```

### Check Successful Transactions (After Payment):
```sql
SELECT 
  user_id,
  amount,
  type,
  status,
  reference,
  paid_at,
  created_at
FROM wallet_transactions 
WHERE status = 'success'
ORDER BY paid_at DESC
LIMIT 10;
```

### Check Wallet Balance Update:
```sql
SELECT profile_id, balance, updated_at 
FROM wallets 
ORDER BY updated_at DESC 
LIMIT 5;
```

## API Endpoint Testing

### Direct API Test (cURL)

```bash
# Test 1: Verify a successful transaction
curl -X POST http://localhost:3000/api/paystack/verify \
  -H "Content-Type: application/json" \
  -d '{
    "reference": "consultation_card_1735123456789",
    "type": "consultation",
    "user_id": "your-user-id"
  }'

# Expected Response:
# {
#   "success": true,
#   "reference": "consultation_card_1735123456789",
#   "amount": 1000,
#   "status": "verified",
#   "user_id": "your-user-id"
# }
```

## Debugging

### Enable Debug Logs

Check browser console for:
- `[v0] Verifying Paystack transaction: <reference>`
- `[v0] Payment verified: <result>`

Check network tab:
1. `/webhook/ee-paystack-init` - Should return authorization_url
2. `/api/paystack/verify` - Should return success response

### Common Issues

**Issue: "n8n returned an empty response"**
- Solution: Check that `ee-paystack-init` workflow is active in n8n dashboard
- Check that n8n credentials (Paystack API key) are set

**Issue: "No authorization_url received from n8n"**
- Solution: Verify Paystack test key in n8n workflow is correct
- Check n8n execution logs for errors

**Issue: Verification fails after payment**
- Solution: Check `/api/paystack/verify` logs in Next.js terminal
- Verify Paystack test key in backend (defaults in verify.js)
- Check wallet record exists in database for user

**Issue: Callback page shows spinner forever**
- Solution: Check browser console for error messages
- Check Next.js terminal for API errors
- Verify Paystack reference is passed in URL query

## Performance Notes

- Paystack checkout opens in **same tab** (consider opening in new tab for UX)
- Verification takes ~1-2 seconds
- Database updates are immediate after verification

## Next Steps

1. **Test thoroughly** with scenarios above
2. **Monitor** `/api/paystack/verify` endpoint for errors
3. **Configure production** Paystack keys when ready
4. **Add retry logic** if network failures occur
5. **Consider webhook** listener for additional security

## Support

If integration doesn't work:
1. Check that n8n workflow is **active** (not draft)
2. Verify **environment variables** are set correctly
3. Check **Supabase wallet_transactions** table exists
4. Ensure **callback URL** is accessible (not localhost for production)
5. Look at **browser console errors** for detailed messages

---

**Status:** ✅ Ready to test
