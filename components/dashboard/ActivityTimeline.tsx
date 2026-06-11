'use client'

import { motion } from 'framer-motion'
import {
  Upload,
  Users,
  Calendar,
  CheckCircle,
  Trophy,
  Zap,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

interface TimelineEvent {
  id: string
  type: 'submit' | 'mentor_assigned' | 'viva_scheduled' | 'viva_completed' | 'verified' | 'talent_pool'
  title: string
  description?: string
  timestamp: Date
  details?: Record<string, string | undefined>
}

const iconMap = {
  submit: Upload,
  mentor_assigned: Users,
  viva_scheduled: Calendar,
  viva_completed: CheckCircle,
  verified: Trophy,
  talent_pool: Zap,
}

const colorMap = {
  submit: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
  mentor_assigned: 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400',
  viva_scheduled: 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400',
  viva_completed: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400',
  verified: 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400',
  talent_pool: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-400',
}

export function ActivityTimeline({ events }: { events: TimelineEvent[] }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  }

  return (
    <div className={`rounded-2xl border p-6 ${
      isDark
        ? 'border-[#243056] bg-[#121C46]'
        : 'border-[#E5E7EB] bg-white'
    }`}>
      <h3 className={`mb-6 text-lg font-bold ${
        isDark ? 'text-white' : 'text-gray-900'
      }`}>
        Verification Activity
      </h3>

      <motion.div
        className="space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {events.map((event, idx) => {
          const Icon = iconMap[event.type]
          const colors = colorMap[event.type]

          return (
            <motion.div key={event.id} variants={itemVariants} className="flex gap-4">
              {/* Timeline line and dot */}
              <div className="relative flex flex-col items-center">
                <motion.div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${colors}`}
                  whileHover={{ scale: 1.1 }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <Icon className="h-5 w-5" />
                </motion.div>
                {idx < events.length - 1 && (
                  <div className={`h-12 w-0.5 ${isDark ? 'bg-[#243056]' : 'bg-gray-200'}`} />
                )}
              </div>

              {/* Event content */}
              <div className="flex-1 pt-1">
                <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {event.title}
                </p>
                {event.description && (
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {event.description}
                  </p>
                )}
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                  {dayjs(event.timestamp).fromNow()}
                </p>
                {event.details && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {Object.entries(event.details).map(([key, value]) => (
                      <span
                        key={key}
                        className={`text-xs px-2 py-1 rounded ${
                          isDark
                            ? 'bg-[#1a2646] text-[#8B5CF6]'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {key}: {value}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {events.length === 0 && (
        <div className={`rounded-lg border-2 border-dashed p-8 text-center ${
          isDark
            ? 'border-[#243056] text-gray-400'
            : 'border-gray-200 text-gray-500'
        }`}>
          <p className="text-sm">No activity yet</p>
        </div>
      )}
    </div>
  )
}
