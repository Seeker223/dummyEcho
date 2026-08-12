import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import {
  LiveKitRoom,
  RoomAudioRenderer,
  VideoTrack,
  useConnectionState,
  useLocalParticipant,
  useParticipants,
  useRoomContext,
  useTracks,
} from '@livekit/components-react'
import { ConnectionState, RoomEvent, Track } from 'livekit-client'
import { buildLiveKitIdentity, buildLiveKitRoomName, getLiveKitServerUrl, requestLiveKitToken } from '../services/livekitService'

const Shell = styled.div`
  display: block;
  width: 100%;
  max-width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 360px;
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  background: #020617;
`

const LoadingState = styled.div`
  width: 100%;
  height: 100%;
  min-height: 360px;
  display: grid;
  place-items: center;
  padding: 24px;
  color: #fff;
  text-align: center;
  background: #0f172a;
`

const LoadingCard = styled.div`
  max-width: 380px;
  width: 100%;
  padding: 22px;
  border-radius: 20px;
  background: #111827;
  border: 1px solid #334155;
`

const LoadingTitle = styled.div`
  font-size: 1rem;
  font-weight: 950;
  margin-bottom: 8px;
`

const LoadingText = styled.div`
  font-size: 0.88rem;
  line-height: 1.55;
  color: rgba(241, 245, 249, 0.78);
`

const ErrorCard = styled(LoadingCard)`
  border-color: rgba(248, 113, 113, 0.38);
`

const ErrorText = styled.div`
  color: #fecaca;
  font-size: 0.88rem;
  line-height: 1.55;
`

const RetryButton = styled.button`
  margin-top: 14px;
  border: 0;
  border-radius: 999px;
  padding: 10px 16px;
  background: #dc2626;
  color: #fff;
  font-weight: 900;
  cursor: pointer;
`

const RoomFrame = styled.div`
  display: block;
  width: 100%;
  max-width: 100%;
  height: 100%;
  min-height: 100%;
  position: relative;
  background: #020617;
`

const VideoStage = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  inset: 0;
  padding: 8px;
  overflow: hidden;
  display: grid;
  align-content: stretch;
  box-sizing: border-box;
`

const Tile = styled.button`
  position: relative;
  width: 100%;
  min-height: 210px;
  padding: 0;
  overflow: hidden;
  border: 1px solid ${({ $speaking, $active }) => ($speaking ? 'rgba(74, 222, 128, 0.75)' : $active ? 'rgba(248, 113, 113, 0.65)' : 'rgba(148, 163, 184, 0.14)')};
  border-radius: 18px;
  background: linear-gradient(135deg, #111827, #020617);
  box-shadow: ${({ $speaking, $active }) => ($speaking ? '0 0 0 2px rgba(74, 222, 128, 0.16), 0 20px 48px rgba(2, 6, 23, 0.34)' : $active ? '0 0 0 2px rgba(220, 38, 38, 0.18), 0 20px 48px rgba(2, 6, 23, 0.34)' : '0 16px 36px rgba(2, 6, 23, 0.28)')};
  cursor: pointer;
  text-align: left;
  ${({ $compact }) => $compact && `min-height: 118px; border-radius: 14px;`}

  &:focus-visible {
    outline: 3px solid rgba(248, 113, 113, 0.55);
    outline-offset: 2px;
  }
`

const VideoWrap = styled.div`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  background: #0f172a;

  /* LiveKit's VideoTrack wraps the <video> element. Stretch every layer so
     the participant feed fills the entire tile instead of preserving the
     camera's portrait aspect ratio as a narrow column. */
  & > div,
  & .lk-video-track,
  & .lk-video-track > div {
    position: absolute !important;
    inset: 0 !important;
    width: 100% !important;
    height: 100% !important;
    min-width: 0 !important;
    min-height: 0 !important;
  }

  video,
  canvas {
    display: block;
    width: 100% !important;
    height: 100% !important;
    min-width: 100% !important;
    min-height: 100% !important;
    object-fit: cover !important;
  }
`

const Placeholder = styled.div`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle at 50% 30%, rgba(148, 163, 184, 0.1), transparent 28%),
    linear-gradient(135deg, #1e293b, #020617);
`

const Avatar = styled.div`
  width: 78px;
  height: 78px;
  border-radius: 24px;
  display: grid;
  place-items: center;
  background: #1e293b;
  border: 1px solid #475569;
  color: #fff;
  font-size: 1.5rem;
  font-weight: 950;
`


const SpeakingAura = styled.div`
  position: relative;
  width: 118px;
  height: 118px;
  display: grid;
  place-items: center;

  &::before,
  &::after {
    content: '';
    position: absolute;
    inset: 8px;
    border: 1px solid rgba(74, 222, 128, 0.55);
    border-radius: 50%;
    opacity: ${({ $speaking }) => ($speaking ? 1 : 0)};
    transform: scale(${({ $speaking }) => ($speaking ? 1 : 0.82)});
    transition: opacity 180ms ease, transform 180ms ease;
  }

  &::after {
    inset: -3px;
    border-color: rgba(74, 222, 128, 0.22);
    transform: scale(${({ $speaking }) => ($speaking ? 1 : 0.7)});
  }

  ${({ $speaking }) => $speaking && `
    animation: echo-speaking-pulse 1.15s ease-in-out infinite;
  `}

  @keyframes echo-speaking-pulse {
    0%, 100% { transform: scale(0.98); }
    50% { transform: scale(1.035); }
  }
`

const VoiceWaves = styled.div`
  position: absolute;
  left: 50%;
  bottom: -1px;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 3px;
  height: 24px;
  padding: 5px 8px;
  border-radius: 999px;
  background: #111827;
  border: 1px solid #334155;
  opacity: ${({ $speaking }) => ($speaking ? 1 : 0)};
  transition: opacity 180ms ease;
`

const WaveBar = styled.span`
  width: 3px;
  height: ${({ $height }) => $height}px;
  border-radius: 99px;
  background: #4ade80;
  transform-origin: center;
  opacity: ${({ $level }) => 0.45 + Math.min(1, Number($level) || 0) * 0.55};
  transform: scaleY(${({ $level }) => 0.5 + Math.min(1, Number($level) || 0) * 0.7});
  transition: transform 90ms linear, opacity 90ms linear;
`

const SpeakingBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  border-radius: 999px;
  background: #166534;
  border: 1px solid #4ade80;
  color: #dcfce7;
  font-size: 0.63rem;
  font-weight: 900;
`

const SpeakingDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #4ade80;
  box-shadow: 0 0 0 4px rgba(74, 222, 128, 0.12);
`

const TileTop = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  display: flex;
  justify-content: space-between;
  gap: 8px;
  z-index: 2;
`

const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 999px;
  background: #111827;
  border: 1px solid #334155;
  color: #e2e8f0;
  font-size: 0.66rem;
  font-weight: 850;
`

const TileBottom = styled.div`
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 10px;
  z-index: 2;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 10px;
`

const Name = styled.div`
  min-width: 0;
  color: #fff;
  font-size: 0.8rem;
  font-weight: 900;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Role = styled.div`
  margin-top: 2px;
  color: #cbd5e1;
  font-size: 0.66rem;
  font-weight: 700;
  text-transform: capitalize;
`

const FocusLayout = styled.div`
  width: 100%;
  height: 100%;
  min-height: 100%;
  display: grid;
  grid-template-rows: minmax(0, 1fr) 112px;
  gap: 8px;

  @media (max-width: 720px) {
    grid-template-rows: minmax(0, 1fr) 92px;
  }
`

const FocusMain = styled.div`
  width: 100%;
  min-width: 0;
  min-height: 0;
  display: grid;
  overflow: hidden;

  & > * {
    width: 100%;
    min-width: 0;
    min-height: 0;
  }
`

const FocusStrip = styled.div`
  min-width: 0;
  overflow-x: auto;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(150px, 220px);
  gap: 8px;
  padding-bottom: 2px;
`

const EmptyState = styled.div`
  min-height: 100%;
  display: grid;
  place-items: center;
  padding: 30px;
  text-align: center;
  color: #cbd5e1;
`

const EmptyCard = styled.div`
  max-width: 330px;
  padding: 26px;
  border-radius: 20px;
  background: #111827;
  border: 1px solid #334155;
`

const ControlNotice = styled.div`
  position: absolute;
  left: 50%;
  bottom: 74px;
  transform: translateX(-50%);
  z-index: 11;
  max-width: min(520px, calc(100% - 24px));
  padding: 8px 12px;
  border-radius: 10px;
  background: #ffffff;
  color: #0f172a;
  border: 1px solid #cbd5e1;
  box-shadow: 0 8px 22px rgba(2, 6, 23, 0.22);
  font-size: 0.72rem;
  font-weight: 800;
  text-align: center;
`

const FloatingBar = styled.div`
  position: absolute;
  left: 50%;
  bottom: 14px;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px;
  border-radius: 18px;
  background: #111827;
  border: 1px solid #334155;
  box-shadow: 0 14px 30px rgba(2, 6, 23, 0.38);
  max-width: calc(100% - 24px);
`

const Control = styled.button`
  width: 42px;
  height: 42px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 13px;
  background: ${({ $danger, $active }) => ($danger ? '#dc2626' : $active ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.07)')};
  color: #fff;
  font-size: 0.95rem;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: transform 160ms ease, background 160ms ease;

  &:hover { transform: translateY(-1px); background: ${({ $danger }) => ($danger ? '#b91c1c' : 'rgba(255, 255, 255, 0.14)')}; }
  &:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
  &:focus-visible { outline: 3px solid rgba(248, 113, 113, 0.55); outline-offset: 2px; }
`

const Divider = styled.span`
  width: 1px;
  height: 26px;
  background: rgba(255, 255, 255, 0.14);
  margin: 0 2px;
`

const StatusBar = styled.div`
  position: absolute;
  top: 14px;
  left: 14px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 10px;
  border-radius: 999px;
  background: #111827;
  border: 1px solid #334155;
  color: #e2e8f0;
  font-size: 0.68rem;
  font-weight: 850;
`

const StatusDot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${({ $tone }) => ($tone === 'danger' ? '#ef4444' : $tone === 'warning' ? '#f59e0b' : '#22c55e')};
`

const EndCallButton = styled(Control)`
  width: auto;
  padding: 0 14px;
  gap: 7px;
  font-size: 0.76rem;
  font-weight: 900;
`

function initials(name) {
  return String(name || 'Participant')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'P'
}

function roleFromParticipant(participant) {
  try {
    const metadata = JSON.parse(participant?.metadata || '{}')
    return metadata?.role || participant?.role || 'participant'
  } catch {
    return participant?.role || 'participant'
  }
}

function connectionLabel(state) {
  if (state === ConnectionState.Connected) return { label: 'Connected', tone: 'success' }
  if (state === ConnectionState.Reconnecting) return { label: 'Reconnecting', tone: 'warning' }
  if (state === ConnectionState.Disconnected) return { label: 'Disconnected', tone: 'danger' }
  return { label: 'Connecting', tone: 'warning' }
}

function useParticipantAudioLevel(participant) {
  const [level, setLevel] = useState(0)

  useEffect(() => {
    if (!participant?.isSpeaking) {
      setLevel(0)
      return undefined
    }

    const read = () => {
      const raw = Number(participant?.audioLevel)
      setLevel(Number.isFinite(raw) ? Math.max(0, Math.min(1, raw)) : 0.62)
    }

    read()
    const timer = window.setInterval(read, 90)
    return () => window.clearInterval(timer)
  }, [participant])

  return level
}

function qualityLabel(value) {
  if (typeof value === 'string') {
    const normalized = value.toLowerCase()
    if (normalized.includes('excellent')) return 'Excellent'
    if (normalized.includes('good')) return 'Good'
    if (normalized.includes('poor') || normalized.includes('bad')) return 'Poor'
    if (normalized.includes('lost')) return 'Lost'
  }

  const numeric = Number(value)
  if (numeric === 1) return 'Excellent'
  if (numeric === 2) return 'Good'
  if (numeric === 3) return 'Poor'
  if (numeric === 4) return 'Lost'
  return 'Unknown'
}

function ParticipantTile({ participant, trackRef, active, onSelect, compact = false }) {
  const name = participant?.name || participant?.identity || 'Participant'
  const role = roleFromParticipant(participant)
  const hasVideo = Boolean(trackRef?.publication?.isSubscribed && trackRef?.publication?.track)
  const cameraEnabled = participant?.isCameraEnabled !== false
  const microphoneEnabled = participant?.isMicrophoneEnabled !== false
  const speaking = Boolean(participant?.isSpeaking)
  const audioLevel = useParticipantAudioLevel(participant)
  const quality = qualityLabel(participant?.connectionQuality)

  const heights = [0.58, 0.88, 1, 0.72, 0.5, 0.8, 0.64].map((multiplier) => Math.round((9 + audioLevel * 19) * multiplier))

  return (
    <Tile type="button" $active={active} $speaking={speaking} $compact={compact} onClick={onSelect} aria-label={`Focus ${name}`}>
      <VideoWrap>
        {hasVideo && cameraEnabled ? (
          <>
            <VideoTrack trackRef={trackRef} />
            {speaking && (
              <div style={{ position: 'absolute', left: 12, bottom: 48, zIndex: 3 }}>
                <SpeakingBadge><SpeakingDot /> Speaking</SpeakingBadge>
              </div>
            )}
          </>
        ) : (
          <Placeholder>
            <SpeakingAura $speaking={speaking} $level={audioLevel}>
              <Avatar>{initials(name)}</Avatar>
              <VoiceWaves $speaking={speaking} aria-label={speaking ? `${name} is speaking` : `${name} is not speaking`}>
                {heights.map((height, index) => (
                  <WaveBar key={index} $height={height} $level={audioLevel} />
                ))}
              </VoiceWaves>
            </SpeakingAura>
          </Placeholder>
        )}
      </VideoWrap>

      <TileTop>
        <Chip>{role.replace('-', ' ')}</Chip>
        <Chip aria-label={`Connection quality: ${quality}`}>{quality}</Chip>
      </TileTop>

      <TileBottom>
        <div>
          <Name>{name}</Name>
          <Role>{participant?.isLocal ? 'You' : role}</Role>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Chip aria-label={microphoneEnabled ? 'Microphone on' : 'Microphone muted'}>
            <ControlIcon name={microphoneEnabled ? 'mic' : 'mic-off'} />
            {microphoneEnabled ? 'Mic' : 'Muted'}
          </Chip>
          {speaking && <SpeakingBadge><SpeakingDot /> Speaking</SpeakingBadge>}
        </div>
      </TileBottom>
    </Tile>
  )
}

function ControlIcon({ name }) {
  const common = { width: 19, height: 19, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true }
  if (name === 'mic') return <svg {...common}><path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3Z" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/><path d="M19 11a7 7 0 0 1-14 0M12 18v3M8.5 21h7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg>
  if (name === 'mic-off') return <svg {...common}><path d="M9.5 5.5A3 3 0 0 1 15 7v4M15 15a3 3 0 0 1-4.7-2.45M19 11a7 7 0 0 1-1.3 4.05M5 5l14 14M8.5 21h7M12 18v3" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>
  if (name === 'camera') return <svg {...common}><path d="M4 7.5h11a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.9"/><path d="m17 10 5-3v10l-5-3" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round"/></svg>
  if (name === 'camera-off') return <svg {...common}><path d="M3 7.5h8M15 7.5h1a2 2 0 0 1 2 2v.5l4-2.5v9l-4-2.5v.5a2 2 0 0 1-2 2H7M3 3l18 18" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>
  if (name === 'screen') return <svg {...common}><rect x="3" y="4" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.9"/><path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg>
  if (name === 'screen-off') return <svg {...common}><path d="M3 4h12M21 4v13H9M3 9v8h4M8 21h8M12 17v4M3 3l18 18" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>
  return <svg {...common}><path d="M8 5.5 5.8 7.1A2 2 0 0 0 5 8.75v6.5a2 2 0 0 0 .8 1.65L8 18.5M16 5.5l2.2 1.6a2 2 0 0 1 .8 1.65v6.5a2 2 0 0 1-.8 1.65L16 18.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/><path d="M9 8.5 15 15.5M15 8.5 9 15.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg>
}

function ConnectedRoom({ onParticipantsChange, onStatusChange, onNavigateHome, onVitalsChange }) {
  const connectionState = useConnectionState()
  const room = useRoomContext()
  const participants = useParticipants()
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled, isScreenShareEnabled } = useLocalParticipant()
  const cameraTracks = useTracks([Track.Source.Camera], { onlySubscribed: false })
  const [controlBusy, setControlBusy] = useState(null)
  const [controlError, setControlError] = useState('')
  const [selectedIdentity, setSelectedIdentity] = useState('')

  const connection = connectionLabel(connectionState)

  const participantSummaries = useMemo(() => participants.map((participant) => ({
    identity: participant.identity,
    name: participant.name || participant.identity,
    role: roleFromParticipant(participant),
    specialty: (() => { try { return JSON.parse(participant?.metadata || '{}')?.specialty || '' } catch { return '' } })(),
    connected: true,
    speaking: Boolean(participant.isSpeaking),
    connectionQuality: qualityLabel(participant.connectionQuality),
    isLocal: Boolean(participant.isLocal),
  })), [participants])

  const localQuality = qualityLabel(localParticipant?.connectionQuality)

  useEffect(() => {
    if (!room) return undefined

    const handleData = (payload) => {
      try {
        const text = new TextDecoder().decode(payload)
        const message = JSON.parse(text)
        if (message?.type === 'vital' || message?.type === 'vitals' || message?.topic === 'vitals') {
          onVitalsChange?.(message.payload || message.vitals || message.data || {})
        }
      } catch {
        // Ignore non-JSON LiveKit data messages.
      }
    }

    room.on(RoomEvent.DataReceived, handleData)
    return () => room.off(RoomEvent.DataReceived, handleData)
  }, [onVitalsChange, room])

  useEffect(() => {
    onStatusChange?.(connectionState === ConnectionState.Connected ? 'connected' : connectionState === ConnectionState.Reconnecting ? 'reconnecting' : connectionState === ConnectionState.Disconnected ? 'disconnected' : 'connecting')
  }, [connectionState, onStatusChange])

  useEffect(() => {
    onParticipantsChange?.(participantSummaries, { connectionQuality: localQuality })
  }, [localQuality, onParticipantsChange, participantSummaries])

  useEffect(() => {
    const preferred = participants.find((participant) => !participant.isLocal) || participants[0]
    if (!selectedIdentity && preferred?.identity) setSelectedIdentity(preferred.identity)
    if (selectedIdentity && !participants.some((participant) => participant.identity === selectedIdentity)) {
      setSelectedIdentity(preferred?.identity || localParticipant?.identity || '')
    }
  }, [localParticipant?.identity, participants, selectedIdentity])

  const selectedParticipant = participants.find((participant) => participant.identity === selectedIdentity) || participants[0]
  const selectedTrackRef = selectedParticipant
    ? cameraTracks.find((ref) => ref.participant?.identity === selectedParticipant.identity)
    : undefined
  const otherParticipants = participants.filter((participant) => participant.identity !== selectedParticipant?.identity)

  const runControl = async (name, action, successMessage) => {
    if (controlBusy) return
    if (!localParticipant) {
      setControlError('The call controls are not ready yet. Please wait for the room to finish connecting.')
      return
    }
    setControlBusy(name)
    setControlError('')
    try {
      await action()
      if (successMessage) setControlError(successMessage)
      window.setTimeout(() => setControlError(''), 1800)
    } catch (error) {
      console.error(`[LiveKitSessionRoom] ${name} control failed`, error)
      const message = error?.name === 'NotAllowedError'
        ? 'Browser permission was denied. Allow camera, microphone or screen sharing and try again.'
        : error?.message || `Unable to change ${name}.`
      setControlError(message)
    } finally {
      setControlBusy(null)
    }
  }

  const toggleMicrophone = () => runControl(
    'microphone',
    () => localParticipant?.setMicrophoneEnabled(!isMicrophoneEnabled),
    isMicrophoneEnabled ? 'Microphone muted' : 'Microphone on',
  )
  const toggleCamera = () => runControl(
    'camera',
    () => localParticipant?.setCameraEnabled(!isCameraEnabled),
    isCameraEnabled ? 'Camera off' : 'Camera on',
  )
  const toggleScreenShare = () => runControl(
    'screen share',
    () => localParticipant?.setScreenShareEnabled(!isScreenShareEnabled),
    isScreenShareEnabled ? 'Screen sharing stopped' : 'Screen sharing on',
  )

  return (
    <RoomFrame>
      <RoomAudioRenderer />
      <StatusBar aria-live="polite">
        <StatusDot $tone={connection.tone} />
        {connection.label}
        <span>•</span>
        {participants.length} {participants.length === 1 ? 'person' : 'people'}
        <span>•</span>
        <span>Network: {localQuality}</span>
      </StatusBar>

      <VideoStage>
        {selectedParticipant ? (
          <FocusLayout>
            <FocusMain>
              <ParticipantTile
                participant={selectedParticipant}
                trackRef={selectedTrackRef}
                active
                onSelect={() => {}}
              />
            </FocusMain>
            <FocusStrip aria-label="Other participants">
              {otherParticipants.map((participant) => {
                const trackRef = cameraTracks.find((ref) => ref.participant?.identity === participant.identity)
                return (
                  <ParticipantTile
                    key={participant.identity}
                    participant={participant}
                    trackRef={trackRef}
                    compact
                    active={false}
                    onSelect={() => setSelectedIdentity(participant.identity)}
                  />
                )
              })}
            </FocusStrip>
          </FocusLayout>
        ) : (
          <EmptyState>
            <EmptyCard>
              <LoadingTitle>Waiting for your care team</LoadingTitle>
              <LoadingText>Keep this window open. When a clinician joins, their video will appear here automatically.</LoadingText>
            </EmptyCard>
          </EmptyState>
        )}
      </VideoStage>

      {controlError && (
        <ControlNotice role="status" aria-live="polite">{controlError}</ControlNotice>
      )}

      <FloatingBar aria-label="Call controls">
        <Control type="button" $active={isMicrophoneEnabled} disabled={Boolean(controlBusy)} onClick={toggleMicrophone} aria-label={isMicrophoneEnabled ? 'Mute microphone' : 'Unmute microphone'} title={isMicrophoneEnabled ? 'Mute microphone' : 'Unmute microphone'}>
          <ControlIcon name={isMicrophoneEnabled ? 'mic' : 'mic-off'} />
        </Control>
        <Control type="button" $active={isCameraEnabled} disabled={Boolean(controlBusy)} onClick={toggleCamera} aria-label={isCameraEnabled ? 'Turn camera off' : 'Turn camera on'} title={isCameraEnabled ? 'Turn camera off' : 'Turn camera on'}>
          <ControlIcon name={isCameraEnabled ? 'camera' : 'camera-off'} />
        </Control>
        <Control type="button" $active={isScreenShareEnabled} disabled={Boolean(controlBusy)} onClick={toggleScreenShare} aria-label={isScreenShareEnabled ? 'Stop screen sharing' : 'Share screen'} title={isScreenShareEnabled ? 'Stop screen sharing' : 'Share screen'}>
          <ControlIcon name={isScreenShareEnabled ? 'screen-off' : 'screen'} />
        </Control>
        <Divider />
        <EndCallButton type="button" $danger onClick={onNavigateHome} aria-label="Leave emergency call">
          <ControlIcon name="end" />
          <span>Leave call</span>
        </EndCallButton>
      </FloatingBar>
    </RoomFrame>
  )
}

export function LiveKitSessionRoom({
  currentUser,
  roomSeed,
  roomName: providedRoomName,
  role = 'participant',
  callType = 'video',
  onLeave,
  onError,
  onTokenError,
  displayName,
  identity,
  className,
  onStatusChange,
  onParticipantsChange,
  onVitalsChange,
  onNavigateHome,
}) {
  const serverUrl = getLiveKitServerUrl()
  const [mounted, setMounted] = useState(false)
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  const roomName = useMemo(() => providedRoomName || buildLiveKitRoomName(roomSeed || {}), [providedRoomName, roomSeed])
  const participantIdentity = useMemo(() => identity || buildLiveKitIdentity(currentUser, role), [identity, currentUser, role])
  const participantName = useMemo(() => String(displayName || currentUser?.fullName || currentUser?.full_name || currentUser?.name || role || 'Participant').trim(), [displayName, currentUser, role])

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    let ignore = false

    async function loadToken() {
      if (!serverUrl) {
        const err = new Error('LiveKit is not configured. Add NEXT_PUBLIC_LIVEKIT_URL and server credentials.')
        setError(err.message)
        setLoading(false)
        onStatusChange?.('error')
        onTokenError?.(err)
        return
      }

      setLoading(true)
      setError('')
      onStatusChange?.('connecting')

      try {
        const result = await requestLiveKitToken({
          roomName,
          identity: participantIdentity,
          name: participantName,
          role,
          callType,
          metadata: { role, callType },
        })

        if (ignore) return
        if (!result?.token) throw new Error('LiveKit token was not returned.')
        setToken(result.token)
      } catch (err) {
        if (ignore) return
        const message = err?.message || 'Unable to join the LiveKit room.'
        setError(message)
        onStatusChange?.('error')
        onTokenError?.(err)
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    loadToken()
    return () => { ignore = true }
  }, [callType, onStatusChange, onTokenError, participantIdentity, participantName, reloadKey, roomName, role, serverUrl])

  if (error) {
    return (
      <Shell className={className} aria-label="LiveKit connection error">
        <LoadingState>
          <ErrorCard>
            <LoadingTitle>We could not open the call</LoadingTitle>
            <ErrorText>{error}</ErrorText>
            <RetryButton type="button" onClick={() => { setError(''); setToken(''); setLoading(true); setReloadKey((value) => value + 1) }}>
              Try again
            </RetryButton>
          </ErrorCard>
        </LoadingState>
      </Shell>
    )
  }

  if (!mounted || loading || !token) {
    return (
      <Shell className={className} aria-label="Loading secure video room">
        <LoadingState>
          <LoadingCard>
            <LoadingTitle>{mounted ? 'Connecting to your care team…' : 'Preparing secure room…'}</LoadingTitle>
            <LoadingText>{mounted ? 'Establishing the secure LiveKit connection. Your video controls will appear when the room is ready.' : 'Preparing the encrypted consultation workspace.'}</LoadingText>
          </LoadingCard>
        </LoadingState>
      </Shell>
    )
  }

  return (
    <Shell className={className} aria-label="Emergency Echo secure video room">
      <LiveKitRoom
        serverUrl={serverUrl}
        token={token}
        connect
        audio
        video={callType !== 'voice'}
        onConnected={() => onStatusChange?.('connected')}
        onReconnected={() => onStatusChange?.('connected')}
        onDisconnected={() => { onStatusChange?.('disconnected'); onLeave?.() }}
        onError={(err) => { onStatusChange?.('error'); onError?.(err) }}
        style={{ width: '100%', height: '100%' }}
      >
        <ConnectedRoom
          onParticipantsChange={onParticipantsChange}
          onVitalsChange={onVitalsChange}
          onStatusChange={onStatusChange}
          onNavigateHome={onNavigateHome || onLeave}
        />
      </LiveKitRoom>
    </Shell>
  )
}
