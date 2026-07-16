'use client';
import { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { motion, useScroll, useTransform } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ToastProvider } from './ToastContext';

export default function SiteWrapper({ children }: { children: ReactNode }) {
  const path = usePathname();
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col">
        <motion.div className="fixed left-0 top-0 h-[3px] w-full origin-left z-50 bg-[#1574B5]" style={{ scaleX }} />
        <Navbar />
        <motion.main
          key={path}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="flex-1 pt-24"
        >
          {children}
        </motion.main>
        <Footer />
      </div>
    </ToastProvider>
  );
}
