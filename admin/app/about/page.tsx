'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const DEFAULT_ABOUT =
  "Link Communications Center is Uganda's trusted provider of surveillance cameras, communications equipment, and smart phones. We offer quality products at affordable prices with expert installation and support services."

export default function AboutPage() {
  const [content, setContent] = useState(DEFAULT_ABOUT)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const fetchAbout = async () => {
      const { data } = await supabase
        .from('site_content')
        .select('content')
        .eq('id', 'about')
        .maybeSingle()

      if (data?.content) {
        setContent(data.content)
      }
      setLoading(false)
    }
    fetchAbout()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSuccess('')

    const { error } = await supabase
      .from('site_content')
      .upsert({
        id: 'about',
        content,
        updated_at: new Date().toISOString()
      })

    if (error) {
      setSuccess('')
      alert('Failed to save. Run supabase/setup.sql if the site_content table is missing.')
    } else {
      setSuccess('About page saved successfully!')
    }
    setSaving(false)
  }

  return (
    <section className="container mx-auto px-6 py-12 max-w-3xl">
      <h1 className="text-4xl font-bold mb-2 text-primary">Edit About Page</h1>
      <p className="text-muted mb-6 text-sm">
        Changes here appear on the public user site automatically.
      </p>

      {loading ? (
        <p className="text-muted">Loading...</p>
      ) : (
        <>
          <textarea
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-4 rounded-xl bg-card border border-theme text-primary resize-none focus:outline-none focus:border-[#1574B5]"
          />
          {success && (
            <p className="mt-3 text-sm font-semibold" style={{ color: '#1574B5' }}>
              {success}
            </p>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="mt-4 px-8 py-3 bg-accent text-black font-bold rounded-xl hover:bg-[#1a86cc] transition-all disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save About Content'}
          </button>
        </>
      )}
    </section>
  )
}
