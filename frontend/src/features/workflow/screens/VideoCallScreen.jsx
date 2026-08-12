import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import '@livekit/components-styles'
import { useAppState } from '../../../app/context/useAppState'
import { useAuth } from '../../auth/context/useAuth'
import { LiveKitSessionRoom } from '../components/LiveKitSessionRoom'

const Screen = styled.section`
  min-height: 0;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: #f4f6f8;
  color: #0f172a;
  overflow: hidden;
`

const TopBar = styled.header`
  margin: 16px 18px 0;
  min-height: 68px;
  padding: 12px 14px 12px 16px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;

  @media (max-width: 760px) {
    margin: 10px 10px 0;
    padding: 10px;
    min-height: 60px;
  }
`

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`

const BrandMark = styled.div`
  width: 44px;
  height: 44px;
  flex: 0 0 auto;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
  color: #fff;
  font-size: 1.2rem;
  font-weight: 950;
  box-shadow: 0 12px 26px rgba(220, 38, 38, 0.22);
`

const BrandText = styled.div`
  min-width: 0;
`

const Title = styled.h1`
  margin: 0;
  font-size: 1.1rem;
  line-height: 1.1;
  letter-spacing: -0.025em;
`

const Subtitle = styled.p`
  margin: 4px 0 0;
  color: #64748b;
  font-size: 0.82rem;
  font-weight: 700;
`

const ActionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
`

const StatusPill = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border-radius: 999px;
  background: ${({ $tone }) => ($tone === 'danger' ? 'rgba(220, 38, 38, 0.08)' : 'rgba(15, 23, 42, 0.05)')};
  color: ${({ $tone }) => ($tone === 'danger' ? '#b91c1c' : '#334155')};
  font-size: 0.78rem;
  font-weight: 850;
  white-space: nowrap;
`

const Dot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: ${({ $tone }) => ($tone === 'danger' ? '#dc2626' : $tone === 'warning' ? '#f59e0b' : '#22c55e')};
  box-shadow: 0 0 0 4px ${({ $tone }) => ($tone === 'danger' ? 'rgba(220, 38, 38, 0.12)' : $tone === 'warning' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(34, 197, 94, 0.12)')};
`

const LeaveButton = styled.button`
  border: 0;
  border-radius: 999px;
  padding: 10px 14px;
  background: #0f172a;
  color: #fff;
  font-size: 0.8rem;
  font-weight: 850;
  cursor: pointer;
  transition: transform 160ms ease, background 160ms ease;

  &:hover { background: #1e293b; transform: translateY(-1px); }
  &:focus-visible { outline: 3px solid rgba(220, 38, 38, 0.28); outline-offset: 2px; }

  @media (max-width: 760px) {
    padding: 10px 12px;
  }
`

const Body = styled.main`
  flex: 1 1 auto;
  min-height: 0;
  height: 0;
  display: grid;
  grid-template-columns: ${({ $columnFraction = 1 }) => ($columnFraction === 0 ? '1fr' : `minmax(0, ${$columnFraction}fr) 318px`)};
  gap: 14px;
  padding: 14px 18px 18px;

  @media (max-width: 1180px) {
    grid-template-columns: ${({ $columnFraction = 1 }) => ($columnFraction === 0 ? '1fr' : `minmax(0, ${$columnFraction}fr) 280px`)};
  }

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
    overflow: auto;
    height: auto;
  }

  @media (max-width: 760px) {
    padding: 10px;
    gap: 10px;
  }
`

const StageCard = styled.section`
  width: 100%;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #1e293b;
  background: #020617;
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.12);

  @media (min-width: 980px) {
    ${({ $singleParticipant }) => $singleParticipant ? 'height: 70%;' : ''}
  }
`

const StageHeader = styled.div`
  min-height: 68px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  background: rgba(2, 6, 23, 0.96);
  color: #fff;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
`

const StageHeading = styled.div`
  min-width: 0;
`

const StageTitle = styled.h2`
  margin: 0;
  font-size: 1rem;
  font-weight: 900;
  letter-spacing: -0.02em;
`

const StageCopy = styled.p`
  margin: 4px 0 0;
  color: #94a3b8;
  font-size: 0.8rem;
  font-weight: 650;
`

const EmergencyBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 10px;
  border-radius: 999px;
  background: rgba(220, 38, 38, 0.14);
  color: #fecaca;
  border: 1px solid rgba(248, 113, 113, 0.18);
  font-size: 0.72rem;
  font-weight: 900;
  white-space: nowrap;
`

const StageBody = styled.div`
  flex: 1 1 auto;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  min-height: 0;
  position: relative;
  padding: 10px;
  background:
    radial-gradient(circle at 50% 0%, rgba(220, 38, 38, 0.11), transparent 30%),
    linear-gradient(180deg, #020617 0%, #0f172a 100%);
`

const ExitOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(2, 6, 23, 0.68);
`

const ExitDialog = styled.div`
  width: min(440px, 100%);
  padding: 22px;
  border-radius: 22px;
  background: #fff;
  border: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: 0 30px 80px rgba(2, 6, 23, 0.28);
`

const ExitTitle = styled.h2`
  margin: 0;
  font-size: 1.1rem;
  color: #0f172a;
`

const ExitCopy = styled.p`
  margin: 8px 0 18px;
  color: #64748b;
  line-height: 1.55;
  font-size: 0.86rem;
`

const ExitActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`

const SecondaryButton = styled.button`
  border: 1px solid #cbd5e1;
  border-radius: 999px;
  padding: 10px 14px;
  background: #fff;
  color: #334155;
  font-size: 0.8rem;
  font-weight: 850;
  cursor: pointer;
`

function getStatusCopy(status) {
  switch (status) {
    case 'connected': return { label: 'Connected', tone: 'success' }
    case 'reconnecting': return { label: 'Reconnecting', tone: 'warning' }
    case 'disconnected': return { label: 'Disconnected', tone: 'danger' }
    case 'error': return { label: 'Connection issue', tone: 'danger' }
    default: return { label: 'Connecting', tone: 'warning' }
  }
}

function getStatusTone(tone) {
  return tone === 'danger' ? 'danger' : tone === 'warning' ? 'warning' : 'success'
}

function roleLabel(role) {
  return String(role || 'participant').replace('-', ' ')
}

export default function VideoCallScreen({ onVideoCallSummaryChange }) {
  const { currentUser } = useAuth()
  const { setActivePage } = useAppState()
  const [status, setStatus] = useState('connecting')
  const [participants, setParticipants] = useState([])
  const [liveVitals, setLiveVitals] = useState({})
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`)
  const [showExitConfirmation, setShowExitConfirmation] = useState(false)

  const displayName = currentUser?.fullName || currentUser?.full_name || currentUser?.name || 'Patient'
  const role = currentUser?.role || 'patient'
  const roomName = useMemo(() => `EmergencyEcho-${sessionId}`, [sessionId])
  const statusCopy = getStatusCopy(status)

  useEffect(() => {
    document.title = 'Emergency Echo | Emergency Video Call'
  }, [])

  const patientParticipant = participants.find((person) => String(person.role || '').toLowerCase() === 'patient')
  const phase = participants.some((person) => person.role === 'ambulance')
    ? 'Ambulance dispatch'
    : participants.some((person) => person.role === 'nurse')
      ? 'Nurse support'
      : participants.some((person) => person.role === 'doctor')
        ? 'Doctor consultation'
        : 'AI triage / care team standby'

  const patientProfile = patientParticipant?.isLocal || role === 'patient' ? currentUser : null
  const emergencyProfile = useMemo(() => ({
    bloodType: patientProfile?.bloodType || '',
    conditions: patientProfile?.conditions || (Array.isArray(patientProfile?.conditionsList) ? patientProfile.conditionsList.join(', ') : ''),
    allergies: patientProfile?.allergies || [
      ...(Array.isArray(patientProfile?.drugAllergies) ? patientProfile.drugAllergies : []),
      ...(Array.isArray(patientProfile?.foodAllergies) ? patientProfile.foodAllergies : []),
      patientProfile?.otherAllergies || '',
    ].filter(Boolean).join(', '),
    medications: patientProfile?.medications || [
      ...(Array.isArray(patientProfile?.rxMeds) ? patientProfile.rxMeds : []),
      ...(Array.isArray(patientProfile?.otcMeds) ? patientProfile.otcMeds : []),
    ].filter(Boolean).join(', '),
    emergencyContact: patientProfile?.emergencyName || '',
  }), [patientProfile])

  useEffect(() => {
    onVideoCallSummaryChange?.({
      status,
      participants,
      displayName,
      role,
      phase,
      patientName: patientParticipant?.name || (role === 'patient' ? displayName : 'Patient'),
      severity: currentUser?.emergencySeverity || currentUser?.urgency || '',
      emergencyReason: currentUser?.emergencyReason || currentUser?.complaint || '',
      location: currentUser?.address || currentUser?.location || '',
      vitals: Object.keys(liveVitals).length ? liveVitals : (currentUser?.vitals || currentUser?.emergencyVitals || {}),
      patientProfile: emergencyProfile,
      recording: { state: 'inactive', authoritative: false },
    })
  }, [currentUser, displayName, emergencyProfile, liveVitals, onVideoCallSummaryChange, patientParticipant?.name, phase, participants, role, status])

  useEffect(() => () => onVideoCallSummaryChange?.(null), [onVideoCallSummaryChange])

  return (
    <Screen>
      <TopBar>
        <Brand>
          <BrandMark aria-hidden="true">
            <BrandIcon />
          </BrandMark>
          <BrandText>
            <Title>Emergency Echo</Title>
            <Subtitle>Secure emergency consultation</Subtitle>
          </BrandText>
        </Brand>

        <ActionGroup>
          <StatusPill $tone={getStatusTone(statusCopy.tone)} aria-live="polite">
            <Dot $tone={getStatusTone(statusCopy.tone)} />
            {statusCopy.label}
          </StatusPill>
          <LeaveButton type="button" onClick={() => setShowExitConfirmation(true)}>
            Leave call
          </LeaveButton>
        </ActionGroup>
      </TopBar>

      <Body $columnFraction={participants.length <= 1 ? 0 : 2}>
        <StageCard $singleParticipant={participants.length <= 1}>
          <StageHeader>
            <StageHeading>
              <StageTitle>Live emergency consultation</StageTitle>
              <StageCopy>{roleLabel(role)} • Secure care room</StageCopy>
            </StageHeading>
            <EmergencyBadge>
              <Dot $tone="danger" />
              Emergency session
            </EmergencyBadge>
          </StageHeader>

          <StageBody>
            <LiveKitSessionRoom
              currentUser={currentUser}
              roomSeed={{ roomName, sessionKey: sessionId, source: 'emergency-video-call' }}
              roomName={roomName}
              role={role}
              callType="video"
              displayName={displayName}
              identity={currentUser?.submission_key || currentUser?.id || currentUser?.email || 'patient'}
              onLeave={() => setStatus('disconnected')}
              onError={(err) => {
                console.error('[VideoCallScreen] LiveKit error:', err)
                setStatus('error')
              }}
              onStatusChange={setStatus}
              onParticipantsChange={setParticipants}
              onVitalsChange={setLiveVitals}
              onNavigateHome={() => setShowExitConfirmation(true)}
            />
          </StageBody>
        </StageCard>
      </Body>

      {showExitConfirmation && (
        <ExitOverlay role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowExitConfirmation(false) }}>
          <ExitDialog role="dialog" aria-modal="true" aria-labelledby="leave-call-title">
            <ExitTitle id="leave-call-title">Leave the emergency consultation?</ExitTitle>
            <ExitCopy>Leaving removes your video from the live room. If the patient still needs help, the care team can continue the emergency session without you.</ExitCopy>
            <ExitActions>
              <SecondaryButton type="button" onClick={() => setShowExitConfirmation(false)}>Stay in call</SecondaryButton>
              <LeaveButton type="button" onClick={() => { setShowExitConfirmation(false); setStatus('disconnected'); setActivePage('home') }}>Leave consultation</LeaveButton>
            </ExitActions>
          </ExitDialog>
        </ExitOverlay>
      )}
    </Screen>
  )
}

function BrandIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M14 3.5a5.25 5.25 0 1 1 0 10.5 5.25 5.25 0 0 1 0-10.5Z" fill="currentColor" />
      <path d="M5.25 24c.6-5.05 3.5-7.55 8.75-7.55S22.15 18.95 22.75 24H5.25Z" fill="currentColor" />
      <path d="M2.75 9.1c-1.1 1.4-1.1 3.4 0 4.8M25.25 9.1c1.1 1.4 1.1 3.4 0 4.8M5.05 6.55c-2.05 2.55-2.05 6.05 0 8.6M22.95 6.55c2.05 2.55 2.05 6.05 0 8.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
