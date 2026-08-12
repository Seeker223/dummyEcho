import { supabase } from '../../../lib/supabase-admin'

const roleFields = {
  patient:  ['dob', 'gender', 'blood_type', 'address'],
  doctor:   ['specialty', 'license_number', 'hospital', 'years_experience'],
  nurse:    ['ward', 'license_number', 'hospital'],
  partner:  ['business_name', 'business_type', 'address', 'rc_number'],
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const token = req.headers.authorization?.replace('Bearer ', '')
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return res.status(401).json({ error: 'Unauthorized' })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('user_id', user.id).single()

  const role = profile?.role
  const required = roleFields[role] || []
  const body = req.body

  // Validate required fields for this role
  const missing = required.filter(f => !body[f])
  if (missing.length > 0) {
    return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` })
  }

  // Update the role-specific table
  const tableMap = { patient: 'patients', doctor: 'doctors', nurse: 'nurses', partner: 'partners' }
  const table = tableMap[role]

  if (table) {
    const updateData = {}
    required.forEach(f => { updateData[f] = body[f] })

    await supabase.from(table).update(updateData).eq('user_id', user.id)
  }

  await supabase.from('profiles').update({ profile_complete: true }).eq('user_id', user.id)

  return res.status(200).json({ success: true, message: 'Profile updated.' })
}
