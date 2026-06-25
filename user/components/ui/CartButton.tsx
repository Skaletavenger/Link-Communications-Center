'use client'

import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/lib/CartContext'

export default function CartButton({ onOpen }: { onOpen: () => void }) {
  const { totalItems } = useCart()

  return (
    <button
      type="button"
      onClick={onOpen}
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
  )
}
