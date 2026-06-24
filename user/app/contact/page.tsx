"use client"

import { FormEvent, useState } from 'react'
import { MapPin, Phone, Clock, Mail, Send, Lock, Users } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function ContactPage(): JSX.Element {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const validateEmail = (email: string) => /^\S+@\S+\.\S+$/.test(email)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!form.name || !form.email || !form.message) {
      setError('Please fill in all required fields.')
      return
    }
    if (!validateEmail(form.email)) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)
    const { error: supError } = await supabase.from('contact_messages').insert({
      name: form.name,
      email: form.email,
      message: form.message,
    })

    if (supError) {
      setError('Failed to send message. Please try again.')
    } else {
      setSuccess('Message sent successfully! We will get back to you soon.')
      setForm({ name: '', email: '', message: '' })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-16">
        {/* Hero */}
        <section className="rounded-2xl mb-8 p-8" style={{ background: 'radial-gradient(circle at 10% 10%, rgba(21,116,181,0.08), transparent), var(--bg-card)', border: '1px solid var(--border)' }}>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-2">
            <span style={{ color: 'var(--text-primary)' }}>Get in Touch</span>
          </h1>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Questions, quotes, or support — our team is ready to help.</p>
          <div className="w-20 h-1.5 bg-[var(--color-primary)] rounded mt-2" />
        </section>

        {/* Main columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left card: Our Office */}
          <div className="rounded-2xl p-6 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-primary)', color: 'white' }}>
                <MapPin />
              </div>
              <div>
                <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>Our Office</h3>
                <p className="text-sm" style={{ color: 'var(--color-primary)' }}>We are here to help</p>
              </div>
            </div>

            <div className="mb-4 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-start gap-3">
                <MapPin className="mt-1" />
                <div style={{ color: 'var(--text-primary)' }}>Lions Shopping Center, Namirembe Road, Kampala, Uganda</div>
              </div>
            </div>

            <div className="mb-4 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--color-primary)', color: 'white' }}>
                  <Clock />
                </div>
                <div>
                  <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Business Hours</h4>
                </div>
              </div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                <div>Monday - Friday: 9:00 AM - 6:00 PM</div>
                <div>Saturday: 10:00 AM - 4:00 PM</div>
                <div>Sunday: Closed</div>
              </div>
            </div>

            <div className="mb-4 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--color-primary)', color: 'white' }}>
                  <Phone />
                </div>
                <div>
                  <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Quick Contact</h4>
                </div>
              </div>

              <div className="flex gap-3">
                <a href="https://wa.me/256757837184" className="flex-1 inline-flex items-center gap-2 justify-center px-3 py-2 rounded-xl text-white" style={{ background: 'var(--color-success)' }}>
                  <Phone /> WhatsApp
                </a>
                <a href="tel:+256700123456" className="flex-1 inline-flex items-center gap-2 justify-center px-3 py-2 rounded-xl text-white" style={{ background: 'var(--color-primary)' }}>
                  <Phone /> Call Us
                </a>
                <a href="mailto:info@lcc.co.ug" className="flex-1 inline-flex items-center gap-2 justify-center px-3 py-2 rounded-xl text-white" style={{ background: 'var(--color-secondary)' }}>
                  <Mail /> Email Us
                </a>
              </div>
            </div>

            <div className="mb-4 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--color-primary)', color: 'white' }}>
                  <Send />
                </div>
                <div>
                  <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Follow Us</h4>
                </div>
              </div>
              <div className="flex gap-3">
                <a href="https://facebook.com/linkcomms" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center text-white hover:opacity-80 transition-opacity">f</a>
                <a href="https://tiktok.com/@lcc_tech" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white hover:opacity-80 transition-opacity">t</a>
                <a href="https://instagram.com/lcc_tech_solutions" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 flex items-center justify-center text-white hover:opacity-80 transition-opacity">i</a>
                <a href="https://linkedin.com/company/linkcc" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#0A66C2] flex items-center justify-center text-white hover:opacity-80 transition-opacity">in</a>
              </div>
            </div>

            <div className="mt-4">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.7478!2d32.5734!3d0.3136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x177dbb0f4e3b5555%3A0x1234!2sLions+Shopping+Center%2C+Namirembe+Rd%2C+Kampala!5e0!3m2!1sen!2sug!4v1234567890"
                width="100%"
                height="220"
                style={{ border: 0, borderRadius: 12 }}
                allowFullScreen
                loading="lazy"
                title="Lions Shopping Center Map"
              />
            </div>
          </div>

          {/* Right card: Send Us a Message */}
          <div className="rounded-2xl p-6 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-primary)', color: 'white' }}>
                <Send />
              </div>
              <div>
                <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>Send Us a Message</h3>
                <p className="text-sm" style={{ color: 'var(--color-primary)' }}>We typically reply within a few hours</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold block mb-2" style={{ color: 'var(--text-muted)' }}>Your Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full rounded-xl px-4 py-3 outline-none border"
                    style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-2" style={{ color: 'var(--text-muted)' }}>Your Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full rounded-xl px-4 py-3 outline-none border"
                    style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold block mb-2" style={{ color: 'var(--text-muted)' }}>Your Message</label>
                <textarea
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  className="w-full rounded-xl px-4 py-3 outline-none border resize-none"
                  style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  placeholder="How can we help you?"
                  required
                />
              </div>

              {error && <div className="text-sm text-red-500">{error}</div>}
              {success && <div className="text-sm text-green-500">{success}</div>}

              <button type="submit" className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-white" style={{ background: 'var(--color-primary)' }} disabled={loading}>
                {loading ? <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" strokeDasharray="31.4" strokeLinecap="round" fill="none"/></svg> : <Send />}
                Send Message
              </button>

              <p className="text-sm mt-2 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}><Lock /> We respect your privacy. Your information will never be shared.</p>
            </form>
          </div>
        </div>

        {/* Connect With Us card */}
        <div className="mt-8 rounded-2xl p-6 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'var(--color-primary)', color: 'white' }}><Users /></div>
              <div>
                <h4 className="font-bold" style={{ color: 'var(--text-primary)' }}>Connect With Us</h4>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Follow our channels for updates and support.</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <a href="https://tiktok.com/@lcc_tech" target="_blank" rel="noopener noreferrer" className="text-center group">
                <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white mx-auto group-hover:opacity-80 transition-opacity">t</div>
                <div className="text-sm font-semibold text-[var(--color-primary)]">TikTok</div>
                <div className="text-sm text-[var(--text-muted)]">@lcc_tech</div>
              </a>
              <a href="https://facebook.com/linkcomms" target="_blank" rel="noopener noreferrer" className="text-center group">
                <div className="w-12 h-12 rounded-full bg-[#1877F2] flex items-center justify-center text-white mx-auto group-hover:opacity-80 transition-opacity">f</div>
                <div className="text-sm font-semibold text-[var(--color-primary)]">Facebook</div>
                <div className="text-sm text-[var(--text-muted)]">LCC Technology Solutions</div>
              </a>
              <a href="https://instagram.com/lcc_tech_solutions" target="_blank" rel="noopener noreferrer" className="text-center group">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 flex items-center justify-center text-white mx-auto group-hover:opacity-80 transition-opacity">i</div>
                <div className="text-sm font-semibold text-[var(--color-primary)]">Instagram</div>
                <div className="text-sm text-[var(--text-muted)]">@lcc_tech_solutions</div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
