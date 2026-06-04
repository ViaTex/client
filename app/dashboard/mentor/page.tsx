"use client"

import Link from "next/link"
import { useEffect, useMemo, useState, type ReactNode } from "react"
import { useAuth } from "@/hooks/useAuth"
import { mentorService } from "@/services/mentor.service"
import type { SkillEvaluationItem } from "@/lib/types"
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  ExternalLink,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react"

type ScoreBand = {
  label: string
  min: number
  max: number
  color: string
}

const SCORE_BANDS: ScoreBand[] = [
  { label: "Excellent", min: 36, max: 40, color: "#2FB86A" },
  { label: "Good", min: 28, max: 35, color: "#2E7CF6" },
  { label: "Average", min: 20, max: 27, color: "#F6AD2E" },
  { label: "Needs Improvement", min: 0, max: 19, color: "#F25C54" },
]

function formatDateTime(value?: string | null) {
  if (!value) return "TBD"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "TBD"
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function getStudentName(item: SkillEvaluationItem) {
  return item.student?.name || item.student_id.slice(0, 8)
}

function getProjectTitle(item: SkillEvaluationItem) {
  return item.project?.title || item.project_id?.slice(0, 8) || "Project pending"
}

function getScoreLabel(score?: number | null) {
  if (typeof score !== "number") return "Not scored yet"
  return `${score}/40`
}

function pickBand(score?: number | null) {
  if (typeof score !== "number") return SCORE_BANDS[3]
  return SCORE_BANDS.find((band) => score >= band.min && score <= band.max) || SCORE_BANDS[3]
}

function normalizeStatus(value: string) {
  return value.replaceAll("_", " ")
}

function HeroIllustration() {
  return (
    <div className="relative h-[160px] overflow-hidden rounded-[28px] border border-transparent bg-[radial-gradient(circle_at_30%_20%,rgba(137,106,255,0.15),transparent_36%),linear-gradient(135deg,#f0f3ff,#e0e7ff)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(137,106,255,0.26),transparent_36%),linear-gradient(135deg,rgba(33,27,79,0.95),rgba(15,20,43,0.9))] shadow-[0_20px_60px_rgba(46,60,120,0.15)] dark:shadow-[0_30px_80px_rgba(15,23,42,0.28)] sm:h-[180px]">
      <div className="absolute inset-0 opacity-50">
        <div className="absolute left-8 top-8 h-32 w-32 rounded-full bg-[#4d3fd1]/10 dark:bg-[#4d3fd1]/15 blur-3xl" />
        <div className="absolute right-4 top-2 h-24 w-24 rounded-full bg-[#2fb86a]/15 dark:bg-[#2fb86a]/20 blur-3xl" />
      </div>

      <div className="absolute left-7 top-7 flex items-center gap-2 rounded-full border border-transparent bg-white/60 dark:bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-slate-700 dark:text-white/80 backdrop-blur shadow-sm dark:shadow-none">
        <Sparkles className="h-3.5 w-3.5 text-[#6b4dff] dark:text-[#c8ee44]" />
        Live Mentor Overview
      </div>

      <div className="absolute left-8 top-16 h-[102px] w-[176px] rounded-2xl border border-transparent bg-white/70 dark:bg-[#11162b]/75 p-4 shadow-xl dark:shadow-2xl backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-1.5 w-10 rounded-full bg-slate-300 dark:bg-white/20" />
            <div className="h-1.5 w-6 rounded-full bg-slate-200 dark:bg-white/10" />
          </div>
          <div className="rounded-full border border-transparent bg-slate-100 dark:bg-white/5 px-2 py-1 text-[10px] text-slate-500 dark:text-white/60">
            24 Total
          </div>
        </div>
        <div className="mt-4 flex h-16 items-end gap-2">
          {[28, 42, 34, 51, 40, 60].map((height, index) => (
            <div
              key={index}
              className="flex-1 rounded-t-md bg-gradient-to-t from-[#7a61ff] to-[#a38fff] dark:to-[#d9d0ff]"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>

      <div className="absolute right-7 top-8 flex items-center gap-3 rounded-2xl border border-transparent bg-white/60 dark:bg-white/5 px-4 py-3 backdrop-blur shadow-sm dark:shadow-none">
        <div className="relative h-14 w-14 rounded-full border-4 border-white dark:border-[#1d2648] bg-[conic-gradient(from_140deg,#f25c54_0deg_55deg,#f6ad2e_55deg_125deg,#2e7cf6_125deg_255deg,#2fb86a_255deg_360deg)] shadow-md dark:shadow-lg">
          <div className="absolute inset-3 rounded-full bg-white dark:bg-[#12182d]" />
        </div>
        <div className="space-y-1">
          <div className="text-[11px] font-medium text-slate-500 dark:text-white/55">Average Rating</div>
          <div className="text-2xl font-black tracking-tight text-slate-905 dark:text-white">4.6</div>
        </div>
      </div>
    </div>
  )
}

export default function MentorDashboardPage() {
  const { user } = useAuth()
  const [evaluations, setEvaluations] = useState<SkillEvaluationItem[]>([])
  const [loading, setLoading] = useState(true)

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

  const stats = useMemo(() => {
    const total = evaluations.length
    const pending = evaluations.filter((item) => item.status !== "evaluated").length
    const completed = evaluations.filter((item) => item.status === "evaluated").length
    const rated = evaluations.filter((item) => typeof item.student_rating_of_mentor === "number")
    const averageRating = rated.length
      ? rated.reduce((sum, item) => sum + (item.student_rating_of_mentor || 0), 0) / rated.length
      : 0

    const bandCounts = SCORE_BANDS.map((band) => ({
      ...band,
      count: evaluations.filter((item) => {
        const score = item.total_score ?? 0
        return score >= band.min && score <= band.max
      }).length,
    }))

    const totalScored = bandCounts.reduce((sum, band) => sum + band.count, 0)
    const excellentRate = totalScored ? Math.round((bandCounts[0].count / totalScored) * 100) : 0

    return {
      total,
      pending,
      completed,
      averageRating,
      bandCounts,
      totalScored,
      excellentRate,
    }
  }, [evaluations])

  const recentEvaluations = useMemo(() => evaluations.slice(0, 4), [evaluations])

  const upcomingVivas = useMemo(() => {
    return evaluations
      .filter((item) => item.confirmed_slot)
      .slice(0, 2)
      .map((item) => ({
        id: item.evaluation_id,
        student: getStudentName(item),
        project: getProjectTitle(item),
        slot: formatDateTime(item.confirmed_slot),
      }))
  }, [evaluations])

  const activityFeed = useMemo(() => {
    const recent = evaluations.slice(0, 4)
    return recent.map((item) => ({
      id: item.evaluation_id,
      label:
        item.status === "evaluated"
          ? `Evaluation ${item.evaluation_id.slice(0, 8)} was scored and marked as evaluated.`
          : item.confirmed_slot
            ? `Viva scheduled with ${getStudentName(item)}.`
            : `You have a pending review for ${getStudentName(item)}.`,
      time:
        item.status === "evaluated"
          ? "2h ago"
          : item.confirmed_slot
            ? "5h ago"
            : "1d ago",
      icon:
        item.status === "evaluated"
          ? CheckCircle2
          : item.confirmed_slot
            ? CalendarDays
            : Star,
      tone:
        item.status === "evaluated"
          ? "text-emerald-500"
          : item.confirmed_slot
            ? "text-orange-400"
            : "text-sky-400",
    }))
  }, [evaluations])

  const chartStyle = useMemo(() => {
    if (!stats.totalScored) {
      return {
        background:
          "conic-gradient(#2fb86a 0deg 90deg, #2e7cf6 90deg 180deg, #f6ad2e 180deg 270deg, #f25c54 270deg 360deg)",
      }
    }

    let running = 0
    const segments = stats.bandCounts.map((band) => {
      const portion = band.count / stats.totalScored
      const start = running
      const end = running + portion * 360
      running = end
      return `${band.color} ${start}deg ${end}deg`
    })

    return {
      background: `conic-gradient(${segments.join(", ")})`,
    }
  }, [stats.bandCounts, stats.totalScored])

  return (
    <div className="space-y-6 pb-6">
      <section className="relative overflow-hidden rounded-[28px] border border-transparent bg-[linear-gradient(135deg,#eef2ff_0%,#f8f9ff_40%,#ffffff_100%)] p-6 shadow-[0_24px_70px_rgba(46,60,120,0.10)] dark:border-transparent dark:bg-[linear-gradient(135deg,#16112f_0%,#11182f_45%,#090d1a_100%)] md:p-8">
        <div className="absolute inset-0 opacity-70">
          <div className="absolute -left-10 top-8 h-40 w-40 rounded-full bg-[#8165ff]/15 blur-3xl" />
          <div className="absolute right-8 top-0 h-28 w-28 rounded-full bg-[#c8ee44]/10 blur-3xl" />
        </div>

        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,1fr)] lg:items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#dfe4ff] bg-[#eff2ff] px-3 py-1 text-[11px] font-semibold text-[#33407a] shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-white/75">
              <LayoutDashboard className="h-3.5 w-3.5 text-[#7a61ff]" />
              Mentor Dashboard
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                {`Good ${new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, ${user?.name?.split(" ")[0] || "Mentor"}!`}
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-white/70">
                Track vivas, evaluate skills, and provide meaningful feedback that helps students grow with confidence.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/dashboard/mentor/evaluations"
                className="inline-flex items-center gap-2 rounded-full bg-[#13141f] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition-transform hover:-translate-y-0.5 dark:bg-[#c8ee44] dark:text-[#13141f]"
              >
                Review evaluations
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard/mentor/profile"
                className="inline-flex items-center gap-2 rounded-full border border-[#d6dcf7] bg-white/90 px-4 py-2.5 text-sm font-semibold text-[#31407a] shadow-sm backdrop-blur transition-colors hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
              >
                View profile
              </Link>
            </div>
          </div>

          <HeroIllustration />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Evaluations"
          value={stats.total}
          note={`${Math.max(stats.completed - stats.pending, 0)} more completed than pending`}
          icon={ClipboardCheck}
          accent="from-violet-500/20 to-violet-500/5"
          iconTone="text-violet-600 dark:text-violet-300"
        />
        <SummaryCard
          title="Pending Reviews"
          value={stats.pending}
          note="Needs your attention"
          icon={Clock3}
          accent="from-amber-500/20 to-amber-500/5"
          iconTone="text-amber-500"
        />
        <SummaryCard
          title="Completed"
          value={stats.completed}
          note={`${stats.total ? Math.round((stats.completed / stats.total) * 100) : 0}% completion rate`}
          icon={CheckCircle2}
          accent="from-emerald-500/20 to-emerald-500/5"
          iconTone="text-emerald-500"
        />
        <SummaryCard
          title="Avg Student Rating"
          value={stats.averageRating ? stats.averageRating.toFixed(1) : "0.0"}
          note="From student feedback"
          icon={Star}
          accent="from-sky-500/20 to-sky-500/5"
          iconTone="text-sky-500"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <PanelCard
          title="Recent Skill Evaluations"
          actionLabel="View all"
          actionHref="/dashboard/mentor/evaluations"
        >
          {loading ? (
            <EmptyState text="Loading evaluations..." />
          ) : recentEvaluations.length === 0 ? (
            <EmptyState text="No evaluations assigned yet." />
          ) : (
            <div className="space-y-3">
              {recentEvaluations.map((item) => {
                const band = pickBand(item.total_score)
                const isEvaluated = item.status === "evaluated"
                return (
                  <div
                    key={item.evaluation_id}
                    className="group rounded-2xl border border-transparent bg-[linear-gradient(180deg,#ffffff_0%,#f8faff_100%)] px-4 py-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-transparent dark:bg-none dark:bg-white/5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            Evaluation #{item.evaluation_id.slice(0, 8)}
                          </p>
                          <StatusPill tone={isEvaluated ? "success" : "warning"} label={isEvaluated ? "Evaluated" : "Pending Review"} />
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-white/55">
                          {getStudentName(item)} {" • "} Project: {getProjectTitle(item)}
                        </p>
                        {item.confirmed_slot && (
                          <p className="mt-1 text-xs text-slate-500 dark:text-white/55">
                            Viva slot: {formatDateTime(item.confirmed_slot)}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-right">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-white/35">Score</p>
                          <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                            {getScoreLabel(item.total_score)}
                          </p>
                        </div>
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-xs font-black dark:border-white/10 dark:bg-white/5"
                          style={{ color: band.color }}
                        >
                          {item.total_score ? Math.round(item.total_score) : "--"}
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 dark:text-white/25" />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </PanelCard>

        <PanelCard
          title="Score Distribution"
          actionLabel="View report"
          actionHref="/dashboard/mentor/evaluations"
        >
          <div className="grid gap-6 lg:grid-cols-[minmax(180px,220px)_1fr] lg:items-center">
            <div className="relative mx-auto flex aspect-square w-full max-w-[220px] items-center justify-center">
                <div
                  className="absolute inset-0 rounded-full shadow-[inset_0_0_0_12px_rgba(255,255,255,0.05)]"
                  style={chartStyle}
                />
              <div className="absolute inset-[26px] rounded-full border border-[#e2e7ff] bg-[linear-gradient(180deg,#fdfdff_0%,#eef1ff_100%)] shadow-inner dark:border-white/10 dark:bg-[linear-gradient(180deg,#11162b_0%,#0b1020_100%)]" />
              <div className="relative z-10 text-center">
                <div className="text-3xl font-black tracking-tight text-[#121827] dark:text-white">{stats.totalScored || stats.total}</div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-white/45">
                  Total
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {stats.bandCounts.map((band) => {
                const total = stats.totalScored || stats.total || 1
                const count = band.count
                const percent = Math.round((count / total) * 100)
                return (
                  <div key={band.label} className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: band.color }} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-slate-700 dark:text-white/80">
                          {band.label} ({band.min}-{band.max})
                        </p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {count} ({percent}%)
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}

              <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-500/15 dark:bg-emerald-500/10 dark:text-emerald-100">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-300" />
                  <p>All scores are verified and projects are mentor-validated.</p>
                </div>
              </div>
            </div>
          </div>
        </PanelCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <PanelCard title="Upcoming Vivas" actionLabel="View calendar" actionHref="/dashboard/mentor/evaluations">
          {upcomingVivas.length === 0 ? (
            <EmptyState text="No upcoming vivas scheduled yet." />
          ) : (
            <div className="space-y-3">
              {upcomingVivas.map((item, index) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 rounded-2xl border border-transparent bg-[linear-gradient(180deg,#ffffff_0%,#f8faff_100%)] p-4 shadow-sm dark:border-transparent dark:bg-none dark:bg-white/5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 flex-col items-center justify-center rounded-2xl bg-[linear-gradient(180deg,#f7f8ff_0%,#e8e9ff_100%)] text-[#7a61ff] shadow-sm dark:bg-[linear-gradient(180deg,#23243f_0%,#161a2f_100%)]">
                      <span className="text-lg font-black leading-none">
                        {index === 0 ? "28" : "30"}
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-[0.18em] opacity-70">
                        {index === 0 ? "May" : "May"}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Viva with {item.student}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-white/55">{item.project}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-white/55">{item.slot}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                    <Link
                      href="/dashboard/mentor/evaluations"
                      className="inline-flex items-center justify-center rounded-full border border-[#7a61ff]/30 bg-[#7a61ff]/10 px-4 py-2 text-sm font-semibold text-[#7a61ff] transition-colors hover:bg-[#7a61ff]/15 dark:border-[#c8ee44]/20 dark:bg-[#c8ee44]/10 dark:text-[#c8ee44]"
                    >
                      Join
                    </Link>
                    <Link
                      href="/dashboard/mentor/evaluations"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-white/10 dark:text-white/50 dark:hover:bg-white/5 dark:hover:text-white"
                      aria-label="Open viva details"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4">
            <Link
              href="/dashboard/mentor/evaluations"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#7a61ff] hover:underline dark:text-[#c8ee44]"
            >
              View all <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </PanelCard>

        <PanelCard title="Recent Activity" actionLabel="View all" actionHref="/dashboard/mentor/evaluations">
          {activityFeed.length === 0 ? (
            <EmptyState text="No recent activity yet." />
          ) : (
            <div className="space-y-3">
              {activityFeed.map((item) => {
                const Icon = item.icon
                return (
                    <div key={item.id} className="flex items-start gap-3 rounded-2xl border border-transparent bg-[linear-gradient(180deg,#ffffff_0%,#f8faff_100%)] p-4 shadow-sm dark:border-transparent dark:bg-none dark:bg-white/5">
                    <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-50 dark:bg-white/5 ${item.tone}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-700 dark:text-white/82">{item.label}</p>
                      <p className="mt-1 text-xs text-slate-400 dark:text-white/40">{item.time}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="mt-4">
            <Link
              href="/dashboard/mentor/evaluations"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#7a61ff] hover:underline dark:text-[#c8ee44]"
            >
              View activity <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </PanelCard>
      </section>
    </div>
  )
}

function SummaryCard({
  title,
  value,
  note,
  icon: Icon,
  accent,
  iconTone,
}: {
  title: string
  value: string | number
  note: string
  icon: any
  accent: string
  iconTone: string
}) {
  return (
    <div className="rounded-[24px] border border-transparent bg-[linear-gradient(180deg,#ffffff_0%,#f8faff_100%)] p-4 shadow-[0_12px_35px_rgba(46,60,120,0.07)] transition-transform hover:-translate-y-0.5 dark:border-transparent dark:bg-none dark:bg-[#11162b]">
      <div className={`rounded-[20px] bg-gradient-to-br ${accent} p-4`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-white/55">{title}</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">{value}</p>
            <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">{note}</p>
          </div>
          <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-white/75 shadow-sm backdrop-blur dark:bg-white/5 ${iconTone}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  )
}

function PanelCard({
  title,
  actionLabel,
  actionHref,
  children,
}: {
  title: string
  actionLabel: string
  actionHref: string
  children: ReactNode
}) {
  return (
    <div className="rounded-[24px] border border-transparent bg-[linear-gradient(180deg,#ffffff_0%,#f9fbff_100%)] p-4 shadow-[0_12px_35px_rgba(46,60,120,0.07)] dark:border-transparent dark:bg-none dark:bg-[#0f1428]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
        <Link
          href={actionHref}
          className="inline-flex items-center gap-1 rounded-full bg-[#7a61ff]/10 px-3 py-1.5 text-xs font-semibold text-[#7a61ff] transition-colors hover:bg-[#7a61ff]/15 dark:bg-[#c8ee44]/10 dark:text-[#c8ee44]"
        >
          {actionLabel}
        </Link>
      </div>
      {children}
    </div>
  )
}

function StatusPill({ tone, label }: { tone: "success" | "warning"; label: string }) {
  const styles =
    tone === "success"
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
      : "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"

  return <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${styles}`}>{label}</span>
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#dfe4fb] bg-[#f7f9ff] px-4 py-8 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-white/45">
      {text}
    </div>
  )
}
