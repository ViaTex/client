'use client'

import { useEffect, useState } from 'react'
import { SkillEvaluationItem } from '@/lib/types'
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Code2,
  FileText,
  Lightbulb,
  Loader2,
  MessageSquare,
  ShieldCheck,
  Star,
  Trophy,
  User,
  Video,
  X
} from 'lucide-react'
import { Modal } from '@/components/ui/modal'

const API = process.env.NEXT_PUBLIC_API_URL ?? ''
function getToken() { return localStorage.getItem('access_token') ?? '' }

const STATUS_COLORS: Record<string, string> = {
  assigned: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  viva_scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  evaluated: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
}

export default function MentorEvaluationsPage() {
  const [evaluations, setEvaluations] = useState<SkillEvaluationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending')

  // Modals state
  const [schedulingId, setSchedulingId] = useState<string | null>(null)
  const [slots, setSlots] = useState<string[]>([''])
  const [meetingLink, setMeetingLink] = useState('')

  const [scoringId, setScoringId] = useState<string | null>(null)
  const [scores, setScores] = useState({ technical: 0, practical: 0, communication: 0, originality: 0 })
  const [feedback, setFeedback] = useState({ strengths: '', improvements: '', verdict: 'good' })
  const [actionLoading, setActionLoading] = useState(false)

  const [viewDetailsId, setViewDetailsId] = useState<string | null>(null)
  const [profileId, setProfileId] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch(`${API}/mentor/evaluations`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!res.ok) throw new Error()
      setEvaluations(await res.json())
    } catch {
      setError('Could not load assigned evaluations.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const pending = evaluations.filter((e) => ['assigned', 'viva_scheduled'].includes(e.status))
  const completed = evaluations.filter((e) => e.status === 'evaluated')
  const displayed = activeTab === 'pending' ? pending : completed

  async function handleSchedule() {
    if (!schedulingId) return
    setActionLoading(true)
    try {
      const validSlots = slots.filter((s) => s.trim().length > 0)
      const res = await fetch(`${API}/mentor/evaluations/${schedulingId}/schedule`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          status: 'viva_scheduled',
          proposed_slots: validSlots,
          viva_meeting_link: meetingLink || undefined,
        }),
      })
      if (!res.ok) throw new Error('Failed to schedule')
      setSchedulingId(null)
      await load()
    } catch (err) {
      alert('Error scheduling viva')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleScore() {
    if (!scoringId) return
    setActionLoading(true)
    try {
      const total = scores.technical + scores.practical + scores.communication + scores.originality
      const ev = evaluations.find((e) => e.evaluation_id === scoringId)

      // 1. Submit score
      const res1 = await fetch(`${API}/mentor/evaluations/${scoringId}/score`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          status: 'evaluated',
          score_technical: scores.technical,
          score_practical: scores.practical,
          score_communication: scores.communication,
          score_originality: scores.originality,
          total_score: total,
          verdict: feedback.verdict,
          feedback_strengths: feedback.strengths,
          feedback_improvements: feedback.improvements,
        }),
      })
      if (!res1.ok) throw new Error('Failed to submit score')

      // 2. Mark project verified if excellent/very_good/good
      if (ev?.project_id && ['excellent', 'very_good', 'good'].includes(feedback.verdict)) {
        await fetch(`${API}/projects/${ev.project_id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
          body: JSON.stringify({
            status: 'verified',
            verified_badge: 'Verified Developer ✓',
          }),
        })
      }

      setScoringId(null)
      await load()
    } catch (err) {
      alert('Error submitting score')
    } finally {
      setActionLoading(false)
    }
  }

  function fmtDate(iso: string | null) {
    if (!iso) return '—'
    return new Date(iso).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  return (
    <div className="mx-auto max-w-5xl min-h-[calc(100vh-80px)] rounded-[1.25rem] bg-[#eef3ff] p-4 shadow-sm sm:rounded-[1.5rem] sm:p-5 md:rounded-[2rem] md:p-6 dark:bg-[#101d49]">
      <div className="space-y-6">

        {/* Header */}
        <section className="rounded-3xl border border-[#d4def8] bg-white p-5 shadow-[0_10px_28px_rgba(66,98,170,0.12)] dark:border-[#223067] dark:bg-[#111d49]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#5c73b5] dark:text-[#8ea1d6]">
                <ShieldCheck className="h-4 w-4 text-[#17cf73]" />
                Phase 1.5 — Human-in-the-Loop Verification
              </p>
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#16213f] sm:text-3xl dark:text-white">Mentor Viva Dashboard</h1>
              <p className="mt-1 text-sm text-[#5f6f98] dark:text-[#93a4d1]">
                Review projects, conduct 45-minute technical Vivas, and certify top talent.
              </p>
            </div>
          </div>

          <div className="mt-5 inline-flex rounded-xl bg-[#edf3ff] p-1 dark:bg-[#1a2858]">
            {(['pending', 'completed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-4 py-2 text-xs font-bold capitalize transition-colors ${
                  activeTab === tab
                    ? 'bg-white text-[#16213f] shadow-sm dark:bg-[#101d49] dark:text-white'
                    : 'text-[#5872b6] dark:text-[#9db0df]'
                }`}
              >
                {tab} ({tab === 'pending' ? pending.length : completed.length})
              </button>
            ))}
          </div>
        </section>

        {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30">{error}</div>}

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#4f8cff]" />
          </div>
        ) : displayed.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#c5d4f5] bg-white p-10 text-center dark:border-[#2a3f7a] dark:bg-[#111d49]">
            <Trophy className="mx-auto mb-3 h-12 w-12 text-[#b0c4f5] dark:text-[#3a5499]" />
            <p className="font-semibold text-[#22335f] dark:text-[#d7e3ff]">No {activeTab} evaluations</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayed.map((ev) => (
              <article key={ev.evaluation_id} className="rounded-3xl border border-[#d4def8] bg-white p-5 shadow-[0_8px_24px_rgba(66,98,170,0.1)] transition-all dark:border-[#223067] dark:bg-[#111d49]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-extrabold text-[#16213f] dark:text-white">
                        {ev.project?.title || `Project ID: ${ev.project_id?.split('-')[0] ?? 'N/A'}`}
                      </p>
                      <span className={`rounded-lg px-2.5 py-1 text-[11px] font-black capitalize ${STATUS_COLORS[ev.status]}`}>
                        {ev.status.replace('_', ' ')}
                      </span>
                      {ev.project?.skill_domain && (
                        <span className="rounded-lg bg-[#edf3ff] px-2.5 py-1 text-[11px] font-semibold text-[#4f6fbc] dark:bg-[#1a2858] dark:text-[#8ea1d6]">
                          {ev.project.skill_domain}
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-2 flex items-center gap-2 text-sm text-[#5f6f98] dark:text-[#93a4d1]">
                      {ev.student?.profile_picture_url ? (
                        <img src={ev.student.profile_picture_url} alt="avatar" className="h-5 w-5 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#dde6ff] text-[#4f8cff] dark:bg-[#1a2858]">
                          <User className="h-3 w-3" />
                        </div>
                      )}
                      <p className="font-medium text-[#22335f] dark:text-[#d7e3ff]">{ev.student?.name || `Student ID: ${ev.student_id.split('-')[0]}`}</p>
                      <span className="text-[#a3b6e5]">•</span>
                      <p className="text-xs">Added on {fmtDate(ev.created_at)}</p>
                    </div>

                    {ev.project?.description && (
                      <p className="mt-3 line-clamp-2 max-w-2xl text-sm leading-relaxed text-[#5f6f98] dark:text-[#93a4d1]">
                        {ev.project.description}
                      </p>
                    )}

                    <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-[#5f6f98] dark:text-[#93a4d1]">
                      {ev.confirmed_slot ? (
                        <span className="inline-flex items-center gap-1 font-bold text-[#4f8cff] dark:text-[#8aa9ff]">
                          <Clock className="h-3.5 w-3.5" />
                          Confirmed: {fmtDate(ev.confirmed_slot)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {ev.proposed_slots?.length || 0} slots proposed
                        </span>
                      )}
                      
                      {ev.project?.github_url && (
                        <a href={ev.project.github_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#4f6fbc] hover:underline dark:text-[#8ea1d6]">
                          <Code2 className="h-3.5 w-3.5" /> Source Code
                        </a>
                      )}
                      {ev.project?.live_url && (
                        <a href={ev.project.live_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#4f6fbc] hover:underline dark:text-[#8ea1d6]">
                          <Lightbulb className="h-3.5 w-3.5" /> Live Demo
                        </a>
                      )}

                      <div className="mt-2 flex w-full items-center gap-2 sm:mt-0 sm:w-auto sm:ml-auto">
                        <button 
                          onClick={() => setViewDetailsId(viewDetailsId === ev.evaluation_id ? null : ev.evaluation_id)}
                          className="flex-1 justify-center inline-flex items-center gap-1.5 rounded-lg border border-[#d4def8] bg-[#f8fbff] px-3 py-1.5 text-[11px] font-bold text-[#4f6fbc] hover:bg-[#eef3ff] sm:flex-none dark:border-[#223067] dark:bg-[#15234e] dark:text-[#9db0df] dark:hover:bg-[#1a2b5e]">
                          <FileText className="h-3 w-3" /> View Details
                        </button>
                        <button 
                          onClick={() => setProfileId(profileId === ev.evaluation_id ? null : ev.evaluation_id)}
                          className="flex-1 justify-center inline-flex items-center gap-1.5 rounded-lg border border-[#d4def8] bg-[#f8fbff] px-3 py-1.5 text-[11px] font-bold text-[#4f6fbc] hover:bg-[#eef3ff] sm:flex-none dark:border-[#223067] dark:bg-[#15234e] dark:text-[#9db0df] dark:hover:bg-[#1a2b5e]">
                          <User className="h-3 w-3" /> Student Profile
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex w-full flex-col justify-start gap-2 border-t border-[#edf3ff] pt-4 sm:ml-5 sm:w-48 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0 dark:border-[#1a2858]">
                    {ev.status === 'assigned' && (
                      <button
                        onClick={() => { setSchedulingId(ev.evaluation_id); setSlots(['']); setMeetingLink(''); }}
                        className="w-full whitespace-nowrap rounded-xl bg-[#4f8cff] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#3a7de0]"
                      >
                        Propose Slots
                      </button>
                    )}
                    {ev.status === 'viva_scheduled' && (
                      <>
                        <button
                          onClick={() => {
                            setScoringId(ev.evaluation_id)
                            setScores({ technical: 0, practical: 0, communication: 0, originality: 0 })
                            setFeedback({ strengths: '', improvements: '', verdict: 'good' })
                          }}
                          className="w-full whitespace-nowrap rounded-xl bg-[#17cf73] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#11b865]"
                        >
                          Grade Viva
                        </button>
                        {ev.viva_meeting_link && (
                          <a href={ev.viva_meeting_link} target="_blank" rel="noreferrer" className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#d4def8] bg-white px-5 py-2.5 text-xs font-bold text-[#4f6fbc] hover:bg-[#f8fbff] dark:border-[#223067] dark:bg-[#111d49] dark:text-[#9db0df]">
                            <Video className="h-3.5 w-3.5" /> Join Meeting
                          </a>
                        )}
                      </>
                    )}
                    {ev.status === 'evaluated' && (
                      <div className="mb-2 flex flex-col items-center justify-center">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#7d8db7]">Total Score</p>
                        <p className="text-2xl font-black text-[#16213f] dark:text-white">{ev.total_score}<span className="text-sm text-[#7d8db7]">/100</span></p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Scheduling Modal */}
                {schedulingId === ev.evaluation_id && (
                  <div className="mt-5 rounded-2xl border border-[#dde6ff] bg-[#f8fbff] p-5 dark:border-[#21376f] dark:bg-[#0e1c45]">
                    <p className="mb-4 text-sm font-bold text-[#16213f] dark:text-white">Propose Viva Slots</p>
                    <div className="space-y-3">
                      {slots.map((s, i) => (
                        <div key={i}>
                          <label className="mb-1 block text-xs font-semibold text-[#5c73b5]">Slot {i + 1} (ISO 8601)</label>
                          <input
                            type="datetime-local"
                            value={s}
                            onChange={(e) => {
                              const ns = [...slots]
                              ns[i] = e.target.value
                              setSlots(ns)
                            }}
                            className="w-full rounded-xl border border-[#d4def8] bg-white px-3 py-2 text-sm text-[#16213f] dark:border-[#223067] dark:bg-[#111d49] dark:text-white"
                          />
                        </div>
                      ))}
                      <button onClick={() => setSlots([...slots, ''])} className="text-xs font-bold text-[#4f8cff]">+ Add another slot</button>
                      
                      <div className="pt-2">
                        <label className="mb-1 block text-xs font-semibold text-[#5c73b5]">Meeting Link (Google Meet / Zoom)</label>
                        <input
                          type="url" value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} placeholder="https://meet.google.com/..."
                          className="w-full rounded-xl border border-[#d4def8] bg-white px-3 py-2 text-sm text-[#16213f] dark:border-[#223067] dark:bg-[#111d49] dark:text-white"
                        />
                      </div>

                      <div className="mt-4 flex gap-2">
                        <button onClick={() => setSchedulingId(null)} className="flex-1 rounded-xl border border-[#d4def8] py-2 text-xs font-bold text-[#5f6f98]">Cancel</button>
                        <button onClick={handleSchedule} disabled={actionLoading} className="flex-1 rounded-xl bg-[#4f8cff] py-2 text-xs font-bold text-white hover:bg-[#3a7de0]">
                          {actionLoading ? 'Saving...' : 'Send to Student'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Scoring Modal */}
                {scoringId === ev.evaluation_id && (
                  <div className="mt-5 rounded-2xl border border-[#dde6ff] bg-[#f8fbff] p-5 dark:border-[#21376f] dark:bg-[#0e1c45]">
                    <p className="mb-4 text-sm font-bold text-[#16213f] dark:text-white">Mentor Evaluation Report</p>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div><label className="text-xs font-semibold text-[#5c73b5]">Technical (out of 40)</label><input type="number" min={0} max={40} value={scores.technical} onChange={e => setScores({...scores, technical: +e.target.value})} className="mt-1 w-full rounded-xl border border-[#d4def8] px-3 py-2 text-sm" /></div>
                      <div><label className="text-xs font-semibold text-[#5c73b5]">Practical (out of 30)</label><input type="number" min={0} max={30} value={scores.practical} onChange={e => setScores({...scores, practical: +e.target.value})} className="mt-1 w-full rounded-xl border border-[#d4def8] px-3 py-2 text-sm" /></div>
                      <div><label className="text-xs font-semibold text-[#5c73b5]">Communication (out of 20)</label><input type="number" min={0} max={20} value={scores.communication} onChange={e => setScores({...scores, communication: +e.target.value})} className="mt-1 w-full rounded-xl border border-[#d4def8] px-3 py-2 text-sm" /></div>
                      <div><label className="text-xs font-semibold text-[#5c73b5]">Originality (out of 10)</label><input type="number" min={0} max={10} value={scores.originality} onChange={e => setScores({...scores, originality: +e.target.value})} className="mt-1 w-full rounded-xl border border-[#d4def8] px-3 py-2 text-sm" /></div>
                    </div>
                    
                    <div className="mt-4 space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-[#5c73b5]">Verdict</label>
                        <select value={feedback.verdict} onChange={e => setFeedback({...feedback, verdict: e.target.value})} className="mt-1 w-full rounded-xl border border-[#d4def8] px-3 py-2 text-sm">
                          <option value="excellent">Excellent (Hire immediately)</option>
                          <option value="very_good">Very Good</option>
                          <option value="good">Good</option>
                          <option value="needs_improvement">Needs Improvement</option>
                          <option value="did_not_pass">Did Not Pass</option>
                        </select>
                      </div>
                      <div><label className="text-xs font-semibold text-[#5c73b5]">Strengths</label><textarea rows={2} value={feedback.strengths} onChange={e => setFeedback({...feedback, strengths: e.target.value})} className="mt-1 w-full rounded-xl border border-[#d4def8] px-3 py-2 text-sm" /></div>
                      <div><label className="text-xs font-semibold text-[#5c73b5]">Areas for Improvement</label><textarea rows={2} value={feedback.improvements} onChange={e => setFeedback({...feedback, improvements: e.target.value})} className="mt-1 w-full rounded-xl border border-[#d4def8] px-3 py-2 text-sm" /></div>
                    </div>

                    <div className="mt-5 flex gap-2">
                      <button onClick={() => setScoringId(null)} className="flex-1 rounded-xl border border-[#d4def8] py-2 text-xs font-bold text-[#5f6f98]">Cancel</button>
                      <button onClick={handleScore} disabled={actionLoading} className="flex-1 rounded-xl bg-[#17cf73] py-2 text-xs font-bold text-white hover:bg-[#11b865]">
                        {actionLoading ? 'Submitting...' : 'Submit Evaluation'}
                      </button>
                    </div>
                  </div>
                )}

                {/* View Details Modal */}
                {viewDetailsId === ev.evaluation_id && ev.project && (
                  <Modal
                    isOpen={true}
                    onClose={() => setViewDetailsId(null)}
                    title="Project Details"
                    maxWidth="lg"
                  >
                    <div className="space-y-4 text-[#16213f] dark:text-[#d7e3ff]">
                      <div>
                        <p className="text-xs font-semibold text-[#5c73b5]">Title</p>
                        <p className="mt-1 text-sm font-medium">{ev.project.title}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#5c73b5]">Description</p>
                        <p className="mt-1 text-sm leading-relaxed text-[#5f6f98] dark:text-[#93a4d1]">{ev.project.description || 'No description provided.'}</p>
                      </div>
                      <div className="flex gap-4">
                        {ev.project.github_url && (
                          <a href={ev.project.github_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#4f6fbc] hover:underline dark:text-[#8ea1d6]">
                            <Code2 className="h-4 w-4" /> Source Code
                          </a>
                        )}
                        {ev.project.live_url && (
                          <a href={ev.project.live_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#4f6fbc] hover:underline dark:text-[#8ea1d6]">
                            <Lightbulb className="h-4 w-4" /> Live Demo
                          </a>
                        )}
                      </div>
                    </div>
                  </Modal>
                )}

                {/* Profile Modal */}
                {profileId === ev.evaluation_id && ev.student && (
                  <Modal
                    isOpen={true}
                    onClose={() => setProfileId(null)}
                    title="Student Profile"
                    maxWidth="sm"
                  >
                    <div className="flex items-center gap-4 text-[#16213f] dark:text-[#d7e3ff]">
                      {ev.student.profile_picture_url ? (
                        <img src={ev.student.profile_picture_url} alt="avatar" className="h-16 w-16 rounded-full object-cover border-2 border-[#d4def8] dark:border-[#223067]" />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#dde6ff] text-[#4f8cff] dark:bg-[#1a2858]">
                          <User className="h-8 w-8" />
                        </div>
                      )}
                      <div>
                        <p className="text-lg font-bold">{ev.student.name}</p>
                        <p className="text-sm text-[#5f6f98] dark:text-[#93a4d1]">{ev.student.email}</p>
                      </div>
                    </div>
                  </Modal>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
