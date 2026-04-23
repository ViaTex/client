import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  Zap,
  ArrowRight
} from 'lucide-react'
import { motion } from 'framer-motion'

interface ATSRecommendationsProps {
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
}

export const ATSRecommendations: React.FC<ATSRecommendationsProps> = ({
  strengths,
  weaknesses,
  recommendations
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="space-y-4 sm:space-y-6"
    >
      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Strengths Card */}
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 shadow-lg">
          <CardHeader className="border-b border-green-200 dark:border-green-800 p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 shadow-md">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg sm:text-xl font-bold">Strengths</CardTitle>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {strengths.length} {strengths.length === 1 ? 'strength' : 'strengths'} identified
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 space-y-3">
            {strengths.length > 0 ? (
              strengths.map((strength, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                  className="flex gap-3"
                >
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {strength}
                  </p>
                </motion.div>
              ))
            ) : (
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 italic">
                No strengths identified yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Weaknesses Card */}
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 shadow-lg">
          <CardHeader className="border-b border-red-200 dark:border-red-800 p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 shadow-md">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg sm:text-xl font-bold">Areas for Improvement</CardTitle>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {weaknesses.length} {weaknesses.length === 1 ? 'area' : 'areas'} to improve
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 space-y-3">
            {weaknesses.length > 0 ? (
              weaknesses.map((weakness, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                  className="flex gap-3"
                >
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {weakness}
                  </p>
                </motion.div>
              ))
            ) : (
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 italic">
                No weaknesses identified
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recommendations Card */}
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 shadow-lg">
        <CardHeader className="border-b border-blue-200 dark:border-blue-800 p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 shadow-md">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg sm:text-xl font-bold">Recommendations</CardTitle>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                {recommendations.length} actionable suggestions to boost your ATS score
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          {recommendations.length > 0 ? (
            <div className="space-y-3">
              {recommendations.map((recommendation, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                  className="flex gap-3 p-3 sm:p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-blue-200/50 dark:border-blue-800/50 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 group"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-xs sm:text-sm font-semibold">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {recommendation}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-0.5" />
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 italic">
              No recommendations available
            </p>
          )}

          {/* Action Items */}
          <div className="mt-6 p-4 sm:p-5 bg-blue-100 dark:bg-blue-900/30 rounded-lg border border-blue-300 dark:border-blue-800">
            <div className="flex gap-3">
              <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-200 text-sm mb-2">
                  🚀 Quick Action Plan
                </h4>
                <ol className="text-xs sm:text-sm text-blue-800 dark:text-blue-300 space-y-2 list-decimal list-inside">
                  <li>Review and implement the recommendations above</li>
                  <li>Update your resume with improvements</li>
                  <li>Re-upload and recalculate your ATS score</li>
                  <li>Track your progress and celebrate improvements!</li>
                </ol>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
