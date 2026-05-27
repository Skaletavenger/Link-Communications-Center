'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const run = async () => {
      const { data } = await supabase.auth.getSession()
      const session = data.session
      if (!session?.user?.id) {
        router.replace('/auth/login')
        return
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('username_set')
        .eq('id', session.user.id)
        .maybeSingle()

      if (!profile || !profile.username_set) {
        router.replace('/auth/set-username')
        return
      }

      router.replace('/products')
    }

    run()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-white/80 animate-spin" />
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Finishing sign-in...
        </p>
      </div>
    </div>
  )
}

