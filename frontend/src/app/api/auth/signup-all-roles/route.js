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
    const { email, password, full_name, role, phone, username, title } = body

    console.log('[v0] Signup attempt for:', email, 'role:', role)

    // Validate required fields
    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'Email, password, and role are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    const webhookUrl = process.env.N8N_SIGNUP_WEBHOOK_URL
    if (!webhookUrl) {
      console.error('[v0] N8N_SIGNUP_WEBHOOK_URL is not configured')
      return NextResponse.json(
        { error: 'Signup service is not configured.' },
        { status: 500 }
      )
    }

    console.log('[v0] Calling n8n signup webhook:', webhookUrl)

    const payload = {
      email: String(email).trim().toLowerCase(),
      password: String(password).trim(),
      full_name: String(full_name || '').trim(),
      role: String(role).trim().toLowerCase(),
      phone: String(phone || '').trim(),
      username: String(username || '').trim().toLowerCase(),
      title: String(title || '').trim(),
      email_verified: false,
      is_verified: false,
      verification_status: 'pending',
      verified_at: null,
      auth_source: 'n8n',
      account_status: 'pending_verification',
    }

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
      console.error('[v0] Failed to reach n8n webhook:', fetchErr.message)
      return NextResponse.json(
        {
          error: 'Signup service temporarily unavailable. Please try again.',
          code: 'SERVICE_UNAVAILABLE',
        },
        { status: 503 }
      )
    }

    if (!n8nRes.ok) {
      console.error('[v0] n8n returned error status:', n8nRes.status)
      const errorMessage = data?.error || data?.message || 'Signup failed. Please try again.'
      return NextResponse.json(
        {
          error: errorMessage,
          code: 'SIGNUP_FAILED',
        },
        { status: n8nRes.status || 400 }
      )
    }

    console.log('[v0] Signup successful for:', email)

    // Generate 6-digit verification token
    const verificationToken = String(Math.floor(100000 + Math.random() * 900000))
    console.log('[v0] Generated verification token:', verificationToken, 'for:', email)

    // Trigger email verification after successful signup
    const emailWebhookUrl = process.env.N8N_EMAIL_WEBHOOK_URL
    if (emailWebhookUrl && data?.user_id) {
      console.log('[v0] Triggering email verification for:', email)
      try {
        const emailRes = await fetch(emailWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: String(email).trim().toLowerCase(),
            token: verificationToken,
            full_name: data?.full_name || payload.full_name,
            username: data?.username || payload.username,
            title: data?.title || payload.title,
            role: data?.role || payload.role,
            user_id: data?.user_id || data?.id || null,
            type: 'email-verification',
          }),
          timeout: 10000,
        })

        const emailData = await readJsonOrText(emailRes)
        if (emailRes.ok) {
          console.log('[v0] Email verification sent successfully with token:', verificationToken)
        } else {
          console.warn('[v0] Email webhook returned non-200 status:', emailRes.status, emailData)
        }
      } catch (emailErr) {
        console.warn('[v0] Failed to trigger email verification:', emailErr.message)
        // Don't fail signup if email fails, just warn
      }
    } else {
      console.warn('[v0] Email webhook URL or user_id not available')
    }

    return NextResponse.json(
      {
        success: true,
        message: data?.message || 'Signup successful. Please check your email to verify your account.',
        user_id: data?.user_id || data?.id,
        email: data?.email || email,
        role: data?.role || role,
        username: data?.username || username,
        title: data?.title || title,
        verification_status: data?.verification_status || 'pending',
        email_verified: false,
        is_verified: false,
        verified_at: data?.verified_at || null,
      },
      { status: 200 }
    )
  } catch (err) {
    console.error('[v0] Signup endpoint error:', err.message, err.stack)
    return NextResponse.json(
      {
        error: 'Signup failed. Please try again.',
        code: 'SIGNUP_FAILED',
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
