import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatUGX, toProduct } from '../../../lib/inventory'
import { fetchProduct } from '../../../lib/products-server'

export const revalidate = 300

type Props = { params: { id: string } }

const BASE_URL = 'https://linkcommunicationscenter.com'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const row = await fetchProduct(params.id)
  if (!row) {
    return { title: 'Product not found | Link Communications Center' }
  }
  const p = toProduct(row)
  const description = `${p.description || `${p.name} by ${p.brand}`} — ${formatUGX(p.price)} in Kampala, Uganda. Pay with MTN MoMo or Airtel Money.`.slice(0, 300)
  return {
    title: `${p.name} | Link Communications Center`,
    description,
    alternates: { canonical: `${BASE_URL}/products/${p.id}` },
    openGraph: {
      title: p.name,
      description,
      type: 'website',
      url: `${BASE_URL}/products/${p.id}`,
      images: p.image ? [p.image] : undefined,
    },
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const row = await fetchProduct(params.id)
  if (!row) notFound()
  const p = toProduct(row)
  const canonical = `${BASE_URL}/products/${p.id}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    brand: { '@type': 'Brand', name: p.brand },
    description: p.description || undefined,
    image: p.images.length ? p.images : p.image ? [p.image] : undefined,
    category: p.category,
    offers: {
      '@type': 'Offer',
      url: canonical,
      priceCurrency: 'UGX',
      price: p.price,
      availability: p.stockQuantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  }

  const checkoutHref = `/checkout?productId=${encodeURIComponent(p.id)}&name=${encodeURIComponent(p.name)}&price=${encodeURIComponent(String(p.price))}`

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'var(--bg-primary)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-5xl mx-auto">
        <Link href="/products" className="inline-block mb-6 text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
          &larr; All products
        </Link>

        <div className="grid gap-8 md:grid-cols-2 rounded-[28px] border p-6 md:p-10" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
          <div>
            {p.image ? (
              <Image
                src={p.images[0] || p.image}
                alt={p.name}
                width={800}
                height={600}
                className="w-full h-auto rounded-2xl object-cover"
                priority
              />
            ) : (
              <div className="w-full h-64 rounded-2xl border flex items-center justify-center" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>No image available</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{p.category}</p>
            <h1 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>{p.name}</h1>
            <p className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>{p.brand}{p.model ? ` \u00b7 ${p.model}` : ''}</p>

            {p.description && (
              <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{p.description}</p>
            )}

            <div className="flex items-center justify-between pt-2">
              <span className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>{formatUGX(p.price)}</span>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {p.stockQuantity > 0 ? `${p.stockQuantity} in stock` : 'Out of stock'}
              </span>
            </div>

            <div className="flex gap-3 pt-4">
              <Link
                href={checkoutHref}
                className="flex-1 inline-flex items-center justify-center rounded-2xl px-4 py-3 font-bold text-white"
                style={{ background: 'var(--color-primary)' }}
              >
                Buy Now &mdash; Pay with MoMo
              </Link>
            </div>

            <p className="text-xs pt-2" style={{ color: 'var(--text-muted)' }}>
              Sold by Link Communications Center, Kampala, Uganda. Secure payment via Pesapal (MTN MoMo &amp; Airtel Money).
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
