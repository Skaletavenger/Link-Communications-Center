'use client'
import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/lib/ThemeContext'
import BrandLogo from './BrandLogo'
import ThemeToggle from './ThemeToggle'
import {
  Menu,
  X,
  ChevronDown,
  House,
  Box,
  Building2,
  Phone,
  Smartphone,
  ChevronRight
} from 'lucide-react'

export default function Navbar() {
  const path = usePathname() || '/'
  useTheme()
  const [open, setOpen] = useState(false)

  const isActive = (p: string) => path === p

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 border-b"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center">
              <BrandLogo />
            </Link>
          </div>

          {/* center - desktop links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/products"
              className="flex items-center gap-1 font-medium text-sm transition-colors duration-200"
              style={isActive('/products') ? { color: 'var(--color-primary)', borderBottom: '2px solid var(--color-primary)', paddingBottom: '6px' } : { color: 'var(--text-primary)' }}
            >
              Products <ChevronDown size={16} />
            </Link>
            <Link href="/about" className="font-medium text-sm transition-colors duration-200" style={isActive('/about') ? { color: 'var(--color-primary)', borderBottom: '2px solid var(--color-primary)', paddingBottom: '6px' } : { color: 'var(--text-primary)' }}>
              About
            </Link>
            <Link href="/contact" className="font-medium text-sm transition-colors duration-200" style={isActive('/contact') ? { color: 'var(--color-primary)', borderBottom: '2px solid var(--color-primary)', paddingBottom: '6px' } : { color: 'var(--text-primary)' }}>
              Contact
            </Link>
            <Link href="/loans" className="font-medium text-sm transition-colors duration-200" style={isActive('/loans') ? { color: 'var(--color-primary)', borderBottom: '2px solid var(--color-primary)', paddingBottom: '6px' } : { color: 'var(--text-primary)' }}>
              Smartphone Loans
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center">
              <ThemeToggle />
            </div>

            {/* mobile toggles */}
            <div className="flex items-center gap-2 md:hidden">
              <ThemeToggle />
              <button aria-label="open menu" onClick={() => setOpen(true)} className="p-2 rounded-md">
                <Menu />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* mobile drawer */}
      <div className={`fixed inset-0 z-40 ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
        {/* backdrop */}
        <div className={`absolute inset-0 bg-black/50 transition-opacity ${open ? 'opacity-60' : 'opacity-0'}`} onClick={() => setOpen(false)} />

        <aside className={`absolute top-0 right-0 h-full bg-[var(--bg-card)] shadow-xl transition-transform ${open ? 'translate-x-0' : 'translate-x-full'}`} style={{ width: '85%', borderLeft: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <Link href="/" className="flex items-center gap-3">
              <BrandLogo />
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button aria-label="close" onClick={() => setOpen(false)} className="p-2 rounded-md">
                <X />
              </button>
            </div>
          </div>

          <nav className="p-4 space-y-2">
            <MobileItem href="/" icon={<House />} label="Home" active={isActive('/')} onClick={() => setOpen(false)} />
            <MobileItem href="/products" icon={<Box />} label="Products" active={isActive('/products')} onClick={() => setOpen(false)} />
            <MobileItem href="/about" icon={<Building2 />} label="About" active={isActive('/about')} onClick={() => setOpen(false)} />
            <MobileItem href="/contact" icon={<Phone />} label="Contact Us" active={isActive('/contact')} onClick={() => setOpen(false)} />
            <MobileItem href="/loans" icon={<Smartphone />} label="Smartphone Loans" active={isActive('/loans')} onClick={() => setOpen(false)} />

            <div className="mt-6 text-center text-sm text-muted" style={{ color: 'var(--text-muted)' }}>
              <div className="border-t" style={{ borderColor: 'var(--border)' }} />
              <div className="py-3">v 1.0.0</div>
            </div>
          </nav>
        </aside>
      </div>
    </>
  )
}

function MobileItem({ href, icon, label, active, onClick }: { href: string; icon: JSX.Element; label: string; active: boolean; onClick?: () => void }) {
  return (
    <Link href={href} onClick={onClick} className={`flex items-center justify-between w-full px-3 py-3 rounded-xl transition-all ${active ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--text-primary)]'}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${active ? 'bg-white/10' : 'bg-transparent'}`}>
          {icon}
        </div>
        <span className="font-medium">{label}</span>
      </div>
      <ChevronRight />
    </Link>
  )
}
