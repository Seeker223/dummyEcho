import { supabase } from '../../../lib/supabaseClient'

const DOC_KEY = 'ee_documents:v1'

function readJson(key, fallback) {
  const raw = window.localStorage.getItem(key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

function nowIso() {
  return new Date().toISOString()
}

export const DocumentKinds = {
  GOV_ID: 'gov_id',
  ANNUAL_LICENSE: 'annual_license',
  DEGREE: 'degree',
  FULL_REG_CERT: 'full_registration_certificate',
}

export function getAllDocuments() {
  const existing = readJson(DOC_KEY, null)
  if (Array.isArray(existing)) return existing
  writeJson(DOC_KEY, [])
  return []
}

export function getUserDocuments(userId) {
  const id = String(userId || '').trim()
  if (!id) return []
  return getAllDocuments().filter((d) => String(d.userId) === id)
}

export async function upsertUserDocument({ userId, kind, file, meta = {} }) {
  const k = String(kind || '').trim()
  if (!k) throw new Error('Missing document kind.')
  if (!file) throw new Error('Choose a file to upload.')

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('No active user session.')

  const formData = new FormData()
  formData.append('document', file)
  formData.append('user_id', userId || session.user.id)
  formData.append('doc_type', k)
  formData.append('metadata', JSON.stringify(meta))

  const response = await fetch('/api/documents/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`
    },
    body: formData,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to upload document.')
  }

  // To keep the UI reactive, we'll still save a mock reference in localStorage 
  // so the UI knows it's pending without having to fetch the list immediately.
  const docs = getAllDocuments()
  const nextDoc = {
    id: data.document?.id || data.document_id || `doc-${Date.now()}`,
    userId: String(userId || session.user.id),
    kind: k,
    status: 'pending',
    uploadedAt: nowIso(),
    fileName: String(file.name || 'upload'),
    fileType: String(file.type || ''),
    fileSize: Number(file.size || 0),
    ...meta,
  }

  const next = [nextDoc, ...docs].slice(0, 80)
  writeJson(DOC_KEY, next)
  return nextDoc
}

export async function setDocumentStatus(docId, { status, reviewerId, reviewNote } = {}) {
  const id = String(docId || '').trim()
  if (!id) throw new Error('Missing document id.')
  const nextStatus = status === 'verified' ? 'verified' : status === 'rejected' ? 'rejected' : 'pending'

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('No active session.')

  const action = nextStatus === 'verified' ? 'approve' : nextStatus === 'rejected' ? 'reject' : 'pending'

  const response = await fetch('/api/documents/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    },
    body: JSON.stringify({
      document_id: id,
      action,
      notes: reviewNote || ''
    })
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || 'Failed to update verification status.')
  }

  const docs = getAllDocuments()
  const idx = docs.findIndex((d) => d.id === id)
  if (idx >= 0) {
    const nextDoc = {
      ...docs[idx],
      status: nextStatus,
      reviewedAt: nextStatus === 'pending' ? null : nowIso(),
      reviewerId: reviewerId || null,
      reviewNote: String(reviewNote || ''),
    }

    const next = [...docs]
    next[idx] = nextDoc
    writeJson(DOC_KEY, next)
    return nextDoc
  }
}

export function getLatestDocumentByKind(userId, kind) {
  const docs = getUserDocuments(userId).filter((d) => String(d.kind) === String(kind))
  if (!docs.length) return null
  return docs.slice().sort((a, b) => String(b.uploadedAt).localeCompare(String(a.uploadedAt)))[0]
}

export function getVerificationSummary(userId) {
  const docs = getUserDocuments(userId)
  const counts = { pending: 0, verified: 0, rejected: 0 }
  for (const d of docs) {
    const s = String(d.status || 'pending')
    if (s in counts) counts[s] += 1
    else counts.pending += 1
  }
  return { counts, docs }
}

export async function syncUserDocuments(userId) {
  const id = String(userId || '').trim()
  if (!id) return []

  const { data, error } = await supabase
    .from('document_uploads')
    .select('*')
    .eq('user_id', id)

  if (error) {
    console.error('Error syncing user documents:', error)
    return []
  }

  const normalized = data.map((d) => ({
    id: d.id,
    userId: String(d.user_id),
    kind: d.document_type,
    status: d.verification_status,
    uploadedAt: d.created_at,
    fileName: d.file_name,
    fileSize: d.file_size,
    fileType: d.mime_type,
  }))

  const allDocs = getAllDocuments().filter((d) => String(d.userId) !== id)
  const next = [...normalized, ...allDocs].slice(0, 100)
  writeJson(DOC_KEY, next)
  return normalized
}

export async function syncAllDocuments() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return []

  const { data, error } = await supabase
    .from('document_uploads')
    .select('*')

  if (error) {
    console.error('Error syncing all documents:', error)
    return []
  }

  const normalized = data.map((d) => ({
    id: d.id,
    userId: String(d.user_id),
    kind: d.document_type,
    status: d.verification_status,
    uploadedAt: d.created_at,
    fileName: d.file_name,
    fileSize: d.file_size,
    fileType: d.mime_type,
  }))

  writeJson(DOC_KEY, normalized)
  return normalized
}

