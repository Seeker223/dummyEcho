import { useMemo } from 'react'
import styled, { keyframes } from 'styled-components'
import { useAuth } from '../../auth/context/useAuth'
import { Card, Screen } from './ScreenPrimitives'
import { InPageMenuButton } from '../components/InPageMenuButton'
import { resolveEchoId } from '../utils/echoId'

const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
  70% { transform: scale(1.02); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
`

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem 0;
  animation: fadeIn 0.3s ease both;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 8px;
`

const Title = styled.h2`
  margin: 0;
  font-size: clamp(1.2rem, 5vw, 1.5rem);
  font-weight: 800;
  background: linear-gradient(135deg, #ef4444 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`

const PassCard = styled(Card)`
  width: 100%;
  max-width: 380px;
  background: ${({ theme }) => theme.mode === 'dark' ? 'linear-gradient(145deg, #111827 0%, #0b0f19 100%)' : '#ffffff'};
  border-radius: 28px;
  padding: 2.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: ${({ theme }) => theme.shadow.elevated};
  border: 1.5px dashed ${({ theme }) => theme.mode === 'dark' ? '#374151' : '#e5e7eb'};
`

const CardHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin-bottom: 1.5rem;
`

const LogoBadge = styled.div`
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%);
  color: #ef4444;
  font-weight: 900;
  font-size: 0.8rem;
  padding: 4px 12px;
  border-radius: 999px;
  border: 1px solid rgba(239, 68, 68, 0.2);
  margin-bottom: 8px;
`

const CardName = styled.h3`
  font-size: 1.35rem;
  font-weight: 800;
  margin: 0;
  color: ${({ theme }) => theme.mode === 'dark' ? '#f3f4f6' : '#111827'};
`

const EchoIdText = styled.span`
  font-size: 0.85rem;
  font-weight: 700;
  color: #6b7280;
  background: ${({ theme }) => theme.mode === 'dark' ? '#1f2937' : '#f3f4f6'};
  padding: 2px 10px;
  border-radius: 8px;
  margin-top: 4px;
`

const QrContainer = styled.div`
  background: #ffffff;
  padding: 1.25rem;
  border-radius: 24px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  border: 2px solid #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 220px;
  height: 220px;
  margin-bottom: 1.5rem;
  animation: ${pulse} 3s infinite ease-in-out;
`

const QrImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`

const InfoText = styled.p`
  font-size: 0.82rem;
  line-height: 1.4;
  color: ${({ theme }) => theme.mode === 'dark' ? '#9ca3af' : '#6b7280'};
  margin: 0 0 1.5rem 0;
`

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`

const ActionButton = styled.button`
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(239, 68, 68, 0.3);
  }
`

const SecondaryButton = styled.a`
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-sizing: border-box;

  background: ${({ theme }) => theme.mode === 'dark' ? '#1f2937' : '#f3f4f6'};
  color: ${({ theme }) => theme.mode === 'dark' ? '#e5e7eb' : '#4b5563'};
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? '#374151' : '#e5e7eb'};

  &:hover {
    background: ${({ theme }) => theme.mode === 'dark' ? '#374151' : '#e5e7eb'};
  }
`

export default function EchoQrScreen() {
  const { currentUser } = useAuth()

  const qrUrl = useMemo(() => {
    if (typeof window === 'undefined') return ''
    const key = resolveEchoId(currentUser)
    return `${window.location.origin}/records/${key}`
  }, [currentUser])

  const qrImageSrc = useMemo(() => {
    if (!qrUrl) return ''
    return `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(qrUrl)}`
  }, [qrUrl])

  const handlePrint = () => {
    window.print()
  }

  return (
    <Screen>
      <Header>
        <InPageMenuButton />
        <Title>Echo QR Pass</Title>
        <div style={{ width: 36 }} />
      </Header>

      <Wrapper>
        <PassCard>
          <CardHeader>
            <LogoBadge>EMERGENCY ECHO</LogoBadge>
            <CardName>{currentUser?.fullName || 'Anonymous Patient'}</CardName>
            <EchoIdText>ID: {resolveEchoId(currentUser)}</EchoIdText>
          </CardHeader>

          <QrContainer>
            {qrImageSrc ? (
              <QrImage src={qrImageSrc} alt="Emergency QR Code" />
            ) : (
              <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Generating QR...</span>
            )}
          </QrContainer>

          <InfoText>
            First responders and doctors can scan this QR code with any mobile camera to instantly access your critical medical records, allergies, and contacts in an emergency.
          </InfoText>

          <ButtonGroup>
            <ActionButton onClick={handlePrint} type="button">
              🖨️ Print Pass / Save PDF
            </ActionButton>
            {qrUrl && (
              <SecondaryButton href={qrUrl} target="_blank" rel="noopener noreferrer">
                🌐 View Public Records Link
              </SecondaryButton>
            )}
          </ButtonGroup>
        </PassCard>
      </Wrapper>
    </Screen>
  )
}
