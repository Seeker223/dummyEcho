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

    // Now insert using admin client to bypass RLS
    const admin = getSupabaseAdmin()
    const { id, payload = {} } = req.body

    if (!id) {
        return res.status(400).json({ error: 'Missing row id' })
    }

    // Build safe payload with only valid schema columns
    const allowedColumns = [
      'submission_key', 'patient_name', 'urgency', 'urgency_score',
      'clinical_summary', 'red_flags', 'queue_type', 'status', 'created_at',
      'seen_at', 'completed_at', 'routing', 'consultation_type',
      'consultation_duration', 'clinician_id', 'amount_paid'
    ]
    
    const safePayload = {}
    allowedColumns.forEach(col => {
      if (payload[col] !== undefined || (col === 'clinical_summary' && payload.symptoms)) {
        safePayload[col] = payload[col] !== undefined ? payload[col] : payload.symptoms
      }
    })

    if (!safePayload.clinician_id && payload.clinician_id) {
      safePayload.clinician_id = payload.clinician_id
    }

    let { data, error } = await admin
      .from('call_queue')
      .update(safePayload)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('API call_queue update error:', error)
      return res.status(500).json({ error: error.message })
    }

    // Emit Realtime Broadcast so frontend listeners get the update instantly
    try {
      const channel = admin.channel(`call_queue_topic:${id}`)
      await channel.send({
        type: 'broadcast',
        event: 'UPDATE',
        payload: { new: data }
      })
      admin.removeChannel(channel)
    } catch (broadcastErr) {
      console.warn('Failed to emit broadcast:', broadcastErr)
    }

    return res.status(200).json({ data })

  } catch (err) {
    console.error('API handler error:', err)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
