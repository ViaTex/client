"use client"

import { motion, AnimatePresence } from 'framer-motion'
import {
    Star,
    BadgeCheck,
    Database,
    Paintbrush,
    Code,
    Zap,
    Wallet,
    Award,
    AlertCircle,
    X,
    ArrowRight,
    User,
    TrendingUp,
    Eye,
    Briefcase,
    FileText,
    Download,
    Video,
    Trophy,
    CheckCircle2,
    Clock,
    Search,
    Target
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts'
import { Roboto } from 'next/font/google'
import StatCard from '@/components/ui/statscard'

interface StudentProfile {
    id?: string
    name?: string
    email?: string
    education?: Array<{
        id?: string
        level?: string
        custom_level?: string
        institution?: string
        start_date?: string
        end_date?: string
        score?: string
        description?: string
    }>
    technical_skills?: string
    soft_skills?: string
    city?: string
    state?: string
    bio?: string
    current_des_score?: number
    badge?: string
}

type EducationEntry = {
    institution?: string
    level?: string
}

const robotoExtraBold = Roboto({ weight: '700', subsets: ['latin'] })

// Mock Data for Charts
const jobAppsData = [
  { name: 'Submitted / Under Review', value: 14, color: '#3B82F6' },
  { name: 'Shortlisted / Interview', value: 8, color: '#10B981' },
  { name: 'Offers Received', value: 2, color: '#8B5CF6' }
]

const engagementData = [
  { name: 'May', views: 10, des: 60 },
  { name: 'Jun', views: 25, des: 65 },
  { name: 'Jul', views: 20, des: 70 },
  { name: 'Aug', views: 40, des: 72 },
  { name: 'Sep', views: 35, des: 75 },
  { name: 'Oct', views: 50, des: 78 },
]


export default function StudentDashboard() {
    const router = useRouter()
    const { user } = useAuth()
    const [profile, setProfile] = useState<StudentProfile | null>(null)
    const [profileLoading, setProfileLoading] = useState(true)
    const [showToast, setShowToast] = useState(false)
    const [chartFilter, setChartFilter] = useState('Last 6 Months')

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setProfileLoading(true)
                const data = await apiClient.getStudentProfile()
                setProfile(data)
                const hasEducation = Array.isArray(data?.education)
                    && data.education.some((entry: EducationEntry) => entry?.institution && entry?.level)
                if (!hasEducation || !data?.technical_skills) {
                    setTimeout(() => setShowToast(true), 1500)
                }
            } catch {
                setTimeout(() => setShowToast(true), 1500)
            } finally {
                setProfileLoading(false)
            }
        }
        fetchProfile()
    }, [])

    const desScore = Math.max(0, Math.min(100, Number(profile?.current_des_score ?? 78))) // scaling to 100 for display
    const desScoreDisplay = desScore.toFixed(0)
    
    
    return (
        <div className="w-full font-sans text-gray-900 dark:text-gray-100 relative max-w-7xl mx-auto">
            
            {/* Header / Welcome Row */}
            <div className="sm:space-y-6 px-3 sm:px-4 md:px-6 pt-1 sm:pt-6 mb-6 lg:pt-1 lg:px-0">
                {/* Header - Figma: 16px radius, 10px padding; dark mode #1A2C58 */}
                <div
                    className="w-full flex flex-col rounded-[16px] p-2.5 gap-2.5 bg-white dark:bg-[#1A2C58] min-h-[92px]"
                    style={{
                        boxShadow: 'inset 0 1px 1.5px rgba(0,0,0,0.25), 0 1px 4px rgba(0,0,0,0.25)',
                    }}
                >
                    <h1
                        className={`${robotoExtraBold.className} tracking-[0%] text-[#0B2540] dark:text-white`}
                        style={{
                            fontSize: '36px',
                            lineHeight: '40px',
                        }}
                    >
                        Welcome Back, {profile?.name ? profile.name.split(' ')[0] : 'Student'}!
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg">
                        Track your progress and continue your placement journey
                    </p>
                </div>
            </div>
            
            {/* Top Highlight Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
                <StatCard
                    icon={TrendingUp}
                    label="Dishasetu Employability Score (DES)"
                    value={`${desScoreDisplay}/100`}
                    secondaryText="+5 points from last month"
                    backgroundColor="#FFFFFF"
                    darkBackgroundColor="#0B1739"
                    iconBgColor="bg-emerald-500/20"
                    iconColor="text-emerald-500"
                />


                <StatCard
                    icon={CheckCircle2}
                    label="Active Job Applications"
                    value="85"
                    secondaryText="Active Job Applications"
                    backgroundColor="#FFFFFF"
                    darkBackgroundColor="#0B1739"
                    iconBgColor="bg-blue-500/20"
                    iconColor="text-blue-500"
                />

                <StatCard
                    icon={Eye}
                    label="Verified Projects"
                    value="42"
                    secondaryText="Projects verified by mentors and employers"
                    backgroundColor="#FFFFFF"
                    darkBackgroundColor="#0B1739"
                    iconBgColor="bg-purple-500/20"
                    iconColor="text-purple-500"
                />


                <StatCard
                    icon={Eye}
                    label="ATS Score"
                    value="42"
                    secondaryText="Your resume is optimized for 3 out of 5 job descriptions"
                    backgroundColor="#FFFFFF"
                    darkBackgroundColor="#0B1739"
                    iconBgColor="bg-purple-500/20"
                    iconColor="text-purple-500"
                />

                
            </div>

            {/* Middle Section: Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
                
                {/* Donut Chart (Left) */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-5 bg-white rounded-xl p-6 border border-gray-200 dark:bg-[#0B1739] dark:border-white/10 shadow-sm flex flex-col">
                    <h3 className="text-lg font-bold mb-1">Job Applications Overview</h3>
                    <p className="text-sm text-gray-500 mb-6">Total Active Applications: 24</p>
                    
                    <div className="flex-1 min-h-[250px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={jobAppsData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={2}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {jobAppsData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                            <span className="text-4xl font-black text-gray-900 dark:text-white">24</span>
                        </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/10 text-center text-sm font-medium text-gray-600 dark:text-gray-300">
                        Application Success Rate: <span className="text-emerald-500 font-bold">15%</span>
                    </div>
                </motion.div>

                {/* Line Graph (Right) */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-7 bg-white rounded-xl p-6 border border-gray-200 dark:bg-[#0B1739] dark:border-white/10 shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-bold">Profile Engagement & Growth</h3>
                            <p className="text-sm text-gray-500 mt-1">Track your profile views and DES progression</p>
                        </div>
                        <select 
                            value={chartFilter}
                            onChange={(e) => setChartFilter(e.target.value)}
                            className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm rounded-lg px-3 py-2 outline-none"
                        >
                            <option>This Week</option>
                            <option>This Month</option>
                            <option>Last 6 Months</option>
                        </select>
                    </div>

                    <div className="flex-1 min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={engagementData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.5} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} domain={[0, 100]} />
                                <RechartsTooltip 
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: '#fff', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ paddingBottom: '20px' }} />
                                <Line yAxisId="left" type="monotone" dataKey="views" name="Profile Views" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                <Line yAxisId="right" type="monotone" dataKey="des" name="DES Score" stroke="#10B981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* 6-Box Grid (Left) */}
                <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-4">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="bg-white dark:bg-[#0B1739] p-5 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
                        <BadgeCheck className="w-6 h-6 text-blue-500 mb-3" />
                        <h4 className="text-3xl font-black mb-1">4</h4>
                        <p className="text-sm font-medium text-gray-500">Verified Skills</p>
                    </motion.div>
                    
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.55 }} className="bg-white dark:bg-[#0B1739] p-5 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
                        <Clock className="w-6 h-6 text-orange-500 mb-3" />
                        <h4 className="text-3xl font-black mb-1">1</h4>
                        <p className="text-sm font-medium text-gray-500">Pending Verifications</p>
                    </motion.div>
                    
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }} className="bg-white dark:bg-[#0B1739] p-5 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
                        <FileText className="w-6 h-6 text-[#7C3AED] mb-3" />
                        <h4 className="text-3xl font-black mb-1">92%</h4>
                        <p className="text-sm font-medium text-gray-500">Highest ATS Score</p>
                    </motion.div>
                    
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.65 }} className="bg-white dark:bg-[#0B1739] p-5 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
                        <Download className="w-6 h-6 text-emerald-500 mb-3" />
                        <h4 className="text-3xl font-black mb-1">18</h4>
                        <p className="text-sm font-medium text-gray-500">Resume Downloads</p>
                    </motion.div>
                    
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 }} className="bg-white dark:bg-[#0B1739] p-5 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
                        <Video className="w-6 h-6 text-rose-500 mb-3" />
                        <h4 className="text-3xl font-black mb-1">3</h4>
                        <p className="text-sm font-medium text-gray-500">Mentorship Vivas</p>
                    </motion.div>
                    
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.75 }} className="bg-white dark:bg-[#0B1739] p-5 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
                        <Trophy className="w-6 h-6 text-amber-500 mb-3" />
                        <h4 className="text-3xl font-black mb-1">Top 10%</h4>
                        <p className="text-sm font-medium text-gray-500">Institution Rank</p>
                    </motion.div>
                </div>

                {/* List/Feed (Right) */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="lg:col-span-5 bg-white rounded-xl p-6 border border-gray-200 dark:bg-[#0B1739] dark:border-white/10 shadow-sm relative overflow-hidden">
                    <h3 className="text-lg font-bold mb-6">Activity & Next Steps</h3>
                    
                    <div className="space-y-4">
                        {/* Feed Item 1: Actionable */}
                        <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 flex gap-4">
                            <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg h-10 w-10 flex-shrink-0 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <Video className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">Upcoming Viva: Advanced Java</p>
                                <p className="text-xs text-gray-500 mt-1">With Mentor Ananya • Today at 4:00 PM</p>
                                <Button size="sm" className="mt-2 h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3">Join Session</Button>
                            </div>
                        </div>

                        {/* Feed Item 2: Alert */}
                        <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 flex gap-4">
                            <div className="bg-rose-100 dark:bg-rose-900/50 p-2 rounded-lg h-10 w-10 flex-shrink-0 flex items-center justify-center text-rose-600 dark:text-rose-400">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">Optimize your Resume</p>
                                <p className="text-xs text-gray-500 mt-1">Your resume is missing keywords for 'MERN Stack' roles.</p>
                                <button className="mt-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline">Fix now &rarr;</button>
                            </div>
                        </div>

                        {/* Feed Item 3: Notification */}
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex gap-4">
                            <div className="bg-purple-100 dark:bg-[#7C3AED]/20 p-2 rounded-lg h-10 w-10 flex-shrink-0 flex items-center justify-center text-purple-600 dark:text-[#7C3AED]">
                                <Search className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-gray-900 dark:text-white">Search Appearance</p>
                                <p className="text-xs text-gray-500 mt-1">Your profile appeared in 5 employer searches today.</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
            
            {/* Profile Incomplete Toast/Badge */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 50 }}
                        className="fixed bottom-10 right-10 z-[100] max-w-sm w-full"
                    >
                        <div className="bg-[#080F26] dark:bg-[#0B1739] text-white p-5 rounded-xl shadow-2xl border border-white/10 flex flex-col gap-4">
                            <div className="flex items-start justify-between">
                                <div className="p-2 bg-[#7C3AED] rounded-lg text-white">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <button onClick={() => setShowToast(false)} className="text-gray-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg leading-tight">Setup your profile</h4>
                                <p className="text-gray-400 text-sm mt-1">Please complete your profile to unlock all features and start applying.</p>
                            </div>
                            <Link 
                                href="/dashboard/student/profile" 
                                className="bg-[#7C3AED] text-white py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[#6D28D9] transition-all text-sm"
                            >
                                Setup Now
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
