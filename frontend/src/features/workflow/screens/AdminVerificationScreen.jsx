import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Screen } from './ScreenPrimitives'
import { InPageMenuButton } from '../components/InPageMenuButton'
import { useAuth } from '../../auth/context/useAuth'
import { useAppState } from '../../../app/context/useAppState'
import { DocumentKinds, setDocumentStatus } from '../services/documentService'
import { supabase } from '../../../lib/supabaseClient'
import {
  AdminBackBtn,
  AdminBadge,
  AdminBtn,
  AdminCard,
  AdminCardSub,
  AdminCardTitle,
  AdminHeader,
  AdminHeaderLeft,
  AdminInput,
  AdminItem,
  AdminItemSub,
  AdminItemTitle,
  AdminRow,
  AdminSelect,
  AdminSub,
  AdminTable,
  AdminTitle,
  AdminTitleBlock,
  AdminSmallBtn,
} from './admin/AdminPrimitives'

function labelForKind(kind) {
  switch (kind) {
    case DocumentKinds.GOV_ID:
      return 'Government ID'
    case DocumentKinds.ANNUAL_LICENSE:
      return 'Annual licence'
    case DocumentKinds.DEGREE:
      return 'Degree'
    case DocumentKinds.FULL_REG_CERT:
      return 'Full registration certificate'
    default:
      return String(kind || 'document')
  }
}

export default function AdminVerificationScreen() {
  const navigate = useNavigate()
  const { users, currentUser } = useAuth()
  const { showToast } = useAppState()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [kindFilter, setKindFilter] = useState('all')
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshToken, setRefreshToken] = useState(0)

  useEffect(() => {
    let active = true

    async function fetchDocs() {
      setLoading(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const response = await fetch('/api/documents/list', {
          cache: 'no-store',
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        })

        const data = await response.json()
        if (response.ok && active) {
          const normalized = (data.documents || []).map((d) => ({
            id: d.id,
            userId: d.user_id,
            kind: d.document_type,
            status: d.verification_status,
            uploadedAt: d.created_at,
            fileName: d.file_name,
            fileSize: d.file_size,
            fileType: d.mime_type,
            filePath: d.file_path,
            user: d.profiles ? {
              fullName: d.profiles.full_name,
              email: d.profiles.email,
              role: d.profiles.role
            } : null
          }))
          setDocs(normalized)
        }
      } catch (err) {
        console.error('Error fetching verification documents:', err)
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchDocs()

    return () => {
      active = false
    }
  }, [refreshToken])

  const filtered = useMemo(() => {
    const q = String(query || '').trim().toLowerCase()
    return docs.filter((d) => {
      if (statusFilter !== 'all' && String(d.status) !== statusFilter) return false
      if (kindFilter !== 'all' && String(d.kind) !== kindFilter) return false
      if (!q) return true
      const user = d.user || users?.find((u) => u.id === d.userId) || null
      const hay = `${user?.fullName || ''} ${user?.email || ''} ${d.fileName || ''} ${d.kind || ''} ${d.status || ''}`
      return hay.toLowerCase().includes(q)
    })
  }, [docs, kindFilter, query, statusFilter, users])

  const review = async (id, status) => {
    try {
      await setDocumentStatus(id, { status, reviewerId: currentUser?.id || 'admin' })
      setRefreshToken((n) => n + 1)
    } catch (err) {
      showToast(err.message || 'Failed to update document status', 'error')
    }
  }

  const viewDocument = async (filePath) => {
    if (!filePath) {
      showToast('File path is missing', 'error')
      return
    }
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not logged in')

      const response = await fetch(`/api/documents/view?path=${encodeURIComponent(filePath)}`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to fetch document URL')

      window.open(data.url, '_blank')
    } catch (err) {
      showToast('Failed to open document: ' + err.message, 'error')
    }
  }

  return (
    <Screen>
      <AdminHeader>
        <AdminHeaderLeft>
          <InPageMenuButton />
          <AdminBackBtn type="button" onClick={() => navigate('/app/admin')} aria-label="Back">
            {'<'}
          </AdminBackBtn>
          <AdminTitleBlock>
            <AdminTitle>Admin: Verification</AdminTitle>
            <AdminSub>Review uploaded documents (Database)</AdminSub>
          </AdminTitleBlock>
        </AdminHeaderLeft>
        <div style={{ width: 44 }} />
      </AdminHeader>

      <AdminCard aria-label="Verification console">
        <AdminCardTitle>Document queue</AdminCardTitle>
        <AdminCardSub>All uploads start pending until manually verified.</AdminCardSub>

        <AdminRow>
          <AdminInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search user, file name, kind..." />
          <AdminSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </AdminSelect>
          <AdminSelect value={kindFilter} onChange={(e) => setKindFilter(e.target.value)}>
            <option value="all">All kinds</option>
            <option value={DocumentKinds.GOV_ID}>Government ID</option>
            <option value={DocumentKinds.ANNUAL_LICENSE}>Annual licence</option>
            <option value={DocumentKinds.DEGREE}>Degree</option>
            <option value={DocumentKinds.FULL_REG_CERT}>Full registration certificate</option>
          </AdminSelect>
          <AdminBtn type="button" onClick={() => setRefreshToken((n) => n + 1)}>
            Refresh
          </AdminBtn>
        </AdminRow>

        {loading ? (
          <AdminTable>
            <AdminItemSub style={{ padding: 12 }}>Loading document queue from Supabase...</AdminItemSub>
          </AdminTable>
        ) : (
          <AdminTable>
            {filtered.slice(0, 24).map((d) => {
              const user = d.user || users?.find((u) => u.id === d.userId) || null
              return (
                <AdminItem key={d.id}>
                  <div style={{ minWidth: 0 }}>
                    <AdminItemTitle>{labelForKind(d.kind)}</AdminItemTitle>
                    <AdminItemSub>{user?.fullName || d.userId} ({user?.role || 'clinician'})</AdminItemSub>
                    <AdminItemSub>
                      {d.fileName} {d.fileSize ? `(${Math.round(d.fileSize / 1024)} KB)` : ''}
                    </AdminItemSub>
                    <AdminItemSub>Uploaded: {d.uploadedAt ? new Date(d.uploadedAt).toLocaleString() : 'N/A'}</AdminItemSub>
                  </div>
                  <div style={{ display: 'grid', gap: 8, justifyItems: 'end' }}>
                    <AdminBadge $status={d.status}>{d.status}</AdminBadge>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <AdminSmallBtn type="button" $variant="view" onClick={() => viewDocument(d.filePath)}>
                        View
                      </AdminSmallBtn>
                      {d.status !== 'verified' && (
                        <AdminSmallBtn type="button" $variant="verify" onClick={() => review(d.id, 'verified')}>
                          Verify
                        </AdminSmallBtn>
                      )}
                      {d.status !== 'rejected' && (
                        <AdminSmallBtn type="button" $variant="reject" onClick={() => review(d.id, 'rejected')}>
                          Reject
                        </AdminSmallBtn>
                      )}
                      {d.status !== 'pending' && (
                        <AdminSmallBtn type="button" $variant="pending" onClick={() => review(d.id, 'pending')}>
                          Make Pending
                        </AdminSmallBtn>
                      )}
                    </div>
                  </div>
                </AdminItem>
              )
            })}

            {filtered.length === 0 ? (
              <AdminItem>
                <div style={{ minWidth: 0 }}>
                  <AdminItemTitle>No documents found</AdminItemTitle>
                  <AdminItemSub>Uploads will appear here once clinicians submit them.</AdminItemSub>
                </div>
                <AdminBadge>empty</AdminBadge>
              </AdminItem>
            ) : null}
          </AdminTable>
        )}
      </AdminCard>
    </Screen>
  )
}
