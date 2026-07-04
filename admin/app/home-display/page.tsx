'use client'

import { useEffect, useState, ChangeEvent, FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus } from 'lucide-react'
import Image from 'next/image'

type DisplayItem = {
  id: string
  name: string
  price: number
  category: string
  description?: string
  image_url?: string
}

type ItemForm = {
  name: string
  price: number | string
  category: string
  description: string
  image_url: string
}

const CATEGORY_OPTIONS = ['Indoor Cameras', 'Outdoor Cameras', 'Camera Kits', 'PTZ Cameras', 'NVRs']

const INITIAL_FORM: ItemForm = {
  name: '',
  price: 0,
  category: CATEGORY_OPTIONS[0],
  description: '',
  image_url: '',
}

const CONTENT_ID = 'home_display_surveillance'

function formatUGX(value?: number | string) {
  const amount = Number(value ?? 0) || 0
  return `UGX ${amount.toLocaleString()}`
}

export default function HomeDisplayPage() {
  const [items, setItems] = useState<DisplayItem[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<DisplayItem | null>(null)
  const [form, setForm] = useState<ItemForm>(INITIAL_FORM)
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    fetchItems()
  }, [])

  async function fetchItems() {
    setLoading(true)
    const { data, error } = await supabase
      .from('site_content')
      .select('content')
      .eq('id', CONTENT_ID)
      .maybeSingle()

    if (error) {
      console.error('fetch home display error', error)
    }

    if (data?.content) {
      try {
        const parsed = JSON.parse(data.content) as DisplayItem[]
        setItems(Array.isArray(parsed) ? parsed : [])
      } catch {
        setItems([])
      }
    } else {
      setItems([])
    }
    setLoading(false)
  }

  async function persist(nextItems: DisplayItem[]) {
    const { error } = await supabase
      .from('site_content')
      .upsert({
        id: CONTENT_ID,
        content: JSON.stringify(nextItems),
        updated_at: new Date().toISOString(),
      })

    if (error) {
      alert('Failed to save. Run supabase/setup.sql if the site_content table is missing.')
      return false
    }
    return true
  }

  async function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    const ext = file.name.split('.').pop()
    const fileName = `home-display-${Date.now()}.${ext}`
    const { data, error } = await supabase.storage.from('brand-assets').upload(fileName, file, { upsert: true })

    if (!error && data) {
      const { data: urlData } = supabase.storage.from('brand-assets').getPublicUrl(data.path)
      setForm(prev => ({ ...prev, image_url: urlData.publicUrl }))
    }

    setUploadingImage(false)
  }

  function removeImage() {
    setForm(prev => ({ ...prev, image_url: '' }))
  }

  async function saveItem(e: FormEvent) {
    e.preventDefault()

    const payload: DisplayItem = {
      id: editingItem?.id || `hd-${Date.now()}`,
      name: form.name,
      price: Number(form.price) || 0,
      category: form.category,
      description: form.description || '',
      image_url: form.image_url || '',
    }

    let nextItems: DisplayItem[]
    if (editingItem) {
      nextItems = items.map(i => (i.id === editingItem.id ? payload : i))
    } else {
      nextItems = [...items, payload]
    }

    const ok = await persist(nextItems)
    if (ok) {
      setItems(nextItems)
      setShowForm(false)
      setEditingItem(null)
      setForm(INITIAL_FORM)
    }
  }

  async function deleteItem(id: string) {
    if (!confirm('Remove this item from the homepage display?')) return
    const nextItems = items.filter(i => i.id !== id)
    const ok = await persist(nextItems)
    if (ok) setItems(nextItems)
  }

  function openEdit(item: DisplayItem) {
    setEditingItem(item)
    setForm({
      name: item.name,
      price: item.price,
      category: item.category,
      description: item.description || '',
      image_url: item.image_url || '',
    })
    setShowForm(true)
  }

  function openNew() {
    setEditingItem(null)
    setForm(INITIAL_FORM)
    setShowForm(true)
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Home Display</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Curate exactly what shows in the &ldquo;Surveillance Cameras&rdquo; section on the landing page. If this list is empty, the site falls back to pulling matching products from your regular catalog.
            </p>
          </div>

          <button
            type="button"
            onClick={openNew}
            className="rounded-xl bg-[#1574B5] px-5 py-3 text-white font-semibold hover:bg-[#125d8f] transition"
          >
            <Plus size={16} /> Add Item
          </button>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white shadow-sm" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <p className="text-xl font-semibold text-slate-900">No curated items yet</p>
            <p className="mt-3 text-sm text-slate-500">
              The homepage is currently pulling straight from your product catalog by category. Add items here to hand-pick exactly what shows and control their images.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {items.map(item => (
              <div key={item.id} className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
                <div className="relative h-52 bg-slate-100 flex items-center justify-center p-3">
                  {item.image_url ? (
                    <Image src={item.image_url} alt={item.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-contain p-3" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-500">No image</div>
                  )}
                </div>
                <div className="p-5 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#1574B5]">{item.category}</p>
                  <h2 className="text-lg font-semibold text-slate-900">{item.name}</h2>
                  {item.description && <p className="text-sm text-slate-500 line-clamp-2">{item.description}</p>}
                  <p className="text-xl font-bold text-slate-900">{formatUGX(item.price)}</p>
                </div>
                <div className="p-5 border-t border-slate-200 bg-slate-50 flex gap-3">
                  <button type="button" onClick={() => openEdit(item)} className="flex-1 rounded-xl bg-[#1574B5] px-4 py-3 text-white font-semibold hover:bg-[#125d8f] transition">
                    Edit
                  </button>
                  <button type="button" onClick={() => deleteItem(item.id)} className="flex-1 rounded-xl bg-[#ED2124] px-4 py-3 text-white font-semibold hover:bg-[#c20f1d] transition">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-[#1574B5]">Home Display</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">{editingItem ? 'Edit Item' : 'Add Item'}</h2>
              </div>
              <button type="button" onClick={() => setShowForm(false)} className="text-slate-500 hover:text-slate-900">Cancel</button>
            </div>

            <form onSubmit={saveItem} className="mt-6 grid gap-6">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Name</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900"
                  required
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Category</span>
                  <select
                    value={form.category}
                    onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900"
                  >
                    {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Price UGX</span>
                  <input
                    type="number"
                    value={form.price}
                    onChange={e => setForm(prev => ({ ...prev, price: e.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900"
                    min={0}
                    required
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Description</span>
                <textarea
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900"
                  rows={3}
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2 items-center">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Image</span>
                  <div className="mt-2 flex items-center gap-4">
                    {form.image_url ? (
                      <div className="relative h-32 w-32">
                        <Image src={form.image_url} alt="Home display item" fill sizes="128px" className="rounded-xl object-contain bg-slate-100 p-2" />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute right-0 top-0 rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-900 shadow"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="flex h-32 w-32 items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-500">No image</div>
                    )}
                  </div>
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Upload image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="mt-2 block w-full text-sm text-slate-700"
                  />
                  {uploadingImage && <p className="mt-2 text-xs text-slate-500">Uploading...</p>}
                </label>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button type="button" onClick={() => setShowForm(false)} className="rounded-2xl border border-slate-300 px-5 py-3 text-slate-700 hover:bg-slate-50 transition">
                  Cancel
                </button>
                <button type="submit" className="rounded-2xl bg-[#1574B5] px-5 py-3 text-white font-semibold hover:bg-[#125d8f] transition">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
