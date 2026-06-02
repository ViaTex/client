'use client'

import { useEffect, useState } from 'react'
import {
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  Plus,
  ShieldCheck,
  Video,
  X,
} from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL ?? ''
function getToken() { return localStorage.getItem('access_token') ?? '' }

const STATUS_COLORS: Record<string, string> = {
  proposed:  'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
}

const OUTCOME_COLORS: Record<string, string> = {
  proceed: 'bg-blue-100 text-blue-700',
  offer:   'bg-emerald-100 text-emerald-700',
  hold:    'bg-amber-100 text-amber-700',
  reject:  'bg-red-100 text-red-700',
}

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

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function CorporateInterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming')

  useEffect(() => {
    fetch(`${API}/api/v1/interviews/corporate/all`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then(setInterviews)
      .catch(() => setError('Could not load interviews.'))
      .finally(() => setLoading(false))
  }, [])

  const upcoming = interviews.filter((i) => ['proposed', 'confirmed'].includes(i.status))
  const completed = interviews.filter((i) => ['completed', 'cancelled'].includes(i.status))
  const displayed = activeTab === 'upcoming' ? upcoming : completed

  return (
    <div className="min-h-[calc(100vh-80px)] rounded-[1.25rem] bg-[#eef3ff] p-4 shadow-sm sm:rounded-[1.5rem] sm:p-5 md:rounded-[2rem] md:p-6 dark:bg-[#101d49]">
      <div className="mx-auto max-w-4xl space-y-6">

        {/* Header */}
        <section className="rounded-3xl border border-[#d4def8] bg-white p-5 shadow-[0_10px_28px_rgba(66,98,170,0.12)] sm:p-6 dark:border-[#223067] dark:bg-[#111d49]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#5c73b5] dark:text-[#8ea1d6]">
                <CalendarDays className="h-4 w-4 text-[#4f8cff]" />
                Phase 4 — Accelerated Interviews
              </p>
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#16213f] sm:text-3xl dark:text-white">Interview Schedule</h1>
              <p className="mt-1 text-sm text-[#5f6f98] dark:text-[#93a4d1]">
                Candidates' technical skills are pre-verified — skip basic screening and focus on culture fit.
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-4 inline-flex rounded-xl bg-[#edf3ff] p-1 dark:bg-[#1a2858]">
            {(['upcoming', 'completed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-4 py-2 text-xs font-bold capitalize transition-colors ${
                  activeTab === tab
                    ? 'bg-white text-[#16213f] shadow-sm dark:bg-[#101d49] dark:text-white'
                    : 'text-[#5872b6] dark:text-[#9db0df]'
                }`}
              >
                {tab} ({tab === 'upcoming' ? upcoming.length : completed.length})
              </button>
            ))}
          </div>
        </section>

        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30">{error}</div>
        )}

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#4f8cff]" />
          </div>
        ) : displayed.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#c5d4f5] bg-white p-10 text-center dark:border-[#2a3f7a] dark:bg-[#111d49]">
            <CalendarDays className="mx-auto mb-3 h-12 w-12 text-[#b0c4f5] dark:text-[#3a5499]" />
            <p className="font-semibold text-[#22335f] dark:text-[#d7e3ff]">
              No {activeTab} interviews
            </p>
            <p className="mt-1 text-sm text-[#7d8db7]">
              Schedule an interview from a shortlisted candidate's profile.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayed.map((iv) => (
              <article
                key={iv.id}
                className="rounded-3xl border border-[#d4def8] bg-white p-5 shadow-[0_8px_24px_rgba(66,98,170,0.1)] dark:border-[#223067] dark:bg-[#111d49]"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-extrabold text-[#16213f] dark:text-white">{iv.student_name ?? 'Candidate'}</p>
                      <span className={`rounded-lg px-2.5 py-1 text-[11px] font-bold capitalize ${STATUS_COLORS[iv.status] ?? ''}`}>
                        {iv.status}
                      </span>
                      {iv.outcome && (
                        <span className={`rounded-lg px-2.5 py-1 text-[11px] font-bold capitalize ${OUTCOME_COLORS[iv.outcome] ?? ''}`}>
                          {iv.outcome}
                        </span>
                      )}
                    </div>
                    {iv.job_title && (
                      <p className="mt-0.5 text-sm text-[#6e80af] dark:text-[#96a9d9]">
                        For: <span className="font-semibold">{iv.job_title}</span>
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-[#5f6f98] dark:text-[#93a4d1]">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {iv.scheduled_at ? fmtDate(iv.scheduled_at) : `${iv.proposed_slots?.length ?? 0} slots proposed`}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {iv.duration_minutes} min
                      </span>
                      <span className="inline-flex items-center gap-1 capitalize">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {iv.interview_type.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {iv.verified_skills?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {iv.verified_skills.map((skill) => (
                          <span key={skill} className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                            <BadgeCheck className="h-3 w-3" /> {skill} — Pre-Verified
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {iv.meeting_link && iv.status === 'confirmed' && (
                    <a
                      href={iv.meeting_link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-[#4f8cff] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#3a7de0] transition-colors"
                    >
                      <Video className="h-3.5 w-3.5" /> Join Meeting
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
