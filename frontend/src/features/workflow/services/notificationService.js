const KEY = 'ee_notifications:v1'

function readJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

function ensureStore() {
  const store = readJson(KEY, null)
  if (store && typeof store === 'object') return store
  const next = { byUserId: {} }
  writeJson(KEY, next)
  return next
}

function seedForUser(userId) {
  const id = String(userId || '').trim()
  if (!id) return []
  const now = Date.now()
  return [
    {
      id: `n-${now - 1000}`,
      type: 'alert',
      title: 'Emergency Response Activated',
      message: 'Your emergency alert has been shared with available healthcare professionals.',
      createdAt: new Date(now - 2 * 60_000).toISOString(),
      unread: true,
    },
    {
      id: `n-${now - 2000}`,
      type: 'message',
      title: 'Voice AI session complete',
      message: 'Your voice triage summary is ready. Open your session to review next steps.',
      createdAt: new Date(now - 5 * 60_000).toISOString(),
      unread: false,
    },
  ]
}

export function getNotificationsForUser(userId) {
  const store = ensureStore()
  const id = String(userId || '').trim()
  if (!id) return []

  const existing = store.byUserId?.[id]
  if (Array.isArray(existing)) return existing

  const seeded = seedForUser(id)
  const next = { ...store, byUserId: { ...(store.byUserId || {}), [id]: seeded } }
  writeJson(KEY, next)
  return seeded
}

export function addNotificationForUser(userId, notification) {
  const store = ensureStore()
  const id = String(userId || '').trim()
  if (!id) throw new Error('User id is required.')

  const existing = Array.isArray(store.byUserId?.[id]) ? store.byUserId[id] : []
  const createdAt = notification?.createdAt || new Date().toISOString()
  const nextItem = {
    id: String(notification?.id || `n-${Date.now()}`),
    type: String(notification?.type || 'update'),
    title: String(notification?.title || 'Update'),
    message: String(notification?.message || ''),
    createdAt,
    unread: Boolean(notification?.unread ?? true),
  }

  const next = { ...store, byUserId: { ...(store.byUserId || {}), [id]: [nextItem, ...existing] } }
  writeJson(KEY, next)
  return nextItem
}

export function markNotificationRead(userId, notificationId) {
  const store = ensureStore()
  const id = String(userId || '').trim()
  const targetId = String(notificationId || '').trim()
  if (!id || !targetId) return

  const existing = Array.isArray(store.byUserId?.[id]) ? store.byUserId[id] : []
  const nextList = existing.map((item) => (String(item?.id) === targetId ? { ...item, unread: false } : item))
  const next = { ...store, byUserId: { ...(store.byUserId || {}), [id]: nextList } }
  writeJson(KEY, next)
}

export function deleteNotification(userId, notificationId) {
  const store = ensureStore()
  const id = String(userId || '').trim()
  const targetId = String(notificationId || '').trim()
  if (!id || !targetId) return

  const existing = Array.isArray(store.byUserId?.[id]) ? store.byUserId[id] : []
  const nextList = existing.filter((item) => String(item?.id) !== targetId)
  const next = { ...store, byUserId: { ...(store.byUserId || {}), [id]: nextList } }
  writeJson(KEY, next)
}

export function markAllNotificationsRead(userId) {
  const store = ensureStore()
  const id = String(userId || '').trim()
  if (!id) return

  const existing = Array.isArray(store.byUserId?.[id]) ? store.byUserId[id] : []
  const nextList = existing.map(item => ({ ...item, unread: false }))
  const next = { ...store, byUserId: { ...(store.byUserId || {}), [id]: nextList } }
  writeJson(KEY, next)
}

export function formatRelativeTime(iso) {
  const t = new Date(iso).getTime()
  if (!Number.isFinite(t)) return 'unknown'
  const diff = Math.max(0, Date.now() - t)
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs} hr ago`
  const days = Math.round(hrs / 24)
  return `${days} day ago`
}

