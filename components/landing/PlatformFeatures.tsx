'use client'

export default function PlatformFeatures() {
  const features = [
    {
      icon: '✅',
      title: 'Skill Verification',
      description: 'Students complete projects and pass mentor-conducted viva sessions to verify their real-world skills.'
    },
    {
      icon: '📈',
      title: 'DES (Dishasetu Employability Score)',
      description: 'A 0–100 score measuring job readiness based on skills, projects, soft skills, and mentor feedback.'
    },
    {
      icon: '👤',
      title: 'Student Profiles',
      description: 'ATS-optimized resumes, verified skills, project portfolios, and privacy controls for students.'
    },
    {
      icon: '💼',
      title: 'Employer Hiring Tools',
      description: 'Job posting, candidate filtering by DES, interview management, and comprehensive analytics.'
    },
    {
      icon: '🏫',
      title: 'Institution Tools',
      description: 'Batch onboarding, placement tracking, DES monitoring, and automated reporting for TPOs.'
    },
    {
      icon: '🎓',
      title: 'Mentor System',
      description: 'Structured evaluation, flexible scheduling, feedback mechanisms, and reputation building.'
    }
  ]

  return (
    <section id="features" className="w-full py-16 md:py-24 px-4 md:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Core Features
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to bridge the gap between education and employment
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 md:p-8 rounded-lg bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
