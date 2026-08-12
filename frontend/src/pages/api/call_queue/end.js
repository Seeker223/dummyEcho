import { getSupabaseAdmin } from '../../../lib/supabase-admin'
import { resolveQueueActor, unauthorizedResponse } from './_session'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const actor = await resolveQueueActor(req)
    if (!actor?.id) {
      return unauthorizedResponse(res)
    }

    const admin = getSupabaseAdmin()
    const { sessionKey, paidMins } = req.body

    if (!sessionKey) {
      return res.status(400).json({ error: 'Invalid sessionKey' })
    }

    // 1. Update the call_queue status to complete
    await admin.from('call_queue').update({ status: 'complete' }).eq('id', sessionKey)

    // 2. Fetch the row to find the clinician's ID
    const { data: queueRow } = await admin.from('call_queue').select('clinician_id').eq('id', sessionKey).single()
    const targetClinicianId = queueRow?.clinician_id

    if (targetClinicianId) {
      const payout = paidMins === 10 ? 950 : (paidMins === 5 ? 450 : 0)

      if (payout > 0) {
        // Check if transaction already exists
        const { data: existingTx } = await admin.from('wallet_transactions').select('id').eq('reference', `consultation_${sessionKey}`).single()
        
        if (!existingTx) {
          try {
            const { data: clinicianProfile } = await admin
              .from('profiles')
              .select('id, wallet_balance, walletBalanceNgn')
              .eq('id', targetClinicianId)
              .single()

            const currentBalance = Number(clinicianProfile?.wallet_balance ?? clinicianProfile?.walletBalanceNgn ?? 0)
            const nextBalance = currentBalance + payout

            await admin
              .from('profiles')
              .update({ wallet_balance: nextBalance })
              .eq('id', targetClinicianId)
          } catch (profileErr) {
            if (!isMissingProfileTableError(profileErr)) {
              console.error('Failed to update clinician wallet balance:', profileErr)
            }
          }

          try {
            await admin.from('wallet_transactions').insert({
              user_id: targetClinicianId,
              amount: payout,
              type: 'earning',
              status: 'success',
              reference: `consultation_${sessionKey}`,
              metadata: { title: `Consultation Payout (${paidMins}mins)` }
            })
          } catch (txErr) {
            console.error('Failed to record consultation payout:', txErr)
          }
        }
      }
    }

    return res.status(200).json({ success: true })

  } catch (err) {
    console.error('API end call error:', err)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}

function isMissingProfileTableError(error) {
  const message = String(error?.message || '').toLowerCase()
  return error?.code === 'PGRST205' || message.includes('could not find the table') || message.includes('not found')
}
