'use client'

import { useEffect, useState } from 'react'
import {
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  Filter,
  Loader2,
  MapPin,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL ?? ''
function getToken() { return localStorage.getItem('access_token') ?? '' }

const BADGE_PILL: Record<string, string> = {
  Diamond: 'bg-gradient-to-r from-sky-400 to-violet-500 text-white',
  Gold:    'bg-gradient-to-r from-amber-400 to-orange-400 text-white',
  Silver:  'bg-gradient-to-r from-slate-300 to-slate-400 text-white',
  Bronze:  'bg-gradient-to-r from-amber-700 to-amber-500 text-white',
}

const SKILL_DOMAINS = [
  'Frontend', 'Backend', 'Full Stack', 'Data Science', 'Machine Learning',
  'DevOps', 'Mobile', 'UI/UX Design', 'Cybersecurity', 'Cloud',
]

interface Candidate {
  student_id: string
  name: string
  email: string
  location: string | null
  des_score: number
  badge: string
  verified_skills: string[]
  best_viva_score: number | null
  best_viva_verdict: string | null
  mentor_name: string | null
  github_profile: string | null
  linkedin_profile: string | null
}

export default function CorporateSmartMatchPage() {
  const router = useRouter()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(false)
  const [minDes, setMinDes] = useState(75)
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [error, setError] = useState('')

  async function fetchMatches() {
    setLoading(true)
    setError('')
    try {
      const skillParams = selectedSkills.map((s) => `skills=${encodeURIComponent(s)}`).join('&')
      const url = `${API}/api/v1/corporate/smart-matches?min_des=${minDes}&limit=50${skillParams ? '&' + skillParams : ''}`
      const res = await fetch(url, { headers: { Authorization: `Bearer ${getToken()}` } })
      if (!res.ok) throw new Error('Failed to load matches')
      setCandidates(await res.json())
    } catch {
      setError('Could not load smart matches.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMatches() }, [])

  function toggleSkill(skill: string) {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    )
  }

  return (
    <div className="min-h-[calc(100vh-80px)] rounded-[1.25rem] bg-[#eef3ff] p-4 shadow-sm sm:rounded-[1.5rem] sm:p-5 md:rounded-[2rem] md:p-6 dark:bg-[#101d49]">
      <div className="mx-auto max-w-5xl space-y-6">

        {/* Header */}
        <section className="rounded-3xl border border-[#d4def8] bg-white p-5 shadow-[0_10px_28px_rgba(66,98,170,0.12)] sm:p-6 dark:border-[#223067] dark:bg-[#111d49]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#5c73b5] dark:text-[#8ea1d6]">
                <Sparkles className="h-4 w-4 text-[#17cf73]" />
                Phase 2 — Zero-Screening Match
              </p>
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#16213f] sm:text-3xl dark:text-white">
                Smart Match
              </h1>
              <p className="mt-1 text-sm text-[#5f6f98] dark:text-[#93a4d1]">
                Only verified candidates — each one has passed a live Mentor Viva.
              </p>
            </div>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className="inline-flex items-center gap-2 rounded-xl border border-[#d4def8] bg-[#edf3ff] px-4 py-2.5 text-sm font-bold text-[#4f6fbc] hover:bg-[#dce9ff] dark:border-[#223067] dark:bg-[#1a2858] dark:text-[#9db0df]"
            >
              <Filter className="h-4 w-4" /> Filters
            </button>
          </div>
        </section>

        {/* Filters */}
        {showFilters && (
          <section className="rounded-3xl border border-[#d4def8] bg-white p-5 shadow-[0_8px_24px_rgba(66,98,170,0.1)] dark:border-[#223067] dark:bg-[#111d49]">
            <div className="space-y-4">
              <div>
                <label className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-[#5c73b5] dark:text-[#8ea1d6]">
                  <span>Minimum DES Score</span>
                  <span className="text-lg font-black text-[#4f8cff]">{minDes}</span>
                </label>
                <input
                  type="range" min={0} max={100} step={5}
                  value={minDes}
                  onChange={(e) => setMinDes(Number(e.target.value))}
                  className="w-full accent-[#4f8cff]"
                />
                <div className="mt-1 flex justify-between text-[11px] text-[#7d8db7]">
                  <span>0</span><span>50</span><span>100</span>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#5c73b5] dark:text-[#8ea1d6]">
                  Required Verified Skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {SKILL_DOMAINS.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                        selectedSkills.includes(skill)
                          ? 'bg-[#4f8cff] text-white'
                          : 'bg-[#edf3ff] text-[#4f6fbc] hover:bg-[#dce9ff] dark:bg-[#1a2858] dark:text-[#9db0df]'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={fetchMatches}
                className="w-full rounded-xl bg-[#4f8cff] py-2.5 text-sm font-bold text-white hover:bg-[#3a7de0]"
              >
                Apply Filters
              </button>
            </div>
          </section>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">{error}</div>
        )}

        {/* Results */}
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#4f8cff]" />
          </div>
        ) : candidates.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#c5d4f5] bg-white p-10 text-center dark:border-[#2a3f7a] dark:bg-[#111d49]">
            <ShieldCheck className="mx-auto mb-3 h-12 w-12 text-[#b0c4f5] dark:text-[#3a5499]" />
            <p className="font-semibold text-[#22335f] dark:text-[#d7e3ff]">No verified candidates match your current filters</p>
            <p className="mt-1 text-sm text-[#7d8db7]">Try lowering the DES threshold or removing skill filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-[#5f6f98] dark:text-[#93a4d1]">
              {candidates.length} verified candidate{candidates.length !== 1 ? 's' : ''} found
            </p>
            {candidates.map((c) => {
              const badgeClass = BADGE_PILL[c.badge] ?? BADGE_PILL.Bronze
              return (
                <article
                  key={c.student_id}
                  className="rounded-3xl border border-[#d4def8] bg-white p-5 shadow-[0_8px_24px_rgba(66,98,170,0.1)] transition-all hover:shadow-[0_12px_32px_rgba(66,98,170,0.16)] dark:border-[#223067] dark:bg-[#111d49]"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    {/* Identity */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-extrabold text-[#16213f] dark:text-white">{c.name}</p>
                        <span className={`rounded-lg px-2.5 py-0.5 text-[11px] font-black ${badgeClass}`}>{c.badge}</span>
                      </div>
                      {c.location && (
                        <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-[#6e80af] dark:text-[#96a9d9]">
                          <MapPin className="h-3 w-3" /> {c.location}
                        </p>
                      )}
                    </div>

                    {/* DES */}
                    <div className="flex flex-col items-center rounded-xl bg-[#f8fbff] px-4 py-2 dark:bg-[#0e1c45]">
                      <p className="text-xs font-semibold text-[#7d8db7] dark:text-[#7f92c6]">DES</p>
                      <p className="text-2xl font-black text-[#4f8cff]">{Math.round(c.des_score)}</p>
                    </div>

                    {/* Verified Skills */}
                    <div className="flex flex-wrap gap-1.5">
                      {c.verified_skills.map((skill) => (
                        <span key={skill} className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                          <BadgeCheck className="h-3 w-3" /> {skill}
                        </span>
                      ))}
                    </div>

                    {/* Viva Score */}
                    {c.best_viva_score != null && (
                      <div className="flex flex-col items-center rounded-xl bg-[#edf3ff] px-3 py-2 dark:bg-[#1a2858]">
                        <p className="text-[10px] font-semibold uppercase text-[#7d8db7]">Viva</p>
                        <p className="font-black text-[#4f6fbc] dark:text-[#9db0df]">{c.best_viva_score}/100</p>
                      </div>
                    )}

                    {/* Action */}
                    <button
                      onClick={() => router.push(`/dashboard/corporate/candidates/${c.student_id}`)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#17cf73] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#11b865] transition-colors"
                    >
                      View Profile <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {c.mentor_name && (
                    <p className="mt-3 text-xs text-[#7d8db7] dark:text-[#7f92c6]">
                      ✓ Evaluated by <span className="font-semibold text-[#4f6fbc] dark:text-[#9db0df]">{c.mentor_name}</span>
                    </p>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
