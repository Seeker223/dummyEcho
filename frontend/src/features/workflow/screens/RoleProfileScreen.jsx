import { useAuth } from '../../auth/context/useAuth'
import DoctorProfileScreen from './DoctorProfileScreen'
import ProfileScreen from './ProfileScreen'

export default function RoleProfileScreen() {
  const { currentUser } = useAuth()
  const role = String(currentUser?.role || '').toLowerCase()

  if (role === 'doctor' || role === 'nurse') return <DoctorProfileScreen mode="self" />
  return <ProfileScreen />
}

