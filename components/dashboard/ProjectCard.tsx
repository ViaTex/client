'use client'

import { motion } from 'framer-motion'
import {
  Github,
  ExternalLink,
  Clock,
  Badge,
  Code2,
  Zap,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  MoreVertical,
} from 'lucide-react'
import { useTheme } from 'next-themes'

interface ProjectCardProps {
  id: string
  title: string
  description: string
  techStack: string[]
  skillDomain: string
  status: 'pending_viva' | 'viva_scheduled' | 'viva_completed' | 'verified' | 'failed'
  githubUrl?: string
  liveUrl?: string
  submittedDate: Date
  mentorName?: string
  desImpact?: number
  verifiedBadge?: boolean
  onViewDetails?: () => void
  onScheduleViva?: () => void
  onViewReport?: () => void
}

const statusConfig = {
  pending_viva: {
    label: 'Pending Viva',
    color: 'from-amber-500 to-orange-600',
    icon: Clock,
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    textColor: 'text-amber-700 dark:text-amber-400',
  },
  viva_scheduled: {
    label: 'Viva Scheduled',
    color: 'from-blue-500 to-indigo-600',
    icon: BookOpen,
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    textColor: 'text-blue-700 dark:text-blue-400',
  },
  viva_completed: {
    label: 'Viva Completed',
    color: 'from-purple-500 to-pink-600',
    icon: CheckCircle2,
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    textColor: 'text-purple-700 dark:text-purple-400',
  },
  verified: {
    label: 'Verified ✓',
    color: 'from-green-500 to-emerald-600',
    icon: Badge,
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    textColor: 'text-green-700 dark:text-green-400',
  },
  failed: {
    label: 'Not Passed',
    color: 'from-red-500 to-rose-600',
    icon: AlertCircle,
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    textColor: 'text-red-700 dark:text-red-400',
  },
}

export function ProjectCard({
  id,
  title,
  description,
  techStack,
  skillDomain,
  status,
  githubUrl,
  liveUrl,
  submittedDate,
  mentorName,
  desImpact,
  verifiedBadge,
  onViewDetails,
  onScheduleViva,
  onViewReport,
}: ProjectCardProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const config = statusConfig[status]
  const StatusIcon = config.icon

  const timeAgo = Math.floor(
    (new Date().getTime() - submittedDate.getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <motion.div
      className={`group overflow-hidden rounded-2xl border p-6 transition-all duration-300 ${
        isDark
          ? 'border-[#243056] bg-[#121C46] hover:border-[#3a5f8f]'
          : 'border-[#E5E7EB] bg-white hover:border-[#cfe0f0]'
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <motion.h3
              className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
              whileHover={{ letterSpacing: '0.5px' }}
            >
              {title}
            </motion.h3>
            {verifiedBadge && (
              <motion.span
                className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700 dark:bg-green-900/40 dark:text-green-400"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring' }}
              >
                <Badge className="h-3 w-3" />
                Verified
              </motion.span>
            )}
          </div>
          {description && (
            <p className={`mt-1 line-clamp-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {description}
            </p>
          )}
        </div>

        {/* More menu */}
        <motion.button
          className={`ml-4 rounded-lg p-2 ${
            isDark
              ? 'hover:bg-[#1a2646] text-gray-400'
              : 'hover:bg-gray-100 text-gray-500'
          }`}
          whileHover={{ rotate: 90 }}
        >
          <MoreVertical className="h-5 w-5" />
        </motion.button>
      </div>

      {/* Status Badge */}
      <motion.div
        className={`mb-4 inline-flex items-center gap-2 rounded-lg px-3 py-1.5 ${config.bgColor}`}
        whileHover={{ scale: 1.05 }}
      >
        <StatusIcon className={`h-4 w-4 ${config.textColor}`} />
        <span className={`text-xs font-bold ${config.textColor}`}>{config.label}</span>
      </motion.div>

      {/* Meta Information */}
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3">
        {/* Skill Domain */}
        <div className={`rounded-lg p-2.5 ${isDark ? 'bg-[#1a2646]' : 'bg-gray-50'}`}>
          <p className={`text-xs font-semibold uppercase tracking-wide ${
            isDark ? 'text-gray-500' : 'text-gray-600'
          }`}>
            Domain
          </p>
          <p className={`mt-1 text-sm font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
            {skillDomain}
          </p>
        </div>

        {/* Mentor */}
        {mentorName && (
          <div className={`rounded-lg p-2.5 ${isDark ? 'bg-[#1a2646]' : 'bg-gray-50'}`}>
            <p className={`text-xs font-semibold uppercase tracking-wide ${
              isDark ? 'text-gray-500' : 'text-gray-600'
            }`}>
              Mentor
            </p>
            <p className={`mt-1 text-sm font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
              {mentorName.split(' ')[0]}
            </p>
          </div>
        )}

        {/* DES Impact */}
        {desImpact !== undefined && (
          <div className={`rounded-lg p-2.5 ${isDark ? 'bg-[#1a2646]' : 'bg-gray-50'}`}>
            <p className={`text-xs font-semibold uppercase tracking-wide ${
              isDark ? 'text-gray-500' : 'text-gray-600'
            }`}>
              DES Impact
            </p>
            <p className={`mt-1 text-sm font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
              +{desImpact} pts
            </p>
          </div>
        )}
      </div>

      {/* Tech Stack */}
      {techStack.length > 0 && (
        <div className="mb-4">
          <p className={`mb-2 text-xs font-semibold uppercase tracking-wide ${
            isDark ? 'text-gray-500' : 'text-gray-600'
          }`}>
            Tech Stack
          </p>
          <div className="flex flex-wrap gap-2">
            {techStack.slice(0, 5).map((tech) => (
              <motion.span
                key={tech}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                  isDark
                    ? 'bg-[#1a2646] text-[#8B5CF6]'
                    : 'bg-blue-50 text-blue-600'
                }`}
                whileHover={{ scale: 1.05 }}
              >
                {tech}
              </motion.span>
            ))}
            {techStack.length > 5 && (
              <span className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                isDark
                  ? 'bg-[#1a2646] text-gray-400'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                +{techStack.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Links */}
      {(githubUrl || liveUrl) && (
        <div className="mb-4 flex gap-2">
          {githubUrl && (
            <motion.a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                isDark
                  ? 'bg-[#1a2646] text-blue-400 hover:bg-[#1a2646]/80'
                  : 'bg-gray-100 text-blue-600 hover:bg-gray-200'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Github className="h-4 w-4" />
              Code
            </motion.a>
          )}
          {liveUrl && (
            <motion.a
              href={liveUrl}
              target="_blank"
              rel="noreferrer"
              className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                isDark
                  ? 'bg-[#1a2646] text-green-400 hover:bg-[#1a2646]/80'
                  : 'bg-gray-100 text-green-600 hover:bg-gray-200'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ExternalLink className="h-4 w-4" />
              Live
            </motion.a>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 border-t pt-4">
        <motion.button
          onClick={onViewDetails}
          className={`rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
            isDark
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          View Details
        </motion.button>

        {status === 'pending_viva' && onScheduleViva && (
          <motion.button
            onClick={onScheduleViva}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
              isDark
                ? 'border-[#243056] bg-[#1a2646] text-blue-400 hover:bg-[#1a2e5f]'
                : 'border-gray-300 bg-gray-50 text-blue-600 hover:bg-gray-100'
            } border`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Schedule Viva
          </motion.button>
        )}

        {status === 'viva_completed' && onViewReport && (
          <motion.button
            onClick={onViewReport}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
              isDark
                ? 'border-[#243056] bg-[#1a2646] text-green-400 hover:bg-[#1a2e5f]'
                : 'border-gray-300 bg-gray-50 text-green-600 hover:bg-gray-100'
            } border`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            View Report
          </motion.button>
        )}
      </div>

      {/* Submitted Date */}
      <p className={`mt-3 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
        Submitted {timeAgo} days ago
      </p>
    </motion.div>
  )
}
