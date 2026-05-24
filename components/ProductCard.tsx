'use client';
import { Product } from '../types';
import { motion } from 'framer-motion';

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', bounce: 0.18, damping: 18 } },
  exit: { opacity: 0, y: 12, scale: 0.98, transition: { duration: 0.25 } }
};

export default function ProductCard({ product }: { product: Product }) {
  const status = product.stockQuantity > 5 ? 'In Stock' : product.stockQuantity > 0 ? 'Low Stock' : 'Out of Stock';
  const badgeClass = product.stockQuantity > 5 ? 'bg-emerald-500/15 text-emerald-200 border-emerald-400/20' : product.stockQuantity > 0 ? 'bg-amber-400/15 text-amber-100 border-amber-300/20' : 'bg-rose-500/15 text-rose-100 border-rose-400/20';

  return (
    <motion.article
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover={{ y: -6, scale: 1.02, boxShadow: '0 28px 60px rgba(0, 180, 255, 0.16)' }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl"
    >
      <div className="h-64 overflow-hidden bg-white/5">
        {product.image ? (
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#131c32] text-white/60">
            <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="8" width="16" height="12" rx="2" />
              <path d="M8 8V6a4 4 0 018 0v2" />
              <path d="M9 14h6" />
            </svg>
          </div>
        )}
      </div>

      <div className="space-y-3 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-white">{product.name}</h3>
            <p className="text-sm text-white/60">{product.brand}</p>
          </div>
          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass}`}>{status}</span>
        </div>

        <p className="text-sm text-white/60">{product.model}</p>
        <div className="flex items-center justify-between gap-3 text-sm text-white/70">
          <span className="font-semibold text-[#00B4FF]">${product.price}</span>
          <span className="rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.16em] text-white/70">{product.category}</span>
        </div>
      </div>
    </motion.article>
  );
}
