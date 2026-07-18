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
    gradient: 'linear-gradient(135deg, #1574B5 0%, #0d4d7a 100%)',
    glow: 'rgba(21,116,181,0.45)',
  },
  {
    name: 'Access Control',
    description: 'Secure entry with smart credentials',
    Icon: Lock,
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)',
    glow: 'rgba(124,58,237,0.45)',
  },
  {
    name: 'Networking',
    description: 'Reliable infrastructure for your site',
    Icon: Wifi,
    gradient: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
    glow: 'rgba(8,145,178,0.45)',
  },
  {
    name: 'Intercoms',
    description: 'Clear communication at every door',
    Icon: CallCalling,
    gradient: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
    glow: 'rgba(22,163,74,0.45)',
  },
  {
    name: 'Alarms',
    description: 'Instant alerts when it matters',
    Icon: Alarm,
    gradient: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
    glow: 'rgba(234,88,12,0.45)',
  },
  {
    name: 'Phones',
    description: 'Business handsets and VoIP ready',
    Icon: Mobile,
    gradient: 'linear-gradient(135deg, #db2777 0%, #9d174d 100%)',
    glow: 'rgba(219,39,119,0.45)',
  },
] as const

type Props = {
  productsHref: string
}

export default function CategoriesSection({ productsHref: _productsHref }: Props) {
  const router = useRouter()

  return (
    <section className="py-20 md:py-28 px-6 md:px-16" style={{ background: 'var(--bg-primary)' }}>
      <div className="text-center mb-14">
        <motion.h2
          className="text-3xl md:text-4xl font-extrabold"
          style={{ color: 'var(--text-primary)' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          What We Offer
        </motion.h2>
        <p className="mt-3 text-sm md:text-base" style={{ color: 'var(--text-muted)' }}>
          Tap a category to jump straight to those products.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-10">
        {CATEGORIES.map(({ name, description, Icon, gradient, glow }, i) => (
          <motion.button
            key={name}
            type="button"
            onClick={() => router.push(`/?category=${encodeURIComponent(name)}#products`)}
            className="group flex flex-col items-center text-center cursor-pointer"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ delay: i * 0.08, duration: 0.45 }}
          >
            <motion.div
              className="w-28 h-28 md:w-36 md:h-36 rounded-full flex items-center justify-center mb-4 transition-shadow"
              style={{ background: gradient, boxShadow: `0 10px 30px -8px ${glow}` }}
              whileHover={{ scale: 1.07, boxShadow: `0 18px 42px -6px ${glow}` }}
              transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            >
              <Icon size={46} color="#ffffff" variant="Bold" />
            </motion.div>
            <h3 className="font-bold text-sm md:text-base leading-tight" style={{ color: 'var(--text-primary)' }}>
              {name}
            </h3>
            <p className="mt-1 text-xs leading-snug px-1 hidden md:block" style={{ color: 'var(--text-muted)' }}>
              {description}
            </p>
          </motion.button>
        ))}
      </div>
    </section>
  )
}
