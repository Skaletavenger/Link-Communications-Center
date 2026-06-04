'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const HEADING = 'Ready to get started?'
const HEADING_WORDS = HEADING.split(' ')

const PARTICLES = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  left: `${8 + i * 9}%`,
  size: 6 + (i % 4) * 4,
  duration: 3 + ((i * 1.31) % 3),
}))

const headingEndDelay = HEADING_WORDS.length * 0.1 + 0.35

export default function CTASection() {
  return (
    <section className="relative py-24 md:py-32 px-6 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #0d2244 0%, #1574B5 100%)',
        }}
      />
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white/10 pointer-events-none"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            bottom: '15%',
            willChange: 'transform',
          }}
          animate={{ y: [0, -30] }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
        />
      ))}

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 flex flex-wrap justify-center gap-x-2 gap-y-1">
          {HEADING_WORDS.map((word, i) => (
            <motion.span
              key={`${word}-${i}`}
              className="inline-block"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.45, ease: 'easeOut' }}
              style={{ willChange: 'transform' }}
            >
              {word}
            </motion.span>
          ))}
        </h2>

        <motion.p
          className="text-lg text-white/85 mb-10 leading-relaxed"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: headingEndDelay + 0.3, duration: 0.5, ease: 'easeOut' }}
        >
          Tell us about your site and goals — our team will recommend the right products and
          schedule installation at your convenience.
        </motion.p>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: headingEndDelay + 0.55, duration: 0.45, ease: 'easeOut' }}
        >
          <Link href="/contact">
            <motion.span
              className="inline-block px-10 py-4 rounded-xl font-bold text-lg cursor-pointer"
              style={{ background: '#F47821', color: '#fff' }}
              whileHover={{
                scale: 1.05,
                boxShadow: '0 8px 32px rgba(244, 120, 33, 0.45)',
              }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              Contact Us
            </motion.span>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
