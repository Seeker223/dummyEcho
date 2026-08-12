import { useMemo } from 'react'
import styled, { keyframes } from 'styled-components'

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(198, 40, 40, 0.44); transform: scale(1); }
  70% { box-shadow: 0 0 0 22px rgba(198, 40, 40, 0); transform: scale(1.03); }
  100% { box-shadow: 0 0 0 0 rgba(198, 40, 40, 0); transform: scale(1); }
`

const Section = styled.section`
  border-radius: 22px;
  border: 1px solid ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : theme.colors.border)};
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(17, 24, 39, 0.94) 0%, rgba(15, 23, 42, 0.94) 100%)'
      : 'linear-gradient(135deg, rgba(15, 31, 68, 0.02) 0%, rgba(255,255,255,0.9) 62%, rgba(255,255,255,0.75) 100%)'};
  box-shadow: 0 18px 44px rgba(15, 31, 68, 0.12);
  padding: 18px;
`

const TitleRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
`

const Title = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 950;
  letter-spacing: -0.02em;
`

const Subtitle = styled.p`
  margin: 2px 0 0;
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 600;
  font-size: 0.92rem;
  line-height: 1.5;
  max-width: 62ch;
`

const MicSection = styled.section`
  display: grid;
  place-items: center;
  margin: 16px 0 18px;
`

const MicButton = styled.button`
  width: 96px;
  height: 96px;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(
    180deg,
    ${({ theme }) => theme.colors.primary} 0%,
    ${({ theme }) => theme.colors.primaryDeep} 100%
  );
  color: #fff;
  cursor: pointer;
  animation: ${pulse} 1.8s ease-out infinite;
  display: grid;
  place-items: center;
  box-shadow: 0 14px 28px rgba(220, 38, 38, 0.28);

  svg {
    width: 36px;
    height: 36px;
  }
`

const MicText = styled.p`
  margin: 12px 0 0;
  font-size: 1.02rem;
  font-weight: 800;
`

const SectionTitle = styled.h3`
  margin: 0 0 10px;
  font-size: 1.15rem;
  font-weight: 950;
  letter-spacing: -0.02em;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 16px;

  @media (max-width: 420px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`

const CategoryCard = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.surface};
  padding: 12px 8px;
  cursor: pointer;
  display: grid;
  justify-items: center;
  gap: 8px;
  transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;

  @media (hover: hover) {
    &:hover {
      transform: translateY(-2px);
      border-color: ${({ theme }) => theme.colors.primary};
      box-shadow: 0 12px 26px rgba(15, 31, 68, 0.12);
    }
  }

  &:active {
    transform: translateY(0);
  }
`

const CategoryIcon = styled.span`
  width: 40px;
  height: 40px;
  border-radius: 999px;
  background: ${({ $bg }) => $bg};
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 18px;
    height: 18px;
  }
`

const CategoryLabel = styled.span`
  font-size: 0.8rem;
  font-weight: 800;
`

const InfoCard = styled.article`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.surface};
  padding: 14px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`

const InfoLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

const InfoIcon = styled.span`
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: ${({ theme }) => (theme.mode === 'dark' ? '#3a2e16' : '#fff8e6')};
  color: #ca8a04;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 16px;
    height: 16px;
  }
`

const InfoTitle = styled.p`
  margin: 0;
  font-size: 1rem;
  font-weight: 900;
`

const InfoSub = styled.p`
  margin: 2px 0 0;
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 600;
`

const Avatar = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.primaryDeep};
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
`

const CallButton = styled.button`
  border: 0;
  border-radius: 999px;
  padding: 10px 16px;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 12px 20px rgba(220, 38, 38, 0.22);
  transition: transform 160ms ease, box-shadow 160ms ease;

  @media (hover: hover) {
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 16px 24px rgba(220, 38, 38, 0.28);
    }
  }

  &:active {
    transform: translateY(0);
  }
`

function MicIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 14a3 3 0 0 0 3-3V7a3 3 0 0 0-6 0v4a3 3 0 0 0 3 3Z" />
      <path d="M19 11a7 7 0 0 1-14 0" strokeLinecap="round" />
      <path d="M12 18v3" strokeLinecap="round" />
      <path d="M8 21h8" strokeLinecap="round" />
    </svg>
  )
}

function LocationIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z" />
      <path d="M12 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.8 4.6c-1.6-1.6-4.2-1.6-5.8 0L12 7.6 9 4.6C7.4 3 4.8 3 3.2 4.6c-1.6 1.6-1.6 4.2 0 5.8L12 21.2l8.8-10.8c1.6-1.6 1.6-4.2 0-5.8Z" />
    </svg>
  )
}

function BandageIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 20 20 4" strokeLinecap="round" />
      <path d="M7 17a4 4 0 0 1 0-6l4-4a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0Z" />
      <path d="M14 10h.01M16 12h.01M12 12h.01" strokeLinecap="round" />
    </svg>
  )
}

function ChildIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M4 21a8 8 0 0 1 16 0" strokeLinecap="round" />
    </svg>
  )
}

function AccessIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
      <path d="M12 10v11" strokeLinecap="round" />
      <path d="M7 21h10" strokeLinecap="round" />
      <path d="M8 13h8" strokeLinecap="round" />
    </svg>
  )
}

function CrossIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6V4Z" />
    </svg>
  )
}

function FeverIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 14.8V5a2 2 0 1 0-4 0v9.8a4 4 0 1 0 4 0Z" />
      <path d="M12 9v3" strokeLinecap="round" />
    </svg>
  )
}

const categories = [
  { label: 'Emergency', icon: <CrossIcon />, color: '#dc2626' },
  { label: 'Vomiting', icon: <FeverIcon />, color: '#eab308' },
  { label: 'Stooling', icon: <HeartIcon />, color: '#f59e0b' },
  { label: 'Difficulty breathing', icon: <AccessIcon />, color: '#ef4444' },
  { label: 'Fever / Malaria', icon: <CrossIcon />, color: '#2563eb' },
  { label: 'Baby sick', icon: <ChildIcon />, color: '#22c55e' },
  { label: 'Accident / Injury', icon: <BandageIcon />, color: '#dc2626' },
  { label: 'Pregnancy', icon: <ChildIcon />, color: '#a855f7' },
]

export function VoiceSessionSection({
  onOpenVoiceAi,
  onOpenChatSeed,
  onCallClinician,
  onOpenDoctors,
  doctorLabel = 'Doctor on duty',
  doctorName = 'Dr. Adebayo Okafor',
  doctorEta = 'ETA: 5 minutes',
}) {
  const chatSeed = useMemo(() => onOpenChatSeed || (() => {}), [onOpenChatSeed])

  return (
    <Section aria-label="Voice session">
      <TitleRow>
        <div>
          <Title>Voice session</Title>
          <Subtitle>Start hands-free triage, then pick a category to continue in chat or connect to a clinician.</Subtitle>
        </div>
      </TitleRow>

      <MicSection>
        <MicButton aria-label="Start voice session" onClick={onOpenVoiceAi} type="button">
          <MicIcon />
        </MicButton>
        <MicText>Tap to speak your emergency</MicText>
      </MicSection>

      <SectionTitle>Quick categories</SectionTitle>
      <Grid>
        {categories.map((item) => (
          <CategoryCard key={item.label} type="button" onClick={() => chatSeed(item.label)}>
            <CategoryIcon $bg={item.color}>{item.icon}</CategoryIcon>
            <CategoryLabel>{item.label}</CategoryLabel>
          </CategoryCard>
        ))}
      </Grid>

      <SectionTitle>Nearby alerts</SectionTitle>
      <InfoCard>
        <InfoLeft>
          <InfoIcon aria-hidden="true">
            <LocationIcon />
          </InfoIcon>
          <div>
            <InfoTitle>5 accidents near Alimosho today</InfoTitle>
            <InfoSub>Stay alert on major roads</InfoSub>
          </div>
        </InfoLeft>
      </InfoCard>

      <InfoCard style={{ marginTop: 16 }}>
        <InfoLeft>
          <Avatar>{doctorName.charAt(0)}</Avatar>
          <div>
            <InfoTitle>{doctorLabel}</InfoTitle>
            <InfoSub>{doctorEta}</InfoSub>
          </div>
        </InfoLeft>
        <CallButton type="button" onClick={onCallClinician}>
          Call
        </CallButton>
      </InfoCard>

    </Section>
  )
}
