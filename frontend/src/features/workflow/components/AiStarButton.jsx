import styled from 'styled-components'

const Button = styled.button`
  width: 44px;
  height: 44px;
  border: 1.5px solid ${({ theme }) => theme.colors.primary};
  border-radius: 12px;
  background: transparent;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.08);
  
  @media (hover: hover) {
    &:hover {
      background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(220, 38, 38, 0.1)' : 'rgba(220, 38, 38, 0.05)'};
      transform: scale(1.08);
      box-shadow: 0 8px 16px rgba(220, 38, 38, 0.16);
    }
  }
  
  &:active {
    transform: scale(0.95);
  }
`

export function AiStarButton({ onClick, title = 'AI Assistant' }) {
  return (
    <Button type="button" onClick={onClick} title={title} aria-label={title}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    </Button>
  )
}
