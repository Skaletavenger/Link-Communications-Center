'use client';
import { FormEvent, useEffect, useState } from 'react';
import { categories } from '../lib/useInventory';
import type { Product } from '../types';

interface ProductFormProps {
  product?: Product;
  onSave: (product: Product) => void;
  onCancel?: () => void;
}

const emptyProduct: Omit<Product, 'id'> = {
  name: '',
  brand: '',
  model: '',
  category: 'Surveillance Cameras',
  price: 0,
  stockQuantity: 0,
  description: '',
  image: ''
};

export default function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const [form, setForm] = useState<Omit<Product, 'id'>>(emptyProduct);
  const [imageUrl, setImageUrl] = useState('');
  const [preview, setPreview] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      const { id, ...rest } = product;
      setForm(rest);
      setPreview(product.image || '');
      setImageUrl(product.image || '');
      setFile(null);
      setError('');
    } else {
      setForm(emptyProduct);
      setPreview('');
      setImageUrl('');
      setFile(null);
      setError('');
    }
  }, [product]);

  useEffect(() => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        setPreview(result);
        setForm((prev) => ({ ...prev, image: result }));
      }
    };
    reader.readAsDataURL(file);
  }, [file]);

  const isValid = () => {
    return form.name.trim() && form.brand.trim() && form.price > 0 && form.stockQuantity >= 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValid()) {
      setError('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    const finalImage = form.image || preview || '';
    const productToSave = { ...form, image: finalImage } as Product;
    await new Promise((resolve) => setTimeout(resolve, 220));
    onSave(productToSave);
    setSubmitting(false);

    if (!product) {
      setForm(emptyProduct);
      setPreview('');
      setImageUrl('');
      setFile(null);
      setError('');
    }
  };

  return (
    <form className="grid gap-4 bg-white/5 p-6 rounded-3xl border border-white/10 shadow-xl shadow-black/10" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <p className="text-sm uppercase tracking-[0.35em] text-[#73d5ff]">{product ? 'Edit Product' : 'Add Product'}</p>
        <h2 className="text-2xl font-semibold">{product ? 'Update inventory item' : 'Add new product'}</h2>
      </div>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <label className="block text-sm text-white/80">Product Name *</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="HIK Vision Dome Camera"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[#00B4FF] focus:ring-4 focus:ring-[#00B4FF]/20"
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm text-white/80">Brand *</label>
          <input
            value={form.brand}
            onChange={(e) => setForm({ ...form, brand: e.target.value })}
            placeholder="HIK Vision"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[#00B4FF] focus:ring-4 focus:ring-[#00B4FF]/20"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-3">
          <label className="block text-sm text-white/80">Model Number</label>
          <input
            value={form.model}
            onChange={(e) => setForm({ ...form, model: e.target.value })}
            placeholder="DS-2CD2143G2-I"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[#00B4FF] focus:ring-4 focus:ring-[#00B4FF]/20"
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm text-white/80">Category</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[#00B4FF] focus:ring-4 focus:ring-[#00B4FF]/20"
          >
            {categories.map((category) => (
              <option key={category} value={category} className="bg-[#0a0f1e] text-white">
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          <label className="block text-sm text-white/80">Price *</label>
          <input
            type="number"
            min={0}
            value={form.price}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            placeholder="85"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[#00B4FF] focus:ring-4 focus:ring-[#00B4FF]/20"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <label className="block text-sm text-white/80">Stock Quantity *</label>
          <input
            type="number"
            min={0}
            value={form.stockQuantity}
            onChange={(e) => setForm({ ...form, stockQuantity: Number(e.target.value) })}
            placeholder="12"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[#00B4FF] focus:ring-4 focus:ring-[#00B4FF]/20"
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm text-white/80">Image URL</label>
          <input
            value={imageUrl}
            onChange={(e) => {
              setImageUrl(e.target.value);
              setForm((prev) => ({ ...prev, image: e.target.value }));
              setPreview(e.target.value);
            }}
            placeholder="https://example.com/image.jpg"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[#00B4FF] focus:ring-4 focus:ring-[#00B4FF]/20"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3 md:col-span-2">
          <label className="block text-sm text-white/80">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[#00B4FF] focus:ring-4 focus:ring-[#00B4FF]/20"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr] items-end">
        <div className="space-y-3">
          <label className="block text-sm text-white/80">Upload Image</label>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[#00B4FF] focus:ring-4 focus:ring-[#00B4FF]/20"
          />
        </div>

        <div className="flex h-[120px] items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-white/5">
          {preview ? (
            <img src={preview} alt="Preview" className="h-full w-full object-contain" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-white/60">Preview</div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="btn bg-[#00B4FF] text-navy hover:brightness-110 disabled:opacity-60"
        >
          {submitting ? 'Saving...' : product ? 'Save Changes' : 'Add Product'}
        </button>
        {product && onCancel ? (
          <button type="button" onClick={onCancel} className="btn bg-white/10 text-white hover:bg-white/20">
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
