'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  ExternalLink,
  Github,
  Linkedin,
  Loader2,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  Star,
  User,
} from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL ?? ''
function getToken() { return localStorage.getItem('access_token') ?? '' }

const VERDICT_COLORS: Record<string, string> = {
  excellent:         'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  very_good:         'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  good:              'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  needs_improvement: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  did_not_pass:      'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
}

const BADGE_COLORS: Record<string, string> = {
  Diamond: 'bg-gradient-to-r from-sky-400 to-violet-500 text-white',
  Gold:    'bg-gradient-to-r from-amber-400 to-orange-400 text-white',
  Silver:  'bg-gradient-to-r from-slate-300 to-slate-400 text-white',
  Bronze:  'bg-gradient-to-r from-amber-700 to-amber-500 text-white',
}

function ScoreBar({ label, score, max }: { label: string; score: number | null; max: number }) {
  const pct = score != null ? Math.round((score / max) * 100) : 0
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-semibold text-[#5f6f98] dark:text-[#93a4d1]">
        <span>{label}</span>
        <span className="font-black text-[#16213f] dark:text-white">{score ?? '—'}/{max}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#dde6ff] dark:bg-[#1a2858]">
        <div className="h-full rounded-full bg-[#4f8cff] transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function CandidateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params?.studentId as string

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!studentId) return
    fetch(`${API}/api/v1/corporate/candidates/${studentId}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => r.ok ? r.json() : Promise.reject('Not found'))
      .then(setData)
      .catch(() => setError('Could not load candidate profile.'))
      .finally(() => setLoading(false))
  }, [studentId])

  if (loading) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[#4f8cff]" />
    </div>
  )

  if (error || !data) return (
    <div className="flex min-h-[60vh] items-center justify-center text-[#dc2626]">{error || 'Not found'}</div>
  )

  const badgeClass = BADGE_COLORS[data.badge] ?? BADGE_COLORS.Bronze

  return (
    <div className="min-h-[calc(100vh-80px)] rounded-[1.25rem] bg-[#eef3ff] p-4 shadow-sm sm:rounded-[1.5rem] sm:p-5 md:rounded-[2rem] md:p-6 dark:bg-[#101d49]">
      <div className="mx-auto max-w-4xl space-y-6">

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-xl border border-[#d4def8] bg-white px-4 py-2 text-sm font-bold text-[#42548d] hover:bg-[#edf3ff] dark:border-[#223067] dark:bg-[#111d49] dark:text-[#c4d3ff]"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {/* Profile Header */}
        <section className="rounded-3xl border border-[#d4def8] bg-white p-6 shadow-[0_10px_28px_rgba(66,98,170,0.12)] dark:border-[#223067] dark:bg-[#111d49]">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#edf3ff] dark:bg-[#1a2858]">
              {data.profile_picture_url ? (
                <img src={data.profile_picture_url} alt={data.name} className="h-20 w-20 rounded-2xl object-cover" />
              ) : (
                <User className="h-10 w-10 text-[#4f8cff]" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-extrabold text-[#16213f] dark:text-white">{data.name}</h1>
                <span className={`rounded-lg px-3 py-1 text-xs font-black ${badgeClass}`}>{data.badge}</span>
              </div>
              {data.location && (
                <p className="mt-1 inline-flex items-center gap-1 text-sm text-[#6e80af] dark:text-[#96a9d9]">
                  <MapPin className="h-3.5 w-3.5" /> {data.location}
                </p>
              )}
              {data.bio && <p className="mt-2 text-sm text-[#5f6f98] dark:text-[#93a4d1]">{data.bio}</p>}

              <div className="mt-3 flex flex-wrap gap-3">
                {data.email && (
                  <a href={`mailto:${data.email}`} className="inline-flex items-center gap-1.5 text-sm text-[#4f6fbc] hover:underline dark:text-[#9db0df]">
                    <Mail className="h-3.5 w-3.5" /> {data.email}
                  </a>
                )}
                {data.github_profile && (
                  <a href={data.github_profile} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-[#4f6fbc] hover:underline dark:text-[#9db0df]">
                    <Github className="h-3.5 w-3.5" /> GitHub
                  </a>
                )}
                {data.linkedin_profile && (
                  <a href={data.linkedin_profile} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-[#4f6fbc] hover:underline dark:text-[#9db0df]">
                    <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                  </a>
                )}
              </div>
            </div>

            {/* DES Score Ring */}
            <div className="flex flex-col items-center rounded-2xl border border-[#d4def8] bg-[#f8fbff] p-4 dark:border-[#223067] dark:bg-[#0e1c45]">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#7d8db7] dark:text-[#7f92c6]">DES Score</p>
              <p className="mt-1 text-4xl font-black text-[#4f8cff]">{Math.round(data.des_score)}</p>
              <p className="text-xs text-[#7d8db7] dark:text-[#7f92c6]">/ 100</p>
            </div>
          </div>
        </section>

        {/* Mentor Evaluation Reports */}
        {data.evaluation_reports?.length > 0 && (
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-[#16213f] dark:text-white">
              <ShieldCheck className="h-5 w-5 text-[#17cf73]" />
              Mentor Evaluation Reports
            </h2>
            {data.evaluation_reports.map((ev: any, i: number) => (
              <article
                key={ev.evaluation_id}
                className="rounded-3xl border border-[#d4def8] bg-white p-5 shadow-[0_8px_24px_rgba(66,98,170,0.1)] dark:border-[#223067] dark:bg-[#111d49]"
              >
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-[#16213f] dark:text-white">{ev.project_title ?? `Project ${i + 1}`}</p>
                    <p className="mt-0.5 text-sm text-[#6e80af] dark:text-[#96a9d9]">
                      Evaluated by <span className="font-semibold">{ev.mentor_name ?? 'Mentor'}</span>
                      {ev.mentor_role && ` · ${ev.mentor_role}`}
                    </p>
                    {ev.skill_domain && (
                      <span className="mt-1 inline-block rounded-lg bg-[#edf3ff] px-2.5 py-1 text-xs font-semibold text-[#4f6fbc] dark:bg-[#1a2858] dark:text-[#9db0df]">
                        {ev.skill_domain}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {ev.verdict && (
                      <span className={`rounded-lg px-3 py-1.5 text-xs font-black capitalize ${VERDICT_COLORS[ev.verdict] ?? ''}`}>
                        {ev.verdict.replace(/_/g, ' ')}
                      </span>
                    )}
                    <span className="rounded-xl bg-[#4f8cff]/15 px-3 py-1.5 text-sm font-black text-[#4f8cff] dark:text-[#8aa9ff]">
                      {ev.total_score ?? '—'}/100
                    </span>
                  </div>
                </div>

                <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <ScoreBar label="Technical" score={ev.score_technical} max={40} />
                  <ScoreBar label="Practical" score={ev.score_practical} max={30} />
                  <ScoreBar label="Communication" score={ev.score_communication} max={20} />
                  <ScoreBar label="Originality" score={ev.score_originality} max={10} />
                </div>

                {(ev.feedback_strengths || ev.feedback_improvements) && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {ev.feedback_strengths && (
                      <div className="rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-900/20">
                        <p className="mb-1 flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                          <Star className="h-3.5 w-3.5" /> Strengths
                        </p>
                        <p className="text-sm text-emerald-800 dark:text-emerald-200">{ev.feedback_strengths}</p>
                      </div>
                    )}
                    {ev.feedback_improvements && (
                      <div className="rounded-2xl bg-amber-50 p-4 dark:bg-amber-900/20">
                        <p className="mb-1 text-xs font-bold text-amber-700 dark:text-amber-300">Areas to Improve</p>
                        <p className="text-sm text-amber-800 dark:text-amber-200">{ev.feedback_improvements}</p>
                      </div>
                    )}
                  </div>
                )}
              </article>
            ))}
          </section>
        )}

        {/* Verified Projects */}
        {data.verified_projects?.length > 0 && (
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-[#16213f] dark:text-white">
              <BookOpen className="h-5 w-5 text-[#4f8cff]" /> Verified Projects
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {data.verified_projects.map((p: any) => (
                <article key={p.id} className="rounded-2xl border border-[#d4def8] bg-[#f8fbff] p-4 dark:border-[#21376f] dark:bg-[#0e1c45]">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-[#1d2f5c] dark:text-[#deebff]">{p.title}</p>
                      {p.skill_domain && (
                        <p className="mt-0.5 text-xs text-[#6e80af] dark:text-[#96a9d9]">{p.skill_domain}</p>
                      )}
                    </div>
                    {p.verified_badge && (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                        <BadgeCheck className="h-3 w-3" /> Verified
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(p.tech_stack || []).map((t: string) => (
                      <span key={t} className="rounded-md bg-[#edf3ff] px-2 py-0.5 text-[11px] font-medium text-[#5c73b5] dark:bg-[#1a2858] dark:text-[#8ea1d6]">{t}</span>
                    ))}
                  </div>
                  <div className="mt-3 flex gap-2">
                    {p.github_url && (
                      <a href={p.github_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-[#4f6fbc] hover:underline dark:text-[#9db0df]">
                        <Github className="h-3.5 w-3.5" /> GitHub
                      </a>
                    )}
                    {p.live_url && (
                      <a href={p.live_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-[#4f6fbc] hover:underline dark:text-[#9db0df]">
                        <ExternalLink className="h-3.5 w-3.5" /> Live
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {(data.technical_skills || data.soft_skills) && (
          <section className="rounded-3xl border border-[#d4def8] bg-white p-5 shadow-[0_8px_24px_rgba(66,98,170,0.1)] dark:border-[#223067] dark:bg-[#111d49]">
            <h2 className="mb-4 text-lg font-extrabold text-[#16213f] dark:text-white">Skills</h2>
            {data.technical_skills && (
              <div className="mb-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#7d8db7] dark:text-[#7f92c6]">Technical</p>
                <p className="text-sm text-[#22335f] dark:text-[#d7e3ff]">{data.technical_skills}</p>
              </div>
            )}
            {data.soft_skills && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#7d8db7] dark:text-[#7f92c6]">Soft Skills</p>
                <p className="text-sm text-[#22335f] dark:text-[#d7e3ff]">{data.soft_skills}</p>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
