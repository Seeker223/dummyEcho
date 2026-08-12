import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useAuth } from '../../auth/context/useAuth'
import { Screen, Card, Button, FieldLabel, TextField, SelectField } from './ScreenPrimitives'
import { InPageMenuButton } from '../components/InPageMenuButton'
import { BrandedSheetModal } from '../components/BrandedSheetModal'
import { UploadCard, UploadSelect } from '../components/UploadCard'
import { DocumentKinds, getLatestDocumentByKind, upsertUserDocument, syncUserDocuments } from '../services/documentService'
import { defaultNurseSpecialty, professionalSpecialties } from '../constants/specialties'

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
`

const BackBtn = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  font-weight: 900;
`

const Title = styled.h2`
  margin: 0 0 6px;
  font-size: 1.35rem;
`

const Subtitle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 600;
  line-height: 1.55;
`

const Form = styled.form`
  display: grid;
  gap: 12px;
  margin-top: 14px;
`

export default function ApplyNurseScreen({ asKit = false } = {}) {
  const navigate = useNavigate()
  const { currentUser, updateProfile } = useAuth()
  const [saving, setSaving] = useState(false)
  const [modal, setModal] = useState({ open: false, message: '' })
  const [form, setForm] = useState({
    licenseId: '',
    department: currentUser?.specialization || defaultNurseSpecialty,
  })
  const [idType, setIdType] = useState('NIN')
  const [degreeType, setDegreeType] = useState('RN')
  const [refresh, setRefresh] = useState(0)

  const userId = currentUser?.id

  useEffect(() => {
    if (userId) {
      syncUserDocuments(userId).catch((err) => {
        console.error('Failed to sync documents on mount in ApplyNurseScreen:', err)
      }).finally(() => setRefresh(r => r + 1))
    }
  }, [userId])
  const govId = useMemo(() => getLatestDocumentByKind(userId, DocumentKinds.GOV_ID), [userId, refresh])
  const annual = useMemo(() => getLatestDocumentByKind(userId, DocumentKinds.ANNUAL_LICENSE), [userId, refresh])
  const degree = useMemo(() => getLatestDocumentByKind(userId, DocumentKinds.DEGREE), [userId, refresh])

  const missingDocs = useMemo(() => {
    const missing = []
    if (!govId) missing.push('Government ID')
    if (!annual) missing.push('Annual licence')
    if (!degree) missing.push('Nursing degree')
    return missing
  }, [annual, degree, govId])

  const onSubmit = async (event) => {
    event.preventDefault()
    if (String(form.licenseId || '').trim().length < 3) {
      setModal({ open: true, message: 'Enter your license ID to continue.' })
      return
    }
    if (missingDocs.length) {
      setModal({ open: true, message: `Upload required documents: ${missingDocs.join(', ')}.` })
      return
    }
    setSaving(true)
    try {
      await updateProfile({
        role: 'nurse',
        specialization: form.department,
        licenseNumber: form.licenseId,
        license_number: form.licenseId,
        license_id: form.licenseId,
        professionalKitComplete: true,
      })
      navigate('/app/home')
    } catch (err) {
      setModal({ open: true, message: err?.message || 'Failed to apply' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Screen>
      <BrandedSheetModal
        isOpen={modal.open}
        title="Nurse application"
        message={modal.message}
        primaryLabel="OK"
        secondaryLabel="Close"
        onPrimary={() => setModal({ open: false, message: '' })}
        onClose={() => setModal({ open: false, message: '' })}
      />
      <Header>
        <InPageMenuButton />
        <BackBtn type="button" onClick={() => navigate('/app/home')} aria-label="Back">
          {'<'}
        </BackBtn>
        <div style={{ width: 44 }} />
      </Header>

      <Card>
        <Title>{asKit ? 'Nurse Medical Kit' : 'Apply as a Nurse'}</Title>
        <Subtitle>
          {asKit ? 'Upload your verification documents and save your clinician profile.' : 'Complete the basics to unlock the clinician workflow.'}
        </Subtitle>

        <Form onSubmit={onSubmit}>
          <div>
            <FieldLabel htmlFor="licenseId">NMCN License / RN Number</FieldLabel>
            <TextField
              id="licenseId"
              name="licenseId"
              placeholder="e.g. NMCN/RN/12345"
              value={form.licenseId}
              onChange={(e) => setForm((p) => ({ ...p, licenseId: e.target.value }))}
            />
          </div>
          <div>
            <FieldLabel htmlFor="department">Department</FieldLabel>
            <SelectField
              id="department"
              name="department"
              value={form.department}
              onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
            >
              {professionalSpecialties.map((specialty) => (
                <option key={specialty}>{specialty}</option>
              ))}
            </SelectField>
          </div>
          <Button disabled={saving} type="submit">
            {saving ? 'Submitting...' : 'Submit application'}
          </Button>
        </Form>

        <div style={{ marginTop: 14, display: 'grid', gap: 12 }}>
          <UploadCard
            title="Government ID upload"
            subtitle="Upload NIN, driver's licence, or voter's card."
            status={govId?.status || 'missing'}
            onPickFile={async (file) => {
              if (!file) return
              try {
                await upsertUserDocument({
                  userId,
                  kind: DocumentKinds.GOV_ID,
                  file,
                  meta: { idType },
                })
                setModal({ open: true, message: 'Government ID uploaded. Status: pending verification.' })
                setRefresh(r => r + 1)
              } catch (err) {
                setModal({ open: true, message: err.message || 'Failed to upload document.' })
              }
            }}
          >
            <div style={{ display: 'grid', gap: 8 }}>
              <FieldLabel htmlFor="idType">ID Type</FieldLabel>
              <UploadSelect id="idType" value={idType} onChange={(e) => setIdType(e.target.value)}>
                <option>NIN</option>
                <option>Driver's licence</option>
                <option>Voter's card</option>
              </UploadSelect>
            </div>
          </UploadCard>

          <UploadCard
            title="Annual licence upload"
            subtitle="Required for all nurses."
            status={annual?.status || 'missing'}
            onPickFile={async (file) => {
              if (!file) return
              try {
                await upsertUserDocument({ userId, kind: DocumentKinds.ANNUAL_LICENSE, file })
                setModal({ open: true, message: 'Annual licence uploaded. Status: pending verification.' })
                setRefresh(r => r + 1)
              } catch (err) {
                setModal({ open: true, message: err.message || 'Failed to upload document.' })
              }
            }}
          />

          <UploadCard
            title="Nursing degree upload"
            subtitle="Accepted qualifications: MBBS, RN, RM, BSc."
            status={degree?.status || 'missing'}
            onPickFile={async (file) => {
              if (!file) return
              try {
                await upsertUserDocument({
                  userId,
                  kind: DocumentKinds.DEGREE,
                  file,
                  meta: { qualification: degreeType },
                })
                setModal({ open: true, message: 'Degree uploaded. Status: pending verification.' })
                setRefresh(r => r + 1)
              } catch (err) {
                setModal({ open: true, message: err.message || 'Failed to upload document.' })
              }
            }}
          >
            <div style={{ display: 'grid', gap: 8 }}>
              <FieldLabel htmlFor="degreeType">Qualification</FieldLabel>
              <UploadSelect id="degreeType" value={degreeType} onChange={(e) => setDegreeType(e.target.value)}>
                <option>MBBS</option>
                <option>RN</option>
                <option>RM</option>
                <option>BSc</option>
              </UploadSelect>
            </div>
          </UploadCard>
        </div>
      </Card>
    </Screen>
  )
}
