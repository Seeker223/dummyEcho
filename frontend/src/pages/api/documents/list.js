import { supabase } from '../../../lib/supabase-admin'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  // Validate admin token
  const token = req.headers.authorization?.replace('Bearer ', '')
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return res.status(401).json({ error: 'Unauthorized' })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return res.status(403).json({ error: 'Admins only' })

  const { role, status, page = 1 } = req.query
  const pageSize = 20
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('document_uploads')
    .select('*, profiles(full_name, email, role)', { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false })

  if (role) query = query.eq('profiles.role', role)
  if (status) query = query.eq('verification_status', status)

  const { data, count, error: listError } = await query
  if (listError) return res.status(500).json({ error: listError.message })

  return res.status(200).json({ documents: data, total: count, page: Number(page), pageSize })
}
