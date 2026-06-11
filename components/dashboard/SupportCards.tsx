'use client'

import { motion } from 'framer-motion'
import {
  Eye,
  Users,
  Target,
  Trophy,
  TrendingUp,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { useTheme } from 'next-themes'

interface VerifiedSkillsCardProps {
  skills: Array<{
    name: string
    score: number
    verificationDate: Date
    mentorName: string
  }>
}

interface RecruiterVisibilityCardProps {
  views: number
  searches: number
  impressions: number
  talentPoolRank: number
  totalInPool: number
}

interface SmartMatchCardProps {
  eligibleCompanies: number
  skillMatch: number
  recruiterDemand: number
  hiringReadiness: number
}

export function VerifiedSkillsCard({ skills }: VerifiedSkillsCardProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <motion.div
      className={`rounded-2xl border p-6 ${
        isDark
          ? 'border-[#243056] bg-[#121C46]'
          : 'border-[#E5E7EB] bg-white'
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <h3 className={`mb-4 text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Verified Skills
      </h3>

      {skills.length === 0 ? (
        <div className={`rounded-lg border-2 border-dashed p-6 text-center ${
          isDark
            ? 'border-[#243056] text-gray-400'
            : 'border-gray-200 text-gray-500'
        }`}>
          <p className="text-sm">No verified skills yet</p>
          <p className={`mt-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Complete a viva to verify your skills
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {skills.map((skill, idx) => (
            <motion.div
              key={idx}
              className={`flex items-center justify-between rounded-lg p-3 ${
                isDark ? 'bg-[#1a2646]' : 'bg-gray-50'
              }`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div>
                <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {skill.name}
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  By {skill.mentorName}
                </p>
              </div>
              <motion.div
                className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-white ${
                  skill.score >= 75
                    ? 'bg-gradient-to-r from-green-400 to-emerald-600'
                    : skill.score >= 50
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-600'
                      : 'bg-gradient-to-r from-red-400 to-red-600'
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: idx * 0.1 + 0.2 }}
              >
                {skill.score}
              </motion.div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

export function RecruiterVisibilityCard({
  views,
  searches,
  impressions,
  talentPoolRank,
  totalInPool,
}: RecruiterVisibilityCardProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const metrics = [
    { label: 'Profile Views', value: views, icon: Eye, color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Search Matches', value: searches, icon: Users, color: 'text-purple-600 dark:text-purple-400' },
    { label: 'Impressions', value: impressions, icon: Target, color: 'text-green-600 dark:text-green-400' },
  ]

  const percentile = ((totalInPool - talentPoolRank) / totalInPool) * 100

  return (
    <motion.div
      className={`rounded-2xl border p-6 ${
        isDark
          ? 'border-[#243056] bg-[#121C46]'
          : 'border-[#E5E7EB] bg-white'
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <h3 className={`mb-4 text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Recruiter Visibility
      </h3>

      {/* Metrics Grid */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon
          return (
            <motion.div
              key={idx}
              className={`rounded-lg p-3 text-center ${isDark ? 'bg-[#1a2646]' : 'bg-gray-50'}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + idx * 0.1 }}
            >
              <Icon className={`mx-auto h-5 w-5 ${metric.color}`} />
              <p className={`mt-2 text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {metric.value}
              </p>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {metric.label}
              </p>
            </motion.div>
          )
        })}
      </div>

      {/* Talent Pool Rank */}
      <div className={`rounded-lg border-2 p-4 ${
        isDark
          ? 'border-orange-900/30 bg-orange-900/10'
          : 'border-orange-200 bg-orange-50'
      }`}>
        <p className={`text-xs font-semibold uppercase tracking-wide ${
          isDark ? 'text-orange-400' : 'text-orange-700'
        }`}>
          Talent Pool Ranking
        </p>
        <div className="mt-2 flex items-center justify-between">
          <div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              #{talentPoolRank}
            </p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              out of {totalInPool} verified talents
            </p>
          </div>
          <motion.div
            className={`text-right font-bold ${
              percentile >= 75
                ? 'text-green-600 dark:text-green-400'
                : percentile >= 50
                  ? 'text-yellow-600 dark:text-yellow-400'
                  : 'text-blue-600 dark:text-blue-400'
            }`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
          >
            <p className="text-xl">{Math.round(percentile)}th</p>
            <p className="text-xs">percentile</p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export function SmartMatchCard({
  eligibleCompanies,
  skillMatch,
  recruiterDemand,
  hiringReadiness,
}: SmartMatchCardProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const matchMetrics = [
    { label: 'Eligible Companies', value: eligibleCompanies, color: 'from-blue-500 to-blue-600' },
    { label: 'Skill Match %', value: `${skillMatch}%`, color: 'from-green-500 to-emerald-600' },
    { label: 'Recruiter Demand', value: `${recruiterDemand}/10`, color: 'from-purple-500 to-pink-600' },
    { label: 'Hiring Readiness', value: `${hiringReadiness}%`, color: 'from-orange-500 to-orange-600' },
  ]

  return (
    <motion.div
      className={`rounded-2xl border p-6 ${
        isDark
          ? 'border-[#243056] bg-[#121C46]'
          : 'border-[#E5E7EB] bg-white'
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
    >
      <h3 className={`mb-4 text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Smart Match Readiness
      </h3>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-2">
        {matchMetrics.map((metric, idx) => (
          <motion.div
            key={idx}
            className={`rounded-lg bg-gradient-to-br ${metric.color} p-4 text-white`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 + idx * 0.1 }}
            whileHover={{ y: -2 }}
          >
            <p className="text-xs font-semibold opacity-90">{metric.label}</p>
            <motion.p
              className="mt-2 text-2xl font-bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 + idx * 0.1 + 0.2 }}
            >
              {metric.value}
            </motion.p>
          </motion.div>
        ))}
      </div>

      {/* Status */}
      <motion.div
        className={`mt-4 rounded-lg p-3 text-center ${
          isDark
            ? 'bg-green-900/20 text-green-400'
            : 'bg-green-50 text-green-700'
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        <div className="flex items-center justify-center gap-2">
          <CheckCircle className="h-4 w-4" />
          <p className="text-sm font-semibold">
            You're a strong match for {eligibleCompanies}+ companies!
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}
