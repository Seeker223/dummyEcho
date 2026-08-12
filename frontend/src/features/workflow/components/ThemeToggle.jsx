import { useCallback } from 'react'
import styled from 'styled-components'
import { useAppState } from '../../../app/context/useAppState'

const ToggleWrap = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.colors.border || 'rgba(255, 255, 255, 0.1)'};
  background: ${({ theme }) => theme.colors.surface || 'rgba(255, 255, 255, 0.05)'};
  color: ${({ theme }) => theme.colors.text || '#fff'};
  cursor: pointer;
  transition: all 200ms ease;
  flex-shrink: 0;

  &:hover {
    transform: translateY(-2px);
    border-color: ${({ theme }) => theme.colors.primary || '#dc2626'};
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`

export function ThemeToggle() {
  const { isDarkMode, setDarkMode } = useAppState()

  const toggleTheme = useCallback(() => {
    setDarkMode(!isDarkMode)
  }, [isDarkMode, setDarkMode])

  return (
    <ToggleWrap onClick={toggleTheme} aria-label="Toggle Theme" type="button">
      {isDarkMode ? (
        <svg aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </ToggleWrap>
  )
}
