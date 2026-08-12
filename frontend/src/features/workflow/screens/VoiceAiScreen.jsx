import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import { Screen } from './ScreenPrimitives'
import { vapiService, startVapiSession } from '../../assistant/services/vapiService'
import { useAuth } from '../../auth/context/useAuth'
import { CallTypeSheetModal } from '../components/CallTypeSheetModal'
import { showAssistant } from '../components/AssistantCharacterOverlay'

const Shell = styled(Screen)`
  min-height: 100%;
  display: grid;
  grid-template-rows: auto 1fr auto;
  background:
    radial-gradient(circle at 18% 0%, rgba(220, 38, 38, 0.08), transparent 20%),
    radial-gradient(circle at 88% 10%, rgba(59, 130, 246, 0.06), transparent 18%),
    ${({ theme }) => (theme?.mode === 'dark' ? '#0f111a' : '#fcfcfc')};
  position: relative;
  overflow: hidden;

  @media (max-width: 640px) {
    padding-bottom: 24px;
  }
`

const TopBar = styled.header`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 16px 20px;
  z-index: 20;
`

const TopBrand = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 800;
  color: ${({ theme }) => theme?.colors?.text || '#111'};
  font-size: 1.05rem;
`

const TopBrandIcon = styled.div`
  width: 26px;
  height: 26px;
  border-radius: 8px;
  background: #dc2626;
  display: grid;
  place-items: center;
  color: #fff;
`

const OptionsButton = styled.button`
  position: absolute;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme?.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
  background: transparent;
  color: ${({ theme }) => theme?.colors?.text || '#111'};
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: background 0.2s;

  &:hover {
    background: ${({ theme }) => theme?.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'};
  }
`

// View 1: Glowing Circle
const CenterCircleView = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32px;
  height: 100%;
  z-index: 10;
  padding: 18px 14px 24px;

  @media (min-width: 900px) {
    justify-content: space-evenly;
  }
`

const GlowingRingWrap = styled.button`
  width: min(280px, 72vw);
  height: min(280px, 72vw);
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
    padding: 12px;
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
  gap: 8px;
  align-items: center;
`

const CenterBar = styled.div`
  width: 8px;
  height: ${({ $h }) => $h}px;
  border-radius: 4px;
  background: ${({ theme }) => theme?.mode === 'dark' ? '#fff' : '#dc2626'};
  transition: height 0.1s linear;
`

const StatusText = styled.div`
  text-align: center;
  display: grid;
  gap: 14px;
  max-width: 520px;
`

const StatusHeading = styled.h2`
  margin: 0;
  font-size: 1.6rem;
  font-weight: 800;
  color: ${({ theme }) => theme?.colors?.text || '#111'};
`

const StatusSub = styled.p`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme?.colors?.muted || '#666'};
`

// Bottom Controls
const BottomControls = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  z-index: 20;
  padding: 0 14px 14px;
`

const PillButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 16px 32px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme?.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.06)'};
  background: ${({ theme }) => theme?.colors?.surface || '#fff'};
  color: ${({ theme }) => theme?.colors?.text || '#111'};
  font-weight: 800;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 12px 32px rgba(0,0,0,0.06);
  transition: transform 100ms, box-shadow 100ms;

  &:active {
    transform: translateY(2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.04);
  }
`

const PillIcon = styled.span`
  color: #dc2626;
  display: grid;
  place-items: center;
`

// View 2: Chat Mode
const ChatView = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  gap: 24px;
  overflow-y: auto;
  z-index: 10;
  height: 100%;
`

const ChatCard = styled.div`
  background: ${({ theme, $isAi }) => $isAi 
    ? (theme?.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#ffffff') 
    : (theme?.mode === 'dark' ? 'rgba(220, 38, 38, 0.08)' : '#fffafa')};
  border: 1px solid ${({ theme, $isAi }) => $isAi 
    ? (theme?.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)') 
    : (theme?.mode === 'dark' ? 'rgba(220, 38, 38, 0.15)' : 'rgba(220, 38, 38, 0.08)')};
  border-radius: 28px;
  padding: 28px 24px;
  box-shadow: 0 16px 40px rgba(0,0,0,0.03);
  width: 100%;
  max-width: 540px;
  margin: 0 auto;
  
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`

const ChatAvatar = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 999px;
  background: ${({ theme, $isAi }) => $isAi 
    ? (theme?.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#f1f5f9')
    : (theme?.mode === 'dark' ? 'rgba(220, 38, 38, 0.2)' : '#fee2e2')};
  color: #dc2626;
  display: grid;
  place-items: center;
`

const ChatTitle = styled.div`
  font-weight: 900;
  font-size: 1.05rem;
  color: ${({ theme }) => theme?.colors?.text || '#111'};
`

const ChatText = styled.div`
  font-size: 1.15rem;
  line-height: 1.6;
  font-weight: 700;
  color: ${({ theme }) => theme?.colors?.text || '#111'};
`

const ProcessingText = styled.div`
  font-size: 0.9rem;
  font-weight: 800;
  color: #dc2626;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  animation: pulseOpacity 1.5s infinite;

  @keyframes pulseOpacity {
    0% { opacity: 0.5; }
    50% { opacity: 1; }
    100% { opacity: 0.5; }
  }
`

const waveFloat = keyframes`
  0% { transform: translateY(0px); opacity: 0.85; }
  50% { transform: translateY(-12px); opacity: 1; }
  100% { transform: translateY(0px); opacity: 0.85; }
`

const BottomWaveWrap = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 340px;
  display: flex;
  align-items: flex-end;
  pointer-events: none;
  z-index: 1;
`

const Footer = styled.footer`
  width: 100%;
  max-width: 540px;
  padding: 0 20px;
  z-index: 20;
`

const Form = styled.form`
  display: flex;
  gap: 10px;
`

const Input = styled.input`
  flex: 1;
  border-radius: 999px;
  border: 1.5px solid ${({ theme }) => theme?.colors?.border || '#e5e7eb'};
  background: ${({ theme }) => theme?.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#fff'};
  padding: 14px 20px;
  font-weight: 600;
  outline: none;
  color: ${({ theme }) => theme?.colors?.text || '#111'};
  font-size: 1rem;
  box-shadow: 0 8px 24px rgba(0,0,0,0.04);
  transition: border-color 0.2s;

  &:focus {
    border-color: ${({ theme }) => theme?.colors?.primary || '#dc2626'};
  }
  &:disabled {
    opacity: 0.6;
  }
`

const Send = styled.button`
  width: 50px;
  height: 50px;
  border-radius: 999px;
  border: 0;
  background: ${({ theme }) => theme?.colors?.primary || '#dc2626'};
  color: #fff;
  cursor: pointer;
  font-weight: 1000;
  display: grid;
  place-items: center;
  box-shadow: 0 8px 24px rgba(220, 38, 38, 0.2);

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const WaveSvg = styled.svg`
  width: 100%;
  height: 100%;
  opacity: ${({ $active }) => $active ? 1 : 0};
  transition: opacity 1s;

  path {
    animation: ${waveFloat} 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
`

function IconUser() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function IconBot() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 2v2" strokeLinecap="round" />
      <path d="M6 10a6 6 0 0 1 12 0v3H6v-3Z" />
      <path d="M5 13h14l-1 7H6l-1-7Z" />
      <path d="M9 22h6" strokeLinecap="round" />
    </svg>
  )
}

function IconX() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
    </svg>
  )
}

function IconDots() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  )
}

function nowStamp() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function VoiceAiScreen() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const endRef = useRef(null)
  const [listening, setListening] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [volumeLevel, setVolumeLevel] = useState(0)
  const [showCallType, setShowCallType] = useState(false)

  // Use the length of messages to determine view state
  const hasMessages = messages.filter(m => m.who === 'user' || m.text.length > 30).length > 0

  const bars = useMemo(() => [24, 42, 28], [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    let mounted = true
    const vapi = vapiService.getVapiInstance()

    const onCallStart = () => {
      if (!mounted) return
      setListening(true)
      setIsConnecting(false)
    }

    const onCallEnd = async () => {
      if (!mounted) return
      setListening(false)
      setIsConnecting(false)
      setIsSpeaking(false)
      setVolumeLevel(0)
    }

    const onSpeechStart = () => setIsSpeaking(true)
    const onSpeechEnd = () => setIsSpeaking(false)

    const onVolumeLevel = (level) => {
      if (mounted) setVolumeLevel(level)
    }

    const onMessage = (msg) => {
      if (!mounted) return
      if (msg.type === 'transcript' && msg.transcriptType === 'final') {
        const who = msg.role === 'assistant' ? 'ai' : 'user'
        setMessages(prev => [...prev, { id: `${who}-${Date.now()}-${Math.random()}`, who, text: msg.transcript }])
      }
      
      if (msg.type === 'tool-calls') {
        const calls = msg.toolWithToolCallList || msg.toolCalls || []
        const isFinalizing = calls.some(t => {
          const name = t.toolCall?.function?.name || t.function?.name
          return name === 'finalize_triage'
        })
        if (isFinalizing) {
          // Allow the AI a brief moment to say goodbye before ending the session automatically
          setTimeout(() => {
            try { vapi.stop() } catch(e) {}
            setListening(false)
            setIsConnecting(false)
            setVolumeLevel(0)
            navigate('/app/payment', { state: { returnTo: 'doctor-wait', fromTriage: true } })
          }, 3000)
        }
      }
    }

    const onError = (e) => {
      console.error('VAPI error:', e)
      if (mounted) {
        setMessages(prev => [...prev, { id: `err-${Date.now()}`, who: 'ai', text: "Connection error. Please try again." }])
        setListening(false)
        setIsConnecting(false)
        setVolumeLevel(0)
      }
    }

    vapi.on('call-start', onCallStart)
    vapi.on('call-end', onCallEnd)
    vapi.on('speech-start', onSpeechStart)
    vapi.on('speech-end', onSpeechEnd)
    vapi.on('volume-level', onVolumeLevel)
    vapi.on('message', onMessage)
    vapi.on('error', onError)

    return () => {
      mounted = false
      vapi.off('call-start', onCallStart)
      vapi.off('call-end', onCallEnd)
      vapi.off('speech-start', onSpeechStart)
      vapi.off('speech-end', onSpeechEnd)
      vapi.off('volume-level', onVolumeLevel)
      vapi.off('message', onMessage)
      vapi.off('error', onError)
      try {
        vapi.stop()
      } catch (err) {
        // ignore
      }
    }
  }, [])

  const start = async () => {
    if (listening || isConnecting) return
    try {
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true })
      
      setIsConnecting(true)
      const vapi = vapiService.getVapiInstance()
      setMessages([])
      startVapiSession(vapi, currentUser)
    } catch (err) {
      console.error('Vapi start error:', err)
      setIsConnecting(false)
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        who: 'ai',
        text: `Could not start session: ${err?.message || 'Unknown error'}. Please check your connection and try again.`,
      }])
    }
  }

  const sendUserMessage = (e) => {
    e.preventDefault()
    const cleaned = input.trim()
    if (!cleaned || !listening) return

    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, who: 'user', ts: nowStamp(), text: cleaned }])
    setInput('')

    try {
      const vapi = vapiService.getVapiInstance()
      vapi.send({
        type: "add-message",
        message: {
          role: "user",
          content: cleaned
        }
      })
    } catch(err) {
      console.error("Failed to send message to Vapi:", err)
    }
  }

  const stop = () => {
    try {
      vapiService.getVapiInstance().stop()
    } catch (err) {
      // ignore
    }
    setListening(false)
    setVolumeLevel(0)
    setShowCallType(true)
  }

  const handlePickCallType = (type) => {
    setShowCallType(false)
    if (type === 'voice') {
      try {
        showAssistant({
          title: 'Voice Call Selected',
          message: 'Please note: during a voice call, you will not be able to share your screen or use your camera to show physical symptoms.',
          avatar: 'nurse',
          durationMs: 8000,
          tone: 'warning'
        })
      } catch (err) {
        // ignore
      }
    }
    
    // Slight delay so the user sees the assistant popup start
    window.setTimeout(() => {
      navigate('/app/doctor-live', { state: { callType: type, source: 'voice-session' } })
    }, 500)
  }

  return (
    <Shell>
      <CallTypeSheetModal
        isOpen={showCallType}
        title="Session preference"
        message="Would you like to connect with the doctor via Voice or Video?"
        onClose={() => navigate('/app/home')}
        onPick={handlePickCallType}
      />
      <TopBar>
        <TopBrand>
          <TopBrandIcon>
            <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
            </svg>
          </TopBrandIcon>
          Echo AI
        </TopBrand>
        <OptionsButton type="button" aria-label="Options">
          <IconDots />
        </OptionsButton>
      </TopBar>

      <CenterCircleView>
        <GlowingRingWrap type="button" onClick={start} aria-label="Start listening" $listening={listening || isConnecting} $scale={1 + (volumeLevel * 0.5)} disabled={isConnecting}>
          <CenterBars aria-hidden="true">
            {bars.map((h, i) => (
              <CenterBar key={i} $h={isConnecting ? 12 : h + (volumeLevel * 30)} />
            ))}
          </CenterBars>
        </GlowingRingWrap>
        <StatusText>
          <StatusHeading>
            {isConnecting ? 'Connecting...' : isSpeaking ? 'Speaking...' : listening ? 'Listening...' : 'Tap to speak to EchoAI'}
          </StatusHeading>
          <StatusSub>
            {isConnecting ? 'Initializing Voice AI' : listening ? 'Speak naturally about your symptoms. I will analyze them and connect you to the right care.' : ''}
          </StatusSub>
        </StatusText>
      </CenterCircleView>

      {hasMessages && (
        <BottomWaveWrap aria-hidden="true">
          <WaveSvg viewBox="0 0 1200 120" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" $active={listening}>
            <defs>
              <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(240, 147, 251, 0.4)" />
                <stop offset="100%" stopColor="rgba(245, 87, 108, 0.1)" />
              </linearGradient>
              <linearGradient id="waveGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(0, 242, 254, 0.3)" />
                <stop offset="100%" stopColor="rgba(79, 172, 254, 0.1)" />
              </linearGradient>
            </defs>
            <path
              d="M0,60 Q150,20 300,60 T600,60 T900,60 T1200,60 L1200,120 L0,120 Z"
              fill="url(#waveGrad1)"
            />
            <path
              d="M0,70 Q150,40 300,70 T600,70 T900,70 T1200,70"
              stroke="url(#waveGrad2)"
              strokeWidth="2"
              fill="none"
              opacity="0.9"
            />
          </WaveSvg>
        </BottomWaveWrap>
      )}

      <BottomControls>
        {hasMessages && (
          <Footer>
            <Form onSubmit={sendUserMessage}>
              <Input
                aria-label="Message input"
                placeholder={listening ? 'Type a message...' : 'Connect to chat...'}
                value={input}
                disabled={!listening}
                onChange={(e) => setInput(e.target.value)}
              />
              <Send disabled={!input.trim() || !listening} type="submit" aria-label="Send">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Send>
            </Form>
          </Footer>
        )}
        <PillButton type="button" onClick={stop}>
          <PillIcon aria-hidden="true">
            <IconX />
          </PillIcon>
          End session
        </PillButton>
      </BottomControls>
    </Shell>
  )
}
