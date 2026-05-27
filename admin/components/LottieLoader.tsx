'use client'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

interface LottieLoaderProps {
  src: string
  className?: string
}

export default function LottieLoader({ src, className }: LottieLoaderProps) {
  const [animationData, setAnimationData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch(src)
        const data = await res.json()
        if (mounted) setAnimationData(data)
      } catch (e) {
        console.warn('Failed to load lottie animation', src, e)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [src])

  if (loading || !animationData) return <div className={className} />
  return <Lottie animationData={animationData} className={className} loop autoplay />
}
