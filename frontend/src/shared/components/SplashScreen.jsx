import styled, { keyframes } from 'styled-components'
import emergencyLogo from '../../assets/emergencyecho.png'
import { imageSource } from '../utils/imageSource'

const emergencyLogoSrc = imageSource(emergencyLogo)

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.9; }
  50% { transform: scale(1.08); opacity: 1; }
  100% { transform: scale(1); opacity: 0.9; }
`

const Wrap = styled.section`
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
`

const Card = styled.div`
  width: min(320px, 92vw);
  border: 1px solid ${({ theme }) => theme?.colors?.border || '#e5e7eb'};
  border-radius: ${({ theme }) => theme?.radii?.lg || '16px'};
  background: ${({ theme }) => theme?.colors?.surface || '#ffffff'};
  padding: 28px 20px;
  text-align: center;
  box-shadow: ${({ theme }) => theme?.shadow?.soft || '0 14px 30px rgba(15, 31, 68, 0.16)'};
`

const Logo = styled.img`
  width: 88px;
  height: 88px;
  object-fit: cover;
  border-radius: 22px;
  animation: ${pulse} 1.2s ease-in-out infinite;
`

const Title = styled.h1`
  margin: 14px 0 6px;
  font-size: 1.2rem;
`

const Text = styled.p`
  margin: 0;
  color: ${({ theme }) => theme?.colors?.muted || '#6b7280'};
`

export function SplashScreen() {
  return (
    <Wrap aria-label="Loading Emergency Echo">
      <Card>
        <Logo alt="Emergency Echo logo" src={emergencyLogoSrc} />
        <Title>Emergency Echo</Title>
        <Text>Preparing your workspace...</Text>
      </Card>
    </Wrap>
  )
}
