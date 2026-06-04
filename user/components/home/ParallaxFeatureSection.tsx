'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Setting2, ShieldTick, TickCircle } from 'iconsax-react'

const FEATURES = [
  { Icon: TickCircle, text: 'Certified technicians for on-site installation' },
  { Icon: Setting2, text: 'Remote monitoring setup and configuration' },
  { Icon: ShieldTick, text: 'After-sales warranty and ongoing support' },
] as const

export default function ParallaxFeatureSection() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const visualY = useTransform(scrollYProgress, [0, 1], ['8%', '-8%'])

  return (
    <section
      ref={ref}
      className="py-20 md:py-28 px-6 md:px-16 overflow-hidden"
      style={{ background: 'var(--bg-secondary)' }}
    >
      <motion.div
        className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center"
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
      >
        <motion.div className="flex justify-center" style={{ y: visualY, willChange: 'transform' }}>
          <div className="relative w-72 h-72 md:w-80 md:h-80">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="absolute inset-0 flex items-center justify-center"
                animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                transition={{
                  duration: 28 + i * 6,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                style={{ willChange: 'transform' }}
              >
                <svg
                  viewBox="0 0 200 200"
                  className="w-full h-full"
                  aria-hidden
                >
                  <circle
                    cx="100"
                    cy="100"
                    r={72 - i * 14}
                    fill="none"
                    stroke="#1574B5"
                    strokeWidth="1.5"
                    strokeOpacity={0.25 + i * 0.12}
                    strokeDasharray="8 12"
                  />
                </svg>
              </motion.div>
            ))}
            <div
              className="absolute inset-0 flex items-center justify-center rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(21,116,181,0.15) 0%, transparent 70%)',
              }}
            >
              <ShieldTick size={56} color="#1574B5" variant="Bold" />
            </div>
          </div>
        </motion.div>

        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4" style={{ color: 'var(--text-primary)' }}>
            Expert Installation &amp; Support
          </h2>
          <p className="text-base md:text-lg leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
            From site survey to handover, our team delivers professional installation, configures
            remote monitoring, and backs every project with dependable after-sales warranty.
          </p>
          <ul className="space-y-4">
            {FEATURES.map(({ Icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <Icon size={24} color="#1574B5" variant="Bold" className="shrink-0 mt-0.5" />
                <span style={{ color: 'var(--text-secondary)' }}>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </section>
  )
}
