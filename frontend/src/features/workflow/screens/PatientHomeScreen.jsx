import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { useAppState } from '../../../app/context/useAppState'
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue'
import { Button, Screen, Subtitle, Title } from './ScreenPrimitives'
import { supabase } from '../../../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import { InPageMenuButton } from '../components/InPageMenuButton'
import { fetchLiveBalance } from '../services/walletService'
import { resolveEchoId } from '../utils/echoId'

const PageHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
`

const HeaderCenter = styled.div`
  min-width: 0;
  flex: 1 1 auto;
`

const HeaderName = styled.p`
  margin: 0;
  font-weight: 800;
  letter-spacing: -0.02em;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`

const HeaderSub = styled.p`
  margin: 2px 0 0;
  color: ${({ theme }) => theme?.colors?.muted || '#6b7280'};
  font-size: 0.9rem;
`

const Notify = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme?.colors?.border || '#e5e7eb'};
  background: ${({ theme }) => (theme.mode === 'dark' ? '#183022' : '#eaf8ef')};
  color: #16a34a;
  cursor: pointer;
  position: relative;
  flex: 0 0 auto;
  transition: transform 160ms ease, box-shadow 160ms ease;

  @media (hover: hover) {
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 12px 20px rgba(15, 31, 68, 0.12);
    }
  }

  &:active {
    transform: translateY(0);
  }
`

const Dot = styled.span`
  position: absolute;
  top: 6px;
  right: 7px;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: ${({ theme }) => theme?.colors?.primary || '#dc2626'};
  border: 2px solid ${({ theme }) => theme?.colors?.surface || '#ffffff'};
`

const Search = styled.input`
  width: 100%;
  margin-bottom: 14px;
  padding: 11px 13px;
  border-radius: ${({ theme }) => theme?.radii?.sm || '10px'};
  border: 1px solid ${({ theme }) => theme?.colors?.border || '#e5e7eb'};
  background: ${({ theme }) => theme?.colors?.surface || '#ffffff'};
`

const HeroCard = styled.section`
  margin-bottom: 16px;
  padding: 18px;
  border-radius: 22px;
  border: 1px solid ${({ theme }) => theme?.colors?.border || '#e5e7eb'};
  background:
    radial-gradient(circle at 10% 0%, rgba(220, 38, 38, 0.08), transparent 34%),
    linear-gradient(
      160deg,
      ${({ theme }) => theme?.colors?.surface || '#ffffff'} 0%,
      ${({ theme }) => (theme.mode === 'dark' ? '#162033' : '#f7fafc')} 100%
    );
  box-shadow: 0 18px 40px rgba(15, 31, 68, 0.10);
`

const HeroTop = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
`

const HeroMeta = styled.p`
  margin: 6px 0 0;
  color: ${({ theme }) => theme?.colors?.muted || '#6b7280'};
`

const StatusPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  background: ${({ theme }) => (theme.mode === 'dark' ? '#183022' : '#eaf8ef')};
  color: #15803d;
  font-weight: 700;
  font-size: 0.86rem;
  white-space: nowrap;
`

const HeroGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`

const MiniStat = styled.div`
  min-width: 0;
  border-radius: 16px;
  padding: 14px;
  background: ${({ theme }) => theme?.colors?.surface || '#ffffff'};
  border: 1px solid ${({ theme }) => theme?.colors?.border || '#e5e7eb'};
  box-shadow: 0 10px 20px rgba(15, 31, 68, 0.05);
`

const StatLabel = styled.p`
  margin: 0 0 4px;
  color: ${({ theme }) => theme?.colors?.muted || '#6b7280'};
  font-size: 0.84rem;
`

const StatValue = styled.div`
  font-size: 1.05rem;
  font-weight: 900;
  color: ${({ theme }) => (theme.mode === 'dark' ? '#fff' : theme.colors.text)};
`

const StatValueContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const EyeToggle = styled.button`
  border: 0;
  background: transparent;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.85rem;
  font-weight: 800;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
)

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
)

const SectionTitle = styled.h3`
  margin: 0 0 10px;
  font-size: 1.2rem;
  line-height: 1.15;
`

const HelpGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 18px;
`

const CategoryCard = styled.button`
  border: 1px solid ${({ theme }) => theme?.colors?.border || '#e5e7eb'};
  border-radius: 18px;
  background: ${({ theme }) => theme?.colors?.surface || '#ffffff'};
  padding: 14px 10px;
  cursor: pointer;
  display: grid;
  justify-items: center;
  gap: 8px;
  transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease, background 160ms ease;
  box-shadow: 0 12px 24px rgba(15, 31, 68, 0.06);

  @media (hover: hover) {
    &:hover {
      transform: translateY(-2px);
      border-color: ${({ theme }) => theme?.colors?.primary || '#dc2626'};
      background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#fffaf8')};
      box-shadow: 0 16px 28px rgba(15, 31, 68, 0.10);
    }
  }

  &:active {
    transform: translateY(0);
  }
`

const CategoryIcon = styled.span`
  width: clamp(32px, 8vw, 40px);
  height: clamp(32px, 8vw, 40px);
  border-radius: 999px;
  background: ${({ $bg }) => $bg};
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
`

const CategoryLabel = styled.span`
  font-size: clamp(0.65rem, 2.5vw, 0.8rem);
  font-weight: 600;
  text-align: center;
  word-break: break-word;
  line-height: 1.1;
`

const InfoCard = styled.article`
  margin-bottom: 14px;
  border: 1px solid ${({ theme }) => theme?.colors?.border || '#e5e7eb'};
  border-radius: 20px;
  background: ${({ theme }) => theme?.colors?.surface || '#ffffff'};
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  box-shadow: 0 14px 30px rgba(15, 31, 68, 0.07);
  transition: transform 160ms ease, box-shadow 160ms ease;

  @media (hover: hover) {
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(15, 31, 68, 0.08);
    }
  }

  &:active {
    transform: translateY(0);
  }
`

const InfoLeft = styled.div`
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`

const IconBadge = styled.span`
  width: 38px;
  height: 38px;
  border-radius: 999px;
  background: ${({ $tone, theme }) => {
    if ($tone === 'alert') return theme.mode === 'dark' ? '#3a2e16' : '#fff8e6'
    if ($tone === 'doctor') return theme.mode === 'dark' ? '#221a2c' : '#f3e8ff'
    return theme.mode === 'dark' ? '#2a1f27' : '#fff1f2'
  }};
  color: ${({ $tone, theme }) => {
    if ($tone === 'alert') return '#ca8a04'
    if ($tone === 'doctor') return '#7c3aed'
    return theme.colors.primary
  }};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  font-size: 1rem;
`

const InfoTitle = styled.p`
  margin: 0;
  font-weight: 700;
`

const InfoSub = styled.p`
  margin: 2px 0 0;
  color: ${({ theme }) => theme.colors.muted};
  line-height: 1.45;
`

const DoctorAction = styled(Button)`
  width: auto;
  min-width: 112px;
  padding: 10px 14px;
  white-space: nowrap;
`

const ReadinessCard = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 20px;
  background: ${({ theme }) => theme.colors.surface};
  padding: 16px;
  box-shadow: 0 14px 30px rgba(15, 31, 68, 0.07);
`

const ReadinessList = styled.div`
  display: grid;
  gap: 10px;
`

const ReadinessRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    padding-bottom: 0;
    border-bottom: 0;
  }
`

const ReadinessLabel = styled.span`
  color: ${({ theme }) => theme.colors.muted};
`

const ReadinessValue = styled.span`
  font-weight: 700;
  text-align: right;
`

const ReadinessAction = styled(Button)`
  margin-top: 12px;
  border-radius: 14px;
`

const emergencyTypes = [
  { label: 'Chest Pain', icon: '❤', color: '#ef4444' },
  { label: 'Injury', icon: '🩹', color: '#eab308' },
  { label: 'Child', icon: '◉', color: '#22c55e' },
  { label: 'Elderly', icon: '♿', color: '#a855f7' },
  { label: 'Seizure', icon: '⚕', color: '#dc2626' },
  { label: 'Fever', icon: '☼', color: '#2563eb' },
]

export default function PatientHomeScreen() {
  const navigate = useNavigate()
  const { searchQuery, setSearchQuery, setActivePage } = useAppState()
  const { currentUser } = useAuth()
  const [showBalance, setShowBalance] = useState(false)
  const [liveBalance, setLiveBalance] = useState(null)
  const [pendingSession, setPendingSession] = useState(false)
  const [activeSession, setActiveSession] = useState(null)
  const debouncedQuery = useDebouncedValue(searchQuery, 250)

  useEffect(() => {
    if (!currentUser?.submission_key) return
    const checkPending = async () => {
      const { data } = await supabase
        .from('call_queue')
        .select('*')
        .eq('submission_key', currentUser.submission_key)
        .neq('status', 'resolved')
        .neq('status', 'complete')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      
      if (data) {
        if (data.status === 'pending_payment') {
          setPendingSession(true)
          setActiveSession(null)
        } else {
          setPendingSession(false)
          setActiveSession(data)
        }
      } else {
        setPendingSession(false)
        setActiveSession(null)
      }
    }
    checkPending()

    const channel = supabase.channel(`phome_${currentUser.submission_key}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'call_queue', filter: `submission_key=eq.${currentUser.submission_key}` }, () => {
        checkPending()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUser])

  useEffect(() => {
    if (!currentUser?.id) return
    fetchLiveBalance(currentUser.id).then((bal) => {
      if (bal !== null && bal !== undefined) setLiveBalance(bal)
    }).catch(() => {})
  }, [currentUser?.id])

  const walletBalanceText = useMemo(() => {
    if (!showBalance) return '₦ ******'
    const bal = liveBalance !== null ? Number(liveBalance) : Number(currentUser?.wallet_balance ?? 0)
    return `₦${bal.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }, [showBalance, liveBalance, currentUser?.wallet_balance])

  // Auto-navigate if a waiting session gets accepted while on this screen
  const [prevStatus, setPrevStatus] = useState(null)
  useEffect(() => {
    if (activeSession) {
      if (prevStatus === 'waiting' && (activeSession.status === 'accepted' || activeSession.status === 'in_consultation')) {
        navigate('/app/patient-live', {
          state: { 
            sessionKey: activeSession.id, 
            paidMins: activeSession.consultation_duration || 5, 
            callType: activeSession.consultation_type || 'video' 
          }
        })
      }
      setPrevStatus(activeSession.status)
    }
  }, [activeSession, prevStatus, navigate])

  const filtered = useMemo(
    () => emergencyTypes.filter((item) => item.label.toLowerCase().includes(debouncedQuery.toLowerCase().trim())),
    [debouncedQuery],
  )

  const currentHour = new Date().getHours()
  const timeOfDay = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening'

  const role = currentUser?.role || 'patient'
  const roleTitle = role.charAt(0).toUpperCase() + role.slice(1)
  const firstName = (currentUser?.fullName || currentUser?.full_name || currentUser?.name || 'User').split(' ')[0]
  const greetingName = `${roleTitle} ${firstName}`
  const hasEmergencyContact = Boolean((currentUser?.emergencyName || '').trim())
  const hasMedicalKit = Boolean(
    (currentUser?.bloodType || '').trim() ||
      (currentUser?.genotype || '').trim() ||
      (currentUser?.conditions || '').trim() ||
      (currentUser?.allergies || '').trim() ||
      (currentUser?.medications || '').trim(),
  )
  const readinessLabel = hasEmergencyContact && hasMedicalKit ? 'Complete' : 'Basic setup'

  return (
    <Screen>
      <PageHeader>
        <InPageMenuButton />
        <HeaderCenter>
          <HeaderName>{timeOfDay}, {greetingName}</HeaderName>
          <HeaderSub>How can I help you today?</HeaderSub>
        </HeaderCenter>
        <Notify aria-label="Notifications" type="button">
          <Dot />
        </Notify>
      </PageHeader>

      {pendingSession && (
        <InfoCard 
          style={{ background: 'rgba(220, 38, 38, 0.05)', borderColor: 'rgba(220, 38, 38, 0.2)', marginBottom: '16px' }}
          as="button" 
          onClick={() => navigate('/app/payment', { state: { returnTo: 'consultation-waiting', fromTriage: true } })}
        >
          <InfoLeft>
            <IconBadge $tone="alert">!</IconBadge>
            <div>
              <InfoTitle style={{ color: '#dc2626' }}>Pending Consultation</InfoTitle>
              <InfoSub>Your clinical brief is ready. Tap to resume payment and connect to a clinician.</InfoSub>
            </div>
          </InfoLeft>
          <DoctorAction type="button" style={{ background: '#dc2626', color: '#fff', padding: '6px 12px' }}>Resume</DoctorAction>
        </InfoCard>
      )}

      {activeSession && (
        <InfoCard 
          style={{ background: 'rgba(34, 197, 94, 0.05)', borderColor: 'rgba(34, 197, 94, 0.2)', marginBottom: '16px' }}
          as="button" 
          onClick={() => {
            if (activeSession.status === 'waiting') {
               navigate(`/app/consultation-waiting?queueId=${activeSession.id}`)
            } else {
               navigate('/app/patient-live', { state: { sessionKey: activeSession.id, paidMins: activeSession.consultation_duration || 5, callType: activeSession.consultation_type || 'video' } })
            }
          }}
        >
          <InfoLeft>
            <IconBadge $tone="success" style={{ background: '#dcfce7', color: '#16a34a' }}>
              {activeSession.status === 'waiting' ? '⏳' : '🎥'}
            </IconBadge>
            <div style={{ textAlign: 'left' }}>
              <InfoTitle style={{ color: '#16a34a' }}>
                {activeSession.status === 'waiting' ? 'Finding a Clinician...' : 'Active Consultation'}
              </InfoTitle>
              <InfoSub>
                {activeSession.status === 'waiting' ? 'Tap to return to waiting room.' : 'Tap to return to your live session.'}
              </InfoSub>
            </div>
          </InfoLeft>
          <DoctorAction type="button" style={{ background: '#16a34a', color: '#fff', padding: '6px 12px' }}>Join</DoctorAction>
        </InfoCard>
      )}

      <Title>Patient Home</Title>
      <Subtitle>Quick access to emergency help, support, and your readiness details.</Subtitle>

      <HeroCard>
        <HeroTop>
          <div>
            <SectionTitle>{timeOfDay}, {greetingName}</SectionTitle>
            <HeroMeta>Your emergency profile is ready. You can start help in one tap if something feels wrong.</HeroMeta>
          </div>
          <StatusPill>Active</StatusPill>
        </HeroTop>
        <HeroGrid>
          <MiniStat>
            <StatLabel>EmergencyEcho ID</StatLabel>
            <StatValue>{resolveEchoId(currentUser)}</StatValue>
          </MiniStat>
          <MiniStat>
            <StatLabel>Wallet Balance</StatLabel>
            <StatValueContainer>
              <StatValue>
                {walletBalanceText}
              </StatValue>
              <EyeToggle onClick={() => setShowBalance((prev) => !prev)}>
                {showBalance ? <EyeOffIcon /> : <EyeIcon />}
              </EyeToggle>
            </StatValueContainer>
          </MiniStat>
          <MiniStat>
            <StatLabel>Primary language</StatLabel>
            <StatValue>{currentUser?.language || 'English'}</StatValue>
          </MiniStat>
        </HeroGrid>
      </HeroCard>

      <Search
        aria-label="Search emergency type"
        placeholder="Search emergency type..."
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
      />

      <SectionTitle>Quick Echoes</SectionTitle>
      <HelpGrid>
        {filtered.map((item) => (
          <CategoryCard
            key={item.label}
            type="button"
            onClick={() => navigate('/app/chat', { state: { seed: `I have ${item.label.toLowerCase()}` } })}
          >
            <CategoryIcon $bg={item.color}>{item.icon}</CategoryIcon>
            <CategoryLabel>{item.label}</CategoryLabel>
          </CategoryCard>
        ))}
      </HelpGrid>

      <SectionTitle>My Emergency Kit</SectionTitle>
      <InfoCard
        as="button"
        type="button"
        onClick={() => setActivePage('kit')}
      >
        <InfoLeft>
          <InfoIcon aria-hidden="true">
            <HeartIcon />
          </InfoIcon>
          <div>
            <InfoTitle>Digital Medical Kit</InfoTitle>
            <InfoSub>Readiness: {readinessLabel}</InfoSub>
          </div>
        </InfoLeft>
        <DoctorAction type="button" onClick={() => setActivePage('kit')} style={{ width: '100%', marginTop: '12px' }}>View Kit</DoctorAction>
      </InfoCard>

      <SectionTitle>Nearby Alerts</SectionTitle>
      <InfoCard>
        <InfoLeft>
          <IconBadge $tone="alert">◉</IconBadge>
          <div>
            <InfoTitle>5 accidents reported near Alimosho today</InfoTitle>
            <InfoSub>Stay alert on major roads and avoid high-traffic junctions if possible.</InfoSub>
          </div>
        </InfoLeft>
      </InfoCard>

      <SectionTitle>Doctor On Duty</SectionTitle>
      <InfoCard>
        <InfoLeft>
          <IconBadge $tone="doctor">⚕</IconBadge>
          <div>
            <InfoTitle>Dr. Adebayo Okafor</InfoTitle>
            <InfoSub>Available for emergency guidance now. Estimated response time: 5 minutes.</InfoSub>
          </div>
        </InfoLeft>
        <DoctorAction type="button" onClick={() => navigate('/app/chat', { state: { seed: 'I need to speak to a doctor urgently' } })}>
          Contact
        </DoctorAction>
      </InfoCard>

      <SectionTitle>Emergency Readiness</SectionTitle>
      <ReadinessCard>
        <ReadinessList>
          <ReadinessRow>
            <ReadinessLabel>Profile status</ReadinessLabel>
            <ReadinessValue>{readinessLabel}</ReadinessValue>
          </ReadinessRow>
          <ReadinessRow>
            <ReadinessLabel>Emergency kit</ReadinessLabel>
            <ReadinessValue>{hasMedicalKit ? 'Saved' : 'Not added yet'}</ReadinessValue>
          </ReadinessRow>
          <ReadinessRow>
            <ReadinessLabel>Emergency contact</ReadinessLabel>
            <ReadinessValue>{hasEmergencyContact ? currentUser?.emergencyName : 'Not added yet'}</ReadinessValue>
          </ReadinessRow>
          <ReadinessRow>
            <ReadinessLabel>Medical notes</ReadinessLabel>
            <ReadinessValue>{currentUser?.conditions || 'Not added yet'}</ReadinessValue>
          </ReadinessRow>
        </ReadinessList>
        {!hasMedicalKit || !hasEmergencyContact ? (
          <ReadinessAction type="button" onClick={() => setActivePage('kit')}>
            Complete emergency kit
          </ReadinessAction>
        ) : null}
      </ReadinessCard>
    </Screen>
  )
}
