'use client'

import { useRef } from 'react'
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'framer-motion'

const wrap = (min: number, max: number, v: number) => {
  const range = max - min
  return ((((v - min) % range) + range) % range) + min
}

type RowProps = {
  words: string[]
  baseVelocity: number
  outline?: boolean
}

function MarqueeRow({ words, baseVelocity, outline = false }: RowProps) {
  const reduce = useReducedMotion()
  const baseX = useMotionValue(0)
  const { scrollY } = useScroll()
  const scrollVelocity = useVelocity(scrollY)
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 })
  // scrolling faster shoves the type along (and flips it when you scroll back up)
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], { clamp: false })
  // four identical copies -> wrapping by one copy (25%) is seamless
  const x = useTransform(baseX, (v) => `${wrap(-25, 0, v)}%`)
  const direction = useRef(1)

  useAnimationFrame((_, delta) => {
    if (reduce) return
    let moveBy = direction.current * baseVelocity * (delta / 1000)
    const vf = velocityFactor.get()
    if (vf < 0) direction.current = -1
    else if (vf > 0) direction.current = 1
    moveBy += direction.current * moveBy * vf
    baseX.set(baseX.get() + moveBy)
  })

  const sequence = (
    <span className="flex shrink-0 items-center">
      {words.map((w) => (
        <span key={w} className="flex items-center">
          <span
            className="px-6 md:px-10 text-5xl md:text-8xl font-extrabold uppercase tracking-tight leading-none"
            style={
              outline
                ? { color: 'transparent', WebkitTextStroke: '1.5px var(--color-primary)' }
                : { color: 'var(--text-primary)' }
            }
          >
            {w}
          </span>
          <span className="text-2xl md:text-4xl" style={{ color: 'var(--color-accent)' }}>
            ◆
          </span>
        </span>
      ))}
    </span>
  )

  return (
    <div className="overflow-hidden whitespace-nowrap">
      <motion.div className="flex w-max flex-nowrap" style={{ x, willChange: 'transform' }}>
        {sequence}
        {sequence}
        {sequence}
        {sequence}
      </motion.div>
    </div>
  )
}

const WORDS = ['Surveillance', 'Access Control', 'Networking', 'Communications']

export default function KineticMarquee() {
  return (
    <section
      aria-hidden="true"
      className="relative overflow-hidden py-8 md:py-12 space-y-3 md:space-y-5 border-y"
      style={{ borderColor: 'var(--border)' }}
    >
      <MarqueeRow words={WORDS} baseVelocity={-2.2} />
      <MarqueeRow words={[...WORDS].reverse()} baseVelocity={2.2} outline />
    </section>
  )
}
