"use client"

import React, { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { mentorService } from "@/services/mentor.service"
import type { SkillEvaluationItem } from "@/lib/types"
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Download,
  ShieldCheck,
  Star,
  Brain,
  Code2,
  Cpu,
  Globe,
  Database,
  Network,
  ArrowDownRight,
  TrendingUp,
} from "lucide-react"

// Types & Configs
type ScoreBand = {
  label: string
  range: string
  count: number
  percent: number
  color: string
}

const SCORE_BANDS: ScoreBand[] = [
  { label: "Excellent", range: "36-40", count: 45, percent: 36, color: "#2FB86A" },
  { label: "Good", range: "28-35", count: 52, percent: 42, color: "#2E7CF6" },
  { label: "Average", range: "20-27", count: 18, percent: 15, color: "#F6AD2E" },
  { label: "Needs Improvement", range: "<20", count: 9, percent: 7, color: "#F25C54" },
]

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("All Time")
  const [evaluations, setEvaluations] = useState<SkillEvaluationItem[]>([])

  useEffect(() => {
    mentorService.getEvaluations().then(data => setEvaluations(data || [])).catch(() => setEvaluations([]))
  }, [])

  const stats = useMemo(() => {
    const total = evaluations.length
    const completed = evaluations.filter(e => e.status === "evaluated").length
    const pending = evaluations.filter(e => e.status === "pending").length
    const avgScore = total > 0 ? evaluations.reduce((acc, curr) => acc + (curr.total_score || 0), 0) / completed || 0 : 0
    const avgRating = ((avgScore / 100) * 5).toFixed(1)
    return { total, completed, pending, avgRating }
  }, [evaluations])

  const scoreBands = useMemo(() => {
    let excellent = 0, good = 0, average = 0, needsImprovement = 0
    evaluations.forEach(e => {
      if (e.status !== "evaluated") return
      const s = e.total_score || 0
      if (s >= 90) excellent++
      else if (s >= 70) good++
      else if (s >= 50) average++
      else needsImprovement++
    })
    const totalCompleted = stats.completed || 1 // prevent div by zero
    return [
      { label: "Excellent", range: "90-100", count: excellent, percent: Math.round((excellent / totalCompleted) * 100), color: "#2FB86A" },
      { label: "Good", range: "70-89", count: good, percent: Math.round((good / totalCompleted) * 100), color: "#2E7CF6" },
      { label: "Average", range: "50-69", count: average, percent: Math.round((average / totalCompleted) * 100), color: "#F6AD2E" },
      { label: "Needs Improvement", range: "<50", count: needsImprovement, percent: Math.round((needsImprovement / totalCompleted) * 100), color: "#F25C54" },
    ]
  }, [evaluations, stats.completed])

  const topSkills = useMemo(() => {
    const counts: Record<string, number> = {}
    evaluations.forEach(e => {
      if (e.project?.skill_domain) {
        e.project.skill_domain.split(",").map(s => s.trim()).filter(Boolean).forEach(skill => {
          counts[skill] = (counts[skill] || 0) + 1
        })
      }
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => ({ name: entry[0], count: entry[1] }))
  }, [evaluations])

  const recentActivities = useMemo(() => {
    return [...evaluations]
      .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())
      .slice(0, 4)
      .map(e => ({
        id: e.evaluation_id,
        isCompleted: e.status === "evaluated",
        studentName: e.student?.name || "Student",
        projectName: e.project?.title || "Untitled Project",
        date: new Date(e.updated_at || e.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' })
      }))
  }, [evaluations])

  // Download logic (creates a CSV download)
  const handleDownload = () => {
    const data = [
      ["DishaSetu Mentor Performance Report", ""],
      ["Date Range", dateRange],
      ["", ""],
      ["Metric", "Value"],
      ["Total Evaluations", stats.total.toString()],
      ["Completed Vivas", stats.completed.toString()],
      ["Pending Reviews", stats.pending.toString()],
      ["Average Student Rating", `${stats.avgRating}/5`],
      ["Projects Verified", stats.completed.toString()],
      ["", ""],
      ["Score Distribution", ""],
      ...scoreBands.map(b => [`${b.label} (${b.range})`, `${b.count} (${b.percent}%)`]),
      ["", ""],
      ["Top Skills", "Evaluated count"],
      ...topSkills.map(s => [s.name, s.count.toString()])
    ]

    const csvContent = "data:text/csv;charset=utf-8," 
      + data.map(e => e.join(",")).join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `Mentor_Report_${dateRange.replace(/ /g, "_")}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6 pb-8 text-slate-800 dark:text-white/90 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      
      {/* Header Card */}
      <div className="rounded-3xl border border-blue-100 bg-blue-50/50 dark:bg-[#0f1428] dark:border-white/5 p-6 mb-2 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Reports & Analytics 📊
          </h1>
          <p className="text-sm font-medium text-slate-600 dark:text-white/60 mt-1 flex items-center gap-1.5">
            Track performance, evaluations, and activity insights ✨
          </p>
          
          <div className="flex flex-wrap items-center gap-3 mt-5">
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-100/80 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 text-xs font-bold shadow-sm">
              🎯 Monthly Stats
            </div>
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-bold shadow-sm">
              📈 Performance Tracking
            </div>
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-100/80 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 text-xs font-bold shadow-sm">
              🚀 Mentor Impact
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Picker */}
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="appearance-none bg-white dark:bg-[#13141F] border border-slate-200 dark:border-white/10 rounded-full pl-9 pr-8 py-2 text-xs font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 cursor-pointer"
            >
              <option value="May 1 - May 31, 2025">May 1 – May 31, 2025</option>
              <option value="April 1 - April 30, 2025">April 1 – April 30, 2025</option>
              <option value="Last 30 Days">Last 30 Days</option>
            </select>
            <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 rounded-full bg-[#7a61ff] dark:bg-[#7a61ff] px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-purple-500/15 hover:bg-[#684eff] dark:hover:bg-[#684eff] transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            Download Report
          </button>
        </div>
      </div>

      {/* Row 1: Summary Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryCard
          title="Total Evaluations"
          value={stats.total.toString()}
          percentage="All Time"
          trend="up"
          note=""
          icon={ClipboardCheck}
          iconBg="bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400"
        />
        <SummaryCard
          title="Completed Vivas"
          value={stats.completed.toString()}
          percentage={`${Math.round((stats.completed / (stats.total || 1)) * 100)}%`}
          trend="up"
          note="completion rate"
          icon={CheckCircle2}
          iconBg="bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
        />
        <SummaryCard
          title="Pending Reviews"
          value={stats.pending.toString()}
          percentage="Needs action"
          trend="down"
          note=""
          icon={Clock3}
          iconBg="bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400"
        />
        <SummaryCard
          title="Avg. Student Rating"
          value={`${stats.avgRating} / 5`}
          percentage="Based on scores"
          trend="up"
          note=""
          icon={Star}
          iconBg="bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400"
        />
        <SummaryCard
          title="Projects Verified"
          value={stats.completed.toString()}
          percentage="Total verified"
          trend="up"
          note=""
          icon={ShieldCheck}
          iconBg="bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400"
        />
      </div>

      {/* Row 2: Charts & Skills */}
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1.1fr_0.9fr]">
        
        {/* Evaluations Overview Chart */}
        <div className="rounded-[24px] border border-slate-200 dark:border-transparent bg-white dark:bg-[#0f1428] p-5 shadow-[0_12px_35px_rgba(46,60,120,0.05)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-800 dark:text-white">Evaluations Overview</h2>
            <div className="flex items-center gap-3 text-[11px] font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#2FB86A]" />
                <span className="text-slate-500 dark:text-white/60">Completed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#F6AD2E]" />
                <span className="text-slate-500 dark:text-white/60">Pending</span>
              </div>
            </div>
          </div>
          
          {/* Custom SVG Line Chart */}
          <div className="relative w-full h-[180px]">
            <svg className="w-full h-full" viewBox="0 0 500 180" preserveAspectRatio="none">
              <defs>
                {/* Gradients */}
                <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2FB86A" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#2FB86A" stopOpacity="0.00" />
                </linearGradient>
                <linearGradient id="pendingGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F6AD2E" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke="currentColor" className="text-slate-100 dark:text-white/[0.04]" strokeDasharray="3" />
              <line x1="0" y1="75" x2="500" y2="75" stroke="currentColor" className="text-slate-100 dark:text-white/[0.04]" strokeDasharray="3" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="currentColor" className="text-slate-100 dark:text-white/[0.04]" strokeDasharray="3" />
              <line x1="0" y1="165" x2="500" y2="165" stroke="currentColor" className="text-slate-100 dark:text-white/[0.04]" strokeDasharray="3" />

              {/* Completed Area & Line */}
              <path
                d="M 10 145 Q 125 70 240 85 T 480 35 L 480 165 L 10 165 Z"
                fill="url(#completedGrad)"
              />
              <path
                d="M 10 145 Q 125 70 240 85 T 480 35"
                fill="none"
                stroke="#2FB86A"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Pending Area & Line */}
              <path
                d="M 10 160 Q 125 115 240 125 T 480 135 L 480 165 L 10 165 Z"
                fill="url(#pendingGrad)"
              />
              <path
                d="M 10 160 Q 125 115 240 125 T 480 135"
                fill="none"
                stroke="#F6AD2E"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Data points */}
              <circle cx="10" cy="145" r="4" fill="#2FB86A" stroke="currentColor" className="text-white dark:text-[#0f1428]" strokeWidth="1.5" />
              <circle cx="125" cy="85" r="4" fill="#2FB86A" stroke="currentColor" className="text-white dark:text-[#0f1428]" strokeWidth="1.5" />
              <circle cx="240" cy="85" r="4" fill="#2FB86A" stroke="currentColor" className="text-white dark:text-[#0f1428]" strokeWidth="1.5" />
              <circle cx="360" cy="98" r="4" fill="#2FB86A" stroke="currentColor" className="text-white dark:text-[#0f1428]" strokeWidth="1.5" />
              <circle cx="480" cy="35" r="4" fill="#2FB86A" stroke="currentColor" className="text-white dark:text-[#0f1428]" strokeWidth="1.5" />

              <circle cx="10" cy="160" r="4" fill="#F6AD2E" stroke="currentColor" className="text-white dark:text-[#0f1428]" strokeWidth="1.5" />
              <circle cx="125" cy="122" r="4" fill="#F6AD2E" stroke="currentColor" className="text-white dark:text-[#0f1428]" strokeWidth="1.5" />
              <circle cx="240" cy="125" r="4" fill="#F6AD2E" stroke="currentColor" className="text-white dark:text-[#0f1428]" strokeWidth="1.5" />
              <circle cx="360" cy="130" r="4" fill="#F6AD2E" stroke="currentColor" className="text-white dark:text-[#0f1428]" strokeWidth="1.5" />
              <circle cx="480" cy="135" r="4" fill="#F6AD2E" stroke="currentColor" className="text-white dark:text-[#0f1428]" strokeWidth="1.5" />
            </svg>
          </div>

          {/* X Axis Labels */}
          <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-white/40 px-2 mt-2">
            <span>May 1-7</span>
            <span>May 8-14</span>
            <span>May 15-21</span>
            <span>May 22-28</span>
            <span>May 29-31</span>
          </div>
        </div>

        {/* Score Distribution Chart */}
        <div className="rounded-[24px] border border-slate-200 dark:border-transparent bg-white dark:bg-[#0f1428] p-5 shadow-[0_12px_35px_rgba(46,60,120,0.05)]">
          <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-5">Score Distribution</h2>
          
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Doughnut graph using CSS conic-gradient */}
            <div className="relative flex aspect-square w-32 items-center justify-center shrink-0">
              <div
                className="absolute inset-0 rounded-full shadow-[inset_0_0_0_12px_rgba(255,255,255,0.05)]"
                style={{
                  background:
                    "conic-gradient(#2FB86A 0deg 130deg, #2E7CF6 130deg 281.2deg, #F6AD2E 281.2deg 335.2deg, #F25C54 335.2deg 360deg)",
                }}
              />
              <div className="absolute inset-[16px] rounded-full border border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-[#0d1020] shadow-inner" />
              <div className="relative z-10 text-center">
                <div className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">{stats.completed}</div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/45">
                  Evaluations
                </div>
              </div>
            </div>

            {/* Legends */}
            <div className="space-y-2.5 w-full">
              {scoreBands.map((band) => (
                <div key={band.label} className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: band.color }} />
                  <div className="flex-1 min-w-0 flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-500 dark:text-white/60 truncate pr-2">
                      {band.label} ({band.range})
                    </span>
                    <span className="text-slate-800 dark:text-white shrink-0 font-bold">
                      {band.count} ({band.percent}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Skills Evaluated */}
        <div className="rounded-[24px] border border-slate-200 dark:border-transparent bg-white dark:bg-[#0f1428] p-5 shadow-[0_12px_35px_rgba(46,60,120,0.05)] flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Top Skills Evaluated</h2>
            
            <div className="space-y-4">
              {topSkills.length > 0 ? topSkills.map((s, i) => {
                const icons = [Cpu, Globe, Brain, Database, Network]
                const colors = ["text-amber-500", "text-blue-500", "text-purple-500", "text-emerald-500", "text-red-500"]
                return (
                  <SkillRow key={s.name} icon={icons[i % 5]} name={s.name} count={s.count} total={stats.total || 1} color={colors[i % 5]} />
                )
              }) : (
                <div className="text-slate-400 text-xs py-4 text-center">No skills evaluated yet.</div>
              )}
            </div>
          </div>

          <Link
            href="/dashboard/mentor/evaluations"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-[#c8ee44] hover:underline mt-4 cursor-pointer"
          >
            View all skills <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Row 3: Table & Monthly Summary */}
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        
        {/* Recent Activity Report */}
        <div className="rounded-[24px] border border-slate-200 dark:border-transparent bg-white dark:bg-[#0f1428] p-5 shadow-[0_12px_35px_rgba(46,60,120,0.05)]">
          <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Recent Activity Report</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5 pb-3">
                  <th className="text-slate-400 dark:text-white/45 py-2 font-bold uppercase tracking-wider">Activity</th>
                  <th className="text-slate-400 dark:text-white/45 py-2 font-bold uppercase tracking-wider">Details</th>
                  <th className="text-slate-400 dark:text-white/45 py-2 font-bold uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.03] text-slate-700 dark:text-white/80">
                {recentActivities.length > 0 ? recentActivities.map((act) => (
                  <ActivityRow
                    key={act.id}
                    icon={act.isCompleted ? CheckCircle2 : Clock3}
                    iconColor={act.isCompleted ? "text-emerald-500" : "text-amber-500"}
                    activity={act.isCompleted ? "Evaluation Completed" : "Review Pending"}
                    details={`${act.studentName} – ${act.projectName}`}
                    date={act.date}
                  />
                )) : (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-400">No recent activity.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Summary */}
        <div className="rounded-[24px] border border-slate-200 dark:border-transparent bg-white dark:bg-[#0f1428] p-5 shadow-[0_12px_35px_rgba(46,60,120,0.05)] flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-2">Monthly Summary</h2>
            <p className="text-xs text-slate-400 dark:text-white/45 mb-5">
              You have been active on <span className="font-bold text-[#7a61ff] dark:text-[#c8ee44]">DishaSetu</span> for 28 days this month.
            </p>

            <div className="space-y-4">
              <SummaryMetric icon={CheckCircle2} color="text-emerald-500" label="Evaluations completed" value={stats.completed.toString()} />
              <SummaryMetric icon={Star} color="text-amber-500" label="Average feedback quality score" value={`${stats.avgRating} / 5`} />
              <SummaryMetric icon={ShieldCheck} color="text-blue-500" label="Completion rate" value={`${Math.round((stats.completed / (stats.total || 1)) * 100)}%`} />
            </div>
          </div>

          <div className="mt-6 p-4 rounded-2xl border border-amber-200/50 bg-amber-50/50 dark:border-amber-500/10 dark:bg-amber-500/5 text-xs text-amber-800 dark:text-amber-300 font-semibold">
            Great job! You are among the top <span className="font-black underline text-amber-600 dark:text-[#c8ee44]">10% most active mentors</span>.
          </div>
        </div>

      </div>

    </div>
  )
}

// Sub components
function SummaryCard({
  title,
  value,
  percentage,
  trend,
  note,
  icon: Icon,
  iconBg,
}: {
  title: string
  value: string
  percentage: string
  trend: "up" | "down"
  note: string
  icon: any
  iconBg: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-transparent bg-white dark:bg-[#0f1428] p-4 shadow-[0_12px_35px_rgba(46,60,120,0.05)] flex items-start justify-between gap-3">
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold text-slate-400 dark:text-white/45 uppercase tracking-wider block">
          {title}
        </span>
        <span className="text-2xl font-black text-slate-900 dark:text-white block">
          {value}
        </span>
        <div className="flex items-center gap-1 text-[10px] font-bold">
          {trend === "up" ? (
            <TrendingUp className="h-3 w-3 text-emerald-500" />
          ) : (
            <ArrowDownRight className="h-3 w-3 text-rose-500" />
          )}
          <span className={trend === "up" ? "text-emerald-500" : "text-rose-500"}>
            {percentage}
          </span>
          <span className="text-slate-400 dark:text-white/35 font-semibold">
            {note}
          </span>
        </div>
      </div>
      <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center ${iconBg}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  )
}

function SkillRow({
  icon: Icon,
  name,
  count,
  total,
  color,
}: {
  icon: any
  name: string
  count: number
  total: number
  color: string
}) {
  const percentage = Math.round((count / total) * 100)
  
  return (
    <div className="flex items-center justify-between text-xs font-semibold">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={`h-7 w-7 rounded-lg bg-slate-50 dark:bg-white/5 flex items-center justify-center shrink-0 ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-slate-800 dark:text-white truncate">
          {name}
        </span>
      </div>
      <span className="text-slate-900 dark:text-white font-bold ml-3">
        {count}
      </span>
    </div>
  )
}

function ActivityRow({
  icon: Icon,
  iconColor,
  activity,
  details,
  date,
}: {
  icon: any
  iconColor: string
  activity: string
  details: string
  date: string
}) {
  return (
    <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-all">
      <td className="py-3.5 pr-3">
        <div className="flex items-center gap-2.5">
          <Icon className={`h-4 w-4 shrink-0 ${iconColor}`} />
          <span className="text-slate-800 dark:text-white font-bold">{activity}</span>
        </div>
      </td>
      <td className="py-3.5 px-3 text-slate-500 dark:text-white/60">
        {details}
      </td>
      <td className="py-3.5 pl-3 text-slate-400 dark:text-white/40">
        {date}
      </td>
    </tr>
  )
}

function SummaryMetric({
  icon: Icon,
  color,
  label,
  value,
}: {
  icon: any
  color: string
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between text-xs font-semibold">
      <div className="flex items-center gap-2.5">
        <Icon className={`h-4 w-4 shrink-0 ${color}`} />
        <span className="text-slate-550 dark:text-white/70">{label}</span>
      </div>
      <span className="text-slate-900 dark:text-white font-bold">{value}</span>
    </div>
  )
}
