import HomePage from '@/components/home/HomePage'
import { fetchAllProducts } from '@/lib/products-server'

export const revalidate = 60

export default async function Page({
  searchParams,
}: {
  searchParams?: { category?: string }
}) {
  const rows = await fetchAllProducts()
  return <HomePage featuredRows={rows} initialCategory={searchParams?.category} />
}
