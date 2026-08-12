import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import { Button, Screen } from '../screens/ScreenPrimitives'
import { supabase } from '../../../lib/supabaseClient'

/* ─── Animations ─────────────────────────────────────────── */
const pulseRing = keyframes`
  0%   { transform: scale(0.92); opacity: 0.7; box-shadow: 0 0 0 0 rgba(220,38,38,0.5); }
  50%  { transform: scale(1.04); opacity: 1;   box-shadow: 0 0 0 22px rgba(220,38,38,0); }
  100% { transform: scale(0.92); opacity: 0.7; box-shadow: 0 0 0 0 rgba(220,38,38,0); }
`

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-8px); }
`

const ecgDraw = keyframes`
  from { stroke-dashoffset: 300; }
  to   { stroke-dashoffset: 0; }
`

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`

const successPop = keyframes`
  0%   { transform: scale(0.6); opacity: 0; }
  60%  { transform: scale(1.15); }
  100% { transform: scale(1);   opacity: 1; }
`

/* ─── Layout ──────────────────────────────────────────────── */
const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  padding: 24px 20px;
  gap: 28px;
  animation: ${fadeUp} 0.5s ease both;
`

const GlassCard = styled.div`
  width: 100%;
  max-width: 380px;
  border-radius: 26px;
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.08)'};
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'linear-gradient(160deg, rgba(18,26,46,0.97) 0%, rgba(10,18,36,0.97) 100%)'
      : 'linear-gradient(160deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)'};
  box-shadow: 0 24px 60px rgba(15,31,68,0.18), 0 0 0 1px rgba(220,38,38,0.06);
  padding: 32px 24px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  backdrop-filter: blur(20px);
`

/* ─── Pulse icon ──────────────────────────────────────────── */
const PulseWrap = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const PulseCircle = styled.div`
  width: 110px;
  height: 110px;
  border-radius: 999px;
  border: 3px solid ${({ $accepted, theme }) => $accepted ? '#22c55e' : theme.colors.primary};
  background: ${({ $accepted, theme }) =>
    $accepted
      ? 'rgba(34,197,94,0.10)'
      : theme.mode === 'dark' ? 'rgba(220,38,38,0.12)' : 'rgba(220,38,38,0.07)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.8rem;
  animation: ${({ $accepted }) => $accepted ? successPop : pulseRing} ${({ $accepted }) => $accepted ? '0.5s' : '2.2s'} ease ${({ $accepted }) => $accepted ? 'both' : 'infinite'};
  transition: all 0.4s ease;
`

/* ─── ECG Line ────────────────────────────────────────────── */
const EcgWrap = styled.div`
  width: 100%;
  height: 36px;
  opacity: ${({ $accepted }) => $accepted ? 0.3 : 1};
  transition: opacity 0.6s ease;
`

const EcgLine = styled.svg`
  width: 100%;
  height: 100%;

  path {
    stroke: ${({ theme }) => theme.colors.primary};
    stroke-width: 2.5;
    stroke-dasharray: 300;
    stroke-dashoffset: 300;
    fill: none;
    animation: ${ecgDraw} 2s linear infinite;
  }
`

/* ─── Mode badge ──────────────────────────────────────────── */
const ModeBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 999px;
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.05)'};
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 0.88rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text};
  letter-spacing: 0.01em;
`

/* ─── Text ────────────────────────────────────────────────── */
const StatusText = styled.h2`
  margin: 0;
  font-size: 1.35rem;
  font-weight: 900;
  letter-spacing: -0.03em;
  text-align: center;
  color: ${({ $accepted, theme }) => $accepted ? '#22c55e' : theme.colors.text};
  transition: color 0.4s ease;
`

const Subtext = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.95rem;
  line-height: 1.6;
  text-align: center;
  max-width: 280px;
`

const Timer = styled.div`
  font-size: 0.85rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.muted};
  letter-spacing: 0.04em;
  font-variant-numeric: tabular-nums;
`

/* ─── Actions ─────────────────────────────────────────────── */
const CancelBtn = styled(Button)`
  background: transparent;
  color: ${({ theme }) => theme.colors.error || '#dc2626'};
  border: 1px solid ${({ theme }) => theme.colors.error || '#dc2626'};
  width: 100%;
  max-width: 380px;

  &:hover {
    background: rgba(220,38,38,0.06);
  }
`

/* ─── Mode label map ──────────────────────────────────────── */
const MODE_LABELS = { video: '🎥 Video Call', voice: '📞 Voice Call', chat: '💬 Live Chat' }

function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0')
  const s = String(seconds % 60).padStart(2, '0')
  return `${m}:${s}`
}

export default function ConsultationWaitingScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const queueId = searchParams.get('queueId')
  const callType = location.state?.callType || 'video'
  const [status, setStatus] = useState('waiting')
  const [acceptedRow, setAcceptedRow] = useState(null)  // stores the DB row when accepted
  const [elapsed, setElapsed] = useState(0)

  const accepted = status === 'accepted' || status === 'in_consultation'

  // ── Navigate to video room once accepted row is stored ──────────────────
  useEffect(() => {
    if (!acceptedRow) return
    const t = setTimeout(() => {
      navigate('/app/patient-live', {
        state: {
          sessionKey: queueId,
          paidMins: acceptedRow.consultation_duration || 5,
          callType: acceptedRow.consultation_type || callType,
        },
      })
    }, 900)
    return () => clearTimeout(t)
  }, [acceptedRow, navigate, queueId, callType])

  // Elapsed timer
  useEffect(() => {
    if (accepted) return
    const t = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(t)
  }, [accepted])

  useEffect(() => {
    if (!queueId) {
      navigate('/app')
      return
    }

    const handleAccepted = (row) => {
      setStatus('accepted')
      setAcceptedRow(row)
    }

    const checkStatus = async () => {
      try {
        const token = (await supabase.auth.getSession()).data.session?.access_token
        const res = await fetch(`/api/call_queue/poll?id=${queueId}&t=${Date.now()}`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'x-echo-user-id': currentUser?.id || '',
            'x-echo-user-email': currentUser?.email || '',
          },
          cache: 'no-store'
        })
        if (res.ok) {
          const { data } = await res.json()
          if (data && (data.status === 'in_consultation' || data.status === 'accepted')) {
            handleAccepted(data)
            return true
          }
        }
      } catch (e) {}
      return false
    }

    // Supabase Realtime Broadcast listener (instant)
    const setupRealtime = async () => {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      if (token) await supabase.realtime.setAuth(token)

      const channel = supabase
        .channel(`call_queue_topic:${queueId}`, { config: token ? { private: true } : {} })
        .on('broadcast', { event: 'UPDATE' }, (msg) => {
          // msg.payload is what update.js sent: { new: data }
          const row = msg?.payload?.new || msg?.new
          console.log('[WaitingRoom] broadcast received, row:', row)
          const newStatus = row?.status
          if (newStatus === 'accepted' || newStatus === 'in_consultation') {
            handleAccepted(row)
          }
        })
        .subscribe()
      return channel
    }

    let channel
    setupRealtime().then(c => { channel = c })

    // Initial check
    checkStatus()

    // Fallback polling every 3s
    const interval = setInterval(async () => {
      const done = await checkStatus()
      if (done) clearInterval(interval)
    }, 3000)

    return () => {
      if (channel) supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [queueId, navigate, callType])

  const onCancel = async () => {
    if (queueId) {
      await supabase.from('call_queue').update({ status: 'resolved' }).eq('id', queueId)
    }
    navigate('/app')
  }

  return (
    <Screen>
      <Wrap>
        <GlassCard>

          {/* Animated icon */}
          <PulseWrap>
            <PulseCircle $accepted={accepted}>
              {accepted ? '✅' : MODE_LABELS[callType]?.split(' ')[0] || '👨‍⚕️'}
            </PulseCircle>
          </PulseWrap>

          {/* ECG line */}
          <EcgWrap $accepted={accepted}>
            <EcgLine viewBox="0 0 300 36" aria-hidden="true">
              <path d="M0,18 L40,18 L55,4 L65,32 L75,4 L85,32 L95,18 L130,18 L145,4 L155,32 L165,4 L175,32 L185,18 L240,18 L255,4 L265,32 L275,4 L285,32 L295,18 L300,18" />
            </EcgLine>
          </EcgWrap>

          {/* Mode badge */}
          <ModeBadge>{MODE_LABELS[callType] || '👨‍⚕️ Consultation'}</ModeBadge>

          {/* Status text */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <StatusText $accepted={accepted}>
              {accepted ? 'Doctor Connected!' : 'Finding You a Doctor…'}
            </StatusText>
            <Subtext>
              {accepted
                ? 'Preparing your secure consultation room. Please wait…'
                : 'Stay on this screen. A clinician will join your session shortly.'}
            </Subtext>
          </div>

          {/* Wait timer */}
          {!accepted && (
            <Timer>⏱ Waiting {formatTime(elapsed)}</Timer>
          )}

        </GlassCard>

        {!accepted && (
          <CancelBtn onClick={onCancel}>Cancel Request</CancelBtn>
        )}
      </Wrap>
    </Screen>
  )
}
