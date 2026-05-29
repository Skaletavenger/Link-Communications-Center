'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

const navItems = [
  { href: '/products', label: 'Products' },
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
        <Link href="/" className="flex flex-col items-start select-none">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 rounded-xl flex items-center justify-center w-10 h-10 bg-[#1574B5]">
              <svg viewBox="0 0 44 44" fill="none" width="30" height="30">
                <line x1="10" y1="8" x2="18" y2="19" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
                <line x1="17" y1="8" x2="25" y2="19" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
                <path d="M6 30 Q22 20 38 30" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round"/>
                <path d="M12 36 Q22 29 32 36" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                <circle cx="22" cy="41" r="2.8" fill="white"/>
              </svg>
            </div>
            <span
              className="font-black uppercase tracking-wide transition-colors duration-300"
              style={{ color: 'var(--accent)', fontSize: '28px' }}
            >
              LINK
            </span>
          </div>
          <span
            className="font-bold uppercase"
            style={{ color: 'var(--text-muted)', fontSize: '8px', marginTop: '1px', paddingLeft: '2px', letterSpacing: '0.2em' }}
          >
            COMMUNICATIONS CENTER
          </span>
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

        <ThemeToggle />
      </div>
    </nav>
  );
}
