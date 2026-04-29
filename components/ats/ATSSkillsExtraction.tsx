import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Code2,
  Users,
  Briefcase,
  Wrench,
  ChevronRight
} from 'lucide-react'
import { motion } from 'framer-motion'

interface ExtractedSkills {
  technical_skills?: string[]
  soft_skills?: string[]
  domain_skills?: string[]
  tools_platforms?: string[]
}

interface ATSSkillsExtractionProps {
  extractedSkills: ExtractedSkills
}

interface SkillCategory {
  title: string
  icon: React.ComponentType<{ className?: string }>
  skills: string[]
  color: string
  bgColor: string
  iconColor: string
}

export const ATSSkillsExtraction: React.FC<ATSSkillsExtractionProps> = ({
  extractedSkills
}) => {
  const skillCategories: SkillCategory[] = [
    {
      title: 'Technical Skills',
      icon: Code2,
      skills: extractedSkills.technical_skills || [],
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Soft Skills',
      icon: Users,
      skills: extractedSkills.soft_skills || [],
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      title: 'Domain Skills',
      icon: Briefcase,
      skills: extractedSkills.domain_skills || [],
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      iconColor: 'text-amber-600 dark:text-amber-400'
    },
    {
      title: 'Tools & Platforms',
      icon: Wrench,
      skills: extractedSkills.tools_platforms || [],
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400'
    }
  ]

  const totalSkills = skillCategories.reduce((acc, cat) => acc + cat.skills.length, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 shadow-lg">
        <CardHeader className="border-b border-slate-200 dark:border-slate-700 p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 shadow-md">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg sm:text-xl font-bold">Extracted Skills</CardTitle>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                {totalSkills} skills identified in your resume
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {skillCategories.map((category, categoryIndex) => {
              const Icon = category.icon
              return (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + categoryIndex * 0.1 }}
                >
                  <div className={`${category.bgColor} rounded-lg p-4 sm:p-5 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300`}>
                    {/* Category Header */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className={`p-1.5 rounded-lg bg-gradient-to-br ${category.color}`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                          {category.title}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {category.skills.length} {category.skills.length === 1 ? 'skill' : 'skills'}
                        </p>
                      </div>
                    </div>

                    {/* Skills Tags */}
                    <div className="flex flex-wrap gap-2">
                      {category.skills.length > 0 ? (
                        category.skills.map((skill, skillIndex) => (
                          <motion.div
                            key={skill}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.3 + skillIndex * 0.05 }}
                          >
                            <Badge 
                              className={`bg-gradient-to-r ${category.color} text-white text-xs hover:shadow-md transition-all cursor-default`}
                            >
                              <ChevronRight className="w-2.5 h-2.5 mr-1" />
                              {skill}
                            </Badge>
                          </motion.div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                          No {category.title.toLowerCase()} found
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Skill Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {skillCategories.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + index * 0.05 }}
                className={`${category.bgColor} rounded-lg p-3 sm:p-4 text-center border border-gray-200 dark:border-gray-700`}
              >
                <div className={`text-lg sm:text-xl font-bold bg-gradient-to-r ${category.color} bg-clip-text text-transparent`}>
                  {category.skills.length}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                  {category.title}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Tip */}
          <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4 sm:p-5 border border-blue-200 dark:border-blue-800">
            <p className="text-xs sm:text-sm text-blue-900 dark:text-blue-200">
              <strong>💡 Pro Tip:</strong> Highlight your most relevant skills prominently in your resume to improve ATS matching with job descriptions.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
