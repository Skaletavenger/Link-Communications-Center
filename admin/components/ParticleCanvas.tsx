'use client';
import { useCallback } from 'react';
import { loadFull } from 'tsparticles';
import Particles from 'react-tsparticles';

export default function ParticleCanvas() {
  const particlesInit = useCallback(async (engine: any) => {
    await loadFull(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
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
  );
}
