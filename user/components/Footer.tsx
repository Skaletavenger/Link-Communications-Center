"use client"

import Link from 'next/link'
import { Share2, Users, Globe, Video, Phone, Mail, MapPin, Clock } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="mt-12" style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}>
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-2">
          <div className="mb-4">{/* Logo placeholder */}
            <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Link Communications Center</h3>
          </div>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Your trusted partner for communication solutions, devices, and service.</p>
          <div className="flex gap-2">
            <button className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white"><Share2 size={14} /></button>
            <button className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 flex items-center justify-center text-white"><Users size={14} /></button>
            <button className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white"><Globe size={14} /></button>
            <button className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white"><Video size={14} /></button>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Quick Links</h4>
          <ul className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/products">Products</Link></li>
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/contact">Contact Us</Link></li>
            <li><Link href="/loans">Smartphone Loans</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Services</h4>
          <ul className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            <li>Surveillance Cameras</li>
            <li>Access Control</li>
            <li>Networking</li>
            <li>Wireless Solutions</li>
            <li>Support</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Contact Us</h4>
          <ul className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            <li className="flex items-center gap-2"><Phone size={14} /> +256 700 123456</li>
            <li className="flex items-center gap-2"><Mail size={14} /> info@lcc.co.ug</li>
            <li className="flex items-center gap-2"><MapPin size={14} /> Lions Shopping Center, Kampala</li>
            <li className="flex items-center gap-2"><Clock size={14} /> Mon–Sat: 9:00 AM–6:00 PM</li>
          </ul>
        </div>
      </div>

      <div className="border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between text-sm" style={{ color: 'var(--text-muted)' }}>
          <div>© 2025 Link Communications Center. All rights reserved.</div>
          <div className="mt-2 md:mt-0">
            <Link href="/privacy" className="text-[var(--color-primary)] mr-3">Privacy Policy</Link>
            <Link href="/terms" className="text-[var(--color-primary)]">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
