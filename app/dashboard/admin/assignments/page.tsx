'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, ClipboardList, Loader2, Search, User } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL ?? ''
function getToken() { return localStorage.getItem('access_token') ?? '' }

interface Project {
  id: string
  student_id: string
  title: string
  skill_domain: string
  created_at: string
}

interface Mentor {
  id: string
  name: string
  current_role: string
  expertise_areas: string[]
  average_rating: number
}

export default function AdminAssignmentsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [loading, setLoading] = useState(true)
  const [assigningId, setAssigningId] = useState<string | null>(null)
  const [selectedMentor, setSelectedMentor] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')

  async function load() {
    setLoading(true)
    try {
      const [projRes, mentorRes] = await Promise.all([
        fetch(`${API}/projects/admin/unassigned`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        }),
        fetch(`${API}/admin/users?user_type=mentor&limit=100`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        })
      ])
      
      if (projRes.ok) {
        setProjects(await projRes.json())
      }
      if (mentorRes.ok) {
        const mData = await mentorRes.json()
        setMentors(mData.data || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleAssign(projectId: string) {
    if (!selectedMentor) return alert('Please select a mentor first.')
    setAssigningId(projectId)
    try {
      const res = await fetch(`${API}/projects/${projectId}/assign-mentor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ mentor_id: selectedMentor })
      })
      if (!res.ok) throw new Error('Failed to assign mentor')
      setProjects(projects.filter(p => p.id !== projectId))
      setSelectedMentor('')
    } catch (e) {
      alert('Error assigning mentor')
    } finally {
      setAssigningId(null)
    }
  }

  const filteredMentors = mentors.filter(m => 
    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (m.expertise_areas || []).some(area => area.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="min-h-[calc(100vh-80px)] space-y-6 rounded-[1.25rem] bg-[#eef3ff] p-4 sm:rounded-[1.5rem] sm:p-5 md:rounded-[2rem] md:p-6 dark:bg-[#08122d]">
      
      {/* Header Section */}
      <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl border border-[#dde6ff] bg-white p-6 shadow-sm dark:border-[#21376f] dark:bg-[#0e1c45]">
        <div>
          <h1 className="inline-flex items-center gap-2 text-2xl font-extrabold tracking-tight text-[#16213f] sm:text-3xl dark:text-white">
            <ClipboardList className="h-8 w-8 text-blue-600 dark:text-blue-500" />
            Project Assignments
          </h1>
          <p className="mt-1 text-sm font-medium text-[#5c73b5] dark:text-[#8ea1d6]">
            Manually assign submitted student projects to available mentors for Viva evaluation.
          </p>
        </div>
      </section>

      {/* Main Content */}
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#dde6ff] bg-white p-10 text-center shadow-sm dark:border-[#21376f] dark:bg-[#0e1c45]">
          <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-blue-300 dark:text-blue-600/50" />
          <p className="text-lg font-extrabold text-[#16213f] dark:text-white">All projects are assigned!</p>
          <p className="mt-1 text-sm font-medium text-[#5c73b5] dark:text-[#8ea1d6]">No pending Viva evaluations currently need assignment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* Projects List */}
          <div className="lg:col-span-2 space-y-4">
            {projects.map(proj => (
              <div key={proj.id} className="rounded-2xl border border-[#dde6ff] bg-white p-5 shadow-sm transition-all hover:border-blue-400 dark:border-[#21376f] dark:bg-[#0e1c45] dark:hover:border-blue-500/50">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-extrabold text-[#16213f] dark:text-white truncate">{proj.title}</p>
                    <p className="text-xs font-bold text-[#5c73b5] dark:text-[#8ea1d6] mt-0.5">Student ID: {proj.student_id}</p>
                    {proj.skill_domain && (
                      <span className="mt-3 inline-flex items-center rounded-lg bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                        {proj.skill_domain}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <select 
                      className="rounded-xl border border-[#dde6ff] bg-slate-50 px-3 py-2 text-sm font-bold text-[#16213f] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#21376f] dark:bg-[#08122d] dark:text-white"
                      value={selectedMentor}
                      onChange={(e) => setSelectedMentor(e.target.value)}
                    >
                      <option value="">-- Select Mentor --</option>
                      {filteredMentors.map(m => (
                        <option key={m.id} value={m.id}>{m.name} ({m.current_role || 'Mentor'})</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleAssign(proj.id)}
                      disabled={assigningId === proj.id || !selectedMentor}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed min-w-[90px]"
                    >
                      {assigningId === proj.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Assign'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mentor Sidebar */}
          <div className="rounded-2xl border border-[#dde6ff] bg-white p-5 shadow-sm dark:border-[#21376f] dark:bg-[#0e1c45] self-start sticky top-6">
            <h2 className="mb-4 text-sm font-extrabold uppercase tracking-wider text-[#16213f] dark:text-white">Available Mentors</h2>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Filter by name or skill..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-[#dde6ff] bg-slate-50 py-2.5 pl-9 pr-3 text-sm font-medium text-[#16213f] outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#21376f] dark:bg-[#08122d] dark:text-white"
              />
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredMentors.map(m => (
                <div key={m.id} className="flex items-center gap-3 rounded-xl border border-transparent bg-slate-50 p-3 transition-colors hover:border-[#dde6ff] dark:bg-[#08122d] dark:hover:border-[#21376f]">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-[#16213f] dark:text-white">{m.name}</p>
                    <p className="truncate text-[11px] font-medium text-[#5c73b5] dark:text-[#8ea1d6]">
                      {m.expertise_areas?.slice(0, 2).join(', ')} {m.expertise_areas?.length > 2 && '...'}
                    </p>
                  </div>
                </div>
              ))}
              {filteredMentors.length === 0 && (
                <div className="py-6 text-center">
                  <p className="text-sm font-medium text-slate-400">No mentors found.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
