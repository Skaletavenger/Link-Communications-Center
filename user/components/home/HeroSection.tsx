'use client'

import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { animate } from 'animejs'

const HEADLINE = ['Connect.', 'Secure.', 'Communicate.']

type Props = {
  productsHref: string
  authHref: string
  loggedIn: boolean
}

export default function HeroSection({ productsHref, authHref, loggedIn }: Props) {
  const sectionRef = useRef<HTMLElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })

  const gridY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '10%'])

  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return

    const onScroll = () => {
      const y = window.scrollY
      if (y > 80 && y < 220) {
        animate(grid, {
          opacity: [0.85, 1, 0.85],
          duration: 800,
          ease: 'inOutSine',
        })
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section
      ref={sectionRef}
      className="home-hero relative min-h-screen flex flex-col justify-center overflow-hidden"
      style={{
        background: `linear-gradient(165deg, var(--hero-from) 0%, var(--hero-to) 100%)`,
      }}
    >
      <motion.div
        ref={gridRef}
        className="home-hero-grid absolute inset-0 opacity-90 pointer-events-none"
        style={{ y: gridY, willChange: 'transform' }}
      />

      <motion.div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[min(90vw,640px)] h-[min(60vw,420px)] rounded-full blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(circle, var(--hero-blob) 0%, transparent 70%)',
          willChange: 'transform',
        }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="relative z-10 px-6 md:px-16 pt-28 pb-24 max-w-5xl"
        style={{ y: contentY, willChange: 'transform' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold mb-8 border"
          style={{
            color: 'var(--text-secondary)',
            borderColor: 'var(--hero-badge-border)',
            boxShadow: '0 0 24px rgba(21, 116, 181, 0.25)',
          }}
        >
          Uganda&apos;s Trusted Tech Partner
        </motion.div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-tight mb-6">
          {HEADLINE.map((word, i) => (
            <motion.span
              key={word}
              className="inline-block mr-3 md:mr-4"
              style={{ color: 'var(--text-primary)' }}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 * i, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              {word}
            </motion.span>
          ))}
        </h1>

        <motion.p
          className="text-lg md:text-xl max-w-2xl mb-10 leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.55 }}
        >
          Enterprise surveillance, access control, and communications — designed, installed, and
          supported across Uganda.
        </motion.p>

        <motion.div
          className="flex flex-wrap gap-4"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          style={{ willChange: 'transform' }}
        >
          <Link href={productsHref}>
            <span
              className="inline-block px-8 py-4 rounded-xl font-bold text-white text-lg cursor-pointer transition-all duration-200 hover:opacity-90 hover:scale-105 active:scale-95"
              style={{ background: '#1574B5' }}
            >
              Browse Products
            </span>
          </Link>
          <Link href={loggedIn ? '/products' : authHref}>
            <span
              className="inline-block px-8 py-4 rounded-xl font-bold text-lg cursor-pointer border-2 transition-all duration-200 hover:opacity-90 hover:scale-105 active:scale-95"
              style={{ borderColor: '#1574B5', color: '#1574B5', background: 'transparent' }}
            >
              {loggedIn ? 'Go to Products' : 'Sign In'}
            </span>
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        aria-hidden
      >
        <div
          className="w-7 h-11 rounded-full border-2 flex justify-center pt-2"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <motion.div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: '#1574B5' }}
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </section>
  )
}
