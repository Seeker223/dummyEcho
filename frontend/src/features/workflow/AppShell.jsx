import { memo, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import emergencyLogo from '../../assets/emergencyecho.png'
import { imageSource } from '../../shared/utils/imageSource'
import { useAuth } from '../auth/context/useAuth'
import { WorkflowNav } from './components/WorkflowNav'
import { BrandSocialLinks } from './components/BrandSocialLinks'
import { AiAssistFab } from './components/AiAssistFab'
import { MobileBottomNav } from './components/MobileBottomNav'
import { PhonePreview } from './components/PhonePreview'
import { InfoPanel } from './components/InfoPanel'
import { AssistantCharacterOverlay, showAssistant } from './components/AssistantCharacterOverlay'
import { fetchPageMetadata } from './services/workflowService'
import { useWorkflowNavigation } from './hooks/useWorkflowNavigation'
import { useAppState } from '../../app/context/useAppState'

const emergencyLogoSrc = imageSource(emergencyLogo)

const eeShimmer = keyframes`
  0% { transform: translateX(-65%); }
  55% { transform: translateX(65%); }
  100% { transform: translateX(65%); }
`

const Shell = styled.main`
  width: 100%;
  min-width: 0;
  padding: 14px;
  margin: 0 auto;
  max-width: 1600px;

  @media (min-width: 768px) {
    padding: 22px;
  }

  @media (min-width: 1280px) {
    padding: 24px;
  }

  /* Authenticated workflow should feel like a full-screen app on mobile. */
  @media (max-width: 640px) {
    padding: 0;
    max-width: 100%;
  }
`

const Hero = styled.header`
  min-width: 0;
  border: 1px solid ${({ theme }) => theme?.colors?.border || '#e5e7eb'};
  border-radius: ${({ theme }) => theme?.radii?.lg || '16px'};
  background: ${({ theme }) => (theme?.mode === 'dark' ? '#0b1324' : 'rgba(255, 255, 255, 0.72)')};
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 18px;
  margin-bottom: 16px;
  box-shadow: 0 14px 30px rgba(15, 31, 68, 0.1);
  transition: box-shadow 180ms ease, transform 180ms ease;
  position: static;

  /* On mobile, screens already have their own top bars (with hamburger). */
  @media (max-width: 1023px) {
    display: none;
  }

  @media (hover: hover) {
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 18px 34px rgba(15, 31, 68, 0.14);
    }
  }

  h1 {
    margin: 0;
    font-size: clamp(1.4rem, 2.8vw, 2rem);
    font-weight: 800;
    line-height: 1.02;
  }

  p {
    margin: 8px 0 0;
    color: ${({ theme }) => theme?.colors?.muted || '#6b7280'};
  }
`

const TopRow = styled.div`
  display: flex;
  gap: 12px;
  justify-content: space-between;
  align-items: center;
  flex-wrap: nowrap;
  min-width: 0;
`

const TitleWrap = styled.div`
  display: flex;
  align-items: center;
  gap: clamp(6px, 2vw, 12px);
  min-width: 0;
  flex: 1 1 auto;
  overflow: hidden;

  h1 {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`

const MenuBtn = styled.button`
  width: clamp(36px, 10vw, 42px);
  height: clamp(36px, 10vw, 42px);
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme?.colors?.border || '#e5e7eb'};
  background: ${({ theme }) => theme?.colors?.surface || '#ffffff'};
  color: ${({ theme }) => (theme?.mode === 'dark' ? '#000000' : '#111827')};
  cursor: pointer;
  display: none;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 18px rgba(15, 31, 68, 0.1);

  @media (max-width: 1023px) {
    display: inline-flex;
  }
`

const MenuIcon = styled.span`
  position: relative;
  width: 18px;
  height: 12px;
  display: inline-block;

  &::before,
  &::after,
  span {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    height: 2px;
    border-radius: 999px;
    background: currentColor;
  }

  &::before {
    top: 0;
  }

  span {
    top: 5px;
  }

  &::after {
    bottom: 0;
  }
`

const Logo = styled.img`
  width: clamp(28px, 8vw, 38px);
  height: clamp(28px, 8vw, 38px);
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 8px 16px rgba(15, 31, 68, 0.12);
`

const ShimmerButton = styled.button`
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    inset: -40% -60%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent);
    transform: translateX(-65%);
    animation: ${eeShimmer} 2.8s ease-in-out infinite;
    pointer-events: none;
  }

  @media (prefers-reduced-motion: reduce) {
    &::after {
      animation: none;
      display: none;
    }
  }
`

const ActionBtn = styled(ShimmerButton)`
  border: 0;
  border-radius: ${({ theme }) => theme?.radii?.sm || '10px'};
  background: ${({ theme }) => theme?.colors?.primary || '#dc2626'};
  color: #fff;
  min-height: 42px;
  padding: clamp(6px, 1.5vw, 10px) clamp(10px, 2.5vw, 14px);
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
  flex: 0 0 auto;
  box-shadow: 0 10px 18px rgba(198, 40, 40, 0.24);
  transition: transform 150ms ease, box-shadow 150ms ease, filter 150ms ease;

  @media (max-width: 520px) {
    font-size: clamp(0.75rem, 2.5vw, 0.95rem);
  }

  @media (hover: hover) {
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 14px 22px rgba(198, 40, 40, 0.28);
      filter: saturate(1.04);
    }
  }
`

const Layout = styled.section`
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;
  min-width: 0;
  ${({ $videoCall }) => $videoCall && `
    height: calc(100dvh - 150px);
    min-height: 0;
  `}

  @media (min-width: 1024px) {
    gap: 18px;
    grid-template-columns: auto minmax(0, 1fr);
  }

  @media (max-width: 1023px) {
    ${({ $videoCall }) => $videoCall && `height: calc(100dvh - 24px); min-height: 0;`}
  }
`

const DesktopNav = styled.div`
  display: none;

  @media (min-width: 1024px) {
    display: block;
  }
`

const MainArea = styled.section`
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;
  min-width: 0;
  ${({ $videoCall }) => $videoCall && `min-height: 0; height: 100%;`}


  @media (min-width: 1280px) {
    gap: 18px;
    grid-template-columns: ${({ $singleCol }) => ($singleCol ? 'minmax(0, 1fr)' : 'minmax(0, 1fr) minmax(0, 420px)')};
  }
`

const DesktopInfo = styled.div`
  display: none;

  @media (min-width: 1024px) {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
`

const MobileVideo = styled.div`
  display: block;
  margin-top: 14px;

  @media (min-width: 1024px) {
    display: none;
  }
`

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  z-index: 90;
`

const Drawer = styled.aside`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  width: min(320px, 88vw);
  z-index: 100;
  padding: 18px 16px 16px;
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 26px 70px rgba(15, 31, 68, 0.18);
  display: grid;
  grid-template-rows: auto 1fr auto;
  color: ${({ theme }) => theme.colors.text};
`

const DrawerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
`

const DrawerBrand = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

const DrawerBrandName = styled.div`
  font-size: 18px;
  font-weight: 900;
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.colors.text};
`

const DrawerCloseBtn = styled.button`
  width: 42px;
  height: 42px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => (theme.mode === 'dark' ? '#1a2332' : '#ffffff')};
  cursor: pointer;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.text};
  box-shadow: 0 10px 18px rgba(15, 31, 68, 0.08);
  transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease, border-color 160ms ease;

  @media (hover: hover) {
    &:hover {
      transform: translateY(-1px);
      background: ${({ theme }) => (theme.mode === 'dark' ? '#232f42' : '#ffffff')};
      border-color: rgba(198, 40, 40, 0.25);
      box-shadow: 0 12px 22px rgba(15, 31, 68, 0.12);
    }
  }
`

const DrawerList = styled.div`
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const DrawerProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 12px 10px;
  border-radius: 16px;
  background: ${({ theme }) => (theme.mode === 'dark' ? '#1a2332' : '#ffffff')};
  border: 1px solid ${({ theme }) => theme.colors.border};
`

const DrawerAvatar = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(0, 201, 167, 0.95), rgba(0, 122, 96, 0.95));
  color: #07131f;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  letter-spacing: -0.02em;
`

const DrawerProfileText = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const DrawerProfileName = styled.div`
  font-weight: 900;
  font-size: 15px;
  color: ${({ theme }) => theme.colors.text};
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`

const DrawerProfileMeta = styled.div`
  font-size: 12px;
  color: #0b6b59;
  font-weight: 800;
`

const DrawerSection = styled.div`
  margin-top: 8px;
`

const DrawerSectionLabel = styled.div`
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.18em;
  color: ${({ theme }) => theme.colors.muted};
  padding: 10px 12px 6px;
`

const DrawerRow = styled.button`
  width: 100%;
  text-align: left;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => (theme.mode === 'dark' ? '#1a2332' : '#ffffff')};
  border-radius: 14px;
  padding: 12px 12px;
  font-size: 14px;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  box-shadow: 0 10px 18px rgba(15, 31, 68, 0.06);
  transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease, border-color 160ms ease;
  display: flex;
  align-items: center;
  gap: 12px;

  @media (hover: hover) {
    &:hover {
      border-color: rgba(198, 40, 40, 0.35);
      background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(220, 38, 38, 0.15)' : 'rgba(198, 40, 40, 0.05)')};
      transform: translateY(-1px);
      box-shadow: 0 14px 22px rgba(15, 31, 68, 0.1);
    }
  }
`

const DrawerRowIcon = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(220, 38, 38, 0.15)' : 'rgba(220, 38, 38, 0.08)')};
  border: 1px solid ${({ theme }) => (theme.mode === 'dark' ? 'rgba(220, 38, 38, 0.3)' : 'rgba(220, 38, 38, 0.12)')};
  color: ${({ theme }) => theme.colors.primary};

  svg {
    width: 18px;
    height: 18px;
  }
`

const DrawerRowText = styled.div`
  min-width: 0;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const DrawerRowTitle = styled.div`
  font-weight: 900;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: 8px;
`

const DrawerBadge = styled.span`
  font-size: 10px;
  font-weight: 900;
  padding: 3px 7px;
  border-radius: 999px;
  background: rgba(0, 201, 167, 0.9);
  color: #07131f;
  letter-spacing: 0.06em;
`

const DrawerRowSub = styled.div`
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`

const DrawerRowArrow = styled.div`
  color: #6b7280;
  font-weight: 900;
`

const DrawerCta = styled(ShimmerButton)`
  width: 100%;
  border: 0;
  border-radius: 999px;
  padding: 18px 18px;
  background: ${({ theme }) => theme?.colors?.primary || '#dc2626'};
  color: #ffffff;
  font-size: 16px;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 18px 34px rgba(198, 40, 40, 0.25);
  transition: transform 160ms ease, box-shadow 160ms ease, filter 160ms ease;

  @media (hover: hover) {
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 22px 44px rgba(198, 40, 40, 0.3);
      filter: saturate(1.05);
    }
  }
`

const DrawerLogout = styled(DrawerRow)`
  border-color: rgba(255, 59, 59, 0.22);
  background: rgba(255, 59, 59, 0.06);
`

const DrawerSocialSection = styled.div`
  display: grid;
  gap: 10px;
  padding: 14px 2px 6px;
  border-top: 1px solid ${({ theme }) => theme?.colors?.border || '#e5e7eb'};
`

const DrawerSocialLabel = styled.div`
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme?.colors?.muted || '#6b7280'};
`

function DrawerSvgIcon({ name }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
  }

  switch (name) {
    case 'kit':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M10 3h4v3h-4V3Z" stroke="currentColor" strokeWidth="2" />
          <path
            d="M7 6h10a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path d="M12 11v6M9 14h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'wallet':
      return (
        <svg {...common} aria-hidden="true">
          <path
            d="M4 7a3 3 0 0 1 3-3h12v4H7a1 1 0 0 0 0 2h12v10H7a3 3 0 0 1-3-3V7Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path d="M17 14h3v3h-3a2 2 0 0 1 0-4Z" stroke="currentColor" strokeWidth="2" />
        </svg>
      )
    case 'user':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" stroke="currentColor" strokeWidth="2" />
          <path d="M4 21a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'doctor':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M12 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" stroke="currentColor" strokeWidth="2" />
          <path d="M7 21v-1a5 5 0 0 1 10 0v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M17 14v4M15 16h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'partner':
      return (
        <svg {...common} aria-hidden="true">
          <path
            d="M3 21V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path d="M7 21v-8h10v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'market':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M6 7h15l-2 9H8L6 4H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" fill="currentColor" />
          <path d="M18 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" fill="currentColor" />
        </svg>
      )
    case 'plan':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M12 2l2.9 5.9L21 9l-4.5 4.4L17.5 20 12 16.9 6.5 20l1-6.6L3 9l6.1-1.1L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="M12 8v8M8.5 12h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'language':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" stroke="currentColor" strokeWidth="2" />
          <path d="M3 12h18M12 3c2.5 2.3 4 5.6 4 9s-1.5 6.7-4 9c-2.5-2.3-4-5.6-4-9s1.5-6.7 4-9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'qr':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M4 4h6v6H4V4Z" stroke="currentColor" strokeWidth="2" />
          <path d="M14 4h6v6h-6V4Z" stroke="currentColor" strokeWidth="2" />
          <path d="M4 14h6v6H4v-6Z" stroke="currentColor" strokeWidth="2" />
          <path d="M14 14h2v2h-2v-2ZM18 14h2v2h-2v-2ZM14 18h2v2h-2v-2ZM18 18h2v2h-2v-2Z" stroke="currentColor" strokeWidth="2" />
        </svg>
      )
    case 'chat':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" stroke="currentColor" strokeWidth="2" />
        </svg>
      )
    case 'bell':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 7h18s-3 0-3-7Z" stroke="currentColor" strokeWidth="2" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'profile':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" stroke="currentColor" strokeWidth="2" />
          <path d="M4 21a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'users':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M17 21v-1a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M9 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" stroke="currentColor" strokeWidth="2" />
          <path d="M23 21v-1a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'portal':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M20 7h-3V4a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v3H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1Z" stroke="currentColor" strokeWidth="2" />
          <path d="M9 12h6M12 9v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'logout':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M10 7V5a2 2 0 0 1 2-2h7v18h-7a2 2 0 0 1-2-2v-2" stroke="currentColor" strokeWidth="2" />
          <path d="M4 12h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M7 9l-3 3 3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    default:
      return null
  }
}

function AppShellBase() {
  const { pages, activePage, activePageLabel } = useWorkflowNavigation()
  const { isAuthenticated, logout, currentUser } = useAuth()
  const { setSelectedRole } = useAppState()
  const [navOpen, setNavOpen] = useState(false)
  const [liveFullscreen, setLiveFullscreen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [videoCallSummary, setVideoCallSummary] = useState(null)
  const navigate = useNavigate()

  const userRole = String(currentUser?.role || '').toLowerCase()
  const isPro = ['doctor', 'nurse'].includes(userRole)
  const isAdminArea = String(activePage || '').startsWith('admin')
  const isLiveSession = activePage === 'doctor-live'
  const isVideoCall = activePage === 'video-call'
  const dashboardPage = useMemo(() => 'home', [])

  const displayName = currentUser?.fullName || currentUser?.full_name || currentUser?.name || currentUser?.username || 'Echo AI User'
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('')
  const memberTier = currentUser?.tier || 'Free Member'

  useEffect(() => {
    if (!navOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [navOpen])

  useEffect(() => {
    const handler = () => setNavOpen(true)
    window.addEventListener('ee:open-nav', handler)
    return () => window.removeEventListener('ee:open-nav', handler)
  }, [])

  useEffect(() => {
    const handler = (event) => setLiveFullscreen(Boolean(event?.detail?.active))
    window.addEventListener('ee:live-fullscreen', handler)
    return () => window.removeEventListener('ee:live-fullscreen', handler)
  }, [])

  useEffect(() => {
    if (!isVideoCall) setVideoCallSummary(null)
  }, [isVideoCall])

  useEffect(() => {
    if (isLiveSession) return
    setLiveFullscreen(false)
  }, [isLiveSession])

  useEffect(() => {
    if (!activePage) return

    const controller = new AbortController()
    const label = activePageLabel || activePage

    try {
      showAssistant({
        title: 'EchoAI',
        message: `Opened ${label}. Here's what you can do here...`,
        avatar: isPro ? 'doctor' : 'nurse',
        durationMs: 7000,
      })
    } catch {
      // ignore
    }

    fetchPageMetadata(activePage, { signal: controller.signal })
      .then((meta) => {
        try {
          showAssistant({
            title: label,
            message: meta?.description || 'Tips and guidance are available in this screen.',
            avatar: isPro ? 'doctor' : 'nurse',
            durationMs: 9000,
          })
        } catch {
          // ignore
        }
      })
      .catch(() => {
        // ignore
      })

    return () => controller.abort()
  }, [activePage, activePageLabel, isPro])

  return (
    <Shell className="ee-auth-shell">
      <AssistantCharacterOverlay />
      <Hero>
        <TopRow>
          <TitleWrap>
            <MenuBtn aria-label="Open menu" onClick={() => setNavOpen(true)} type="button">
              <MenuIcon aria-hidden="true">
                <span />
              </MenuIcon>
            </MenuBtn>
            <Logo alt="Emergency Echo logo" src={emergencyLogoSrc} />
            <h1>Emergency Echo</h1>
          </TitleWrap>
          {isAuthenticated ? (
            <ActionBtn
              type="button"
              disabled={isLoggingOut}
              onClick={async () => {
                setIsLoggingOut(true)
                try {
                  await logout()
                  setSelectedRole(null)
                  navigate('/login', { replace: true })
                } finally {
                  setIsLoggingOut(false)
                }
              }}
            >
              {isLoggingOut ? 'Logging out...' : 'Log out'}
            </ActionBtn>
          ) : (
            <ActionBtn type="button" onClick={() => navigate('/login')}>
              Go to login
            </ActionBtn>
          )}
        </TopRow>
      </Hero>

      {navOpen ? (
        <>
          <AssistantDrawerNudge />
          <Backdrop role="presentation" onClick={() => setNavOpen(false)} />
          <Drawer aria-label="Workflow menu">
            <DrawerHeader>
              <DrawerBrand>
                <Logo alt="Emergency Echo logo" src={emergencyLogoSrc} />
                <DrawerBrandName>Emergency Echo</DrawerBrandName>
              </DrawerBrand>
              <DrawerCloseBtn type="button" onClick={() => setNavOpen(false)} aria-label="Close menu">
                ×
              </DrawerCloseBtn>
            </DrawerHeader>

            <DrawerList>
              <DrawerProfile>
                <DrawerAvatar aria-hidden="true">{initials || 'EE'}</DrawerAvatar>
                <DrawerProfileText>
                  <DrawerProfileName>{displayName}</DrawerProfileName>
                  <DrawerProfileMeta>{memberTier}</DrawerProfileMeta>
                </DrawerProfileText>
              </DrawerProfile>

              <DrawerSection>
                <DrawerSectionLabel>MY ACCOUNT</DrawerSectionLabel>
                <DrawerRow
                  type="button"
                  onClick={() => {
                    setNavOpen(false)
                    navigate('/app/kit')
                  }}
                >
                  <DrawerRowIcon aria-hidden="true">
                    <DrawerSvgIcon name="kit" />
                  </DrawerRowIcon>
                  <DrawerRowText>
                    <DrawerRowTitle>My Digital Medical Kit</DrawerRowTitle>
                    <DrawerRowSub>View and update your health profile</DrawerRowSub>
                  </DrawerRowText>
                  <DrawerRowArrow aria-hidden="true">{'>'}</DrawerRowArrow>
                </DrawerRow>

                <DrawerRow
                  type="button"
                  onClick={() => {
                    setNavOpen(false)
                    navigate('/app/wallet')
                  }}
                >
                  <DrawerRowIcon aria-hidden="true">
                    <DrawerSvgIcon name="wallet" />
                  </DrawerRowIcon>
                  <DrawerRowText>
                    <DrawerRowTitle>My EchoWallet</DrawerRowTitle>
                    <DrawerRowSub>Balance, payments, recent activity</DrawerRowSub>
                  </DrawerRowText>
                  <DrawerRowArrow aria-hidden="true">{'>'}</DrawerRowArrow>
                </DrawerRow>

                <DrawerRow
                  type="button"
                  onClick={() => {
                    setNavOpen(false)
                    navigate('/app/profile')
                  }}
                >
                  <DrawerRowIcon aria-hidden="true">
                    <DrawerSvgIcon name="profile" />
                  </DrawerRowIcon>
                  <DrawerRowText>
                    <DrawerRowTitle>My Profile</DrawerRowTitle>
                    <DrawerRowSub>Account settings and preferences</DrawerRowSub>
                  </DrawerRowText>
                  <DrawerRowArrow aria-hidden="true">{'>'}</DrawerRowArrow>
                </DrawerRow>
              </DrawerSection>

              <DrawerSection>
                <DrawerSectionLabel>JOIN AS</DrawerSectionLabel>
                {userRole === 'patient' ? (
                  <DrawerRow
                    type="button"
                    onClick={() => {
                      setNavOpen(false)
                      navigate('/app/apply-user')
                    }}
                  >
                    <DrawerRowIcon aria-hidden="true">
                      <DrawerSvgIcon name="user" />
                    </DrawerRowIcon>
                    <DrawerRowText>
                      <DrawerRowTitle>
                        Patient Setup <DrawerBadge>FREE</DrawerBadge>
                      </DrawerRowTitle>
                      <DrawerRowSub>Set up your profile and emergency details</DrawerRowSub>
                    </DrawerRowText>
                    <DrawerRowArrow aria-hidden="true">{'>'}</DrawerRowArrow>
                  </DrawerRow>
                ) : null}

                {userRole === 'doctor' ? (
                  <DrawerRow
                    type="button"
                    onClick={() => {
                      setNavOpen(false)
                      navigate('/app/apply-doctor')
                    }}
                  >
                    <DrawerRowIcon aria-hidden="true">
                      <DrawerSvgIcon name="doctor" />
                    </DrawerRowIcon>
                    <DrawerRowText>
                      <DrawerRowTitle>Doctor Application</DrawerRowTitle>
                      <DrawerRowSub>Join our verified practitioner network</DrawerRowSub>
                    </DrawerRowText>
                    <DrawerRowArrow aria-hidden="true">{'>'}</DrawerRowArrow>
                  </DrawerRow>
                ) : null}

                {userRole === 'nurse' ? (
                  <DrawerRow
                    type="button"
                    onClick={() => {
                      setNavOpen(false)
                      navigate('/app/apply-nurse')
                    }}
                  >
                    <DrawerRowIcon aria-hidden="true">
                      <DrawerSvgIcon name="doctor" />
                    </DrawerRowIcon>
                    <DrawerRowText>
                      <DrawerRowTitle>Nurse Application</DrawerRowTitle>
                      <DrawerRowSub>Support care and triage workflows</DrawerRowSub>
                    </DrawerRowText>
                    <DrawerRowArrow aria-hidden="true">{'>'}</DrawerRowArrow>
                  </DrawerRow>
                ) : null}

                {userRole === 'partner' ? (
                  <DrawerRow
                    type="button"
                    onClick={() => {
                      setNavOpen(false)
                      navigate('/app/apply-partner')
                    }}
                  >
                    <DrawerRowIcon aria-hidden="true">
                      <DrawerSvgIcon name="partner" />
                    </DrawerRowIcon>
                    <DrawerRowText>
                      <DrawerRowTitle>Partner Application</DrawerRowTitle>
                      <DrawerRowSub>Pharmacies, labs, wellness providers</DrawerRowSub>
                    </DrawerRowText>
                    <DrawerRowArrow aria-hidden="true">{'>'}</DrawerRowArrow>
                  </DrawerRow>
                ) : null}
              </DrawerSection>

              <DrawerSection>
                <DrawerSectionLabel>MORE</DrawerSectionLabel>
                {!isPro ? (
                  <DrawerRow
                    type="button"
                    onClick={() => {
                      setNavOpen(false)
                      navigate('/app/chat')
                    }}
                  >
                    <DrawerRowIcon aria-hidden="true">
                      <DrawerSvgIcon name="chat" />
                    </DrawerRowIcon>
                    <DrawerRowText>
                      <DrawerRowTitle>EchoAI Chat</DrawerRowTitle>
                      <DrawerRowSub>Describe symptoms and get guidance</DrawerRowSub>
                    </DrawerRowText>
                    <DrawerRowArrow aria-hidden="true">{'>'}</DrawerRowArrow>
                  </DrawerRow>
                ) : null}

                <DrawerRow
                  type="button"
                  onClick={() => {
                    setNavOpen(false)
                    navigate('/app/notifications')
                  }}
                >
                  <DrawerRowIcon aria-hidden="true">
                    <DrawerSvgIcon name="bell" />
                  </DrawerRowIcon>
                  <DrawerRowText>
                    <DrawerRowTitle>Notifications</DrawerRowTitle>
                    <DrawerRowSub>Updates and session reminders</DrawerRowSub>
                  </DrawerRowText>
                  <DrawerRowArrow aria-hidden="true">{'>'}</DrawerRowArrow>
                </DrawerRow>

                <DrawerRow
                  type="button"
                  onClick={() => {
                    setNavOpen(false)
                    navigate('/app/marketplace')
                  }}
                >
                  <DrawerRowIcon aria-hidden="true">
                    <DrawerSvgIcon name="market" />
                  </DrawerRowIcon>
                  <DrawerRowText>
                    <DrawerRowTitle>Digital Marketplace</DrawerRowTitle>
                    <DrawerRowSub>Labs, meds, wellness deals</DrawerRowSub>
                  </DrawerRowText>
                  <DrawerRowArrow aria-hidden="true">{'>'}</DrawerRowArrow>
                </DrawerRow>

                <DrawerRow
                  type="button"
                  onClick={() => {
                    setNavOpen(false)
                    navigate('/app/directory')
                  }}
                >
                  <DrawerRowIcon aria-hidden="true">
                    <DrawerSvgIcon name="users" />
                  </DrawerRowIcon>
                  <DrawerRowText>
                    <DrawerRowTitle>Users</DrawerRowTitle>
                    <DrawerRowSub>People registered in the system</DrawerRowSub>
                  </DrawerRowText>
                  <DrawerRowArrow aria-hidden="true">{'>'}</DrawerRowArrow>
                </DrawerRow>

                {isPro ? (
                  <DrawerRow
                    type="button"
                    onClick={() => {
                      setNavOpen(false)
                      navigate('/app/home')
                    }}
                  >
                    <DrawerRowIcon aria-hidden="true">
                      <DrawerSvgIcon name="portal" />
                    </DrawerRowIcon>
                    <DrawerRowText>
                      <DrawerRowTitle>Portal Home</DrawerRowTitle>
                      <DrawerRowSub>Requests, metrics, and queue</DrawerRowSub>
                    </DrawerRowText>
                    <DrawerRowArrow aria-hidden="true">{'>'}</DrawerRowArrow>
                  </DrawerRow>
                ) : null}

                <DrawerRow
                  type="button"
                  onClick={() => {
                    setNavOpen(false)
                    navigate('/app/subscription')
                  }}
                >
                  <DrawerRowIcon aria-hidden="true">
                    <DrawerSvgIcon name="plan" />
                  </DrawerRowIcon>
                  <DrawerRowText>
                    <DrawerRowTitle>Upgrade My Plan</DrawerRowTitle>
                    <DrawerRowSub>Bronze, Silver, Gold, Family</DrawerRowSub>
                  </DrawerRowText>
                  <DrawerRowArrow aria-hidden="true">{'>'}</DrawerRowArrow>
                </DrawerRow>

                {isPro || userRole === 'partner' ? (
                  <DrawerRow
                    type="button"
                    onClick={() => {
                      setNavOpen(false)
                      navigate('/app/admin')
                    }}
                  >
                    <DrawerRowIcon aria-hidden="true">
                      <DrawerSvgIcon name="users" />
                    </DrawerRowIcon>
                    <DrawerRowText>
                      <DrawerRowTitle>Admin console</DrawerRowTitle>
                      <DrawerRowSub>Control and supervision</DrawerRowSub>
                    </DrawerRowText>
                    <DrawerRowArrow aria-hidden="true">{'>'}</DrawerRowArrow>
                  </DrawerRow>
                ) : null}

                <DrawerRow
                  type="button"
                  onClick={() => {
                    setNavOpen(false)
                    navigate('/app/language')
                  }}
                >
                  <DrawerRowIcon aria-hidden="true">
                    <DrawerSvgIcon name="language" />
                  </DrawerRowIcon>
                  <DrawerRowText>
                    <DrawerRowTitle>Language / Ede</DrawerRowTitle>
                    <DrawerRowSub>English, Yoruba, Igbo, Hausa, Pidgin</DrawerRowSub>
                  </DrawerRowText>
                  <DrawerRowArrow aria-hidden="true">{'>'}</DrawerRowArrow>
                </DrawerRow>
              </DrawerSection>

              {isAuthenticated ? (
                <DrawerLogout
                  type="button"
                  disabled={isLoggingOut}
                  onClick={async () => {
                    setIsLoggingOut(true)
                    try {
                      setNavOpen(false)
                      await logout()
                      setSelectedRole(null)
                      navigate('/login', { replace: true })
                    } finally {
                      setIsLoggingOut(false)
                    }
                  }}
                >
                  <DrawerRowIcon aria-hidden="true">
                    <DrawerSvgIcon name="logout" />
                  </DrawerRowIcon>
                  <DrawerRowText>
                    <DrawerRowTitle>{isLoggingOut ? 'Logging out...' : 'Log out'}</DrawerRowTitle>
                    <DrawerRowSub>Sign out of this account</DrawerRowSub>
                  </DrawerRowText>
                  <DrawerRowArrow aria-hidden="true">{'>'}</DrawerRowArrow>
                </DrawerLogout>
              ) : null}
            </DrawerList>

            <DrawerSocialSection>
              <DrawerSocialLabel>Follow us</DrawerSocialLabel>
              <BrandSocialLinks compact align="start" />
            </DrawerSocialSection>

            <DrawerCta
              type="button"
              onClick={() => {
                setNavOpen(false)
                navigate(`/app/${dashboardPage}`)
              }}
            >
              Open dashboard
            </DrawerCta>
          </Drawer>
        </>
      ) : null}

      <Layout $videoCall={isVideoCall}>
        <DesktopNav style={isLiveSession && liveFullscreen ? { display: 'none' } : undefined}>
          <WorkflowNav activePage={activePage} onSelect={(pageId) => navigate(`/app/${pageId}`)} pages={pages} />
        </DesktopNav>
        <MainArea $singleCol={isAdminArea || isLiveSession} $videoCall={isVideoCall}>
          <PhonePreview activePage={activePage} onVideoCallSummaryChange={isVideoCall ? setVideoCallSummary : undefined} />
          {!isAdminArea && !isLiveSession ? (
            <DesktopInfo>
              <InfoPanel activePage={activePage} activePageLabel={activePageLabel} videoCallSummary={videoCallSummary} />
            </DesktopInfo>
          ) : null}
        </MainArea>
      </Layout>

      {isAuthenticated && !['login', 'signup', 'voice-ai', 'video-call'].includes(activePage) && !(isLiveSession && liveFullscreen) ? (
        <MobileBottomNav activePage={activePage} onNavigate={(pageId) => navigate(`/app/${pageId}`)} />
      ) : null}

      {isAuthenticated && !['login', 'signup', 'voice-ai', 'video-call'].includes(activePage) && !(isLiveSession && liveFullscreen) ? <AiAssistFab /> : null}
    </Shell>
  )
}

export const AppShell = memo(AppShellBase)

function AssistantDrawerNudge() {
  useEffect(() => {
    try {
      showAssistant({ title: 'EchoAI', message: 'Use the menu to jump to tools, kit, wallet, and clinician support.' })
    } catch {
      // ignore
    }
  }, [])
  return null
}
