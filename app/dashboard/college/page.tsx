'use client'

import { useEffect, useState } from 'react'
import {
  BadgeCheck,
  Building2,
  GraduationCap,
  Loader2,
  Sparkles,
  TrendingUp,
  Trophy,
  Users,
} from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL ?? ''
function getToken() { return localStorage.getItem('access_token') ?? '' }

interface Analytics {
  total_students: number
  placed_count: number
  placement_rate_pct: number
  avg_des_score: number
  verified_count: number
  viva_scheduled_count: number
  no_viva_count: number
  des_distribution: { range: string; count: number }[]
  top_companies: { company: string; placements: number }[]
}

interface Placement {
  student_id: string
  student_name: string
  student_email: string
  des_score: number
  badge: string
  job_title: string
  company_name: string
  placed_at: string
}

interface Student {
  student_id: string
  name: string
  email: string
  des_score: number
  badge: string
  viva_status: 'verified' | 'scheduled' | 'none'
}

const BADGE_COLOR: Record<string, string> = {
  Diamond: 'bg-gradient-to-r from-sky-400 to-violet-500 text-white',
  Gold:    'bg-gradient-to-r from-amber-400 to-orange-400 text-white',
  Silver:  'bg-gradient-to-r from-slate-300 to-slate-400 text-white',
  Bronze:  'bg-gradient-to-r from-amber-700 to-amber-500 text-white',
}

const VIVA_PILL: Record<string, { label: string; color: string }> = {
  verified:  { label: 'Verified ✓',    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  scheduled: { label: 'Viva Scheduled', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  none:      { label: 'No Viva',        color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
}

function StatCard({ label, value, hint, icon: Icon, accent }: {
  label: string; value: string | number; hint?: string; icon: React.ElementType; accent?: string
}) {
  return (
    <article className={`rounded-3xl border p-5 shadow-[0_10px_28px_rgba(66,98,170,0.12)] dark:shadow-[0_8px_24px_rgba(3,8,26,0.28)] ${accent ?? 'border-[#d4def8] bg-white dark:border-[#223067] dark:bg-[#111d49]'}`}>
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf3ff] text-[#4f8cff] dark:bg-[#1a2858] dark:text-[#8aa9ff]">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-xs font-semibold uppercase tracking-wide text-[#7d8db7] dark:text-[#7f92c6]">{label}</p>
      <p className="mt-1 text-3xl font-black tracking-tight text-[#16213f] dark:text-white">{value}</p>
      {hint && <p className="mt-1 text-xs font-medium text-[#5f6f98] dark:text-[#93a4d1]">{hint}</p>}
    </article>
  )
}

export default function CollegeDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [placements, setPlacements] = useState<Placement[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'placements' | 'roster'>('overview')
  const [error, setError] = useState('')

  useEffect(() => {
    const h = { Authorization: `Bearer ${getToken()}` }
    Promise.all([
      fetch(`${API}/api/v1/college/analytics`, { headers: h }).then((r) => r.json()),
      fetch(`${API}/api/v1/college/placements`, { headers: h }).then((r) => r.json()),
      fetch(`${API}/api/v1/college/students`, { headers: h }).then((r) => r.json()),
    ])
      .then(([a, p, s]) => { setAnalytics(a); setPlacements(p); setStudents(s) })
      .catch(() => setError('Could not load college data.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[#4f8cff]" />
    </div>
  )

  const desMax = analytics ? Math.max(...(analytics.des_distribution.map((b) => b.count)), 1) : 1

  return (
    <div className="min-h-[calc(100vh-80px)] rounded-[1.25rem] bg-[#eef3ff] p-4 shadow-sm sm:rounded-[1.5rem] sm:p-5 md:rounded-[2rem] md:p-6 dark:bg-[#101d49]">
      <div className="mx-auto max-w-[1400px] space-y-6">

        {/* Header */}
        <section className="rounded-3xl border border-[#d4def8] bg-white p-5 shadow-[0_10px_28px_rgba(66,98,170,0.12)] sm:p-6 dark:border-[#223067] dark:bg-[#111d49]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#5c73b5] dark:text-[#8ea1d6]">
                <Sparkles className="h-4 w-4 text-[#17cf73]" />
                Phase 5 — Institutional Loop
              </p>
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#16213f] sm:text-3xl dark:text-white">
                T&amp;P Officer Dashboard
              </h1>
              <p className="mt-1 text-sm text-[#5f6f98] dark:text-[#93a4d1]">
                Real-time placements, DES analytics, and student verification progress.
              </p>
            </div>
            <div className="inline-flex rounded-xl bg-[#edf3ff] p-1 dark:bg-[#1a2858]">
              {(['overview', 'placements', 'roster'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-lg px-4 py-2 text-xs font-bold capitalize transition-colors ${
                    activeTab === tab
                      ? 'bg-white text-[#16213f] shadow-sm dark:bg-[#101d49] dark:text-white'
                      : 'text-[#5872b6] dark:text-[#9db0df]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30">{error}</div>
        )}

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && analytics && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Total Students" value={analytics.total_students} icon={Users} />
              <StatCard
                label="Placed Students"
                value={analytics.placed_count}
                hint={`${analytics.placement_rate_pct}% placement rate`}
                icon={Trophy}
                accent="border-[#17cf73]/40 bg-[#effcf4] dark:border-[#17cf73]/50 dark:bg-[#113226]"
              />
              <StatCard label="Avg DES Score" value={analytics.avg_des_score.toFixed(1)} hint="Across all students" icon={TrendingUp} />
              <StatCard label="Verified Students" value={analytics.verified_count} hint={`${analytics.viva_scheduled_count} viva scheduled`} icon={BadgeCheck} />
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              {/* DES Distribution */}
              <section className="rounded-3xl border border-[#d4def8] bg-white p-5 shadow-[0_10px_28px_rgba(66,98,170,0.12)] dark:border-[#223067] dark:bg-[#111d49]">
                <h2 className="mb-5 text-lg font-bold text-[#16213f] dark:text-white">DES Score Distribution</h2>
                <div className="space-y-4">
                  {analytics.des_distribution.map((bucket) => (
                    <div key={bucket.range} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-[#22335f] dark:text-[#d7e3ff]">{bucket.range}</span>
                        <span className="font-black text-[#16213f] dark:text-white">{bucket.count}</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-[#deebff] dark:bg-[#13234f]">
                        <div
                          className="h-full rounded-full bg-[#4f8cff] transition-all"
                          style={{ width: `${(bucket.count / desMax) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Verification Pie-style bars */}
                <div className="mt-6 space-y-3 border-t border-[#eef3ff] pt-5 dark:border-[#1d2f60]">
                  <h3 className="text-sm font-bold text-[#16213f] dark:text-white">Verification Status</h3>
                  {[
                    { label: 'Verified ✓', count: analytics.verified_count, color: 'bg-emerald-500' },
                    { label: 'Viva Scheduled', count: analytics.viva_scheduled_count, color: 'bg-blue-500' },
                    { label: 'No Viva Yet', count: analytics.no_viva_count, color: 'bg-slate-300 dark:bg-slate-600' },
                  ].map((item) => (
                    <div key={item.label} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-[#5f6f98] dark:text-[#93a4d1]">
                        <span>{item.label}</span>
                        <span className="text-[#16213f] dark:text-white">{item.count}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[#deebff] dark:bg-[#13234f]">
                        <div className={`h-full rounded-full ${item.color}`} style={{ width: `${analytics.total_students ? (item.count / analytics.total_students) * 100 : 0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Top Companies */}
              <section className="rounded-3xl border border-[#d4def8] bg-white p-5 shadow-[0_10px_28px_rgba(66,98,170,0.12)] dark:border-[#223067] dark:bg-[#111d49]">
                <h2 className="mb-5 text-lg font-bold text-[#16213f] dark:text-white">Top Hiring Companies</h2>
                {analytics.top_companies.length === 0 ? (
                  <p className="text-sm text-[#7d8db7]">No placements yet</p>
                ) : (
                  <div className="space-y-3">
                    {analytics.top_companies.map((c, i) => (
                      <div key={c.company} className="flex items-center gap-3">
                        <span className="w-5 text-center text-xs font-black text-[#b0c4f5] dark:text-[#3a5499]">{i + 1}</span>
                        <div className="flex flex-1 items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf3ff] dark:bg-[#1a2858]">
                            <Building2 className="h-4 w-4 text-[#4f8cff]" />
                          </div>
                          <span className="flex-1 text-sm font-semibold text-[#22335f] dark:text-[#d7e3ff]">{c.company}</span>
                        </div>
                        <span className="rounded-lg bg-[#17cf73]/15 px-2.5 py-1 text-xs font-black text-[#0f8f4f] dark:text-[#5be6a1]">
                          {c.placements} placed
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </>
        )}

        {/* PLACEMENTS TAB */}
        {activeTab === 'placements' && (
          <section className="space-y-4">
            <h2 className="text-lg font-extrabold text-[#16213f] dark:text-white">
              Live Placement Feed
              <span className="ml-2 rounded-full bg-[#17cf73]/20 px-2.5 py-0.5 text-sm font-bold text-[#0f8f4f] dark:text-[#5be6a1]">
                {placements.length}
              </span>
            </h2>
            {placements.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#c5d4f5] bg-white p-10 text-center dark:border-[#2a3f7a] dark:bg-[#111d49]">
                <Trophy className="mx-auto mb-3 h-12 w-12 text-[#b0c4f5]" />
                <p className="font-semibold text-[#22335f] dark:text-[#d7e3ff]">No placements yet</p>
              </div>
            ) : placements.map((p) => (
              <article key={p.student_id + p.placed_at} className="rounded-3xl border border-[#d4def8] bg-white p-5 shadow-[0_8px_24px_rgba(66,98,170,0.1)] dark:border-[#223067] dark:bg-[#111d49]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-extrabold text-[#16213f] dark:text-white">{p.student_name}</p>
                      <span className={`rounded-lg px-2 py-0.5 text-[11px] font-black ${BADGE_COLOR[p.badge] ?? BADGE_COLOR.Bronze}`}>{p.badge}</span>
                    </div>
                    <p className="text-sm text-[#6e80af] dark:text-[#96a9d9]">{p.job_title} at <span className="font-semibold">{p.company_name}</span></p>
                    <p className="text-xs text-[#7d8db7] dark:text-[#7f92c6]">
                      {p.placed_at ? new Date(p.placed_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <p className="text-[10px] font-semibold uppercase text-[#7d8db7]">DES</p>
                      <p className="text-lg font-black text-[#4f8cff]">{Math.round(p.des_score)}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-xl bg-[#effcf4] px-3 py-2 text-xs font-bold text-[#0f8f4f] dark:bg-[#113226] dark:text-[#5be6a1]">
                      <BadgeCheck className="h-3.5 w-3.5" /> Placed
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}

        {/* ROSTER TAB */}
        {activeTab === 'roster' && (
          <section>
            <h2 className="mb-4 text-lg font-extrabold text-[#16213f] dark:text-white">Student Roster</h2>
            <div className="overflow-hidden rounded-3xl border border-[#d4def8] bg-white shadow-[0_10px_28px_rgba(66,98,170,0.12)] dark:border-[#223067] dark:bg-[#111d49]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#eef3ff] dark:border-[#1d2f60]">
                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#7d8db7]">Student</th>
                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#7d8db7]">DES</th>
                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#7d8db7]">Badge</th>
                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#7d8db7]">Viva Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f4ff] dark:divide-[#1d2f60]">
                  {students.map((s) => {
                    const viva = VIVA_PILL[s.viva_status]
                    return (
                      <tr key={s.student_id} className="hover:bg-[#f8fbff] dark:hover:bg-[#0e1c45]">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-[#16213f] dark:text-white">{s.name}</p>
                          <p className="text-xs text-[#7d8db7]">{s.email}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-lg font-black text-[#4f8cff]">{Math.round(s.des_score)}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`rounded-lg px-2.5 py-1 text-[11px] font-black ${BADGE_COLOR[s.badge] ?? BADGE_COLOR.Bronze}`}>
                            {s.badge}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${viva.color}`}>
                            {viva.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {students.length === 0 && (
                <div className="py-12 text-center text-sm text-[#7d8db7]">No students linked to this college yet.</div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
