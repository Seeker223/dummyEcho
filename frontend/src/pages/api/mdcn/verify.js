import { supabase } from '../../../lib/supabase-admin.js'

export default async function handler(req, res) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-partner-token, x-admin-token')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // 1. Authenticate Partner / Admin Token
    const partnerToken = req.headers['x-partner-token'] || req.headers['x-admin-token'] || req.headers.authorization?.replace('Bearer ', '')
    const validPins = [
      'MDCN-DOC-2026',
      'MDCN-NURSE-2026',
      'NMCN-NURSE-2026',
      'ECHO-ADMIN-2026',
      process.env.NEXT_PUBLIC_ADMIN_TOKEN,
      process.env.ADMIN_TOKEN
    ].filter(Boolean)

    let isAuthorized = false
    if (partnerToken && validPins.includes(partnerToken.trim())) {
      isAuthorized = true
    } else if (partnerToken) {
      const { data: { user } } = await supabase.auth.getUser(partnerToken)
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        if (profile?.role === 'admin' || profile?.role === 'partner' || profile?.role === 'mdcn') {
          isAuthorized = true
        }
      }
    }

    if (!isAuthorized && !validPins.includes(partnerToken)) {
      return res.status(401).json({ error: 'Unauthorized partner access. Please log in with your valid MDCN/NMCN Partner PIN.' })
    }

    const { user_id, role = 'doctor', status, notes = '' } = req.body

    if (!user_id || !status) {
      return res.status(400).json({ error: 'Missing required parameters: user_id and status' })
    }

    const targetRole = role === 'nurse' ? 'nurse' : 'doctor'
    const roleTable = targetRole === 'nurse' ? 'nurses' : 'doctors'
    const isVerified = status === 'verified'

    // 2. Update role table (doctors or nurses)
    const roleUpdateData = {
      verified_by_admin: isVerified,
      verification_notes: notes || (isVerified ? `Verified by ${targetRole === 'nurse' ? 'NMCN' : 'MDCN'} Partner Council` : `Not verified by ${targetRole === 'nurse' ? 'NMCN' : 'MDCN'} Council`)
    }

    if (isVerified) {
      roleUpdateData.government_id_status = 'verified'
      roleUpdateData.annual_license_status = 'verified'
      if (targetRole === 'nurse') {
        roleUpdateData.nursing_degree_status = 'verified'
      } else {
        roleUpdateData.medical_degree_status = 'verified'
      }
      roleUpdateData.registration_certificate_status = 'verified'
    } else {
      roleUpdateData.government_id_status = 'rejected'
      roleUpdateData.annual_license_status = 'rejected'
      if (targetRole === 'nurse') {
        roleUpdateData.nursing_degree_status = 'rejected'
      } else {
        roleUpdateData.medical_degree_status = 'rejected'
      }
      roleUpdateData.registration_certificate_status = 'rejected'
    }

    const { error: roleError } = await supabase
      .from(roleTable)
      .update(roleUpdateData)
      .eq('user_id', user_id)

    if (roleError) {
      // Try updating by primary key id if user_id update did not match
      await supabase.from(roleTable).update(roleUpdateData).eq('id', user_id)
    }

    // 3. Update profiles table
    const profileUpdateData = {
      verified_at: isVerified ? new Date().toISOString() : null,
      verification_notes: notes || (isVerified ? `Verified by ${targetRole === 'nurse' ? 'NMCN' : 'MDCN'} Partner Council` : `Not verified by ${targetRole === 'nurse' ? 'NMCN' : 'MDCN'} Council`)
    }

    await supabase
      .from('profiles')
      .update(profileUpdateData)
      .eq('id', user_id)

    // 4. Update all document_uploads for this user
    const docStatus = isVerified ? 'verified' : (status === 'not_verified' ? 'not_verified' : 'rejected')
    await supabase
      .from('document_uploads')
      .update({
        verification_status: docStatus,
        verification_notes: notes || null,
        verified_at: isVerified ? new Date().toISOString() : null
      })
      .eq('user_id', user_id)

    return res.status(200).json({
      success: true,
      message: `Profile successfully marked as ${isVerified ? 'Verified' : 'Not Verified'}.`,
      user_id,
      status: isVerified ? 'verified' : 'not_verified',
      verified_by_admin: isVerified
    })
  } catch (err) {
    console.error('MDCN verify handler error:', err)
    return res.status(500).json({ error: 'Internal server error: ' + err.message })
  }
}
