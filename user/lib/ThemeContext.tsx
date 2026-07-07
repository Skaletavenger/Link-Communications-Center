'use client'
import { createContext, useContext } from 'react'

// Dark mode has been removed. The app now always renders in light mode.
// This context is kept as a lightweight no-op so existing imports of
// ThemeProvider/useTheme elsewhere in the app don't need to change.
const ThemeContext = createContext<{
  theme: 'light'
  toggleTheme: () => void
}>({ theme: 'light', toggleTheme: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContext.Provider value={{ theme: 'light', toggleTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
