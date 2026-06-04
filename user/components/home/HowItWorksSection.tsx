'use client'

import { useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { animate, stagger } from 'animejs'
import { Box, Call, ShoppingCart, Truck } from 'iconsax-react'

const STEPS = [
  { title: 'Browse Products', Icon: ShoppingCart },
  { title: 'Place Order', Icon: Box },
  { title: 'We Deliver & Install', Icon: Truck },
  { title: 'Ongoing Support', Icon: Call },
] as const

export default function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)
  const inView = useInView(sectionRef, { once: true, margin: '-80px' })

  useEffect(() => {
    if (!inView || !sectionRef.current) return

    const nodes = sectionRef.current.querySelectorAll('[data-step-node]')
    animate(nodes, {
      opacity: [0, 1],
      scale: [0.6, 1],
      delay: stagger(150, { start: 400 }),
      duration: 650,
      ease: 'outBack',
    })

    const labels = sectionRef.current.querySelectorAll('[data-step-label]')
    animate(labels, {
      opacity: [0, 1],
      translateY: [12, 0],
      delay: stagger(150, { start: 550 }),
      duration: 500,
      ease: 'outExpo',
    })
  }, [inView])

  return (
    <section
      ref={sectionRef}
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
        <div className="hidden md:block absolute top-8 left-[12%] right-[12%] h-0.5 overflow-hidden rounded-full" style={{ background: 'var(--border-color)' }}>
          <motion.div
            ref={lineRef}
            className="h-full origin-left"
            style={{ background: '#1574B5', willChange: 'transform' }}
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-4">
          {STEPS.map(({ title, Icon }, i) => (
            <div key={title} className="flex md:flex-col items-center md:text-center gap-4 md:gap-3">
              <div
                data-step-node
                className="opacity-0 relative z-10 w-16 h-16 rounded-full flex items-center justify-center border-2 shrink-0"
                style={{
                  borderColor: inView ? '#1574B5' : 'var(--border-color)',
                  background: 'var(--bg-card)',
                }}
              >
                <Icon size={28} color={inView ? '#1574B5' : 'var(--text-muted)'} variant="Bold" />
              </div>
              <p
                data-step-label
                className="opacity-0 font-semibold text-base md:text-sm"
                style={{ color: inView ? 'var(--text-primary)' : 'var(--text-muted)' }}
              >
                <span className="md:hidden font-bold mr-2" style={{ color: '#1574B5' }}>
                  {i + 1}.
                </span>
                {title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
