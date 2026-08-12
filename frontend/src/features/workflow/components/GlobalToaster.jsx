import { createContext, useContext, useState, useCallback } from 'react'
import styled, { keyframes } from 'styled-components'

const slideIn = keyframes`
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`
const fadeOut = keyframes`
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(100%); opacity: 0; }
`

const ToasterContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
`

const ToastItem = styled.div`
  pointer-events: auto;
  background: ${({ theme, $type }) => 
    $type === 'error' ? (theme.mode === 'dark' ? '#450a0a' : '#fef2f2') :
    $type === 'warning' ? (theme.mode === 'dark' ? '#422006' : '#fffbeb') :
    (theme.mode === 'dark' ? '#0f172a' : '#ffffff')};
  border: 1px solid ${({ theme, $type }) => 
    $type === 'error' ? (theme.mode === 'dark' ? '#991b1b' : '#ef4444') :
    $type === 'warning' ? (theme.mode === 'dark' ? '#b45309' : '#f59e0b') :
    theme.colors.border};
  color: ${({ theme, $type }) => 
    $type === 'error' ? (theme.mode === 'dark' ? '#fecaca' : '#991b1b') :
    $type === 'warning' ? (theme.mode === 'dark' ? '#fde68a' : '#92400e') :
    theme.colors.text};
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  min-width: 300px;
  max-width: 400px;
  animation: ${({ $leaving }) => ($leaving ? fadeOut : slideIn)} 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  display: flex;
  align-items: flex-start;
  gap: 12px;
`

const ToastIcon = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${({ $type }) => 
    $type === 'error' ? '#ef4444' :
    $type === 'warning' ? '#f59e0b' :
    '#3b82f6'};
  color: #fff;
  font-weight: bold;
  font-size: 14px;
`

const ToastContent = styled.div`
  flex: 1;
`

const ToastTitle = styled.div`
  font-weight: 800;
  font-size: 0.95rem;
  margin-bottom: 4px;
`

const ToastMessage = styled.div`
  font-size: 0.85rem;
  line-height: 1.4;
  opacity: 0.9;
`

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: inherit;
  opacity: 0.5;
  cursor: pointer;
  padding: 4px;
  font-size: 16px;
  &:hover { opacity: 1; }
`

const ToastContext = createContext(null)

export function useToaster() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToaster must be used within GlobalToasterProvider')
  return context
}

export function GlobalToasterProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((title, message, type = 'info', duration = 6000) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 9)
    setToasts(prev => [...prev, { id, title, message, type, leaving: false }])

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t))
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 300)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToasterContainer>
        {toasts.map(t => (
          <ToastItem key={t.id} $type={t.type} $leaving={t.leaving}>
            <ToastIcon $type={t.type}>
              {t.type === 'error' ? '!' : t.type === 'warning' ? '⚠' : 'i'}
            </ToastIcon>
            <ToastContent>
              {t.title && <ToastTitle>{t.title}</ToastTitle>}
              <ToastMessage>{t.message}</ToastMessage>
            </ToastContent>
            <CloseButton onClick={() => removeToast(t.id)}>✕</CloseButton>
          </ToastItem>
        ))}
      </ToasterContainer>
    </ToastContext.Provider>
  )
}
