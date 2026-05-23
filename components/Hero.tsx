'use client';
import ParticleCanvas from './ParticleCanvas';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const LottieLoader = dynamic(() => import('./LottieLoader'), { ssr: false });

export default function Hero() {
  return (
    <section className="relative h-screen flex items-center">
      <video autoPlay muted loop className="absolute inset-0 w-full h-full object-cover opacity-40">
        <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
      </video>
      <ParticleCanvas />
      <div className="container mx-auto px-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="flex items-center gap-6">
          <LottieLoader src="/animations/hero-security-camera.json" className="w-20 h-20" />
          <div>
            <h1 className="text-5xl font-extrabold">Link Communications Center</h1>
            
          </div>
          <p className="text-xl mt-4 max-w-2xl">Secure, monitor, and manage your environments with enterprise surveillance and communications solutions.</p>
          <div className="mt-6 flex gap-4">
            <a href="/products" className="btn">Explore Products</a>
            <a href="/dashboard" className="btn">Inventory Dashboard</a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
