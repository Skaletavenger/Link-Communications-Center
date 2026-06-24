'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface BreadcrumbItem {
  label: string
  href?: string
}

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-2 text-sm py-4 px-4 md:px-6" style={{ color: 'var(--text-secondary)' }}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {item.href ? (
            <Link
              href={item.href}
              className="hover:opacity-80 transition-opacity"
              style={{ color: '#1574B5' }}
            >
              {item.label}
            </Link>
          ) : (
            <span>{item.label}</span>
          )}
          {index < items.length - 1 && (
            <span className="opacity-50">/</span>
          )}
        </div>
      ))}
    </nav>
  )
}
