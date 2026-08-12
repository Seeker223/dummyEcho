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

export async function POST(request) {
  try {
    const body = await request.json()
    const { email, password, newPassword, password_hash, action, token, code } = body
    const nextPassword = String(password || newPassword || '').trim()
    const nextPasswordHash = String(password_hash || password || newPassword || '').trim()

    console.log('[v0] Password reset for:', email)

    if (!email || !nextPassword) {
      return NextResponse.json(
        { error: 'Email and new password are required' },
        { status: 400 }
      )
    }

    if (nextPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Reset password via n8n password reset webhook
    const webhookUrl = process.env.N8N_PASSWORD_RESET_WEBHOOK_URL
    if (!webhookUrl) {
      console.error('[v0] N8N_PASSWORD_RESET_WEBHOOK_URL is not configured')
      return NextResponse.json(
        { error: 'Password reset service is not configured.' },
        { status: 500 }
      )
    }

    console.log('[v0] Calling n8n password reset webhook')

    const payload = {
      action: String(action || 'reset_password').trim(),
      email: String(email).trim().toLowerCase(),
      password: nextPassword,
      password_hash: nextPasswordHash,
      token: token ? String(token).trim() : undefined,
      code: code ? String(code).trim() : undefined,
    }

    // Remove undefined fields
    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key])

    let n8nRes
    let data

    try {
      n8nRes = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        timeout: 15000,
      })

      data = await readJsonOrText(n8nRes)
      console.log('[v0] n8n response status:', n8nRes.status)
    } catch (fetchErr) {
      console.error('[v0] Failed to reach password reset webhook:', fetchErr.message)
      return NextResponse.json(
        {
          error: 'Password reset service temporarily unavailable. Please try again.',
          code: 'SERVICE_UNAVAILABLE',
        },
        { status: 503 }
      )
    }

    if (!n8nRes.ok) {
      console.error('[v0] n8n password reset failed:', n8nRes.status)
      const errorMessage = data?.error || data?.message || 'Password reset failed. Please try again.'
      return NextResponse.json(
        {
          error: errorMessage,
          code: 'RESET_FAILED',
        },
        { status: n8nRes.status || 400 }
      )
    }

    console.log('[v0] Password reset successful for:', email)

    return NextResponse.json(
      {
        success: true,
        message: data?.message || 'Password has been reset successfully.',
        email: data?.email || email,
      },
      { status: 200 }
    )
  } catch (err) {
    console.error('[v0] Reset password endpoint error:', err.message, err.stack)
    return NextResponse.json(
      {
        error: 'Password reset failed. Please try again.',
        code: 'RESET_FAILED',
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
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    },
  })
}
