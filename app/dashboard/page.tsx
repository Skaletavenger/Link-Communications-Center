'use client';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { Product } from '../../types';
import { seedProducts } from '../../lib/seed';
import ProductCard from '../../components/ProductCard';
import ProductForm from '../../components/ProductForm';
import LottieLoader from '@/components/LottieLoader';

const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN || 'LCC2026';

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } }
};

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const ref = useRef<HTMLElement>(null);
  const sectionInView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    setMounted(true);
    const stored = typeof window !== 'undefined' ? sessionStorage.getItem('lcc-admin-access') : null;
    setAuthorized(stored === 'true');

    let mountedRequest = true;
    (async () => {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('API unavailable');
        const apiItems = await res.json();
        if (mountedRequest && Array.isArray(apiItems) && apiItems.length > 0) {
          setProducts(apiItems);
          localStorage.setItem('lcc_products', JSON.stringify(apiItems));
          return;
        }
      } catch (e) {
        // fallback to localStorage / seed
      }

      const data = typeof window !== 'undefined' ? localStorage.getItem('lcc_products') : null;
      if (data) setProducts(JSON.parse(data));
      else {
        localStorage.setItem('lcc_products', JSON.stringify(seedProducts));
        setProducts(seedProducts);
      }
    })();

    return () => {
      mountedRequest = false;
    };
  }, []);

  const saveProducts = (next: Product[]) => {
    setProducts(next);
    localStorage.setItem('lcc_products', JSON.stringify(next));
  };

  const handleDelete = (model: string) => saveProducts(products.filter((p) => p.model !== model));
  const handleAddOrUpdate = (product: Product, originalModel?: string) => {
    if (originalModel) {
      const next = products.map((p) => (p.model === originalModel ? product : p));
      saveProducts(next);
      setEditingProduct(null);
    } else {
      saveProducts([product, ...products]);
    }
  };

  const filtered = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.model.toLowerCase().includes(query.toLowerCase())),
    [products, query]
  );

  const handlePinSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      sessionStorage.setItem('lcc-admin-access', 'true');
      setAuthorized(true);
      setError('');
      setPin('');
    } else {
      setError('Invalid PIN. Please try again.');
    }
  };

  useEffect(() => {
    if (!authorized) {
      return;
    }

    const redirect = searchParams?.get('redirect') || '/dashboard';
    if (redirect) {
      router.push(redirect);
    }
  }, [authorized, router, searchParams]);

  if (!mounted) {
    return null;
  }

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={sectionInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="relative min-h-screen container mx-auto px-6 py-12"
    >
      {!authorized && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-navy/95 p-8 text-white shadow-2xl">
            <h2 className="text-3xl font-semibold mb-4">Admin PIN Required</h2>
            <p className="text-sm text-muted mb-6">Enter the admin PIN to access the dashboard.</p>
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                placeholder="Enter PIN"
              />
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button type="submit" className="btn w-full justify-center">Unlock Dashboard</button>
            </form>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16">
          <LottieLoader src="/animations/dashboard-inventory-box.json" className="w-16 h-16" />
        </div>
        <h1 className="text-4xl font-bold">Inventory Dashboard</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <div className="flex-1">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or model" className="w-full p-3 rounded bg-white/5" />
        </div>
        <div className="w-full md:w-72">
          <ProductForm product={editingProduct ?? undefined} onSave={handleAddOrUpdate} onCancel={() => setEditingProduct(null)} />
        </div>
      </div>

      <motion.div variants={gridVariants} initial="hidden" animate={sectionInView ? 'visible' : 'hidden'} className="grid md:grid-cols-3 gap-6 mb-8">
        {filtered.map((p) => (
          <div key={p.model} className="glass p-4 rounded">
            <ProductCard product={p} />
            <div className="flex gap-2 mt-4 flex-wrap">
              <button className="btn" onClick={() => setEditingProduct(p)}>Edit</button>
              <button className="btn" onClick={() => handleDelete(p.model)}>Delete</button>
            </div>
          </div>
        ))}
      </motion.div>
      <p className="text-sm text-muted">Manage products locally (localStorage).</p>
    </motion.section>
  );
}
