'use client'
/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { useMemo } from 'react'
import { ArrowRight } from 'lucide-react'
import { ProductRow, toProduct, formatUGX } from '../../lib/inventory'

type Props = {
  rows: ProductRow[]
  productsHref: string
}

export default function FeaturedProductsSection({ rows, productsHref }: Props) {
  const products = useMemo(() => rows.map(toProduct).slice(0, 8), [rows])

  if (products.length === 0) return null

  return (
    <section className="py-20 md:py-24 px-6 md:px-16" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
              Featured Products
            </h2>
            <p className="text-sm md:text-base mt-2" style={{ color: 'var(--text-muted)' }}>
              A quick look at what&apos;s in stock right now.
            </p>
          </div>
          <Link
            href={productsHref}
            className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold whitespace-nowrap"
            style={{ color: 'var(--color-primary)' }}
          >
            View all products <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {products.map(p => {
            const img = p.images?.[0] || p.image
            return (
              <Link
                key={p.id}
                href={`/products/${p.id}`}
                className="group rounded-2xl overflow-hidden border transition-shadow"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', boxShadow: 'var(--card-shadow)' }}
              >
                <div className="relative w-full h-40 md:h-44 overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
                  {img ? (
                    <img
                      src={img}
                      alt={p.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1574B5" strokeWidth="1.2" opacity="0.4">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                    </div>
                  )}
                  <span
                    className="absolute top-3 left-3 text-xs px-2 py-1 rounded-full border"
                    style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  >
                    {p.category}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm leading-snug line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                    {p.name}
                  </h3>
                  <p className="mt-2 font-bold" style={{ color: 'var(--color-primary)' }}>{formatUGX(p.price)}</p>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="mt-10 text-center sm:hidden">
          <Link
            href={productsHref}
            className="inline-flex items-center gap-1 text-sm font-semibold"
            style={{ color: 'var(--color-primary)' }}
          >
            View all products <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}
