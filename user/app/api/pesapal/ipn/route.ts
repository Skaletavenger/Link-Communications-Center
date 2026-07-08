import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'
import { getPesapalTransactionStatus } from '../../../../lib/pesapal'

// Pesapal calls this endpoint (GET, per our IPN registration) whenever a
// transaction's status changes. We look up the real status from Pesapal
// directly (never trust the query params alone) and update our own
// transactions table to match.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const orderTrackingId = searchParams.get('OrderTrackingId') || searchParams.get('orderTrackingId')
  const orderMerchantReference = searchParams.get('OrderMerchantReference') || searchParams.get('orderMerchantReference')

  if (!orderTrackingId) {
    return NextResponse.json({ error: 'Missing OrderTrackingId' }, { status: 400 })
  }

  try {
    const statusData = await getPesapalTransactionStatus(orderTrackingId)

    const statusMap: Record<number, string> = {
      0: 'invalid',
      1: 'completed',
      2: 'failed',
      3: 'reversed',
    }
    const mappedStatus = statusMap[statusData.status_code] ?? 'pending'

    const { error: dbError } = await supabase
      .from('transactions')
      .update({
        status: mappedStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderTrackingId)

    if (dbError) {
      console.error('Failed to update transaction from Pesapal IPN:', dbError)
    }

    // Pesapal expects this exact response shape to acknowledge the IPN.
    return NextResponse.json({
      orderNotificationType: 'IPNCHANGE',
      orderTrackingId,
      orderMerchantReference: orderMerchantReference || statusData.merchant_reference,
      status: 200,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Pesapal IPN handling error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
