'use client'

import { motion } from 'framer-motion'
import { Shield, TrendingUp, Users, Target, Award, CheckCircle2 } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

interface HeroOverviewProps {
  studentName: string
  desScore: number
  verificationProgress: number // 0-100
  verifiedSkillsCount: number
  profileCompletion: number // 0-100
  talentPoolStatus: 'not_added' | 'added' | 'top_performer'
  nextMilestone?: string
}

const CircularProgress = ({
  value,
  max = 100,
  size = 120,
  isDark,
  label,
}: {
  value: number
  max?: number
  size?: number
  isDark: boolean
  label: string
}) => {
  const percentage = (value / max) * 100
  const radius = size / 2 - 8
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <motion.div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={isDark ? '#243056' : '#E5E7EB'}
            strokeWidth="6"
            fill="none"
          />
          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={percentage >= 75 ? '#10b981' : percentage >= 50 ? '#f59e0b' : '#ef4444'}
            strokeWidth="6"
            fill="none"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            strokeLinecap="round"
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.p
            className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {value}
          </motion.p>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>/ {max}</p>
        </div>
      </div>
      <p className={`mt-3 text-center text-sm font-semibold ${
        isDark ? 'text-gray-300' : 'text-gray-700'
      }`}>
        {label}
      </p>
    </motion.div>
  )
}

export function HeroOverview({
  studentName,
  desScore,
  verificationProgress,
  verifiedSkillsCount,
  profileCompletion,
  talentPoolStatus,
  nextMilestone,
}: HeroOverviewProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const talentPoolConfig = {
    not_added: { label: 'Not in Pool', color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-900/40' },
    added: { label: 'In Pool', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/40' },
    top_performer: { label: 'Top Performer 🏆', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/40' },
  }

  const talentPool = talentPoolConfig[talentPoolStatus]

  return (
    <motion.div
      className={`overflow-hidden rounded-3xl border ${
        isDark
          ? 'border-[#243056] bg-gradient-to-br from-[#1a2e5f] to-[#121c46]'
          : 'border-[#E5E7EB] bg-gradient-to-br from-[#f8fbff] to-white'
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <p className={`text-sm font-semibold uppercase tracking-widest ${
              isDark ? 'text-blue-400' : 'text-blue-600'
            }`}>
              Welcome back
            </p>
            <h1 className={`mt-2 text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {studentName}
            </h1>
            {nextMilestone && (
              <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Next: {nextMilestone}
              </p>
            )}
          </motion.div>

          {/* Talent Pool Badge */}
          <motion.div
            className={`rounded-full px-4 py-2 ${talentPool.bg}`}
            whileHover={{ scale: 1.05 }}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 100, delay: 0.3 }}
          >
            <p className={`text-sm font-bold ${talentPool.color}`}>
              {talentPool.label}
            </p>
          </motion.div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <CircularProgress
            value={desScore}
            max={100}
            isDark={isDark}
            label="DES Score"
          />
          <CircularProgress
            value={verificationProgress}
            max={100}
            isDark={isDark}
            label="Verification Progress"
          />
          <CircularProgress
            value={profileCompletion}
            max={100}
            isDark={isDark}
            label="Profile Completion"
          />

          {/* Verified Skills Card */}
          <motion.div
            className={`flex flex-col items-center justify-center rounded-xl p-6 ${
              isDark ? 'bg-[#1a2646]' : 'bg-blue-50'
            }`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            whileHover={{ y: -4 }}
          >
            <motion.div
              className={`flex h-16 w-16 items-center justify-center rounded-full ${
                verifiedSkillsCount > 0
                  ? isDark ? 'bg-green-900/40' : 'bg-green-100'
                  : isDark ? 'bg-gray-900/40' : 'bg-gray-100'
              }`}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Award className={`h-8 w-8 ${
                verifiedSkillsCount > 0
                  ? isDark ? 'text-green-400' : 'text-green-600'
                  : isDark ? 'text-gray-400' : 'text-gray-500'
              }`} />
            </motion.div>
            <motion.p
              className={`mt-3 text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {verifiedSkillsCount}
            </motion.p>
            <p className={`mt-1 text-sm font-semibold ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Verified Skills
            </p>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          className="mt-8 flex flex-wrap gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <button className={`flex items-center gap-2 rounded-lg px-4 py-2.5 font-semibold transition-all ${
            isDark
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}>
            <CheckCircle2 className="h-4 w-4" />
            Submit Project
          </button>
          <button className={`flex items-center gap-2 rounded-lg px-4 py-2.5 font-semibold transition-all ${
            isDark
              ? 'border-[#243056] bg-[#1a2646] text-blue-400 hover:bg-[#1a2e5f]'
              : 'border-gray-300 bg-white text-blue-600 hover:bg-gray-50'
          } border`}>
            <TrendingUp className="h-4 w-4" />
            View History
          </button>
          <button className={`flex items-center gap-2 rounded-lg px-4 py-2.5 font-semibold transition-all ${
            isDark
              ? 'border-[#243056] bg-[#1a2646] text-purple-400 hover:bg-[#1a2e5f]'
              : 'border-gray-300 bg-white text-purple-600 hover:bg-gray-50'
          } border`}>
            <Users className="h-4 w-4" />
            Mentor Reports
          </button>
        </motion.div>
      </div>
    </motion.div>
  )
}
