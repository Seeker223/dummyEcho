import { getSupabaseAdmin } from '../../../lib/supabase-admin'
import { resolveQueueActor, unauthorizedResponse } from './_session'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const actor = await resolveQueueActor(req)
    if (!actor?.id) {
      return unauthorizedResponse(res)
    }

    // Now insert using admin client to bypass RLS
    const admin = getSupabaseAdmin()
    const { id, submission_key } = req.query

    if (!id && !submission_key) {
        return res.status(400).json({ error: 'Missing row id or submission_key' })
    }

    let query = admin.from('call_queue').select('*')
    if (id) {
        query = query.eq('id', id)
    } else {
        query = query.eq('submission_key', submission_key).order('created_at', { ascending: false }).limit(1)
    }

    const { data, error } = await query

    if (error) {
      console.error('API call_queue poll error:', error)
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ data: id ? data[0] : data })

  } catch (err) {
    console.error('API handler error:', err)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
