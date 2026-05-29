'use client'
import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import BrandLogo from '../../../components/BrandLogo'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    const origin = window.location.origin
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: origin + '/auth/callback' }
    })
    if (error) {
      const normalizedMessage = error?.message?.toLowerCase() || ''

      if (normalizedMessage.includes('rate limit')) {
        setError('Too many attempts. Please wait a few minutes and try again.')
        setMessage('Email limit reached. Please wait 1 hour or contact us at support@linkcommunicationscenter.com to get access.')
      } else if (normalizedMessage.includes('already registered')) {
        setError('This email is already registered. Try signing in instead.')
      } else {
        setError(error.message)
      }
      return
    }
    setSent(true)
    setMessage('Verification email sent. Please check your inbox.')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-14">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(21,116,181,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(244,120,33,0.12),transparent_38%)]" />
      <div
        className="relative w-full max-w-md rounded-3xl border p-8 shadow-2xl"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', boxShadow: 'var(--card-shadow)' }}
      >
        <div className="mb-6">
          <BrandLogo />
        </div>
        <h1 className="text-3xl font-black mb-1">Create Account</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          Join to browse our products
        </p>

        {sent ? (
          <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--border-color)' }}>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Check your email! Click the link we sent to verify your account.
            </p>
            <button
              type="button"
              onClick={async () => {
                setError('')
                const { error } = await supabase.auth.resend({
                  type: 'signup',
                  email,
                  options: {
                    emailRedirectTo: window.location.origin + '/auth/callback'
                  }
                })

                if (error) {
                  const normalizedMessage = error?.message?.toLowerCase() || ''
                  if (normalizedMessage.includes('rate limit')) {
                    setError('Too many attempts. Please wait a few minutes and try again.')
                    setMessage('Email limit reached. Please wait 1 hour or contact us at support@linkcommunicationscenter.com to get access.')
                  } else {
                    setError(error.message)
                  }
                  return
                }

                setMessage('Verification email resent!')
              }}
              className="mt-4 w-full rounded-2xl py-3 font-bold text-white"
              style={{ background: '#1574B5' }}
            >
              Resend verification email
            </button>
            {error && <p className="text-sm mt-3" style={{ color: '#ED2124' }}>{error}</p>}
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
                style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              />
            </div>

            {error && <p className="text-sm" style={{ color: '#ED2124' }}>{error}</p>}
            {message && <p className="text-sm" style={{ color: '#F47821' }}>{message}</p>}

            <button
              type="submit"
              className="w-full rounded-2xl py-4 font-extrabold"
              style={{ background: '#1574B5', color: 'white' }}
            >
              Send Verification Email
            </button>
          </form>
        )}

        {/* SUPABASE SETUP REQUIRED:
           1. Go to supabase.com -> your project
           2. Authentication -> Settings
           3. Confirm "Enable email confirmations" is ON
           4. Check "Rate limits" to avoid overly strict thresholds
           5. Enable "Custom SMTP" to use your own email provider
              (Gmail SMTP works: smtp.gmail.com port 587)
              This removes the 3/hour limit entirely
           6. Or upgrade Supabase plan for higher limits */}

        <p className="text-sm mt-6" style={{ color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link href="/auth/login" className="font-bold" style={{ color: '#F47821' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

