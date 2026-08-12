import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { useAppState } from '../../../app/context/useAppState'
import { useAuth } from '../../auth/context/useAuth'
import { defaultPrivatePage } from '../utils/routeAccess'
import { Subtitle, Title } from './ScreenPrimitives'

const Container = styled.div`
  width: 100%;
  max-width: 500px;
`

const Header = styled.div`
  margin-bottom: 32px;
`

const BackLink = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.muted};
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 0;
  margin-bottom: 16px;
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
  font-size: 2rem;
  font-weight: 900;
  margin-bottom: 8px;
`

const StyledSubtitle = styled(Subtitle)`
  font-size: 0.95rem;
`

const RolesGrid = styled.div`
  display: grid;
  gap: 16px;
`

const RoleCard = styled.button`
  width: 100%;
  padding: 20px;
  border: 1.5px solid ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)')};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.surface};
  cursor: pointer;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  font: inherit;

  @media (hover: hover) {
    &:hover {
      border-color: ${({ theme }) => theme.colors.primary};
      background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(17, 24, 39, 0.5)' : 'rgba(255, 255, 255, 0.5)')};
      transform: translateY(-2px);
      box-shadow: 0 10px 24px ${({ theme }) => theme.colors.glowRed};
    }
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }

  &:active {
    transform: translateY(0);
  }
`

const RoleIconContainer = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(239, 68, 68, 0.18)' : '#fce4e4')};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.primary};
  flex-shrink: 0;

  svg {
    width: 22px;
    height: 22px;
  }
`

const RoleInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const RoleName = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text};
`

const RoleDescription = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.muted};
  line-height: 1.45;
`

function ArrowLeft() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21a8 8 0 1 0-16 0" strokeLinecap="round" />
      <path d="M12 13a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
    </svg>
  )
}

function DoctorIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 7h-3V4a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v3H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1Z" />
      <path d="M9 12h6M12 9v6" strokeLinecap="round" />
    </svg>
  )
}

function NurseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3v6" strokeLinecap="round" />
      <path d="M9 6h6" strokeLinecap="round" />
      <path d="M4 10h16v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V10Z" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" strokeLinecap="round" />
    </svg>
  )
}

const ROLES = [
  {
    id: 'patient',
    name: "I'm a Patient",
    description: 'Get AI-guided triage and connect to a clinician when you need help.',
    icon: <UserIcon />,
  },
  {
    id: 'doctor',
    name: "I'm a Doctor",
    description: 'Review incoming requests and support urgent cases.',
    icon: <DoctorIcon />,
  },
  {
    id: 'nurse',
    name: "I'm a Nurse",
    description: 'Support triage and urgent care workflows.',
    icon: <NurseIcon />,
  },
]

export default function RoleScreen({ onRoleChosen }) {
  const navigate = useNavigate()
  const { setActivePage, setSelectedRole, selectedRole } = useAppState()
  const { isAuthenticated } = useAuth()

  const onChooseRole = (role) => {
    setSelectedRole(role)
    if (onRoleChosen) {
      onRoleChosen(role)
      return
    }
    if (isAuthenticated) {
      setActivePage(defaultPrivatePage(role))
      navigate(`/app/${defaultPrivatePage(role)}`, { replace: true })
      return
    }
    setActivePage('login')
    navigate('/login')
  }

  const handleBack = () => {
    if (isAuthenticated && selectedRole) {
      navigate(`/app/${defaultPrivatePage(selectedRole)}`)
      return
    }
    navigate('/')
  }

  return (
    <Container>
      <Header>
        <BackLink onClick={handleBack} type="button">
          <span aria-hidden="true">
            <ArrowLeft />
          </span>
          <span>Back</span>
        </BackLink>
        <StyledTitle>Choose your role</StyledTitle>
        <StyledSubtitle>Select how you'll use Emergency Echo for this session.</StyledSubtitle>
      </Header>

      <RolesGrid>
        {ROLES.map((role) => (
          <RoleCard key={role.id} onClick={() => onChooseRole(role.id)} type="button">
            <RoleIconContainer aria-hidden="true">{role.icon}</RoleIconContainer>
            <RoleInfo>
              <RoleName>{role.name}</RoleName>
              <RoleDescription>{role.description}</RoleDescription>
            </RoleInfo>
          </RoleCard>
        ))}
      </RolesGrid>
    </Container>
  )
}

