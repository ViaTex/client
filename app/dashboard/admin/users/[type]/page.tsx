"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import {
    Building,
    GraduationCap,
    User,
    Plus,
    Check,
    X,
} from "lucide-react"
import toast from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import CustomDataTable, { ColumnDef } from "@/components/common/customeDataTable"
import { CustomFormModal } from "@/components/common/custom-form-modal"
import { adminService } from "@/services/admin.service"

type UserType = "corporate" | "college" | "mentor"

type StatusType = "active" | "inactive" | "suspended" | "pending"

interface AdminUserBase {
    id: string
    name: string
    email: string
    phone?: string
    status: StatusType
    email_verified?: boolean
    created_at?: string
}

interface CorporateUser extends AdminUserBase {
    company_name?: string
    contact_person?: string
    contact_designation?: string
    website_url?: string
    industry?: string
    company_size?: string
    founded_year?: number | string
    company_type?: string
    description?: string
    address?: string
}

interface CollegeUser extends AdminUserBase {
    college_name?: string
    contact_person_name?: string
    contact_designation?: string
    website_url?: string
    institute_type?: string
    established_year?: number | string
    address?: string
    courses_offered?: string
    branch?: string
    college_id?: string
}

interface MentorUser extends AdminUserBase {
    current_role?: string
    expertise_areas?: string | string[]
    experience_years?: number | string
    motivation?: string
}

type AdminUser = CorporateUser | CollegeUser | MentorUser

interface StatsResponse {
    total_students: number
    active_students: number
    inactive_students: number
    suspended_students: number
    pending_students: number
    email_verified: number
    email_unverified: number
}

interface FieldConfig {
    key: string
    label: string
    placeholder?: string
    required?: boolean
    type?: "text" | "email" | "number" | "password" | "date"
    colSpan?: 1 | 2
    textarea?: boolean
    options?: { value: string; label: string }[]
}

const STATUS_OPTIONS = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "suspended", label: "Suspended" },
    { value: "pending", label: "Pending" },
]

const USER_CONFIG: Record<UserType, {
    title: string
    subtitle: string
    addLabel: string
    icon: any
    fields: FieldConfig[]
    columns: ColumnDef<AdminUser>[]
}> = {
    corporate: {
        title: "Corporate Management",
        subtitle: "Manage corporate accounts and company details",
        addLabel: "Add Corporate",
        icon: Building,
        fields: [
            { key: "name", label: "Name", placeholder: "Contact name", required: true },
            { key: "email", label: "Email", type: "email", placeholder: "corp@example.com", required: true },
            { key: "password", label: "Password", type: "password", placeholder: "Minimum 8 characters", required: true },
            { key: "phone", label: "Phone", placeholder: "+1234567890" },
            { key: "company_name", label: "Company Name", placeholder: "Company name", required: true, colSpan: 2 },
            { key: "contact_person", label: "Contact Person", placeholder: "Contact person" },
            { key: "contact_designation", label: "Contact Designation", placeholder: "HR Manager" },
            { key: "website_url", label: "Website", placeholder: "https://company.com" },
            { key: "industry", label: "Industry", placeholder: "Software" },
            { key: "company_size", label: "Company Size", placeholder: "51-200" },
            { key: "founded_year", label: "Founded Year", type: "number", placeholder: "2015" },
            { key: "company_type", label: "Company Type", placeholder: "Private" },
            { key: "description", label: "Description", placeholder: "Short description", textarea: true, colSpan: 2 },
            { key: "address", label: "Address", placeholder: "Office address", textarea: true, colSpan: 2 },
            { key: "status", label: "Status", options: STATUS_OPTIONS },
        ],
        columns: [
            {
                accessorKey: "company_name",
                header: "Company",
                enableSorting: true,
                cell: ({ row }) => (
                    <p className="font-semibold text-gray-900 dark:text-white">
                        {(row.original as CorporateUser).company_name || "-"}
                    </p>
                ),
            },
            {
                accessorKey: "email",
                header: "Email",
                enableSorting: true,
                cell: ({ row }) => (
                    <span className="text-gray-600 dark:text-gray-400">{row.original.email}</span>
                ),
            },
            {
                accessorKey: "phone",
                header: "Phone",
                cell: ({ row }) => (
                    <span className="text-gray-600 dark:text-gray-400">{row.original.phone || "-"}</span>
                ),
            },
            {
                accessorKey: "status",
                header: "Status",
                enableSorting: true,
                cell: ({ row }) => (
                    <StatusPill status={row.original.status} />
                ),
            },
            {
                accessorKey: "created_at",
                header: "Created",
                enableSorting: true,
                cell: ({ row }) => (
                    <span className="text-gray-600 dark:text-gray-400">
                        {row.original.created_at ? new Date(row.original.created_at).toLocaleDateString() : "-"}
                    </span>
                ),
            },
        ],
    },
    college: {
        title: "College Management",
        subtitle: "Manage college accounts and campus details",
        addLabel: "Add College",
        icon: GraduationCap,
        fields: [
            { key: "name", label: "Name", placeholder: "Contact name", required: true },
            { key: "email", label: "Email", type: "email", placeholder: "college@example.com", required: true },
            { key: "password", label: "Password", type: "password", placeholder: "Minimum 8 characters", required: true },
            { key: "phone", label: "Phone", placeholder: "+1234567890" },
            { key: "college_name", label: "College Name", placeholder: "College name", required: true, colSpan: 2 },
            { key: "contact_person_name", label: "Contact Person", placeholder: "Contact person" },
            { key: "contact_designation", label: "Contact Designation", placeholder: "Dean" },
            { key: "website_url", label: "Website", placeholder: "https://college.edu" },
            { key: "institute_type", label: "Institute Type", placeholder: "Private" },
            { key: "established_year", label: "Established Year", type: "number", placeholder: "1995" },
            { key: "courses_offered", label: "Courses Offered", placeholder: "B.Tech, MBA" },
            { key: "branch", label: "Branch", placeholder: "Computer Science" },
            { key: "college_id", label: "College ID", placeholder: "COLL-001" },
            { key: "address", label: "Address", placeholder: "Campus address", textarea: true, colSpan: 2 },
            { key: "status", label: "Status", options: STATUS_OPTIONS },
        ],
        columns: [
            {
                accessorKey: "college_name",
                header: "College",
                enableSorting: true,
                cell: ({ row }) => (
                    <p className="font-semibold text-gray-900 dark:text-white">
                        {(row.original as CollegeUser).college_name || "-"}
                    </p>
                ),
            },
            {
                accessorKey: "email",
                header: "Email",
                enableSorting: true,
                cell: ({ row }) => (
                    <span className="text-gray-600 dark:text-gray-400">{row.original.email}</span>
                ),
            },
            {
                accessorKey: "phone",
                header: "Phone",
                cell: ({ row }) => (
                    <span className="text-gray-600 dark:text-gray-400">{row.original.phone || "-"}</span>
                ),
            },
            {
                accessorKey: "status",
                header: "Status",
                enableSorting: true,
                cell: ({ row }) => (
                    <StatusPill status={row.original.status} />
                ),
            },
            {
                accessorKey: "created_at",
                header: "Created",
                enableSorting: true,
                cell: ({ row }) => (
                    <span className="text-gray-600 dark:text-gray-400">
                        {row.original.created_at ? new Date(row.original.created_at).toLocaleDateString() : "-"}
                    </span>
                ),
            },
        ],
    },
    mentor: {
        title: "Mentor Management",
        subtitle: "Manage mentor accounts and expertise",
        addLabel: "Add Mentor",
        icon: User,
        fields: [
            { key: "name", label: "Name", placeholder: "Mentor name", required: true },
            { key: "email", label: "Email", type: "email", placeholder: "mentor@example.com", required: true },
            { key: "password", label: "Password", type: "password", placeholder: "Minimum 8 characters", required: true },
            { key: "phone", label: "Phone", placeholder: "+1234567890" },
            { key: "current_role", label: "Current Role", placeholder: "Senior Engineer" },
            { key: "expertise_areas", label: "Expertise Areas", placeholder: "React, Python" },
            { key: "experience_years", label: "Experience Years", type: "number", placeholder: "5" },
            { key: "motivation", label: "Motivation", placeholder: "Why mentor?", textarea: true, colSpan: 2 },
            { key: "status", label: "Status", options: STATUS_OPTIONS },
        ],
        columns: [
            {
                accessorKey: "name",
                header: "Name",
                enableSorting: true,
                cell: ({ row }) => (
                    <p className="font-semibold text-gray-900 dark:text-white">{row.original.name}</p>
                ),
            },
            {
                accessorKey: "email",
                header: "Email",
                enableSorting: true,
                cell: ({ row }) => (
                    <span className="text-gray-600 dark:text-gray-400">{row.original.email}</span>
                ),
            },
            {
                accessorKey: "phone",
                header: "Phone",
                cell: ({ row }) => (
                    <span className="text-gray-600 dark:text-gray-400">{row.original.phone || "-"}</span>
                ),
            },
            {
                accessorKey: "status",
                header: "Status",
                enableSorting: true,
                cell: ({ row }) => (
                    <StatusPill status={row.original.status} />
                ),
            },
            {
                accessorKey: "created_at",
                header: "Created",
                enableSorting: true,
                cell: ({ row }) => (
                    <span className="text-gray-600 dark:text-gray-400">
                        {row.original.created_at ? new Date(row.original.created_at).toLocaleDateString() : "-"}
                    </span>
                ),
            },
        ],
    },
}

function StatusPill({ status }: { status: StatusType }) {
    const colors = {
        active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
        suspended: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    }
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors[status] || colors.inactive}`}>
            {status}
        </span>
    )
}

function getInitialFormData(type: UserType, user: AdminUser | null) {
    const base = {
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        password: "",
        status: (user?.status || "active") as StatusType,
    }

    if (type === "corporate") {
        const corp = user as CorporateUser | null
        return {
            ...base,
            company_name: corp?.company_name || "",
            contact_person: corp?.contact_person || "",
            contact_designation: corp?.contact_designation || "",
            website_url: corp?.website_url || "",
            industry: corp?.industry || "",
            company_size: corp?.company_size || "",
            founded_year: corp?.founded_year ? String(corp.founded_year) : "",
            company_type: corp?.company_type || "",
            description: corp?.description || "",
            address: corp?.address || "",
        }
    }

    if (type === "college") {
        const college = user as CollegeUser | null
        return {
            ...base,
            college_name: college?.college_name || "",
            contact_person_name: college?.contact_person_name || "",
            contact_designation: college?.contact_designation || "",
            website_url: college?.website_url || "",
            institute_type: college?.institute_type || "",
            established_year: college?.established_year ? String(college.established_year) : "",
            address: college?.address || "",
            courses_offered: college?.courses_offered || "",
            branch: college?.branch || "",
            college_id: college?.college_id || "",
        }
    }

    const mentor = user as MentorUser | null
    return {
        ...base,
        current_role: mentor?.current_role || "",
        expertise_areas: Array.isArray(mentor?.expertise_areas)
            ? mentor?.expertise_areas.join(", ")
            : mentor?.expertise_areas || "",
        experience_years: mentor?.experience_years ? String(mentor.experience_years) : "",
        motivation: mentor?.motivation || "",
    }
}

export default function AdminUserTypePage() {
    const params = useParams<{ type?: string | string[] }>()
    const rawType = Array.isArray(params?.type) ? params?.type[0] : params?.type
    const userType = rawType?.toLowerCase() as UserType
    const config = USER_CONFIG[userType]

    if (!config) {
        return (
            <div className="p-6 text-gray-700 dark:text-gray-300">
                Unsupported user type.
            </div>
        )
    }

    const [users, setUsers] = useState<AdminUser[]>([])
    const [stats, setStats] = useState<StatsResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState<string | null>(null)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
    const [formData, setFormData] = useState<Record<string, string>>(() => getInitialFormData(userType, null))
    const [formLoading, setFormLoading] = useState(false)
    const [formFetching, setFormFetching] = useState(false)
    const [pagination, setPagination] = useState({ skip: 0, limit: 20, total: 0 })

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const params: Record<string, string | number> = {
                skip: pagination.skip,
                limit: pagination.limit,
            }
            if (searchTerm) params.query = searchTerm
            if (statusFilter) params.status_filter = statusFilter

            const data = await adminService.getUsers(userType, params) as any
            setUsers(data.data || [])
            setPagination(prev => ({ ...prev, total: data.total || 0 }))
        } catch (err: any) {
            const message = err?.response?.data?.detail || err.message || "Failed to fetch users"
            setError(message)
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }, [pagination.skip, pagination.limit, searchTerm, statusFilter, userType])

    const fetchStats = useCallback(async () => {
        try {
            const data = await adminService.getUserStats(userType)
            setStats(data as StatsResponse)
        } catch (err) {
            console.error("Failed to fetch statistics", err)
        }
    }, [userType])

    useEffect(() => {
        fetchUsers()
        fetchStats()
    }, [fetchUsers, fetchStats])

    useEffect(() => {
        if (!showCreateModal && !showEditModal) return
        setFormData(getInitialFormData(userType, selectedUser))
    }, [selectedUser, showCreateModal, showEditModal, userType])

    const closeFormModal = () => {
        setShowCreateModal(false)
        setShowEditModal(false)
        setSelectedUser(null)
    }

    const openEditModal = async (user: AdminUser) => {
        setSelectedUser(user)
        setShowEditModal(true)
        setFormFetching(true)
        try {
            const fullUser = await adminService.getUser(user.id) as AdminUser
            setSelectedUser(prev => ({ ...prev, ...fullUser } as AdminUser))
        } catch (err: any) {
            const message = err?.response?.data?.detail || err.message || "Failed to load user details"
            toast.error(message)
        } finally {
            setFormFetching(false)
        }
    }

    const handleDelete = async (userId: string) => {
        if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
            return
        }

        try {
            await adminService.deleteUser(userId)
            setUsers(prev => prev.filter(item => item.id !== userId))
            toast.success("User deleted successfully")
            fetchStats()
        } catch (err: any) {
            const message = err?.response?.data?.detail || err.message || "Failed to delete user"
            toast.error(message)
        }
    }

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormLoading(true)

        try {
            const submitData: Record<string, unknown> = { ...formData }

            if (!selectedUser && !submitData.password) {
                toast.error("Password is required")
                setFormLoading(false)
                return
            }

            if (selectedUser) {
                delete (submitData as any).password
            }

            if (submitData.status === "") {
                delete submitData.status
            }

            if (submitData.experience_years === "") {
                delete submitData.experience_years
            }
            if (submitData.founded_year === "") {
                delete submitData.founded_year
            }
            if (submitData.established_year === "") {
                delete submitData.established_year
            }

            if (selectedUser) {
                await adminService.updateUser(selectedUser.id, submitData)
                toast.success("User updated successfully")
            } else {
                await adminService.createUser(userType, submitData)
                toast.success("User created successfully")
            }
            closeFormModal()
            fetchUsers()
            fetchStats()
        } catch (err: any) {
            const message = err?.response?.data?.detail || err.message || "Failed to save user"
            toast.error(message)
        } finally {
            setFormLoading(false)
        }
    }

    const handleExportCSV = () => {
        try {
            const headers = config.columns.map((col) =>
                typeof col.header === "string" ? col.header : String(col.accessorKey)
            )
            const rows = users.map((user) =>
                config.columns.map((col) => {
                    const key = col.accessorKey as keyof AdminUser
                    const value = key ? (user[key] as any) : ""
                    return value ?? ""
                })
            )

            const csvContent = [
                headers.join(","),
                ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
            ].join("\n")

            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
            const link = document.createElement("a")
            const url = URL.createObjectURL(blob)

            link.setAttribute("href", url)
            link.setAttribute("download", `${userType}_users_${new Date().toISOString().split("T")[0]}.csv`)
            link.style.visibility = "hidden"

            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            toast.success("Export completed")
        } catch (err) {
            toast.error("Failed to export")
        }
    }

    const columns = useMemo(() => config.columns, [config.columns])
    const Icon = config.icon

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700"
            >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Icon className="w-8 h-8 text-blue-600" />
                            {config.title}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 mt-2">
                            {config.subtitle}
                        </p>
                    </div>
                    <Button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        {config.addLabel}
                    </Button>
                </div>
            </motion.div>

            {stats && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
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

            <CustomDataTable
                columns={columns}
                data={users}
                loading={loading}
                error={error}
                totalCount={pagination.total}
                pageSize={pagination.limit}
                pageIndex={Math.floor(pagination.skip / pagination.limit)}
                onPaginationChange={(pageIdx, size) => {
                    setPagination({
                        skip: pageIdx * size,
                        limit: size,
                        total: pagination.total,
                    })
                }}
                searchTerm={searchTerm}
                onSearchChange={(term) => {
                    setSearchTerm(term)
                    setPagination((prev) => ({ ...prev, skip: 0 }))
                }}
                searchPlaceholder="Search by name, email, or phone..."
                showExport={true}
                onExport={handleExportCSV}
                onAdd={() => {
                    setSelectedUser(null)
                    setShowCreateModal(true)
                }}
                enableRowActions={true}
                onEditRow={(user) => {
                    openEditModal(user as AdminUser)
                }}
                onDeleteRow={(user) => {
                    handleDelete((user as AdminUser).id)
                }}
                customHeaderActions={
                    <Select
                        value={statusFilter || ""}
                        onChange={(e) => {
                            const value = (e.target as HTMLSelectElement).value
                            setStatusFilter(value || null)
                            setPagination((prev) => ({ ...prev, skip: 0 }))
                        }}
                        placeholder="Filter by status"
                        options={[{ value: "", label: "All Statuses" }, ...STATUS_OPTIONS]}
                        className="w-full lg:w-48"
                    />
                }
            />

            <CustomFormModal
                isOpen={showCreateModal || showEditModal}
                title={selectedUser ? `Edit ${config.addLabel.replace("Add ", "")}` : config.addLabel}
                onClose={closeFormModal}
                onSubmit={handleFormSubmit}
                submitLabel={selectedUser ? "Update" : "Create"}
                isSubmitting={formLoading}
                submitDisabled={formFetching}
                className="bg-white dark:bg-[#10162e]"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {config.fields.map((field) => {
                        const value = formData[field.key] ?? ""
                        const colSpan = field.colSpan === 2 ? "md:col-span-2" : ""

                        if (field.options) {
                            return (
                                <div key={field.key} className={colSpan}>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        {field.label}{field.required && <span className="text-red-500"> *</span>}
                                    </label>
                                    <Select
                                        value={value}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                [field.key]: (e.target as HTMLSelectElement).value,
                                            }))
                                        }
                                        placeholder={field.placeholder || "Select"}
                                        options={field.options}
                                    />
                                </div>
                            )
                        }

                        if (field.textarea) {
                            return (
                                <div key={field.key} className={colSpan}>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        {field.label}{field.required && <span className="text-red-500"> *</span>}
                                    </label>
                                    <textarea
                                        value={value}
                                        onChange={(e) =>
                                            setFormData((prev) => ({ ...prev, [field.key]: e.target.value }))
                                        }
                                        placeholder={field.placeholder}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                                        rows={3}
                                    />
                                </div>
                            )
                        }

                        return (
                            <div key={field.key} className={colSpan}>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {field.label}{field.required && <span className="text-red-500"> *</span>}
                                </label>
                                <Input
                                    type={field.type || "text"}
                                    required={field.required && (field.key !== "password" || !selectedUser)}
                                    value={value}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, [field.key]: e.target.value }))
                                    }
                                    placeholder={field.placeholder}
                                    disabled={field.key === "email" && !!selectedUser}
                                />
                            </div>
                        )
                    })}
                </div>
            </CustomFormModal>
        </div>
    )
}
