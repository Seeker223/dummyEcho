import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Screen } from './ScreenPrimitives'
import { InPageMenuButton } from '../components/InPageMenuButton'
import { useAuth } from '../../auth/context/useAuth'
import {
  AdminBackBtn,
  AdminCard,
  AdminCardSub,
  AdminCardTitle,
  AdminCheck,
  AdminHeader,
  AdminHeaderLeft,
  AdminSmallBtn,
  AdminSub,
  AdminTitle,
  AdminTitleBlock,
  AdminToggleGrid,
  AdminToggleRow,
  AdminToggleSub,
  AdminToggleText,
  AdminToggleTitle,
} from './admin/AdminPrimitives'

export default function AdminRolesScreen() {
  const navigate = useNavigate()
  const { enabledRoles, enabledAccessRoles, adminSetEnabledRoles, adminSetEnabledAccessRoles } = useAuth()

  const [careerEnabled, setCareerEnabled] = useState(() => {
    const base = { patient: true, doctor: true, nurse: true, partner: true }
    if (Array.isArray(enabledRoles) && enabledRoles.length) {
      for (const r of Object.keys(base)) base[r] = enabledRoles.includes(r)
    }
    return base
  })

  const [accessEnabled, setAccessEnabled] = useState(() => {
    const base = { user: true, admin: true }
    if (Array.isArray(enabledAccessRoles) && enabledAccessRoles.length) {
      for (const r of Object.keys(base)) base[r] = enabledAccessRoles.includes(r)
    }
    return base
  })

  const saveRoles = () => {
    const enabledCareer = Object.entries(careerEnabled)
      .filter(([, on]) => Boolean(on))
      .map(([r]) => r)
    adminSetEnabledRoles?.(enabledCareer)

    const enabledAccess = Object.entries(accessEnabled)
      .filter(([, on]) => Boolean(on))
      .map(([r]) => r)
    adminSetEnabledAccessRoles?.(enabledAccess)
  }

  return (
    <Screen>
      <AdminHeader>
        <AdminHeaderLeft>
          <InPageMenuButton />
          <AdminBackBtn type="button" onClick={() => navigate('/app/admin')} aria-label="Back">
            {'<'}
          </AdminBackBtn>
          <AdminTitleBlock>
            <AdminTitle>Admin: Roles</AdminTitle>
            <AdminSub>Enable/disable roles for registration</AdminSub>
          </AdminTitleBlock>
        </AdminHeaderLeft>
        <div style={{ width: 44 }} />
      </AdminHeader>

      <AdminCard aria-label="Admin roles">
        <AdminCardTitle>Role-based access control</AdminCardTitle>
        <AdminCardSub>Consumer roles are separated from professional roles for clarity.</AdminCardSub>

        <AdminCardTitle style={{ marginTop: 12 }}>Consumer RBAC</AdminCardTitle>
        <AdminCardSub>Career roles used for patient-facing experiences.</AdminCardSub>
        <AdminToggleGrid>
          {['patient'].map((r) => (
            <AdminToggleRow key={r}>
              <AdminToggleText>
                <AdminToggleTitle>{r}</AdminToggleTitle>
                <AdminToggleSub>{careerEnabled[r] ? 'Enabled' : 'Disabled'}</AdminToggleSub>
              </AdminToggleText>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <AdminCheck
                  type="checkbox"
                  checked={Boolean(careerEnabled[r])}
                  onChange={(e) => setCareerEnabled((p) => ({ ...p, [r]: e.target.checked }))}
                  aria-label={`Toggle ${r}`}
                />
                <AdminSmallBtn type="button" onClick={saveRoles}>
                  Save
                </AdminSmallBtn>
              </div>
            </AdminToggleRow>
          ))}
        </AdminToggleGrid>

        <div style={{ height: 10 }} />

        <AdminCardTitle style={{ marginTop: 10 }}>Professional RBAC</AdminCardTitle>
        <AdminCardSub>Career roles used for clinician and partner portals.</AdminCardSub>
        <AdminToggleGrid>
          {['doctor', 'nurse', 'partner'].map((r) => (
            <AdminToggleRow key={r}>
              <AdminToggleText>
                <AdminToggleTitle>{r}</AdminToggleTitle>
                <AdminToggleSub>{careerEnabled[r] ? 'Enabled' : 'Disabled'}</AdminToggleSub>
              </AdminToggleText>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <AdminCheck
                  type="checkbox"
                  checked={Boolean(careerEnabled[r])}
                  onChange={(e) => setCareerEnabled((p) => ({ ...p, [r]: e.target.checked }))}
                  aria-label={`Toggle ${r}`}
                />
                <AdminSmallBtn type="button" onClick={saveRoles}>
                  Save
                </AdminSmallBtn>
              </div>
            </AdminToggleRow>
          ))}
        </AdminToggleGrid>

        <div style={{ height: 10 }} />

        <AdminCardTitle style={{ marginTop: 10 }}>Access RBAC</AdminCardTitle>
        <AdminCardSub>Account access roles separate from career roles.</AdminCardSub>
        <AdminToggleGrid>
          {['user', 'admin'].map((r) => (
            <AdminToggleRow key={r}>
              <AdminToggleText>
                <AdminToggleTitle>{r}</AdminToggleTitle>
                <AdminToggleSub>{accessEnabled[r] ? 'Enabled' : 'Disabled'}</AdminToggleSub>
              </AdminToggleText>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <AdminCheck
                  type="checkbox"
                  checked={Boolean(accessEnabled[r])}
                  onChange={(e) => setAccessEnabled((p) => ({ ...p, [r]: e.target.checked }))}
                  aria-label={`Toggle ${r}`}
                />
                <AdminSmallBtn type="button" onClick={saveRoles}>
                  Save
                </AdminSmallBtn>
              </div>
            </AdminToggleRow>
          ))}
        </AdminToggleGrid>
      </AdminCard>
    </Screen>
  )
}
