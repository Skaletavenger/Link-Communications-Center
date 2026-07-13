'use client'
import AdminGuard from '../../lib/AdminGuard'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useInventory, Product, formatUGX } from '../../lib/useInventory'

const CATEGORIES = ['All', 'Surveillance Cameras', 'Access Control', 'Networking', 'Intercoms', 'Alarms', 'Phones', 'Other']

function getMainImage(p: Product) {
  return p.images?.[0] || p.image
}

function CameraPlaceholder() {
  return (
    <div className="w-full h-48 bg-card flex items-center justify-center rounded-xl">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1574B5" strokeWidth="1.2" opacity="0.5">
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

function ProductsPage() {
  const { products, loaded } = useInventory()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [selected, setSelected] = useState<Product | null>(null)
  const [slideIndex, setSlideIndex] = useState(0)

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

  useEffect(() => {
    setSlideIndex(0)
  }, [selected?.id])

  const phoneProducts = products.filter(p =>
    p.category === 'Phones' &&
    (search === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.model.toLowerCase().includes(search.toLowerCase()))
  )

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.model.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'All' || p.category === category
    return matchSearch && matchCat
  })

  const otherProducts = filtered.filter(p => p.category !== 'Phones')

  return (
    <div className="min-h-screen pt-24 pb-16 px-6" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Our Products</h1>
          <p className="text-gray-500 dark:text-gray-300">Browse our range of surveillance and communications equipment</p>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <input
            className="flex-1 bg-card border border-theme rounded-xl px-4 py-3 text-primary focus:outline-none focus:border-[#1574B5] transition-all"
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
                    : 'bg-card border border-theme text-secondary hover:border-[#1574B5]/50'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {category !== 'Phones' && (
          !loaded ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : otherProducts.length === 0 ? (
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
              {otherProducts.map(p => {
                const mainImage = getMainImage(p)
                return (
                <div
                key={p.id}
                onClick={() => setSelected(p)}
                className="cursor-pointer bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm dark:shadow-none hover:border-[#1574B5]/40 hover:shadow-[0_20px_40px_rgba(21,116,181,0.15)] transition-all duration-300 hover:-translate-y-1 group"
              >
                {/* Image */}
                <div className="relative overflow-hidden h-48">
                  {mainImage ? (
                    <Image src={mainImage} alt={p.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-contain bg-slate-50 group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <CameraPlaceholder />
                  )}
                  {/* Category tag */}
                  <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-accent text-xs px-2 py-1 rounded-full border border-[#1574B5]/30">
                    {p.category}
                  </span>
                  {/* Stock badge */}
                  <span className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-full backdrop-blur-sm border font-bold ${
                    p.stockQuantity === 0
                      ? 'bg-[#ED2124]/20 text-[#ED2124] border-[#ED2124]/30'
                      : p.stockQuantity <= 5
                      ? 'bg-[#F47821]/20 text-[#F47821] border-[#F47821]/30'
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
            )})}
          </div>
        ))}

        {phoneProducts.length > 0 && (category === 'All' || category === 'Phones') && (
          <div className="mt-16 mb-8">
            <div className="mb-10">
              <p className="text-sm font-semibold tracking-widest uppercase text-gray-500 dark:text-gray-400 mb-2">
                Phones
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                Explore the lineup.
              </h2>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory">
              {phoneProducts.map(phone => {
                const mainImage = getMainImage(phone)
                return (
                <div
                  key={phone.id}
                  onClick={() => setSelected(phone)}
                  className="flex-shrink-0 w-72 md:w-80 snap-start cursor-pointer group"
                >
                  <div className="relative w-full h-80 rounded-3xl overflow-hidden mb-5 bg-gray-100 dark:bg-white/5">
                    {mainImage ? (
                      <Image
                        src={mainImage}
                        alt={phone.name}
                        fill
                        sizes="(max-width: 768px) 80vw, 320px"
                        className="object-contain bg-slate-50 group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="text-gray-400 dark:text-white/20" stroke="currentColor" strokeWidth="1">
                          <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                          <line x1="12" y1="18" x2="12.01" y2="18"/>
                        </svg>
                        <span className="text-gray-400 dark:text-white/30 text-sm font-medium">
                          {phone.brand}
                        </span>
                      </div>
                    )}

                    <span className={`absolute top-4 right-4 text-xs px-3 py-1 rounded-full font-bold backdrop-blur-sm border ${
                      phone.stockQuantity === 0
                        ? 'bg-[#ED2124]/20 text-[#ED2124] border-[#ED2124]/30'
                        : phone.stockQuantity <= 5
                        ? 'bg-[#F47821]/20 text-[#F47821] border-[#F47821]/30'
                        : 'bg-green-500/20 text-green-400 border-green-500/30'
                    }`}>
                      {phone.stockQuantity === 0 ? 'Out of Stock' : phone.stockQuantity <= 5 ? 'Low Stock' : 'In Stock'}
                    </span>
                  </div>

                  <div className="px-1">
                    <h3 className="text-xl font-bold mb-1 text-gray-900 dark:text-white group-hover:text-[#1574B5] dark:group-hover:text-[#1574B5] transition-colors duration-300">
                      {phone.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2 leading-relaxed">
                      {phone.description}
                    </p>
                    <p className="text-xl font-bold text-[#1574B5] dark:text-[#1574B5]">
                      UGX {phone.price.toLocaleString()}
                    </p>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelected(phone) }}
                      className="mt-3 text-sm font-medium text-[#1574B5] dark:text-[#1574B5] flex items-center gap-1 hover:gap-2 transition-all duration-200"
                    >
                      Learn more
                      <span className="text-lg leading-none">›</span>
                    </button>
                  </div>
                </div>
              )})}
            </div>

            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 md:hidden text-center">
              Swipe to explore →
            </p>
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

              {(() => {
                const allImages = [
                  ...(selected.images?.filter((i) => i && i.length > 0) || []),
                ]
                if (selected.image && !allImages.includes(selected.image)) {
                  allImages.unshift(selected.image)
                }

                const safeIndex = Math.min(slideIndex, Math.max(allImages.length - 1, 0))

                return allImages.length > 0 ? (
                  <div className="relative w-full rounded-2xl overflow-hidden mb-6 border border-theme">
                    <div className="relative w-full h-[320px]">
                      <Image
                        key={safeIndex}
                        src={allImages[safeIndex]}
                        alt={`${selected.name} view ${safeIndex + 1}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 600px"
                        className="object-contain transition-opacity duration-300 bg-card"
                      />

                      {allImages.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setSlideIndex((i) => (i === 0 ? allImages.length - 1 : i - 1))
                          }
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center bg-black/50 text-white text-2xl hover:bg-black/70 transition-all backdrop-blur-sm z-10"
                        >
                          ‹
                        </button>
                      )}

                      {allImages.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setSlideIndex((i) => (i === allImages.length - 1 ? 0 : i + 1))
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center bg-black/50 text-white text-2xl hover:bg-black/70 transition-all backdrop-blur-sm z-10"
                        >
                          ›
                        </button>
                      )}

                      {allImages.length > 1 && (
                        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                          {safeIndex + 1} / {allImages.length}
                        </div>
                      )}
                    </div>

                    {allImages.length > 1 && (
                      <div className="flex gap-2 p-3 overflow-x-auto bg-secondary">
                        {allImages.map((img, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setSlideIndex(i)}
                            className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all"
                            style={{
                              borderColor: safeIndex === i ? '#1574B5' : 'transparent',
                              opacity: safeIndex === i ? 1 : 0.6
                            }}
                          >
                            <Image
                              src={img}
                              alt={`thumb ${i + 1}`}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-[320px] flex items-center justify-center rounded-2xl mb-6 border border-theme bg-card">
                    <svg
                      width="80"
                      height="80"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#1574B5"
                      strokeWidth="1"
                      opacity="0.3"
                    >
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </div>
                )
              })()}

              <div className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selected.name}
                  </h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold border ${
                    selected.stockQuantity === 0
                      ? 'bg-[#ED2124]/20 text-[#ED2124] border-[#ED2124]/30'
                      : selected.stockQuantity <= 5
                      ? 'bg-[#F47821]/20 text-[#F47821] border-[#F47821]/30'
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
                  <span className="px-3 py-1 rounded-full text-sm border bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-[#1574B5]">
                    📂 {selected.category}
                  </span>
                </div>

                <div className="py-4 px-5 rounded-2xl border bg-white dark:bg-white/5 border-gray-200 dark:border-white/10">
                  <p className="text-sm mb-1 text-gray-600 dark:text-white/60">
                    Price
                  </p>
                  <p className="text-3xl font-bold text-[#1574B5]">
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
                  className="w-full py-4 rounded-2xl font-bold text-lg transition-all hover:opacity-90 active:scale-95 mt-4 bg-[#1574B5] text-black"
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

export default function ProductsPageProtected() {
  return (
    <AdminGuard>
      <ProductsPage />
    </AdminGuard>
  )
}
