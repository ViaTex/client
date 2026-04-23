import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

interface ATSKeywordAnalysisProps {
  foundKeywords: string[]
  missingKeywords: string[]
}

export const ATSKeywordAnalysis: React.FC<ATSKeywordAnalysisProps> = ({
  foundKeywords,
  missingKeywords
}) => {
  const keywordData = [
    { name: 'Found', count: foundKeywords.length, fill: '#10b981' },
    { name: 'Missing', count: missingKeywords.length, fill: '#ef4444' }
  ]

  const totalKeywords = foundKeywords.length + missingKeywords.length
  const matchPercentage = totalKeywords > 0 ? Math.round((foundKeywords.length / totalKeywords) * 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 shadow-lg">
        <CardHeader className="border-b border-blue-200 dark:border-blue-800 p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg sm:text-xl font-bold">Keyword Analysis</CardTitle>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                Keywords found vs. missing for ATS optimization
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-6">
          {/* Chart */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={keywordData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: '#111827'
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {keywordData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Match Percentage */}
          <div className="bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg p-4 sm:p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100">
                Keyword Match Rate
              </span>
              <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs sm:text-sm">
                {matchPercentage}%
              </Badge>
            </div>
            <div className="w-full h-2 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                initial={{ width: 0 }}
                animate={{ width: `${matchPercentage}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
          </div>

          {/* Keywords Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Found Keywords */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-4 sm:p-5 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Found Keywords ({foundKeywords.length})
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {foundKeywords.length > 0 ? (
                    foundKeywords.map((keyword, index) => (
                      <motion.div
                        key={keyword}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                      >
                        <Badge className="bg-green-600 text-white text-xs sm:text-sm hover:bg-green-700 transition-colors">
                          {keyword}
                        </Badge>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 italic">
                      No keywords found
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Missing Keywords */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-4 sm:p-5 border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Missing Keywords ({missingKeywords.length})
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {missingKeywords.length > 0 ? (
                    missingKeywords.map((keyword, index) => (
                      <motion.div
                        key={keyword}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                      >
                        <Badge className="bg-red-600 text-white text-xs sm:text-sm hover:bg-red-700 transition-colors">
                          {keyword}
                        </Badge>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 italic">
                      No missing keywords
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Recommendation */}
          {missingKeywords.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/10 rounded-lg p-4 sm:p-5 border border-amber-200 dark:border-amber-800">
              <p className="text-xs sm:text-sm text-amber-900 dark:text-amber-200">
                <strong>💡 Tip:</strong> Consider adding the missing keywords to your resume to improve ATS compatibility and keyword matching.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
