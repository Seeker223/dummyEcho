import styled, { keyframes } from 'styled-components'

const shimmer = keyframes`
  0% { background-position: 0% 0; }
  100% { background-position: 200% 0; }
`

export const Skeleton = styled.span`
  --base: ${({ theme }) => (theme?.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,31,68,0.08)')};
  --shine: ${({ theme }) => (theme?.mode === 'dark' ? 'rgba(255,255,255,0.16)' : 'rgba(15,31,68,0.14)')};

  display: block;
  width: ${({ $w }) => $w || '100%'};
  height: ${({ $h }) => $h || '12px'};
  border-radius: ${({ $r }) => $r || '12px'};
  background: linear-gradient(90deg, var(--base) 0%, var(--shine) 50%, var(--base) 100%);
  background-size: 200% 100%;
  animation: ${shimmer} 1100ms ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    background: var(--base);
  }
`

