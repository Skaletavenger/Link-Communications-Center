'use client';
import { Product } from '../types';
import { motion } from 'framer-motion';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', bounce: 0.18, damping: 18 } },
  exit: { opacity: 0, y: 12, scale: 0.95, transition: { duration: 0.25 } }
};

export default function ProductCard({ product }: { product: Product }) {
  const status = product.stockQuantity > 5 ? 'In Stock' : product.stockQuantity > 0 ? 'Low Stock' : 'Out of Stock';
  const lowStock = product.stockQuantity > 0 && product.stockQuantity <= 5;
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover={{ y: -6, scale: 1.04, boxShadow: '0 20px 40px rgba(0,180,255,0.2)' }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="relative overflow-hidden bg-white/3 rounded-lg p-4 flex flex-col h-full"
    >
      <motion.div
        variants={{ hidden: { opacity: 0 }, hover: { opacity: 1 } }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#001a38]/75 text-white text-lg font-semibold tracking-[0.08em]"
      >
        View Details
      </motion.div>
      <div className="h-44 w-full bg-white/5 rounded flex items-center justify-center overflow-hidden">
        <img src={product.image || '/placeholder.svg'} alt={product.name} className="object-contain h-full" />
      </div>
      <h3 className="mt-4 font-semibold">{product.name}</h3>
      <p className="text-sm text-muted">Model: {product.model}</p>
      <div className="mt-auto flex items-center justify-between gap-4">
        <div>
          <div className="text-lg font-bold">${product.price}</div>
          <motion.div
            animate={lowStock ? { opacity: [1, 0.8, 1], scale: [1, 1.02, 1] } : {}}
            transition={lowStock ? { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } : undefined}
            className={`text-xs font-semibold ${lowStock ? 'text-rose-300' : 'text-muted'}`}
          >
            {status}
          </motion.div>
        </div>
        <div className="text-sm text-muted">Qty: {product.stockQuantity}</div>
      </div>
    </motion.div>
  );
}
