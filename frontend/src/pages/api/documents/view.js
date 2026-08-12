import { supabase } from '../../../lib/supabase-admin'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const token = req.headers.authorization?.replace('Bearer ', '')
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return res.status(401).json({ error: 'Unauthorized' })

  // Validate admin role
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  
  if (profile?.role !== 'admin') {
    return res.status(403).json({ error: 'Admins only' })
  }

  const { path } = req.query
  if (!path) return res.status(400).json({ error: 'Missing document path' })

  // Use service role to bypass RLS and generate a signed URL
  const { data, error: signedError } = await supabase.storage
    .from('documents')
    .createSignedUrl(path, 60 * 60) // 1 hour

  if (signedError || !data?.signedUrl) {
    return res.status(500).json({ error: 'Failed to generate signed URL: ' + (signedError?.message || 'Unknown error') })
  }

  return res.status(200).json({ url: data.signedUrl })
}
