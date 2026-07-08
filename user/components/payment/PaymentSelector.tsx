'use client'

import { useState } from 'react'

type Props = {
  amount: number
  reference: string
  productName: string
}

export default function PaymentSelector({ amount, reference, productName }: Props) {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePay = async () => {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/pesapal/submit-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          phone,
          productId: reference,
          description: productName,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Could not start payment. Please try again.')
        setLoading(false)
        return
      }
      // Send the customer to Pesapal\'s hosted page, where they pick
      // MTN MoMo or Airtel Money and complete payment.
      window.location.href = data.redirectUrl
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e)
      setError(message)
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className="rounded-2xl border p-6"
        style={{
          background: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
          boxShadow: 'var(--card-shadow)',
        }}
      >
        <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          Payment Method
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
              Phone Number (optional)
            </label>
            <input
              type="tel"
              placeholder="0752123456"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full px-4 py-3 rounded-lg outline-none border transition-all"
              style={{
                background: 'var(--bg-primary)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
              }}
            />
            <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              You&apos;ll choose MTN MoMo or Airtel Money and confirm payment on the next screen.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handlePay}
              disabled={loading}
              className="w-full py-3 rounded-lg font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: '#1574B5' }}
            >
              {loading ? 'Redirecting…' : `Pay UGX ${Number(amount).toLocaleString()}`}
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(237,33,36,0.1)', color: '#ED2124' }}>
              {error}
            </div>
          )}

          <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
            Secure payment via MTN MoMo or Airtel Money, powered by Pesapal
          </p>
        </div>
      </div>
    </div>
  )
}
