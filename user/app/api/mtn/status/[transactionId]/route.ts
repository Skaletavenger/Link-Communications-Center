import { NextResponse } from 'next/server'
import { supabase } from '../../../../../lib/supabase'

export async function GET(req: Request, { params }: { params: { transactionId: string } }) {
  try {
    const { transactionId } = params
    if (!transactionId) {
      return NextResponse.json({ error: 'Missing transactionId' }, { status: 400 })
    }

    // Support both naming conventions - the ones actually set in Vercel
    // (MTN_API_USER etc.) and the original MTN_COLLECTION_* names, so this
    // works regardless of which was used when the env vars were added.
    const MTN_USER_ID = process.env.MTN_API_USER || process.env.MTN_COLLECTION_USER_ID
    const MTN_API_KEY = process.env.MTN_API_KEY || process.env.MTN_COLLECTION_API_KEY
    const MTN_SUBSCRIPTION_KEY = process.env.MTN_SUBSCRIPTION_KEY || process.env.MTN_COLLECTION_SUBSCRIPTION_KEY

    if (!MTN_USER_ID || !MTN_API_KEY || !MTN_SUBSCRIPTION_KEY) {
      return NextResponse.json({ error: 'MTN credentials not configured' }, { status: 500 })
    }

    // MTN_BASE_URL and MTN_TARGET_ENVIRONMENT let this switch from sandbox to
    // production once MTN approves production Collections API access —
    // previously this was hardcoded to the sandbox URL permanently.
    const MTN_BASE_URL = process.env.MTN_BASE_URL || 'https://sandbox.momodeveloper.mtn.com'
    const MTN_TARGET_ENVIRONMENT = process.env.MTN_ENVIRONMENT || process.env.MTN_TARGET_ENVIRONMENT || 'sandbox'

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

    // Get transaction status from MTN
    const statusRes = await fetch(
      `${MTN_BASE_URL}/collection/v1_0/requesttopay/${encodeURIComponent(transactionId)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Target-Environment': MTN_TARGET_ENVIRONMENT,
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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
