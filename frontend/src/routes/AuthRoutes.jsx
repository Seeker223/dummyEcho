import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/context/useAuth'
import { useAppState } from '../app/context/useAppState'
import LoginScreen from '../features/workflow/screens/LoginScreen'
import SignupScreen from '../features/workflow/screens/SignupScreen'
import ForgotPasswordScreen from '../features/workflow/screens/ForgotPasswordScreen'
import VerifyEmailScreen from '../features/workflow/screens/VerifyEmailScreen'
import ResendVerificationScreen from '../features/workflow/screens/ResendVerificationScreen'
import UpdatePasswordScreen from '../features/workflow/screens/UpdatePasswordScreen'
import { AuthShell } from './AuthShell'

function normalizeNextTarget(next) {
  if (!next) return null
  const raw = String(next)
  if (raw.startsWith('/app/')) return raw.slice('/app/'.length)
  if (raw.startsWith('/')) return null
  return raw
}

function useSyncActivePage(pageId) {
  const { setActivePage } = useAppState()
  useEffect(() => {
    setActivePage(pageId)
  }, [pageId, setActivePage])
}

export function RoleRoute() {
  // Legacy route kept for backwards compatibility. The new workflow no longer requires
  // selecting a role before using the app.
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  useSyncActivePage('home')

  useEffect(() => {
    const next = normalizeNextTarget(location.state && location.state.next) || 'home'
    navigate(isAuthenticated ? '/app' : '/login', { replace: true, state: { next } })
  }, [isAuthenticated, location.state, navigate])

  return null
}

export function LoginRoute() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  useSyncActivePage('login')

  useEffect(() => {
    if (!isAuthenticated) return
    const next = normalizeNextTarget(location.state && location.state.next) || null
    const target = next || 'home'
    navigate('/app', { replace: true, state: { page: target } })
  }, [isAuthenticated, location.state, navigate])

  return (
    <AuthShell>
      <LoginScreen />
    </AuthShell>
  )
}

export function SignupRoute() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  useSyncActivePage('signup')

  useEffect(() => {
    if (!isAuthenticated) return
    const next = normalizeNextTarget(location.state && location.state.next) || null
    const target = next || 'home'
    navigate('/app', { replace: true, state: { page: target } })
  }, [isAuthenticated, location.state, navigate])

  return (
    <AuthShell>
      <SignupScreen />
    </AuthShell>
  )
}

export function ForgotPasswordRoute() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  useSyncActivePage('forgot-password')

  useEffect(() => {
    if (!isAuthenticated) return
    navigate('/app', { replace: true, state: { page: 'home' } })
  }, [isAuthenticated, navigate])

  return (
    <AuthShell>
      <ForgotPasswordScreen />
    </AuthShell>
  )
}

export function VerifyEmailRoute() {
  useSyncActivePage('verify')

  return (
    <AuthShell>
      <VerifyEmailScreen />
    </AuthShell>
  )
}

export function UpdatePasswordRoute() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  useSyncActivePage('update-password')

  useEffect(() => {
    if (!isAuthenticated) return
    navigate('/app', { replace: true, state: { page: 'home' } })
  }, [isAuthenticated, navigate])

  return (
    <AuthShell>
      <UpdatePasswordScreen />
    </AuthShell>
  )
}

export function ResendVerificationRoute() {
  useSyncActivePage('verify')

  return (
      <AuthShell>
        <ResendVerificationScreen />
      </AuthShell>
    )
  }
