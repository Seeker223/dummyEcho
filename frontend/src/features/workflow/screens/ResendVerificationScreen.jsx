import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Button, Card, FieldLabel, Screen, TextField } from './ScreenPrimitives'

const Container = styled.div`
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  padding-top: 40px;
`

const Header = styled.div`
  margin-bottom: 24px;
`

const Title = styled.h2`
  margin: 0 0 8px;
  font-size: 1.8rem;
  font-weight: 900;
  letter-spacing: -0.03em;
`

const Sub = styled.p`
  margin: 0;
  color: ${({ theme }) => theme?.colors?.muted || '#6b7280'};
  font-size: 1rem;
  line-height: 1.5;
`

const ErrorText = styled.p`
  color: ${({ theme }) => theme?.colors?.primary || '#dc2626'};
  font-size: 0.9rem;
  margin-top: 12px;
  font-weight: 600;
`

const SuccessBox = styled.div`
  margin-top: 16px;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid rgba(34, 197, 94, 0.2);
  background: rgba(34, 197, 94, 0.08);
`

const SuccessTitle = styled.h3`
  margin: 0 0 6px;
  font-size: 1rem;
  font-weight: 800;
`

const SuccessText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme?.colors?.muted || '#6b7280'};
  line-height: 1.5;
  font-size: 0.95rem;
`

const SecondaryButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme?.colors?.muted || '#6b7280'};
  font-size: 0.95rem;
  font-weight: 600;
  margin-top: 18px;
  width: 100%;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme?.colors?.primary || '#dc2626'};
    text-decoration: underline;
  }
`

export default function ResendVerificationScreen({ initialEmail = '' }) {
  const [email, setEmail] = useState(() => {
    if (initialEmail) return initialEmail
    if (typeof window !== 'undefined') {
      const pendingEmail = window.localStorage.getItem('ee_pending_verification_email') || ''
      if (pendingEmail) return pendingEmail
      return getLatestPendingSignupDraft()?.email || ''
    }
    return ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    setEmail(initialEmail || (typeof window !== 'undefined' ? window.localStorage.getItem('ee_pending_verification_email') || getLatestPendingSignupDraft()?.email || '' : ''))
  }, [initialEmail])

  const handleResend = async (e) => {
    e.preventDefault()
    const nextEmail = String(email || '').trim().toLowerCase()

    if (!nextEmail) {
      setError('Enter the email address used during registration.')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: nextEmail,
          ...getSignupDraftForEmail(nextEmail),
        }),
      })

      const data = await readApiResponse(response)

      if (!response.ok) {
        throw new Error(data.error || 'Could not resend verification code.')
      }

      setSuccess('A fresh code has been sent. Check your inbox or SMS, then continue verifying.')
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('ee_pending_verification_email', nextEmail)
      }

      window.setTimeout(() => {
        window.location.assign(`/verify?email=${encodeURIComponent(nextEmail)}`)
      }, 1400)
    } catch (err) {
      setError(err.message || 'Could not resend verification code.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Screen>
      <Container>
        <Header>
          <Title>Resend verification code</Title>
          <Sub>We’ll send a new 6-digit code to the email address you used when registering.</Sub>
        </Header>

        <Card as="form" onSubmit={handleResend}>
          <div>
            <FieldLabel>Email address</FieldLabel>
            <TextField
              placeholder="e.g. name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoFocus={!initialEmail}
            />
          </div>

          {error ? <ErrorText>{error}</ErrorText> : null}

          {success ? (
            <SuccessBox>
              <SuccessTitle>Code sent</SuccessTitle>
              <SuccessText>{success}</SuccessText>
            </SuccessBox>
          ) : null}

          <Button type="submit" disabled={loading || !email.trim()} style={{ marginTop: 20 }}>
            {loading ? 'Sending...' : 'Send new code'}
          </Button>

          <SecondaryButton type="button" onClick={() => window.location.assign(`/verify${email.trim() ? `?email=${encodeURIComponent(email.trim().toLowerCase())}` : ''}`)}>
            Back to verification
          </SecondaryButton>
        </Card>
      </Container>
    </Screen>
  )
}

function getSignupDraftForEmail(email) {
  const target = String(email || '').trim().toLowerCase()
  if (!target || typeof window === 'undefined') return {}

  const raw = window.localStorage.getItem('ee_pending_signups:v1')
  if (!raw) return {}

  try {
    const drafts = JSON.parse(raw)
    if (!Array.isArray(drafts)) return {}
    const draft = drafts.find((item) => String(item?.email || '').trim().toLowerCase() === target)
    if (!draft) return {}
    return {
      user_id: draft.user_id || '',
      full_name: draft.fullName || '',
      username: draft.username || '',
      title: draft.title || '',
      role: draft.role || '',
    }
  } catch {
    return {}
  }
}

function getLatestPendingSignupDraft() {
  if (typeof window === 'undefined') return null

  const raw = window.localStorage.getItem('ee_pending_signups:v1')
  if (!raw) return null

  try {
    const drafts = JSON.parse(raw)
    if (!Array.isArray(drafts) || !drafts.length) return null
    return drafts[0] || null
  } catch {
    return null
  }
}

async function readApiResponse(response) {
  const text = await response.text()
  if (!text) return {}

  try {
    return JSON.parse(text)
  } catch {
    return {
      error: response.ok
        ? 'The server returned an unreadable response.'
        : 'The server returned an unexpected error page. Please try again.',
    }
  }
}
