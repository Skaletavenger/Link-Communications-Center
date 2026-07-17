import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabase } from '../../../../lib/supabase'
import { getPesapalTransactionStatus, refundPesapalTransaction } from '../../../../lib/pesapal'

// Admin-only refund endpoint, called from the admin dashboard (different
// subdomain, hence the CORS handling). The caller must send their Supabase
// access token; we verify it belongs to a registered admin via is_admin().

const ALLOWED_ORIGIN_SUFFIXES = ['linkcommunicationscenter.com', '.vercel.app']

function corsHeaders(req: NextRequest) {
  const origin = req.headers.get('origin') || ''
  let allow = ''
  try {
    const host = new URL(origin).hostname
    if (ALLOWED_ORIGIN_SUFFIXES.some(s => host === s || host.endsWith(s))) allow = origin
  } catch {
    /* no/invalid origin (same-origin or server-to-server) */
  }
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req) })
}

export async function POST(req: NextRequest) {
  const headers = corsHeaders(req)
  try {
    const authHeader = req.headers.get('authorization') || ''
    const jwt = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
    if (!jwt) {
      return NextResponse.json({ error: 'Missing authorization token' }, { status: 401, headers })
    }

    const asCaller = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${jwt}` } }, auth: { persistSession: false, autoRefreshToken: false } }
    )

    const { data: userData, error: userError } = await asCaller.auth.getUser(jwt)
    if (userError || !userData?.user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401, headers })
    }
    const { data: isAdmin, error: adminError } = await asCaller.rpc('is_admin')
    if (adminError || !isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403, headers })
    }

    const body = await req.json()
    const orderTrackingId = typeof body.orderTrackingId === 'string' ? body.orderTrackingId : ''
    const providedCode = typeof body.confirmationCode === 'string' ? body.confirmationCode.trim() : ''
    const remarks = typeof body.remarks === 'string' && body.remarks.trim() ? body.remarks.trim() : 'Customer order cancelled'
    if (!orderTrackingId) {
      return NextResponse.json({ error: 'orderTrackingId is required' }, { status: 400, headers })
    }

    const { data: row, error: rowError } = await supabase
      .from('transactions')
      .select('id, amount, status')
      .eq('id', orderTrackingId)
      .maybeSingle()
    if (rowError || !row) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404, headers })
    }
    if (row.status !== 'completed') {
      return NextResponse.json(
        { error: `Only completed (paid) orders can be refunded. This order is "${row.status}".` },
        { status: 400, headers }
      )
    }

    let confirmationCode = providedCode
    if (!confirmationCode) {
      try {
        const status = await getPesapalTransactionStatus(orderTrackingId)
        confirmationCode = status.confirmation_code
      } catch {
        return NextResponse.json(
          { error: 'Could not look up the payment confirmation code from Pesapal for this order.' },
          { status: 400, headers }
        )
      }
    }
    if (!confirmationCode) {
      return NextResponse.json({ error: 'No payment confirmation code available for this order.' }, { status: 400, headers })
    }

    const result = await refundPesapalTransaction({
      confirmationCode,
      amount: Number(row.amount),
      username: userData.user.email || 'admin',
      remarks,
    })

    await supabase
      .from('transactions')
      .update({ status: 'refund_requested', updated_at: new Date().toISOString() })
      .eq('id', orderTrackingId)

    return NextResponse.json(
      { ok: true, message: result.message || 'Refund request submitted to Pesapal for review.' },
      { headers }
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Pesapal refund error:', message)
    return NextResponse.json({ error: message }, { status: 500, headers })
  }
}
