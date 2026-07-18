'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ShieldCheck, Lock, ArrowLeft, Headphones, ShoppingBag, CheckCircle2 } from 'lucide-react'
import { useCart } from '@/lib/CartContext'

function parsePositiveNumber(value: string | null, fallback: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function formatUGX(n: number) {
  return 'UGX ' + Number(n || 0).toLocaleString()
}

type LineItem = { id: string; name: string; price: number; quantity: number; image?: string }

export default function CheckoutClient() {
  const searchParams = useSearchParams()
  const { items: cartItems } = useCart()
  const [phone, setPhone] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const queryName = searchParams.get('name')?.trim() || ''
  const singleMode = Boolean(queryName)
  const queryProductId = searchParams.get('productId') || 'unknown'
  const queryUnitPrice = parsePositiveNumber(searchParams.get('price'), 0)
  const queryQuantity = Math.max(1, parsePositiveNumber(searchParams.get('quantity'), 1))
  const queryImage = searchParams.get('image') || undefined

  const lineItems: LineItem[] = useMemo(() => {
    if (singleMode) {
      return [{ id: queryProductId, name: queryName, price: queryUnitPrice, quantity: queryQuantity, image: queryImage }]
    }
    return cartItems.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, image: i.image }))
  }, [singleMode, queryProductId, queryName, queryUnitPrice, queryQuantity, queryImage, cartItems])

  const totalAmount = useMemo(
    () => lineItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [lineItems]
  )
  const vatIncluded = Math.round(totalAmount - totalAmount / 1.18)
  const description = useMemo(
    () => lineItems.map(i => `${i.name} x${i.quantity}`).join(', '),
    [lineItems]
  )
  const orderProductId = singleMode ? queryProductId : lineItems.length === 1 ? lineItems[0].id : 'cart'
  const hasOrder = lineItems.length > 0 && totalAmount > 0

  const handlePay = async () => {
    setError(null)
    if (!hasOrder) { setError('Your order is empty.'); return }
    if (!fullName.trim()) { setError('Please enter your full name.'); return }
    if (!phone.trim()) { setError('Please enter your mobile money phone number.'); return }
    if (email.trim() && !/^\\S+@\\S+\\.\\S+$/.test(email.trim())) {
      setError('Please enter a valid email address or leave it empty.'); return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/pesapal/submit-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalAmount, phone, name: fullName.trim(), email: email.trim(),
          productId: orderProductId, description,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Could not start payment. Please try again.')
        setLoading(false)
        return
      }
      window.location.href = data.redirectUrl
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
      setLoading(false)
    }
  }

  if (!hasOrder) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'var(--bg-primary)' }}>
        <div className="rounded-3xl border p-10 text-center max-w-md" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
            <ShoppingBag size={26} />
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Your cart is empty</h1>
          <p className="mb-6" style={{ color: 'var(--text-muted)' }}>Add a product to your cart or pick one from a product page to continue.</p>
          <Link href="/#products" className="inline-flex items-center justify-center rounded-xl px-6 py-3 font-semibold text-white" style={{ background: 'var(--color-primary)' }}>
            Shop Products
          </Link>
        </div>
      </div>
    )
  }

  const inputStyle = { background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }
  const inputClass = "w-full rounded-xl border px-4 py-3 text-base outline-none transition-all focus:border-[var(--color-primary)]"

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="max-w-6xl mx-auto pt-28 pb-20 px-6"
      >
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-2 px-3 py-1 rounded-full" style={{ background: 'rgba(21,116,181,0.12)', color: 'var(--color-primary)' }}>
              <Lock size={13} /> Secure checkout
            </div>
            <h1 className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>Checkout</h1>
          </div>
          <Link href="/cart" className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition hover:opacity-80" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
            <ArrowLeft size={16} /> Back to cart
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr,0.85fr] items-start">
          {/* LEFT: payment form */}
          <div className="rounded-3xl border p-6 md:p-8" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Pay for your order</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Enter your details, then confirm payment on the next screen.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Full name</label>
                <input type="text" placeholder="e.g. John Mukasa" value={fullName} onChange={e => setFullName(e.target.value)} className={inputClass} style={inputStyle} />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Mobile money phone number</label>
                <input type="tel" placeholder="0752 123456" value={phone} onChange={e => setPhone(e.target.value.replace(/[^0-9]/g, ''))} className={inputClass} style={inputStyle} />
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2 py-1 rounded-md" style={{ background: '#FFCB05', color: '#00263A' }}>MTN MoMo</span>
                  <span className="text-[11px] font-bold px-2 py-1 rounded-md text-white" style={{ background: '#E4002B' }}>Airtel Money</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>chosen on the next screen</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Email <span className="font-normal" style={{ color: 'var(--text-muted)' }}>(optional, for receipt)</span></label>
                <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} style={inputStyle} />
              </div>
            </div>

            {error && (
              <div className="mt-5 rounded-xl border-l-4 border-red-500 bg-red-50 p-4 text-sm" style={{ color: '#9b1c1c' }}>{error}</div>
            )}

            <button type="button" onClick={handlePay} disabled={loading} className="mt-6 w-full rounded-xl py-4 text-base font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50" style={{ background: 'var(--color-primary)' }}>
              {loading ? 'Redirecting to payment…' : `Pay ${formatUGX(totalAmount)}`}
            </button>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              <ShieldCheck size={14} /> Payments processed securely through Pesapal
            </div>
          </div>

          {/* RIGHT: order summary + trust */}
          <div className="rounded-3xl border p-6 md:p-7 lg:sticky lg:top-24" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <h2 className="text-lg font-bold mb-5" style={{ color: 'var(--text-primary)' }}>Order summary</h2>

            <div className="space-y-4">
              {lineItems.map(item => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0" style={{ background: 'var(--bg-secondary)' }}>
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill sizes="56px" className="object-contain" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--text-muted)' }}><ShoppingBag size={20} /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-tight line-clamp-2" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{formatUGX(item.price)} × {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>{formatUGX(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 space-y-2 border-t" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between text-sm" style={{ color: 'var(--text-muted)' }}>
                <span>Sub Total</span><span style={{ color: 'var(--text-primary)' }}>{formatUGX(totalAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-sm" style={{ color: 'var(--text-muted)' }}>
                <span>VAT (18%, incl.)</span><span style={{ color: 'var(--text-primary)' }}>{formatUGX(vatIncluded)}</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Total</span>
                <span className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>{formatUGX(totalAmount)}</span>
              </div>
              <p className="text-xs pt-1" style={{ color: 'var(--text-muted)' }}>* Delivery charges may apply based on your address.</p>
            </div>

            <div className="mt-6 pt-5 border-t space-y-3" style={{ borderColor: 'var(--border)' }}>
              {[
                [CheckCircle2, 'Enter your details and tap Pay'],
                [CheckCircle2, 'Approve the prompt on your phone'],
                [CheckCircle2, 'Track your order under Track Order'],
              ].map(([Icon, text], i) => {
                const I = Icon as typeof CheckCircle2
                return (
                  <div key={i} className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <I size={16} style={{ color: 'var(--color-primary)' }} /> {text as string}
                  </div>
                )
              })}
            </div>

            <div className="mt-5 rounded-2xl p-4 flex items-start gap-3" style={{ background: 'var(--bg-secondary)' }}>
              <Headphones size={18} style={{ color: 'var(--color-primary)' }} className="mt-0.5 shrink-0" />
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Payment failed or need help? <Link href="/contact" className="font-semibold" style={{ color: 'var(--color-primary)' }}>Contact us</Link> and we&apos;ll sort it out.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
