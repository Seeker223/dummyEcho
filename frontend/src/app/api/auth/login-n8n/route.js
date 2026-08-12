import { NextResponse } from 'next/server'

async function readJsonOrText(response) {
  const text = await response.text()
  if (!text) return {}

  try {
    return JSON.parse(text)
  } catch {
    return { message: text.slice(0, 240) }
  }
}

function normalizeLoginPayload(payload) {
  return {
    access_token: payload?.access_token || payload?.accessToken || payload?.session?.access_token || null,
    refresh_token: payload?.refresh_token || payload?.refreshToken || payload?.session?.refresh_token || null,
    user: payload?.user || payload?.profile || payload?.session?.user || null,
    profile: payload?.profile || null,
  }
}

export async function POST(request) {
  try {
    const { email, identifier, password } = await request.json()
    const rawIdentifier = String(identifier || email || '').trim()
    const normalizedIdentifier = rawIdentifier.toLowerCase()
    const normalizedPassword = String(password || '').trim()

    console.log('[v0] Login attempt for:', rawIdentifier)

    if (!rawIdentifier || !normalizedPassword) {
      return NextResponse.json(
        { error: 'Email or username and password are required' },
        { status: 400 }
      )
    }

    const webhookUrl = process.env.N8N_LOGIN_WEBHOOK_URL
    if (!webhookUrl) {
      console.error('[v0] N8N_LOGIN_WEBHOOK_URL is not configured')
      return NextResponse.json(
        { error: 'Login service is not configured.' },
        { status: 500 }
      )
    }

    console.log('[v0] Calling n8n webhook:', webhookUrl)

    const payload = {
      raw_identifier: rawIdentifier,
      identifier: normalizedIdentifier,
      login_identifier: normalizedIdentifier,
      email: normalizedIdentifier,
      email_raw: rawIdentifier,
      username: rawIdentifier,
      username_lower: normalizedIdentifier,
      action: 'login',
      password: normalizedPassword,
      password_hash: normalizedPassword,
      raw_password: normalizedPassword,
      auth_source: 'n8n',
      client_app: 'emergency-echo-web',
      requested_at: new Date().toISOString(),
      verification_state_hint: 'verified_only',
    }

    let n8nRes
    let data
    let tokens

    try {
      console.log('[v0] Calling n8n webhook:', webhookUrl)

      n8nRes = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        timeout: 15000,
      })

      data = await readJsonOrText(n8nRes)
      tokens = normalizeLoginPayload(data)

      console.log('[v0] n8n response status:', n8nRes.status)
      console.log('[v0] n8n response data:', JSON.stringify(data).slice(0, 200))
    } catch (fetchErr) {
      console.error('[v0] Failed to reach n8n webhook:', fetchErr.message)
      return NextResponse.json(
        {
          error: 'Login service temporarily unavailable. Please try again.',
          code: 'SERVICE_UNAVAILABLE',
        },
        { status: 503 }
      )
    }

    if (!n8nRes.ok) {
      console.error('[v0] n8n returned error status:', n8nRes.status)
      
      const errorMessage =
        n8nRes.status === 404
          ? 'Login service is not available right now. Please try again later.'
          : data?.error || data?.message || 'Invalid username/email or password.'
      return NextResponse.json(
        {
          error: errorMessage,
          code: 'LOGIN_FAILED',
        },
        { status: n8nRes.status || 401 }
      )
    }

    if (!tokens.access_token || !tokens.refresh_token) {
      console.error('[v0] n8n did not return tokens. Response:', data)
      return NextResponse.json(
        {
          error: 'Login workflow did not return session tokens.',
          code: 'MISSING_SESSION_TOKENS',
          debug: process.env.NODE_ENV === 'development' ? data : undefined,
        },
        { status: 502 }
      )
    }

    console.log('[v0] Login successful for:', rawIdentifier)

    return NextResponse.json(
      {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        user: tokens.user,
        profile: tokens.profile || data.profile || null,
      },
      { status: 200 }
    )
  } catch (err) {
    console.error('[v0] Login endpoint error:', err.message, err.stack)
    return NextResponse.json(
      {
        error: 'Login failed. Please try again.',
        code: 'LOGIN_FAILED',
      },
      { status: 500 }
    )
  }
}

export async function OPTIONS(request) {
  return NextResponse.json(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Admin-Token, X-API-Key',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    },
  })
}
