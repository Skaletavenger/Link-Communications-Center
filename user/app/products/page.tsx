import { redirect } from 'next/navigation'

export default function ProductsPage({
  searchParams,
}: {
  searchParams?: { category?: string }
}) {
  const category = searchParams?.category
  redirect(category ? `/?category=${encodeURIComponent(category)}#products` : '/#products')
}
