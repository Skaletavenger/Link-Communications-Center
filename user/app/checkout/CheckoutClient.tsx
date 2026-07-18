'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ShieldCheck, Lock, ArrowLeft, Headphones, ShoppingBag, CheckCircle2, Store, Truck, Zap } from 'lucide-react'
import { useCart } from '@/lib/CartContext'
import { DELIVERY_ZONES, EXPRESS_SURCHARGE, FREE_DELIVERY_THRESHOLD, computeDeliveryFee, zoneById } from '@/lib/delivery'

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

  // Delivery
  const [method, setMethod] = useState<'pickup' | 'delivery'>('pickup')
  const [zoneId, setZoneId] = useState('')
  const [express, setExpress] = useState(false)
  const [address, setAddress] = useState('')

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

  const subtotal = useMemo(() => lineItems.reduce((sum, i) => sum + i.price * i.quantity, 0), [lineItems])
  const vatIncluded = Math.round(subtotal - subtotal / 1.18)
  const selectedZone = zoneById(zoneId)
  const canExpress = method === 'delivery' && !!selectedZone?.expressAllowed
  const deliveryFee = computeDeliveryFee({ method, zoneId, express: express && canExpress, subtotal })
  const grandTotal = subtotal + deliveryFee
  const freeStandard = method === 'delivery' && !!selectedZone && subtotal >= FREE_DELIVERY_THRESHOLD

  const description = useMemo(() => {
    const items = lineItems.map(i => `${i.name} x${i.quantity}`).join(', ')
    if (method === 'pickup') return `${items} | Pickup at shop`
    const zoneLabel = selectedZone ? selectedZone.label : 'delivery'
    return `${items} | ${express && canExpress ? 'Express ' : ''}Delivery: ${zoneLabel}`
  }, [lineItems, method, selectedZone, express, canExpress])

  const orderProductId = singleMode ? queryProductId : lineItems.length === 1 ? lineItems[0].id : 'cart'
  const hasOrder = lineItems.length > 0 && subtotal > 0

  const handlePay = async () => {
    setError(null)
    if (!hasOrder) { setError('Your order is empty.'); return }
    if (!fullName.trim()) { setError('Please enter your full name.'); return }
    if (!phone.trim()) { setError('Please enter your mobile money phone number.'); return }
    if (method === 'delivery' && !zoneId) { setError('Please choose your delivery area.'); return }
    if (method === 'delivery' && !address.trim()) { setError('Please enter your delivery address so our rider can find you.'); return }
    if (email.trim() && !/^\\S+@\\S+\\.\\S+$/.test(email.trim())) {
      setError('Please enter a valid email address or leave it empty.'); return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/pesapal/submit-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: grandTotal, phone, name: fullName.trim(), email: email.trim(),
          productId: orderProductId, description,
          deliveryMethod: method,
          deliveryZone: method === 'delivery' ? (selectedZone?.label || '') : '',
          deliveryFee,
          deliverySpeed: express && canExpress ? 'express' : 'standard',
          deliveryAddress: method === 'delivery' ? address.trim() : '',
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
          {/* LEFT column */}
          <div className="space-y-6">
            {/* Delivery card */}
            <div className="rounded-3xl border p-6 md:p-8" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Delivery</h2>
              <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>Pick up for free or have it delivered.</p>

              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setMethod('pickup')} className="rounded-2xl border-2 p-4 text-left transition" style={{ borderColor: method === 'pickup' ? 'var(--color-primary)' : 'var(--border)', background: method === 'pickup' ? 'rgba(21,116,181,0.08)' : 'transparent' }}>
                  <Store size={20} style={{ color: 'var(--color-primary)' }} />
                  <p className="font-semibold mt-2 text-sm" style={{ color: 'var(--text-primary)' }}>Pickup at shop</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Free · Lions Shopping Center</p>
                </button>
                <button type="button" onClick={() => setMethod('delivery')} className="rounded-2xl border-2 p-4 text-left transition" style={{ borderColor: method === 'delivery' ? 'var(--color-primary)' : 'var(--border)', background: method === 'delivery' ? 'rgba(21,116,181,0.08)' : 'transparent' }}>
                  <Truck size={20} style={{ color: 'var(--color-primary)' }} />
                  <p className="font-semibold mt-2 text-sm" style={{ color: 'var(--text-primary)' }}>Delivery</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Fee by area &amp; speed</p>
                </button>
              </div>

              {method === 'delivery' && (
                <div className="mt-5 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Your area</label>
                    <select value={zoneId} onChange={e => { setZoneId(e.target.value); const z = zoneById(e.target.value); if (!z?.expressAllowed) setExpress(false) }} className={inputClass} style={inputStyle}>
                      <option value="">Select your area…</option>
                      {DELIVERY_ZONES.map(z => (
                        <option key={z.id} value={z.id}>{z.label} — {formatUGX(z.fee)}</option>
                      ))}
                    </select>
                  </div>

                  <label className="flex items-start gap-3 rounded-xl border p-3 cursor-pointer" style={{ borderColor: canExpress ? 'var(--border)' : 'var(--border)', opacity: canExpress ? 1 : 0.5 }}>
                    <input type="checkbox" checked={express && canExpress} disabled={!canExpress} onChange={e => setExpress(e.target.checked)} className="mt-1" />
                    <span>
                      <span className="flex items-center gap-1.5 font-semibold text-sm" style={{ color: 'var(--text-primary)' }}><Zap size={14} style={{ color: '#f59e0b' }} /> Express — same-day (+{formatUGX(EXPRESS_SURCHARGE)})</span>
                      <span className="block text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{canExpress ? 'Delivered today within Kampala.' : 'Available for Kampala areas only.'}</span>
                    </span>
                  </label>

                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Delivery address</label>
                    <textarea value={address} onChange={e => setAddress(e.target.value)} rows={2} placeholder="Building, street, area, landmark…" className={inputClass} style={inputStyle} />
                  </div>

                  {freeStandard && (
                    <p className="text-xs font-semibold" style={{ color: '#16a34a' }}>✓ Free standard delivery unlocked (order over {formatUGX(FREE_DELIVERY_THRESHOLD)}).</p>
                  )}
                </div>
              )}
            </div>

            {/* Pay card */}
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
                {loading ? 'Redirecting to payment…' : `Pay ${formatUGX(grandTotal)}`}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                <ShieldCheck size={14} /> Payments processed securely through Pesapal
              </div>
            </div>
          </div>

          {/* RIGHT: order summary */}
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
                <span>Sub Total</span><span style={{ color: 'var(--text-primary)' }}>{formatUGX(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm" style={{ color: 'var(--text-muted)' }}>
                <span>VAT (18%, incl.)</span><span style={{ color: 'var(--text-primary)' }}>{formatUGX(vatIncluded)}</span>
              </div>
              <div className="flex items-center justify-between text-sm" style={{ color: 'var(--text-muted)' }}>
                <span>Delivery{express && canExpress ? ' (Express)' : ''}</span>
                <span style={{ color: 'var(--text-primary)' }}>
                  {method === 'pickup' ? 'Free' : !selectedZone ? 'Select area' : deliveryFee === 0 ? 'Free' : formatUGX(deliveryFee)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Total</span>
                <span className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>{formatUGX(grandTotal)}</span>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t space-y-3" style={{ borderColor: 'var(--border)' }}>
              {[
                'Enter your details and tap Pay',
                'Approve the prompt on your phone',
                'Track your order under Track Order',
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <CheckCircle2 size={16} style={{ color: 'var(--color-primary)' }} /> {text}
                </div>
              ))}
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
