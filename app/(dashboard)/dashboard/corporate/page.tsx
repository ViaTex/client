"use client"

import { useAuth } from '@/hooks/useAuth'
import { motion } from 'framer-motion'
import {
    Activity,
    Briefcase,
    Building,
    TrendingUp,
    Users,
    FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const STATS = [
    { label: 'Active Jobs', value: '8', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Total Applicants', value: '243', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { label: 'Interviews Scheduled', value: '14', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    { label: 'Hire Rate', value: '4.2%', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' }
]

export default function CorporateDashboard() {
    const { user } = useAuth()

    return (
        <div className="space-y-8">
            {/* Greeting Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 md:p-8 text-white shadow-xl"
            >
                <div>
                    <h1 className="text-3xl font-bold mb-2">
                        Welcome to {user?.name?.split(' ')[0] || 'Corporate'} HQ 🏢
                    </h1>
                    <p className="text-indigo-100 max-w-xl">
                        Manage your job postings, review incoming applications, and discover top campus talent to accelerate your growth.
                    </p>
                </div>
                <div className="shrink-0 flex gap-3 mt-4 md:mt-0">
                    <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white" onClick={() => window.location.href = '/dashboard/corporate/profile'}>
                        Company Profile
                    </Button>
                    <Button className="bg-white text-indigo-600 hover:bg-indigo-50">
                        Post a Job
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
                {/* Recent Candidates */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-2 bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden"
                >
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Activity className="w-5 h-5 text-indigo-500" />
                            Recent Applicants
                        </h2>
                        <Button variant="ghost" size="sm" className="text-indigo-600 dark:text-indigo-400">
                            View All
                        </Button>
                    </div>
                    <div className="p-0">
                        {/* Placeholder rows */}
                        {[
                            { name: "Rahul Sharma", role: "Frontend Developer", status: "Under Review" },
                            { name: "Priya Desai", role: "Data Scientist", status: "Interviewed" },
                            { name: "Amit Kumar", role: "Backend Engineer", status: "Offer Sent" }
                        ].map((candidate, i) => (
                            <div key={i} className={`p-6 flex items-center justify-between ${i !== 2 ? 'border-b border-gray-100 dark:border-gray-700' : ''}`}>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shrink-0 font-bold">
                                        {candidate.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm md:text-base">{candidate.name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Applied for: {candidate.role}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium mb-1 ${candidate.status === 'Offer Sent' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                            candidate.status === 'Interviewed' ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                                'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                        }`}>
                                        {candidate.status}
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
                            <Building className="w-5 h-5 text-purple-500" />
                            Quick Actions
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {[
                            { title: 'Screen Applicants', desc: '12 new applications require your review for the React role.', action: 'Review' },
                            { title: 'Update Company Bio', desc: 'Make your employer branding stand out to attract top talent.', action: 'Update' },
                            { title: 'Upcoming Drive', desc: 'Configure settings for your planned campus recruitment drive.', action: 'Manage' }
                        ].map((task, i) => (
                            <div key={i} className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors group">
                                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{task.title}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-3">{task.desc}</p>
                                <Button size="sm" variant="outline" className="w-full justify-between group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
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
