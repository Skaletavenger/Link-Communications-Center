'use client'

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'

type Product = {
  id: string
  name: string
  price: number
}

type Props = {
  open: boolean
  onClose: () => void
  product: Product
}

export default function AirtelPayModal({ open, onClose, product }: Props) {
  const [phone, setPhone] = useState('')
  const [amount, setAmount] = useState(product?.price || 0)
  const [reference, setReference] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [airtelTxId, setAirtelTxId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const pollRef = useRef<number | null>(null)
  const attemptsRef = useRef(0)

  useEffect(() => {
    setAmount(product?.price || 0)
    setReference(`pay-${product?.id || 'prod'}-${Date.now()}`)
  }, [product])

  useEffect(() => {
    if (!open) {
      // reset state on close
      setPhone('')
      setLoading(false)
      setStatus(null)
      setAirtelTxId(null)
      setError(null)
    }
  }, [open])

  const stripLeadingZero = (p: string) => p.replace(/^0+/, '')

  const startPayment = async () => {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/airtel/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, amount, reference, productId: product?.id }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Payment initiation failed')
        setLoading(false)
        return
      }

      // Airtel response may include transaction id
      const airtelId = data?.data?.transaction?.id || data?.data?.id || data?.data?.transactionId || data?.data?.reference || null
      setAirtelTxId(airtelId)
      setStatus('PENDING')

      // start polling
      attemptsRef.current = 0
      pollRef.current = window.setInterval(async () => {
        attemptsRef.current += 1
        if (!airtelId) {
          clearInterval(pollRef.current!)
          setLoading(false)
          setError('Missing airtel transaction id')
          return
        }

        try {
          const st = await fetch(`/api/airtel/status/${encodeURIComponent(airtelId)}`)
          const sd = await st.json()
          const current = sd?.data || sd
          const state = current?.status || current?.transaction?.status || current?.transaction?.state || null
          if (state) setStatus(state)
          // consider approved/completed statuses
          const okStates = ['APPROVED', 'COMPLETED', 'SUCCESS', 'SUCCESSFUL']
          if (okStates.includes((state || '').toString().toUpperCase())) {
            clearInterval(pollRef.current!)
            setLoading(false)
            return
          }
          if (attemptsRef.current >= 40) {
            clearInterval(pollRef.current!)
            setLoading(false)
            setError('Payment not confirmed within 2 minutes')
          }
        } catch (e: any) {
          clearInterval(pollRef.current!)
          setLoading(false)
          setError(e.message || String(e))
        }
      }, 3000)
    } catch (e: any) {
      setError(e.message || String(e))
      setLoading(false)
    }
  }

  const retry = () => {
    setError(null)
    setStatus(null)
    setAirtelTxId(null)
    startPayment()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-50 w-full max-w-2xl mx-4 rounded-2xl p-6"
        style={{ background: 'linear-gradient(180deg,#0b1220, #0b1220)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold" style={{ color: 'white' }}>Pay with Airtel Money</h3>
          <button onClick={onClose} className="text-white opacity-80">✕</button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm text-white/80">Phone (e.g. 0752123456)</label>
            <input className="w-full mt-2 p-3 rounded-lg bg-[#0f1a2b] text-white outline-none"
              value={phone}
              onChange={e => setPhone(stripLeadingZero(e.target.value))}
              placeholder="0752123456"
            />
          </div>

          <div>
            <label className="text-sm text-white/80">Amount (UGX)</label>
            <input className="w-full mt-2 p-3 rounded-lg bg-[#0f1a2b] text-white outline-none" value={amount}
              onChange={e => setAmount(Number(e.target.value))} />
          </div>

          <div>
            <label className="text-sm text-white/80">Reference</label>
            <input className="w-full mt-2 p-3 rounded-lg bg-[#0f1a2b] text-white outline-none" value={reference} onChange={e => setReference(e.target.value)} />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={startPayment}
              className="flex-1 py-3 rounded-lg font-semibold"
              style={{ background: '#1574B5', color: 'white' }}
            >
              {loading ? 'Processing…' : `Pay UGX ${Number(amount).toLocaleString()}`}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-lg border"
              style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'white' }}
            >
              Cancel
            </button>
          </div>

          {status && (
            <div className="text-sm text-white/80">Status: {status}</div>
          )}

          {airtelTxId && (
            <div className="text-sm text-white/80">Airtel transaction ID: {airtelTxId}</div>
          )}

          {error && (
            <div className="mt-2 p-3 rounded bg-red-800 text-white">
              <div>{error}</div>
              <div className="flex gap-2 mt-2">
                <button className="px-3 py-1 bg-white/10 rounded" onClick={retry}>Retry</button>
                <button className="px-3 py-1 bg-white/10 rounded" onClick={onClose}>Close</button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
