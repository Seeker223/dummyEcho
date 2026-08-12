import formidable from 'formidable'
import fs from 'fs'
import { supabase } from '../../../lib/supabase-admin'

export const config = { api: { bodyParser: false } }

const ALLOWED_TYPES = ['image/jpeg', 'image/png']
const MAX_SIZE_MB = 5

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const token = req.headers.authorization?.replace('Bearer ', '')
  let sessionUserId = null
  if (token) {
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (!authError && user) {
      sessionUserId = user.id
    }
  }

  if (!sessionUserId) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const form = formidable({ maxFileSize: MAX_SIZE_MB * 1024 * 1024 })

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(400).json({ error: 'File too large or invalid' })

    const file = files.avatar?.[0] || files.file?.[0] || files.document?.[0]
    if (!file) return res.status(400).json({ error: 'No file provided' })

    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return res.status(400).json({ error: 'Only JPG and PNG allowed' })
    }

    try {
      const fileBuffer = fs.readFileSync(file.filepath)
      const ext = file.originalFilename ? file.originalFilename.split('.').pop() : 'png'
      const filePath = `${sessionUserId}-${Date.now()}.${ext}`

      // Upload to the public 'avatars' storage bucket using admin client
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, fileBuffer, { contentType: file.mimetype, upsert: true })

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        return res.status(500).json({ error: 'Upload failed: ' + uploadError.message })
      }

      // Get public URL
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath)
      if (!urlData || !urlData.publicUrl) {
        return res.status(500).json({ error: 'Failed to retrieve public URL' })
      }

      // Update profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', sessionUserId)

      if (updateError) {
        console.error('Profile update error:', updateError)
        return res.status(500).json({ error: 'Failed to update profile: ' + updateError.message })
      }

      return res.status(200).json({ success: true, avatarUrl: urlData.publicUrl })
    } catch (e) {
      console.error('Avatar upload handler exception:', e)
      return res.status(500).json({ error: 'Internal server error: ' + e.message })
    }
  })
}
