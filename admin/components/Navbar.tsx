'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import BrandLogo from './BrandLogo';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import { Menu, X } from 'lucide-react';

const AUTH_KEY = 'lcc_admin_auth';

const navItems = [
  { href: '/products', label: 'Products' },
  { href: '/loans', label: 'Loans' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/orders', label: 'Orders' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' }
];

export default function Navbar() {
  const path = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authed, setAuthed] = useState<boolean>(
    () => typeof window !== 'undefined' && sessionStorage.getItem(AUTH_KEY) === 'true'
  );

  useEffect(() => {
    let mounted = true;
    const evaluate = (session: Session | null) => {
      const flag = typeof window !== 'undefined' && sessionStorage.getItem(AUTH_KEY) === 'true';
      if (mounted) setAuthed(Boolean(session) && flag);
    };
    supabase.auth.getSession().then(({ data: { session } }) => evaluate(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      evaluate(session);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [path]);

  // close the mobile menu whenever the route changes
  useEffect(() => { setMobileOpen(false); }, [path]);

  const linkStyle = (active: boolean) =>
    active
      ? { background: '#1574B5', color: '#ffffff', padding: '6px 14px', borderRadius: '8px' }
      : { color: 'var(--nav-link)' };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-md transition-all"
      style={{ background: 'var(--nav-bg)', borderColor: 'var(--nav-border)' }}
    >
      <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center select-none shrink-0">
          <BrandLogo />
        </Link>

        {/* desktop */}
        <div className={`hidden md:flex items-center ${authed ? 'flex-1 justify-evenly px-10' : 'justify-end'}`}>
          {authed ? (
            navItems.map((item) => (
              <Link key={item.href} href={item.href} className="font-medium transition-colors duration-200 hover:opacity-80" style={linkStyle(path === item.href)}>
                {item.label}
              </Link>
            ))
          ) : (
            <Link href="/dashboard/login" className="font-semibold transition-opacity duration-200 hover:opacity-90" style={{ background: '#1574B5', color: '#ffffff', padding: '8px 20px', borderRadius: '8px' }}>
              Login
            </Link>
          )}
        </div>

        {/* mobile hamburger */}
        <button type="button" aria-label="Menu" onClick={() => setMobileOpen(o => !o)} className="md:hidden p-2 rounded-lg" style={{ color: 'var(--nav-link)' }}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* mobile panel */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 border-b shadow-lg" style={{ background: 'var(--nav-bg)', borderColor: 'var(--nav-border)' }}>
          <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col gap-1">
            {authed ? (
              navItems.map((item) => {
                const active = path === item.href;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="font-medium px-4 py-3 rounded-lg transition-colors" style={active ? { background: '#1574B5', color: '#fff' } : { color: 'var(--nav-link)' }}>
                    {item.label}
                  </Link>
                );
              })
            ) : (
              <Link href="/dashboard/login" onClick={() => setMobileOpen(false)} className="font-semibold px-4 py-3 rounded-lg text-center" style={{ background: '#1574B5', color: '#fff' }}>
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
