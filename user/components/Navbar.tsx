'use client'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import ThemeToggle from './ThemeToggle'
import BrandLogo from './BrandLogo'

type Profile = { username?: string | null }

const navItems = [
  { href: '/products', label: 'Products' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' }
]

export default function Navbar() {
  const path = usePathname()
  const router = useRouter()
  const [authed, setAuthed] = useState(false)
  const [username, setUsername] = useState<string>('')

  const initials = useMemo(() => (username ? `@${username}` : ''), [username])

  useEffect(() => {
    let mounted = true

    const load = async () => {
      const { data } = await supabase.auth.getSession()
      const session = data.session
      if (!mounted) return
      setAuthed(Boolean(session))

      if (session?.user?.id) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('username')
          .eq('id', session.user.id)
          .maybeSingle()
        if (!mounted) return
        setUsername((profile as Profile | null)?.username || '')
      } else {
        setUsername('')
      }
    }

    load()

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      load()
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="container mx-auto px-6 py-4 flex justify-between items-center border-b backdrop-blur-md sticky top-0 z-40"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
    >
      <Link href="/" className="flex items-center gap-3">
        <BrandLogo />
      </Link>

      <div className="hidden md:flex gap-2 items-center">
        {navItems.map((item) => {
          const active = path === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                color: active ? 'white' : 'var(--text-secondary)',
                background: active ? 'rgba(21,116,181,0.22)' : 'transparent'
              }}
            >
              {item.label}
            </Link>
          )
        })}
      </div>

      <div className="flex gap-3 items-center">
        <ThemeToggle />
        {authed ? (
          <>
            <span className="hidden sm:inline text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
              Hi {initials || '@user'}
            </span>
            <button
              type="button"
              onClick={logout}
              className="px-4 py-2 rounded-xl font-bold text-sm border transition-all hover:bg-white/5"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            href="/auth/login"
            className="px-4 py-2 rounded-xl font-bold text-sm"
            style={{ background: '#1574B5', color: 'white' }}
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  )
}

