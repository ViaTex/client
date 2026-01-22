'use client'

import { useRouter } from 'next/navigation'

export default function Hero() {
  const router = useRouter()

  const handleGetStarted = () => {
    router.push('/register')
  }

  const handleLearnMore = () => {
    const featuresSection = document.getElementById('features')
    featuresSection?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="relative w-full min-h-[85vh] flex flex-col items-center justify-center px-4 md:px-8 py-24 pt-32 bg-white">
      <div className="relative z-10 flex flex-col items-center justify-center gap-6 md:gap-8 w-full max-w-6xl text-center">
        {/* Main Heading */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-4">
          <span className="block">Welcome to</span>
          <span className="block text-blue-600 mt-2">
            DishaSetu
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl lg:text-3xl text-gray-700 font-medium mb-2">
          Bridge the Gap Between Education and Employment
        </p>

        {/* Description */}
        <p className="text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
          An all-in-one digital employability and placement platform connecting students, 
          employers, educational institutions, and industry mentors on a single transparent 
          and skill-verified ecosystem.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 md:gap-6 mt-4">
          <button
            onClick={handleGetStarted}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-md text-lg md:text-xl hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm"
          >
            Get Started
          </button>
          <button
            onClick={handleLearnMore}
            className="px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-md text-lg md:text-xl hover:border-gray-400 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Learn More
          </button>
        </div>

        {/* Key Points */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-16 w-full max-w-4xl">
          <div className="flex flex-col items-center p-6 rounded-lg bg-gray-50 border border-gray-200">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="text-gray-900 font-semibold text-lg mb-2">Skill Verification</h3>
            <p className="text-gray-600 text-sm text-center">Real projects & mentor viva sessions</p>
          </div>
          <div className="flex flex-col items-center p-6 rounded-lg bg-gray-50 border border-gray-200">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-gray-900 font-semibold text-lg mb-2">DES Score</h3>
            <p className="text-gray-600 text-sm text-center">0-100 employability measurement</p>
          </div>
          <div className="flex flex-col items-center p-6 rounded-lg bg-gray-50 border border-gray-200">
            <div className="text-4xl mb-3">🤝</div>
            <h3 className="text-gray-900 font-semibold text-lg mb-2">End-to-End Hiring</h3>
            <p className="text-gray-600 text-sm text-center">Complete pipeline on one platform</p>
          </div>
        </div>
      </div>
    </div>
  )
}
