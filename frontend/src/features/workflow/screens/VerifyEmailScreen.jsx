import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { Button, Card, FieldLabel, Screen, TextField } from './ScreenPrimitives'
import { BrandedSheetModal } from '../components/BrandedSheetModal'
import { markPendingSignupVerified } from '../../auth/services/authService'

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

const HelperCard = styled.div`
  margin-top: 16px;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme?.colors?.border || 'rgba(255,255,255,0.1)'};
  background: ${({ theme }) => theme?.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(220,38,38,0.05)'};
`

const HelperTitle = styled.h3`
  margin: 0 0 6px;
  font-size: 1rem;
  font-weight: 800;
`

const HelperText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme?.colors?.muted || '#6b7280'};
  line-height: 1.5;
  font-size: 0.95rem;
`

const InlineActionRow = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 14px;
`

const PrimaryActionButton = styled(Button)`
  border-radius: 999px;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  border-color: transparent;
  font-size: 1rem;
  font-weight: 700;
  padding: 14px 24px;
  margin-top: 20px;
  width: 100%;
  box-shadow: 0 10px 24px rgba(220, 38, 38, 0.28);

  @media (hover: hover) {
    &:hover:not(:disabled) {
      box-shadow: 0 16px 32px rgba(220, 38, 38, 0.36);
      background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
    }
  }

  &:active:not(:disabled) {
    box-shadow: 0 6px 16px rgba(220, 38, 38, 0.24);
  }
`

const GhostButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme?.colors?.muted || '#6b7280'};
  font-size: 0.95rem;
  font-weight: 600;
  margin-top: 24px;
  width: 100%;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme?.colors?.primary || '#dc2626'};
    text-decoration: underline;
  }
`

export default function VerifyEmailScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState({ type: 'idle', message: '' })
  const [modal, setModal] = useState({ open: false, title: '', message: '' })
  const seedApplied = useRef(false)
  const autoVerifyAttempted = useRef(false)
  const initialEmail = useMemo(() => {
    const stateEmail = String(location.state?.email || '').trim()
    if (stateEmail) return stateEmail

    const queryEmail = new URLSearchParams(location.search).get('email')
    if (queryEmail) return String(queryEmail || '').trim()

    if (typeof window !== 'undefined') {
      const pendingEmail = String(window.localStorage.getItem('ee_pending_verification_email') || '').trim()
      if (pendingEmail) return pendingEmail

      const latestDraft = getLatestPendingSignupDraft()
      if (latestDraft?.email) return latestDraft.email
    }

    return ''
  }, [location.search, location.state?.email])
  const verificationSeed = useMemo(() => {
    const searchParams = new URLSearchParams(location.search)
    return String(searchParams.get('token') || searchParams.get('code') || '').trim()
  }, [location.search])

  useEffect(() => {
    if (!verificationSeed || seedApplied.current) return
    if (token.trim()) return
    seedApplied.current = true
    setToken(verificationSeed)
  }, [token, verificationSeed])

  useEffect(() => {
    if (!verificationSeed || autoVerifyAttempted.current) return
    if (loading || result.type !== 'idle') return

    autoVerifyAttempted.current = true
    const timerId = window.setTimeout(() => {
      void submitVerification(verificationSeed)
    }, 150)

    return () => window.clearTimeout(timerId)
  }, [loading, result.type, verificationSeed])

  const submitVerification = async (value) => {
    const nextToken = String(value || '').trim()
    if (!nextToken) {
      setError('Please enter the verification code.')
      return
    }

    if (!initialEmail) {
      setError('Email address is required for verification.')
      return
    }

    setLoading(true)
    setError('')
    setResult({ type: 'idle', message: '' })

    try {
      const signupDraft = getSignupDraftForEmail(initialEmail)
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: initialEmail,
          token: nextToken,
          code: nextToken,
          user_id: signupDraft?.user_id || '',
          full_name: signupDraft?.fullName || '',
          username: signupDraft?.username || '',
          title: signupDraft?.title || '',
          role: signupDraft?.role || '',
        }),
      })

      const data = await readApiResponse(response)

      if (response.ok) {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('ee_pending_verification_email')
        }
        markPendingSignupVerified(initialEmail, nextToken)
        setResult({
          type: 'success',
          message: 'Your email is verified. You can sign in now.',
        })
        setModal({
          open: true,
          title: 'Email Verified',
          message: 'Your email has been successfully verified. You can now log in.',
        })
      } else {
        const nextError = data.error || 'Failed to verify email. Please try again.'
        setError(nextError)
        setResult({
          type: /expired|invalid|not found|missing/i.test(nextError) ? 'recoverable' : 'error',
          message: nextError,
        })
      }
    } catch (err) {
      const nextError = 'An error occurred during verification.'
      setError(nextError)
      setResult({ type: 'error', message: nextError })
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    await submitVerification(token)
  }

  return (
    <Screen>
      <Container>
        <BrandedSheetModal
          isOpen={modal.open}
          title={modal.title}
          message={modal.message}
          primaryLabel="Go to Login"
          onPrimary={() => {
            setModal({ open: false, title: '', message: '' })
            navigate('/login', { replace: true })
          }}
          onClose={() => {
            setModal({ open: false, title: '', message: '' })
            navigate('/login', { replace: true })
          }}
        />

        <Header>
          <Title>Verify your account</Title>
          <Sub>
            We sent a verification code to your email address and via SMS to your phone number.
            {initialEmail ? ` Code for ${initialEmail}.` : ''} Check your email or SMS and enter the 6-digit code below to complete your registration. Didn&apos;t receive it?{' '}
            <GhostButton
              type="button"
              style={{ display: 'inline', padding: 0, marginTop: 0, textDecoration: 'underline' }}
              onClick={() => navigate('/resend-verification', { state: { email: initialEmail } })}
            >
              Resend code
            </GhostButton>
          </Sub>
        </Header>

        <Card as="form" onSubmit={handleVerify}>
          <div>
            <FieldLabel>Verification Code</FieldLabel>
            <TextField
              placeholder="e.g. 137747"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </div>

          {error && <ErrorText>{error}</ErrorText>}

          {result.type === 'success' ? (
            <HelperCard>
              <HelperTitle>Verification complete</HelperTitle>
              <HelperText>{result.message}</HelperText>
              <InlineActionRow>
                <PrimaryActionButton type="button" onClick={() => navigate('/login', { replace: true })} style={{ marginTop: 0 }}>
                  Go to Login
                </PrimaryActionButton>
                <GhostButton type="button" style={{ marginTop: 0, width: 'auto' }} onClick={() => navigate('/login', { replace: true })}>
                  Back to Login
                </GhostButton>
              </InlineActionRow>
            </HelperCard>
          ) : null}

          {result.type === 'recoverable' ? (
            <HelperCard>
              <HelperTitle>That code looks expired</HelperTitle>
              <HelperText>Request a fresh verification code and try again. If you just changed screens, check the latest email or SMS first.</HelperText>
              <InlineActionRow>
                <PrimaryActionButton type="button" onClick={() => navigate('/resend-verification', { state: { email: initialEmail } })}>
                  Resend code
                </PrimaryActionButton>
                <GhostButton type="button" style={{ marginTop: 0, width: 'auto' }} onClick={() => navigate('/login')}>
                  Back to Login
                </GhostButton>
              </InlineActionRow>
            </HelperCard>
          ) : null}

          <PrimaryActionButton type="submit" disabled={loading || !token.trim()}>
            {loading ? 'Verifying...' : 'Verify Account'}
          </PrimaryActionButton>

          {result.type !== 'success' && result.type !== 'recoverable' ? (
            <GhostButton type="button" onClick={() => navigate('/login')}>
              Back to Login
            </GhostButton>
          ) : null}
        </Card>
      </Container>
    </Screen>
  )
}

function getSignupDraftForEmail(email) {
  const target = String(email || '').trim().toLowerCase()
  if (!target || typeof window === 'undefined') return null

  const raw = window.localStorage.getItem('ee_pending_signups:v1')
  if (!raw) return null

  try {
    const drafts = JSON.parse(raw)
    if (!Array.isArray(drafts)) return null
    return drafts.find((draft) => String(draft?.email || '').trim().toLowerCase() === target) || null
  } catch {
    return null
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
