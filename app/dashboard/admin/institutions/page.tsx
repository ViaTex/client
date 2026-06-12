'use client'

import {
  Building2, GraduationCap, BadgeCheck, Briefcase, TrendingUp, Users,
  ArrowRight, Search, RotateCcw, Trophy, Award, Star,
  CalendarDays, ChevronDown, CheckCircle2, AlertCircle
} from 'lucide-react'
import {
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts'

// ── Mock Data ─────────────────────────────────────────────────────────────

const topStats = [
  { title: "TOTAL COLLEGES", value: "312", trend: "+12.4%", icon: Building2, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/40" },
  { title: "TOTAL STUDENTS", value: "18,732", trend: "+14.6%", icon: GraduationCap, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/40" },
  { title: "VERIFIED STUDENTS", value: "9,862", trend: "+16.2%", icon: BadgeCheck, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/40" },
  { title: "TOTAL PLACEMENTS", value: "1,248", trend: "+10.2%", icon: Briefcase, color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/40" },
  { title: "PLACEMENT RATE", value: "19.5%", trend: "+2.1%", icon: TrendingUp, color: "text-teal-600", bg: "bg-teal-100 dark:bg-teal-900/40" },
  { title: "T&P OFFICERS", value: "356", trend: "+8.6%", icon: Users, color: "text-rose-600", bg: "bg-rose-100 dark:bg-rose-900/40" },
]

const placementTrendData = [
  { name: 'Jan', StudentsPlaced: 100, PlacementRate: 10 },
  { name: 'Feb', StudentsPlaced: 180, PlacementRate: 15 },
  { name: 'Mar', StudentsPlaced: 150, PlacementRate: 12 },
  { name: 'Apr', StudentsPlaced: 280, PlacementRate: 18 },
  { name: 'May', StudentsPlaced: 400, PlacementRate: 24 },
]

const collegeTypeData = [
  { name: 'Engineering Colleges', value: 208, color: '#3b82f6', percentage: '66.7%' },
  { name: 'Universities', value: 52, color: '#10b981', percentage: '16.7%' },
  { name: 'Polytechnics', value: 28, color: '#f59e0b', percentage: '9.0%' },
  { name: 'Management Colleges', value: 16, color: '#8b5cf6', percentage: '5.1%' },
  { name: 'Others', value: 8, color: '#64748b', percentage: '2.5%' },
]

const funnelData = [
  { label: 'Projects Submitted', count: 18732, percentage: '100%', color: 'bg-blue-600', width: '100%' },
  { label: 'Viva Completed', count: 11243, percentage: '60.0%', color: 'bg-emerald-500', width: '80%' },
  { label: 'Verified Students', count: 9862, percentage: '52.7%', color: 'bg-purple-500', width: '70%' },
  { label: 'Shortlisted', count: 4218, percentage: '22.5%', color: 'bg-orange-400', width: '45%' },
  { label: 'Interviews', count: 4218, percentage: '22.5%', color: 'bg-amber-400', width: '45%' },
  { label: 'Placed', count: 1248, percentage: '6.6%', color: 'bg-teal-500', width: '25%' },
]

const topPerformingColleges = [
  { id: 1, name: "ABCE Engineering College", rate: "24.5%", placements: 198 },
  { id: 2, name: "Global Tech Institute", rate: "22.1%", placements: 156 },
  { id: 3, name: "VNR University", rate: "20.3%", placements: 142 },
  { id: 4, name: "Silverline College", rate: "18.7%", placements: 128 },
  { id: 5, name: "Techno India College", rate: "17.2%", placements: 110 },
]

const allInstitutions = [
  { id: 1, name: "ABCE Engineering College", students: "1,842", verified: "1,482", placements: "198", status: "Active" },
  { id: 2, name: "Global Tech Institute", students: "1,623", verified: "1,237", placements: "156", status: "Active" },
  { id: 3, name: "VNR University", students: "1,415", verified: "1,102", placements: "142", status: "Active" },
  { id: 4, name: "Silverline College", students: "1,286", verified: "1,028", placements: "128", status: "Active" },
  { id: 5, name: "Techno India College", students: "1,102", verified: "848", placements: "110", status: "Pending" },
  { id: 6, name: "Global Business School", students: "965", verified: "712", placements: "96", status: "Active" },
]

// ── Components ────────────────────────────────────────────────────────────

function StatCard({ stat }: { stat: any }) {
  const Icon = stat.icon
  return (
    <div className="rounded-2xl border border-[#dde6ff] bg-white p-3 shadow-sm dark:border-[#21376f] dark:bg-[#0e1c45]">
      <div className="flex items-center gap-2.5">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.bg}`}>
          <Icon className={`h-5 w-5 ${stat.color}`} />
        </div>
        <div className="flex flex-col flex-1">
          <p className="text-[10px] xl:text-[11px] font-bold text-[#5c73b5] dark:text-[#8ea1d6] whitespace-nowrap">
            {stat.title}
          </p>
          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 mt-0.5">
            <h3 className="text-lg xl:text-xl font-extrabold text-[#16213f] dark:text-white leading-none">
              {stat.value}
            </h3>
            <div className="flex flex-col items-end text-right">
              <span className={`text-[10px] font-bold text-emerald-600 dark:text-emerald-400 leading-none whitespace-nowrap`}>
                {stat.trend}
              </span>
              <span className="text-[7px] xl:text-[8px] font-medium text-slate-400 mt-0.5 whitespace-nowrap">
                vs last year
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ title }: { title: string }) {
  return <h2 className="text-sm sm:text-base font-extrabold text-[#16213f] dark:text-white mb-4">{title}</h2>
}

export default function AdminInstitutionsPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] space-y-6 rounded-[1.25rem] bg-[#eef3ff] p-4 sm:rounded-[1.5rem] sm:p-5 md:rounded-[2rem] md:p-6 dark:bg-[#08122d]">

      {/* Row 1 - Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {topStats.map(s => <StatCard key={s.title} stat={s} />)}
      </div>

      {/* Row 2 - 5 Phase Hiring Pipeline Overview */}
      <div className="rounded-2xl border border-[#dde6ff] bg-white p-5 shadow-sm dark:border-[#21376f] dark:bg-[#0e1c45]">
        <SectionTitle title="5-Phase Hiring Pipeline Overview" />
        <div className="flex flex-col gap-4 lg:flex-row items-stretch overflow-x-auto pb-2">
          
          {/* Phase 1 */}
          <div className="min-w-[220px] flex-1 rounded-xl border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-900/30 dark:bg-blue-900/10">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">1</span>
              <div>
                <p className="text-xs font-bold text-blue-600 dark:text-blue-400 leading-tight">Pre-Pipeline</p>
                <p className="text-[10px] font-medium text-blue-500/70 dark:text-blue-400/70 leading-tight">(Verification)</p>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-medium text-slate-500">Projects Submitted</span>
                <span className="font-bold text-[#16213f] dark:text-white">18,732</span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-medium text-slate-500">Viva Completed</span>
                <span className="font-bold text-[#16213f] dark:text-white">11,243</span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-medium text-slate-500">Verified Students</span>
                <span className="font-bold text-[#16213f] dark:text-white">9,862</span>
              </div>
            </div>
            <div className="border-t border-blue-100 dark:border-blue-900/30 pt-2 text-center">
              <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400">Completion Rate: 87.7%</p>
            </div>
          </div>
          
          <ArrowRight className="hidden lg:block self-center h-4 w-4 text-slate-300" />

          {/* Phase 2 */}
          <div className="min-w-[220px] flex-1 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 dark:border-emerald-900/30 dark:bg-emerald-900/10">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">2</span>
              <div>
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 leading-tight">Zero-Screening</p>
                <p className="text-[10px] font-medium text-emerald-500/70 dark:text-emerald-400/70 leading-tight">(Smart Match)</p>
              </div>
            </div>
            <div className="flex justify-between mb-4">
              <div className="text-center">
                <p className="text-[9px] font-medium text-slate-500">Active Job<br/>Posts</p>
                <p className="mt-1 text-xs font-bold text-[#16213f] dark:text-white">2,153</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-medium text-slate-500">Smart<br/>Matches</p>
                <p className="mt-1 text-xs font-bold text-[#16213f] dark:text-white">32,416</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-medium text-slate-500">Students<br/>Matched</p>
                <p className="mt-1 text-xs font-bold text-[#16213f] dark:text-white">12,906</p>
              </div>
            </div>
            <div className="border-t border-emerald-100 dark:border-emerald-900/30 pt-2 text-center">
              <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Match Rate: 40.1%</p>
            </div>
          </div>

          <ArrowRight className="hidden lg:block self-center h-4 w-4 text-slate-300" />

          {/* Phase 3 */}
          <div className="min-w-[220px] flex-1 rounded-xl border border-purple-100 bg-purple-50/50 p-4 dark:border-purple-900/30 dark:bg-purple-900/10">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500 text-[10px] font-bold text-white">3</span>
              <div>
                <p className="text-xs font-bold text-purple-600 dark:text-purple-400 leading-tight">Shortlisting</p>
                <p className="text-[10px] font-medium text-purple-500/70 dark:text-purple-400/70 leading-tight">(With Trust)</p>
              </div>
            </div>
            <div className="flex justify-between mb-4">
              <div className="text-center">
                <p className="text-[9px] font-medium text-slate-500">Candidates<br/>Shortlisted</p>
                <p className="mt-1 text-xs font-bold text-[#16213f] dark:text-white">4,218</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-medium text-slate-500">Recruiter<br/>Views</p>
                <p className="mt-1 text-xs font-bold text-[#16213f] dark:text-white">15,632</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-medium text-slate-500">Mentor Reports<br/>Viewed</p>
                <p className="mt-1 text-xs font-bold text-[#16213f] dark:text-white">7,843</p>
              </div>
            </div>
            <div className="border-t border-purple-100 dark:border-purple-900/30 pt-2 text-center">
              <p className="text-[11px] font-bold text-purple-600 dark:text-purple-400">Shortlist Rate: 32.6%</p>
            </div>
          </div>

          <ArrowRight className="hidden lg:block self-center h-4 w-4 text-slate-300" />

          {/* Phase 4 */}
          <div className="min-w-[220px] flex-1 rounded-xl border border-orange-100 bg-orange-50/50 p-4 dark:border-orange-900/30 dark:bg-orange-900/10">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">4</span>
              <p className="text-xs font-bold text-orange-600 dark:text-orange-400">Accelerated Interview</p>
            </div>
            <div className="flex justify-between mb-4 mt-7">
              <div className="text-center">
                <p className="text-[9px] font-medium text-slate-500">Interviews<br/>Scheduled</p>
                <p className="mt-1 text-xs font-bold text-[#16213f] dark:text-white">4,812</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-medium text-slate-500">Interviews<br/>Completed</p>
                <p className="mt-1 text-xs font-bold text-[#16213f] dark:text-white">4,218</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-medium text-slate-500">Offer<br/>Rate</p>
                <p className="mt-1 text-xs font-bold text-[#16213f] dark:text-white">29.6%</p>
              </div>
            </div>
            <div className="border-t border-orange-100 dark:border-orange-900/30 pt-2 text-center">
              <p className="text-[11px] font-bold text-orange-600 dark:text-orange-400">Completion Rate: 87.7%</p>
            </div>
          </div>

          <ArrowRight className="hidden lg:block self-center h-4 w-4 text-slate-300" />

          {/* Phase 5 */}
          <div className="min-w-[220px] flex-1 rounded-xl border border-teal-100 bg-teal-50/50 p-4 dark:border-teal-900/30 dark:bg-teal-900/10">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-500 text-[10px] font-bold text-white">5</span>
              <div>
                <p className="text-xs font-bold text-teal-600 dark:text-teal-400 leading-tight">Institutional Loop</p>
                <p className="text-[10px] font-medium text-teal-500/70 dark:text-teal-400/70 leading-tight">(Placements)</p>
              </div>
            </div>
            <div className="flex justify-between mb-4">
              <div className="text-center">
                <p className="text-[9px] font-medium text-slate-500">Students<br/>Placed</p>
                <p className="mt-1 text-xs font-bold text-[#16213f] dark:text-white">1,248</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-medium text-slate-500">Placement<br/>Rate</p>
                <p className="mt-1 text-xs font-bold text-[#16213f] dark:text-white">19.5%</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-medium text-slate-500">Top<br/>Companies</p>
                <p className="mt-1 text-xs font-bold text-[#16213f] dark:text-white">243</p>
              </div>
            </div>
            <div className="border-t border-teal-100 dark:border-teal-900/30 pt-2 text-center">
              <p className="text-[11px] font-bold text-teal-600 dark:text-teal-400">Placement Rate Improved: ↑ 2.1%</p>
            </div>
          </div>

        </div>
      </div>

      {/* Row 3 - Filters */}
      <div className="flex flex-wrap items-end gap-4 rounded-2xl border border-[#dde6ff] bg-white p-4 shadow-sm dark:border-[#21376f] dark:bg-[#0e1c45]">
        <div className="flex-1 min-w-[120px]">
          <label className="mb-1 block text-[10px] font-bold text-slate-500">State</label>
          <div className="relative">
            <select className="w-full appearance-none rounded-lg border border-[#dde6ff] bg-slate-50 py-2 pl-3 pr-8 text-xs font-medium text-[#16213f] outline-none dark:border-[#21376f] dark:bg-[#08122d] dark:text-white">
              <option>All States</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <div className="flex-1 min-w-[120px]">
          <label className="mb-1 block text-[10px] font-bold text-slate-500">City</label>
          <div className="relative">
            <select className="w-full appearance-none rounded-lg border border-[#dde6ff] bg-slate-50 py-2 pl-3 pr-8 text-xs font-medium text-[#16213f] outline-none dark:border-[#21376f] dark:bg-[#08122d] dark:text-white">
              <option>All Cities</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <div className="flex-1 min-w-[120px]">
          <label className="mb-1 block text-[10px] font-bold text-slate-500">Institution Type</label>
          <div className="relative">
            <select className="w-full appearance-none rounded-lg border border-[#dde6ff] bg-slate-50 py-2 pl-3 pr-8 text-xs font-medium text-[#16213f] outline-none dark:border-[#21376f] dark:bg-[#08122d] dark:text-white">
              <option>All Types</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <div className="flex-1 min-w-[120px]">
          <label className="mb-1 block text-[10px] font-bold text-slate-500">Accreditation</label>
          <div className="relative">
            <select className="w-full appearance-none rounded-lg border border-[#dde6ff] bg-slate-50 py-2 pl-3 pr-8 text-xs font-medium text-[#16213f] outline-none dark:border-[#21376f] dark:bg-[#08122d] dark:text-white">
              <option>All</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <div className="flex-1 min-w-[120px]">
          <label className="mb-1 block text-[10px] font-bold text-slate-500">Status</label>
          <div className="relative">
            <select className="w-full appearance-none rounded-lg border border-[#dde6ff] bg-slate-50 py-2 pl-3 pr-8 text-xs font-medium text-[#16213f] outline-none dark:border-[#21376f] dark:bg-[#08122d] dark:text-white">
              <option>All</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <div className="flex-[1.5] min-w-[160px]">
          <label className="mb-1 block text-[10px] font-bold text-slate-500">Date Range</label>
          <div className="relative">
            <input type="text" value="01/01/2026 - 28/05/2026" readOnly className="w-full rounded-lg border border-[#dde6ff] bg-slate-50 py-2 pl-3 pr-8 text-xs font-medium text-[#16213f] outline-none dark:border-[#21376f] dark:bg-[#08122d] dark:text-white" />
            <CalendarDays className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <div>
          <button className="flex items-center gap-1.5 rounded-lg border border-[#dde6ff] bg-white px-4 py-2 text-xs font-bold text-[#16213f] hover:bg-slate-50 dark:border-[#21376f] dark:bg-[#0e1c45] dark:text-white dark:hover:bg-[#08122d] transition-colors h-[34px]">
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Filters
          </button>
        </div>
      </div>

      {/* Row 4 - Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Funnel Chart */}
        <div className="rounded-2xl border border-[#dde6ff] bg-white p-5 shadow-sm dark:border-[#21376f] dark:bg-[#0e1c45]">
          <SectionTitle title="Student Funnel Across Institutions" />
          <div className="flex flex-col items-center justify-center space-y-1 mt-4 relative">
            {funnelData.map((level, i) => (
              <div key={i} className="w-full flex items-center gap-4 text-[10px]">
                <div className="w-1/2 flex justify-center h-8 relative">
                  <div className={`h-full ${level.color} transition-all duration-500 clip-path-funnel shadow-sm flex items-center justify-center rounded-[2px]`} style={{ width: level.width, clipPath: i === 5 ? 'polygon(20% 0, 80% 0, 80% 100%, 20% 100%)' : i===4 ? 'polygon(5% 0, 95% 0, 20% 100%, 80% 100%)' : i===3 ? 'polygon(0% 0, 100% 0, 5% 100%, 95% 100%)' : i===2 ? 'polygon(0% 0, 100% 0, 0% 100%, 100% 100%)' : 'none' }}>
                     {/* We can use CSS transforms or simple widths. Let's use simple centered divs */}
                  </div>
                </div>
                <div className="w-1/2 flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-sm shrink-0 ${level.color}`}></div>
                  <span className="font-bold text-slate-500 dark:text-slate-400 w-24 truncate">{level.label}</span>
                  <span className="font-extrabold text-[#16213f] dark:text-white">{level.count.toLocaleString()} <span className="font-medium text-slate-400">({level.percentage})</span></span>
                </div>
              </div>
            ))}
            {/* Override Funnel Shapes using absolute/relative simple centered divs */}
            <div className="absolute left-0 top-0 w-1/2 h-full flex flex-col items-center justify-start space-y-1 bg-white dark:bg-[#0e1c45] z-10">
              {funnelData.map((level, i) => (
                <div key={i} className={`h-8 ${level.color} transition-all duration-500 rounded-[2px]`} style={{ width: level.width, clipPath: i < funnelData.length - 1 ? 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)' : 'none' }}></div>
              ))}
            </div>
            
            <div className="mt-4 pt-2 border-t border-[#dde6ff] dark:border-[#21376f] w-full text-center z-20">
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Overall Conversion Rate: 6.6%</p>
            </div>
          </div>
        </div>

        {/* Placements Trend */}
        <div className="rounded-2xl border border-[#dde6ff] bg-white p-5 shadow-sm dark:border-[#21376f] dark:bg-[#0e1c45]">
          <div className="flex justify-between items-start mb-4 gap-2">
            <h2 className="text-sm sm:text-base font-extrabold text-[#16213f] dark:text-white leading-tight">
              Placements Trend
            </h2>
            <select className="text-[10px] sm:text-xs border rounded pl-2 pr-6 py-1 bg-transparent text-slate-500 border-[#dde6ff] dark:border-[#21376f] shrink-0 outline-none">
              <option>Monthly</option>
            </select>
          </div>
          <div className="flex gap-4 mb-4">
             <div className="flex items-center gap-1.5"><div className="h-2 w-2 bg-blue-600 rounded-sm"></div><span className="text-[10px] font-bold text-slate-500">Students Placed</span></div>
             <div className="flex items-center gap-1.5"><div className="h-2 w-2 bg-emerald-500 rounded-sm"></div><span className="text-[10px] font-bold text-slate-500">Placement Rate (%)</span></div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={placementTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} stroke="#94a3b8" tickFormatter={(v) => `${v}%`} />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line yAxisId="left" type="monotone" dataKey="StudentsPlaced" stroke="#2563eb" strokeWidth={2} dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} />
                <Line yAxisId="right" type="monotone" dataKey="PlacementRate" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Students by College Type */}
        <div className="rounded-2xl border border-[#dde6ff] bg-white p-5 shadow-sm dark:border-[#21376f] dark:bg-[#0e1c45]">
          <SectionTitle title="Students by College Type" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-4">
            <div className="h-32 w-32 relative shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={collegeTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {collegeTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-sm font-extrabold text-[#16213f] dark:text-white">312</span>
                <span className="text-[8px] font-bold text-slate-500">Total Colleges</span>
              </div>
            </div>
            <div className="flex flex-col justify-center space-y-2.5 w-full sm:flex-1 sm:pl-4">
              {collegeTypeData.map(d => (
                <div key={d.name} className="flex items-center justify-between gap-2 text-[10px] font-bold w-full">
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <div className="h-1.5 w-1.5 rounded-sm shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-slate-600 dark:text-slate-300 truncate">{d.name}</span>
                  </div>
                  <span className="text-[#16213f] dark:text-white text-right shrink-0">{d.value} <span className="text-slate-400 font-medium">({d.percentage})</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Row 5 - Tables & Insights */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* Top Performing Colleges */}
        <div className="lg:col-span-3 rounded-2xl border border-[#dde6ff] bg-white p-5 shadow-sm dark:border-[#21376f] dark:bg-[#0e1c45]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-extrabold text-[#16213f] dark:text-white">Top Performing Colleges <span className="text-[10px] font-medium text-slate-500 font-normal block sm:inline">(by Placement Rate)</span></h2>
            <button className="text-[10px] font-bold text-blue-600 hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[10px]">
              <thead>
                <tr className="border-b border-[#dde6ff] text-slate-500 dark:border-[#21376f]">
                  <th className="pb-2 font-bold w-6">#</th>
                  <th className="pb-2 font-bold">College / University</th>
                  <th className="pb-2 font-bold text-right">Placement Rate</th>
                  <th className="pb-2 font-bold text-right">Placements</th>
                </tr>
              </thead>
              <tbody>
                {topPerformingColleges.map((c, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-none dark:border-slate-800/50">
                    <td className="py-2.5 font-bold text-slate-400">{c.id}</td>
                    <td className="py-2.5 font-bold text-[#16213f] dark:text-white truncate max-w-[100px] pr-2">{c.name}</td>
                    <td className="py-2.5 text-right font-medium text-slate-600 dark:text-slate-300">{c.rate}</td>
                    <td className="py-2.5 text-right font-medium text-slate-600 dark:text-slate-300">{c.placements}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="mt-4 flex w-full items-center justify-center gap-1 text-[11px] font-bold text-blue-600 hover:underline">
            View All Colleges <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {/* All Institutions */}
        <div className="lg:col-span-5 rounded-2xl border border-[#dde6ff] bg-white p-5 shadow-sm dark:border-[#21376f] dark:bg-[#0e1c45]">
          <SectionTitle title="All Institutions (312)" />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[10px]">
              <thead>
                <tr className="border-b border-[#dde6ff] text-slate-500 dark:border-[#21376f]">
                  <th className="pb-2 font-bold w-6">#</th>
                  <th className="pb-2 font-bold">College / University</th>
                  <th className="pb-2 font-bold text-right">Total Students</th>
                  <th className="pb-2 font-bold text-right">Verified Students</th>
                  <th className="pb-2 font-bold text-right">Placements</th>
                  <th className="pb-2 font-bold text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {allInstitutions.map((c, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-none dark:border-slate-800/50">
                    <td className="py-2.5 font-bold text-slate-400">{c.id}</td>
                    <td className="py-2.5 font-bold text-[#16213f] dark:text-white truncate max-w-[120px] pr-2">{c.name}</td>
                    <td className="py-2.5 text-right font-medium text-slate-600 dark:text-slate-300">{c.students}</td>
                    <td className="py-2.5 text-right font-medium text-slate-600 dark:text-slate-300">{c.verified}</td>
                    <td className="py-2.5 text-right font-medium text-slate-600 dark:text-slate-300">{c.placements}</td>
                    <td className="py-2.5 text-right font-bold">
                      <span className={c.status === 'Active' ? 'text-emerald-500' : 'text-orange-500'}>{c.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="mt-4 flex w-full items-center justify-center gap-1 text-[11px] font-bold text-blue-600 hover:underline">
            View All Institutions <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {/* Institution Insights */}
        <div className="lg:col-span-4 rounded-2xl border border-[#dde6ff] bg-white p-5 shadow-sm dark:border-[#21376f] dark:bg-[#0e1c45]">
          <SectionTitle title="Institution Insights" />
          <div className="grid grid-cols-2 gap-3 mt-4">
            
            <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3 flex gap-2 dark:border-amber-900/30 dark:bg-amber-900/10">
              <Trophy className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[9px] font-bold text-slate-500">Top Performing College</p>
                <p className="text-[10px] font-extrabold text-[#16213f] dark:text-white mt-0.5">ABCE Engineering College</p>
                <p className="text-[8px] font-medium text-slate-500 mt-0.5">Placement Rate: 24.5%</p>
              </div>
            </div>

            <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-3 flex gap-2 dark:border-purple-900/30 dark:bg-purple-900/10">
              <Users className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[9px] font-bold text-slate-500">Highest Verified Students</p>
                <p className="text-[10px] font-extrabold text-[#16213f] dark:text-white mt-0.5">VNR University</p>
                <p className="text-[8px] font-medium text-slate-500 mt-0.5">1,102 Verified</p>
              </div>
            </div>

            <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 flex gap-2 dark:border-emerald-900/30 dark:bg-emerald-900/10">
              <TrendingUp className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[9px] font-bold text-slate-500">Most Placements</p>
                <p className="text-[10px] font-extrabold text-[#16213f] dark:text-white mt-0.5">Global Tech Institute</p>
                <p className="text-[8px] font-medium text-slate-500 mt-0.5">156 Placements</p>
              </div>
            </div>

            <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3 flex gap-2 dark:border-rose-900/30 dark:bg-rose-900/10">
              <Star className="h-4 w-4 text-rose-500 shrink-0 mt-0.5 fill-rose-500" />
              <div>
                <p className="text-[9px] font-bold text-slate-500">Avg. Institution Rating</p>
                <p className="text-[10px] font-extrabold text-[#16213f] dark:text-white mt-0.5">4.3 / 5</p>
                <div className="flex gap-0.5 mt-0.5">
                  {[1,2,3,4].map(i => <Star key={i} className="h-2 w-2 fill-amber-400 text-amber-400" />)}
                  <Star className="h-2 w-2 fill-slate-200 text-slate-200 dark:fill-slate-600 dark:text-slate-600" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 flex gap-2 dark:border-blue-900/30 dark:bg-blue-900/10">
              <TrendingUp className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[9px] font-bold text-slate-500">Highest Growth</p>
                <p className="text-[10px] font-extrabold text-[#16213f] dark:text-white mt-0.5">Global Tech Institute</p>
                <p className="text-[8px] font-bold text-blue-600 mt-0.5">↑ 32.6% this year</p>
              </div>
            </div>

            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 flex gap-2 dark:border-indigo-900/30 dark:bg-indigo-900/10">
              <Building2 className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[9px] font-bold text-slate-500">Most Active T&P Officers</p>
                <p className="text-[10px] font-extrabold text-[#16213f] dark:text-white mt-0.5">Dr. Sharma (ABCE)</p>
                <p className="text-[8px] font-medium text-slate-500 mt-0.5">24 Active Officers</p>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  )
}
