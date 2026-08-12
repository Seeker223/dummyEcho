import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useAppState } from '../../../app/context/useAppState'
import { useAuth } from '../../auth/context/useAuth'
import { LiveKitSessionRoom } from '../components/LiveKitSessionRoom'

const Wrap = styled.section`
  min-height: 100%;
  height: 100%;
  background:
    radial-gradient(circle at 18% 0%, rgba(220, 38, 38, 0.1), transparent 22%),
    radial-gradient(circle at 86% 16%, rgba(59, 130, 246, 0.08), transparent 18%),
    linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
  color: #0f172a;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  @media (max-width: 640px) {
    min-height: 100vh;
  }
`

const TopBar = styled.header`
  margin: 18px 20px 0;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: rgba(255,255,255,0.84);
  backdrop-filter: blur(18px);
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 20px;
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.08);
  z-index: 10;

  @media (max-width: 640px) {
    margin: 12px 12px 0;
    border-radius: 16px;
    padding: 12px 14px;
  }
`

const EndBtn = styled.button`
  border: 0;
  background: transparent;
  color: #334155;
  font-weight: 900;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 12px;

  &:hover {
    background: rgba(15,23,42,0.04);
  }
`

const Secure = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #0f172a;
  font-weight: 850;
  font-size: 0.95rem;
`

const Dot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #22c55e;
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.2);
`

const Body = styled.div`
  flex: 1;
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 2.25fr) minmax(280px, 0.75fr);
  gap: 16px;
  padding: 16px 20px 20px;
  min-height: 0;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 640px) {
    padding: 12px;
    gap: 12px;
  }
`

const VideoContainer = styled.div`
  flex: 1;
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  border-radius: 28px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background:
    radial-gradient(circle at 50% 0%, rgba(220, 38, 38, 0.08), transparent 30%),
    linear-gradient(180deg, #0f172a 0%, #111827 100%);
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.12);

  @media (max-width: 640px) {
    border-radius: 22px;
  }
`

const CallRail = styled.aside`
  display: grid;
  gap: 14px;
  align-content: start;
  min-height: 0;

  @media (min-width: 1101px) {
    position: sticky;
    top: 22px;
    align-self: start;
  }
`

const RailCard = styled.section`
  border-radius: 24px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: rgba(255,255,255,0.88);
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.06);
  padding: 16px;
`

const RailTitle = styled.h3`
  margin: 0 0 8px;
  font-size: 1rem;
  font-weight: 900;
`

const RailText = styled.p`
  margin: 0;
  color: #64748b;
  font-size: 0.92rem;
  line-height: 1.55;
`

const RailList = styled.div`
  margin-top: 12px;
  display: grid;
  gap: 10px;
`

const RailItem = styled.div`
  border-radius: 18px;
  padding: 12px 14px;
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.08), rgba(59, 130, 246, 0.06));
  border: 1px solid rgba(148, 163, 184, 0.14);
  color: #0f172a;
  font-size: 0.88rem;
  font-weight: 700;
`

const PromptOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.82);
  backdrop-filter: blur(12px);
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`

const PromptBox = styled.div`
  background: ${({ theme }) => theme.mode === 'dark' ? '#111827' : '#fff'};
  padding: 28px;
  border-radius: 26px;
  text-align: center;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 28px 80px rgba(15, 23, 42, 0.25);
  border: 1px solid rgba(148, 163, 184, 0.14);
`

const PromptTitle = styled.h2`
  margin: 0 0 20px 0;
  color: ${({ theme }) => theme.mode === 'dark' ? '#fff' : '#000'};
  font-size: 1.25rem;
`

const PrimaryBtn = styled.button`
  width: 100%;
  padding: 14px 16px;
  border-radius: 16px;
  border: 0;
  background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
  color: #fff;
  font-weight: 800;
  margin-bottom: 10px;
  cursor: pointer;
  
  &:hover { filter: brightness(1.02); }
`

const GhostBtn = styled.button`
  width: 100%;
  padding: 14px;
  border-radius: 16px;
  border: 0;
  background: transparent;
  color: ${({ theme }) => theme.mode === 'dark' ? '#94a3b8' : '#64748b'};
  font-weight: 800;
  cursor: pointer;

  &:hover { background: rgba(15,23,42,0.05); }
`

export default function PatientSessionScreen() {
  const { setActivePage } = useAppState()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const initialCallType = useMemo(() => {
    const raw = location.state?.callType || location.state?.callItem?.consultation_type
    if (!raw) return 'video'
    const t = String(raw).trim().toLowerCase()
    return t === 'voice' ? 'voice' : 'video'
  }, [location.state])

  const sessionKey = useMemo(() => {
    const raw = location.state || {}
    const key = raw.sessionKey || raw.requestId || raw.doctorId || raw.sessionId || raw.caseId || ''
    return String(key)
  }, [location.state])

  const paidMins = useMemo(() => {
    const raw = location.state && (location.state.paidMinutes || location.state.paidMins || location.state.minutes)
    const mins = Number(raw)
    if (!mins || !Number.isFinite(mins) || mins <= 0) return 5
    return mins === 10 ? 10 : 5
  }, [location.state])

  const [secondsLeft, setSecondsLeft] = useState(() => paidMins * 60)
  const [mode, setMode] = useState('paid') // paid | prompt | ended
  const intervalRef = useRef(null)

  useEffect(() => {
    if (mode === 'prompt' || mode === 'ended') return
    intervalRef.current = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(intervalRef.current)
          setMode('prompt')
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => window.clearInterval(intervalRef.current)
  }, [mode])

  const endCall = useCallback(async () => {
    window.clearInterval(intervalRef.current)
    setMode('ended')
    setActivePage('home')
    navigate('/app')
  }, [setActivePage, navigate])

  const buyMinutes = (mins) => {
    window.clearInterval(intervalRef.current)
    navigate('/app/payment', { state: { minutes: Number(mins), returnTo: 'patient-live', sessionKey } })
  }

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  return (
    <Wrap>
      <TopBar>
        <EndBtn type="button" onClick={endCall}>
          <span aria-hidden="true">X</span> Leave
        </EndBtn>
        <Secure>
          <Dot />
          {initialCallType === 'video' ? 'Secure Video' : 'Secure Voice'} - {formatTimer(secondsLeft)}
        </Secure>
      </TopBar>

      <Body>
        {(mode === 'paid') && (
          <VideoContainer>
            <LiveKitSessionRoom
                currentUser={currentUser}
                roomSeed={{
                  ...location.state,
                  sessionKey,
                  requestId: location.state?.requestId || '',
                  submissionKey: currentUser?.submission_key || currentUser?.id || '',
                  source: location.state?.source || 'patient-session',
                }}
                roomName={`EmergencyEcho_${sessionKey || 'Demo'}`}
                role="patient"
                callType={initialCallType}
                displayName={currentUser?.fullName || 'Patient'}
                identity={currentUser?.submission_key || currentUser?.id || currentUser?.email || 'patient'}
                onLeave={endCall}
                onError={(err) => console.error('LiveKit room error:', err)}
            />
          </VideoContainer>
        )}

        <CallRail>
          <RailCard>
            <RailTitle>Secure call workspace</RailTitle>
            <RailText>
              The video room now owns the center lane while supporting information stays in a
              calm side rail for faster clinical scanning.
            </RailText>
            <RailList>
              <RailItem>Keep the main call visible for the full consultation.</RailItem>
              <RailItem>Use the side rail for timer, next actions, and handoff details.</RailItem>
              <RailItem>On mobile, the rail collapses below the call for a cleaner stack.</RailItem>
            </RailList>
          </RailCard>
        </CallRail>

        {mode === 'prompt' && (
          <PromptOverlay>
            <PromptBox>
              <PromptTitle>Your session has ended. Continue?</PromptTitle>
              <PrimaryBtn type="button" onClick={() => buyMinutes(5)}>Extend 5 mins (NGN 1,000)</PrimaryBtn>
              <PrimaryBtn type="button" onClick={() => buyMinutes(10)}>Extend 10 mins (NGN 1,500)</PrimaryBtn>
              <GhostBtn type="button" onClick={endCall}>End Session</GhostBtn>
            </PromptBox>
          </PromptOverlay>
        )}
      </Body>
    </Wrap>
  )
}
