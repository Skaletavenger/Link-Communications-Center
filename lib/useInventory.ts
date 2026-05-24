'use client'
import { useState, useEffect } from 'react'

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
}

export const categories = ['Surveillance Cameras', 'Access Control', 'Networking', 'Intercoms', 'Alarms', 'Other']

const defaultProducts: Product[] = [
  { id: '1', name: 'HIK Vision Dome Camera', brand: 'HIK Vision', model: 'DS-2CD2143G2-I', category: 'Surveillance Cameras', price: 85, stockQuantity: 12, description: '4MP AcuSense Fixed Dome Network Camera', image: '' },
  { id: '2', name: 'HIK Vision Bullet Camera', brand: 'HIK Vision', model: 'DS-2CD2347G2-LU', category: 'Surveillance Cameras', price: 110, stockQuantity: 8, description: '4MP ColorVu Fixed Turret Network Camera', image: '' },
  { id: '3', name: 'HIK Vision PTZ Speed Dome', brand: 'HIK Vision', model: 'DS-2DE4425IWG-E', category: 'Surveillance Cameras', price: 245, stockQuantity: 4, description: '4MP 25x Optical Zoom Network Speed Dome', image: '' },
  { id: '4', name: 'HIK Vision 8CH NVR', brand: 'HIK Vision', model: 'DS-7608NXI-K2', category: 'Networking', price: 320, stockQuantity: 5, description: '8 Channel AcuSense Network Video Recorder', image: '' },
  { id: '5', name: 'HIK Vision Video Doorbell', brand: 'HIK Vision', model: 'DS-KV8113-WME1', category: 'Intercoms', price: 95, stockQuantity: 3, description: 'WiFi Video Door Phone with Two-Way Audio', image: '' },
]

export function useInventory() {
  const [products, setProducts] = useState<Product[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('lcc_inventory')
      if (stored) {
        setProducts(JSON.parse(stored))
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
    try { localStorage.setItem('lcc_inventory', JSON.stringify(updated)) } catch {}
  }

  const addProduct = (p: Omit<Product, 'id'>) => save([...products, { ...p, id: Date.now().toString() }])
  const updateProduct = (id: string, updates: Partial<Product>) => save(products.map(p => p.id === id ? { ...p, ...updates } : p))
  const deleteProduct = (id: string) => save(products.filter(p => p.id !== id))

  return { products, loaded, addProduct, updateProduct, deleteProduct }
}
