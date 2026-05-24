'use client';
import { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function SiteWrapper({ children }: { children: ReactNode }) {
  const path = usePathname();
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  return (
    <div className="min-h-screen flex flex-col">
      <motion.div className="fixed left-0 top-0 h-[3px] w-full origin-left bg-[#00B4FF] z-50" style={{ scaleX }} />
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={path}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.45 }}
          className="flex-1"
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <Footer />
    </div>
  );
}
