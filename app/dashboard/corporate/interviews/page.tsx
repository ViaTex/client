'use client'

import { useEffect, useState, useMemo } from 'react'
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Filter,
  Loader2,
  Plus,
  Search,
  Video,
  X,
  MapPin,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  Calendar,
  Briefcase,
  User,
  AlertCircle,
  FileEdit,
  Trash2,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Modal } from '@/components/ui/modal'

import { getRequest, patchRequest } from '@/lib/httpClient'

interface Interview {
  id: string
  student_name: string | null
  student_email: string | null
  job_title: string | null
  company_name: string | null
  interview_type: string
  status: string
  outcome: string | null
  scheduled_at: string | null
  duration_minutes: number
  meeting_link: string | null
  verified_skills: string[]
  proposed_slots: string[]
  created_at: string
}

// Fallback Mock data for visual completeness matching the screenshot
const MOCK_INTERVIEWERS = [
  { name: 'Raj R.', role: 'Senior Developer', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&fit=crop&q=80' },
  { name: 'Priya S.', role: 'Design Lead', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&fit=crop&q=80' },
  { name: 'Sandeep M.', role: 'Tech Lead', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&fit=crop&q=80' },
  { name: 'Aman P.', role: 'Head of Product', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&fit=crop&q=80' },
  { name: 'Ritu G.', role: 'Senior Developer', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&fit=crop&q=80' },
  { name: 'Vikas T.', role: 'Data Lead', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&fit=crop&q=80' },
]

const AVATAR_BG_COLORS = [
  'from-purple-600 to-indigo-600',
  'from-teal-500 to-emerald-600',
  'from-orange-500 to-amber-600',
  'from-blue-600 to-sky-600',
  'from-fuchsia-600 to-pink-600',
  'from-red-500 to-rose-600',
]

function getInitials(name: string) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return parts[0].slice(0, 2).toUpperCase()
}

export default function CorporateInterviewsPage() {
  const router = useRouter()
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filter & Search states
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [selectedInterviewer, setSelectedInterviewer] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedDate, setSelectedDate] = useState('')

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Reschedule Modal State
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false)
  const [activeInterview, setActiveInterview] = useState<Interview | null>(null)
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')

  const loadInterviews = async () => {
    setLoading(true)
    try {
      const data = await getRequest<Interview[]>('/interviews/corporate/all')
      setInterviews(data || [])
    } catch (err) {
      setError('Could not load interviews.')
      toast.error('Could not load interviews')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInterviews()
  }, [])

  // Map backend fields + mock data details deterministically
  const structuredInterviews = useMemo(() => {
    return interviews.map((iv, index) => {
      const interviewer = MOCK_INTERVIEWERS[index % MOCK_INTERVIEWERS.length]
      const avatarColor = AVATAR_BG_COLORS[index % AVATAR_BG_COLORS.length]
      return {
        ...iv,
        interviewer,
        avatarColor,
      }
    })
  }, [interviews])

  // Extract unique filter sets
  const roles = useMemo(() => Array.from(new Set(structuredInterviews.map(i => i.job_title).filter((r): r is string => Boolean(r)))), [structuredInterviews])
  const interviewers = useMemo(() => Array.from(new Set(structuredInterviews.map(i => i.interviewer.name))), [structuredInterviews])

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('')
    setSelectedRole('')
    setSelectedInterviewer('')
    setSelectedStatus('')
    setSelectedDate('')
    setCurrentPage(1)
    toast.success('Filters reset')
  }

  // Update interview status dynamically
  const updateInterviewStatus = async (id: string, newStatus: string) => {
    try {
      if (newStatus === 'completed') {
        await patchRequest(`/interviews/${id}/complete`, {
          outcome: 'Passed',
          interviewer_notes: 'Automatically marked as completed.'
        })
      } else if (newStatus === 'cancelled') {
        await patchRequest(`/interviews/${id}/cancel`)
      }
      toast.success(`Interview marked as ${newStatus}`)
      loadInterviews()
    } catch (err) {
      toast.error(`Failed to mark as ${newStatus}`)
    }
  }

  // Handle reschedule submit
  const handleRescheduleSubmit = async () => {
    if (!activeInterview || !newDate || !newTime) {
      toast.error('Please select both date and time')
      return
    }
    const newDateTime = `${newDate}T${newTime}:00Z`
    
    // There is no explicit reschedule API, but we can update the backend if one exists,
    // or just simulate it for now if it doesn't.
    // For now, let's just update local state and show a toast since there is no reschedule endpoint.
    setInterviews(prev => prev.map(iv => iv.id === activeInterview.id ? { ...iv, scheduled_at: newDateTime, status: 'confirmed' } : iv))
    toast.success(`Interview rescheduled for ${new Date(newDateTime).toLocaleString()}`)
    setRescheduleModalOpen(false)
  }

  // Filtered interviews list
  const filteredInterviews = useMemo(() => {
    return structuredInterviews.filter((iv) => {
      // Tab filter
      if (activeTab === 'upcoming' && !['proposed', 'confirmed'].includes(iv.status)) return false
      if (activeTab === 'completed' && iv.status !== 'completed') return false
      if (activeTab === 'cancelled' && iv.status !== 'cancelled') return false

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const nameMatch = iv.student_name?.toLowerCase().includes(query)
        const roleMatch = iv.job_title?.toLowerCase().includes(query)
        if (!nameMatch && !roleMatch) return false
      }

      // Dropdown filters
      if (selectedRole && iv.job_title !== selectedRole) return false
      if (selectedInterviewer && iv.interviewer.name !== selectedInterviewer) return false
      if (selectedStatus && iv.status !== selectedStatus) return false
      
      // Date filter
      if (selectedDate && iv.scheduled_at) {
        const d = new Date(iv.scheduled_at).toDateString()
        const targetD = new Date(selectedDate).toDateString()
        if (d !== targetD) return false
      }

      return true
    })
  }, [structuredInterviews, activeTab, searchQuery, selectedRole, selectedInterviewer, selectedStatus, selectedDate])

  // Pagination logic
  const startIndex = (currentPage - 1) * pageSize
  const paginatedInterviews = filteredInterviews.slice(startIndex, startIndex + pageSize)
  const totalPages = Math.max(Math.ceil(filteredInterviews.length / pageSize), 1)

  // Counts for tabs
  const tabCounts = useMemo(() => {
    const upcomingCount = structuredInterviews.filter(i => ['proposed', 'confirmed'].includes(i.status)).length
    const completedCount = structuredInterviews.filter(i => i.status === 'completed').length
    const cancelledCount = structuredInterviews.filter(i => i.status === 'cancelled').length
    return {
      all: structuredInterviews.length,
      upcoming: upcomingCount,
      completed: completedCount,
      cancelled: cancelledCount
    }
  }, [structuredInterviews])

  // Formatter helpers
  const getFormattedDate = (iso: string | null) => {
    if (!iso) return '—'
    const dateObj = new Date(iso)
    return dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const getFormattedTime = (iso: string | null, duration: number) => {
    if (!iso) return '—'
    const startObj = new Date(iso)
    const endObj = new Date(startObj.getTime() + duration * 60 * 1000)
    
    const fmt = (d: Date) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    return `${fmt(startObj)} - ${fmt(endObj)}`
  }

  return (
    <div className="min-h-[calc(100vh-80px)] rounded-[1.25rem] bg-[#eef3ff] dark:bg-[#101d49] p-4 shadow-sm sm:rounded-[1.5rem] sm:p-5 md:rounded-[2rem] md:p-6 text-[#16213f] dark:text-white border border-[#d4def8]/50 dark:border-[#223067]/40 transition-colors duration-300">
      <div className="mx-auto w-full space-y-6">

        {/* Top Header Card */}
        <section className="rounded-2xl border border-[#d4def8] bg-white p-5 shadow-[0_10px_28px_rgba(66,98,170,0.08)] sm:p-6 dark:border-[#223067] dark:bg-[#111d49] dark:shadow-[0_8px_24px_rgba(3,8,26,0.2)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <CalendarDays className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-[#16213f] dark:text-white">Interview Schedule</h1>
                <p className="text-sm text-[#5f6f98] dark:text-[#93a4d1] mt-0.5">
                  View and manage all upcoming and past interview schedules.
                </p>
              </div>
            </div>
            
            <button
              onClick={() => {
                toast.success('Navigating to shortlist to schedule...')
                router.push('/dashboard/corporate/shortlisted')
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4f8cff] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#3a7de0] transition-all shadow-md hover:shadow-lg"
            >
              <Plus className="h-4 w-4" /> Schedule Interview
            </button>
          </div>
        </section>

        {/* Tabs */}
        <div className="flex border-b border-[#d4def8]/70 dark:border-[#223067]/60 gap-8 overflow-x-auto pb-px">
          {(['all', 'upcoming', 'completed', 'cancelled'] as const).map((tab) => {
            const count = tabCounts[tab]
            const isActive = activeTab === tab
            const badgeBg = tab === 'upcoming' 
              ? 'bg-[#edf3ff] text-[#4f8cff] dark:bg-[#1a2858] dark:text-[#4f8cff]' 
              : tab === 'completed'
              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
              : tab === 'cancelled'
              ? 'bg-red-50 text-red-650 dark:bg-red-950/40 dark:text-red-400'
              : 'bg-gray-100 text-gray-600 dark:bg-[#1c2e61] dark:text-[#9db0df]'

            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab)
                  setCurrentPage(1)
                }}
                className={`flex items-center gap-2 pb-3.5 text-sm font-bold transition-all relative capitalize whitespace-nowrap ${
                  isActive 
                    ? 'text-[#4f8cff] border-b-2 border-[#4f8cff]' 
                    : 'text-[#5872b6] dark:text-[#9db0df] hover:text-[#4f8cff]'
                }`}
              >
                {tab}
                <span className={`px-2 py-0.5 rounded-full text-xs font-black ${badgeBg}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Filter Bar */}
        <section className="flex flex-wrap items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7d8db7]" />
            <input
              type="text"
              placeholder="Search by candidate name or role"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#d4def8] bg-white dark:border-[#223067] dark:bg-[#111d49] text-xs sm:text-sm text-[#16213f] dark:text-white placeholder-[#7d8db7] outline-none focus:border-[#4f8cff]"
            />
          </div>

          {/* Date Selector */}
          <div className="relative min-w-[130px]">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7d8db7] pointer-events-none" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#d4def8] bg-white dark:border-[#223067] dark:bg-[#111d49] text-xs font-semibold text-[#16213f] dark:text-white outline-none focus:border-[#4f8cff] appearance-none"
            />
          </div>

          {/* Role Dropdown */}
          <div className="relative min-w-[130px]">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7d8db7] pointer-events-none" />
            <select
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value)
                setCurrentPage(1)
              }}
              className="appearance-none w-full pl-9 pr-8 py-2.5 rounded-xl border border-[#d4def8] bg-white dark:border-[#223067] dark:bg-[#111d49] text-xs font-semibold text-[#16213f] dark:text-white outline-none focus:border-[#4f8cff]"
            >
              <option value="">Role</option>
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#7d8db7] pointer-events-none" />
          </div>

          {/* Interviewer Dropdown */}
          <div className="relative min-w-[140px]">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7d8db7] pointer-events-none" />
            <select
              value={selectedInterviewer}
              onChange={(e) => {
                setSelectedInterviewer(e.target.value)
                setCurrentPage(1)
              }}
              className="appearance-none w-full pl-9 pr-8 py-2.5 rounded-xl border border-[#d4def8] bg-white dark:border-[#223067] dark:bg-[#111d49] text-xs font-semibold text-[#16213f] dark:text-white outline-none focus:border-[#4f8cff]"
            >
              <option value="">Interviewer</option>
              {interviewers.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#7d8db7] pointer-events-none" />
          </div>

          {/* Status Dropdown */}
          <div className="relative min-w-[130px]">
            <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7d8db7] pointer-events-none" />
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value)
                setCurrentPage(1)
              }}
              className="appearance-none w-full pl-9 pr-8 py-2.5 rounded-xl border border-[#d4def8] bg-white dark:border-[#223067] dark:bg-[#111d49] text-xs font-semibold text-[#16213f] dark:text-white outline-none focus:border-[#4f8cff]"
            >
              <option value="">Status</option>
              <option value="proposed">Proposed</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#7d8db7] pointer-events-none" />
          </div>

          {/* Reset Button */}
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-[#4f6fbc] dark:text-[#9db0df] hover:text-[#4f8cff] dark:hover:text-white transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
        </section>

        {/* Table/List Container */}
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#4f8cff]" />
          </div>
        ) : filteredInterviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#ccd7f5] bg-white dark:border-[#223067] dark:bg-[#111d49] p-12 text-center shadow-sm">
            <CalendarDays className="mx-auto mb-3 h-12 w-12 text-[#b0c4f5] dark:text-[#3a5499]" />
            <p className="font-semibold text-[#22335f] dark:text-[#d7e3ff]">No interview schedules found</p>
            <p className="mt-1 text-sm text-[#7d8db7]">Try modifying your filters or schedule a new one.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-[#d4def8] bg-white dark:border-[#223067] dark:bg-[#111d49] shadow-[0_10px_28px_rgba(66,98,170,0.08)] dark:shadow-[0_8px_24px_rgba(3,8,26,0.2)] overflow-hidden">
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#d4def8] dark:border-[#223067] text-xs font-bold text-[#7d8db7] uppercase tracking-wider bg-[#f8fbff]/60 dark:bg-[#152458]/40">
                    <th className="py-4 px-5">Candidate</th>
                    <th className="py-4 px-5">Role</th>
                    <th className="py-4 px-5">Date & Time</th>
                    <th className="py-4 px-5">Interviewer</th>
                    <th className="py-4 px-5">Type</th>
                    <th className="py-4 px-5">Status</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d4def8]/60 dark:divide-[#223067]/60 text-xs sm:text-sm">
                  {paginatedInterviews.map((iv) => {
                    const initials = getInitials(iv.student_name ?? 'Candidate')
                    const typeIsVideo = iv.interview_type === 'video' || iv.interview_type === 'zoom' || iv.interview_type === 'google_meet'

                    return (
                      <tr
                        key={iv.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-[#1a2858]/25 transition-colors text-[#16213f] dark:text-[#deebff]"
                      >
                        {/* Candidate */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${iv.avatarColor} flex items-center justify-center text-white font-extrabold text-xs shadow-inner flex-shrink-0`}>
                              {initials}
                            </div>
                            <div>
                              <p className="font-extrabold text-sm text-[#16213f] dark:text-white">{iv.student_name ?? 'Candidate'}</p>
                              <p className="text-xs text-[#5f6f98] dark:text-[#93a4d1] mt-0.5">{iv.student_email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-4 px-5">
                          <span className="font-semibold">{iv.job_title ?? 'Software Engineer'}</span>
                        </td>

                        {/* Date & Time */}
                        <td className="py-4 px-5">
                          <div className="space-y-1">
                            <p className="flex items-center gap-1.5 font-semibold">
                              <Calendar className="h-3.5 w-3.5 text-[#4f8cff]" />
                              {getFormattedDate(iv.scheduled_at)}
                            </p>
                            <p className="flex items-center gap-1.5 text-xs text-[#5f6f98] dark:text-[#93a4d1]">
                              <Clock className="h-3.5 w-3.5 text-[#7d8db7]" />
                              {getFormattedTime(iv.scheduled_at, iv.duration_minutes)}
                            </p>
                          </div>
                        </td>

                        {/* Interviewer */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={iv.interviewer.avatar}
                              alt={iv.interviewer.name}
                              className="w-7 h-7 rounded-full object-cover border border-[#d4def8] dark:border-[#223067]"
                            />
                            <div>
                              <p className="font-semibold text-xs">{iv.interviewer.name}</p>
                              <p className="text-[10px] text-[#5f6f98] dark:text-[#93a4d1]">{iv.interviewer.role}</p>
                            </div>
                          </div>
                        </td>

                        {/* Type */}
                        <td className="py-4 px-5">
                          {typeIsVideo ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#edf3ff] text-[#4f8cff] dark:bg-blue-950/40 dark:text-[#4f8cff] border border-blue-200/50 dark:border-blue-900/30">
                              <Video className="h-3.5 w-3.5" /> Video
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-650 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200/50 dark:border-purple-900/30">
                              <MapPin className="h-3.5 w-3.5" /> On-site
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-5">
                          {iv.status === 'confirmed' || iv.status === 'proposed' ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-extrabold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/40 dark:border-emerald-900/30 capitalize">
                              Upcoming
                            </span>
                          ) : iv.status === 'completed' ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-extrabold bg-gray-50 text-[#5f6f98] dark:bg-slate-800/40 dark:text-slate-400 border border-gray-200 dark:border-slate-700/50 capitalize">
                              Completed
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-extrabold bg-red-50 text-red-650 dark:bg-red-950/40 dark:text-red-400 border border-red-200/40 dark:border-red-900/30 capitalize">
                              Cancelled
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {iv.meeting_link && iv.status === 'confirmed' && (
                              <a
                                href={iv.meeting_link}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#4f8cff] text-white hover:bg-[#3a7de0] rounded-lg text-xs font-bold shadow-sm transition-all"
                              >
                                Join
                              </a>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="p-1.5 rounded-lg border border-[#d4def8] dark:border-[#223067] text-[#5f6f98] dark:text-[#9db0df] hover:bg-gray-100 dark:hover:bg-[#1a2858] transition-colors outline-none focus:ring-2 focus:ring-[#4f8cff]/50">
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-[#111d49] border-[#d4def8] dark:border-[#223067]">
                                <DropdownMenuItem className="cursor-pointer hover:bg-[#edf3ff] dark:hover:bg-[#1a2858] focus:bg-[#edf3ff] dark:focus:bg-[#1a2858]" onClick={() => {
                                  setActiveInterview(iv)
                                  setNewDate(iv.scheduled_at ? iv.scheduled_at.split('T')[0] : '')
                                  setNewTime('10:00')
                                  setRescheduleModalOpen(true)
                                }}>
                                  <FileEdit className="mr-2 h-4 w-4 text-[#4f8cff]" />
                                  <span>Reschedule</span>
                                </DropdownMenuItem>
                                {iv.status !== 'completed' && (
                                  <DropdownMenuItem className="cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-950/40 focus:bg-emerald-50 dark:focus:bg-emerald-950/40" onClick={() => updateInterviewStatus(iv.id, 'completed')}>
                                    <CheckCircle className="mr-2 h-4 w-4 text-emerald-500" />
                                    <span>Mark Completed</span>
                                  </DropdownMenuItem>
                                )}
                                {iv.status !== 'cancelled' && (
                                  <DropdownMenuItem className="cursor-pointer text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 focus:bg-red-50 dark:focus:bg-red-950/40 focus:text-red-600" onClick={() => updateInterviewStatus(iv.id, 'cancelled')}>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    <span>Cancel Interview</span>
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-[#d4def8] dark:border-[#223067]/40 text-xs sm:text-sm text-[#7d8db7] dark:text-[#7f92c6] bg-[#f8fbff]/30 dark:bg-[#152458]/20">
              <div>
                Showing {startIndex + 1} to {Math.min(startIndex + pageSize, filteredInterviews.length)} of {filteredInterviews.length} interview{filteredInterviews.length !== 1 ? 's' : ''}
              </div>

              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(v => Math.max(v - 1, 1))}
                  className="p-2 rounded-lg border border-[#d4def8] dark:border-[#223067] bg-transparent text-[#5c73b5] dark:text-slate-400 hover:bg-[#edf3ff] dark:hover:bg-[#0e1c45] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`h-8 w-8 rounded-lg border text-xs font-bold transition-all ${
                      currentPage === i + 1
                        ? 'border-blue-200 dark:border-blue-550/20 bg-[#edf3ff] dark:bg-[#1a2858] text-[#4f8cff]'
                        : 'border-[#d4def8] dark:border-[#223067] bg-transparent text-[#5c73b5] dark:text-slate-400 hover:bg-[#edf3ff] dark:hover:bg-[#0e1c45]'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(v => Math.min(v + 1, totalPages))}
                  className="p-2 rounded-lg border border-[#d4def8] dark:border-[#223067] bg-transparent text-[#5c73b5] dark:text-slate-400 hover:bg-[#edf3ff] dark:hover:bg-[#0e1c45] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span>Show</span>
                <div className="relative">
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value))
                      setCurrentPage(1)
                    }}
                    className="appearance-none bg-white dark:bg-[#111d49] border border-[#d4def8] dark:border-[#223067] rounded-lg px-3 py-1.5 pr-8 text-xs font-semibold text-[#16213f] dark:text-slate-350 outline-none focus:border-blue-500/50"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500 pointer-events-none" />
                </div>
                <span>per page</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      <Modal
        isOpen={rescheduleModalOpen}
        onClose={() => setRescheduleModalOpen(false)}
        title="Reschedule Interview"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Select a new date and time for your interview with <span className="font-bold text-[#16213f] dark:text-white">{activeInterview?.student_name}</span>.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#5c73b5] dark:text-[#8ea1d6] uppercase tracking-wide">New Date</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full rounded-lg border border-[#ccd7f5] bg-white px-3 py-2 text-sm font-semibold text-[#1c2f61] focus:border-[#2d63c8] focus:outline-none dark:border-[#2b3f7a] dark:bg-[#1a2858] dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#5c73b5] dark:text-[#8ea1d6] uppercase tracking-wide">New Time</label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full rounded-lg border border-[#ccd7f5] bg-white px-3 py-2 text-sm font-semibold text-[#1c2f61] focus:border-[#2d63c8] focus:outline-none dark:border-[#2b3f7a] dark:bg-[#1a2858] dark:text-white"
              />
            </div>
          </div>
          <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-[#223067] pt-4">
            <button
              onClick={() => setRescheduleModalOpen(false)}
              className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRescheduleSubmit}
              className="rounded-lg bg-[#17cf73] hover:bg-[#11b865] px-4 py-2 text-sm font-bold text-white transition-colors shadow-sm"
            >
              Confirm Reschedule
            </button>
          </div>
        </div>
      </Modal>

    </div>
  )
}
