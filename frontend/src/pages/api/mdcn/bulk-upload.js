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

    const { records = [], role = 'doctor' } = req.body

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: 'No records provided for bulk verification update.' })
    }

    const targetRole = role === 'nurse' ? 'nurse' : 'doctor'
    const roleTable = targetRole === 'nurse' ? 'nurses' : 'doctors'

    let updatedCount = 0
    let errors = []

    // 2. Process each record
    for (const item of records) {
      const licenseNum = item.license_number || item.license_id || item['License Number'] || item['License ID'] || item['MDCN Folio Number'] || item['MDCN Folio'] || item['NMCN License'] || item['Folio Number']
      const email = item.email || item['Email'] || item['Email Address']
      const statusRaw = String(item.status || item.verification_status || item['Status'] || item['Verification Status'] || '').toLowerCase().trim()
      
      const isVerified = ['verified', 'approved', 'yes', 'true', '1', 'active'].includes(statusRaw)
      const isRejected = ['not_verified', 'not verified', 'rejected', 'no', 'false', '0', 'inactive', 'unverified'].includes(statusRaw)

      if (!isVerified && !isRejected) {
        continue // Skip unrecognized statuses
      }

      const notes = item.notes || item['Notes'] || item['Verification Notes'] || (isVerified ? `Bulk Verified by ${targetRole === 'nurse' ? 'NMCN' : 'MDCN'} Partner Council` : 'Marked Not Verified in Bulk Upload')

      // Find matching user by license_number or email
      let targetUserId = null

      if (licenseNum) {
        const { data: matchedByLic } = await supabase
          .from(roleTable)
          .select('user_id, id')
          .or(`license_number.ilike.${licenseNum},license_id.ilike.${licenseNum}`)
          .limit(1)

        if (matchedByLic && matchedByLic.length > 0) {
          targetUserId = matchedByLic[0].user_id || matchedByLic[0].id
        }
      }

      if (!targetUserId && email) {
        const { data: matchedByEmail } = await supabase
          .from('profiles')
          .select('id')
          .ilike('email', email)
          .limit(1)

        if (matchedByEmail && matchedByEmail.length > 0) {
          targetUserId = matchedByEmail[0].id
        }
      }

      if (targetUserId) {
        // Update role table
        const roleUpdateData = {
          verified_by_admin: isVerified,
          verification_notes: notes
        }
        if (isVerified) {
          roleUpdateData.government_id_status = 'verified'
          roleUpdateData.annual_license_status = 'verified'
          if (targetRole === 'nurse') roleUpdateData.nursing_degree_status = 'verified'
          else roleUpdateData.medical_degree_status = 'verified'
          roleUpdateData.registration_certificate_status = 'verified'
        } else {
          roleUpdateData.government_id_status = 'rejected'
          roleUpdateData.annual_license_status = 'rejected'
          if (targetRole === 'nurse') roleUpdateData.nursing_degree_status = 'rejected'
          else roleUpdateData.medical_degree_status = 'rejected'
          roleUpdateData.registration_certificate_status = 'rejected'
        }

        await supabase.from(roleTable).update(roleUpdateData).eq('user_id', targetUserId)
        await supabase.from(roleTable).update(roleUpdateData).eq('id', targetUserId)

        // Update profiles table
        await supabase.from('profiles').update({
          verified_at: isVerified ? new Date().toISOString() : null,
          verification_notes: notes
        }).eq('id', targetUserId)

        // Update document uploads
        await supabase.from('document_uploads').update({
          verification_status: isVerified ? 'verified' : 'not_verified',
          verification_notes: notes,
          verified_at: isVerified ? new Date().toISOString() : null
        }).eq('user_id', targetUserId)

        updatedCount++
      } else {
        errors.push(`Could not find matching ${targetRole} for License: ${licenseNum || 'N/A'}, Email: ${email || 'N/A'}`)
      }
    }

    return res.status(200).json({
      success: true,
      updated_count: updatedCount,
      total_processed: records.length,
      errors: errors.slice(0, 10), // return top 10 errors if any
      message: `Successfully updated ${updatedCount} out of ${records.length} records.`
    })
  } catch (err) {
    console.error('MDCN bulk upload error:', err)
    return res.status(500).json({ error: 'Internal server error: ' + err.message })
  }
}
