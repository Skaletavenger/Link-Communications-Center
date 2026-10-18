'use client'

import { createElement, type CSSProperties } from 'react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'

type Tag = 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div'

type Props = {
  text: string
  as?: Tag
  /** Split into individual characters (headlines) or whole words (body copy). */
  by?: 'char' | 'word'
  className?: string
  style?: CSSProperties
  /** Seconds before the first unit starts. */
  delay?: number
  /** Seconds between units. */
  stagger?: number
  /** Animate when scrolled into view (true) or immediately on mount (false). */
  inView?: boolean
  /** Word indexes (0-based) rendered in accentColor with a soft glow. */
  accentWords?: number[]
  accentColor?: string
  /** Soft blur-to-sharp focus pull on each unit. */
  blur?: boolean
}

const EASE = [0.22, 1, 0.36, 1] as const

export default function KineticText({
  text,
  as = 'span',
  by = 'char',
  className,
  style,
  delay = 0,
  stagger,
  inView = true,
  accentWords = [],
  accentColor = 'var(--color-accent)',
  blur = true,
}: Props) {
  const reduce = useReducedMotion()

  if (reduce) {
    return createElement(as, { className, style }, text)
  }

  const step = stagger ?? (by === 'char' ? 0.035 : 0.07)

  const unit: Variants = {
    hidden: {
      y: '115%',
      rotate: by === 'char' ? 7 : 3,
      opacity: 0,
      filter: blur ? 'blur(10px)' : 'blur(0px)',
    },
    show: (i: number) => ({
      y: '0%',
      rotate: 0,
      opacity: 1,
      filter: 'blur(0px)',
      transition: { delay: delay + i * step, duration: 0.8, ease: EASE },
    }),
  }

  const words = text.split(' ')
  let counter = 0

  const motionProps = inView
    ? { initial: 'hidden', whileInView: 'show', viewport: { once: true, margin: '-80px' } }
    : { initial: 'hidden', animate: 'show' }

  return createElement(
    as,
    { className, style, 'aria-label': text },
    <motion.span aria-hidden="true" className="inline" {...motionProps}>
      {words.map((word, wi) => {
        const accent = accentWords.includes(wi)
        const pieces = by === 'char' ? Array.from(word) : [word]
        return (
          <span
            key={`${word}-${wi}`}
            className="inline-block whitespace-nowrap align-bottom"
            style={{
              // clip the rising text like a title card, without cutting descenders
              overflow: 'hidden',
              paddingBottom: '0.14em',
              marginBottom: '-0.14em',
              marginRight: wi < words.length - 1 ? '0.26em' : 0,
            }}
          >
            {pieces.map((piece, pi) => {
              const idx = counter++
              return (
                <motion.span
                  key={pi}
                  custom={idx}
                  variants={unit}
                  className={`inline-block ${accent ? 'kinetic-glow' : ''}`}
                  style={{
                    willChange: 'transform, opacity',
                    transformOrigin: '0% 100%',
                    color: accent ? accentColor : undefined,
                  }}
                >
                  {piece}
                </motion.span>
              )
            })}
          </span>
        )
      })}
    </motion.span>,
  )
}
