'use client'

import { useEffect, useState } from 'react'
import {
  BadgeCheck, CalendarDays, CheckCircle2, Clock, Loader2, Video,
} from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL ?? ''
function getToken() { return localStorage.getItem('access_token') ?? '' }

const STATUS_COLORS: Record<string, string> = {
  proposed:  'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
}

interface Interview {
  id: string
  company_name: string | null
  job_title: string | null
  interview_type: string
  status: string
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

function countdown(iso: string | null) {
  if (!iso) return null
  const diff = new Date(iso).getTime() - Date.now()
  if (diff <= 0) return 'Now'
  const h = Math.floor(diff / 3_600_000)
  const d = Math.floor(h / 24)
  if (d > 0) return `In ${d}d ${h % 24}h`
  return `In ${h}h ${Math.floor((diff % 3_600_000) / 60_000)}m`
}

export default function StudentInterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [confirmSlot, setConfirmSlot] = useState('')
  const [confirmLink, setConfirmLink] = useState('')
  const [confirming, setConfirming] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/v1/interviews/me`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!res.ok) throw new Error()
      setInterviews(await res.json())
    } catch {
      setError('Could not load interviews.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleConfirm(interviewId: string) {
    setConfirming(true)
    try {
      const res = await fetch(`${API}/api/v1/interviews/${interviewId}/confirm`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ scheduled_at: confirmSlot, meeting_link: confirmLink || undefined }),
      })
      if (!res.ok) throw new Error()
      setConfirmingId(null)
      await load()
    } catch {
      setError('Could not confirm slot.')
    } finally {
      setConfirming(false)
    }
  }

  const upcoming = interviews.filter((i) => ['proposed', 'confirmed'].includes(i.status))
  const past = interviews.filter((i) => ['completed', 'cancelled'].includes(i.status))

  return (
    <div className="min-h-[calc(100vh-80px)] rounded-[1.25rem] bg-[#eef3ff] p-4 shadow-sm sm:rounded-[1.5rem] sm:p-5 md:rounded-[2rem] md:p-6 dark:bg-[#101d49]">
      <div className="mx-auto max-w-3xl space-y-6">

        {/* Header */}
        <section className="rounded-3xl border border-[#d4def8] bg-white p-5 shadow-[0_10px_28px_rgba(66,98,170,0.12)] dark:border-[#223067] dark:bg-[#111d49]">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#5c73b5] dark:text-[#8ea1d6]">
            <CalendarDays className="h-4 w-4 text-[#4f8cff]" />
            Phase 4 — Accelerated Interview
          </p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#16213f] sm:text-3xl dark:text-white">My Interviews</h1>
          <p className="mt-1 text-sm text-[#5f6f98] dark:text-[#93a4d1]">
            Your verified skills are already shared with the interviewer — expect culture fit and system design questions.
          </p>
        </section>

        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30">{error}</div>
        )}

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#4f8cff]" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Upcoming */}
            {upcoming.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-black uppercase tracking-wider text-[#4f6fbc] dark:text-[#9db0df]">Upcoming</h2>
                {upcoming.map((iv) => (
                  <article key={iv.id} className="rounded-3xl border border-[#d4def8] bg-white p-5 shadow-[0_8px_24px_rgba(66,98,170,0.1)] dark:border-[#223067] dark:bg-[#111d49]">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-extrabold text-[#16213f] dark:text-white">
                            {iv.company_name ?? 'Company'}
                          </p>
                          <span className={`rounded-lg px-2.5 py-1 text-[11px] font-bold capitalize ${STATUS_COLORS[iv.status]}`}>
                            {iv.status}
                          </span>
                        </div>
                        {iv.job_title && (
                          <p className="text-sm text-[#6e80af] dark:text-[#96a9d9]">Role: {iv.job_title}</p>
                        )}

                        <div className="mt-2 flex flex-wrap gap-3 text-xs text-[#5f6f98] dark:text-[#93a4d1]">
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {iv.scheduled_at ? fmtDate(iv.scheduled_at) : `${iv.proposed_slots?.length ?? 0} slots awaiting confirmation`}
                          </span>
                          {iv.scheduled_at && (
                            <span className="inline-flex items-center gap-1 font-bold text-[#4f8cff]">
                              <Clock className="h-3.5 w-3.5" />
                              {countdown(iv.scheduled_at)}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {iv.duration_minutes} min · {iv.interview_type.replace(/_/g, ' ')}
                          </span>
                        </div>

                        {/* Pre-verified skills brief */}
                        {iv.verified_skills?.length > 0 && (
                          <div className="mt-3 rounded-2xl bg-emerald-50 p-3 dark:bg-emerald-900/20">
                            <p className="mb-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                              ✓ Already Verified — Interviewer Knows These
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {iv.verified_skills.map((skill) => (
                                <span key={skill} className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                                  <BadgeCheck className="h-3 w-3" /> {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        {iv.status === 'proposed' && (
                          <button
                            onClick={() => setConfirmingId(iv.id)}
                            className="rounded-xl bg-[#4f8cff] px-4 py-2 text-xs font-bold text-white hover:bg-[#3a7de0]"
                          >
                            Confirm Slot
                          </button>
                        )}
                        {iv.status === 'confirmed' && iv.meeting_link && (
                          <a
                            href={iv.meeting_link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#17cf73] px-4 py-2 text-xs font-bold text-white hover:bg-[#11b865]"
                          >
                            <Video className="h-3.5 w-3.5" /> Join
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Confirm Slot Modal */}
                    {confirmingId === iv.id && (
                      <div className="mt-4 rounded-2xl border border-[#dde6ff] bg-[#f8fbff] p-4 dark:border-[#21376f] dark:bg-[#0e1c45]">
                        <p className="mb-3 text-sm font-bold text-[#16213f] dark:text-white">Confirm your interview slot</p>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-[#5c73b5]">Select Slot *</label>
                            <select
                              value={confirmSlot}
                              onChange={(e) => setConfirmSlot(e.target.value)}
                              className="w-full rounded-xl border border-[#d4def8] bg-white px-3 py-2 text-sm text-[#16213f] dark:border-[#223067] dark:bg-[#111d49] dark:text-white"
                            >
                              <option value="">Choose…</option>
                              {iv.proposed_slots?.map((s) => (
                                <option key={s} value={s}>{fmtDate(s)}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-[#5c73b5]">Meeting Link (optional)</label>
                            <input
                              value={confirmLink}
                              onChange={(e) => setConfirmLink(e.target.value)}
                              placeholder="https://meet.google.com/..."
                              className="w-full rounded-xl border border-[#d4def8] bg-white px-3 py-2 text-sm dark:border-[#223067] dark:bg-[#111d49] dark:text-white"
                            />
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button onClick={() => setConfirmingId(null)} className="flex-1 rounded-xl border border-[#d4def8] py-2 text-xs font-bold text-[#5f6f98]">
                            Cancel
                          </button>
                          <button
                            onClick={() => handleConfirm(iv.id)}
                            disabled={!confirmSlot || confirming}
                            className="flex-1 rounded-xl bg-[#17cf73] py-2 text-xs font-bold text-white hover:bg-[#11b865] disabled:opacity-60"
                          >
                            {confirming ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : 'Confirm'}
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}

            {/* Past */}
            {past.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-black uppercase tracking-wider text-[#7d8db7] dark:text-[#7f92c6]">Past Interviews</h2>
                {past.map((iv) => (
                  <article key={iv.id} className="rounded-2xl border border-[#dde6ff] bg-[#f8fbff] p-4 dark:border-[#21376f] dark:bg-[#0e1c45]">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-[#1d2f5c] dark:text-[#deebff]">{iv.company_name ?? 'Company'}</p>
                        {iv.job_title && <p className="text-xs text-[#6e80af]">{iv.job_title}</p>}
                      </div>
                      <span className={`rounded-lg px-2.5 py-1 text-[11px] font-bold capitalize ${STATUS_COLORS[iv.status]}`}>
                        {iv.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#7d8db7]">{fmtDate(iv.scheduled_at)}</p>
                  </article>
                ))}
              </div>
            )}

            {upcoming.length === 0 && past.length === 0 && (
              <div className="rounded-3xl border border-dashed border-[#c5d4f5] bg-white p-10 text-center dark:border-[#2a3f7a] dark:bg-[#111d49]">
                <CalendarDays className="mx-auto mb-3 h-12 w-12 text-[#b0c4f5]" />
                <p className="font-semibold text-[#22335f] dark:text-[#d7e3ff]">No interviews yet</p>
                <p className="mt-1 text-sm text-[#7d8db7]">Get shortlisted by a company to receive interview invitations.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
