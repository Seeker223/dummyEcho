import { useEffect, useMemo, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { assistantAvatars, pickPatientAvatar } from '../../assistant/assistantAvatars'

const slideIn = keyframes`
  from { transform: translateX(120%); opacity: 0; }
  to { transform: translateX(0%); opacity: 1; }
`

const slideOut = keyframes`
  from { transform: translateX(0%); opacity: 1; }
  to { transform: translateX(120%); opacity: 0; }
`

const Wrap = styled.div`
  position: fixed;
  right: 12px;
  bottom: 92px;
  z-index: 1600;
  pointer-events: none;

  @media (max-width: 640px) {
    right: 10px;
    bottom: calc(88px + env(safe-area-inset-bottom));
  }
`

const Card = styled.div`
  width: min(320px, 88vw);
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  padding: 12px 12px;
  border-radius: 18px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(17, 24, 39, 0.92)' : 'rgba(255, 255, 255, 0.92)')};
  backdrop-filter: blur(10px);
  box-shadow: 0 18px 40px rgba(15, 31, 68, 0.18);
  animation: ${({ $leaving }) => ($leaving ? slideOut : slideIn)} 260ms ease both;
`

const Avatar = styled.img`
  width: 52px;
  height: 52px;
  border-radius: 999px;
  object-fit: cover;
  border: 2px solid ${({ theme }) => theme.colors.surface};
  box-shadow: 0 14px 24px rgba(15, 31, 68, 0.16);
`

const Body = styled.div`
  min-width: 0;
  display: grid;
  gap: 2px;
  align-content: center;
`

const Title = styled.p`
  margin: 0;
  font-weight: 1000;
  letter-spacing: -0.02em;
  font-size: 0.95rem;
`

const Text = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 650;
  font-size: 0.9rem;
  line-height: 1.35;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`

function avatarFor(payload) {
  const kind = payload?.avatar || 'nurse'
  if (kind === 'doctor') return assistantAvatars.doctor
  if (kind === 'patient') return pickPatientAvatar(payload?.seed || Date.now())
  return assistantAvatars.nurse
}

export function showAssistant(payload) {
  window.dispatchEvent(new CustomEvent('ee:assistant', { detail: payload || {} }))
}

export function AssistantCharacterOverlay() {
  const [state, setState] = useState(() => ({ open: false, leaving: false, payload: null }))

  const defaults = useMemo(
    () => ({
      title: 'EchoAI',
      message: 'How can I help?',
      durationMs: 5200,
      avatar: 'nurse',
    }),
    [],
  )

  useEffect(() => {
    let hideTimer = null
    let leaveTimer = null

    const onEvent = (event) => {
      const payload = { ...defaults, ...(event?.detail || {}) }

      if (hideTimer) window.clearTimeout(hideTimer)
      if (leaveTimer) window.clearTimeout(leaveTimer)

      setState({ open: true, leaving: false, payload })

      const duration = Math.max(1500, Number(payload.durationMs) || defaults.durationMs)
      hideTimer = window.setTimeout(() => {
        setState((prev) => (prev.open ? { ...prev, leaving: true } : prev))
        leaveTimer = window.setTimeout(() => {
          setState({ open: false, leaving: false, payload: null })
        }, 280)
      }, duration)
    }

    window.addEventListener('ee:assistant', onEvent)
    return () => {
      window.removeEventListener('ee:assistant', onEvent)
      if (hideTimer) window.clearTimeout(hideTimer)
      if (leaveTimer) window.clearTimeout(leaveTimer)
    }
  }, [defaults])

  if (!state.open || !state.payload) return null

  const avatarSrc = avatarFor(state.payload)

  return (
    <Wrap aria-live="polite" aria-atomic="true">
      <Card $leaving={state.leaving}>
        <Avatar alt="" src={avatarSrc} />
        <Body>
          <Title>{state.payload.title}</Title>
          <Text>{state.payload.message}</Text>
        </Body>
      </Card>
    </Wrap>
  )
}
