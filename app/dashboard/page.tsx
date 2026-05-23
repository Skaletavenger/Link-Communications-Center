'use client';
import { useEffect, useMemo, useState } from 'react';
import { Product } from '../../types';
import { seedProducts } from '../../lib/seed';
import ProductCard from '../../components/ProductCard';
import ProductForm from '../../components/ProductForm';

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('API unavailable');
        const apiItems = await res.json();
        if (mounted && Array.isArray(apiItems) && apiItems.length > 0) {
          setProducts(apiItems);
          localStorage.setItem('lcc_products', JSON.stringify(apiItems));
          return;
        }
      } catch (e) {
        // fallback to localStorage / seed
      }

      const data = localStorage.getItem('lcc_products');
      if (data) setProducts(JSON.parse(data));
      else {
        localStorage.setItem('lcc_products', JSON.stringify(seedProducts));
        setProducts(seedProducts);
      }
    })();
    return () => { mounted = false };
  }, []);

  const save = (next: Product[]) => {
    setProducts(next);
    localStorage.setItem('lcc_products', JSON.stringify(next));
  };

  const remove = (model: string) => save(products.filter((p) => p.model !== model));
  const add = (p: Product) => save([p, ...products]);

  const filtered = useMemo(() => products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.model.toLowerCase().includes(query.toLowerCase())), [products, query]);

  return (
    <section className="container mx-auto px-6 py-12">
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
        <div className="w-72">
          <ProductForm onSave={add} />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {filtered.map((p) => (
          <div key={p.model} className="glass p-4 rounded">
            <ProductCard product={p} />
            <div className="flex gap-2 mt-4">
              <button className="btn" onClick={() => navigator.clipboard.writeText(p.model)}>Copy Model</button>
              <button className="btn" onClick={() => remove(p.model)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
      <p className="text-sm text-muted">Manage products locally (localStorage).</p>
    </section>
  );
}
