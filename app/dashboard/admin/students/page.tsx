"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
    Plus,
    Users,
    Check,
    X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import toast from 'react-hot-toast'
import { adminService } from '@/services/admin.service'
import CustomDataTable, { ColumnDef } from '@/components/common/customeDataTable'
import { CustomFormModal } from '@/components/common/custom-form-modal'

interface Student {
    id: string
    name: string
    email: string
    phone?: string
    status: 'active' | 'inactive' | 'suspended' | 'pending'
    email_verified: boolean
    created_at: string
    country?: string
    state?: string
    city?: string
    gender?: string
    bio?: string
    dob?: string
    technical_skills?: string
    soft_skills?: string
    certifications?: string
    preferred_industry?: string
    job_roles_of_interest?: string
    location_preferences?: string
    language_proficiency?: string
    extracurricular_activities?: string
    linkedin_profile?: string
    github_profile?: string
    personal_website?: string
    resume_url?: string
    profile_picture_url?: string
    current_des_score?: number | string
    badge?: string
}

interface StudentStats {
    total_students: number
    active_students: number
    inactive_students: number
    suspended_students: number
    pending_students: number
    email_verified: number
    email_unverified: number
}

interface StudentFormData {
    name: string
    email: string
    phone: string
    password: string
    status: 'active' | 'inactive' | 'suspended' | 'pending'
    bio: string
    dob: string
    country: string
    state: string
    city: string
    gender: string
    technical_skills: string
    soft_skills: string
    certifications: string
    preferred_industry: string
    job_roles_of_interest: string
    location_preferences: string
    language_proficiency: string
    extracurricular_activities: string
    linkedin_profile: string
    github_profile: string
    personal_website: string
    resume_url: string
    profile_picture_url: string
    current_des_score: string
    badge: string
}

const getInitialFormData = (student: Student | null): StudentFormData => ({
    name: student?.name || '',
    email: student?.email || '',
    phone: student?.phone || '',
    password: '',
    status: student?.status || 'active',
    bio: student?.bio || '',
    dob: student?.dob || '',
    country: student?.country || '',
    state: student?.state || '',
    city: student?.city || '',
    gender: student?.gender || '',
    technical_skills: student?.technical_skills || '',
    soft_skills: student?.soft_skills || '',
    certifications: student?.certifications || '',
    preferred_industry: student?.preferred_industry || '',
    job_roles_of_interest: student?.job_roles_of_interest || '',
    location_preferences: student?.location_preferences || '',
    language_proficiency: student?.language_proficiency || '',
    extracurricular_activities: student?.extracurricular_activities || '',
    linkedin_profile: student?.linkedin_profile || '',
    github_profile: student?.github_profile || '',
    personal_website: student?.personal_website || '',
    resume_url: student?.resume_url || '',
    profile_picture_url: student?.profile_picture_url || '',
    current_des_score: student?.current_des_score ? String(student.current_des_score) : '',
    badge: student?.badge || ''
})

export default function AdminStudentsPage() {
    const [students, setStudents] = useState<Student[]>([])
    const [stats, setStats] = useState<StudentStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string | null>(null)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
    const [formData, setFormData] = useState<StudentFormData>(() => getInitialFormData(null))
    const [formLoading, setFormLoading] = useState(false)
    const [formFetching, setFormFetching] = useState(false)
    const [pagination, setPagination] = useState({ skip: 0, limit: 20, total: 0 })

    // Fetch students
    const fetchStudents = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            
            const params: Record<string, string | number> = {
                skip: pagination.skip,
                limit: pagination.limit
            }
            if (searchTerm) params.query = searchTerm
            if (statusFilter) params.status_filter = statusFilter

            const data = await adminService.getStudents(params) as any
            
            setStudents(data.data || [])
            setPagination(prev => ({ ...prev, total: data.total || 0 }))
        } catch (err: any) {
            const message = err?.response?.data?.detail || err.message || 'Failed to fetch students'
            setError(message)
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }, [pagination.skip, pagination.limit, searchTerm, statusFilter])

    // Fetch statistics
    const fetchStats = useCallback(async () => {
        try {
            const data = await adminService.getStudentStats()
            setStats(data as StudentStats)
        } catch (err) {
            console.error('Failed to fetch statistics', err)
        }
    }, [])

    useEffect(() => {
        fetchStudents()
        fetchStats()
    }, [fetchStudents, fetchStats])

    useEffect(() => {
        if (!showCreateModal && !showEditModal) return
        setFormData(getInitialFormData(selectedStudent))
    }, [selectedStudent, showCreateModal, showEditModal])

    const handleDelete = async (studentId: string) => {
        if (!confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
            return
        }

        try {
            await adminService.deleteStudent(studentId)
            setStudents(students.filter(s => s.id !== studentId))
            toast.success('Student deleted successfully')
            fetchStats()
        } catch (err: any) {
            const message = err?.response?.data?.detail || err.message || 'Failed to delete student'
            toast.error(message)
        }
    }

    const handleExportCSV = () => {
        try {
            const headers = ['ID', 'Name', 'Email', 'Phone', 'Status', 'Country', 'State', 'City', 'Created At']
            const rows = students.map(s => [
                s.id,
                s.name,
                s.email,
                s.phone || '',
                s.status,
                s.country || '',
                s.state || '',
                s.city || '',
                new Date(s.created_at).toLocaleDateString()
            ])

            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            ].join('\n')

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const link = document.createElement('a')
            const url = URL.createObjectURL(blob)

            link.setAttribute('href', url)
            link.setAttribute('download', `students_${new Date().toISOString().split('T')[0]}.csv`)
            link.style.visibility = 'hidden'

            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            toast.success('Students exported successfully')
        } catch (err) {
            toast.error('Failed to export students')
        }
    }

    const closeFormModal = () => {
        setShowCreateModal(false)
        setShowEditModal(false)
        setSelectedStudent(null)
    }

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormLoading(true)

        try {
            const submitData: Record<string, unknown> = {
                ...formData,
                dob: formData.dob || null,
                badge: formData.badge || null,
            }
            if (formData.current_des_score !== '') {
                submitData.current_des_score = Number(formData.current_des_score)
            } else {
                delete submitData.current_des_score
            }
            if (!selectedStudent && !submitData.password) {
                toast.error('Password is required for new students')
                setFormLoading(false)
                return
            }
            if (selectedStudent) {
                delete (submitData as any).password
            }

            if (selectedStudent) {
                await adminService.updateStudent(selectedStudent.id, submitData)
                toast.success('Student updated successfully')
            } else {
                await adminService.createStudent(submitData)
                toast.success('Student created successfully')
            }
            closeFormModal()
            fetchStudents()
            fetchStats()
        } catch (err: any) {
            const message = err?.response?.data?.detail || err.message || 'Failed to save student'
            toast.error(message)
        } finally {
            setFormLoading(false)
        }
    }

    const openEditModal = async (student: Student) => {
        setSelectedStudent(student)
        setShowEditModal(true)
        setFormFetching(true)
        try {
            const fullStudent = await adminService.getStudent(student.id) as Student
            setSelectedStudent(prev => ({ ...prev, ...fullStudent } as Student))
        } catch (err: any) {
            const message = err?.response?.data?.detail || err.message || 'Failed to load student details'
            toast.error(message)
        } finally {
            setFormFetching(false)
        }
    }

    const getStatusColor = (status: string) => {
        const colors = {
            active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
            suspended: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
        }
        return colors[status as keyof typeof colors] || colors.inactive
    }

    const columns = useMemo<ColumnDef<Student>[]>(() => [
        {
            accessorKey: 'name',
            header: 'Name',
            enableSorting: true,
            cell: ({ row }) => (
                <p className="font-semibold text-gray-900 dark:text-white">{row.original.name}</p>
            )
        },
        {
            accessorKey: 'email',
            header: 'Email',
            enableSorting: true,
            cell: ({ row }) => (
                <span className="text-gray-600 dark:text-gray-400">{row.original.email}</span>
            )
        },
        {
            accessorKey: 'phone',
            header: 'Phone',
            cell: ({ row }) => (
                <span className="text-gray-600 dark:text-gray-400">{row.original.phone || '-'}</span>
            )
        },
        {
            accessorKey: 'status',
            header: 'Status',
            enableSorting: true,
            cell: ({ row }) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(row.original.status)}`}>
                    {row.original.status}
                </span>
            )
        },
        {
            accessorKey: 'email_verified',
            header: 'Verified',
            cell: ({ row }) => (
                row.original.email_verified ? (
                    <Check className="w-5 h-5 text-green-600" />
                ) : (
                    <X className="w-5 h-5 text-red-600" />
                )
            )
        },
        {
            accessorKey: 'created_at',
            header: 'Created',
            enableSorting: true,
            cell: ({ row }) => (
                <span className="text-gray-600 dark:text-gray-400">
                    {new Date(row.original.created_at).toLocaleDateString()}
                </span>
            )
        }
    ], [])

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700"
            >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Users className="w-8 h-8 text-blue-600" />
                            Student Management
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 mt-2">
                            Manage all student accounts and perform CRUD operations
                        </p>
                    </div>
                    <Button 
                        onClick={() => setShowCreateModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Student
                    </Button>
                </div>
            </motion.div>

            {/* Statistics */}
            {stats && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stats.total_students}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">{stats.active_students}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Suspended</p>
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">{stats.suspended_students}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Email Verified</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">{stats.email_verified}</p>
                    </div>
                </motion.div>
            )}

            {/* Custom Data Table */}
            <CustomDataTable
                columns={columns}
                data={students}
                loading={loading}
                error={error}
                totalCount={pagination.total}
                pageSize={pagination.limit}
                pageIndex={Math.floor(pagination.skip / pagination.limit)}
                onPaginationChange={(pageIdx, size) => {
                    setPagination({
                        skip: pageIdx * size,
                        limit: size,
                        total: pagination.total
                    })
                }}
                searchTerm={searchTerm}
                onSearchChange={(term) => {
                    setSearchTerm(term)
                    setPagination(prev => ({ ...prev, skip: 0 }))
                }}
                searchPlaceholder="Search by name, email, or phone..."
                showExport={true}
                onExport={handleExportCSV}
                onAdd={() => {
                    setSelectedStudent(null)
                    setShowCreateModal(true)
                }}
                enableRowActions={true}
                onEditRow={(student) => {
                    openEditModal(student)
                }}
                onDeleteRow={(student) => {
                    handleDelete(student.id)
                }}
                customHeaderActions={
                    <Select 
                        value={statusFilter || ''} 
                        onChange={(e) => {
                            const value = (e.target as HTMLSelectElement).value
                            setStatusFilter(value || null)
                            setPagination(prev => ({ ...prev, skip: 0 }))
                        }}
                        placeholder="Filter by status"
                        options={[
                            { value: '', label: 'All Statuses' },
                            { value: 'active', label: 'Active' },
                            { value: 'inactive', label: 'Inactive' },
                            { value: 'suspended', label: 'Suspended' },
                            { value: 'pending', label: 'Pending' }
                        ]}
                        className="w-full lg:w-48"
                    />
                }
            />

            {/* Create/Edit Modal */}
            <CustomFormModal
                isOpen={showCreateModal || showEditModal}
                title={selectedStudent ? 'Edit Student' : 'Add New Student'}
                onClose={closeFormModal}
                onSubmit={handleFormSubmit}
                submitLabel={selectedStudent ? 'Update Student' : 'Create Student'}
                isSubmitting={formLoading}
                submitDisabled={formFetching}
                className="bg-white dark:bg-[#10162e]"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                            required
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Student name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <Input
                            required
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="student@example.com"
                            disabled={!!selectedStudent}
                        />
                    </div>
                    {!selectedStudent && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <Input
                                required
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                placeholder="Minimum 8 characters"
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Phone
                        </label>
                        <Input
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="+1234567890"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Date of Birth
                        </label>
                        <Input
                            type="date"
                            value={formData.dob}
                            onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Status
                        </label>
                        <Select
                            value={formData.status}
                            onChange={(e) =>
                                setFormData(prev => ({
                                    ...prev,
                                    status: (e.target as HTMLSelectElement).value as any
                                }))
                            }
                            placeholder="Select status"
                            options={[
                                { value: 'active', label: 'Active' },
                                { value: 'inactive', label: 'Inactive' },
                                { value: 'suspended', label: 'Suspended' },
                                { value: 'pending', label: 'Pending' }
                            ]}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Bio
                        </label>
                        <textarea
                            value={formData.bio}
                            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                            placeholder="Brief bio"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                            rows={3}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Gender
                        </label>
                        <Select
                            value={formData.gender}
                            onChange={(e) =>
                                setFormData(prev => ({
                                    ...prev,
                                    gender: (e.target as HTMLSelectElement).value
                                }))
                            }
                            placeholder="Select gender"
                            options={[
                                { value: 'male', label: 'Male' },
                                { value: 'female', label: 'Female' },
                                { value: 'other', label: 'Other' }
                            ]}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Country
                        </label>
                        <Input
                            value={formData.country}
                            onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                            placeholder="India"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            State
                        </label>
                        <Input
                            value={formData.state}
                            onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                            placeholder="Karnataka"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            City
                        </label>
                        <Input
                            value={formData.city}
                            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                            placeholder="Bangalore"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Technical Skills
                        </label>
                        <Input
                            value={formData.technical_skills}
                            onChange={(e) => setFormData(prev => ({ ...prev, technical_skills: e.target.value }))}
                            placeholder="React, TypeScript, Node.js"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Soft Skills
                        </label>
                        <Input
                            value={formData.soft_skills}
                            onChange={(e) => setFormData(prev => ({ ...prev, soft_skills: e.target.value }))}
                            placeholder="Communication, Leadership"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Certifications
                        </label>
                        <Input
                            value={formData.certifications}
                            onChange={(e) => setFormData(prev => ({ ...prev, certifications: e.target.value }))}
                            placeholder="AWS, Google Cloud"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Preferred Industry
                        </label>
                        <Input
                            value={formData.preferred_industry}
                            onChange={(e) => setFormData(prev => ({ ...prev, preferred_industry: e.target.value }))}
                            placeholder="Software Development"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Job Roles of Interest
                        </label>
                        <Input
                            value={formData.job_roles_of_interest}
                            onChange={(e) => setFormData(prev => ({ ...prev, job_roles_of_interest: e.target.value }))}
                            placeholder="Frontend Developer, Data Analyst"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Location Preferences
                        </label>
                        <Input
                            value={formData.location_preferences}
                            onChange={(e) => setFormData(prev => ({ ...prev, location_preferences: e.target.value }))}
                            placeholder="Bangalore, Remote"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Language Proficiency
                        </label>
                        <Input
                            value={formData.language_proficiency}
                            onChange={(e) => setFormData(prev => ({ ...prev, language_proficiency: e.target.value }))}
                            placeholder="English, Hindi"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Extracurricular Activities
                        </label>
                        <textarea
                            value={formData.extracurricular_activities}
                            onChange={(e) => setFormData(prev => ({ ...prev, extracurricular_activities: e.target.value }))}
                            placeholder="Sports, Volunteering"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                            rows={2}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            LinkedIn Profile
                        </label>
                        <Input
                            value={formData.linkedin_profile}
                            onChange={(e) => setFormData(prev => ({ ...prev, linkedin_profile: e.target.value }))}
                            placeholder="https://linkedin.com/in/username"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            GitHub Profile
                        </label>
                        <Input
                            value={formData.github_profile}
                            onChange={(e) => setFormData(prev => ({ ...prev, github_profile: e.target.value }))}
                            placeholder="https://github.com/username"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Personal Website
                        </label>
                        <Input
                            value={formData.personal_website}
                            onChange={(e) => setFormData(prev => ({ ...prev, personal_website: e.target.value }))}
                            placeholder="https://portfolio.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Resume URL
                        </label>
                        <Input
                            value={formData.resume_url}
                            onChange={(e) => setFormData(prev => ({ ...prev, resume_url: e.target.value }))}
                            placeholder="https://.../resume.pdf"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Profile Picture URL
                        </label>
                        <Input
                            value={formData.profile_picture_url}
                            onChange={(e) => setFormData(prev => ({ ...prev, profile_picture_url: e.target.value }))}
                            placeholder="https://.../avatar.png"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Current DES Score
                        </label>
                        <Input
                            type="number"
                            step="0.01"
                            value={formData.current_des_score}
                            onChange={(e) => setFormData(prev => ({ ...prev, current_des_score: e.target.value }))}
                            placeholder="0.0"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Badge
                        </label>
                        <Input
                            value={formData.badge}
                            onChange={(e) => setFormData(prev => ({ ...prev, badge: e.target.value }))}
                            placeholder="bronze"
                        />
                    </div>
                </div>
            </CustomFormModal>
        </div>
    )
}
