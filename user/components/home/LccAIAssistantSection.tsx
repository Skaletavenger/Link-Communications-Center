'use client'

import dynamic from 'next/dynamic'
import { AnimatePresence, motion } from 'framer-motion'
import { FormEvent, PointerEvent, useMemo, useState } from 'react'

const Spline = dynamic(() => import('@splinetool/react-spline'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <span className="text-white/50 text-sm">Loading...</span>
    </div>
  ),
})

const SPLINE_URL = 'https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode'

export default function LccAIAssistantSection() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50 })
  const [message, setMessage] = useState('')
  const [reply, setReply] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const sectionClassName = useMemo(
    () =>
      isExpanded
        ? 'fixed bottom-6 right-6 z-50 h-[180px] w-[180px] rounded-[32px] border border-blue-500 shadow-2xl overflow-hidden'
        : 'relative overflow-hidden rounded-[32px] border border-blue-500/10 shadow-[0_30px_80px_rgba(0,0,0,0.25)]',
    [isExpanded]
  )

  const spotlightStyle = useMemo(
    () => ({
      background: `radial-gradient(circle at ${spotlight.x}% ${spotlight.y}%, var(--assistant-spotlight) 0%, transparent 32%)`,
    }),
    [spotlight]
  )

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100
    setSpotlight({ x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) })
  }

  const handleSend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = message.trim()
    if (!trimmed) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Unable to contact AI assistant')
      }

      setReply(data.reply || 'Sorry, I could not get a response from Link right now.')
      setMessage('')
    } catch (err: unknown) {
      const messageText = err instanceof Error ? err.message : 'Request failed'
      setError(messageText)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.section
      layout
      onPointerMove={handlePointerMove}
      className={sectionClassName}
      style={{ background: 'rgba(0,0,0,0.96)', minHeight: isExpanded ? undefined : 'auto' }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
      <div className="absolute inset-0 pointer-events-none" style={spotlightStyle} />
      <div className="relative z-10 h-full px-6 py-8 lg:px-10 lg:py-10">
        <div className="grid h-full gap-6 lg:grid-cols-[1.2fr_1fr]">
          {!isExpanded ? (
            <div className="flex flex-col justify-center gap-6 text-white">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-blue-300/90">LCC AI Assistant</p>
                <h2 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
                  Meet Link
                </h2>
              </div>
              <p className="max-w-xl text-base leading-7 text-slate-200/90 sm:text-lg">
                Your AI Shopping Companion — powered by Link Communications Center.
              </p>
            </div>
          ) : null}

          <motion.div
            layout
            className={`group relative flex aspect-[1.1] min-h-[320px] w-full items-center justify-center rounded-[32px] bg-gradient-to-br from-slate-950/90 to-slate-900/80 ${
              isExpanded ? 'cursor-pointer' : 'cursor-pointer'
            }`}
            onClick={() => setIsExpanded((prev) => !prev)}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            <div className="absolute inset-0 rounded-[32px] ring-1 ring-blue-500/20" />
            <div className="relative h-full w-full overflow-hidden rounded-[32px]">
              <Spline scene={SPLINE_URL} />
            </div>

            <AnimatePresence>
              {isExpanded ? (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  onClick={(event) => {
                    event.stopPropagation()
                    setIsExpanded(false)
                  }}
                  className="absolute top-3 right-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-950/90 text-white transition hover:bg-blue-500"
                >
                  ×
                </motion.button>
              ) : null}
            </AnimatePresence>
          </motion.div>
        </div>

        <AnimatePresence>
          {isExpanded ? (
            <motion.div
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="absolute right-0 top-[-220px] w-[min(360px,calc(100vw-2rem)))]"
            >
              <div
                className="relative rounded-3xl border px-4 py-4 shadow-2xl"
                style={{
                  background: 'var(--bg-secondary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                }}
              >
                <div className="text-sm leading-6">
                  Hi! My name is Link, your shopping companion 👋 How may I help you today?
                </div>
                <div className="mt-4 max-h-[4.5rem] overflow-y-auto rounded-3xl border border-slate-200/20 bg-slate-50/90 p-3 text-sm leading-6 text-slate-950 shadow-inner dark:border-slate-700/60 dark:bg-slate-900/95 dark:text-white">
                  {reply ? reply : 'Ask me about cameras, access control, or communication systems.'}
                </div>

                <form onSubmit={handleSend} className="mt-4 flex gap-2">
                  <input
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    className="flex-1 rounded-2xl border border-slate-300/70 bg-white/95 px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700/80 dark:bg-slate-950 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-500/30"
                    placeholder="Type a question..."
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-2xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition enabled:hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Send
                  </button>
                </form>

                {error ? (
                  <p className="mt-3 text-xs text-rose-400">{error}</p>
                ) : null}
              </div>
              <div
                className="absolute left-1/2 top-full h-4 w-4 -translate-x-1/2 rotate-45"
                style={{
                  background: 'var(--bg-secondary)',
                  borderLeft: '1px solid var(--border-color)',
                  borderTop: '1px solid var(--border-color)',
                }}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.section>
  )
}
