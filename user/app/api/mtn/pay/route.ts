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

    const MTN_USER_ID = process.env.MTN_COLLECTION_USER_ID
    const MTN_API_KEY = process.env.MTN_COLLECTION_API_KEY
    const MTN_SUBSCRIPTION_KEY = process.env.MTN_COLLECTION_SUBSCRIPTION_KEY

    if (!MTN_USER_ID || !MTN_API_KEY || !MTN_SUBSCRIPTION_KEY) {
      return NextResponse.json({ error: 'MTN credentials not configured' }, { status: 500 })
    }

    // MTN_BASE_URL and MTN_TARGET_ENVIRONMENT let this switch from sandbox to
    // production once MTN approves production Collections API access —
    // previously this was hardcoded to the sandbox URL permanently.
    const MTN_BASE_URL = process.env.MTN_BASE_URL || 'https://sandbox.momodeveloper.mtn.com'
    const MTN_TARGET_ENVIRONMENT = process.env.MTN_TARGET_ENVIRONMENT || 'sandbox'

    // Get OAuth2 token
    const credentials = Buffer.from(`${MTN_USER_ID}:${MTN_API_KEY}`).toString('base64')
    const tokenRes = await fetch(`${MTN_BASE_URL}/collection/token/`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Ocp-Apim-Subscription-Key': MTN_SUBSCRIPTION_KEY,
        'Content-Type': 'application/json',
      },
      body: '{}',
    })

    const tokenData = await tokenRes.json()
    if (!tokenRes.ok) {
      return NextResponse.json(
        { error: 'Token fetch failed', details: tokenData },
        { status: 502 }
      )
    }

    const accessToken = tokenData.access_token
    if (!accessToken) {
      return NextResponse.json(
        { error: 'No access token returned from MTN' },
        { status: 502 }
      )
    }

    const transactionId = crypto.randomUUID()
    const msisdn = stripLeadingZero(phone)

    const payload = {
      payer: {
        partyIdType: 'MSISDN',
        partyId: msisdn,
      },
      amount: String(amount),
      currency: 'UGX',
      externalId: reference,
      payerMessage: reference,
      payeeNote: 'LCC Payment',
    }

    const payRes = await fetch(`${MTN_BASE_URL}/collection/v1_0/requesttopay`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Reference-Id': transactionId,
        'X-Target-Environment': MTN_TARGET_ENVIRONMENT,
        'Ocp-Apim-Subscription-Key': MTN_SUBSCRIPTION_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const payData = await payRes.json()

    // Save transaction to database
    try {
      await supabase.from('transactions').insert({
        id: transactionId,
        user_id: userId,
        product_id: productId,
        amount,
        phone: msisdn,
        reference,
        status: 'pending',
        provider: 'mtn',
        created_at: new Date().toISOString(),
      })
    } catch (e) {
      // continue even if DB save fails
      console.error('Failed saving transaction:', e)
    }

    return NextResponse.json({ ok: payRes.ok, transactionId, data: payData })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
