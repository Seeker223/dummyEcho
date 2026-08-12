import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #050f1c 0%, #111827 52%, #7f1d1d 100%);
  padding: 24px;
`

const Card = styled.form`
  width: 100%;
  max-width: 440px;
  background: rgba(10, 15, 28, 0.88);
  color: #f8fafc;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 28px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
`

const Title = styled.h1`
  margin: 0 0 10px;
  font-size: 2rem;
  line-height: 1.1;
`

const Message = styled.p`
  margin: 0 0 18px;
  color: rgba(248, 250, 252, 0.72);
  line-height: 1.6;
`

const Field = styled.input`
  width: 100%;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.05);
  color: #f8fafc;
  outline: none;
  margin-bottom: 14px;

  &::placeholder {
    color: rgba(248, 250, 252, 0.45);
  }
`

const ErrorText = styled.p`
  margin: 8px 0 0;
  color: #f87171;
  font-size: 0.95rem;
`

const SuccessBox = styled.div`
  margin-top: 14px;
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(34, 197, 94, 0.12);
  border: 1px solid rgba(34, 197, 94, 0.2);
`

const Button = styled.button`
  width: 100%;
  border: none;
  border-radius: 999px;
  padding: 14px 18px;
  font-weight: 800;
  color: white;
  cursor: pointer;
  background: linear-gradient(135deg, #dc2626, #991b1b);
  box-shadow: 0 14px 30px rgba(220, 38, 38, 0.28);
`

const LinkButton = styled.button`
  width: 100%;
  margin-top: 16px;
  background: transparent;
  border: none;
  color: rgba(248, 250, 252, 0.72);
  cursor: pointer;
  text-decoration: underline;
`

export default function ResendVerificationPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!router.isReady) return
    const nextEmail = String(router.query.email || '').trim()
    if (nextEmail) setEmail(nextEmail)
  }, [router.isReady, router.query.email])

  const handleSubmit = async (event) => {
    event.preventDefault()
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
        body: JSON.stringify({ email: nextEmail }),
      })
      const data = await readApiResponse(response)
      if (!response.ok) throw new Error(data.error || 'Could not resend verification code.')

      setSuccess('A fresh code has been sent. Redirecting you back to verification...')
      window.setTimeout(() => {
        router.push(`/verify?email=${encodeURIComponent(nextEmail)}`)
      }, 1200)
    } catch (err) {
      setError(err.message || 'Could not resend verification code.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container>
      <Card onSubmit={handleSubmit}>
        <Title>Resend verification</Title>
        <Message>Enter the email you used to register. We’ll send a new 6-digit code and take you back to verification automatically.</Message>
        <Field
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={loading}
        />
        <Button type="submit" disabled={loading || !email.trim()}>
          {loading ? 'Sending...' : 'Send new code'}
        </Button>
        {error ? <ErrorText>{error}</ErrorText> : null}
        {success ? <SuccessBox>{success}</SuccessBox> : null}
        <LinkButton type="button" onClick={() => router.push('/verify')}>
          Back to verification
        </LinkButton>
      </Card>
    </Container>
  )
}

async function readApiResponse(response) {
  const text = await response.text()
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch {
    return { error: response.ok ? 'The server returned an unreadable response.' : 'The server returned an unexpected error page. Please try again.' }
  }
}
