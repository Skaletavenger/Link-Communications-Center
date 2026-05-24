'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { useRouter } from 'next/navigation';
import type { Product } from '../../types';
import LottieLoader from '@/components/LottieLoader';
import ProductForm from '@/components/ProductForm';
import { useToast } from '@/components/ToastContext';
import { useInventory, categories } from '../../lib/useInventory';

const stats = [
  { label: 'Total Products', icon: '📦', key: 'total' },
  { label: 'In Stock', icon: '✅', key: 'inStock' },
  { label: 'Low Stock', icon: '⚠️', key: 'lowStock' },
  { label: 'Out of Stock', icon: '❌', key: 'outOfStock' }
] as const;

function AnimatedCount({ value }: { value: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 500;
    const stepTime = Math.max(20, Math.floor(duration / Math.max(value, 1)));
    const timer = window.setInterval(() => {
      start += 1;
      setCount(Math.min(start, value));
      if (start >= value) {
        window.clearInterval(timer);
      }
    }, stepTime);

    return () => window.clearInterval(timer);
  }, [value]);

  return <span className="text-3xl font-semibold text-white">{count}</span>;
}

export default function DashboardPage() {
  const { products, loaded, addProduct, updateProduct, deleteProduct } = useInventory();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLElement>(null);
  const sectionInView = useInView(ref, { once: true, margin: '-100px' });
  const toast = useToast();

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const query = search.toLowerCase();
      const matchesSearch =
        product.name.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query);
      const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  const totals = useMemo(() => {
    const total = products.length;
    const inStock = products.filter((product) => product.stockQuantity > 0).length;
    const lowStock = products.filter((product) => product.stockQuantity > 0 && product.stockQuantity <= 5).length;
    const outOfStock = products.filter((product) => product.stockQuantity === 0).length;
    return { total, inStock, lowStock, outOfStock };
  }, [products]);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? sessionStorage.getItem('lcc_admin_auth') : null;
    if (stored !== 'true') {
      router.replace('/dashboard/login');
      return;
    }
    setAuthChecked(true);
  }, [router]);

  const handleAddProduct = (product: Product) => {
    const newProduct = { ...product, id: product.id || Date.now().toString() };
    addProduct(newProduct);
    toast.success('Product added successfully.');
  };

  const handleUpdateProduct = (product: Product) => {
    updateProduct(product);
    setEditingProduct(null);
    toast.success('Product updated successfully.');
  };

  const handleDeleteProduct = (product: Product) => {
    if (typeof window !== 'undefined' && !window.confirm(`Delete ${product.name}?`)) {
      return;
    }
    deleteProduct(product.id);
    toast.success('Product deleted successfully.');
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] text-white">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-8 py-6 backdrop-blur-xl text-center">
          <p className="text-lg font-semibold">Checking admin access...</p>
        </div>
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] text-white">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-8 py-6 backdrop-blur-xl text-center">
          <p className="text-lg font-semibold">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={sectionInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="relative min-h-screen container mx-auto px-6 py-12"
    >
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold">Inventory Dashboard</h1>
          <p className="text-muted max-w-2xl">Manage products, stock levels, and inventory details in one secure admin portal.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined') {
              sessionStorage.removeItem('lcc_admin_auth');
            }
            router.replace('/dashboard/login');
          }}
          className="btn rounded-full bg-rose-500/95 px-5 py-3 text-white shadow-lg shadow-rose-500/20 hover:bg-rose-500"
        >
          Logout
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-10">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={sectionInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3 text-2xl">
              <span>{stat.icon}</span>
              <p className="text-sm uppercase tracking-[0.24em] text-white/60">{stat.label}</p>
            </div>
            <div className="mt-6">
              <AnimatedCount value={totals[stat.key]} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <ProductForm onSave={handleAddProduct} />
        </div>

        {editingProduct ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <ProductForm product={editingProduct} onSave={handleUpdateProduct} onCancel={() => setEditingProduct(null)} />
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl text-white/70">
            <p className="font-semibold text-white">Editing panel</p>
            <p className="mt-3 text-sm">Click any product row edit button to open the inline update form.</p>
          </div>
        )}
      </div>

      <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Inventory list</h2>
            <p className="text-sm text-white/70">Filter and search the catalog to manage stock.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, brand, or category"
              className="w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[#00B4FF] focus:ring-4 focus:ring-[#00B4FF]/20 sm:w-[320px]"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[#00B4FF] focus:ring-4 focus:ring-[#00B4FF]/20 sm:w-[220px]"
            >
              <option>All</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-left">
            <thead>
              <tr className="bg-white/5 text-sm uppercase tracking-[0.18em] text-white/50">
                <th className="border-b border-white/10 px-4 py-4">Image</th>
                <th className="border-b border-white/10 px-4 py-4">Name</th>
                <th className="border-b border-white/10 px-4 py-4">Brand</th>
                <th className="border-b border-white/10 px-4 py-4">Model</th>
                <th className="border-b border-white/10 px-4 py-4">Category</th>
                <th className="border-b border-white/10 px-4 py-4">Price</th>
                <th className="border-b border-white/10 px-4 py-4">Stock</th>
                <th className="border-b border-white/10 px-4 py-4">Status</th>
                <th className="border-b border-white/10 px-4 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-white/70">
                    No matching products found. Adjust your search or add a new product.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const status = product.stockQuantity > 5 ? 'In Stock' : product.stockQuantity > 0 ? 'Low Stock' : 'Out of Stock';
                  const statusClass =
                    product.stockQuantity > 5
                      ? 'bg-emerald-500/15 text-emerald-200 border-emerald-400/20'
                      : product.stockQuantity > 0
                      ? 'bg-amber-400/15 text-amber-100 border-amber-300/20'
                      : 'bg-rose-500/15 text-rose-100 border-rose-400/20';

                  return (
                    <tr key={product.id} className="border-b border-white/10">
                    <td className="px-4 py-4 align-middle">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="h-12 w-12 rounded-2xl object-cover" />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-white/50">
                          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="5" width="18" height="14" rx="2" />
                            <path d="M8 5v4" />
                            <path d="M16 5v4" />
                            <path d="M12 11v6" />
                          </svg>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 align-middle">
                      <div className="font-semibold">{product.name}</div>
                      <div className="text-xs text-white/60">{product.description}</div>
                    </td>
                    <td className="px-4 py-4 align-middle">{product.brand}</td>
                    <td className="px-4 py-4 align-middle">{product.model}</td>
                    <td className="px-4 py-4 align-middle">{product.category}</td>
                    <td className="px-4 py-4 align-middle text-[#00B4FF] font-semibold">${product.price}</td>
                    <td className="px-4 py-4 align-middle">{product.stockQuantity}</td>
                    <td className="px-4 py-4 align-middle">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusClass}`}>{status}</span>
                    </td>
                    <td className="px-4 py-4 align-middle space-x-2">
                      <button
                        type="button"
                        onClick={() => setEditingProduct(product)}
                        className="btn rounded-full bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(product)}
                        className="btn rounded-full bg-rose-500/90 px-4 py-2 text-sm text-white hover:bg-rose-500"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.section>
  );
}
