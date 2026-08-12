import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { supabase } from '../../../lib/supabaseClient'
import { Button, FieldLabel, TextField, Subtitle, Title } from './ScreenPrimitives'

const Container = styled.div`
  width: 100%;
  max-width: 520px;
`

const Header = styled.div`
  margin-bottom: 26px;
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

export default function UpdatePasswordScreen() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    newPassword: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState(false)
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const fieldErrors = useMemo(() => {
    const pw = String(form.newPassword || '')
    const cpw = String(form.confirmPassword || '')

    return {
      newPassword: pw.trim().length < 8 ? 'Password must be at least 8 characters.' : '',
      confirmPassword: cpw !== pw ? 'Passwords do not match.' : '',
    }
  }, [form.confirmPassword, form.newPassword])

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

  const onSubmit = useCallback(async (e) => {
    e.preventDefault()
    setSubmitted(true)
    setError('')
    setOk(false)
    if (!isValid) return

    setLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: form.newPassword,
      })

      if (updateError) {
        throw new Error(updateError.message || 'Failed to update password.')
      }

      setOk(true)
      window.setTimeout(() => {
        navigate('/login', { state: { reset: 1 } })
      }, 1500)
    } catch (err) {
      setError(err.message || 'An error occurred during password update.')
    } finally {
      setLoading(false)
    }
  }, [form.newPassword, isValid, navigate])

  return (
    <Container>
      <Header>
        <StyledTitle>Update your password</StyledTitle>
        <StyledSubtitle>Enter your new password below.</StyledSubtitle>
      </Header>

      <Form onSubmit={onSubmit}>
        {ok ? <InfoAlert>Password updated successfully! Redirecting to login...</InfoAlert> : null}
        {error ? <ErrorAlert role="alert">{error}</ErrorAlert> : null}

        <FieldWrap>
          <FieldLabel htmlFor="newPassword">New password</FieldLabel>
          <PasswordWrap>
            <PasswordField
              $invalid={shouldShowError('newPassword')}
              id="newPassword"
              name="newPassword"
              placeholder="Create a new password"
              type={showPassword ? 'text' : 'password'}
              value={form.newPassword}
              onBlur={onBlur}
              onChange={onChange}
              disabled={loading || ok}
            />
            <VisibilityButton
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              <EyeIcon off={showPassword} />
            </VisibilityButton>
          </PasswordWrap>
          {shouldShowError('newPassword') ? <FieldError>{fieldErrors.newPassword}</FieldError> : null}
        </FieldWrap>

        <FieldWrap>
          <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
          <TextField
            $invalid={shouldShowError('confirmPassword')}
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Re-enter password"
            type={showPassword ? 'text' : 'password'}
            value={form.confirmPassword}
            onBlur={onBlur}
            onChange={onChange}
            disabled={loading || ok}
          />
          {shouldShowError('confirmPassword') ? <FieldError>{fieldErrors.confirmPassword}</FieldError> : null}
        </FieldWrap>

        <ButtonGroup>
          <PrimaryButton disabled={!isValid || loading || ok} type="submit">
            {loading ? 'Updating...' : 'Update Password'}
          </PrimaryButton>
        </ButtonGroup>
      </Form>
    </Container>
  )
}
