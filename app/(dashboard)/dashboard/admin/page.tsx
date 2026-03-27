"use client"

import { useAuth } from '@/hooks/useAuth'
import { motion } from 'framer-motion'
import {
    Activity,
    Users,
    Building,
    TrendingUp,
    ShieldCheck,
    AlertCircle,
    FileText,
    Briefcase
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const STATS = [
    { label: 'Total Users', value: '12,450', icon: Users, color: 'text-rose-600', bg: 'bg-rose-100 dark:bg-rose-900/30' },
    { label: 'Registered Colleges', value: '184', icon: Building, color: 'text-pink-600', bg: 'bg-pink-100 dark:bg-pink-900/30' },
    { label: 'Active Corporates', value: '256', icon: Briefcase, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
    { label: 'System Health', value: '99.9%', icon: Activity, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' }
]

export default function AdminDashboard() {
    const { user } = useAuth()

    return (
        <div className="space-y-8">
            {/* Greeting Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#7C3AED] to-[#A855F7] rounded-xl p-6 md:p-8 text-white shadow-xl"
            >
                <div>
                    <h1 className="text-3xl font-bold mb-2">
                        System Overview, {user?.name?.split(' ')[0] || 'Admin'} 🛡️
                    </h1>
                    <p className="text-purple-100 max-w-xl">
                        Monitor platform health, verify new institutional accounts, and oversee global analytics for the DishaSetu ecosystem.
                    </p>
                </div>
                <div className="shrink-0 flex gap-3 mt-4 md:mt-0">
                    <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white" onClick={() => window.location.href = '/dashboard/admin/users'}>
                        Manage Users
                    </Button>
                    <Button className="bg-white text-[#7C3AED] hover:bg-purple-50">
                        View Logs
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
                            className="bg-white dark:bg-[#0B1739] rounded-xl p-6 border border-gray-200 dark:border-white/10 shadow-[0_4px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow"
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
                {/* Pending Verifications */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-2 bg-white dark:bg-[#0B1739] rounded-xl border border-gray-200 dark:border-white/10 shadow-[0_4px_8px_rgba(0,0,0,0.04)] overflow-hidden"
                >
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-[#7C3AED]" />
                            Pending Institutional Approvals
                        </h2>
                        <Button variant="ghost" size="sm" className="text-[#7C3AED] dark:text-purple-400">
                            See Queue
                        </Button>
                    </div>
                    <div className="p-0">
                        {/* Placeholder rows */}
                        {[
                            { name: "Global Engineering College", type: "College", status: "Awaiting Doc" },
                            { name: "Apex Data Systems", type: "Corporate", status: "Review Ready" },
                            { name: "Institute of Fine Arts", type: "College", status: "Review Ready" }
                        ].map((org, i) => (
                            <div key={i} className={`p-6 flex items-center justify-between ${i !== 2 ? 'border-b border-gray-100 dark:border-gray-700' : ''}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0 font-bold ${org.type === 'College' ? 'bg-gradient-to-tr from-teal-500 to-emerald-400' : 'bg-gradient-to-tr from-indigo-500 to-purple-500'
                                        }`}>
                                        {org.type === 'College' ? '🏫' : '🏢'}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm md:text-base">{org.name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{org.type} Account</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold mb-1 ${org.status === 'Review Ready' ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                        }`}>
                                        {org.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* System Alerts */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white dark:bg-[#0B1739] rounded-xl border border-gray-200 dark:border-white/10 shadow-[0_4px_8px_rgba(0,0,0,0.04)] p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            System Alerts
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {[
                            { title: 'High Traffic Detected', desc: 'API rate limits approaching threshold for anonymous routes.', level: 'warning', action: 'Scale Now' },
                            { title: 'Database Backup', desc: 'Routine snapshot completed successfully at 03:00 AM UTC.', level: 'info', action: 'Verify' },
                            { title: 'Support Tickets', desc: '14 unresolved user bug reports older than 48 hours.', level: 'warning', action: 'Review' }
                        ].map((alert, i) => (
                            <div key={i} className={`p-4 rounded-xl border transition-colors group ${alert.level === 'warning' ? 'bg-orange-50/50 border-orange-100 dark:bg-orange-900/10 dark:border-orange-900/30 hover:border-orange-300' : 'bg-blue-50/50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/30 hover:border-blue-300'
                                }`}>
                                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{alert.title}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-3">{alert.desc}</p>
                                <Button size="sm" variant="outline" className={`w-full justify-between ${alert.level === 'warning' ? 'text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30 border-orange-200' : 'text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                                    }`}>
                                    {alert.action}
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
