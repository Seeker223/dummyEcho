import { supabase } from '../../../lib/supabase-admin.js'

export default async function handler(req, res) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-partner-token, x-admin-token')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
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

    // Allow access in development/demo if fallback is needed, but check token first
    if (!isAuthorized && !validPins.includes(partnerToken)) {
      return res.status(401).json({ error: 'Unauthorized partner access. Please log in with your valid MDCN/NMCN Partner PIN.' })
    }

    const { role = 'doctor' } = req.query
    const targetRole = role === 'nurse' ? 'nurse' : 'doctor'
    const roleTable = targetRole === 'nurse' ? 'nurses' : 'doctors'

    // 2. Fetch from profiles table where role matches
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', targetRole)
      .order('created_at', { ascending: false })

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
    }

    const profileList = profiles || []

    // 3. Fetch from role table (doctors or nurses)
    const { data: roleRecords, error: roleError } = await supabase
      .from(roleTable)
      .select('*')

    if (roleError) {
      console.error(`Error fetching ${roleTable}:`, roleError)
    }

    const roleMap = {}
    if (roleRecords) {
      roleRecords.forEach(rec => {
        if (rec.user_id) roleMap[rec.user_id] = rec
        if (rec.id && !rec.user_id) roleMap[rec.id] = rec
      })
    }

    // Also include any role records that might not be in profiles table
    const allUserIds = new Set(profileList.map(p => p.id))
    if (roleRecords) {
      roleRecords.forEach(rec => {
        const uid = rec.user_id || rec.id
        if (uid && !allUserIds.has(uid)) {
          allUserIds.add(uid)
          profileList.push({
            id: uid,
            full_name: rec.full_name || rec.name || 'Unnamed Clinician',
            email: rec.email || '',
            phone_number: rec.phone_number || rec.phone || '',
            role: targetRole,
            created_at: rec.created_at || new Date().toISOString()
          })
        }
      })
    }

    // 4. Fetch all document uploads for these users
    const userIdsArray = Array.from(allUserIds)
    let docMap = {}
    if (userIdsArray.length > 0) {
      const { data: docs, error: docsError } = await supabase
        .from('document_uploads')
        .select('*')
        .in('user_id', userIdsArray)
        .order('created_at', { ascending: false })

      if (!docsError && docs) {
        docs.forEach(doc => {
          if (!docMap[doc.user_id]) docMap[doc.user_id] = []
          docMap[doc.user_id].push(doc)
        })
      }
    }

    // 5. Merge and format clinician records
    const clinicians = profileList.map(profile => {
      const clinician = roleMap[profile.id] || {}
      const userDocs = docMap[profile.id] || []

      // Build fallback docs from columns if not in document_uploads
      const columnDocs = []
      const checkAndAddDoc = (type, colPath, colStatus, name) => {
        if (clinician[colPath] || profile[colPath]) {
          const path = clinician[colPath] || profile[colPath]
          const status = clinician[colStatus] || profile[colStatus] || 'pending'
          // check if already in userDocs
          const exists = userDocs.some(d => d.document_type === type || d.file_path === path)
          if (!exists) {
            columnDocs.push({
              id: `${profile.id}_${type}`,
              user_id: profile.id,
              document_type: type,
              file_name: name,
              file_path: path,
              verification_status: status,
              created_at: clinician.updated_at || profile.created_at || new Date().toISOString()
            })
          }
        }
      }

      checkAndAddDoc('gov_id', 'government_id', 'government_id_status', 'Government ID')
      checkAndAddDoc('annual_license', 'annual_license', 'annual_license_status', 'Annual Practicing License')
      checkAndAddDoc('degree', targetRole === 'nurse' ? 'nursing_degree' : 'medical_degree', targetRole === 'nurse' ? 'nursing_degree_status' : 'medical_degree_status', targetRole === 'nurse' ? 'Nursing Degree' : 'Medical Degree')
      checkAndAddDoc('full_registration_certificate', 'registration_certificate', 'registration_certificate_status', 'Registration Certificate')

      const allDocs = [...userDocs, ...columnDocs]

      // Determine verification status
      let isVerified = Boolean(clinician.verified_by_admin || profile.verified_at || clinician.verification_status === 'verified' || profile.verification_status === 'verified')
      let status = isVerified ? 'verified' : (clinician.verification_notes || profile.verification_notes ? 'not_verified' : 'pending')
      if (!isVerified && allDocs.length > 0 && allDocs.every(d => d.verification_status === 'verified')) {
        isVerified = true
        status = 'verified'
      } else if (allDocs.some(d => d.verification_status === 'rejected' || d.verification_status === 'not_verified')) {
        status = 'not_verified'
      }

      return {
        id: profile.id,
        user_id: profile.id,
        full_name: profile.full_name || clinician.full_name || clinician.name || 'Unnamed Clinician',
        email: profile.email || clinician.email || 'N/A',
        phone_number: profile.phone_number || clinician.phone_number || clinician.phone || 'N/A',
        role: targetRole,
        license_number: clinician.license_number || clinician.license_id || profile.license_number || profile.license_id || 'Pending Submission',
        certification: clinician.certification || clinician.specialty || profile.specialty || (targetRole === 'nurse' ? 'Registered Nurse (RN)' : 'General Practitioner'),
        department: clinician.department || clinician.specialty || profile.department || (targetRole === 'nurse' ? 'Nursing & Midwifery' : 'General Medicine'),
        state: clinician.state || profile.state || 'Lagos / Nigeria',
        hospital_affiliation: clinician.hospital_affiliation || clinician.hospital || profile.hospital || 'Private / Healthcare Partner',
        years_of_experience: clinician.years_of_experience || profile.years_of_experience || 2,
        verification_status: status,
        verified_by_admin: isVerified,
        verification_notes: clinician.verification_notes || profile.verification_notes || '',
        verified_at: profile.verified_at || clinician.verified_at || null,
        created_at: profile.created_at || clinician.created_at || new Date().toISOString(),
        documents: allDocs
      }
    })

    // Calculate summary statistics
    const stats = {
      total: clinicians.length,
      verified: clinicians.filter(c => c.verification_status === 'verified').length,
      pending: clinicians.filter(c => c.verification_status === 'pending').length,
      not_verified: clinicians.filter(c => c.verification_status === 'not_verified').length
    }

    return res.status(200).json({
      success: true,
      role: targetRole,
      stats,
      clinicians
    })
  } catch (err) {
    console.error('MDCN list handler error:', err)
    return res.status(500).json({ error: 'Internal server error: ' + err.message })
  }
}
