import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useAuth } from '../../auth/context/useAuth'
import { Button, FieldLabel, TextField, Subtitle, Title } from './ScreenPrimitives'
import { ThemeToggle } from '../components/ThemeToggle'

const Container = styled.div`
  width: 100%;
  max-width: 500px;
`

const Header = styled.div`
  margin-bottom: 32px;
`

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  gap: 16px;
`

const NavLink = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.muted};
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: color 150ms ease;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
    border-radius: 4px;
  }
`

const StyledTitle = styled(Title)`
  font-size: 1.8rem;
  font-weight: 900;
  margin-bottom: 8px;
`

const StyledSubtitle = styled(Subtitle)`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.muted};
`

const Form = styled.form`
  display: grid;
  gap: 18px;
`

const LoginCard = styled.div`
  padding: 0;
`

const FieldWrap = styled.div`
  display: grid;
  gap: 8px;
`

const PasswordWrap = styled.div`
  position: relative;
`

const PasswordField = styled(TextField)`
  padding-right: 48px;
`

const VisibilityButton = styled.button`
  position: absolute;
  top: 50%;
  right: 14px;
  transform: translateY(-50%);
  border: 0;
  background: transparent;
  color: ${({ theme }) => theme.colors.muted};
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
  transition: color 150ms ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
    border-radius: 8px;
  }
`

const FieldError = styled.p`
  margin: 0;
  color: #b42318;
  font-size: 0.8rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
`

const ErrorAlert = styled.div`
  background: rgba(180, 35, 24, 0.1);
  border: 1px solid rgba(180, 35, 24, 0.3);
  border-radius: 10px;
  padding: 12px 14px;
  color: #b42318;
  font-size: 0.9rem;
  font-weight: 500;
`

const ButtonGroup = styled.div`
  display: grid;
  gap: 14px;
  margin-top: 20px;
`

const PrimaryButton = styled(Button)`
  border-radius: 999px;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  border-color: transparent;
  font-size: 1rem;
  font-weight: 600;
  padding: 14px 24px;
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

  &:disabled {
    opacity: 0.5;
  }
`

const SecondaryButton = styled(Button)`
  border-radius: 999px;
  background: transparent;
  color: ${({ theme }) => theme.colors.primary};
  border: 1.5px solid ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  padding: 14px 24px;
  box-shadow: none;

  @media (hover: hover) {
    &:hover:not(:disabled) {
      background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(220, 38, 38, 0.1)' : 'rgba(220, 38, 38, 0.05)')};
    }
  }
`

const BottomLinks = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 20px;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.muted};
`

const UtilityRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: -8px;
`

const BottomLink = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  font-weight: 600;
  padding: 0;
  transition: opacity 150ms ease;

  &:hover {
    opacity: 0.8;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
    border-radius: 2px;
  }
`

function EyeIcon({ off = false }) {
  return (
    <svg aria-hidden="true" height="20" viewBox="0 0 24 24" width="20">
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      {off ? (
        <path
          d="M4 4 20 20"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      ) : null}
    </svg>
  )
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function LoginScreen() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ identifier: '', password: '' })
  const [error, setError] = useState('')
  const [errorCode, setErrorCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const fieldErrors = useMemo(() => {
    const value = form.identifier.trim()
    const identifierError = (() => {
      if (!value) return 'Enter your email or username.'
      if (value.includes('@') && !EMAIL_RE.test(value)) return 'Enter a valid email address.'
      if (!value.includes('@') && value.length < 3) return 'Username must be at least 3 characters.'
      return ''
    })()

    const passwordError =
      form.password.trim().length === 0
        ? 'Enter your password.'
        : form.password.trim().length < 8
          ? 'Password must be at least 8 characters.'
          : ''

    return { identifier: identifierError, password: passwordError }
  }, [form.identifier, form.password])

  const isValid = useMemo(() => Object.values(fieldErrors).every((value) => !value), [fieldErrors])

  const onChange = useCallback((event) => {
    const { name, value } = event.target
    setError('')
    setForm((prev) => ({ ...prev, [name]: value }))
  }, [])

  const onBlur = useCallback((event) => {
    const { name } = event.target
    setTouched((prev) => ({ ...prev, [name]: true }))
  }, [])

  const onSubmit = useCallback(
    async (event) => {
      event.preventDefault()
      setError('')
      setSubmitted(true)

      if (!isValid) return

      try {
        setIsLoading(true)
        await login({ email: form.identifier, password: form.password })
      } catch (err) {
        const text = String(err.message || '').toLowerCase()
        const friendlyError =
          text.includes('jwt') || text.includes('signature') || text.includes('token') || text.includes('session')
            ? 'We could not complete your sign-in securely. Please try again in a moment.'
            : text.includes('invalid') && text.includes('credentials')
              ? 'The email or password you entered is not correct.'
              : err.message || 'We could not sign you in right now. Please try again.'

        setError(friendlyError)
        setErrorCode(err.code || '')
      } finally {
        setIsLoading(false)
      }
    },
    [form.identifier, form.password, isValid, login],
  )

  const handleBackHome = useCallback(() => {
    navigate('/')
  }, [navigate])

  const shouldShowError = (name) => Boolean((submitted || touched[name]) && fieldErrors[name])

  return (
    <Container>
      <Header>
        <NavLinks>
          <NavLink onClick={handleBackHome} type="button">
            <span aria-hidden="true">{'<'}</span>
            <span>Back to home</span>
          </NavLink>
          <ThemeToggle />
        </NavLinks>
        <StyledTitle>Welcome back</StyledTitle>
        <StyledSubtitle>Sign in to continue.</StyledSubtitle>
      </Header>

      <LoginCard>
        <Form onSubmit={onSubmit}>
          <FieldWrap>
            <FieldLabel htmlFor="identifier">Email or Username</FieldLabel>
            <TextField
              $invalid={shouldShowError('identifier')}
              autoComplete="username"
              aria-describedby={shouldShowError('identifier') ? 'login-identifier-error' : undefined}
              aria-invalid={shouldShowError('identifier')}
              id="identifier"
              name="identifier"
              placeholder="you@example.com or username"
              type="text"
              value={form.identifier}
              onBlur={onBlur}
              onChange={onChange}
            />
            {shouldShowError('identifier') ? (
              <FieldError id="login-identifier-error">{fieldErrors.identifier}</FieldError>
            ) : null}
          </FieldWrap>

          <FieldWrap>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <PasswordWrap>
              <PasswordField
                $invalid={shouldShowError('password')}
                autoComplete="current-password"
                aria-describedby={shouldShowError('password') ? 'login-password-error' : undefined}
                aria-invalid={shouldShowError('password')}
                id="password"
                name="password"
                placeholder="********"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onBlur={onBlur}
                onChange={onChange}
              />
              <VisibilityButton
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                <EyeIcon off={showPassword} />
              </VisibilityButton>
            </PasswordWrap>
            {shouldShowError('password') ? <FieldError id="login-password-error">{fieldErrors.password}</FieldError> : null}
          </FieldWrap>

          <UtilityRow>
            <BottomLink
              type="button"
              onClick={() => {
                navigate('/forgot-password', { state: { identifier: form.identifier } })
              }}
            >
              Forgot password?
            </BottomLink>
          </UtilityRow>

          {error ? (
            <ErrorAlert role="alert">
              {error}
              {errorCode === 'EMAIL_UNVERIFIED' && (
                <div style={{ marginTop: '12px', fontSize: '0.85rem' }}>
                  <BottomLink
                    type="button"
                    style={{ color: 'inherit', fontWeight: 400, marginTop: 0 }}
                    onClick={() => navigate('/verify')}
                  >
                    Go to verification page →
                  </BottomLink>
                </div>
              )}
            </ErrorAlert>
          ) : null}

          <ButtonGroup>
            <PrimaryButton disabled={!isValid || isLoading} type="submit">
              {isLoading ? 'Logging in...' : 'Log in'}
            </PrimaryButton>
            <SecondaryButton
              type="button"
              onClick={() => {
                navigate('/signup')
              }}
            >
              Create new account
            </SecondaryButton>
          </ButtonGroup>

          <BottomLinks>
            <span>New here?</span>
            <BottomLink
              type="button"
              onClick={() => {
                navigate('/signup')
              }}
            >
              Sign up
            </BottomLink>
          </BottomLinks>
        </Form>
      </LoginCard>
    </Container>
  )
}
