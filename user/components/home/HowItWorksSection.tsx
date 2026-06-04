'use client'

import { motion } from 'framer-motion'
import { Box, Call, ShoppingCart, Truck } from 'iconsax-react'

const STEPS = [
  { title: 'Browse Products', Icon: ShoppingCart },
  { title: 'Place Order', Icon: Box },
  { title: 'We Deliver & Install', Icon: Truck },
  { title: 'Ongoing Support', Icon: Call },
] as const

const NODE_STAGGER = 0.2

export default function HowItWorksSection() {
  return (
    <section
      className="py-20 md:py-28 px-6 md:px-16"
      style={{ background: 'var(--bg-primary)' }}
    >
      <motion.h2
        className="text-3xl md:text-4xl font-extrabold text-center mb-14"
        style={{ color: 'var(--text-primary)' }}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45 }}
      >
        Simple Process
      </motion.h2>

      <div className="max-w-5xl mx-auto relative">
        <div
          className="hidden md:block absolute top-8 left-[12%] right-[12%] h-0.5 overflow-hidden rounded-full"
          style={{ background: 'var(--border-color)' }}
        >
          <motion.div
            className="h-full"
            style={{
              background: '#1574B5',
              transformOrigin: 'left',
              willChange: 'transform',
            }}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-4">
          {STEPS.map(({ title, Icon }, i) => (
            <div key={title} className="flex md:flex-col items-center md:text-center gap-4 md:gap-3">
              <motion.div
                className="relative z-10 shrink-0"
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 15,
                  delay: i * NODE_STAGGER,
                }}
                style={{ willChange: 'transform' }}
              >
                <motion.div
                  className="w-16 h-16 rounded-full flex items-center justify-center border-2"
                  style={{
                    borderColor: '#1574B5',
                    background: 'var(--bg-card)',
                    willChange: 'transform',
                  }}
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * NODE_STAGGER + 0.4,
                  }}
                >
                  <Icon size={28} color="#1574B5" variant="Bold" />
                </motion.div>
              </motion.div>

              <motion.p
                className="font-semibold text-base md:text-sm"
                style={{ color: 'var(--text-primary)' }}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * NODE_STAGGER, duration: 0.45, ease: 'easeOut' }}
              >
                <span className="md:hidden font-bold mr-2" style={{ color: '#1574B5' }}>
                  {i + 1}.
                </span>
                {title}
              </motion.p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
