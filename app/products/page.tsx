'use client'
import { useState, useEffect } from 'react'
import { Product, formatUGX } from '../../lib/useInventory'

const CATEGORIES = ['All', 'Surveillance Cameras', 'Access Control', 'Networking', 'Intercoms', 'Alarms', 'Other']

function CameraPlaceholder() {
  return (
    <div className="w-full h-48 bg-card flex items-center justify-center rounded-xl">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00B4FF" strokeWidth="1.2" opacity="0.5">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
        <circle cx="12" cy="13" r="4"/>
      </svg>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-card border border-theme rounded-2xl p-4 animate-pulse">
      <div className="h-48 bg-card rounded-xl mb-4" />
      <div className="h-4 bg-card rounded w-3/4 mb-2" />
      <div className="h-3 bg-card rounded w-1/2 mb-4" />
      <div className="h-6 bg-card rounded w-1/3" />
    </div>
  )
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loaded, setLoaded] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [selected, setSelected] = useState<Product | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('lcc_inventory')
      if (stored) setProducts(JSON.parse(stored))
    } catch {}
    setLoaded(true)
  }, [])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  useEffect(() => {
    if (selected) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [selected])

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.model.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'All' || p.category === category
    return matchSearch && matchCat
  })

  return (
    <div className="min-h-screen bg-[#f0f4ff] dark:bg-[#0a0f1e] text-gray-900 dark:text-white pt-24 pb-16 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Our Products</h1>
          <p className="text-gray-500 dark:text-gray-300">Browse our range of surveillance and communications equipment</p>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <input
            className="flex-1 bg-card border border-theme rounded-xl px-4 py-3 text-primary focus:outline-none focus:border-[#00B4FF] transition-all"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  category === c
                    ? 'bg-accent text-black'
                    : 'bg-card border border-theme text-secondary hover:border-[#00B4FF]/50'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {!loaded ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-muted">
            <div className="flex justify-center mb-4">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
            <p className="text-xl font-medium">No products found</p>
            <p className="text-sm mt-2">
              {products.length === 0 ? 'Products coming soon. Check back later.' : 'Try a different search or category.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(p => (
              <div
                key={p.id}
                onClick={() => setSelected(p)}
                className="cursor-pointer bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm dark:shadow-none hover:border-[#00B4FF]/40 hover:shadow-[0_20px_40px_rgba(0,180,255,0.15)] transition-all duration-300 hover:-translate-y-1 group"
              >
                {/* Image */}
                <div className="relative overflow-hidden">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <CameraPlaceholder />
                  )}
                  {/* Category tag */}
                  <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-accent text-xs px-2 py-1 rounded-full border border-[#00B4FF]/30">
                    {p.category}
                  </span>
                  {/* Stock badge */}
                  <span className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-full backdrop-blur-sm border font-bold ${
                    p.stockQuantity === 0
                      ? 'bg-red-500/20 text-red-400 border-red-500/30'
                      : p.stockQuantity <= 5
                      ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                      : 'bg-green-500/20 text-green-400 border-green-500/30'
                  }`}>
                    {p.stockQuantity === 0 ? 'Out of Stock' : p.stockQuantity <= 5 ? 'Low Stock' : 'In Stock'}
                  </span>
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-1 leading-tight">{p.name}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-mono mb-2">{p.brand} · {p.model}</p>
                  {p.description && (
                    <p className="text-gray-600 dark:text-white/50 text-sm mb-4 line-clamp-2">{p.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-accent text-2xl font-bold">{formatUGX(p.price)}</span>
                    <span className="text-muted text-xs">{p.stockQuantity} units</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          />

          <div
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] overflow-y-auto rounded-t-3xl shadow-2xl animate-slide-up bg-white dark:bg-[#0d1428]"
          >
            <div className="flex justify-center pt-4 pb-2">
              <div className="w-12 h-1.5 rounded-full bg-white/20" />
            </div>

            <div className="max-w-3xl mx-auto px-6 pb-10">
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setSelected(null)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all hover:bg-white/10 text-gray-500 dark:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="w-full rounded-2xl overflow-hidden mb-6 border border-gray-200 dark:border-white/10">
                {selected.image ? (
                  <img
                    src={selected.image}
                    alt={selected.name}
                    className="w-full max-h-80 object-cover"
                  />
                ) : (
                  <div className="w-full h-64 flex items-center justify-center bg-white dark:bg-white/5">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#00B4FF" strokeWidth="1" opacity="0.4">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selected.name}
                  </h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold border ${
                    selected.stockQuantity === 0
                      ? 'bg-red-500/20 text-red-400 border-red-500/30'
                      : selected.stockQuantity <= 5
                      ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                      : 'bg-green-500/20 text-green-400 border-green-500/30'
                  }`}>
                    {selected.stockQuantity === 0
                      ? 'Out of Stock'
                      : selected.stockQuantity <= 5
                      ? 'Low Stock'
                      : 'In Stock'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1 rounded-full text-sm border bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-300">
                    🏷️ {selected.brand}
                  </span>
                  {selected.model && (
                    <span className="px-3 py-1 rounded-full text-sm border font-mono bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-300">
                      📋 {selected.model}
                    </span>
                  )}
                  <span className="px-3 py-1 rounded-full text-sm border bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-[#00B4FF]">
                    📂 {selected.category}
                  </span>
                </div>

                <div className="py-4 px-5 rounded-2xl border bg-white dark:bg-white/5 border-gray-200 dark:border-white/10">
                  <p className="text-sm mb-1 text-gray-600 dark:text-white/60">
                    Price
                  </p>
                  <p className="text-3xl font-bold text-[#00B4FF]">
                    UGX {selected.price.toLocaleString()}
                  </p>
                  <p className="text-sm mt-1 text-gray-600 dark:text-white/60">
                    {selected.stockQuantity} units available
                  </p>
                </div>

                {selected.description && (
                  <div className="py-4 px-5 rounded-2xl border bg-white dark:bg-white/5 border-gray-200 dark:border-white/10">
                    <p className="text-sm font-bold mb-2 text-gray-500 dark:text-gray-300">
                      Description
                    </p>
                    <p className="leading-relaxed text-gray-900 dark:text-white">
                      {selected.description}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => setSelected(null)}
                  className="w-full py-4 rounded-2xl font-bold text-lg transition-all hover:opacity-90 active:scale-95 mt-4 bg-[#00B4FF] text-black"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
