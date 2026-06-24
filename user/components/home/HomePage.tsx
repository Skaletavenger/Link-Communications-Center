'use client'

import Navbar from '@/components/Navbar'
import HeroSection from './HeroSection'
import StatsBarSection from './StatsBarSection'
import CategoriesSection from './CategoriesSection'
import ParallaxFeatureSection from './ParallaxFeatureSection'
import HowItWorksSection from './HowItWorksSection'
import CTASection from './CTASection'
import { useHomeAuth } from './useHomeAuth'
import { useRef } from 'react'
import Footer from '@/components/Footer'

export default function HomePage() {
  const { loggedIn, authHref, productsHref } = useHomeAuth()
  const productsRef = useRef<HTMLDivElement>(null)
  const aboutRef = useRef<HTMLDivElement>(null)
  const contactRef = useRef<HTMLDivElement>(null)

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      
      {/* Hero Section */}
      <HeroSection productsHref={productsHref} authHref={authHref} loggedIn={loggedIn} />
      
      {/* Quick Navigation Cards */}
      <section className="py-12 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Products Card */}
          <button
            onClick={() => scrollToSection(productsRef)}
            className="p-6 md:p-8 rounded-2xl border transition-all hover:scale-105 hover:shadow-lg text-left"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border-color)'
            }}
          >
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Browse Products
            </h3>
            <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
              Explore our full range of surveillance, access control, and communication equipment
            </p>
            <div className="mt-4 flex items-center gap-2 font-semibold" style={{ color: '#1574B5' }}>
              View Catalog <span>→</span>
            </div>
          </button>

          {/* Smartphone Loans Card */}
          <button
            onClick={() => scrollToSection(productsRef)}
            className="p-6 md:p-8 rounded-2xl border transition-all hover:scale-105 hover:shadow-lg text-left"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border-color)'
            }}
          >
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Smartphone Loans
            </h3>
            <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
              Flexible payment plans for TECNO, INFINIX, and ITEL phones with daily or monthly options
            </p>
            <div className="mt-4 flex items-center gap-2 font-semibold" style={{ color: '#1574B5' }}>
              Explore Plans <span>→</span>
            </div>
          </button>

          {/* Contact Card */}
          <button
            onClick={() => scrollToSection(contactRef)}
            className="p-6 md:p-8 rounded-2xl border transition-all hover:scale-105 hover:shadow-lg text-left"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border-color)'
            }}
          >
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Get in Touch
            </h3>
            <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
              Have questions? Contact our team for quotations, installations, and support
            </p>
            <div className="mt-4 flex items-center gap-2 font-semibold" style={{ color: '#1574B5' }}>
              Contact Us <span>→</span>
            </div>
          </button>
        </div>
      </section>

      {/* Stats Section */}
      <StatsBarSection />

      {/* Categories Section */}
      <div ref={productsRef}>
        <CategoriesSection productsHref={productsHref} />
      </div>

      {/* Features Section */}
      <ParallaxFeatureSection />

      {/* How It Works Section */}
      <div ref={aboutRef}>
        <HowItWorksSection />
      </div>

      {/* CTA Section */}
      <div ref={contactRef}>
        <CTASection />
      </div>

      {/* Footer */}
      <Footer />
    </main>
  )
}
