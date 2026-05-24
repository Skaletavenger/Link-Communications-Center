'use client'
import { AnimatePresence, motion } from 'framer-motion'
import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react'

type ToastType = 'success' | 'error'

type ToastMessage = {
  id: string
  type: ToastType
  text: string
}

type ToastContextValue = {
  toast: {
    success: (text: string) => void
    error: (text: string) => void
  }
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([])

  const remove = useCallback((id: string) => {
    setMessages((current) => current.filter((message) => message.id !== id))
  }, [])

  const push = useCallback((type: ToastType, text: string) => {
    const id = createId()
    setMessages((current) => [...current, { id, type, text }])
    window.setTimeout(() => remove(id), 3000)
  }, [remove])

  const value = useMemo(
    () => ({
      toast: {
        success: (text: string) => push('success', text),
        error: (text: string) => push('error', text)
      }
    }),
    [push]
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-50 flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: -16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className={`max-w-sm rounded-2xl border p-4 shadow-2xl backdrop-blur-xl ${
                message.type === 'success'
                  ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100'
                  : 'border-rose-400/30 bg-rose-500/10 text-rose-100'
              }`}
            >
              <p className="text-sm font-semibold">{message.type === 'success' ? 'Success' : 'Error'}</p>
              <p className="mt-1 text-sm leading-6">{message.text}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context.toast
}
