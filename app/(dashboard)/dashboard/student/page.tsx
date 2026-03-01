"use client"

import { useAuth } from '@/hooks/useAuth'
import { motion } from 'framer-motion'
import {
    Activity,
    BookOpen,
    Briefcase,
    GraduationCap,
    TrendingUp,
    Users
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const STATS = [
    { label: 'Applications', value: '12', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Courses Active', value: '4', icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { label: 'Profile Views', value: '89', icon: Users, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    { label: 'Skill Growth', value: '+14%', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' }
]

export default function StudentDashboard() {
    const { user } = useAuth()

    return (
        <div className="space-y-8">
            {/* Greeting Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 md:p-8 text-white shadow-xl"
            >
                <div>
                    <h1 className="text-3xl font-bold mb-2">
                        Welcome back, {user?.email?.split('@')[0] || 'Student'}! 👋
                    </h1>
                    <p className="text-blue-100 max-w-xl">
                        Track your applications, update your profile, and discover new opportunities to accelerate your career journey.
                    </p>
                </div>
                <div className="shrink-0 flex gap-3 mt-4 md:mt-0">
                    <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white" onClick={() => window.location.href = '/dashboard/student/profile'}>
                        Edit Profile
                    </Button>
                    <Button className="bg-white text-blue-600 hover:bg-blue-50">
                        Find Jobs
                    </Button>
                </div>
            </motion.div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {STATS.map((stat, i) => {
                    const Icon = stat.icon
                    return (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white dark:bg-gray-800/80 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {stat.value}
                                    </p>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        {stat.label}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-2 bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden"
                >
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Activity className="w-5 h-5 text-blue-500" />
                            Recent Applications
                        </h2>
                        <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400">
                            View All
                        </Button>
                    </div>
                    <div className="p-0">
                        {/* Placeholder rows */}
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className={`p-6 flex items-center justify-between ${i !== 2 ? 'border-b border-gray-100 dark:border-gray-700' : ''}`}>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
                                        🏢
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm md:text-base">Software Engineer Intern</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">TechCorp Solutions Inc.</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 mb-1">
                                        Under Review
                                    </span>
                                    <p className="text-xs text-gray-400">Applied 2d ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Next Steps / Suggested */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-purple-500" />
                            Next Steps
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {[
                            { title: 'Complete your Resume', desc: 'Add your skills and projects to unlock better matches.', action: 'Complete' },
                            { title: 'Take an Assessment', desc: 'Verify your technical skills to stand out to employers.', action: 'Start' },
                            { title: 'Update Preferences', desc: 'Tell us what roles and locations you prefer.', action: 'Update' }
                        ].map((task, i) => (
                            <div key={i} className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 transition-colors group">
                                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{task.title}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-3">{task.desc}</p>
                                <Button size="sm" variant="outline" className="w-full justify-between group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                    {task.action}
                                    &rarr;
                                </Button>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
