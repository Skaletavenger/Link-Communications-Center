'use client'
import AdminGuard from '../../lib/AdminGuard'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { RefreshCw } from 'lucide-react'

type Order = {
  id: string
  reference: string | null
  product_id: string | null
  description: string | null
  amount: number | null
  phone: string | null
  customer_name: string | null
  customer_email: string | null
  provider: string | null
  status: string | null
  fulfillment_status: string | null
  delivery_method: string | null
  delivery_note: string | null
  archived: boolean | null
  delivery_zone: string | null
  delivery_fee: number | null
  delivery_speed: string | null
  delivery_address: string | null
  created_at: string
}

const REFUND_ENDPOINT = 'https://linkcommunicationscenter.com/api/pesapal/refund'
const NOTIFY_ENDPOINT = 'https://linkcommunicationscenter.com/api/notify/order-status'

const FILTERS = ['all', 'pending', 'completed', 'refund_requested', 'reversed', 'cancelled', 'failed', 'binned'] as const

const STATUS_LABELS: Record<string, string> = {
  refund_requested: 'Refund requested',
  reversed: 'Refunded',
}

function statusLabel(status: string | null) {
  const s = status || 'pending'
  return STATUS_LABELS[s] || s
}

const FULFILLMENT_OPTIONS: Array<[string, string]> = [
  ['received', 'Order received'],
  ['processing', 'Processing'],
  ['ready_for_pickup', 'Ready for pickup'],
  ['out_for_delivery', 'Out for delivery'],
  ['completed', 'Completed'],
]

function formatUGX(n: number | null) {
  return 'UGX ' + Number(n || 0).toLocaleString()
}

function statusStyle(status: string | null): { bg: string; color: string } {
  switch (status) {
    case 'completed':
      return { bg: 'rgba(22,163,74,0.15)', color: '#16a34a' }
    case 'pending':
      return { bg: 'rgba(217,119,6,0.15)', color: '#d97706' }
    case 'refund_requested':
      return { bg: 'rgba(147,51,234,0.15)', color: '#9333ea' }
    case 'failed':
    case 'invalid':
      return { bg: 'rgba(220,38,38,0.15)', color: '#dc2626' }
    case 'cancelled':
    case 'reversed':
      return { bg: 'rgba(100,116,139,0.18)', color: '#64748b' }
    default:
      return { bg: 'rgba(100,116,139,0.18)', color: '#64748b' }
  }
}

function waMessage(o: Order): string {
  const ref = o.reference || o.id
  const name = o.customer_name ? ' ' + o.customer_name.split(' ')[0] : ''
  const base = `Hello${name}, this is Link Communications Center regarding your order ${ref}. `
  if (o.status === 'cancelled') return base + 'Your order has been cancelled and you have not been charged. Contact us if you have any questions.'
  if (o.status === 'reversed') return base + 'Your refund has been processed and will return to your original payment method.'
  if (o.status === 'refund_requested') return base + 'Your refund request has been submitted to Pesapal and is being processed.'
  if (o.status === 'pending') return base + 'Your payment is still pending. Please complete it so we can start processing your order.'
  const f = o.fulfillment_status || 'received'
  if (f === 'processing') return base + 'Your order is now being processed.'
  if (f === 'ready_for_pickup') return base + 'Your order is ready for pickup at Lions Shopping Center, Namirembe Road, Kampala (Mon-Sat 9AM-6PM).'
  if (f === 'out_for_delivery') return base + 'Your order is out for delivery within Kampala. Please keep your phone available.'
  if (f === 'completed') return base + (o.delivery_method === 'pickup' ? 'Your order has been picked up. Thank you for shopping with us!' : 'Your order has been delivered. Thank you for shopping with us!')
  return base + 'We have received your order and will keep you updated. Track it any time: https://linkcommunicationscenter.com/track'
}

function waLink(o: Order): string {
  const digits = (o.phone || '').replace(/[^0-9]/g, '')
  const intl = digits.startsWith('256') ? digits : digits.startsWith('0') ? '256' + digits.slice(1) : digits
  return 'https://wa.me/' + intl + '?text=' + encodeURIComponent(waMessage(o))
}

function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [productNames, setProductNames] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('all')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    const rows = (data || []) as Order[]
    setOrders(rows)

    const ids = Array.from(
      new Set(rows.map(r => r.product_id).filter((x): x is string => !!x && x !== 'cart'))
    )
    if (ids.length) {
      const { data: prods } = await supabase.from('products').select('id, name').in('id', ids)
      const map: Record<string, string> = {}
      ;(prods || []).forEach((p: { id: string; name: string }) => {
        map[p.id] = p.name
      })
      setProductNames(map)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const notifyEmail = useCallback(async (orderId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      await fetch(NOTIFY_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ orderId }),
      })
    } catch {
      /* best-effort - WhatsApp button remains the manual fallback */
    }
  }, [])

  const cancelOrder = useCallback(async (o: Order) => {
    if (!window.confirm(`Cancel this order (${formatUGX(o.amount)} from ${o.customer_name || o.phone || 'customer'})? The customer has not paid, so no refund is needed.`)) return
    setBusyId(o.id)
    setNotice('')
    setError('')
    const { error } = await supabase
      .from('transactions')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', o.id)
    if (error) {
      setError(`Could not cancel order: ${error.message}`)
    } else {
      setNotice('Order cancelled.')
      notifyEmail(o.id)
      await load()
    }
    setBusyId(null)
  }, [load])

  const updateFulfillment = useCallback(async (o: Order, patch: { fulfillment_status?: string; delivery_method?: string }) => {
    setBusyId(o.id)
    setNotice('')
    setError('')
    const { error } = await supabase
      .from('transactions')
      .update({ ...patch, fulfillment_updated_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', o.id)
    if (error) {
      setError(`Could not update delivery status: ${error.message}`)
    } else {
      setNotice('Delivery status updated - the customer can see this on the Track Order page.')
      if (patch.fulfillment_status) notifyEmail(o.id)
      await load()
    }
    setBusyId(null)
  }, [load])

  const setArchived = useCallback(async (o: Order, archived: boolean) => {
    setBusyId(o.id)
    setNotice('')
    setError('')
    const { error } = await supabase
      .from('transactions')
      .update({ archived, updated_at: new Date().toISOString() })
      .eq('id', o.id)
    if (error) {
      setError(`Could not update order: ${error.message}`)
    } else {
      setNotice(archived ? 'Order moved to bin. Find it under the Binned filter.' : 'Order restored.')
      await load()
    }
    setBusyId(null)
  }, [load])

  const refundOrder = useCallback(async (o: Order) => {
    if (!window.confirm(`Request a refund of ${formatUGX(o.amount)} to ${o.customer_name || o.phone || 'the customer'}? Pesapal will review the request and return the money to their original payment method.`)) return
    setBusyId(o.id)
    setNotice('')
    setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('Your session expired - please log in again.')
        setBusyId(null)
        return
      }
      // Backfilled orders keep their payment code in the description.
      const codeMatch = (o.description || '').match(/payment code (\w+)/i)
      const res = await fetch(REFUND_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          orderTrackingId: o.id,
          confirmationCode: codeMatch ? codeMatch[1] : undefined,
          remarks: 'Order cancelled by customer',
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Refund request failed.')
      } else {
        setNotice(data.message || 'Refund request submitted to Pesapal.')
        notifyEmail(o.id)
        await load()
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
    }
    setBusyId(null)
  }, [load])

  const filtered = useMemo(() => {
    if (filter === 'binned') return orders.filter(o => o.archived)
    const visible = orders.filter(o => !o.archived)
    return filter === 'all' ? visible : visible.filter(o => (o.status || 'pending') === filter)
  }, [orders, filter])

  const stats = useMemo(() => {
    const visible = orders.filter(o => !o.archived)
    const completed = visible.filter(o => o.status === 'completed')
    return {
      total: visible.length,
      completed: completed.length,
      pending: visible.filter(o => (o.status || 'pending') === 'pending').length,
      revenue: completed.reduce((s, o) => s + Number(o.amount || 0), 0),
    }
  }, [orders])

  function productLabel(o: Order) {
    if (o.description) return o.description
    if (o.product_id === 'cart') return 'Cart order'
    if (o.product_id && productNames[o.product_id]) return productNames[o.product_id]
    return o.product_id || '—'
  }

  return (
    <main className="min-h-screen bg-primary pt-24 px-6 pb-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary">Orders</h1>
            <p className="text-sm text-muted mt-1">Track customer orders, cancel unpaid ones, and refund paid ones.</p>
          </div>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: '#1574B5' }}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total orders', value: String(stats.total) },
            { label: 'Completed', value: String(stats.completed) },
            { label: 'Pending', value: String(stats.pending) },
            { label: 'Revenue (paid)', value: formatUGX(stats.revenue) },
          ].map(card => (
            <div key={card.label} className="rounded-2xl bg-card border border-theme p-4">
              <p className="text-xs text-muted">{card.label}</p>
              <p className="text-xl font-bold text-primary mt-1">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {FILTERS.map(f => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-xl text-sm font-semibold border capitalize transition"
              style={
                filter === f
                  ? { background: '#1574B5', color: '#fff', borderColor: 'transparent' }
                  : { background: 'transparent', color: 'var(--text-primary, #111)', borderColor: 'rgba(120,120,120,0.3)' }
              }
            >
              {f === 'refund_requested' ? 'Refund requested' : f === 'reversed' ? 'Refunded' : f}
            </button>
          ))}
        </div>

        {error && (
          <div className="rounded-2xl border-l-4 border-red-500 bg-red-50 p-4 text-sm text-red-700 mb-4">
            {error}
          </div>
        )}
        {notice && (
          <div className="rounded-2xl border-l-4 border-green-500 bg-green-50 p-4 text-sm text-green-700 mb-4">
            {notice}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-card border border-theme animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl bg-card border border-theme p-10 text-center text-muted">
            No orders {filter !== 'all' ? `with status "${statusLabel(filter)}"` : 'yet'}.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl bg-card border border-theme">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted border-b border-theme">
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Method</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Delivery</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => {
                  const ss = statusStyle(o.status)
                  const busy = busyId === o.id
                  return (
                    <tr key={o.id} className="border-b border-theme last:border-0 align-top">
                      <td className="px-4 py-3 text-secondary whitespace-nowrap">
                        {new Date(o.created_at).toLocaleString('en-GB', {
                          day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3 text-primary">
                        <div className="font-medium">{o.customer_name || '—'}</div>
                        {o.phone && <div className="text-xs text-muted">{o.phone}</div>}
                        {o.customer_email && <div className="text-xs text-muted">{o.customer_email}</div>}
                      </td>
                      <td className="px-4 py-3 text-primary max-w-xs">{productLabel(o)}</td>
                      <td className="px-4 py-3 font-semibold whitespace-nowrap" style={{ color: '#1574B5' }}>{formatUGX(o.amount)}</td>
                      <td className="px-4 py-3 text-secondary capitalize">{o.provider || '—'}</td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
                          style={{ background: ss.bg, color: ss.color }}
                        >
                          {statusLabel(o.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {o.delivery_method === 'delivery' && (o.delivery_zone || o.delivery_address) && (
                          <div className="mb-2 text-xs" style={{ maxWidth: 190 }}>
                            <div className="font-semibold text-primary">{o.delivery_speed === 'express' ? '⚡ Express · ' : ''}{o.delivery_zone || 'Delivery'}</div>
                            {o.delivery_address && <div className="text-muted">{o.delivery_address}</div>}
                            {typeof o.delivery_fee === 'number' && o.delivery_fee > 0 && <div className="text-muted">Fee: {formatUGX(o.delivery_fee)}</div>}
                          </div>
                        )}
                        {o.status === 'completed' ? (
                          <div className="space-y-1" style={{ minWidth: 150 }}>
                            <select
                              value={o.fulfillment_status || 'received'}
                              disabled={busy}
                              onChange={e => updateFulfillment(o, { fulfillment_status: e.target.value })}
                              className="block w-full rounded-lg border px-2 py-1 text-xs"
                              style={{ background: 'transparent', color: 'var(--text-primary, #111)', borderColor: 'rgba(120,120,120,0.3)' }}
                            >
                              {FULFILLMENT_OPTIONS.map(([v, l]) => (
                                <option key={v} value={v}>{l}</option>
                              ))}
                            </select>
                            <select
                              value={o.delivery_method || ''}
                              disabled={busy}
                              onChange={e => e.target.value && updateFulfillment(o, { delivery_method: e.target.value })}
                              className="block w-full rounded-lg border px-2 py-1 text-xs"
                              style={{ background: 'transparent', color: 'var(--text-primary, #111)', borderColor: 'rgba(120,120,120,0.3)' }}
                            >
                              <option value="">Method…</option>
                              <option value="pickup">Pickup at shop</option>
                              <option value="delivery">Kampala delivery</option>
                            </select>
                          </div>
                        ) : (
                          <span className="text-xs text-muted">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {o.status === 'pending' && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => cancelOrder(o)}
                            className="rounded-lg px-3 py-1.5 text-xs font-semibold border transition hover:opacity-80 disabled:opacity-50"
                            style={{ color: '#dc2626', borderColor: 'rgba(220,38,38,0.4)' }}
                          >
                            {busy ? 'Cancelling…' : 'Cancel'}
                          </button>
                        )}
                        {o.status === 'completed' && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => refundOrder(o)}
                            className="rounded-lg px-3 py-1.5 text-xs font-semibold border transition hover:opacity-80 disabled:opacity-50"
                            style={{ color: '#9333ea', borderColor: 'rgba(147,51,234,0.4)' }}
                          >
                            {busy ? 'Requesting…' : 'Refund'}
                          </button>
                        )}
                        {o.phone && (
                          <a
                            href={waLink(o)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 inline-block rounded-lg px-3 py-1.5 text-xs font-semibold border transition hover:opacity-80"
                            style={{ color: '#16a34a', borderColor: 'rgba(22,163,74,0.4)' }}
                          >
                            WhatsApp
                          </a>
                        )}
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => setArchived(o, !o.archived)}
                          className="ml-2 rounded-lg px-3 py-1.5 text-xs font-semibold border transition hover:opacity-80 disabled:opacity-50"
                          style={{ color: '#64748b', borderColor: 'rgba(100,116,139,0.4)' }}
                        >
                          {busy ? '…' : o.archived ? 'Restore' : 'Bin'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <p className="text-xs text-muted mt-3">
            Showing {filtered.length} order{filtered.length === 1 ? '' : 's'}. Cancel is for unpaid (pending) orders; Refund sends a request to Pesapal for paid orders and the money returns to the customer&apos;s payment method once approved. Bin hides an order from this list and from customer tracking — restore it any time under the Binned filter.
          </p>
        )}
      </div>
    </main>
  )
}

export default function OrdersPageProtected() {
  return (
    <AdminGuard>
      <OrdersPage />
    </AdminGuard>
  )
}
