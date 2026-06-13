'use client'

import { useState } from 'react'
import MTNPayModal from './MTNPayModal'
import AirtelPayModal from './AirtelPayModal'

type Props = {
  amount: number
  reference: string
  productName: string
}

type Network = 'mtn' | 'airtel' | 'unknown'

function detectNetwork(phone: string): Network {
  const stripped = phone.replace(/^0+/, '')
  if (stripped.startsWith('77') || stripped.startsWith('78')) return 'mtn'
  if (stripped.startsWith('70') || stripped.startsWith('75')) return 'airtel'
  return 'unknown'
}

export default function PaymentSelector({ amount, reference, productName }: Props) {
  const [phone, setPhone] = useState('')
  const [mtnModalOpen, setMtnModalOpen] = useState(false)
  const [airtelModalOpen, setAirtelModalOpen] = useState(false)

  const network = detectNetwork(phone)

  const getBadgeColor = () => {
    if (network === 'mtn') return '#FFCC00'
    if (network === 'airtel') return '#ED2124'
    return 'rgba(255,255,255,0.1)'
  }

  const getBadgeLabel = () => {
    if (network === 'mtn') return 'MTN MoMo'
    if (network === 'airtel') return 'Airtel Money'
    return 'Unknown'
  }

  const getTextColor = () => {
    if (network === 'mtn') return '#000'
    return 'white'
  }

  const stripLeadingZero = (p: string) => p.replace(/^0+/, '')

  const handlePay = () => {
    if (!phone) {
      alert('Please enter a phone number')
      return
    }
    if (network === 'mtn') {
      setMtnModalOpen(true)
    } else if (network === 'airtel') {
      setAirtelModalOpen(true)
    } else {
      alert('Please enter a valid MTN (077/078) or Airtel (070/075) number')
    }
  }

  const product = {
    id: reference,
    name: productName,
    price: amount,
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className="rounded-2xl border p-6"
        style={{
          background: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
          boxShadow: 'var(--card-shadow)',
        }}
      >
        <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          Payment Method
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="0752123456"
              value={phone}
              onChange={e => setPhone(stripLeadingZero(e.target.value))}
              className="w-full px-4 py-3 rounded-lg outline-none border transition-all"
              style={{
                background: 'var(--bg-primary)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = '#1574B5'
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = 'var(--border-color)'
              }}
            />
          </div>

          {phone && (
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Network:</span>
              <div
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{
                  background: getBadgeColor(),
                  color: getTextColor(),
                }}
              >
                {getBadgeLabel()}
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="button"
              onClick={handlePay}
              className="w-full py-3 rounded-lg font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: '#1574B5' }}
            >
              Pay UGX {Number(amount).toLocaleString()}
            </button>
          </div>

          <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
            Secure payment via MTN MoMo or Airtel Money
          </p>
        </div>
      </div>

      <MTNPayModal
        open={mtnModalOpen}
        onClose={() => setMtnModalOpen(false)}
        product={product}
      />

      <AirtelPayModal
        open={airtelModalOpen}
        onClose={() => setAirtelModalOpen(false)}
        product={product}
      />
    </div>
  )
}
