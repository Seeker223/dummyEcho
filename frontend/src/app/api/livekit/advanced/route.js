import { NextResponse } from 'next/server'
import { createTokenFromBody } from '../_shared'

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}))
    const result = await createTokenFromBody(body)
    return NextResponse.json(
      {
        authorization_url: result.serverUrl,
        token: result.token,
        roomName: result.roomName,
        room: result.roomName,
        identity: result.identity,
        name: result.name,
        callType: result.callType,
      },
      { status: 200 },
    )
  } catch (error) {
    return NextResponse.json({ error: error?.message || 'Unable to create LiveKit token.' }, { status: 500 })
  }
}
