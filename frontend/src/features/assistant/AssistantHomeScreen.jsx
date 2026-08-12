import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import { AuthGateModal } from './AuthGateModal'
import { vapiService, startVapiSession } from './services/vapiService'
import { useAuth } from '../../features/auth/context/useAuth'

const micPulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(198, 40, 40, 0.44); transform: scale(1); }
  70% { box-shadow: 0 0 0 60px rgba(198, 40, 40, 0); transform: scale(1.03); }
  100% { box-shadow: 0 0 0 0 rgba(198, 40, 40, 0); transform: scale(1); }
`

const Background = styled.div`
  width: 100%;
  min-height: 100vh;
  background: radial-gradient(circle at center, ${({ theme }) => (theme.mode === 'dark' ? '#1f0d11' : '#fce4e6')}, ${({ theme }) => theme.colors.bg});
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
`

const OrbContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40px;
`

const GlowingRingWrap = styled.button`
  width: 320px;
  height: 320px;
  border-radius: 50%;
  border: 0;
  background: transparent;
  position: relative;
  display: grid;
  place-items: center;
  cursor: pointer;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    padding: 18px; /* Bolder ring */
    background: ${({ theme }) => theme?.mode === 'dark' 
      ? 'linear-gradient(135deg, #00f2fe, #4facfe, #f093fb, #f5576c)' 
      : 'linear-gradient(135deg, #ff7b9a, #9c6bff, #ffcfdf)'};
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    transition: opacity 0.3s;
    opacity: ${({ $listening }) => $listening ? 1 : 0.3};
  }
  
  &::after {
    content: '';
    position: absolute;
    inset: -30px;
    border-radius: 50%;
    background: ${({ theme }) => theme?.mode === 'dark' 
      ? 'radial-gradient(circle, rgba(0,242,254,0.3) 0%, rgba(245,87,108,0.2) 60%, transparent 80%)' 
      : 'radial-gradient(circle, rgba(156,107,255,0.4) 0%, rgba(255,123,154,0.15) 60%, transparent 80%)'};
    z-index: -1;
    filter: blur(24px);
    opacity: ${({ $listening }) => $listening ? 1 : 0.15};
    transform: scale(${({ $scale }) => $scale});
    transition: opacity 0.3s, transform 0.1s linear;
  }
`

const CenterBars = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`

const CenterBar = styled.div`
  width: 14px;
  height: ${({ $h }) => $h * 1.5}px;
  border-radius: 7px;
  background: #dc2626;
  transition: height 0.1s linear;
`

const StatusText = styled.h2`
  font-size: 2rem;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 16px;
  text-align: center;
  letter-spacing: -0.03em;
  z-index: 10;
`


const SubText = styled.p`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.muted};
  text-align: center;
  max-width: 400px;
  line-height: 1.5;
  z-index: 10;
`

const Header = styled.header`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 20;
`

const BackButton = styled.button`
  background: #dc2626;
  border: none;
  color: #ffffff;
  font-weight: 800;
  font-size: 0.95rem;
  padding: 10px 22px;
  border-radius: 999px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(220, 38, 38, 0.3);
  }
`

function MicIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 14a3 3 0 0 0 3-3V7a3 3 0 0 0-6 0v4a3 3 0 0 0 3 3Z" />
      <path d="M19 11a7 7 0 0 1-14 0" strokeLinecap="round" />
      <path d="M12 18v3" strokeLinecap="round" />
      <path d="M8 21h8" strokeLinecap="round" />
    </svg>
  )
}

function nowStamp() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function AssistantHomeScreen() {
  const navigate = useNavigate()
  const { isAuthenticated, currentUser } = useAuth()
  
  const [listening, setListening] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [volumeLevel, setVolumeLevel] = useState(0)
  const [gate, setGate] = useState(false)
  const [messages, setMessages] = useState([])
  const messagesRef = useRef([])

  const SAVE_WEBHOOK = process.env.NEXT_PUBLIC_N8N_VAPI_SAVE_WEBHOOK || 'https://n8n-ftwl.srv1798513.hstgr.cloud/webhook/vapi-save-dmk'
  const bars = useMemo(() => [24, 48, 32], [])

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  useEffect(() => {
    let mounted = true
    const vapi = vapiService.getVapiInstance()

    const onCallStart = () => {
      if (!mounted) return
      setListening(true)
      setConnecting(false)
      setMessages([{ id: 'init', who: 'ai', text: "Hello! I'm EchoAI. How can I help you?", ts: nowStamp() }])
    }

    const onCallEnd = () => {
      if (!mounted) return
      fetch(SAVE_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messagesRef.current })
      }).catch(() => {})
      setListening(false)
      setConnecting(false)
      setVolumeLevel(0)
    }

    const onVolumeLevel = (level) => {
      if (mounted) setVolumeLevel(level)
    }

    const onMessage = (msg) => {
      if (!mounted) return
      if (msg.type === 'transcript' && msg.transcriptType === 'final') {
        const who = msg.role === 'assistant' ? 'ai' : 'user'
        setMessages(prev => [...prev, { id: `${who}-${Date.now()}-${Math.random()}`, who, text: msg.transcript, ts: nowStamp() }])
      }
    }

    const onError = (e) => {
      console.error('VAPI error:', e)
      setListening(false)
      setConnecting(false)
      setVolumeLevel(0)
    }

    vapi.on('call-start', onCallStart)
    vapi.on('call-end', onCallEnd)
    vapi.on('volume-level', onVolumeLevel)
    vapi.on('message', onMessage)
    vapi.on('error', onError)

    return () => {
      mounted = false
      vapi.off('call-start', onCallStart)
      vapi.off('call-end', onCallEnd)
      vapi.off('volume-level', onVolumeLevel)
      vapi.off('message', onMessage)
      vapi.off('error', onError)
      try { vapi.stop() } catch (err) {}
    }
  }, [])

  useEffect(() => {
    let timerId = null;
    if (listening && !isAuthenticated) {
      timerId = setTimeout(() => {
        try { vapiService.getVapiInstance().stop() } catch(e) {}
        setGate(true);
      }, 60000);
    }
    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [listening, isAuthenticated]);

  const toggleCall = async () => {
    if (listening) {
      try { vapiService.getVapiInstance().stop() } catch(e) {}
      setListening(false)
      return
    }
    if (connecting) return

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
      const vapi = vapiService.getVapiInstance()
      setConnecting(true)
      startVapiSession(vapi, currentUser)
    } catch (err) {
      console.error('Start error:', err)
      setConnecting(false)
    }
  }

  const scale = listening ? 1 + volumeLevel * 1.5 : 1

  return (
    <Background>
      <Header>
        <BackButton onClick={() => navigate('/')}>
          <span aria-hidden="true">{'<'}</span> Back
        </BackButton>
      </Header>

      <OrbContainer>
        <GlowingRingWrap type="button" onClick={toggleCall} aria-label="Start listening" $listening={listening || connecting} $scale={scale} disabled={connecting}>
          <CenterBars aria-hidden="true">
            {bars.map((h, i) => (
              <CenterBar key={i} $h={connecting ? 12 : listening ? h + (volumeLevel * 30) : h} />
            ))}
          </CenterBars>
        </GlowingRingWrap>
      </OrbContainer>

      <StatusText>
        {connecting ? 'Connecting...' : listening ? 'EchoAI is listening...' : 'Tap to speak to EchoAI'}
      </StatusText>

      <SubText>
        {listening
          ? 'Speak naturally about your symptoms. I will analyze them and connect you to the right care.'
          : ''}
      </SubText>

      <AuthGateModal
        isOpen={gate}
        nextPage="voice"
        message="Your 1-minute free preview has ended. Create a free account to continue your session with a verified clinician."
        onClose={() => setGate(false)}
        onLogin={(next) => navigate('/login', { state: { next } })}
        onSignup={(next) => navigate('/signup', { state: { next } })}
      />
    </Background>
  )
}
