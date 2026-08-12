import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useAuth } from '../../auth/context/useAuth'
import { Screen, Card, Button, FieldLabel, TextField, SelectField } from './ScreenPrimitives'
import { InPageMenuButton } from '../components/InPageMenuButton'
import { BrandedSheetModal } from '../components/BrandedSheetModal'
import { UploadCard, UploadSelect } from '../components/UploadCard'
import { DocumentKinds, getLatestDocumentByKind, upsertUserDocument, syncUserDocuments } from '../services/documentService'
import { defaultDoctorSpecialty, professionalSpecialties } from '../constants/specialties'

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

export default function ApplyDoctorScreen({ asKit = false } = {}) {
  const navigate = useNavigate()
  const { currentUser, updateProfile } = useAuth()
  const [saving, setSaving] = useState(false)
  const [modal, setModal] = useState({ open: false, message: '' })
  const [form, setForm] = useState({
    licenseId: currentUser?.licenseNumber || currentUser?.license_number || currentUser?.license_id || 'MDCN/R/',
    specialization: currentUser?.specialization || defaultDoctorSpecialty,
    state: 'Lagos',
  })
  const [idType, setIdType] = useState('NIN')
  const [degreeType, setDegreeType] = useState('BSc')
  const [refresh, setRefresh] = useState(0)

  const name = useMemo(() => currentUser?.fullName || 'Clinician', [currentUser?.fullName])
  const userId = currentUser?.id

  useEffect(() => {
    if (userId) {
      syncUserDocuments(userId).catch((err) => {
        console.error('Failed to sync documents on mount in ApplyDoctorScreen:', err)
      }).finally(() => setRefresh(r => r + 1))
    }
  }, [userId])

  const govId = useMemo(() => getLatestDocumentByKind(userId, DocumentKinds.GOV_ID), [userId, refresh])
  const annual = useMemo(() => getLatestDocumentByKind(userId, DocumentKinds.ANNUAL_LICENSE), [userId, refresh])
  const degree = useMemo(() => getLatestDocumentByKind(userId, DocumentKinds.DEGREE), [userId, refresh])
  const regCert = useMemo(() => getLatestDocumentByKind(userId, DocumentKinds.FULL_REG_CERT), [userId, refresh])

  const missingDocs = useMemo(() => {
    const missing = []
    if (!govId) missing.push('Government ID')
    if (!annual) missing.push('Annual licence')
    if (!degree) missing.push('Medical degree')
    if (!regCert) missing.push('Full registration certificate')
    return missing
  }, [annual, degree, govId, regCert])

  const onSubmit = async (event) => {
    event.preventDefault()
    let cleanLic = String(form.licenseId || '').trim().toUpperCase()
    if (cleanLic && !cleanLic.startsWith('MDCN/R/')) {
      cleanLic = 'MDCN/R/' + cleanLic.replace(/^MDCN[\/R\s-]*/i, '')
    }
    if (cleanLic.length < 8) {
      setModal({ open: true, message: 'Please enter your complete MDCN Folio Number (e.g. MDCN/R/12345).' })
      return
    }
    if (missingDocs.length) {
      setModal({ open: true, message: `Upload required documents: ${missingDocs.join(', ')}.` })
      return
    }
    setSaving(true)
    try {
      await updateProfile({
        role: 'doctor',
        specialization: form.specialization,
        licenseNumber: cleanLic,
        license_number: cleanLic,
        license_id: cleanLic,
        professionalKitComplete: true,
      })
      navigate('/app/doctor-home')
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
        title="Doctor application"
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
        <Title>{asKit ? 'Doctor Medical Kit' : 'Apply as a Doctor'}</Title>
        <Subtitle>
          {asKit
            ? `${name}, upload your verification documents and save your clinician profile.`
            : `${name}, complete the basics to unlock the Doctor Portal.`}
        </Subtitle>

        <Form onSubmit={onSubmit}>
          <div>
            <FieldLabel htmlFor="licenseId">MDCN Folio Number (License ID)</FieldLabel>
            <TextField
              id="licenseId"
              name="licenseId"
              placeholder="e.g. MDCN/R/12345"
              value={form.licenseId}
              onChange={(e) => setForm((p) => ({ ...p, licenseId: e.target.value }))}
              onBlur={(e) => {
                let val = e.target.value.trim().toUpperCase()
                if (val && !val.startsWith('MDCN/R/')) {
                  val = 'MDCN/R/' + val.replace(/^MDCN[\/R\s-]*/i, '')
                }
                setForm((p) => ({ ...p, licenseId: val }))
              }}
            />
          </div>
          <div>
            <FieldLabel htmlFor="specialization">Specialization</FieldLabel>
            <SelectField
              id="specialization"
              name="specialization"
              value={form.specialization}
              onChange={(e) => setForm((p) => ({ ...p, specialization: e.target.value }))}
            >
              {professionalSpecialties.map((specialty) => (
                <option key={specialty}>{specialty}</option>
              ))}
            </SelectField>
          </div>
          <div>
            <FieldLabel htmlFor="state">State</FieldLabel>
            <SelectField
              id="state"
              name="state"
              value={form.state}
              onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
            >
              <option>Lagos</option>
              <option>Abuja</option>
              <option>Kano</option>
              <option>Rivers</option>
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
            subtitle="Required for all doctors."
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
            title="Medical degree upload"
            subtitle="Accepted qualifications: RN, RM, BSc."
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
                <option>RN</option>
                <option>RM</option>
                <option>BSc</option>
              </UploadSelect>
            </div>
          </UploadCard>

          <UploadCard
            title="Full registration certificate upload"
            subtitle="Doctors only."
            status={regCert?.status || 'missing'}
            onPickFile={async (file) => {
              if (!file) return
              try {
                await upsertUserDocument({ userId, kind: DocumentKinds.FULL_REG_CERT, file })
                setModal({ open: true, message: 'Registration certificate uploaded. Status: pending verification.' })
                setRefresh(r => r + 1)
              } catch (err) {
                setModal({ open: true, message: err.message || 'Failed to upload document.' })
              }
            }}
          />
        </div>
      </Card>
    </Screen>
  )
}
