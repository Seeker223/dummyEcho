import { createContext, useEffect, useMemo, useState } from 'react'
import {
  adminDeleteUser,
  adminUpsertUser,
  getSessionUser,
  getUsers,
  loginUser,
  logoutUser,
  registerUser,
  resetUserPassword,
  setEnabledRoles,
  getEnabledRoles,
  setEnabledAccessRoles,
  getEnabledAccessRoles,
  updateUserProfile,
  uploadAvatar,
} from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState(() => getUsers().map(stripPassword))

  useEffect(() => {
    let mounted = true

    async function loadSession() {
      try {
        const user = await getSessionUser()
        if (mounted) {
          setCurrentUser(user ? stripPassword(user) : null)
          setLoading(false)
        }
      } catch {
        if (mounted) {
          setCurrentUser(null)
          setLoading(false)
        }
      }
    }

    loadSession()

    return () => {
      mounted = false
    }
  }, [])

  const value = useMemo(
    () => ({
      users,
      currentUser,
      loading,
      isAuthenticated: Boolean(currentUser),
      role: currentUser?.role || null,
      enabledRoles: getEnabledRoles(),
      enabledAccessRoles: getEnabledAccessRoles(),
      refreshUsers: () => {
        setUsers(getUsers().map(stripPassword))
      },
      login: async (credentials) => {
        const loggedIn = await loginUser(credentials)
        setCurrentUser(stripPassword(loggedIn))
        return loggedIn
      },
      register: async (payload) => {
        const registered = await registerUser(payload)
        return registered
      },
      logout: async () => {
        await logoutUser()
        setCurrentUser(null)
      },
      updateProfile: async (partial) => {
        try {
          const updated = await updateUserProfile(partial)
          setCurrentUser(stripPassword(updated))
          return updated
        } catch (err) {
          if (err?.message?.includes('Auth session missing')) {
            await logoutUser().catch(() => {})
            setCurrentUser(null)
            throw new Error('Your session expired. Please log in again.')
          }
          throw err
        }
      },
      uploadAvatar: async (file) => {
        const updated = await uploadAvatar(file)
        setCurrentUser(stripPassword(updated))
        return updated
      },
      resetPassword: async (payload) => {
        const ok = await resetUserPassword(payload)
        return ok
      },
      adminUpsertUser: (user) => {
        const next = adminUpsertUser(user)
        setUsers(next.map(stripPassword))
        return next
      },
      adminDeleteUser: (userId) => {
        const next = adminDeleteUser(userId)
        setUsers(next.map(stripPassword))
        return next
      },
      adminSetEnabledRoles: (enabled) => {
        const next = setEnabledRoles(enabled)
        setUsers(getUsers().map(stripPassword))
        return next
      },
      adminSetEnabledAccessRoles: (enabled) => {
        const next = setEnabledAccessRoles(enabled)
        setUsers(getUsers().map(stripPassword))
        return next
      },
    }),
    [currentUser, users, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthContext }

function stripPassword(user) {
  if (!user) return user
  const { password: _password, ...safeUser } = user
  return safeUser
}
