'use client';
import Image from 'next/image';
import { Product } from '../types';
import { motion } from 'framer-motion';

export default function ProductCard({ product }: { product: Product }) {
  const status = product.stockQuantity > 5 ? 'In Stock' : product.stockQuantity > 0 ? 'Low Stock' : 'Out of Stock';
  return (
    <motion.div whileHover={{ y: -6, scale: 1.02 }} className="bg-white/3 rounded-lg p-4 flex flex-col h-full transition-transform duration-200">
      <div className="h-44 w-full bg-white/5 rounded flex items-center justify-center overflow-hidden">
        <img src={product.image || '/placeholder.svg'} alt={product.name} className="object-contain h-full" />
      </div>
      <h3 className="mt-4 font-semibold">{product.name}</h3>
      <p className="text-sm text-muted">Model: {product.model}</p>
      <div className="mt-auto flex items-center justify-between">
        <div>
          <div className="text-lg font-bold">${product.price}</div>
          <div className="text-xs text-muted">{status}</div>
        </div>
        <div className="text-sm text-muted">Qty: {product.stockQuantity}</div>
      </div>
    </motion.div>
  );
}
