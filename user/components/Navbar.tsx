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
  { href: '/contact', label: 'Contact Us' }
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
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-md transition-all"
      style={{
        background: 'var(--nav-bg)',
        borderColor: 'var(--nav-border)'
      }}
    >
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
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
                className="font-medium transition-colors duration-200 hover:opacity-80"
                style={
                  active
                    ? {
                        background: '#1574B5',
                        color: '#ffffff',
                        padding: '6px 14px',
                        borderRadius: '8px'
                      }
                    : { color: 'var(--nav-link)' }
                }
              >
                {item.label}
              </Link>
            )
          })}
        </div>

        <div className="flex gap-3 items-center">
          <ThemeToggle />
          {authed && (
            <>
              <span className="hidden sm:inline text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                Hi {initials || '@user'}
              </span>
              <button
                type="button"
                onClick={logout}
                className="px-4 py-2 rounded-xl font-bold text-sm border transition-all hover:opacity-80"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
