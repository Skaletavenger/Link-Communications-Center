'use client'
import { useCallback } from 'react'
import { loadFull } from 'tsparticles'
import Particles from 'react-tsparticles'

export default function ParticleCanvas() {
  // react-tsparticles is currently typed against tsparticles-engine
  // while loadFull is typed against @tsparticles/engine; runtime is compatible.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const particlesInit = useCallback(async (engine: any) => {
    await loadFull(engine)
  }, [])

  return (
    <Particles
      id="tsparticles-user"
      init={particlesInit}
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

