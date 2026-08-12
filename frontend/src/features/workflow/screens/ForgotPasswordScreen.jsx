import { useCallback, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useAuth } from '../../auth/context/useAuth'
import { Button, FieldLabel, TextField, Subtitle, Title } from './ScreenPrimitives'

const Container = styled.div`
  width: 100%;
  max-width: 520px;
`

const Header = styled.div`
  margin-bottom: 26px;
`

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
  gap: 16px;
`

const NavLink = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.muted};
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: color 150ms ease;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
    border-radius: 6px;
  }
`

const StyledTitle = styled(Title)`
  font-size: 1.7rem;
  font-weight: 950;
  margin-bottom: 8px;
`

const StyledSubtitle = styled(Subtitle)`
  font-size: 0.92rem;
  color: ${({ theme }) => theme.colors.muted};
`

const Form = styled.form`
  display: grid;
  gap: 16px;
`

const FieldWrap = styled.div`
  display: grid;
  gap: 8px;
`

const FieldError = styled.p`
  margin: 0;
  color: #b42318;
  font-size: 0.8rem;
  font-weight: 600;
`

const ErrorAlert = styled.div`
  background: rgba(180, 35, 24, 0.1);
  border: 1px solid rgba(180, 35, 24, 0.3);
  border-radius: 10px;
  padding: 12px 14px;
  color: #b42318;
  font-size: 0.9rem;
  font-weight: 600;
`

const InfoAlert = styled.div`
  background: rgba(22, 163, 74, 0.1);
  border: 1px solid rgba(22, 163, 74, 0.25);
  border-radius: 10px;
  padding: 12px 14px;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
  font-weight: 650;
`

const ButtonGroup = styled.div`
  display: grid;
  gap: 12px;
  margin-top: 12px;
`

const PrimaryButton = styled(Button)`
  border-radius: 999px;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  border-color: transparent;
  font-size: 1rem;
  font-weight: 700;
  padding: 14px 24px;
  box-shadow: 0 10px 24px rgba(220, 38, 38, 0.28);

  @media (hover: hover) {
    &:hover:not(:disabled) {
      box-shadow: 0 16px 32px rgba(220, 38, 38, 0.36);
      background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
    }
  }

  &:disabled {
    opacity: 0.55;
  }
`

const SecondaryButton = styled(Button)`
  border-radius: 999px;
  background: transparent;
  color: ${({ theme }) => theme.colors.primary};
  border: 1.5px solid ${({ theme }) => theme.colors.primary};
  font-weight: 700;
  padding: 14px 24px;
`

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ForgotPasswordScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const { resetPassword } = useAuth()

  const seeded = useMemo(() => {
    const em = location.state && location.state.email
    return { email: em ? String(em) : '' }
  }, [location.state])

  const [form, setForm] = useState({
    email: seeded.email,
    password: '',
  })
  const [error, setError] = useState('')
  const [ok, setOk] = useState(false)
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const fieldErrors = useMemo(() => {
    const mail = String(form.email || '').trim()
    const pwd = String(form.password || '').trim()
    return {
      email: (() => {
        if (!mail) return 'Enter the email on the account.'
        if (!EMAIL_RE.test(mail)) return 'Enter a valid email address.'
        return ''
      })(),
      password: (() => {
        if (!pwd) return 'Enter a new password.'
        if (pwd.length < 8) return 'Password must be at least 8 characters.'
        return ''
      })(),
    }
  }, [form.email, form.password])

  const isValid = useMemo(() => Object.values(fieldErrors).every((v) => !v), [fieldErrors])

  const onChange = useCallback((e) => {
    const { name, value } = e.target
    setError('')
    setOk(false)
    setForm((prev) => ({ ...prev, [name]: value }))
  }, [])

  const onBlur = useCallback((e) => {
    const { name } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
  }, [])

  const shouldShowError = (name) => Boolean((submitted || touched[name]) && fieldErrors[name])

  const onSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      setSubmitted(true)
      setError('')
      setOk(false)
      if (!isValid) return

      setLoading(true)
      try {
        await resetPassword({ email: form.email, password: form.password })
        setOk(true)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    },
    [form.email, form.password, isValid, resetPassword],
  )

  return (
    <Container>
      <Header>
        <NavLinks>
          <NavLink type="button" onClick={() => navigate('/login')}>
            <span aria-hidden="true">{'<'}</span>
            <span>Back to login</span>
          </NavLink>
        </NavLinks>
        <StyledTitle>Reset password</StyledTitle>
        <StyledSubtitle>Enter your email to receive a secure password reset link.</StyledSubtitle>
      </Header>

      <Form onSubmit={onSubmit}>
        {ok ? <InfoAlert>Password reset link sent! Please check your email inbox to proceed.</InfoAlert> : null}
        {error ? <ErrorAlert role="alert">{error}</ErrorAlert> : null}
        <FieldWrap>
          <FieldLabel htmlFor="email">Account Email</FieldLabel>
          <TextField
            $invalid={shouldShowError('email')}
            autoComplete="email"
            id="email"
            name="email"
            placeholder="you@example.com"
            type="email"
            value={form.email}
            onBlur={onBlur}
            onChange={onChange}
            disabled={loading || ok}
          />
          {shouldShowError('email') ? <FieldError>{fieldErrors.email}</FieldError> : null}
        </FieldWrap>

        <FieldWrap>
          <FieldLabel htmlFor="password">New Password</FieldLabel>
          <TextField
            $invalid={shouldShowError('password')}
            autoComplete="new-password"
            id="password"
            name="password"
            placeholder="At least 8 characters"
            type="password"
            value={form.password}
            onBlur={onBlur}
            onChange={onChange}
            disabled={loading || ok}
          />
          {shouldShowError('password') ? <FieldError>{fieldErrors.password}</FieldError> : null}
        </FieldWrap>

        {!ok && (
          <ButtonGroup>
            <PrimaryButton disabled={!isValid || loading} type="submit">
              {loading ? 'Resetting password...' : 'Reset password'}
            </PrimaryButton>
            <SecondaryButton type="button" onClick={() => navigate('/signup')}>
              Create a new account
            </SecondaryButton>
          </ButtonGroup>
        )}
      </Form>
    </Container>
  )
}
