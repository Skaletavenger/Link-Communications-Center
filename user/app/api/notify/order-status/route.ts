import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

// Admin-only notification endpoint, called from the admin dashboard after an
// order's status changes. Mirrors the refund endpoint's CORS + auth pattern.

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

type OrderRow = {
  id: string
  reference: string | null
  customer_name: string | null
  customer_email: string | null
  status: string | null
  fulfillment_status: string | null
  delivery_method: string | null
  delivery_note: string | null
}

function orderMessage(o: OrderRow): { subject: string; text: string } {
  const ref = o.reference || o.id
  const first = o.customer_name ? o.customer_name.split(' ')[0] : 'there'
  let line: string
  if (o.status === 'cancelled') {
    line = 'Your order has been cancelled. You have not been charged. If this was unexpected, please contact us.'
  } else if (o.status === 'reversed') {
    line = 'Your refund has been processed and the money will return to your original payment method.'
  } else if (o.status === 'refund_requested') {
    line = 'Your refund request has been submitted to Pesapal and is being processed.'
  } else if (o.status === 'pending') {
    line = 'Your payment is still pending. Please complete the payment so we can start processing your order.'
  } else {
    const f = o.fulfillment_status || 'received'
    if (f === 'processing') line = 'Good news - your order is now being processed.'
    else if (f === 'ready_for_pickup') line = 'Your order is ready for pickup at Lions Shopping Center, Namirembe Road, Kampala (Mon-Sat, 9:00 AM - 6:00 PM).'
    else if (f === 'out_for_delivery') line = 'Your order is out for delivery within Kampala. Please keep your phone available - our rider will call you.'
    else if (f === 'completed') line = o.delivery_method === 'pickup' ? 'Your order has been picked up. Thank you for shopping with us!' : 'Your order has been delivered. Thank you for shopping with us!'
    else line = 'We have received your order and will keep you updated as it progresses.'
  }
  const note = o.delivery_note ? '\n\nNote from our team: ' + o.delivery_note : ''
  const text =
    'Hello ' + first + ',\n\n' + line + note +
    '\n\nOrder reference: ' + ref +
    '\nTrack your order any time: https://linkcommunicationscenter.com/track' +
    '\n\nLink Communications Center\nLions Shopping Center, Namirembe Road, Kampala\nWhatsApp / Call: +256 757 837184'
  return { subject: 'Update on your order ' + ref + ' - Link Communications Center', text }
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
    const orderId = typeof body.orderId === 'string' ? body.orderId : ''
    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400, headers })
    }

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      return NextResponse.json({ skipped: 'Email not configured (set GMAIL_USER and GMAIL_APP_PASSWORD)' }, { status: 200, headers })
    }

    const { data: order, error: orderError } = await asCaller
      .from('transactions')
      .select('id, reference, customer_name, customer_email, status, fulfillment_status, delivery_method, delivery_note')
      .eq('id', orderId)
      .single()
    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404, headers })
    }
    if (!order.customer_email) {
      return NextResponse.json({ skipped: 'Order has no customer email' }, { status: 200, headers })
    }

    const { subject, text } = orderMessage(order as OrderRow)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
    })
    await transporter.sendMail({
      from: `"Link Communications Center" <${process.env.GMAIL_USER}>`,
      to: order.customer_email,
      subject,
      text,
    })
    return NextResponse.json({ sent: true }, { status: 200, headers })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500, headers })
  }
}
