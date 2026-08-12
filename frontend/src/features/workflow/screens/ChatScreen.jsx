import { useEffect, useMemo, useRef, useState, useContext } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { InPageMenuButton } from '../components/InPageMenuButton'
import { Screen } from './ScreenPrimitives'
import { showAssistant } from '../components/AssistantCharacterOverlay'
import { AuthContext } from '../../auth/context/AuthContext'

const Wrap = styled.section`
  width: 100%;
  min-height: 100%;
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'linear-gradient(180deg, rgba(9,17,31,1) 0%, rgba(15,23,42,1) 100%)'
      : 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(250,251,252,1) 100%)'};
  box-shadow: 0 16px 34px rgba(15, 31, 68, 0.12);
  overflow: hidden;
  display: grid;
  grid-template-rows: auto 1fr auto;
`

const Header = styled.header`
  padding: 12px 14px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 10px;
  background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.02)')};
`

const BackBtn = styled.button`
  justify-self: start;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 0;
  background: transparent;
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 900;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 12px;

  svg {
    width: 18px;
    height: 18px;
  }

  @media (hover: hover) {
    &:hover {
      background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.05)')};
      color: ${({ theme }) => theme.colors.text};
    }
  }
`

const CenterTitle = styled.div`
  justify-self: center;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 1000;
  letter-spacing: -0.02em;
`

const EchoAI = styled.span`
  font-weight: 1000;
`

const Status = styled.span`
  justify-self: end;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  padding: clamp(6px, 1.5vw, 8px) clamp(8px, 2vw, 12px);
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-weight: 900;
  font-size: clamp(0.75rem, 2.5vw, 0.92rem);

  &::before {
    content: '';
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: ${({ theme }) => theme.colors.success};
    box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.16);
  }
`

const Messages = styled.div`
  padding: 14px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const Group = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: ${({ $who }) => ($who === 'user' ? 'flex-end' : 'flex-start')};
`

const Bubble = styled.div`
  max-width: min(560px, 92%);
  padding: clamp(10px, 2vw, 12px) clamp(10px, 2.5vw, 14px);
  border-radius: 16px;
  line-height: 1.6;
  white-space: pre-wrap;
  font-size: clamp(0.85rem, 3vw, 0.98rem);

  ${({ $who, theme }) =>
    $who === 'user'
      ? `
    background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryDeep} 100%);
    color: #fff;
    border-top-right-radius: 6px;
  `
      : `
    background: ${theme.mode === 'dark' ? 'rgba(0,201,167,0.10)' : 'rgba(15, 23, 42, 0.04)'};
    border: 1px solid ${theme.mode === 'dark' ? 'rgba(0,201,167,0.22)' : 'rgba(15, 23, 42, 0.06)'};
    color: ${theme.colors.text};
    border-top-left-radius: 6px;
  `}
`

const Meta = styled.div`
  width: min(560px, 92%);
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 0 8px;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.82rem;
`

const Footer = styled.footer`
  padding: 12px 14px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.02)')};
`

const Form = styled.form`
  display: flex;
  gap: 10px;
`

const pulse = `
  0% { box-shadow: 0 0 0 0 rgba(198, 40, 40, 0.44); transform: scale(1); }
  70% { box-shadow: 0 0 0 16px rgba(198, 40, 40, 0); transform: scale(1.03); }
  100% { box-shadow: 0 0 0 0 rgba(198, 40, 40, 0); transform: scale(1); }
`

const Input = styled.input`
  flex: 1;
  border-radius: 999px;
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  padding: 12px 14px;
  font-weight: 750;
  outline: none;
  color: ${({ theme }) => theme.colors.text};

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.glowRed};
  }
`

const MicButton = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 18px rgba(220, 38, 38, 0.22);
  animation: eeChatMicPulse 1.8s ease-out infinite;

  @keyframes eeChatMicPulse {
    ${pulse}
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`

const Send = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  cursor: pointer;
  font-weight: 1000;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 18px;
    height: 18px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const ThinkingDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary};
  animation: eeChatTyping 1.4s infinite ease-in-out both;
  
  &:nth-child(1) { animation-delay: -0.32s; }
  &:nth-child(2) { animation-delay: -0.16s; }

  @keyframes eeChatTyping {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
  }
`

function nowStamp() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function ArrowLeft() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ArrowUp() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 19V5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function MicIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 14a3 3 0 0 0 3-3V7a3 3 0 0 0-6 0v4a3 3 0 0 0 3 3Z" />
      <path d="M19 11a7 7 0 0 1-14 0" strokeLinecap="round" />
      <path d="M12 18v3" strokeLinecap="round" />
      <path d="M8 21h8" strokeLinecap="round" />
    </svg>
  )
}

const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_CHAT_WEBHOOK || 'https://n8n-ftwl.srv1798513.hstgr.cloud/webhook/ee-chat-agent'

export default function ChatScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const endRef = useRef(null)
  const { currentUser } = useContext(AuthContext)

  const seedText = useMemo(() => {
    const raw = location.state && location.state.seed
    return raw ? String(raw) : ''
  }, [location.state])

  const [activeSessionId, setActiveSessionId] = useState(null)
  const chatSessionId = useMemo(() => `chat-${Date.now()}-${Math.floor(Math.random() * 1000)}`, [])

  const [messages, setMessages] = useState([
    {
      id: 'm1',
      who: 'ai',
      ts: nowStamp(),
      text: "Hello! I'm EchoAI, your personal health assistant. What health concern do you have today? You can type or speak - I'm here to help.",
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const hasSentSeed = useRef(false)

  const sendMessageToN8n = async (text) => {
    if (!text.trim()) return

    const userMessage = { id: `u-${Date.now()}`, who: 'user', ts: nowStamp(), text }
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message:        text,
          user_id:        currentUser?.user_id || currentUser?.id,
          submission_key: currentUser?.echo_id || currentUser?.submission_key,
          session_id:     activeSessionId,
          full_name:      currentUser?.fullName || currentUser?.full_name || 'Patient',
          first_name:     (currentUser?.fullName || currentUser?.full_name || 'Patient').split(' ')[0],
          sessionId:      chatSessionId
        }),
      })

      const data = await response.json()
      
      const aiResponseText = data.reply || data.output || data.text || data.message || "I encountered an error connecting to my brain. Please try again."

      // Safely extract active session_id if it's returned by n8n tool calls
      let extractedSessionId = activeSessionId
      if (data.session_id) {
        extractedSessionId = data.session_id
      } else if (data.intermediateSteps && Array.isArray(data.intermediateSteps)) {
        for (const step of data.intermediateSteps) {
          const observation = step.observation
          if (observation) {
            try {
              const obsObj = typeof observation === 'string' ? JSON.parse(observation) : observation
              if (obsObj && obsObj.session_id) {
                extractedSessionId = obsObj.session_id
                break
              }
            } catch (e) {
              if (typeof observation === 'string') {
                const match = observation.match(/"session_id"\s*:\s*"([^"]+)"/)
                if (match && match[1]) {
                  extractedSessionId = match[1]
                  break
                }
              }
            }
          }
        }
      }

      if (extractedSessionId && extractedSessionId !== activeSessionId) {
        setActiveSessionId(extractedSessionId)
      }

      setMessages((prev) => [
        ...prev,
        { id: `ai-${Date.now()}`, who: 'ai', ts: nowStamp(), text: aiResponseText },
      ])
      
      const triggerPhrases = [
        'questions_complete',
        'please hold',
        'connecting you',
        'triage complete',
        'see a doctor',
        'speak to a doctor',
        'consult a doctor',
        'recommend a doctor',
        'escalating',
        'i will connect',
        "i'll connect",
        'connecting to a clinician',
        'routing you',
      ]
      const lowerResponse = aiResponseText.toLowerCase()
      const shouldEscalate = triggerPhrases.some((phrase) => lowerResponse.includes(phrase))

      if (shouldEscalate) {
        try { showAssistant({ title: 'EchoAI', message: 'Triage complete. Connecting you to a clinician now.', avatar: 'doctor' }) } catch {}
        const symptomSeed = messages.filter(m => m.who === 'user').map(m => m.text).join('; ')
        setTimeout(() => navigate('/app/consultation-mode', {
          state: { symptoms: symptomSeed, aiSummary: aiResponseText }
        }), 2500)
      }

    } catch (err) {
      console.error(err)
      setMessages((prev) => [
        ...prev,
        { id: `ai-err-${Date.now()}`, who: 'ai', ts: nowStamp(), text: "I'm having trouble connecting right now." },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // Handle seed text (e.g. user clicked "Vomiting" on homescreen)
  useEffect(() => {
    if (seedText && !hasSentSeed.current) {
      hasSentSeed.current = true
      sendMessageToN8n(seedText)
    }
  }, [seedText])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const onSubmit = (e) => {
    e.preventDefault()
    if (isLoading) return
    const text = input
    setInput('')
    sendMessageToN8n(text)
  }

  return (
    <Screen>
      <Wrap>
        <Header>
          <BackBtn type="button" onClick={() => navigate('/app/home')}>
            <ArrowLeft />
            Back
          </BackBtn>

          <CenterTitle>
            <EchoAI>EchoAI</EchoAI>
          </CenterTitle>

          <Status>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              <InPageMenuButton />
              Live
            </span>
          </Status>
        </Header>

        <Messages>
          {messages.map((m) => (
            <Group key={m.id} $who={m.who}>
              <Bubble $who={m.who}>{m.text}</Bubble>
              <Meta>
                <span>{m.who === 'ai' ? 'ECHOAI' : 'You'}</span>
                <span>{m.ts}</span>
              </Meta>
            </Group>
          ))}

          {isLoading && (
            <Group $who="ai">
              <Bubble $who="ai" style={{ display: 'flex', gap: '4px', alignItems: 'center', height: '24px' }}>
                <ThinkingDot />
                <ThinkingDot />
                <ThinkingDot />
              </Bubble>
            </Group>
          )}

          <div ref={endRef} />
        </Messages>

        <Footer>
          <Form onSubmit={onSubmit}>
            <Input
              aria-label="Message input"
              placeholder="Type your message..."
              value={input}
              disabled={isLoading}
              onChange={(e) => setInput(e.target.value)}
            />
            <MicButton aria-label="Open voice assistant" type="button" onClick={() => navigate('/app/voice-ai')}>
              <MicIcon />
            </MicButton>
            <Send disabled={!input.trim() || isLoading} type="submit" aria-label="Send">
              <ArrowUp />
            </Send>
          </Form>
        </Footer>
      </Wrap>
    </Screen>
  )
}
