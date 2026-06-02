'use client'

import { useEffect, useState } from 'react'
import {
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  Github,
  Loader2,
  PlusCircle,
  ShieldCheck,
  Upload,
  X,
} from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL ?? ''

const STATUS_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending_viva: {
    label: 'Pending Viva',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  viva_scheduled: {
    label: 'Viva Scheduled',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    icon: <BookOpen className="h-3.5 w-3.5" />,
  },
  viva_completed: {
    label: 'Viva Completed',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  verified: {
    label: 'Verified ✓',
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    icon: <BadgeCheck className="h-3.5 w-3.5" />,
  },
  failed: {
    label: 'Not Passed',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    icon: <X className="h-3.5 w-3.5" />,
  },
}

const SKILL_DOMAINS = [
  'Frontend', 'Backend', 'Full Stack', 'Data Science', 'Machine Learning',
  'DevOps', 'Mobile', 'UI/UX Design', 'Cybersecurity', 'Cloud', 'Blockchain',
]

interface Project {
  id: string
  title: string
  description: string
  github_url: string
  live_url: string
  tech_stack: string[]
  skill_domain: string
  status: string
  verified_badge: string | null
  created_at: string
}

function getToken() {
  return localStorage.getItem('access_token') ?? ''
}

export default function StudentProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    title: '',
    description: '',
    github_url: '',
    live_url: '',
    tech_stack: [] as string[],
    skill_domain: '',
    newTech: '',
  })

  async function fetchProjects() {
    setLoading(true)
    try {
      const res = await fetch(`${API}/projects/me`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!res.ok) throw new Error('Failed to load projects')
      setProjects(await res.json())
    } catch {
      setError('Could not load projects.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProjects() }, [])

  function addTech() {
    const t = form.newTech.trim()
    if (t && !form.tech_stack.includes(t)) {
      setForm((f) => ({ ...f, tech_stack: [...f.tech_stack, t], newTech: '' }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch(`${API}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          github_url: form.github_url,
          live_url: form.live_url,
          tech_stack: form.tech_stack,
          skill_domain: form.skill_domain,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail ?? 'Submission failed')
      }
      setShowForm(false)
      setForm({ title: '', description: '', github_url: '', live_url: '', tech_stack: [], skill_domain: '', newTech: '' })
      await fetchProjects()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] rounded-[1.25rem] bg-[#eef3ff] p-4 shadow-sm sm:rounded-[1.5rem] sm:p-5 md:rounded-[2rem] md:p-6 dark:bg-[#101d49]">
      <div className="mx-auto max-w-4xl space-y-6">

        {/* Header */}
        <section className="rounded-3xl border border-[#d4def8] bg-white p-5 shadow-[0_10px_28px_rgba(66,98,170,0.12)] sm:p-6 dark:border-[#223067] dark:bg-[#111d49]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#5c73b5] dark:text-[#8ea1d6]">
                <ShieldCheck className="h-4 w-4 text-[#17cf73]" />
                Skill Verification Pipeline
              </p>
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#16213f] sm:text-3xl dark:text-white">
                My Projects
              </h1>
              <p className="mt-1 text-sm text-[#5f6f98] dark:text-[#93a4d1]">
                Submit a project → get a Mentor Viva → earn a Verified ✓ badge that boosts your DES score visibility.
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#4f8cff] px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-[#3a7de0] transition-colors"
            >
              <PlusCircle className="h-4 w-4" />
              Submit Project
            </button>
          </div>
        </section>

        {/* Submit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-xl rounded-3xl border border-[#d4def8] bg-white p-6 shadow-2xl dark:border-[#223067] dark:bg-[#111d49]">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-extrabold text-[#16213f] dark:text-white">Submit Project for Viva</h2>
                <button onClick={() => setShowForm(false)} className="rounded-lg p-1.5 hover:bg-[#f0f4ff] dark:hover:bg-[#1a2858]">
                  <X className="h-5 w-5 text-[#5f6f98]" />
                </button>
              </div>

              {error && (
                <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#5c73b5] dark:text-[#8ea1d6]">
                    Project Title *
                  </label>
                  <input
                    required
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. E-Commerce REST API"
                    className="w-full rounded-xl border border-[#d4def8] bg-[#f8fbff] px-4 py-2.5 text-sm text-[#16213f] outline-none focus:border-[#4f8cff] dark:border-[#223067] dark:bg-[#0e1c45] dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#5c73b5] dark:text-[#8ea1d6]">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="What does this project do?"
                    className="w-full rounded-xl border border-[#d4def8] bg-[#f8fbff] px-4 py-2.5 text-sm text-[#16213f] outline-none focus:border-[#4f8cff] dark:border-[#223067] dark:bg-[#0e1c45] dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#5c73b5] dark:text-[#8ea1d6]">
                      GitHub URL *
                    </label>
                    <input
                      required
                      value={form.github_url}
                      onChange={(e) => setForm((f) => ({ ...f, github_url: e.target.value }))}
                      placeholder="https://github.com/you/repo"
                      className="w-full rounded-xl border border-[#d4def8] bg-[#f8fbff] px-4 py-2.5 text-sm text-[#16213f] outline-none focus:border-[#4f8cff] dark:border-[#223067] dark:bg-[#0e1c45] dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#5c73b5] dark:text-[#8ea1d6]">
                      Live URL (optional)
                    </label>
                    <input
                      value={form.live_url}
                      onChange={(e) => setForm((f) => ({ ...f, live_url: e.target.value }))}
                      placeholder="https://your-app.vercel.app"
                      className="w-full rounded-xl border border-[#d4def8] bg-[#f8fbff] px-4 py-2.5 text-sm text-[#16213f] outline-none focus:border-[#4f8cff] dark:border-[#223067] dark:bg-[#0e1c45] dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#5c73b5] dark:text-[#8ea1d6]">
                    Skill Domain *
                  </label>
                  <select
                    required
                    value={form.skill_domain}
                    onChange={(e) => setForm((f) => ({ ...f, skill_domain: e.target.value }))}
                    className="w-full rounded-xl border border-[#d4def8] bg-[#f8fbff] px-4 py-2.5 text-sm text-[#16213f] outline-none focus:border-[#4f8cff] dark:border-[#223067] dark:bg-[#0e1c45] dark:text-white"
                  >
                    <option value="">Select domain…</option>
                    {SKILL_DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#5c73b5] dark:text-[#8ea1d6]">
                    Tech Stack
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={form.newTech}
                      onChange={(e) => setForm((f) => ({ ...f, newTech: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
                      placeholder="Add technology…"
                      className="flex-1 rounded-xl border border-[#d4def8] bg-[#f8fbff] px-4 py-2.5 text-sm text-[#16213f] outline-none focus:border-[#4f8cff] dark:border-[#223067] dark:bg-[#0e1c45] dark:text-white"
                    />
                    <button type="button" onClick={addTech} className="rounded-xl bg-[#edf3ff] px-3 py-2 text-sm font-bold text-[#4f8cff] hover:bg-[#d8e8ff] dark:bg-[#1a2858] dark:text-[#8aa9ff]">
                      Add
                    </button>
                  </div>
                  {form.tech_stack.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {form.tech_stack.map((t) => (
                        <span key={t} className="inline-flex items-center gap-1 rounded-lg bg-[#edf3ff] px-2.5 py-1 text-xs font-bold text-[#4f6fbc] dark:bg-[#1a2858] dark:text-[#9db0df]">
                          {t}
                          <button type="button" onClick={() => setForm((f) => ({ ...f, tech_stack: f.tech_stack.filter((x) => x !== t) }))}>
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 rounded-xl border border-[#d4def8] py-2.5 text-sm font-bold text-[#5f6f98] hover:bg-[#f0f4ff] dark:border-[#223067] dark:text-[#93a4d1]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#17cf73] py-2.5 text-sm font-bold text-white hover:bg-[#11b865] disabled:opacity-60"
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    Submit for Viva
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Projects List */}
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#4f8cff]" />
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#c5d4f5] bg-white p-10 text-center dark:border-[#2a3f7a] dark:bg-[#111d49]">
            <ShieldCheck className="mx-auto mb-3 h-12 w-12 text-[#b0c4f5] dark:text-[#3a5499]" />
            <p className="font-semibold text-[#22335f] dark:text-[#d7e3ff]">No projects submitted yet</p>
            <p className="mt-1 text-sm text-[#7d8db7] dark:text-[#7f92c6]">
              Submit your first project to get a Mentor Viva and earn a Verified ✓ badge.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#4f8cff] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#3a7de0]"
            >
              <PlusCircle className="h-4 w-4" /> Submit First Project
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => {
              const meta = STATUS_META[project.status] ?? STATUS_META.pending_viva
              return (
                <article
                  key={project.id}
                  className="rounded-3xl border border-[#d4def8] bg-white p-5 shadow-[0_8px_24px_rgba(66,98,170,0.1)] transition-all hover:shadow-[0_12px_32px_rgba(66,98,170,0.16)] dark:border-[#223067] dark:bg-[#111d49]"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-extrabold text-[#16213f] dark:text-white">
                          {project.title}
                        </h3>
                        {project.verified_badge && (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                            <BadgeCheck className="h-3.5 w-3.5" />
                            {project.verified_badge}
                          </span>
                        )}
                      </div>

                      {project.description && (
                        <p className="mt-1 text-sm text-[#5f6f98] dark:text-[#93a4d1]">{project.description}</p>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold ${meta.color}`}>
                          {meta.icon}
                          {meta.label}
                        </span>
                        {project.skill_domain && (
                          <span className="rounded-lg bg-[#edf3ff] px-2.5 py-1 text-xs font-semibold text-[#4f6fbc] dark:bg-[#1a2858] dark:text-[#9db0df]">
                            {project.skill_domain}
                          </span>
                        )}
                        {project.tech_stack.map((t) => (
                          <span key={t} className="rounded-md bg-[#f0f4ff] px-2 py-0.5 text-[11px] font-medium text-[#5c73b5] dark:bg-[#1a2858] dark:text-[#8ea1d6]">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl border border-[#d4def8] px-3 py-2 text-xs font-bold text-[#42548d] hover:bg-[#edf3ff] dark:border-[#223067] dark:text-[#c4d3ff] dark:hover:bg-[#1a2858]"
                        >
                          <Github className="h-3.5 w-3.5" />
                          GitHub
                        </a>
                      )}
                      {project.live_url && (
                        <a
                          href={project.live_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl border border-[#d4def8] px-3 py-2 text-xs font-bold text-[#42548d] hover:bg-[#edf3ff] dark:border-[#223067] dark:text-[#c4d3ff] dark:hover:bg-[#1a2858]"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Live
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
