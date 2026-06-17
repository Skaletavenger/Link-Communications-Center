'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { Camera, ShoppingCart } from 'lucide-react'

interface Product {
  id: string
  name: string
  price: number
  category: string
  image_url?: string
  description?: string
}

const PLACEHOLDER_PRODUCTS = [
  {
    id: 'p1',
    name: '2MP ColorVu Fixed Turret Camera',
    price: 160000,
    category: 'Outdoor Cameras',
    description: 'Professional outdoor surveillance with ColorVu technology',
  },
  {
    id: 'p2',
    name: '4MP H.265 Bullet WiFi Kit',
    price: 950000,
    category: 'Camera Kits',
    description: 'Complete WiFi camera kit with H.265 compression',
  },
  {
    id: 'p3',
    name: '2MP Indoor Fixed Dome Camera',
    price: 90000,
    category: 'Indoor Cameras',
    description: 'Compact indoor dome camera for retail and offices',
  },
  {
    id: 'p4',
    name: '2MP Smart Hybrid Light Fixed Dome',
    price: 165000,
    category: 'Indoor Cameras',
    description: 'Indoor dome with smart hybrid lighting',
  },
  {
    id: 'p5',
    name: '2MP 25X Speed Dome PTZ Camera',
    price: 1300000,
    category: 'PTZ Cameras',
    description: 'Professional PTZ camera with 25X zoom',
  },
  {
    id: 'p6',
    name: '64-ch 2U 4K AcuSense NVR',
    price: 5000000,
    category: 'NVRs',
    description: 'Enterprise-grade 64-channel NVR for large deployments',
  },
]

const FILTER_TABS = ['All', 'Indoor Cameras', 'Outdoor Cameras', 'Camera Kits', 'PTZ Cameras', 'NVRs'] as const

export default function SurveillanceCamerasSection() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([])
  const [activeFilter, setActiveFilter] = useState<string>('All')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const productsPerPage = 6

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`category.ilike.%surveillance%,category.ilike.%camera%,category.ilike.%nvr%,category.ilike.%ptz%`)
        .limit(100)

      if (error) throw error

      if (data && data.length > 0) {
        setProducts(data as Product[])
      } else {
        setProducts(PLACEHOLDER_PRODUCTS as Product[])
      }
    } catch (err) {
      console.error('Error fetching products:', err)
      setProducts(PLACEHOLDER_PRODUCTS as Product[])
    } finally {
      setLoading(false)
    }
  }

  const filterAndPaginateProducts = useCallback(() => {
    let filtered = products

    if (activeFilter !== 'All') {
      filtered = products.filter((p) => p.category === activeFilter || p.category?.includes(activeFilter))
    }

    const startIndex = (page - 1) * productsPerPage
    const endIndex = startIndex + productsPerPage
    const paginated = filtered.slice(startIndex, endIndex)

    setDisplayedProducts(paginated)
    setHasMore(endIndex < filtered.length)
  }, [products, activeFilter, page])

  useEffect(() => {
    filterAndPaginateProducts()
  }, [products, activeFilter, page, filterAndPaginateProducts])

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter)
    setPage(1)
  }

  const handleLoadMore = () => {
    setPage((prev) => prev + 1)
  }

  return (
    <section className="py-20 md:py-28 px-6 md:px-16" style={{ background: 'var(--bg-primary)' }}>
      <motion.div
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-2" style={{ color: 'var(--text-primary)' }}>
              Surveillance Cameras
            </h2>
            <p className="text-base md:text-lg" style={{ color: 'var(--text-secondary)' }}>
              Professional Hikvision cameras for homes, businesses, and enterprises across Uganda
            </p>
          </div>
          <button
            onClick={() => router.push('/products')}
            className="px-6 py-2 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            View All Products
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 md:gap-3 mb-10 overflow-x-auto pb-2">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => handleFilterChange(tab)}
              className={`px-4 py-2 rounded-full font-medium text-sm md:text-base transition-all whitespace-nowrap border ${
                activeFilter === tab
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-opacity-30 hover:border-opacity-60'
              }`}
              style={{
                borderColor: activeFilter === tab ? '#1574B5' : 'var(--border-color)',
                color: activeFilter === tab ? 'white' : 'var(--text-secondary)',
                background: activeFilter === tab ? '#1574B5' : 'transparent',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : displayedProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {displayedProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  className="rounded-lg border p-5 transition-all hover:shadow-lg"
                  style={{
                    background: 'var(--bg-card)',
                    borderColor: 'var(--border-color)',
                    boxShadow: 'var(--card-shadow)',
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                >
                  {/* Product Image Placeholder */}
                  <div
                    className="w-full h-48 rounded-md mb-4 flex items-center justify-center"
                    style={{ background: 'rgba(21, 116, 181, 0.1)' }}
                  >
                    <Camera size={48} className="text-blue-400" />
                  </div>

                  {/* Product Name */}
                  <h3
                    className="font-bold text-sm md:text-base mb-2 line-clamp-2"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {product.name}
                  </h3>

                  {/* Description */}
                  {product.description && (
                    <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                      {product.description}
                    </p>
                  )}

                  {/* Price */}
                  <div className="mb-4">
                    <p className="text-blue-400 font-bold text-lg">UGX {product.price.toLocaleString()}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      className="flex-1 px-3 py-2 rounded-md font-semibold text-sm text-white transition-colors"
                      style={{ background: '#1574B5' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#1264a3')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#1574B5')}
                    >
                      <ShoppingCart size={14} className="inline mr-1" /> Add to Cart
                    </button>
                    <button
                      className="flex-1 px-3 py-2 rounded-md font-semibold text-sm transition-colors border"
                      style={{
                        borderColor: '#1574B5',
                        color: '#1574B5',
                        background: 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(21, 116, 181, 0.1)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <motion.div className="flex justify-center mt-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <button
                  onClick={handleLoadMore}
                  className="px-8 py-3 rounded-lg font-semibold text-white transition-all"
                  style={{
                    background: '#1574B5',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#1264a3')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#1574B5')}
                >
                  Load More Products
                </button>
              </motion.div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <p style={{ color: 'var(--text-secondary)' }}>No products found in this category.</p>
          </div>
        )}
      </motion.div>
    </section>
  )
}
