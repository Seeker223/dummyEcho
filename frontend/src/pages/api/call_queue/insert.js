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
    const { payload = {} } = req.body
    
    // Map common frontend field names to actual DB column names
    const clinicalSummary = payload.clinical_summary || payload.symptoms || payload.reason || 'General Consultation'
    
    // Build safe payload with only valid schema columns
    const allowedColumns = [
      'id', 'submission_key', 'patient_name', 'urgency', 'urgency_score',
      'clinical_summary', 'red_flags', 'queue_type', 'status', 'created_at',
      'seen_at', 'completed_at', 'routing', 'consultation_type',
      'consultation_duration', 'clinician_id', 'amount_paid'
    ]
    
    const rawPayload = {
      ...payload,
      clinical_summary: clinicalSummary,
      submission_key: payload.submission_key || `EE_${String(actor.id).substring(0, 8)}`,
      user_id: payload.user_id || actor.id,
      profile_id: payload.profile_id || actor.id,
      status: payload.status || 'waiting'
    }
    
    const safePayload = {}
    allowedColumns.forEach(col => {
      if (rawPayload[col] !== undefined) {
        safePayload[col] = rawPayload[col]
      }
    })

    let { data, error } = await admin
      .from('call_queue')
      .insert([safePayload])
      .select()
      .single()

    if (error) {
      console.error('API call_queue insert error:', error)
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ data })

  } catch (err) {
    console.error('API handler error:', err)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
