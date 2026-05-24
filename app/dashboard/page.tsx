'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Product } from '../../types';
import { seedProducts } from '../../lib/seed';
import ProductCard from '../../components/ProductCard';
import ProductForm from '../../components/ProductForm';
import LottieLoader from '@/components/LottieLoader';
import { useToast } from '@/components/ToastContext';

const AUTH_KEY = 'lcc_admin_auth';

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', bounce: 0.18, damping: 18 } },
  exit: { opacity: 0, scale: 0.95, height: 0, marginBottom: 0, transition: { duration: 0.25 } }
};

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [query, setQuery] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLElement>(null);
  const sectionInView = useInView(ref, { once: true, margin: '-100px' });
  const toast = useToast();

  useEffect(() => {
    setMounted(true);
    const stored = typeof window !== 'undefined' ? sessionStorage.getItem(AUTH_KEY) : null;

    if (stored !== 'true') {
      router.replace('/dashboard/login');
      return;
    }

    setAuthorized(true);

    let mountedRequest = true;
    (async () => {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('API unavailable');
        const apiItems = await res.json();
        if (mountedRequest && Array.isArray(apiItems) && apiItems.length > 0) {
          setProducts(apiItems);
          localStorage.setItem('lcc_products', JSON.stringify(apiItems));
          setLoadingProducts(false);
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
      setLoadingProducts(false);
    })();

    setAuthChecked(true);

    return () => {
      mountedRequest = false;
    };
  }, [router]);

  const saveProducts = (next: Product[]) => {
    setProducts(next);
    localStorage.setItem('lcc_products', JSON.stringify(next));
  };

  const handleDelete = (model: string) => {
    saveProducts(products.filter((p) => p.model !== model));
    toast.success('Product deleted successfully.');
  };

  const handleAddOrUpdate = (product: Product, originalModel?: string) => {
    if (originalModel) {
      const next = products.map((p) => (p.model === originalModel ? product : p));
      saveProducts(next);
      setEditingProduct(null);
      toast.success('Product updated successfully.');
    } else {
      saveProducts([product, ...products]);
      toast.success('Product added successfully.');
    }
  };

  const filtered = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.model.toLowerCase().includes(query.toLowerCase())),
    [products, query]
  );

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(AUTH_KEY);
    }
    setAuthorized(false);
    toast.success('Logged out successfully.');
    router.replace('/dashboard/login');
  };

  if (!mounted || !authChecked) {
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
      <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16">
            <LottieLoader src="/animations/dashboard-inventory-box.json" className="w-16 h-16" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Inventory Dashboard</h1>
            <p className="text-sm text-muted">Secure admin management with session protection.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="btn rounded-full bg-rose-500/90 px-5 py-3 text-white shadow-lg shadow-rose-500/20 hover:bg-rose-500"
        >
          Logout
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <div className="flex-1">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or model"
            className="w-full md:w-[200px] focus:md:w-[320px] transition-all duration-300 ease-out p-3 rounded bg-white/5"
          />
        </div>
        <div className="w-full md:w-72">
          <ProductForm product={editingProduct ?? undefined} onSave={handleAddOrUpdate} onCancel={() => setEditingProduct(null)} />
        </div>
      </div>

      <AnimatePresence>
        {loadingProducts ? (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((index) => (
              <div key={index} className="glass rounded-lg p-4 animate-pulse">
                <div className="h-44 w-full rounded bg-white/10 mb-4" />
                <div className="h-6 w-3/4 rounded bg-white/10 mb-2" />
                <div className="h-4 w-1/2 rounded bg-white/10 mb-6" />
                <div className="flex items-center justify-between gap-4">
                  <div className="h-4 w-20 rounded bg-white/10" />
                  <div className="h-4 w-12 rounded bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div variants={gridVariants} initial="hidden" animate={sectionInView ? 'visible' : 'hidden'} className="grid md:grid-cols-3 gap-6 mb-8">
            {filtered.map((p) => (
              <motion.div key={p.model} variants={itemVariants} exit="exit" layout>
                <div className="glass p-4 rounded">
                  <ProductCard product={p} />
                  <div className="flex gap-2 mt-4 flex-wrap">
                    <button className="btn" onClick={() => setEditingProduct(p)}>Edit</button>
                    <button className="btn" onClick={() => handleDelete(p.model)}>Delete</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <p className="text-sm text-muted">Manage products locally (localStorage).</p>
    </motion.section>
  );
}
