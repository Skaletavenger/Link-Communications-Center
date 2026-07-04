'use client'
/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import AirtelPayModal from '../../components/payment/AirtelPayModal'
import ProductImageSlider from '../../components/ProductImageSlider'
import { supabase } from '../../lib/supabase'
import { CATEGORIES, Product, ProductRow, formatUGX, toProduct } from '../../lib/inventory'
import { useCart } from '@/lib/CartContext'

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

// ImageCarousel removed (not used)

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden border animate-pulse" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
      <div className="w-full h-48" style={{ background: 'var(--bg-secondary)' }} />
      <div className="p-5 space-y-3">
        <div className="h-4 rounded w-3/4" style={{ background: 'var(--bg-secondary)' }} />
        <div className="h-3 rounded w-1/2" style={{ background: 'var(--bg-secondary)' }} />
        <div className="h-6 rounded w-1/3" style={{ background: 'var(--bg-secondary)' }} />
      </div>
    </div>
  )
}

export default function ProductsPage() {
  const { addToCart } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [loaded, setLoaded] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [selected, setSelected] = useState<Product | null>(null)
  const [showAirtel, setShowAirtel] = useState(false)
  const [priceMin, setPriceMin] = useState(10000)
  const [priceMax, setPriceMax] = useState(10000000)
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([])

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    const rows = (data || []) as ProductRow[]
    setProducts(rows.map(toProduct))
    setLoaded(true)
  }

  useEffect(() => { fetchProducts() }, [])

  function toggleValue(list: string[], value: string) {
    return list.includes(value) ? list.filter(v => v !== value) : [...list, value]
  }

  const brandCounts = useMemo(() => {
    const map = new Map<string, number>()
    products.forEach(p => { if (p.brand) map.set(p.brand, (map.get(p.brand) || 0) + 1) })
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1])
  }, [products])

  const typeCounts = useMemo(() => {
    const map = new Map<string, number>()
    products.filter(p => p.category !== 'Phones').forEach(p => { map.set(p.category, (map.get(p.category) || 0) + 1) })
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1])
  }, [products])

  const phoneProducts = useMemo(() => {
    return products.filter(p => {
      if (p.category !== 'Phones') return false
      const matchSearch = search === '' || p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase()) || p.model.toLowerCase().includes(search.toLowerCase())
      const matchPrice = p.price >= priceMin && p.price <= priceMax
      const matchBrand = selectedBrands.length === 0 || selectedBrands.includes(p.brand)
      const matchAvailability = selectedAvailability.length === 0 || selectedAvailability.some(a => a === 'in' ? p.stockQuantity > 0 : p.stockQuantity === 0)
      return matchSearch && matchPrice && matchBrand && matchAvailability
    })
  }, [products, search, priceMin, priceMax, selectedBrands, selectedAvailability])

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.model.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase())
      const matchCat = category === 'All' || p.category === category
      const matchPrice = p.price >= priceMin && p.price <= priceMax
      const matchBrand = selectedBrands.length === 0 || selectedBrands.includes(p.brand)
      const matchType = selectedTypes.length === 0 || selectedTypes.includes(p.category)
      const matchAvailability = selectedAvailability.length === 0 || selectedAvailability.some(a => a === 'in' ? p.stockQuantity > 0 : p.stockQuantity === 0)
      return matchSearch && matchCat && matchPrice && matchBrand && matchType && matchAvailability
    })
  }, [products, search, category, priceMin, priceMax, selectedBrands, selectedTypes, selectedAvailability])

  const otherProducts = filtered.filter(p => p.category !== 'Phones')

  return (
    <div className="min-h-screen pt-0" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto pt-24 pb-16 px-6">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Our Products</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Browse our range of surveillance and communications equipment</p>
        </div>


        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <input className="flex-1 rounded-xl px-4 py-3 outline-none border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)} className="px-4 py-2 rounded-xl text-sm font-semibold border transition-all" style={{ borderColor: category === c ? 'transparent' : 'var(--border-color)', background: category === c ? 'rgba(21,116,181,0.22)' : 'var(--bg-card)', color: 'var(--text-primary)' }}>{c}</button>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar for filters */}
          <aside className="hidden md:block w-72 sticky top-28 self-start">
            <div className="rounded-2xl p-4 border mb-4" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold uppercase" style={{ color: 'var(--text-primary)' }}>Filters</h4>
                <div className="text-sm text-[var(--text-muted)]">{selectedBrands.length + selectedTypes.length + selectedAvailability.length + (priceMin !== 10000 || priceMax !== 10000000 ? 1 : 0)}</div>
              </div>

              <details open className="mb-3">
                <summary className="cursor-pointer font-medium">Price Range (UGX)</summary>
                <div className="mt-3">
                  <input type="range" min={10000} max={10000000} value={priceMax} onChange={e => setPriceMax(Number(e.target.value))} className="w-full" />
                  <div className="flex gap-2 mt-2">
                    <input type="number" value={priceMin} onChange={e => setPriceMin(Number(e.target.value) || 0)} className="w-1/2 rounded-lg px-3 py-2 border" style={{ borderColor: 'var(--border)' }} />
                    <input type="number" value={priceMax} onChange={e => setPriceMax(Number(e.target.value) || 10000000)} className="w-1/2 rounded-lg px-3 py-2 border" style={{ borderColor: 'var(--border)' }} />
                  </div>
                </div>
              </details>

              <details open className="mb-3">
                <summary className="cursor-pointer font-medium">Brand</summary>
                <div className="mt-3 space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                  {brandCounts.length === 0 ? (
                    <p className="text-xs">No brands yet</p>
                  ) : brandCounts.map(([brand, count]) => (
                    <label key={brand} className="flex items-center gap-2">
                      <input type="checkbox" checked={selectedBrands.includes(brand)} onChange={() => setSelectedBrands(prev => toggleValue(prev, brand))} />
                      {brand} <span className="ml-auto text-xs">({count})</span>
                    </label>
                  ))}
                </div>
              </details>

              <details open className="mb-3">
                <summary className="cursor-pointer font-medium">Product Type</summary>
                <div className="mt-3 space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                  {typeCounts.length === 0 ? (
                    <p className="text-xs">No products yet</p>
                  ) : typeCounts.map(([type, count]) => (
                    <label key={type} className="flex items-center gap-2">
                      <input type="checkbox" checked={selectedTypes.includes(type)} onChange={() => setSelectedTypes(prev => toggleValue(prev, type))} />
                      {type} <span className="ml-auto text-xs">({count})</span>
                    </label>
                  ))}
                </div>
              </details>

              <details className="mb-3">
                <summary className="cursor-pointer font-medium">Availability</summary>
                <div className="mt-3 space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={selectedAvailability.includes('in')} onChange={() => setSelectedAvailability(prev => toggleValue(prev, 'in'))} /> In Stock</label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={selectedAvailability.includes('out')} onChange={() => setSelectedAvailability(prev => toggleValue(prev, 'out'))} /> Out of Stock</label>
                </div>
              </details>

              <button onClick={() => { setSearch(''); setCategory('All'); setPriceMin(10000); setPriceMax(10000000); setSelectedBrands([]); setSelectedTypes([]); setSelectedAvailability([]) }} className="mt-4 w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border font-medium" style={{ borderColor: 'var(--border)' }}>
                Clear Filters
              </button>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1">
            {!loaded ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : otherProducts.length === 0 && phoneProducts.length === 0 ? (
              <div className="text-center py-24" style={{ color: 'var(--text-muted)' }}>
                <p className="text-xl font-medium">No products found</p>
                <p className="text-sm mt-2">Try a different search or category.</p>
              </div>
            ) : (
              <>
                {category !== 'Phones' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {otherProducts.map(p => {
                      const mainImage = getMainImage(p)
                      return (
                        <div key={p.id} onClick={() => setSelected(p)} className="cursor-pointer rounded-2xl overflow-hidden border transition-all hover:-translate-y-1" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)', color: 'var(--text-primary)' }}>
                          <div className="relative overflow-hidden h-48">
                            {mainImage ? (
                              <Image src={mainImage} alt={p.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-contain" style={{ background: 'var(--bg-card)' }} />
                            ) : (
                              <CameraPlaceholder />
                            )}
                            <span className="absolute top-3 left-3 text-xs px-2 py-1 rounded-full border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>{p.category}</span>
                          </div>
                          <div className="p-5">
                            <h3 className="font-bold text-lg mb-1 leading-tight" style={{ color: 'var(--text-primary)' }}>{p.name}</h3>
                            <p className="text-xs font-mono mb-2" style={{ color: 'var(--text-muted)' }}>{p.brand} · {p.model}</p>
                            {p.description && (<p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{p.description}</p>)}
                            <div className="flex items-center justify-between">
                              <span className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>{formatUGX(p.price)}</span>
                              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.stockQuantity} units</span>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={e => {
                                  e.stopPropagation()
                                  addToCart({ id: p.id, name: p.name, price: p.price, image: getMainImage(p) })
                                }}
                                className="inline-flex items-center justify-center rounded-2xl border border-[var(--border)] px-4 py-2 text-sm font-semibold transition-all hover:bg-[var(--bg-primary)]"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                Add to cart
                              </button>
                              <Link href={`/checkout?productId=${encodeURIComponent(p.id)}&name=${encodeURIComponent(p.name)}&price=${encodeURIComponent(String(p.price))}`} onClick={(e) => e.stopPropagation()} className="inline-flex items-center justify-center rounded-2xl bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90">Buy now</Link>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {phoneProducts.length > 0 && (category === 'All' || category === 'Phones') && (
                  <div className="mt-16 mb-8">
                    <div className="mb-10">
                      <p className="text-sm font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--text-muted)' }}>Phones</p>
                      <h2 className="text-4xl md:text-5xl font-bold" style={{ color: 'var(--text-primary)' }}>Explore the lineup.</h2>
                    </div>

                    <div className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory">
                      {phoneProducts.map(phone => {
                        const mainImage = getMainImage(phone)
                        return (
                          <div key={phone.id} onClick={() => setSelected(phone)} className="flex-shrink-0 w-72 md:w-80 snap-start cursor-pointer group">
                            <div className="relative w-full h-80 rounded-3xl overflow-hidden mb-5 border" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-card)', boxShadow: 'var(--card-shadow)' }}>
                              {mainImage ? (<Image src={mainImage} alt={phone.name} fill sizes="(max-width: 768px) 80vw, 320px" className="object-contain" style={{ background: 'var(--bg-card)' }} />) : (<div className="w-full h-full flex flex-col items-center justify-center gap-3"><span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{phone.brand}</span></div>)}
                            </div>

                            <div className="px-1">
                              <h3 className="text-xl font-bold mb-1 group-hover:text-[var(--color-primary)] transition-colors duration-300" style={{ color: 'var(--text-primary)' }}>{phone.name}</h3>
                              <p className="text-sm mb-3 line-clamp-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{phone.description}</p>
                              <p className="text-xl font-bold" style={{ color: 'var(--color-primary)' }}>UGX {phone.price.toLocaleString()}</p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={e => {
                                    e.stopPropagation()
                                    addToCart({ id: phone.id, name: phone.name, price: phone.price, image: getMainImage(phone) })
                                  }}
                                  className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm font-semibold transition-all hover:bg-[var(--bg-primary)]"
                                  style={{ color: 'var(--text-primary)' }}
                                >
                                  Add to cart
                                </button>
                                <Link href={`/checkout?productId=${encodeURIComponent(phone.id)}&name=${encodeURIComponent(phone.name)}&price=${encodeURIComponent(String(phone.price))}`} onClick={(e) => e.stopPropagation()} className="rounded-2xl bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90">Buy now</Link>
                                <button type="button" onClick={(e) => { e.stopPropagation(); setSelected(phone) }} className="rounded-2xl border border-current px-4 py-2 text-sm font-medium transition-all hover:bg-slate-100" style={{ color: 'var(--text-primary)' }}>Learn more</button>
                              </div>
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
        </div>
      </div>

      {selected && (
        <>
          <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" onClick={() => setSelected(null)} />

          <div
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] overflow-y-auto rounded-t-3xl shadow-2xl"
            style={{ background: 'var(--bg-card)' }}
          >
            <div className="flex justify-center pt-4 pb-2">
              <div className="w-12 h-1.5 rounded-full" style={{ background: 'var(--border)' }} />
            </div>

            <div className="max-w-3xl mx-auto px-6 pb-10">
              {/* Close button */}
              <div className="flex justify-end mb-4">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all hover:opacity-70"
                  style={{ color: 'var(--text-primary)', background: 'var(--bg-primary)' }}
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-col md:flex-row gap-8">
                {/* Images — card-fan-carousel */}
                <div className="w-full md:w-1/2">
                  {selected.images && selected.images.length > 0 ? (
                    <ProductImageSlider images={selected.images} name={selected.name} />
                  ) : (
                    <CameraPlaceholder />
                  )}
                </div>

                {/* Details */}
                <div className="w-full md:w-1/2 flex flex-col gap-4">
                  <div>
                    <span
                      className="text-xs px-3 py-1 rounded-full border"
                      style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                    >
                      {selected.category}
                    </span>
                  </div>

                  <h2 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {selected.name}
                  </h2>

                  <p className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>
                    {selected.brand} · {selected.model}
                  </p>

                  {selected.description && (
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {selected.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>
                      {formatUGX(selected.price)}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {selected.stockQuantity} in stock
                    </span>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <Link
                      href={`/checkout?productId=${encodeURIComponent(selected.id)}&name=${encodeURIComponent(selected.name)}&price=${encodeURIComponent(String(selected.price))}`}
                      onClick={() => setSelected(null)}
                      className="flex-1 inline-flex items-center justify-center rounded-2xl px-4 py-3 font-bold text-white"
                      style={{ background: 'var(--color-primary)' }}
                    >
                      Buy Now
                    </Link>
                    <button
                      type="button"
                      onClick={() => setSelected(null)}
                      className="px-4 py-3 rounded-2xl border font-medium"
                      style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <AirtelPayModal open={showAirtel} onClose={() => setShowAirtel(false)} product={selected!} />
    </div>
  )
}
