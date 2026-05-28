"use client"

import { useAuth } from '@/hooks/useAuth'
import { motion } from 'framer-motion'
import {
    Activity,
    BookOpen,
    GraduationCap,
    TrendingUp,
    Users,
    FileSpreadsheet
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const STATS = [
    { label: 'Enrolled Students', value: '4,520', icon: Users, color: 'text-teal-600', bg: 'bg-teal-100 dark:bg-teal-900/30' },
    { label: 'Active Placements', value: '18', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { label: 'Corporate Partners', value: '34', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Placement Rate', value: '86%', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' }
]

export default function CollegeDashboard() {
    const { user } = useAuth()

    return (
        <div className="space-y-8">
            {/* Greeting Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-6 md:p-8 text-white shadow-xl"
            >
                <div>
                    <h1 className="text-3xl font-bold mb-2">
                        Dashboard for {user?.name?.split(' ')[0] || 'College'} 🏫
                    </h1>
                    <p className="text-teal-100 max-w-xl">
                        Monitor student progression, orchestrate recruitment drives, and cultivate successful placements effortlessly.
                    </p>
                </div>
                <div className="shrink-0 flex gap-3 mt-4 md:mt-0">
                    <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white" onClick={() => window.location.href = '/dashboard/college/students'}>
                        Manage Roster
                    </Button>
                    <Button className="bg-white text-teal-700 hover:bg-teal-50">
                        View Analytics
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
                {/* Recent Placements */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-2 bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden"
                >
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Activity className="w-5 h-5 text-teal-500" />
                            Recent Offers
                        </h2>
                        <Button variant="ghost" size="sm" className="text-teal-600 dark:text-teal-400">
                            See Campus Record
                        </Button>
                    </div>
                    <div className="p-0">
                        {/* Placeholder rows */}
                        {[
                            { name: "Rahul Sharma", company: "TechCorp Solutions Inc.", position: "Software Engineer", salary: "12 LPA" },
                            { name: "Priya Desai", company: "Financial Systems App", position: "Data Analyst", salary: "8 LPA" },
                            { name: "Amit Kumar", company: "Innovate Hardware", position: "Systems Architect", salary: "18 LPA" }
                        ].map((student, i) => (
                            <div key={i} className={`p-6 flex items-center justify-between ${i !== 2 ? 'border-b border-gray-100 dark:border-gray-700' : ''}`}>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white shrink-0 font-bold">
                                        {student.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm md:text-base">{student.name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{student.company} • {student.position}</p>
                                    </div>
                                </div>
                                <div className="text-right hidden sm:block">
                                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 mb-1">
                                        {student.salary}
                                    </span>
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
                            <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                            Administrative Tasks
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {[
                            { title: 'Upload Marksheets', desc: 'The 6th-semester results need to be bulk uploaded.', action: 'Upload' },
                            { title: 'Approve Profiles', desc: '14 new student profiles are waiting for verification.', action: 'Verify' },
                            { title: 'New Job Drive', desc: 'Configure notifications for the upcoming hiring event.', action: 'Configure' }
                        ].map((task, i) => (
                            <div key={i} className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-teal-200 dark:hover:border-teal-800 transition-colors group">
                                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{task.title}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-3">{task.desc}</p>
                                <Button size="sm" variant="outline" className="w-full justify-between group-hover:bg-teal-50 dark:group-hover:bg-teal-900/20 group-hover:text-teal-600 dark:group-hover:text-teal-400">
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
