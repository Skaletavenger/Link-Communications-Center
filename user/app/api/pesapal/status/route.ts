import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'
import { getPesapalTransactionStatus } from '../../../../lib/pesapal'

// Used by the frontend (checkout success page) to poll/confirm the final
// status after the customer returns from Pesapal's hosted payment page.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const orderTrackingId = searchParams.get('orderTrackingId')

  if (!orderTrackingId) {
    return NextResponse.json({ error: 'Missing orderTrackingId' }, { status: 400 })
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

    // Keep our own record in sync too, in case the IPN callback hasn't
    // landed yet (IPN and the customer's browser redirect can race).
    await supabase
      .from('transactions')
      .update({ status: mappedStatus, updated_at: new Date().toISOString() })
      .eq('id', orderTrackingId)

    return NextResponse.json({
      status: mappedStatus,
      amount: statusData.amount,
      currency: statusData.currency,
      paymentMethod: statusData.payment_method,
      confirmationCode: statusData.confirmation_code,
      merchantReference: statusData.merchant_reference,
      description: statusData.payment_status_description,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Pesapal status-check error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
