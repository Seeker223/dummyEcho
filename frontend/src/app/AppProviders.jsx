import { ThemeProvider } from 'styled-components'
import { AuthProvider } from '../features/auth/context/AuthContext'
import { AppStateProvider } from './context/AppStateContext'
import { useAppState } from './context/useAppState'
import { GlobalStyle } from './styles/GlobalStyle'
import { darkTheme, lightTheme } from './styles/theme'

import { GlobalToasterProvider } from '../features/workflow/components/GlobalToaster'

function ThemedProviders({ children }) {
  const { isDarkMode } = useAppState()

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <GlobalStyle />
      <GlobalToasterProvider>
        {children}
      </GlobalToasterProvider>
    </ThemeProvider>
  )
}

export function AppProviders({ children }) {
  return (
    <AuthProvider>
      <AppStateProvider>
        <ThemedProviders>{children}</ThemedProviders>
      </AppStateProvider>
    </AuthProvider>
  )
}
