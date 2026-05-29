'use client'
import { useTheme } from '@/lib/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={theme === 'dark'
        ? 'Switch to Light Mode'
        : 'Switch to Dark Mode'}
      className="relative flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 hover:opacity-80"
      style={{
        background: theme === 'dark'
          ? 'rgba(21,116,181,0.15)'
          : 'rgba(21,116,181,0.08)',
        borderColor: theme === 'dark'
          ? 'rgba(21,116,181,0.35)'
          : 'rgba(21,116,181,0.25)',
      }}
    >
      <span className="text-base">
        {theme === 'dark' ? '🌙' : '☀️'}
      </span>
      <span className="text-xs font-semibold hidden md:block"
            style={{ color: 'var(--accent)' }}>
        {theme === 'dark' ? 'Dark' : 'Light'}
      </span>
    </button>
  )
}
