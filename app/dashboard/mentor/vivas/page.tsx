"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import {
  CalendarDays,
  Clock3,
  Video,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  HelpCircle,
  Clock,
  Compass,
  FileText,
  Bookmark,
  Calendar,
  AlertCircle
} from "lucide-react"
import { mentorService } from "@/services/mentor.service"
import type { SkillEvaluationItem } from "@/lib/types"
import { Modal } from "@/components/ui/modal"
import { toast } from "react-hot-toast"

interface VivaDisplayItem {
  id: string
  studentName: string
  studentEmail: string
  studentInitials: string
  avatarBg: string
  projectTitle: string
  projectTags: string[]
  vivaDate: string
  vivaTime: string
  duration: string
  vivaType: "Technical" | "General"
  status: "Today" | "Upcoming" | "Completed"
  meetingLink?: string
  realItem?: SkillEvaluationItem
}

export default function MentorVivasPage() {
  const [evaluations, setEvaluations] = useState<SkillEvaluationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"all" | "today" | "week" | "upcoming" | "completed">("all")
  const [search, setSearch] = useState("")
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)

  // Modal states
  const [selectedVivaId, setSelectedVivaId] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await mentorService.getEvaluations()
        setEvaluations(data || [])
      } catch {
        setEvaluations([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  // Mock viva slots matching the mockup image design exactly
  const mockVivas: VivaDisplayItem[] = useMemo(() => [
    {
      id: "mock-1",
      studentName: "Aryan Sharma",
      studentEmail: "aryan.sharma@example.com",
      studentInitials: "AS",
      avatarBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
      projectTitle: "AI Chatbot",
      projectTags: ["Python", "FastAPI", "MongoDB"],
      vivaDate: "May 31, 2025",
      vivaTime: "10:30 AM",
      duration: "45 min",
      vivaType: "Technical",
      status: "Today",
      meetingLink: "https://meet.google.com/abc-def-ghi"
    },
    {
      id: "mock-2",
      studentName: "Priya Patel",
      studentEmail: "priya.patel@example.com",
      studentInitials: "PP",
      avatarBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      projectTitle: "Smart Attendance System",
      projectTags: ["Python", "Django", "PostgreSQL"],
      vivaDate: "May 31, 2025",
      vivaTime: "12:00 PM",
      duration: "45 min",
      vivaType: "Technical",
      status: "Today",
      meetingLink: "https://meet.google.com/abc-def-ghi"
    },
    {
      id: "mock-3",
      studentName: "Aman Kumar",
      studentEmail: "aman.kumar@example.com",
      studentInitials: "AK",
      avatarBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      projectTitle: "E-commerce API",
      projectTags: ["Node.js", "Express", "MongoDB"],
      vivaDate: "May 31, 2025",
      vivaTime: "03:00 PM",
      duration: "45 min",
      vivaType: "Technical",
      status: "Today",
      meetingLink: "https://meet.google.com/abc-def-ghi"
    },
    {
      id: "mock-4",
      studentName: "Neha Singh",
      studentEmail: "neha.singh@example.com",
      studentInitials: "NS",
      avatarBg: "bg-sky-500/10 text-sky-400 border-sky-500/20",
      projectTitle: "Portfolio Website",
      projectTags: ["HTML", "CSS", "JavaScript", "React"],
      vivaDate: "Jun 01, 2025",
      vivaTime: "11:00 AM",
      duration: "45 min",
      vivaType: "Technical",
      status: "Upcoming",
      meetingLink: "https://meet.google.com/abc-def-ghi"
    },
    {
      id: "mock-5",
      studentName: "Rohit Das",
      studentEmail: "rohit.das@example.com",
      studentInitials: "RD",
      avatarBg: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      projectTitle: "Task Management App",
      projectTags: ["React Native", "Firebase"],
      vivaDate: "Jun 01, 2025",
      vivaTime: "01:30 PM",
      duration: "45 min",
      vivaType: "Technical",
      status: "Upcoming",
      meetingLink: "https://meet.google.com/abc-def-ghi"
    },
    {
      id: "mock-6",
      studentName: "Sneha Mehta",
      studentEmail: "sneha.mehta@example.com",
      studentInitials: "SM",
      avatarBg: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      projectTitle: "Data Analytics Dashboard",
      projectTags: ["Python", "Streamlit", "Plotly"],
      vivaDate: "Jun 02, 2025",
      vivaTime: "10:30 AM",
      duration: "45 min",
      vivaType: "Technical",
      status: "Upcoming",
      meetingLink: "https://meet.google.com/abc-def-ghi"
    },
    {
      id: "mock-7",
      studentName: "Vivek Gupta",
      studentEmail: "vivek.gupta@example.com",
      studentInitials: "VG",
      avatarBg: "bg-teal-500/10 text-teal-400 border-teal-500/20",
      projectTitle: "Blog Platform",
      projectTags: ["MERN Stack"],
      vivaDate: "Jun 02, 2025",
      vivaTime: "02:00 PM",
      duration: "45 min",
      vivaType: "General",
      status: "Upcoming",
      meetingLink: "https://meet.google.com/abc-def-ghi"
    },
    {
      id: "mock-8",
      studentName: "Kavya Bansal",
      studentEmail: "kavya.bansal@example.com",
      studentInitials: "KB",
      avatarBg: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      projectTitle: "ML Model Deployment",
      projectTags: ["Python", "Flask", "Docker"],
      vivaDate: "Jun 03, 2025",
      vivaTime: "11:30 AM",
      duration: "45 min",
      vivaType: "Technical",
      status: "Upcoming",
      meetingLink: "https://meet.google.com/abc-def-ghi"
    }
  ], [])

  const mockCompletedVivas: VivaDisplayItem[] = useMemo(() => [
    {
      id: "mock-c1",
      studentName: "Aryan Sharma",
      studentEmail: "aryan.sharma@example.com",
      studentInitials: "AS",
      avatarBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
      projectTitle: "AI Chatbot",
      projectTags: ["Python", "FastAPI"],
      vivaDate: "May 25, 2025",
      vivaTime: "10:30 AM",
      duration: "45 min",
      vivaType: "Technical",
      status: "Completed"
    },
    {
      id: "mock-c2",
      studentName: "Priya Patel",
      studentEmail: "priya.patel@example.com",
      studentInitials: "PP",
      avatarBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      projectTitle: "Smart Attendance System",
      projectTags: ["Python", "Django"],
      vivaDate: "May 24, 2025",
      vivaTime: "12:00 PM",
      duration: "45 min",
      vivaType: "Technical",
      status: "Completed"
    }
  ], [])

  // Map real database evaluations to display format
  const realVivas = useMemo(() => {
    return evaluations
      .filter((item) => item.confirmed_slot || item.status === "viva_scheduled" || item.status === "viva_completed" || item.status === "evaluated")
      .map((ev) => {
        const initials = (ev.student?.name || "Student")
          .split(" ")
          .map((p) => p[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)

        const colors = [
          "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
          "bg-amber-500/10 text-amber-400 border-amber-500/20",
          "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          "bg-sky-500/10 text-sky-400 border-sky-500/20",
          "bg-rose-500/10 text-rose-400 border-rose-500/20"
        ]
        const charCodeSum = (ev.student?.name || "S").split("").reduce((sum, c) => sum + c.charCodeAt(0), 0)
        const avatarBg = colors[charCodeSum % colors.length]

        const d = ev.confirmed_slot ? new Date(ev.confirmed_slot) : ev.created_at ? new Date(ev.created_at) : new Date()
        const formattedDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        const formattedTime = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })

        const isToday = d.toDateString() === new Date().toDateString()
        const isCompleted = ev.status === "evaluated" || ev.status === "viva_completed"

        return {
          id: ev.evaluation_id,
          studentName: ev.student?.name || "Student",
          studentEmail: ev.student?.email || "student@example.com",
          studentInitials: initials || "ST",
          avatarBg,
          projectTitle: ev.project?.title || "Untitled Project",
          projectTags: ev.project?.skill_domain ? [ev.project.skill_domain] : ["Tech"],
          vivaDate: formattedDate,
          vivaTime: formattedTime,
          duration: "45 min",
          vivaType: "Technical",
          status: isCompleted ? "Completed" : isToday ? "Today" : "Upcoming",
          meetingLink: ev.viva_meeting_link || undefined,
          realItem: ev
        } as VivaDisplayItem
      })
  }, [evaluations])

  // Combine real database records with mockup data
  const displaySource = useMemo(() => {
    if (loading) {
      return []
    }
    if (evaluations.length > 0) {
      return realVivas
    }
    return activeTab === "completed" ? mockCompletedVivas : mockVivas
  }, [loading, evaluations, realVivas, activeTab, mockVivas, mockCompletedVivas])

  // Stats computation
  const stats = useMemo(() => {
    if (loading) {
      return { today: 0, upcoming: 0, thisWeek: 0, total: 0, completed: 0 }
    }
    const hasReal = evaluations.length > 0

    const today = hasReal
      ? evaluations.filter(e => {
        const d = e.confirmed_slot ? new Date(e.confirmed_slot) : null
        return (e.status === "viva_scheduled" || e.status === "viva_completed" || e.status === "evaluated") && d && d.toDateString() === new Date().toDateString()
      }).length
      : 3

    const upcoming = hasReal
      ? evaluations.filter(e => e.status === "viva_scheduled").length
      : 7

    const thisWeek = hasReal
      ? evaluations.filter(e => e.status === "viva_scheduled").length
      : 10

    const total = hasReal
      ? evaluations.filter(e => e.status === "viva_scheduled" || e.status === "viva_completed" || e.status === "evaluated").length
      : 24

    const completed = hasReal
      ? evaluations.filter(e => e.status === "viva_completed" || e.status === "evaluated").length
      : 14

    return { today, upcoming, thisWeek, total, completed }
  }, [loading, evaluations])

  // Schedule Summary Calculation (Real vs Mock)
  const scheduleSummary = useMemo(() => {
    const hasReal = evaluations.length > 0
    if (!hasReal) {
      // Mock defaults when no real database records are active
      return [
        { label: "Technical Vivas", count: 16, percentage: 67, color: "bg-[#7b61ff]" },
        { label: "General Vivas", count: 8, percentage: 33, color: "bg-[#7b61ff]/60" },
        { label: "Completed", count: 14, percentage: 58, color: "bg-emerald-500" },
        { label: "Upcoming", count: 10, percentage: 42, color: "bg-amber-500" }
      ]
    }

    // Active evaluations are those displayed on the Scheduled Vivas page
    const activeEvals = evaluations.filter(
      (item) => item.confirmed_slot || item.status === "viva_scheduled" || item.status === "viva_completed" || item.status === "evaluated"
    )

    const totalCount = activeEvals.length
    if (totalCount === 0) {
      return [
        { label: "Technical Vivas", count: 0, percentage: 0, color: "bg-[#7b61ff]" },
        { label: "General Vivas", count: 0, percentage: 0, color: "bg-[#7b61ff]/60" },
        { label: "Completed", count: 0, percentage: 0, color: "bg-emerald-500" },
        { label: "Upcoming", count: 0, percentage: 0, color: "bg-amber-500" }
      ]
    }

    let technical = 0
    let general = 0
    let completed = 0
    let upcoming = 0

    activeEvals.forEach((ev) => {
      const domain = (ev.project?.skill_domain || "").toLowerCase()
      if (domain.includes("general") || domain.includes("soft skill") || domain.includes("communication")) {
        general++
      } else {
        technical++
      }

      if (ev.status === "evaluated" || ev.status === "viva_completed") {
        completed++
      } else {
        upcoming++
      }
    })

    const technicalPercent = Math.round((technical / totalCount) * 100) || 0
    const generalPercent = Math.round((general / totalCount) * 100) || 0
    const completedPercent = Math.round((completed / totalCount) * 100) || 0
    const upcomingPercent = Math.round((upcoming / totalCount) * 100) || 0

    return [
      { label: "Technical Vivas", count: technical, percentage: technicalPercent, color: "bg-[#7b61ff]" },
      { label: "General Vivas", count: general, percentage: generalPercent, color: "bg-[#7b61ff]/60" },
      { label: "Completed", count: completed, percentage: completedPercent, color: "bg-emerald-500" },
      { label: "Upcoming", count: upcoming, percentage: upcomingPercent, color: "bg-amber-500" }
    ]
  }, [evaluations])

  // Filter display source by search and tabs
  const filtered = useMemo(() => {
    return displaySource.filter((viva) => {
      // Tab filter
      if (activeTab === "today" && viva.status !== "Today") return false
      if (activeTab === "upcoming" && viva.status !== "Upcoming") return false
      if (activeTab === "completed" && viva.status !== "Completed") return false
      if (activeTab === "week" && viva.status === "Completed") return false

      // Search filter
      const searchLower = search.toLowerCase()
      return (
        viva.studentName.toLowerCase().includes(searchLower) ||
        viva.projectTitle.toLowerCase().includes(searchLower) ||
        viva.studentEmail.toLowerCase().includes(searchLower)
      )
    })
  }, [displaySource, activeTab, search])

  // Selected Item details for Info modal
  const selectedVivaDetails = useMemo(() => {
    if (!selectedVivaId) return null
    return displaySource.find((item) => item.id === selectedVivaId) || null
  }, [selectedVivaId, displaySource])

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 text-slate-900 dark:text-white">
      {/* Title Header Card */}
      <div className="rounded-[24px] border border-slate-200/60 bg-[#f8fafc] p-6 dark:border-white/5 dark:bg-[#0d1527] transition-all">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          Scheduled Vivas <span className="text-xl">🗓️</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-white/55 mt-1.5">
          View and manage your upcoming and completed viva sessions. ✨
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3.5 py-1 text-xs font-bold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
            📅 Calendar Slots
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
            🔗 Meeting Room
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3.5 py-1 text-xs font-bold text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
            🎓 Viva Scores
          </span>
        </div>
      </div>

      {/* 4 Stats Cards Row */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {/* Today's Vivas */}
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(46,60,120,0.03)] dark:border-[#1d293d] dark:bg-[#0d1527]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">Today's Vivas</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
              <CalendarDays className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black">{stats.today}</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">↑ May 31, 2025</span>
          </div>
        </div>

        {/* Upcoming */}
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(46,60,120,0.03)] dark:border-[#1d293d] dark:bg-[#0d1527]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">Upcoming</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black">{stats.upcoming}</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs">
            <span className="font-semibold text-blue-600 dark:text-blue-400">↑ Next 7 days</span>
          </div>
        </div>

        {/* This Week */}
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(46,60,120,0.03)] dark:border-[#1d293d] dark:bg-[#0d1527]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">This Week</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
              <Bookmark className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black">{stats.thisWeek}</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs">
            <span className="font-semibold text-amber-600 dark:text-amber-500">↑ May 27 - Jun 02</span>
          </div>
        </div>

        {/* Total Scheduled */}
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(46,60,120,0.03)] dark:border-[#1d293d] dark:bg-[#0d1527]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">Total Scheduled</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black">{stats.total}</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs">
            <span className="font-semibold text-purple-600 dark:text-purple-400">↑ This Month</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Table list on left + sidebar on right */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6 items-start w-full max-w-full overflow-hidden xl:overflow-visible">

        {/* Left: Table Container */}
        <div className="space-y-4 min-w-0">

          {/* Tabs Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Tab pills */}
            <div className="flex flex-row overflow-x-auto gap-1.5 pb-1.5 w-full sm:w-auto scrollbar-none shrink-0">
              {[
                { id: "all", label: "All Scheduled" },
                { id: "today", label: `Today (${stats.today})` },
                { id: "week", label: `This Week (${stats.thisWeek})` },
                { id: "upcoming", label: `Upcoming (${stats.upcoming})` },
                { id: "completed", label: `Completed (${stats.completed})` }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition-all border shrink-0 ${
                    activeTab === tab.id
                      ? "bg-[#7b61ff] text-white border-[#7b61ff] shadow-[0_4px_12px_rgba(123,97,255,0.25)]"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-[#0e1726] dark:text-slate-300 dark:border-white/10 dark:hover:bg-[#1a2436]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2 sm:ml-auto w-full sm:w-auto justify-between sm:justify-start">
              <div className="relative flex-1 sm:flex-initial">
                <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-6 text-xs font-bold text-slate-600 focus:outline-none dark:border-white/10 dark:bg-[#0e1726] dark:text-slate-300 appearance-none">
                  <option>May 31 - Jun 06, 2025</option>
                </select>
              </div>
              <button className="flex h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:bg-[#0e1726] dark:text-slate-300">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/35" />
            <input
              type="text"
              placeholder="Search students, projects or emails..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-[#7b61ff] focus:outline-none focus:ring-1 focus:ring-[#7b61ff] dark:border-white/10 dark:bg-[#0c1224] dark:text-white"
            />
          </div>

          {/* Table list */}
          <div className="rounded-[24px] border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-white/5 dark:bg-[#0c1224]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 uppercase tracking-wider text-slate-400 font-bold dark:bg-[#0e1526] dark:border-white/5">
                  <tr>
                    <th className="px-5 py-4 font-bold">Student</th>
                    <th className="px-5 py-4 font-bold">Project</th>
                    <th className="px-5 py-4 font-bold">Viva Date & Time</th>
                    <th className="px-5 py-4 font-bold">Duration</th>
                    <th className="px-5 py-4 font-bold">Type</th>
                    <th className="px-5 py-4 font-bold">Status</th>
                    <th className="px-5 py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-semibold">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-slate-400">Loading scheduled vivas...</td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-slate-400">No scheduled vivas found.</td>
                    </tr>
                  ) : (
                    filtered.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/55 dark:hover:bg-white/5 transition-colors">
                        {/* Student details */}
                        <td className="px-5 py-4 min-w-[180px]">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-9 w-9 items-center justify-center rounded-full border text-[11px] font-bold ${item.avatarBg}`}>
                              {item.studentInitials}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">{item.studentName}</p>
                              <p className="text-[10px] text-slate-400 dark:text-white/40 mt-0.5">{item.studentEmail}</p>
                            </div>
                          </div>
                        </td>

                        {/* Project tags */}
                        <td className="px-5 py-4 min-w-[200px]">
                          <p className="font-bold text-slate-900 dark:text-white mb-1.5">{item.projectTitle}</p>
                          <div className="flex flex-wrap gap-1">
                            {item.projectTags.map((t) => (
                              <span key={t} className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] text-slate-500 dark:bg-white/5 dark:text-slate-400">
                                {t}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Date and Time */}
                        <td className="px-5 py-4 min-w-[140px]">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-white/75">
                              <CalendarDays className="h-4 w-4 text-slate-400" />
                              <span>{item.vivaDate}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-white/75">
                              <Clock3 className="h-4 w-4 text-slate-400" />
                              <span>{item.vivaTime}</span>
                            </div>
                          </div>
                        </td>

                        {/* Duration */}
                        <td className="px-5 py-4 text-slate-600 dark:text-white/75">{item.duration}</td>

                        {/* Type badge */}
                        <td className="px-5 py-4">
                          <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${item.vivaType === "Technical"
                              ? "bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400"
                              : "bg-purple-500/10 text-purple-500 dark:bg-purple-500/20 dark:text-purple-400"
                            }`}>
                            {item.vivaType}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${item.status === "Today"
                              ? "bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400"
                              : item.status === "Upcoming"
                                ? "bg-amber-500/10 text-amber-500 dark:bg-amber-500/20 dark:text-amber-400"
                                : "bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400"
                            }`}>
                            {item.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {item.status === "Today" && item.meetingLink ? (
                              <a
                                href={item.meetingLink}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-[#7b61ff]/30 bg-[#7b61ff]/10 hover:bg-[#7b61ff]/20 px-3 py-1.5 text-[11px] font-bold text-[#7b61ff] dark:border-[#7b61ff]/30 dark:bg-[#7b61ff]/20 dark:text-[#a291ff] transition-colors"
                              >
                                <Video className="h-4 w-4" />
                                <span>Join</span>
                              </a>
                            ) : (
                              <button
                                onClick={() => setSelectedVivaId(item.id)}
                                className="rounded-lg border border-slate-200 bg-white hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 px-3 py-1.5 text-[11px] text-slate-700 dark:text-white transition-colors"
                              >
                                View Details
                              </button>
                            )}

                            <div className="relative">
                              <button
                                onClick={() => setActiveDropdownId(activeDropdownId === item.id ? null : item.id)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 dark:border-white/10 dark:text-white/45 transition-colors"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>

                              {activeDropdownId === item.id && (
                                <div className="absolute right-0 mt-1 z-[50] w-36 rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-white/10 dark:bg-[#0e1726]">
                                  <button
                                    onClick={() => { setSelectedVivaId(item.id); setActiveDropdownId(null); }}
                                    className="w-full text-left rounded-lg px-2.5 py-1.5 text-[10px] font-semibold hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300"
                                  >
                                    View Details
                                  </button>
                                  {item.meetingLink && (
                                    <a
                                      href={item.meetingLink}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="block w-full text-left rounded-lg px-2.5 py-1.5 text-[10px] font-semibold hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300"
                                    >
                                      Open meeting
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50 dark:bg-[#0e1526] dark:border-white/5 text-[11px] font-bold text-slate-500">
              <span>Showing 1 to {filtered.length} of {filtered.length} vivas</span>
              <div className="flex items-center gap-3">
                <span>Rows per page 10</span>
                <div className="flex items-center gap-1">
                  <button className="flex h-6 w-6 items-center justify-center rounded hover:bg-slate-200 dark:hover:bg-white/5">
                    <ChevronRight className="h-4 w-4 rotate-180 text-slate-400" />
                  </button>
                  <span className="flex h-6 w-6 items-center justify-center rounded border border-[#7b61ff]/40 bg-[#7b61ff]/10 text-[#7b61ff] dark:border-[#7b61ff]/30 dark:bg-[#7b61ff]/20">
                    1
                  </span>
                  <button className="flex h-6 w-6 items-center justify-center rounded hover:bg-slate-200 dark:hover:bg-white/5">
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </button>
                </div>
              </div>
            </div>

          </div>
          {/* end table card */}
        </div>
        {/* end left column */}

        {/* Right Sidebar */}
        <div className="flex flex-col gap-4">

          {/* Schedule Summary */}
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(46,60,120,0.02)] dark:border-[#1d293d] dark:bg-[#0c1224]">
            <span className="text-[11px] font-extrabold text-slate-900 dark:text-white block mb-3">Schedule Summary</span>
            <div className="flex flex-col gap-3">
              {scheduleSummary.map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-[10px] font-bold mb-1">
                    <span className="text-slate-600 dark:text-slate-300">{item.label}</span>
                    <span className="text-slate-900 dark:text-white">{item.count}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-white/5">
                    <div className={`h-1.5 rounded-full ${item.color}`} style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Tips */}
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(46,60,120,0.02)] dark:border-[#1d293d] dark:bg-[#0c1224]">
            <span className="text-[11px] font-extrabold text-slate-900 dark:text-white block mb-3">Quick Tips</span>
            <ul className="flex flex-col gap-2 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
              <li className="flex gap-2 items-start">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Join the session 5 minutes early</span>
              </li>
              <li className="flex gap-2 items-start">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Ensure stable internet connection</span>
              </li>
              <li className="flex gap-2 items-start">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Keep your microphone and camera ready</span>
              </li>
              <li className="flex gap-2 items-start">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Review project and code before the viva</span>
              </li>
            </ul>
          </div>

          {/* Need Help */}
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(46,60,120,0.02)] dark:border-[#1d293d] dark:bg-[#0c1224]">
            <span className="text-[11px] font-extrabold text-slate-900 dark:text-white block">Need Help?</span>
            <p className="text-[10px] text-slate-500 dark:text-white/40 mt-1 font-semibold">
              Facing issues with your scheduled viva?
            </p>
            <button className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#7b61ff] hover:opacity-90 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-[#7b61ff]/20 transition-all">
              <span>Contact Support</span>
              <AlertCircle className="h-4 w-4" />
            </button>
          </div>

        </div>
        {/* end right sidebar */}
      </div>
      {/* end main grid */}

      {/* Info Modal */}
      {selectedVivaId && selectedVivaDetails && (
        <Modal isOpen={true} onClose={() => setSelectedVivaId(null)} title="Scheduled Viva Details" maxWidth="md">
          <div className="space-y-4 text-xs text-slate-900 dark:text-white">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3 dark:border-white/5">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full border text-[11px] font-bold ${selectedVivaDetails.avatarBg}`}>
                {selectedVivaDetails.studentInitials}
              </div>
              <div>
                <p className="font-extrabold text-sm">{selectedVivaDetails.studentName}</p>
                <p className="text-xs text-slate-400">{selectedVivaDetails.studentEmail}</p>
              </div>
            </div>

            <div className="space-y-2.5">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Project Under Evaluation</span>
                <p className="font-bold mt-0.5 text-sm">{selectedVivaDetails.projectTitle}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Scheduled Time</span>
                  <p className="font-bold mt-0.5">{selectedVivaDetails.vivaDate} at {selectedVivaDetails.vivaTime}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Duration</span>
                  <p className="font-bold mt-0.5">{selectedVivaDetails.duration}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Viva Session Type</span>
                  <p className="font-bold mt-0.5">{selectedVivaDetails.vivaType}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Current Status</span>
                  <p className="font-bold mt-0.5 text-[#7b61ff]">{selectedVivaDetails.status}</p>
                </div>
              </div>

              {selectedVivaDetails.meetingLink && (
                <div className="bg-[#7b61ff]/5 rounded-xl p-3 border border-[#7b61ff]/15">
                  <span className="text-[10px] uppercase tracking-wider text-[#7b61ff] font-bold block">Meeting Address</span>
                  <a
                    href={selectedVivaDetails.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold mt-1 text-[#7b61ff] underline break-all block"
                  >
                    {selectedVivaDetails.meetingLink}
                  </a>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/5">
              <button
                type="button"
                onClick={() => setSelectedVivaId(null)}
                className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 dark:border-white/10 dark:bg-transparent dark:hover:bg-white/5 px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-white transition-all"
              >
                Close Details
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

