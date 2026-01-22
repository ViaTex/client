'use client'

export default function Stakeholders() {
  const stakeholders = [
    {
      icon: '🎓',
      title: 'Students',
      description: 'Final-year students, fresh graduates, and career switchers. Prove your skills, build verified profiles, and get matched with the right opportunities.',
      benefits: [
        'Better job matching',
        'Verified skills showcase',
        'Higher placement chances'
      ]
    },
    {
      icon: '💼',
      title: 'Employers',
      description: 'Recruiters, hiring managers, startups, and enterprises. Hire verified talent faster with reduced screening time and trusted candidate quality.',
      benefits: [
        'Reduced screening time',
        'Trusted candidate quality',
        'DES-based filtering'
      ]
    },
    {
      icon: '🏫',
      title: 'Institutions (TPOs)',
      description: 'Colleges, universities, and training centers. Manage placements efficiently using data-driven insights and automated reporting.',
      benefits: [
        'Improved placement rates',
        'Automated reporting',
        'DES monitoring'
      ]
    },
    {
      icon: '👨‍🏫',
      title: 'Mentors',
      description: 'Industry professionals who verify skills and guide students. Build reputation through structured evaluation and flexible scheduling.',
      benefits: [
        'Structured contribution',
        'Professional recognition',
        'Flexible scheduling'
      ]
    }
  ]

  return (
    <section id="stakeholders" className="w-full py-16 md:py-24 px-4 md:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            For Everyone
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            A platform designed for all stakeholders in the employability ecosystem
          </p>
        </div>

        {/* Stakeholders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
          {stakeholders.map((stakeholder, index) => (
            <div
              key={index}
              className="p-6 md:p-8 rounded-lg bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="text-4xl">{stakeholder.icon}</div>
                <div className="flex-1">
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                    {stakeholder.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {stakeholder.description}
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-blue-600 mb-2">Key Benefits:</p>
                    <ul className="space-y-1">
                      {stakeholder.benefits.map((benefit, idx) => (
                        <li key={idx} className="text-gray-700 text-sm flex items-center gap-2">
                          <span className="text-blue-600">✓</span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
