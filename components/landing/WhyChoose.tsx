'use client'

import { useRouter } from 'next/navigation'

export default function WhyChoose() {
  const router = useRouter()

  const differentiators = [
    {
      icon: '⭐',
      title: 'First Standardized Employability Score',
      description: 'Beyond CGPA - DES provides a comprehensive 0-100 score measuring real job readiness.'
    },
    {
      icon: '🔍',
      title: 'Mandatory Skill Verification',
      description: 'Real projects and viva sessions ensure only verified skills make it to employers.'
    },
    {
      icon: '🔄',
      title: 'End-to-End Hiring Pipeline',
      description: 'Complete hiring process from job posting to candidate selection on a single platform.'
    },
    {
      icon: '🏛️',
      title: 'Strong Institutional Integration',
      description: 'Seamless campus placement management with automated tracking and reporting.'
    },
    {
      icon: '🔒',
      title: 'Student-Controlled Privacy',
      description: 'Students control their data visibility and privacy settings completely.'
    },
    {
      icon: '📊',
      title: 'Data-Driven Insights',
      description: 'Comprehensive analytics for institutions and employers to make informed decisions.'
    }
  ]

  return (
    <section className="w-full py-16 md:py-24 px-4 md:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Why Choose DishaSetu?
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Key differentiators that set us apart in the employability ecosystem
          </p>
        </div>

        {/* Differentiators Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {differentiators.map((item, index) => (
            <div
              key={index}
              className="p-6 md:p-8 rounded-lg bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300"
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
                {item.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="inline-block p-8 md:p-12 rounded-lg bg-white border border-gray-200 shadow-sm">
            <h3 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
              Ready to Transform Employability?
            </h3>
            <p className="text-lg md:text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
              Join thousands of students, employers, and institutions already using DishaSetu
            </p>
            <button
              onClick={() => router.push('/register')}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-md text-lg md:text-xl hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm"
            >
              Get Started Today
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
