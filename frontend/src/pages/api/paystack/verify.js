import { supabase } from '../../../lib/supabaseClient'

/**
 * POST /api/paystack/verify
 * 
 * Verifies a Paystack transaction and credits the wallet if successful.
 * Called after user completes Paystack payment and redirects back to the app.
 * 
 * Body:
 * {
 *   reference: string,      // Paystack transaction reference
 *   type: string,           // 'topup' or 'consultation'
 *   user_id?: string,       // Optional: user ID for consultation payments
 *   consultation_meta?: {   // Optional: metadata for consultation
 *     minutes: number,
 *     return_to: string
 *   }
 * }
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { reference, type, user_id, consultation_meta } = req.body

    if (!reference) {
      return res.status(400).json({ error: 'Missing reference parameter' })
    }

    // Call the n8n Paystack verification workflow to verify with Paystack
    // The verification happens inside n8n which calls Paystack API directly
    // For now, we'll do a simplified client-side verification
    
    // Get transaction from database to check if it exists and get the amount
    const { data: tx, error: txError } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('reference', reference)
      .single()

    if (txError || !tx) {
      return res.status(404).json({ error: 'Transaction not found', reference })
    }

    // For consultation payments without a wallet_transactions record yet,
    // verify directly with the Paystack secret key from the environment.
    const paystackKey =
      process.env.PAYSTACK_SECRET_KEY ||
      process.env.PAYSTACK_LIVE_SECRET_KEY ||
      process.env.NEXT_PUBLIC_PAYSTACK_SECRET_KEY

    if (!paystackKey) {
      return res.status(503).json({
        error: 'Paystack verification is not configured on this deployment.',
        reference,
      })
    }

    // Verify with Paystack
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${paystackKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!verifyRes.ok) {
      throw new Error(`Paystack verification failed: ${verifyRes.statusText}`)
    }

    const paystackData = await verifyRes.json()

    if (!paystackData.status || paystackData.data?.status !== 'success') {
      // Update transaction status to failed
      await supabase
        .from('wallet_transactions')
        .update({ status: 'failed', updated_at: new Date().toISOString() })
        .eq('reference', reference)

      return res.status(402).json({ 
        error: 'Payment verification failed',
        reference,
        paystack_status: paystackData.data?.status
      })
    }

    const verified = paystackData.data
    const user_id_from_tx = tx.user_id || verified.metadata?.user_id || user_id
    const amount_ngn = verified.metadata?.topup_amount || (verified.amount / 100)

    // Update wallet balance if this is a topup or consultation payment
    if (type === 'topup' || type === 'consultation') {
      let current_balance = 0
      let profileTableAvailable = true

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, wallet_balance')
        .eq('id', user_id_from_tx)
        .single()

      if (profileError) {
        const missingProfileTable = profileError.code === 'PGRST205' || /could not find the table|not found/i.test(profileError.message || '')
        if (!missingProfileTable && profileError.code !== 'PGRST116') {
          throw new Error('Failed to fetch profile wallet balance')
        }
        profileTableAvailable = !missingProfileTable
      }

      current_balance = Number(profile?.wallet_balance || 0)
      const new_balance = current_balance + amount_ngn

      if (profileTableAvailable) {
        await supabase
          .from('profiles')
          .update({
            wallet_balance: new_balance,
            updated_at: new Date().toISOString()
          })
          .eq('id', user_id_from_tx)
      }

      await supabase
        .from('wallet_transactions')
        .upsert({
          user_id: user_id_from_tx,
          amount: amount_ngn,
          type: 'credit',
          status: 'success',
          reference,
          paid_at: verified.paid_at,
          updated_at: new Date().toISOString(),
          metadata: {
            paystack_reference: verified.reference,
            paystack_status: verified.status,
            ...(tx.metadata || {})
          }
        }, { onConflict: 'reference' })
    }

    return res.status(200).json({
      success: true,
      reference,
      amount: amount_ngn,
      status: 'verified',
      user_id: user_id_from_tx,
      ...(consultation_meta && { consultation_meta })
    })

  } catch (error) {
    console.error('[Paystack Verify Error]:', error)
    return res.status(500).json({
      error: error.message || 'Verification failed',
      reference: req.body?.reference
    })
  }
}
