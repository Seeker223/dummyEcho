import { useMemo, useRef, useState } from 'react'
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

const HiddenInput = styled.input`
  display: none;
`

export default function ProfileBasicScreen() {
  const navigate = useNavigate()
  const { currentUser, updateProfile } = useAuth()
  const fileInputRef = useRef(null)

  const [saving, setSaving] = useState(false)
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    title: currentUser?.title || '',
    fullName: currentUser?.fullName || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    age: currentUser?.age || '',
  })

  const errors = useMemo(() => {
    const fullName = String(form.fullName || '').trim()
    const email = String(form.email || '').trim()
    const phone = String(form.phone || '').trim()
    const age = String(form.age || '').trim()

    return {
      fullName: !fullName ? 'Full name is required.' : '',
      email: !email || !email.includes('@') ? 'Enter a valid email.' : '',
      phone: phone && phone.length < 8 ? 'Enter a valid phone number.' : '',
      age: age && Number.isNaN(Number(age)) ? 'Age must be a number.' : '',
    }
  }, [form.age, form.email, form.fullName, form.phone])

  const isValid = useMemo(() => Object.values(errors).every((v) => !v), [errors])
  const showErr = (key) => Boolean((submitted || touched[key]) && errors[key])

  const onPickImage = () => fileInputRef.current?.click()

  const onImageChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') updateProfile({ avatarUrl: reader.result }).catch(console.error)
    }
    reader.readAsDataURL(file)
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setSubmitted(true)
    if (!isValid) return
    setSaving(true)
    try {
      await updateProfile({
        title: String(form.title || '').trim(),
        fullName: String(form.fullName || '').trim(),
        email: String(form.email || '').trim(),
        phone: String(form.phone || '').trim(),
        age: form.age ? String(form.age).trim() : '',
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
        <HeaderTitle>Basic Information</HeaderTitle>
        <Spacer />
      </Header>

      <Card as="section">
        <Form onSubmit={onSubmit}>
          <div>
            <FieldLabel>Title</FieldLabel>
            <TextField value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="e.g. Dr." />
          </div>
          <div>
            <FieldLabel>Full name</FieldLabel>
            <TextField
              $invalid={showErr('fullName')}
              value={form.fullName}
              onBlur={() => setTouched((p) => ({ ...p, fullName: true }))}
              onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
              placeholder="Your name"
            />
            {showErr('fullName') ? <Error>{errors.fullName}</Error> : null}
          </div>
          <div>
            <FieldLabel>Email</FieldLabel>
            <TextField
              $invalid={showErr('email')}
              value={form.email}
              onBlur={() => setTouched((p) => ({ ...p, email: true }))}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="you@example.com"
            />
            {showErr('email') ? <Error>{errors.email}</Error> : null}
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
            <FieldLabel>Age</FieldLabel>
            <TextField
              $invalid={showErr('age')}
              value={form.age}
              onBlur={() => setTouched((p) => ({ ...p, age: true }))}
              onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))}
              placeholder="e.g. 32"
            />
            {showErr('age') ? <Error>{errors.age}</Error> : null}
          </div>
          <div>
            <FieldLabel>Profile photo</FieldLabel>
            <TextField readOnly value="Tap to upload" onClick={onPickImage} />
            <HiddenInput accept="image/*" onChange={onImageChange} ref={fileInputRef} type="file" />
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

