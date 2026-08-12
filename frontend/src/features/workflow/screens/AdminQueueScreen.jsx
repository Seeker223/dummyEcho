import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import { supabase } from '../../../lib/supabaseClient'
import { useAppState } from '../../../app/context/useAppState'
import { useAuth } from '../../auth/context/useAuth'
import { Screen } from './ScreenPrimitives'
import { InPageMenuButton } from '../components/InPageMenuButton'
import { AiStarButton } from '../components/AiStarButton'
import { showAssistant } from '../components/AssistantCharacterOverlay'
import { fetchLiveBalance } from '../services/walletService'

const shimmer = keyframes`
  0% { transform: translateX(-120%); opacity: 0.0; }
  20% { opacity: 0.55; }
  60% { opacity: 0.55; }
  100% { transform: translateX(120%); opacity: 0.0; }
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
`

const HeaderTitleBlock = styled.div`
  display: grid;
  gap: 2px;
`

const PortalTitle = styled.div`
  font-weight: 900;
  letter-spacing: -0.03em;
  font-size: clamp(0.95rem, 3.5vw, 1.25rem);
`

const PortalSub = styled.div`
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 750;
  font-size: 0.92rem;
`

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

const EditPill = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: clamp(4px, 1vw, 6px) clamp(8px, 2vw, 12px);
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : theme.colors.surface)};
  color: ${({ theme }) => theme.colors.text};
  font-weight: 800;
  font-size: clamp(0.7rem, 2.5vw, 0.9rem);
  cursor: pointer;

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 6px ${({ theme }) => theme.colors.glowRed};
  }

  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.colors.ring};
    outline-offset: 2px;
  }
`

const StatusPill = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: clamp(4px, 1vw, 6px) clamp(8px, 2vw, 12px);
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ $available, theme }) =>
    $available
      ? theme.mode === 'dark'
        ? 'rgba(34,197,94,0.10)'
        : 'rgba(22,163,74,0.08)'
      : theme.mode === 'dark'
        ? 'rgba(148,163,184,0.10)'
        : 'rgba(100,116,139,0.08)'};
  color: ${({ $available, theme }) => ($available ? theme.colors.success : theme.colors.muted)};
  font-weight: 800;
  font-size: clamp(0.7rem, 2.5vw, 0.9rem);
  cursor: pointer;

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: ${({ $available, theme }) => ($available ? theme.colors.success : theme.colors.muted)};
    box-shadow: 0 0 0 6px
      ${({ $available, theme }) =>
        $available
          ? theme.mode === 'dark'
            ? 'rgba(34,197,94,0.12)'
            : 'rgba(22,163,74,0.10)'
          : theme.mode === 'dark'
            ? 'rgba(148,163,184,0.12)'
            : 'rgba(100,116,139,0.10)'};
  }

  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.colors.ring};
    outline-offset: 2px;
  }
`

const Grid = styled.section`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 8px;
`

const StatCard = styled.div`
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  padding: 14px 14px;
  box-shadow: ${({ theme }) => theme.shadow.soft};
  text-align: center;
`

const StatValue = styled.div`
  font-size: 1.6rem;
  font-weight: 950;
  letter-spacing: -0.03em;
  color: ${({ theme }) => (theme.mode === 'dark' ? '#33d6b7' : theme.colors.text)};
`

const StatLabel = styled.div`
  margin-top: 4px;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 700;
`

const WalletCard = styled.section`
  margin-top: 12px;
  border-radius: 18px;
  padding: 16px 16px;
  border: 1px solid ${({ theme }) => (theme.mode === 'dark' ? 'rgba(51,214,183,0.35)' : theme.colors.border)};
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(17,24,39,1), rgba(13,42,46,1))'
      : 'linear-gradient(135deg, rgba(250,251,252,1), rgba(243,244,247,1))'};
  box-shadow: ${({ theme }) => theme.shadow.elevated};
`

const WalletRow = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
`

const WalletLabel = styled.div`
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 800;
  font-size: 0.95rem;
`

const WalletAmount = styled.div`
  font-size: 1.9rem;
  font-weight: 950;
  letter-spacing: -0.03em;
  color: ${({ theme }) => (theme.mode === 'dark' ? '#33d6b7' : theme.colors.text)};
  display: flex;
  align-items: center;
  gap: 12px;
`

const EyeToggle = styled.button`
  border: 0;
  background: transparent;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.95rem;
  font-weight: 800;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
)

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
)

const WalletButton = styled.button`
  width: 100%;
  margin-top: 12px;
  min-height: 46px;
  border-radius: 14px;
  border: 0;
  cursor: pointer;
  font-weight: 900;
  background: ${({ theme }) => (theme.mode === 'dark' ? '#10b981' : theme.colors.primary)};
  color: ${({ theme }) => (theme.mode === 'dark' ? '#04131a' : '#fff')};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -20%;
    bottom: -20%;
    left: 0;
    width: 46%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.75), transparent);
    transform: translateX(-120%);
    animation: ${shimmer} 1600ms ease-in-out infinite;
    pointer-events: none;
  }

  @media (prefers-reduced-motion: reduce) {
    &::before {
      animation: none;
      display: none;
    }
  }
`

const UpgradeBanner = styled.div`
  margin-top: 14px;
  border-radius: 12px;
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(254, 240, 138, 0.5)'};
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(234, 179, 8, 0.3)' : 'rgba(234, 179, 8, 0.5)'};
  padding: 12px 14px;
  color: ${({ theme }) => theme.mode === 'dark' ? '#fef08a' : '#854d0e'};
  font-size: 0.85rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 8px;

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: underline;
    cursor: pointer;
    margin-left: auto;
  }
`

const IncomingCard = styled.section`
  margin-top: 14px;
  border-radius: 18px;
  border: 1px solid rgba(220, 38, 38, 0.45);
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(24,10,20,0.95), rgba(9,17,31,0.85))'
      : 'linear-gradient(135deg, rgba(255,245,245,1), rgba(255,255,255,1))'};
  padding: 14px 14px 16px;
  box-shadow: ${({ theme }) => theme.shadow.elevated};
`

const IncomingLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 950;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-size: 0.82rem;
  color: ${({ theme }) => theme.colors.primary};

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 7px ${({ theme }) => theme.colors.glowRed};
  }
`

const PatientRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
`

const PatientName = styled.div`
  font-weight: 950;
  letter-spacing: -0.02em;
`

const PatientComplaint = styled.div`
  margin-top: 2px;
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 700;
  font-size: 0.95rem;
`

const ClinicalSummaryBlock = styled.div`
  margin-top: 12px;
  border-radius: 14px;
  background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(0,0,0,0.20)' : 'rgba(255,255,255,0.7)')};
  border: 1px solid ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : theme.colors.border)};
  padding: 12px 14px;
`

const SummaryTitle = styled.div`
  font-size: 0.75rem;
  font-weight: 900;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.muted};
  letter-spacing: 0.05em;
  margin-bottom: 4px;
  margin-top: ${({ $mt }) => $mt ? '12px' : '0'};
`

const SummaryText = styled.div`
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.4;
  color: ${({ theme }) => theme.colors.text};
`

const KeyPointsList = styled.ul`
  margin: 0;
  padding: 0 0 0 16px;
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.text};

  li {
    margin-bottom: 4px;
  }
`

const Hint = styled.div`
  margin-top: 10px;
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 700;
  font-size: 0.9rem;
`

const ActionRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 12px;
`

const Accept = styled.button`
  min-height: 46px;
  border-radius: 14px;
  border: 0;
  cursor: pointer;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  font-weight: 950;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -20%;
    bottom: -20%;
    left: 0;
    width: 46%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.75), transparent);
    transform: translateX(-120%);
    animation: ${shimmer} 1600ms ease-in-out infinite;
    pointer-events: none;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  &:disabled::before {
    display: none;
  }

  @media (prefers-reduced-motion: reduce) {
    &::before {
      animation: none;
      display: none;
    }
  }
`

const Decline = styled.button`
  min-height: 46px;
  border-radius: 14px;
  border: 1.5px solid rgba(220, 38, 38, 0.5);
  cursor: pointer;
  background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(220,38,38,0.08)' : 'rgba(220,38,38,0.06)')};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 950;
`

const QueueCard = styled.section`
  margin-top: 14px;
  border-radius: 18px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  padding: 14px 14px 16px;
  box-shadow: ${({ theme }) => theme.shadow.elevated};
`

const QueueHeader = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
`

const QueueTitle = styled.div`
  font-weight: 950;
  letter-spacing: -0.02em;
  font-size: 1.05rem;
`

const QueueMeta = styled.div`
  margin-top: 2px;
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 750;
  font-size: 0.92rem;
`

const QueueList = styled.div`
  margin-top: 12px;
  display: grid;
  gap: 10px;
`

const QueueItem = styled.button`
  width: 100%;
  text-align: left;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(2, 6, 23, 0.45)' : 'rgba(255,255,255,0.9)')};
  padding: 12px 12px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  cursor: pointer;
  transition: transform 120ms ease, box-shadow 120ms ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadow.soft};
  }

  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.colors.ring};
    outline-offset: 2px;
  }
`

const QueueLeft = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-width: 0;
`

const PatientAvatar = styled.div`
  display: none;
`

const QueueName = styled.div`
  font-weight: 950;
  letter-spacing: -0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const QueueComplaint = styled.div`
  margin-top: 3px;
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 750;
  font-size: 0.92rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const SeverityBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 6px 10px;
  font-weight: 950;
  font-size: 0.78rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border: 1px solid ${({ $tone }) =>
    $tone === 'red' ? 'rgba(220,38,38,0.35)' : $tone === 'amber' ? 'rgba(245,158,11,0.35)' : 'rgba(34,197,94,0.28)'};
  background: ${({ $tone, theme }) =>
    theme.mode === 'dark'
      ? $tone === 'red'
        ? 'rgba(220,38,38,0.12)'
        : $tone === 'amber'
          ? 'rgba(245,158,11,0.12)'
          : 'rgba(34,197,94,0.10)'
      : $tone === 'red'
        ? 'rgba(220,38,38,0.08)'
        : $tone === 'amber'
          ? 'rgba(245,158,11,0.10)'
          : 'rgba(34,197,94,0.08)'};
  color: ${({ $tone }) => ($tone === 'red' ? '#dc2626' : $tone === 'amber' ? '#b45309' : '#16a34a')};
`

const PrimaryAction = styled.button`
  width: 100%;
  margin-top: 12px;
  min-height: 46px;
  border-radius: 14px;
  border: 0;
  cursor: pointer;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  font-weight: 950;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -20%;
    bottom: -20%;
    left: 0;
    width: 46%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.75), transparent);
    transform: translateX(-120%);
    animation: ${shimmer} 1600ms ease-in-out infinite;
    pointer-events: none;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  &:disabled::before {
    display: none;
  }

  @media (prefers-reduced-motion: reduce) {
    &::before {
      animation: none;
      display: none;
    }
  }
`

const FooterNote = styled.div`
  margin-top: 10px;
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 700;
  font-size: 0.9rem;
`

export default function AdminQueueScreen() {
  const { setActivePage } = useAppState()
  const { currentUser, users } = useAuth()
  const [available, setAvailable] = useState(true)
  const [started, setStarted] = useState(false)
  const [incomingHandled, setIncomingHandled] = useState(false)
  const navigate = useNavigate()
  const [showBalance, setShowBalance] = useState(false)
  const [liveBalance, setLiveBalance] = useState(null)

  useEffect(() => {
    if (currentUser?.id) {
      fetchLiveBalance(currentUser.id).then(bal => {
        if (bal !== null && bal !== undefined) {
          setLiveBalance(bal)
        }
      })
    }
  }, [currentUser?.id])
  
  const portalTitle = `Live Emergency Queue`
  const clinicianName = `Admin Oversight`
  const role = 'admin'

  const patient = useMemo(() => users.find((item) => item.role === 'patient') || null, [users])
  const fallbackPatientName = patient?.fullName || 'Chidinma Okafor'
  const fallbackPatientAge = patient?.age || 34

  const baseKit = useMemo(
    () => ({
      blood: patient?.bloodType || 'O+',
      genotype: patient?.genotype || 'AA',
      condition: patient?.medicalCondition || 'Hypertension',
      allergy: patient?.allergy || 'Penicillin',
    }),
    [patient],
  )

  const [liveQueue, setLiveQueue] = useState([])

  useEffect(() => {
    async function fetchQueue() {
      let query = supabase
        .from('call_queue')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30)

      const { data, error } = await query
      
      if (data) setLiveQueue(data)
    }

    fetchQueue()

    const setupAdminRealtime = async () => {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      if (token) await supabase.realtime.setAuth(token) // Needed for Realtime Authorization
      
      const channel = supabase
        .channel('call_queue_all', {
          config: { private: true },
        })
        .on('broadcast', { event: 'INSERT' }, () => fetchQueue())
        .on('broadcast', { event: 'UPDATE' }, () => fetchQueue())
        .on('broadcast', { event: 'DELETE' }, () => fetchQueue())
        .subscribe()
        
      return channel
    }

    let channel;
    setupAdminRealtime().then(c => channel = c)

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [])

  const queue = useMemo(() => {
    if (!liveQueue || liveQueue.length === 0) {
      return []
    }

    return liveQueue.map(brief => {
      const severity = String(brief.urgency || brief.triage_level || 'routine').toLowerCase()
      let tone = 'green'
      if (severity === 'critical' || severity === 'red') tone = 'red'
      if (severity === 'urgent' || severity === 'orange') tone = 'amber'
      if (severity === 'priority' || severity === 'yellow') tone = 'amber'

      let parsedRedFlags = []
      let parsedAllergies = []
      try { parsedRedFlags = typeof brief.red_flags === 'string' ? JSON.parse(brief.red_flags) : (brief.red_flags || []) } catch(e){}
      try { parsedAllergies = typeof brief.allergy_flags === 'string' ? JSON.parse(brief.allergy_flags) : (brief.allergy_flags || []) } catch(e){}

      return {
        id: brief.id,
        submission_key: brief.submission_key,
        fullName: brief.patient_name || 'Emergency Caller',
        age: 45, // Default since dob isn't in call_queue yet
        sex: 'U',
        complaint: brief.clinical_summary || 'No presentation recorded',
        candidate_diagnoses: [brief.urgency || 'Pending AI Summary'],
        positive_findings: [],
        red_flags: parsedRedFlags,
        severity: severity,
        tone: tone,
        callType: brief.consultation_type || 'video',
        kit: {
          blood: 'O+',
          genotype: 'AA',
          condition: 'None',
          allergy: parsedAllergies.join(', ') || 'None',
        }
      }
    })
  }, [liveQueue, baseKit])

  const onToggleAvailability = () => {
    setAvailable((prev) => {
      const next = !prev
      showAssistant({
        tone: next ? 'success' : 'info',
        avatar: role === 'nurse' ? 'nurse' : 'doctor',
        title: next ? 'Availability on' : 'Availability off',
        message: next ? 'You can accept new triage requests.' : 'New requests will be paused.',
        durationMs: 6500,
      })
      return next
    })
  }

  return (
    <Screen>
      <Header>
        <HeaderLeft>
          <InPageMenuButton />
          <HeaderTitleBlock>
            <PortalTitle>{portalTitle}</PortalTitle>
            <PortalSub>{clinicianName}</PortalSub>
          </HeaderTitleBlock>
        </HeaderLeft>
        <HeaderRight>
          <AiStarButton />
          <EditPill type="button" onClick={() => navigate('/app/profile')} aria-label="Edit profile">
            Edit profile
          </EditPill>
          <StatusPill $available={available} aria-pressed={available} onClick={onToggleAvailability} type="button">
            {available ? 'Available' : 'Unavailable'}
          </StatusPill>
        </HeaderRight>
      </Header>





      <QueueCard aria-label="Triage queue">
        <QueueHeader>
          <div>
            <QueueTitle>Triage queue</QueueTitle>
            <QueueMeta>{queue.length} waiting - Tap a case to open live triage</QueueMeta>
          </div>
        </QueueHeader>

        <QueueList>
          {queue.map((item) => {
            const initials = item.fullName
              .split(' ')
              .slice(0, 2)
              .map((word) => word[0])
              .join('')
              .toUpperCase()

            return (
              <QueueItem key={item.id} onClick={() => {
                showAssistant({
                  tone: 'info',
                  title: 'Admin view only',
                  message: 'You are monitoring the queue. Clinicians will accept these calls automatically.',
                  durationMs: 5000,
                })
              }} type="button">
                <QueueLeft>
                  <PatientAvatar aria-hidden="true">{initials || 'PT'}</PatientAvatar>
                  <div style={{ minWidth: 0 }}>
                    <QueueName>
                      {item.fullName}, {item.age}
                      {item.sex}
                    </QueueName>
                    <QueueComplaint>{item.complaint}</QueueComplaint>
                  </div>
                </QueueLeft>
                <SeverityBadge $tone={item.tone}>{item.severity}</SeverityBadge>
              </QueueItem>
            )
          })}
        </QueueList>

        <FooterNote>
          Admin view only. You are overseeing the live emergency triage queue.
        </FooterNote>
      </QueueCard>
    </Screen>
  )
}
