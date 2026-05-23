'use client';
import { useState } from 'react';
import { Product } from '../types';

export default function ProductForm({ onSave }: { onSave: (p: Product) => void }) {
  const [form, setForm] = useState<Product>({ name: '', model: '', category: 'Surveillance Cameras', price: 0, stockQuantity: 0, image: '/placeholder.svg' });

  return (
    <form
      className="grid gap-2 bg-white/3 p-4 rounded"
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          const res = await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
          const data = await res.json();
          onSave(data || form);
        } catch (err) {
          onSave(form);
        }
        setForm({ name: '', model: '', category: 'Surveillance Cameras', price: 0, stockQuantity: 0, image: '/placeholder.svg' });
      }}
    >
      <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="p-2 rounded bg-white/5" />
      <input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="Model" className="p-2 rounded bg-white/5" />
      <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} placeholder="Price" className="p-2 rounded bg-white/5" />
      <input type="number" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: Number(e.target.value) })} placeholder="Stock Quantity" className="p-2 rounded bg-white/5" />
      <button className="btn w-36">Add Product</button>
    </form>
  );
}
