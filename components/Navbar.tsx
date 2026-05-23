'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
        <Link href="/products" className={"px-3 py-1 rounded-md transition-colors duration-150 " + (path === '/products' ? 'bg-electric text-navy' : 'text-muted hover:text-white hover:bg-white/5')}>Products</Link>
        <Link href="/dashboard" className={"px-3 py-1 rounded-md transition-colors duration-150 " + (path === '/dashboard' ? 'bg-electric text-navy' : 'text-muted hover:text-white hover:bg-white/5')}>Dashboard</Link>
        <Link href="/about" className="px-3 py-1 text-muted transition-colors duration-150 hover:text-white hover:bg-white/5 rounded-md">About</Link>
        <Link href="/contact" className="px-3 py-1 text-muted transition-colors duration-150 hover:text-white hover:bg-white/5 rounded-md">Contact</Link>
      </div>
    </nav>
  );
}
