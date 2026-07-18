import type { Metadata } from 'next'
import HomePage from '@/components/home/HomePage'
import { fetchAllProducts } from '@/lib/products-server'

export const revalidate = 60

export const metadata: Metadata = {
  title: { absolute: 'Link Communications Center | CCTV, Networking, Phones & Smartphone Loans in Kampala' },
  description:
    'Shop CCTV cameras, access control, networking, intercoms, alarms and smartphones in Kampala. Pay with MTN MoMo or Airtel Money, get delivery across Kampala, and apply for smartphone loans — Link Communications Center, Lions Shopping Center, Namirembe Road.',
  alternates: { canonical: '/' },
}

export default async function Page({
  searchParams,
}: {
  searchParams?: { category?: string }
}) {
  const rows = await fetchAllProducts()
  return <HomePage featuredRows={rows} initialCategory={searchParams?.category} />
}
