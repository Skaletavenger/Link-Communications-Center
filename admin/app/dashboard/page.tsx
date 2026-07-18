'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useInventory, Product, formatUGX, CATEGORIES } from '../../lib/useInventory'
import { supabase } from '../../lib/supabase'
import LogoUploadPanel from '../../components/LogoUploadPanel'
import StatsPanel from '../../components/StatsPanel'
import Image from 'next/image'

type ContactMessage = {
  id: string
  name: string
  email: string
  message: string
  read: boolean
  created_at: string
}
const TIMEOUT_MS = 15 * 60 * 1000 // 15 minutes

function CameraIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1574B5" strokeWidth="1.5">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  )
}

function Skeleton() {
  return (
    <div className="min-h-screen bg-primary p-6">
      <div className="max-w-7xl mx-auto">
        <div className="h-10 w-64 bg-card rounded-lg animate-pulse mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-card rounded-xl animate-pulse" />)}
        </div>
        <div className="h-64 bg-card rounded-xl animate-pulse mb-6" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-card rounded-lg animate-pulse" />)}
        </div>
      </div>
    </div>
  )
}

function StockBadge({ qty }: { qty: number }) {
  if (qty === 0) return <span className="px-2 py-1 rounded-full text-xs font-bold bg-[#ED2124]/20 text-[#ED2124] border border-[#ED2124]/30">Out of Stock</span>
  if (qty <= 5) return <span className="px-2 py-1 rounded-full text-xs font-bold bg-[#F47821]/20 text-[#F47821] border border-[#F47821]/30 animate-pulse">Low Stock</span>
  return <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30">In Stock</span>
}

const emptyForm: Omit<Product, 'id'> = {
  name: '',
  brand: '',
  model: '',
  category: 'Surveillance Cameras',
  price: 0,
  stockQuantity: 0,
  description: '',
  image: '',
  images: []
}

const SLOT_LABELS = ['Front', 'Side', 'Back', 'Box', 'Other']

export default function DashboardPage() {
  const router = useRouter()
  const { products, loaded, addProduct, updateProduct, deleteProduct } = useInventory()
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Omit<Product, 'id'>>(emptyForm)
  const [editId, setEditId] = useState<string | null>(null)
  const [toast, setToast] = useState('')
  const [authed, setAuthed] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [userCount, setUserCount] = useState(0)
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [showIcecatModal, setShowIcecatModal] = useState(false)
  const [icecatQuery, setIcecatQuery] = useState('')
  const [icecatResults, setIcecatResults] = useState<string[]>([])
  const [icecatLoading, setIcecatLoading] = useState(false)
  const [icecatError, setIcecatError] = useState('')
  const [selectedIcecatImage, setSelectedIcecatImage] = useState('')
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const warningRef = useRef<NodeJS.Timeout | null>(null)

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('lcc_admin_auth')
      sessionStorage.removeItem('lcc_last_active')
    }
    router.replace('/dashboard/login')
  }, [router])

  const icecatSearch = async () => {
    if (!icecatQuery.trim()) {
      setIcecatError('Enter a search term')
      return
    }

    setIcecatLoading(true)
    setIcecatError('')
    setIcecatResults([])
    setSelectedIcecatImage('')

    try {
      const response = await fetch('/api/icecat/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: icecatQuery.trim() })
      })

      const json = await response.json()
      if (!response.ok || !Array.isArray(json)) {
        const errorMessage = typeof json?.error === 'string' ? json.error : 'Unable to fetch images'
        setIcecatError(errorMessage)
        setIcecatResults([])
      } else {
        setIcecatResults(json)
        if (json.length === 0) {
          setIcecatError('No images found')
        }
      }
    } catch (error) {
      setIcecatError('Search failed. Try again.')
      setIcecatResults([])
    } finally {
      setIcecatLoading(false)
    }
  }

  const addSelectedIcecatImage = () => {
    if (!selectedIcecatImage) return

    const updatedImages = [...(form.images ?? [])]
    if (updatedImages.length === 0) {
      updatedImages[0] = selectedIcecatImage
    } else {
      updatedImages[0] = selectedIcecatImage
    }

    setForm((f) => ({
      ...f,
      images: updatedImages.filter((img) => Boolean(img?.trim())),
      image: selectedIcecatImage
    }))
    setShowIcecatModal(false)
  }

  const selectedImageClass = (url: string) =>
    url === selectedIcecatImage
      ? 'ring-2 ring-accent'
      : 'ring-1 ring-white/10 hover:ring-[#1574B5] transition-all'

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

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setMessages(data as ContactMessage[])
  }

  useEffect(() => {
    const fetchUserCount = async () => {
      const { count } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
      setUserCount(count || 0)
    }
    fetchUserCount()
    fetchMessages()
  }, [])

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

  const handleSubmit = () => {
    if (!form.name || !form.brand || !form.price) {
      showToast('Please fill in Name, Brand, and Price')
      return
    }
    const images = (form.images ?? []).filter((img) => Boolean(img?.trim()))
    const payload: Omit<Product, 'id'> = {
      ...form,
      images,
      image: images[0] || form.image || ''
    }
    if (editId) {
      updateProduct(editId, payload)
      showToast('Product updated!')
    } else {
      addProduct(payload)
      showToast('Product added!')
    }
    setForm(emptyForm)
    setEditId(null)
    setShowForm(false)
  }

  const handleEdit = (p: Product) => {
    const images = p.images?.length ? [...p.images] : p.image ? [p.image] : []
    setForm({
      name: p.name,
      brand: p.brand,
      model: p.model,
      category: p.category,
      price: p.price,
      stockQuantity: p.stockQuantity,
      description: p.description,
      image: p.image,
      images
    })
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
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Warning Banner */}
      {showWarning && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-black text-center py-3 font-bold text-sm cursor-pointer" onClick={resetTimer}>
          ⚠️ Session expiring in 2 minutes due to inactivity. Click anywhere to stay logged in.
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-accent text-black font-bold px-6 py-3 rounded-xl shadow-2xl animate-bounce">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="border-b backdrop-blur-md sticky top-0 z-40" style={{ background: 'var(--nav-bg)', borderColor: 'var(--nav-border)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Inventory Dashboard</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Link Communications Center — Admin</p>
          </div>
          <div className="flex gap-3 items-center">
            <button
              onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyForm) }}
              className="px-4 py-2 bg-accent text-black font-bold rounded-lg hover:bg-[#1a86cc] transition-all"
            >
              {showForm ? '✕ Cancel' : '+ Add Product'}
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-theme text-secondary rounded-lg hover:bg-card transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total Products', value: total, color: '#1574B5' },
            { label: 'In Stock', value: inStock, color: '#00FF88' },
            { label: 'Low Stock', value: lowStock, color: '#FFB800' },
            { label: 'Out of Stock', value: outStock, color: '#FF4444' },
            { label: 'Registered Users', value: userCount, color: '#9333ea' },
          ].map(stat => (
            <div key={stat.label} className="rounded-xl p-4 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
              <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
              <p className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Add / Edit Form */}
        {showForm && (
          <div className="bg-card border border-[#1574B5]/30 rounded-2xl p-6 mb-8 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-accent mb-6">
              {editId ? '✏️ Edit Product' : '➕ Add New Product'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="text-secondary text-sm mb-1 block">Product Name *</label>
                <input
                  className="w-full bg-card border border-theme rounded-lg px-4 py-2 text-primary focus:outline-none focus:border-[#1574B5] transition-all"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. HIK Vision Dome Camera"
                />
              </div>
              {/* Brand */}
              <div>
                <label className="text-secondary text-sm mb-1 block">Brand *</label>
                <input
                  className="w-full bg-card border border-theme rounded-lg px-4 py-2 text-primary focus:outline-none focus:border-[#1574B5] transition-all"
                  value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
                  placeholder="e.g. HIK Vision"
                />
              </div>
              {/* Model */}
              <div>
                <label className="text-secondary text-sm mb-1 block">Model Number</label>
                <input
                  className="w-full bg-card border border-theme rounded-lg px-4 py-2 text-primary focus:outline-none focus:border-[#1574B5] transition-all"
                  value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))}
                  placeholder="e.g. DS-2CD2143G2-I"
                />
              </div>
              {/* Category */}
              <div>
                <label className="text-secondary text-sm mb-1 block">Category</label>
                <select
                  className="w-full bg-primary border border-theme rounded-lg px-4 py-2 text-primary focus:outline-none focus:border-[#1574B5] transition-all"
                  value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {/* Price */}
              <div>
                <label className="text-secondary text-sm mb-1 block">Price (UGX) *</label>
                <input
                  type="number" min="0"
                  className="w-full bg-card border border-theme rounded-lg px-4 py-2 text-primary focus:outline-none focus:border-[#1574B5] transition-all"
                  value={form.price || ''} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
                  placeholder="e.g. 320000"
                />
              </div>
              {/* Stock */}
              <div>
                <label className="text-secondary text-sm mb-1 block">Stock Quantity *</label>
                <input
                  type="number" min="0"
                  className="w-full bg-card border border-theme rounded-lg px-4 py-2 text-primary focus:outline-none focus:border-[#1574B5] transition-all"
                  value={form.stockQuantity || ''} onChange={e => setForm(f => ({ ...f, stockQuantity: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
              {/* Description */}
              <div className="md:col-span-2">
                <label className="text-secondary text-sm mb-1 block">Description</label>
                <textarea
                  rows={3}
                  className="w-full bg-card border border-theme rounded-lg px-4 py-2 text-primary focus:outline-none focus:border-[#1574B5] transition-all resize-none"
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Brief product description..."
                />
              </div>
              {/* Multi-image upload */}
              <div className="md:col-span-2">
                <label className="text-secondary text-sm font-medium mb-2 block">
                  Product Images (up to 5)
                </label>
                <p className="text-muted text-xs mb-3">
                  Add front view, side view, back view, box view etc. First image is the main display image.
                </p>

                <div className="mb-4">
                  <button
                    type="button"
                    onClick={() => setShowIcecatModal(true)}
                    className="px-4 py-2 bg-accent text-black font-bold rounded-xl hover:bg-[#1a86cc] transition-all"
                  >
                    🔍 Search Icecat Images
                  </button>
                </div>

                <div className="grid grid-cols-5 gap-3 mb-3">
                  {[0, 1, 2, 3, 4].map((index) => (
                    <div key={index} className="relative">
                      <div
                        className={`w-full aspect-square rounded-xl border-2 border-dashed overflow-hidden cursor-pointer flex items-center justify-center hover:border-[#1574B5] transition-all bg-card ${
                          form.images?.[index] ? 'border-[#1574B5]' : 'border-theme'
                        }`}
                        onClick={() => {
                          const input = document.getElementById(`img-slot-${index}`) as HTMLInputElement
                          input?.click()
                        }}
                      >
                        {form.images?.[index] ? (
                          <>
                            <img
                              src={form.images[index]}
                              alt={`view ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                const updated = [...(form.images || [])]
                                updated.splice(index, 1)
                                const trimmed = updated.filter((img) => Boolean(img?.trim()))
                                setForm((f) => ({
                                  ...f,
                                  images: trimmed,
                                  image: trimmed[0] || ''
                                }))
                              }}
                              className="absolute top-1 right-1 w-5 h-5 bg-[#ED2124] text-white rounded-full text-xs flex items-center justify-center"
                            >
                              ×
                            </button>
                          </>
                        ) : (
                          <div className="text-center p-2">
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              className="mx-auto mb-1 text-muted"
                            >
                              <rect x="3" y="3" width="18" height="18" rx="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <path d="M21 15l-5-5L5 21" />
                            </svg>
                            <span className="text-xs text-muted">{SLOT_LABELS[index]}</span>
                          </div>
                        )}
                      </div>

                      <input
                        id={`img-slot-${index}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          const reader = new FileReader()
                          reader.onload = (ev) => {
                            const b64 = ev.target?.result as string
                            const updated = [...(form.images || [])]
                            while (updated.length <= index) updated.push('')
                            updated[index] = b64
                            const lastFilled = updated.reduce(
                              (last, img, i) => (img?.trim() ? i : last),
                              -1
                            )
                            const trimmed = updated.slice(0, lastFilled + 1).filter((img) => Boolean(img?.trim()))
                            setForm((f) => ({
                              ...f,
                              images: trimmed,
                              image: index === 0 ? b64 : trimmed[0] || f.image
                            }))
                          }
                          reader.readAsDataURL(file)
                          e.target.value = ''
                        }}
                      />
                    </div>
                  ))}
                </div>

                <input
                  type="url"
                  className="w-full rounded-xl px-4 py-2 text-sm bg-card border border-theme text-primary focus:outline-none focus:border-[#1574B5] transition-all"
                  placeholder="Or paste image URL for first slot..."
                  onChange={(e) => {
                    const url = e.target.value.trim()
                    if (!url) return
                    const updated = [...(form.images || [])]
                    if (updated.length === 0) updated[0] = url
                    else updated[0] = url
                    setForm((f) => ({
                      ...f,
                      images: updated.filter((img) => Boolean(img?.trim())),
                      image: url
                    }))
                  }}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-accent text-black font-bold rounded-xl hover:bg-[#1a86cc] transition-all"
              >
                {editId ? 'Save Changes' : 'Add Product'}
              </button>
              <button
                onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm) }}
                className="px-8 py-3 border border-theme text-secondary rounded-xl hover:bg-card transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {showIcecatModal ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white text-black dark:bg-gray-900 dark:text-white p-4">
            <div className="w-full max-w-4xl max-h-[80vh] rounded-3xl border border-theme bg-card shadow-xl shadow-black/30 overflow-hidden flex flex-col">
              <div className="sticky top-0 z-20 bg-card border-b border-theme p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-primary">Search Images</h3>
                    <p className="text-sm text-secondary">Search Unsplash by keyword and select an image.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowIcecatModal(false)}
                    className="rounded-2xl border border-theme bg-card px-4 py-2 text-secondary hover:bg-white/10"
                  >
                    Cancel
                  </button>
                </div>

                <div className="mt-6 grid gap-4">
                  <label className="text-secondary text-sm mb-2 block">Search</label>
                  <div className="flex flex-col gap-3 md:flex-row md:items-end">
                    <input
                      value={icecatQuery}
                      onChange={(e) => setIcecatQuery(e.target.value)}
                      placeholder="Search Unsplash for photos"
                      className="w-full rounded-2xl border border-theme bg-card px-4 py-3 text-primary outline-none transition focus:border-[#1574B5] focus:ring-4 focus:ring-[#1574B5]/20"
                    />
                    <button
                      type="button"
                      onClick={icecatSearch}
                      className="min-w-[160px] rounded-2xl bg-accent px-5 py-3 text-black font-semibold hover:bg-[#1a86cc] transition-all disabled:opacity-60"
                      disabled={icecatLoading}
                    >
                      {icecatLoading ? 'Searching...' : 'Search'}
                    </button>
                  </div>
                  {icecatError ? <p className="text-sm text-rose-300">{icecatError}</p> : null}
                </div>
              </div>

              <div className="overflow-y-auto px-6 py-6 flex-1 space-y-6">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {icecatResults.map((url) => (
                    <button
                      key={url}
                      type="button"
                      onClick={() => setSelectedIcecatImage(url)}
                      className={`group overflow-hidden rounded-3xl border bg-card p-0 transition ${selectedImageClass(url)}`}
                    >
                      <img
                        src={url}
                        alt="Search result"
                        className="h-40 w-full object-cover transition duration-200 group-hover:scale-105"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="sticky bottom-0 z-20 bg-card border-t border-theme p-6 flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={addSelectedIcecatImage}
                  disabled={!selectedIcecatImage}
                  className="px-4 py-3 rounded-2xl bg-accent text-black font-semibold hover:bg-[#1a86cc] transition-all disabled:opacity-60"
                >
                  Use Selected Image
                </button>
                <button
                  type="button"
                  onClick={() => setShowIcecatModal(false)}
                  className="px-4 py-3 rounded-2xl border border-theme bg-card text-secondary hover:bg-white/10"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Search + Filter */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <input
            className="flex-1 bg-card border border-theme rounded-xl px-4 py-3 text-primary focus:outline-none focus:border-[#1574B5] transition-all"
            placeholder="Search by name, brand, or model..."
            value={search} onChange={e => setSearch(e.target.value)}
          />
          <select
            className="bg-primary border border-theme rounded-xl px-4 py-3 text-primary focus:outline-none focus:border-[#1574B5] transition-all"
            value={filterCat} onChange={e => setFilterCat(e.target.value)}
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Product Count */}
        <p className="text-secondary text-sm mb-4">{filtered.length} product{filtered.length !== 1 ? 's' : ''} found</p>

        {/* Product Table */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted">
            <div className="mb-4 flex justify-center"><CameraIcon /></div>
            <p className="text-lg">No products found.</p>
            <p className="text-sm mt-2">Click &quot;+ Add Product&quot; to add your first item.</p>
          </div>
        ) : (
          <div className="bg-card border border-theme rounded-2xl overflow-x-auto">
            {/* Table Header */}
            <div className="grid grid-cols-[60px_1fr_1fr_1fr_80px_80px_120px_100px] gap-4 px-4 py-3 border-b text-xs font-bold uppercase tracking-wider" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
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
                className="grid grid-cols-[60px_1fr_1fr_1fr_80px_80px_120px_100px] gap-4 px-4 py-4 border-b border-theme hover:bg-card transition-all items-center"
              >
                {/* Image */}
                <div className="relative w-12 h-12 rounded-lg bg-card flex items-center justify-center overflow-hidden">
                  {(p.images?.[0] || p.image) ? (
                    <Image src={p.images?.[0] || p.image} alt={p.name} fill sizes="48px" className="object-cover" />
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1574B5" strokeWidth="1.5">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                  )}
                </div>
                {/* Name */}
                <div>
                  <p className="text-primary font-medium text-sm">{p.name}</p>
                  <p className="text-muted text-xs truncate max-w-[180px]">{p.description}</p>
                </div>
                {/* Brand/Model */}
                <div>
                  <p className="text-secondary text-sm">{p.brand}</p>
                  <p className="text-muted text-xs font-mono">{p.model}</p>
                </div>
                {/* Category */}
                <span className="text-secondary text-xs bg-card px-2 py-1 rounded-full w-fit">{p.category}</span>
                {/* Price */}
                <span className="text-accent font-bold text-sm">{formatUGX(p.price)}</span>
                {/* Stock */}
                <span className="text-secondary text-sm font-mono">{p.stockQuantity}</span>
                {/* Status */}
                <StockBadge qty={p.stockQuantity} />
                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(p)}
                    className="px-3 py-1 bg-card hover:bg-[#1574B5]/20 hover:text-[#1574B5] text-secondary rounded-lg text-xs transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="px-3 py-1 bg-card hover:bg-[#ED2124]/20 hover:text-[#ED2124] text-secondary rounded-lg text-xs transition-all"
                  >
                    Del
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Site Content
          </h2>
          <LogoUploadPanel onToast={showToast} />
          <div className="mt-6">
            <StatsPanel onToast={showToast} />
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Customer Messages
              {messages.filter(m => !m.read).length > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white">
                  {messages.filter(m => !m.read).length} new
                </span>
              )}
            </h2>
          </div>

          {messages.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>
              No messages yet.
            </p>
          ) : (
            <div className="space-y-3">
              {messages.map(msg => (
                <div key={msg.id}
                     className="p-4 rounded-xl border"
                     style={{
                       background: msg.read
                         ? undefined
                         : 'rgba(21,116,181,0.08)',
                       borderColor: msg.read
                         ? undefined
                         : 'rgba(21,116,181,0.3)'
                     }}>
                  <div className="flex justify-between items-start mb-2 gap-4">
                    <div>
                      <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                        {msg.name}
                      </span>
                      <span className="text-sm ml-2" style={{ color: 'var(--text-muted)' }}>
                        {msg.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {new Date(msg.created_at).toLocaleDateString()}
                      </span>
                      {!msg.read && (
                        <button
                          type="button"
                          onClick={async () => {
                            await supabase
                              .from('contact_messages')
                              .update({ read: true })
                              .eq('id', msg.id)
                            fetchMessages()
                          }}
                          className="text-xs px-2 py-1 rounded-lg"
                          style={{
                            background: 'rgba(21,116,181,0.15)',
                            color: '#1574B5'
                          }}
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {msg.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
