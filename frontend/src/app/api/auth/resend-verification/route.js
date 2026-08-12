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
    const { email, user_id, full_name, username, title, role } = await request.json()

    console.log('[v0] Resend verification code for:', email)

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Resend verification code via n8n email webhook
    const emailWebhookUrl = process.env.N8N_EMAIL_WEBHOOK_URL
    if (!emailWebhookUrl) {
      console.error('[v0] N8N_EMAIL_WEBHOOK_URL is not configured')
      return NextResponse.json(
        { error: 'Email service is not configured.' },
        { status: 500 }
      )
    }

    console.log('[v0] Calling n8n email webhook to resend verification')

    // Generate new 6-digit verification token
    const verificationToken = String(Math.floor(100000 + Math.random() * 900000))
    console.log('[v0] Generated new verification token:', verificationToken, 'for:', email)

    const payload = {
      email: String(email).trim().toLowerCase(),
      token: verificationToken,
      type: 'email-verification',
      user_id: user_id || undefined,
      full_name: full_name || undefined,
      username: username || undefined,
      title: title || undefined,
      role: role || undefined,
    }

    Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key])

    let n8nRes
    let data

    try {
      n8nRes = await fetch(emailWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        timeout: 15000,
      })

      data = await readJsonOrText(n8nRes)
      console.log('[v0] n8n email response status:', n8nRes.status)
    } catch (fetchErr) {
      console.error('[v0] Failed to reach email webhook:', fetchErr.message)
      return NextResponse.json(
        {
          error: 'Email service temporarily unavailable. Please try again.',
          code: 'SERVICE_UNAVAILABLE',
        },
        { status: 503 }
      )
    }

    if (!n8nRes.ok) {
      console.error('[v0] n8n email resend failed:', n8nRes.status)
      const errorMessage = data?.error || data?.message || 'Failed to resend verification code.'
      return NextResponse.json(
        {
          error: errorMessage,
          code: 'RESEND_FAILED',
        },
        { status: n8nRes.status || 400 }
      )
    }

    console.log('[v0] Verification code resent to:', email)

    return NextResponse.json(
      {
        success: true,
        message: data?.message || 'Verification code has been resent to your email.',
        email: data?.email || email,
      },
      { status: 200 }
    )
  } catch (err) {
    console.error('[v0] Resend verification endpoint error:', err.message, err.stack)
    return NextResponse.json(
      {
        error: 'Failed to resend verification code. Please try again.',
        code: 'RESEND_FAILED',
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
