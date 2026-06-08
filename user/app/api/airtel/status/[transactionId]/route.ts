import { NextResponse } from 'next/server'

export async function GET(req: Request, { params }: { params: { transactionId: string } }) {
  try {
    const { transactionId } = params
    if (!transactionId) {
      return NextResponse.json({ error: 'Missing transactionId' }, { status: 400 })
    }

    const authRes = await fetch(new URL('/api/airtel/auth', req.url).toString(), { method: 'POST' })
    const authData = await authRes.json()
    if (!authRes.ok) {
      return NextResponse.json({ error: 'Auth failed', details: authData }, { status: 502 })
    }

    const accessToken = authData.access_token || authData.token || authData.accessToken
    if (!accessToken) {
      return NextResponse.json({ error: 'No access token returned from Airtel' }, { status: 502 })
    }

    const AIRTEL_BASE_URL = process.env.AIRTEL_BASE_URL
    if (!AIRTEL_BASE_URL) {
      return NextResponse.json({ error: 'Airtel base URL not configured' }, { status: 500 })
    }

    const res = await fetch(`${AIRTEL_BASE_URL}/merchant/v2/payments/${encodeURIComponent(transactionId)}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    const data = await res.json()
    return NextResponse.json({ ok: res.ok, data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
