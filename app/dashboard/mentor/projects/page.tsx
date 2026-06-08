"use client"

import React, { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { mentorService } from "@/services/mentor.service"
import type { SkillEvaluationItem } from "@/lib/types"
import {
  Folder,
  CheckCircle,
  Clock,
  Code,
  Search,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  MoreVertical,
  Check,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
} from "lucide-react"

// Types
type ScoreMetric = {
  label: string
  score: number
  max: number
  weight: string
}

type Project = {
  id: string
  name: string
  author: string
  status: "Verified" | "Pending Review"
  tags: string[]
  score: string
  submittedOn: string
  verifiedOn?: string
  description: string
  projectType: string
  githubRepo: string
  liveUrl: string
  scoreBreakdown: ScoreMetric[]
  strengths: string[]
  improvements: string[]
  mockupBg: string
}

export default function ProjectsPage() {
  const [evaluations, setEvaluations] = useState<SkillEvaluationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"All" | "Verified" | "Pending">("All")
  
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

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

  const projects: Project[] = useMemo(() => {
    return evaluations.map((ev, i) => {
      const bgColors = ["from-purple-900 to-indigo-950", "from-amber-900 to-yellow-950", "from-blue-900 to-sky-950", "from-rose-900 to-pink-950", "from-emerald-900 to-teal-950"]
      
      const techScore = ev.score_technical || 0
      const pracScore = ev.score_practical || 0
      const commScore = ev.score_communication || 0
      const origScore = ev.score_originality || 0

      return {
        id: ev.evaluation_id,
        name: ev.project?.title || "Untitled Project",
        author: ev.student?.name || `Student-${ev.student_id.slice(0, 4)}`,
        status: ev.status === "evaluated" ? "Verified" : "Pending Review",
        tags: ev.project?.skill_domain ? ev.project.skill_domain.split(",").map(t => t.trim()) : [],
        score: ev.status === "evaluated" ? `${ev.total_score || 0}/100` : "--",
        submittedOn: new Date(ev.created_at).toLocaleDateString(),
        verifiedOn: ev.updated_at ? new Date(ev.updated_at).toLocaleDateString() : undefined,
        description: ev.project?.description || "No description provided.",
        projectType: "Full Stack Application",
        githubRepo: ev.project?.github_url || "#",
        liveUrl: ev.project?.live_url || "#",
        scoreBreakdown: [
          { label: "Technical", score: techScore, max: 40, weight: "40%" },
          { label: "Practical", score: pracScore, max: 30, weight: "30%" },
          { label: "Communication", score: commScore, max: 20, weight: "20%" },
          { label: "Originality", score: origScore, max: 10, weight: "10%" },
        ],
        strengths: ev.feedback_strengths ? ev.feedback_strengths.split("\n").filter(Boolean) : ["None specified"],
        improvements: ev.feedback_improvements ? ev.feedback_improvements.split("\n").filter(Boolean) : ["None specified"],
        mockupBg: bgColors[i % bgColors.length],
      }
    })
  }, [evaluations])

  useEffect(() => {
    if (projects.length > 0 && (!activeId || !projects.find(p => p.id === activeId))) {
      setActiveId(projects[0].id)
    }
  }, [projects, activeId])

  // Active project calculation
  const activeProject = useMemo(() => {
    return projects.find((p) => p.id === activeId) || projects[0]
  }, [projects, activeId])

  // Filter list of projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.author.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "All" ||
                            (statusFilter === "Verified" && p.status === "Verified") ||
                            (statusFilter === "Pending" && p.status === "Pending Review")
      return matchesSearch && matchesStatus
    })
  }, [projects, searchQuery, statusFilter])

  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage
    return filteredProjects.slice(start, start + rowsPerPage)
  }, [filteredProjects, currentPage, rowsPerPage])

  return (
    <div className="space-y-6 pb-8 text-slate-800 dark:text-white/90 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      
      {/* Header Card */}
      <div className="rounded-3xl border border-blue-100 bg-blue-50/50 dark:bg-[#0f1428] dark:border-white/5 p-6 mb-2">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          Student Projects 📂
        </h1>
        <p className="text-sm font-medium text-slate-600 dark:text-white/60 mt-1 flex items-center gap-1.5">
          Browse and review verified student projects and codebases ✨
        </p>
        
        <div className="flex flex-wrap items-center gap-3 mt-5">
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-100/80 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 text-xs font-bold shadow-sm">
            🎯 Project Queue
          </div>
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-bold shadow-sm">
            💻 Code Reviews
          </div>
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-100/80 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 text-xs font-bold shadow-sm">
            🚀 Innovation
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Projects"
          value={projects.length.toString()}
          percentage="100%"
          trend="neutral"
          note="total in queue"
          icon={Folder}
          iconBg="bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400"
        />
        <MetricCard
          title="Verified Projects"
          value={projects.filter(p => p.status === "Verified").length.toString()}
          percentage=""
          trend="up"
          note=""
          icon={ShieldCheck}
          iconBg="bg-[#ea7033]/10 text-[#ea7033] dark:bg-[#ea7033]/20 dark:text-[#f3834b]"
        />
        <MetricCard
          title="Pending Verification"
          value={projects.filter(p => p.status === "Pending Review").length.toString()}
          percentage="Needs your review"
          trend="neutral"
          note=""
          icon={Clock}
          iconBg="bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400"
        />
        <MetricCard
          title="Technologies Used"
          value={new Set(projects.flatMap(p => p.tags)).size.toString()}
          percentage="Across all projects"
          trend="neutral"
          note=""
          icon={Code}
          iconBg="bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
        />
      </div>

      {/* Main split grid */}
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.9fr]">
        
        {/* Left Column: All Projects browser */}
        <div className="rounded-[24px] border border-slate-200 dark:border-transparent bg-white dark:bg-[#0f1428] p-5 shadow-[0_12px_35px_rgba(46,60,120,0.05)] flex flex-col">
          
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-sm font-bold text-slate-800 dark:text-white">All Projects</h2>
            
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e: any) => setStatusFilter(e.target.value)}
                className="appearance-none bg-slate-50 dark:bg-[#13141F] border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] font-bold shadow-sm focus:outline-none cursor-pointer text-slate-500 dark:text-white/60"
              >
                <option value="All">All Status</option>
                <option value="Verified">Verified</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#13141F] border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Project List */}
          <div className="space-y-3.5">
            {paginatedProjects.length === 0 ? (
              <div className="text-center text-xs text-slate-400 dark:text-white/35 py-12">
                No projects found.
              </div>
            ) : (
              paginatedProjects.map((proj) => {
                const isActive = proj.id === activeId
                return (
                  <button
                    key={proj.id}
                    onClick={() => setActiveId(proj.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 group relative
                      ${isActive
                        ? "bg-purple-500/5 border-purple-600 dark:bg-purple-500/10 dark:border-purple-500 shadow-sm"
                        : "bg-[#ffffff] border-transparent hover:bg-slate-50/50 dark:bg-white/5 dark:hover:bg-white/[0.08]"
                      }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Left thumbnail preview mockup */}
                      <div className={`h-11 w-16 shrink-0 rounded-lg bg-gradient-to-br ${proj.mockupBg} overflow-hidden shadow-inner border border-white/10 flex items-center justify-center p-1`}>
                        <div className="w-full h-full rounded bg-black/40 backdrop-blur-sm border border-white/5 flex flex-col p-0.5 justify-between">
                          <span className="text-[4px] font-black text-white/50 truncate uppercase leading-none block">{proj.name}</span>
                          <div className="flex gap-0.5 mt-0.5">
                            <span className="w-1.5 h-0.5 rounded-full bg-emerald-500" />
                            <span className="w-1 h-0.5 rounded bg-white/20" />
                            <span className="w-2 h-0.5 rounded bg-white/20" />
                          </div>
                        </div>
                      </div>

                      {/* Info Details */}
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-[#c8ee44] transition-all">
                            {proj.name}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0
                            ${proj.status === "Verified"
                              ? "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400"
                              : "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
                            }`}
                          >
                            {proj.status === "Verified" ? "Verified" : "Pending Review"}
                          </span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-white/40 leading-none">
                          {proj.author}
                        </p>
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {proj.tags.slice(0, 3).map((t) => (
                            <span key={t} className="text-[9px] font-bold text-slate-500 dark:text-white/40 bg-slate-50 dark:bg-white/5 px-1.5 py-0.5 rounded">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right side Score / Arrow */}
                    <div className="flex items-center gap-3 shrink-0 text-right">
                      <div className="hidden sm:block">
                        <span className="text-[9px] font-bold text-slate-400 dark:text-white/35 uppercase tracking-wider block">Score</span>
                        <span className={`text-xs font-black leading-none block mt-1
                          ${proj.score === "--"
                            ? "text-slate-400 dark:text-white/30"
                            : "text-emerald-500"
                          }`}
                        >
                          {proj.score}
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-350 dark:text-white/20 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                )
              })
            )}
          </div>

          {/* Pagination */}
          <div className="flex flex-col gap-3 border-t border-slate-100 dark:border-white/5 pt-4 mt-2 shrink-0">
            <div className="flex items-center justify-between text-xs">
              <p className="text-slate-500 dark:text-white/40 font-semibold">
                Showing {filteredProjects.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} to {Math.min(currentPage * rowsPerPage, filteredProjects.length)} of {filteredProjects.length}
              </p>
              <div className="flex items-center gap-2 text-slate-500 dark:text-white/40">
                <span className="font-semibold">Rows:</span>
                <select 
                  value={rowsPerPage} 
                  onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  className="cursor-pointer rounded border border-slate-200 bg-slate-50 text-slate-700 dark:border-white/10 dark:bg-[#13141F] pl-2 pr-6 py-1 text-xs dark:text-white focus:outline-none font-semibold"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-7 px-3 rounded-lg border border-slate-200 dark:border-white/10 text-[10px] font-bold text-slate-500 dark:text-white/55 hover:bg-slate-50 dark:hover:bg-white/5 transition-all disabled:opacity-50"
              >
                &lt; Prev
              </button>
              <div className="flex items-center gap-1.5">
                <button className="h-7 w-7 rounded-lg bg-purple-600 text-white dark:bg-[#c8ee44] dark:text-[#13141F] text-[11px] font-black">{currentPage}</button>
                {currentPage < Math.ceil(filteredProjects.length / rowsPerPage) && (
                  <button 
                    onClick={() => setCurrentPage(p => Math.ceil(filteredProjects.length / rowsPerPage))}
                    className="h-7 w-7 rounded-lg border border-slate-200 dark:border-white/10 text-[11px] font-bold text-slate-500 dark:text-white/55 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                  >
                    ...
                  </button>
                )}
              </div>
              <button 
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredProjects.length / rowsPerPage), p + 1))}
                disabled={currentPage >= Math.ceil(filteredProjects.length / rowsPerPage)}
                className="h-7 px-3 rounded-lg border border-slate-200 dark:border-white/10 text-[10px] font-bold text-slate-500 dark:text-white/55 hover:bg-slate-50 dark:hover:bg-white/5 transition-all disabled:opacity-50"
              >
                Next &gt;
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Project details / Feedbacks */}
        <div className="space-y-6">
          
          {loading ? (
             <div className="rounded-[24px] border border-slate-200 dark:border-transparent bg-white dark:bg-[#0f1428] p-6 text-center text-slate-500 h-full">Loading project details...</div>
          ) : !activeProject ? (
             <div className="rounded-[24px] border border-slate-200 dark:border-transparent bg-white dark:bg-[#0f1428] p-6 text-center text-slate-500 h-full">No project selected.</div>
          ) : (
            <div className="rounded-[24px] border border-slate-200 dark:border-transparent bg-white dark:bg-[#0f1428] p-6 shadow-[0_12px_35px_rgba(46,60,120,0.05)] space-y-6">
              
              {/* Top row: Preview & Text details */}
              <div className="flex flex-col md:flex-row gap-6">
                
                {/* Mock Banner Mockup */}
                <div className={`h-[150px] w-full md:w-[220px] shrink-0 rounded-2xl bg-gradient-to-br ${activeProject.mockupBg} overflow-hidden relative shadow-md flex items-center justify-center p-3 border border-white/10`}>
                  {/* Visual interface elements */}
                  <div className="w-full h-full rounded-lg bg-[#0e0c1e] border border-white/10 flex flex-col p-2.5 justify-between relative">
                    <div className="flex justify-between items-center">
                      <span className="text-[7px] font-black text-white/70 uppercase tracking-widest truncate">{activeProject.name}</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                    </div>
                    <div className="space-y-1">
                      <div className="h-1 w-12 rounded bg-white/20" />
                      <div className="h-1 w-20 rounded bg-white/20" />
                      <div className="h-1 w-16 rounded bg-white/20" />
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="h-2 w-6 rounded bg-[#c8ee44] shrink-0" />
                      <div className="h-2.5 w-2.5 rounded bg-white/10 shrink-0" />
                    </div>
                  </div>
                </div>

                {/* Main summary details */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight truncate">
                          {activeProject.name}
                        </h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold shrink-0
                          ${activeProject.status === "Verified"
                            ? "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400"
                            : "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
                          }`}
                        >
                          {activeProject.status}
                        </span>
                      </div>
                      
                      <button className="h-8 w-8 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 flex items-center justify-center shrink-0 text-slate-500 dark:text-white/60">
                        <MoreVertical className="h-4.5 w-4.5" />
                      </button>
                    </div>

                    <p className="text-[10px] font-bold text-slate-450 dark:text-white/45 truncate">
                      By {activeProject.author} • Submitted on {activeProject.submittedOn}
                    </p>
                    
                    <p className="text-xs text-slate-500 dark:text-white/60 mt-3 leading-relaxed line-clamp-3">
                      {activeProject.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap sm:flex-nowrap sm:items-center justify-between gap-4 mt-4 border-t border-slate-100 dark:border-white/5 pt-4">
                    <div className="flex gap-4 text-xs font-bold text-purple-600 dark:text-[#c8ee44]">
                      <a href={activeProject.liveUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:underline cursor-pointer">
                        Live Demo <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      <a href={activeProject.githubRepo} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:underline cursor-pointer">
                        GitHub Repository <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>

                    {activeProject.score !== "--" && (
                      <div className="flex items-center gap-3 bg-emerald-500/5 dark:bg-[#c8ee44]/5 border border-emerald-500/10 dark:border-[#c8ee44]/15 px-3 py-1.5 rounded-xl shrink-0">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-white/40 uppercase tracking-wider">Score</span>
                        <span className="text-sm font-black text-emerald-500 dark:text-[#c8ee44]">{activeProject.score}</span>
                      </div>
                    )}
                  </div>

                </div>

              </div>

              {/* Project details & breakdown grid */}
              <div className="grid gap-6 md:grid-cols-2">
                
                {/* Card 1: Project Details */}
                <div className="rounded-[20px] border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] p-5 space-y-4">
                  <h4 className="text-[11px] font-bold text-slate-400 dark:text-white/45 uppercase tracking-wider">Project Details</h4>
                  
                  <div className="space-y-3 font-semibold text-xs text-slate-800 dark:text-white/80">
                    <div className="flex justify-between items-start gap-4">
                      <span className="text-slate-450 dark:text-white/45">Technology Stack</span>
                      <div className="flex flex-wrap gap-1 justify-end max-w-[65%]">
                        {activeProject.tags.length > 0 ? activeProject.tags.map((t) => (
                          <span key={t} className="text-[9px] font-bold bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded text-slate-600 dark:text-white/60">
                            {t}
                          </span>
                        )) : <span className="text-slate-400">None</span>}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-slate-450 dark:text-white/45">Project Type</span>
                      <span>{activeProject.projectType}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-slate-450 dark:text-white/45">GitHub Repository</span>
                      <a href={activeProject.githubRepo} target="_blank" rel="noreferrer" className="text-purple-600 dark:text-[#c8ee44] hover:underline truncate max-w-[60%] flex items-center gap-1 justify-end">
                        {activeProject.githubRepo !== "#" ? activeProject.githubRepo.replace("https://", "") : "Not provided"} <ExternalLink className="h-3 w-3 inline" />
                      </a>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-450 dark:text-white/45">Live URL</span>
                      <a href={activeProject.liveUrl} target="_blank" rel="noreferrer" className="text-purple-600 dark:text-[#c8ee44] hover:underline truncate max-w-[60%] flex items-center gap-1 justify-end">
                        {activeProject.liveUrl !== "#" ? activeProject.liveUrl.replace("https://", "") : "Not provided"} <ExternalLink className="h-3 w-3 inline" />
                      </a>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-450 dark:text-white/45">Submitted On</span>
                      <span>{activeProject.submittedOn}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-450 dark:text-white/45">Status</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold
                        ${activeProject.status === "Verified"
                          ? "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400"
                          : "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
                        }`}
                      >
                        {activeProject.status}
                      </span>
                    </div>

                    {activeProject.verifiedOn && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-450 dark:text-white/45">Verified On</span>
                        <span>{activeProject.verifiedOn}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card 2: Score Breakdown */}
                <div className="rounded-[20px] border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] p-5 flex flex-col justify-between">
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-400 dark:text-white/45 uppercase tracking-wider mb-4.5">Score Breakdown</h4>
                    
                    <div className="space-y-3.5">
                      {activeProject.scoreBreakdown.map((item) => {
                        const percentVal = item.max > 0 ? (item.score / item.max) * 100 : 0
                        return (
                          <div key={item.label} className="space-y-1 text-[11px] font-semibold">
                            <div className="flex justify-between">
                              <span className="text-slate-500 dark:text-white/55">
                                {item.label} ({item.weight})
                              </span>
                              <span className="text-slate-900 dark:text-white font-bold">
                                {activeProject.score === "--" ? "--" : `${item.score}/${item.max}`}
                              </span>
                            </div>
                            
                            <div className="h-1.5 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-purple-600 dark:bg-[#7a61ff] rounded-full transition-all"
                                style={{ width: activeProject.score === "--" ? "0%" : `${percentVal}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-100 dark:border-white/5 pt-3.5 mt-4 text-xs font-bold">
                    <span className="text-slate-450 dark:text-white/40">Total Score</span>
                    <span className={`text-sm font-black
                      ${activeProject.score === "--"
                        ? "text-slate-400 dark:text-white/30"
                        : "text-emerald-500 dark:text-[#c8ee44]"
                      }`}
                    >
                      {activeProject.score}
                    </span>
                  </div>
                </div>

              </div>

              {/* Card 3: Mentor Feedback */}
              <div className="border-t border-slate-100 dark:border-white/5 pt-5 space-y-4">
                <h4 className="text-[11px] font-bold text-slate-400 dark:text-white/45 uppercase tracking-wider">Mentor Feedback</h4>
                
                <div className="grid gap-6 md:grid-cols-2 text-xs font-semibold">
                  {/* Strengths */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-white/40 uppercase tracking-wider block">Strengths</span>
                    
                    {activeProject.strengths.map((str, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-slate-700 dark:text-white/80">{str}</span>
                      </div>
                    ))}
                  </div>

                  {/* Improvements */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-white/40 uppercase tracking-wider block">Improvements</span>
                    
                    {activeProject.improvements.map((imp, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                        <span className="text-slate-700 dark:text-white/80">{imp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  )
}

// Sub components
function MetricCard({
  title,
  value,
  percentage,
  trend,
  note,
  icon: Icon,
  iconBg,
}: {
  title: string
  value: string
  percentage: string
  trend: "up" | "down" | "neutral"
  note: string
  icon: any
  iconBg: string
}) {
  return (
    <div className="rounded-[22px] border border-slate-100 dark:border-transparent bg-white dark:bg-[#0f1428] p-6 shadow-[0_12px_35px_rgba(46,60,120,0.05)] flex items-start justify-between gap-3">
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold text-slate-450 dark:text-white/45 uppercase tracking-wider block">
          {title}
        </span>
        <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white block leading-none">
          {value}
        </span>
        <div className="flex items-center gap-1.5 text-[10px] font-bold pt-1.5">
          {trend === "up" && <TrendingUp className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
          <span className={`
            ${trend === "up" ? "text-emerald-500" : "text-slate-400 dark:text-white/35 font-semibold"}
          `}>
            {percentage}
          </span>
          {note && (
            <span className="text-slate-400 dark:text-white/35 font-semibold">
              {note}
            </span>
          )}
        </div>
      </div>
      <div className={`h-11 w-11 shrink-0 rounded-xl flex items-center justify-center ${iconBg}`}>
        <Icon className="h-5.5 w-5.5" />
      </div>
    </div>
  )
}
