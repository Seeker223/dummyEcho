import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useAuth } from '../../auth/context/useAuth'
import { Button, Card, FieldLabel, Screen, SelectField, TextField } from './ScreenPrimitives'
import { BrandedSheetModal } from '../components/BrandedSheetModal'
import { UploadCard, UploadSelect } from '../components/UploadCard'
import { DocumentKinds, upsertUserDocument } from '../services/documentService'
import { defaultDoctorSpecialty, defaultNurseSpecialty, professionalSpecialties } from '../constants/specialties'
import { ThemeToggle } from '../components/ThemeToggle'
import { savePendingSignupDraft } from '../../auth/services/authService'

const Container = styled.div`
  width: 100%;
  max-width: 520px;
  margin: 0 auto;
`

const Header = styled.div`
  margin-bottom: 18px;
`

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`

const NavLink = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`

const Title = styled.h2`
  margin: 0 0 6px;
  font-size: 1.8rem;
  font-weight: 900;
  letter-spacing: -0.03em;
`

const Sub = styled.p`
  margin: 0;
  color: ${({ theme }) => theme?.colors?.muted || '#6b7280'};
  font-weight: 600;
`

const Progress = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 16px;
  margin-bottom: 6px;
`

const ProgressDot = styled.span`
  width: 20px;
  height: 20px;
  border-radius: 999px;
  border: 2px solid ${({ $done, theme }) => ($done ? theme.colors.success : theme.colors.border)};
  background: ${({ $done, theme }) => ($done ? '#a7f3b3' : theme.colors.surface)};
  box-shadow: ${({ $done }) =>
    $done ? '0 6px 12px rgba(34, 197, 94, 0.35)' : '0 4px 8px rgba(15, 31, 68, 0.16)'};
`

const Line = styled.span`
  flex: 1;
  height: 1px;
  border-top: 1px dashed ${({ $done, theme }) => ($done ? theme.colors.success : theme.colors.border)};
`

const LabelRow = styled.div`
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
`

const StepLabel = styled.span`
  font-size: 0.92rem;
  text-align: center;
  color: ${({ $active, theme }) => ($active ? theme.colors.success : theme.colors.muted)};
`

const StepHint = styled.p`
  margin: 8px 0 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.95rem;
`

const Row = styled.div`
  display: grid;
  gap: 12px;

  @media (min-width: 520px) {
    grid-template-columns: 1fr 1fr;
  }
`

const Actions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 16px;
`

const PrimaryActionButton = styled(Button)`
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

  &:active:not(:disabled) {
    box-shadow: 0 6px 16px rgba(220, 38, 38, 0.24);
  }
`

const GhostButton = styled(Button)`
  border-radius: 999px;
  background: transparent;
  color: ${({ theme }) => theme.colors.primary};
  border: 1.5px solid ${({ theme }) => theme.colors.primary};
  font-weight: 700;
  padding: 14px 24px;
  box-shadow: none;

  @media (hover: hover) {
    &:hover:not(:disabled) {
      background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(220, 38, 38, 0.1)' : 'rgba(220, 38, 38, 0.05)')};
    }
  }
`

const StrengthMeter = styled.div`
  display: grid;
  gap: 8px;
  margin-top: 10px;
`

const StrengthBars = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
`

const StrengthBar = styled.span`
  height: 6px;
  border-radius: 999px;
  background: ${({ $active, $tone, theme }) => {
    if (!$active) return theme.colors.border
    if ($tone === 'strong') return '#16a34a'
    if ($tone === 'fair') return '#d97706'
    return '#b42318'
  }};
`

const FieldHint = styled.p`
  margin: 4px 0 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.86rem;
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
  right: 12px;
  transform: translateY(-50%);
  border: 0;
  background: transparent;
  color: ${({ theme }) => theme.colors.muted};
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
    border-radius: 8px;
  }
`

const Error = styled.div`
  margin-top: 10px;
  color: ${({ theme }) => theme?.colors?.primary || '#dc2626'};
  font-weight: 700;
`

const FieldError = styled.p`
  margin: 0;
  color: #b42318;
  font-size: 0.82rem;
  font-weight: 600;
`

function EyeIcon({ off = false } = {}) {
  return (
    <svg aria-hidden="true" height="18" viewBox="0 0 24 24" width="18">
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

export default function SignupScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const { register, login, enabledRoles } = useAuth()

  const next = useMemo(() => {
    const raw = location.state && location.state.next
    return raw ? String(raw) : null
  }, [location.state])

  const presetRole = useMemo(() => {
    const raw = location.state && location.state.presetRole
    return raw ? String(raw) : ''
  }, [location.state])

  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [touched, setTouched] = useState({})
  const [submittedStep, setSubmittedStep] = useState(0)
  const [modal, setModal] = useState({ open: false, title: '', message: '' })
  const [isRegistering, setIsRegistering] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [form, setForm] = useState({
    role: presetRole,
    title: '',
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    licenseId: '',
    specialization: defaultDoctorSpecialty,
    department: defaultNurseSpecialty,
    state: 'Lagos',
    idType: 'NIN',
    degreeType: '',
    govIdFile: null,
    annualFile: null,
    degreeFile: null,
    regCertFile: null,
  })

  const setField = (key, value) => {
    setError('')
    setForm((s) => ({ ...s, [key]: value }))
  }

  const onBlur = (key) => setTouched((prev) => ({ ...prev, [key]: true }))

  const goLogin = () => navigate('/login', { replace: true, state: { next } })

  const careerRole = useMemo(() => String(form.role || '').trim().toLowerCase(), [form.role])
  const isClinician = careerRole === 'doctor' || careerRole === 'nurse'
  const totalSteps = 2

  const steps = useMemo(() => {
    return ['Personal info', 'Security']
  }, [])

  const passwordStrength = useMemo(() => {
    const password = String(form.password || '').trim()
    if (!password) return { score: 0, tone: 'weak', label: 'Use at least 8 characters.' }

    let score = 0
    if (password.length >= 8) score += 1
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1
    if (/\d/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1

    if (score >= 4) return { score, tone: 'strong', label: 'Strong password' }
    if (score >= 2) return { score, tone: 'fair', label: 'Fair password. Add a number or symbol to strengthen it.' }
    return { score, tone: 'weak', label: 'Weak password. Add upper/lowercase letters, numbers, or symbols.' }
  }, [form.password])

  const step1Errors = useMemo(() => {
    const roleError = !String(form.role || '').trim() ? 'Select what you are joining as.' : ''
    const fullNameError = !String(form.fullName || '').trim() ? 'Enter your full name.' : ''
    const username = String(form.username || '').trim()
    const usernameError = username.length < 3 ? 'Username must be at least 3 characters.' : ''
    const email = String(form.email || '').trim()
    const emailError = !email ? 'Enter your email address.' : !EMAIL_RE.test(email) ? 'Enter a valid email address.' : ''
    const phone = String(form.phone || '').trim()
    const phoneError = !phone ? 'Enter your phone number.' : !/^\+\d{7,15}$/.test(phone) ? 'Include country code (e.g. +234...)' : ''

    return { role: roleError, fullName: fullNameError, username: usernameError, email: emailError, phone: phoneError }
  }, [form.email, form.fullName, form.role, form.username, form.phone])

  const step2Errors = useMemo(() => {
    const password = String(form.password || '')
    const confirm = String(form.confirmPassword || '')
    const passwordError = password.trim().length < 8 ? 'Use at least 8 characters for your password.' : ''
    const confirmError = confirm.trim().length === 0 ? 'Confirm your password.' : password !== confirm ? 'Passwords do not match.' : ''
    return { password: passwordError, confirmPassword: confirmError }
  }, [form.confirmPassword, form.password])

  const isStep1Valid = useMemo(() => Object.values(step1Errors).every((value) => !value), [step1Errors])
  const isStep2Valid = useMemo(() => Object.values(step2Errors).every((value) => !value), [step2Errors])

  const shouldShow = (key) => {
    if (!(submittedStep === step || touched[key])) return false
    if (step === 1) return Boolean(step1Errors[key])
    if (step === 2) return Boolean(step2Errors[key])
    return false
  }

  const onNext = () => {
    setError('')
    setSubmittedStep(1)
    if (!isStep1Valid) {
      setError('Please fix the highlighted fields to continue.')
      return
    }
    setStep(2)
  }

  const onRegister = async () => {
    setError('')
    setSubmittedStep(2)
    if (!isStep2Valid) {
      setError('Please fix the highlighted fields to create your account.')
      return
    }

      try {
        setIsRegistering(true)
        if (typeof window !== 'undefined') {
          savePendingSignupDraft({
            email: String(form.email || '').trim().toLowerCase(),
            password: String(form.password || '').trim(),
            role: String(form.role || '').trim().toLowerCase(),
            fullName: String(form.fullName || '').trim(),
            username: String(form.username || form.email || '').trim().toLowerCase(),
            title: String(form.title || '').trim(),
            phone: String(form.phone || '').trim(),
            verification_status: 'pending',
            email_verified: false,
            is_verified: false,
            verified_at: null,
          })
        }
        await register({
          role: String(form.role || '').trim(),
          title: String(form.title || '').trim(),
        fullName: String(form.fullName || '').trim(),
        username: String(form.username || '').trim(),
        email: String(form.email || '').trim(),
        phone: String(form.phone || '').trim(),
        password: String(form.password || ''),
      })

      navigate('/verify', { replace: true, state: { email: String(form.email || '').trim().toLowerCase() } })
    } catch (err) {
      setError(err.message || 'An error occurred during registration.')
    } finally {
      setIsRegistering(false)
    }
  }

  return (
    <Screen>
      <Container>
        <BrandedSheetModal
          isOpen={modal.open}
          title={modal.title}
          message={modal.message}
          primaryLabel="Continue"
          secondaryLabel="Close"
          onPrimary={() => {
            setModal({ open: false, title: '', message: '' })
            navigate('/login')
          }}
          onClose={() => setModal({ open: false, title: '', message: '' })}
        />
        <NavLinks>
          <NavLink onClick={() => navigate('/')} type="button">
            <span aria-hidden="true">{'<'}</span>
            <span>Back to home</span>
          </NavLink>
          <ThemeToggle />
        </NavLinks>
        <Header>
          <Title>Create account</Title>
          <Sub>Create your account first. Doctors and nurses must complete their medical kit next.</Sub>
          <Progress aria-hidden="true">
            <ProgressDot $done={step >= 1} />
            <Line $done={step >= 2} />
            <ProgressDot $done={step >= 2} />
          </Progress>
          <LabelRow aria-hidden="true" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <StepLabel $active={step === 1}>{steps[0]}</StepLabel>
            <StepLabel $active={step === 2}>{steps[1]}</StepLabel>
          </LabelRow>
          <StepHint>
            {step === 1
              ? 'Tell us who you are joining as.'
              : 'Set a password for your account.'}
          </StepHint>
        </Header>

        <Card as="section">
          {step === 1 ? (
            <>
              <Row>
                <div>
                  <FieldLabel>Join as</FieldLabel>
                  <SelectField
                    $invalid={shouldShow('role')}
                    value={form.role}
                    onBlur={() => onBlur('role')}
                    onChange={(e) => setField('role', e.target.value)}
                  >
                    <option value="">Select role</option>
                    {(enabledRoles?.length ? enabledRoles : ['patient', 'doctor', 'nurse', 'partner']).map((r) => (
                      <option key={r} value={r}>
                        {String(r).charAt(0).toUpperCase() + String(r).slice(1)}
                      </option>
                    ))}
                  </SelectField>
                  {shouldShow('role') ? <FieldError>{step1Errors.role}</FieldError> : null}
                </div>
                <div>
                  <FieldLabel>Title</FieldLabel>
                  <SelectField value={form.title} onChange={(e) => setField('title', e.target.value)}>
                    <option value="">Select title (optional)</option>
                    <option value="Mr.">Mr.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Dr.">Dr.</option>
                    <option value="Nurse">Nurse</option>
                    <option value="Prof.">Prof.</option>
                  </SelectField>
                </div>
              </Row>

              <Row style={{ marginTop: 12 }}>
                <div>
                  <FieldLabel>Full name</FieldLabel>
                  <TextField
                    $invalid={shouldShow('fullName')}
                    value={form.fullName}
                    onBlur={() => onBlur('fullName')}
                    onChange={(e) => setField('fullName', e.target.value)}
                    placeholder="Enter your full name"
                  />
                  {shouldShow('fullName') ? <FieldError>{step1Errors.fullName}</FieldError> : null}
                </div>
                <div>
                  <FieldLabel>Username</FieldLabel>
                  <TextField
                    $invalid={shouldShow('username')}
                    value={form.username}
                    onBlur={() => onBlur('username')}
                    onChange={(e) => setField('username', e.target.value)}
                    placeholder="Choose a username"
                  />
                  {shouldShow('username') ? <FieldError>{step1Errors.username}</FieldError> : null}
                </div>
              </Row>

              <Row style={{ marginTop: 12 }}>
                <div>
                  <FieldLabel>Email</FieldLabel>
                  <TextField
                    $invalid={shouldShow('email')}
                    value={form.email}
                    onBlur={() => onBlur('email')}
                    onChange={(e) => setField('email', e.target.value)}
                    placeholder="Enter email"
                  />
                  {shouldShow('email') ? <FieldError>{step1Errors.email}</FieldError> : null}
                </div>
                <div>
                  <FieldLabel>Phone Number</FieldLabel>
                  <TextField
                    $invalid={shouldShow('phone')}
                    value={form.phone}
                    onBlur={() => onBlur('phone')}
                    onChange={(e) => setField('phone', e.target.value)}
                    placeholder="+234..."
                  />
                  {shouldShow('phone') ? <FieldError>{step1Errors.phone}</FieldError> : null}
                </div>
              </Row>

              <Actions>
                <GhostButton type="button" onClick={goLogin}>
                  Already have account
                </GhostButton>
                <PrimaryActionButton type="button" onClick={onNext} disabled={!isStep1Valid}>
                  Next
                </PrimaryActionButton>
              </Actions>
            </>
          ) : step === 2 ? (
            <>
              <Row>
                <div>
                  <FieldLabel>Password</FieldLabel>
                  <PasswordWrap>
                    <PasswordField
                      $invalid={shouldShow('password')}
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onBlur={() => onBlur('password')}
                      onChange={(e) => setField('password', e.target.value)}
                      placeholder="Create password"
                    />
                    <VisibilityButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      <EyeIcon off={showPassword} />
                    </VisibilityButton>
                  </PasswordWrap>
                  {shouldShow('password') ? <FieldError>{step2Errors.password}</FieldError> : null}
                  <StrengthMeter aria-label="Password strength">
                    <StrengthBars aria-hidden="true">
                      {new Array(4).fill(0).map((_, idx) => (
                        <StrengthBar key={idx} $active={idx < passwordStrength.score} $tone={passwordStrength.tone} />
                      ))}
                    </StrengthBars>
                    <FieldHint>{passwordStrength.label}</FieldHint>
                  </StrengthMeter>
                </div>
                <div>
                  <FieldLabel>Confirm password</FieldLabel>
                  <PasswordWrap>
                    <PasswordField
                      $invalid={shouldShow('confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onBlur={() => onBlur('confirmPassword')}
                      onChange={(e) => setField('confirmPassword', e.target.value)}
                      placeholder="Re-enter password"
                    />
                    <VisibilityButton
                      aria-label={showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'}
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                    >
                      <EyeIcon off={showConfirmPassword} />
                    </VisibilityButton>
                  </PasswordWrap>
                  {shouldShow('confirmPassword') ? <FieldError>{step2Errors.confirmPassword}</FieldError> : null}
                </div>
              </Row>

              <Actions>
                <GhostButton type="button" onClick={() => setStep(1)}>
                  Back
                </GhostButton>
                <PrimaryActionButton type="button" onClick={onRegister} disabled={!isStep2Valid || isRegistering}>
                  {isRegistering ? 'Creating...' : 'Create account'}
                </PrimaryActionButton>
              </Actions>
            </>
          ) : null}

          {error ? <Error>{error}</Error> : null}
        </Card>
      </Container>
    </Screen>
  )
}
