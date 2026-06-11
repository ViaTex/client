'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Video, Calendar, Clock, MapPin, ExternalLink } from 'lucide-react'
import { useTheme } from 'next-themes'

interface VivaWidgetProps {
  mentorName: string
  mentorCompany: string
  mentorRole: string
  mentorImage?: string
  vivaDate: Date
  duration: number // in minutes
  meetingLink?: string
  status: 'scheduled' | 'upcoming' | 'completed'
}

export function VivaWidget({
  mentorName,
  mentorCompany,
  mentorRole,
  mentorImage,
  vivaDate,
  duration,
  meetingLink,
  status,
}: VivaWidgetProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const [timeLeft, setTimeLeft] = useState<string>('')

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date()
      const diff = vivaDate.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft('Viva is starting soon!')
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h left`)
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m left`)
      } else {
        setTimeLeft(`${minutes}m left`)
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 60000)
    return () => clearInterval(interval)
  }, [vivaDate])

  const statusColors = {
    scheduled: 'from-blue-500 to-blue-600',
    upcoming: 'from-orange-500 to-orange-600',
    completed: 'from-green-500 to-green-600',
  }

  const statusLabels = {
    scheduled: 'Scheduled',
    upcoming: 'Upcoming Soon',
    completed: 'Completed',
  }

  return (
    <motion.div
      className={`rounded-2xl border p-6 ${
        isDark
          ? 'border-[#243056] bg-gradient-to-br from-[#1a2e5f] to-[#121c46]'
          : 'border-[#E5E7EB] bg-gradient-to-br from-[#f0f4ff] to-white'
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      whileHover={{ y: -2 }}
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Upcoming Viva
        </h3>
        <motion.span
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-white bg-gradient-to-r ${
            statusColors[status]
          }`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          <div className="h-2 w-2 rounded-full bg-white" />
          {statusLabels[status]}
        </motion.span>
      </div>

      {/* Mentor Info */}
      <div className="mb-6 flex items-center gap-4">
        {mentorImage ? (
          <img
            src={mentorImage}
            alt={mentorName}
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
            isDark ? 'bg-purple-900' : 'bg-purple-100'
          }`}>
            <span className={`font-bold ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>
              {mentorName.charAt(0)}
            </span>
          </div>
        )}
        <div>
          <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {mentorName}
          </p>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {mentorRole} @ {mentorCompany}
          </p>
        </div>
      </div>

      {/* Viva Details */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center gap-3">
          <Calendar className={`h-5 w-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          <div>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {vivaDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Clock className={`h-5 w-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
          <div>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {vivaDate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })}{' '}
              • {duration} mins
            </p>
          </div>
        </div>

        <motion.div
          className="flex items-center gap-3"
          animate={{ opacity: [1, 0.7, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <MapPin className={`h-5 w-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
          <p className={`text-sm font-semibold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
            {timeLeft}
          </p>
        </motion.div>
      </div>

      {/* Buttons */}
      <div className="space-y-2">
        {meetingLink && status !== 'completed' && (
          <motion.a
            href={meetingLink}
            target="_blank"
            rel="noreferrer"
            className={`block rounded-lg px-4 py-2 text-center font-semibold transition-all ${
              isDark
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-center gap-2">
              <Video className="h-4 w-4" />
              Join Viva
            </div>
          </motion.a>
        )}

        {status !== 'completed' && (
          <motion.button
            className={`w-full rounded-lg border px-4 py-2 text-center font-semibold transition-all ${
              isDark
                ? 'border-[#243056] text-gray-400 hover:bg-[#1a2646]'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Reschedule
          </motion.button>
        )}

        {status === 'completed' && (
          <div className={`rounded-lg p-3 text-center ${
            isDark
              ? 'bg-green-900/20 text-green-400'
              : 'bg-green-50 text-green-700'
          }`}>
            <p className="text-sm font-semibold">Viva Completed ✓</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
