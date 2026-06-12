'use client'

import { useEffect, useState } from 'react'
import {
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Folder,
  Github,
  Loader2,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  Upload,
  ExternalLink,
  X,
} from 'lucide-react'
import { Modal } from '@/components/ui/modal'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

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

// ── Fallback mock data (shown when backend is offline) ──────────────────────
const MOCK_PROJECTS: Project[] = [
  {
    id: 'mock-1',
    title: 'E-Commerce REST API',
    description: 'A full-featured e-commerce backend with product management, cart, and payment integration.',
    github_url: 'https://github.com/example/ecommerce-api',
    live_url: 'https://ecommerce-api.vercel.app',
    tech_stack: ['Node.js', 'Express', 'PostgreSQL', 'JWT'],
    skill_domain: 'Backend',
    status: 'verified',
    verified_badge: 'Verified Backend Developer ✓',
    created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'mock-2',
    title: 'DES Score Dashboard',
    description: 'A React + D3 dashboard that visualizes student skill scores, viva status and placement readiness.',
    github_url: 'https://github.com/example/des-dashboard',
    live_url: '',
    tech_stack: ['React', 'TypeScript', 'Tailwind', 'D3.js'],
    skill_domain: 'Frontend',
    status: 'viva_scheduled',
    verified_badge: null,
    created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'mock-3',
    title: 'ML Resume Screener',
    description: 'An NLP pipeline that scores resumes using TF-IDF and cosine similarity against job descriptions.',
    github_url: 'https://github.com/example/resume-screener',
    live_url: '',
    tech_stack: ['Python', 'FastAPI', 'scikit-learn', 'spaCy'],
    skill_domain: 'Machine Learning',
    status: 'pending_viva',
    verified_badge: null,
    created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
  },
]

export default function StudentProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [usingMockData, setUsingMockData] = useState(false)
  const [isTechDropdownOpen, setIsTechDropdownOpen] = useState(false)

  const TECH_STACK_OPTIONS = [
    { 
      group: "Languages & Frameworks", 
      items: ["Python", "JavaScript / TypeScript", "Java", "C++", "C# / .NET", "Go", "Rust", "React / Next.js", "Vue / Nuxt", "Angular", "Node.js", "Django / FastAPI", "Spring Boot", "SQL / Databases", "MongoDB / NoSQL", "Docker / Kubernetes", "AWS / Azure / GCP"] 
    }
  ]

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
    setError('')
    try {
      const baseHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || `http://${baseHost}:8000/api/v1`
      const res = await fetch(`${apiUrl}/projects/me`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!res.ok) {
        let msg = 'API error'
        try { const errData = await res.json(); msg = errData.detail || msg } catch(e){}
        throw new Error(msg)
      }
      const data = await res.json()
      setProjects(data)
      setUsingMockData(false)
    } catch (err: any) {
      // Backend offline or error
      console.error("fetchProjects error:", err)
      setError(`Failed to load real data: ${err.message || 'Network Error'}`)
      setProjects(MOCK_PROJECTS)
      setUsingMockData(true)
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
    
    const newProject: Project = {
      id: `mock-${Date.now()}`,
      title: form.title,
      description: form.description,
      github_url: form.github_url,
      live_url: form.live_url,
      tech_stack: form.tech_stack,
      skill_domain: form.skill_domain,
      status: 'pending_viva',
      verified_badge: null,
      created_at: new Date().toISOString(),
    }

    try {
      const baseHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || `http://${baseHost}:8000/api/v1`
      const res = await fetch(`${apiUrl}/projects`, {
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
        })
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail ?? 'Submission failed')
      }
      const saved: Project = await res.json()
      setProjects((prev) => [saved, ...prev])
    } catch {
      // Backend offline — optimistically add to local list
      setProjects((prev) => [newProject, ...prev])
      setUsingMockData(true)
    } finally {
      setShowForm(false)
      setForm({ title: '', description: '', github_url: '', live_url: '', tech_stack: [], skill_domain: '', newTech: '' })
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] rounded-[1.25rem] bg-[#eef3ff] p-4 shadow-sm sm:rounded-[1.5rem] sm:p-5 md:rounded-[2rem] md:p-6 dark:bg-[#101d49]">
      <div className="w-full space-y-6">

        {/* Offline / Mock Data Banner */}
        {usingMockData && (
          <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-700 dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-300">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            Backend offline — showing sample project data. Your new submissions will be saved locally.
          </div>
        )}

        {/* Header */}
        <section className="relative overflow-hidden rounded-[2rem] border border-[#e2e8f0] bg-gradient-to-br from-[#f8faff] to-[#eef3ff] p-8 shadow-sm dark:border-[#223067] dark:from-[#111d49] dark:to-[#0d1636]">
          {/* Abstract wavy lines background */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-10">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <path d="M-100 100 C 100 0, 300 200, 500 100 C 700 0, 900 200, 1100 100" fill="none" stroke="#2563eb" strokeWidth="2" />
              <path d="M-100 150 C 100 50, 300 250, 500 150 C 700 50, 900 250, 1100 150" fill="none" stroke="#2563eb" strokeWidth="2" />
              <path d="M-100 50 C 100 -50, 300 150, 500 50 C 700 -50, 900 150, 1100 50" fill="none" stroke="#2563eb" strokeWidth="2" />
            </svg>
          </div>

          <div className="relative flex flex-col justify-between sm:flex-row">
            {/* Left Content */}
            <div className="z-10 max-w-lg">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e5edff] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#2563eb] dark:bg-[#1a2858] dark:text-[#8ea1d6]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Skill Verification Pipeline
              </span>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-[#0f1b40] sm:text-4xl dark:text-white">
                My Projects
              </h1>
              <p className="mt-4 text-sm font-medium leading-relaxed text-[#5c6d9a] dark:text-[#93a4d1]">
                Submit a project → get a Mentor Viva → earn a{' '}
                <span className="font-bold text-[#17cf73]">Verified ✓</span> badge that boosts your DES score visibility.
              </p>
            </div>

            {/* Right Content */}
            <div className="relative mt-6 flex flex-col items-start sm:mt-0 sm:items-end z-10">
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-[#1d4ed8] transition-colors"
              >
                <PlusCircle className="h-4 w-4" />
                Submit Project
              </button>
              
              <div className="mt-6 sm:mt-8 hidden sm:block relative">
                {/* 3D Illustration floating near the button */}
                <img src="/3d-folder.png" alt="Folder Illustration" className="h-32 w-auto object-contain sm:h-36 drop-shadow-2xl" />
                {/* Sparkles around illustration */}
                <Sparkles className="absolute -left-6 top-0 h-4 w-4 text-[#8ca8ff] opacity-70" />
                <Sparkles className="absolute -right-4 bottom-8 h-3 w-3 text-[#8ca8ff] opacity-70" />
              </div>
            </div>
          </div>
        </section>

        {/* Submit Form Modal */}
        <Modal
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          title="Submit Project"
          maxWidth="xl"
        >
          <div className="mt-2">
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
                  <div className="relative">
                    <div 
                      onClick={() => setIsTechDropdownOpen(!isTechDropdownOpen)}
                      className="flex w-full items-center justify-between rounded-xl border border-[#d4def8] bg-[#f8fbff] px-4 py-2.5 text-sm text-[#16213f] outline-none hover:bg-slate-50 cursor-pointer select-none dark:border-[#223067] dark:bg-[#0e1c45] dark:text-[#8ea1d6] dark:hover:bg-[#152352] transition-colors"
                    >
                      <span>Choose a tech stack...</span>
                      <ChevronDown className={`h-4 w-4 text-[#5c73b5] dark:text-[#8ea1d6] transition-transform duration-200 ${isTechDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>

                    {isTechDropdownOpen && (
                      <div className="absolute left-0 bottom-[calc(100%+8px)] z-50 max-h-[240px] w-full overflow-y-auto rounded-xl border border-[#d4def8] bg-white p-2 shadow-[0_-10px_40px_rgba(37,99,235,0.15)] dark:border-[#223067] dark:bg-[#0e1c45] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700">
                        {TECH_STACK_OPTIONS.map((group, gIdx) => (
                          <div key={group.group} className={`${gIdx > 0 ? 'mt-3 pt-3 border-t border-[#edf3ff] dark:border-[#223067]' : ''}`}>
                            <div className="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#5c73b5] dark:text-[#6a7db1]">
                              {group.group}
                            </div>
                            <div className="flex flex-col">
                              {group.items.map((skill) => {
                                const isSelected = form.tech_stack.includes(skill);
                                
                                return (
                                  <button
                                    key={skill}
                                    type="button"
                                    onClick={() => {
                                      if (!isSelected) {
                                        setForm((f) => ({ ...f, tech_stack: [...f.tech_stack, skill] }));
                                      } else {
                                        setForm((f) => ({ ...f, tech_stack: f.tech_stack.filter((x) => x !== skill) }));
                                      }
                                      setIsTechDropdownOpen(false);
                                    }}
                                    className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm font-medium transition-colors ${
                                      isSelected 
                                        ? 'bg-[#edf3ff] text-[#2563eb] dark:bg-[#1a2858] dark:text-[#8ca8ff]' 
                                        : 'text-[#16213f] hover:bg-[#f8fbff] dark:text-[#c4d3ff] dark:hover:bg-[#152352]'
                                    }`}
                                  >
                                    <span>{skill}</span>
                                    {isSelected && <CheckCircle2 className="h-4 w-4" />}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {form.tech_stack.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {form.tech_stack.map((t) => (
                        <span key={t} className="inline-flex items-center gap-1 rounded-lg bg-[#edf3ff] px-2.5 py-1 text-xs font-bold text-[#4f6fbc] dark:bg-[#1a2858] dark:text-[#9db0df]">
                          {t}
                          <button type="button" onClick={() => setForm((f) => ({ ...f, tech_stack: f.tech_stack.filter((x) => x !== t) }))}>
                            <X className="h-3 w-3 hover:text-red-500 transition-colors" />
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
                    Submit
                  </button>
                </div>
              </form>
          </div>
        </Modal>

        {/* Projects List */}
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#4f8cff]" />
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-[#c6d6f2] bg-[#fbfdff] p-12 text-center shadow-sm dark:border-[#2a3f7a] dark:bg-[#0e1633]">
            <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#eef3ff] dark:bg-[#1a2858]">
              <Folder className="h-9 w-9 text-[#2563eb]" />
              <Sparkles className="absolute -left-2 top-2 h-4 w-4 text-[#8ca8ff]" />
              <Sparkles className="absolute -right-3 bottom-4 h-5 w-5 text-[#8ca8ff]" />
            </div>
            <h3 className="text-xl font-extrabold text-[#0f1b40] dark:text-[#d7e3ff]">No projects submitted yet</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm font-medium text-[#7d8db7] dark:text-[#7f92c6]">
              Submit your first project to get a Mentor Viva and earn a <span className="font-bold text-[#17cf73]">Verified ✓</span> badge.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-[#1d4ed8] hover:shadow-lg"
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
