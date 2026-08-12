import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import { useAppState } from '../../../app/context/useAppState'
import { useAuth } from '../../auth/context/useAuth'
import { Screen } from './ScreenPrimitives'
import { InPageMenuButton } from '../components/InPageMenuButton'
import { showAssistant } from '../components/AssistantCharacterOverlay'
import { DocumentKinds, getVerificationSummary, syncUserDocuments } from '../services/documentService'
import { resolveEchoId } from '../utils/echoId'

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 2px 12px;
`

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
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

const Card = styled.section`
  border-radius: 22px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.shadow.elevated};
  overflow: hidden;
  animation: ${fadeUp} 220ms ease both;
`

const Hero = styled.div`
  height: 132px;
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(220,38,38,0.30), rgba(37,99,235,0.18))'
      : 'linear-gradient(135deg, rgba(220,38,38,0.20), rgba(37,99,235,0.12))'};
`

const AvatarWrap = styled.div`
  position: relative;
  display: inline-block;
`

const Avatar = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 20px;
  object-fit: cover;
  border: 3px solid ${({ theme }) => theme.colors.surface};
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
`

const UploadButton = styled.button`
  position: absolute;
  right: -6px;
  bottom: 8px;
  border: 0;
  border-radius: 999px;
  width: 30px;
  height: 30px;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
`

const Body = styled.div`
  padding: 14px 14px 16px;
`

const Name = styled.h2`
  margin: 0;
  font-weight: 1000;
  letter-spacing: -0.03em;
  font-size: clamp(1.05rem, 4vw, 1.25rem);
`

const NameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const InlineEditButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : theme.colors.surface)};
  color: ${({ theme }) => theme.colors.primary};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 10px 22px rgba(15, 31, 68, 0.1);
  flex: 0 0 auto;

  svg {
    width: 15px;
    height: 15px;
  }

  @media (hover: hover) {
    &:hover {
      transform: translateY(-1px);
      border-color: ${({ theme }) => theme.colors.primary};
      background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(220,38,38,0.14)' : 'rgba(220,38,38,0.06)')};
    }
  }
`

const Subtitle = styled.p`
  margin: 4px 0 0;
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 750;
  font-size: 0.95rem;
`

const SectionTitle = styled.div`
  margin-top: 12px;
  font-weight: 950;
  letter-spacing: -0.02em;
  font-size: clamp(0.95rem, 3.5vw, 1.15rem);
`

const Bio = styled.p`
  margin: 8px 0 0;
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 700;
  line-height: 1.55;
`

const MetaRow = styled.div`
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px 12px;
  align-items: center;
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 750;
  font-size: 0.92rem;
`

const OnlinePill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  padding: clamp(4px, 1vw, 6px) clamp(8px, 2vw, 10px);
  font-weight: 950;
  font-size: clamp(0.65rem, 2vw, 0.78rem);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme, $online }) =>
    $online ? (theme.mode === 'dark' ? 'rgba(34,197,94,0.16)' : 'rgba(34,197,94,0.10)') : theme.colors.surfaceAlt};
  color: ${({ theme, $online }) =>
    $online ? (theme.mode === 'dark' ? '#86efac' : '#166534') : theme.colors.text};
`

const OnlineDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: ${({ $online }) => ($online ? '#22c55e' : '#94a3b8')};
  box-shadow: ${({ $online }) => ($online ? '0 0 0 5px rgba(34,197,94,0.14)' : 'none')};
`

const TagRow = styled.div`
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 750;
  font-size: 0.9rem;
`

const Dot = styled.span`
  width: 4px;
  height: 4px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.muted};
  display: inline-block;
  opacity: 0.8;
`

const ActionRow = styled.div`
  margin-top: 12px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;

  @media (max-width: 420px) {
    grid-template-columns: 1fr;
  }
`

const Primary = styled.button`
  min-height: 46px;
  border-radius: 14px;
  border: 0;
  cursor: pointer;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  font-weight: 950;
`

const Secondary = styled.button`
  min-height: 46px;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  cursor: pointer;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-weight: 900;
`

const SettingsTitle = styled.div`
  margin-top: 14px;
  font-weight: 950;
  letter-spacing: -0.02em;
`

const SettingsCard = styled.section`
  margin-top: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.surface};
  padding: 8px 0;
`

const SettingsItem = styled.button`
  width: 100%;
  border: 0;
  background: transparent;
  color: inherit;
  padding: 14px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  text-align: left;
`

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`

const IconCircle = styled.span`
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: ${({ $bg }) => $bg || '#eee'};
  color: ${({ $color }) => $color || '#222'};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  font-weight: 900;
`

const TextWrap = styled.div`
  min-width: 0;
`

const ItemTitle = styled.p`
  margin: 0;
  font-weight: 800;
`

const ItemSubtitle = styled.p`
  margin: 2px 0 0;
  font-size: 0.84rem;
  color: ${({ theme }) => theme.colors.muted};
`

const Divider = styled.hr`
  border: 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  margin: 0 16px;
`

const StatusPill = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 6px 10px;
  font-weight: 950;
  font-size: 0.78rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme, $tone }) => {
    if ($tone === 'verified') return theme.mode === 'dark' ? 'rgba(34,197,94,0.18)' : 'rgba(34,197,94,0.10)'
    if ($tone === 'rejected') return theme.mode === 'dark' ? 'rgba(239,68,68,0.20)' : 'rgba(239,68,68,0.10)'
    return theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : theme.colors.surfaceAlt
  }};
  color: ${({ theme, $tone }) => {
    if ($tone === 'verified') return theme.mode === 'dark' ? '#86efac' : '#166534'
    if ($tone === 'rejected') return theme.mode === 'dark' ? '#fecaca' : '#7f1d1d'
    return theme.colors.text
  }};
`

const RightText = styled.span`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 1.1rem;
`

const Toggle = styled.button`
  width: 48px;
  height: 28px;
  border: 0;
  border-radius: 999px;
  background: ${({ $on, theme }) => ($on ? theme.colors.success : '#cbd5e1')};
  position: relative;
  cursor: pointer;
`

const ToggleKnob = styled.span`
  position: absolute;
  top: 3px;
  left: ${({ $on }) => ($on ? '23px' : '3px')};
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: #fff;
  transition: left 180ms ease;
`

const EditCard = styled.section`
  margin-top: 12px;
  border-radius: 18px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(2, 6, 23, 0.45)' : 'rgba(255,255,255,0.92)')};
  padding: 12px;
`

const EditTitle = styled.div`
  font-weight: 950;
  letter-spacing: -0.02em;
`

const FormGrid = styled.div`
  margin-top: 10px;
  display: grid;
  gap: 10px;
`

const Field = styled.label`
  display: grid;
  gap: 6px;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.muted};
`

const Input = styled.input`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  padding: 10px 12px;
`

const TextArea = styled.textarea`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  padding: 10px 12px;
  min-height: 80px;
  font-family: inherit;
  resize: vertical;
`

const FormActions = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
`

function formatLastSeen(iso) {
  const t = new Date(iso).getTime()
  if (!Number.isFinite(t)) return 'unknown'
  const diff = Math.max(0, Date.now() - t)
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs} hr ago`
  const days = Math.round(hrs / 24)
  return `${days} day ago`
}

function EditIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20h9" strokeLinecap="round" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function DoctorProfileScreen({ mode = 'view' }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { setActivePage, isDarkMode, setDarkMode, setSelectedRole, locationEnabled, setLocationEnabled } = useAppState()
  const { currentUser, logout, updateProfile, uploadAvatar } = useAuth()

  const role = String(currentUser?.role || '').toLowerCase()
  const doctor = useMemo(() => location.state?.doctor || null, [location.state])
  const selfMode = mode === 'self'

  const safeDoctor = doctor || {
    id: 'sample-doctor',
    name: 'Nurse. Oluwapelumi',
    specialty: 'Cardiologist',
    price: 'NGN 2,300/hr',
    languages: 'English & Yoruba',
    online: true,
    lastSeenAt: new Date(Date.now() - 3 * 60_000).toISOString(),
    tags: ['Great communication', 'Problem solving', 'Attention to detail'],
  }

  const selfDoctor = useMemo(() => {
    if (!selfMode) return null
    const name = currentUser?.title 
      ? `${currentUser.title} ${currentUser?.fullName || currentUser?.full_name || currentUser?.name || ''}`.trim()
      : currentUser?.fullName || currentUser?.full_name || currentUser?.name || (role === 'nurse' ? 'Nurse' : 'Doctor')
    const specialty = currentUser?.specialization || (role === 'nurse' ? 'Nurse' : 'General Practice')
    return {
      id: currentUser?.id || currentUser?.email || 'me',
      name,
      specialty,
      price: 'NGN 2,300/hr',
      languages: currentUser?.languages || 'English',
      online: true,
      lastSeenAt: new Date().toISOString(),
      tags: ['Great communication', 'Problem solving', 'Attention to detail'],
    }
  }, [currentUser, role, selfMode])

  const activeDoctor = selfDoctor || safeDoctor

  const bio = useMemo(() => {
    if (selfMode && currentUser?.bio) return currentUser.bio
    const fallbackName = activeDoctor?.name?.split(' ')?.[0] || 'I'
    return `Hi, I am ${fallbackName}. My top priority is helping you feel safe and heard. With 7 years of experience across emergency intake and family practice, I listen to your symptoms and work with you to create a care plan that supports your overall well-being.`
  }, [currentUser?.bio, selfMode, activeDoctor?.name])

  const fileInputRef = useRef(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    if (selfMode && currentUser?.id) {
      syncUserDocuments(currentUser.id).catch(err => {
        console.error('Failed to sync clinician documents on mount:', err)
      })
    }
  }, [selfMode, currentUser?.id])
  const [form, setForm] = useState(() => ({
    title: currentUser?.title || '',
    fullName: currentUser?.fullName || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    age: currentUser?.age || '',
    bio: currentUser?.bio || '',
    licenseNumber: currentUser?.licenseNumber || currentUser?.license_number || currentUser?.license_id || 'MDCN/R/',
    specialization: currentUser?.specialization || currentUser?.department || 'General Medicine',
    hospital: currentUser?.hospital || currentUser?.hospital_affiliation || 'Private / Healthcare Partner',
    yearsOfExperience: currentUser?.yearsOfExperience || currentUser?.years_of_experience || '2',
    state: currentUser?.state || 'Lagos',
  }))

  const settings = useMemo(
    () => [
      {
        id: 'basic',
        type: 'link',
        title: 'Basic Information',
        subtitle: 'Edit your profile details',
        icon: 'i',
        bg: '#FFF4CC',
        iconColor: '#E6A700',
      },
      {
        id: 'medical',
        type: 'link',
        title: 'Medical Information',
        subtitle: 'Open your emergency kit and records',
        icon: 'M',
        bg: '#E6F0FF',
        iconColor: '#2D6CDF',
      },
      {
        id: 'contact',
        type: 'link',
        title: 'Emergency Contact',
        subtitle: 'Manage emergency contact options',
        icon: 'E',
        bg: '#E6F0FF',
        iconColor: '#2D6CDF',
      },
      {
        id: 'password',
        type: 'link',
        title: 'Password',
        subtitle: 'Manage account password and access',
        icon: 'P',
        bg: '#FFE6E6',
        iconColor: '#D90429',
      },
      {
        id: 'notifications',
        type: 'link',
        title: 'Notifications',
        subtitle: 'View alerts and communication history',
        icon: 'N',
        bg: '#FFF0E6',
        iconColor: '#FF8C42',
      },
      {
        id: 'dark-mode',
        type: 'toggle',
        title: 'Dark mode',
        subtitle: 'Switch app appearance',
        icon: 'D',
        bg: '#E6FBFF',
        iconColor: '#00B3C6',
        value: isDarkMode,
      },
      {
        id: 'location',
        type: 'toggle',
        title: 'Location Services',
        subtitle: 'Enable location support',
        icon: 'L',
        bg: '#E6FBFF',
        iconColor: '#00B3C6',
        value: locationEnabled,
      },
      {
        id: 'logout',
        type: 'link',
        title: isLoggingOut ? 'Logging out...' : 'Log me out',
        subtitle: 'Return to the log in page',
        icon: 'O',
        bg: '#FFE6F0',
        iconColor: '#E11D48',
      },
    ],
    [isDarkMode, locationEnabled, isLoggingOut],
  )

  const verification = useMemo(() => {
    if (!selfMode) return null
    return getVerificationSummary(currentUser?.id)
  }, [currentUser?.id, selfMode])

  const docsForDisplay = useMemo(() => {
    if (!verification?.docs) return []
    const order = [
      DocumentKinds.GOV_ID,
      DocumentKinds.ANNUAL_LICENSE,
      DocumentKinds.DEGREE,
      DocumentKinds.FULL_REG_CERT,
    ]
    const label = (k) => {
      switch (k) {
        case DocumentKinds.GOV_ID:
          return 'Government ID'
        case DocumentKinds.ANNUAL_LICENSE:
          return 'Annual licence'
        case DocumentKinds.DEGREE:
          return 'Degree'
        case DocumentKinds.FULL_REG_CERT:
          return 'Full registration certificate'
        default:
          return String(k)
      }
    }

    const latestByKind = new Map()
    for (const d of verification.docs) {
      const k = String(d.kind)
      const prev = latestByKind.get(k)
      if (!prev || String(d.uploadedAt).localeCompare(String(prev.uploadedAt)) > 0) latestByKind.set(k, d)
    }

    return order
      .map((k) => {
        const d = latestByKind.get(k) || null
        return {
          kind: k,
          title: label(k),
          status: d?.status || 'missing',
          fileName: d?.fileName || '',
          uploadedAt: d?.uploadedAt || '',
        }
      })
      .filter((x) => (role === 'nurse' ? x.kind !== DocumentKinds.FULL_REG_CERT : true))
  }, [role, verification?.docs])

  const onPickImage = () => {
    fileInputRef.current?.click()
  }

  const onImageChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setIsSaving(true)
    try {
      if (uploadAvatar) {
        await uploadAvatar(file)
      } else {
        const reader = new FileReader()
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            updateProfile({ avatarUrl: reader.result }).catch(console.error)
          }
        }
        reader.readAsDataURL(file)
      }
    } catch (err) {
      console.error('Failed to upload avatar:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const onSaveProfile = async () => {
    setIsSaving(true)
    try {
      let cleanLic = String(form.licenseNumber || '').trim().toUpperCase()
      if (role === 'doctor' && cleanLic && !cleanLic.startsWith('MDCN/R/')) {
        cleanLic = 'MDCN/R/' + cleanLic.replace(/^MDCN[\/R\s-]*/i, '')
      }
      await updateProfile({
        ...form,
        licenseNumber: cleanLic,
        license_number: cleanLic,
        license_id: cleanLic,
      })
      setIsEditing(false)
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  const onAction = async (item) => {
    if (item.id === 'dark-mode') {
      setDarkMode(!isDarkMode)
      return
    }
    if (item.id === 'location') {
      setLocationEnabled((prev) => !prev)
      return
    }
    if (item.id === 'basic') {
      navigate('/app/profile-basic')
      return
    }
    if (item.id === 'medical') {
      navigate('/app/kit')
      return
    }
    if (item.id === 'contact') {
      navigate('/app/profile-emergency')
      return
    }
    if (item.id === 'password') {
      navigate('/app/profile-password')
      return
    }
    if (item.id === 'notifications') {
      navigate('/app/profile-notifications')
      return
    }
    if (item.id === 'logout') {
      if (isLoggingOut) return
      setIsLoggingOut(true)
      try {
        await logout()
        setSelectedRole(null)
        navigate('/login', { replace: true })
      } finally {
        setIsLoggingOut(false)
      }
    }
  }

  const startVoice = () => {
    try {
      showAssistant({
        title: activeDoctor.name,
        message: 'Starting a voice call. Describe the problem clearly and mention your location.',
        avatar: 'doctor',
        durationMs: 8500,
      })
    } catch {
      // ignore
    }
    navigate('/app/doctor-live', { state: { doctorId: activeDoctor.id } })
  }

  const startChat = () => {
    try {
      showAssistant({
        title: activeDoctor.name,
        message: 'Opening chat. You can paste symptoms or use voice input.',
        avatar: 'doctor',
        durationMs: 8500,
      })
    } catch {
      // ignore
    }
    navigate('/app/chat', { state: { seed: `I want to talk to ${activeDoctor.name}. My symptoms are...` } })
  }

  return (
    <Screen>
      <Header>
        <HeaderLeft>
          <InPageMenuButton />
          <BackBtn type="button" onClick={() => (selfMode ? navigate('/app/home') : navigate(-1))} aria-label="Back">
            {'<'}
          </BackBtn>
        </HeaderLeft>
        <div style={{ width: 44 }} />
      </Header>

      <Card aria-label="Doctor profile">
        <Hero />
        <Body>
          <AvatarWrap style={{ marginTop: '-64px', marginBottom: '12px', justifySelf: 'start' }}>
            <Avatar
              alt="Doctor avatar"
              src={
                (selfMode ? (currentUser?.avatar_url || currentUser?.avatarUrl) : activeDoctor.avatarUrl) ||
                'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop'
              }
            />
            {selfMode ? (
              <UploadButton onClick={onPickImage} type="button">
                E
              </UploadButton>
            ) : null}
            <input
              accept="image/*"
              onChange={onImageChange}
              ref={fileInputRef}
              style={{ display: 'none' }}
              type="file"
            />
          </AvatarWrap>
          <NameRow>
            <Name>{activeDoctor.name}</Name>
            {selfMode ? (
              <InlineEditButton
                aria-label="Edit profile details"
                onClick={() => setIsEditing((prev) => !prev)}
                type="button"
              >
                <EditIcon />
              </InlineEditButton>
            ) : null}
          </NameRow>
          <Subtitle>{activeDoctor.specialty}</Subtitle>
          <Subtitle>
            Emergency Echo ID: {resolveEchoId(currentUser)}
          </Subtitle>

          <SectionTitle>Bio</SectionTitle>
          <Bio>{bio}</Bio>

          <MetaRow>
            <span>{activeDoctor.languages}</span>
          </MetaRow>

          <MetaRow>
            <OnlinePill $online={Boolean(activeDoctor.online)}>
              <OnlineDot aria-hidden="true" $online={Boolean(activeDoctor.online)} />
              {activeDoctor.online ? 'Online' : 'Offline'}
            </OnlinePill>
            <span>
              {activeDoctor.online ? `Updated ${formatLastSeen(activeDoctor.lastSeenAt)}` : `Last seen ${formatLastSeen(activeDoctor.lastSeenAt)}`}
            </span>
          </MetaRow>

          <TagRow>
            {activeDoctor.tags.map((t, idx) => (
              <span key={`tag-${idx}`}>
                {idx ? <Dot aria-hidden="true" /> : null} {t}
              </span>
            ))}
          </TagRow>

          {!selfMode ? (
            <ActionRow>
              <Primary type="button" onClick={startVoice}>
                Home Service
              </Primary>
              <Secondary type="button" onClick={startVoice}>
                Voice call
              </Secondary>
              <Secondary type="button" onClick={startChat}>
                Chat
              </Secondary>
            </ActionRow>
          ) : null}

          {selfMode ? (
            <>
              {isEditing ? (
                <EditCard>
                  <EditTitle>Edit Profile</EditTitle>
                  <FormGrid>
                    <Field>
                      Title
                      <Input onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} value={form.title} />
                    </Field>
                    <Field>
                      Full name
                      <Input
                        onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                        value={form.fullName}
                      />
                    </Field>
                    <Field>
                      Email
                      <Input
                        onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                        type="email"
                        value={form.email}
                      />
                    </Field>
                    <Field>
                      Phone
                      <Input onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} value={form.phone} />
                    </Field>
                    <Field>
                      Age
                      <Input onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))} value={form.age} />
                    </Field>
                    <Field>
                      Bio
                      <TextArea
                        onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                        value={form.bio}
                      />
                    </Field>
                    <Field>
                      MDCN Folio / License Number
                      <Input
                        onChange={(e) => setForm((p) => ({ ...p, licenseNumber: e.target.value }))}
                        onBlur={(e) => {
                          let val = e.target.value.trim().toUpperCase()
                          if (role === 'doctor' && val && !val.startsWith('MDCN/R/')) {
                            val = 'MDCN/R/' + val.replace(/^MDCN[\/R\s-]*/i, '')
                          }
                          setForm((p) => ({ ...p, licenseNumber: val }))
                        }}
                        value={form.licenseNumber}
                        placeholder="e.g. MDCN/R/12345"
                      />
                    </Field>
                    <Field>
                      Specialty / Department
                      <Input
                        onChange={(e) => setForm((p) => ({ ...p, specialization: e.target.value }))}
                        value={form.specialization}
                        placeholder="e.g. General Medicine"
                      />
                    </Field>
                    <Field>
                      Hospital / Facility
                      <Input
                        onChange={(e) => setForm((p) => ({ ...p, hospital: e.target.value }))}
                        value={form.hospital}
                        placeholder="e.g. Private / Healthcare Partner"
                      />
                    </Field>
                    <Field>
                      Experience (Years)
                      <Input
                        onChange={(e) => setForm((p) => ({ ...p, yearsOfExperience: e.target.value }))}
                        value={form.yearsOfExperience}
                        placeholder="e.g. 5"
                      />
                    </Field>
                    <Field>
                      State of Practice
                      <Input
                        onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
                        value={form.state}
                        placeholder="e.g. Lagos"
                      />
                    </Field>
                    <Field>
                      Profile photo
                      <Input
                        accept="image/*"
                        onChange={onImageChange}
                        type="file"
                      />
                    </Field>
                    <FormActions>
                      <Secondary type="button" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Secondary>
                      <Primary disabled={isSaving} type="button" onClick={onSaveProfile}>
                        {isSaving ? 'Saving...' : 'Save'}
                      </Primary>
                    </FormActions>
                  </FormGrid>
                </EditCard>
              ) : null}

              <SettingsTitle>Verification</SettingsTitle>
              <SettingsCard aria-label="Verification status">
                {docsForDisplay.map((d, idx) => (
                  <div key={d.kind}>
                    <SettingsItem type="button" onClick={() => navigate('/app/admin-verification')}>
                      <Left>
                        <IconCircle $bg="#F1F5F9" $color="#0f172a">
                          V
                        </IconCircle>
                        <TextWrap>
                          <ItemTitle>{d.title}</ItemTitle>
                          <ItemSubtitle>
                            {d.status === 'missing' ? 'Not uploaded yet' : d.fileName ? d.fileName : 'Uploaded'}
                          </ItemSubtitle>
                        </TextWrap>
                      </Left>
                      <StatusPill $tone={d.status === 'verified' ? 'verified' : d.status === 'rejected' ? 'rejected' : 'pending'}>
                        {d.status}
                      </StatusPill>
                    </SettingsItem>
                    {idx < docsForDisplay.length - 1 ? <Divider /> : null}
                  </div>
                ))}
                <Divider />
                <SettingsItem
                  type="button"
                  onClick={() => {
                    navigate(role === 'nurse' ? '/app/apply-nurse' : '/app/apply-doctor')
                  }}
                >
                  <Left>
                    <IconCircle $bg="#E6F0FF" $color="#2D6CDF">
                      ↑
                    </IconCircle>
                    <TextWrap>
                      <ItemTitle>Upload or update documents</ItemTitle>
                      <ItemSubtitle>Submit required documents for review</ItemSubtitle>
                    </TextWrap>
                  </Left>
                  <RightText>{'>'}</RightText>
                </SettingsItem>
              </SettingsCard>

              <SettingsTitle>Profile settings</SettingsTitle>
              <SettingsCard aria-label="Profile settings">
                {settings.map((item, idx) => {
                  const isToggle = item.type === 'toggle'
                  return (
                    <div key={item.id}>
                      <SettingsItem
                        onClick={() => {
                          if (!isToggle) onAction(item)
                        }}
                        type="button"
                      >
                        <Left>
                          <IconCircle $bg={item.bg} $color={item.iconColor}>
                            {item.icon}
                          </IconCircle>
                          <TextWrap>
                            <ItemTitle>{item.title}</ItemTitle>
                            <ItemSubtitle>{item.subtitle}</ItemSubtitle>
                          </TextWrap>
                        </Left>
                        {isToggle ? (
                          <Toggle
                            aria-label={item.title}
                            $on={item.value}
                            onClick={(event) => {
                              event.stopPropagation()
                              onAction(item)
                            }}
                            type="button"
                          >
                            <ToggleKnob $on={item.value} />
                          </Toggle>
                        ) : (
                          <RightText>{'>'}</RightText>
                        )}
                      </SettingsItem>
                      {idx < settings.length - 1 ? <Divider /> : null}
                    </div>
                  )
                })}
              </SettingsCard>
            </>
          ) : null}
        </Body>
      </Card>
    </Screen>
  )
}
