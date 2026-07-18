"use client"

import Link from 'next/link'
import Image from 'next/image'
import { Minus, Plus, ShoppingCart } from 'lucide-react'
import { useCart } from '@/lib/CartContext'

function formatUGX(n: number) {
  return 'UGX ' + Number(n || 0).toLocaleString()
}

export default function CartPage() {
  const { items, updateQuantity, removeFromCart } = useCart()
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const vatIncluded = Math.round(subtotal - subtotal / 1.18)

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-5xl mx-auto pt-28 pb-20 px-6">
        <h1 className="text-4xl font-bold mb-10" style={{ color: 'var(--text-primary)' }}>My Cart</h1>

        {items.length === 0 ? (
          <div className="rounded-2xl border p-12 text-center" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
              <ShoppingCart size={26} />
            </div>
            <p className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Your cart is empty</p>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Browse our products and add items to your cart.</p>
            <Link href="/#products" className="inline-flex items-center justify-center rounded-xl px-6 py-3 font-semibold text-white" style={{ background: 'var(--color-primary)' }}>
              Shop Products
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="rounded-2xl border p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                  <div className="relative w-full md:w-28 h-40 md:h-24 rounded-xl overflow-hidden shrink-0" style={{ background: 'var(--bg-secondary)' }}>
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill sizes="112px" className="object-contain" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--text-muted)' }}><ShoppingCart size={24} /></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg leading-tight" style={{ color: 'var(--text-primary)' }}>{item.name}</h3>
                    <p className="mt-1 font-semibold" style={{ color: 'var(--color-primary)' }}>{formatUGX(item.price)}</p>
                    <Link href={`/products/${item.id}`} className="inline-block mt-1 text-xs font-semibold tracking-wide uppercase hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
                      View details
                    </Link>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
                      <button type="button" aria-label="Decrease" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-10 h-10 flex items-center justify-center transition hover:opacity-80" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                        <Minus size={16} />
                      </button>
                      <span className="w-12 h-10 flex items-center justify-center font-bold text-white" style={{ background: 'var(--color-primary)' }}>{item.quantity}</span>
                      <button type="button" aria-label="Increase" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-10 h-10 flex items-center justify-center transition hover:opacity-80" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                        <Plus size={16} />
                      </button>
                    </div>
                    <button type="button" onClick={() => removeFromCart(item.id)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90" style={{ background: '#ED2124' }}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 md:ml-auto md:max-w-sm">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm" style={{ color: 'var(--text-muted)' }}>
                  <span>Sub Total</span><span className="font-medium" style={{ color: 'var(--text-primary)' }}>{formatUGX(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm" style={{ color: 'var(--text-muted)' }}>
                  <span>VAT (18%, incl.)</span><span className="font-medium" style={{ color: 'var(--text-primary)' }}>{formatUGX(vatIncluded)}</span>
                </div>
                <div className="border-t pt-3 flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Total</span>
                  <span className="font-bold text-lg" style={{ color: 'var(--color-primary)' }}>{formatUGX(subtotal)}</span>
                </div>
                <p className="text-xs pt-1" style={{ color: 'var(--text-muted)' }}>* Delivery charges will be applicable based on your chosen address.</p>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link href="/#products" className="flex-1 inline-flex items-center justify-center rounded-xl px-5 py-3 font-semibold border transition hover:opacity-80" style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}>
                  Add More Items
                </Link>
                <Link href="/checkout" className="flex-1 inline-flex items-center justify-center rounded-xl px-5 py-3 font-semibold text-white transition hover:opacity-90" style={{ background: 'var(--color-primary)' }}>
                  Sign In & Checkout
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
