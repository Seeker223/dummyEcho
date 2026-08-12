import { corsHandler } from '../../../middleware/corsHandler'
import { supabase } from '../../../lib/supabase-admin'

export default async function handler(req, res) {
  // Apply CORS headers
  corsHandler(req, res, () => {})

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Missing token' })

  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) return res.status(401).json({ error: 'Unauthorized' })

  // Validate admin role
  const { data: profile, error: profileFetchError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileFetchError || profile?.role !== 'admin') {
    return res.status(403).json({ error: 'Admins only' })
  }

  // Enforce statutory council verification only
  return res.status(403).json({ error: 'Direct admin verification is disabled. All clinical verifications must be processed through the MDCN or NMCN Council Portals.' })

  const { document_id, action, notes } = req.body  // action: 'approve' | 'reject' | 'pending'
  if (!['approve', 'reject', 'pending'].includes(action)) {
    return res.status(400).json({ error: 'Action must be approve, reject, or pending' })
  }

  const status = action === 'approve' ? 'verified' : action === 'reject' ? 'rejected' : 'pending'

  // Get the document details to know user_id, document_type, role, and file_path
  const { data: doc, error: docError } = await supabase
    .from('document_uploads')
    .select('user_id, document_type, file_path, profiles(role)')
    .eq('id', document_id)
    .single()

  if (docError || !doc) {
    return res.status(500).json({ error: 'Failed to retrieve document: ' + (docError?.message || 'Not found') })
  }

  // Update status in public.document_uploads
  const { error: updateError } = await supabase
    .from('document_uploads')
    .update({
      verification_status: status,
      verification_notes: notes || null,
      verified_at: new Date().toISOString(),
      verified_by: user.id
    })
    .eq('id', document_id)

  if (updateError) {
    console.error('Update document upload error:', updateError)
    return res.status(500).json({ error: 'Failed to update document: ' + updateError.message })
  }

  // Sync state columns in the clinician's table
  const docRole = doc.profiles?.role
  const roleTable = docRole === 'nurse' ? 'nurses' : docRole === 'doctor' ? 'doctors' : null
  if (roleTable) {
    const roleUpdates = {}
    const docType = doc.document_type
    
    let statusCol = null
    let pathCol = null
    
    if (docType === 'gov_id') {
      statusCol = 'government_id_status'
      pathCol = 'government_id'
    } else if (docType === 'annual_license') {
      statusCol = 'annual_license_status'
      pathCol = 'annual_license'
    } else if (docType === 'degree') {
      statusCol = docRole === 'nurse' ? 'nursing_degree_status' : 'medical_degree_status'
      pathCol = docRole === 'nurse' ? 'nursing_degree' : 'medical_degree'
    } else if (docType === 'full_registration_certificate') {
      statusCol = 'registration_certificate_status'
      pathCol = 'registration_certificate'
    }
    
    if (statusCol) {
      roleUpdates[statusCol] = status
    }
    if (pathCol && status === 'verified') {
      roleUpdates[pathCol] = doc.file_path
    }
    
    if (Object.keys(roleUpdates).length > 0) {
      const { error: roleUpdateError } = await supabase
        .from(roleTable)
        .update(roleUpdates)
        .eq('user_id', doc.user_id)
        
      if (roleUpdateError) {
        console.error('Clinician table update error on verify:', roleUpdateError)
      }
    }
  }

  // Check if all required docs are verified → auto-mark profile and role tables as verified
  const { data: allDocs, error: allDocsError } = await supabase
    .from('document_uploads')
    .select('verification_status')
    .eq('user_id', doc.user_id)

  if (allDocsError || !allDocs) {
    return res.status(500).json({ error: 'Failed to check verification status: ' + allDocsError?.message })
  }

  const allVerified = allDocs.length > 0 && allDocs.every(d => d.verification_status === 'verified')
  if (allVerified) {
    // Update profiles table (using primary key id)
    await supabase.from('profiles').update({ verified_at: new Date().toISOString() }).eq('id', doc.user_id)
    
    if (roleTable) {
      await supabase.from(roleTable).update({ verified_by_admin: true }).eq('user_id', doc.user_id)
    }
  } else {
    // Clear verification if any document is not verified (rejected or pending)
    await supabase.from('profiles').update({ verified_at: null }).eq('id', doc.user_id)
    
    if (roleTable) {
      await supabase.from(roleTable).update({ verified_by_admin: false }).eq('user_id', doc.user_id)
    }
  }

  return res.status(200).json({ success: true, status, all_docs_verified: allVerified })
}
