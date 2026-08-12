import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import { useAuth } from '../../auth/context/useAuth'
import { Screen } from './ScreenPrimitives'
import { supabase, supabaseAdmin } from '../../../lib/supabaseClient'
import { InPageMenuButton } from '../components/InPageMenuButton'
import emergencyLogo from '../../../assets/emergencyecho.png'
import { imageSource } from '../../../shared/utils/imageSource'
import { VoiceSessionSection } from '../components/VoiceSessionSection'
import { showAssistant } from '../components/AssistantCharacterOverlay'
import { BrandedSheetModal } from '../components/BrandedSheetModal'
import { CallTypeSheetModal } from '../components/CallTypeSheetModal'
import { assistantAvatars } from '../../assistant/assistantAvatars'
import { fetchLiveBalance } from '../services/walletService'
import { resolveEchoId } from '../utils/echoId'

const emergencyLogoSrc = imageSource(emergencyLogo)

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
`

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

const EditPill = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: clamp(4px, 1vw, 6px) clamp(8px, 2vw, 12px);
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : theme.colors.surface)};
  color: ${({ theme }) => theme.colors.text};
  font-weight: 800;
  font-size: clamp(0.7rem, 2.5vw, 0.9rem);
  cursor: pointer;

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 6px ${({ theme }) => theme.colors.glowRed};
  }
`

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`

const BrandLogo = styled.img`
  width: clamp(28px, 8vw, 36px);
  height: clamp(28px, 8vw, 36px);
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 10px 20px rgba(15, 31, 68, 0.14);
`

const BrandName = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`

const BrandTitle = styled.h2`
  margin: 0;
  font-size: clamp(0.85rem, 3.5vw, 1.05rem);
  font-weight: 900;
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const BrandHighlight = styled.span`
  color: ${({ theme }) => theme.colors.primary};
`

const Card = styled.section`
  border-radius: 22px;
  border: 1px solid ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : theme.colors.border)};
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(17, 24, 39, 0.94) 0%, rgba(15, 23, 42, 0.94) 100%)'
      : 'linear-gradient(135deg, rgba(220, 38, 38, 0.08) 0%, rgba(255,255,255,0.9) 62%, rgba(255,255,255,0.75) 100%)'};
  box-shadow: 0 18px 44px rgba(15, 31, 68, 0.14);
  padding: 18px;
  animation: ${fadeUp} 260ms ease both;
`

const Greeting = styled.p`
  margin: 0 0 8px;
  font-size: 0.9rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.muted};
`

const HeroTitle = styled.h1`
  margin: 0;
  font-size: clamp(1.35rem, 6vw, 1.9rem);
  line-height: 1.12;
  letter-spacing: -0.03em;
  font-weight: 900;
  position: relative;
  background: linear-gradient(90deg, ${({ theme }) => theme.colors.text}, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.text});
  background-size: 220% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: eeHeadlineShimmer 3.6s ease-in-out infinite;

  @keyframes eeHeadlineShimmer {
    0% {
      background-position: 0% 50%;
    }
    55% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 100% 50%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    background: none;
    color: ${({ theme }) => theme.colors.text};
  }
`

const InputCard = styled.div`
  width: 100%;
  margin-top: 14px;
  text-align: left;
  border-radius: 18px;
  border: 1px solid ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : theme.colors.border)};
  background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.75)')};
  padding: 14px 14px 12px;
  cursor: pointer;
  display: grid;
  gap: 12px;
  box-shadow: 0 12px 28px rgba(15, 31, 68, 0.08);
  transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;

  @media (hover: hover) {
    &:hover {
      transform: translateY(-2px);
      border-color: ${({ theme }) => theme.colors.primary};
      box-shadow: 0 18px 40px rgba(15, 31, 68, 0.12);
    }
  }

  &:active {
    transform: translateY(0);
  }
`

const Placeholder = styled.div`
  font-size: 0.92rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.muted};
`

const InputRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`

const Hint = styled.span`
  font-size: 0.78rem;
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 600;
`

const micPulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(198, 40, 40, 0.44); transform: scale(1); }
  70% { box-shadow: 0 0 0 16px rgba(198, 40, 40, 0); transform: scale(1.03); }
  100% { box-shadow: 0 0 0 0 rgba(198, 40, 40, 0); transform: scale(1); }
`

const MicButton = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: 0;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.primaryDeep} 100%);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 14px 28px rgba(220, 38, 38, 0.32);
  flex: 0 0 auto;
  cursor: pointer;
  animation: ${micPulse} 1.8s ease-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

function MicIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 14a3 3 0 0 0 3-3V7a3 3 0 0 0-6 0v4a3 3 0 0 0 3 3Z" />
      <path d="M19 11a7 7 0 0 1-14 0" strokeLinecap="round" />
      <path d="M12 18v3" strokeLinecap="round" />
      <path d="M8 21h8" strokeLinecap="round" />
    </svg>
  )
}

const Strip = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 6px 2px 10px;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    height: 0;
  }
`

const StripCard = styled.button`
  flex: 0 0 auto;
  width: clamp(100px, 28vw, 118px);
  border-radius: 18px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  padding: clamp(10px, 3vw, 12px) clamp(8px, 2vw, 12px) clamp(12px, 3vw, 14px);
  cursor: pointer;
  box-shadow: 0 12px 26px rgba(15, 31, 68, 0.08);
  transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
  display: grid;
  gap: 10px;
  text-align: left;

  @media (hover: hover) {
    &:hover {
      transform: translateY(-3px);
      border-color: ${({ theme }) => theme.colors.primary};
      box-shadow: 0 18px 36px rgba(15, 31, 68, 0.12);
    }
  }
`

const StripIcon = styled.span`
  width: 40px;
  height: 40px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${({ $tone, theme }) =>
    $tone === 'danger'
      ? theme.mode === 'dark'
        ? 'rgba(239, 68, 68, 0.22)'
        : 'rgba(220, 38, 38, 0.12)'
      : theme.mode === 'dark'
        ? 'rgba(255,255,255,0.06)'
        : 'rgba(15, 31, 68, 0.06)'};
  color: ${({ $tone, theme }) => ($tone === 'danger' ? theme.colors.primary : theme.colors.text)};
`

const StripLabel = styled.span`
  font-size: clamp(0.7rem, 2.5vw, 0.82rem);
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  text-align: left;
  line-height: 1.15;
  word-break: break-word;
`

function SirenIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v2" strokeLinecap="round" />
      <path d="M6 10a6 6 0 0 1 12 0v3H6v-3Z" />
      <path d="M5 13h14l-1 7H6l-1-7Z" />
      <path d="M9 22h6" strokeLinecap="round" />
    </svg>
  )
}

function KitIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 3h6l1 3h4v15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6h4l1-3Z" />
      <path d="M12 9v6M9 12h6" strokeLinecap="round" />
    </svg>
  )
}

function MarketIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 7h15l-1.5 9H7.5L6 7Z" />
      <path d="M6 7 5 3H2" strokeLinecap="round" />
      <path d="M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM18 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
    </svg>
  )
}

function DoctorIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 7h-3V4a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v3H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1Z" />
      <path d="M9 12h6M12 9v6" strokeLinecap="round" />
    </svg>
  )
}

export default function HomeScreen() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [sosOpen, setSosOpen] = useState(false)
  const [callOpen, setCallOpen] = useState(false)
  const [walletBalance, setWalletBalance] = useState(null)

  const isClinician = currentUser?.role === 'doctor' || currentUser?.role === 'nurse'
  const isPartner = currentUser?.role === 'partner'

  useEffect(() => {
    if ((isClinician || isPartner) && currentUser?.id) {
      fetchLiveBalance(currentUser.id).then(bal => setWalletBalance(bal || 0))
    }
  }, [isClinician, isPartner, currentUser?.id])

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }, [])

  const displayName = useMemo(() => {
    const name = currentUser?.fullName || currentUser?.full_name || currentUser?.name || 'there'
    const first = String(name).trim().split(' ')[0] || name
    const title = String(currentUser?.title || '').trim()
    return title ? `${title} ${first}` : first
  }, [currentUser?.fullName, currentUser?.full_name, currentUser?.name, currentUser?.title])

  const goChat = () => {
    try {
      showAssistant({ title: 'EchoAI', message: "Describe symptoms and I'll guide you step-by-step.", avatar: 'nurse' })
    } catch {
      // ignore
    }
    navigate('/app/chat')
  }
  const goVoiceAi = () => navigate('/app/voice-ai')

  return (
    <>
      <Screen>
      <Header>
        <Brand>
          <BrandLogo alt="Emergency Echo" src={emergencyLogoSrc} />
          <BrandName>
            <BrandTitle>
              Emergency <BrandHighlight>Echo</BrandHighlight>
            </BrandTitle>
          </BrandName>
        </Brand>
        <HeaderRight>
          <EditPill type="button" onClick={() => navigate('/app/profile')} aria-label="Edit profile">
            Edit profile
          </EditPill>
          <InPageMenuButton />
        </HeaderRight>
      </Header>

      <Card>
        <Greeting>
          {greeting}, {displayName}.
        </Greeting>
        
        {isPartner ? (
          <>
            <HeroTitle>Partner Dashboard</HeroTitle>
            <div style={{ marginTop: '16px', background: 'rgba(34, 197, 94, 0.1)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>Echo Wallet Balance</span>
                <span style={{ fontWeight: 900, color: '#16A34A', fontSize: '1.1rem' }}>
                  {walletBalance !== null ? `NGN ${walletBalance.toLocaleString()}` : '...'}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Use funds to purchase sponsored listings and ads.</p>
            </div>
            <div style={{ display: 'grid', gap: '10px', marginTop: '14px' }}>
              <button 
                onClick={() => navigate('/app/subscription')}
                style={{ padding: '14px', borderRadius: '14px', background: '#0F172A', color: '#fff', border: 'none', fontWeight: 900, cursor: 'pointer' }}>
                Purchase Ad Space / Listing
              </button>
              <button 
                onClick={() => navigate('/app/marketplace')}
                style={{ padding: '14px', borderRadius: '14px', background: 'transparent', color: '#0F172A', border: '2px solid #0F172A', fontWeight: 900, cursor: 'pointer' }}>
                Manage Marketplace Products
              </button>
            </div>
          </>
        ) : (
          <>
            <HeroTitle>{isClinician ? 'Ready for your shift?' : 'What health concerns do you have today?'}</HeroTitle>

            {isClinician && (
              <div onClick={() => navigate('/app/wallet')} style={{ cursor: 'pointer', marginTop: '16px', background: 'rgba(34, 197, 94, 0.1)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(34, 197, 94, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#64748b' }}>Echo Wallet Balance</span>
                  <div style={{ fontWeight: 900, color: '#16A34A', fontSize: '1.4rem', marginTop: '2px' }}>
                    {walletBalance !== null ? `NGN ${walletBalance.toLocaleString()}` : '...'}
                  </div>
                </div>
                <div style={{ width: '36px', height: '36px', borderRadius: '999px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#16A34A' }}>
                  {'>'}
                </div>
              </div>
            )}

            {!isClinician && (
              <InputCard role="button" onClick={goChat}>
                <Placeholder>Describe your symptoms or health concern...</Placeholder>
                <InputRow>
                  <Hint>Tap mic to speak or type below</Hint>
                  <MicButton
                    aria-label="Start voice session"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      goVoiceAi()
                    }}
                  >
                    <MicIcon />
                  </MicButton>
                </InputRow>
              </InputCard>
            )}
          </>
        )}
      </Card>

      {/* Quick categories live inside the Voice session card below (consistent UI). */}

      {!isPartner && (
        <div style={{ marginTop: 16 }}>
          <VoiceSessionSection
            onOpenVoiceAi={() => {
              try { showAssistant({ title: 'EchoAI', message: 'Voice AI is listening.', avatar: 'nurse' }) } catch {}
              navigate('/app/voice-ai')
            }}
            onOpenChatSeed={(seed) => navigate('/app/chat', { state: { seed } })}
            onCallClinician={() => {
              try { showAssistant({ title: 'Clinician', message: 'Connecting you...', avatar: 'doctor' }) } catch {}
              setCallOpen(true)
            }}
            onOpenDoctors={() => navigate('/app/doctors')}
          />
        </div>
      )}
      </Screen>

      <CallTypeSheetModal
        isOpen={callOpen}
        title="Connect to a clinician"
        message="Choose voice or video call (simulated)."
        onClose={() => setCallOpen(false)}
        onPick={async (type, symptomsText) => {
          setCallOpen(false)
          
          try {
            // Bypass the intermediate consultation-mode screen and jump straight into the waiting queue
            const payload = {
              submission_key: resolveEchoId(currentUser),
              queue_type: 'doctor',
              urgency_score: 8,
              status: 'waiting',
              clinical_summary: symptomsText || 'Requested direct consultation',
              consultation_type: type
            }

            navigate('/app/payment', { 
              state: { 
                returnTo: 'queue-callback',
                queuePayload: payload,
                callType: type
              }
            })
          } catch (err) {
            console.error('Failed to create consultation:', err)
            alert(`Failed to connect to the queue: ${err.message || JSON.stringify(err)}`)
          }
        }}
      />

      <BrandedSheetModal
        isOpen={sosOpen}
        avatarSrc={assistantAvatars.nurse}
        title="Start Emergency SOS"
        message="I'll start a voice capture session. Speak clearly: symptoms, location, and urgency."
        primaryLabel="Start voice SOS"
        secondaryLabel="Cancel"
        onClose={() => setSosOpen(false)}
        onPrimary={() => {
          setSosOpen(false)
          try {
            showAssistant({
              title: 'EchoAI',
              message: 'Starting voice capture now. I am listening.',
              avatar: 'nurse',
              durationMs: 2600,
            })
          } catch {
            // ignore
          }
          navigate('/app/voice-ai')
        }}
      />
    </>
  )
}
