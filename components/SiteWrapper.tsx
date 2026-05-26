'use client';
import { ReactNode, useEffect, useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ToastProvider } from './ToastContext';
import LottieLoader from './LottieLoader';

export default function SiteWrapper({ children }: { children: ReactNode }) {
  const path = usePathname();
  const [loading, setLoading] = useState(true);
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 1500);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col">
        <motion.div className="fixed left-0 top-0 h-[3px] w-full origin-left z-50 bg-[#1574B5]" style={{ scaleX }} />
        <Navbar />
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loader"
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full border border-[#1574B5]/30 animate-spin" />
                  <div className="relative w-24 h-24">
                    <LottieLoader src="/animations/loader-spinning-shield.json" className="w-24 h-24" />
                  </div>
                </div>
                <p className="text-primary text-sm uppercase tracking-[0.25em]">Loading Link Communications</p>
              </div>
            </motion.div>
          ) : (
            <motion.main
              key={path}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="flex-1"
            >
              {children}
            </motion.main>
          )}
        </AnimatePresence>
        <Footer />
      </div>
    </ToastProvider>
  );
}
