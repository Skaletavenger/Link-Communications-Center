'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import BrandLogo from './BrandLogo';

const navItems = [
  { href: '/products', label: 'Products' },
  { href: '/home-display', label: 'Home Display' },
  { href: '/loans', label: 'Loans' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' }
];

export default function Navbar() {
  const path = usePathname();

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-md transition-all"
      style={{
        background: 'var(--nav-bg)',
        borderColor: 'var(--nav-border)'
      }}
    >
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center select-none shrink-0">
          <BrandLogo />
        </Link>

        <div className="hidden md:flex gap-2 items-center">
          {navItems.map((item) => {
            const active = path === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="font-medium transition-colors duration-200 hover:opacity-80"
                style={
                  active
                    ? {
                        background: '#1574B5',
                        color: '#ffffff',
                        padding: '6px 14px',
                        borderRadius: '8px'
                      }
                    : { color: 'var(--nav-link)' }
                }
              >
                {item.label}
              </Link>
            );
          })}
        </div>

      </div>
    </nav>
  );
}
