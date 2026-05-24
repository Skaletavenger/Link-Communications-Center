'use client';
import { FormEvent, useEffect, useState } from 'react';
import { Product } from '../types';

interface ProductFormProps {
  product?: Product;
  onSave: (product: Product, originalModel?: string) => void;
  onCancel?: () => void;
}

export default function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const [form, setForm] = useState<Product>({ name: '', model: '', category: 'Surveillance Cameras', price: 0, stockQuantity: 0, image: '/placeholder.svg' });
  const [imageUrl, setImageUrl] = useState('');
  const [preview, setPreview] = useState<string>('/placeholder.svg');
  const [file, setFile] = useState<File | null>(null);
  const [originalModel, setOriginalModel] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setForm(product);
      setPreview(product.image || '/placeholder.svg');
      setImageUrl(product.image || '');
      setOriginalModel(product.model);
      setFile(null);
    } else {
      setForm({ name: '', model: '', category: 'Surveillance Cameras', price: 0, stockQuantity: 0, image: '/placeholder.svg' });
      setPreview('/placeholder.svg');
      setImageUrl('');
      setOriginalModel(undefined);
      setFile(null);
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const finalImage = form.image || preview || '/placeholder.svg';
    const productToSave = { ...form, image: finalImage };

    await new Promise((resolve) => setTimeout(resolve, 220));
    onSave(productToSave, originalModel);
    setSubmitting(false);

    if (!originalModel) {
      setForm({ name: '', model: '', category: 'Surveillance Cameras', price: 0, stockQuantity: 0, image: '/placeholder.svg' });
      setPreview('/placeholder.svg');
      setImageUrl('');
      setFile(null);
    }
  };

  return (
    <form className="grid gap-3 bg-white/5 p-4 rounded-lg" onSubmit={handleSubmit}>
      <h2 className="text-lg font-semibold">{product ? 'Edit Product' : 'Add Product'}</h2>
      <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="p-2 rounded bg-white/10 text-white" />
      <input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="Model" className="p-2 rounded bg-white/10 text-white" />
      <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} placeholder="Price" className="p-2 rounded bg-white/10 text-white" />
      <input type="number" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: Number(e.target.value) })} placeholder="Stock Quantity" className="p-2 rounded bg-white/10 text-white" />
      <label className="text-sm text-muted">Image upload</label>
      <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="p-2 rounded bg-white/10 text-white" />
      <label className="text-sm text-muted">or Image URL</label>
      <input value={imageUrl} onChange={(e) => { setImageUrl(e.target.value); setForm((prev) => ({ ...prev, image: e.target.value })); setPreview(e.target.value || '/placeholder.svg'); }} placeholder="https://example.com/image.jpg" className="p-2 rounded bg-white/10 text-white" />
      <div className="h-40 rounded bg-white/10 overflow-hidden">
        <img src={preview || '/placeholder.svg'} alt="Preview" className="h-full w-full object-contain" />
      </div>
      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={submitting} className="btn">
          {submitting ? (
            <span className="inline-flex items-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-r-transparent" />
              Saving...
            </span>
          ) : product ? 'Save Product' : 'Add Product'}
        </button>
        {product && onCancel && (
          <button type="button" onClick={onCancel} className="btn bg-white/10 text-white hover:bg-white/20">Cancel</button>
        )}
      </div>
    </form>
  );
}
