import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useAuth } from '../../auth/context/useAuth'
import { Screen, Card, Button } from './ScreenPrimitives'
import { InPageMenuButton } from '../components/InPageMenuButton'

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
`

const Title = styled.h2`
  margin: 0;
  font-size: 1.35rem;
`

const Subtitle = styled.p`
  margin: 6px 0 0;
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 600;
  line-height: 1.55;
`

const BackBtn = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  font-weight: 900;
`

export default function ApplyUserScreen() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()

  const name = useMemo(() => {
    const raw = currentUser?.fullName || 'there'
    return String(raw).trim().split(' ')[0] || raw
  }, [currentUser?.fullName])

  return (
    <Screen>
      <Header>
        <InPageMenuButton />
        <BackBtn type="button" onClick={() => navigate('/app/home')} aria-label="Back">
          {'<'}
        </BackBtn>
        <div style={{ width: 44 }} />
      </Header>

      <Card>
        <Title>Apply as a User</Title>
        <Subtitle>
          Hi {name}. To get more personal guidance from EchoAI, complete your Digital Medical Kit. You can update it anytime.
        </Subtitle>
        <div style={{ height: 14 }} />
        <Button type="button" onClick={() => navigate('/app/kit')}>
          Fill my Digital Medical Kit
        </Button>
      </Card>
    </Screen>
  )
}

