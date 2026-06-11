'use client'

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useTheme } from 'next-themes'

interface ChartProps {
  data: any[]
  title: string
}

export function DESGrowthChart({ data }: ChartProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const textColor = isDark ? '#E5E7EB' : '#111827'
  const gridColor = isDark ? '#243056' : '#E5E7EB'

  return (
    <div className={`rounded-2xl border p-6 ${
      isDark
        ? 'border-[#243056] bg-[#121C46]'
        : 'border-[#E5E7EB] bg-white'
    }`}>
      <h3 className={`mb-4 text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
        DES Score Growth
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis stroke={textColor} style={{ fontSize: '12px' }} />
          <YAxis stroke={textColor} style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#1a2646' : '#ffffff',
              border: `1px solid ${gridColor}`,
              color: textColor,
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#3b82f6"
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
            name="DES Score"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function SkillsDistributionChart({ data }: ChartProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const textColor = isDark ? '#E5E7EB' : '#111827'

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  return (
    <div className={`rounded-2xl border p-6 ${
      isDark
        ? 'border-[#243056] bg-[#121C46]'
        : 'border-[#E5E7EB] bg-white'
    }`}>
      <h3 className={`mb-4 text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Skills Verification Distribution
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#1a2646' : '#ffffff',
              border: `1px solid ${isDark ? '#243056' : '#E5E7EB'}`,
              color: textColor,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export function RecruiterAnalyticsChart({ data }: ChartProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const textColor = isDark ? '#E5E7EB' : '#111827'
  const gridColor = isDark ? '#243056' : '#E5E7EB'

  return (
    <div className={`rounded-2xl border p-6 ${
      isDark
        ? 'border-[#243056] bg-[#121C46]'
        : 'border-[#E5E7EB] bg-white'
    }`}>
      <h3 className={`mb-4 text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Recruiter Interest Analytics
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis stroke={textColor} style={{ fontSize: '12px' }} />
          <YAxis stroke={textColor} style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#1a2646' : '#ffffff',
              border: `1px solid ${gridColor}`,
              color: textColor,
            }}
          />
          <Legend />
          <Bar dataKey="views" fill="#3b82f6" name="Profile Views" />
          <Bar dataKey="searches" fill="#10b981" name="Search Matches" />
          <Bar dataKey="impressions" fill="#f59e0b" name="Impressions" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
