'use client'
import { useState, useEffect, useRef, useCallback, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useInventory, Product, formatUGX } from '../../lib/useInventory'

const CATEGORIES = ['Surveillance Cameras', 'Access Control', 'Networking', 'Intercoms', 'Alarms', 'Other']
const TIMEOUT_MS = 15 * 60 * 1000 // 15 minutes

function CameraIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00B4FF" strokeWidth="1.5">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  )
}

function Skeleton() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="h-10 w-64 bg-white/10 rounded-lg animate-pulse mb-8" />
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-white/10 rounded-xl animate-pulse" />)}
        </div>
        <div className="h-64 bg-white/10 rounded-xl animate-pulse mb-6" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-white/10 rounded-lg animate-pulse" />)}
        </div>
      </div>
    </div>
  )
}

function StockBadge({ qty }: { qty: number }) {
  if (qty === 0) return <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">Out of Stock</span>
  if (qty <= 5) return <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 animate-pulse">Low Stock</span>
  return <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30">In Stock</span>
}

const emptyForm = { name: '', brand: '', model: '', category: 'Surveillance Cameras', price: 0, stockQuantity: 0, description: '', image: '' }

export default function DashboardPage() {
  const router = useRouter()
  const { products, loaded, addProduct, updateProduct, deleteProduct } = useInventory()
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Omit<Product, 'id'>>(emptyForm)
  const [editId, setEditId] = useState<string | null>(null)
  const [imgPreview, setImgPreview] = useState('')
  const [toast, setToast] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const [authed, setAuthed] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const warningRef = useRef<NodeJS.Timeout | null>(null)

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('lcc_admin_auth')
      sessionStorage.removeItem('lcc_last_active')
    }
    router.replace('/dashboard/login')
  }, [router])

  const resetTimer = useCallback(() => {
    if (typeof window === 'undefined') return
    // Update last active timestamp
    sessionStorage.setItem('lcc_last_active', Date.now().toString())
    // Clear existing timers
    if (timerRef.current) clearTimeout(timerRef.current)
    if (warningRef.current) clearTimeout(warningRef.current)
    // Hide warning when user is active
    setShowWarning(false)
    // Set new 15 min timer
    timerRef.current = setTimeout(() => {
      logout()
    }, TIMEOUT_MS)
    // Set warning timer for 13 minutes
    warningRef.current = setTimeout(() => {
      setShowWarning(true)
    }, 13 * 60 * 1000)
  }, [logout])

  useEffect(() => {
    if (typeof window === 'undefined') return
    // Check auth ONCE on mount
    const auth = sessionStorage.getItem('lcc_admin_auth')
    if (auth !== 'true') {
      router.replace('/dashboard/login')
      return
    }
    // Check if session already expired (tab was left open)
    const lastActive = sessionStorage.getItem('lcc_last_active')
    if (lastActive) {
      const elapsed = Date.now() - parseInt(lastActive)
      if (elapsed > TIMEOUT_MS) {
        logout()
        return
      }
    }
    // Auth is valid - show dashboard
    setAuthed(true)
    // Start inactivity timer
    resetTimer()
    // Listen for any user activity to reset the timer
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click']
    events.forEach(e => window.addEventListener(e, resetTimer))
    return () => {
      // Cleanup on unmount
      if (timerRef.current) clearTimeout(timerRef.current)
      if (warningRef.current) clearTimeout(warningRef.current)
      events.forEach(e => window.removeEventListener(e, resetTimer))
    }
  }, [router, logout, resetTimer])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('lcc_admin_auth')
      sessionStorage.removeItem('lcc_last_active')
    }
    router.replace('/dashboard/login')
  }

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const b64 = ev.target?.result as string
      setForm(f => ({ ...f, image: b64 }))
      setImgPreview(b64)
    }
    reader.readAsDataURL(file)
  }

  const handleImageUrl = (url: string) => {
    setForm(f => ({ ...f, image: url }))
    setImgPreview(url)
  }

  const handleSubmit = () => {
    if (!form.name || !form.brand || !form.price) {
      showToast('Please fill in Name, Brand, and Price')
      return
    }
    if (editId) {
      updateProduct(editId, form)
      showToast('Product updated!')
    } else {
      addProduct(form)
      showToast('Product added!')
    }
    setForm(emptyForm)
    setImgPreview('')
    setEditId(null)
    setShowForm(false)
  }

  const handleEdit = (p: Product) => {
    setForm({ name: p.name, brand: p.brand, model: p.model, category: p.category, price: p.price, stockQuantity: p.stockQuantity, description: p.description, image: p.image })
    setImgPreview(p.image)
    setEditId(p.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this product?')) {
      deleteProduct(id)
      showToast('Product deleted.')
    }
  }

  if (!authed) return <Skeleton />

  if (!loaded) return <Skeleton />

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.model.toLowerCase().includes(search.toLowerCase())
    const matchCat = filterCat === 'All' || p.category === filterCat
    return matchSearch && matchCat
  })

  const total = products.length
  const inStock = products.filter(p => p.stockQuantity > 5).length
  const lowStock = products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= 5).length
  const outStock = products.filter(p => p.stockQuantity === 0).length

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      {/* Warning Banner */}
      {showWarning && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-black text-center py-3 font-bold text-sm cursor-pointer" onClick={resetTimer}>
          ⚠️ Session expiring in 2 minutes due to inactivity. Click anywhere to stay logged in.
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-[#00B4FF] text-black font-bold px-6 py-3 rounded-xl shadow-2xl animate-bounce">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="border-b border-white/10 bg-[#0d1428]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Inventory Dashboard</h1>
            <p className="text-sm text-white/40">Link Communications Center — Admin</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyForm); setImgPreview('') }}
              className="px-4 py-2 bg-[#00B4FF] text-black font-bold rounded-lg hover:bg-[#00d4ff] transition-all"
            >
              {showForm ? '✕ Cancel' : '+ Add Product'}
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-white/20 text-white/60 rounded-lg hover:bg-white/10 transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Products', value: total, color: '#00B4FF' },
            { label: 'In Stock', value: inStock, color: '#00FF88' },
            { label: 'Low Stock', value: lowStock, color: '#FFB800' },
            { label: 'Out of Stock', value: outStock, color: '#FF4444' },
          ].map(stat => (
            <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-white/50 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Add / Edit Form */}
        {showForm && (
          <div className="bg-white/5 border border-[#00B4FF]/30 rounded-2xl p-6 mb-8 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-[#00B4FF] mb-6">
              {editId ? '✏️ Edit Product' : '➕ Add New Product'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="text-white/60 text-sm mb-1 block">Product Name *</label>
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00B4FF] transition-all"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. HIK Vision Dome Camera"
                />
              </div>
              {/* Brand */}
              <div>
                <label className="text-white/60 text-sm mb-1 block">Brand *</label>
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00B4FF] transition-all"
                  value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
                  placeholder="e.g. HIK Vision"
                />
              </div>
              {/* Model */}
              <div>
                <label className="text-white/60 text-sm mb-1 block">Model Number</label>
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00B4FF] transition-all"
                  value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))}
                  placeholder="e.g. DS-2CD2143G2-I"
                />
              </div>
              {/* Category */}
              <div>
                <label className="text-white/60 text-sm mb-1 block">Category</label>
                <select
                  className="w-full bg-[#0a0f1e] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00B4FF] transition-all"
                  value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {/* Price */}
              <div>
                <label className="text-white/60 text-sm mb-1 block">Price (UGX) *</label>
                <input
                  type="number" min="0"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00B4FF] transition-all"
                  value={form.price || ''} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
                  placeholder="e.g. 320000"
                />
              </div>
              {/* Stock */}
              <div>
                <label className="text-white/60 text-sm mb-1 block">Stock Quantity *</label>
                <input
                  type="number" min="0"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00B4FF] transition-all"
                  value={form.stockQuantity || ''} onChange={e => setForm(f => ({ ...f, stockQuantity: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
              {/* Description */}
              <div className="md:col-span-2">
                <label className="text-white/60 text-sm mb-1 block">Description</label>
                <textarea
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00B4FF] transition-all resize-none"
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Brief product description..."
                />
              </div>
              {/* Image */}
              <div className="md:col-span-2">
                <label className="text-white/60 text-sm mb-1 block">Product Image</label>
                <div className="flex gap-4 items-start">
                  <div className="flex-1 space-y-2">
                    <input
                      type="url"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00B4FF] transition-all"
                      placeholder="Paste image URL..."
                      onChange={e => handleImageUrl(e.target.value)}
                    />
                    <div className="text-center text-white/30 text-xs">— or —</div>
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="w-full border border-dashed border-white/20 rounded-lg py-2 text-white/50 hover:border-[#00B4FF] hover:text-[#00B4FF] transition-all text-sm"
                    >
                      📁 Upload image file
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
                  </div>
                  {/* Preview */}
                  <div className="w-28 h-28 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {imgPreview ? (
                      <img src={imgPreview} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <CameraIcon />
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-[#00B4FF] text-black font-bold rounded-xl hover:bg-[#00d4ff] transition-all"
              >
                {editId ? 'Save Changes' : 'Add Product'}
              </button>
              <button
                onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm); setImgPreview('') }}
                className="px-8 py-3 border border-white/20 text-white/60 rounded-xl hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Search + Filter */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <input
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#00B4FF] transition-all"
            placeholder="Search by name, brand, or model..."
            value={search} onChange={e => setSearch(e.target.value)}
          />
          <select
            className="bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00B4FF] transition-all"
            value={filterCat} onChange={e => setFilterCat(e.target.value)}
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Product Count */}
        <p className="text-white/40 text-sm mb-4">{filtered.length} product{filtered.length !== 1 ? 's' : ''} found</p>

        {/* Product Table */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-white/30">
            <div className="mb-4 flex justify-center"><CameraIcon /></div>
            <p className="text-lg">No products found.</p>
            <p className="text-sm mt-2">Click &quot;+ Add Product&quot; to add your first item.</p>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-[60px_1fr_1fr_1fr_80px_80px_120px_100px] gap-4 px-4 py-3 border-b border-white/10 text-white/40 text-xs font-bold uppercase tracking-wider">
              <span>Image</span>
              <span>Name</span>
              <span>Brand / Model</span>
              <span>Category</span>
              <span>Price</span>
              <span>Stock</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            {/* Rows */}
            {filtered.map(p => (
              <div
                key={p.id}
                className="grid grid-cols-[60px_1fr_1fr_1fr_80px_80px_120px_100px] gap-4 px-4 py-4 border-b border-white/5 hover:bg-white/5 transition-all items-center"
              >
                {/* Image */}
                <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00B4FF" strokeWidth="1.5">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                  )}
                </div>
                {/* Name */}
                <div>
                  <p className="text-white font-medium text-sm">{p.name}</p>
                  <p className="text-white/30 text-xs truncate max-w-[180px]">{p.description}</p>
                </div>
                {/* Brand/Model */}
                <div>
                  <p className="text-white/80 text-sm">{p.brand}</p>
                  <p className="text-white/40 text-xs font-mono">{p.model}</p>
                </div>
                {/* Category */}
                <span className="text-white/60 text-xs bg-white/10 px-2 py-1 rounded-full w-fit">{p.category}</span>
                {/* Price */}
                <span className="text-[#00B4FF] font-bold text-sm">{formatUGX(p.price)}</span>
                {/* Stock */}
                <span className="text-white/80 text-sm font-mono">{p.stockQuantity}</span>
                {/* Status */}
                <StockBadge qty={p.stockQuantity} />
                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(p)}
                    className="px-3 py-1 bg-white/10 hover:bg-[#00B4FF]/20 hover:text-[#00B4FF] text-white/60 rounded-lg text-xs transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="px-3 py-1 bg-white/10 hover:bg-red-500/20 hover:text-red-400 text-white/60 rounded-lg text-xs transition-all"
                  >
                    Del
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
