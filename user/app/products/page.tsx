'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import Navbar from '../../components/Navbar'
import Breadcrumb from '../../components/Breadcrumb'
import AuthGuard from '../../components/AuthGuard'
import { supabase } from '../../lib/supabase'
import { CATEGORIES, Product, ProductRow, formatUGX, toProduct } from '../../lib/inventory'
import Footer from '../../components/Footer'

function CameraPlaceholder() {
  return (
    <div className="w-full h-48 flex items-center justify-center rounded-xl border"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
    >
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1574B5" strokeWidth="1.2" opacity="0.5">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    </div>
  )
}

function getMainImage(p: Product) {
  return p.images?.[0] || p.image
}

function ImageCarousel({ 
  images, 
  name 
}: { 
  images: string[], 
  name: string 
}) {
  const SLIDE_MS = 1000
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const [animating, setAnimating] = useState(false)
  const [direction, setDirection] = useState<'left'|'right'>('left')

  const goTo = (index: number, dir: 'left'|'right') => {
    if (animating) return
    setDirection(dir)
    setAnimating(true)
    setTimeout(() => {
      setCurrent(index)
      setAnimating(false)
    }, SLIDE_MS)
  }

  const next = useCallback(() => {
    goTo(
      current === images.length - 1 ? 0 : current + 1,
      'left'
    )
  }, [current, images.length])

  const prev = () => {
    goTo(
      current === 0 ? images.length - 1 : current - 1,
      'right'
    )
  }

  useEffect(() => {
    if (paused) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [paused, next])

  return (
    <div className="w-full rounded-2xl overflow-hidden 
                    mb-6 border"
         style={{ borderColor: 'var(--border-color)' }}
         onMouseEnter={() => setPaused(true)}
         onMouseLeave={() => setPaused(false)}>

      {/* Sliding image window */}
      <div className="relative w-full overflow-hidden"
           style={{ 
             height: '320px',
             background: 'var(--bg-card)' 
           }}>
        
        {images.map((img, i) => {
          let transform = 'translateX(100%)'
          if (i === current) {
            transform = animating
              ? direction === 'left'
                ? 'translateX(-100%)'
                : 'translateX(100%)'
              : 'translateX(0)'
          } else if (
            i === (current === 0 
              ? images.length - 1 
              : current - 1)
          ) {
            transform = direction === 'left'
              ? 'translateX(-100%)'
              : 'translateX(100%)'
          }

          return (
            <div key={i}
                 className="absolute inset-0 transition-transform 
                            duration-1000 ease-in-out"
                 style={{ transform, transitionDuration: `${SLIDE_MS}ms` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img}
                   alt={`${name} ${i + 1}`}
                   className="w-full h-full object-contain"/>
            </div>
          )
        })}

        {/* Left arrow */}
        <button type="button" onClick={prev}
                className="absolute left-3 top-1/2 
                           -translate-y-1/2 z-20
                           w-10 h-10 rounded-full
                           flex items-center justify-center
                           text-white text-2xl
                           bg-black/50 backdrop-blur-sm
                           hover:bg-black/70 
                           transition-all">
          ‹
        </button>

        {/* Right arrow */}
        <button type="button" onClick={next}
                className="absolute right-3 top-1/2 
                           -translate-y-1/2 z-20
                           w-10 h-10 rounded-full
                           flex items-center justify-center
                           text-white text-2xl
                           bg-black/50 backdrop-blur-sm
                           hover:bg-black/70
                           transition-all">
          ›
        </button>

        {/* Image counter */}
        <div className="absolute top-3 right-3 z-20
                        bg-black/50 backdrop-blur-sm
                        text-white text-xs 
                        px-3 py-1 rounded-full">
          {current + 1} / {images.length}
        </div>

        {/* Pause on hover indicator */}
        {paused && (
          <div className="absolute bottom-3 left-3 z-20
                          bg-black/50 backdrop-blur-sm
                          text-white text-xs
                          px-2 py-1 rounded-full">
            ⏸
          </div>
        )}
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 p-3 overflow-x-auto"
           style={{ background: 'var(--bg-secondary)' }}>
        {images.map((img, i) => (
          <button key={i} type="button"
                  onClick={() => goTo(
                    i, 
                    i > current ? 'left' : 'right'
                  )}
                  className="flex-shrink-0 w-14 h-14 
                             rounded-lg overflow-hidden 
                             border-2 transition-all"
                  style={{
                    borderColor: i === current
                      ? '#1574B5' : 'transparent',
                    opacity: i === current ? 1 : 0.5
                  }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img} alt={`thumb ${i+1}`}
                 className="w-full h-full object-cover"/>
          </button>
        ))}

        {/* Dot indicators */}
        <div className="flex items-center gap-1.5 ml-auto">
          {images.map((_, i) => (
            <button key={i} type="button"
                    onClick={() => goTo(
                      i,
                      i > current ? 'left' : 'right'
                    )}
                    className="rounded-full transition-all"
                    style={{
                      width: i === current ? '20px' : '8px',
                      height: '8px',
                      background: i === current
                        ? '#1574B5' : 'var(--border-color)'
                    }}/>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loaded, setLoaded] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [selected, setSelected] = useState<Product | null>(null)
  const [authed, setAuthed] = useState(false)
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    const loadAuth = async () => {
      const { data } = await supabase.auth.getSession()
      setAuthed(Boolean(data.session))
    }
    loadAuth()
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(Boolean(session))
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    const rows = (data || []) as ProductRow[]
    setProducts(rows.map(toProduct))
    setLoaded(true)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const phoneProducts = useMemo(() => {
    return products.filter(p =>
      p.category === 'Phones' &&
      (search === '' ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase()) ||
        p.model.toLowerCase().includes(search.toLowerCase()))
    )
  }, [products, search])

  const filtered = useMemo(() => {
    const result = products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.model.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase())
      const matchCat = category === 'All' || p.category === category
      return matchSearch && matchCat
    })

    // Apply sorting
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price)
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name))
    }

    return result
  }, [products, search, category, sortBy])

  const otherProducts = filtered.filter(p => p.category !== 'Phones')

  return (
    <div className="min-h-screen pt-0" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <AuthGuard show={!authed} />
      <Breadcrumb items={[
        { label: 'Home', href: '/' },
        { label: 'Products' }
      ]} />

      <div className="max-w-7xl mx-auto pb-16 px-4 md:px-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Our Products
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Browse our range of surveillance, access control, and communications equipment
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              className="w-full rounded-xl px-4 py-3 outline-none border"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              placeholder="🔍 Search products by name, brand, or model..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Category Filters and Sort */}
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border transition-all hover:scale-105"
                  style={{
                    borderColor: category === c ? '#1574B5' : 'var(--border-color)',
                    background: category === c ? '#1574B5' : 'var(--bg-card)',
                    color: category === c ? 'white' : 'var(--text-primary)'
                  }}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 rounded-xl border outline-none"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>
        </div>

        {/* Products Display */}
        {!loaded ? (
          <div className="text-center py-24">
            <div className="inline-block">
              <div className="w-12 h-12 rounded-full border-4 border-transparent border-t-blue-500 animate-spin" />
            </div>
            <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>Loading products...</p>
          </div>
        ) : otherProducts.length === 0 && phoneProducts.length === 0 ? (
          <div className="text-center py-24 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>No products found</p>
            <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
              Try adjusting your search or category filters.
            </p>
          </div>
        ) : (
          <>
            {/* Other Products Grid */}
            {category !== 'Phones' && otherProducts.length > 0 && (
              <div className="mb-16">
                <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                  {category === 'All' ? 'Equipment & Devices' : category}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {otherProducts.map(p => {
                    const mainImage = getMainImage(p)
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelected(p)}
                        className="cursor-pointer rounded-2xl overflow-hidden border transition-all hover:-translate-y-2 hover:shadow-lg"
                        style={{
                          background: 'var(--bg-card)',
                          borderColor: 'var(--border-color)',
                          boxShadow: 'var(--card-shadow)'
                        }}
                      >
                        <div className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                          {mainImage ? (
                            <img src={mainImage} alt={p.name} className="w-full h-48 object-cover hover:scale-110 transition-transform duration-300" />
                          ) : (
                            <CameraPlaceholder />
                          )}
                          <span className="absolute top-3 left-3 text-xs px-3 py-1 rounded-full font-semibold border"
                            style={{ background: '#1574B5', borderColor: '#1574B5', color: 'white' }}
                          >
                            {p.category}
                          </span>
                        </div>
                        <div className="p-5">
                          <h3 className="font-bold text-lg mb-1 leading-tight line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                            {p.name}
                          </h3>
                          <p className="text-xs font-mono mb-3" style={{ color: 'var(--text-muted)' }}>
                            {p.brand} · {p.model}
                          </p>
                          {p.description && (
                            <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                              {p.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                            <span className="text-2xl font-bold" style={{ color: '#1574B5' }}>
                              {formatUGX(p.price)}
                            </span>
                            <span className="text-xs px-2 py-1 rounded-lg" style={{ background: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>
                              {p.stockQuantity} in stock
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Phones Section */}
            {phoneProducts.length > 0 && (category === 'All' || category === 'Phones') && (
              <div className="mt-16 mb-8">
                <div className="mb-10">
                  <p className="text-sm font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
                    📱 Smartphone Loans
                  </p>
                  <h2 className="text-4xl md:text-5xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    Explore the lineup.
                  </h2>
                  <p style={{ color: 'var(--text-secondary)' }} className="mt-2">
                    Flexible payment plans available for all devices
                  </p>
                </div>

                <div className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory">
                  {phoneProducts.map(phone => {
                    const mainImage = getMainImage(phone)
                    return (
                      <div
                        key={phone.id}
                        onClick={() => setSelected(phone)}
                        className="flex-shrink-0 w-72 md:w-80 snap-start cursor-pointer group"
                      >
                        <div className="relative w-full h-80 rounded-3xl overflow-hidden mb-5 border transition-all hover:shadow-lg"
                          style={{ borderColor: 'var(--border-color)', background: 'var(--bg-card)', boxShadow: 'var(--card-shadow)' }}
                        >
                          {mainImage ? (
                            <img src={mainImage} alt={phone.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                              <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                                {phone.brand}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="px-1">
                          <h3 className="text-xl font-bold mb-1 group-hover:text-[#1574B5] transition-colors duration-300" style={{ color: 'var(--text-primary)' }}>
                            {phone.name}
                          </h3>
                          <p className="text-sm mb-3 line-clamp-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            {phone.description}
                          </p>
                          <p className="text-xl font-bold" style={{ color: '#1574B5' }}>
                            {formatUGX(phone.price)}
                          </p>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setSelected(phone) }}
                            className="mt-3 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all duration-200 px-3 py-2 rounded-lg hover:bg-blue-500/10"
                            style={{ color: '#1574B5' }}
                          >
                            View Details
                            <span className="text-lg leading-none">→</span>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Product Detail Modal */}
      {selected && (
        <>
          <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" onClick={() => setSelected(null)} />

          <div className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] overflow-y-auto rounded-t-3xl shadow-2xl" style={{ background: 'var(--bg-secondary)' }}>
            <div className="flex justify-center pt-4 pb-2">
              <div className="w-12 h-1.5 rounded-full bg-white/20" />
            </div>

            <div className="max-w-3xl mx-auto px-6 pb-10">
              <div className="flex justify-end mb-4">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all hover:opacity-70"
                  style={{ color: 'var(--text-primary)' }}
                >
                  ✕
                </button>
              </div>

              {/* Image Carousel */}
              {(() => {
                const imgs = [
                  ...(selected.images?.filter((i: string) => i) || []),
                  ...(selected.image && 
                      !selected.images?.includes(selected.image) 
                      ? [selected.image] : [])
                ].filter(Boolean)

                if (imgs.length === 0) {
                  return (
                    <div className="w-full h-72 flex items-center 
                                    justify-center rounded-2xl mb-6 border"
                         style={{ 
                           background: 'var(--bg-card)',
                           borderColor: 'var(--border-color)' 
                         }}>
                      <svg width="80" height="80" viewBox="0 0 24 24"
                           fill="none" stroke="#1574B5" 
                           strokeWidth="1" opacity="0.3">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 
                                 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 
                                 3h4a2 2 0 0 1 2 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                      </svg>
                    </div>
                  )
                }

                if (imgs.length === 1) {
                  return (
                    <div className="w-full rounded-2xl overflow-hidden 
                                    mb-6 border"
                         style={{ borderColor: 'var(--border-color)' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imgs[0]} alt={selected.name}
                           className="w-full h-72 object-contain"
                           style={{ background: 'var(--bg-card)' }}/>
                    </div>
                  )
                }

                return (
                  <ImageCarousel 
                    images={imgs} 
                    name={selected.name} 
                  />
                )
              })()}

              <div className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{selected.name}</h2>
                </div>

                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1 rounded-full text-sm border"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                  >
                    🏷️ {selected.brand}
                  </span>
                  {selected.model && (
                    <span className="px-3 py-1 rounded-full text-sm border font-mono"
                      style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                    >
                      📋 {selected.model}
                    </span>
                  )}
                  <span className="px-3 py-1 rounded-full text-sm border"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: '#1574B5' }}
                  >
                    📂 {selected.category}
                  </span>
                </div>

                <div className="py-4 px-5 rounded-2xl border"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', boxShadow: 'var(--card-shadow)' }}
                >
                  <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Price</p>
                  <p className="text-3xl font-bold" style={{ color: '#1574B5' }}>
                    {formatUGX(selected.price)}
                  </p>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                    {selected.stockQuantity} units available
                  </p>
                </div>

                {selected.description && (
                  <div className="py-4 px-5 rounded-2xl border"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', boxShadow: 'var(--card-shadow)' }}
                  >
                    <p className="text-sm font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>Description</p>
                    <p className="leading-relaxed" style={{ color: 'var(--text-primary)' }}>{selected.description}</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="w-full py-4 rounded-2xl font-bold text-lg transition-all hover:opacity-90 active:scale-95 mt-4"
                  style={{ background: '#1574B5', color: 'white' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <Footer />
    </div>
  )
}
