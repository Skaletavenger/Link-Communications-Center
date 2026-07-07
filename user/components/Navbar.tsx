'use client'
import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useCart } from '@/lib/CartContext'
import BrandLogo from './BrandLogo'
import {
  Menu,
  X,
  ChevronDown,
  House,
  Box,
  Building2,
  Phone,
  Smartphone,
  ChevronRight,
  ShoppingCart,
} from 'lucide-react'

export default function Navbar() {
  const path = usePathname() || '/'
    const [open, setOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const { items, totalItems, removeFromCart, clearCart } = useCart()

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
            <Link href="/" className="font-medium text-sm transition-colors duration-200" style={isActive('/') ? { color: 'var(--color-primary)', borderBottom: '2px solid var(--color-primary)', paddingBottom: '6px' } : { color: 'var(--text-primary)' }}>
              Home
            </Link>
            <Link
              href="/products"
              className="flex items-center gap-1 font-medium text-sm transition-colors duration-200"
              style={isActive('/products') ? { color: 'var(--color-primary)', borderBottom: '2px solid var(--color-primary)', paddingBottom: '6px' } : { color: 'var(--text-primary)' }}
            >
              Products <ChevronDown size={16} />
            </Link>
            <Link href="/loans" className="font-medium text-sm transition-colors duration-200" style={isActive('/loans') ? { color: 'var(--color-primary)', borderBottom: '2px solid var(--color-primary)', paddingBottom: '6px' } : { color: 'var(--text-primary)' }}>
              Smartphone Loans
            </Link>
            <Link href="/about" className="font-medium text-sm transition-colors duration-200" style={isActive('/about') ? { color: 'var(--color-primary)', borderBottom: '2px solid var(--color-primary)', paddingBottom: '6px' } : { color: 'var(--text-primary)' }}>
              About
            </Link>
            <Link href="/contact" className="font-medium text-sm transition-colors duration-200" style={isActive('/contact') ? { color: 'var(--color-primary)', borderBottom: '2px solid var(--color-primary)', paddingBottom: '6px' } : { color: 'var(--text-primary)' }}>
              Contact
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="relative w-10 h-10 rounded-full flex items-center justify-center transition-all hover:opacity-80"
                style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}
              >
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#ED2124] text-white text-[10px] font-bold flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>

            <div className="flex items-center gap-2 md:hidden">
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
              <button aria-label="close" onClick={() => setOpen(false)} className="p-2 rounded-md">
                <X />
              </button>
            </div>
          </div>

          <nav className="p-4 space-y-2">
            <MobileItem href="/" icon={<House />} label="Home" active={isActive('/')} onClick={() => setOpen(false)} />
            <MobileItem href="/products" icon={<Box />} label="Products" active={isActive('/products')} onClick={() => setOpen(false)} />
            <MobileItem href="/loans" icon={<Smartphone />} label="Smartphone Loans" active={isActive('/loans')} onClick={() => setOpen(false)} />
            <MobileItem href="/about" icon={<Building2 />} label="About" active={isActive('/about')} onClick={() => setOpen(false)} />
            <MobileItem href="/contact" icon={<Phone />} label="Contact Us" active={isActive('/contact')} onClick={() => setOpen(false)} />

            <div className="mt-6 text-center text-sm text-muted" style={{ color: 'var(--text-muted)' }}>
              <div className="border-t" style={{ borderColor: 'var(--border)' }} />
              <div className="py-3">v 1.0.0</div>
            </div>
          </nav>
        </aside>
      </div>

      {cartOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60" onClick={() => setCartOpen(false)} />
          <div className="fixed right-0 top-0 z-50 h-full w-80 shadow-2xl" style={{ background: 'var(--bg-card)' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                Cart ({totalItems})
              </h2>
              <button onClick={() => setCartOpen(false)} className="text-xl" style={{ color: 'var(--text-primary)' }}>
                ✕
              </button>
            </div>
            <div className="flex h-full flex-col justify-between">
              <div className="overflow-y-auto px-6 py-4 space-y-4">
                {items.length === 0 ? (
                  <p className="text-center mt-10" style={{ color: 'var(--text-muted)' }}>
                    Your cart is empty
                  </p>
                ) : (
                  items.map(item => (
                    <div key={item.id} className="flex gap-3 items-center">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                          {item.name}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--color-primary)' }}>
                          UGX {item.price.toLocaleString()} × {item.quantity}
                        </p>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-500 text-lg">
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
              {items.length > 0 && (
                <div className="border-t px-6 py-4" style={{ borderColor: 'var(--border)' }}>
                  <p className="font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                    Total: UGX {items.reduce((sum, i) => sum + i.price * i.quantity, 0).toLocaleString()}
                  </p>
                  <button
                    onClick={() => { clearCart(); setCartOpen(false) }}
                    className="w-full inline-flex items-center justify-center rounded-2xl px-4 py-3 font-bold text-white"
                    style={{ background: 'var(--color-primary)' }}
                  >
                    Checkout →
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
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
