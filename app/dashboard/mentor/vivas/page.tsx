"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { CalendarDays, Clock3, ExternalLink, Video } from "lucide-react"
import { mentorService } from "@/services/mentor.service"
import type { SkillEvaluationItem } from "@/lib/types"

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

export default function MentorVivasPage() {
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

  const vivas = useMemo(
    () => evaluations.filter((item) => item.confirmed_slot).sort((a, b) => {
      const left = new Date(a.confirmed_slot || 0).getTime()
      const right = new Date(b.confirmed_slot || 0).getTime()
      return left - right
    }),
    [evaluations],
  )

  return (
    <div className="space-y-6 pb-6">
      <section className="rounded-[28px] border border-[#dbe2ff] bg-[linear-gradient(135deg,#eef2ff_0%,#f8f9ff_40%,#ffffff_100%)] p-6 shadow-[0_24px_70px_rgba(46,60,120,0.10)] dark:border-white/10 dark:bg-[linear-gradient(135deg,#16112f_0%,#11182f_45%,#090d1a_100%)] md:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#dfe4ff] bg-[#eff2ff] px-3 py-1 text-[11px] font-semibold text-[#33407a] dark:border-white/10 dark:bg-white/5 dark:text-white/75">
              <CalendarDays className="h-3.5 w-3.5 text-[#7a61ff]" />
              Mentor Schedule
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Scheduled Vivas
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-white/70">
              Review upcoming viva slots, jump into meetings, and keep your schedule organized.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:flex">
            <StatBadge label="Scheduled" value={vivas.length} />
            <StatBadge label="Pending" value={evaluations.filter((item) => item.status !== "evaluated").length} />
          </div>
        </div>
      </section>

      <section className="rounded-[24px] border border-[#dfe4fb] bg-[linear-gradient(180deg,#ffffff_0%,#f9fbff_100%)] p-4 shadow-[0_12px_35px_rgba(46,60,120,0.07)] dark:border-white/8 dark:bg-[#0f1428]">
        {loading ? (
          <EmptyState text="Loading scheduled vivas..." />
        ) : vivas.length === 0 ? (
          <EmptyState text="No viva slots have been scheduled yet." />
        ) : (
          <div className="space-y-3">
            {vivas.map((item) => (
              <div
                key={item.evaluation_id}
                className="flex flex-col gap-4 rounded-2xl border border-[#e0e5fa] bg-[linear-gradient(180deg,#ffffff_0%,#f8faff_100%)] p-4 shadow-sm dark:border-white/8 dark:bg-white/5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {item.project?.title || `Evaluation #${item.evaluation_id.slice(0, 8)}`}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-white/55">
                    {item.student?.name || `Student ID: ${item.student_id.slice(0, 8)}`}
                  </p>
                  <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[#7a61ff] dark:text-[#c8ee44]">
                    <Clock3 className="h-4 w-4" />
                    {formatDateTime(item.confirmed_slot)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {item.viva_meeting_link && (
                    <a
                      href={item.viva_meeting_link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-[#7a61ff]/30 bg-[#7a61ff]/10 px-4 py-2 text-sm font-semibold text-[#7a61ff] transition-colors hover:bg-[#7a61ff]/15 dark:border-[#c8ee44]/20 dark:bg-[#c8ee44]/10 dark:text-[#c8ee44]"
                    >
                      <Video className="h-4 w-4" />
                      Join meeting
                    </a>
                  )}
                  <Link
                    href="/dashboard/mentor/evaluations"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-white/10 dark:text-white/50 dark:hover:bg-white/5 dark:hover:text-white"
                    aria-label="Open evaluations"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function StatBadge({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-24 rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-center shadow-sm dark:border-white/10 dark:bg-white/5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-white/45">{label}</p>
      <p className="mt-1 text-2xl font-black text-[#121827] dark:text-white">{value}</p>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#dfe4fb] bg-[#f7f9ff] px-4 py-8 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-white/45">
      {text}
    </div>
  )
}
