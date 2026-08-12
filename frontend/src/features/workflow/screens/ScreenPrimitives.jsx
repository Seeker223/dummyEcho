import styled, { keyframes, css } from 'styled-components'

const eeShimmer = keyframes`
  0% { transform: translateX(-65%); }
  55% { transform: translateX(65%); }
  100% { transform: translateX(65%); }
`

export const Screen = styled.section`
  padding: clamp(12px, 3vw, 24px);
  min-width: 0;
  height: calc(100% - 36px);
  overflow-y: auto;
  overflow-x: hidden;
  background:
    radial-gradient(circle at 12% 0%, rgba(220, 38, 38, 0.08), transparent 20%),
    radial-gradient(circle at 90% 10%, rgba(59, 130, 246, 0.06), transparent 18%);

  /* Mobile bottom navigation sits above the viewport edge. */
  @media (max-width: 640px) {
    padding-bottom: 96px;
  }

  /* Authenticated workflow pages should be full-bleed on mobile. */
  .ee-auth-shell & {
    @media (max-width: 640px) {
      padding: clamp(12px, 3vw, 16px);
      padding-bottom: 96px;
      height: 100%;
    }
  }
`

export const Title = styled.h2`
  margin: 0 0 clamp(6px, 2vw, 12px);
  font-size: clamp(1.8rem, 6vw, 2.8rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme?.colors?.text || '#1a1f2e'};
`

export const Subtitle = styled.p`
  margin: 0 0 clamp(12px, 3vw, 20px);
  font-weight: 500;
  font-size: clamp(0.95rem, 2.5vw, 1.1rem);
  color: ${({ theme }) => theme?.colors?.muted || '#6b7280'};
`

export const Card = styled.article`
  margin-bottom: clamp(10px, 2vw, 16px);
  padding: clamp(16px, 4vw, 24px);
  border-radius: 22px;
  border: 1.5px solid
    ${({ theme }) => (theme?.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(220, 38, 38, 0.1)')};
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85)),
    ${({ theme }) => theme?.colors?.surface || '#ffffff'};
  box-shadow: 0 16px 42px rgba(15, 31, 68, 0.1);
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;

  @media (hover: hover) {
    &:hover {
      transform: translateY(-6px);
      box-shadow: 0 22px 48px rgba(220, 38, 38, 0.16);
      border-color: ${({ theme }) => theme?.colors?.primary || '#dc2626'};
    }
  }
`

export const Button = styled.button`
  width: 100%;
  border: 1.5px solid ${({ theme }) => theme?.colors?.primary || '#dc2626'};
  border-radius: ${({ theme }) => theme?.radii?.lg || '16px'};
  background: linear-gradient(135deg, ${({ theme }) => theme?.colors?.primary || '#dc2626'}, ${({ theme }) => theme?.colors?.primaryDeep || '#b91c1c'});
  color: #fff;
  padding: clamp(12px, 2vw, 14px) clamp(16px, 3vw, 20px);
  font-weight: 700;
  font-size: clamp(0.95rem, 2.5vw, 1.05rem);
  cursor: pointer;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 14px 30px rgba(220, 38, 38, 0.28);
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    inset: -40% -60%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent);
    transform: translateX(-65%);
    animation: ${eeShimmer} 2.8s ease-in-out infinite;
    pointer-events: none;
  }

  @media (prefers-reduced-motion: reduce) {
    &::after {
      animation: none;
      display: none;
    }
  }

  @media (hover: hover) {
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 20px 36px rgba(220, 38, 38, 0.34);
      filter: saturate(1.04) brightness(1.02);
    }
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 6px 14px rgba(220, 38, 38, 0.24);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme?.colors?.primary || '#dc2626'};
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }
`

export const Grid = styled.div`
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(${({ $cols = 2 }) => $cols}, minmax(0, 1fr));
`

export const CurvedHeader = styled.header`
  margin: -16px -16px 12px;
  padding: 38px 20px 34px;
  border-bottom-left-radius: 52% 20%;
  border-bottom-right-radius: 52% 20%;
  background: linear-gradient(180deg, #c70000 0%, ${({ theme }) => theme?.colors?.primary || '#dc2626'} 100%);
  color: #fff;
  text-align: center;
  box-shadow: 0 14px 26px rgba(198, 40, 40, 0.24);

  h2 {
    margin: 0;
    font-size: clamp(1.6rem, 5vw, 2.2rem);
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  p {
    margin: clamp(6px, 1.5vw, 10px) 0 0;
    font-weight: 500;
    font-size: clamp(0.9rem, 2vw, 1.05rem);
    color: rgba(255, 255, 255, 0.9);
  }
`

export const FieldLabel = styled.label`
  display: block;
  margin-bottom: clamp(6px, 1.5vw, 8px);
  font-size: clamp(0.85rem, 2vw, 0.95rem);
  font-weight: 700;
  color: ${({ theme }) => theme?.colors?.text || '#1a1f2e'};
  text-transform: capitalize;
  letter-spacing: 0.3px;
`

const eeShake = keyframes`
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-5px); }
  40%, 80% { transform: translateX(5px); }
`

export const TextField = styled.input`
  width: 100%;
  border-radius: ${({ theme }) => theme?.radii?.md || '12px'};
  border: 1.5px solid ${({ $invalid, theme }) => ($invalid ? '#dc2626' : theme?.colors?.border || '#e5e7eb')};
  background: ${({ theme }) => theme?.colors?.surface || '#ffffff'};
  padding: 11px 13px;
  font-size: 0.95rem;
  outline: none;
  transition: all 180ms ease;
  font-weight: 500;
  ${({ $invalid }) => $invalid && css`
    animation: ${eeShake} 0.4s ease-in-out;
  `}

  &::placeholder {
    color: ${({ theme }) => theme?.colors?.muted || '#6b7280'};
    opacity: 0.7;
  }

  @media (hover: hover) {
    &:hover:not(:focus) {
      border-color: ${({ $invalid, theme }) => ($invalid ? '#dc2626' : theme?.colors?.primary || '#dc2626')};
      background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.6)')};
    }
  }

  &:focus {
    border-color: ${({ $invalid, theme }) => ($invalid ? '#dc2626' : theme?.colors?.primary || '#dc2626')};
    box-shadow: ${({ $invalid, theme }) =>
      $invalid
        ? '0 0 0 3px rgba(220, 38, 38, 0.1)'
        : `0 0 0 3px ${(theme && theme.colors && theme.colors.glowRed) || 'rgba(220, 38, 38, 0.2)'}`};
    background: ${({ theme }) => theme?.colors?.surface || '#ffffff'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

export const SelectField = styled.select`
  width: 100%;
  border-radius: ${({ theme }) => theme?.radii?.md || '12px'};
  border: 1.5px solid ${({ $invalid, theme }) => ($invalid ? '#dc2626' : theme?.colors?.border || '#e5e7eb')};
  background: ${({ theme }) => theme?.colors?.surface || '#ffffff'};
  padding: clamp(11px, 2vw, 14px) clamp(13px, 2vw, 16px);
  font-size: clamp(0.95rem, 2vw, 1.05rem);
  outline: none;
  transition: all 180ms ease;
  font-weight: 600;
  cursor: pointer;
  
  ${({ $invalid }) => $invalid && css`
    animation: ${eeShake} 0.4s ease-in-out;
  `}

  @media (hover: hover) {
    &:hover:not(:focus) {
      border-color: ${({ $invalid, theme }) => ($invalid ? '#dc2626' : theme?.colors?.primary || '#dc2626')};
      background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.6)')};
    }
  }

  &:focus {
    border-color: ${({ $invalid, theme }) => ($invalid ? '#dc2626' : theme?.colors?.primary || '#dc2626')};
    box-shadow: ${({ $invalid, theme }) =>
      $invalid
        ? '0 0 0 3px rgba(220, 38, 38, 0.1)'
        : `0 0 0 3px ${(theme && theme.colors && theme.colors.glowRed) || 'rgba(220, 38, 38, 0.2)'}`};
  }

  option {
    color: ${({ theme }) => theme?.colors?.text || '#1a1f2e'};
    background: ${({ theme }) => theme?.colors?.surface || '#ffffff'};
    font-weight: 500;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`
