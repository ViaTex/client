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
  Info,
  Bookmark,
  ChevronLeft,
  ChevronDown
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

const API = process.env.NEXT_PUBLIC_API_URL ?? ''
function getToken() { return localStorage.getItem('access_token') ?? '' }

const BADGE_PILL: Record<string, string> = {
  Diamond: 'bg-gradient-to-r from-sky-400 to-violet-500 text-white',
  Gold:    'bg-gradient-to-r from-amber-400 to-orange-400 text-white',
  Silver:  'bg-gradient-to-r from-slate-300 to-slate-450 text-white',
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
  
  // Custom interactive states
  const [showInfoAlert, setShowInfoAlert] = useState(true)
  const [savedStudentIds, setSavedStudentIds] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  async function fetchMatches() {
    setLoading(true)
    setError('')
    try {
      const skillParams = selectedSkills.map((s) => `skills=${encodeURIComponent(s)}`).join('&')
      const url = `${API}/api/v1/corporate/smart-matches?min_des=${minDes}&limit=50${skillParams ? '&' + skillParams : ''}`
      const res = await fetch(url, { headers: { Authorization: `Bearer ${getToken()}` } })
      if (!res.ok) throw new Error('Failed to load matches')
      setCandidates(await res.json())
      setCurrentPage(1) // Reset page on new fetch
    } catch {
      setError('Could not load smart matches.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    fetchMatches() 
  }, [])

  function toggleSkill(skill: string) {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    )
  }

  function getInitials(name: string) {
    if (!name) return '?'
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return parts[0].slice(0, 2).toUpperCase()
  }

  const toggleSaveCandidate = (id: string) => {
    setSavedStudentIds(prev => {
      const exists = prev.includes(id)
      if (exists) {
        toast.success("Candidate removed from saved list")
        return prev.filter(x => x !== id)
      } else {
        toast.success("Candidate saved successfully!")
        return [...prev, id]
      }
    })
  }

  // Pagination logic
  const startIndex = (currentPage - 1) * pageSize
  const paginatedCandidates = candidates.slice(startIndex, startIndex + pageSize)
  const totalPages = Math.max(Math.ceil(candidates.length / pageSize), 1)

  return (
    <div className="min-h-[calc(100vh-80px)] rounded-[1.25rem] bg-[#eef3ff] dark:bg-[#101d49] p-4 shadow-sm sm:rounded-[1.5rem] sm:p-5 md:rounded-[2rem] md:p-6 text-[#16213f] dark:text-white border border-[#d4def8]/50 dark:border-[#223067]/40 transition-colors duration-300">
      <div className="mx-auto w-full space-y-6">

        {/* Header */}
        <section className="rounded-2xl border border-[#d4def8] bg-white p-5 shadow-[0_10px_28px_rgba(66,98,170,0.08)] sm:p-6 dark:border-[#223067] dark:bg-[#111d49] dark:shadow-[0_8px_24px_rgba(3,8,26,0.2)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#5c73b5] dark:text-[#8ea1d6]">
                <Sparkles className="h-4 w-4 text-[#17cf73]" />
                Phase 2 — Zero-Screening Match
              </p>
              <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#16213f] dark:text-white">
                Smart Match
              </h1>
              <p className="mt-1 text-sm text-[#5f6f98] dark:text-[#93a4d1]">
                Only verified candidates — each one has passed a live Mentor Viva.
              </p>
            </div>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className="inline-flex items-center gap-2 rounded-xl border border-[#d4def8] bg-[#edf3ff] px-4 py-2.5 text-sm font-bold text-[#4f6fbc] hover:bg-[#dce9ff] dark:border-[#223067] dark:bg-[#1a2858] dark:text-[#9db0df] transition-colors"
            >
              <Filter className="h-4 w-4" /> Filters
            </button>
          </div>
        </section>

        {/* Filters */}
        {showFilters && (
          <section className="rounded-2xl border border-[#d4def8] bg-white p-5 shadow-[0_10px_28px_rgba(66,98,170,0.08)] dark:border-[#223067] dark:bg-[#111d49] dark:shadow-[0_8px_24px_rgba(3,8,26,0.2)]">
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
                className="w-full rounded-xl bg-[#4f8cff] py-2.5 text-sm font-bold text-white hover:bg-[#3a7de0] transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </section>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-500/25 px-4 py-3 text-sm text-red-650 dark:text-red-300">{error}</div>
        )}

        {/* Results */}
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#4f8cff]" />
          </div>
        ) : candidates.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#ccd7f5] bg-white dark:bg-[#111d49] p-10 text-center shadow-sm">
            <ShieldCheck className="mx-auto mb-3 h-12 w-12 text-[#b0c4f5] dark:text-[#3a5499]" />
            <p className="font-semibold text-[#22335f] dark:text-[#d7e3ff]">No verified candidates match your current filters</p>
            <p className="mt-1 text-sm text-[#7d8db7]">Try lowering the DES threshold or removing skill filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-[#5f6f98] dark:text-[#93a4d1]">
              {candidates.length} verified candidate{candidates.length !== 1 ? 's' : ''} found
            </p>

            {/* List */}
            <div className="space-y-4">
              {paginatedCandidates.map((c) => {
                const isSaved = savedStudentIds.includes(c.student_id)
                const initials = getInitials(c.name)
                const badgeClass = BADGE_PILL[c.badge] ?? BADGE_PILL.Bronze

                return (
                  <article
                    key={c.student_id}
                    className="rounded-2xl border border-[#d4def8] bg-white dark:bg-[#111d49] p-5 sm:p-6 shadow-[0_8px_24px_rgba(66,98,170,0.06)] dark:shadow-[0_8px_24px_rgba(3,8,26,0.2)] transition-all hover:border-[#4f8cff]/40 dark:hover:border-[#223067]/80 hover:shadow-[0_12px_32px_rgba(66,98,170,0.12)] dark:hover:shadow-[0_12px_32px_rgba(3,8,26,0.3)] flex flex-col lg:flex-row lg:items-center gap-6"
                  >
                    {/* Identity & Avatar */}
                    <div className="flex items-center gap-4 flex-shrink-0 lg:pr-6 lg:border-r border-[#d4def8] dark:border-[#223067] lg:min-w-[280px]">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-extrabold text-lg shadow-inner flex-shrink-0">
                        {initials}
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 
                            onClick={() => router.push(`/dashboard/corporate/candidates/${c.student_id}`)}
                            className="font-extrabold text-lg text-[#16213f] dark:text-white hover:text-[#4f8cff] dark:hover:text-[#8ea1d6] transition-colors cursor-pointer"
                          >
                            {c.name}
                          </h3>
                          <span className={`rounded-md px-2 py-0.5 text-[10px] font-black tracking-wide uppercase ${badgeClass}`}>
                            {c.badge}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-500/20">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500 dark:text-emerald-400" /> Verified
                          </span>
                        </div>
                        
                        {c.mentor_name && (
                          <p className="text-xs text-[#5f6f98] dark:text-[#93a4d1] flex items-center gap-1 mt-1">
                            <span className="text-emerald-500 dark:text-emerald-400 font-bold">✓</span> Evaluated by{" "}
                            <span className="font-semibold text-[#4f6fbc] dark:text-[#9db0df] hover:underline cursor-pointer">{c.mentor_name}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* DES Score, Skills, Viva Score */}
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 justify-start">
                      
                      {/* DES Card */}
                      <div className="flex flex-col items-center justify-center rounded-xl bg-[#f8fbff] dark:bg-[#0e1c45] border border-[#d4def8] dark:border-[#223067]/80 px-5 py-2.5 min-w-[80px] h-18 text-center shadow-inner">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#7d8db7] dark:text-[#7f92c6]">DES</p>
                        <p className="text-2xl font-black text-[#4f8cff] mt-0.5">{Math.round(c.des_score)}</p>
                        <p className="text-[9px] font-semibold text-gray-400 dark:text-slate-600">/100</p>
                      </div>

                      {/* Verified Skill domain */}
                      <div className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/5 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-405">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>{c.verified_skills[0] || 'Full Stack'}</span>
                      </div>

                      {/* Viva Card */}
                      {c.best_viva_score != null && (
                        <div className="flex flex-col items-center justify-center rounded-xl bg-[#f8fbff] dark:bg-[#0e1c45] border border-[#d4def8] dark:border-[#223067]/80 px-5 py-2.5 min-w-[80px] h-18 text-center shadow-inner">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#7d8db7] dark:text-[#7f92c6]">VIVA</p>
                          <p className="text-2xl font-black text-purple-650 dark:text-purple-400 mt-0.5">{c.best_viva_score}/100</p>
                          <p className="text-[9px] font-semibold text-gray-400 dark:text-slate-600">Score</p>
                        </div>
                      )}

                    </div>

                    {/* Actions */}
                    <div className="flex flex-row lg:flex-col gap-2.5 items-stretch lg:items-end justify-end w-full lg:w-auto lg:ml-auto flex-shrink-0">
                      <button
                        onClick={() => router.push(`/dashboard/corporate/candidates/${c.student_id}`)}
                        className="flex-1 lg:flex-none w-full lg:w-[130px] inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#10b981] hover:bg-[#059669] px-4 py-2.5 text-xs font-extrabold text-white transition-all shadow-md hover:shadow-lg"
                      >
                        View Profile <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => toggleSaveCandidate(c.student_id)}
                        className={`flex-1 lg:flex-none w-full lg:w-[130px] inline-flex items-center justify-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-extrabold transition-all ${
                          isSaved
                            ? "bg-[#4f8cff] border-[#4f8cff] text-white shadow-md"
                            : "border-[#d4def8] dark:border-[#223067] bg-transparent text-[#5c73b5] dark:text-[#9db0df] hover:bg-[#edf3ff] dark:hover:bg-[#1a2858] hover:text-[#4f6fbc] dark:hover:text-white"
                        }`}
                      >
                        <Bookmark className={`h-3.5 w-3.5 ${isSaved ? "fill-current" : ""}`} />
                        <span>{isSaved ? 'Saved' : 'Save'}</span>
                      </button>
                    </div>

                  </article>
                )
              })}
            </div>

            {/* Helper Alert Box */}
            {showInfoAlert && (
              <div className="rounded-2xl border border-blue-200 dark:border-blue-500/15 bg-blue-50 dark:bg-blue-550/5 bg-opacity-40 p-4 flex items-center justify-between text-xs sm:text-sm text-blue-700 dark:text-[#9db0df] relative transition-all duration-300 shadow-sm">
                <div className="flex items-center gap-3">
                  <Info className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span>The Smart Match score (DES) is calculated based on domain expertise, technical skills, problem solving, and communication.</span>
                </div>
                <button onClick={() => setShowInfoAlert(false)} className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-white transition-colors ml-2 flex-shrink-0">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Pagination Footer */}
            {candidates.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#d4def8] dark:border-[#223067]/40 text-xs sm:text-sm text-[#7d8db7] dark:text-[#7f92c6]">
                <div>
                  Showing {startIndex + 1} to {Math.min(startIndex + pageSize, candidates.length)} of {candidates.length} candidate{candidates.length !== 1 ? 's' : ''}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(v => Math.max(v - 1, 1))}
                    className="p-2 rounded-lg border border-[#d4def8] dark:border-[#223067] bg-transparent text-[#5c73b5] dark:text-slate-400 hover:bg-[#edf3ff] dark:hover:bg-[#0e1c45] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    className="h-8 w-8 rounded-lg border border-blue-200 dark:border-blue-550/20 bg-[#edf3ff] dark:bg-[#1a2858] text-[#4f8cff] font-bold text-center text-xs"
                  >
                    {currentPage}
                  </button>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(v => Math.min(v + 1, totalPages))}
                    className="p-2 rounded-lg border border-[#d4def8] dark:border-[#223067] bg-transparent text-[#5c73b5] dark:text-slate-400 hover:bg-[#edf3ff] dark:hover:bg-[#0e1c45] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span>Show</span>
                  <div className="relative">
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value))
                        setCurrentPage(1)
                      }}
                      className="appearance-none bg-white dark:bg-[#111d49] border border-[#d4def8] dark:border-[#223067] rounded-lg px-3 py-1.5 pr-8 text-xs font-semibold text-[#16213f] dark:text-slate-350 outline-none focus:border-blue-500/50"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500 pointer-events-none" />
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  )
}
