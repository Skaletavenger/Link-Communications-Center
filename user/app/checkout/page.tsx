'use client'

import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import PaymentSelector from '../../components/payment/PaymentSelector'
import BrandLogo from '../../components/BrandLogo'

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const productName = searchParams.get('productName') || 'Product'
  const amount = searchParams.get('amount') || '0'
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [reference, setReference] = useState('')

  const handleSuccess = () => {
    setReference(`LCC-${Date.now()}`)
    setPaymentSuccess(true)
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
        <div className="w-full max-w-md">
          <div
            className="rounded-3xl border p-8 text-center"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              boxShadow: 'var(--card-shadow)',
            }}
          >
            {/* Success Checkmark */}
            <div className="mb-6 flex justify-center">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: '#10b981' }}
              >
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            {/* Heading */}
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Payment Successful!
            </h1>

            {/* Subheading */}
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              Thank you for your purchase.
            </p>

            {/* Details */}
            <div
              className="rounded-xl p-4 mb-6 space-y-3"
              style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
            >
              <div className="flex justify-between items-center">
                <span style={{ color: 'var(--text-secondary)' }}>Product</span>
                <span style={{ color: 'var(--text-primary)' }} className="font-semibold">
                  {productName}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: 'var(--text-secondary)' }}>Amount</span>
                <span style={{ color: '#1574B5' }} className="font-bold">
                  UGX {Number(amount).toLocaleString()}
                </span>
              </div>
              <div className="border-t pt-3" style={{ borderColor: 'var(--border-color)' }}>
                <span style={{ color: 'var(--text-secondary)' }} className="text-sm">Reference</span>
                <p style={{ color: 'var(--text-primary)' }} className="font-mono text-sm mt-1">
                  {reference}
                </p>
              </div>
            </div>

            {/* Back to Home Link */}
            <Link href="/">
              <button
                type="button"
                className="w-full py-3 rounded-lg font-bold text-white transition-all hover:opacity-90"
                style={{ background: '#1574B5' }}
              >
                Back to Home
              </button>
            </Link>

            <p className="text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
              A confirmation email has been sent to you.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Checkout
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Complete your purchase securely</p>
        </div>

        {/* Order Summary Card */}
        <div
          className="rounded-2xl border p-6"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          {/* LCC Logo Area */}
          <div className="flex justify-center mb-6">
            <div
              className="w-20 h-20 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--bg-primary)' }}
            >
              <BrandLogo />
            </div>
          </div>

          {/* Order Details */}
          <div className="space-y-4">
            <div>
              <p style={{ color: 'var(--text-secondary)' }} className="text-sm mb-1">
                Product
              </p>
              <p style={{ color: 'var(--text-primary)' }} className="text-xl font-bold">
                {productName}
              </p>
            </div>

            <div className="border-t pt-4" style={{ borderColor: 'var(--border-color)' }}>
              <p style={{ color: 'var(--text-secondary)' }} className="text-sm mb-1">
                Total Amount
              </p>
              <p style={{ color: '#1574B5' }} className="text-3xl font-bold">
                UGX {Number(amount).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Selector */}
        <PaymentSelector
          amount={Number(amount)}
          reference={`LCC-${Date.now()}`}
          productName={productName}
          onSuccess={handleSuccess}
        />

        {/* Security Footer */}
        <div className="text-center">
          <p style={{ color: 'var(--text-muted)' }} className="text-xs flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Secure payments powered by MTN & Airtel
          </p>
        </div>
      </div>
    </div>
  )
}
