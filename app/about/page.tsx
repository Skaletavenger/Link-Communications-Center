'use client';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export default function About() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="container mx-auto px-6 py-12"
    >
      <h1 className="text-4xl font-bold mb-4">About Link Communications Center</h1>
      <p className="max-w-3xl text-muted">We provide enterprise-grade security and communications hardware, integration, and support. Professional installation and 24/7 monitoring services available.</p>
    </motion.section>
  );
}
