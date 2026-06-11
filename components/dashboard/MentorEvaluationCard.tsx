'use client'

import { motion } from 'framer-motion'
import { User, Award, AlertCircle } from 'lucide-react'
import { useTheme } from 'next-themes'

interface MentorEvaluationProps {
  technical: number
  practical: number
  communication: number
  originality: number
  totalScore: number
  verdict: 'pass' | 'fail' | 'pending'
  strengths?: string[]
  improvements?: string[]
  mentorName?: string
  mentorCompany?: string
  mentorRole?: string
  feedback?: string
}

const ScoreBar = ({
  label,
  score,
  max = 100,
  isDark,
}: {
  label: string
  score: number
  max?: number
  isDark: boolean
}) => {
  const percentage = (score / max) * 100

  return (
    <motion.div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {label}
        </p>
        <motion.span
          className={`text-sm font-bold ${
            percentage >= 75
              ? 'text-green-600 dark:text-green-400'
              : percentage >= 50
                ? 'text-yellow-600 dark:text-yellow-400'
                : 'text-red-600 dark:text-red-400'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {score}/{max}
        </motion.span>
      </div>
      <div className={`h-2 overflow-hidden rounded-full ${isDark ? 'bg-[#1a2646]' : 'bg-gray-200'}`}>
        <motion.div
          className={`h-full rounded-full ${
            percentage >= 75
              ? 'bg-gradient-to-r from-green-400 to-emerald-600'
              : percentage >= 50
                ? 'bg-gradient-to-r from-yellow-400 to-orange-600'
                : 'bg-gradient-to-r from-red-400 to-red-600'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
      </div>
    </motion.div>
  )
}

export function MentorEvaluationCard({
  technical,
  practical,
  communication,
  originality,
  totalScore,
  verdict,
  strengths = [],
  improvements = [],
  mentorName,
  mentorCompany,
  mentorRole,
  feedback,
}: MentorEvaluationProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const verdictColors = {
    pass: 'from-green-500 to-emerald-600',
    fail: 'from-red-500 to-red-600',
    pending: 'from-blue-500 to-indigo-600',
  }

  const verdictLabels = {
    pass: 'Passed ✓',
    fail: 'Not Passed',
    pending: 'Pending',
  }

  return (
    <motion.div
      className={`rounded-2xl border p-6 ${
        isDark
          ? 'border-[#243056] bg-[#121C46]'
          : 'border-[#E5E7EB] bg-white'
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="mb-6 flex items-center justify-between">
        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Mentor Evaluation
        </h3>
        <motion.span
          className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${verdictColors[verdict]} px-4 py-2 text-sm font-bold text-white`}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 100 }}
        >
          <Award className="h-4 w-4" />
          {verdictLabels[verdict]}
        </motion.span>
      </div>

      {/* Mentor Info */}
      {mentorName && (
        <div className={`mb-6 rounded-lg p-4 ${isDark ? 'bg-[#1a2646]' : 'bg-gray-50'}`}>
          <p className={`text-xs font-semibold uppercase tracking-wide ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Evaluated by
          </p>
          <div className="mt-2 flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
              isDark ? 'bg-purple-900' : 'bg-purple-100'
            }`}>
              <User className={`h-5 w-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <div>
              <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {mentorName}
              </p>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {mentorRole} at {mentorCompany}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Score Breakdown */}
      <div className="mb-6 space-y-4">
        <div>
          <p className={`mb-4 text-sm font-semibold uppercase tracking-wide ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Score Breakdown
          </p>
          <div className="space-y-4">
            <ScoreBar label="Technical (40%)" score={technical} max={40} isDark={isDark} />
            <ScoreBar label="Practical (30%)" score={practical} max={30} isDark={isDark} />
            <ScoreBar label="Communication (20%)" score={communication} max={20} isDark={isDark} />
            <ScoreBar label="Originality (10%)" score={originality} max={10} isDark={isDark} />
          </div>
        </div>

        {/* Total Score */}
        <motion.div
          className={`rounded-lg border-2 p-4 text-center ${
            isDark
              ? 'border-blue-900 bg-blue-900/20'
              : 'border-blue-200 bg-blue-50'
          }`}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className={`text-xs font-semibold uppercase ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
            Total Score
          </p>
          <motion.p
            className={`mt-1 text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {totalScore}/100
          </motion.p>
        </motion.div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`mb-6 rounded-lg p-4 ${isDark ? 'bg-[#1a2646]' : 'bg-gray-50'}`}>
          <p className={`text-xs font-semibold uppercase tracking-wide ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Overall Feedback
          </p>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {feedback}
          </p>
        </div>
      )}

      {/* Strengths & Improvements */}
      <div className="grid gap-4 md:grid-cols-2">
        {strengths.length > 0 && (
          <div className={`rounded-lg p-4 ${isDark ? 'bg-green-900/20' : 'bg-green-50'}`}>
            <p className={`mb-3 flex items-center gap-2 text-sm font-bold ${
              isDark ? 'text-green-400' : 'text-green-700'
            }`}>
              <Award className="h-4 w-4" />
              Strengths
            </p>
            <ul className="space-y-1">
              {strengths.map((s, idx) => (
                <li
                  key={idx}
                  className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  • {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {improvements.length > 0 && (
          <div className={`rounded-lg p-4 ${isDark ? 'bg-orange-900/20' : 'bg-orange-50'}`}>
            <p className={`mb-3 flex items-center gap-2 text-sm font-bold ${
              isDark ? 'text-orange-400' : 'text-orange-700'
            }`}>
              <AlertCircle className="h-4 w-4" />
              Areas to Improve
            </p>
            <ul className="space-y-1">
              {improvements.map((imp, idx) => (
                <li
                  key={idx}
                  className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  • {imp}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  )
}
