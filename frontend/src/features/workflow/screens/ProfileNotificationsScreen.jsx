import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { Button, Card, Screen } from './ScreenPrimitives'
import { InPageMenuButton } from '../components/InPageMenuButton'
import { showAssistant } from '../components/AssistantCharacterOverlay'
import { useAuth } from '../../auth/context/useAuth'

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
`

const CircleButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceAlt};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  font-weight: 900;
`

const HeaderTitle = styled.h2`
  margin: 0;
  font-size: 1.3rem;
`

const Spacer = styled.span`
  width: 36px;
`

const List = styled.div`
  display: grid;
  gap: 10px;
`

const Row = styled.button`
  width: 100%;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 14px;
  padding: 12px 12px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  text-align: left;
`

const RowText = styled.div`
  display: grid;
  gap: 2px;
`

const RowTitle = styled.div`
  font-weight: 900;
`

const RowSub = styled.div`
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 700;
  font-size: 0.9rem;
`

const Toggle = styled.div`
  width: 48px;
  height: 28px;
  border-radius: 999px;
  background: ${({ $on, theme }) => ($on ? theme.colors.success : '#cbd5e1')};
  position: relative;
`

const Knob = styled.div`
  position: absolute;
  top: 3px;
  left: ${({ $on }) => ($on ? '23px' : '3px')};
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: #fff;
  transition: left 180ms ease;
`

const Actions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 12px;
`

const SecondaryBtn = styled(Button)`
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.primary};
`

const STORAGE_KEY = 'ee:notify_settings:v1'

export default function ProfileNotificationsScreen() {
  const navigate = useNavigate()

  const [prefs, setPrefs] = useState(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      const parsed = raw ? JSON.parse(raw) : null
      return (
        parsed || {
          sessionUpdates: true,
          triageQueue: true,
          marketing: false,
          reminders: true,
        }
      )
    } catch {
      return { sessionUpdates: true, triageQueue: true, marketing: false, reminders: true }
    }
  })

  const { currentUser } = useAuth()

  const items = useMemo(() => [
    { id: 'sessionUpdates', title: 'Session updates', sub: 'Live session status and outcomes' },
    { id: 'reminders', title: 'Reminders', sub: 'Follow-ups and scheduled check-ins' },
    { id: 'marketing', title: 'Product updates', sub: 'New features and announcements' },
  ], [])

  const toggle = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }))

  const save = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
    } catch {
      // ignore
    }
    try {
      showAssistant({ title: 'Saved', message: 'Notification preferences updated.', avatar: 'nurse', durationMs: 5500 })
    } catch {
      // ignore
    }
    navigate('/app/profile')
  }

  return (
    <Screen>
      <Header>
        <InPageMenuButton />
        <CircleButton onClick={() => navigate('/app/profile')} type="button">
          {'<'}
        </CircleButton>
        <HeaderTitle>Notification Settings</HeaderTitle>
        <Spacer />
      </Header>

      <Card as="section">
        <List>
          {items.map((item) => {
            const on = Boolean(prefs[item.id])
            return (
              <Row key={item.id} type="button" onClick={() => toggle(item.id)}>
                <RowText>
                  <RowTitle>{item.title}</RowTitle>
                  <RowSub>{item.sub}</RowSub>
                </RowText>
                <Toggle $on={on} aria-hidden="true">
                  <Knob $on={on} />
                </Toggle>
              </Row>
            )
          })}
        </List>
        <Actions>
          <SecondaryBtn type="button" onClick={() => navigate('/app/profile')}>
            Cancel
          </SecondaryBtn>
          <Button type="button" onClick={save}>
            Save
          </Button>
        </Actions>
      </Card>
    </Screen>
  )
}

