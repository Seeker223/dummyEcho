import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { Screen } from './ScreenPrimitives'
import { supabase, supabaseAdmin } from '../../../lib/supabaseClient'
import { useAuth } from '../../auth/context/useAuth'

const Wrap = styled.section`
  width: 100%;
  min-height: 100%;
  border-radius: 22px;
  border: 1px solid ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : theme.colors.border)};
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? `radial-gradient(circle at 40% 0%, ${theme.colors.glowRed}, transparent 58%),
         linear-gradient(180deg, ${theme.colors.bgStart} 0%, ${theme.colors.bgEnd} 100%)`
      : `linear-gradient(180deg, ${theme.colors.surface} 0%, ${theme.colors.surfaceAlt} 100%)`};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 20px;
  overflow: hidden;
`

const LoadingSpinner = styled.div`
  width: 60px;
  height: 60px;
  border: 4px solid ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)')};
  border-top-color: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 30px;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`

const Title = styled.h2`
  margin: 0 0 10px 0;
  font-size: 1.5rem;
  font-weight: 1000;
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.colors.text};
`

const Subtitle = styled.p`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.muted};
  max-width: 300px;
`

const ConsultDetails = styled.div`
  margin-top: 40px;
  padding: 16px 24px;
  background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)')};
  border-radius: 16px;
  border: 1px solid ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)')};
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 40px;
  font-weight: 800;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.text};
`

const ModeGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  width: 100%;
  max-width: 400px;
  margin-top: 30px;
`

const ModeButton = styled.button`
  background: ${({ theme }) => theme.colors.surface};
  border: 2px solid ${({ theme }) => theme.colors.border};
  padding: 24px 16px;
  border-radius: 20px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 800;
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  transition: all 0.2s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.05);
  }

  svg {
    width: 36px;
    height: 36px;
    color: ${({ theme }) => theme.colors.primary};
  }
`

function VideoIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
}

function VoiceIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
}

export default function PatientWaitScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser } = useAuth()
  
  const rawMinutes = location.state?.paidMinutes || location.state?.minutes || 10
  const minutes = Number(rawMinutes)
  
  const [selectedMode, setSelectedMode] = useState(null) // null | 'video' | 'voice'
  const [status, setStatus] = useState('waiting')
  const [latestRowId, setLatestRowId] = useState(null)

  useEffect(() => {
    if (!currentUser?.submission_key) return

    let interval
    const checkRow = async () => {
      try {
        const token = (await supabase.auth.getSession()).data.session?.access_token
        const res = await fetch(`/api/call_queue/poll?submission_key=${currentUser.submission_key}&t=${Date.now()}`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'x-echo-user-id': currentUser?.id || '',
            'x-echo-user-email': currentUser?.email || '',
          },
          cache: 'no-store'
        })
        if (res.ok) {
          const { data } = await res.json()
          if (data && data.length > 0) {
            // Ensure it's a recent row (within last hour)
            const created = new Date(data[0].created_at).getTime()
            if (Date.now() - created < 60 * 60 * 1000) {
              setLatestRowId(data[0].id)
              return true
            }
          }
        }
      } catch (e) {}
      return false
    }

    // Initial check
    checkRow()
    interval = setInterval(async () => {
      const found = await checkRow()
      if (found) {
        clearInterval(interval)
      }
    }, 2500)

    return () => clearInterval(interval)
  }, [currentUser?.submission_key])

  useEffect(() => {
    if (!latestRowId) return
    if (!selectedMode) return // Don't connect until mode is chosen

    // Ensure the call_queue is updated to 'waiting' and consultation details are saved
    const updateQueue = async () => {
      const { error } = await supabaseAdmin
        .from('call_queue')
        .update({
          status: 'waiting',
          consultation_type: selectedMode,
          consultation_duration: minutes,
          amount_paid: minutes === 10 ? 950 : (minutes === 5 ? 1000 : 0)
        })
        .eq('id', latestRowId)

      if (error) {
        console.error('Error updating queue to waiting:', error)
      }
    }

    updateQueue()

    // Listen for changes
    const setupRealtime = async () => {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      if (token) await supabase.realtime.setAuth(token) // Needed for Realtime Authorization
      
      const channel = supabase
        .channel(`call_queue_topic:${latestRowId}`, {
          config: token ? { private: true } : {},
        })
        .on('broadcast', { event: 'UPDATE' }, (payload) => {
          const newStatus = payload.new?.status
          if (newStatus === 'accepted' || newStatus === 'in_consultation') {
            setStatus('accepted')
            setTimeout(() => {
              navigate('/app/patient-live', { state: { sessionKey: latestRowId, callType: selectedMode, minutes, source: 'wait-screen' } })
            }, 1500)
          }
        })
        .subscribe((status) => {
          console.log('PatientWaitScreen Broadcast status:', status)
        })
      return channel
    }
    
    let channel;
    setupRealtime().then(c => channel = c)

    // Fallback polling
    const interval = setInterval(async () => {
      try {
        const token = (await supabase.auth.getSession()).data.session?.access_token
        const res = await fetch(`/api/call_queue/poll?id=${latestRowId}&t=${Date.now()}`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'x-echo-user-id': currentUser?.id || '',
            'x-echo-user-email': currentUser?.email || '',
          },
          cache: 'no-store'
        })
        if (res.ok) {
          const { data } = await res.json()
          if (data?.status === 'accepted' || data?.status === 'in_consultation') {
            setStatus('accepted')
            clearInterval(interval)
            navigate('/app/patient-live', { state: { sessionKey: latestRowId, callType: selectedMode, minutes, source: 'wait-screen' } })
          }
        }
      } catch (e) {}
    }, 3000)

    return () => {
      if (channel) supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [latestRowId, selectedMode, minutes, navigate])

  return (
    <Screen>
      <Wrap>
        {!latestRowId ? (
          <>
            <LoadingSpinner />
            <Title>Processing Clinical Summary...</Title>
            <Subtitle>Please wait a few moments while our AI finalizes your clinical brief.</Subtitle>
          </>
        ) : !selectedMode ? (
          <>
            <Title>Payment Successful!</Title>
            <Subtitle>How would you like to connect with the clinician for your {minutes}-minute session?</Subtitle>
            
            <ModeGrid>
              <ModeButton onClick={() => setSelectedMode('video')}>
                <VideoIcon />
                Video Call
              </ModeButton>
              <ModeButton onClick={() => setSelectedMode('voice')}>
                <VoiceIcon />
                Voice Call
              </ModeButton>
            </ModeGrid>
          </>
        ) : (
          <>
            {status === 'waiting' ? (
              <>
                <LoadingSpinner />
                <Title>Routing to a Healthcare Professional</Title>
                <Subtitle>Your clinical summary is ready. We are connecting you to the next available provider.</Subtitle>
              </>
            ) : (
              <>
                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>✅</div>
                <Title>Clinician Accepted!</Title>
                <Subtitle>Connecting you to the consultation room...</Subtitle>
              </>
            )}

            <ConsultDetails>
              <DetailRow>
                <span style={{ color: '#64748b' }}>Type</span>
                <span style={{ textTransform: 'capitalize' }}>{selectedMode} Call</span>
              </DetailRow>
              <DetailRow>
                <span style={{ color: '#64748b' }}>Duration</span>
                <span>{minutes} Minutes</span>
              </DetailRow>
            </ConsultDetails>
          </>
        )}
      </Wrap>
    </Screen>
  )
}
