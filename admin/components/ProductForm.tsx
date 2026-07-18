'use client';
import { FormEvent, useEffect, useState } from 'react';
import { categories } from '../lib/useInventory';
import type { Product } from '../types';

interface ProductFormProps {
  product?: Product;
  onSave: (product: Product) => void;
  onCancel?: () => void;
}

type ProductFormState = Omit<Product, 'id'> & { images?: string[] };

const emptyProduct: ProductFormState = {
  name: '',
  brand: '',
  model: '',
  category: 'Surveillance Cameras',
  price: 0,
  stockQuantity: 0,
  description: '',
  image: '',
  images: []
};

export default function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const [form, setForm] = useState<ProductFormState>(emptyProduct);
  const [imageUrl, setImageUrl] = useState('');
  const [preview, setPreview] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [showIcecatModal, setShowIcecatModal] = useState(false);
  const [icecatQuery, setIcecatQuery] = useState('');
  const [icecatResults, setIcecatResults] = useState<string[]>([]);
  const [icecatLoading, setIcecatLoading] = useState(false);
  const [icecatError, setIcecatError] = useState('');
  const [selectedIcecatImage, setSelectedIcecatImage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      const { id, ...rest } = product;
      setForm(rest);
      setPreview(product.image || '');
      setImageUrl(product.image || '');
      setIcecatQuery(product.name || '');
      setSelectedIcecatImage('');
      setIcecatResults([]);
      setIcecatError('');
      setFile(null);
      setError('');
    } else {
      setForm(emptyProduct);
      setPreview('');
      setImageUrl('');
      setIcecatQuery('');
      setSelectedIcecatImage('');
      setIcecatResults([]);
      setIcecatError('');
      setFile(null);
      setError('');
    }
  }, [product]);

  useEffect(() => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') return;
      // Compress before storing: uploaded photos are often several MB, and we
      // keep images inline, so resize to max 1000px and export as WebP to keep
      // the database rows (and the storefront payload) small.
      const img = new window.Image();
      img.onload = () => {
        const maxDim = 1000;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const scale = maxDim / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setPreview(result);
          setForm((prev) => ({ ...prev, image: result }));
          return;
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/webp', 0.8);
        const finalImage = compressed.length < result.length ? compressed : result;
        setPreview(finalImage);
        setForm((prev) => ({ ...prev, image: finalImage }));
      };
      img.onerror = () => {
        setPreview(result);
        setForm((prev) => ({ ...prev, image: result }));
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  }, [file]);

  const isValid = () => {
    return form.name.trim() && form.brand.trim() && form.price > 0 && form.stockQuantity >= 0;
  };

  const icecatSearch = async () => {
    if (!icecatQuery.trim()) {
      setIcecatError('Enter a search term');
      return;
    }

    setIcecatLoading(true);
    setIcecatError('');
    setIcecatResults([]);
    setSelectedIcecatImage('');

    try {
      const response = await fetch('/api/icecat/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: icecatQuery })
      });

      if (!response.ok) {
        setIcecatError('Unable to fetch images');
        setIcecatResults([]);
      } else {
        const result = (await response.json()) as string[];
        setIcecatResults(Array.isArray(result) ? result : []);
        if (!Array.isArray(result) || result.length === 0) {
          setIcecatError('No images found');
        }
      }
    } catch (error) {
      setIcecatError('Search failed. Try again.');
      setIcecatResults([]);
    } finally {
      setIcecatLoading(false);
    }
  };

  const addSelectedIcecatImage = () => {
    if (!selectedIcecatImage) return;

    setForm((prev) => ({
      ...prev,
      images: [...(prev.images ?? []), selectedIcecatImage]
    }));
    setImageUrl(selectedIcecatImage);
    setPreview(selectedIcecatImage);
    setShowIcecatModal(false);
  };

  const selectedImageClass = (url: string) =>
    url === selectedIcecatImage
      ? 'ring-2 ring-accent'
      : 'ring-1 ring-white/10 hover:ring-[#1574B5] transition-all';

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
    <form className="grid gap-4 bg-card p-6 rounded-3xl border border-theme shadow-xl shadow-black/10" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <p className="text-sm uppercase tracking-[0.35em] text-accent">{product ? 'Edit Product' : 'Add Product'}</p>
        <h2 className="text-2xl font-semibold text-primary">{product ? 'Update inventory item' : 'Add new product'}</h2>
      </div>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <label className="block text-sm text-secondary">Product Name *</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="HIK Vision Dome Camera"
            className="w-full rounded-2xl border border-theme bg-card px-4 py-3 text-primary outline-none transition focus:border-[#1574B5] focus:ring-4 focus:ring-[#1574B5]/20"
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm text-secondary">Brand *</label>
          <input
            value={form.brand}
            onChange={(e) => setForm({ ...form, brand: e.target.value })}
            placeholder="HIK Vision"
            className="w-full rounded-2xl border border-theme bg-card px-4 py-3 text-primary outline-none transition focus:border-[#1574B5] focus:ring-4 focus:ring-[#1574B5]/20"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-3">
          <label className="block text-sm text-secondary">Model Number</label>
          <input
            value={form.model}
            onChange={(e) => setForm({ ...form, model: e.target.value })}
            placeholder="DS-2CD2143G2-I"
            className="w-full rounded-2xl border border-theme bg-card px-4 py-3 text-primary outline-none transition focus:border-[#1574B5] focus:ring-4 focus:ring-[#1574B5]/20"
          />
        </div>

        <div className="space-y-3">
          <label htmlFor="product-category" className="block text-sm text-secondary">Category</label>
          <select
            id="product-category"
            title="Select product category"
            aria-label="Select product category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full rounded-2xl border border-theme bg-card px-4 py-3 text-primary outline-none transition focus:border-[#1574B5] focus:ring-4 focus:ring-[#1574B5]/20"
          >
            {categories.map((category) => (
              <option key={category} value={category} className="bg-primary text-primary">
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          <label className="block text-sm text-secondary">Price *</label>
          <input
            type="number"
            min={0}
            value={form.price}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            placeholder="85"
            className="w-full rounded-2xl border border-theme bg-card px-4 py-3 text-primary outline-none transition focus:border-[#1574B5] focus:ring-4 focus:ring-[#1574B5]/20"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <label className="block text-sm text-secondary">Stock Quantity *</label>
          <input
            type="number"
            min={0}
            value={form.stockQuantity}
            onChange={(e) => setForm({ ...form, stockQuantity: Number(e.target.value) })}
            placeholder="12"
            className="w-full rounded-2xl border border-theme bg-card px-4 py-3 text-primary outline-none transition focus:border-[#1574B5] focus:ring-4 focus:ring-[#1574B5]/20"
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm text-secondary">Image URL</label>
          <input
            value={imageUrl}
            onChange={(e) => {
              setImageUrl(e.target.value);
              setForm((prev) => ({ ...prev, image: e.target.value }));
              setPreview(e.target.value);
            }}
            placeholder="https://example.com/image.jpg"
            className="w-full rounded-2xl border border-theme bg-card px-4 py-3 text-primary outline-none transition focus:border-[#1574B5] focus:ring-4 focus:ring-[#1574B5]/20"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3 md:col-span-2">
          <label htmlFor="product-description" className="block text-sm text-secondary">Description</label>
          <textarea
            id="product-description"
            title="Product description"
            placeholder="Enter a short product description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full rounded-2xl border border-theme bg-card px-4 py-3 text-primary outline-none transition focus:border-[#1574B5] focus:ring-4 focus:ring-[#1574B5]/20"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr] items-end">
        <div className="space-y-3">
          <label htmlFor="product-image-upload" className="block text-sm text-secondary">Upload Image</label>
          <input
            id="product-image-upload"
            type="file"
            title="Upload product image"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full rounded-2xl border border-theme bg-card px-4 py-3 text-primary outline-none transition focus:border-[#1574B5] focus:ring-4 focus:ring-[#1574B5]/20"
          />
        </div>

        <div className="flex h-[120px] items-center justify-center overflow-hidden rounded-3xl border border-theme bg-card">
          {preview ? (
            <img src={preview} alt="Preview" className="h-full w-full object-contain" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-secondary">Preview</div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <button
          type="button"
          onClick={() => setShowIcecatModal(true)}
          className="btn bg-card text-primary hover:bg-white/20"
        >
          🔍 Search Icecat Images
        </button>
      </div>

      {showIcecatModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-4xl rounded-3xl border border-theme bg-card p-6 shadow-xl shadow-black/30">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-primary">Search Icecat Images</h3>
                <p className="text-sm text-secondary">Search by product name and select an image.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowIcecatModal(false)}
                className="rounded-2xl border border-theme bg-card px-4 py-2 text-secondary hover:bg-white/10"
              >
                Cancel
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto]">
              <input
                value={icecatQuery}
                onChange={(e) => setIcecatQuery(e.target.value)}
                placeholder="Search Icecat by product name"
                className="w-full rounded-2xl border border-theme bg-card px-4 py-3 text-primary outline-none transition focus:border-[#1574B5] focus:ring-4 focus:ring-[#1574B5]/20"
              />
              <button
                type="button"
                onClick={icecatSearch}
                className="btn bg-accent text-navy hover:brightness-110 disabled:opacity-60"
                disabled={icecatLoading}
              >
                {icecatLoading ? 'Searching...' : 'Search'}
              </button>
            </div>

            {icecatError ? <p className="mt-4 text-sm text-rose-300">{icecatError}</p> : null}

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {icecatResults.map((url) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setSelectedIcecatImage(url)}
                  className={`group overflow-hidden rounded-3xl border bg-card p-0 transition ${selectedImageClass(url)}`}
                >
                  <img
                    src={url}
                    alt="Icecat search result"
                    className="h-40 w-full object-cover transition duration-200 group-hover:scale-105"
                  />
                </button>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={addSelectedIcecatImage}
                disabled={!selectedIcecatImage}
                className="btn bg-accent text-navy hover:brightness-110 disabled:opacity-60"
              >
                Use Selected Image
              </button>
              <button
                type="button"
                onClick={() => setShowIcecatModal(false)}
                className="btn bg-card text-primary hover:bg-white/20"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="btn bg-accent text-navy hover:brightness-110 disabled:opacity-60"
        >
          {submitting ? 'Saving...' : product ? 'Save Changes' : 'Add Product'}
        </button>
        {product && onCancel ? (
          <button type="button" onClick={onCancel} className="btn bg-card text-primary hover:bg-white/20">
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
