import { memo, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { BrandSocialLinks } from './BrandSocialLinks'

const NavShell = styled.nav`
  border: 1px solid ${({ theme }) => theme?.colors?.border || '#e5e7eb'};
  border-radius: ${({ theme }) => theme?.radii?.lg || '16px'};
  background: ${({ theme }) =>
    theme.mode === 'dark' ? 'rgba(17, 26, 42, 0.88)' : 'rgba(255, 255, 255, 0.78)'};
  backdrop-filter: blur(9px);
  -webkit-backdrop-filter: blur(9px);
  align-self: start;
  padding: 10px;
  box-shadow: 0 10px 26px rgba(15, 31, 68, 0.08);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    height: 6px;
  }

  @media (min-width: 1024px) {
    min-width: ${({ $collapsed }) => ($collapsed ? '86px' : '240px')};
    width: ${({ $collapsed }) => ($collapsed ? '86px' : 'auto')};
    overflow-x: visible;
  }

  ${({ $variant }) =>
    $variant === 'drawer'
      ? `
    overflow-x: visible;
    padding: 14px;
    border-radius: 22px;
  `
      : ''}
`

const HeaderRow = styled.div`
  display: none;

  @media (min-width: 1024px) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 6px 6px 10px;
  }
`

const HeaderLabel = styled.div`
  font-weight: 900;
  font-size: 0.9rem;
  letter-spacing: -0.01em;
  color: ${({ theme }) => theme?.colors?.text || '#111827'};
  opacity: ${({ $collapsed }) => ($collapsed ? 0 : 1)};
  width: ${({ $collapsed }) => ($collapsed ? '0' : 'auto')};
  overflow: hidden;
  white-space: nowrap;
  transition: opacity 160ms ease, width 160ms ease;
`

const CollapseBtn = styled.button`
  width: 42px;
  height: 42px;
  border-radius: 14px;
  border: 1.5px solid ${({ theme }) => theme?.colors?.border || '#e5e7eb'};
  background: ${({ theme }) => (theme?.mode === 'dark' ? '#172336' : '#f8fafc')};
  color: ${({ theme }) => theme?.colors?.text || '#111827'};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 16px rgba(15, 31, 68, 0.08);
  transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;

  @media (hover: hover) {
    &:hover {
      transform: translateY(-1px);
      border-color: #cbd5e1;
      box-shadow: 0 14px 22px rgba(15, 31, 68, 0.12);
    }
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    width: 18px;
    height: 18px;
  }
`

const ButtonGrid = styled.div`
  display: flex;
  width: max-content;
  gap: 8px;
  padding-bottom: 2px;

  @media (min-width: 1024px) {
    display: grid;
    width: 100%;
    align-content: start;
    padding-bottom: 0;
    gap: 10px;
  }

  ${({ $variant }) =>
    $variant === 'drawer'
      ? `
    display: grid;
    width: 100%;
    align-content: start;
    padding-bottom: 0;
    gap: 10px;
  `
      : ''}
`

const NavButton = styled.button`
  border: 1.5px solid
    ${({ $active, theme }) => ($active ? theme.colors.primaryDeep : theme.colors.border)};
  border-radius: 12px;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.mode === 'dark' ? '#172336' : '#f8fafc'};
  color: ${({ $active, theme }) => ($active ? '#fff' : theme.colors.text)};
  padding: 11px 13px;
  min-height: 44px;
  font-size: 0.99rem;
  font-weight: ${({ $active }) => ($active ? 700 : 600)};
  letter-spacing: -0.01em;
  cursor: pointer;
  text-align: left;
  transition: 160ms ease;
  white-space: nowrap;
  flex: 0 0 auto;
  box-shadow: ${({ $active }) =>
    $active ? '0 12px 20px rgba(198, 40, 40, 0.25)' : '0 4px 10px rgba(15, 31, 68, 0.06)'};
  display: inline-flex;
  align-items: center;
  gap: 10px;

  @media (min-width: 1024px) {
    width: 100%;
    justify-content: ${({ $collapsed }) => ($collapsed ? 'center' : 'flex-start')};
    text-align: ${({ $collapsed }) => ($collapsed ? 'center' : 'left')};
    padding: ${({ $collapsed }) => ($collapsed ? '11px' : '11px 13px')};
  }

  ${({ $variant }) =>
    $variant === 'drawer'
      ? `
    width: 100%;
  `
      : ''}

  @media (hover: hover) {
    &:hover {
      transform: translateY(-2px);
      box-shadow: ${({ $active }) =>
        $active ? '0 16px 24px rgba(198, 40, 40, 0.3)' : '0 8px 16px rgba(15, 31, 68, 0.1)'};
    }
  }

  &:active {
    transform: translateY(0);
  }
`

const NavIcon = styled.span`
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;

  svg {
    width: 22px;
    height: 22px;
  }
`

const NavLabel = styled.span`
  display: inline;

  @media (min-width: 1024px) {
    display: ${({ $collapsed }) => ($collapsed ? 'none' : 'inline')};
  }
`

const SwitchRoleButton = styled(NavButton)`
  border-color: ${({ theme }) => theme?.colors?.primaryDeep || '#7f1d1d'};
  background: ${({ theme }) => theme?.colors?.surface || '#ffffff'};
  color: ${({ theme }) => theme?.colors?.primaryDeep || '#7f1d1d'};
`

const SocialBlock = styled.div`
  display: none;

  @media (min-width: 1024px) {
    display: ${({ $collapsed }) => ($collapsed ? 'none' : 'grid')};
    gap: 10px;
    margin-top: 14px;
    padding: 14px 6px 4px;
    border-top: 1px solid ${({ theme }) => theme?.colors?.border || '#e5e7eb'};
  }

  ${({ $variant }) =>
    $variant === 'drawer'
      ? `
    display: grid;
    gap: 10px;
    margin-top: 14px;
    padding: 14px 2px 4px;
  `
      : ''}
`

const SocialLabel = styled.div`
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme?.colors?.muted || '#64748b'};
`

function IconChevron({ direction = 'left' }) {
  const d = direction === 'left' ? 'M15 18l-6-6 6-6' : 'M9 6l6 6-6 6'
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d={d} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function iconForPageId(id) {
  const common = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }
  switch (id) {
    case 'home':
      return (
        <svg aria-hidden="true" {...common}>
          <path d="M3 10.5L12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-10.5Z" />
        </svg>
      )
    case 'voice':
    case 'voice-ai':
      return (
        <svg aria-hidden="true" {...common}>
          <path d="M12 14a3 3 0 0 0 3-3V7a3 3 0 0 0-6 0v4a3 3 0 0 0 3 3Z" />
          <path d="M19 11a7 7 0 0 1-14 0" strokeLinecap="round" />
          <path d="M12 18v3" strokeLinecap="round" />
          <path d="M8 21h8" strokeLinecap="round" />
        </svg>
      )
    case 'video-call':
      return (
        <svg aria-hidden="true" {...common}>
          <path d="M23 7l-7 5v5l7 5V7Z" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
      )
    case 'profile':
      return (
        <svg aria-hidden="true" {...common}>
          <path d="M20 21a8 8 0 1 0-16 0" strokeLinecap="round" />
          <path d="M12 13a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
        </svg>
      )
    case 'kit':
      return (
        <svg aria-hidden="true" {...common}>
          <path d="M9 3h6l1 3h4v15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6h4l1-3Z" />
          <path d="M12 9v6M9 12h6" strokeLinecap="round" />
        </svg>
      )
    case 'echo-qr':
      return (
        <svg aria-hidden="true" {...common}>
          <path d="M4 4h6v6H4V4Z" />
          <path d="M14 4h6v6h-6V4Z" />
          <path d="M4 14h6v6H4v-6Z" />
          <path d="M16 14h2v2h-2v-2Z" />
          <path d="M20 14h-2v2h2v2h-2v2" strokeLinecap="round" />
          <path d="M14 16h2M16 18h2M18 16h2" strokeLinecap="round" />
        </svg>
      )
    case 'wallet':
      return (
        <svg aria-hidden="true" {...common}>
          <path d="M3 7h18v10H3z" />
          <path d="M16 11h3" strokeLinecap="round" />
          <path d="M6 7V5a2 2 0 0 1 2-2h11" strokeLinecap="round" />
        </svg>
      )
    case 'notifications':
      return (
        <svg aria-hidden="true" {...common}>
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      )
    case 'chat':
      return (
        <svg aria-hidden="true" {...common}>
          <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
          <path d="M8 9h8M8 13h6" strokeLinecap="round" />
        </svg>
      )
    case 'marketplace':
      return (
        <svg aria-hidden="true" {...common}>
          <path d="M6 2h12l3 7H3l3-7Z" />
          <path d="M3 9v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9" />
          <path d="M9 13h6" strokeLinecap="round" />
        </svg>
      )
    case 'partnership':
      return (
        <svg aria-hidden="true" {...common}>
          <path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
          <path d="M16 20a4 4 0 1 0 0-8" />
          <path d="M2 20a6 6 0 0 1 12 0" strokeLinecap="round" />
          <path d="M16 12h6M19 9v6" strokeLinecap="round" />
        </svg>
      )
    case 'subscription':
      return (
        <svg aria-hidden="true" {...common}>
          <path d="M12 2l2.8 5.7L21 9l-4.5 4.4L17.5 20 12 16.9 6.5 20l1-6.6L3 9l6.2-1.3L12 2Z" />
          <path d="M12 8v8M8.5 12h7" strokeLinecap="round" />
        </svg>
      )
    case 'language':
      return (
        <svg aria-hidden="true" {...common}>
          <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
          <path d="M3 12h18M12 3c2.5 2.3 4 5.6 4 9s-1.5 6.7-4 9c-2.5-2.3-4-5.6-4-9s1.5-6.7 4-9Z" strokeLinecap="round" />
        </svg>
      )
    case 'directory':
      return (
        <svg aria-hidden="true" {...common}>
          <path d="M4 3h10v18H4z" />
          <path d="M14 7h6v14h-6" />
          <path d="M7 7h4M7 11h4M7 15h4" strokeLinecap="round" />
        </svg>
      )
    case 'admin':
      return (
        <svg aria-hidden="true" {...common}>
          <path d="M12 2 20 6v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4Z" />
          <path d="M12 10v4" strokeLinecap="round" />
          <path d="M12 17h.01" strokeLinecap="round" />
        </svg>
      )
    case 'role':
      return (
        <svg aria-hidden="true" {...common}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" strokeLinecap="round" />
          <path d="M9 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
          <path d="M19 8v6M16 11h6" strokeLinecap="round" />
        </svg>
      )
    case 'login':
      return (
        <svg aria-hidden="true" {...common}>
          <path d="M10 17l5-5-5-5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M15 12H3" strokeLinecap="round" />
          <path d="M21 3v18a1 1 0 0 1-1 1h-7" strokeLinecap="round" />
        </svg>
      )
    case 'signup':
      return (
        <svg aria-hidden="true" {...common}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" strokeLinecap="round" />
          <path d="M9 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
          <path d="M19 8v6M16 11h6" strokeLinecap="round" />
        </svg>
      )
    default:
      return (
        <svg aria-hidden="true" {...common}>
          <path d="M12 2l10 10-10 10L2 12 12 2Z" />
        </svg>
      )
  }
}

function WorkflowNavBase({ pages, activePage, onSelect, isAuthenticated, onSwitchRole, variant = 'default' }) {
  const collapsible = variant === 'default'
  const [collapsed, setCollapsed] = useState(() => {
    if (!collapsible) return false
    try {
      return window.localStorage.getItem('ee:nav-collapsed') === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    if (!collapsible) return
    try {
      window.localStorage.setItem('ee:nav-collapsed', collapsed ? '1' : '0')
    } catch {
      // ignore
    }
  }, [collapsed, collapsible])

  const iconMap = useMemo(() => {
    const map = {}
    pages.forEach((page) => {
      map[page.id] = iconForPageId(page.id)
    })
    return map
  }, [pages])

  return (
    <NavShell $variant={variant} $collapsed={collapsed} aria-label="Workflow screens">
      {collapsible ? (
        <HeaderRow>
          <HeaderLabel $collapsed={collapsed}>Navigation</HeaderLabel>
          <CollapseBtn
            aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
            onClick={() => setCollapsed((value) => !value)}
            type="button"
          >
            <IconChevron direction={collapsed ? 'right' : 'left'} />
          </CollapseBtn>
        </HeaderRow>
      ) : null}
      <ButtonGrid $variant={variant}>
        {pages.map((page) => (
          <NavButton
            key={page.id}
            $active={activePage === page.id}
            $collapsed={collapsed}
            $variant={variant}
            aria-label={page.label}
            title={collapsed ? page.label : undefined}
            onClick={() => onSelect(page.id)}
            type="button"
          >
            <NavIcon aria-hidden="true">{iconMap[page.id]}</NavIcon>
            <NavLabel $collapsed={collapsed}>{page.label}</NavLabel>
          </NavButton>
        ))}
        {isAuthenticated ? (
          <SwitchRoleButton $collapsed={collapsed} type="button" onClick={onSwitchRole} aria-label="Switch role" title={collapsed ? 'Switch role' : undefined}>
            <NavIcon aria-hidden="true">{iconForPageId('role')}</NavIcon>
            <NavLabel $collapsed={collapsed}>Switch Role</NavLabel>
          </SwitchRoleButton>
        ) : null}
      </ButtonGrid>
      <SocialBlock $collapsed={collapsed} $variant={variant}>
        <SocialLabel>Follow us</SocialLabel>
        <BrandSocialLinks compact align="start" />
      </SocialBlock>
    </NavShell>
  )
}

export const WorkflowNav = memo(WorkflowNavBase)
