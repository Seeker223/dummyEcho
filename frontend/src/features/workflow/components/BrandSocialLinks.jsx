import styled from 'styled-components'
import { SOCIAL_LINKS } from '../constants/socialLinks'

const SocialNav = styled.nav`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: ${({ $align }) => ($align === 'start' ? 'flex-start' : 'center')};
  gap: ${({ $compact }) => ($compact ? '8px' : '10px')};
`

const SocialAnchor = styled.a`
  width: ${({ $compact }) => ($compact ? '36px' : '42px')};
  height: ${({ $compact }) => ($compact ? '36px' : '42px')};
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme?.colors?.text || '#fff'};
  background: ${({ theme }) => (theme?.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.72)')};
  border: 1px solid ${({ theme }) => theme?.colors?.border || 'rgba(255,255,255,0.16)'};
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
  transition: transform 180ms ease, border-color 180ms ease, background 180ms ease, color 180ms ease;

  svg {
    width: ${({ $compact }) => ($compact ? '17px' : '19px')};
    height: ${({ $compact }) => ($compact ? '17px' : '19px')};
  }

  @media (hover: hover) {
    &:hover {
      transform: translateY(-2px);
      color: #fff;
      border-color: ${({ theme }) => theme?.colors?.primary || '#dc2626'};
      background: ${({ theme }) => theme?.colors?.primary || '#dc2626'};
    }
  }
`

export function BrandSocialIcon({ name }) {
  if (name === 'facebook') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14 8.5V6.8c0-.8.2-1.3 1.3-1.3H17V2.6c-.8-.1-1.7-.2-2.5-.2-2.5 0-4.2 1.5-4.2 4.2v1.9H7.5v3.2h2.8V22H14V11.7h2.8l.4-3.2H14z" />
      </svg>
    )
  }
  if (name === 'x') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.2 2.8h3.1l-6.8 7.8 8 10.6h-6.3l-4.9-6.4-5.6 6.4H2.6l7.3-8.3L2.2 2.8h6.4l4.4 5.8 5.2-5.8zm-1.1 16.5h1.7L7.7 4.6H5.9l11.2 14.7z" />
      </svg>
    )
  }
  if (name === 'instagram') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <path d="M17.5 6.5h.01" strokeLinecap="round" />
      </svg>
    )
  }
  if (name === 'linkedin') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6.8 21H3.2V9h3.6v12zM5 7.4A2.1 2.1 0 1 1 5 3a2.1 2.1 0 0 1 0 4.3zM21 21h-3.6v-5.8c0-1.4 0-3.1-1.9-3.1s-2.2 1.5-2.2 3V21H9.7V9h3.4v1.6h.1c.5-.9 1.7-1.9 3.5-1.9 3.7 0 4.4 2.4 4.4 5.6V21z" />
      </svg>
    )
  }
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.7 7.1a6.5 6.5 0 0 1-3.7-1.2v7.3a5.7 5.7 0 1 1-5.7-5.7c.4 0 .8 0 1.2.1v3.2a2.5 2.5 0 1 0 1.3 2.2V2h3.1c.4 2.3 1.8 3.9 3.8 4.3v.8Z" />
    </svg>
  )
}

export function BrandSocialLinks({ compact = false, align = 'center', label = 'EmergencyEcho social media links' }) {
  return (
    <SocialNav $align={align} $compact={compact} aria-label={label}>
      {SOCIAL_LINKS.map((link) => (
        <SocialAnchor
          key={link.id}
          $compact={compact}
          aria-label={link.label}
          href={link.href}
          rel="noreferrer"
          target="_blank"
          title={link.label}
        >
          <BrandSocialIcon name={link.id} />
        </SocialAnchor>
      ))}
    </SocialNav>
  )
}
