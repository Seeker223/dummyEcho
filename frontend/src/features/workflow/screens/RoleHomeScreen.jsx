import { useAuth } from '../../auth/context/useAuth'
import AdminScreen from './AdminScreen'
import DoctorHomeScreen from './DoctorHomeScreen'
import NurseHomeScreen from './NurseHomeScreen'
import HomeScreen from './HomeScreen'
import PartnerHomeScreen from './PartnerHomeScreen'

export default function RoleHomeScreen() {
  const { currentUser } = useAuth()
  const careerRole = String(currentUser?.role || '').toLowerCase()
  const accessRole = String(currentUser?.accessRole || '').toLowerCase()

  if (accessRole === 'admin') return <AdminScreen />
  if (careerRole === 'doctor') return <DoctorHomeScreen />
  if (careerRole === 'nurse') return <NurseHomeScreen />
  if (careerRole === 'partner') return <PartnerHomeScreen />
  return <HomeScreen />
}
