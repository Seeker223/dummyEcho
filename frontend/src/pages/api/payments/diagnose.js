import { NextResponse } from 'next/server'

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      n8n_webhook_url: process.env.N8N_PAYSTACK_INIT_WEBHOOK_URL ? '✓ Set' : '✗ Not set',
      n8n_webhook_public: process.env.NEXT_PUBLIC_N8N_PAYSTACK_INIT ? '✓ Set' : '✗ Not set',
      default_webhook: 'https://n8n-ftwl.srv1798513.hstgr.cloud/webhook/ee-paystack-init',
    },
    webhook_test: null,
  }

  const webhookUrl =
    process.env.N8N_PAYSTACK_INIT_WEBHOOK_URL ||
    process.env.NEXT_PUBLIC_N8N_PAYSTACK_INIT ||
    'https://n8n-ftwl.srv1798513.hstgr.cloud/webhook/ee-paystack-init'

  diagnostics.webhook_url_in_use = webhookUrl

  // Test the webhook connectivity
  try {
    const testRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ diagnostic_test: true, timestamp: new Date().toISOString() }),
      timeout: 5000,
    })

    diagnostics.webhook_test = {
      status: testRes.status,
      ok: testRes.ok,
      message: testRes.ok ? 'Webhook is reachable' : `Webhook returned status ${testRes.status}`,
    }
  } catch (error) {
    diagnostics.webhook_test = {
      status: 'error',
      ok: false,
      message: error.message || 'Unable to reach webhook',
    }
  }

  return NextResponse.json(diagnostics, { status: 200 })
}
