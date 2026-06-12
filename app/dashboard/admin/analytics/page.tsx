'use client'

import {
  Users, GraduationCap, Building2, FolderKanban, BadgeCheck,
  CalendarDays, Briefcase, TrendingUp, Star, Target, Trophy, Award,
  Code2, ArrowRight
} from 'lucide-react'
import {
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts'

// ── Mock Data ─────────────────────────────────────────────────────────────

const topStats = [
  { title: "TOTAL STUDENTS", value: "12,458", trend: "+8.3%", icon: Users, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/40" },
  { title: "TOTAL MENTORS", value: "1,248", trend: "+10.6%", icon: GraduationCap, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/40" },
  { title: "TOTAL CORPORATES", value: "856", trend: "+12.4%", icon: Building2, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/40" },
  { title: "TOTAL COLLEGES", value: "312", trend: "+7.2%", icon: Building2, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/40" },
  { title: "TOTAL PROJECTS", value: "18,732", trend: "+14.6%", icon: FolderKanban, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/40" },
  { title: "VERIFIED STUDENTS", value: "9,862", trend: "+7.7%", icon: BadgeCheck, color: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-900/40" },
]

const secondRowStats = [
  { title: "INTERVIEWS CONDUCTED", value: "4,218", trend: "+11.3%", icon: CalendarDays, color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-900/40" },
  { title: "TOTAL PLACEMENTS", value: "1,248", trend: "+10.2%", icon: Briefcase, color: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-900/40" },
  { title: "OVERALL PLACEMENT RATE", value: "19.5%", trend: "+2.1%", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/40" },
  { title: "AVG DES SCORE", value: "72.4", trend: "+4.1", icon: Star, color: "text-rose-500", bg: "bg-rose-100 dark:bg-rose-900/40" },
]

const userDistributionData = [
  { name: 'Students', value: 12458, color: '#3b82f6' },
  { name: 'Mentors', value: 1248, color: '#8b5cf6' },
  { name: 'Corporates', value: 856, color: '#10b981' },
  { name: 'Colleges', value: 312, color: '#f59e0b' },
]

const platformGrowthData = [
  { name: 'Jan', Students: 8000, Mentors: 800, Corporates: 500, Colleges: 200 },
  { name: 'Feb', Students: 9500, Mentors: 950, Corporates: 600, Colleges: 220 },
  { name: 'Mar', Students: 10800, Mentors: 1050, Corporates: 700, Colleges: 250 },
  { name: 'Apr', Students: 11500, Mentors: 1150, Corporates: 800, Colleges: 280 },
  { name: 'May', Students: 12458, Mentors: 1248, Corporates: 856, Colleges: 312 },
]

const desScoreData = [
  { name: '0-20', count: 320, percentage: '2.6%' },
  { name: '20-40', count: 1120, percentage: '9.0%' },
  { name: '40-60', count: 2845, percentage: '22.8%' },
  { name: '60-80', count: 4218, percentage: '33.9%' },
  { name: '80-100', count: 3955, percentage: '31.7%' },
]

const collegeAnalytics = [
  { name: "ABCE Engineering College", students: 1842, verified: 1482, interviews: 623, placed: 198, rate: "24.5%" },
  { name: "Global Tech Institute", students: 1623, verified: 1237, interviews: 512, placed: 156, rate: "22.1%" },
  { name: "VNR University", students: 1415, verified: 1102, interviews: 468, placed: 142, rate: "20.3%" },
  { name: "Silverline College", students: 1286, verified: 1028, interviews: 412, placed: 128, rate: "18.7%" },
  { name: "Techno India College", students: 1102, verified: 848, interviews: 356, placed: 110, rate: "17.2%" },
]

const mentorAnalytics = [
  { name: "Deepak Sharma", assigned: 286, completed: 272, rating: 4.8, verified: 248 },
  { name: "Pooja Verma", assigned: 254, completed: 241, rating: 4.7, verified: 217 },
  { name: "Arjun Mehta", assigned: 232, completed: 219, rating: 4.7, verified: 198 },
  { name: "Neha Iyer", assigned: 210, completed: 198, rating: 4.6, verified: 182 },
  { name: "Rohit Singh", assigned: 198, completed: 187, rating: 4.6, verified: 174 },
]

const corporateAnalytics = [
  { name: "TCS", posted: 234, matches: 3842, interviews: 623, hires: 198, rate: "31.8%" },
  { name: "Infosys", posted: 187, matches: 3221, interviews: 512, hires: 156, rate: "30.5%" },
  { name: "Wipro", posted: 146, matches: 2453, interviews: 412, hires: 128, rate: "31.1%" },
  { name: "Cognizant", posted: 112, matches: 1982, interviews: 356, hires: 110, rate: "30.9%" },
  { name: "Capgemini", posted: 98, matches: 1732, interviews: 312, hires: 96, rate: "30.8%" },
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
  return <h2 className="mb-4 text-base font-extrabold text-[#16213f] dark:text-white">{title}</h2>
}

export default function AdminAnalyticsPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] space-y-6 rounded-[1.25rem] bg-[#eef3ff] p-4 sm:rounded-[1.5rem] sm:p-5 md:rounded-[2rem] md:p-6 dark:bg-[#08122d]">

      {/* Row 1 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {topStats.map(s => <StatCard key={s.title} stat={s} />)}
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {secondRowStats.map(s => <StatCard key={s.title} stat={s} />)}
      </div>

      {/* Row 3 - Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* User Distribution */}
        <div className="rounded-2xl border border-[#dde6ff] bg-white p-5 shadow-sm dark:border-[#21376f] dark:bg-[#0e1c45]">
          <SectionTitle title="User Distribution" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-2">
            <div className="h-40 w-40 relative shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {userDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-extrabold text-[#16213f] dark:text-white">14,874</span>
                <span className="text-[9px] font-bold text-slate-500">Total Users</span>
              </div>
            </div>
            <div className="flex flex-col justify-center space-y-3 w-full sm:flex-1 sm:pl-2">
              {userDistributionData.map(d => (
                <div key={d.name} className="flex items-center justify-between gap-2 text-xs font-bold w-full">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-[#5c73b5] dark:text-[#8ea1d6] truncate">{d.name}</span>
                  </div>
                  <span className="text-[#16213f] dark:text-white text-right shrink-0">{d.value.toLocaleString()}</span>
                  <span className="text-slate-400 text-right shrink-0 w-12">({((d.value/14874)*100).toFixed(1)}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Platform Growth */}
        <div className="rounded-2xl border border-[#dde6ff] bg-white p-5 shadow-sm dark:border-[#21376f] dark:bg-[#0e1c45]">
          <div className="flex justify-between items-start mb-4 gap-2">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-[#16213f] dark:text-white leading-tight">
                Platform Growth
              </h2>
              <p className="text-[10px] font-medium text-slate-500 mt-0.5">
                (New Registrations)
              </p>
            </div>
            <select className="text-[10px] sm:text-xs border rounded pl-2 pr-6 py-1 bg-transparent text-slate-500 border-[#dde6ff] dark:border-[#21376f] shrink-0 outline-none">
              <option>This Year</option>
            </select>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={platformGrowthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} stroke="#94a3b8" tickFormatter={(v) => v >= 1000 ? `${v/1000}K` : v} />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="Students" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Mentors" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Corporates" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Colleges" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            {userDistributionData.map(d => (
              <div key={d.name} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                <div className="h-1.5 w-4 rounded-full" style={{ backgroundColor: d.color }} />
                {d.name}
              </div>
            ))}
          </div>
        </div>

        {/* DES Score Distribution */}
        <div className="rounded-2xl border border-[#dde6ff] bg-white p-5 shadow-sm dark:border-[#21376f] dark:bg-[#0e1c45]">
          <div className="flex justify-between items-start mb-4 gap-2">
            <h2 className="text-sm sm:text-base font-extrabold text-[#16213f] dark:text-white leading-tight">
              DES Score Distribution
            </h2>
            <select className="text-[10px] sm:text-xs border rounded pl-2 pr-6 py-1 bg-transparent text-slate-500 border-[#dde6ff] dark:border-[#21376f] shrink-0 outline-none">
              <option>All Students</option>
            </select>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={desScoreData} margin={{ top: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} stroke="#94a3b8" tickFormatter={(v) => v >= 1000 ? `${v/1000}K` : v} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  {/* Custom labels can go here */}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 4 - 5 Phase Pipeline */}
      <div className="rounded-2xl border border-[#dde6ff] bg-white p-5 shadow-sm dark:border-[#21376f] dark:bg-[#0e1c45]">
        <SectionTitle title="5-Phase Pipeline Analytics" />
        <div className="flex flex-col gap-4 lg:flex-row items-stretch overflow-x-auto pb-2">
          
          {/* Phase 1 */}
          <div className="min-w-[280px] flex-1 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">1</span>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Phase 1 - Verification</span>
            </div>
            <div className="flex justify-between text-center">
              <div>
                <p className="text-[10px] font-bold text-slate-500">Projects<br/>Submitted</p>
                <p className="mt-1 text-sm font-extrabold text-[#16213f] dark:text-white">18,732</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500">Viva<br/>Scheduled</p>
                <p className="mt-1 text-sm font-extrabold text-[#16213f] dark:text-white">12,985</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500">Viva<br/>Completed</p>
                <p className="mt-1 text-sm font-extrabold text-[#16213f] dark:text-white">11,243</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500">Verified<br/>Students</p>
                <p className="mt-1 text-sm font-extrabold text-[#16213f] dark:text-white">9,862</p>
              </div>
            </div>
            <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-3 text-center">
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400">Completion Rate: 87.7%</p>
            </div>
          </div>
          
          <ArrowRight className="hidden lg:block self-center h-5 w-5 text-slate-300" />

          {/* Phase 2 */}
          <div className="min-w-[220px] flex-1 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">2</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Phase 2 - Smart Match</span>
            </div>
            <div className="flex justify-between text-center">
              <div>
                <p className="text-[10px] font-bold text-slate-500">Active Job<br/>Posts</p>
                <p className="mt-1 text-sm font-extrabold text-[#16213f] dark:text-white">2,153</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500">Smart Matches<br/>Generated</p>
                <p className="mt-1 text-sm font-extrabold text-[#16213f] dark:text-white">32,416</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500">Students<br/>Matched</p>
                <p className="mt-1 text-sm font-extrabold text-[#16213f] dark:text-white">12,906</p>
              </div>
            </div>
            <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-3 text-center">
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Match Rate: 40.1%</p>
            </div>
          </div>

          <ArrowRight className="hidden lg:block self-center h-5 w-5 text-slate-300" />

          {/* Phase 3 */}
          <div className="min-w-[220px] flex-1 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500 text-[10px] font-bold text-white">3</span>
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400">Phase 3 - Shortlisting</span>
            </div>
            <div className="flex justify-between text-center">
              <div>
                <p className="text-[10px] font-bold text-slate-500">Candidates<br/>Shortlisted</p>
                <p className="mt-1 text-sm font-extrabold text-[#16213f] dark:text-white">4,218</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500">Recruiter<br/>Views</p>
                <p className="mt-1 text-sm font-extrabold text-[#16213f] dark:text-white">15,632</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500">Mentor Reports<br/>Viewed</p>
                <p className="mt-1 text-sm font-extrabold text-[#16213f] dark:text-white">7,843</p>
              </div>
            </div>
            <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-3 text-center">
              <p className="text-xs font-bold text-purple-600 dark:text-purple-400">Shortlist Rate: 32.6%</p>
            </div>
          </div>

          <ArrowRight className="hidden lg:block self-center h-5 w-5 text-slate-300" />

          {/* Phase 4 */}
          <div className="min-w-[200px] flex-1 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">4</span>
              <span className="text-xs font-bold text-orange-600 dark:text-orange-400">Phase 4 - Interviews</span>
            </div>
            <div className="flex justify-between text-center">
              <div>
                <p className="text-[10px] font-bold text-slate-500">Interviews<br/>Scheduled</p>
                <p className="mt-1 text-sm font-extrabold text-[#16213f] dark:text-white">4,812</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500">Interviews<br/>Completed</p>
                <p className="mt-1 text-sm font-extrabold text-[#16213f] dark:text-white">4,218</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500">Offer<br/>Rate</p>
                <p className="mt-1 text-sm font-extrabold text-[#16213f] dark:text-white">29.6%</p>
              </div>
            </div>
            <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-3 text-center">
              <p className="text-xs font-bold text-orange-600 dark:text-orange-400">Completion Rate: 87.7%</p>
            </div>
          </div>

          <ArrowRight className="hidden lg:block self-center h-5 w-5 text-slate-300" />

          {/* Phase 5 */}
          <div className="min-w-[200px] flex-1 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-500 text-[10px] font-bold text-white">5</span>
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400">Phase 5 - Placements</span>
            </div>
            <div className="flex justify-between text-center">
              <div>
                <p className="text-[10px] font-bold text-slate-500">Students<br/>Placed</p>
                <p className="mt-1 text-sm font-extrabold text-[#16213f] dark:text-white">1,248</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500">Placement<br/>Percentage</p>
                <p className="mt-1 text-sm font-extrabold text-[#16213f] dark:text-white">19.5%</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500">Top Hiring<br/>Companies</p>
                <p className="mt-1 text-sm font-extrabold text-[#16213f] dark:text-white">243</p>
              </div>
            </div>
            <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-3 text-center">
              <p className="text-xs font-bold text-teal-600 dark:text-teal-400">Placement Rate Improved: ↑ 2.1%</p>
            </div>
          </div>

        </div>
      </div>

      {/* Row 5 - Tables */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* College Analytics */}
        <div className="rounded-2xl border border-[#dde6ff] bg-white p-5 shadow-sm dark:border-[#21376f] dark:bg-[#0e1c45]">
          <SectionTitle title="College Analytics (Top 5)" />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead>
                <tr className="border-b border-[#dde6ff] text-slate-500 dark:border-[#21376f]">
                  <th className="pb-2 font-bold">College</th>
                  <th className="pb-2 font-bold text-right">Students</th>
                  <th className="pb-2 font-bold text-right">Verified Students</th>
                  <th className="pb-2 font-bold text-right">Interviews</th>
                  <th className="pb-2 font-bold text-right">Placed</th>
                  <th className="pb-2 font-bold text-right">Placement Rate</th>
                </tr>
              </thead>
              <tbody>
                {collegeAnalytics.map((c, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-none dark:border-slate-800">
                    <td className="py-2.5 font-bold text-[#16213f] dark:text-white">{c.name}</td>
                    <td className="py-2.5 text-right font-medium text-slate-600 dark:text-slate-300">{c.students.toLocaleString()}</td>
                    <td className="py-2.5 text-right font-medium text-slate-600 dark:text-slate-300">{c.verified.toLocaleString()}</td>
                    <td className="py-2.5 text-right font-medium text-slate-600 dark:text-slate-300">{c.interviews}</td>
                    <td className="py-2.5 text-right font-medium text-slate-600 dark:text-slate-300">{c.placed}</td>
                    <td className="py-2.5 text-right font-medium text-slate-600 dark:text-slate-300">{c.rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="mt-4 flex w-full items-center justify-center gap-1 text-xs font-bold text-[#4f8cff] hover:underline">
            View all colleges <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {/* Mentor Analytics */}
        <div className="rounded-2xl border border-[#dde6ff] bg-white p-5 shadow-sm dark:border-[#21376f] dark:bg-[#0e1c45]">
          <SectionTitle title="Mentor Analytics (Top 5)" />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead>
                <tr className="border-b border-[#dde6ff] text-slate-500 dark:border-[#21376f]">
                  <th className="pb-2 font-bold">Mentor</th>
                  <th className="pb-2 font-bold text-right">Assigned Vivas</th>
                  <th className="pb-2 font-bold text-right">Completed Vivas</th>
                  <th className="pb-2 font-bold text-right">Avg Rating</th>
                  <th className="pb-2 font-bold text-right">Verified Students</th>
                </tr>
              </thead>
              <tbody>
                {mentorAnalytics.map((m, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-none dark:border-slate-800">
                    <td className="py-2.5 font-bold text-[#16213f] dark:text-white">{m.name}</td>
                    <td className="py-2.5 text-right font-medium text-slate-600 dark:text-slate-300">{m.assigned}</td>
                    <td className="py-2.5 text-right font-medium text-slate-600 dark:text-slate-300">{m.completed}</td>
                    <td className="py-2.5 text-right font-medium text-amber-500 flex items-center justify-end gap-1">{m.rating} <Star className="h-3 w-3 fill-current" /></td>
                    <td className="py-2.5 text-right font-medium text-slate-600 dark:text-slate-300">{m.verified}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="mt-4 flex w-full items-center justify-center gap-1 text-xs font-bold text-[#4f8cff] hover:underline">
            View all mentors <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {/* Corporate Analytics */}
        <div className="rounded-2xl border border-[#dde6ff] bg-white p-5 shadow-sm dark:border-[#21376f] dark:bg-[#0e1c45]">
          <SectionTitle title="Corporate Analytics (Top 5)" />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead>
                <tr className="border-b border-[#dde6ff] text-slate-500 dark:border-[#21376f]">
                  <th className="pb-2 font-bold">Company</th>
                  <th className="pb-2 font-bold text-right">Jobs Posted</th>
                  <th className="pb-2 font-bold text-right">Matches</th>
                  <th className="pb-2 font-bold text-right">Interviews</th>
                  <th className="pb-2 font-bold text-right">Hires</th>
                  <th className="pb-2 font-bold text-right">Hire Rate</th>
                </tr>
              </thead>
              <tbody>
                {corporateAnalytics.map((c, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-none dark:border-slate-800">
                    <td className="py-2.5 font-bold text-[#16213f] dark:text-white">{c.name}</td>
                    <td className="py-2.5 text-right font-medium text-slate-600 dark:text-slate-300">{c.posted}</td>
                    <td className="py-2.5 text-right font-medium text-slate-600 dark:text-slate-300">{c.matches.toLocaleString()}</td>
                    <td className="py-2.5 text-right font-medium text-slate-600 dark:text-slate-300">{c.interviews}</td>
                    <td className="py-2.5 text-right font-medium text-slate-600 dark:text-slate-300">{c.hires}</td>
                    <td className="py-2.5 text-right font-medium text-slate-600 dark:text-slate-300">{c.rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="mt-4 flex w-full items-center justify-center gap-1 text-xs font-bold text-[#4f8cff] hover:underline">
            View all corporates <ArrowRight className="h-3 w-3" />
          </button>
        </div>

      </div>

      {/* Row 6 - Key Insights */}
      <div>
        <SectionTitle title="Key Insights" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <div className="flex items-center gap-3 rounded-2xl border border-[#dde6ff] bg-white p-4 shadow-sm dark:border-[#21376f] dark:bg-[#0e1c45]">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
              <Trophy className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#5c73b5] dark:text-[#8ea1d6]">Top Performing College</p>
              <p className="text-xs font-extrabold text-[#16213f] dark:text-white">ABCE Engineering College</p>
              <p className="text-[10px] font-medium text-slate-500">Placement Rate: 24.5%</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-[#dde6ff] bg-white p-4 shadow-sm dark:border-[#21376f] dark:bg-[#0e1c45]">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/40">
              <Award className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#5c73b5] dark:text-[#8ea1d6]">Top Mentor</p>
              <p className="text-xs font-extrabold text-[#16213f] dark:text-white">Deepak Sharma</p>
              <p className="text-[10px] font-medium text-slate-500 flex items-center gap-1">Avg Rating: 4.8 <Star className="h-2 w-2 fill-amber-500 text-amber-500" /></p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-[#dde6ff] bg-white p-4 shadow-sm dark:border-[#21376f] dark:bg-[#0e1c45]">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#5c73b5] dark:text-[#8ea1d6]">Top Hiring Company</p>
              <p className="text-xs font-extrabold text-[#16213f] dark:text-white">TCS</p>
              <p className="text-[10px] font-medium text-slate-500">Hires: 198</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-[#dde6ff] bg-white p-4 shadow-sm dark:border-[#21376f] dark:bg-[#0e1c45]">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
              <Code2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#5c73b5] dark:text-[#8ea1d6]">Most Demanded Skill</p>
              <p className="text-xs font-extrabold text-[#16213f] dark:text-white">React.js</p>
              <p className="text-[10px] font-medium text-slate-500">Demand Score: 98/100</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-[#dde6ff] bg-white p-4 shadow-sm dark:border-[#21376f] dark:bg-[#0e1c45]">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/40">
              <Star className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#5c73b5] dark:text-[#8ea1d6]">Average DES Score</p>
              <p className="text-xs font-extrabold text-[#16213f] dark:text-white">72.4 <span className="text-[10px] text-slate-400 font-medium">/ 100</span></p>
              <p className="text-[10px] font-bold text-emerald-600">↑ 4.1% <span className="text-slate-400 font-medium">vs last year</span></p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-[#dde6ff] bg-white p-4 shadow-sm dark:border-[#21376f] dark:bg-[#0e1c45]">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/40">
              <Target className="h-5 w-5 text-rose-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#5c73b5] dark:text-[#8ea1d6]">Overall Placement Rate</p>
              <p className="text-xs font-extrabold text-[#16213f] dark:text-white">19.5%</p>
              <p className="text-[10px] font-bold text-emerald-600">↑ 2.1% <span className="text-slate-400 font-medium">vs last year</span></p>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
