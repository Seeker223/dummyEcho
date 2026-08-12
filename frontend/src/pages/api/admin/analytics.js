import { corsHandler } from '../../../middleware/corsHandler'
import { supabase } from '../../../lib/supabase-admin'

export default async function handler(req, res) {
  // Apply CORS headers
  corsHandler(req, res, () => {})

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Validate admin token
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Missing token' })

  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) return res.status(401).json({ error: 'Unauthorized' })

  // Check admin role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || profile?.role !== 'admin') {
    return res.status(403).json({ error: 'Admins only' })
  }

  try {
    // 1. Count patients
    const { count: patientsCount, error: err1 } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })

    // 2. Count doctors & check verification
    const { data: doctorsData, error: err2 } = await supabase
      .from('doctors')
      .select('verified_by_admin')
    
    // 3. Count nurses & check verification
    const { data: nursesData, error: err3 } = await supabase
      .from('nurses')
      .select('verified_by_admin')

    // 4. Count document uploads
    const { data: docsData, error: err4 } = await supabase
      .from('document_uploads')
      .select('verification_status')

    if (err1 || err2 || err3 || err4) {
      throw new Error(err1?.message || err2?.message || err3?.message || err4?.message)
    }

    const docStats = {
      verified: (doctorsData || []).filter(d => d.verified_by_admin).length,
      unverified: (doctorsData || []).filter(d => !d.verified_by_admin).length,
      total: (doctorsData || []).length
    }

    const nurseStats = {
      verified: (nursesData || []).filter(n => n.verified_by_admin).length,
      unverified: (nursesData || []).filter(n => !n.verified_by_admin).length,
      total: (nursesData || []).length
    }

    const documentStats = {
      pending: (docsData || []).filter(d => d.verification_status === 'pending').length,
      verified: (docsData || []).filter(d => d.verification_status === 'verified').length,
      rejected: (docsData || []).filter(d => d.verification_status === 'rejected').length,
      total: (docsData || []).length
    }

    return res.status(200).json({
      patients: patientsCount || 0,
      doctors: docStats,
      nurses: nurseStats,
      documents: documentStats
    })

  } catch (err) {
    console.error('Analytics error:', err)
    return res.status(500).json({ error: err.message || 'Failed to fetch analytics' })
  }
}
