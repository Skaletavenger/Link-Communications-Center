import { NextResponse } from 'next/server'
import { supabase } from '../../../../../lib/supabase'

export async function GET(req: Request, { params }: { params: { transactionId: string } }) {
  try {
    const { transactionId } = params
    if (!transactionId) {
      return NextResponse.json({ error: 'Missing transactionId' }, { status: 400 })
    }

    const MTN_USER_ID = process.env.MTN_COLLECTION_USER_ID
    const MTN_API_KEY = process.env.MTN_COLLECTION_API_KEY
    const MTN_SUBSCRIPTION_KEY = process.env.MTN_COLLECTION_SUBSCRIPTION_KEY

    if (!MTN_USER_ID || !MTN_API_KEY || !MTN_SUBSCRIPTION_KEY) {
      return NextResponse.json({ error: 'MTN credentials not configured' }, { status: 500 })
    }

    // Get OAuth2 token
    const credentials = Buffer.from(`${MTN_USER_ID}:${MTN_API_KEY}`).toString('base64')
    const tokenRes = await fetch('https://sandbox.momodeveloper.mtn.com/collection/token/', {
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

    // Get transaction status from MTN
    const statusRes = await fetch(
      `https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay/${encodeURIComponent(transactionId)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Target-Environment': 'sandbox',
          'Ocp-Apim-Subscription-Key': MTN_SUBSCRIPTION_KEY,
        },
      }
    )

    const statusData = await statusRes.json()
    const status = statusData.status || statusData.transaction?.status || null

    // Update transaction in database
    try {
      await supabase
        .from('transactions')
        .update({ status: status || 'unknown' })
        .eq('id', transactionId)
    } catch (e) {
      // continue even if DB update fails
      console.error('Failed updating transaction:', e)
    }

    return NextResponse.json({ ok: statusRes.ok, status, transactionId, data: statusData })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
