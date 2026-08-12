import styled from 'styled-components'
import echoJoinAsPatient from '../../../assets/echo-join as patient.png'
import echoDigitalEmergencyKit from '../../../assets/echo digital emergency kit.png'
import echoQuickTimeAccess from '../../../assets/echo quick time access.png'
import echoRealtimeVitals from '../../../assets/echo real-time vitals.png'
import echo6 from '../../../assets/echo6.png'
import { imageSource } from '../../../shared/utils/imageSource'

const Card = styled.aside`
  min-width: 0;
  padding: 16px;
  border-radius: ${({ theme }) => theme?.radii?.lg || '16px'};
  border: 1px solid ${({ theme }) => theme?.colors?.border || '#e5e7eb'};
  background: ${({ theme }) =>
    theme?.mode === 'dark' ? 'rgba(17, 26, 42, 0.86)' : 'rgba(255, 255, 255, 0.74)'};
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 12px 28px rgba(15, 31, 68, 0.1);
`

const Title = styled.h3`
  margin: 0 0 10px;
  font-size: 1.05rem;
  font-weight: 800;
  color: ${({ theme }) => theme?.colors?.text || '#1a1f2e'};
`

const Sub = styled.p`
  margin: 0 0 12px;
  color: ${({ theme }) => theme?.colors?.muted || '#6b7280'};
  line-height: 1.5;
  font-size: 0.95rem;
`

const VideoFrame = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 16px;
  overflow: hidden;
  background: ${({ theme }) => (theme?.mode === 'dark' ? '#0b1220' : '#f3f4f6')};
  border: 1px solid ${({ theme }) => theme?.colors?.border || '#e5e7eb'};

  video,
  iframe,
  img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }
`

const PlaceholderOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 16px;
  text-align: center;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.0), rgba(0, 0, 0, 0.35));
  color: #fff;
`

const PlayBadge = styled.div`
  width: 54px;
  height: 54px;
  border-radius: 999px;
  background: rgba(220, 38, 38, 0.92);
  box-shadow: 0 18px 40px rgba(220, 38, 38, 0.32);
  display: grid;
  place-items: center;
  font-weight: 900;
  font-size: 18px;
  margin-bottom: 10px;
`

const Helper = styled.p`
  margin: 0;
  max-width: 32ch;
  font-weight: 600;
  font-size: 0.9rem;
  opacity: 0.95;
`

const videoConfigByPage = {
  home: {
    title: 'Home walkthrough',
    description: 'See how to start triage and open the main tools quickly.',
    poster: imageSource(echo6),
    // Optional: set NEXT_PUBLIC_HOME_VIDEO_URL to a direct .mp4 URL when available.
    src: process.env.NEXT_PUBLIC_HOME_VIDEO_URL || '',
  },
  voice: {
    title: 'Voice session',
    description: 'Learn how to describe an emergency clearly using voice capture.',
    poster: imageSource(echoQuickTimeAccess),
    // Optional: set NEXT_PUBLIC_VOICE_SESSION_VIDEO_URL to a direct .mp4 URL when available.
    src: process.env.NEXT_PUBLIC_VOICE_SESSION_VIDEO_URL || '',
  },
  'voice-ai': {
    title: 'Voice AI listening',
    description: 'See what happens when Emergency Echo is actively listening to your report.',
    poster: imageSource(echoRealtimeVitals),
    // Optional: set NEXT_PUBLIC_VOICE_AI_VIDEO_URL to a direct .mp4 URL when available.
    src: process.env.NEXT_PUBLIC_VOICE_AI_VIDEO_URL || '',
  },
  kit: {
    title: 'Emergency kit',
    description: 'See how to share your Emergency ID and key medical details fast.',
    poster: imageSource(echoDigitalEmergencyKit),
    // Optional: set NEXT_PUBLIC_KIT_VIDEO_URL to a direct .mp4 URL when available.
    src: process.env.NEXT_PUBLIC_KIT_VIDEO_URL || '',
  },
  wallet: {
    title: 'Wallet',
    description: 'See how to check your balance and review recent transactions.',
    poster: imageSource(echoJoinAsPatient),
    // Optional: set NEXT_PUBLIC_WALLET_VIDEO_URL to a direct .mp4 URL when available.
    src: process.env.NEXT_PUBLIC_WALLET_VIDEO_URL || '',
  },
  profile: {
    title: 'Profile',
    description: 'See how to update your details so responders can help faster.',
    poster: imageSource(echoJoinAsPatient),
    // Optional: set NEXT_PUBLIC_PROFILE_VIDEO_URL to a direct .mp4 URL when available.
    src: process.env.NEXT_PUBLIC_PROFILE_VIDEO_URL || '',
  },
}

export function VideoPanel({ activePage }) {
  const config = videoConfigByPage[activePage]
  if (!config) return null

  const hasVideo = Boolean(config.src)

  return (
    <Card aria-label="Walkthrough video">
      <Title>{config.title}</Title>
      <Sub>{config.description}</Sub>
      <VideoFrame>
        {hasVideo ? (
          <video controls preload="metadata" poster={config.poster}>
            <source src={config.src} type="video/mp4" />
          </video>
        ) : (
          <>
            <img src={config.poster} alt="" loading="lazy" />
            <PlaceholderOverlay>
              <div>
                <PlayBadge aria-hidden="true">{'>'}</PlayBadge>
                <Helper>Demo video placeholder. Add a video URL to enable playback.</Helper>
              </div>
            </PlaceholderOverlay>
          </>
        )}
      </VideoFrame>
    </Card>
  )
}
