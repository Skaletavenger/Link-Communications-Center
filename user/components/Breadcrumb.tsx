"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { House, ChevronRight } from 'lucide-react'

export default function Breadcrumb() {
  const pathname = usePathname() || '/'
  const segments = pathname.split('/').filter(Boolean)

  return (
    <div className="w-full border-b" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <nav className="max-w-7xl mx-auto px-6 py-2 text-sm flex items-center gap-2" aria-label="Breadcrumb">
        <Link href="/" className="text-[var(--color-primary)] flex items-center gap-2">
          <House size={14} /> Home
        </Link>
        {segments.map((seg, i) => {
          const isLast = i === segments.length - 1
          const href = '/' + segments.slice(0, i + 1).join('/')
          const label = seg.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

          return (
            <span key={href} className="flex items-center gap-2">
              <ChevronRight size={14} />
              {isLast ? (
                <span style={{ color: 'var(--text-muted)' }}>{label}</span>
              ) : (
                <Link href={href} style={{ color: 'var(--color-primary)' }}>{label}</Link>
              )}
            </span>
          )
        })}
      </nav>
    </div>
  )
}
