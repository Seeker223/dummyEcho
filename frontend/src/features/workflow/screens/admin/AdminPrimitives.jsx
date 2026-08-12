import styled, { keyframes } from 'styled-components'

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`

export const AdminHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 2px 12px;
`

export const AdminHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`

export const AdminBackBtn = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  font-weight: 900;
`

export const AdminTitleBlock = styled.div`
  display: grid;
  gap: 2px;
  min-width: 0;
`

export const AdminTitle = styled.div`
  font-weight: 1000;
  letter-spacing: -0.03em;
  font-size: 1.2rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const AdminSub = styled.div`
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 750;
  font-size: 0.92rem;
`

export const AdminGrid = styled.section`
  margin-top: 8px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`

export const AdminStatCard = styled.section`
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  padding: 14px 14px;
  box-shadow: ${({ theme }) => theme.shadow.soft};
  text-align: center;
  animation: ${fadeUp} 220ms ease both;
`

export const AdminStatValue = styled.div`
  font-size: 1.55rem;
  font-weight: 1000;
  letter-spacing: -0.03em;
  color: ${({ theme }) => (theme.mode === 'dark' ? '#33d6b7' : theme.colors.text)};
`

export const AdminStatLabel = styled.div`
  margin-top: 4px;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 750;
`

export const AdminCard = styled.section`
  margin-top: 14px;
  border-radius: 18px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  padding: 14px 14px 16px;
  box-shadow: ${({ theme }) => theme.shadow.elevated};
  animation: ${fadeUp} 240ms ease both;
`

export const AdminCardTitle = styled.div`
  font-weight: 950;
  letter-spacing: -0.02em;
  font-size: 1.05rem;
`

export const AdminCardSub = styled.div`
  margin-top: 4px;
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 750;
  font-size: 0.92rem;
`

export const AdminRow = styled.div`
  margin-top: 10px;
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
`

export const AdminInput = styled.input`
  flex: 1 1 220px;
  border-radius: 14px;
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  padding: 10px 12px;
  font-weight: 700;
`

export const AdminSelect = styled.select`
  flex: 1 1 220px;
  border-radius: 14px;
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  padding: 10px 12px;
  font-weight: 800;
`

export const AdminBtn = styled.button`
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : theme.colors.surfaceAlt)};
  color: ${({ theme }) => theme.colors.text};
  padding: 10px 12px;
  font-weight: 900;
  cursor: pointer;
`

export const AdminDangerBtn = styled(AdminBtn)`
  border-color: ${({ theme }) => theme.colors.primary};
  background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(220,38,38,0.18)' : 'rgba(220,38,38,0.08)')};
`

export const AdminSmallBtn = styled(AdminBtn)`
  padding: 8px 10px;
  border-radius: 12px;
  font-weight: 950;
  transition: all 0.2s ease;
  ${({ $variant, theme }) => 
    $variant === 'view' ? `
      background: ${theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(37, 99, 235, 0.05)'};
      border-color: ${theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(37, 99, 235, 0.3)'};
      color: ${theme.mode === 'dark' ? '#60a5fa' : '#1d4ed8'};
      &:hover { background: ${theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(37, 99, 235, 0.1)'}; }
    ` :
    $variant === 'verify' ? `
      background: ${theme.mode === 'dark' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(5, 150, 105, 0.05)'};
      border-color: ${theme.mode === 'dark' ? 'rgba(16, 185, 129, 0.5)' : 'rgba(5, 150, 105, 0.3)'};
      color: ${theme.mode === 'dark' ? '#34d399' : '#047857'};
      &:hover { background: ${theme.mode === 'dark' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(5, 150, 105, 0.1)'}; }
    ` :
    $variant === 'reject' ? `
      background: ${theme.mode === 'dark' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(220, 38, 38, 0.05)'};
      border-color: ${theme.mode === 'dark' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(220, 38, 38, 0.3)'};
      color: ${theme.mode === 'dark' ? '#f87171' : '#b91c1c'};
      &:hover { background: ${theme.mode === 'dark' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(220, 38, 38, 0.1)'}; }
    ` :
    $variant === 'pending' ? `
      background: ${theme.mode === 'dark' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(217, 119, 6, 0.05)'};
      border-color: ${theme.mode === 'dark' ? 'rgba(245, 158, 11, 0.5)' : 'rgba(217, 119, 6, 0.3)'};
      color: ${theme.mode === 'dark' ? '#fbbf24' : '#b45309'};
      &:hover { background: ${theme.mode === 'dark' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(217, 119, 6, 0.1)'}; }
    ` :
    `&:hover { background: ${theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : theme.colors.surfaceAlt}; }`
  }
`

export const AdminCheck = styled.input`
  width: 18px;
  height: 18px;
  accent-color: ${({ theme }) => theme.colors.primary};
`

export const AdminTable = styled.div`
  margin-top: 12px;
  display: grid;
  gap: 10px;
`

export const AdminItem = styled.div`
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(2, 6, 23, 0.45)' : 'rgba(255,255,255,0.92)')};
  padding: 12px 12px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
`

export const AdminItemTitle = styled.div`
  font-weight: 950;
  letter-spacing: -0.01em;
`

export const AdminItemSub = styled.div`
  margin-top: 3px;
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 750;
  font-size: 0.9rem;
`

export const AdminBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 6px 10px;
  font-weight: 950;
  font-size: 0.78rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border: 1px solid ${({ theme, $status }) => 
    $status === 'verified' ? (theme.mode === 'dark' ? '#10b981' : '#059669') :
    $status === 'pending' ? (theme.mode === 'dark' ? '#f59e0b' : '#d97706') :
    $status === 'rejected' ? (theme.mode === 'dark' ? '#ef4444' : '#dc2626') :
    theme.colors.border
  };
  background: ${({ theme, $status }) => 
    $status === 'verified' ? (theme.mode === 'dark' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(5, 150, 105, 0.1)') :
    $status === 'pending' ? (theme.mode === 'dark' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(217, 119, 6, 0.1)') :
    $status === 'rejected' ? (theme.mode === 'dark' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(220, 38, 38, 0.1)') :
    (theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : theme.colors.surfaceAlt)
  };
  color: ${({ theme, $status }) => 
    $status === 'verified' ? (theme.mode === 'dark' ? '#34d399' : '#047857') :
    $status === 'pending' ? (theme.mode === 'dark' ? '#fbbf24' : '#b45309') :
    $status === 'rejected' ? (theme.mode === 'dark' ? '#f87171' : '#b91c1c') :
    theme.colors.text
  };
`

export const AdminTwoCol = styled.div`
  margin-top: 12px;
  display: grid;
  gap: 12px;

  @media (min-width: 860px) {
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }
`

export const AdminToggleGrid = styled.div`
  margin-top: 12px;
  display: grid;
  gap: 10px;
`

export const AdminToggleRow = styled.div`
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(2, 6, 23, 0.45)' : 'rgba(255,255,255,0.92)')};
  padding: 12px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`

export const AdminToggleText = styled.div`
  min-width: 0;
`

export const AdminToggleTitle = styled.div`
  font-weight: 950;
  letter-spacing: -0.01em;
`

export const AdminToggleSub = styled.div`
  margin-top: 3px;
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 750;
  font-size: 0.9rem;
`

export const AdminSwitch = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme, $on }) =>
    $on ? theme.colors.primary : theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : theme.colors.surfaceAlt};
  color: ${({ theme, $on }) => ($on ? '#fff' : theme.colors.text)};
  border-radius: 999px;
  padding: 8px 10px;
  min-width: 76px;
  cursor: pointer;
  font-weight: 950;
  letter-spacing: -0.01em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${({ $on }) => ($on ? '0 10px 18px rgba(198, 40, 40, 0.22)' : 'none')};
`

export const ChartContainer = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 12px;
  height: 120px;
  margin-top: 24px;
  padding-top: 16px;
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
`

export const BarWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  height: 100%;
`

export const Bar = styled.div`
  width: 100%;
  max-width: 40px;
  background: ${({ theme, $color }) => $color || theme.colors.primary};
  border-radius: 6px 6px 0 0;
  height: ${({ $height }) => $height}%;
  transition: height 1s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${fadeUp} 400ms ease both;
`

export const BarLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.muted};
  text-align: center;
`

export const BarValue = styled.div`
  font-size: 0.8rem;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.text};
`

