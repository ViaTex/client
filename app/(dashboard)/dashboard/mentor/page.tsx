"use client"

import { useAuth } from '@/hooks/useAuth'
import { motion } from 'framer-motion'
import {
    Activity,
    BookOpen,
    Users,
    TrendingUp,
    UserCheck,
    MessageSquare
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const STATS = [
    { label: 'Mentees', value: '8', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Sessions', value: '24', icon: MessageSquare, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { label: 'Courses', value: '3', icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    { label: 'Impact Score', value: '+92%', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' }
]

export default function MentorDashboard() {
    const { user } = useAuth()

    return (
        <div className="space-y-8">
            {/* Greeting Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-lg shadow">
                        {user?.email?.charAt(0)?.toUpperCase() || 'M'}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Welcome back, Mentor!
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Here&apos;s your mentoring overview
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {STATS.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 flex items-center gap-4"
                        >
                            <div className={`w-12 h-12 rounded-lg ${stat.bg} flex items-center justify-center`}>
                                <Icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6"
            >
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Quick Actions
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Button variant="outline" className="justify-start gap-2">
                        <UserCheck className="w-4 h-4" />
                        View Mentees
                    </Button>
                    <Button variant="outline" className="justify-start gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Schedule Session
                    </Button>
                    <Button variant="outline" className="justify-start gap-2">
                        <BookOpen className="w-4 h-4" />
                        Browse Courses
                    </Button>
                </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6"
            >
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Recent Activity
                </h2>
                <div className="space-y-4">
                    {[
                        { text: 'New mentee request received', time: '2 hours ago', icon: Users },
                        { text: 'Session completed with mentee', time: '1 day ago', icon: MessageSquare },
                        { text: 'Profile updated', time: '3 days ago', icon: Activity },
                    ].map((activity, i) => {
                        const Icon = activity.icon
                        return (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    <Icon className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.text}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </motion.div>
        </div>
    )
}
