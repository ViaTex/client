"use client"

import { useEffect, useState, useMemo } from "react"
import {
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  CheckCircle2,
  Hourglass,
  Clock,
  Star,
  User,
  Video,
  FileText,
  Code2,
  Lightbulb,
  MoreVertical,
  CalendarDays,
  Brain,
  Network,
  HardDrive,
  Database,
  GitBranch,
  Terminal,
  Globe,
  Cpu,
  Info,
  ShieldCheck,
  BookOpen
} from "lucide-react"
import { SkillEvaluationItem } from "@/lib/types"
import { Modal } from "@/components/ui/modal"
import { toast } from "react-hot-toast"
import { getRequest, patchRequest } from "@/lib/httpClient"

interface EvaluationDisplayItem {
  id: string
  studentName: string
  studentMeta: string
  studentInitials: string
  avatarBg: string
  skillName: string
  skillLevel: "Beginner" | "Intermediate" | "Advanced"
  skillIcon: any
  dueDate: string
  dueTime: string
  status: "assigned" | "viva_scheduled" | "evaluated"
  totalScore?: number | null
  realItem?: SkillEvaluationItem
}

export default function MentorEvaluationsPage() {
  const [evaluations, setEvaluations] = useState<SkillEvaluationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [activeTab, setActiveTab] = useState<"pending" | "completed">("pending")
  const [search, setSearch] = useState("")
  const [skillFilter, setSkillFilter] = useState("All Skills")
  const [levelFilter, setLevelFilter] = useState("All Levels")
  const [sortBy, setSortBy] = useState("Due Date")

  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Modals state
  const [detailsId, setDetailsId] = useState<string | null>(null)
  const [schedulingId, setSchedulingId] = useState<string | null>(null)
  const [slots, setSlots] = useState<string[]>([""])
  const [meetingLink, setMeetingLink] = useState("")

  const [scoringId, setScoringId] = useState<string | null>(null)
  const [scores, setScores] = useState({ technical: 0, practical: 0, communication: 0, originality: 0 })
  const [feedback, setFeedback] = useState({ strengths: "", improvements: "", verdict: "good" })
  const [actionLoading, setActionLoading] = useState(false)

  // Dropdown menus
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(false)
    try {
      const data = await getRequest<SkillEvaluationItem[]>('/mentor/evaluations')
      setEvaluations(data || [])
    } catch (err) {
      setError(true)
      toast.error("Could not load assigned evaluations.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function getSkill(ev: SkillEvaluationItem) {
    return ev.project?.skill_domain || "Software Dev"
  }

  function getLevel(score?: number | null) {
    if (!score) return "Beginner"
    if (score >= 80) return "Advanced"
    if (score >= 60) return "Intermediate"
    return "Beginner"
  }

  // Fallback lists matching the mockup image design exactly
  const mockPendingItems: EvaluationDisplayItem[] = useMemo(() => [
    {
      id: "mock-1",
      studentName: "Aryan Sharma",
      studentMeta: "B.Tech CSE (Final Year)",
      studentInitials: "AS",
      avatarBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
      skillName: "Python Programming",
      skillLevel: "Advanced",
      skillIcon: Terminal,
      dueDate: "Due: May 31, 2025",
      dueTime: "11:59 PM",
      status: "assigned"
    },
    {
      id: "mock-2",
      studentName: "Priya Patel",
      studentMeta: "B.Tech IT (Final Year)",
      studentInitials: "PP",
      avatarBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      skillName: "Data Structures & Algorithms",
      skillLevel: "Intermediate",
      skillIcon: GitBranch,
      dueDate: "Due: May 31, 2025",
      dueTime: "11:59 PM",
      status: "assigned"
    },
    {
      id: "mock-3",
      studentName: "Aman Kumar",
      studentMeta: "B.Tech CSE (Pre-final Year)",
      studentInitials: "AK",
      avatarBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      skillName: "Database Management",
      skillLevel: "Intermediate",
      skillIcon: Database,
      dueDate: "Due: Jun 01, 2025",
      dueTime: "11:59 PM",
      status: "assigned"
    },
    {
      id: "mock-4",
      studentName: "Neha Singh",
      studentMeta: "B.Tech CSE (Final Year)",
      studentInitials: "NS",
      avatarBg: "bg-sky-500/10 text-sky-400 border-sky-500/20",
      skillName: "Web Development",
      skillLevel: "Advanced",
      skillIcon: Globe,
      dueDate: "Due: Jun 01, 2025",
      dueTime: "11:59 PM",
      status: "assigned"
    },
    {
      id: "mock-5",
      studentName: "Rohit Das",
      studentMeta: "B.Tech IT (Pre-final Year)",
      studentInitials: "RD",
      avatarBg: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      skillName: "System Design",
      skillLevel: "Advanced",
      skillIcon: Cpu,
      dueDate: "Due: Jun 02, 2025",
      dueTime: "11:59 PM",
      status: "assigned"
    },
    {
      id: "mock-6",
      studentName: "Sneha Mehta",
      studentMeta: "B.Tech CSE (Final Year)",
      studentInitials: "SM",
      avatarBg: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      skillName: "Machine Learning Basics",
      skillLevel: "Beginner",
      skillIcon: Brain,
      dueDate: "Due: Jun 02, 2025",
      dueTime: "11:59 PM",
      status: "assigned"
    },
    {
      id: "mock-7",
      studentName: "Vivek Gupta",
      studentMeta: "B.Tech IT (Final Year)",
      studentInitials: "VG",
      avatarBg: "bg-teal-500/10 text-teal-400 border-teal-500/20",
      skillName: "Operating Systems",
      skillLevel: "Intermediate",
      skillIcon: HardDrive,
      dueDate: "Due: Jun 03, 2025",
      dueTime: "11:59 PM",
      status: "assigned"
    },
    {
      id: "mock-8",
      studentName: "Kavya Bansal",
      studentMeta: "B.Tech CSE (Pre-final Year)",
      studentInitials: "KB",
      avatarBg: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      skillName: "Computer Networks",
      skillLevel: "Intermediate",
      skillIcon: Network,
      dueDate: "Due: Jun 03, 2025",
      dueTime: "11:59 PM",
      status: "assigned"
    }
  ], [])

  const mockCompletedItems: EvaluationDisplayItem[] = useMemo(() => [
    {
      id: "mock-c1",
      studentName: "Abhinav Kumar",
      studentMeta: "B.Tech CSE (Final Year)",
      studentInitials: "AK",
      avatarBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      skillName: "Machine Learning",
      skillLevel: "Advanced",
      skillIcon: Brain,
      dueDate: "Evaluated: Jun 05, 2026",
      dueTime: "88/100",
      status: "evaluated",
      totalScore: 88
    },
    {
      id: "mock-c2",
      studentName: "Shreya Ghoshal",
      studentMeta: "B.Tech IT (Final Year)",
      studentInitials: "SG",
      avatarBg: "bg-sky-500/10 text-sky-400 border-sky-500/20",
      skillName: "React Frameworks",
      skillLevel: "Intermediate",
      skillIcon: Globe,
      dueDate: "Evaluated: Jun 03, 2026",
      dueTime: "75/100",
      status: "evaluated",
      totalScore: 75
    }
  ], [])

  // Map real database items into display items format
  const realDisplayItems = useMemo(() => {
    return evaluations.map((ev) => {
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

      const domain = ev.project?.skill_domain || "Software Dev"
      let skillIcon = Code2
      if (domain.toLowerCase().includes("python")) skillIcon = Terminal
      else if (domain.toLowerCase().includes("database") || domain.toLowerCase().includes("sql")) skillIcon = Database
      else if (domain.toLowerCase().includes("web") || domain.toLowerCase().includes("html") || domain.toLowerCase().includes("react")) skillIcon = Globe
      else if (domain.toLowerCase().includes("network")) skillIcon = Network
      else if (domain.toLowerCase().includes("operating") || domain.toLowerCase().includes("os")) skillIcon = HardDrive
      else if (domain.toLowerCase().includes("design") || domain.toLowerCase().includes("system")) skillIcon = Cpu
      else if (domain.toLowerCase().includes("data structures") || domain.toLowerCase().includes("algorithm")) skillIcon = GitBranch
      else if (domain.toLowerCase().includes("machine") || domain.toLowerCase().includes("ml") || domain.toLowerCase().includes("ai")) skillIcon = Brain

      let skillLevel: "Beginner" | "Intermediate" | "Advanced" = "Beginner"
      if (ev.total_score && ev.total_score >= 80) skillLevel = "Advanced"
      else if (ev.total_score && ev.total_score >= 60) skillLevel = "Intermediate"
      else skillLevel = "Beginner"

      const isCompleted = ev.status === "evaluated"
      const d = ev.confirmed_slot ? new Date(ev.confirmed_slot) : ev.created_at ? new Date(ev.created_at) : new Date()
      const formattedDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      
      return {
        id: ev.evaluation_id,
        studentName: ev.student?.name || "Student Name",
        studentMeta: "B.Tech CSE (Final Year)",
        studentInitials: initials || "ST",
        avatarBg,
        skillName: domain,
        skillLevel,
        skillIcon,
        dueDate: isCompleted ? `Evaluated: ${formattedDate}` : `Due: ${formattedDate}`,
        dueTime: isCompleted ? `${ev.total_score || 0}/100` : "11:59 PM",
        status: ev.status as any,
        totalScore: ev.total_score,
        realItem: ev
      } as EvaluationDisplayItem
    })
  }, [evaluations])

  // Combine real database items with mockup fallbacks if no database items exist
  const displaySource = useMemo(() => {
    if (loading) {
      return []
    }
    if (evaluations.length > 0) {
      return realDisplayItems
    }
    return activeTab === "pending" ? mockPendingItems : mockCompletedItems
  }, [loading, evaluations, realDisplayItems, activeTab, mockPendingItems, mockCompletedItems])

  // Filter & Search Logic
  const filtered = useMemo(() => {
    return displaySource.filter((ev) => {
      // Tab filter
      if (activeTab === "pending" && ev.status === "evaluated") return false
      if (activeTab === "completed" && ev.status !== "evaluated") return false

      // Search filter
      const searchLower = search.toLowerCase()
      const searchMatch =
        ev.studentName.toLowerCase().includes(searchLower) ||
        ev.skillName.toLowerCase().includes(searchLower)
      if (!searchMatch) return false

      // Skill filter
      if (skillFilter !== "All Skills" && ev.skillName !== skillFilter) return false

      // Level filter
      if (levelFilter !== "All Levels" && ev.skillLevel !== levelFilter) return false

      return true
    })
  }, [displaySource, activeTab, search, skillFilter, levelFilter])

  // Pagination Logic
  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, search, skillFilter, levelFilter])

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage
    return filtered.slice(start, start + rowsPerPage)
  }, [filtered, currentPage, rowsPerPage])

  // Stats Logic
  const stats = useMemo(() => {
    if (loading) {
      return { total: 0, completed: 0, pending: 0, avg: "0.0" }
    }
    const hasReal = evaluations.length > 0
    const total = hasReal ? evaluations.length : 124
    const completed = hasReal ? evaluations.filter((item) => item.status === "evaluated").length : 98
    const pending = hasReal ? evaluations.filter((item) => item.status !== "evaluated").length : 8
    
    // Average score out of 5
    let avg = "4.6"
    if (hasReal) {
      const rated = evaluations.filter((item) => typeof item.student_rating_of_mentor === "number")
      if (rated.length) {
        avg = (rated.reduce((sum, item) => sum + (item.student_rating_of_mentor || 0), 0) / rated.length).toFixed(1)
      }
    }
    return { total, completed, pending, avg }
  }, [loading, evaluations])

  // Skill Options list
  const skillOptions = useMemo(() => {
    const set = new Set<string>()
    displaySource.forEach((item) => set.add(item.skillName))
    return Array.from(set)
  }, [displaySource])

  async function handleSchedule() {
    if (!schedulingId) return
    setActionLoading(true)
    try {
      const validSlots = slots.filter((s) => s.trim().length > 0)
      await patchRequest(`/mentor/evaluations/${schedulingId}/schedule`, {
        status: "viva_scheduled",
        proposed_slots: validSlots,
        viva_meeting_link: meetingLink || undefined,
      })
      toast.success("Viva scheduled")
      setSchedulingId(null)
      await load()
    } catch {
      toast.error("Failed to schedule viva")
    } finally {
      setActionLoading(false)
    }
  }

  async function handleScore() {
    if (!scoringId) return
    setActionLoading(true)
    try {
      const total = scores.technical + scores.practical + scores.communication + scores.originality
      await patchRequest(`/mentor/evaluations/${scoringId}/score`, {
        total_score: total,
        skill_scores: scores,
        mentor_feedback: feedback,
      })
      toast.success("Evaluation submitted")
      setScoringId(null)
      await load()
    } catch {
      toast.error("Failed to submit score")
    } finally {
      setActionLoading(false)
    }
  }

  // Selected Item details for the Details modal
  const selectedDetailsItem = useMemo(() => {
    if (!detailsId) return null
    return displaySource.find((item) => item.id === detailsId) || null
  }, [detailsId, displaySource])

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 text-slate-900 dark:text-white">
      {/* Title Header Card */}
      <div className="rounded-[24px] border border-slate-200/60 bg-[#f8fafc] p-6 dark:border-white/5 dark:bg-[#0d1527] transition-all">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          Skill Evaluations <span className="text-xl">📋</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-white/55 mt-1.5">
          Review and evaluate students' skills through practical assessments and technical tests. ✨
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3.5 py-1 text-xs font-bold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
            ⏳ Pending Evaluations
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
            ✅ Completed Assessments
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3.5 py-1 text-xs font-bold text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
            📊 Student Rankings
          </span>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {/* Total Evaluations */}
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(46,60,120,0.03)] dark:border-[#1d293d] dark:bg-[#0d1527] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-400">Total Evaluations</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
              <ClipboardCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{stats.total}</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">↑ 16%</span>
            <span className="text-slate-400 dark:text-white/35">from last month</span>
          </div>
        </div>

        {/* Completed */}
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(46,60,120,0.03)] dark:border-[#1d293d] dark:bg-[#0d1527] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-400">Completed</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{stats.completed}</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">↑ 18%</span>
            <span className="text-slate-400 dark:text-white/35">from last month</span>
          </div>
        </div>

        {/* Pending */}
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(46,60,120,0.03)] dark:border-[#1d293d] dark:bg-[#0d1527] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-400">Pending</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
              <Hourglass className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{stats.pending}</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs">
            <span className="font-semibold text-amber-600 dark:text-amber-500">↓ 11%</span>
            <span className="text-slate-400 dark:text-white/35">from last month</span>
          </div>
        </div>

        {/* Avg. Score */}
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(46,60,120,0.03)] dark:border-[#1d293d] dark:bg-[#0d1527] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-400">Avg. Score</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <Star className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {stats.avg} <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">/ 5</span>
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">↑ 0.3</span>
            <span className="text-slate-400 dark:text-white/35">from last month</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left List + Right Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
        
        {/* Left Side: Tabs, Filters, and List Stack */}
        <div className="space-y-4 min-w-0">
          
          {/* Tabs + Filters Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Rounded Toggle Pills */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab("pending")}
                className={`rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 border ${
                  activeTab === "pending"
                    ? "bg-[#7b61ff] text-white border-[#7b61ff] shadow-[0_4px_12px_rgba(123,97,255,0.25)]"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-[#0e1726] dark:text-slate-300 dark:border-white/10 dark:hover:bg-[#1a2436]"
                }`}
              >
                Pending ({stats.pending})
              </button>
              <button
                onClick={() => setActiveTab("completed")}
                className={`rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 border ${
                  activeTab === "completed"
                    ? "bg-[#7b61ff] text-white border-[#7b61ff] shadow-[0_4px_12px_rgba(123,97,255,0.25)]"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-[#0e1726] dark:text-slate-300 dark:border-white/10 dark:hover:bg-[#1a2436]"
                }`}
              >
                Completed ({stats.completed})
              </button>
            </div>

            <select
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="h-9 rounded-xl border border-slate-200 bg-white pl-2.5 pr-8 text-[11px] font-semibold text-slate-600 focus:outline-none focus:ring-1 focus:ring-[#7b61ff] dark:border-white/10 dark:bg-[#0e1726] dark:text-slate-300 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2364748B%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:8px_8px] bg-[right_10px_center] bg-no-repeat"
            >
              <option value="All Skills" className="dark:bg-[#0e1726]">All Skills</option>
              {skillOptions.map((s) => (
                <option key={s} value={s} className="dark:bg-[#0e1726]">{s}</option>
              ))}
            </select>

            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="h-9 rounded-xl border border-slate-200 bg-white pl-2.5 pr-8 text-[11px] font-semibold text-slate-600 focus:outline-none focus:ring-1 focus:ring-[#7b61ff] dark:border-white/10 dark:bg-[#0e1726] dark:text-slate-300 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2364748B%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:8px_8px] bg-[right_10px_center] bg-no-repeat"
            >
              <option value="All Levels" className="dark:bg-[#0e1726]">All Levels</option>
              <option value="Beginner" className="dark:bg-[#0e1726]">Beginner</option>
              <option value="Intermediate" className="dark:bg-[#0e1726]">Intermediate</option>
              <option value="Advanced" className="dark:bg-[#0e1726]">Advanced</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-9 rounded-xl border border-slate-200 bg-white pl-2.5 pr-8 text-[11px] font-semibold text-slate-600 focus:outline-none focus:ring-1 focus:ring-[#7b61ff] dark:border-white/10 dark:bg-[#0e1726] dark:text-slate-300 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2364748B%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:8px_8px] bg-[right_10px_center] bg-no-repeat"
            >
              <option value="Due Date" className="dark:bg-[#0e1726]">Sort by: Due Date</option>
              <option value="Student Name" className="dark:bg-[#0e1726]">Sort by: Name</option>
            </select>

            <div className="relative flex-1 min-w-[130px] max-w-[220px]">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 dark:text-white/35" />
              <input
                type="text"
                placeholder="Search evaluations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 text-[11px] font-semibold text-slate-900 placeholder:text-slate-400 focus:border-[#7b61ff] focus:outline-none focus:ring-1 focus:ring-[#7b61ff] dark:border-white/10 dark:bg-[#0e1726] dark:text-white dark:placeholder:text-white/35"
              />
            </div>
          </div>

          {/* Error Banner matching the Mockup */}
          {error && (
            <div className="flex items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50/50 p-4 text-sm font-semibold text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
              <Info className="h-5 w-5 flex-shrink-0" />
              <span>Could not load assigned evaluations. Showing fallback records.</span>
            </div>
          )}

          {/* Table Card */}
          <div className="rounded-[24px] border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-white/5 dark:bg-[#0c1224]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 uppercase tracking-wider text-slate-400 font-bold dark:bg-[#0e1526] dark:border-white/5">
                  <tr>
                    <th className="px-5 py-4 font-bold">Student</th>
                    <th className="px-5 py-4 font-bold">Project / Skill</th>
                    <th className="px-5 py-4 font-bold">Due Date</th>
                    <th className="px-5 py-4 font-bold">Level</th>
                    <th className="px-5 py-4 font-bold">Status</th>
                    <th className="px-5 py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-semibold">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-8 h-8 border-2 border-[#7b61ff] border-t-transparent rounded-full animate-spin" />
                          <p className="text-xs text-slate-400 dark:text-white/45">Loading evaluations...</p>
                        </div>
                      </td>
                    </tr>
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <BookOpen className="h-8 w-8 text-slate-300 dark:text-white/20" />
                          <p className="text-xs text-slate-400 dark:text-white/45">No evaluations match your search filters.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginated.map((item) => {
                      const SkillIcon = item.skillIcon
                      const levelColor =
                        item.skillLevel === "Advanced"
                          ? "bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400"
                          : item.skillLevel === "Intermediate"
                            ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                            : "bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400"
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/55 dark:hover:bg-white/5 transition-colors">
                          {/* Student */}
                          <td className="px-5 py-4 min-w-[180px]">
                            <div className="flex items-center gap-3">
                              <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${item.avatarBg}`}>
                                {item.studentInitials}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white">{item.studentName}</p>
                                <p className="text-[10px] text-slate-400 dark:text-white/40 mt-0.5">{item.studentMeta}</p>
                              </div>
                            </div>
                          </td>

                          {/* Project / Skill */}
                          <td className="px-5 py-4 min-w-[200px]">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-slate-50 dark:bg-white/5">
                                <SkillIcon className="h-4 w-4 text-[#7b61ff]" />
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white">{item.skillName}</p>
                                <span className="text-[9px] rounded bg-slate-100 px-1.5 py-0.5 text-slate-500 dark:bg-white/5 dark:text-slate-400">
                                  {item.skillName}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Due Date */}
                          <td className="px-5 py-4 min-w-[130px]">
                            <p className="font-bold text-slate-700 dark:text-white/80">{item.dueDate}</p>
                            <p className={`text-[11px] font-extrabold mt-0.5 ${item.status === "evaluated" ? "text-[#7b61ff] dark:text-[#a291ff]" : "text-red-500 dark:text-red-400"}`}>
                              {item.dueTime}
                            </p>
                          </td>

                          {/* Level */}
                          <td className="px-5 py-4">
                            <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${levelColor}`}>
                              {item.skillLevel}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-5 py-4">
                            <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                              item.status === "evaluated"
                                ? "bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400"
                                : item.status === "viva_scheduled"
                                  ? "bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400"
                                  : "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
                            }`}>
                              {item.status === "evaluated" ? "Evaluated" : item.status === "viva_scheduled" ? "Scheduled" : "Pending"}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {item.status === "evaluated" ? (
                                <button
                                  type="button"
                                  onClick={() => setDetailsId(item.id)}
                                  className="rounded-lg border border-slate-200 bg-white hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 px-3 py-1.5 text-[11px] text-slate-700 dark:text-white transition-colors"
                                >
                                  View Details
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (item.status === "assigned") {
                                      setSchedulingId(item.id)
                                    } else {
                                      setScoringId(item.id)
                                    }
                                  }}
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-[linear-gradient(135deg,#7b61ff_0%,#6b4dff_100%)] hover:opacity-90 px-3 py-1.5 text-[11px] font-bold text-white shadow-md shadow-[#6b4dff]/25 transition-all"
                                >
                                  <span>{item.status === "assigned" ? "Schedule Viva" : "Evaluate Now"}</span>
                                  <ChevronDown className="h-3 w-3" />
                                </button>
                              )}

                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() => setActiveDropdownId(activeDropdownId === item.id ? null : item.id)}
                                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 dark:border-white/10 dark:text-white/45 transition-colors"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </button>

                                {activeDropdownId === item.id && (
                                  <div className="absolute right-0 mt-1 z-[50] w-40 rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-white/10 dark:bg-[#0e1726]">
                                    {item.status === "assigned" && (
                                      <button
                                        onClick={() => { setSchedulingId(item.id); setActiveDropdownId(null); }}
                                        className="w-full text-left rounded-lg px-2.5 py-1.5 text-[10px] font-semibold hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300"
                                      >
                                        Schedule Viva
                                      </button>
                                    )}
                                    <button
                                      onClick={() => { setScoringId(item.id); setActiveDropdownId(null); }}
                                      className="w-full text-left rounded-lg px-2.5 py-1.5 text-[10px] font-semibold hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300"
                                    >
                                      Submit Score
                                    </button>
                                    <button
                                      onClick={() => { setDetailsId(item.id); setActiveDropdownId(null); }}
                                      className="w-full text-left rounded-lg px-2.5 py-1.5 text-[10px] font-semibold hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300"
                                    >
                                      View Project Info
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 dark:bg-[#0e1526] dark:border-white/5 p-4 text-xs">
            <span className="text-slate-400 dark:text-slate-500 font-semibold">
              Showing {filtered.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} to {Math.min(currentPage * rowsPerPage, filtered.length)} of {filtered.length} evaluations
            </span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 dark:text-slate-500 font-semibold">Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  className="h-8 rounded-lg border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0e1726] pl-2.5 pr-7 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2364748B%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:8px_8px] bg-[right_8px_center] bg-no-repeat"
                >
                  <option value={5} className="dark:bg-[#0e1726]">5</option>
                  <option value={10} className="dark:bg-[#0e1726]">10</option>
                  <option value={20} className="dark:bg-[#0e1726]">20</option>
                </select>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="h-4 w-4 rotate-180 text-slate-500 dark:text-slate-400" />
                </button>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#7b61ff]/40 bg-[#7b61ff]/10 text-xs font-bold text-[#7b61ff] dark:border-[#7b61ff]/30 dark:bg-[#7b61ff]/20">
                  {currentPage}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(Math.ceil(filtered.length / rowsPerPage), p + 1))}
                  disabled={currentPage >= Math.ceil(filtered.length / rowsPerPage)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                </button>
              </div>
            </div>
          </div>
          {/* end pagination */}
          </div>
          {/* end table card */}
        </div>
        {/* end left column */}

        {/* Right Side: Guidelines, weightages breakdown, and help */}
        <div className="space-y-4">
          
          {/* Guidelines Card */}
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(46,60,120,0.02)] dark:border-[#1d293d] dark:bg-[#0c1224]">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="h-5 w-5 text-[#7b61ff]" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Evaluation Guidelines</h3>
            </div>
            <ul className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
              <li className="flex gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Review the problem statement carefully.</span>
              </li>
              <li className="flex gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Evaluate based on code quality, logic, and best practices.</span>
              </li>
              <li className="flex gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Provide constructive feedback.</span>
              </li>
              <li className="flex gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Ensure fairness and originality.</span>
              </li>
              <li className="flex gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Submit evaluation within the due date.</span>
              </li>
            </ul>
          </div>

          {/* Score Weightage Breakdown Card */}
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(46,60,120,0.02)] dark:border-[#1d293d] dark:bg-[#0c1224]">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-4">Score Breakdown</h3>
            <div className="space-y-4">
              {[
                { label: "Problem Solving", weight: 30 },
                { label: "Code Quality", weight: 25 },
                { label: "Efficiency", weight: 20 },
                { label: "Best Practices", weight: 15 },
                { label: "Documentation", weight: 10 }
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                    <span>{item.label}</span>
                    <span className="font-bold text-slate-900 dark:text-white">{item.weight}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#7b61ff] rounded-full" style={{ width: `${item.weight}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Need Help Card */}
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(46,60,120,0.02)] dark:border-[#1d293d] dark:bg-[#0c1224]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base font-extrabold text-slate-900 dark:text-white">Need Help?</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-white/45 font-medium leading-relaxed">
              If you face any issues during evaluation, please contact support.
            </p>
            <button
              type="button"
              className="mt-4 flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 px-4 py-3 text-xs font-bold text-slate-700 dark:text-white transition-all duration-200"
            >
              <span>Contact Support</span>
              <ChevronDown className="h-4 w-4 text-slate-400 dark:text-white/40" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {detailsId && selectedDetailsItem && (
        <Modal isOpen={true} onClose={() => setDetailsId(null)} title="Evaluation Details" maxWidth="lg">
          <div className="space-y-4 text-slate-900 dark:text-white text-xs">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3 dark:border-white/5">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#7b61ff]/10 text-[#7b61ff] font-bold">
                {selectedDetailsItem.studentInitials}
              </div>
              <div>
                <h4 className="font-extrabold text-sm">{selectedDetailsItem.studentName}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{selectedDetailsItem.studentMeta}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 uppercase tracking-wider block font-bold">Skill Domain</span>
                <span className="font-extrabold text-sm mt-1 block">{selectedDetailsItem.skillName}</span>
              </div>
              <div>
                <span className="text-slate-400 uppercase tracking-wider block font-bold">Proficiency</span>
                <span className="font-extrabold text-sm mt-1 block">{selectedDetailsItem.skillLevel}</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3.5 dark:bg-white/5 text-xs">
              <span className="text-slate-400 font-bold block mb-1">Score Breakdown</span>
              {selectedDetailsItem.status === "evaluated" ? (
                <div className="space-y-2 font-semibold mt-2">
                  <div className="flex justify-between">
                    <span>Technical Score</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedDetailsItem.realItem?.score_technical || 0}/40</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Practical Execution</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedDetailsItem.realItem?.score_practical || 0}/30</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Communication</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedDetailsItem.realItem?.score_communication || 0}/20</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Originality</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedDetailsItem.realItem?.score_originality || 0}/10</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex justify-between font-extrabold text-sm text-[#7b61ff] dark:border-white/5">
                    <span>Total Evaluation Score</span>
                    <span>{selectedDetailsItem.realItem?.total_score || 0}/100</span>
                  </div>
                </div>
              ) : (
                <span className="text-slate-400 block italic">Evaluation is pending review.</span>
              )}
            </div>

            {selectedDetailsItem.realItem?.feedback_strengths && (
              <div className="text-xs">
                <span className="text-slate-400 font-bold block">Key Strengths</span>
                <p className="mt-1 font-medium leading-relaxed">{selectedDetailsItem.realItem.feedback_strengths}</p>
              </div>
            )}

            {selectedDetailsItem.realItem?.feedback_improvements && (
              <div className="text-xs">
                <span className="text-slate-400 font-bold block">Areas for Improvement</span>
                <p className="mt-1 font-medium leading-relaxed">{selectedDetailsItem.realItem.feedback_improvements}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/5">
              <button
                type="button"
                onClick={() => setDetailsId(null)}
                className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 dark:border-white/10 dark:bg-transparent dark:hover:bg-white/5 px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-white transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {schedulingId && (
        <Modal isOpen={true} onClose={() => setSchedulingId(null)} title="Schedule Viva Meeting" maxWidth="md">
          <div className="space-y-4 text-slate-900 dark:text-white text-xs">
            <p className="text-slate-500 font-medium">Provide potential time slots for the student to select and confirm the viva meeting.</p>
            
            <div className="space-y-3 mt-3">
              <div>
                <label className="block mb-1 font-bold text-slate-400 uppercase tracking-wider">Proposed Slots</label>
                {slots.map((slot, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      type="datetime-local"
                      value={slot}
                      onChange={(e) => {
                        const newSlots = [...slots]
                        newSlots[idx] = e.target.value
                        setSlots(newSlots)
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900 outline-none focus:border-[#7b61ff] dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                    {slots.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setSlots(slots.filter((_, i) => i !== idx))}
                        className="px-2 text-red-500 font-bold"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setSlots([...slots, ""])}
                  className="text-xs font-bold text-[#7b61ff] hover:underline mt-1 block"
                >
                  + Add Option
                </button>
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-400 uppercase tracking-wider">Viva Meeting Link</label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/abc-defg-hij"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900 outline-none focus:border-[#7b61ff] dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
              <button
                type="button"
                onClick={() => setSchedulingId(null)}
                className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 dark:border-white/10 dark:bg-transparent dark:hover:bg-white/5 px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-white transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSchedule}
                disabled={actionLoading}
                className="rounded-xl bg-[#7b61ff] hover:bg-[#6b4dff] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-[#7b61ff]/25 transition-all disabled:opacity-50"
              >
                {actionLoading ? "Saving..." : "Confirm Schedule"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {scoringId && (
        <Modal isOpen={true} onClose={() => setScoringId(null)} title="Submit Student Score" maxWidth="md">
          <div className="space-y-4 text-slate-900 dark:text-white text-xs">
            <p className="text-slate-500 font-medium">Evaluate the student based on code quality, technical understanding, and viva performance.</p>
            
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <label className="block mb-1.5 font-bold text-slate-400 uppercase tracking-wider">Technical Score (Max 40)</label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  value={scores.technical}
                  onChange={(e) => setScores({ ...scores, technical: Math.min(40, Number(e.target.value)) })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900 outline-none focus:border-[#7b61ff] dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>

              <div>
                <label className="block mb-1.5 font-bold text-slate-400 uppercase tracking-wider">Practical Skill (Max 30)</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={scores.practical}
                  onChange={(e) => setScores({ ...scores, practical: Math.min(30, Number(e.target.value)) })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900 outline-none focus:border-[#7b61ff] dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>

              <div>
                <label className="block mb-1.5 font-bold text-slate-400 uppercase tracking-wider">Communication (Max 20)</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={scores.communication}
                  onChange={(e) => setScores({ ...scores, communication: Math.min(20, Number(e.target.value)) })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900 outline-none focus:border-[#7b61ff] dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>

              <div>
                <label className="block mb-1.5 font-bold text-slate-400 uppercase tracking-wider">Originality (Max 10)</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={scores.originality}
                  onChange={(e) => setScores({ ...scores, originality: Math.min(10, Number(e.target.value)) })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900 outline-none focus:border-[#7b61ff] dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1.5 font-bold text-slate-400 uppercase tracking-wider">Evaluation Verdict</label>
              <select
                value={feedback.verdict}
                onChange={(e) => setFeedback({ ...feedback, verdict: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900 outline-none focus:border-[#7b61ff] dark:border-white/10 dark:bg-[#0e1726] dark:text-white"
              >
                <option value="outstanding">Outstanding (Excellent work)</option>
                <option value="good">Good (Fully functional)</option>
                <option value="average">Average (Meets basic requirements)</option>
                <option value="fail">Fail (Needs improvement)</option>
              </select>
            </div>

            <div>
              <label className="block mb-1.5 font-bold text-slate-400 uppercase tracking-wider font-semibold">Key Strengths</label>
              <textarea
                placeholder="Highlight what they did exceptionally well..."
                value={feedback.strengths}
                onChange={(e) => setFeedback({ ...feedback, strengths: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900 outline-none focus:border-[#7b61ff] dark:border-white/10 dark:bg-white/5 dark:text-white min-h-[70px] resize-none"
              />
            </div>

            <div>
              <label className="block mb-1.5 font-bold text-slate-400 uppercase tracking-wider font-semibold">Areas for Improvement</label>
              <textarea
                placeholder="Suggest concrete suggestions or areas to refine..."
                value={feedback.improvements}
                onChange={(e) => setFeedback({ ...feedback, improvements: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900 outline-none focus:border-[#7b61ff] dark:border-white/10 dark:bg-white/5 dark:text-white min-h-[70px] resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
              <button
                type="button"
                onClick={() => setScoringId(null)}
                className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 dark:border-white/10 dark:bg-transparent dark:hover:bg-white/5 px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-white transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleScore}
                disabled={actionLoading}
                className="rounded-xl bg-[#7b61ff] hover:bg-[#6b4dff] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-[#7b61ff]/25 transition-all disabled:opacity-50"
              >
                {actionLoading ? "Submitting..." : "Submit Score"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
