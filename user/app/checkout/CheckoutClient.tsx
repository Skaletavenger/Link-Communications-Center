'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'

function parsePositiveNumber(value: string | null, fallback: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export default function CheckoutClient() {
  const searchParams = useSearchParams()
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const productName = searchParams.get('name')?.trim() || ''
  const productId = searchParams.get('productId') || 'unknown'
  const unitPrice = parsePositiveNumber(searchParams.get('price'), 0)
  const quantity = Math.max(1, parsePositiveNumber(searchParams.get('quantity'), 1))
  const totalAmount = useMemo(() => unitPrice * quantity, [unitPrice, quantity])

  const handlePay = async () => {
    setError(null)

    if (!unitPrice) {
      setError('Product amount is missing or invalid.')
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
          productId,
          description: `${productName} x${quantity}`,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Could not start payment. Please try again.')
        setLoading(false)
        return
      }
      // Pesapal\'s hosted page lets the customer pick MTN MoMo or Airtel Money
      // and complete the payment there, then redirects back to our success page.
      window.location.href = data.redirectUrl
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
      setLoading(false)
    }
  }

  if (!productName || !unitPrice) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'var(--bg-primary)' }}>
        <div className="rounded-[28px] border p-10 text-center" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
          <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Checkout details missing
          </h1>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
            Please start from a product page and select a product to purchase.
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

              <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Product</p>
                    <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{productName}</p>
                  </div>
                  <div>
                    <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Unit price</p>
                    <p className="text-lg font-semibold" style={{ color: '#1574B5' }}>UGX {unitPrice.toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Quantity</p>
                    <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{quantity}</p>
                  </div>
                  <div>
                    <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Total</p>
                    <p className="text-3xl font-bold" style={{ color: '#1574B5' }}>UGX {totalAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-[28px] border p-6" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-card)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                Pay for your order
              </h2>

              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                Phone number (optional)
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
                Review & pay
              </h2>
              <p className="text-sm leading-7" style={{ color: 'var(--text-secondary)' }}>
                Choose MTN MoMo or Airtel Money on the next screen. Your payment is processed securely through Pesapal.
              </p>

              <div className="mt-8 space-y-4 rounded-[24px] border p-5" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-primary)' }}>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] mb-1" style={{ color: 'var(--text-secondary)' }}>Brand colors</p>
                  <div className="flex items-center gap-2">
                    <span className="h-8 w-8 rounded-full" style={{ background: '#1574B5' }} />
                    <span className="h-8 w-8 rounded-full" style={{ background: '#ED2124' }} />
                    <span className="h-8 w-8 rounded-full" style={{ background: '#F47821' }} />
                  </div>
                </div>
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
