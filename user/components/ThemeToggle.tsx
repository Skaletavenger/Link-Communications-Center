'use client'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [dark, setDark] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('lcc_user_theme')
    const isDark = stored ? stored === 'dark' : true
    setDark(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  const toggle = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('lcc_user_theme', next ? 'dark' : 'light')
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="px-3 py-2 rounded-lg border text-sm font-semibold transition-all hover:bg-white/5"
      style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
      aria-label="Toggle theme"
    >
      {dark ? 'Dark' : 'Light'}
    </button>
  )
}

