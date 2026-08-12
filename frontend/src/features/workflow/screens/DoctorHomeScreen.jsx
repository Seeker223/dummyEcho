import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import { supabaseAdmin as supabase } from '../../../lib/supabaseClient'
import { useAppState } from '../../../app/context/useAppState'
import { useAuth } from '../../auth/context/useAuth'
import { Screen } from './ScreenPrimitives'
import { InPageMenuButton } from '../components/InPageMenuButton'
import { AiStarButton } from '../components/AiStarButton'
import { showAssistant } from '../components/AssistantCharacterOverlay'
import { fetchLiveBalance } from '../services/walletService'
import { useToaster } from '../components/GlobalToaster'
import { addNotificationForUser } from '../services/notificationService'

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
  padding: 8px 4px 14px;
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

  @media (min-width: 980px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`

const StatCard = styled.div`
  border-radius: 18px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  padding: 15px 14px;
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
  border-radius: 22px;
  padding: 18px 18px;
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
  border-radius: 18px;
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(254, 240, 138, 0.5)'};
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(234, 179, 8, 0.3)' : 'rgba(234, 179, 8, 0.5)'};
  padding: 14px 14px;
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
  border-radius: 22px;
  border: 1px solid rgba(220, 38, 38, 0.45);
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(24,10,20,0.95), rgba(9,17,31,0.85))'
      : 'linear-gradient(135deg, rgba(255,245,245,1), rgba(255,255,255,1))'};
  padding: 16px 16px 18px;
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
  border-radius: 22px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  padding: 16px 16px 18px;
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
  border-radius: 18px;
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

const LockedOverlay = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.8)'};
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 18px;
  padding: 24px;
  text-align: center;
`

const LockedIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(220, 38, 38, 0.1)'};
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-bottom: 16px;
`

const LockedTitle = styled.h3`
  font-weight: 950;
  font-size: 1.25rem;
  margin-bottom: 8px;
  margin-top: 0;
  color: ${({ theme }) => theme.colors.text};
`

const LockedText = styled.p`
  font-size: 0.95rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.muted};
  margin-bottom: 24px;
  line-height: 1.5;
  max-width: 320px;
`

const CtaButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(220, 38, 38, 0.3);
  transition: transform 0.2s;
  &:hover { transform: translateY(-2px); }
`

const QueueSectionWrapper = styled.div`
  position: relative;
  margin-top: 14px;

  @media (min-width: 980px) {
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(340px, 0.9fr);
    gap: 14px;
    align-items: start;

    ${IncomingCard} {
      margin-top: 0;
    }

    ${QueueCard} {
      margin-top: 0;
      max-height: calc(100vh - 390px);
      overflow: auto;
    }
  }
`

export default function DoctorHomeScreen() {
  const { setActivePage } = useAppState()
  const { currentUser, users } = useAuth()
  const [available, setAvailable] = useState(true)
  const [started, setStarted] = useState(false)
  const [incomingHandled, setIncomingHandled] = useState(false)
  const [declinedIds, setDeclinedIds] = useState([])
  const [liveQueue, setLiveQueue] = useState([])
  const navigate = useNavigate()
  const { toast } = useToaster()
  const [showBalance, setShowBalance] = useState(false)
  const [liveBalance, setLiveBalance] = useState(null)
  const [realStats, setRealStats] = useState({ calls: 0, earned: 0, avgSeconds: 0 })

  useEffect(() => {
    if (!currentUser?.id) return
    const fetchStats = async () => {
      const startOfDay = new Date()
      startOfDay.setHours(0, 0, 0, 0)
      const startIso = startOfDay.toISOString()

      // Fetch calls today
      const { data: callsData } = await supabase
        .from('call_queue')
        .select('id, consultation_duration')
        .eq('clinician_id', currentUser.id)
        .eq('status', 'complete')
        .gte('updated_at', startIso)

      const callsCount = callsData ? callsData.length : 0

      // Fetch earnings today
      const { data: txData } = await supabase
        .from('wallet_transactions')
        .select('amount')
        .eq('user_id', currentUser.id)
        .eq('type', 'earning')
        .gte('created_at', startIso)

      let earned = 0
      if (txData) {
        earned = txData.reduce((sum, tx) => sum + Number(tx.amount || 0), 0)
      }

      // Estimate avg call time (about 80% of purchased time)
      let avgSeconds = 0
      if (callsData && callsData.length > 0) {
         const totalMins = callsData.reduce((sum, c) => sum + Number(c.consultation_duration || 5), 0)
         avgSeconds = Math.floor((totalMins * 60 * 0.8) / callsCount)
      }

      setRealStats({ calls: callsCount, earned, avgSeconds })
    }
    fetchStats()
  }, [currentUser?.id])

  useEffect(() => {
    if (currentUser?.id) {
      fetchLiveBalance(currentUser.id).then(bal => {
        if (bal !== null && bal !== undefined) {
          setLiveBalance(bal)
        }
      })
    }
  }, [currentUser?.id])
  
  const role = currentUser?.role || 'doctor'
  const currentHour = new Date().getHours()
  const timeOfDay = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening'
  const roleDisplay = role.charAt(0).toUpperCase() + role.slice(1)
  const firstName = (currentUser?.fullName || currentUser?.full_name || 'User').split(' ')[0]
  const portalTitle = `${timeOfDay}, ${roleDisplay} ${firstName}`
  const clinicianName = `${roleDisplay} Portal`

  const patient = useMemo(() => users.find((item) => item.role === 'patient') || null, [users])
  const fallbackPatientName = patient?.fullName || 'Chidinma Okafor'
  const fallbackPatientAge = patient?.age || 34

  const stats = useMemo(
    () => {
      const formatAvg = (secs) => {
        if (!secs) return '0m 0s'
        const m = Math.floor(secs / 60)
        const s = secs % 60
        return `${m}m ${s}s`
      }
      
      const formatEarned = (val) => {
        if (!val) return 'NGN 0'
        if (val >= 1000) return `NGN ${(val/1000).toFixed(val % 1000 === 0 ? 0 : 1)}K`
        return `NGN ${val}`
      }

      return [
        { key: 'calls', value: String(realStats.calls), label: 'Calls Today' },
        { key: 'earned', value: formatEarned(realStats.earned), label: 'Earned Today' },
        { key: 'avg', value: formatAvg(realStats.avgSeconds), label: 'Avg Call Time' },
        { key: 'waiting', value: String(liveQueue.length), label: 'Patients Waiting' },
      ]
    },
    [realStats, liveQueue.length],
  )

  const isSubscribed = currentUser?.isSubscribed || currentUser?.subscription_status === 'active' || currentUser?.plan === 'premium'

  const wallet = useMemo(() => {
    const rawBal = liveBalance !== null ? liveBalance : (currentUser?.wallet_balance ?? currentUser?.walletBalanceNgn ?? 0)
    const amount = Number(rawBal)
    return {
      amount: `NGN ${amount.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      label: 'EchoWallet balance',
    }
  }, [currentUser?.wallet_balance, currentUser?.walletBalanceNgn, liveBalance])

  const baseKit = useMemo(
    () => ({
      blood: patient?.bloodType || 'O+',
      genotype: patient?.genotype || 'AA',
      condition: patient?.medicalCondition || 'Hypertension',
      allergy: patient?.allergy || 'Penicillin',
    }),
    [patient],
  )


  useEffect(() => {
    async function fetchQueue() {
      let query = supabase
        .from('call_queue')
        .select('*')
        .eq('status', 'waiting')
        .order('created_at', { ascending: true })
        .limit(10)

      const userRole = currentUser?.role || 'doctor'
      query = query.or(`routing.eq.${userRole.toUpperCase()},routing.is.null`)

      if (!isSubscribed) {
        const twoMinsAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString()
        query = query.lte('created_at', twoMinsAgo)
      }

      const { data, error } = await query
      
      if (data && data.length > 0) {
        const submissionKeys = data.map(d => d.submission_key)
        const { data: briefsData } = await supabase
          .from('clinical_briefs')
          .select('*')
          .in('submission_key', submissionKeys)
          
        if (briefsData) {
          console.log('Fetched briefsData:', briefsData)
          const briefsMap = {}
          briefsData.forEach(b => { briefsMap[b.submission_key] = b })
          
          const enrichedData = data.map(d => ({
            ...d,
            brief: briefsMap[d.submission_key] || null
          }))
          console.log('Enriched liveQueue data:', enrichedData)
          setLiveQueue(enrichedData)
        } else {
          console.log('No briefsData returned or error:', briefsError)
          setLiveQueue(data)
        }
      } else {
        setLiveQueue([])
      }
    }

    fetchQueue()

    const setupDoctorRealtime = async () => {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      if (token) await supabase.realtime.setAuth(token) // Needed for Realtime Authorization
      
      const channel = supabase
        .channel('call_queue_all', {
          config: token ? { private: true } : {},
        })
        .on('broadcast', { event: 'INSERT' }, (payload) => {
          if (payload.new?.status === 'waiting') {
            if (currentUser?.verified_by_admin) {
              toast('New Patient Waiting', 'A new patient has joined the emergency queue.', 'info')
            } else {
              toast('Action Required', 'A patient is waiting, but your account is not verified.', 'warning')
              addNotificationForUser(currentUser.id, {
                title: 'Verification Required',
                message: 'A patient is waiting. Verify your documents to start accepting patients.',
                type: 'alert'
              })
            }
            fetchQueue()
          }
        })
        .on('broadcast', { event: 'UPDATE' }, (payload) => {
          fetchQueue()
        })
        .on('broadcast', { event: 'DELETE' }, (payload) => {
          fetchQueue()
        })
        .subscribe()
      
      return channel
    }
    
    let channel;
    setupDoctorRealtime().then(c => {
      channel = c
    })

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [currentUser])

  const queue = useMemo(() => {
    const activeQueue = liveQueue.filter(q => !declinedIds.includes(q.id))
    
    if (!activeQueue || activeQueue.length === 0) {
      return [] // We shouldn't show a fake active call if there's no waiting queue
    }

    return activeQueue.map(item => {
      const severity = String(item.urgency_label || item.urgency || 'routine').toLowerCase()
      let tone = 'green'
      if (severity === 'critical' || severity === 'red') tone = 'red'
      if (severity === 'urgent' || severity === 'orange') tone = 'amber'
      if (severity === 'priority' || severity === 'yellow') tone = 'amber'

      let parsedRedFlags = []
      let parsedAllergies = []
      let parsedDiagnoses = []
      let parsedFindings = []
      
      const briefData = item.brief || {}
      
      try { parsedRedFlags = typeof briefData.red_flags === 'string' ? JSON.parse(briefData.red_flags) : (briefData.red_flags || item.red_flags || []) } catch(e){}
      try { parsedAllergies = typeof briefData.allergy_flags === 'string' ? JSON.parse(briefData.allergy_flags) : (briefData.allergy_flags || []) } catch(e){}
      try { parsedDiagnoses = typeof briefData.probable_diagnosis === 'string' ? JSON.parse(briefData.probable_diagnosis) : (briefData.probable_diagnosis || []) } catch(e){}
      try { parsedFindings = typeof briefData.supportive_findings === 'string' ? JSON.parse(briefData.supportive_findings) : (briefData.supportive_findings || []) } catch(e){}

      let age = 45;
      if (briefData.dob) {
         age = new Date().getFullYear() - new Date(briefData.dob).getFullYear();
      }

      return {
        id: item.id,
        submission_key: item.submission_key,
        fullName: briefData.patient_name || item.patient_name || 'Emergency Caller',
        age: age,
        sex: briefData.gender === 'female' ? 'F' : (briefData.gender === 'male' ? 'M' : 'U'),
        complaint: briefData.presentation || briefData.clinical_summary || item.clinical_summary || 'No presentation recorded',
        candidate_diagnoses: parsedDiagnoses.length > 0 ? parsedDiagnoses : [item.urgency || 'Pending AI Summary'],
        positive_findings: parsedFindings,
        red_flags: parsedRedFlags,
        severity: severity,
        tone: tone,
        callType: item.consultation_type || 'video',
        paidMins: item.consultation_duration || 5,
        kit: {
          blood: briefData.blood_group || 'O+',
          genotype: briefData.genotype || 'AA',
          condition: 'None',
          allergy: parsedAllergies.length > 0 ? parsedAllergies.join(', ') : 'None',
        }
      }
    })
  }, [liveQueue, baseKit, declinedIds])

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

  const openLive = async (item, source = 'queue') => {
    if (!available) {
      showAssistant({
        tone: 'warning',
        avatar: role === 'nurse' ? 'nurse' : 'doctor',
        title: 'You are currently unavailable',
        message: 'Turn availability on to start the next session.',
        durationMs: 5200,
      })
      return
    }

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      const res = await fetch('/api/call_queue/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'x-echo-user-id': currentUser?.id || '',
          'x-echo-user-email': currentUser?.email || '',
        },
        body: JSON.stringify({
          id: item.id,
          payload: {
            status: 'accepted',
            clinician_id: currentUser?.id,
          }
        })
      })

      if (!res.ok) {
        const result = await res.json()
        console.error('Error from API updating call_queue to accepted:', result.error)
        alert('Failed to connect to the patient: ' + (result.error || 'Server error'))
        return
      }
    } catch (err) {
      console.error('Error accepting call', err)
      alert('Failed to connect to the patient. Please check your connection and try again.')
      return
    }

    showAssistant({
      tone: item.severity === 'critical' ? 'danger' : 'info',
      avatar: role === 'nurse' ? 'nurse' : 'doctor',
      title:
        source === 'next'
          ? 'Starting next session'
          : source === 'incoming'
            ? 'Incoming call accepted'
            : 'Opening triage request',
      message: `${item.severity.toUpperCase()}: ${item.complaint}`,
      durationMs: 9000,
    })

    if (source === 'incoming') setIncomingHandled(true)
    setStarted(true)

    setActivePage('doctor-live')
    navigate('/app/doctor-live', { state: { requestId: item.id, submissionKey: item.submission_key, callType: item.callType, paidMins: item.paidMins, source, callItem: item } })
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

      <Grid aria-label="Today metrics">
        {stats.map((item) => (
          <StatCard key={item.key}>
            <StatValue>{item.value}</StatValue>
            <StatLabel>{item.label}</StatLabel>
          </StatCard>
        ))}
      </Grid>

      <WalletCard>
        <WalletRow>
          <div>
            <WalletLabel>{wallet.label}</WalletLabel>
            <WalletAmount>
              {showBalance ? wallet.amount : 'NGN ******'}
              <EyeToggle onClick={() => setShowBalance((prev) => !prev)}>
                {showBalance ? <EyeOffIcon /> : <EyeIcon />}
              </EyeToggle>
            </WalletAmount>
          </div>
        </WalletRow>
        <WalletButton type="button" onClick={() => navigate('/app/wallet-withdraw', { state: { returnTo: 'home' } })}>
          Withdraw funds -&gt;
        </WalletButton>
      </WalletCard>

      {!isSubscribed ? (
        <UpgradeBanner>
          <span>🔒 Free Tier: Premium clinicians see live patients 2 minutes before you.</span>
          <a onClick={() => navigate('/app/subscription')}>Upgrade Now</a>
        </UpgradeBanner>
      ) : null}

      <QueueSectionWrapper>
        {(!currentUser?.verified_by_admin) && (
          <LockedOverlay>
            <LockedIcon>🔒</LockedIcon>
            <LockedTitle>Account Not Verified</LockedTitle>
            <LockedText>
              Your professional documents are currently pending verification by an admin. You cannot receive or accept live patients until you are verified.
            </LockedText>
            <CtaButton onClick={() => navigate('/app/notifications')}>
              Check Verification Status
            </CtaButton>
          </LockedOverlay>
        )}
        
        {queue.length > 0 ? (
          <IncomingCard aria-label="Incoming Echo call">
            <IncomingLabel>ECHO - {queue[0].paidMins || 5} MINS</IncomingLabel>

            <ClinicalSummaryBlock>
              <SummaryTitle>Clinical Presentation</SummaryTitle>
              <SummaryText>
                <strong>{queue[0].fullName}</strong> ({queue[0].age}{queue[0].sex}) presenting with <strong>{queue[0].complaint?.toLowerCase()}</strong>.
              </SummaryText>
              <SummaryTitle $mt>Key Clinical Points</SummaryTitle>
              <KeyPointsList>
                <li><strong>Probable Diagnosis:</strong> {Array.isArray(queue[0].candidate_diagnoses) && queue[0].candidate_diagnoses.length > 0 ? queue[0].candidate_diagnoses.join(', ') : 'Pending AI Triage'}</li>
                <li><strong>Supportive Findings:</strong> {Array.isArray(queue[0].positive_findings) && queue[0].positive_findings.length > 0 ? queue[0].positive_findings.join(', ') : 'Pending AI Triage'}</li>
                {queue[0].red_flags && queue[0].red_flags.length > 0 && (
                  <li><strong><span style={{ color: '#dc2626' }}>Red Flags:</span></strong> <span style={{ color: '#dc2626', fontWeight: 'bold' }}>{queue[0].red_flags.join(', ')}</span></li>
                )}
                <li><strong>Vitals & Allergies:</strong> {queue[0].kit?.blood}, {queue[0].kit?.genotype} | <span style={{ color: '#dc2626' }}>{queue[0].kit?.allergy}</span></li>
              </KeyPointsList>
            </ClinicalSummaryBlock>

            <Hint>Timer starts when you accept. Live triage includes audio, video, and chat.</Hint>

            <ActionRow>
              <Accept disabled={incomingHandled} onClick={() => openLive(queue[0], 'incoming')} type="button">
                {incomingHandled ? 'Accepted' : 'Accept Call'}
              </Accept>
              <Decline
                onClick={() => {
                  setDeclinedIds(prev => [...prev, queue[0].id])
                  showAssistant({
                    tone: 'info',
                    avatar: role === 'nurse' ? 'nurse' : 'doctor',
                    title: 'Call declined',
                    message: 'This request has been removed from your view.',
                    durationMs: 4000,
                  })
                }}
                type="button"
              >
                Decline
              </Decline>
            </ActionRow>

            <FooterNote>Prescription pad and history are available during active sessions.</FooterNote>
          </IncomingCard>
        ) : (
          <IncomingCard aria-label="No Incoming Echo calls" style={{ textAlign: 'center', opacity: 0.7 }}>
            <IncomingLabel style={{ justifyContent: 'center' }}>NO INCOMING CALLS</IncomingLabel>
            <div style={{ padding: '20px', color: '#64748B', fontWeight: 600 }}>
              You have no waiting patients at this time.
            </div>
          </IncomingCard>
        )}

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
                <QueueItem key={item.id} onClick={() => openLive(item)} type="button">
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

          {queue.length > 0 ? (
            <PrimaryAction disabled={started} onClick={() => openLive(queue[0], 'next')} type="button">
              {started ? 'Session started' : 'Start next session'}
            </PrimaryAction>
          ) : (
            <PrimaryAction disabled type="button">
              Queue is empty
            </PrimaryAction>
          )}

          <FooterNote>
            Live triage includes audio, video, and chat. Notes and prescriptions are available during the session.
          </FooterNote>
        </QueueCard>
      </QueueSectionWrapper>
    </Screen>
  )
}
