'use client'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import ThemeToggle from './ThemeToggle'
import BrandLogo from './BrandLogo'

type Profile = { username?: string | null }

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' }
]

export default function Navbar() {
  const path = usePathname()
  const router = useRouter()
  const [authed, setAuthed] = useState(false)
  const [username, setUsername] = useState<string>('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
    setMobileMenuOpen(false)
  }

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-md transition-all"
        style={{
          background: 'var(--nav-bg)',
          borderColor: 'var(--nav-border)'
        }}
      >
        <div className="container mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <BrandLogo />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-1 items-center">
            {navItems.map((item) => {
              const active = path === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="font-medium transition-colors duration-200 hover:opacity-80 px-4 py-2"
                  style={
                    active
                      ? {
                          background: '#1574B5',
                          color: '#ffffff',
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

          {/* Right Side Actions */}
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
                  className="px-4 py-2 rounded-xl font-bold text-sm border transition-all hover:opacity-80 hidden sm:block"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="px-4 py-2 rounded-xl font-bold text-sm hidden sm:block"
                style={{ background: '#1574B5', color: 'white' }}
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg transition-colors"
              style={{ color: 'var(--nav-link)' }}
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            className="md:hidden border-t"
            style={{
              background: 'var(--nav-bg)',
              borderColor: 'var(--nav-border)'
            }}
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navItems.map((item) => {
                const active = path === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className="font-medium transition-colors duration-200 px-4 py-2 rounded-lg"
                    style={
                      active
                        ? {
                            background: '#1574B5',
                            color: '#ffffff'
                          }
                        : { color: 'var(--nav-link)' }
                    }
                  >
                    {item.label}
                  </Link>
                )
              })}

              {/* Mobile Auth Actions */}
              <div className="border-t mt-2 pt-2" style={{ borderColor: 'var(--border-color)' }}>
                {authed ? (
                  <>
                    <span className="block text-sm font-semibold px-4 py-2" style={{ color: 'var(--text-secondary)' }}>
                      Hi {initials || '@user'}
                    </span>
                    <button
                      type="button"
                      onClick={logout}
                      className="w-full text-left px-4 py-2 rounded-lg font-bold text-sm border transition-all hover:opacity-80"
                      style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    href="/auth/login"
                    onClick={closeMobileMenu}
                    className="block w-full text-center px-4 py-2 rounded-lg font-bold text-sm"
                    style={{ background: '#1574B5', color: 'white' }}
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 top-16 z-40 md:hidden"
          onClick={closeMobileMenu}
          style={{ background: 'rgba(0, 0, 0, 0.3)' }}
        />
      )}
    </>
  )
}
