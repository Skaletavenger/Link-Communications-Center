'use client'

import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' }
  ]

  const socialLinks = [
    { name: 'TikTok', icon: '🎵', url: 'https://tiktok.com/@lcc_tech' },
    { name: 'Facebook', icon: 'f', url: 'https://facebook.com/lcc.tech' },
    { name: 'Instagram', icon: '📷', url: 'https://instagram.com/lcc_tech_solutions' }
  ]

  return (
    <footer style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Column */}
          <div>
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Link Communications Center
            </h3>
            <p style={{ color: 'var(--text-secondary)' }} className="text-sm mb-4">
              Your trusted partner for surveillance, access control, and communication solutions in Kampala, Uganda.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: 'var(--bg-card)', color: '#1574B5' }}
                  title={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Quick Links
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:opacity-80"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Services
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/products"
                  className="text-sm transition-colors hover:opacity-80"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Surveillance Cameras
                </a>
              </li>
              <li>
                <a
                  href="/products"
                  className="text-sm transition-colors hover:opacity-80"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Access Control
                </a>
              </li>
              <li>
                <a
                  href="/products"
                  className="text-sm transition-colors hover:opacity-80"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Communication Equipment
                </a>
              </li>
              <li>
                <a
                  href="/products"
                  className="text-sm transition-colors hover:opacity-80"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Smartphone Loans
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Contact
            </h4>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  📍 Location
                </p>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Lions Shopping Center<br />
                  Namirembe Road, Kampala
                </p>
              </div>
              <div>
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  📞 Phone
                </p>
                <a
                  href="tel:+256700123456"
                  className="transition-colors hover:opacity-80"
                  style={{ color: '#1574B5' }}
                >
                  +256 700 123456
                </a>
              </div>
              <div>
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  💬 WhatsApp
                </p>
                <a
                  href="https://wa.me/256700123456"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:opacity-80"
                  style={{ color: '#25D366' }}
                >
                  Chat with us
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid var(--border-color)', marginBottom: '24px' }} />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p style={{ color: 'var(--text-secondary)' }}>
            © {currentYear} Link Communications Center. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="#"
              className="transition-colors hover:opacity-80"
              style={{ color: 'var(--text-secondary)' }}
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="transition-colors hover:opacity-80"
              style={{ color: 'var(--text-secondary)' }}
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
