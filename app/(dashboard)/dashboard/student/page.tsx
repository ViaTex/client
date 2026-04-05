"use client"

import { motion } from 'framer-motion'
import {
    Lock,
    Pencil,
    Check,
    Star,
    BadgeCheck,
    ChevronRight,
    Database,
    Paintbrush,
    Code,
    Zap,
    Wallet,
    Award,
    AlertCircle,
    X,
    ArrowRight,
    User
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import Link from 'next/link'
import { AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

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


export default function StudentDashboard() {
    const router = useRouter()
    const { user } = useAuth()
    const [profile, setProfile] = useState<StudentProfile | null>(null)
    const [profileLoading, setProfileLoading] = useState(true)
    const [showToast, setShowToast] = useState(false)

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
                // Backend unreachable or profile not found — skip nudge; profile page will handle its own errors
                setTimeout(() => setShowToast(true), 1500)
            } finally {
                setProfileLoading(false)
            }
        }
        fetchProfile()
    }, [])

    const desScore = Math.max(0, Math.min(10, Number(profile?.current_des_score ?? 0)))
    const desScoreDisplay = desScore.toFixed(2)
    const scoreStroke = `${Math.round((desScore / 10) * 282)} 282`
    const locationLabel = [profile?.city, profile?.state].filter(Boolean).join(', ')
    const coreSkills = [
        ...(profile?.technical_skills ? profile.technical_skills.split(',').map((s) => s.trim()).filter(Boolean) : []),
        ...(profile?.soft_skills ? profile.soft_skills.split(',').map((s) => s.trim()).filter(Boolean) : []),
    ].slice(0, 3)
    const studentId = profile?.id || user?.id || ''

    return (
        <div className="w-full font-sans text-gray-900 dark:text-gray-100 relative">

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-white rounded-xl border border-gray-200 dark:bg-[#0B1739] dark:border-white/10 p-6 shadow-[0_4px_8px_rgba(0,0,0,0.04)]"
            >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-extrabold tracking-tight">Smart Talent Evaluator</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Complete the new Skill Verification exam to unlock your verified profile.
                        </p>
                    </div>
                    <Button
                        className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg"
                        onClick={() => router.push('/dashboard/skill-verification/exam/section-a')}
                    >
                        Start Skill Verification
                    </Button>
                </div>
            </motion.div>
            
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
            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

                {/* Left Column (3 Columns Wide) */}
                <div className="xl:col-span-3 flex flex-col gap-6">
                    {/* Profile Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl p-6 shadow-[0_4px_8px_rgba(0,0,0,0.04)] border border-gray-200 dark:bg-[#0B1739] dark:border-white/10"
                    >
                        <div className="flex flex-col items-center text-center">
                            {/* Avatar placeholder (no photo URL in profile yet) */}
                            <div className="w-24 h-24 rounded-full bg-[#7C3AED]/10 flex items-center justify-center mb-4 ring-4 ring-[#7C3AED]/10">
                                <User className="w-12 h-12 text-[#7C3AED]" />
                            </div>
                            {profileLoading ? (
                                <>
                                    <div className="h-6 w-36 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-2" />
                                    <div className="h-4 w-24 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse mb-3" />
                                </>
                            ) : (
                                <>
                                    <h3 className="text-xl font-bold">{profile?.name || 'Not available'}</h3>
                                    <p className="text-sm text-gray-500 font-medium mb-1">{profile?.email || 'Not available'}</p>
                                    {profile?.id && (
                                        <p className="text-xs text-gray-400 font-mono mb-3">ID: DS-{profile.id.slice(-6).toUpperCase()}</p>
                                    )}
                                    {Array.isArray(profile?.education) && profile.education.length > 0 && (
                                        <p className="text-xs text-gray-500 mb-3">
                                            {(() => {
                                                const primary = profile.education[0]
                                                const levelLabel = primary?.level === 'Other'
                                                    ? primary?.custom_level || 'Other'
                                                    : primary?.level
                                                return [levelLabel, primary?.institution].filter(Boolean).join(' · ')
                                            })()}
                                        </p>
                                    )}
                                </>
                            )}
                            <div className="flex items-center gap-2 px-3 py-1 bg-[#7C3AED]/10 text-[#7C3AED] rounded-full text-xs font-bold uppercase tracking-wider">
                                <Award className="w-4 h-4" />
                                {profile?.badge || 'No Badge Yet'}
                            </div>
                        </div>
                    </motion.div>

                    {/* Earnings Potli */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="bg-white rounded-xl p-6 shadow-[0_4px_8px_rgba(0,0,0,0.04)] border border-gray-200 dark:bg-[#0B1739] dark:border-white/10"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase tracking-tight">Earnings Potli</p>
                            <Wallet className="w-5 h-5 text-[#7C3AED]" />
                        </div>
                        {locationLabel ? (
                            <p className="text-2xl font-bold mb-1">{locationLabel}</p>
                        ) : (
                            <p className="text-sm text-gray-500 mb-1">Location not available</p>
                        )}
                        {coreSkills.length > 0 ? (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {coreSkills.map((skill, idx) => (
                                    <span key={`${skill}-${idx}`} className="text-xs font-semibold px-2 py-1 rounded-full bg-[#7C3AED]/10 text-[#7C3AED]">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No skills available</p>
                        )}
                    </motion.div>

                    {/* Skill Badhao */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="bg-white rounded-xl p-6 shadow-[0_4px_8px_rgba(0,0,0,0.04)] border border-gray-200 dark:bg-[#0B1739] dark:border-white/10"
                    >
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-[#7C3AED]" />
                            Skill Badhao
                        </h3>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3 group cursor-pointer">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                                    <Code className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold group-hover:text-[#7C3AED] transition-colors">Frontend Dev</p>
                                    <p className="text-xs text-gray-500">2 weeks • Micro</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-300" />
                            </div>
                            <div className="flex items-center gap-3 group cursor-pointer border-t border-gray-100 dark:border-gray-800 pt-4">
                                <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600">
                                    <Paintbrush className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold group-hover:text-[#7C3AED] transition-colors">UI Design Kit</p>
                                    <p className="text-xs text-gray-500">3 weeks • Micro</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-300" />
                            </div>
                            <div className="flex items-center gap-3 group cursor-pointer border-t border-gray-100 dark:border-gray-800 pt-4">
                                <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600">
                                    <Database className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold group-hover:text-[#7C3AED] transition-colors">SQL Basics</p>
                                    <p className="text-xs text-gray-500">1 week • Micro</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-300" />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Center Column (6 Columns Wide) */}
                <div className="xl:col-span-6 flex flex-col gap-6">
                    {/* DES Score Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="bg-white rounded-xl p-8 shadow-[0_4px_8px_rgba(0,0,0,0.04)] border border-gray-200 dark:bg-[#0B1739] dark:border-white/10 relative overflow-hidden"
                    >
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="relative w-48 h-48">
                                <svg className="w-48 h-48 -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" fill="none" r="45" stroke="#E5E7EB" strokeWidth="8" strokeLinecap="round" className="dark:stroke-white/10"></circle>
                                    <circle cx="50" cy="50" fill="none" r="45" stroke="#7C3AED" strokeWidth="8" strokeDasharray={scoreStroke} strokeLinecap="round"></circle>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <p className="text-4xl font-black text-[#7C3AED]">{desScoreDisplay}</p>
                                    <p className="text-xs font-bold text-gray-400 uppercase">of 10.00</p>
                                </div>
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                    <h2 className="text-2xl font-bold">DES Score</h2>
                                    {profile?.badge && (
                                        <span className="bg-[#7C3AED]/20 text-[#7C3AED] text-[10px] font-bold px-2 py-0.5 rounded uppercase">{profile.badge}</span>
                                    )}
                                </div>
                                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                                    {profile?.bio || 'Profile bio not available.'}
                                </p>
                                <div className="flex justify-center md:justify-start">
                                    <Button
                                        type="button"
                                        size="xl"
                                        onClick={() => router.push('/dashboard/skill-verification/exam/section-a')}
                                        className="rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold flex items-center gap-2"
                                    >
                                        <Star className="w-4 h-4" />
                                        <Star className="w-4 h-4" />
                                        Score sudhare
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Score Insights */}
                        <div className="grid grid-cols-2 gap-4 mt-8 border-t border-gray-100 dark:border-gray-800 pt-6">
                            <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5">
                                <div className="flex items-center gap-2 text-[#7C3AED] mb-1">
                                    <BadgeCheck className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase">Badge</span>
                                </div>
                                <p className="text-sm font-semibold">{profile?.badge || 'Not assigned'}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5">
                                <div className="flex items-center gap-2 text-[#7C3AED] mb-1">
                                    <Star className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase">Core Skill</span>
                                </div>
                                <p className="text-sm font-semibold">{coreSkills[0] || 'Not available'}</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Recent Activity */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="bg-white rounded-xl p-8 shadow-[0_4px_8px_rgba(0,0,0,0.04)] border border-gray-200 dark:bg-[#0B1739] dark:border-white/10"
                    >
                        <h3 className="text-lg font-bold mb-6">Recent Activity</h3>
                        <div className="space-y-8 relative before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100 dark:before:bg-gray-800">
                            <div className="relative pl-10">
                                <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-white dark:bg-[#0B1739] border-4 border-[#7C3AED]"></div>
                                <p className="text-sm font-bold">Earned &quot;Responsive King&quot; Badge</p>
                                <p className="text-xs text-gray-500">2 hours ago • Module: Advanced CSS</p>
                            </div>
                            <div className="relative pl-10">
                                <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-white dark:bg-[#0B1739] border-4 border-gray-200 dark:border-white/20"></div>
                                <p className="text-sm font-bold">Applied to &apos;Stark Industries&apos; Intern</p>
                                <p className="text-xs text-gray-500">Yesterday • 4:30 PM</p>
                            </div>
                            <div className="relative pl-10">
                                <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-white dark:bg-[#0B1739] border-4 border-gray-200 dark:border-white/20"></div>
                                <p className="text-sm font-bold">Completed &apos;JS Algorithms&apos; Course</p>
                                <p className="text-xs text-gray-500">3 days ago • Skill Verified</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column (3 Columns Wide) */}
                <div className="xl:col-span-3 flex flex-col gap-6">
                    {/* Learning Roadmap */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="bg-white rounded-xl p-6 shadow-[0_4px_8px_rgba(0,0,0,0.04)] border border-gray-200 dark:bg-[#0B1739] dark:border-white/10"
                    >
                        <h3 className="text-lg font-bold mb-6">Learning Roadmap</h3>
                        <div className="flex flex-col gap-1">
                            {/* Step 1 */}
                            <div className="flex gap-4 pb-8 border-l-2 border-[#7C3AED] ml-3 relative">
                                <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-[#7C3AED] flex items-center justify-center">
                                    <Check className="w-3 h-3 text-white font-bold" />
                                </div>
                                <div className="pl-4 -mt-1">
                                    <p className="text-sm font-bold">Skill Verified</p>
                                    <p className="text-xs text-[#7C3AED] font-medium">Completed</p>
                                </div>
                            </div>
                            {/* Step 2 */}
                            <div className="flex gap-4 pb-8 border-l-2 border-[#7C3AED]/30 ml-3 relative">
                                <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-[#7C3AED] flex items-center justify-center">
                                    <Pencil className="w-3 h-3 text-white" />
                                </div>
                                <div className="pl-4 -mt-1">
                                    <p className="text-sm font-bold">Project Done</p>
                                    <p className="text-xs text-[#7C3AED] font-medium">In Progress</p>
                                </div>
                            </div>
                            {/* Step 3 */}
                            <div className="flex gap-4 ml-3 relative">
                                <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                    <Lock className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                                </div>
                                <div className="pl-4 -mt-1">
                                    <p className="text-sm font-bold text-gray-400">Platinum Badge</p>
                                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Locked</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Notifications */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        className="bg-white rounded-xl p-6 shadow-[0_4px_8px_rgba(0,0,0,0.04)] border border-gray-200 dark:bg-[#0B1739] dark:border-white/10"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold uppercase text-gray-400">Notifications</h3>
                            <span className="text-[10px] font-bold text-[#7C3AED] bg-[#7C3AED]/10 px-2 py-0.5 rounded-full">3 New</span>
                        </div>
                        <div className="space-y-4">
                            <div className="p-3 rounded-xl bg-[#7C3AED]/5 border border-[#7C3AED]/10">
                                <p className="text-xs font-bold leading-tight">Your application for Stark Industries was viewed.</p>
                                <p className="text-[10px] text-gray-400 mt-1">10m ago</p>
                            </div>
                            <div className="p-3 rounded-2xl bg-gray-50 dark:bg-white/5">
                                <p className="text-xs font-medium leading-tight text-gray-600 dark:text-gray-300">New micro-internship: Video Editing for Social Media.</p>
                                <p className="text-[10px] text-gray-400 mt-1">1h ago</p>
                            </div>
                            <div className="p-3 rounded-2xl bg-gray-50 dark:bg-white/5">
                                <p className="text-xs font-medium leading-tight text-gray-600 dark:text-gray-300">Community: 5 people liked your recent project post.</p>
                                <p className="text-[10px] text-gray-400 mt-1">4h ago</p>
                            </div>
                        </div>
                        <button className="w-full mt-4 text-xs font-bold text-gray-400 hover:text-[#7C3AED] transition-colors">
                            View All Notifications
                        </button>
                    </motion.div>
                </div>

            </div>
        </div>
    )
}
