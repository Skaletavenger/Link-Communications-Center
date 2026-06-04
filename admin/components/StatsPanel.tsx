'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type StatsValue = {
  products: string
  support: string
  trusted: string
  experience: string
}

const EMPTY: StatsValue = {
  products: '',
  support: '',
  trusted: '',
  experience: '',
}

type Props = {
  onToast: (message: string) => void
}

const FIELDS: { key: keyof StatsValue; label: string; placeholder: string }[] = [
  { key: 'products', label: 'Products', placeholder: 'e.g. 500+' },
  { key: 'support', label: 'Support', placeholder: 'e.g. 24/7' },
  { key: 'trusted', label: 'Trusted', placeholder: 'e.g. 100%' },
  { key: 'experience', label: 'Experience', placeholder: 'e.g. 10 Years' },
]

function parseStats(content: string | null | undefined): StatsValue {
  if (!content) return { ...EMPTY }
  try {
    const parsed = JSON.parse(content) as Partial<StatsValue>
    return {
      products: parsed.products ?? '',
      support: parsed.support ?? '',
      trusted: parsed.trusted ?? '',
      experience: parsed.experience ?? '',
    }
  } catch {
    return { ...EMPTY }
  }
}

export default function StatsPanel({ onToast }: Props) {
  const [stats, setStats] = useState<StatsValue>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('site_content')
        .select('content')
        .eq('id', 'stats')
        .maybeSingle()

      setStats(parseStats(data?.content))
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const payload = {
      id: 'stats',
      content: JSON.stringify(stats),
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase.from('site_content').upsert(payload)
    setSaving(false)

    if (error) {
      onToast('Failed to save stats. Run supabase/setup.sql if site_content is missing.')
      return
    }
    onToast('Homepage stats saved successfully!')
  }

  return (
    <div
      className="rounded-2xl border p-6"
      style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--border-color)',
        boxShadow: 'var(--card-shadow)',
      }}
    >
      <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
        Homepage Stats
      </h3>
      <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
        Values shown in the stats bar on the public homepage. Use free text (e.g. 500+, 24/7).
      </p>

      {loading ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Loading...
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {FIELDS.map(({ key, label, placeholder }) => (
            <label key={key} className="block">
              <span className="text-sm font-semibold mb-1 block" style={{ color: 'var(--text-primary)' }}>
                {label}
              </span>
              <input
                type="text"
                value={stats[key]}
                onChange={(e) => setStats((s) => ({ ...s, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-[#1574B5]/40"
                style={{
                  background: 'var(--bg-primary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                }}
              />
            </label>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving || loading}
        className="px-6 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
        style={{ background: '#1574B5' }}
      >
        {saving ? 'Saving...' : 'Save Stats'}
      </button>
    </div>
  )
}
