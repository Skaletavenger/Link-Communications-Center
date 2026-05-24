'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/products', label: 'Products' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' }
];

export default function Navbar() {
  const path = usePathname();
  return (
    <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
      <Link href="/" className="flex items-center gap-3">
        <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="rounded-full bg-white/5 p-2">
          <circle cx="50" cy="50" r="40" stroke="#00b4ff" strokeWidth="6">
            <animate attributeName="r" from="36" to="40" dur="2s" repeatCount="indefinite" />
          </circle>
        </svg>
        <span className="font-bold">Link Communications</span>
      </Link>
      <div className="flex gap-4">
        {navItems.map((item) => {
          const active = path === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative px-3 py-1 rounded-md transition-colors duration-150 ${active ? 'bg-electric text-navy' : 'text-muted hover:text-white hover:bg-white/5'}`}
            >
              {item.label}
              <motion.span
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="absolute left-0 bottom-0 h-[2px] w-full origin-left bg-[#00B4FF]"
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
