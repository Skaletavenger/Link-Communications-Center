export interface ProductRow {
  id: string
  name: string
  brand: string
  model: string | null
  category: string | null
  price: number
  stock_quantity: number
  description: string | null
  image: string | null
  images: string[] | null
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

export const CATEGORIES = [
  'All',
  'Surveillance Cameras',
  'Access Control',
  'Networking',
  'Intercoms',
  'Alarms',
  'Phones',
  'Other'
]

export function formatUGX(amount: number): string {
  return 'UGX ' + amount.toLocaleString()
}

export function toProduct(row: ProductRow): Product {
  const rawImages = (row.images || []).filter(Boolean)
  const main = rawImages[0] || row.image || ''
  const images = rawImages.length ? rawImages : main ? [main] : []
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    model: row.model || '',
    category: row.category || 'Other',
    price: row.price,
    stockQuantity: row.stock_quantity,
    description: row.description || '',
    image: main,
    images
  }
}

