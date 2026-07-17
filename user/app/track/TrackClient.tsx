'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Search, MapPin, Store, Truck, ShoppingCart, Package, CheckCircle2 } from 'lucide-react'

type OrderRow = {
  id: string
  reference: string | null
  description: string | null
  amount: number | null
  phone: string | null
  provider: string | null
  status: string | null
  fulfillment_status: string | null
  delivery_method: string | null
  delivery_note: string | null
  created_at: string
}

type StepIcon = React.ComponentType<{ size?: number | string }>

const PICKUP_STEPS: Array<[string, string, StepIcon]> = [
  ['received', 'Order received', ShoppingCart],
  ['processing', 'Processing', Package],
  ['ready_for_pickup', 'Ready for pickup', Store],
  ['completed', 'Picked up', CheckCircle2],
]

const DELIVERY_STEPS: Array<[string, string, StepIcon]> = [
  ['received', 'Order received', ShoppingCart],
  ['processing', 'Processing', Package],
  ['out_for_delivery', 'Out for delivery', Truck],
  ['completed', 'Delivered', CheckCircle2],
]

function formatUGX(n: number | null) {
  return 'UGX ' + Number(n || 0).toLocaleString()
}

function Timeline({ order }: { order: OrderRow }) {
  const steps = order.delivery_method === 'pickup' ? PICKUP_STEPS : DELIVERY_STEPS
  const current = order.fulfillment_status || 'received'
  let idx = steps.findIndex(([v]) => v === current)
  if (idx === -1) idx = current === 'completed' ? steps.length - 1 : 1

  return (
    <div className="mt-6 flex items-start">
      {steps.map(([v, label, Icon], i) => {
        const done = i < idx
        const active = i === idx
        return (
          <div key={v} className="flex-1 flex flex-col items-center relative">
            {i > 0 && (
              <div
                className="absolute top-7 right-1/2 w-full h-0.5"
                style={{ background: i <= idx ? 'var(--color-primary)' : 'var(--border)' }}
              />
            )}
            <div
              className="w-14 h-14 rounded-full z-10 flex items-center justify-center transition-colors"
              style={
                active
                  ? { background: 'var(--color-primary)', border: '2px solid var(--color-primary)', color: '#ffffff' }
                  : done
                    ? { background: 'var(--bg-card)', border: '2px solid var(--color-primary)', color: 'var(--color-primary)' }
                    : { background: 'var(--bg-card)', border: '2px solid var(--border)', color: 'var(--text-muted)' }
              }
            >
              <Icon size={22} />
            </div>
            <span
              className="mt-3 text-xs md:text-sm font-semibold text-center leading-tight px-1"
              style={{ color: i <= idx ? 'var(--text-primary)' : 'var(--text-muted)' }}
            >
              {label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function OrderCard({ order }: { order: OrderRow }) {
  const paid = order.status === 'completed'
  const failed = ['failed', 'invalid', 'cancelled', 'reversed'].includes(order.status || '')

  return (
    <div className="rounded-2xl border p-5" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{order.description || 'Order'}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Ref: {order.reference || order.id} · {new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>
        <p className="font-bold" style={{ color: 'var(--color-primary)' }}>{formatUGX(order.amount)}</p>
      </div>

      {paid ? (
        <>
          <Timeline order={order} />
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm" style={{ color: 'var(--text-muted)' }}>
            {order.delivery_method === 'pickup' && (
              <span className="inline-flex items-center gap-1.5"><Store size={15} /> Pickup: Lions Shopping Center, Namirembe Road, Kampala</span>
            )}
            {order.delivery_method === 'delivery' && (
              <span className="inline-flex items-center gap-1.5"><Truck size={15} /> Delivery within Kampala</span>
            )}
            {!order.delivery_method && (
              <span className="inline-flex items-center gap-1.5"><MapPin size={15} /> Delivery option being confirmed — we will contact you</span>
            )}
          </div>
          {order.delivery_note && (
            <p className="mt-2 text-sm rounded-xl px-3 py-2" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
              {order.delivery_note}
            </p>
          )}
        </>
      ) : (
        <p className="mt-3 text-sm font-semibold" style={{ color: failed ? '#dc2626' : '#d97706' }}>
          {failed ? 'Payment ' + (order.status === 'reversed' ? 'refunded' : order.status) + ' — this order is not being processed.' : 'Awaiting payment confirmation. Complete the payment to start processing.'}
        </p>
      )}
    </div>
  )
}

export default function TrackClient() {
  const [input, setInput] = useState('')
  const [results, setResults] = useState<OrderRow[] | null>(null)
  const [searching, setSearching] = useState(false)
  const [myOrders, setMyOrders] = useState<OrderRow[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user
      if (!user) return
      const parts = ['user_id.eq.' + user.id]
      if (user.email) parts.push('customer_email.eq.' + user.email)
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('archived', false)
        .or(parts.join(','))
        .order('created_at', { ascending: false })
        .limit(20)
      if (data) setMyOrders(data as OrderRow[])
    })
  }, [])

  async function search(e?: React.FormEvent) {
    e?.preventDefault()
    const q = input.trim()
    if (!q) return
    setSearching(true)
    setError('')
    setResults(null)
    const digits = q.replace(/[^0-9]/g, '')
    let query = supabase.from('transactions').select('*').eq('archived', false).order('created_at', { ascending: false }).limit(20)
    if (digits.length >= 9) {
      query = query.or('reference.eq.' + q + ',phone.like.%' + digits.slice(-9))
    } else {
      query = query.eq('reference', q)
    }
    const { data, error } = await query
    if (error) setError(error.message)
    setResults((data || []) as OrderRow[])
    setSearching(false)
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-3xl mx-auto pt-28 pb-16 px-6">
        <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Track Your Order</h1>
        <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
          Enter your order reference (from your payment confirmation) or the phone number you paid with.
        </p>

        <form onSubmit={search} className="flex gap-2 mb-10">
          <input
            className="flex-1 rounded-xl px-4 py-3 outline-none border"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            placeholder="e.g. lcc-1784279731872-csf6jd or 0759248589"
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button
            type="submit"
            disabled={searching}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold text-white disabled:opacity-60"
            style={{ background: 'var(--color-primary)' }}
          >
            <Search size={16} /> {searching ? 'Searching…' : 'Track'}
          </button>
        </form>

        {error && <p className="mb-6 text-sm text-red-600">{error}</p>}

        {results !== null && (
          <div className="mb-12">
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Search results</h2>
            {results.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                No orders found. Double-check the reference or phone number, or contact us on WhatsApp: +256 757 837184.
              </p>
            ) : (
              <div className="space-y-4">{results.map(o => <OrderCard key={o.id} order={o} />)}</div>
            )}
          </div>
        )}

        {myOrders.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>My Orders</h2>
            <div className="space-y-4">{myOrders.map(o => <OrderCard key={o.id} order={o} />)}</div>
          </div>
        )}
      </div>
    </div>
  )
}
