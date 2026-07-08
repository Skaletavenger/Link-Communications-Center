'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'

type StatusResult = {
  status: string
  amount?: number
  currency?: string
  paymentMethod?: string
  confirmationCode?: string
  description?: string
} | null

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const orderTrackingId = searchParams.get('OrderTrackingId') || searchParams.get('orderTrackingId')

  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<StatusResult>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!orderTrackingId) {
      setLoading(false)
      return
    }
    fetch(`/api/pesapal/status?orderTrackingId=${encodeURIComponent(orderTrackingId)}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error)
        } else {
          setResult(data)
        }
      })
      .catch(e => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false))
  }, [orderTrackingId])

  const isCompleted = result?.status === 'completed'
  const isFailed = result?.status === 'failed' || result?.status === 'invalid' || result?.status === 'reversed'

  const headline = loading
    ? 'Checking your payment…'
    : isCompleted
    ? 'Payment received'
    : isFailed
    ? 'Payment not completed'
    : 'Payment pending'

  const subtext = loading
    ? 'Give us a moment while we confirm your transaction with Pesapal.'
    : isCompleted
    ? 'Your transaction was successfully completed. You can now continue browsing products.'
    : isFailed
    ? 'The payment did not go through. You can try again from the checkout page.'
    : 'We haven\'t received final confirmation yet. If you completed payment on your phone, this may take a minute to update.'

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-lg rounded-[32px] border p-10 text-center"
        style={{
          background: 'var(--bg-secondary)',
          borderColor: 'var(--border-color)',
          boxShadow: 'var(--card-shadow)',
        }}
      >
        <div
          className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full"
          style={{ background: isFailed ? '#ED2124' : '#1574B5' }}
        >
          {isFailed ? (
            <svg className="h-12 w-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-12 w-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          )}
        </div>

        <h1 className="text-4xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
          {headline}
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          {subtext}
        </p>

        {error && (
          <div className="rounded-2xl border p-4 mb-6 text-sm text-left" style={{ borderColor: '#ED2124', color: '#ED2124' }}>
            {error}
          </div>
        )}

        {result && (
          <div
            className="rounded-3xl border p-5 mb-8 text-left space-y-2"
            style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
          >
            {orderTrackingId && (
              <div>
                <div className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Transaction ID</div>
                <div className="font-mono break-all text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{orderTrackingId}</div>
              </div>
            )}
            {result.amount && (
              <div>
                <div className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Amount</div>
                <div className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {result.currency || 'UGX'} {Number(result.amount).toLocaleString()}
                </div>
              </div>
            )}
            {result.paymentMethod && (
              <div>
                <div className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Payment method</div>
                <div className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{result.paymentMethod}</div>
              </div>
            )}
          </div>
        )}

        <Link href="/products">
          <button
            type="button"
            className="w-full rounded-2xl py-4 font-semibold transition-all hover:opacity-90"
            style={{ background: '#1574B5', color: 'white' }}
          >
            Back to Products
          </button>
        </Link>
      </motion.div>
    </div>
  )
}
