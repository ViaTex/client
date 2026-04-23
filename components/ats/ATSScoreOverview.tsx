import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  Target,
  Zap,
  BarChart3
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { motion } from 'framer-motion'

interface ATSScoreOverviewProps {
  atsScore: number
  overallAssessment: string
  formattingScore?: number
  contentScore?: number
  keywordScore?: number
}

export const ATSScoreOverview: React.FC<ATSScoreOverviewProps> = ({
  atsScore,
  overallAssessment,
  formattingScore = 85,
  contentScore = 80,
  keywordScore = 75
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return { bg: 'from-green-500 to-emerald-500', text: 'text-green-600 dark:text-green-400', light: 'bg-green-50 dark:bg-green-900/10' }
    if (score >= 60) return { bg: 'from-yellow-500 to-amber-500', text: 'text-yellow-600 dark:text-yellow-400', light: 'bg-yellow-50 dark:bg-yellow-900/10' }
    return { bg: 'from-red-500 to-orange-500', text: 'text-red-600 dark:text-red-400', light: 'bg-red-50 dark:bg-red-900/10' }
  }

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 70) return 'Good'
    if (score >= 50) return 'Fair'
    return 'Needs Improvement'
  }

  const scoreColors = getScoreColor(atsScore)
  const subScores = [
    { name: 'Formatting', value: formattingScore, icon: BarChart3, color: '#3b82f6' },
    { name: 'Content', value: contentScore, icon: Target, color: '#8b5cf6' },
    { name: 'Keywords', value: keywordScore, icon: Zap, color: '#ec4899' }
  ]

  const pieData = [
    { name: 'Score', value: atsScore, color: scoreColors.bg.split(' ')[2] },
    { name: 'Remaining', value: 100 - atsScore, color: '#e5e7eb' }
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Main Score Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 shadow-lg">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          </div>
          
          <CardContent className="relative z-10 p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Score Visualization */}
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="relative w-40 h-40 sm:w-48 sm:h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Center Score Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-3xl sm:text-4xl font-bold ${scoreColors.text}`}>
                      {atsScore}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                      out of 100
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <Badge className={`bg-gradient-to-r ${scoreColors.bg} text-white text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2`}>
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                  {getScoreBadge(atsScore)}
                </Badge>
              </div>

              {/* Assessment & Sub-scores */}
              <div className="space-y-6">
                {/* Overall Assessment */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100">
                      Overall Assessment
                    </h3>
                  </div>
                  <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                    {overallAssessment}
                  </p>
                </div>

                {/* Sub-scores Grid */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  {subScores.map((score) => {
                    const Icon = score.icon
                    const color = getScoreColor(score.value)
                    const percentage = (score.value / 100) * 100
                    
                    return (
                      <motion.div
                        key={score.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className={`${color.light} rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700 text-center`}
                      >
                        <Icon className={`w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-2 ${color.text}`} />
                        <div className={`text-lg sm:text-xl font-bold ${color.text}`}>
                          {score.value}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {score.name}
                        </div>
                        
                        {/* Progress bar */}
                        <div className="w-full h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
                          <motion.div
                            className={`h-full bg-gradient-to-r ${color.bg}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1, delay: 0.3 }}
                          />
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
