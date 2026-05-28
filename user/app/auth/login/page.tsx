'use client'
import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import BrandLogo from '../../../components/BrandLogo'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const sendMagicLink = async () => {
    setError('')
    setMessage('')
    if (!email.trim()) {
      setError('Enter your email first.')
      return false
    }
    const origin = window.location.origin
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: origin + '/auth/callback' }
    })
    if (error) {
      setError(error.message)
      return false
    }
    setSent(true)
    setMessage('Magic link sent! Check your inbox to continue.')
    return true
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    await sendMagicLink()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-14">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(21,116,181,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(244,120,33,0.12),transparent_38%)]" />
      <div
        className="relative w-full max-w-md rounded-3xl border p-8 shadow-2xl"
        style={{ background: 'rgba(13, 20, 40, 0.75)', borderColor: 'var(--border-color)' }}
      >
        <div className="mb-6">
          <BrandLogo />
        </div>
        <h1 className="text-3xl font-black mb-1">Welcome Back</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          Sign in with a magic link
        </p>

        {sent ? (
          <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--border-color)' }}>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Check your email for a login link!
            </p>
            {message && <p className="text-sm mt-2" style={{ color: '#F47821' }}>{message}</p>}
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold block mb-2" style={{ color: 'var(--text-secondary)' }}>
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-2xl px-4 py-4 outline-none border"
                style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              />
            </div>

            {error && <p className="text-sm" style={{ color: '#ED2124' }}>{error}</p>}

            <button
              type="submit"
              className="w-full rounded-2xl py-4 font-extrabold"
              style={{ background: '#1574B5', color: 'white' }}
            >
              Send Magic Link
            </button>

            <button
              type="button"
              onClick={async () => {
                await sendMagicLink()
              }}
              className="w-full rounded-2xl py-4 font-bold border"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            >
              Use Magic Link Instead
            </button>
          </form>
        )}

        <p className="text-sm mt-6" style={{ color: 'var(--text-secondary)' }}>
          New here?{' '}
          <Link href="/auth/signup" className="font-bold" style={{ color: '#F47821' }}>
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}

