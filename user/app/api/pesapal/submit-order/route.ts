import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'
import { registerPesapalIPN, submitPesapalOrder } from '../../../../lib/pesapal'
import { checkRateLimit, getClientIp } from '../../../../lib/rateLimit'

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const { allowed, retryAfterSeconds } = await checkRateLimit(`pesapal:${ip}`, 5, 60)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many payment attempts. Please wait a moment and try again.' },
      { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } }
    )
  }

  try {
    const body = await req.json()
    const { amount, phone, productId, description } = body

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ error: 'A valid amount is required' }, { status: 400 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `https://${req.headers.get('host')}`
    const callbackUrl = `${siteUrl}/checkout/success`
    const notificationUrl = `${siteUrl}/api/pesapal/ipn`

    const notificationId = await registerPesapalIPN(notificationUrl)

    const reference = `lcc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    const order = await submitPesapalOrder({
      id: reference,
      amount: Number(amount),
      currency: 'UGX',
      description: description || 'Link Communications Center purchase',
      callbackUrl,
      notificationId,
      phoneNumber: phone || '',
    })

    // Record the attempt immediately so it shows up even if the customer
    // never completes payment on Pesapal's hosted page.
    const { error: dbError } = await supabase.from('transactions').insert({
      id: order.order_tracking_id,
      product_id: productId || null,
      amount: Number(amount),
      phone: phone || '',
      reference,
      provider: 'pesapal',
      status: 'pending',
    })

    if (dbError) {
      console.error('Failed to record Pesapal transaction:', dbError)
      // Don't block the payment flow over a logging failure - the customer
      // can still complete payment; we just won't have a local record until
      // the IPN callback fires.
    }

    return NextResponse.json({
      redirectUrl: order.redirect_url,
      orderTrackingId: order.order_tracking_id,
      reference,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Pesapal submit-order error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
