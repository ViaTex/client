'use client'

import {
  FileText, Info, AlertTriangle, XCircle, ShieldAlert, UserCheck,
  ChevronDown, CalendarDays, Search, RotateCcw, Eye, Shield, Activity,
  ChevronLeft, ChevronRight, MoreHorizontal, ArrowUpRight
} from 'lucide-react'
import {
  PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts'

// ── Mock Data ─────────────────────────────────────────────────────────────

const topStats = [
  { title: "Total Logs", value: "82,645", trend: "↑ 18.6%", trendText: "vs last 30 days", icon: FileText, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/40", trendColor: "text-emerald-600" },
  { title: "Info Logs", value: "45,231", trend: "↑ 12.4%", trendText: "vs last 30 days", icon: Info, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/40", trendColor: "text-emerald-600" },
  { title: "Warning Logs", value: "12,458", trend: "↑ 8.2%", trendText: "vs last 30 days", icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-900/40", trendColor: "text-emerald-600" },
  { title: "Error Logs", value: "2,314", trend: "↑ 15.3%", trendText: "vs last 30 days", icon: XCircle, color: "text-rose-600", bg: "bg-rose-100 dark:bg-rose-900/40", trendColor: "text-emerald-600" },
  { title: "Security Logs", value: "1,842", trend: "↑ 22.7%", trendText: "vs last 30 days", icon: ShieldAlert, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/40", trendColor: "text-emerald-600" },
  { title: "User Actions", value: "20,800", trend: "↑ 17.1%", trendText: "vs last 30 days", icon: UserCheck, color: "text-teal-600", bg: "bg-teal-100 dark:bg-teal-900/40", trendColor: "text-emerald-600" },
]

const logsData = [
  { id: 1, time: "28 May 2026, 04:35 PM", level: "Info", module: "Authentication", action: "User Login", user: "admin@dishasetu.com", role: "Super Admin", initial: "A", color: "bg-blue-600", ip: "103.21.45.12" },
  { id: 2, time: "28 May 2026, 04:32 PM", level: "Warning", module: "Verifications", action: "Viva Rescheduled", user: "pooja.verma@vnr.edu.in", role: "Mentor", initial: "P", color: "bg-emerald-500", ip: "103.21.45.13" },
  { id: 3, time: "28 May 2026, 04:28 PM", level: "Info", module: "Students", action: "Student Profile Updated", user: "rahul.kumar@vnr.edu.in", role: "Student", initial: "R", color: "bg-teal-500", ip: "103.21.45.14" },
  { id: 4, time: "28 May 2026, 04:20 PM", level: "Error", module: "Projects", action: "Project Submission Failed", user: "system", role: "System", initial: "S", color: "bg-rose-500", ip: "103.21.45.15" },
  { id: 5, time: "28 May 2026, 04:18 PM", level: "Security", module: "Authentication", action: "Failed Login Attempt", user: "Unknown User", role: "Guest", initial: "U", color: "bg-slate-400", ip: "45.33.12.98" },
  { id: 6, time: "28 May 2026, 04:15 PM", level: "Info", module: "Smart Match", action: "Matches Generated", user: "match-engine", role: "System", initial: "M", color: "bg-indigo-500", ip: "103.21.45.16" },
  { id: 7, time: "28 May 2026, 04:10 PM", level: "Info", module: "Interviews", action: "Interview Scheduled", user: "deepak.sharma@abc.com", role: "Corporate", initial: "D", color: "bg-orange-500", ip: "103.21.45.17" },
  { id: 8, time: "28 May 2026, 04:05 PM", level: "Warning", module: "Placements", action: "Offer Updated", user: "kotak.hr@abc.com", role: "Corporate", initial: "K", color: "bg-amber-500", ip: "103.21.45.18" },
  { id: 9, time: "28 May 2026, 04:01 PM", level: "Security", module: "Users", action: "Role Changed", user: "admin@dishasetu.com", role: "Super Admin", initial: "A", color: "bg-blue-600", ip: "103.21.45.19" },
  { id: 10, time: "28 May 2026, 03:55 PM", level: "Error", module: "Reports", action: "Report Generation Failed", user: "system", role: "System", initial: "S", color: "bg-rose-500", ip: "103.21.45.20" },
]

const logsByLevelData = [
  { name: 'Info', value: 45231, color: '#10b981', percentage: '54.7%' },
  { name: 'Warning', value: 12458, color: '#f59e0b', percentage: '15.1%' },
  { name: 'Error', value: 2314, color: '#ef4444', percentage: '2.8%' },
  { name: 'Security', value: 1842, color: '#8b5cf6', percentage: '2.2%' },
  { name: 'Debug', value: 20800, color: '#3b82f6', percentage: '25.2%' },
]

const topModulesData = [
  { name: 'Authentication', value: 18452, percentage: '22.3%', width: '95%' },
  { name: 'Verifications', value: 14328, percentage: '17.3%', width: '75%' },
  { name: 'Students', value: 12856, percentage: '15.6%', width: '65%' },
  { name: 'Projects', value: 9982, percentage: '12.1%', width: '50%' },
  { name: 'Smart Match', value: 7654, percentage: '9.3%', width: '35%' },
]

const timelineData = [
  { time: '12 AM', logs: 500 },
  { time: '03 AM', logs: 300 },
  { time: '06 AM', logs: 800 },
  { time: '09 AM', logs: 2400 },
  { time: '12 PM', logs: 3200 },
  { time: '03 PM', logs: 2800 },
  { time: '06 PM', logs: 1500 },
  { time: '09 PM', logs: 900 },
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
              <span className={`text-[10px] font-bold ${stat.trendColor} leading-none whitespace-nowrap`}>
                {stat.trend}
              </span>
              <span className="text-[7px] xl:text-[8px] font-medium text-slate-400 mt-0.5 whitespace-nowrap">
                {stat.trendText}
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

function LevelBadge({ level }: { level: string }) {
  let styles = ""
  switch (level) {
    case 'Info': styles = "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/30 dark:border-emerald-800"; break;
    case 'Warning': styles = "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-900/30 dark:border-amber-800"; break;
    case 'Error': styles = "text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-900/30 dark:border-rose-800"; break;
    case 'Security': styles = "text-purple-600 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-900/30 dark:border-purple-800"; break;
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[9px] font-bold ${styles}`}>
      <span className="h-1 w-1 rounded-full bg-current"></span>
      {level}
    </span>
  )
}

export default function AdminLogsPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] space-y-6 rounded-[1.25rem] bg-[#eef3ff] p-4 sm:rounded-[1.5rem] sm:p-5 md:rounded-[2rem] md:p-6 dark:bg-[#08122d]">

      {/* Row 1 - Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {topStats.map(s => <StatCard key={s.title} stat={s} />)}
      </div>

      {/* Row 2 - Filters */}
      <div className="flex flex-wrap items-end gap-4 rounded-2xl border border-[#dde6ff] bg-white p-4 shadow-sm dark:border-[#21376f] dark:bg-[#0e1c45]">
        <div className="flex-[1] min-w-[120px]">
          <label className="mb-1 block text-[10px] font-bold text-slate-500">Log Level</label>
          <div className="relative">
            <select className="w-full appearance-none rounded-lg border border-[#dde6ff] bg-slate-50 py-2 pl-3 pr-8 text-xs font-medium text-[#16213f] outline-none dark:border-[#21376f] dark:bg-[#08122d] dark:text-white">
              <option>All Levels</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <div className="flex-[1] min-w-[120px]">
          <label className="mb-1 block text-[10px] font-bold text-slate-500">Module</label>
          <div className="relative">
            <select className="w-full appearance-none rounded-lg border border-[#dde6ff] bg-slate-50 py-2 pl-3 pr-8 text-xs font-medium text-[#16213f] outline-none dark:border-[#21376f] dark:bg-[#08122d] dark:text-white">
              <option>All Modules</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <div className="flex-[1] min-w-[120px]">
          <label className="mb-1 block text-[10px] font-bold text-slate-500">Action Type</label>
          <div className="relative">
            <select className="w-full appearance-none rounded-lg border border-[#dde6ff] bg-slate-50 py-2 pl-3 pr-8 text-xs font-medium text-[#16213f] outline-none dark:border-[#21376f] dark:bg-[#08122d] dark:text-white">
              <option>All Actions</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <div className="flex-[1.5] min-w-[160px]">
          <label className="mb-1 block text-[10px] font-bold text-slate-500">User / Actor</label>
          <div className="relative">
            <input type="text" placeholder="Search user..." className="w-full rounded-lg border border-[#dde6ff] bg-slate-50 py-2 pl-3 pr-8 text-xs font-medium text-[#16213f] outline-none dark:border-[#21376f] dark:bg-[#08122d] dark:text-white placeholder:text-slate-400" />
            <Search className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <div className="flex-[1.5] min-w-[160px]">
          <label className="mb-1 block text-[10px] font-bold text-slate-500">Date Range</label>
          <div className="relative">
            <input type="text" value="01/05/2026 - 28/05/2026" readOnly className="w-full rounded-lg border border-[#dde6ff] bg-slate-50 py-2 pl-3 pr-8 text-xs font-medium text-[#16213f] outline-none dark:border-[#21376f] dark:bg-[#08122d] dark:text-white" />
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

      {/* Row 3 - Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* Left Column - Logs Table */}
        <div className="lg:col-span-8 rounded-2xl border border-[#dde6ff] bg-white p-5 shadow-sm dark:border-[#21376f] dark:bg-[#0e1c45] flex flex-col">
          <SectionTitle title="Logs (82,645)" />
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-[10px]">
              <thead>
                <tr className="border-b border-[#dde6ff] text-slate-500 dark:border-[#21376f]">
                  <th className="pb-2 font-bold w-8">#</th>
                  <th className="pb-2 font-bold w-32">Timestamp <ChevronDown className="inline h-2.5 w-2.5" /></th>
                  <th className="pb-2 font-bold w-20">Level</th>
                  <th className="pb-2 font-bold w-28">Module</th>
                  <th className="pb-2 font-bold w-40">Action</th>
                  <th className="pb-2 font-bold min-w-[160px]">User / Actor</th>
                  <th className="pb-2 font-bold w-28 text-center">IP Address</th>
                  <th className="pb-2 font-bold w-12 text-center">Details</th>
                </tr>
              </thead>
              <tbody>
                {logsData.map((log) => (
                  <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50/50 dark:border-slate-800/50 dark:hover:bg-slate-800/20">
                    <td className="py-2.5 font-bold text-slate-400">{log.id}</td>
                    <td className="py-2.5 font-medium text-slate-600 dark:text-slate-300">{log.time}</td>
                    <td className="py-2.5"><LevelBadge level={log.level} /></td>
                    <td className="py-2.5 font-bold text-[#16213f] dark:text-white">{log.module}</td>
                    <td className="py-2.5 font-medium text-slate-600 dark:text-slate-300">{log.action}</td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold text-white ${log.color}`}>
                          {log.initial}
                        </div>
                        <div>
                          <p className="font-bold text-[#16213f] dark:text-white leading-tight truncate max-w-[140px]">{log.user}</p>
                          <p className="text-[8px] font-medium text-slate-400 leading-tight">{log.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 text-center font-mono text-[9px] text-slate-500">{log.ip}</td>
                    <td className="py-2.5 text-center">
                      <button className="p-1 text-slate-400 hover:text-blue-600 transition-colors">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between border-t border-[#dde6ff] pt-4 dark:border-[#21376f]">
            <p className="text-[10px] font-medium text-slate-500">Showing 1 to 10 of 82,645 logs</p>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <button className="flex h-6 w-6 items-center justify-center rounded border border-[#dde6ff] text-slate-400 hover:bg-slate-50 dark:border-[#21376f] dark:hover:bg-slate-800"><ChevronLeft className="h-3 w-3" /></button>
                <button className="flex h-6 w-6 items-center justify-center rounded bg-blue-600 text-[10px] font-bold text-white">1</button>
                <button className="flex h-6 w-6 items-center justify-center rounded border border-[#dde6ff] text-[10px] font-bold text-slate-600 hover:bg-slate-50 dark:border-[#21376f] dark:text-slate-300 dark:hover:bg-slate-800">2</button>
                <button className="flex h-6 w-6 items-center justify-center rounded border border-[#dde6ff] text-[10px] font-bold text-slate-600 hover:bg-slate-50 dark:border-[#21376f] dark:text-slate-300 dark:hover:bg-slate-800">3</button>
                <span className="px-1 text-slate-400">...</span>
                <button className="flex h-6 w-auto px-2 items-center justify-center rounded border border-[#dde6ff] text-[10px] font-bold text-slate-600 hover:bg-slate-50 dark:border-[#21376f] dark:text-slate-300 dark:hover:bg-slate-800">8265</button>
                <button className="flex h-6 w-6 items-center justify-center rounded border border-[#dde6ff] text-slate-400 hover:bg-slate-50 dark:border-[#21376f] dark:hover:bg-slate-800"><ChevronRight className="h-3 w-3" /></button>
              </div>
              <div className="relative ml-2">
                <select className="appearance-none rounded border border-[#dde6ff] bg-transparent py-1 pl-2 pr-6 text-[10px] font-bold text-slate-600 outline-none dark:border-[#21376f] dark:text-slate-300">
                  <option>10 / page</option>
                  <option>20 / page</option>
                  <option>50 / page</option>
                </select>
                <ChevronDown className="absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Analytics */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Logs by Level */}
          <div className="rounded-2xl border border-[#dde6ff] bg-white p-5 shadow-sm dark:border-[#21376f] dark:bg-[#0e1c45]">
            <SectionTitle title="Logs by Level" />
            <div className="flex items-center justify-between mt-2">
              <div className="h-32 w-32 relative shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={logsByLevelData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={60}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {logsByLevelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-sm font-extrabold text-[#16213f] dark:text-white">82,645</span>
                  <span className="text-[8px] font-bold text-slate-500">Total Logs</span>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-2.5 flex-1 pl-4">
                {logsByLevelData.map(d => (
                  <div key={d.name} className="flex items-center justify-between gap-2 text-[10px] font-bold w-full">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <div className="h-1.5 w-1.5 rounded-sm shrink-0" style={{ backgroundColor: d.color }} />
                      <span className="text-slate-600 dark:text-slate-300 truncate">{d.name}</span>
                    </div>
                    <span className="text-[#16213f] dark:text-white text-right shrink-0">{d.value.toLocaleString()} <span className="text-slate-400 font-medium">({d.percentage})</span></span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Modules */}
          <div className="rounded-2xl border border-[#dde6ff] bg-white p-5 shadow-sm dark:border-[#21376f] dark:bg-[#0e1c45]">
            <SectionTitle title="Top Modules" />
            <div className="space-y-4 mt-4">
              {topModulesData.map((mod, i) => (
                <div key={i}>
                  <div className="flex justify-between text-[10px] font-bold mb-1.5">
                    <span className="text-[#16213f] dark:text-white">{mod.name}</span>
                    <span className="text-slate-500">{mod.value.toLocaleString()} <span className="text-slate-400 font-medium">({mod.percentage})</span></span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: mod.width }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Security Events */}
          <div className="rounded-2xl border border-[#dde6ff] bg-white p-5 shadow-sm dark:border-[#21376f] dark:bg-[#0e1c45]">
            <div className="flex justify-between items-center mb-4">
              <SectionTitle title="Recent Security Events" />
              <button className="text-[10px] font-bold text-blue-600 hover:underline mb-4">View All</button>
            </div>
            <div className="space-y-4">
              
              <div className="flex gap-3 items-start">
                <div className="h-6 w-6 shrink-0 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mt-0.5 dark:bg-rose-900/20 dark:border-rose-900/50">
                  <ShieldAlert className="h-3 w-3 text-rose-500" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="text-[10px] font-bold text-[#16213f] dark:text-white">Failed login attempt</p>
                    <span className="text-[9px] font-bold text-slate-400">04:18 PM</span>
                  </div>
                  <p className="text-[9px] font-medium text-slate-500 mt-0.5">5 failed attempts from IP 45.33.12.98</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="h-6 w-6 shrink-0 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mt-0.5 dark:bg-rose-900/20 dark:border-rose-900/50">
                  <Shield className="h-3 w-3 text-rose-500" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="text-[10px] font-bold text-[#16213f] dark:text-white">Unauthorized access blocked</p>
                    <span className="text-[9px] font-bold text-slate-400">03:47 PM</span>
                  </div>
                  <p className="text-[9px] font-medium text-slate-500 mt-0.5">Access to /admin/settings blocked</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="h-6 w-6 shrink-0 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mt-0.5 dark:bg-rose-900/20 dark:border-rose-900/50">
                  <AlertTriangle className="h-3 w-3 text-rose-500" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="text-[10px] font-bold text-[#16213f] dark:text-white">Suspicious activity detected</p>
                    <span className="text-[9px] font-bold text-slate-400">02:30 PM</span>
                  </div>
                  <p className="text-[9px] font-medium text-slate-500 mt-0.5">Multiple role change attempts detected</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Row 4 - Activity Timeline */}
      <div className="rounded-2xl border border-[#dde6ff] bg-white p-5 shadow-sm dark:border-[#21376f] dark:bg-[#0e1c45]">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
          <SectionTitle title="Activity Timeline (Last 24 Hours)" />
          <div className="text-right flex flex-col items-end sm:-mt-4">
            <p className="text-[10px] font-bold text-[#5c73b5] dark:text-[#8ea1d6]">Total Logs</p>
            <p className="text-2xl font-extrabold text-[#16213f] dark:text-white leading-none mt-1">8,234</p>
            <p className="text-[10px] font-bold text-emerald-600 mt-1">↑ 19.4% <span className="font-medium text-slate-400">vs yesterday</span></p>
          </div>
        </div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData}>
              <defs>
                <linearGradient id="colorLogs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} stroke="#94a3b8" tickFormatter={(v) => v >= 1000 ? `${v/1000}K` : v} />
              <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Area type="monotone" dataKey="logs" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorLogs)" dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  )
}
