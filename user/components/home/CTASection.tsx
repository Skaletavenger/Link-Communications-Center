'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const PARTICLES = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  left: `${8 + i * 9}%`,
  size: 6 + (i % 4) * 4,
  delay: i * 0.4,
}))

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
          animate={{
            y: [0, -40 - p.id * 6, 0],
            x: [0, p.id % 2 === 0 ? 12 : -12, 0],
            opacity: [0.2, 0.55, 0.2],
          }}
          transition={{
            duration: 7 + p.id * 0.5,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      <motion.div
        className="relative z-10 max-w-3xl mx-auto text-center"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55 }}
      >
        <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
          Ready to get started?
        </h2>
        <p className="text-lg text-white/85 mb-10 leading-relaxed">
          Tell us about your site and goals — our team will recommend the right products and
          schedule installation at your convenience.
        </p>
        <Link href="/contact">
          <span
            className="inline-block px-10 py-4 rounded-xl font-bold text-lg cursor-pointer transition-all hover:scale-105 active:scale-95"
            style={{ background: '#F47821', color: '#fff' }}
          >
            Contact Us
          </span>
        </Link>
      </motion.div>
    </section>
  )
}
