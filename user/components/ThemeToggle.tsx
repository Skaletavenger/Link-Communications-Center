'use client'
import { useTheme } from '@/lib/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="relative w-14 h-7 rounded-full border transition-all duration-300 flex items-center px-1"
      style={{
        background: theme === 'dark'
          ? 'rgba(21,116,181,0.2)'
          : 'rgba(21,116,181,0.1)',
        borderColor: theme === 'dark'
          ? 'rgba(21,116,181,0.4)'
          : 'rgba(21,116,181,0.3)',
      }}
      aria-label="Toggle theme"
    >
      <div
        className="w-5 h-5 rounded-full transition-all duration-300 flex items-center justify-center text-xs"
        style={{
          transform: theme === 'dark'
            ? 'translateX(0)'
            : 'translateX(28px)',
          background: '#1574B5',
        }}
      >
        {theme === 'dark' ? '🌙' : '☀️'}
      </div>
    </button>
  )
}

