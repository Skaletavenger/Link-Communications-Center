'use client'

import { Fragment } from 'react'
import { motion } from 'framer-motion'
import { Box, Call, ShoppingCart, Truck } from 'iconsax-react'

const STEPS = [
  { title: 'Browse Products', Icon: ShoppingCart },
  { title: 'Place Order', Icon: Box },
  { title: 'We Deliver & Install', Icon: Truck },
  { title: 'Ongoing Support', Icon: Call },
] as const

const CIRCLE_DRAW = 0.55
const LINE_DRAW = 0.45
const STEP_BEAT = CIRCLE_DRAW + LINE_DRAW
const PULSE_START = (STEPS.length - 1) * STEP_BEAT + CIRCLE_DRAW + 0.2

const circleDelay = (i: number) => i * STEP_BEAT
const lineDelay = (i: number) => circleDelay(i) + CIRCLE_DRAW
const labelDelay = (i: number) => circleDelay(i) + CIRCLE_DRAW * 0.35

type StepIconProps = {
  Icon: (typeof STEPS)[number]['Icon']
  index: number
}

function StepCircle({ Icon, index }: StepIconProps) {
  return (
    <motion.div
      className="relative z-10 w-16 h-16 shrink-0"
      style={{ willChange: 'transform' }}
      animate={{ scale: [1, 1.08, 1] }}
      transition={{
        delay: PULSE_START + index * 0.15,
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: 'var(--bg-card)' }}
      />
      <svg
        className="absolute inset-0 w-full h-full -rotate-90"
        viewBox="0 0 64 64"
        aria-hidden
      >
        <motion.circle
          cx="32"
          cy="32"
          r="30"
          fill="none"
          stroke="#1574B5"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{
            delay: circleDelay(index),
            duration: CIRCLE_DRAW,
            ease: 'easeInOut',
          }}
        />
      </svg>
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.6 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{
          delay: circleDelay(index) + CIRCLE_DRAW * 0.45,
          duration: 0.3,
          ease: 'easeOut',
        }}
      >
        <Icon size={28} color="#1574B5" variant="Bold" />
      </motion.div>
    </motion.div>
  )
}

function StepLabel({ title, index }: { title: string; index: number }) {
  return (
    <motion.p
      className="font-semibold text-base md:text-sm md:text-center md:mt-3 flex-1 self-center"
      style={{ color: 'var(--text-primary)' }}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: labelDelay(index), duration: 0.4, ease: 'easeOut' }}
    >
      <span className="md:hidden font-bold mr-2" style={{ color: '#1574B5' }}>
        {index + 1}.
      </span>
      {title}
    </motion.p>
  )
}

function HorizontalConnector({ index }: { index: number }) {
  return (
    <div className="flex-1 min-w-4 flex items-center px-1 pt-8">
      <div
        className="h-0.5 w-full rounded-full overflow-hidden relative"
        style={{ background: 'var(--border-color)' }}
      >
        <motion.div
          className="absolute inset-0 h-full rounded-full"
          style={{
            background: '#1574B5',
            transformOrigin: 'left',
            willChange: 'transform',
          }}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{
            delay: lineDelay(index),
            duration: LINE_DRAW,
            ease: 'easeInOut',
          }}
        />
      </div>
    </div>
  )
}

function VerticalConnector({ index }: { index: number }) {
  return (
    <div className="ml-8 w-0.5 h-10 my-1 rounded-full overflow-hidden relative" style={{ background: 'var(--border-color)' }}>
      <motion.div
        className="absolute inset-0 w-full rounded-full"
        style={{
          background: '#1574B5',
          transformOrigin: 'top',
          willChange: 'transform',
        }}
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true }}
        transition={{
          delay: lineDelay(index),
          duration: LINE_DRAW,
          ease: 'easeInOut',
        }}
      />
    </div>
  )
}

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

      <div className="max-w-5xl mx-auto">
        {/* Desktop: circle → line → circle → … */}
        <div className="hidden md:flex items-start w-full">
          {STEPS.map(({ title, Icon }, i) => (
            <Fragment key={title}>
              <div className="flex flex-col items-center shrink-0 w-16">
                <StepCircle Icon={Icon} index={i} />
                <StepLabel title={title} index={i} />
              </div>
              {i < STEPS.length - 1 && <HorizontalConnector index={i} />}
            </Fragment>
          ))}
        </div>

        {/* Mobile: same sequence, vertical connectors */}
        <div className="flex md:hidden flex-col">
          {STEPS.map(({ title, Icon }, i) => (
            <Fragment key={title}>
              <div className="flex items-start gap-4">
                <StepCircle Icon={Icon} index={i} />
                <StepLabel title={title} index={i} />
              </div>
              {i < STEPS.length - 1 && <VerticalConnector index={i} />}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  )
}
