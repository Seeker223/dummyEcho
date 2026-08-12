import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import { Button, Card, Screen } from '../screens/ScreenPrimitives'
import { useAuth } from '../../auth/context/useAuth'

const slideIn = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`

const HeaderTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 900;
  letter-spacing: -0.03em;
`

const HeaderSub = styled.p`
  margin: 4px 0 24px;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.95rem;
  line-height: 1.5;
`

const SummaryBanner = styled.div`
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(0,201,167,0.25)' : 'rgba(15,23,42,0.1)'};
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(0,201,167,0.07)' : 'rgba(15,23,42,0.03)'};
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.88rem;
  line-height: 1.55;
  margin-bottom: 20px;
  animation: ${slideIn} 0.4s ease both;

  strong {
    display: block;
    color: ${({ theme }) => theme.colors.text};
    font-weight: 800;
    margin-bottom: 4px;
    font-size: 0.9rem;
  }
`

const OptionGrid = styled.div`
  display: grid;
  gap: 12px;
  margin-bottom: 24px;
`

const OptionBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-radius: 16px;
  border: 2px solid ${({ $selected, theme }) => $selected ? theme.colors.primary : theme.colors.border};
  background: ${({ $selected, theme }) => $selected
    ? theme.mode === 'dark' ? 'rgba(220,38,38,0.10)' : 'rgba(220,38,38,0.06)'
    : theme.colors.surface};
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
  box-shadow: ${({ $selected }) => $selected ? '0 8px 20px rgba(220,38,38,0.14)' : 'none'};
  animation: ${slideIn} 0.4s ease both;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: 0 10px 22px rgba(220,38,38,0.12);
  }

  &:active { transform: translateY(0); }
`

const IconWrap = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.06)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  flex-shrink: 0;
`

const OptionText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;

  strong {
    font-size: 1.05rem;
    font-weight: 900;
    color: ${({ theme }) => theme.colors.text};
  }

  span {
    font-size: 0.88rem;
    color: ${({ theme }) => theme.colors.muted};
    line-height: 1.4;
  }
`

const CheckBadge = styled.span`
  margin-left: auto;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: ${({ $selected, theme }) => $selected ? theme.colors.primary : 'transparent'};
  border: 2px solid ${({ $selected, theme }) => $selected ? theme.colors.primary : theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #fff;
  font-size: 0.7rem;
  transition: all 0.18s ease;
`

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const CancelBtn = styled(Button)`
  background: transparent;
  color: ${({ theme }) => theme.colors.muted};
  border: 1px solid ${({ theme }) => theme.colors.border};

  &:hover {
    background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)'};
  }
`

const MODES = [
  { id: 'video', icon: '🎥', label: 'Video Call', sub: 'Best for visible symptoms & thorough checkups' },
  { id: 'voice', icon: '📞', label: 'Voice Call', sub: 'Good for poor internet connections' },
  { id: 'chat',  icon: '💬', label: 'Live Chat',  sub: 'Text-based consultation with a doctor' },
]

export default function ConsultationModeScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser } = useAuth()
  const [mode, setMode] = useState('video')

  // Pick up symptoms + AI summary passed from ChatScreen
  const symptoms = location.state?.symptoms || 'Escalated from EchoAI consultation'
  const aiSummary = location.state?.aiSummary || ''

  const onContinue = () => {
    const payload = {
      submission_key: currentUser?.submission_key || `EE_${String(currentUser?.id || '').substring(0, 8)}`,
      queue_type: 'doctor',
      urgency_score: 8,
      status: 'waiting',
      symptoms,
      consultation_type: mode,
    }

    // Delegate to PaymentScreen which handles the DB insert correctly
    navigate('/app/payment', {
      state: {
        returnTo: 'queue-callback',
        queuePayload: payload,
        callType: mode,
      },
    })
  }

  return (
    <Screen>
      <Header>
        <HeaderTitle>How would you like to connect?</HeaderTitle>
      </Header>
      <HeaderSub>Choose your preferred consultation type. A doctor will join you shortly.</HeaderSub>

      {symptoms && symptoms !== 'Escalated from EchoAI consultation' && (
        <SummaryBanner>
          <strong>🧠 EchoAI Summary</strong>
          {symptoms.length > 180 ? symptoms.slice(0, 180) + '…' : symptoms}
        </SummaryBanner>
      )}

      <Card>
        <OptionGrid>
          {MODES.map(({ id, icon, label, sub }) => (
            <OptionBtn key={id} $selected={mode === id} onClick={() => setMode(id)}>
              <IconWrap>{icon}</IconWrap>
              <OptionText>
                <strong>{label}</strong>
                <span>{sub}</span>
              </OptionText>
              <CheckBadge $selected={mode === id}>{mode === id ? '✓' : ''}</CheckBadge>
            </OptionBtn>
          ))}
        </OptionGrid>

        <Actions>
          <Button onClick={onContinue}>Continue to Payment</Button>
          <CancelBtn onClick={() => navigate('/app/chat')}>← Back to EchoAI</CancelBtn>
        </Actions>
      </Card>
    </Screen>
  )
}
