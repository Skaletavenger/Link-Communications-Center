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
  created_at: string
}

const FILTERS = ['all', 'pending', 'completed', 'failed', 'reversed'] as const

function formatUGX(n: number | null) {
  return 'UGX ' + Number(n || 0).toLocaleString()
}

function statusStyle(status: string | null): { bg: string; color: string } {
  switch (status) {
    case 'completed':
      return { bg: 'rgba(22,163,74,0.15)', color: '#16a34a' }
    case 'pending':
      return { bg: 'rgba(217,119,6,0.15)', color: '#d97706' }
    case 'failed':
    case 'invalid':
      return { bg: 'rgba(220,38,38,0.15)', color: '#dc2626' }
    case 'reversed':
      return { bg: 'rgba(100,116,139,0.18)', color: '#64748b' }
    default:
      return { bg: 'rgba(100,116,139,0.18)', color: '#64748b' }
  }
}

function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [productNames, setProductNames] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
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

  const filtered = useMemo(
    () => (filter === 'all' ? orders : orders.filter(o => (o.status || 'pending') === filter)),
    [orders, filter]
  )

  const stats = useMemo(() => {
    const completed = orders.filter(o => o.status === 'completed')
    return {
      total: orders.length,
      completed: completed.length,
      pending: orders.filter(o => (o.status || 'pending') === 'pending').length,
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
            <p className="text-sm text-muted mt-1">Track customer orders and their payment status.</p>
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
              {f}
            </button>
          ))}
        </div>

        {error && (
          <div className="rounded-2xl border-l-4 border-red-500 bg-red-50 p-4 text-sm text-red-700 mb-4">
            Could not load orders: {error}
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
            No orders {filter !== 'all' ? `with status "${filter}"` : 'yet'}.
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
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => {
                  const ss = statusStyle(o.status)
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
                          className="inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize"
                          style={{ background: ss.bg, color: ss.color }}
                        >
                          {o.status || 'pending'}
                        </span>
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
            Showing {filtered.length} order{filtered.length === 1 ? '' : 's'}. Statuses update automatically when Pesapal confirms payment.
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
