'use client'
import { useEffect, useState } from 'react'
import Particles, { initParticlesEngine } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'

export default function ParticleCanvas() {
  const [init, setInit] = useState(false)

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine)
    }).then(() => setInit(true))
  }, [])

  if (!init) return null

  return (
    <Particles
      id="tsparticles-user"
      options={{
        fullScreen: { enable: false },
        particles: {
          number: { value: 60 },
          size: { value: { min: 1, max: 3 } },
          move: { enable: true, speed: 0.6 },
          links: { enable: true, distance: 120, color: '#1574B5' },
          color: { value: '#1574B5' }
        },
        detectRetina: true
      }}
      className="absolute inset-0 -z-10"
    />
  )
}

