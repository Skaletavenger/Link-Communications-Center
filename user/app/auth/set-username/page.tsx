'use client'
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import BrandLogo from '../../../components/BrandLogo'

function validUsername(u: string) {
  return /^[a-zA-Z0-9_]{3,20}$/.test(u)
}

export default function SetUsernamePage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [checking, setChecking] = useState(false)
  const [available, setAvailable] = useState<boolean | null>(null)
  const [error, setError] = useState('')
  const debounceRef = useRef<number | null>(null)

  const normalized = useMemo(() => username.trim(), [username])
  const isValid = useMemo(() => validUsername(normalized), [normalized])

  useEffect(() => {
    setError('')
    setAvailable(null)
    if (!normalized || !isValid) return

    setChecking(true)
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(async () => {
      const { data } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('username', normalized)
        .maybeSingle()
      setAvailable(!data)
      setChecking(false)
    }, 500)

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current)
    }
  }, [normalized, isValid])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!isValid) {
      setError('Username must be 3-20 characters, alphanumeric or underscores only.')
      return
    }
    if (available === false) {
      setError('That username is taken.')
      return
    }

    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user
    if (!user) {
      router.replace('/auth/login')
      return
    }

    const { error } = await supabase.from('user_profiles').upsert({
      id: user.id,
      email: user.email,
      username: normalized,
      username_set: true,
      email_verified: true
    })
    if (error) {
      setError(error.message)
      return
    }
    router.replace('/products')
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
        <h1 className="text-3xl font-black mb-1">One Last Step!</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          Choose a username
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold block mb-2" style={{ color: 'var(--text-secondary)' }}>
              Username
            </label>
            <div className="relative">
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. link_user"
                className="w-full rounded-2xl px-4 py-4 outline-none border pr-10"
                style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">
                {checking ? (
                  <span style={{ color: 'var(--text-muted)' }}>…</span>
                ) : available === true ? (
                  <span style={{ color: '#00FF88' }}>✓</span>
                ) : available === false ? (
                  <span style={{ color: '#ED2124' }}>✕</span>
                ) : null}
              </div>
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
              3–20 chars. Letters, numbers, underscores only.
            </p>
          </div>

          {error && <p className="text-sm" style={{ color: '#ED2124' }}>{error}</p>}

          <button
            type="submit"
            className="w-full rounded-2xl py-4 font-extrabold disabled:opacity-60"
            disabled={!isValid || available === false || checking}
            style={{ background: '#1574B5', color: 'white' }}
          >
            Set Username
          </button>
        </form>
      </div>
    </div>
  )
}

