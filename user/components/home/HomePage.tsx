'use client'

import Navbar from '@/components/Navbar'
import HeroSection from './HeroSection'
import StatsBarSection from './StatsBarSection'
import CategoriesSection from './CategoriesSection'
import ParallaxFeatureSection from './ParallaxFeatureSection'
import HowItWorksSection from './HowItWorksSection'
import CTASection from './CTASection'
import LccAIAssistantSection from './LccAIAssistantSection'
import { useHomeAuth } from './useHomeAuth'

export default function HomePage() {
  const { loggedIn, authHref, productsHref } = useHomeAuth()

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <HeroSection productsHref={productsHref} authHref={authHref} loggedIn={loggedIn} />
      <LccAIAssistantSection />
      <StatsBarSection />
      <CategoriesSection productsHref={productsHref} />
      <ParallaxFeatureSection />
      <HowItWorksSection />
      <CTASection />
    </main>
  )
}
