'use client'
import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

interface Props {
  images: string[]
  name: string
}

export default function ProductImageSlider({ images, name }: Props) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const allImages = images.filter(i => i && i.length > 0)
  const imagesKey = allImages.join('|')

  const next = useCallback(() => {
    setCurrent(c => c === allImages.length - 1 ? 0 : c + 1)
  }, [allImages.length])

  const prev = () => {
    setCurrent(c => c === 0 ? allImages.length - 1 : c - 1)
  }

  useEffect(() => {
    setCurrent(0)
  }, [name, imagesKey])

  useEffect(() => {
    if (allImages.length <= 1 || paused) return
    const interval = setInterval(next, 4000)
    return () => clearInterval(interval)
  }, [paused, next, allImages.length])

  if (allImages.length === 0) {
    return (
      <div className="w-full h-72 flex items-center justify-center rounded-2xl mb-6 border"
           style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none"
             stroke="#1574B5" strokeWidth="1" opacity="0.3">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
          <circle cx="12" cy="13" r="4"/>
        </svg>
      </div>
    )
  }

  if (allImages.length === 1) {
    return (
      <div className="relative w-full h-72 rounded-2xl overflow-hidden mb-6 border"
           style={{ borderColor: 'var(--border-color)' }}>
        <Image src={allImages[0]} alt={name} fill sizes="(max-width: 768px) 100vw, 600px"
             className="object-contain"
             style={{ background: 'var(--bg-card)' }}/>
      </div>
    )
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden mb-6 border"
         style={{ borderColor: 'var(--border-color)' }}
         onMouseEnter={() => setPaused(true)}
         onMouseLeave={() => setPaused(false)}>

      <div className="relative w-full h-72 overflow-hidden"
           style={{ background: 'var(--bg-card)' }}>
        {allImages.map((img, i) => (
          <div key={i}
               className="absolute inset-0 transition-all duration-500"
               style={{
                 opacity: i === current ? 1 : 0,
                 transform: i === current
                   ? 'translateX(0)'
                   : i < current
                   ? 'translateX(-100%)'
                   : 'translateX(100%)',
                 zIndex: i === current ? 1 : 0
               }}>
            <Image src={img} alt={`${name} view ${i + 1}`} fill sizes="(max-width: 768px) 100vw, 600px"
                 className="object-contain"/>
          </div>
        ))}

        <button type="button" onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full z-10 flex items-center justify-center text-white text-2xl bg-black/50 hover:bg-black/70 transition-all backdrop-blur-sm">
          ‹
        </button>

        <button type="button" onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full z-10 flex items-center justify-center text-white text-2xl bg-black/50 hover:bg-black/70 transition-all backdrop-blur-sm">
          ›
        </button>

        <div className="absolute top-3 right-3 z-10 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
          {current + 1} / {allImages.length}
        </div>

        {paused && allImages.length > 1 && (
          <div className="absolute bottom-3 left-3 z-10 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
            ⏸ Paused
          </div>
        )}
      </div>

      <div className="flex gap-2 p-3 overflow-x-auto"
           style={{ background: 'var(--bg-secondary)' }}>
        {allImages.map((img, i) => (
          <button key={i} type="button" onClick={() => setCurrent(i)}
                  className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all"
                  style={{
                    borderColor: i === current ? '#1574B5' : 'transparent',
                    opacity: i === current ? 1 : 0.6
                  }}>
            <Image src={img} alt={`thumb ${i + 1}`} fill sizes="64px"
                 className="object-cover"/>
          </button>
        ))}
      </div>

      <div className="flex justify-center gap-2 pb-3">
        {allImages.map((_, i) => (
          <button key={i} type="button" onClick={() => setCurrent(i)}
                  className="w-2 h-2 rounded-full transition-all"
                  style={{
                    background: i === current ? '#1574B5' : 'var(--border-color)',
                    transform: i === current ? 'scale(1.3)' : 'scale(1)'
                  }}/>
        ))}
      </div>
    </div>
  )
}
