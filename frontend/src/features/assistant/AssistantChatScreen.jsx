import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { AuthGateModal } from './AuthGateModal'
import { assistantAvatars } from './assistantAvatars'
import { useAuth } from '../../features/auth/context/useAuth'

const Wrap = styled.section`
  width: 100%;
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 16px 34px rgba(15, 31, 68, 0.12);
  overflow: hidden;
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: min(72vh, 720px);
`

const Header = styled.header`
  padding: 14px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(0,0,0,0.12)' : 'rgba(0,0,0,0.02)')};
`

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`

const HeaderAvatar = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 999px;
  object-fit: cover;
  box-shadow: 0 12px 22px rgba(15, 31, 68, 0.16);
  border: 2px solid ${({ theme }) => theme.colors.surface};
`

const HeaderTitle = styled.div`
  min-width: 0;
  display: grid;
  gap: 2px;

  strong {
    font-weight: 1000;
    letter-spacing: -0.02em;
  }

  span {
    color: ${({ theme }) => theme.colors.muted};
    font-size: 0.9rem;
    line-height: 1.35;
  }
`

const StatusPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 8px 12px;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.surface};
`

const Dot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #22c55e;
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.16);
`

const Messages = styled.div`
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const BubbleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: ${({ $who }) => ($who === 'user' ? 'flex-end' : 'flex-start')};
`

const Bubble = styled.div`
  max-width: min(560px, 90%);
  padding: 12px 14px;
  border-radius: 16px;
  line-height: 1.6;
  white-space: pre-wrap;
  font-size: 0.98rem;

  ${({ $who, theme }) =>
    $who === 'user'
      ? `
    background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryDeep} 100%);
    color: #fff;
    border-top-right-radius: 6px;
  `
      : `
    background: ${theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15, 23, 42, 0.04)'};
    color: ${theme.colors.text};
    border-top-left-radius: 6px;
  `}
`

const Meta = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  width: min(560px, 90%);
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.82rem;
  padding: 0 8px;
`

const ChoiceRow = styled.div`
  width: min(560px, 90%);
  display: grid;
  gap: 10px;
  margin-top: 6px;
`

const ChoiceBtn = styled.button`
  border-radius: 14px;
  padding: 12px 14px;
  font-weight: 900;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  text-align: left;
  transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;

  @media (hover: hover) {
    &:hover {
      transform: translateY(-1px);
      border-color: ${({ theme }) => theme.colors.primary};
      box-shadow: 0 12px 20px rgba(15, 31, 68, 0.12);
    }
  }
`

const Footer = styled.footer`
  padding: 12px 14px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(0,0,0,0.12)' : 'rgba(0,0,0,0.02)')};
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
  padding: 12px 14px;
  font-weight: 700;
  outline: none;
  color: ${({ theme }) => theme.colors.text};

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.glowRed};
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

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

import { vapiService, startVapiSession } from './services/vapiService'

function nowStamp() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function AssistantChatScreen({ seedText = '' }) {
  const navigate = useNavigate()
  const { isAuthenticated, currentUser } = useAuth()
  const endRef = useRef(null)
  const [gate, setGate] = useState(null)
  
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  // Auto-scroll to bottom
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    let mounted = true
    const vapi = vapiService.getVapiInstance()
    
    setIsConnecting(true)
    try {
      startVapiSession(vapi, currentUser)
    } catch (err) {
      console.error('Failed to start Vapi:', err)
      if (mounted) setIsConnecting(false)
    }

    const onCallStart = () => {
      if (!mounted) return
      setIsConnecting(false)
      setIsConnected(true)
      setMessages([{ id: 'init', who: 'ai', text: "Hello! I'm EchoAI, your emergency health assistant.\n\nTell me what's happening. If something feels severe or sudden, please let me know.", ts: nowStamp() }])
    }

    const onCallEnd = () => {
      if (!mounted) return
      setIsConnected(false)
      setIsConnecting(false)
    }

    const onMessage = (msg) => {
      if (!mounted) return
      
      if (msg.type === 'tool-calls' || msg.type === 'function-call') {
        const calls = msg.toolCallList || msg.toolCalls?.toolCalls || msg.toolCalls || (msg.functionCall ? [msg] : [])
        
        // DEBUG: show what we received on the screen
        setMessages(prev => [...prev, { id: `dbg-${Date.now()}`, who: 'ai', text: `[DEBUG] Tool trigger received: ${JSON.stringify(calls)}`, ts: nowStamp() }])

        const isEscalation = calls.some((call) => {
          const name = call?.function?.name || call?.name || call?.functionCall?.name
          return name === 'escalate_to_doctor' || name === 'escalateToDoctor'
        })
        
        if (isEscalation) {
          setMessages(prev => [...prev, { id: `dbg-nav-${Date.now()}`, who: 'ai', text: `[DEBUG] Navigating to payment...`, ts: nowStamp() }])
          setTimeout(() => {
            try { 
              vapi.send({ type: 'control', control: 'stop' })
              vapi.stop() 
            } catch (err) {}
            navigate('/app/consultation-payment')
          }, 1500)
          return
        }
      }

      if (msg.type === 'transcript' && msg.transcriptType === 'final') {
        const who = msg.role === 'assistant' ? 'ai' : 'user'
        setMessages(prev => [...prev, { id: `${who}-${Date.now()}-${Math.random()}`, who, text: msg.transcript, ts: nowStamp() }])
      }
    }

    const onError = (e) => {
      console.error('VAPI error:', e)
      if (!mounted) return
      setIsConnecting(false)
      setMessages(prev => [...prev, { id: `err-${Date.now()}`, who: 'ai', text: "Connection error. Please try again.", ts: nowStamp() }])
    }

    vapi.on('call-start', onCallStart)
    vapi.on('call-end', onCallEnd)
    vapi.on('message', onMessage)
    vapi.on('error', onError)

    return () => {
      mounted = false
      vapi.off('call-start', onCallStart)
      vapi.off('call-end', onCallEnd)
      vapi.off('message', onMessage)
      vapi.off('error', onError)
      try {
        vapi.stop()
      } catch {
        // ignore error
      }
    }
  }, [])

  // Optional: If they clicked a suggestion chip before coming here, seed it
  useEffect(() => {
    if (seedText && isConnected) {
      sendUser(seedText)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected])

  useEffect(() => {
    let timerId = null;
    if (isConnected && !isAuthenticated) {
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
  }, [isConnected, isAuthenticated]);

  const sendUser = (text) => {
    const cleaned = String(text || '').trim()
    if (!cleaned || !isConnected) return
    
    // Add locally to UI
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, who: 'user', ts: nowStamp(), text: cleaned }])
    setInput('')
    
    // Send directly to Vapi context
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

  const onSubmit = (e) => {
    e.preventDefault()
    if (!isConnected) return
    sendUser(input)
  }

  return (
    <>
      <Wrap>
        <Header>
          <HeaderLeft>
            <HeaderAvatar alt="EchoAI assistant" src={assistantAvatars.nurse} />
            <HeaderTitle>
              <strong>EchoAI Chat</strong>
              <span>
                {isConnecting ? 'Connecting to EchoAI...' : isConnected ? 'Live. Your messages are not saved until you sign in.' : 'Disconnected.'}
              </span>
            </HeaderTitle>
          </HeaderLeft>
          {isConnected && (
            <StatusPill>
              <Dot />
              Live
            </StatusPill>
          )}
        </Header>

        <Messages>
          {messages.map((m) => (
            <BubbleGroup key={m.id} $who={m.who}>
              <Bubble $who={m.who}>{m.text}</Bubble>
              <Meta>
                <span>{m.who === 'ai' ? 'EchoAI' : 'You'}</span>
                <span>{m.ts}</span>
              </Meta>
            </BubbleGroup>
          ))}
          <div ref={endRef} />
        </Messages>

        <Footer>
          <Form onSubmit={onSubmit}>
            <Input
              aria-label="Message input"
              placeholder={isConnecting ? 'Connecting...' : !isConnected ? 'Disconnected' : 'Type your message...'}
              value={input}
              disabled={!isConnected || isConnecting}
              onChange={(e) => setInput(e.target.value)}
            />
            <Send disabled={!input.trim() || !isConnected || isConnecting} type="submit" aria-label="Send">
              ^
            </Send>
          </Form>
        </Footer>
      </Wrap>

      <AuthGateModal
        isOpen={Boolean(gate)}
        nextPage={gate === 'kit' ? 'kit' : 'voice'}
        message="Create a free account to keep your session history and get personalized care."
        avatarSrc={assistantAvatars.doctor}
        onClose={() => setGate(null)}
        onLogin={(next) => navigate('/login', { state: { next } })}
        onSignup={(next) => navigate('/signup', { state: { next } })}
      />
    </>
  )
}
