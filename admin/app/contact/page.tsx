'use client';
import AdminGuard from '../../lib/AdminGuard'
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

function Contact() {
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
      <h1 className="text-4xl font-bold mb-4 text-primary">Contact Us</h1>
      <form className="grid gap-4 max-w-lg">
        <input className="p-3 rounded bg-card border border-theme text-primary" placeholder="Name" />
        <input className="p-3 rounded bg-card border border-theme text-primary" placeholder="Email" />
        <textarea className="p-3 rounded bg-card border border-theme text-primary" placeholder="Message" rows={6} />
        <button className="btn w-40">Send</button>
      </form>
    </motion.section>
  );
}

export default function ContactProtected() {
  return (
    <AdminGuard>
      <Contact />
    </AdminGuard>
  )
}
