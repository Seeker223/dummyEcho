import { AccessToken } from 'livekit-server-sdk'

function cleanSegment(value) {
  return String(value || '')
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function buildTokenPayload(body = {}) {
  const roomName = cleanSegment(
    body.roomName ||
      body.room ||
      body.roomId ||
      body.sessionKey ||
      body.requestId ||
      body.callSessionId ||
      'EmergencyEcho-demo',
  )

  const identity = cleanSegment(
    body.identity ||
      body.userId ||
      body.user_id ||
      body.profileId ||
      body.profile_id ||
      body.email ||
      body.username ||
      'participant',
  )

  const name = String(body.name || body.displayName || body.fullName || identity).trim() || identity

  return {
    roomName,
    identity,
    name,
    role: String(body.role || 'participant').trim() || 'participant',
    callType: String(body.callType || 'video').trim() || 'video',
  }
}

function ensureConfig() {
  const apiKey = process.env.LIVEKIT_API_KEY
  const apiSecret = process.env.LIVEKIT_API_SECRET
  const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL

  if (!apiKey || !apiSecret || !serverUrl) {
    throw new Error('LiveKit is not configured. Set NEXT_PUBLIC_LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET.')
  }

  return { apiKey, apiSecret, serverUrl }
}

async function createTokenFromBody(body = {}) {
  const { apiKey, apiSecret, serverUrl } = ensureConfig()
  const payload = buildTokenPayload(body)

  const token = new AccessToken(apiKey, apiSecret, {
    identity: payload.identity,
    name: payload.name,
  })

  token.addGrant({
    roomJoin: true,
    room: payload.roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
    canUpdateOwnMetadata: true,
  })

  return {
    token: await token.toJwt(),
    roomName: payload.roomName,
    identity: payload.identity,
    name: payload.name,
    role: payload.role,
    callType: payload.callType,
    serverUrl,
  }
}

export { buildTokenPayload, cleanSegment, createTokenFromBody, ensureConfig }
