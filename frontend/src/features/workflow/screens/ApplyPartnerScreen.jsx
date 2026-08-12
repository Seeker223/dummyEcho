import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { Screen, Card, Button, FieldLabel, TextField, SelectField } from './ScreenPrimitives'
import { InPageMenuButton } from '../components/InPageMenuButton'

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
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

const Title = styled.h2`
  margin: 0 0 6px;
  font-size: 1.35rem;
`

const Subtitle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 600;
  line-height: 1.55;
`

const Form = styled.form`
  display: grid;
  gap: 12px;
  margin-top: 14px;
`

export default function ApplyPartnerScreen() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    businessName: '',
    category: 'Pharmacy',
    city: 'Lagos',
  })

  const onSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      navigate('/app/marketplace')
    } finally {
      setSaving(false)
    }
  }

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
        <Title>Apply as a Partner</Title>
        <Subtitle>Labs, pharmacies, gyms, and wellness providers can list services and offers.</Subtitle>

        <Form onSubmit={onSubmit}>
          <div>
            <FieldLabel htmlFor="businessName">Business name</FieldLabel>
            <TextField
              id="businessName"
              name="businessName"
              placeholder="e.g. Reddington Lab"
              value={form.businessName}
              onChange={(e) => setForm((p) => ({ ...p, businessName: e.target.value }))}
            />
          </div>
          <div>
            <FieldLabel htmlFor="category">Category</FieldLabel>
            <SelectField
              id="category"
              name="category"
              value={form.category}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
            >
              <option>Pharmacy</option>
              <option>Lab</option>
              <option>Fitness</option>
              <option>Wellness</option>
            </SelectField>
          </div>
          <div>
            <FieldLabel htmlFor="city">City</FieldLabel>
            <SelectField
              id="city"
              name="city"
              value={form.city}
              onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
            >
              <option>Lagos</option>
              <option>Abuja</option>
              <option>Ibadan</option>
              <option>Port Harcourt</option>
            </SelectField>
          </div>
          <Button disabled={saving} type="submit">
            {saving ? 'Submitting...' : 'Submit partner application'}
          </Button>
        </Form>
      </Card>
    </Screen>
  )
}

