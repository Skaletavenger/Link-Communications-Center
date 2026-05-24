'use client';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import { seedProducts } from '../lib/seed';

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } }
};

export default function Home() {
  const products = seedProducts.slice(0, 3);
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <main className="relative overflow-hidden">
      <Hero />
      <motion.section
        ref={ref}
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="container mx-auto px-6 py-16"
      >
        <h2 className="text-3xl font-bold mb-6">Featured Surveillance Cameras</h2>
        <motion.div variants={gridVariants} initial="hidden" animate={inView ? 'visible' : 'hidden'} className="grid md:grid-cols-3 gap-6">
          {products.map((p) => (
            <ProductCard key={p.model} product={p} />
          ))}
        </motion.div>
      </motion.section>
    </main>
  );
}
