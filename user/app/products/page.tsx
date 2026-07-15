import type { Metadata } from 'next'
import ProductsClient from './ProductsClient'
import { fetchAllProducts } from '../../lib/products-server'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Products | Link Communications Center',
  description:
    'Shop surveillance cameras, access control, networking equipment, intercoms, alarms and phones in Kampala, Uganda. Pay with MTN MoMo or Airtel Money.',
  alternates: { canonical: 'https://linkcommunicationscenter.com/products' },
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: { category?: string }
}) {
  const rows = await fetchAllProducts()
  return <ProductsClient initialRows={rows} initialCategory={searchParams?.category} />
}
