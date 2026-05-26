'use client'
import { useState, useEffect } from 'react'

export function formatUGX(amount: number): string {
  return 'UGX ' + amount.toLocaleString()
}

export interface Product {
  id: string
  name: string
  brand: string
  model: string
  category: string
  price: number
  stockQuantity: number
  description: string
  image: string
  images: string[]
}

function normalizeProductInput(p: Omit<Product, 'id'>): Omit<Product, 'id'> {
  const images = (p.images ?? []).filter((img) => Boolean(img?.trim()))
  const image = images[0] || p.image || ''
  return { ...p, images, image }
}

export function normalizeStoredProduct(p: Product): Product {
  const images =
    p.images?.filter((img) => Boolean(img?.trim())) ??
    (p.image ? [p.image] : [])
  const image = images[0] || p.image || ''
  return { ...p, images, image }
}

export const CATEGORIES = [
  'Surveillance Cameras',
  'Access Control',
  'Networking',
  'Intercoms',
  'Alarms',
  'Phones',
  'Other'
]

export const categories = CATEGORIES

const defaultProducts: Product[] = [
  { id: '1', name: 'HIK Vision Dome Camera', brand: 'HIK Vision', model: 'DS-2CD2143G2-I', category: 'Surveillance Cameras', price: 320000, stockQuantity: 12, description: '4MP AcuSense Fixed Dome Network Camera', image: '', images: [] },
  { id: '2', name: 'HIK Vision Bullet Camera', brand: 'HIK Vision', model: 'DS-2CD2347G2-LU', category: 'Surveillance Cameras', price: 410000, stockQuantity: 8, description: '4MP ColorVu Fixed Turret Network Camera', image: '', images: [] },
  { id: '3', name: 'HIK Vision PTZ Speed Dome', brand: 'HIK Vision', model: 'DS-2DE4425IWG-E', category: 'Surveillance Cameras', price: 900000, stockQuantity: 4, description: '4MP 25x Optical Zoom Network Speed Dome', image: '', images: [] },
  { id: '4', name: 'HIK Vision 8CH NVR', brand: 'HIK Vision', model: 'DS-7608NXI-K2', category: 'Networking', price: 1200000, stockQuantity: 5, description: '8 Channel AcuSense Network Video Recorder', image: '', images: [] },
  { id: '5', name: 'HIK Vision Video Doorbell', brand: 'HIK Vision', model: 'DS-KV8113-WME1', category: 'Intercoms', price: 350000, stockQuantity: 3, description: 'WiFi Video Door Phone with Two-Way Audio', image: '', images: [] },
  { id: '6', name: 'iPhone 17 Pro', brand: 'Apple', model: 'iPhone17Pro', category: 'Phones', price: 4500000, stockQuantity: 10, description: 'The most powerful iPhone ever. Titanium design, A19 Pro chip, and a next-generation camera system with 5x optical zoom.', image: '', images: [] },
  { id: '7', name: 'Samsung Galaxy S25 Ultra', brand: 'Samsung', model: 'SM-S928B', category: 'Phones', price: 3800000, stockQuantity: 8, description: 'Ultimate Android flagship. 200MP camera, built-in S Pen, Snapdragon 8 Elite, and 5000mAh battery.', image: '', images: [] },
  { id: '8', name: 'Tecno Camon 30 Pro', brand: 'Tecno', model: 'CL8n', category: 'Phones', price: 850000, stockQuantity: 15, description: 'Premium mid-range phone with 50MP RGBW camera, 5000mAh battery, and 45W fast charging.', image: '', images: [] },
]

export function useInventory() {
  const [products, setProducts] = useState<Product[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('lcc_inventory')
      if (stored) {
        const parsed = JSON.parse(stored) as Product[]
        setProducts(parsed.map(normalizeStoredProduct))
      } else {
        localStorage.setItem('lcc_inventory', JSON.stringify(defaultProducts))
        setProducts(defaultProducts)
      }
    } catch {
      setProducts(defaultProducts)
    }
    setLoaded(true)
  }, [])

  const save = (updated: Product[]) => {
    setProducts(updated)
    try {
      localStorage.setItem('lcc_inventory', JSON.stringify(updated))
      window.dispatchEvent(new Event('storage'))
    } catch {}
  }

  const addProduct = (p: Omit<Product, 'id'>) => {
    const normalized = normalizeProductInput(p)
    save([...products, { ...normalized, id: Date.now().toString() }])
  }
  const updateProduct = (id: string, updates: Partial<Product>) =>
    save(
      products.map((p) =>
        p.id === id ? normalizeStoredProduct({ ...p, ...normalizeProductInput({ ...p, ...updates }) }) : p
      )
    )
  const deleteProduct = (id: string) => save(products.filter(p => p.id !== id))

  return { products, loaded, addProduct, updateProduct, deleteProduct }
}
