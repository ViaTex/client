'use client'

import Hero from '@/components/landing/Hero'
import PlatformFeatures from '@/components/landing/PlatformFeatures'
import Stakeholders from '@/components/landing/Stakeholders'
import WhyChoose from '@/components/landing/WhyChoose'
import LandingFooter from '@/components/landing/LandingFooter'

export default function Home() {
  return (
    <div className="bg-white min-h-screen w-full overflow-x-hidden">
      <div id="hero">
        <Hero />
      </div>
      <PlatformFeatures />
      <div id="stakeholders">
        <Stakeholders />
      </div>
      <WhyChoose />
      <LandingFooter />
    </div>
  )
}
