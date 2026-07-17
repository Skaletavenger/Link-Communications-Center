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
                <a href="tel:+256757837184" className="flex-1 inline-flex items-center gap-2 justify-center px-3 py-2 rounded-xl text-white" style={{ background: 'var(--color-primary)' }}>
                  <Phone /> Call Us
                </a>
                <a href="mailto:linkcomm72@gmail.com" className="flex-1 inline-flex items-center gap-2 justify-center px-3 py-2 rounded-xl text-white" style={{ background: 'var(--color-secondary)' }}>
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
                <a href="https://www.facebook.com/Linkcomm2014/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center text-white hover:opacity-80 transition-opacity"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.9 3.78-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.9h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94z" /></svg></a>
                <a href="https://www.instagram.com/the_link_communications/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:opacity-80 transition-opacity" style={{ background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fd5949 45%, #d6249f 60%, #285AEB 90%)' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 1.62c-3.15 0-3.52.01-4.76.07-.9.04-1.39.19-1.71.32-.43.17-.74.37-1.06.69-.32.32-.52.63-.69 1.06-.13.32-.28.81-.32 1.71-.06 1.24-.07 1.61-.07 4.76s.01 3.52.07 4.76c.04.9.19 1.39.32 1.71.17.43.37.74.69 1.06.32.32.63.52 1.06.69.32.13.81.28 1.71.32 1.24.06 1.61.07 4.76.07s3.52-.01 4.76-.07c.9-.04 1.39-.19 1.71-.32.43-.17.74-.37 1.06-.69.32-.32.52-.63.69-1.06.13-.32.28-.81.32-1.71.06-1.24.07-1.61.07-4.76s-.01-3.52-.07-4.76c-.04-.9-.19-1.39-.32-1.71a2.86 2.86 0 0 0-.69-1.06 2.86 2.86 0 0 0-1.06-.69c-.32-.13-.81-.28-1.71-.32-1.24-.06-1.61-.07-4.76-.07zm0 2.76a5.3 5.3 0 1 1 0 10.6 5.3 5.3 0 0 1 0-10.6zm0 8.74a3.44 3.44 0 1 0 0-6.88 3.44 3.44 0 0 0 0 6.88zm6.75-8.93a1.24 1.24 0 1 1-2.48 0 1.24 1.24 0 0 1 2.48 0z" /></svg></a>
                <a href="https://www.tiktok.com/@linkcommunicationcentre" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="w-10 h-10 rounded-full bg-[#010101] flex items-center justify-center text-white hover:opacity-80 transition-opacity"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg></a>
                <a href="https://wa.me/256757837184" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white hover:opacity-80 transition-opacity"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.47 14.38c-.29-.15-1.72-.85-1.98-.94-.27-.1-.46-.15-.65.15-.19.29-.75.94-.92 1.13-.17.19-.34.22-.63.07-.29-.15-1.23-.45-2.34-1.44-.87-.77-1.45-1.72-1.62-2.01-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.19-.29.29-.48.1-.19.05-.36-.02-.51-.07-.15-.65-1.58-.9-2.16-.24-.57-.48-.49-.65-.5l-.56-.01c-.19 0-.51.07-.77.36-.27.29-1.01.99-1.01 2.42s1.04 2.8 1.18 2.99c.15.19 2.05 3.13 4.97 4.39.69.3 1.24.48 1.66.61.7.22 1.33.19 1.83.12.56-.08 1.72-.7 1.96-1.38.24-.68.24-1.26.17-1.38-.07-.12-.26-.19-.55-.34zM12.05 21.5h-.01a9.5 9.5 0 0 1-4.84-1.33l-.35-.2-3.6.94.96-3.51-.23-.36a9.46 9.46 0 0 1-1.45-5.05c0-5.24 4.27-9.5 9.52-9.5 2.54 0 4.93.99 6.72 2.79a9.42 9.42 0 0 1 2.78 6.72c0 5.24-4.27 9.5-9.5 9.5zM20.52 3.49A11.44 11.44 0 0 0 12.05 0C5.7 0 .53 5.16.53 11.5c0 2.02.53 4 1.54 5.74L.43 24l6.9-1.81a11.5 11.5 0 0 0 5.72 1.46h.01c6.34 0 11.5-5.16 11.51-11.5a11.42 11.42 0 0 0-3.35-8.15z" /></svg></a>
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
              <a href="https://www.facebook.com/Linkcomm2014/" target="_blank" rel="noopener noreferrer" className="text-center group">
                <div className="w-12 h-12 rounded-full bg-[#1877F2] flex items-center justify-center text-white mx-auto group-hover:opacity-80 transition-opacity"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.9 3.78-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.9h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94z" /></svg></div>
                <div className="text-sm font-semibold text-[var(--color-primary)]">Facebook</div>
                <div className="text-sm text-[var(--text-muted)]">Link Communications Centre</div>
              </a>
              <a href="https://www.instagram.com/the_link_communications/" target="_blank" rel="noopener noreferrer" className="text-center group">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white mx-auto group-hover:opacity-80 transition-opacity" style={{ background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fd5949 45%, #d6249f 60%, #285AEB 90%)' }}><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 1.62c-3.15 0-3.52.01-4.76.07-.9.04-1.39.19-1.71.32-.43.17-.74.37-1.06.69-.32.32-.52.63-.69 1.06-.13.32-.28.81-.32 1.71-.06 1.24-.07 1.61-.07 4.76s.01 3.52.07 4.76c.04.9.19 1.39.32 1.71.17.43.37.74.69 1.06.32.32.63.52 1.06.69.32.13.81.28 1.71.32 1.24.06 1.61.07 4.76.07s3.52-.01 4.76-.07c.9-.04 1.39-.19 1.71-.32.43-.17.74-.37 1.06-.69.32-.32.52-.63.69-1.06.13-.32.28-.81.32-1.71.06-1.24.07-1.61.07-4.76s-.01-3.52-.07-4.76c-.04-.9-.19-1.39-.32-1.71a2.86 2.86 0 0 0-.69-1.06 2.86 2.86 0 0 0-1.06-.69c-.32-.13-.81-.28-1.71-.32-1.24-.06-1.61-.07-4.76-.07zm0 2.76a5.3 5.3 0 1 1 0 10.6 5.3 5.3 0 0 1 0-10.6zm0 8.74a3.44 3.44 0 1 0 0-6.88 3.44 3.44 0 0 0 0 6.88zm6.75-8.93a1.24 1.24 0 1 1-2.48 0 1.24 1.24 0 0 1 2.48 0z" /></svg></div>
                <div className="text-sm font-semibold text-[var(--color-primary)]">Instagram</div>
                <div className="text-sm text-[var(--text-muted)]">@the_link_communications</div>
              </a>
              <a href="https://www.tiktok.com/@linkcommunicationcentre" target="_blank" rel="noopener noreferrer" className="text-center group">
                <div className="w-12 h-12 rounded-full bg-[#010101] flex items-center justify-center text-white mx-auto group-hover:opacity-80 transition-opacity"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg></div>
                <div className="text-sm font-semibold text-[var(--color-primary)]">TikTok</div>
                <div className="text-sm text-[var(--text-muted)]">@linkcommunicationcentre</div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
