'use client'
import { useState, useEffect } from 'react'
import { supabase } from './supabase'

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

export function formatUGX(amount: number): string {
  return 'UGX ' + amount.toLocaleString()
}

export function useInventory() {
  const [products, setProducts] = useState<Product[]>([])
  const [loaded, setLoaded] = useState(false)

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setProducts(
        (data as any[]).map((p) => ({
          id: p.id,
          name: p.name,
          brand: p.brand,
          model: p.model || '',
          category: p.category || 'Other',
          price: p.price,
          stockQuantity: p.stock_quantity,
          description: p.description || '',
          image: p.image || '',
          images: p.images || []
        }))
      )
    }

    setLoaded(true)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const addProduct = async (p: Omit<Product, 'id'>) => {
    await supabase.from('products').insert({
      name: p.name,
      brand: p.brand,
      model: p.model,
      category: p.category,
      price: p.price,
      stock_quantity: p.stockQuantity,
      description: p.description,
      image: p.image,
      images: p.images || []
    })
    await fetchProducts()
  }

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    await supabase
      .from('products')
      .update({
        name: updates.name,
        brand: updates.brand,
        model: updates.model,
        category: updates.category,
        price: updates.price,
        stock_quantity: updates.stockQuantity,
        description: updates.description,
        image: updates.image,
        images: updates.images || []
      })
      .eq('id', id)
    await fetchProducts()
  }

  const deleteProduct = async (id: string) => {
    await supabase.from('products').delete().eq('id', id)
    await fetchProducts()
  }

  return { products, loaded, addProduct, updateProduct, deleteProduct }
}
