import formidable from 'formidable'
import fs from 'fs'
import { corsHandler } from '../../../middleware/corsHandler'
import { supabase } from '../../../lib/supabase-admin'

export const config = { api: { bodyParser: false } }

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf']
const MAX_SIZE_MB = 5

export default async function handler(req, res) {
  // Apply CORS headers
  corsHandler(req, res, () => {})

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const token = req.headers.authorization?.replace('Bearer ', '')
  let sessionUserId = null
  if (token) {
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (!authError && user) {
      sessionUserId = user.id
    }
  }

  const form = formidable({ maxFileSize: MAX_SIZE_MB * 1024 * 1024 })

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(400).json({ error: 'File too large or invalid' })

    const file = files.document?.[0] || files.file?.[0]
    const rawUserId = sessionUserId || fields.user_id?.[0] || fields.user_id
    const rawDocType = fields.doc_type?.[0] || fields.doc_type || fields.document_type?.[0] || fields.document_type

    if (!file) return res.status(400).json({ error: 'No file provided' })
    if (!rawUserId) return res.status(400).json({ error: 'No user ID provided' })
    if (!rawDocType) return res.status(400).json({ error: 'No document type provided' })

    const user_id = String(rawUserId).trim()
    const doc_type = String(rawDocType).trim()

    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return res.status(400).json({ error: 'Only JPG, PNG, PDF allowed' })
    }

    // Fetch the user's role from public.profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user_id)
      .single()

    if (profileError || !profile) {
      return res.status(400).json({ error: 'User profile not found.' })
    }

    if (!['doctor', 'nurse'].includes(profile.role)) {
      return res.status(400).json({ error: 'Only doctors and nurses can upload verification credentials.' })
    }

    // Upload to Supabase Storage
    const fileBuffer = fs.readFileSync(file.filepath)
    const ext = file.originalFilename ? file.originalFilename.split('.').pop() : (file.mimetype === 'application/pdf' ? 'pdf' : 'png')
    const filePath = `${user_id}/${profile.role}/${doc_type}/${file.originalFilename || `file_${Date.now()}.${ext}`}`

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, fileBuffer, { contentType: file.mimetype, upsert: true })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return res.status(500).json({ error: 'Upload failed: ' + uploadError.message })
    }

    // Create DB record in document_uploads
    const { data, error: dbError } = await supabase.from('document_uploads').insert({
      user_id,
      profile_id: user_id,
      document_type: doc_type,
      file_path: filePath,
      file_name: file.originalFilename || 'upload',
      file_size: file.size,
      mime_type: file.mimetype,
      verification_status: 'pending'
    }).select().single()

    if (dbError || !data) {
      console.error('Database insertion error:', dbError)
      return res.status(500).json({ error: 'Failed to create document record: ' + (dbError?.message || 'Unknown error') })
    }

    // Sync state columns in the clinician's table
    const roleTable = profile.role === 'nurse' ? 'nurses' : 'doctors'
    const roleUpdates = {}
    
    let statusCol = null
    let pathCol = null
    
    if (doc_type === 'gov_id') {
      statusCol = 'government_id_status'
      pathCol = 'government_id'
    } else if (doc_type === 'annual_license') {
      statusCol = 'annual_license_status'
      pathCol = 'annual_license'
    } else if (doc_type === 'degree') {
      statusCol = profile.role === 'nurse' ? 'nursing_degree_status' : 'medical_degree_status'
      pathCol = profile.role === 'nurse' ? 'nursing_degree' : 'medical_degree'
    } else if (doc_type === 'full_registration_certificate') {
      statusCol = 'registration_certificate_status'
      pathCol = 'registration_certificate'
    }
    
    if (statusCol) {
      roleUpdates[statusCol] = 'pending'
    }
    if (pathCol) {
      roleUpdates[pathCol] = filePath
    }
    
    if (Object.keys(roleUpdates).length > 0) {
      const { error: roleUpdateError } = await supabase
        .from(roleTable)
        .update(roleUpdates)
        .eq('user_id', user_id)
        
      if (roleUpdateError) {
        console.error('Clinician table update error:', roleUpdateError)
      }
    }

    return res.status(200).json({ success: true, document: data, document_id: data.id })
  })
}
