import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  FileText,
  Mail,
  CheckCircle,
  AlertCircle,
  Layers,
  ChevronDown
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'

interface ATSSectionAnalysisProps {
  sectionsAnalysis: Record<string, string>
}

interface SectionItem {
  title: string
  icon: React.ComponentType<{ className?: string }>
  analysis: string
  color: string
  bgColor: string
}

export const ATSSectionAnalysis: React.FC<ATSSectionAnalysisProps> = ({
  sectionsAnalysis
}) => {
  const [expandedSections, setExpandedSections] = useState<string[]>([])

  const sections: SectionItem[] = [
    {
      title: 'Contact Information',
      icon: Mail,
      analysis: sectionsAnalysis?.contact_information || 'Not analyzed',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/10'
    },
    {
      title: 'Professional Summary',
      icon: FileText,
      analysis: sectionsAnalysis?.professional_summary || 'Not analyzed',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/10'
    },
    {
      title: 'Work Experience',
      icon: CheckCircle,
      analysis: sectionsAnalysis?.work_experience || 'Not analyzed',
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50 dark:bg-amber-900/10'
    },
    {
      title: 'Education',
      icon: Layers,
      analysis: sectionsAnalysis?.education || 'Not analyzed',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50 dark:bg-green-900/10'
    },
    {
      title: 'Skills',
      icon: CheckCircle,
      analysis: sectionsAnalysis?.skills || 'Not analyzed',
      color: 'from-red-500 to-rose-500',
      bgColor: 'bg-red-50 dark:bg-red-900/10'
    }
  ]

  const toggleSection = (title: string) => {
    setExpandedSections(prev =>
      prev.includes(title)
        ? prev.filter(s => s !== title)
        : [...prev, title]
    )
  }

  const isPositive = (analysis: string): boolean => {
    const positiveKeywords = ['good', 'well', 'clear', 'strong', 'excellent', 'effective', 'great', 'perfect']
    const lowerAnalysis = analysis.toLowerCase()
    return positiveKeywords.some(keyword => lowerAnalysis.includes(keyword))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-gray-600 to-gray-700 shadow-md">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg sm:text-xl font-bold">Section Analysis</CardTitle>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                Detailed feedback for each section of your resume
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          {sections.map((section, index) => {
            const Icon = section.icon
            const isExpanded = expandedSections.includes(section.title)
            const positive = isPositive(section.analysis)

            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
              >
                <div className={`${section.bgColor} rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-md`}>
                  {/* Section Header */}
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="w-full p-3 sm:p-4 flex items-center gap-3 hover:opacity-80 transition-opacity"
                  >
                    <div className={`p-1.5 rounded-lg bg-gradient-to-br ${section.color} flex-shrink-0`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                        {section.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      {positive ? (
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                      )}
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex-shrink-0"
                      >
                        <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </motion.div>
                    </div>
                  </button>

                  {/* Expanded Content */}
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{
                      height: isExpanded ? 'auto' : 0,
                      opacity: isExpanded ? 1 : 0
                    }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 sm:px-4 pb-3 sm:pb-4 border-t border-gray-200 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/50">
                      <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed mt-3 sm:mt-4">
                        {section.analysis}
                      </p>
                      
                      {/* Improvement suggestions */}
                      {!positive && (
                        <div className="mt-3 sm:mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            <strong>✨ Suggestion:</strong> Review this section and consider restructuring for better clarity and impact.
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )
          })}
        </CardContent>
      </Card>
    </motion.div>
  )
}
