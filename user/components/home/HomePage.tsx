"use client"
import HeroSection from './HeroSection'
import SurveillanceCamerasSection from './SurveillanceCamerasSection'
import StatsBarSection from './StatsBarSection'
import CategoriesSection from './CategoriesSection'
import FeaturedProductsSection from './FeaturedProductsSection'
import ParallaxFeatureSection from './ParallaxFeatureSection'
import HowItWorksSection from './HowItWorksSection'
import CTASection from './CTASection'
import { useHomeAuth } from './useHomeAuth'
import type { ProductRow } from '../../lib/inventory'

export default function HomePage({ featuredRows = [] }: { featuredRows?: ProductRow[] }) {
  const { loggedIn, authHref, productsHref } = useHomeAuth()

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <HeroSection productsHref={productsHref} authHref={authHref} loggedIn={loggedIn} />
      <SurveillanceCamerasSection />
      <StatsBarSection />
      <CategoriesSection productsHref={productsHref} />
      <FeaturedProductsSection rows={featuredRows} productsHref={productsHref} />
      <ParallaxFeatureSection />
      <HowItWorksSection />
      <CTASection />
    </main>
  )
}
