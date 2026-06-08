import { NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'

type Body = {
  phone: string
  amount: number
  reference: string
  productId?: string | null
  userId?: string | null
}

function stripLeadingZero(phone: string) {
  return phone.replace(/^0+/, '')
}

export async function POST(req: Request) {
  try {
    const body: Body = await req.json()
    const { phone, amount, reference, productId = null, userId = null } = body

    if (!phone || !amount || !reference) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Get token from our auth endpoint
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

    const transactionId = crypto.randomUUID()
    const msisdn = stripLeadingZero(phone)

    const payload = {
      reference,
      subscriber: {
        country: 'UG',
        currency: 'UGX',
        msisdn,
      },
      transaction: {
        amount: Math.round(amount),
        country: 'UG',
        currency: 'UGX',
        id: transactionId,
      },
    }

    const res = await fetch(`${AIRTEL_BASE_URL}/merchant/v2/payments/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json()

    // Save attempt to transactions table
    try {
      await supabase.from('transactions').insert({
        id: transactionId,
        user_id: userId,
        product_id: productId,
        amount: amount,
        phone: msisdn,
        airtel_transaction_id: data.transaction?.id || data.transactionId || data.id || null,
        status: data.status || (res.ok ? 'PENDING' : 'FAILED'),
        reference,
      })
    } catch (e) {
      // continue even if DB save fails
      console.error('Failed saving transaction:', e)
    }

    return NextResponse.json({ ok: res.ok, data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
