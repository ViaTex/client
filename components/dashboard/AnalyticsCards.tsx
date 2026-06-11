'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Users, Award, Target } from 'lucide-react'
import { useTheme } from 'next-themes'

export interface MetricCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  subtext?: string
  trend?: number
  color: 'blue' | 'green' | 'purple' | 'orange'
}

const colorMap = {
  blue: {
    light: 'bg-blue-50 border-blue-100',
    dark: 'bg-blue-950 border-blue-900',
    icon: 'text-blue-600 dark:text-blue-400',
    label: 'text-blue-900 dark:text-blue-100',
  },
  green: {
    light: 'bg-green-50 border-green-100',
    dark: 'bg-green-950 border-green-900',
    icon: 'text-green-600 dark:text-green-400',
    label: 'text-green-900 dark:text-green-100',
  },
  purple: {
    light: 'bg-purple-50 border-purple-100',
    dark: 'bg-purple-950 border-purple-900',
    icon: 'text-purple-600 dark:text-purple-400',
    label: 'text-purple-900 dark:text-purple-100',
  },
  orange: {
    light: 'bg-orange-50 border-orange-100',
    dark: 'bg-orange-950 border-orange-900',
    icon: 'text-orange-600 dark:text-orange-400',
    label: 'text-orange-900 dark:text-orange-100',
  },
}

export function MetricCard({
  icon,
  label,
  value,
  subtext,
  trend,
  color,
}: MetricCardProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const colors = colorMap[color]

  return (
    <motion.div
      className={`rounded-xl border p-5 ${
        isDark ? colors.dark : colors.light
      } transition-all hover:shadow-md`}
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {label}
          </p>
          <motion.p
            className="mt-2 text-3xl font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {value}
          </motion.p>
          {subtext && (
            <p className={`mt-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              {subtext}
            </p>
          )}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors.icon}`}>
          {icon}
        </div>
      </div>
      {trend !== undefined && (
        <div className="mt-3 flex items-center gap-1">
          <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
          <span className="text-sm font-semibold text-green-600 dark:text-green-400">
            +{trend}% this month
          </span>
        </div>
      )}
    </motion.div>
  )
}

export function AnalyticsGrid({ metrics }: { metrics: MetricCardProps[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {metrics.map((metric, idx) => (
        <MetricCard key={idx} {...metric} />
      ))}
    </div>
  )
}
