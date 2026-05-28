'use client'

import { FormEvent, useState } from 'react'
import Navbar from '../../components/Navbar'
import { supabase } from '../../lib/supabase'

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

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 pt-24 pb-16">
        <h1 className="text-4xl font-black mb-4">Contact</h1>
        <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
          Reach out for quotations, installations, and support.
        </p>

        <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
          <div>
            <label className="text-sm font-semibold block mb-2" style={{ color: 'var(--text-secondary)' }}>
              Name
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-xl px-4 py-3 outline-none border"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="text-sm font-semibold block mb-2" style={{ color: 'var(--text-secondary)' }}>
              Email
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full rounded-xl px-4 py-3 outline-none border"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-sm font-semibold block mb-2" style={{ color: 'var(--text-secondary)' }}>
              Message
            </label>
            <textarea
              required
              rows={6}
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              className="w-full rounded-xl px-4 py-3 outline-none border resize-none"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              placeholder="How can we help?"
            />
          </div>

          {error && <p className="text-sm" style={{ color: '#ED2124' }}>{error}</p>}
          {success && <p className="text-sm" style={{ color: '#F47821' }}>{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: '#1574B5' }}
          >
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  )
}
