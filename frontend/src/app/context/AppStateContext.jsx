import { createContext, useEffect, useMemo, useState } from 'react'

const AppStateContext = createContext(null)
const THEME_KEY = 'ee_theme_mode'

export function AppStateProvider({ children }) {
  const [activePage, setActivePage] = useState('role')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState(null)
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    try {
      setIsDarkMode(window.localStorage.getItem(THEME_KEY) === 'dark')
    } catch {
      setIsDarkMode(false)
    }
  }, [])

  const setDarkMode = (value) => {
    const next = Boolean(value)
    setIsDarkMode(next)
    try {
      window.localStorage.setItem(THEME_KEY, next ? 'dark' : 'light')
    } catch {
      // Ignore storage errors and continue with in-memory state.
    }
  }

  const [toastMessage, setToastMessage] = useState(null)
  
  const showToast = (msg, type = 'info') => {
    setToastMessage({ msg, type, id: Date.now() })
    setTimeout(() => {
      setToastMessage(prev => prev?.msg === msg ? null : prev)
    }, 4000)
  }

  // Digital Medical Kit active step/tab state (1: About You, 2: Emergency, etc.)
  const [kitStep, setKitStep] = useState(1)

  // Geolocation Services state
  const [locationEnabled, setLocationEnabledState] = useState(() => {
    try {
      return window.localStorage.getItem('ee_location_enabled') === 'true'
    } catch {
      return false
    }
  })
  const [locationCoords, setLocationCoords] = useState(null)

  const setLocationEnabled = (value) => {
    setLocationEnabledState((prev) => {
      const next = typeof value === 'function' ? value(prev) : Boolean(value)
      if (next) {
        if (typeof window !== 'undefined' && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setLocationCoords({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              })
              try {
                window.localStorage.setItem('ee_location_enabled', 'true')
                window.localStorage.setItem('ee_location_lat', String(position.coords.latitude))
                window.localStorage.setItem('ee_location_lon', String(position.coords.longitude))
              } catch (e) {
                console.error(e)
              }
            },
            (error) => {
              console.error('Error getting location:', error)
              showToast('Failed to get location. Please allow location permissions in your browser.', 'error')
              setLocationEnabledState(false)
              setLocationCoords(null)
              try {
                window.localStorage.setItem('ee_location_enabled', 'false')
                window.localStorage.removeItem('ee_location_lat')
                window.localStorage.removeItem('ee_location_lon')
              } catch (e) {
                console.error(e)
              }
            }
          )
        } else {
          showToast('Geolocation is not supported by your browser.', 'error')
          return false
        }
        return true
      } else {
        setLocationCoords(null)
        try {
          window.localStorage.setItem('ee_location_enabled', 'false')
          window.localStorage.removeItem('ee_location_lat')
          window.localStorage.removeItem('ee_location_lon')
        } catch (e) {
          console.error(e)
        }
        return false
      }
    })
  }

  // Keep location coordinates updated on mount or when locationEnabled changes
  useEffect(() => {
    if (locationEnabled && typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
          try {
            window.localStorage.setItem('ee_location_lat', String(position.coords.latitude))
            window.localStorage.setItem('ee_location_lon', String(position.coords.longitude))
          } catch (e) {}
        },
        (err) => {
          console.error('Error refreshing location on mount:', err)
        }
      )
    }
  }, [locationEnabled])

  const value = useMemo(
    () => ({
      activePage,
      setActivePage,
      searchQuery,
      setSearchQuery,
      selectedRole,
      setSelectedRole,
      isDarkMode,
      setDarkMode,
      kitStep,
      setKitStep,
      locationEnabled,
      setLocationEnabled,
      locationCoords,
      showToast,
    }),
    [activePage, isDarkMode, searchQuery, selectedRole, kitStep, locationEnabled, locationCoords],
  )

  return (
    <AppStateContext.Provider value={value}>
      {children}
      {toastMessage && (
        <div style={{
          position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)',
          background: toastMessage.type === 'error' ? '#dc2626' : toastMessage.type === 'success' ? '#10b981' : '#334155',
          color: '#fff', padding: '12px 24px', borderRadius: '8px', zIndex: 9999, fontWeight: 700, fontSize: '0.9rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.25)', transition: 'all 0.3s ease',
          pointerEvents: 'none', textAlign: 'center', width: 'max-content', maxWidth: '90vw'
        }}>
          {toastMessage.msg}
        </div>
      )}
    </AppStateContext.Provider>
  )
}

export { AppStateContext }
