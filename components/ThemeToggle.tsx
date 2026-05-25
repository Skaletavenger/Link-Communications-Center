'use client'
import { useTheme } from '../lib/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-7 rounded-full border transition-all duration-300 flex items-center px-1"
      style={{
        background: theme === 'dark' ? 'rgba(0,180,255,0.2)' : 'rgba(0,119,204,0.15)',
        borderColor: theme === 'dark' ? 'rgba(0,180,255,0.4)' : 'rgba(0,119,204,0.3)',
      }}
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <div
        className="w-5 h-5 rounded-full transition-all duration-300 flex items-center justify-center text-xs"
        style={{
          transform: theme === 'dark' ? 'translateX(0)' : 'translateX(28px)',
          background: theme === 'dark' ? '#00B4FF' : '#0077cc',
        }}
      >
        {theme === 'dark' ? '🌙' : '☀️'}
      </div>
    </button>
  )
}
