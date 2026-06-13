import { Suspense } from 'react'
import CheckoutClient from './CheckoutClient'

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
        Loading checkout...
      </div>
    </div>}>
      <CheckoutClient />
    </Suspense>
  )
}
