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
    Target,
    Heart,
    Verified,
    AtSignIcon,
    HeartCrackIcon
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts'
import { Roboto, Teachers } from 'next/font/google'
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

const isDark = typeof window !== 'undefined' && document.documentElement.classList.contains('dark')

// Mock Data for Charts
const jobAppsData = [
    { name: 'Shortlisted', value: 5, color: '#228af6' },
    { name: 'Under Review', value: 4, color: '#2bce6b' },
    { name: 'Applied', value: 2, color: '#11bdb3' },
    { name: 'Interviews', value: 1, color: '#1d8349' }
]

const engagementData = [
    { name: 'May', views: 10, des: 60 },
    { name: 'Jun', views: 25, des: 65 },
    { name: 'Jul', views: 20, des: 70 },
    { name: 'Aug', views: 40, des: 72 },
    { name: 'Sep', views: 35, des: 75 },
    { name: 'Oct', views: 50, des: 78 },
]

const analyticsBarData = [
    { name: 'IT Services', value: 40 },
    { name: 'Startups', value: 30 },
    { name: 'Product-Based', value: 30 }
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
                    className="w-full flex flex-col rounded-[16px] p-2.5 gap-2.5 bg-[#f9f9f9] dark:bg-none dark:bg-[#1A2C58] min-h-[92px]"
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
                    backgroundColor="#deefff"
                    darkBackgroundColor="#0B1739"
                    iconBgColor="bg-emerald-500/100"
                    iconColor="text-white"
                />


                <StatCard
                    icon={Trophy}
                    label="Mentorship Vivas"
                    value="4"
                    secondaryText="total mentorship vivas"
                    backgroundColor="#f8f0ff"
                    darkBackgroundColor="#0B1739"
                    iconBgColor="bg-blue-500/100"
                    iconColor="text-white"
                />

                <StatCard
                    icon={Verified}
                    label="Verified Projects"
                    value="42"
                    secondaryText="Projects verified by mentors and employers"
                    backgroundColor="#fff0f7"
                    darkBackgroundColor="#0B1739"
                    iconBgColor="bg-purple-500/100"
                    iconColor="text-white"
                />


                <StatCard
                    icon={Eye}
                    label="ATS Score"
                    value="42"
                    secondaryText="Your resume is optimized for 3 out of 5 job descriptions"
                    backgroundColor="#fffce3"
                    darkBackgroundColor="#0B1739"
                    iconBgColor="bg-yellow-500/100"
                    iconColor="text-white"
                />


            </div>

            {/* Middle Section: Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">

                {/* Donut Chart */}
                <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="lg:col-span-5 rounded-[20px] p-6 shadow-md bg-[#f9f9f9]
                dark:bg-none dark:bg-[#0B1739] dark:border dark:border-white/10"
                >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-400">
                        Application Pipeline
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-white mt-1">
                        Total: 12 Apps
                    </p>
                    </div>

                    <span className="text-xs font-semibold bg-yellow-200 text-gray-700 dark:bg-yellow-400/20 dark:text-yellow-300 px-3 py-1 rounded-full">
                    Updated today
                    </span>
                </div>

                {/* Content */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    
                    {/* Donut */}
                    <div className="relative w-[220px] h-[220px] sm:w-[260px] sm:h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                        <Pie
                            data={[
                            { name: "Shortlisted", value: 5, color: "#3B82F6" },
                            { name: "Under Review", value: 4, color: "#22C55E" },
                            { name: "Applied", value: 2, color: "#14B8A6" },
                            { name: "Interviews", value: 1, color: "#065F46" },
                            ]}
                            dataKey="value"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={2}
                            stroke="none"
                            labelLine={false}

                            // ✅ CUSTOM LABEL (INSIDE + WHITE)
                            label={({
                            cx = 0,
                            cy = 0,
                            midAngle = 0,
                            innerRadius = 0,
                            outerRadius = 0,
                            value = 0,
                            }) => {
                            const RADIAN = Math.PI / 180;
                            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;

                            const x = cx + radius * Math.cos(-midAngle * RADIAN);
                            const y = cy + radius * Math.sin(-midAngle * RADIAN);

                            return (
                                <text
                                x={x}
                                y={y}
                                fill="white"
                                textAnchor="middle"
                                dominantBaseline="central"
                                fontSize={14}
                                fontWeight="bold"
                                >
                                {value}
                                </text>
                            );
                            }}
                        >
                            {[
                            "#3B82F6",
                            "#22C55E",
                            "#14B8A6",
                            "#065F46",
                            ].map((color, i) => (
                            <Cell key={i} fill={color} />
                            ))}
                        </Pie>
                        </PieChart>
                    </ResponsiveContainer>

                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xs text-gray-400 tracking-widest">
                        TOTAL
                        </span>
                        <span className="text-3xl font-bold text-gray-800 dark:text-white">
                        12
                        </span>
                    </div>
                    </div>

                    {/* Right Stats */}
                    <div className="flex flex-col gap-3 w-full md:w-[200px]">
                    {[
                        { label: "Shortlisted", value: 5, color: "bg-blue-500" },
                        { label: "Under Review", value: 4, color: "bg-green-500" },
                        { label: "Applied", value: 2, color: "bg-teal-400" },
                        { label: "Interviews", value: 1, color: "bg-green-900" },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full ${item.color}`} />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                            {item.label}
                            </span>
                        </div>

                        <span className="text-sm font-semibold text-gray-800 dark:text-white">
                            ({item.value})
                        </span>
                        </div>
                    ))}
                    </div>
                </div>
                </motion.div>

                {/* Line Graph (Right) */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-7 rounded-xl p-6 border border-gray-200 
                bg-[f8f0ff]
                dark:bg-none dark:bg-[#0B1739] dark:border dark:border-white/10 shadow-sm flex flex-col">
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
                                <CartesianGrid 
                                    strokeDasharray="3 3" 
                                    vertical={false} 
                                    stroke={typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? "#1F2A44" : "#E5E7EB"} 
                                    opacity={0.4} 
                                />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 12, fill: '#6B7280' }} 
                                    dy={10} 
                                />
                                <YAxis 
                                    yAxisId="left" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 12, fill: '#6B7280' }} 
                                />
                                <YAxis 
                                    yAxisId="right" 
                                    orientation="right" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 12, fill: '#6B7280' }} 
                                    domain={[0, 100]} 
                                />
                                <RechartsTooltip
                                    contentStyle={{
                                        borderRadius: '8px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        backgroundColor: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? '#0B1739' : '#fff',
                                        color: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? '#fff' : '#000',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                    }}
                                    />
                                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ paddingBottom: '20px' }} />
                                {/* <Line yAxisId="left" type="monotone" dataKey="views" name="Profile Views" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                <Line yAxisId="right" type="monotone" dataKey="des" name="DES Score" stroke="#10B981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} /> */}
                                <Line 
                                yAxisId="left" 
                                type="monotone" 
                                dataKey="views" 
                                name="Profile Views" 
                                stroke="#f2ac4d" 
                                strokeWidth={3} 
                                dot={{ r: 4, strokeWidth: 2 }} 
                                activeDot={{ r: 6 }} 
                                />

                                <Line 
                                yAxisId="right" 
                                type="monotone" 
                                dataKey="des" 
                                name="DES Score" 
                                stroke="#fc6bb0" 
                                strokeWidth={3} 
                                dot={{ r: 4, strokeWidth: 2 }} 
                                activeDot={{ r: 6 }} 
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Viewer Demographics (Left) */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="lg:col-span-7 bg-[#f9f9f9] dark:bg-none dark:bg-[#0B1739] p-6 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm flex flex-col">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                        <div>
                            <h3 className="text-[20px] font-bold text-gray-900 dark:text-white mb-1">Who is Viewing Your Profile</h3>
                            <p className="text-[14px] text-gray-500 dark:text-gray-400 font-medium">Top Viewer Demographics Based on Market Demand.</p>
                        </div>
                        <div className="mt-4 sm:mt-0 flex p-1 bg-gray-50 dark:bg-[#1A2C58] rounded-lg border border-gray-100 dark:border-white/5">
                            <button className="px-4 py-1.5 text-[14px] font-bold bg-[#1B6CFB] text-white rounded-md shadow-sm">Industry</button>
                            <button className="px-4 py-1.5 text-[14px] font-medium text-black-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">Role</button>
                            <button className="px-4 py-1.5 text-[14px] font-medium text-black-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">Location</button>
                        </div>
                    </div>

                    <div className="flex-1 min-h-[280px] w-full pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analyticsBarData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.6} />
                                {/* <XAxis 
                                    dataKey="name" 
                                    axisLine={{ stroke: '#9CA3AF' }} 
                                    tickLine={{ stroke: '#9CA3AF' }} 
                                    tick={{ fontSize: 11, fill: '#6B7280' }} 
                                    dy={10} 
                                />
                                <YAxis 
                                    axisLine={{ stroke: '#9CA3AF' }} 
                                    tickLine={{ stroke: '#9CA3AF' }} 
                                    tick={{ fontSize: 12, fill: '#6B7280' }} 
                                    ticks={[0, 25, 50, 75, 100]}
                                    domain={[0, 100]}
                                /> */}
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 12, fill: isDark ? '#9CA3AF' : '#6B7280' }} 
                                    dy={10} 
                                />

                                <YAxis 
                                    yAxisId="left" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 12, fill: isDark ? '#9CA3AF' : '#6B7280' }} 
                                />
                                <RechartsTooltip 
                                    cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: '#fff', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar 
                                    dataKey="value" 
                                    fill="#1B6CFB" 
                                    radius={[4, 4, 0, 0]} 
                                    barSize={50}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* List/Feed (Right) */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="lg:col-span-5 bg-[#f9f9f9] rounded-xl p-6 border border-gray-200 dark:bg-none dark:bg-[#0B1739] order-white/10 shadow-sm relative overflow-hidden">
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
                        <div className="flex flex-col gap-4 rounded-xl border border-[#DCE5F8] bg-[#F7F8FF] p-5 text-gray-900 shadow-2xl dark:border-white/10 dark:bg-[#0B1739] dark:text-white">
                            <div className="flex items-start justify-between">
                                <div className="rounded-lg bg-[#7C3AED] p-2 text-white">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <button onClick={() => setShowToast(false)} className="text-gray-400 hover:text-gray-700 dark:hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg leading-tight">Setup your profile</h4>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Please complete your profile to unlock all features and start applying.</p>
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
