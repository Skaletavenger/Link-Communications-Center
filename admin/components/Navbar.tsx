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
            className="font-black uppercase text-[#1574B5] dark:text-white transition-colors duration-300"
            style={{ fontSize: '28px', lineHeight: '1', letterSpacing: '0.05em' }}
          >
            LINK
          </span>
        </div>
        <span
          className="font-bold uppercase text-[#1574B5] dark:text-white/70 transition-colors duration-300"
          style={{ fontSize: '7.5px', marginTop: '1px', paddingLeft: '2px', letterSpacing: '0.2em' }}
        >
          COMMUNICATIONS CENTER
        </span>
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
