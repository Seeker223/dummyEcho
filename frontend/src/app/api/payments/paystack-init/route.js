import { NextResponse } from 'next/server'

async function readJsonOrText(response) {
  const text = await response.text()
  if (!text) return {}

  try {
    return JSON.parse(text)
  } catch {
    return { message: text.slice(0, 500) }
  }
}

function pickAuthorizationUrl(payload) {
  if (!payload || typeof payload !== 'object') return null
  return (
    payload.authorization_url ||
    payload.authorizationUrl ||
    payload?.data?.authorization_url ||
    payload?.data?.authorizationUrl ||
    payload?.result?.authorization_url ||
    payload?.result?.authorizationUrl ||
    payload?.data?.data?.authorization_url ||
    null
  )
}

export async function POST(request) {
  try {
    const body = await request.json()
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')
    const webhookUrl =
      process.env.N8N_PAYSTACK_INIT_WEBHOOK_URL ||
      process.env.NEXT_PUBLIC_N8N_PAYSTACK_INIT ||
      'https://n8n-ftwl.srv1798513.hstgr.cloud/webhook/ee-paystack-init'

    // Validate required fields
    if (!body.amount || !body.email || !body.user_id) {
      return NextResponse.json(
        {
          error: 'Missing required fields: amount, email, user_id',
        },
        { status: 400 }
      )
    }

    const payload = {
      amount: Number(body.amount || 0),
      email: String(body.email || '').trim().toLowerCase(),
      user_id: String(body.user_id || '').trim(),
      source: String(body.source || 'wallet-add-funds').trim(),
      callback_url: String(body.callback_url || `${appUrl}/paystack-callback?status=success`).trim(),
      requested_at: new Date().toISOString(),
    }

    try {
      const upstreamResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
        timeout: 10000, // 10 second timeout
      })

      const data = await readJsonOrText(upstreamResponse)
      const authUrl = pickAuthorizationUrl(data)

      if (!upstreamResponse.ok) {
        console.warn('[paystack-init] Webhook returned error:', upstreamResponse.status, data)
        // Return 503 Service Unavailable instead of 500 to indicate temporary issue
        return NextResponse.json(
          {
            error: 'Payment service is temporarily unavailable. Please try again in a moment.',
            details: process.env.NODE_ENV === 'development' ? { status: upstreamResponse.status, data } : undefined,
          },
          { status: 503 }
        )
      }

      if (!authUrl) {
        console.warn('[paystack-init] No authorization URL in response:', data)
        return NextResponse.json(
          {
            error: 'Payment service did not return a checkout URL. Please contact support.',
            details: process.env.NODE_ENV === 'development' ? data : undefined,
          },
          { status: 503 }
        )
      }

      return NextResponse.json(
        {
          success: true,
          authorization_url: authUrl,
          data,
        },
        { status: 200 }
      )
    } catch (fetchError) {
      console.error('[paystack-init] Webhook fetch failed:', fetchError.message)
      // Return 503 for network/timeout errors instead of 500
      return NextResponse.json(
        {
          error: 'Payment service is temporarily unreachable. Please try again.',
          details: process.env.NODE_ENV === 'development' ? { message: fetchError.message } : undefined,
        },
        { status: 503 }
      )
    }
  } catch (error) {
    console.error('[paystack-init] Request processing error:', error)
    return NextResponse.json(
      {
        error: 'Failed to process payment request. Please try again.',
      },
      { status: 400 }
    )
  }
}
