'use client'

import { FormEvent, useState } from 'react'
import Navbar from '../../components/Navbar'
import Breadcrumb from '../../components/Breadcrumb'
import { supabase } from '../../lib/supabase'

import Footer from '../../components/Footer'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const { error } = await supabase
      .from('contact_messages')
      .insert({
        name: form.name,
        email: form.email,
        message: form.message
      })

    if (error) {
      setError('Failed to send message. Please try again.')
    } else {
      setSuccess('Message sent successfully! We will get back to you soon.')
      setForm({ name: '', email: '', message: '' })
    }
    setLoading(false)
  }

  const contactMethods = [
    {
      icon: '💬',
      label: 'WhatsApp',
      value: '+256 700 123456',
      action: 'https://wa.me/256700123456',
      color: '#25D366'
    },
    {
      icon: '📞',
      label: 'Call Us',
      value: '+256 700 123456',
      action: 'tel:+256700123456',
      color: '#1574B5'
    },
    {
      icon: '📧',
      label: 'Email',
      value: 'info@lcc.co.ug',
      action: 'mailto:info@lcc.co.ug',
      color: '#ED2124'
    }
  ]

  const socialLinks = [
    { name: 'TikTok', handle: '@lcc_tech', url: 'https://tiktok.com/@lcc_tech', icon: '🎵' },
    { name: 'Facebook', handle: 'LCC Technology Solutions', url: 'https://facebook.com/lcc.tech', icon: 'f' },
    { name: 'Instagram', handle: '@lcc_tech_solutions', url: 'https://instagram.com/lcc_tech_solutions', icon: '📷' }
  ]

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <Breadcrumb items={[
        { label: 'Home', href: '/' },
        { label: 'Contact' }
      ]} />

      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-16">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4" style={{ color: 'var(--text-primary)' }}>
            Get in Touch
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            We&apos;d love to hear from you. Reach out to us for quotations, installations, support, or any inquiries.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Left Column - Contact Info & Quick Actions */}
          <div className="space-y-8">
            {/* Office Location */}
            <div className="rounded-2xl p-6 md:p-8 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              <div className="flex items-start gap-4 mb-6">
                <div className="text-3xl">📍</div>
                <div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                    Our Office
                  </h3>
                  <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
                    We&apos;re here to help
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Lions Shopping Center
                  </p>
                  <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
                    Namirembe Road, Kampala, Uganda
                  </p>
                </div>

                <div className="border-t pt-3" style={{ borderColor: 'var(--border-color)' }}>
                  <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                    Business Hours
                  </p>
                  <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
                    Mon – Fri: 8:00 AM – 5:00 PM
                  </p>
                  <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
                    Sat: 9:00 AM &ndash; 1:00 PM
                  </p>
                  <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
                    Sun: Closed
                  </p>
                </div>

                <div className="border-t pt-3" style={{ borderColor: 'var(--border-color)' }}>
                  <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
                    We welcome visits by appointment. <a href="#contact-form" className="font-semibold hover:opacity-80 transition-opacity" style={{ color: '#1574B5' }}>Come say hello!</a>
                  </p>
                </div>
              </div>

              {/* Embedded Map */}
              <div className="mt-6 rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border-color)' }}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.7434567890123!2d32.5825!3d0.3476!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sLions%20Shopping%20Center!5e0!3m2!1sen!2sug!4v1234567890"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            {/* Quick Contact Methods */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                Or contact us quickly
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {contactMethods.map((method) => (
                  <a
                    key={method.label}
                    href={method.action}
                    target={method.label === 'Call Us' ? undefined : '_blank'}
                    rel="noopener noreferrer"
                    className="rounded-xl p-4 text-center font-bold text-white transition-all hover:opacity-90 hover:scale-105"
                    style={{ background: method.color }}
                  >
                    <div className="text-2xl mb-2">{method.icon}</div>
                    <p className="text-sm">{method.label}</p>
                  </a>
                ))}
              </div>
            </div>

            {/* Social Media */}
            <div className="rounded-2xl p-6 md:p-8 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              <div className="flex items-start gap-4 mb-6">
                <div className="text-3xl">👥</div>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                    Connect With Us
                  </h3>
                  <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
                    Follow us for updates and behind-the-scenes content
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg transition-all hover:opacity-80"
                    style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                  >
                    <span className="text-xl">{social.icon}</span>
                    <div>
                      <p className="font-semibold text-sm">{social.name}</p>
                      <p style={{ color: 'var(--text-secondary)' }} className="text-xs">
                        {social.handle}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div id="contact-form" className="rounded-2xl p-6 md:p-8 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Send Us a Message
            </h2>
            <p style={{ color: 'var(--text-secondary)' }} className="mb-6 text-sm">
              We typically reply within a few hours
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-semibold block mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-xl px-4 py-3 outline-none border transition-colors focus:border-blue-500"
                  style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="text-sm font-semibold block mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Your Email
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full rounded-xl px-4 py-3 outline-none border transition-colors focus:border-blue-500"
                  style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="text-sm font-semibold block mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Your Message
                </label>
                <textarea
                  required
                  rows={6}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  className="w-full rounded-xl px-4 py-3 outline-none border resize-none transition-colors focus:border-blue-500"
                  style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  placeholder="Tell us about your inquiry..."
                />
              </div>

              {error && (
                <div className="p-4 rounded-lg" style={{ background: '#ED2124', color: 'white' }}>
                  <p className="text-sm font-semibold">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-4 rounded-lg" style={{ background: '#F47821', color: 'white' }}>
                  <p className="text-sm font-semibold">{success}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-8 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: '#1574B5' }}
              >
                <span>✉️</span>
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
