'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Alarm,
  CallCalling,
  Camera,
  Lock,
  Mobile,
  Wifi,
} from 'iconsax-react'

const CATEGORIES = [
  {
    name: 'Surveillance Cameras',
    description: 'HD & IP cameras for every environment',
    Icon: Camera,
  },
  {
    name: 'Access Control',
    description: 'Secure entry with smart credentials',
    Icon: Lock,
  },
  {
    name: 'Networking',
    description: 'Reliable infrastructure for your site',
    Icon: Wifi,
  },
  {
    name: 'Intercoms',
    description: 'Clear communication at every door',
    Icon: CallCalling,
  },
  {
    name: 'Alarms',
    description: 'Instant alerts when it matters',
    Icon: Alarm,
  },
  {
    name: 'Phones',
    description: 'Business handsets and VoIP ready',
    Icon: Mobile,
  },
] as const

type Props = {
  productsHref: string
}

export default function CategoriesSection({ productsHref }: Props) {
  const router = useRouter()

  return (
    <section className="py-20 md:py-28 px-6 md:px-16" style={{ background: 'var(--bg-primary)' }}>
      <motion.h2
        className="text-3xl md:text-4xl font-extrabold text-center mb-12"
        style={{ color: 'var(--text-primary)' }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
      >
        What We Offer
      </motion.h2>

      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-5">
        {CATEGORIES.map(({ name, description, Icon }, i) => (
          <motion.button
            key={name}
            type="button"
            onClick={() => router.push(productsHref)}
            className="text-left rounded-2xl border p-5 transition-shadow cursor-pointer"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              boxShadow: 'var(--card-shadow)',
              willChange: 'transform',
            }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ delay: i * 0.1, duration: 0.45 }}
            whileHover={{
              scale: 1.04,
              borderColor: '#1574B5',
              boxShadow: '0 0 28px rgba(21, 116, 181, 0.25)',
            }}
          >
            <Icon size={32} color="#1574B5" variant="Bold" className="mb-3" />
            <h3 className="font-bold text-sm md:text-base mb-1" style={{ color: 'var(--text-primary)' }}>
              {name}
            </h3>
            <p className="text-xs leading-snug" style={{ color: 'var(--text-muted)' }}>
              {description}
            </p>
          </motion.button>
        ))}
      </div>
    </section>
  )
}
