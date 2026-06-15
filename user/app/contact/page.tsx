'use client'

import { FormEvent, useState } from 'react'
import { Link, MapPin, Phone, MessageCircle } from 'lucide-react'
import Navbar from '../../components/Navbar'
import RadialOrbitalTimeline, {
  type TimelineItem,
} from '../../components/ui/radial-orbital-timeline'
import { supabase } from '../../lib/supabase'

const contactTimelineData: TimelineItem[] = [
  {
    id: 1,
    title: 'WhatsApp',
    date: '24/7',
    content:
      'Chat with our support team for fast quotes, installation updates, and service tracking.',
    category: 'Messaging',
    icon: Phone,
    relatedIds: [2, 4],
    status: 'completed',
    energy: 85,
    url: 'https://wa.me/256757837184',
  },
  {
    id: 2,
    title: 'Facebook',
    date: 'Open Now',
    content:
      'Visit our Facebook page for customer reviews, announcements, and direct messages.',
    category: 'Social',
    icon: Link,
    relatedIds: [1, 3],
    status: 'in-progress',
    energy: 75,
    url: 'https://www.facebook.com/linkcommunicationcentre',
  },
  {
    id: 3,
    title: 'TikTok',
    date: 'Trending',
    content:
      'Follow our TikTok for product demos, tech tips, and quick service highlights.',
    category: 'Social',
    icon: MessageCircle,
    relatedIds: [2, 4],
    status: 'pending',
    energy: 65,
    url: 'https://www.tiktok.com/@linkcommunicationscenter',
  },
  {
    id: 4,
    title: 'Location',
    date: 'Lions Mall',
    content:
      'Visit us at Lions Shopping Center on Namirembe Road for in-person consultations.',
    category: 'Visit',
    icon: MapPin,
    relatedIds: [1, 3],
    status: 'completed',
    energy: 90,
    url: 'https://www.google.com/maps/search/Lions+Shopping+Center+Namirembe+Road+Kampala',
  },
]

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
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 pt-24 pb-16">
        <h1 className="text-4xl font-black mb-4" style={{ color: 'var(--text-primary)' }}>Contact Us</h1>
        <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
          Reach out for quotations, installations, and support.
        </p>

        <div className="mb-10 rounded-[2rem] overflow-hidden border" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>
          <div className="p-4 sm:p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                Contact Timeline
              </h2>
              <p className="text-sm max-w-2xl mt-2" style={{ color: 'var(--text-secondary)' }}>
                Explore the best ways to connect with our team through an interactive timeline experience.
              </p>
            </div>
            <div className="h-[500px] rounded-[32px] overflow-hidden">
              <RadialOrbitalTimeline timelineData={contactTimelineData} />
            </div>
          </div>
        </div>

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
