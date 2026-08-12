import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import { supabase } from '../../../lib/supabaseClient'
import { useAppState } from '../../../app/context/useAppState'
import { useAuth } from '../../auth/context/useAuth'
import { addNotificationForUser } from '../services/notificationService'
import { LiveKitSessionRoom } from '../components/LiveKitSessionRoom'

const ring = keyframes`
  0% { transform: scale(1); opacity: 0.6; }
  70% { transform: scale(1.25); opacity: 0; }
  100% { transform: scale(1.25); opacity: 0; }
`

const Wrap = styled.section`
  min-height: 100%;
  height: ${({ $videoFocus }) => ($videoFocus ? '100%' : 'auto')};
  border-radius: 22px;
  border: 1px solid ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : theme.colors.border)};
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? `radial-gradient(circle at 42% 0%, ${theme.colors.glowRed}, transparent 58%),
         linear-gradient(180deg, ${theme.colors.bgStart} 0%, ${theme.colors.bgEnd} 100%)`
      : `linear-gradient(180deg, ${theme.colors.surface} 0%, ${theme.colors.surfaceAlt} 100%)`};
  color: ${({ theme }) => theme.colors.text};
  overflow: hidden;
  display: grid;
  grid-template-rows: auto 1fr;

  @media (max-width: 640px) {
    min-height: ${({ $videoFocus }) => ($videoFocus ? '100vh' : '100%')};
    border-radius: 0;
    border: 0;
  }
`

const TopBar = styled.header`
  padding: 14px 16px 10px;
  display: ${({ $videoFocus }) => ($videoFocus ? 'none' : 'flex')};
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`

const EndBtn = styled.button`
  border: 0;
  background: transparent;
  color: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(241,245,249,0.9)' : theme.colors.muted)};
  font-weight: 900;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 12px;

  @media (hover: hover) {
    &:hover {
      background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.04)')};
    }
  }
`

const Secure = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(241,245,249,0.86)' : theme.colors.muted)};
  font-weight: 850;
  font-size: 0.95rem;
`

const Dot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.success};
  box-shadow: 0 0 0 5px rgba(34, 197, 94, 0.14);
`

const Body = styled.div`
  padding: 8px 16px 18px;
  display: grid;
  justify-items: center;
  align-content: start;
  gap: 12px;

  @media (max-width: 640px) {
    padding: ${({ $videoFocus }) => ($videoFocus ? '0' : '6px 10px 96px')};
    height: ${({ $videoFocus }) => ($videoFocus ? '100vh' : 'auto')};
    align-content: ${({ $videoFocus }) => ($videoFocus ? 'stretch' : 'start')};
  }

  @media (min-width: 980px) {
    grid-template-columns: minmax(0, 1.95fr) minmax(320px, 0.92fr);
    grid-auto-flow: dense;
    align-items: start;
    justify-items: stretch;
    gap: 16px;

    > * {
      grid-column: 1;
      justify-self: stretch;
    }
  }
`

const Avatar = styled.div`
  width: 74px;
  height: 74px;
  border-radius: 999px;
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? `linear-gradient(135deg, ${theme.colors.primaryDeep} 0%, rgba(220,38,38,0.18) 100%)`
      : `linear-gradient(135deg, rgba(220,38,38,0.18) 0%, rgba(220,38,38,0.08) 100%)`};
  border: 1px solid ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.10)' : theme.colors.border)};
  display: grid;
  place-items: center;
  position: relative;
  margin-top: 10px;
`

const AvatarRing = styled.div`
  position: absolute;
  inset: -10px;
  border-radius: 999px;
  border: 2px solid ${({ theme }) => (theme.mode === 'dark' ? theme.colors.glowRed : 'rgba(220,38,38,0.16)')};
  animation: ${ring} 1600ms ease-out infinite;
`

const AvatarText = styled.div`
  font-weight: 1000;
  letter-spacing: 0.06em;
  color: ${({ theme }) => (theme.mode === 'dark' ? '#fff' : theme.colors.text)};
`

const DocName = styled.h2`
  margin: 2px 0 0;
  font-size: 1.25rem;
  font-weight: 950;
  letter-spacing: -0.02em;
  text-align: center;
`

const DocMeta = styled.div`
  margin-top: -8px;
  color: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(241,245,249,0.74)' : theme.colors.muted)};
  font-weight: 800;
  font-size: 0.95rem;
  text-align: center;
`

const Timer = styled.div`
  margin-top: 6px;
  font-variant-numeric: tabular-nums;
  font-size: 2.1rem;
  font-weight: 1000;
  letter-spacing: -0.04em;
`

const StatusSubtitle = styled.div`
  margin-top: -2px;
  text-align: center;
  color: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(241,245,249,0.82)' : theme.colors.muted)};
  font-weight: 750;
  font-size: 0.95rem;
  line-height: 1.35;
`

const Note = styled.div`
  margin-top: -2px;
  text-align: center;
  color: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(241,245,249,0.82)' : theme.colors.muted)};
  font-weight: 750;
  font-size: 0.95rem;
  line-height: 1.35;

  strong {
    color: ${({ theme }) => (theme.mode === 'dark' ? '#fff' : theme.colors.text)};
    font-weight: 950;
  }
`

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
`
const DashCard = styled.div`
  background: ${({ theme }) => theme?.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc'};
  border: 1px solid ${({ theme }) => theme?.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#e2e8f0'};
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`
const DashCardFull = styled(DashCard)`
  grid-column: 1 / -1;
`
const DashLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  color: ${({ theme }) => theme?.colors?.muted || '#64748b'};
  letter-spacing: 0.05em;
`
const DashValue = styled.div`
  font-size: 0.95rem;
  font-weight: 600;
  color: ${({ theme }) => theme?.colors?.text || '#0f172a'};
`
const UrgencyBadge = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  background: ${({ $urgency }) => $urgency === 'critical' ? '#fee2e2' : $urgency === 'urgent' ? '#fef3c7' : '#e0f2fe'};
  color: ${({ $urgency }) => $urgency === 'critical' ? '#dc2626' : $urgency === 'urgent' ? '#d97706' : '#0284c7'};
  margin-left: 8px;
  vertical-align: middle;
`

const Summary = styled.section`
  width: 100%;
  max-width: 520px;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.10)' : theme.colors.border)};
  background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(220, 38, 38, 0.12)' : 'rgba(220, 38, 38, 0.06)')};
  padding: 12px 12px;
  margin-top: 10px;

  @media (max-width: 640px) {
    display: ${({ $videoFocus }) => ($videoFocus ? 'none' : 'block')};
  }

  @media (min-width: 980px) {
    grid-column: 2;
    grid-row: 1 / span 5;
    max-width: none;
    min-height: 310px;
    margin-top: 10px;
    align-self: stretch;
    background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(15,23,42,0.92)' : '#ffffff')};
    border-color: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(220,38,38,0.16)')};
    box-shadow: 0 18px 46px rgba(15, 31, 68, 0.14);
  }
`

const Prescription = styled.section`
  width: 100%;
  max-width: 520px;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.10)' : theme.colors.border)};
  background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : theme.colors.surface)};
  padding: 12px 12px;
  margin-top: 10px;

  @media (max-width: 640px) {
    display: ${({ $videoFocus }) => ($videoFocus ? 'none' : 'block')};
  }

  @media (min-width: 980px) {
    grid-column: 2;
    grid-row: 6 / span 5;
    max-width: none;
    margin-top: 0;
    align-self: stretch;
    box-shadow: 0 18px 46px rgba(15, 31, 68, 0.1);
  }
`

const PrescriptionTitle = styled.div`
  font-weight: 950;
  letter-spacing: -0.02em;
`

const PrescriptionSub = styled.div`
  margin-top: 4px;
  color: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(241,245,249,0.72)' : theme.colors.muted)};
  font-weight: 750;
  font-size: 0.92rem;
`

const PrescriptionInput = styled.textarea`
  width: 100%;
  margin-top: 10px;
  min-height: 94px;
  resize: vertical;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.12)' : theme.colors.border)};
  background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(0,0,0,0.18)' : theme.colors.surfaceAlt)};
  color: ${({ theme }) => theme.colors.text};
  padding: 12px 12px;
  font: inherit;
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.glowBlue};
  }
`

const SendRxBtn = styled.button`
  margin-top: 10px;
  width: 100%;
  min-height: 46px;
  border-radius: 14px;
  border: 0;
  cursor: pointer;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  font-weight: 950;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const SummaryLabel = styled.div`
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 1000;
  color: ${({ theme }) => theme.colors.primary};
`

const SummaryText = styled.div`
  margin-top: 8px;
  color: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(241,245,249,0.88)' : theme.colors.text)};
  font-weight: 750;
  line-height: 1.55;
  font-size: 0.95rem;
`

const CompanionThread = styled.div`
  margin-top: 12px;
  display: grid;
  gap: 10px;
  max-height: 310px;
  overflow-y: auto;
  padding-right: 2px;
`

const CompanionBubble = styled.div`
  border-radius: 16px;
  padding: 11px 12px;
  line-height: 1.45;
  font-weight: 750;
  font-size: 0.92rem;
  background: ${({ theme, $from }) =>
    $from === 'user'
      ? theme.mode === 'dark'
        ? 'rgba(239,68,68,0.18)'
        : 'rgba(220,38,38,0.08)'
      : theme.mode === 'dark'
        ? 'rgba(255,255,255,0.06)'
        : 'rgba(248,250,252,0.95)'};
  border: 1px solid ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.10)' : theme.colors.border)};
  color: ${({ theme }) => theme.colors.text};
`

const TemplateRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 8px;
`

const TemplateChip = styled.button`
  background: ${({ theme }) => theme?.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#e2e8f0'};
  color: ${({ theme }) => theme?.colors?.text};
  border: none;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  
  &:hover {
    background: ${({ theme }) => theme?.mode === 'dark' ? 'rgba(255,255,255,0.12)' : '#cbd5e1'};
  }
`

const CompanionForm = styled.form`
  margin-top: 12px;
  min-height: 44px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.12)' : theme.colors.border)};
  background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(2,6,23,0.48)' : '#f8fafc')};
  color: ${({ theme }) => theme.colors.muted};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 10px 8px 14px;
  font-weight: 800;
  font-size: 0.9rem;

  &:focus-within {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.glowBlue};
  }
`

const CompanionInput = styled.input`
  min-width: 0;
  flex: 1 1 auto;
  border: 0;
  outline: 0;
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  font: inherit;
  font-weight: 800;

  &::placeholder {
    color: ${({ theme }) => theme.colors.muted};
  }
`

const CompanionSend = styled.button`
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 1000;
  cursor: pointer;

  &:disabled {
    opacity: 0.52;
    cursor: not-allowed;
  }
`

const VideoPane = styled.section`
  width: 100%;
  max-width: none;
  border-radius: 22px;
  border: 1px solid ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.12)' : theme.colors.border)};
  overflow: hidden;
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(220,38,38,0.22) 0%, rgba(2,6,23,0.65) 70%)'
      : 'linear-gradient(135deg, rgba(220,38,38,0.18) 0%, rgba(255,255,255,0.95) 70%)'};
  padding: 14px;
  display: grid;
  gap: 6px;
  text-align: left;
  position: relative;
  min-height: ${({ $expanded }) => ($expanded ? 'min(78vh, 820px)' : '390px')};
  align-content: start;

  @media (max-width: 640px) {
    border-radius: ${({ $expanded }) => ($expanded ? '0' : '18px')};
    border: ${({ $expanded, theme }) => ($expanded ? '0' : `1px solid ${theme.colors.border}`)};
    padding: ${({ $expanded }) => ($expanded ? '8px' : '10px')};
    min-height: ${({ $expanded }) => ($expanded ? '100vh' : 'min(74vh, 560px)')};
    height: ${({ $expanded }) => ($expanded ? '100vh' : 'auto')};
  }

  @media (min-width: 980px) {
    max-width: none;
    grid-row: 1 / span 9;
    align-self: stretch;
    min-height: ${({ $expanded }) => ($expanded ? 'min(82vh, 900px)' : '720px')};
  }
`

const VideoHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  position: relative;
  z-index: 3;
  padding: 4px 2px 2px;

  @media (max-width: 640px) {
    position: absolute;
    top: 8px;
    left: 8px;
    right: 8px;
    color: #fff;
    padding: 8px;
    border-radius: 18px;
    background: rgba(2, 6, 23, 0.36);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
`

const VideoIndicators = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`

const Indicator = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  padding: 6px 10px;
  font-weight: 950;
  font-size: 0.78rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme, $tone }) => {
    if ($tone === 'live') return theme.mode === 'dark' ? 'rgba(239,68,68,0.22)' : 'rgba(239,68,68,0.12)'
    return theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : theme.colors.surfaceAlt
  }};
  color: ${({ theme, $tone }) => {
    if ($tone === 'live') return theme.mode === 'dark' ? '#fecaca' : '#7f1d1d'
    return theme.colors.text
  }};
`

const IndicatorDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: ${({ $tone }) => ($tone === 'live' ? '#ef4444' : '#94a3b8')};
  box-shadow: ${({ $tone }) => ($tone === 'live' ? '0 0 0 5px rgba(239,68,68,0.14)' : 'none')};
`

const VideoTitle = styled.div`
  font-weight: 1000;
  letter-spacing: -0.02em;
`

const VideoSub = styled.div`
  color: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(241,245,249,0.78)' : theme.colors.muted)};
  font-weight: 750;
  font-size: 0.92rem;
  line-height: 1.4;

  @media (max-width: 640px) {
    display: none;
  }
`

const VideoEl = styled.video`
  width: 100%;
  border-radius: 14px;
  background: rgba(2, 6, 23, 0.65);
  aspect-ratio: 16 / 10;
  object-fit: cover;
  min-height: ${({ $primary }) => ($primary ? '280px' : 'auto')};

  @media (min-width: 980px) {
    height: ${({ $primary }) => ($primary ? '100%' : 'auto')};
    min-height: ${({ $primary }) => ($primary ? '500px' : 'auto')};
  }

  @media (max-width: 640px) {
    min-height: ${({ $primary }) => ($primary ? '100%' : 'auto')};
    height: ${({ $primary }) => ($primary ? '100%' : 'auto')};
    border-radius: ${({ $primary }) => ($primary ? '18px' : '14px')};
  }
`

const VideoActions = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    gap: 6px;

    ${Indicator}:not(:first-child) {
      display: none;
    }
  }
`

const VideoActionBtn = styled.button`
  border-radius: 999px;
  padding: 10px 12px;
  cursor: pointer;
  font-weight: 950;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : theme.colors.surface)};
  color: ${({ theme }) => theme.colors.text};
`

const VideoError = styled.div`
  margin-top: 8px;
  color: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(254,202,202,0.9)' : '#7f1d1d')};
  font-weight: 750;
  line-height: 1.45;
  font-size: 0.92rem;
`

const RetryBtn = styled.button`
  margin-top: 10px;
  border-radius: 999px;
  padding: 10px 12px;
  cursor: pointer;
  font-weight: 950;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : theme.colors.surface)};
  color: ${({ theme }) => theme.colors.text};
`

const VideoCanvas = styled.div`
  position: relative;
  min-height: 0;
  height: 100%;
  border-radius: 20px;
  overflow: hidden;
  background:
    radial-gradient(circle at 20% 0%, rgba(220, 38, 38, 0.22), transparent 34%),
    linear-gradient(135deg, rgba(2, 6, 23, 0.92), rgba(15, 23, 42, 0.78));

  ${VideoEl} {
    display: block;
  }

  @media (min-width: 980px) {
    min-height: ${({ $expanded }) => ($expanded ? '720px' : '620px')};
  }

  @media (max-width: 640px) {
    min-height: ${({ $expanded }) => ($expanded ? 'calc(100vh - 16px)' : 'min(58vh, 430px)')};
    height: ${({ $expanded }) => ($expanded ? 'calc(100vh - 16px)' : 'min(58vh, 430px)')};
    border-radius: ${({ $expanded }) => ($expanded ? '22px' : '16px')};
  }
`

const LocalPip = styled(VideoEl)`
  position: absolute;
  width: clamp(112px, 18vw, 170px);
  height: clamp(78px, 12vw, 112px);
  right: 14px;
  bottom: 84px;
  border-radius: 18px;
  border: 1px solid rgba(255,255,255,0.22);
  box-shadow: 0 18px 42px rgba(0,0,0,0.28);
  z-index: 3;

  @media (max-width: 640px) {
    width: 92px;
    height: 68px;
    right: 12px;
    bottom: 88px;
  }
`

const VideoNameTag = styled.div`
  position: absolute;
  left: 14px;
  bottom: 86px;
  z-index: 3;
  border-radius: 999px;
  padding: 9px 12px;
  background: rgba(2, 6, 23, 0.64);
  color: #fff;
  font-weight: 950;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);

  @media (max-width: 640px) {
    left: 12px;
    bottom: 90px;
    max-width: calc(100% - 126px);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: 0.78rem;
  }
`

const VideoTimer = styled.div`
  position: absolute;
  left: 50%;
  top: 16px;
  transform: translateX(-50%);
  z-index: 3;
  border-radius: 999px;
  padding: 9px 14px;
  background: rgba(2, 6, 23, 0.64);
  color: #fff;
  font-variant-numeric: tabular-nums;
  font-size: 1.05rem;
  font-weight: 1000;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
`

const VideoFloatingControls = styled.div`
  position: absolute;
  left: 14px;
  right: 14px;
  bottom: 14px;
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border-radius: 24px;
  padding: 12px 14px;
  background: rgba(2, 6, 23, 0.74);
  border: 1px solid rgba(255,255,255,0.12);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);

  @media (max-width: 640px) {
    left: 12px;
    right: 12px;
    bottom: 12px;
    padding: 10px 12px;
  }
`

const Controls = styled.div`
  width: 100%;
  display: ${({ $videoOn }) => ($videoOn ? 'none' : 'flex')};
  justify-content: center;
  gap: 14px;
  margin-top: 10px;
`

const IconBtn = styled.button`
  width: 48px;
  height: 48px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.12)' : theme.colors.border)};
  background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : theme.colors.surface)};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 18px;
    height: 18px;
  }

  @media (hover: hover) {
    &:hover {
      transform: translateY(-1px);
      background: rgba(255, 255, 255, 0.08);
    }
  }
`

const EndCallBtn = styled(IconBtn)`
  border-color: rgba(239, 68, 68, 0.38);
  background: rgba(239, 68, 68, 0.22);
  color: #fff;
`

const Prompt = styled.section`
  width: 100%;
  max-width: 520px;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.10)' : theme.colors.border)};
  background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(0,0,0,0.22)' : theme.colors.surface)};
  padding: 12px 12px;
  margin-top: 10px;
`

const PromptTitle = styled.div`
  font-weight: 950;
  text-align: center;
`

const PromptActions = styled.div`
  display: grid;
  gap: 10px;
  margin-top: 12px;

  @media (min-width: 520px) {
    grid-template-columns: 1fr 1fr;
  }
`

const PrimaryBtn = styled.button`
  border: 0;
  border-radius: 14px;
  min-height: 44px;
  cursor: pointer;
  font-weight: 950;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
`

const GhostBtn = styled.button`
  border-radius: 14px;
  min-height: 44px;
  cursor: pointer;
  font-weight: 950;
  border: 1px solid ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.14)' : theme.colors.border)};
  background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : theme.colors.surfaceAlt)};
  color: ${({ theme }) => theme.colors.text};
`

const Confirm = styled.section`
  width: 100%;
  max-width: 520px;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.10)' : theme.colors.border)};
  background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : theme.colors.surface)};
  padding: 12px 12px;
  margin-top: 10px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 750;
  line-height: 1.55;
`

function formatTimer(seconds) {
  const s = Math.max(0, Number(seconds) || 0)
  const mm = String(Math.floor(s / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return `${mm}:${ss}`
}

function Icon({ name }) {
  if (name === 'mute') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <path d="M12 19v4" />
        <path d="M8 23h8" />
      </svg>
    )
  }
  if (name === 'video') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M23 7l-7 5 7 5V7z" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    )
  }
  if (name === 'chat') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
      </svg>
    )
  }
  if (name === 'end') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.86.3 1.7.54 2.52a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.56-1.56a2 2 0 0 1 2.11-.45c.82.24 1.66.42 2.52.54A2 2 0 0 1 22 16.92z" />
        <path d="M16 8l6 6" />
        <path d="M22 8l-6 6" />
      </svg>
    )
  }
  if (name === 'flip') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="17 1 21 5 17 9" />
        <path d="M3 11V9a4 4 0 0 1 4-4h14" />
        <polyline points="7 23 3 19 7 15" />
        <path d="M21 13v2a4 4 0 0 1-4 4H3" />
      </svg>
    )
  }
  if (name === 'share') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    )
  }
  return null
}

export default function DoctorSessionScreen() {
  const { setActivePage } = useAppState()
  const { users, currentUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const initialCallType = useMemo(() => {
    const raw = location.state?.callType || location.state?.callItem?.consultation_type
    if (!raw) return 'video' // Default to video instead of voice when no type is explicitly passed
    const t = String(raw).trim().toLowerCase()
    return t === 'voice' ? 'voice' : 'video' // Anything other than explicitly 'voice' gets video
  }, [location.state])

  const sessionKey = useMemo(() => {
    const raw = location.state || {}
    const key = raw.sessionKey || raw.requestId || raw.doctorId || raw.sessionId || raw.caseId || ''
    return String(key)
  }, [location.state])

  const role = currentUser?.role ? String(currentUser.role) : ''
  const isClinician = role === 'doctor' || role === 'nurse'
  const doctor = useMemo(() => ({ name: 'Dr. Adaeze Okonkwo', meta: 'Emergency Medicine - Lagos', status: 'Online', lastActive: 'Active now' }), [])

  const patient = useMemo(() => users.find((user) => user.role === 'patient') || null, [users])
  const [prescriptionText, setPrescriptionText] = useState('')
  const [prescriptionSent, setPrescriptionSent] = useState(false)
  const [companionInput, setCompanionInput] = useState('')
  const [companionMessages, setCompanionMessages] = useState(() => [
    { id: 'seed-user', from: 'user', text: 'What should I focus on before prescribing?' },
    {
      id: 'seed-ai-1',
      from: 'ai',
      text: 'Prioritize red flags: chest pain pattern, breathlessness severity, BP history, allergy profile, and medication interactions.',
    },
    {
      id: 'seed-ai-2',
      from: 'ai',
      text: 'Suggested next step: document findings, give safety-net advice, then send prescription or referral notes to the patient.',
    },
  ])

  const callItem = location.state?.callItem

  const [liveBrief, setLiveBrief] = useState(callItem || null)

  useEffect(() => {
    // If callItem was not passed (e.g., patient entering directly from wait screen), fetch their brief
    if (!liveBrief && currentUser?.submission_key) {
      const fetchBrief = async () => {
        const { data } = await supabase
          .from('clinical_briefs')
          .select('*')
          .eq('submission_key', currentUser.submission_key)
          .single()
          
        if (data) {
          try {
            const parsedDiagnoses = typeof data.probable_diagnosis === 'string' ? JSON.parse(data.probable_diagnosis) : (data.probable_diagnosis || [])
            const parsedFindings = typeof data.supportive_findings === 'string' ? JSON.parse(data.supportive_findings) : (data.supportive_findings || [])
            const parsedRedFlags = typeof data.red_flags === 'string' ? JSON.parse(data.red_flags) : (data.red_flags || [])
            
            let age = '-'
            if (data.dob) {
              age = new Date().getFullYear() - new Date(data.dob).getFullYear()
            }
            
            setLiveBrief({
              ...data,
              fullName: data.patient_name || 'Emergency Caller',
              age,
              sex: data.gender === 'female' ? 'F' : (data.gender === 'male' ? 'M' : 'U'),
              complaint: data.presentation || data.clinical_summary || 'No presentation recorded',
              diagnoses: parsedDiagnoses,
              findings: parsedFindings,
              redFlags: parsedRedFlags,
            })
          } catch {
          // Ignore
        }
        }
      }
      fetchBrief()
    }
  }, [liveBrief, currentUser])

  const summary = useMemo(
    () => ({
      patientName: liveBrief?.fullName || liveBrief?.patient_name || 'Emergency Caller',
      patientAge: liveBrief?.age || '-',
      patientSex: liveBrief?.sex || '-',
      complaint: liveBrief?.complaint || liveBrief?.presentation || 'No complaint recorded',
      blood: liveBrief?.kit?.blood || liveBrief?.blood_group || '-',
      genotype: liveBrief?.kit?.genotype || liveBrief?.genotype || '-',
      allergy: liveBrief?.kit?.allergy || 'None',
    }),
    [liveBrief],
  )

  const paidMins = useMemo(() => {
    if (callItem?.paidMins) return Number(callItem.paidMins)
    const raw = location.state && (location.state.paidMinutes || location.state.paidMins || location.state.minutes)
    const mins = Number(raw)
    if (!mins || !Number.isFinite(mins) || mins <= 0) return 5 // Default to 5 instead of 0 to prevent blocking the video
    // Only allow the supported durations for now.
    return mins === 10 ? 10 : 5
  }, [location.state, callItem])

  const hasFreeMinute = useMemo(() => {
    if (paidMins > 0) return false
    const last = Number(localStorage.getItem('ee_last_free_session')) || 0
    const oneWeek = 7 * 24 * 60 * 60 * 1000
    // eslint-disable-next-line react-hooks/purity
    return Date.now() - last > oneWeek
  }, [paidMins])

  useEffect(() => {
    if (hasFreeMinute && !paidMins) {
      localStorage.setItem('ee_last_free_session', Date.now())
    }
  }, [hasFreeMinute, paidMins])

  const [secondsLeft, setSecondsLeft] = useState(() => {
    if (isClinician) return (paidMins || 5) * 60
    if (paidMins) return paidMins * 60
    // Patient from waiting room always gets the paid duration
    const key = location.state?.sessionKey || ''
    if (key && key.length > 6) return 5 * 60
    return hasFreeMinute ? 60 : 0
  })
  const [mode, setMode] = useState(() => {
    if (isClinician) return 'paid'
    if (paidMins) return 'paid'
    // Patient arriving from waiting room (sessionKey is real queue ID) has already paid
    const key = location.state?.sessionKey || location.state?.requestId || ''
    if (key && key.length > 6) return 'paid'
    if (hasFreeMinute) return 'free'
    return 'prompt'
  }) // free | prompt | paid | waiting | ended
  const [videoOn, setVideoOn] = useState(() => initialCallType === 'video')
  const [videoLayout, setVideoLayout] = useState(() => (initialCallType === 'video' ? 'full' : 'mini')) // mini | full
  const [videoError] = useState('')
  const [callStatus] = useState('Waiting') // Waiting | Connecting | Connected | Disconnected
  const intervalRef = useRef(null)
  const modeRef = useRef(mode)


  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  const isTimerActive = mode === 'free' || mode === 'paid'

  useEffect(() => {
    if (mode === 'prompt' || mode === 'waiting' || mode === 'ended') return
    intervalRef.current = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(intervalRef.current)
          if (modeRef.current === 'free') setMode('prompt')
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => {
      window.clearInterval(intervalRef.current)
    }
  }, [mode])


  useEffect(() => {
    // Only allow video while the session timer is actively running.
    if (!isTimerActive) {
      setVideoLayout('mini')
      setVideoOn(false)
    }
  }, [isTimerActive])


  

  useEffect(() => {
    if (!videoOn) setVideoLayout('mini')
  }, [videoOn])

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('ee:live-fullscreen', { detail: { active: videoOn && videoLayout === 'full' } }))
    return () => {
      window.dispatchEvent(new CustomEvent('ee:live-fullscreen', { detail: { active: false } }))
    }
  }, [videoLayout, videoOn])




  const endCall = useCallback(async () => {
    window.clearInterval(intervalRef.current)
    setMode('ended')

    if (sessionKey) {
      try {
        const token = (await supabase.auth.getSession()).data.session?.access_token
        await fetch('/api/call_queue/end', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
            'x-echo-user-id': currentUser?.id || '',
            'x-echo-user-email': currentUser?.email || '',
          },
          body: JSON.stringify({ sessionKey, paidMins })
        })
      } catch (err) {
        console.error('Error ending call', err)
      }
    }
  }, [sessionKey, paidMins])

  useEffect(() => {
    if (secondsLeft === 0 && mode === 'paid') {
      endCall()
    }
  }, [secondsLeft, mode, endCall])

  const buyMinutes = (mins) => {
    window.clearInterval(intervalRef.current)
    navigate('/app/payment', { state: { minutes: Number(mins), returnTo: 'doctor-live' } })
  }

  const wait24h = () => {
    window.clearInterval(intervalRef.current)
    setMode('waiting')
  }

  const videoFocus = videoOn && videoLayout === 'full'

  const sendCompanionMessage = (event) => {
    event.preventDefault()
    const text = String(companionInput || '').trim()
    if (!text) return

    const lower = text.toLowerCase()
    let reply = `For ${summary.patientName}, keep the response tied to the current complaint (${summary.complaint}), documented condition (${summary.condition}), and allergy (${summary.allergy}).`
    
    if (lower.includes('prescrib') || lower.includes('drug') || lower.includes('med')) {
      reply = `Suggested Prescription: Paracetamol 1g every 8 hours for 3 days (Placeholder). I have copied this to your prescription pad. Please verify patient allergies to ${summary.allergy} before sending.`
      setPrescriptionText('Paracetamol 1g every 8 hours for 3 days (Placeholder)')
    } else if (lower.includes('patient') || lower.includes('who') || lower.includes('tell me about') || lower.includes('summary') || lower.includes('context')) {
      reply = `This is ${summary.patientName}, a ${summary.patientAge}yo patient presenting with ${summary.complaint}. They have a history of ${summary.condition} and an allergy to ${summary.allergy}.`
    } else if (lower.includes('question') || lower.includes('ask')) {
      reply = 'Ask onset, pain location/radiation, severity, triggers, breathlessness level, BP readings, current medications, and any previous similar episode.'
    }

    setCompanionMessages((messages) => [
      ...messages,
      { id: `user-${Date.now()}`, from: 'user', text },
      { id: `ai-${Date.now()}`, from: 'ai', text: reply },
    ])
    setCompanionInput('')
  }

  const sendPrescription = () => {
    if (!isClinician) return
    if (!patient?.id) return
    const note = String(prescriptionText || '').trim()
    if (!note) return

    const clinicianName = String(currentUser?.fullName || (role === 'nurse' ? 'Nurse' : 'Doctor')).trim() || 'Clinician'
    const title = String(currentUser?.title || '').trim()
    const from = title ? `${title} ${clinicianName}` : clinicianName

    addNotificationForUser(patient.id, {
      type: 'message',
      title: `Prescription from ${from}`,
      message: note,
      unread: true,
    })
    setPrescriptionSent(true)
  }

  return (
    <Wrap $videoFocus={videoFocus}>
      <TopBar $videoFocus={videoFocus}>
        {!isClinician ? (
          <EndBtn type="button" onClick={() => setActivePage('home')}>
            <span aria-hidden="true">X</span> End
          </EndBtn>
        ) : <div />}
        <Secure>
          <Dot />
          {isClinician ? `Echo (${videoOn ? 'Video' : 'Voice'}) - ${paidMins || 5} mins` : (videoOn ? 'Secure Video Call' : 'Secure Voice Call')}
        </Secure>
      </TopBar>

      <Body $videoFocus={videoFocus}>
        <VideoPane $expanded={videoLayout === 'full'} aria-label="Video call">
          <VideoHeaderRow>
              <div style={{ minWidth: 0 }}>
                <VideoTitle>EmergencyEcho Video</VideoTitle>
                <VideoSub>Secure clinician workspace with EchoAI beside the patient call.</VideoSub>
              </div>
              <VideoActions>
                <VideoIndicators aria-label="Video indicators">
                  <Indicator $tone="live">
                    <IndicatorDot aria-hidden="true" $tone="live" /> Live
                  </Indicator>
                  <Indicator aria-label={`Call status: ${callStatus}`}>
                    <IndicatorDot aria-hidden="true" /> {callStatus}
                  </Indicator>
                  <Indicator>
                    <IndicatorDot aria-hidden="true" /> Encrypted
                  </Indicator>
                </VideoIndicators>
                <VideoActionBtn
                  type="button"
                  onClick={() => setVideoLayout((layout) => (layout === 'full' ? 'mini' : 'full'))}
                  aria-label={videoLayout === 'full' ? 'Restore navigation column' : 'Expand video workspace'}
                >
                  {videoLayout === 'full' ? 'Restore nav' : 'Expand video'}
                </VideoActionBtn>
              </VideoActions>
            </VideoHeaderRow>

            <VideoCanvas $expanded={videoLayout === 'full'}>
              <VideoTimer>{formatTimer(secondsLeft)}</VideoTimer>

              <LiveKitSessionRoom
                currentUser={currentUser}
                roomSeed={{
                  ...location.state,
                  sessionKey,
                  requestId: location.state?.requestId || '',
                  submissionKey: location.state?.submissionKey || location.state?.callItem?.submission_key || currentUser?.submission_key || '',
                  doctorId: location.state?.doctorId || currentUser?.id || '',
                  source: location.state?.source || '',
                }}
                roomName={`EmergencyEcho_${sessionKey || 'Demo'}`}
                role={isClinician ? role : 'patient'}
                callType={initialCallType}
                displayName={isClinician ? (currentUser?.fullName || 'Clinician') : (currentUser?.fullName || 'Patient')}
                identity={currentUser?.submission_key || currentUser?.id || currentUser?.email || role || 'participant'}
                onLeave={endCall}
                onError={(err) => console.error('LiveKit room error:', err)}
              />

              <VideoNameTag>{isClinician ? summary.patientName : doctor.name}</VideoNameTag>

            </VideoCanvas>
            {videoError ? (
              <>
                <VideoError>{videoError}</VideoError>
                <RetryBtn
                  type="button"
                  onClick={() => {
                    setVideoOn(false)
                    window.setTimeout(() => setVideoOn(true), 20)
                  }}
                >
                  Retry camera
                </RetryBtn>
              </>
            ) : null}
          </VideoPane>

        {isClinician ? (
          <Summary $videoFocus={videoFocus}>
            <SummaryLabel>Clinical Brief</SummaryLabel>
            <DashboardGrid>
              <DashCardFull>
                <DashLabel>Presenting Complaint</DashLabel>
                <DashValue>
                  {summary.complaint}
                  <UrgencyBadge $urgency={String(liveBrief?.severity || 'routine').toLowerCase()}>
                    {liveBrief?.severity || 'Routine'}
                  </UrgencyBadge>
                </DashValue>
              </DashCardFull>
              <DashCard>
                <DashLabel>Probable Diagnosis</DashLabel>
                <DashValue>{Array.isArray(liveBrief?.candidate_diagnoses) ? liveBrief.candidate_diagnoses.join(', ') : 'Pending AI Triage'}</DashValue>
              </DashCard>
              <DashCard>
                <DashLabel>Supportive Findings</DashLabel>
                <DashValue>{Array.isArray(liveBrief?.positive_findings) ? liveBrief.positive_findings.join(', ') : 'Pending AI Triage'}</DashValue>
              </DashCard>
              <DashCardFull>
                <DashLabel>Vitals & Allergies</DashLabel>
                <DashValue>Blood {summary.blood} / Genotype {summary.genotype} | <span style={{color: '#dc2626'}}>{summary.allergy}</span></DashValue>
              </DashCardFull>
            </DashboardGrid>

            <SummaryLabel>EchoAI Companion</SummaryLabel>
            <CompanionThread aria-label="EchoAI companion messages">
              {companionMessages.map((message) => (
                <CompanionBubble key={message.id} $from={message.from}>
                  {message.text}
                </CompanionBubble>
              ))}
            </CompanionThread>
            <CompanionForm onSubmit={sendCompanionMessage}>
              <CompanionInput
                aria-label="Ask EchoAI about this patient session"
                placeholder="Ask EchoAI about this patient session..."
                value={companionInput}
                onChange={(event) => setCompanionInput(event.target.value)}
              />
              <CompanionSend aria-label="Send EchoAI companion message" disabled={!String(companionInput || '').trim()} type="submit">
                {'>'}
              </CompanionSend>
            </CompanionForm>
          </Summary>
        ) : null}

        {role === 'doctor' ? (
          <Prescription $videoFocus={videoFocus} aria-label="Prescription composer">
            <PrescriptionTitle>Prescription / plan</PrescriptionTitle>
            <PrescriptionSub>Type medications and next steps. This will be sent to the patient as a notification.</PrescriptionSub>
            <TemplateRow>
              <TemplateChip type="button" onClick={() => setPrescriptionText(t => t + (t ? '\n' : '') + 'Rx: ')}>Rx</TemplateChip>
              <TemplateChip type="button" onClick={() => setPrescriptionText(t => t + (t ? '\n' : '') + 'Test Review: ')}>Test Review</TemplateChip>
              <TemplateChip type="button" onClick={() => setPrescriptionText(t => t + (t ? '\n' : '') + 'Referral: ')}>Referral</TemplateChip>
              <TemplateChip type="button" onClick={() => setPrescriptionText(t => t + (t ? '\n' : '') + 'Dietary Plan: ')}>Dietary Plan</TemplateChip>
              <TemplateChip type="button" onClick={() => setPrescriptionText(t => t + (t ? '\n' : '') + 'General Advice: ')}>General Advice</TemplateChip>
            </TemplateRow>
            <PrescriptionInput
              placeholder="e.g. Paracetamol 1g every 8 hours for 3 days. Drink fluids. Return immediately if chest pain worsens..."
              value={prescriptionText}
              onChange={(e) => {
                setPrescriptionSent(false)
                setPrescriptionText(e.target.value)
              }}
            />
            <SendRxBtn type="button" onClick={sendPrescription} disabled={!String(prescriptionText || '').trim() || !patient?.id}>
              {prescriptionSent ? 'Sent to patient' : 'Send to patient'}
            </SendRxBtn>
          </Prescription>
        ) : null}



        {mode === 'prompt' ? (
          <Prompt>
            <PromptTitle>Your free 1 minute for this week has ended. Continue?</PromptTitle>
            <PromptActions>
              <PrimaryBtn type="button" onClick={() => buyMinutes(5)}>
                Buy 5 mins (NGN 1,000)
              </PrimaryBtn>
              <PrimaryBtn type="button" onClick={() => buyMinutes(10)}>
                Buy 10 mins (NGN 1,500)
              </PrimaryBtn>
              <GhostBtn type="button" onClick={wait24h}>
                Wait 1 week (Free)
              </GhostBtn>
              <GhostBtn type="button" onClick={endCall}>
                End call
              </GhostBtn>
            </PromptActions>
          </Prompt>
        ) : null}

        {mode === 'waiting' ? (
          <Confirm>
            Understood. Your consultation has been saved. Your doctor has notes and your medical history is recorded. When you return next week,
            you will not need to explain again.
            <br />
            <br />
            Your Emergency Kit has been updated with today's session.
          </Confirm>
        ) : null}

        {mode === 'ended' ? (
          <Confirm>
            Session ended. Your notes and the AI summary remain attached to this case.
            <br />
            <br />
            <GhostBtn
              type="button"
              onClick={() => {
                setActivePage('home')
              }}
              style={{ width: '100%', marginTop: 10 }}
            >
              Back to Home
            </GhostBtn>
          </Confirm>
        ) : null}
      </Body>
    </Wrap>
  )
}
