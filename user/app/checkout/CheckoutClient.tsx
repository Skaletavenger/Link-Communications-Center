'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useCart } from '@/lib/CartContext'

function parsePositiveNumber(value: string | null, fallback: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

type LineItem = { id: string; name: string; price: number; quantity: number }

export default function CheckoutClient() {
  const searchParams = useSearchParams()
  const { items: cartItems } = useCart()
  const [phone, setPhone] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // "Buy now" links pass a single product via query params. When those are
  // absent we fall back to the shopping cart (the "Proceed to Checkout" flow).
  const queryName = searchParams.get('name')?.trim() || ''
  const singleMode = Boolean(queryName)
  const queryProductId = searchParams.get('productId') || 'unknown'
  const queryUnitPrice = parsePositiveNumber(searchParams.get('price'), 0)
  const queryQuantity = Math.max(1, parsePositiveNumber(searchParams.get('quantity'), 1))

  const lineItems: LineItem[] = useMemo(() => {
    if (singleMode) {
      return [{ id: queryProductId, name: queryName, price: queryUnitPrice, quantity: queryQuantity }]
    }
    return cartItems.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity }))
  }, [singleMode, queryProductId, queryName, queryUnitPrice, queryQuantity, cartItems])

  const totalAmount = useMemo(
    () => lineItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [lineItems]
  )
  const description = useMemo(
    () => lineItems.map(i => `${i.name} x${i.quantity}`).join(', '),
    [lineItems]
  )
  const orderProductId = singleMode ? queryProductId : lineItems.length === 1 ? lineItems[0].id : 'cart'
  const hasOrder = lineItems.length > 0 && totalAmount > 0

  const handlePay = async () => {
    setError(null)

    if (!hasOrder) {
      setError('Your order is empty.')
      return
    }
    if (!fullName.trim()) {
      setError('Please enter your full name.')
      return
    }
    if (!phone.trim()) {
      setError('Please enter your mobile money phone number.')
      return
    }
    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Please enter a valid email address or leave it empty.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/pesapal/submit-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalAmount,
          phone,
          name: fullName.trim(),
          email: email.trim(),
          productId: orderProductId,
          description,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Could not start payment. Please try again.')
        setLoading(false)
        return
      }
      window.location.href = data.redirectUrl
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
      setLoading(false)
    }
  }

  if (!hasOrder) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'var(--bg-primary)' }}>
        <div className="rounded-[28px] border p-10 text-center" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
          <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Your cart is empty
          </h1>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
            Add a product to your cart or pick one from a product page to continue.
          </p>
          <Link href="/products">
            <button type="button" className="rounded-2xl bg-[#1574B5] px-6 py-3 font-semibold text-white hover:opacity-90">
              Back to Products
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4" style={{ background: 'var(--bg-primary)' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="max-w-5xl mx-auto space-y-8"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Checkout
            </h1>
            <p style={{ color: 'var(--text-secondary)' }} className="mt-2">
              Review your order and pay with MTN MoMo or Airtel Money.
            </p>
          </div>
          <Link href="/products">
            <button type="button" className="rounded-2xl border px-5 py-3 text-sm font-semibold transition-all hover:bg-slate-50" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
              Back to products
            </button>
          </Link>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.3fr,0.95fr]">
          <div className="rounded-[32px] border p-6" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
            <div className="rounded-[28px] border p-6" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                Order summary
              </h2>

              <div className="space-y-4">
                {lineItems.map(item => (
                  <div key={item.id} className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-base font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>UGX {item.price.toLocaleString()} x {item.quantity}</p>
                    </div>
                    <p className="text-base font-semibold whitespace-nowrap" style={{ color: '#1574B5' }}>UGX {(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}

                <div className="border-t pt-4 flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total</p>
                  <p className="text-3xl font-bold" style={{ color: '#1574B5' }}>UGX {totalAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-[28px] border p-6" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-card)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                Pay for your order
              </h2>

              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                Full name
              </label>
              <input
                type="text"
                title="Your full name"
                placeholder="e.g. John Mukasa"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full rounded-3xl border px-4 py-3 text-base outline-none transition-all mb-4"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              />

              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                Mobile money phone number
              </label>
              <input
                type="tel"
                title="Mobile money phone number"
                placeholder="0752123456"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full rounded-3xl border px-4 py-3 text-base outline-none transition-all"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              />
              <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                You&apos;ll choose MTN MoMo or Airtel Money and confirm payment on the next screen.
              </p>

              <label className="block text-sm font-semibold mb-2 mt-4" style={{ color: 'var(--text-secondary)' }}>
                Email (optional)
              </label>
              <input
                type="email"
                title="Email address for your receipt"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-3xl border px-4 py-3 text-base outline-none transition-all"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              />

              {error && (
                <div className="mt-4 rounded-2xl border-l-4 border-red-500 bg-red-50 p-4 text-sm" style={{ color: '#9b1c1c' }}>
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handlePay}
                disabled={loading}
                className="mt-6 w-full rounded-3xl py-4 text-base font-semibold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ background: '#1574B5' }}
              >
                {loading ? 'Redirecting to payment…' : `Pay UGX ${totalAmount.toLocaleString()}`}
              </button>
            </div>
          </div>

          <div className="rounded-[32px] border p-6" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
            <div className="p-6 rounded-[28px] border" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>
              <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Pay securely</p>
              <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                Review &amp; pay
              </h2>
              <p className="text-sm leading-7" style={{ color: 'var(--text-secondary)' }}>
                Choose MTN MoMo or Airtel Money on the next screen. Your payment is processed securely through Pesapal.
              </p>

              <div className="mt-8 space-y-4 rounded-[24px] border p-5" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-primary)' }}>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] mb-1" style={{ color: 'var(--text-secondary)' }}>Need help?</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Contact support from anywhere on the site if your payment fails or you need assistance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
