import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppState } from '../app/context/useAppState'
import { useAuth } from '../features/auth/context/useAuth'
import { AssistantShell } from './AssistantShell'
import AssistantHomeScreen from '../features/assistant/AssistantHomeScreen'
import AssistantChatScreen from '../features/assistant/AssistantChatScreen'
import AssistantVoiceScreen from '../features/assistant/AssistantVoiceScreen'

function useSyncActivePage(pageId) {
  const { setActivePage } = useAppState()
  useEffect(() => {
    setActivePage(pageId)
  }, [pageId, setActivePage])
}

export function AssistantHomeRoute() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  useSyncActivePage('assistant')

  return (
    <AssistantShell
      actions={{
        primary: isAuthenticated
          ? { label: 'Open dashboard', onClick: () => navigate('/app') }
          : { label: 'Create account', onClick: () => navigate('/signup') },
        secondary: isAuthenticated ? null : { label: 'Log in', onClick: () => navigate('/login') },
      }}
      onLogoClick={() => navigate('/')}
      title="EchoAI Assistant"
    >
      <AssistantHomeScreen />
    </AssistantShell>
  )
}

export function AssistantChatRoute() {
  const navigate = useNavigate()
  const location = useLocation()

  useSyncActivePage('assistant-chat')

  return (
    <AssistantShell
      actions={{
        primary: { label: 'Create account', onClick: () => navigate('/signup') },
        secondary: { label: 'Log in', onClick: () => navigate('/login') },
      }}
      onBack={() => navigate('/assistant')}
      onLogoClick={() => navigate('/')}
      title="EchoAI Chat"
    >
      <AssistantChatScreen seedText={(location.state && location.state.seedText) || ''} />
    </AssistantShell>
  )
}

export function AssistantVoiceRoute() {
  const navigate = useNavigate()

  useSyncActivePage('assistant-voice')

  return (
    <AssistantShell
      actions={{
        primary: { label: 'Create account', onClick: () => navigate('/signup') },
        secondary: { label: 'Log in', onClick: () => navigate('/login') },
      }}
      onBack={() => navigate('/assistant')}
      onLogoClick={() => navigate('/')}
      title="EchoAI Voice"
    >
      <AssistantVoiceScreen />
    </AssistantShell>
  )
}

