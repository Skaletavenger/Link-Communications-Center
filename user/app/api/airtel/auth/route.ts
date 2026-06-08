import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const AIRTEL_BASE_URL = process.env.AIRTEL_BASE_URL
    const AIRTEL_CLIENT_ID = process.env.AIRTEL_CLIENT_ID
    const AIRTEL_CLIENT_SECRET = process.env.AIRTEL_CLIENT_SECRET

    if (!AIRTEL_BASE_URL || !AIRTEL_CLIENT_ID || !AIRTEL_CLIENT_SECRET) {
      return NextResponse.json({ error: 'Airtel credentials not configured' }, { status: 500 })
    }

    const body = new URLSearchParams()
    body.set('grant_type', 'client_credentials')
    body.set('client_id', AIRTEL_CLIENT_ID)
    body.set('client_secret', AIRTEL_CLIENT_SECRET)

    const res = await fetch(`${AIRTEL_BASE_URL}/auth/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })

    const data = await res.json()
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to authenticate with Airtel', details: data }, { status: res.status })
    }

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
