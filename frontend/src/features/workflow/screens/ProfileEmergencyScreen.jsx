import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useAuth } from '../../auth/context/useAuth'
import { Button, Card, FieldLabel, Screen, TextField } from './ScreenPrimitives'
import { InPageMenuButton } from '../components/InPageMenuButton'

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

export default function ProfileEmergencyScreen() {
  const navigate = useNavigate()
  const { currentUser, updateProfile } = useAuth()
  const [saving, setSaving] = useState(false)
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    name: currentUser?.emergencyContactName || '',
    phone: currentUser?.emergencyContactPhone || '',
    relationship: currentUser?.emergencyContactRelationship || '',
  })

  const errors = useMemo(() => {
    const name = String(form.name || '').trim()
    const phone = String(form.phone || '').trim()
    return {
      name: !name ? 'Contact name is required.' : '',
      phone: !phone || phone.length < 8 ? 'Enter a valid phone number.' : '',
    }
  }, [form.name, form.phone])

  const isValid = useMemo(() => Object.values(errors).every((v) => !v), [errors])
  const showErr = (key) => Boolean((submitted || touched[key]) && errors[key])

  const onSubmit = async (event) => {
    event.preventDefault()
    setSubmitted(true)
    if (!isValid) return
    setSaving(true)
    try {
      await updateProfile({
        emergencyContactName: String(form.name || '').trim(),
        emergencyContactPhone: String(form.phone || '').trim(),
        emergencyContactRelationship: String(form.relationship || '').trim(),
      })
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
        <HeaderTitle>Emergency Contact</HeaderTitle>
        <Spacer />
      </Header>

      <Card as="section">
        <Form onSubmit={onSubmit}>
          <div>
            <FieldLabel>Contact name</FieldLabel>
            <TextField
              $invalid={showErr('name')}
              value={form.name}
              onBlur={() => setTouched((p) => ({ ...p, name: true }))}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. John Doe"
            />
            {showErr('name') ? <Error>{errors.name}</Error> : null}
          </div>
          <div>
            <FieldLabel>Phone</FieldLabel>
            <TextField
              $invalid={showErr('phone')}
              value={form.phone}
              onBlur={() => setTouched((p) => ({ ...p, phone: true }))}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              placeholder="e.g. +234..."
            />
            {showErr('phone') ? <Error>{errors.phone}</Error> : null}
          </div>
          <div>
            <FieldLabel>Relationship (optional)</FieldLabel>
            <TextField
              value={form.relationship}
              onChange={(e) => setForm((p) => ({ ...p, relationship: e.target.value }))}
              placeholder="e.g. Parent, Spouse"
            />
          </div>
          <Actions>
            <SecondaryBtn type="button" onClick={() => navigate('/app/profile')}>
              Cancel
            </SecondaryBtn>
            <Button disabled={!isValid || saving} type="submit">
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </Actions>
        </Form>
      </Card>
    </Screen>
  )
}

