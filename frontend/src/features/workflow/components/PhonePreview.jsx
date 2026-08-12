import { Suspense, lazy, useMemo } from 'react'
import styled from 'styled-components'
import { Loader } from '../../../shared/components/Loader'

const screenImports = {
  role: lazy(() => import('../screens/RoleScreen')),
  login: lazy(() => import('../screens/LoginScreen')),
  'admin-login': lazy(() => import('../screens/AdminLoginScreen')),
  signup: lazy(() => import('../screens/SignupScreen')),
  home: lazy(() => import('../screens/RoleHomeScreen')),
  'voice-ai': lazy(() => import('../screens/VoiceAiScreen')),
  // Back-compat: older routes may still reference patient/doctor home ids.
  'patient-home': lazy(() => import('../screens/HomeScreen')),
  'doctor-session': lazy(() => import('../screens/RoleHomeScreen')),
  'doctor-live': lazy(() => import('../screens/DoctorSessionScreen')),
  'patient-live': lazy(() => import('../screens/PatientSessionScreen')),
  'doctor-wait': lazy(() => import('../screens/PatientWaitScreen')),
  'video-call': lazy(() => import('../screens/VideoCallScreen')),
  profile: lazy(() => import('../screens/RoleProfileScreen')),
  'echo-qr': lazy(() => import('../screens/EchoQrScreen')),
  kit: lazy(() => import('../screens/KitScreen')),
  wallet: lazy(() => import('../screens/WalletScreen')),
  'wallet-add-funds': lazy(() => import('../screens/WalletAddFundsScreen')),
  'wallet-withdraw': lazy(() => import('../screens/WalletWithdrawScreen')),
  'doctor-home': lazy(() => import('../screens/HomeScreen')),
  payment: lazy(() => import('../screens/PaymentScreen')),
  'consultation-payment': lazy(() => import('../screens/ConsultationPaymentScreen')),
  'consultation-mode': lazy(() => import('../screens/ConsultationModeScreen')),
  'consultation-waiting': lazy(() => import('../screens/ConsultationWaitingScreen')),
  directory: lazy(() => import('../screens/DirectoryScreen')),
  admin: lazy(() => import('../screens/AdminScreen')),
  'admin-users': lazy(() => import('../screens/AdminUsersScreen')),
  'admin-wallet': lazy(() => import('../screens/AdminWalletScreen')),
  'admin-plans': lazy(() => import('../screens/AdminPlansScreen')),
  'admin-roles': lazy(() => import('../screens/AdminRolesScreen')),
  'admin-pages': lazy(() => import('../screens/AdminPagesScreen')),
  'admin-queue': lazy(() => import('../screens/AdminQueueScreen')),
  'admin-verification': lazy(() => import('../screens/AdminVerificationScreen')),
  notifications: lazy(() => import('../screens/NotificationScreen')),
  chat: lazy(() => import('../screens/ChatScreen')),
  marketplace: lazy(() => import('../screens/MarketplaceScreen')),
  'marketplace-categories': lazy(() => import('../screens/MarketplaceScreen')),
  'marketplace-products': lazy(() => import('../screens/MarketplaceScreen')),
  'marketplace-product': lazy(() => import('../screens/MarketplaceScreen')),
  'marketplace-vendor': lazy(() => import('../screens/MarketplaceScreen')),
  'marketplace-checkout': lazy(() => import('../screens/MarketplaceScreen')),
  'marketplace-sell': lazy(() => import('../screens/MarketplaceScreen')),
  partnership: lazy(() => import('../screens/PartnershipScreen')),
  'partnership-programs': lazy(() => import('../screens/PartnershipScreen')),
  'partnership-proposal': lazy(() => import('../screens/PartnershipScreen')),
  'partnership-directory': lazy(() => import('../screens/PartnershipScreen')),
  'partnership-analytics': lazy(() => import('../screens/PartnershipScreen')),
  'partnership-agreement': lazy(() => import('../screens/PartnershipScreen')),
  doctors: lazy(() => import('../screens/DoctorsOnDutyScreen')),
  'doctor-profile': lazy(() => import('../screens/DoctorProfileScreen')),
  'profile-basic': lazy(() => import('../screens/ProfileBasicScreen')),
  'profile-emergency': lazy(() => import('../screens/ProfileEmergencyScreen')),
  'profile-password': lazy(() => import('../screens/ProfilePasswordScreen')),
  'profile-notifications': lazy(() => import('../screens/ProfileNotificationsScreen')),
  'apply-user': lazy(() => import('../screens/ApplyUserScreen')),
  'apply-doctor': lazy(() => import('../screens/ApplyDoctorScreen')),
  'apply-nurse': lazy(() => import('../screens/ApplyNurseScreen')),
  'apply-partner': lazy(() => import('../screens/ApplyPartnerScreen')),
  subscription: lazy(() => import('../screens/SubscriptionScreen')),
  language: lazy(() => import('../screens/LanguageScreen')),
  forbidden: lazy(() => import('../screens/ForbiddenScreen')),
}

const Device = styled.article`
  margin: 0 auto;
  width: 100%;
  height: ${({ $fullHeight }) => ($fullHeight ? '100%' : 'auto')};
  min-height: ${({ $fullHeight }) => ($fullHeight ? '0' : 'auto')};
  max-width: 100%;
  border-radius: ${({ theme }) => theme?.radii?.lg || '16px'};
  border: 1px solid ${({ theme }) => theme?.colors?.border || '#e5e7eb'};
  background: ${({ theme }) => theme?.colors?.surface || '#ffffff'};
  box-shadow: ${({ theme }) => theme?.shadow?.soft || '0 14px 30px rgba(15, 31, 68, 0.16)'};
  overflow: hidden;

  /* No phone-frame styling: keep the workflow responsive and consistent at all desktop widths. */
  @media (min-width: 1024px) {
    min-height: ${({ $fullHeight }) => ($fullHeight ? '0' : '720px')};
  }

  /* Full-bleed on mobile for authenticated workflow pages. */
  @media (max-width: 640px) {
    border-radius: 0;
    border: 0;
    box-shadow: none;
    min-height: 100vh;
  }
`

export function PhonePreview({ activePage, onVideoCallSummaryChange }) {
  const ActiveScreen = useMemo(() => screenImports[activePage] || screenImports.role, [activePage])

  return (
    <Device $fullHeight={activePage === 'video-call'}>
      <Suspense fallback={<Loader />}>
        <ActiveScreen activePage={activePage} onVideoCallSummaryChange={onVideoCallSummaryChange} />
      </Suspense>
    </Device>
  )
}
