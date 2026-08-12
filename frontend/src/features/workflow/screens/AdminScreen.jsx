import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/context/useAuth'
import { Screen } from './ScreenPrimitives'
import { InPageMenuButton } from '../components/InPageMenuButton'
import { getWalletTransactions } from '../services/walletService'
import { supabase } from '../../../lib/supabaseClient'
import {
  AdminBackBtn,
  AdminBtn,
  AdminCard,
  AdminCardSub,
  AdminCardTitle,
  AdminGrid,
  AdminHeader,
  AdminHeaderLeft,
  AdminStatCard,
  AdminStatLabel,
  AdminStatValue,
  AdminSub,
  AdminTitle,
  AdminTitleBlock,
  ChartContainer,
  BarWrapper,
  Bar,
  BarLabel,
  BarValue,
} from './admin/AdminPrimitives'

export default function AdminScreen() {
  const navigate = useNavigate()
  const { users } = useAuth()
  const [analytics, setAnalytics] = useState(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState(true)

  const [totalRevenue, setTotalRevenue] = useState(0)

  const txCount = useMemo(() => {
    try {
      return getWalletTransactions().length
    } catch {
      return 0
    }
  }, [])

  const roleCounts = useMemo(() => {
    const counts = { patient: 0, doctor: 0, nurse: 0, partner: 0, unknown: 0 }
    for (const u of users || []) {
      const r = String(u?.role || '').trim().toLowerCase()
      if (r in counts) counts[r] += 1
      else counts.unknown += 1
    }
    return counts
  }, [users])

  useEffect(() => {
    let active = true

    async function loadRevenue() {
      try {
        const { data, error } = await supabase.from('platform_revenue').select('amount')
        if (data && !error && active) {
          const sum = data.reduce((acc, curr) => acc + Number(curr.amount || 0), 0)
          setTotalRevenue(sum)
        }
      } catch (err) {
        console.error('Failed to load revenue:', err)
      }
    }
    loadRevenue()

    async function loadAnalytics() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const response = await fetch('/api/admin/analytics', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        })
        const data = await response.json()
        if (response.ok && active) {
          setAnalytics(data)
        }
      } catch (err) {
        console.error('Failed to load admin analytics:', err)
      } finally {
        if (active) setLoadingAnalytics(false)
      }
    }

    loadAnalytics()

    const channel = supabase.channel('realtime:revenue')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'platform_revenue' }, (payload) => {
         setTotalRevenue(prev => prev + Number(payload.new.amount || 0))
      })
      .subscribe()

    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <Screen>
      <AdminHeader>
        <AdminHeaderLeft>
          <InPageMenuButton />
          <AdminBackBtn type="button" onClick={() => navigate('/app/home')} aria-label="Back">
            {'<'}
          </AdminBackBtn>
          <AdminTitleBlock>
            <AdminTitle>Admin console</AdminTitle>
            <AdminSub>Choose a section</AdminSub>
          </AdminTitleBlock>
        </AdminHeaderLeft>
        <div style={{ width: 44 }} />
      </AdminHeader>

      <AdminGrid aria-label="Admin overview">
        <AdminStatCard>
          <AdminStatValue>₦{totalRevenue.toLocaleString()}</AdminStatValue>
          <AdminStatLabel>Total Platform Revenue</AdminStatLabel>
        </AdminStatCard>
        <AdminStatCard>
          <AdminStatValue>{(users || []).length}</AdminStatValue>
          <AdminStatLabel>Total users</AdminStatLabel>
        </AdminStatCard>
        <AdminStatCard>
          <AdminStatValue>{txCount}</AdminStatValue>
          <AdminStatLabel>Wallet transactions</AdminStatLabel>
        </AdminStatCard>
        <AdminStatCard>
          <AdminStatValue>{roleCounts.doctor + roleCounts.nurse}</AdminStatValue>
          <AdminStatLabel>Clinicians</AdminStatLabel>
        </AdminStatCard>
      </AdminGrid>

      <AdminCard aria-label="Visual Analytics">
        <AdminCardTitle>Demographics Overview</AdminCardTitle>
        <AdminCardSub>Real-time visual breakdown of registered platform users.</AdminCardSub>
        <ChartContainer>
          <BarWrapper>
            <BarValue>{roleCounts.patient}</BarValue>
            <Bar $height={Math.max(10, (roleCounts.patient / Math.max(1, (users || []).length)) * 100)} $color="#3b82f6" />
            <BarLabel>Patients</BarLabel>
          </BarWrapper>
          <BarWrapper>
            <BarValue>{roleCounts.doctor}</BarValue>
            <Bar $height={Math.max(10, (roleCounts.doctor / Math.max(1, (users || []).length)) * 100)} $color="#10b981" />
            <BarLabel>Doctors</BarLabel>
          </BarWrapper>
          <BarWrapper>
            <BarValue>{roleCounts.nurse}</BarValue>
            <Bar $height={Math.max(10, (roleCounts.nurse / Math.max(1, (users || []).length)) * 100)} $color="#8b5cf6" />
            <BarLabel>Nurses</BarLabel>
          </BarWrapper>
          <BarWrapper>
            <BarValue>{roleCounts.partner}</BarValue>
            <Bar $height={Math.max(10, (roleCounts.partner / Math.max(1, (users || []).length)) * 100)} $color="#f59e0b" />
            <BarLabel>Partners</BarLabel>
          </BarWrapper>
        </ChartContainer>
      </AdminCard>

      {loadingAnalytics ? (
        <AdminCard aria-label="System Analytics">
          <AdminCardTitle>System Analytics (Database)</AdminCardTitle>
          <AdminCardSub>Loading live analytics from Supabase...</AdminCardSub>
        </AdminCard>
      ) : analytics ? (
        <div style={{ display: 'grid', gap: 14, marginTop: 14 }}>
          <AdminCardTitle style={{ paddingLeft: 4 }}>System Analytics (Database)</AdminCardTitle>
          <AdminGrid>
            <AdminStatCard>
              <AdminStatValue>{analytics.patients}</AdminStatValue>
              <AdminStatLabel>Total Patients</AdminStatLabel>
            </AdminStatCard>
            <AdminStatCard>
              <AdminStatValue>{analytics.doctors.total}</AdminStatValue>
              <AdminStatLabel>Total Doctors</AdminStatLabel>
              <div style={{ fontSize: '0.78rem', marginTop: 4, color: '#64748b', fontWeight: 700 }}>
                <span style={{ color: '#16a34a' }}>{analytics.doctors.verified} Verified</span> • <span style={{ color: '#b45309' }}>{analytics.doctors.unverified} Unverified</span>
              </div>
            </AdminStatCard>
            <AdminStatCard>
              <AdminStatValue>{analytics.nurses.total}</AdminStatValue>
              <AdminStatLabel>Total Nurses</AdminStatLabel>
              <div style={{ fontSize: '0.78rem', marginTop: 4, color: '#64748b', fontWeight: 700 }}>
                <span style={{ color: '#16a34a' }}>{analytics.nurses.verified} Verified</span> • <span style={{ color: '#b45309' }}>{analytics.nurses.unverified} Unverified</span>
              </div>
            </AdminStatCard>
            <AdminStatCard>
              <AdminStatValue>{analytics.documents.total}</AdminStatValue>
              <AdminStatLabel>Submitted Documents</AdminStatLabel>
              <div style={{ fontSize: '0.75rem', marginTop: 4, color: '#64748b', fontWeight: 700, display: 'flex', gap: 6, justifyContent: 'center' }}>
                <span style={{ color: '#b45309' }}>{analytics.documents.pending} Pending</span>
                <span style={{ color: '#16a34a' }}>{analytics.documents.verified} Verified</span>
                <span style={{ color: '#dc2626' }}>{analytics.documents.rejected} Rejected</span>
              </div>
            </AdminStatCard>
          </AdminGrid>
        </div>
      ) : null}

      <AdminCard aria-label="Admin sections">
        <AdminCardTitle>Admin sections</AdminCardTitle>
        <AdminCardSub>All admin tools are organized as subpages.</AdminCardSub>
        <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
          <AdminBtn type="button" onClick={() => navigate('/app/admin-queue')}>
            Live Emergency Queue (All calls)
          </AdminBtn>
          <AdminBtn type="button" onClick={() => navigate('/app/admin-users')}>
            Users CRUD
          </AdminBtn>
          <AdminBtn type="button" onClick={() => navigate('/app/admin-wallet')}>
            Wallet dashboard + CRUD
          </AdminBtn>
          <AdminBtn type="button" onClick={() => navigate('/app/admin-plans')}>
            Plans CRUD
          </AdminBtn>
          <AdminBtn type="button" onClick={() => navigate('/app/admin-roles')}>
            Roles enable/disable
          </AdminBtn>
          <AdminBtn type="button" onClick={() => navigate('/app/admin-pages')}>
            Pages enable/disable
          </AdminBtn>
          <AdminBtn type="button" onClick={() => navigate('/app/admin-verification')}>
            Document verification
          </AdminBtn>
        </div>
      </AdminCard>
    </Screen>
  )
}
