import { useCallback, useEffect, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import emergencyLogo from '../../../assets/emergencyecho.png'
import echo5 from '../../../assets/echo5.png'
import echo6 from '../../../assets/echo6.png'
import echoDigitalEmergencyKit from '../../../assets/echo digital emergency kit.png'
import echoQuickResponseDoctors from '../../../assets/echo quick response from doctors.png'
import echoQuickTimeAccess from '../../../assets/echo quick time access.png'
import echoRealtimeVitals from '../../../assets/echo real-time vitals.png'
import echoJoinAsPatient from '../../../assets/echo-join as patient.png'
import nurudeenPic from '../../../assets/team/nurudeen.jpg'
import yewandePic from '../../../assets/team/yewande.jpg'
import adebowalePic from '../../../assets/team/obalanlege.jpg'
import musodiqPic from '../../../assets/team/musodiq.jpg'
import tobiPic from '../../../assets/team/tobi.jpg'
import drBalogunPic from '../../../assets/Dr. Balogun.png'
import mrNathanielPic from '../../../assets/Mr Nathaniel.png'
import { imageSource } from '../../../shared/utils/imageSource'
import { BrandSocialLinks } from './BrandSocialLinks'
import { ThemeToggle } from './ThemeToggle'
import { ImageWithSkeleton, LogoWithSkeleton } from '../../../components/SkeletonLoader'

import playstoreBadge from '../../../assets/playstore.png'
import appstoreBadge from '../../../assets/appstore.png'

const emergencyLogoSrc = imageSource(emergencyLogo)
const heroMockA = imageSource(echo6)
const heroMockB = imageSource(echo5)
const playstoreBadgeSrc = imageSource(playstoreBadge)
const appstoreBadgeSrc = imageSource(appstoreBadge)

const featureImageByKey = {
  join: imageSource(echoJoinAsPatient),
  vitals: imageSource(echoRealtimeVitals),
  guide: imageSource(echoQuickTimeAccess),
  doctors: imageSource(echoQuickResponseDoctors),
  kit: imageSource(echoDigitalEmergencyKit),
}

const teamMembers = [
  { id: 'nurudeen', name: 'Dr. Kadiri Nurudeen', role: 'Co-CEO', focus: 'Product & Tech • Medical Expert', skills: 'AI Architecture • NDPR Compliance', pic: imageSource(nurudeenPic), objPos: 'center 5%' },
  { id: 'yewande', name: 'Miss Kadiri Yewande', role: 'Co-CEO', focus: 'Marketing & Growth • Brand Strategy', skills: 'Fundraising • Partnerships', pic: imageSource(yewandePic), objPos: 'center 10%' },
  { id: 'tobi', name: 'Mr. Tobi Badun', role: 'CTO', focus: 'System Design & Data Ops', skills: 'Cloud Infrastructure • Security', pic: imageSource(tobiPic), objPos: 'center 20%' },
  { id: 'ayodimeji', name: 'Dr. Balogun Ayodimeji', role: 'UX Designer', focus: 'UX & User Journey • Medical UX', skills: 'Accessibility • Stress-tested Design', pic: imageSource(drBalogunPic), objPos: 'center 15%' },
  { id: 'cybersecurity', name: 'Mr. Nathaniel T.O, AMICDFA', role: 'Cybersecurity Lead', focus: 'Security Architecture', skills: 'Threat Mitigation • NDPA Compliance', pic: imageSource(mrNathanielPic), objPos: 'center 10%' }
]

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(220, 38, 38, 0); }
  100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
`

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`

const Page = styled.main`
  width: 100%;
  background: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.text};
  font-family: 'Inter', sans-serif;
  overflow-x: hidden;
  transition: background 300ms ease, color 300ms ease;
`

const Container = styled.div`
  width: min(1200px, 95vw);
  margin: 0 auto;
  padding: 0 20px;
`

// Navigation
const Nav = styled.header`
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(6, 9, 14, 0.8)' : 'rgba(255, 255, 255, 0.9)'};
  backdrop-filter: blur(12px);
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding: 16px 0;
  transition: all 300ms ease;
`

const NavInner = styled.div`
  display: flex; align-items: center; justify-content: space-between; gap: 40px;
  max-width: 1200px; margin: 0 auto; padding: 0 20px;
  @media (max-width: 768px) { gap: 10px; padding: 0 16px; }
`

const NavBrand = styled.button`
  border: none; background: transparent; padding: 0; display: flex; align-items: center; gap: 10px; cursor: pointer; color: ${({ theme }) => theme.colors.text}; min-width: 0;
  img { width: 32px; height: 32px; }
  span { font-weight: 900; font-size: 1.1rem; letter-spacing: -0.02em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  @media (max-width: 420px) {
    gap: 8px;
    img { width: 30px; height: 30px; }
    span { font-size: 1rem; max-width: 170px; }
  }
`

const NavMenu = styled.div`
  display: flex; align-items: center; gap: 30px; flex: 1; justify-content: center;
  @media (max-width: 900px) { display: none; }
`

const NavLink = styled.button`
  border: none; background: transparent; color: ${({ theme }) => theme.colors.muted}; font-size: 0.9rem; font-weight: 600; cursor: pointer; padding: 0; transition: color 200ms ease;
  &:hover { color: ${({ theme }) => theme.colors.primary}; }
`

const NavActions = styled.div`
  display: flex; gap: 12px; align-items: center; flex-shrink: 0;
  @media (max-width: 900px) {
    gap: 8px;
    > button:not([aria-label='Open menu']):not([aria-label='Toggle Theme']) { display: none; }
    > button[aria-label='Toggle Theme'] {
      width: 42px;
      height: 42px;
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.24);
      color: #f8fafc;
    }
  }
`

const NavCTA = styled.button`
  border: none; background: ${({ theme }) => theme.colors.primary}; color: white; padding: 10px 22px; border-radius: 999px; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: all 200ms ease; flex-shrink: 0;
  &:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(220, 38, 38, 0.4); }
`

const Hamburger = styled.button`
  width: 44px; height: 44px; border-radius: 999px; border: 1px solid ${({ theme }) => theme.colors.border}; background: ${({ theme }) => theme.colors.surface}; color: ${({ theme }) => theme.colors.text}; cursor: pointer; display: none; align-items: center; justify-content: center; transition: all 200ms ease; flex-shrink: 0;
  &:hover { border-color: #dc2626; box-shadow: 0 10px 24px rgba(220, 38, 38, 0.24); transform: translateY(-1px); }
  @media (max-width: 900px) {
    display: inline-flex;
    width: 42px;
    height: 42px;
    background: rgba(15, 23, 42, 0.72);
    border-color: rgba(220, 38, 38, 0.5);
    color: #f8fafc;
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.05), 0 8px 18px rgba(0,0,0,0.24);
  }
`
const BurgerIcon = styled.span`
  position: relative; width: 18px; height: 12px; display: inline-block;
  &::before, &::after, span { content: ''; position: absolute; left: 0; right: 0; height: 2px; border-radius: 999px; background: currentColor; }
  &::before { top: 0; } span { top: 5px; } &::after { bottom: 0; }
`

const DrawerBackdrop = styled.div` position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 200; `
const Drawer = styled.aside`
  position: fixed; top: 0; bottom: 0; left: 0; width: min(320px, 88vw);
  background: ${({ theme }) => theme.colors.surface}; border-right: 1px solid ${({ theme }) => theme.colors.border}; z-index: 210; padding: 18px 16px 16px; display: grid; grid-template-rows: auto 1fr auto;
`
const DrawerHeader = styled.div` display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px; `
const DrawerClose = styled.button` width: 42px; height: 42px; border-radius: 999px; border: 1px solid ${({ theme }) => theme.colors.border}; background: transparent; color: ${({ theme }) => theme.colors.text}; font-weight: 900; cursor: pointer; `
const DrawerList = styled.div` display: flex; flex-direction: column; gap: 12px; overflow: auto; `
const DrawerItem = styled.button` width: 100%; text-align: left; padding: 16px; border-radius: 12px; background: ${({ theme }) => theme.colors.bg}; color: ${({ theme }) => (theme.mode === 'dark' ? '#000000' : theme.colors.text)}; font-weight: 700; border: 1px solid ${({ theme }) => theme.colors.border}; cursor: pointer; `

// Hero Section (Always Dark)
const HeroSection = styled.section`
  padding-top: 140px; padding-bottom: 100px;
  background: radial-gradient(circle at 50% 0%, rgba(220,38,38,0.15), transparent 50%), #06090e;
  color: #f8fafc;
  position: relative; overflow: hidden;
`

const HeroGrid = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;
  @media (max-width: 900px) { grid-template-columns: 1fr; text-align: center; gap: 40px; }
`

const HeroText = styled.div`
  h1 { font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 900; line-height: 1.1; margin: 0 0 20px; letter-spacing: -0.03em; span { color: #dc2626; } }
  p { font-size: 1.1rem; line-height: 1.6; color: ${({ theme }) => theme.mode === 'dark' ? '#cbd5e1' : '#94a3b8'}; margin: 0 0 30px; max-width: 500px; @media (max-width: 900px) { margin: 0 auto 30px; } }
`

const HeroButtons = styled.div`
  display: flex; gap: 16px; flex-wrap: wrap; @media (max-width: 900px) { justify-content: center; }
  @media (max-width: 520px) {
    flex-direction: column;
    align-items: center;
    gap: 12px;
    > button { width: min(100%, 300px); }
  }
`

const StoreBadges = styled.div`
  display: flex; gap: 12px; margin-top: 30px; flex-wrap: wrap; @media (max-width: 900px) { justify-content: center; }
`

const StoreBadge = styled.div`
  position: relative; display: inline-flex; cursor: pointer; transition: transform 200ms ease;
  &:hover { transform: scale(1.05); }
  img { height: 46px; display: block; border-radius: 6px; }
  .tag { position: absolute; top: -10px; right: -10px; background: #dc2626; color: #fff; font-size: 0.65rem; padding: 3px 6px; border-radius: 6px; font-weight: 800; box-shadow: 0 4px 10px rgba(0,0,0,0.3); z-index: 2; }
`

const PrimaryButton = styled.button`
  border: none; background: #dc2626; color: white; padding: 14px 32px; border-radius: 999px; font-weight: 700; font-size: 1.05rem; cursor: pointer; transition: all 200ms ease; box-shadow: 0 10px 24px rgba(220,38,38,0.4); animation: ${pulse} 2s infinite;
  &:hover { transform: translateY(-3px); box-shadow: 0 16px 32px rgba(220, 38, 38, 0.6); }
`

const SecondaryButton = styled.button`
  border: 1px solid rgba(255,255,255,0.28); background: linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06)); color: #f8fafc; padding: 14px 28px; border-radius: 999px; font-weight: 800; font-size: 1.05rem; cursor: pointer; transition: all 200ms ease; backdrop-filter: blur(10px); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06), 0 12px 28px rgba(0,0,0,0.32);
  &:hover { border-color: #dc2626; background: linear-gradient(135deg, rgba(220,38,38,0.22), rgba(255,255,255,0.08)); transform: translateY(-2px); box-shadow: 0 16px 32px rgba(220,38,38,0.22); }
`

const AppMockupCard = styled.div`
  border-radius: 24px; padding: 8px; background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'}; border: 1px solid ${({ theme }) => theme.colors.border}; box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  img { border-radius: 16px; display: block; width: 100%; height: auto; border: 1px solid ${({ theme }) => theme.colors.border}; }
`

const HeroImages = styled.div`
  display: flex; justify-content: center; gap: 20px; align-items: center; position: relative;
  &::before { content:''; position: absolute; width: 150%; height: 150%; background: radial-gradient(circle at center, rgba(220,38,38,0.2) 0%, transparent 60%); z-index: -1; }
  > div:nth-child(2) { transform: translateY(30px); }
  @media (max-width: 900px) { > div:nth-child(2) { display: none; } }
`

// Theme Aware Sections
const SectionBlock = styled.section` padding: 100px 0; background: ${props => props.$bg || 'transparent'}; `
const SectionTitle = styled.h2` font-size: clamp(2rem, 4vw, 2.8rem); font-weight: 900; text-align: center; margin: 0 0 20px; letter-spacing: -0.02em; span { color: ${({ theme }) => theme.colors.primary}; } `
const SectionSubtitle = styled.p` text-align: center; color: ${({ theme }) => theme.colors.muted}; font-size: 1.1rem; margin: 0 auto 60px; max-width: 600px; `

const RolesGrid = styled.div` display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; @media (max-width: 768px) { grid-template-columns: 1fr; } `
const RoleCard = styled.button`
  text-align: left; padding: 40px 30px; border-radius: 20px; border: 1px solid ${({ theme }) => theme.colors.border}; background: ${({ theme }) => theme.colors.surface}; transition: all 300ms ease; cursor: pointer; color: ${({ theme }) => theme.colors.text}; backdrop-filter: blur(10px);
  &:hover { transform: translateY(-8px); border-color: ${props => props.$color || '#dc2626'}; box-shadow: 0 20px 40px rgba(0,0,0,0.1), inset 0 0 0 1px ${props => props.$color || '#dc2626'}; }
  .icon { width: 56px; height: 56px; border-radius: 14px; background: ${props => props.$color || '#dc2626'}22; color: ${props => props.$color || '#dc2626'}; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; font-weight: 900; margin-bottom: 20px; }
  h3 { font-size: 1.4rem; font-weight: 900; margin: 0 0 12px; }
  p { font-size: 1rem; line-height: 1.6; color: ${({ theme }) => theme.colors.muted}; margin: 0; }
`

const FeatureGrid = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;
  ${props => props.$reverse && `> :first-child { order: 2; }`}
  @media (max-width: 768px) { grid-template-columns: 1fr; gap: 40px; > :first-child { order: 0; } }
`
const FeatureImage = styled.div` display: flex; justify-content: center; align-items: center; width: 100%; `
const FeatureText = styled.div`
  h3 { font-size: 2rem; font-weight: 900; margin: 0 0 20px; letter-spacing: -0.02em; }
  p { font-size: 1.1rem; line-height: 1.6; color: ${({ theme }) => theme.colors.muted}; margin: 0 0 30px; }
  ul {
    list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 16px;
    li { display: flex; align-items: center; gap: 12px; color: ${({ theme }) => theme.colors.text}; font-size: 1.05rem; font-weight: 600; &:before { content: '✓'; color: ${({ theme }) => theme.colors.primary}; font-weight: 900; background: rgba(220,38,38,0.1); width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 50%; } }
  }
`

const HowItWorksGrid = styled.div`
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; margin-top: 40px;
  @media (max-width: 768px) { grid-template-columns: 1fr; }
`
const StepCard = styled.div`
  background: ${({ theme }) => theme.colors.surface}; border: 1px solid ${({ theme }) => theme.colors.border}; padding: 30px; border-radius: 20px; text-align: center; position: relative;
  .step-num { position: absolute; top: -15px; left: 50%; transform: translateX(-50%); width: 30px; height: 30px; background: ${({ theme }) => theme.colors.primary}; color: #fff; font-weight: 900; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
  h4 { font-size: 1.3rem; font-weight: 900; margin: 20px 0 10px; }
  p { color: ${({ theme }) => theme.colors.muted}; line-height: 1.5; }
`

const TestimonialGrid = styled.div`
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px; margin-top: 40px;
  @media (max-width: 768px) { grid-template-columns: 1fr; }
`
const TestimonialCard = styled.div`
  background: ${({ theme }) => theme.colors.surface}; border: 1px solid ${({ theme }) => theme.colors.border}; padding: 40px 30px; border-radius: 20px;
  box-shadow: 0 10px 40px rgba(220, 38, 38, 0.12);
  transition: transform 300ms ease, box-shadow 300ms ease;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 16px 50px rgba(220, 38, 38, 0.2);
  }
  p { font-size: 1.1rem; font-style: italic; color: ${({ theme }) => theme.colors.text}; line-height: 1.6; margin: 0 0 20px; }
  .author { display: flex; align-items: center; gap: 12px; }
  .author-avatar { width: 40px; height: 40px; border-radius: 50%; background: ${({ theme }) => theme.colors.border}; }
  .author-info strong { display: block; font-weight: 800; color: ${({ theme }) => theme.colors.primary}; }
  .author-info span { font-size: 0.85rem; color: ${({ theme }) => theme.colors.muted}; }
`

const StatsSection = styled.section`
  padding: 80px 0; background: radial-gradient(ellipse at bottom, rgba(220,38,38,0.1), transparent 70%), ${({ theme }) => theme.colors.surface}; border-top: 1px solid ${({ theme }) => theme.colors.border}; border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`
const StatsGrid = styled.div`
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px; text-align: center;
  @media (max-width: 768px) { grid-template-columns: repeat(2, 1fr); gap: 30px; }
  .stat h4 { font-size: 3rem; font-weight: 900; margin: 0 0 10px; background: linear-gradient(to right, ${({ theme }) => theme.colors.text}, ${({ theme }) => theme.colors.muted}); -webkit-background-clip: text; color: transparent; }
  .stat p { font-size: 1rem; color: ${({ theme }) => theme.colors.muted}; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
`

const TeamSection = styled.section` padding: 100px 0; `
const TeamGrid = styled.div` display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; margin-top: 50px; @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); } @media (max-width: 600px) { grid-template-columns: 1fr; } `
const TeamCard = styled.div`
  background: ${({ theme }) => theme.colors.surface}; border: 1px solid ${({ theme }) => theme.colors.border}; border-radius: 20px; padding: 30px; text-align: center; transition: all 300ms ease; position: relative; overflow: hidden;
  &:hover { transform: translateY(-5px); border-color: rgba(220,38,38,0.5); box-shadow: 0 10px 30px rgba(220,38,38,0.1); }
  &::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: ${({ theme }) => theme.colors.primary}; transform: scaleX(0); transition: transform 300ms ease; transform-origin: left; }
  &:hover::before { transform: scaleX(1); }
`
const AvatarWrap = styled.div`
  width: 120px; height: 120px; margin: 0 auto 20px; border-radius: 50%; border: 4px solid ${({ theme }) => theme.colors.bg}; box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}; overflow: hidden; position: relative; background: ${({ theme }) => theme.colors.surface};
`
const AvatarImage = styled.img`
  width: 100%; height: 100%; object-fit: cover;
`
const CybersecurityAvatar = styled.div`
  width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 3rem; color: ${({ theme }) => theme.colors.primary}; background: rgba(220,38,38,0.1);
`
const TeamInfo = styled.div`
  h4 { font-size: 1.2rem; font-weight: 900; margin: 0 0 6px; color: ${({ theme }) => theme.colors.text}; }
  .role { font-size: 0.9rem; font-weight: 800; color: ${({ theme }) => theme.colors.primary}; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 16px; }
  .focus { font-size: 0.85rem; color: ${({ theme }) => theme.colors.text}; font-weight: 600; margin: 0 0 8px; line-height: 1.4; }
  .skills { font-size: 0.8rem; color: ${({ theme }) => theme.colors.muted}; margin: 0; line-height: 1.4; }
`

const CTASection = styled.section` padding: 100px 0; background: linear-gradient(180deg, ${({ theme }) => theme.colors.bg} 0%, rgba(220,38,38,0.1) 100%); text-align: center; h2 { font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 900; margin: 0 0 40px; } `

const Footer = styled.footer` background: ${({ theme }) => theme.mode === 'dark' ? '#000' : '#f8fafc'}; color: ${({ theme }) => theme.colors.muted}; padding: 60px 0 30px; text-align: center; font-size: 0.9rem; border-top: 1px solid ${({ theme }) => theme.colors.border}; `
const FooterInner = styled.div` display: grid; justify-items: center; gap: 24px; `
const FooterBrand = styled.div` display: inline-flex; align-items: center; gap: 10px; color: ${({ theme }) => theme.colors.text}; font-weight: 900; font-size: 1.2rem; img { width: 34px; height: 34px; } `
const FooterLinks = styled.nav` display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 12px 24px; a { color: ${({ theme }) => theme.colors.muted}; text-decoration: none; font-weight: 600; transition: color 200ms ease; &:hover { color: ${({ theme }) => theme.colors.primary}; } } `

// Dropdown styles
const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
  &:hover > div { display: flex; }
`
const DropdownMenu = styled.div`
  display: none; position: absolute; top: 100%; left: 50%; transform: translateX(-50%);
  background: ${({ theme }) => theme.colors.surface}; border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px; padding: 8px; flex-direction: column; gap: 4px; min-width: 160px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1); z-index: 10;
`
const DropdownItem = styled.button`
  border: none; background: transparent; color: ${({ theme }) => theme.colors.text};
  padding: 10px 16px; border-radius: 8px; font-weight: 600; font-size: 0.9rem; text-align: left; cursor: pointer; white-space: nowrap;
  &:hover { background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}; color: ${({ theme }) => theme.colors.primary}; }
`

// Calculator styles
const CalculatorWrap = styled.div`
  background: ${({ theme }) => theme.colors.surface}; border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 20px; padding: 30px; margin-top: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); text-align: left;
  h3 { color: ${({ theme }) => theme.colors.text}; }
  p { color: ${({ theme }) => theme.colors.muted}; }
  span { color: ${({ theme }) => theme.colors.text}; }
`
const CalculatorGrid = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 30px;
  @media (max-width: 768px) { grid-template-columns: 1fr; }
`
const SliderWrap = styled.div`
  margin-bottom: 30px;
  input[type=range] { width: 100%; margin-top: 15px; accent-color: #dc2626; cursor: pointer; }
`
const ResultBox = styled.div`
  background: ${({ $highlight, theme }) => $highlight ? 'rgba(220,38,38,0.05)' : theme.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'};
  border: 1px solid ${({ $highlight, theme }) => $highlight ? 'rgba(220,38,38,0.2)' : theme.colors.border};
  padding: 24px; border-radius: 12px; text-align: center;
  color: ${({ theme }) => theme.colors.text};
  h4 { margin: 0 0 10px; color: ${({ theme }) => theme.colors.text}; font-size: 1.1rem; }
  .amount { font-size: 2.2rem; font-weight: 900; color: ${({ $highlight, theme }) => $highlight ? theme.colors.primary : theme.colors.text}; margin-bottom: 4px; span { color: ${({ theme }) => theme.colors.muted}; } }
  .subtext { font-size: 0.9rem; color: ${({ theme }) => theme.colors.muted}; margin-top: 4px; font-weight: 500; }
  div { color: ${({ theme }) => theme.colors.text}; }
`

function EarningCalculator() {
  const [hours, setHours] = useState(20)
  const locumRate = 2000
  const echoRate = 6000
  
  return (
    <CalculatorWrap>
      <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '1.4rem' }}>Earning Potential Calculator</h3>
      <p style={{ marginBottom: '24px', lineHeight: 1.5, fontSize: '0.95rem' }}>Compare traditional locum earnings (₦2k/hr) against Emergency Echo's rapid-triage model (up to ₦6k/hr via ₦1k/10min or ₦500/5min sessions).</p>
      
      <SliderWrap>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1.05rem' }}>
          <span>Hours per week:</span>
          <span style={{ color: '#dc2626' }}>{hours} hrs</span>
        </div>
        <input type="range" min="1" max="60" value={hours} onChange={(e) => setHours(Number(e.target.value))} />
      </SliderWrap>

      <CalculatorGrid>
        <ResultBox>
          <h4>Traditional Locum</h4>
          <div className="amount" style={{ fontSize: '1.5rem', marginBottom: '8px' }}>₦{locumRate.toLocaleString()} <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>/ hour</span></div>
          <div style={{ fontSize: '0.85rem', marginBottom: '16px', fontWeight: '500' }}>({hours} hrs/week × 4 weeks × ₦{locumRate.toLocaleString()})</div>
          <div className="amount">₦{(hours * locumRate * 4).toLocaleString()}</div>
          <div className="subtext" style={{ fontWeight: '700' }}>Estimated Monthly Earnings</div>
        </ResultBox>
        <ResultBox $highlight>
          <h4>Emergency Echo</h4>
          <div className="amount" style={{ fontSize: '1.5rem', marginBottom: '8px' }}>₦{echoRate.toLocaleString()} <span style={{ fontSize: '0.9rem', color: '#dc2626', fontWeight: '600' }}>/ hour</span></div>
          <div style={{ fontSize: '0.85rem', color: '#dc2626', marginBottom: '16px', fontWeight: '500' }}>({hours} hrs/week × 4 weeks × ₦{echoRate.toLocaleString()})</div>
          <div className="amount">₦{(hours * echoRate * 4).toLocaleString()}</div>
          <div className="subtext" style={{ fontWeight: '700' }}>Estimated Monthly Earnings</div>
        </ResultBox>
      </CalculatorGrid>
    </CalculatorWrap>
  )
}

export function LandingPage({ onChooseRole, onLogin, onTryAssistant, onJoinPatient, onJoinDoctor, onJoinNurse, onJoinPartner, isAuthenticated }) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleGetStarted = useCallback(() => onChooseRole(), [onChooseRole])
  const handleLogin = useCallback(() => onLogin(), [onLogin])
  const handleTryAssistant = useCallback(() => onTryAssistant ? onTryAssistant() : onChooseRole(), [onChooseRole, onTryAssistant])
  const handleJoinDoctor = useCallback(() => onJoinDoctor ? onJoinDoctor() : onChooseRole(), [onChooseRole, onJoinDoctor])
  const handleJoinPatient = useCallback(() => onJoinPatient ? onJoinPatient() : onChooseRole(), [onChooseRole, onJoinPatient])
  const handleJoinNurse = useCallback(() => onJoinNurse ? onJoinNurse() : onChooseRole(), [onChooseRole, onJoinNurse])
  const handleJoinPartner = useCallback(() => onJoinPartner ? onJoinPartner() : onChooseRole(), [onChooseRole, onJoinPartner])

  useEffect(() => {
    if (!drawerOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prevOverflow }
  }, [drawerOpen])

  const scrollTo = useCallback((id) => {
    setDrawerOpen(false)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return (
    <Page>
      <Nav>
        <Container>
          <NavInner>
            <NavBrand onClick={handleGetStarted}>
              <LogoWithSkeleton src={emergencyLogoSrc} alt="Emergency Echo" width="32px" height="32px" />
              <span>EmergencyEcho</span>
            </NavBrand>
            <NavMenu>
              <NavLink onClick={() => scrollTo('how-it-works')}>How it works</NavLink>
              <NavLink onClick={() => scrollTo('features')}>Features</NavLink>
              <NavLink onClick={() => scrollTo('testimonials')}>Testimonials</NavLink>
              <NavLink onClick={() => scrollTo('team')}>Team</NavLink>
              <DropdownContainer>
                <NavLink>Join Us Now ▾</NavLink>
                <DropdownMenu>
                  <DropdownItem onClick={handleJoinDoctor}>Doctor</DropdownItem>
                  <DropdownItem onClick={handleJoinNurse}>Nurse</DropdownItem>
                  <DropdownItem onClick={handleJoinPartner}>Partner</DropdownItem>
                </DropdownMenu>
              </DropdownContainer>
            </NavMenu>
            <NavActions>
              <Hamburger aria-label="Open menu" onClick={() => setDrawerOpen(true)} type="button"><BurgerIcon><span /></BurgerIcon></Hamburger>
              <ThemeToggle />
              {!isAuthenticated && <NavLink onClick={handleLogin} style={{ fontWeight: 700 }}>Log in</NavLink>}
              <NavCTA onClick={handleGetStarted}>Get started</NavCTA>
            </NavActions>
          </NavInner>
        </Container>
      </Nav>

      <HeroSection id="hero">
        <Container>
          <HeroGrid>
            <HeroText>
              <h1>Instant medical<br />guidance,<br /><span>everywhere,</span><br />when it <span>matters</span>.</h1>
              <p>Voice-activated AI triage, encrypted medical records, and verified clinicians - instantly. The ultimate response system built for Africa and beyond.</p>
              <HeroButtons>
                <PrimaryButton onClick={handleGetStarted}>Get started</PrimaryButton>
                <SecondaryButton onClick={handleTryAssistant}>Try EchoAI for free</SecondaryButton>
              </HeroButtons>
              <StoreBadges>
                <StoreBadge>
                  <img src={appstoreBadgeSrc} alt="Download on the App Store" />
                  <div className="tag">Coming Soon</div>
                </StoreBadge>
                <StoreBadge>
                  <img src={playstoreBadgeSrc} alt="Get it on Google Play" />
                  <div className="tag">Coming Soon</div>
                </StoreBadge>
              </StoreBadges>
            </HeroText>
            <HeroImages>
              <AppMockupCard><ImageWithSkeleton src={heroMockA} alt="App Preview" width="100%" height="400px" borderRadius="16px" /></AppMockupCard>
              <AppMockupCard><ImageWithSkeleton src={heroMockB} alt="App Preview" width="100%" height="400px" borderRadius="16px" /></AppMockupCard>
            </HeroImages>
          </HeroGrid>
        </Container>
      </HeroSection>

      <SectionBlock id="how-it-works">
        <Container>
          <SectionTitle>How Emergency Echo <span>saves lives</span></SectionTitle>
          <SectionSubtitle>A seamless, three-step journey to rapid medical response.</SectionSubtitle>
          <HowItWorksGrid>
            <StepCard>
              <div className="step-num">1</div>
              <h4>Tell EchoAI Your Symptoms</h4>
              <p>Speak naturally. Our AI engine triages your condition and pulls up your pre-saved medical history instantly.</p>
            </StepCard>
            <StepCard>
              <div className="step-num">2</div>
              <h4>Clinician Matching</h4>
              <p>Depending on urgency, you are connected to verified doctors and nurses with access to your live vitals.</p>
            </StepCard>
            <StepCard>
              <div className="step-num">3</div>
              <h4>Action & Care</h4>
              <p>Receive immediate video/voice care, step-by-step emergency protocols, or a direct handoff to emergency contacts.</p>
            </StepCard>
          </HowItWorksGrid>
        </Container>
      </SectionBlock>

      <SectionBlock id="features" $bg={({ theme }) => theme.colors.surface}>
        <Container>
          <SectionTitle>The <span>Patient</span> Experience</SectionTitle>
          <FeatureGrid>
            <FeatureText>
              <h3>Digital Medical Kit & Voice Access</h3>
              <p>Keep your critical medical history safely encrypted yet instantly accessible when seconds matter.</p>
              <ul>
                <li>Voice-activated emergency triggers</li>
                <li>One-tap sharing with family and EMS</li>
                <li>Secure document vault for test results</li>
              </ul>
              <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(220,38,38,0.05)', borderRadius: '12px', border: '1px solid rgba(220,38,38,0.2)' }}>
                <h4 style={{ margin: '0 0 10px', color: '#dc2626', fontSize: '1.05rem' }}>Quick Consultations</h4>
                <div style={{ display: 'grid', gap: '10px', fontSize: '0.9rem' }}>
                  <div><strong>5-Minute Sessions:</strong> Perfect for quick triage, prescription refills, minor rashes, or general health questions.</div>
                  <div><strong>10-Minute Sessions:</strong> Best for pediatric concerns, detailed symptom evaluation (fever, pain), chronic condition follow-ups, or second opinions.</div>
                </div>
              </div>
            </FeatureText>
            <FeatureImage><AppMockupCard><ImageWithSkeleton src={featureImageByKey.kit} alt="Kit" width="100%" height="400px" borderRadius="16px" /></AppMockupCard></FeatureImage>
          </FeatureGrid>
        </Container>
      </SectionBlock>

      <SectionBlock>
        <Container>
          <SectionTitle>The <span>Professional</span> Advantage</SectionTitle>
          <FeatureGrid $reverse>
            <FeatureText>
              <h3>Empowering doctors and nurses</h3>
              <p>Streamline your practice with AI-assisted clerking, live vital feeds, and an integrated digital wallet.</p>
              <ul>
                <li>Pre-triaged patient queue</li>
                <li>Live vitals dashboard for critical cases</li>
                <li>Instant payout processing via in-app Wallet</li>
              </ul>
              <EarningCalculator />
            </FeatureText>
            <FeatureImage><AppMockupCard><ImageWithSkeleton src={featureImageByKey.doctors} alt="Doctors" width="100%" height="400px" borderRadius="16px" /></AppMockupCard></FeatureImage>
          </FeatureGrid>
        </Container>
      </SectionBlock>

      <StatsSection>
        <Container>
          <StatsGrid>
            <div className="stat"><h4>1.4M+</h4><p>Records Secured</p></div>
            <div className="stat"><h4>99.9%</h4><p>Uptime SLA</p></div>
            <div className="stat"><h4>10K+</h4><p>Verified Doctors and Nurses</p></div>
            <div className="stat"><h4>&lt; 5s</h4><p>AI Response</p></div>
          </StatsGrid>
        </Container>
      </StatsSection>

      <SectionBlock id="testimonials">
        <Container>
          <SectionTitle>Trusted by <span>thousands</span></SectionTitle>
          <SectionSubtitle>Real impact stories from users and medical professionals.</SectionSubtitle>
          <TestimonialGrid>
            <TestimonialCard>
              <p>"Emergency Echo’s voice AI accurately identified my mother’s stroke symptoms in seconds. The immediate connection to a verified doctor absolutely saved her life. It's a must-have app."</p>
              <div className="author">
                <div className="author-info">
                  <strong>Sarah J.</strong>
                  <span>Patient</span>
                </div>
              </div>
            </TestimonialCard>
            <TestimonialCard>
              <p>"As a triage nurse, the pre-clerking AI is a game changer. I receive the patient's entire medical history and current vitals before I even say hello. It cuts down response time drastically."</p>
              <div className="author">
                <div className="author-info">
                  <strong>Oluwaseun T., RN</strong>
                  <span>Healthcare Provider</span>
                </div>
              </div>
            </TestimonialCard>
            <TestimonialCard>
              <p>"The encrypted patient records mean I no longer have to worry about data breaches when discussing cases. Emergency Echo is built with true compliance in mind."</p>
              <div className="author">
                <div className="author-info">
                  <strong>Dr. M. Kalu</strong>
                  <span>Senior Physician</span>
                </div>
              </div>
            </TestimonialCard>
            <TestimonialCard>
              <p>"Partnering with Emergency Echo has driven a massive increase in triage volume. Their platform seamlessly hands off critical cases to our physical facilities when physical intervention is required."</p>
              <div className="author">
                <div className="author-info">
                  <strong>Dr. Chidi B.</strong>
                  <span>Clinic Director (Partner)</span>
                </div>
              </div>
            </TestimonialCard>
          </TestimonialGrid>
        </Container>
      </SectionBlock>

      <SectionBlock id="privacy" $bg={({ theme }) => theme.colors.surface}>
        <Container>
          <SectionTitle>Security and <span>Privacy</span> First</SectionTitle>
          <FeatureGrid>
            <FeatureText>
              <h3>NDPR Compliant & Encrypted</h3>
              <p>Your medical data is your most sensitive information. We protect it with banking-grade encryption, ensuring total compliance with NDPR and international healthcare standards.</p>
              <ul>
                <li>End-to-End Encryption on video calls</li>
                <li>Secure Vault for medical documents</li>
                <li>Role-based access (Doctors only see what you approve)</li>
              </ul>
            </FeatureText>
            <FeatureImage>
              <div style={{ fontSize: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#10b981' }}>
                🔒
              </div>
            </FeatureImage>
          </FeatureGrid>
        </Container>
      </SectionBlock>

      <TeamSection id="team">
        <Container>
          <SectionTitle>Meet the Team behind <span>Emergency Echo</span></SectionTitle>
          <SectionSubtitle>Multidisciplinary. Mission-Driven. Africa-Ready.</SectionSubtitle>
          <TeamGrid>
            {teamMembers.map(member => (
              <TeamCard key={member.id}>
                <AvatarWrap>
                  {member.pic ? (
                    <AvatarImage src={member.pic} alt={member.name} style={{ objectPosition: member.objPos || 'center' }} />
                  ) : (
                    <CybersecurityAvatar>?</CybersecurityAvatar>
                  )}
                </AvatarWrap>
                <TeamInfo>
                  <h4>{member.name}</h4>
                  <div className="role">{member.role}</div>
                  <div className="focus">{member.focus}</div>
                  <div className="skills">{member.skills}</div>
                </TeamInfo>
              </TeamCard>
            ))}
          </TeamGrid>
        </Container>
      </TeamSection>

      <CTASection id="about">
        <Container>
          <h2>Be ready when it matters most.</h2>
          <PrimaryButton onClick={handleGetStarted}>Join Emergency Echo Today</PrimaryButton>
        </Container>
      </CTASection>

      <Footer>
        <Container as={FooterInner}>
          <FooterBrand><LogoWithSkeleton alt="" src={emergencyLogoSrc} width="34px" height="34px" /><span>EmergencyEcho</span></FooterBrand>
          <BrandSocialLinks />
          <FooterLinks>
            <a href="/about">About</a><a href="/faq">FAQ</a><a href="/contact">Contact</a>
            <a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/medical-disclaimer">Medical Disclaimer</a>
          </FooterLinks>
          <p>© 2026 EmergencyEcho - A Yenak Technology product. All rights reserved.</p>
        </Container>
      </Footer>

      {drawerOpen && (
        <>
          <DrawerBackdrop onClick={() => setDrawerOpen(false)} />
          <Drawer>
            <DrawerHeader>
              <NavBrand><LogoWithSkeleton src={emergencyLogoSrc} alt="" width="32px" height="32px" /><span>Emergency Echo</span></NavBrand>
              <DrawerClose onClick={() => setDrawerOpen(false)}>×</DrawerClose>
            </DrawerHeader>
            <DrawerList>
              <DrawerItem onClick={() => scrollTo('how-it-works')}>How it works</DrawerItem>
              <DrawerItem onClick={() => scrollTo('features')}>Features</DrawerItem>
              <DrawerItem onClick={() => scrollTo('team')}>Team</DrawerItem>
              <DrawerItem onClick={handleJoinDoctor}>Join as Doctor</DrawerItem>
              <DrawerItem onClick={handleJoinNurse}>Join as Nurse</DrawerItem>
              <DrawerItem onClick={handleJoinPartner}>Join as Partner</DrawerItem>
              {!isAuthenticated && <DrawerItem onClick={handleLogin}>Log in</DrawerItem>}
            </DrawerList>
            <div style={{ marginTop: '20px' }}>
              <PrimaryButton style={{ width: '100%' }} onClick={handleGetStarted}>Get started</PrimaryButton>
            </div>
          </Drawer>
        </>
      )}
    </Page>
  )
}
