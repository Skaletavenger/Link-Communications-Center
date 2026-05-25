'use client'
import { useState, useEffect } from 'react'
import { Product, formatUGX } from '../../lib/useInventory'

const CATEGORIES = ['All', 'Surveillance Cameras', 'Access Control', 'Networking', 'Intercoms', 'Alarms', 'Other']

function CameraPlaceholder() {
  return (
    <div className="w-full h-48 bg-white/5 flex items-center justify-center rounded-xl">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00B4FF" strokeWidth="1.2" opacity="0.5">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
        <circle cx="12" cy="13" r="4"/>
      </svg>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 animate-pulse">
      <div className="h-48 bg-white/10 rounded-xl mb-4" />
      <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
      <div className="h-3 bg-white/10 rounded w-1/2 mb-4" />
      <div className="h-6 bg-white/10 rounded w-1/3" />
    </div>
  )
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loaded, setLoaded] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  useEffect(() => {
    try {
      const stored = localStorage.getItem('lcc_inventory')
      if (stored) setProducts(JSON.parse(stored))
    } catch {}
    setLoaded(true)
  }, [])

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.model.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'All' || p.category === category
    return matchSearch && matchCat
  })

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white pt-24 pb-16 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">Our Products</h1>
          <p className="text-white/50">Browse our range of surveillance and communications equipment</p>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <input
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#00B4FF] transition-all"
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
                    ? 'bg-[#00B4FF] text-black'
                    : 'bg-white/5 border border-white/10 text-white/60 hover:border-[#00B4FF]/50'
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
          <div className="text-center py-24 text-white/30">
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
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-[#00B4FF]/40 hover:bg-white/8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,180,255,0.15)] group"
              >
                {/* Image */}
                <div className="relative overflow-hidden">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <CameraPlaceholder />
                  )}
                  {/* Category tag */}
                  <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-[#00B4FF] text-xs px-2 py-1 rounded-full border border-[#00B4FF]/30">
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
                  <h3 className="text-white font-bold text-lg mb-1 leading-tight">{p.name}</h3>
                  <p className="text-white/40 text-xs font-mono mb-2">{p.brand} · {p.model}</p>
                  {p.description && (
                    <p className="text-white/50 text-sm mb-4 line-clamp-2">{p.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-[#00B4FF] text-2xl font-bold">{formatUGX(p.price)}</span>
                    <span className="text-white/30 text-xs">{p.stockQuantity} units</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
