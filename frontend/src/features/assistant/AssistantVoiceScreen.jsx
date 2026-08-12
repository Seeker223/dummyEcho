import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import { AuthGateModal } from './AuthGateModal'
import { assistantAvatars } from './assistantAvatars'
import { vapiService, startVapiSession } from './services/vapiService'
import { useAuth } from '../../features/auth/context/useAuth'

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.34); transform: scale(1); }
  70% { box-shadow: 0 0 0 30px rgba(220, 38, 38, 0); transform: scale(1.02); }
  100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); transform: scale(1); }
`

const waveFloat = keyframes`
  0% { transform: translateY(0px); opacity: 0.85; }
  50% { transform: translateY(-8px); opacity: 1; }
  100% { transform: translateY(0px); opacity: 0.85; }
`

const Shell = styled.section`
  width: 100%;
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 16px 34px rgba(15, 31, 68, 0.12);
  overflow: hidden;
  display: grid;
  grid-template-rows: 1fr auto;
  min-height: min(72vh, 720px);
`

const Center = styled.div`
  display: grid;
  place-items: center;
  padding: 24px 18px 10px;
`

const Circle = styled.button`
  width: 170px;
  height: 170px;
  border-radius: 999px;
  border: 10px solid ${({ theme }) => (theme.mode === 'dark' ? '#432126' : '#f8d7da')};
  background: ${({ theme }) => theme.colors.surface};
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: transform 75ms linear, box-shadow 75ms linear;
  transform: scale(${({ $scale }) => $scale});
  box-shadow: 0 0 0 ${({ $scale }) => ($scale > 1 ? ($scale - 1) * 80 : 0)}px rgba(220, 38, 38, 0.2);
`

const Bars = styled.div`
  display: inline-flex;
  gap: 8px;
  align-items: center;
`

const Bar = styled.span`
  width: 6px;
  height: ${({ $h }) => $h}px;
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.primary};
`

const Label = styled.p`
  margin: 18px 0 0;
  font-weight: 1000;
  letter-spacing: -0.02em;
`

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 200px;
`

const BubbleGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${({ $who }) => ($who === 'user' ? 'flex-end' : 'flex-start')};
`

const Bubble = styled.div`
  max-width: 85%;
  padding: 12px 16px;
  border-radius: 16px;
  line-height: 1.5;
  font-size: 0.95rem;

  ${({ $who, theme }) =>
    $who === 'user'
      ? `
    background: ${theme.colors.primary};
    color: #fff;
    border-bottom-right-radius: 4px;
  `
      : `
    background: ${theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#f1f5f9'};
    color: ${theme.colors.text};
    border-bottom-left-radius: 4px;
  `}
`

const Footer = styled.footer`
  padding: 14px 18px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(0,0,0,0.15)' : '#fff')};
`

const Toast = styled.div`
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: ${({ theme, success, error }) => success ? theme.colors.success : error ? theme.colors.error : 'rgba(0,0,0,0.7)'};
  color: #fff;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.9rem;
  z-index: 1000;
`

const Form = styled.form`
  display: flex;
  gap: 10px;
`

const Input = styled.input`
  flex: 1;
  border-radius: 999px;
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  padding: 12px 16px;
  font-weight: 600;
  outline: none;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.95rem;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }
  &:disabled {
    opacity: 0.6;
  }
`

const Send = styled.button`
  width: 46px;
  height: 46px;
  border-radius: 999px;
  border: 0;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  cursor: pointer;
  font-weight: 1000;
  display: grid;
  place-items: center;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

function nowStamp() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function AssistantVoiceScreen() {
  const navigate = useNavigate()
  const { isAuthenticated, currentUser } = useAuth()
  const endRef = useRef(null)
  const [listening, setListening] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [volumeLevel, setVolumeLevel] = useState(0)
  const SAVE_WEBHOOK = process.env.NEXT_PUBLIC_N8N_VAPI_SAVE_WEBHOOK || 'https://n8n-ftwl.srv1798513.hstgr.cloud/webhook/vapi-save-dmk'
  const [gate, setGate] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null) // null | 'saving' | 'saved' | 'error'
  const messagesRef = useRef([])

  const bars = useMemo(() => [18, 34, 22], [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // keep latest messages in a ref for webhook payload
  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  // auto‑clear toast after a short delay
  useEffect(() => {
    if (saveStatus === 'saved' || saveStatus === 'error') {
      const timer = setTimeout(() => setSaveStatus(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [saveStatus])

  useEffect(() => {
    let mounted = true
    const vapi = vapiService.getVapiInstance()

    const onCallStart = () => {
      if (!mounted) return
      setListening(true)
      setConnecting(false)
      setMessages([{ id: 'init', who: 'ai', text: "Hello! I'm EchoAI, your emergency health assistant. How can I help you?", ts: nowStamp() }])
    }

    const onCallEnd = () => {
      if (!mounted) return
      setSaveStatus('saving')
      fetch(SAVE_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messagesRef.current })
      })
        .then(() => setSaveStatus('saved'))
        .catch(() => setSaveStatus('error'))
      setListening(false)
      setConnecting(false)
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
      if (msg.type === 'tool-calls' || msg.type === 'function-call') {
        const calls = msg.toolCallList || msg.toolCalls?.toolCalls || msg.toolCalls || (msg.functionCall ? [msg] : [])
        const isEscalation = calls.some((call) => {
          const name = call?.function?.name || call?.name || call?.functionCall?.name
          return name === 'escalate_to_doctor' || name === 'escalateToDoctor'
        })
        if (isEscalation) {
          try { 
            vapi.send({ type: 'control', control: 'stop' })
            vapi.stop() 
          } catch (err) {}
          navigate('/app/consultation-payment')
          return
        }
      }
      if (msg.type === 'transcript' && msg.transcriptType === 'final') {
        const who = msg.role === 'assistant' ? 'ai' : 'user'
        setMessages(prev => [...prev, { id: `${who}-${Date.now()}-${Math.random()}`, who, text: msg.transcript, ts: nowStamp() }])
      }
    }

    const onError = (e) => {
      console.error('VAPI error:', e);
      const msg = e?.message || 'Connection error. Please try again.';
      setMessages(prev => [...prev, { id: `err-${Date.now()}`, who: 'ai', text: msg, ts: nowStamp() }]);
      setSaveStatus(null);
      setListening(false);
      setConnecting(false);
      setVolumeLevel(0);
      // Show a toast with the error
      setSaveStatus('error');
    };

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

  useEffect(() => {
    let timerId = null;
    if (listening && !isAuthenticated) {
      // Limit unauthenticated users to 60 seconds
      timerId = setTimeout(() => {
        try { vapiService.getVapiInstance().stop() } catch(e) {}
        setGate(true);
        setMessages(prev => [...prev, { id: 'sys-time', who: 'ai', text: "Your 1-minute free preview has ended. Please sign up to continue.", ts: nowStamp() }]);
      }, 60000);
    }
    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [listening, isAuthenticated]);

  const start = async () => {
    if (listening) {
      stop()
      return
    }
    if (connecting) return // prevent double start
    try {
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true })
      const vapi = vapiService.getVapiInstance()
      setConnecting(true)
      setMessages([{ id: 'init', who: 'ai', text: "Connecting to Emergency Echo...", ts: nowStamp() }])
      startVapiSession(vapi, currentUser)
    } catch (err) {
      console.error('Start error:', err)
      setConnecting(false)
      // Show a toast with the error message
      setSaveStatus('error')
      setMessages(prev => [...prev, { id: `err-${Date.now()}`, who: 'ai', text: err?.message || 'Error starting call.', ts: nowStamp() }])
    }
  }

  const stop = () => {
    try {
      vapiService.getVapiInstance().stop()
    } catch (err) {
      // ignore
    }
    setListening(false)
    setConnecting(false)
    setVolumeLevel(0)
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

  return (
    <>
      <Shell>
        <Center>
          <Circle type="button" onClick={start} disabled={connecting} aria-label="Toggle listening" $scale={1 + (volumeLevel * 0.4)}>
            <Bars aria-hidden="true">
              {bars.map((h) => (
                <Bar key={h} $h={h + (volumeLevel * 20)} />
              ))}
            </Bars>
          </Circle>
          <Label>
            {connecting ? 'Connecting...' : isSpeaking ? 'Speaking...' : listening ? 'Listening...' : 'Tap to start'}
          </Label>
        </Center>

        {!listening && (
          <MessagesContainer>
            {messages.map((m) => (
              <BubbleGroup key={m.id} $who={m.who}>
                <Bubble $who={m.who}>{m.text}</Bubble>
              </BubbleGroup>
            ))}
            <div ref={endRef} />
          </MessagesContainer>
        )}

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
        {saveStatus === 'saving' && <Toast>Saving transcript...</Toast>}
        {saveStatus === 'saved' && <Toast success>Transcript saved.</Toast>}
        {saveStatus === 'error' && <Toast error>Failed to save transcript.</Toast>}
      </Shell>

      <AuthGateModal
        isOpen={gate}
        nextPage="voice"
        title="Create a free account to call a clinician"
        message="To connect to a verified clinician and keep your emergency session history, please create an account (or log in)."
        avatarSrc={assistantAvatars.doctor}
        onClose={() => setGate(false)}
        onLogin={(next) => navigate('/login', { state: { next } })}
        onSignup={(next) => navigate('/signup', { state: { next } })}
      />
    </>
  )
}
