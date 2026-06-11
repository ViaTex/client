'use client'

import { useEffect, useState } from 'react'
import {
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  Video,
} from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL ?? ''
function getToken() { return localStorage.getItem('access_token') ?? '' }

const STATUS_COLORS: Record<string, string> = {
  proposed: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
}

interface Interview {
  id: string
  company_name: string | null
  company_logo?: string | null
  job_title: string | null
  interview_type: string
  status: string
  scheduled_at: string | null
  duration_minutes: number
  meeting_link: string | null
  verified_skills: string[]
  proposed_slots: string[]
  created_at: string
  outcome?: string | null
  company_website?: string | null
  company_address?: string | null
  contact_person?: string | null
  contact_designation?: string | null
}

interface VerifiedSkill {
  skill_name: string
  total_score?: number | null
  verdict?: string | null
  mentor_name?: string | null
  verified_at?: string | null
  project_title?: string | null
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function fmtTime(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit',
  })
}

function countdown(iso: string | null) {
  if (!iso) return null
  const diff = new Date(iso).getTime() - Date.now()
  if (diff <= 0) return 'Now'
  const days = Math.floor(diff / 86_400_000)
  const hours = Math.floor((diff % 86_400_000) / 3_600_000)
  const minutes = Math.floor((diff % 3_600_000) / 60_000)
  if (days > 0) return `In ${days}d ${hours}h`
  return `In ${hours}h ${minutes}m`
}

export default function StudentInterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [verifiedSkills, setVerifiedSkills] = useState<VerifiedSkill[]>([])
  const [prepTips, setPrepTips] = useState<string[]>([])
  const [profileName, setProfileName] = useState('Student')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [confirmSlot, setConfirmSlot] = useState('')
  const [confirmLink, setConfirmLink] = useState('')
  const [confirming, setConfirming] = useState(false)

  const fetchParams = new URLSearchParams()
  if (activeTab === 'upcoming') fetchParams.set('status', 'proposed,confirmed')
  if (activeTab === 'completed') fetchParams.set('status', 'completed')
  if (activeTab === 'cancelled') fetchParams.set('status', 'cancelled')
  if (searchTerm.trim()) fetchParams.set('search', searchTerm.trim())

  async function loadInterviewData() {
    setLoading(true)
    setError('')
    try {
      const profileResponse = await fetch(`${API}/student/profile`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!profileResponse.ok) throw new Error('profile')
      const profileData = await profileResponse.json()
      setProfileName(profileData.name ?? 'Student')

      const interviewsResponse = await fetch(`${API}/api/v1/interviews/me?${fetchParams.toString()}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!interviewsResponse.ok) throw new Error('interviews')
      const interviewsData = await interviewsResponse.json()
      setInterviews(interviewsData)

      const skillsResponse = await fetch(`${API}/api/v1/interviews/me/verified-skills`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (skillsResponse.ok) {
        setVerifiedSkills(await skillsResponse.json())
      }

      const nextInterview = interviewsData.find((item: Interview) => ['confirmed', 'proposed'].includes(item.status))
      const tipsQuery = new URLSearchParams()
      if (nextInterview?.interview_type) tipsQuery.set('interview_type', nextInterview.interview_type)
      if (nextInterview?.job_title) tipsQuery.set('job_title', nextInterview.job_title)
      if (nextInterview?.company_name) tipsQuery.set('company_name', nextInterview.company_name)
      const tipsResponse = await fetch(`${API}/api/v1/interviews/me/preparation-tips?${tipsQuery.toString()}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (tipsResponse.ok) {
        setPrepTips(await tipsResponse.json())
      }
    } catch {
      setError('Unable to load your interview dashboard. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadInterviewData() }, [activeTab, searchTerm])

  async function handleConfirm(interviewId: string) {
    if (!confirmSlot) return
    setConfirming(true)
    try {
      const res = await fetch(`${API}/api/v1/interviews/${interviewId}/confirm`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ scheduled_at: confirmSlot, meeting_link: confirmLink || undefined }),
      })
      if (!res.ok) throw new Error()
      setConfirmingId(null)
      setConfirmSlot('')
      setConfirmLink('')
      await loadInterviewData()
    } catch {
      setError('Could not confirm slot.')
    } finally {
      setConfirming(false)
    }
  }

  const upcomingInterviews = interviews.filter((i) => ['proposed', 'confirmed'].includes(i.status))
  const completedInterviews = interviews.filter((i) => i.status === 'completed')
  const cancelledInterviews = interviews.filter((i) => i.status === 'cancelled')
  const selectedUpcoming = upcomingInterviews[0] ?? null
  const totalInterviews = interviews.length
  const offers = interviews.filter((iv) => iv.outcome === 'offer').length
  const successRate = totalInterviews > 0 ? Math.round((offers / totalInterviews) * 100) : 0

  const currentStageIndex = selectedUpcoming?.status === 'completed'
    ? 4
    : ['proposed', 'confirmed'].includes(selectedUpcoming?.status ?? '')
      ? 2
      : 0

  const interviewPipelineStages = [
    { label: 'Applied', note: 'Application received', complete: true },
    { label: 'Shortlisted', note: 'Mentor/recruiter review', complete: ['proposed', 'confirmed', 'completed'].includes(selectedUpcoming?.status ?? '') },
    { label: 'Interview Scheduled', note: 'Slot confirmed', complete: ['confirmed', 'completed'].includes(selectedUpcoming?.status ?? '') },
    { label: 'Interview Completed', note: 'Interview finished', complete: selectedUpcoming?.status === 'completed' },
    { label: 'Final Decision', note: selectedUpcoming?.outcome ?? 'Awaiting decision', complete: Boolean(selectedUpcoming?.status === 'completed' && selectedUpcoming.outcome) },
  ]

  return (
    <div className="min-h-[calc(100vh-80px)] rounded-[1.25rem] bg-[#eef3ff] p-4 shadow-sm sm:rounded-[1.5rem] sm:p-5 md:rounded-[2rem] md:p-6 dark:bg-[#0f1c44]">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.8fr_1fr]">
        <div className="space-y-6">
          <section className="rounded-[1.75rem] border border-[#d8e0f4] bg-white p-6 shadow-[0_12px_36px_rgba(66,98,170,0.12)] dark:border-[#223067] dark:bg-[#111d49]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#4f7ffb] dark:text-[#8ea1d6]">Interviews</p>
                <h1 className="mt-3 text-3xl font-extrabold text-slate-950 dark:text-white">Welcome back {profileName} 👋</h1>
                <p className="mt-2 max-w-xl text-sm text-slate-600 dark:text-slate-300">
                  Track your interviews, review the pipeline and prepare with confidence for the next meeting.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-[1.75rem] border border-[#e5ecff] bg-[#f9fbff] p-5 shadow-sm dark:border-[#192b5c] dark:bg-[#12204a]">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-[#4f7ffb] dark:text-[#8ea1d6]">Interview Pipeline</p>
                  <h2 className="mt-2 text-xl font-bold text-slate-950 dark:text-white sm:text-2xl">Interview Timeline</h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Follow every stage from application to final decision in a responsive timeline.</p>
                </div>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                  {selectedUpcoming?.status?.replace(/_/g, ' ') ?? 'No active pipeline'}
                </span>
              </div>

              <div className="mt-6 overflow-x-auto pb-2">
                <div className="flex min-w-[820px] items-start gap-3 xl:min-w-0 xl:flex-nowrap">
                  {interviewPipelineStages.map((stage, index) => {
                    const isComplete = Boolean(stage.complete)
                    const isCurrent = index === currentStageIndex

                    return (
                      <article
                        key={stage.label}
                        className="relative flex min-w-[180px] flex-1 flex-col items-start xl:min-w-0"
                      >
                        <div className="flex w-full items-center gap-3">
                          <div className={`z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border shadow-sm ${
                            isComplete
                              ? 'border-emerald-500 bg-emerald-500 text-white'
                              : isCurrent
                                ? 'border-blue-500 bg-blue-500 text-white'
                                : 'border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300'
                          }`}>
                            {index + 1}
                          </div>
                          {index < interviewPipelineStages.length - 1 && (
                            <span className={`hidden h-[2px] flex-1 xl:block ${
                              isComplete
                                ? 'bg-emerald-400'
                                : 'bg-slate-200 dark:bg-slate-700'
                            }`} />
                          )}
                        </div>

                        <div className={`mt-3 w-full rounded-[1.35rem] border p-4 shadow-sm transition hover:-translate-y-0.5 ${
                          isComplete
                            ? 'border-emerald-200 bg-emerald-50/90 dark:border-emerald-500/30 dark:bg-emerald-500/10'
                            : isCurrent
                              ? 'border-blue-200 bg-blue-50/90 dark:border-blue-500/30 dark:bg-blue-500/10'
                              : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900/90'
                        }`}>
                          <div className="flex flex-col gap-2">
                            <p className={`text-sm font-semibold ${
                              isComplete
                                ? 'text-emerald-700 line-through decoration-2 dark:text-emerald-200'
                                : isCurrent
                                  ? 'text-blue-700 dark:text-blue-200'
                                  : 'text-slate-900 dark:text-white'
                            }`}>
                              {stage.label}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{stage.note}</p>
                            <span className={`w-fit rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] sm:text-[11px] ${
                              isComplete
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200'
                                : isCurrent
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-100'
                                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200'
                            }`}>
                              {isComplete ? 'Done' : isCurrent ? 'In Progress' : 'Pending'}
                            </span>
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {[
                { label: 'Total Interviews', value: totalInterviews },
                { label: 'Upcoming', value: upcomingInterviews.length },
                { label: 'Completed', value: completedInterviews.length },
                { label: 'Offers', value: offers },
                { label: 'Success Rate', value: `${successRate}%` },
              ].map((card) => (
                <div key={card.label} className="rounded-[1.5rem] border border-[#e6ecff] bg-white p-5 shadow-sm dark:border-[#1e2f5c] dark:bg-[#111d49]">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">{card.label}</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">{card.value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-[#d8e0f4] bg-white p-6 shadow-[0_12px_36px_rgba(66,98,170,0.12)] dark:border-[#223067] dark:bg-[#111d49]">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#4f7ffb] dark:text-[#8ea1d6]">Search interviews</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">Search by company name, job role or interview status.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {(['all', 'upcoming', 'completed', 'cancelled'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition ${activeTab === tab ? 'bg-[#4f8cff] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'}`}
                  >
                    {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <label className="sr-only" htmlFor="interview-search">Search interviews</label>
              <div className="relative rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 dark:border-slate-700 dark:bg-slate-900">
                <input
                  id="interview-search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by company, role or status"
                  className="w-full border-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            {loading ? (
              <div className="grid gap-4">
                {[1, 2].map((item) => (
                  <div key={item} className="h-40 animate-pulse rounded-[1.5rem] bg-slate-200 dark:bg-slate-800" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {interviews.length === 0 ? (
                  <div className="rounded-[1.75rem] border border-dashed border-[#c5d4f5] bg-white p-10 text-center dark:border-[#2a3f7a] dark:bg-[#111d49]">
                    <CalendarDays className="mx-auto mb-3 h-12 w-12 text-[#b0c4f5]" />
                    <p className="font-semibold text-slate-950 dark:text-slate-200">No interviews found</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Try another search term or wait for the next interview invite.</p>
                  </div>
                ) : (
                  interviews.map((iv) => (
                    <div key={iv.id} className="rounded-[1.75rem] border border-[#e6ecff] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(66,98,170,0.08)] dark:border-[#192d5c] dark:bg-[#111d49]">
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                            {iv.company_name?.slice(0, 1) ?? 'C'}
                          </div>
                          <div>
                            <p className="text-lg font-semibold text-slate-950 dark:text-white">{iv.job_title ?? 'Interview Role'}</p>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{iv.company_name ?? 'Company name'} · {iv.interview_type.replace(/_/g, ' ')}</p>
                          </div>
                        </div>
                        <span className={`rounded-full px-4 py-2 text-xs font-semibold capitalize ${STATUS_COLORS[iv.status]}`}>
                          {iv.status}
                        </span>
                      </div>

                      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-[1.5rem] bg-slate-50 p-4 dark:bg-slate-900">
                          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Scheduled</p>
                          <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">{iv.scheduled_at ? fmtDate(iv.scheduled_at) : 'Pending schedule'}</p>
                        </div>
                        <div className="rounded-[1.5rem] bg-slate-50 p-4 dark:bg-slate-900">
                          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Duration</p>
                          <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">{iv.duration_minutes} min</p>
                        </div>
                        <div className="rounded-[1.5rem] bg-slate-50 p-4 dark:bg-slate-900">
                          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Meeting</p>
                          <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">{iv.meeting_link ? 'Google Meet' : 'N/A'}</p>
                        </div>
                        <div className="rounded-[1.5rem] bg-slate-50 p-4 dark:bg-slate-900">
                          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Next step</p>
                          <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">{iv.scheduled_at ? countdown(iv.scheduled_at) : 'Awaiting schedule'}</p>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <button
                          onClick={() => setSelectedInterview(iv)}
                          className="rounded-full bg-[#4f8cff] px-5 py-3 text-sm font-semibold text-white hover:bg-[#3a7de0]"
                        >
                          View Details
                        </button>
                        {iv.status === 'confirmed' && iv.meeting_link && (
                          <a
                            href={iv.meeting_link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                          >
                            <Video className="mr-2 h-4 w-4" /> Join Interview
                          </a>
                        )}
                      </div>
                    </div>
                  )))}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[1.75rem] border border-[#d8e0f4] bg-white p-6 shadow-[0_12px_36px_rgba(66,98,170,0.12)] dark:border-[#223067] dark:bg-[#111d49]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#4f7ffb] dark:text-[#8ea1d6]">Upcoming Next</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">The next confirmed interview you should prepare for.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                {selectedUpcoming ? selectedUpcoming.status : 'No upcoming'}
              </span>
            </div>
            {selectedUpcoming ? (
              <div className="mt-6 space-y-4">
                <div className="rounded-[1.5rem] border border-[#e6ecff] bg-[#f8fbff] p-4 dark:border-[#1b2f5e] dark:bg-[#101c44]">
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">{selectedUpcoming.company_name}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{selectedUpcoming.job_title}</p>
                  <div className="mt-4 grid gap-3">
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <CalendarDays className="h-4 w-4" /> {selectedUpcoming.scheduled_at ? fmtDate(selectedUpcoming.scheduled_at) : 'Not scheduled'}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <Clock className="h-4 w-4" /> {selectedUpcoming.scheduled_at ? fmtTime(selectedUpcoming.scheduled_at) : '--:--'} • {selectedUpcoming.duration_minutes} min
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="h-4 w-4" /> {selectedUpcoming.meeting_link ? 'Google Meet' : 'Meeting link pending'}
                    </div>
                  </div>
                </div>
                {selectedUpcoming.meeting_link && (
                  <a
                    href={selectedUpcoming.meeting_link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center rounded-[1.5rem] bg-[#4f8cff] px-4 py-3 text-sm font-semibold text-white hover:bg-[#3a7de0]"
                  >
                    Join Interview
                  </a>
                )}
              </div>
            ) : (
              <div className="mt-6 rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-6 text-center dark:border-slate-700 dark:bg-slate-900">
                <p className="font-semibold text-slate-900 dark:text-white">No upcoming interview</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">You will see the next scheduled interview here once it is confirmed.</p>
              </div>
            )}
          </div>

          <div className="rounded-[1.75rem] border border-[#d8e0f4] bg-white p-6 shadow-[0_12px_36px_rgba(66,98,170,0.12)] dark:border-[#223067] dark:bg-[#111d49]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#4f7ffb] dark:text-[#8ea1d6]">Verified Skills Shared</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Verified skills from your mentor evaluations.</p>
            <div className="mt-5 space-y-3">
              {verifiedSkills.length > 0 ? verifiedSkills.map((skill) => (
                <div key={skill.skill_name} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950 dark:text-white">{skill.skill_name}</p>
                      {skill.project_title && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{skill.project_title}</p>}
                    </div>
                    {skill.total_score ? (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                        {skill.total_score} pts
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span>{skill.mentor_name ?? 'Mentor'}</span>
                    <span>{skill.verified_at ? fmtDate(skill.verified_at) : 'Verified date unknown'}</span>
                  </div>
                </div>
              )) : (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center dark:border-slate-700 dark:bg-slate-900">
                  <p className="font-semibold text-slate-900 dark:text-white">No verified skills yet</p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Your verified skills will appear here once mentors complete evaluations.</p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-[#d8e0f4] bg-white p-6 shadow-[0_12px_36px_rgba(66,98,170,0.12)] dark:border-[#223067] dark:bg-[#111d49]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#4f7ffb] dark:text-[#8ea1d6]">Preparation Tips</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Tips change based on your upcoming interview details.</p>
            <div className="mt-5 space-y-3">
              {prepTips.length > 0 ? prepTips.map((tip) => (
                <div key={tip} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                  {tip}
                </div>
              )) : (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center dark:border-slate-700 dark:bg-slate-900">
                  <p className="font-semibold text-slate-900 dark:text-white">No preparation tips available</p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Tips will appear once the next interview is confirmed.</p>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
