import { useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/context/useAuth'
import { defaultPrivatePage } from '../features/workflow/utils/routeAccess'
import { LandingPage } from '../features/workflow/components/LandingPage'

export function LandingRoute() {
  const navigate = useNavigate()
  const { isAuthenticated, logout, role, users } = useAuth()

  const goJoin = ({ nextPageId, presetRole, authedPageId }) => {
    if (isAuthenticated) {
      navigate(`/app/${authedPageId || nextPageId || 'home'}`)
      return
    }
    navigate('/signup', { state: { next: nextPageId || null, presetRole } })
  }

  return (
    <LandingPage
      isAuthenticated={isAuthenticated}
      usersCount={users?.length || 0}
      onChooseRole={() => navigate('/signup')}
      onTryAssistant={() => navigate('/assistant')}
      onJoinPatient={() => goJoin({ nextPageId: 'home', presetRole: 'patient', authedPageId: 'home' })}
      onJoinDoctor={() => goJoin({ nextPageId: 'apply-doctor', presetRole: 'doctor', authedPageId: 'apply-doctor' })}
      onJoinNurse={() => goJoin({ nextPageId: 'apply-nurse', presetRole: 'nurse', authedPageId: 'apply-nurse' })}
      onJoinPartner={() => goJoin({ nextPageId: 'apply-partner', presetRole: 'partner', authedPageId: 'apply-partner' })}
      onDashboard={() => navigate('/app', { state: { page: defaultPrivatePage(role) } })}
      onLogin={() => navigate('/login')}
      onLogout={() => logout()}
      onRegister={() => navigate('/signup')}
    />
  )
}
