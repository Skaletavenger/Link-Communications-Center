'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const DEFAULT_ABOUT =
  "Link Communications Center is Uganda's trusted provider of surveillance cameras, communications equipment, and smart phones. We offer quality products at affordable prices with expert installation and support services."

export default function AboutPage() {
  const [content, setContent] = useState(DEFAULT_ABOUT)
  const [loading, setLoading] = useState(true)

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

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-5xl mx-auto px-6 pt-24 pb-16">
        <h1 className="text-4xl font-black mb-4" style={{ color: 'var(--text-primary)' }}>About</h1>
        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
        ) : (
          <p className="text-lg leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
            {content}
          </p>
        )}
      </div>
    </div>
  )
}
