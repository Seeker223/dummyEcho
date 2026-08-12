import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/context/useAuth'
import { Screen } from './ScreenPrimitives'
import { InPageMenuButton } from '../components/InPageMenuButton'
import { BrandedSheetModal } from '../components/BrandedSheetModal'
import { professionalSpecialties } from '../constants/specialties'
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
  AdminSmallBtn,
  AdminSub,
  AdminTitle,
  AdminTitleBlock,
  AdminTwoCol,
  AdminDangerBtn,
  AdminTable,
} from './admin/AdminPrimitives'

function safeLower(value) {
  return String(value || '').trim().toLowerCase()
}

function isValidEmail(value) {
  const v = String(value || '').trim()
  if (!v) return true
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

export default function AdminUsersScreen() {
  const navigate = useNavigate()
  const { users, adminUpsertUser, adminDeleteUser } = useAuth()
  const [query, setQuery] = useState('')
  const [notice, setNotice] = useState(null) // { tone: 'success' | 'error', text: string }
  const [fieldErrors, setFieldErrors] = useState(() => ({}))
  const [confirmDeleteId, setConfirmDeleteId] = useState('')
  const [userDraft, setUserDraft] = useState(() => ({
    id: '',
    role: 'patient', // career
    accessRole: 'user',
    title: '',
    fullName: '',
    username: '',
    email: '',
    phone: '',
    specialization: '',
    password: '',
  }))

  const filteredUsers = useMemo(() => {
    const q = safeLower(query)
    if (!q) return users || []
    return (users || []).filter((u) => {
      const hay = `${u.fullName || ''} ${u.username || ''} ${u.email || ''} ${u.role || ''} ${u.accessRole || ''} ${u.specialization || ''}`
      return safeLower(hay).includes(q)
    })
  }, [query, users])

  const deleteTarget = useMemo(() => {
    const id = String(confirmDeleteId || '').trim()
    if (!id) return null
    return (users || []).find((u) => u.id === id) || null
  }, [confirmDeleteId, users])

  const loadUserIntoDraft = (u) => {
    setNotice(null)
    setFieldErrors({})
    setUserDraft({
      id: u?.id || '',
      role: u?.role || 'patient',
      accessRole: u?.accessRole || (u?.role === 'admin' ? 'admin' : 'user'),
      title: u?.title || '',
      fullName: u?.fullName || '',
      username: u?.username || '',
      email: u?.email || '',
      phone: u?.phone || '',
      specialization: u?.specialization || '',
      password: '',
    })
  }

  const saveUser = () => {
    setNotice(null)
    const nextErrors = {}

    const role = safeLower(userDraft.role)
    const accessRole = safeLower(userDraft.accessRole || 'user')
    if (!['patient', 'doctor', 'nurse', 'partner'].includes(role)) nextErrors.role = 'Select a valid career.'
    if (!['user', 'admin'].includes(accessRole)) nextErrors.accessRole = 'Select a valid access role.'

    const fullName = String(userDraft.fullName || '').trim()
    if (!fullName) nextErrors.fullName = 'Full name is required.'

    const email = String(userDraft.email || '').trim()
    if (email && !isValidEmail(email)) nextErrors.email = 'Enter a valid email address.'

    const username = String(userDraft.username || '').trim()
    if (!email && !username) nextErrors.username = 'Provide a username or email.'

    const specialization = String(userDraft.specialization || '').trim()
    if ((role === 'doctor' || role === 'nurse') && !specialization) nextErrors.specialization = 'Specialization is recommended for clinicians.'

    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      setNotice({ tone: 'error', text: 'Please fix the highlighted fields.' })
      return
    }

    try {
      const payload = { ...userDraft, role, accessRole, fullName, email, username }
      adminUpsertUser?.(payload)
      setUserDraft((p) => ({ ...p, password: '' }))
      setNotice({ tone: 'success', text: 'Saved. User updated in local storage.' })
    } catch (err) {
      setNotice({ tone: 'error', text: err?.message ? String(err.message) : 'Failed to save user.' })
    }
  }

  const removeUser = (userId) => {
    if (!userId) return
    setNotice(null)
    try {
      adminDeleteUser?.(userId)
      setNotice({ tone: 'success', text: 'User removed.' })
    } catch (err) {
      setNotice({ tone: 'error', text: err?.message ? String(err.message) : 'Failed to remove user.' })
    }
    if (userDraft.id === userId) {
      setUserDraft({
        id: '',
        role: 'patient',
        accessRole: 'user',
        title: '',
        fullName: '',
        username: '',
        email: '',
        phone: '',
        specialization: '',
        password: '',
      })
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
            <AdminTitle>Admin: Users</AdminTitle>
            <AdminSub>User CRUD and supervision</AdminSub>
          </AdminTitleBlock>
        </AdminHeaderLeft>
        <div style={{ width: 44 }} />
      </AdminHeader>

      <AdminCard aria-label="Admin users">
        <AdminCardTitle>Users</AdminCardTitle>
        <AdminCardSub>Search, create, edit, and remove users.</AdminCardSub>
        {notice ? (
          <div
            style={{
              marginTop: 10,
              borderRadius: 14,
              padding: '10px 12px',
              border: notice.tone === 'error' ? '1px solid rgba(239,68,68,0.28)' : '1px solid rgba(34,197,94,0.24)',
              background: notice.tone === 'error' ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)',
              color: 'inherit',
              fontWeight: 750,
            }}
            role={notice.tone === 'error' ? 'alert' : 'status'}
          >
            {notice.text}
          </div>
        ) : null}
        <AdminRow>
          <AdminInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, email, role..." />
          <AdminBadge aria-label="User totals">
            {filteredUsers.length}/{(users || []).length}
          </AdminBadge>
          <AdminBtn type="button" onClick={() => navigate('/app/directory')}>
            Open directory
          </AdminBtn>
          <AdminBtn
            type="button"
            onClick={() =>
              setUserDraft({
                id: '',
                role: 'patient',
                title: '',
                fullName: '',
                username: '',
                email: '',
                phone: '',
                specialization: '',
                password: '',
              })
            }
          >
            New user
          </AdminBtn>
        </AdminRow>

        <AdminTwoCol>
          <div>
            <AdminCardTitle style={{ marginTop: 2 }}>User CRUD</AdminCardTitle>
            <AdminCardSub>Create/update a user in local storage.</AdminCardSub>
            <AdminRow>
              <AdminInput
                value={userDraft.id}
                onChange={(e) => setUserDraft((p) => ({ ...p, id: e.target.value }))}
                placeholder="User id (optional for new)"
              />
              <AdminSelect
                value={userDraft.role}
                onChange={(e) => setUserDraft((p) => ({ ...p, role: e.target.value }))}
                aria-invalid={Boolean(fieldErrors.role)}
                style={fieldErrors.role ? { borderColor: 'rgba(239,68,68,0.55)' } : null}
              >
                {['patient', 'doctor', 'nurse', 'partner'].map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </AdminSelect>
            </AdminRow>
            {fieldErrors.role ? <AdminItemSub style={{ color: '#b91c1c' }}>{fieldErrors.role}</AdminItemSub> : null}

            <AdminRow>
              <AdminSelect
                value={userDraft.accessRole || 'user'}
                onChange={(e) => setUserDraft((p) => ({ ...p, accessRole: e.target.value }))}
                aria-invalid={Boolean(fieldErrors.accessRole)}
                style={fieldErrors.accessRole ? { borderColor: 'rgba(239,68,68,0.55)' } : null}
              >
                {['user', 'admin'].map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </AdminSelect>
              <div style={{ flex: '1 1 220px' }} />
            </AdminRow>
            {fieldErrors.accessRole ? <AdminItemSub style={{ color: '#b91c1c' }}>{fieldErrors.accessRole}</AdminItemSub> : null}
            <AdminRow>
              <AdminInput
                value={userDraft.fullName}
                onChange={(e) => setUserDraft((p) => ({ ...p, fullName: e.target.value }))}
                placeholder="Full name"
                aria-invalid={Boolean(fieldErrors.fullName)}
                style={fieldErrors.fullName ? { borderColor: 'rgba(239,68,68,0.55)' } : null}
              />
              <AdminInput
                value={userDraft.title}
                onChange={(e) => setUserDraft((p) => ({ ...p, title: e.target.value }))}
                placeholder="Title (Dr., Nurse, Mr., etc.)"
              />
            </AdminRow>
            {fieldErrors.fullName ? <AdminItemSub style={{ color: '#b91c1c' }}>{fieldErrors.fullName}</AdminItemSub> : null}
            <AdminRow>
              <AdminInput
                value={userDraft.email}
                onChange={(e) => setUserDraft((p) => ({ ...p, email: e.target.value }))}
                placeholder="Email"
                aria-invalid={Boolean(fieldErrors.email)}
                style={fieldErrors.email ? { borderColor: 'rgba(239,68,68,0.55)' } : null}
              />
              <AdminInput
                value={userDraft.username}
                onChange={(e) => setUserDraft((p) => ({ ...p, username: e.target.value }))}
                placeholder="Username"
                aria-invalid={Boolean(fieldErrors.username)}
                style={fieldErrors.username ? { borderColor: 'rgba(239,68,68,0.55)' } : null}
              />
            </AdminRow>
            {fieldErrors.email ? <AdminItemSub style={{ color: '#b91c1c' }}>{fieldErrors.email}</AdminItemSub> : null}
            {fieldErrors.username ? <AdminItemSub style={{ color: '#b91c1c' }}>{fieldErrors.username}</AdminItemSub> : null}
            <AdminRow>
              <AdminInput value={userDraft.phone} onChange={(e) => setUserDraft((p) => ({ ...p, phone: e.target.value }))} placeholder="Phone" />
              <AdminInput
                value={userDraft.specialization}
                onChange={(e) => setUserDraft((p) => ({ ...p, specialization: e.target.value }))}
                placeholder="Specialization (optional)"
                list="professional-specialties"
                aria-invalid={Boolean(fieldErrors.specialization)}
                style={fieldErrors.specialization ? { borderColor: 'rgba(239,68,68,0.55)' } : null}
              />
              <datalist id="professional-specialties">
                {professionalSpecialties.map((specialty) => (
                  <option key={specialty} value={specialty} />
                ))}
              </datalist>
            </AdminRow>
            {fieldErrors.specialization ? <AdminItemSub style={{ color: '#b45309' }}>{fieldErrors.specialization}</AdminItemSub> : null}
            <AdminRow>
              <AdminInput
                value={userDraft.password}
                onChange={(e) => setUserDraft((p) => ({ ...p, password: e.target.value }))}
                placeholder="Password (leave blank to keep existing)"
                type="password"
              />
              <AdminBtn type="button" onClick={saveUser}>
                Save user
              </AdminBtn>
              <AdminDangerBtn
                type="button"
                disabled={!String(userDraft.id || '').trim()}
                aria-disabled={!String(userDraft.id || '').trim()}
                onClick={() => {
                  const id = String(userDraft.id || '').trim()
                  if (!id) {
                    setNotice({ tone: 'error', text: 'Select a user (with an id) to delete.' })
                    return
                  }
                  setConfirmDeleteId(id)
                }}
              >
                Delete
              </AdminDangerBtn>
            </AdminRow>
          </div>

          <div>
            <AdminCardTitle style={{ marginTop: 2 }}>Users preview</AdminCardTitle>
            <AdminCardSub>Tap Edit to load into the form.</AdminCardSub>
            <AdminTable>
              {filteredUsers.slice(0, 12).map((u) => (
                <AdminItem key={u.id || `${u.email || 'no-email'}:${u.username || 'no-username'}`}>
                  <div style={{ minWidth: 0 }}>
                    <AdminItemTitle>{u.fullName || u.username || u.email || 'User'}</AdminItemTitle>
                    <AdminItemSub>
                      {u.email || 'No email'}
                      {u.phone ? ` - ${u.phone}` : ''}
                    </AdminItemSub>
                    {u.specialization ? <AdminItemSub>{u.specialization}</AdminItemSub> : null}
                  </div>
                  <div style={{ display: 'grid', gap: 8, justifyItems: 'end' }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <AdminBadge>{u.role || 'unknown'}</AdminBadge>
                      <AdminBadge>{u.accessRole || 'user'}</AdminBadge>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <AdminSmallBtn type="button" onClick={() => loadUserIntoDraft(u)}>
                        Edit
                      </AdminSmallBtn>
                      <AdminSmallBtn
                        type="button"
                        onClick={() => {
                          const id = String(u.id || '').trim()
                          if (!id) {
                            setNotice({ tone: 'error', text: 'This user has no id and cannot be removed.' })
                            return
                          }
                          setConfirmDeleteId(id)
                        }}
                      >
                        Remove
                      </AdminSmallBtn>
                    </div>
                  </div>
                </AdminItem>
              ))}
            </AdminTable>
            {!filteredUsers.length ? <AdminItemSub style={{ marginTop: 8 }}>No users match this search.</AdminItemSub> : null}
          </div>
        </AdminTwoCol>
      </AdminCard>

      <BrandedSheetModal
        isOpen={Boolean(confirmDeleteId)}
        title="Remove user?"
        message={
          deleteTarget
            ? `This will remove ${deleteTarget.fullName || deleteTarget.username || deleteTarget.email || 'this user'} from local storage.`
            : 'This will remove the selected user from local storage.'
        }
        primaryLabel="Remove"
        secondaryLabel="Cancel"
        onPrimary={() => {
          const id = String(confirmDeleteId || '').trim()
          setConfirmDeleteId('')
          if (id) removeUser(id)
        }}
        onClose={() => setConfirmDeleteId('')}
      />
    </Screen>
  )
}
