'use client';
import ParticleCanvas from './ParticleCanvas';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const LottieLoader = dynamic(() => import('./LottieLoader'), { ssr: false });

export default function Hero() {
  return (
    <section className="relative h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/hero-bg.png')" }} />
      <div className="absolute inset-0 bg-black/50" />
      <ParticleCanvas />
      <div className="container mx-auto px-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-3xl text-white">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <LottieLoader src="/animations/hero-security-camera.json" className="w-20 h-20" />
            <div>
              <h1 className="text-5xl font-extrabold">Link Communications Center</h1>
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
    </section>
  );
}
