'use client';
import { useMemo, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import ProductCard from '../../components/ProductCard';
import { useInventory, categories } from '../../lib/useInventory';

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } }
};

export default function ProductsPage() {
  const { products, loaded } = useInventory();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchTerm = search.toLowerCase();
      const matchesSearch = product.name.toLowerCase().includes(searchTerm) || product.model.toLowerCase().includes(searchTerm);
      const matchesCategory = category === 'All' || product.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  if (!loaded) {
    return (
      <section className="container mx-auto px-6 py-12 text-white">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-lg">Loading products…</div>
      </section>
    );
  }

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="container mx-auto px-6 py-12"
    >
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold">Products</h1>
          <p className="text-muted mt-2">Browse the full catalog of security hardware and accessories.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or model"
            className="w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[#00B4FF] focus:ring-4 focus:ring-[#00B4FF]/20 sm:w-[320px]"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[#00B4FF] focus:ring-4 focus:ring-[#00B4FF]/20 sm:w-[220px]"
          >
            <option>All</option>
            {categories.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-16 text-center text-lg text-white/80">
          Products coming soon. Check back later.
        </div>
      ) : (
        <motion.div variants={gridVariants} initial="hidden" animate={inView ? 'visible' : 'hidden'} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </motion.div>
      )}
    </motion.section>
  );
}
