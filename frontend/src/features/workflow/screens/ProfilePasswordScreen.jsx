import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useAuth } from '../../auth/context/useAuth'
import { Button, Card, FieldLabel, Screen, TextField } from './ScreenPrimitives'
import { InPageMenuButton } from '../components/InPageMenuButton'
import { showAssistant } from '../components/AssistantCharacterOverlay'

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

const Form = styled.form`
  display: grid;
  gap: 12px;
`

const Error = styled.p`
  margin: 0;
  color: #b42318;
  font-size: 0.85rem;
  font-weight: 650;
`

const Actions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 10px;
`

const SecondaryBtn = styled(Button)`
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.primary};
`

export default function ProfilePasswordScreen() {
  const navigate = useNavigate()
  const { updateProfile } = useAuth()
  const [saving, setSaving] = useState(false)
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })

  const errors = useMemo(() => {
    const nextErr = String(form.next || '').trim().length < 8 ? 'New password must be at least 8 characters.' : ''
    const confirmErr =
      !String(form.confirm || '').trim() ? 'Confirm your new password.' : form.confirm !== form.next ? 'Passwords do not match.' : ''
    return { next: nextErr, confirm: confirmErr }
  }, [form.confirm, form.next])

  const isValid = useMemo(() => Object.values(errors).every((v) => !v), [errors])
  const showErr = (key) => Boolean((submitted || touched[key]) && errors[key])

  const onSubmit = async (event) => {
    event.preventDefault()
    setSubmitted(true)
    if (!isValid) return
    setSaving(true)
    try {
      await updateProfile({ password: String(form.next || '') })
      try {
        showAssistant({
          title: 'Password updated',
          message: 'Your password has been updated successfully.',
          avatar: 'nurse',
          durationMs: 6500,
        })
      } catch {
        // ignore
      }
      navigate('/app/profile')
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Screen>
      <Header>
        <InPageMenuButton />
        <CircleButton onClick={() => navigate('/app/profile')} type="button">
          {'<'}
        </CircleButton>
        <HeaderTitle>Password</HeaderTitle>
        <Spacer />
      </Header>

      <Card as="section">
        <Form onSubmit={onSubmit}>
          <div>
            <FieldLabel>Current password</FieldLabel>
            <TextField
              type="password"
              value={form.current}
              onChange={(e) => setForm((p) => ({ ...p, current: e.target.value }))}
              placeholder="********"
            />
          </div>
          <div>
            <FieldLabel>New password</FieldLabel>
            <TextField
              $invalid={showErr('next')}
              type="password"
              value={form.next}
              onBlur={() => setTouched((p) => ({ ...p, next: true }))}
              onChange={(e) => setForm((p) => ({ ...p, next: e.target.value }))}
              placeholder="Use at least 8 characters"
            />
            {showErr('next') ? <Error>{errors.next}</Error> : null}
          </div>
          <div>
            <FieldLabel>Confirm new password</FieldLabel>
            <TextField
              $invalid={showErr('confirm')}
              type="password"
              value={form.confirm}
              onBlur={() => setTouched((p) => ({ ...p, confirm: true }))}
              onChange={(e) => setForm((p) => ({ ...p, confirm: e.target.value }))}
              placeholder="Re-enter new password"
            />
            {showErr('confirm') ? <Error>{errors.confirm}</Error> : null}
          </div>
          <Actions>
            <SecondaryBtn type="button" onClick={() => navigate('/app/profile')}>
              Cancel
            </SecondaryBtn>
            <Button disabled={!isValid || saving} type="submit">
              {saving ? 'Saving...' : 'Update'}
            </Button>
          </Actions>
        </Form>
      </Card>
    </Screen>
  )
}

