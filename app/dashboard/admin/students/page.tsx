"use client"

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Users,
    AlertCircle,
    Check,
    X,
    MoreVertical,
    Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import toast from 'react-hot-toast'
import { adminService } from '@/services/admin.service'

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
    const [pagination, setPagination] = useState({ skip: 0, limit: 20, total: 0 })
    const [dropdownOpen, setDropdownOpen] = useState<string | null>(null)

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

    const getStatusColor = (status: string) => {
        const colors = {
            active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
            suspended: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
        }
        return colors[status as keyof typeof colors] || colors.inactive
    }

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

            {/* Filters and Search */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 space-y-4"
            >
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Search by name, email, or phone..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value)
                                setPagination(prev => ({ ...prev, skip: 0 }))
                            }}
                            className="w-full"
                        />
                    </div>
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
                    <Button 
                        onClick={handleExportCSV}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </Button>
                </div>
            </motion.div>

            {/* Students Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
                {/* Loading State */}
                {loading && (
                    <div className="p-8 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="p-6 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-700">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                            <p className="text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && students.length === 0 && (
                    <div className="p-12 text-center">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400 text-lg">No students found</p>
                        <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">Try adjusting your search or filters</p>
                    </div>
                )}

                {/* Students List */}
                {!loading && students.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Name</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Email</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Phone</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Verified</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Created</th>
                                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {students.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900 dark:text-white">{student.name}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{student.email}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{student.phone || '-'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                                                {student.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {student.email_verified ? (
                                                <Check className="w-5 h-5 text-green-600" />
                                            ) : (
                                                <X className="w-5 h-5 text-red-600" />
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {new Date(student.created_at).toLocaleDateString()}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="relative">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setDropdownOpen(dropdownOpen === student.id ? null : student.id)}
                                                    className="relative"
                                                >
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                                {dropdownOpen === student.id && (
                                                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                                                        <button
                                                            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                                                            onClick={() => {
                                                                setSelectedStudent(student)
                                                                setShowEditModal(true)
                                                                setDropdownOpen(null)
                                                            }}
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 text-red-600 dark:text-red-400"
                                                            onClick={() => {
                                                                handleDelete(student.id)
                                                                setDropdownOpen(null)
                                                            }}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {!loading && students.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Showing {pagination.skip + 1} to {Math.min(pagination.skip + pagination.limit, pagination.total)} of {pagination.total}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={pagination.skip === 0}
                                onClick={() => setPagination(prev => ({ ...prev, skip: Math.max(0, prev.skip - prev.limit) }))}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={pagination.skip + pagination.limit >= pagination.total}
                                onClick={() => setPagination(prev => ({ ...prev, skip: prev.skip + prev.limit }))}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {(showCreateModal || showEditModal) && (
                    <StudentFormModal
                        student={selectedStudent}
                        onClose={() => {
                            setShowCreateModal(false)
                            setShowEditModal(false)
                            setSelectedStudent(null)
                        }}
                        onSuccess={() => {
                            setShowCreateModal(false)
                            setShowEditModal(false)
                            setSelectedStudent(null)
                            fetchStudents()
                            fetchStats()
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}

function StudentFormModal({
    student,
    onClose,
    onSuccess
}: {
    student: Student | null
    onClose: () => void
    onSuccess: () => void
}) {
    const [formData, setFormData] = useState({
        name: student?.name || '',
        email: student?.email || '',
        phone: student?.phone || '',
        password: '',
        status: student?.status || 'active',
        bio: '',
        country: student?.country || '',
        state: student?.state || '',
        city: student?.city || '',
        gender: student?.gender || '',
        technical_skills: '',
        preferred_industry: ''
    })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Only include password if it's provided and we're creating a new student
            const submitData = { ...formData }
            if (!student && !submitData.password) {
                toast.error('Password is required for new students')
                setLoading(false)
                return
            }
            if (student) {
                delete (submitData as any).password
            }

            if (student) {
                await adminService.updateStudent(student.id, submitData)
                toast.success('Student updated successfully')
            } else {
                await adminService.createStudent(submitData)
                toast.success('Student created successfully')
            }
            onSuccess()
        } catch (err: any) {
            const message = err?.response?.data?.detail || err.message || 'Failed to save student'
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4">
            <div className="flex min-h-screen items-center justify-center pt-20">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                >
                    <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between z-10">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {student ? 'Edit Student' : 'Add New Student'}
                        </h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                                    disabled={!!student}
                                />
                            </div>
                            {!student && (
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
                                    Status
                                </label>
                                <Select 
                                    value={formData.status} 
                                    onChange={(e) => 
                                        setFormData(prev => ({ ...prev, status: (e.target as HTMLSelectElement).value as any }))
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Gender
                                </label>
                                <Select 
                                    value={formData.gender} 
                                    onChange={(e) => 
                                        setFormData(prev => ({ ...prev, gender: (e.target as HTMLSelectElement).value }))
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
                        </div>

                        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                            <Button variant="outline" onClick={onClose} type="button">
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {loading ? 'Saving...' : (student ? 'Update Student' : 'Create Student')}
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    )
}