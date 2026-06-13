import Link from 'next/link'
import { motion } from 'framer-motion'

export default function CheckoutSuccessPage({ searchParams }: { searchParams: { transactionId?: string } }) {
  const transactionId = searchParams.transactionId || 'N/A'

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
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full"
          style={{ background: '#1574B5' }}
        >
          <svg className="h-12 w-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>

        <h1 className="text-4xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
          Payment received
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          Your transaction was successfully submitted. You can now continue browsing products.
        </p>

        <div className="rounded-3xl border p-5 mb-8 text-left"
          style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
        >
          <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
            Transaction ID
          </div>
          <div className="font-mono break-all text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            {transactionId}
          </div>
        </div>

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
