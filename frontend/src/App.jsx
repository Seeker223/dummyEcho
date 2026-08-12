import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import { AppProviders } from './app/AppProviders'
import { AppShell } from './features/workflow/AppShell'
import PublicRecordScreen from './features/workflow/screens/PublicRecordScreen'
import { SplashScreen } from './shared/components/SplashScreen'
import { LandingRoute } from './routes/LandingRoute'
import { ForgotPasswordRoute, LoginRoute, ResendVerificationRoute, SignupRoute, UpdatePasswordRoute, VerifyEmailRoute } from './routes/AuthRoutes'
import { AssistantChatRoute, AssistantHomeRoute, AssistantVoiceRoute } from './routes/AssistantRoutes'
import { useAuth } from './features/auth/context/useAuth'
import { useAppState } from './app/context/useAppState'
import { defaultPrivatePage } from './features/workflow/utils/routeAccess'
import { pages as workflowPages } from './features/workflow/constants/pages'
import PartnerVerificationPortal from './features/mdcn/PartnerVerificationPortal'
export default function App() {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const timerId = window.setTimeout(() => setShowSplash(false), 1600)
    return () => window.clearTimeout(timerId)
  }, [])

  return (
    <AppProviders>
      {showSplash ? (
        <SplashScreen />
      ) : (
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      )}
    </AppProviders>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<LandingRoute />} path="/" />
      <Route element={<LoginRoute />} path="/login" />
      <Route element={<ForgotPasswordRoute />} path="/forgot-password" />
      <Route element={<UpdatePasswordRoute />} path="/update-password" />
      <Route element={<VerifyEmailRoute />} path="/verify" />
      <Route element={<ResendVerificationRoute />} path="/resend-verification" />
      <Route element={<SignupRoute />} path="/signup" />
      <Route element={<AssistantHomeRoute />} path="/assistant" />
      <Route element={<AssistantChatRoute />} path="/assistant/chat" />
      <Route element={<AssistantVoiceRoute />} path="/assistant/voice" />
      <Route element={<PublicRecordScreen />} path="/records/:submissionKey" />
      <Route element={<PartnerVerificationPortal role="doctor" />} path="/mdcn/doctors" />
      <Route element={<PartnerVerificationPortal role="nurse" />} path="/mdcn/nurses" />
      <Route element={<PartnerVerificationPortal role="nurse" />} path="/nmcn/nurses" />
      <Route element={<WorkflowRoute />} path="/app" />
      <Route element={<WorkflowRoute />} path="/app/:pageId" />
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  )
}

function WorkflowRoute() {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, currentUser } = useAuth()
  const { setActivePage } = useAppState()

  // Role is optional and can be applied later via the drawer menu.
  const role = currentUser?.role || null

  useEffect(() => {
    const desiredPageRaw = location.state && location.state.page
    if (!desiredPageRaw) return

    const desiredPage = String(desiredPageRaw).startsWith('/app/')
      ? String(desiredPageRaw).slice('/app/'.length)
      : desiredPageRaw

    // Clear the state so we don't infinitely redirect
    navigate(`/app/${desiredPage}`, { replace: true, state: {} })
  }, [location.state, navigate])

  useEffect(() => {
    if (isAuthenticated) return

    // Keep "next" as a page id (not a full URL) so AuthRoutes can route cleanly after login.
    const next = params.pageId || null
    navigate('/login', { replace: true, state: { next } })
  }, [isAuthenticated, navigate, params.pageId])

  useEffect(() => {
    if (!isAuthenticated) return

    // No page segment: send user to their default private page.
    if (!params.pageId) {
      navigate(`/app/${defaultPrivatePage(role)}`, { replace: true })
      return
    }

    if (params.pageId === 'doctor-session') {
      navigate('/app/home', { replace: true })
      return
    }

    // Unknown segment: bounce to default private page.
    const exists = workflowPages.some((p) => p.id === params.pageId)
    if (!exists) {
      navigate(`/app/${defaultPrivatePage(role)}`, { replace: true })
      return
    }

    // URL is the source of truth for which workflow screen should render.
    setActivePage(params.pageId)
  }, [isAuthenticated, navigate, params.pageId, role, setActivePage])

  // Important: do not force URL to follow `activePage` here.
  // The URL (browser history) should remain the source of truth so back/forward works correctly.

  return <AppShell />
}


