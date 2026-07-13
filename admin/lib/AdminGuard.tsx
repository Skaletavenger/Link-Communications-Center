'use client'
import { ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from './supabase'

// Client-side gate for admin pages. Real enforcement lives in Supabase RLS
// (see supabase/admin_auth.sql) - this component just keeps unauthenticated
// visitors out of the UI and redirects them to the login page.
export default function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return
      if (!session) {
        router.replace('/dashboard/login')
      } else {
        setReady(true)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace('/dashboard/login')
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [router])

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm" style={{ opacity: 0.7 }}>Checking access&hellip;</p>
      </div>
    )
  }

  return <>{children}</>
}
