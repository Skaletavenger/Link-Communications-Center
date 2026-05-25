'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
    <nav className="container mx-auto px-6 py-4 flex justify-between items-center bg-white/90 dark:bg-[#0d1428]/80 border-b border-gray-200 dark:border-white/10 backdrop-blur-md">
      <Link href="/" className="flex items-center gap-3">
        <div className="flex items-center justify-center w-11 h-11 bg-[#1d70b8] dark:bg-white rounded-[12px] shadow-sm shrink-0 transition-colors duration-300">
          <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-white dark:text-[#1d70b8]" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 5l-3 7h5l-3 7" strokeWidth="2" fill="currentColor" />
            <path d="M7 14c2.5-1.5 5.5-1.5 8 0" />
            <path d="M5 17c4-2.5 8-2.5 12 0" />
          </svg>
        </div>
        <div className="flex flex-col justify-center leading-none">
          <span className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tighter font-mono transition-colors duration-300">link</span>
          <span className="text-[9px] font-bold text-gray-600 dark:text-gray-300 tracking-[0.12em] uppercase mt-0.5 transition-colors duration-300">Communications Center</span>
        </div>
      </Link>
      <div className="flex gap-4 items-center">
        {navItems.map((item) => {
          const active = path === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative px-3 py-1 rounded-md transition-colors duration-150 ${active ? 'bg-electric text-navy' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/90 dark:hover:bg-white/5'}`}
            >
              {item.label}
              <motion.span
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="absolute left-0 bottom-0 h-[2px] w-full origin-left bg-accent"
              />
            </Link>
          );
        })}
      </div>
      <ThemeToggle />
    </nav>
  );
}
