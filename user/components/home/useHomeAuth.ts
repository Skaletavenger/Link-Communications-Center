'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useHomeAuth() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    let mounted = true

    const sync = async () => {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      setLoggedIn(Boolean(data.session))
      setAuthReady(true)
    }

    sync()
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      sync()
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const authHref = '/auth/login'
  const productsHref = loggedIn ? '/products' : authHref

  return { loggedIn, authReady, authHref, productsHref }
}
