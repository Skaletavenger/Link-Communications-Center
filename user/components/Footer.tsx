"use client"

import Link from 'next/link'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'

/**
 * Update these with the real Link Communications Center handles.
 * WhatsApp/phone/email are wired to the numbers shown in the contact column.
 */
const PHONE = '+256757837184'
const EMAIL = 'info@lcc.co.ug'
const SOCIALS = [
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/Linkcomm2014/',
    bg: '#1877F2',
    path: 'M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.9 3.78-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.9h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94z',
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/the_link_communications/',
    bg: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fd5949 45%, #d6249f 60%, #285AEB 90%)',
    path: 'M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 1.62c-3.15 0-3.52.01-4.76.07-.9.04-1.39.19-1.71.32-.43.17-.74.37-1.06.69-.32.32-.52.63-.69 1.06-.13.32-.28.81-.32 1.71-.06 1.24-.07 1.61-.07 4.76s.01 3.52.07 4.76c.04.9.19 1.39.32 1.71.17.43.37.74.69 1.06.32.32.63.52 1.06.69.32.13.81.28 1.71.32 1.24.06 1.61.07 4.76.07s3.52-.01 4.76-.07c.9-.04 1.39-.19 1.71-.32.43-.17.74-.37 1.06-.69.32-.32.52-.63.69-1.06.13-.32.28-.81.32-1.71.06-1.24.07-1.61.07-4.76s-.01-3.52-.07-4.76c-.04-.9-.19-1.39-.32-1.71a2.86 2.86 0 0 0-.69-1.06 2.86 2.86 0 0 0-1.06-.69c-.32-.13-.81-.28-1.71-.32-1.24-.06-1.61-.07-4.76-.07zm0 2.76a5.3 5.3 0 1 1 0 10.6 5.3 5.3 0 0 1 0-10.6zm0 8.74a3.44 3.44 0 1 0 0-6.88 3.44 3.44 0 0 0 0 6.88zm6.75-8.93a1.24 1.24 0 1 1-2.48 0 1.24 1.24 0 0 1 2.48 0z',
  },
  {
    name: 'WhatsApp',
    href: `https://wa.me/${PHONE.replace(/\D/g, '')}`,
    bg: '#25D366',
    path: 'M17.47 14.38c-.29-.15-1.72-.85-1.98-.94-.27-.1-.46-.15-.65.15-.19.29-.75.94-.92 1.13-.17.19-.34.22-.63.07-.29-.15-1.23-.45-2.34-1.44-.87-.77-1.45-1.72-1.62-2.01-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.19-.29.29-.48.1-.19.05-.36-.02-.51-.07-.15-.65-1.58-.9-2.16-.24-.57-.48-.49-.65-.5l-.56-.01c-.19 0-.51.07-.77.36-.27.29-1.01.99-1.01 2.42s1.04 2.8 1.18 2.99c.15.19 2.05 3.13 4.97 4.39.69.3 1.24.48 1.66.61.7.22 1.33.19 1.83.12.56-.08 1.72-.7 1.96-1.38.24-.68.24-1.26.17-1.38-.07-.12-.26-.19-.55-.34zM12.05 21.5h-.01a9.5 9.5 0 0 1-4.84-1.33l-.35-.2-3.6.94.96-3.51-.23-.36a9.46 9.46 0 0 1-1.45-5.05c0-5.24 4.27-9.5 9.52-9.5 2.54 0 4.93.99 6.72 2.79a9.42 9.42 0 0 1 2.78 6.72c0 5.24-4.27 9.5-9.5 9.5zM20.52 3.49A11.44 11.44 0 0 0 12.05 0C5.7 0 .53 5.16.53 11.5c0 2.02.53 4 1.54 5.74L.43 24l6.9-1.81a11.5 11.5 0 0 0 5.72 1.46h.01c6.34 0 11.5-5.16 11.51-11.5a11.42 11.42 0 0 0-3.35-8.15z',
  },
]

const SERVICES = ['Surveillance Cameras', 'Access Control', 'Networking', 'Intercoms', 'Alarms']

export default function Footer() {
  return (
    <footer className="mt-12" style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}>
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-2">
          <div className="mb-4">
            <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Link Communications Center</h3>
          </div>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Your trusted partner for communication solutions, devices, and service.</p>
          <div className="flex gap-2">
            {SOCIALS.map(s => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.name}
                title={s.name}
                className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-transform hover:-translate-y-0.5"
                style={{ background: s.bg }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d={s.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Quick Links</h4>
          <ul className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            <li><Link href="/" className="hover:text-[var(--color-primary)]">Home</Link></li>
            <li><Link href="/#products" className="hover:text-[var(--color-primary)]">Products</Link></li>
            <li><Link href="/about" className="hover:text-[var(--color-primary)]">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-[var(--color-primary)]">Contact Us</Link></li>
            <li><Link href="/loans" className="hover:text-[var(--color-primary)]">Smartphone Loans</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Services</h4>
          <ul className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            {SERVICES.map(name => (
              <li key={name}>
                <Link href={`/?category=${encodeURIComponent(name)}#products`} className="hover:text-[var(--color-primary)]">{name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Contact Us</h4>
          <ul className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            <li><a href={`tel:${PHONE}`} className="flex items-center gap-2 hover:text-[var(--color-primary)]"><Phone size={14} /> +256 757 837184</a></li>
            <li><a href={`mailto:${EMAIL}`} className="flex items-center gap-2 hover:text-[var(--color-primary)]"><Mail size={14} /> {EMAIL}</a></li>
            <li className="flex items-center gap-2"><MapPin size={14} /> Lions Shopping Center, Kampala</li>
            <li className="flex items-center gap-2"><Clock size={14} /> Mon–Sat: 9:00 AM–6:00 PM</li>
          </ul>
        </div>
      </div>

      <div className="border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between text-sm" style={{ color: 'var(--text-muted)' }}>
          <div>© {new Date().getFullYear()} Link Communications Center. All rights reserved.</div>
          <div className="mt-2 md:mt-0">
            <Link href="/privacy" className="text-[var(--color-primary)] mr-3">Privacy Policy</Link>
            <Link href="/terms" className="text-[var(--color-primary)]">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
