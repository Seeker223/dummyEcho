import styled from 'styled-components'
import { useAppState } from '../../../app/context/useAppState'
import { useAuth } from '../../auth/context/useAuth'
import { defaultPrivatePage } from '../utils/routeAccess'
import { Button, Card, Screen, Subtitle, Title } from './ScreenPrimitives'
import { InPageMenuButton } from '../components/InPageMenuButton'

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
`

export default function ForbiddenScreen() {
  const { isAuthenticated, role } = useAuth()
  const { setActivePage } = useAppState()

  return (
    <Screen>
      <Header>
        <InPageMenuButton />
        <span />
      </Header>
      <Title>Access denied</Title>
      <Subtitle>You are not authorized to view this screen.</Subtitle>
      <Card>
        <Subtitle>Switch to an allowed route for your role.</Subtitle>
        <Button
          type="button"
          onClick={() => setActivePage(isAuthenticated ? defaultPrivatePage(role) : 'login')}
        >
          Go back
        </Button>
      </Card>
    </Screen>
  )
}
