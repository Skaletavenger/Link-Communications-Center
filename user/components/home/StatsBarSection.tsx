'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { animate, stagger } from 'animejs'
import { parseStatValue, runStatAnimation } from './animateStat'

type StatsData = {
  products: string
  support: string
  trusted: string
  experience: string
}

const PLACEHOLDER: StatsData = {
  products: '—',
  support: '—',
  trusted: '—',
  experience: '—',
}

const LABELS: { key: keyof StatsData; label: string }[] = [
  { key: 'products', label: 'Products' },
  { key: 'support', label: 'Support' },
  { key: 'trusted', label: 'Trusted' },
  { key: 'experience', label: 'Experience' },
]

function StatItem({ label, value }: { label: string; value: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [display, setDisplay] = useState(value)
  const animated = useRef(false)

  useEffect(() => {
    setDisplay(value)
    animated.current = false
  }, [value])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || animated.current) return
        animated.current = true
        runStatAnimation(parseStatValue(value), setDisplay)
      },
      { threshold: 0.35 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [value])

  return (
    <div ref={ref} className="text-center px-4 py-6">
      <p className="text-3xl md:text-4xl font-extrabold mb-1" style={{ color: '#1574B5' }}>
        {display}
      </p>
      <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
        {label}
      </p>
    </div>
  )
}

export default function StatsBarSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [stats, setStats] = useState<StatsData>(PLACEHOLDER)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('site_content')
        .select('content')
        .eq('id', 'stats')
        .maybeSingle()

      if (!data?.content) return

      try {
        const parsed = JSON.parse(data.content) as Partial<StatsData>
        setStats({
          products: parsed.products?.trim() || '—',
          support: parsed.support?.trim() || '—',
          trusted: parsed.trusted?.trim() || '—',
          experience: parsed.experience?.trim() || '—',
        })
      } catch {
        /* keep placeholders */
      }
    }
    load()
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        const cells = section.querySelectorAll('[data-stat-cell]')
        animate(cells, {
          opacity: [0, 1],
          translateY: [16, 0],
          delay: stagger(120),
          duration: 700,
          ease: 'outExpo',
        })
      },
      { threshold: 0.2 }
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="home-stats-bar border-y" style={{ borderColor: 'var(--border-color)' }}>
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0" style={{ borderColor: 'var(--border-color)' }}>
        {LABELS.map(({ key, label }) => (
          <motion.div
            key={key}
            data-stat-cell
            className="opacity-0"
            style={{ willChange: 'transform' }}
          >
            <StatItem label={label} value={stats[key]} />
          </motion.div>
        ))}
      </div>
    </section>
  )
}
