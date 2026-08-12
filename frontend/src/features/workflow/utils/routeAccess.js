function normalizeRole(value) {
  return String(value || '').trim().toLowerCase()
}

export function canAccessPage(page, { isAuthenticated, careerRole, accessRole }) {
  if (!page) return false
  if (!page.isPrivate) return true
  if (!isAuthenticated) return false
  if (!page.roles.length) return true

  const career = normalizeRole(careerRole)
  const access = normalizeRole(accessRole) || 'user'

  // Admin pages may require accessRole === 'admin' OR allow certain career roles if configured.
  if (page.roles.includes('admin') && access === 'admin') return true

  return page.roles.map(normalizeRole).includes(career)
}

export function defaultPrivatePage(role) {
  return 'home'
}
