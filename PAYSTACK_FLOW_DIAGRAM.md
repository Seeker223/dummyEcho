# Paystack Payment Flow Diagram

## Complete Payment Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CONSULTATION PAYMENT FLOW                             │
└─────────────────────────────────────────────────────────────────────────┘

USER ACTIONS                          SYSTEM ACTIONS                     DATA STATE
═════════════                          ═════════════                     ══════════

1. User Views Payment Screen
   (5 min = NGN 1000)
   │
   ├─ Selects Duration ✓
   ├─ Selects Payment Method
   │  ("Card Payment" or "Bank Transfer")
   └─ Clicks "Pay NGN 1000"
        │
        ▼
2. [PaymentScreen.jsx onPay()]
   ├─ Validates amount & method
   ├─ Creates consultation_<method>_<timestamp>
   │  reference ID
   │
   └─ Calls: POST /webhook/ee-paystack-init
        {
          amount: 100000,      (1000 NGN in kobo)
          email: user@email,
          user_id: uid123,
          callback_url: .../paystack-callback
        }
        │
        ▼
3. [n8n Workflow: ee-paystack-init]
   ├─ Validates request
   ├─ Creates Paystack transaction body
   │
   ├─ Calls: POST /api.paystack.co/transaction/initialize
   │  (Uses Paystack Secret Key sk_test_xxx)
   │
   ├─ Response includes:
   │  {
   │    authorization_url: "https://checkout.paystack.com/...",
   │    reference: "generated_ref",
   │    access_code: "code"
   │  }
   │
   ├─ Saves pending transaction to Supabase:
   │  INSERT wallet_transactions {
   │    user_id: uid123,
   │    reference: consultation_card_1735xxx,
   │    amount: -1000,
   │    type: "debit",
   │    status: "pending",     ◄─── State A: PENDING
   │    provider: "paystack",
   │    metadata: {
   │      consultation_minutes: 5,
   │      payment_method: "card"
   │    }
   │  }
   │
   └─ Returns authorization_url to frontend
        │
        ▼
4. [PaymentScreen.jsx receives auth URL]
   └─ Redirects: window.location.href = authorization_url
        │
        ▼
5. USER ON PAYSTACK CHECKOUT
   ├─ Sees payment form
   ├─ Enters card details
   ├─ Completes payment
   └─ [Paystack processes transaction]
        │
        ▼
6. PAYSTACK REDIRECT
   └─ Redirects to: /paystack-callback?reference=PAYREF123
        │
        ▼
7. [paystack-callback.jsx mounts]
   ├─ Extracts reference from URL
   ├─ Shows "Verifying your payment..." spinner
   │
   └─ Calls: POST /api/paystack/verify
        {
          reference: consultation_card_1735xxx
        }
        │
        ▼
8. [Next.js API: /api/paystack/verify]
   ├─ Looks up transaction in Supabase
   │  (status = "pending")
   │
   ├─ Calls: GET /api.paystack.co/transaction/verify/{ref}
   │  (Uses Paystack Secret Key)
   │
   ├─ Response: { data: { status: "success", amount: 100000, ... } }
   │
   ├─ Fetches wallet balance for user
   │
   ├─ Calculates: new_balance = current + 1000
   │
   ├─ UPDATE wallets:
   │  {
   │    balance: new_balance,
   │    profile_id: uid123
   │  }
   │
   ├─ UPDATE wallet_transactions:
   │  {
   │    reference: consultation_card_1735xxx,
   │    status: "success",     ◄─── State B: SUCCESS
   │    paid_at: "2025-01-27T..."
   │  }
   │
   └─ Returns: { success: true, amount: 1000, status: "verified" }
        │
        ▼
9. [paystack-callback.jsx receives response]
   ├─ Shows "✓ Payment successful!"
   └─ setTimeout(() => navigate('/app/wallet'), 2000)
        │
        ▼
10. USER REDIRECTED
    └─ Lands on wallet screen
       ├─ Wallet balance UPDATED ✓
       └─ Transaction shows "Successful" ✓


┌─────────────────────────────────────────────────────────────────────────┐
│                      WALLET TOP-UP FLOW                                  │
└─────────────────────────────────────────────────────────────────────────┘

1. User navigates to /app/wallet-add-funds
   │
   ├─ Enters amount: 5000 NGN
   └─ Clicks "Add 5000 to wallet"
        │
        ▼
2. [WalletAddFundsScreen.jsx onPay()]
   └─ Calls: POST /webhook/ee-paystack-init
        {
          amount: 500000,           (5000 NGN in kobo)
          email: user@email,
          user_id: uid123,
          callback_url: .../paystack-callback
        }
        │
        ▼
3. [Same n8n flow as consultation]
   ├─ Initializes Paystack transaction
   ├─ Saves pending wallet_transactions
   └─ Returns authorization_url
        │
        ▼
4. User completes Paystack payment
   │
   ├─ Paystack redirects to /paystack-callback?reference=TOPUP123
   │
   ▼
5. [paystack-callback.jsx]
   └─ Verifies via /api/paystack/verify
        │
        ▼
6. [/api/paystack/verify]
   ├─ Confirms payment with Paystack
   ├─ Fetches current wallet balance: 1000 NGN
   ├─ Adds top-up: 1000 + 5000 = 6000 NGN
   ├─ UPDATE wallets to balance=6000
   ├─ UPDATE wallet_transactions to status=success
   └─ Returns success
        │
        ▼
7. User sees success message
   └─ Redirected to /app/wallet
      Wallet now shows: 6000 NGN ✓


┌─────────────────────────────────────────────────────────────────────────┐
│                    DATABASE STATE TRANSITIONS                            │
└─────────────────────────────────────────────────────────────────────────┘

WALLET TABLE:
═════════════

Before:
  ┌─────────────────────────┐
  │ profile_id │ balance   │
  ├─────────────────────────┤
  │ uid123     │ 1000 NGN  │
  └─────────────────────────┘

After Top-up (5000 NGN):
  ┌─────────────────────────┐
  │ profile_id │ balance   │
  ├─────────────────────────┤
  │ uid123     │ 6000 NGN  │
  └─────────────────────────┘


WALLET_TRANSACTIONS TABLE:
══════════════════════════

Initial (when user clicks Pay):
  ┌──────────────────────────────────────────────────────────────────┐
  │ reference            │ status  │ type  │ amount │ user_id │ ... │
  ├──────────────────────────────────────────────────────────────────┤
  │ consultation_c..     │ pending │ debit │ -1000  │ uid123  │ ... │
  │ (timestamp)          │         │       │        │         │     │
  └──────────────────────────────────────────────────────────────────┘

After Verification (success):
  ┌──────────────────────────────────────────────────────────────────┐
  │ reference            │ status  │ type  │ amount │ user_id │ ... │
  ├──────────────────────────────────────────────────────────────────┤
  │ consultation_c..     │ success │ debit │ -1000  │ uid123  │ ... │
  │ (timestamp)          │         │       │        │         │     │
  └──────────────────────────────────────────────────────────────────┘

Field changes:
- status: "pending" → "success"
- paid_at: NULL → "2025-01-27T10:30:45Z"
- metadata: Updated with Paystack reference


┌─────────────────────────────────────────────────────────────────────────┐
│                      ERROR HANDLING PATHS                               │
└─────────────────────────────────────────────────────────────────────────┘

Scenario 1: Invalid Reference
─────────────────────────────
User lands on /paystack-callback with invalid ref
  │
  ├─ /api/paystack/verify called
  │
  ├─ Transaction not found in database
  │
  └─ Responds: 404 {"error": "Transaction not found"}
        │
        └─ Callback page shows: "✕ Transaction not found"
           User can click "Go to Wallet" to return


Scenario 2: Paystack Verification Failed
──────────────────────────────────────────
User completes payment but Paystack verification fails
  │
  ├─ /api/paystack/verify calls Paystack API
  │
  ├─ Response: {"status": false, "data": {...}}
  │
  ├─ Transaction updated: status = "failed"
  │
  └─ Responds: 402 {"error": "Payment verification failed"}
        │
        └─ Callback page shows: "✕ Payment verification failed"
           Wallet NOT credited


Scenario 3: Network Error
─────────────────────────
User clicks back during Paystack payment
  │
  ├─ No transaction reference in URL
  │
  ├─ /api/paystack/verify responds: 400
  │
  └─ Callback page shows: "✕ No transaction reference found"


┌─────────────────────────────────────────────────────────────────────────┐
│                         KEY COMPONENTS                                   │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ PaymentScreen.jsx (Frontend)                                             │
├─────────────────────────────────────────────────────────────────────────┤
│ • Shows consultation payment options                                     │
│ • Validates amount, checks wallet balance                               │
│ • Calls n8n webhook to initialize Paystack payment                      │
│ • Redirects to Paystack checkout                                        │
│ • Stores pending transaction in Supabase                                │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ WalletAddFundsScreen.jsx (Frontend)                                      │
├─────────────────────────────────────────────────────────────────────────┤
│ • Shows wallet top-up form                                              │
│ • Validates minimum amount (500 NGN)                                    │
│ • Calls same n8n webhook with top-up amount                             │
│ • Redirects to Paystack checkout                                        │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ n8n Workflow: ee-paystack-init (Backend Orchestration)                  │
├─────────────────────────────────────────────────────────────────────────┤
│ • Receives payment initialization request                               │
│ • Validates and builds Paystack payload                                 │
│ • Calls Paystack API to create transaction                              │
│ • Saves pending record to Supabase                                      │
│ • Returns authorization URL to frontend                                 │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ paystack-callback.jsx (Frontend)                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ • Landing page after Paystack payment                                   │
│ • Extracts transaction reference from URL                               │
│ • Shows verification spinner                                            │
│ • Calls verification API                                                │
│ • Displays success/error states                                         │
│ • Redirects to appropriate screen                                       │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ /api/paystack/verify (Backend Verification)                             │
├─────────────────────────────────────────────────────────────────────────┤
│ • Verifies transaction with Paystack API                                │
│ • Updates wallet balance in Supabase                                    │
│ • Updates transaction status to success/failed                          │
│ • Returns verification result to frontend                               │
└─────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                      TRANSACTION STATES                                  │
└─────────────────────────────────────────────────────────────────────────┘

        ┌──────────────┐
        │   INITIATED  │  (User starts payment)
        └───────┬──────┘
                │
                ▼
        ┌──────────────┐
        │   PENDING    │  (Awaiting Paystack payment)
        └───────┬──────┘
                │
         ┌──────┴──────┐
         │             │
         ▼             ▼
    ┌────────┐    ┌─────────┐
    │ SUCCESS│    │ FAILED  │
    │ (paid) │    │(rejected│
    └────────┘    │ /error) │
                  └─────────┘
                  
• SUCCESS: Wallet credited, user can proceed
• FAILED: Wallet not credited, user can retry


────────────────────────────────────────────────────────────────────────────

This diagram shows the complete flow from user interaction through payment
verification and wallet update. The key is that verification happens
AFTER Paystack payment via a callback page, not before.

```
