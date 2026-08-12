const DEFAULT_LIVEKIT_ROOM_PREFIX = 'EmergencyEcho'

function cleanSegment(value) {
  return String(value || '')
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function getLiveKitServerUrl() {
  return String(process.env.NEXT_PUBLIC_LIVEKIT_URL || '').trim()
}

export function buildLiveKitRoomName(seed = {}) {
  const source =
    seed.sessionKey ||
    seed.requestId ||
    seed.submissionKey ||
    seed.submission_key ||
    seed.callSessionId ||
    seed.doctorId ||
    seed.roomId ||
    seed.roomName ||
    seed.source ||
    'demo'

  const suffix = cleanSegment(source) || 'demo'
  return `${DEFAULT_LIVEKIT_ROOM_PREFIX}-${suffix}`
}

export function buildLiveKitIdentity(currentUser = {}, fallbackRole = 'participant') {
  const rawIdentity =
    currentUser?.id ||
    currentUser?.user_id ||
    currentUser?.submission_key ||
    currentUser?.submissionKey ||
    currentUser?.email ||
    currentUser?.username ||
    fallbackRole

  return cleanSegment(rawIdentity) || fallbackRole
}

export async function requestLiveKitToken(payload = {}) {
  const response = await fetch('/api/livekit/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  let data = null
  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    const message =
      data?.error ||
      data?.message ||
      `Unable to join the LiveKit room (${response.status}).`
    throw new Error(message)
  }

  return data
}
