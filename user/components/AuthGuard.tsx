'use client'
import Link from 'next/link'

export default function AuthGuard({ show }: { show: boolean }) {
  if (!show) return null

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div
          className="w-full max-w-md rounded-3xl border p-6 shadow-2xl"
          style={{ background: 'rgba(13, 20, 40, 0.75)', borderColor: 'var(--border-color)' }}
        >
          <h2 className="text-2xl font-extrabold mb-2" style={{ color: 'var(--text-primary)' }}>
            Sign in to browse our products
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            Create an account or sign in to view the full catalog.
          </p>
          <div className="flex gap-3">
            <Link
              href="/auth/login"
              className="flex-1 py-3 rounded-2xl font-bold text-center"
              style={{ background: '#1574B5', color: 'white' }}
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="flex-1 py-3 rounded-2xl font-bold text-center border"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

