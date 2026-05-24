'use client';
import ParticleCanvas from './ParticleCanvas';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useRef } from 'react';
import dynamic from 'next/dynamic';

const LottieLoader = dynamic(() => import('./LottieLoader'), { ssr: false });

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, 40]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 20]);
  const words = ['Link', 'Communications', 'Center'];

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="relative h-screen flex items-center overflow-hidden"
    >
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/hero-bg.png')", y: backgroundY }}
      />
      <div className="absolute inset-0 bg-black/50" />
      <ParticleCanvas />
      <div className="container mx-auto px-6 relative z-10">
        <motion.div className="max-w-3xl text-white" style={{ y: textY }}>
          <div className="mb-6 w-20 h-20">
            <LottieLoader src="/animations/hero-security-camera.json" className="w-20 h-20" />
          </div>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div>
              <h1 className="text-5xl font-extrabold leading-tight">
                {words.map((word, index) => (
                  <motion.span
                    key={word}
                    initial={{ opacity: 0, filter: 'blur(8px)' }}
                    animate={isInView ? { opacity: 1, filter: 'blur(0px)' } : {}}
                    transition={{ duration: 0.8, delay: 0.2 * index, ease: 'easeOut' }}
                    className="inline-block mr-2"
                  >
                    {word}
                  </motion.span>
                ))}
              </h1>
            </div>
          </div>
          <p className="text-xl mt-6 max-w-2xl">Secure, monitor, and manage your environments with enterprise surveillance and communications solutions.</p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a href="/products" className="btn">Explore Products</a>
            <div className="flex flex-wrap items-center gap-3">
              <a href="/dashboard" className="btn">Inventory Dashboard</a>
              <a href="/dashboard" className="btn bg-white/10 text-sm text-white hover:bg-white/20">Admin PIN Access</a>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
