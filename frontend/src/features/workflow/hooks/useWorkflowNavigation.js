import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAppState } from '../../../app/context/useAppState'
import { useAuth } from '../../auth/context/useAuth'
import { pages } from '../constants/pages'
import { canAccessPage, defaultPrivatePage } from '../utils/routeAccess'

function readDisabledPages() {
  try {
    const raw = window.localStorage.getItem('ee:admin:disabledPages:v1')
    const parsed = raw ? JSON.parse(raw) : null
    const ids = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.ids) ? parsed.ids : []
    return ids.map((id) => String(id || '').trim()).filter(Boolean)
  } catch {
    return []
  }
}

export function useWorkflowNavigation() {
  const { activePage, setActivePage } = useAppState()
  const { isAuthenticated, currentUser } = useAuth()

  // Role is optional and can be applied later from the drawer menu.
  const careerRole = currentUser?.role || null
  const accessRole = currentUser?.accessRole || currentUser?.role || null

  const [disabledPages, setDisabledPages] = useState(() => readDisabledPages())

  useEffect(() => {
    const onStorage = (event) => {
      if (event?.key && event.key !== 'ee:admin:disabledPages:v1') return
      setDisabledPages(readDisabledPages())
    }

    window.addEventListener('storage', onStorage)
    window.addEventListener('ee:admin:disabled-pages', onStorage)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('ee:admin:disabled-pages', onStorage)
    }
  }, [])

  useEffect(() => {
    const activeConfig = pages.find((page) => page.id === activePage)
    if (!activeConfig) {
      if (!isAuthenticated) {
        setActivePage('login')
        return
      }
      setActivePage(defaultPrivatePage(careerRole))
      return
    }

    if (isAuthenticated && ['login', 'signup'].includes(activePage)) {
      setActivePage(defaultPrivatePage(careerRole))
      return
    }

    if (isAuthenticated && activeConfig.isPrivate && disabledPages.includes(activeConfig.id)) {
      setActivePage(defaultPrivatePage(careerRole))
      return
    }

    if (canAccessPage(activeConfig, { isAuthenticated, careerRole, accessRole })) return
    setActivePage(isAuthenticated ? 'forbidden' : 'login')
  }, [accessRole, activePage, careerRole, disabledPages, isAuthenticated, setActivePage])

  const visiblePages = useMemo(
    () =>
      pages.filter(
        (page) =>
          !(isAuthenticated && ['login', 'signup'].includes(page.id)) &&
          page.id !== 'forbidden' &&
          !page.hideInNav &&
          !(isAuthenticated && page.isPrivate && disabledPages.includes(page.id)) &&
          canAccessPage(page, { isAuthenticated, careerRole, accessRole }) &&
          (isAuthenticated || !page.isPrivate),
      ),
    [accessRole, careerRole, disabledPages, isAuthenticated],
  )

  const setPage = useCallback(
    (pageId) => {
      const targetPage = pages.find((page) => page.id === pageId)
      if (!targetPage) return
      if (isAuthenticated && targetPage.isPrivate && disabledPages.includes(targetPage.id)) {
        setActivePage(defaultPrivatePage(careerRole))
        return
      }
      if (!canAccessPage(targetPage, { isAuthenticated, careerRole, accessRole })) {
        setActivePage(isAuthenticated ? 'forbidden' : 'login')
        return
      }
      setActivePage(pageId)
    },
    [accessRole, careerRole, disabledPages, isAuthenticated, setActivePage],
  )

  const activePageLabel = useMemo(
    () => pages.find((page) => page.id === activePage)?.label || 'Unknown',
    [activePage],
  )

  return { pages: visiblePages, activePage, activePageLabel, setPage }
}
