"use client"

import { ChangeEvent, FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react"
import { apiClient } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    BadgeCheck,
    BriefcaseBusiness,
    Building2,
    CalendarDays,
    ChevronRight,
    ClipboardList,
    ImageIcon,
    Mail,
    Phone,
    Sparkles,
    UploadCloud,
} from "lucide-react"

const industryOptions = [
    "Technology",
    "Finance",
    "Healthcare",
    "Education",
    "Manufacturing",
    "Retail",
    "Consulting",
    "E-commerce",
    "Other",
]

const companySizeOptions = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"]
const companyTypeOptions = ["Startup", "MNC", "SME", "Enterprise", "Government", "NGO", "Other"]

function OverviewChip({
    label,
    tone,
    icon,
}: {
    label: string
    tone: string
    icon: ReactNode
}) {
    return (
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[0.82rem] font-medium ${tone}`}>
            <span aria-hidden="true">{icon}</span>
            {label}
        </span>
    )
}

function SummaryTile({
    label,
    value,
    tone,
    icon,
}: {
    label: string
    value: string
    tone: string
    icon: ReactNode
}) {
    return (
        <div className={`self-start rounded-[14px] border p-3 ${tone}`}>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[0.82rem] font-medium text-[#4d5c79] dark:text-[#d7dfff]">{label}</p>
                    <p className="mt-1.5 break-words text-[0.92rem] font-semibold leading-5 text-[#16213f] dark:text-[#ffffff]">{value}</p>
                </div>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/80 text-[#f2b300] shadow-sm dark:border dark:border-black/5 dark:bg-white/20 dark:text-[#ffc83d]">
                    {icon}
                </div>
            </div>
        </div>
    )
}

function ProfileField({
    label,
    value,
}: {
    label: string
    value: string
}) {
    return (
        <div className="rounded-[16px] border border-[#e5ebf8] bg-[#fbfcff] px-5 py-3.5 dark:border-[#223067] dark:bg-[#111a3a]">
            <p className="text-[0.92rem] font-semibold text-[#0f214f] dark:text-white">{label}</p>
            <p className="mt-2.5 text-[0.9rem] leading-6 text-[#56698f] dark:text-[#c7d2f4]">{value}</p>
        </div>
    )
}

function EditableCard({
    label,
    children,
}: {
    label: string
    children: ReactNode
}) {
    return (
        <div className="rounded-[16px] border border-[#e2e8f7] bg-[#fbfcff] p-3.5 dark:border-[#223067] dark:bg-[#111a3a]">
            <p className="mb-2.5 text-[0.92rem] font-semibold text-[#16213f] dark:text-white">{label}</p>
            {children}
        </div>
    )
}

export default function CorporateProfilePage() {
    const logoInputRef = useRef<HTMLInputElement | null>(null)
    const [activeTab, setActiveTab] = useState<"basic" | "company">("basic")
    const [editing, setEditing] = useState<"basic" | "company" | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState("")
    const [error, setError] = useState("")
    const [logoFileName, setLogoFileName] = useState("")
    const [logoPreviewUrl, setLogoPreviewUrl] = useState("")
    const currentBannerDate = useMemo(
        () =>
            new Intl.DateTimeFormat("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
            }).format(new Date()),
        []
    )

    const [form, setForm] = useState({
        email: "",
        name: "",
        bio: "",
        company_name: "",
        phone: "",
        contact_person: "",
        contact_designation: "",
        website_url: "",
        industry: "",
        company_size: "",
        founded_year: "",
        company_type: "",
        description: "",
        address: "",
    })

    useEffect(() => {
        const loadProfile = async () => {
            setLoading(true)
            setError("")
            try {
                const data = await apiClient.getCorporateProfile()
                setForm({
                    email: data.email || "",
                    name: data.name || "",
                    bio: data.bio || "",
                    company_name: data.company_name || "",
                    phone: data.phone || "",
                    contact_person: data.contact_person || "",
                    contact_designation: data.contact_designation || "",
                    website_url: data.website_url || "",
                    industry: data.industry || "",
                    company_size: data.company_size || "",
                    founded_year: data.founded_year ? String(data.founded_year) : "",
                    company_type: data.company_type || "",
                    description: data.description || "",
                    address: data.address || "",
                })
            } catch (e: any) {
                const detail = e?.response?.data?.detail
                setError(typeof detail === "string" ? detail : "Failed to load profile")
            } finally {
                setLoading(false)
            }
        }

        loadProfile()
    }, [])

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault()
        setSaving(true)
        setMessage("")
        setError("")
        try {
            await apiClient.updateCorporateProfile({
                name: form.name || undefined,
                bio: form.bio || undefined,
                company_name: form.company_name || undefined,
                phone: form.phone || undefined,
                contact_person: form.contact_person || undefined,
                contact_designation: form.contact_designation || undefined,
                website_url: form.website_url || undefined,
                industry: form.industry || undefined,
                company_size: form.company_size || undefined,
                founded_year: form.founded_year ? Number(form.founded_year) : undefined,
                company_type: form.company_type || undefined,
                description: form.description || undefined,
                address: form.address || undefined,
            })
            setEditing(null)
            setMessage("Company profile updated successfully")
        } catch (e: any) {
            const detail = e?.response?.data?.detail
            setError(typeof detail === "string" ? detail : "Failed to update profile")
        } finally {
            setSaving(false)
        }
    }

    useEffect(() => {
        return () => {
            if (logoPreviewUrl) {
                URL.revokeObjectURL(logoPreviewUrl)
            }
        }
    }, [logoPreviewUrl])

    const handleLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        if (logoPreviewUrl) {
            URL.revokeObjectURL(logoPreviewUrl)
        }

        setLogoFileName(file.name)
        setLogoPreviewUrl(URL.createObjectURL(file))
    }

    if (loading) {
        return (
            <div className="rounded-3xl border border-[#d4def8] bg-white p-6 dark:border-[#223067] dark:bg-[#111d49]">
                <div className="text-sm text-[#5f6f98] dark:text-[#93a4d1]">Loading company profile...</div>
            </div>
        )
    }

    const inputClass =
        "h-11 rounded-lg border-[#d4def8] bg-white text-[#16213f] placeholder:text-[14px] placeholder:text-[#91a1c7] dark:border-[#223067] dark:bg-[#0f183f] dark:text-white dark:placeholder:text-[#6f84bb]"
    const textareaClass =
        "min-h-28 w-full rounded-lg border border-[#d4def8] bg-white px-3 py-2 text-sm text-[#16213f] placeholder:text-[#91a1c7] dark:border-[#223067] dark:bg-[#0f183f] dark:text-white dark:placeholder:text-[#6f84bb]"
    const selectClass =
        "h-11 w-full rounded-lg border border-[#d4def8] bg-white px-3 py-2 text-sm text-[#16213f] dark:border-[#223067] dark:bg-[#0f183f] dark:text-white"

    return (
        <div className="space-y-6">
            <input ref={logoInputRef} type="file" accept=".png,.jpg,.jpeg" className="hidden" onChange={handleLogoChange} />

            <div className="rounded-[24px] border border-[#8fbfff] bg-[#edf3ff] px-5 py-5 shadow-[0_18px_34px_rgba(92,134,198,0.18)] dark:border-[#35518a] dark:bg-[#131d3f] dark:shadow-[0_20px_34px_rgba(3,8,26,0.4)]">
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-[1.6rem] font-bold tracking-tight text-[#111827] dark:text-white">Company Profile</h1>
                        <span className="text-[1.9rem]" aria-hidden="true">🏢</span>
                    </div>
                    <p className="max-w-3xl text-[0.98rem] text-[#29476f] dark:text-[#c8d7ff]">
                        Manage your company information and business details
                        <span className="ml-2 inline-flex align-middle" aria-hidden="true">
                            <Sparkles className="h-4.5 w-4.5 text-[#f59e0b]" />
                        </span>
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <OverviewChip label={currentBannerDate} icon={<CalendarDays className="h-4 w-4" />} tone="bg-[#8fc0f7]/70 text-[#123d72] dark:bg-[#20376a] dark:text-[#d9e5ff]" />
                        <OverviewChip label="Business Growth" icon={<Sparkles className="h-4 w-4" />} tone="bg-[#d8f3d9] text-[#166534] dark:bg-[#183925] dark:text-[#b7efc5]" />
                        <OverviewChip label="Talent Acquisition" icon={<BriefcaseBusiness className="h-4 w-4" />} tone="bg-[#dfe8ff] text-[#2348b8] dark:bg-[#243567] dark:text-[#bfd0ff]" />
                    </div>
                </div>
            </div>

            <div className="rounded-[22px] border border-[#e2e8f7] bg-white p-4 shadow-[0_10px_30px_rgba(66,98,170,0.08)] dark:border-[#223a7a] dark:bg-[#121b46] dark:shadow-[0_8px_32px_rgba(3,8,26,0.35)]">
                <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[220px_1fr]">
                    <div className="flex items-center gap-4">
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-[linear-gradient(180deg,_#4a77ff_0%,_#3652d9_100%)] shadow-[0_12px_22px_rgba(59,104,255,0.28)]">
                            {logoPreviewUrl ? (
                                // Local preview until backend supports persistent logo storage.
                                <img
                                    src={logoPreviewUrl}
                                    alt="Company logo preview"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-center text-[0.88rem] font-bold uppercase tracking-wide text-[#ff8a1f]">
                                    {form.company_name ? form.company_name.slice(0, 4) : "COMP"}
                                </div>
                            )}
                            <button
                                type="button"
                                className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full border border-[#dbe4ff] bg-white text-[#3b82f6] shadow-sm dark:border-[#2e4478] dark:bg-[#111d49] dark:text-[#9bb6ff]"
                                onClick={() => logoInputRef.current?.click()}
                                aria-label="Upload company logo"
                            >
                                <ImageIcon className="h-3.5 w-3.5" />
                            </button>
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-[1rem] font-bold leading-6 text-[#1a243b] dark:text-white">{form.company_name || form.name || "Company Name"}</h2>
                            <p className="mt-1 text-[0.92rem] text-[#5f6f98] dark:text-[#a8b5de]">{form.company_type || "Company"}</p>
                            <p className="text-[0.98rem] text-[#5f6f98] dark:text-[#a8b5de]">{form.industry || "•"}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 items-start gap-3 md:grid-cols-2 xl:grid-cols-4">
                        <SummaryTile label="Email" value={form.email || "Not provided"} icon={<Mail className="h-4 w-4" />} tone="border-[#d3f0de] bg-[linear-gradient(90deg,_#effcf4_0%,_#f7fffb_100%)] dark:border-[#2f8f5a] dark:bg-[linear-gradient(180deg,_#142d22_0%,_#193628_100%)]" />
                        <SummaryTile label="Phone" value={form.phone || "Not provided"} icon={<Phone className="h-4 w-4" />} tone="border-[#cfdbff] bg-[linear-gradient(90deg,_#eef4ff_0%,_#f7faff_100%)] dark:border-[#3f67c9] dark:bg-[linear-gradient(180deg,_#162544_0%,_#1b2f57_100%)]" />
                        <SummaryTile label="Logo" value={logoFileName || "Not uploaded"} icon={<BadgeCheck className="h-4 w-4 text-[#22c55e] dark:text-[#4ade80]" />} tone="border-[#e4d8ff] bg-[linear-gradient(90deg,_#f7f1ff_0%,_#fcfaff_100%)] dark:border-[#8b5cf6] dark:bg-[linear-gradient(180deg,_#241739_0%,_#2d1d47_100%)]" />
                        <SummaryTile label="Verified" value="Pending" icon={<BriefcaseBusiness className="h-4 w-4" />} tone="border-[#f7dfa6] bg-[linear-gradient(90deg,_#fff9ec_0%,_#fffdf7_100%)] dark:border-[#c9872f] dark:bg-[linear-gradient(180deg,_#33230f_0%,_#402c13_100%)]" />
                    </div>
                </div>
            </div>

            <div className="border-b border-[#d4def8] dark:border-[#223067]">
                <nav className="flex flex-wrap gap-6">
                    <button
                        type="button"
                        onClick={() => setActiveTab("basic")}
                        className={`inline-flex items-center gap-2 border-b-2 py-2.5 text-[0.98rem] font-semibold transition-colors ${
                            activeTab === "basic"
                                ? "border-[#2f65cb] text-[#2f65cb]"
                                : "border-transparent text-[#5f6f98] hover:text-[#16213f] dark:text-[#93a4d1] dark:hover:text-white"
                        }`}
                    >
                        <ClipboardList className="h-4 w-4" />
                        Basic Info
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("company")}
                        className={`inline-flex items-center gap-2 border-b-2 py-2.5 text-[0.98rem] font-semibold transition-colors ${
                            activeTab === "company"
                                ? "border-[#2f65cb] text-[#2f65cb]"
                                : "border-transparent text-[#5f6f98] hover:text-[#16213f] dark:text-[#93a4d1] dark:hover:text-white"
                        }`}
                    >
                        <Building2 className="h-4 w-4" />
                        Company
                    </button>
                </nav>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
                {activeTab === "basic" ? (
                    <div className="rounded-[20px] border border-[#d9e3f8] bg-white p-3.5 shadow-[0_14px_30px_rgba(66,98,170,0.08)] dark:border-[#223067] dark:bg-[#10193a]">
                        <div className="mb-4 flex flex-col gap-3 border-b border-[#e8eefb] pb-3.5 sm:flex-row sm:items-center sm:justify-between dark:border-[#1d294d]">
                            <div className="flex items-center gap-3">
                                <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[14px] bg-[#3b82f6] text-white shadow-[0_12px_22px_rgba(59,130,246,0.22)]">
                                    <ClipboardList className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-[0.95rem] font-semibold text-[#16213f] dark:text-white">Basic Information</h3>
                                    <p className="text-[0.85rem] text-[#5f6f98] dark:text-[#93a4d1]">Company details and contact information</p>
                                </div>
                            </div>
                            <Button type="button" variant="ghost" size="sm" className="self-start px-1 text-[#2f65cb] hover:text-[#1f54ba] dark:text-[#8fb5ff] dark:hover:text-white sm:self-auto" onClick={() => setEditing("basic")}>
                                <ChevronRight className="mr-1 h-4 w-4" />
                                Edit
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-3.5">
                            {editing === "basic" ? (
                                <>
                                    <EditableCard label="Company Name">
                                        <Input className={inputClass} placeholder="Company name" value={form.company_name} onChange={(e) => setForm((p) => ({ ...p, company_name: e.target.value }))} />
                                    </EditableCard>
                                    <EditableCard label="Company Logo">
                                        <button
                                            type="button"
                                            onClick={() => logoInputRef.current?.click()}
                                            className="flex min-h-[180px] w-full flex-col items-center justify-center rounded-[16px] border border-dashed border-[#b9caf2] bg-white px-6 py-8 text-center transition hover:border-[#7ca7ff] hover:bg-[#f7faff] dark:border-[#314176] dark:bg-[#0f183f] dark:hover:border-[#5e86ea] dark:hover:bg-[#132152]"
                                        >
                                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#edf3ff] text-[#3b82f6] dark:bg-[#17285a] dark:text-[#9bb6ff]">
                                                <UploadCloud className="h-7 w-7" />
                                            </div>
                                            <p className="mt-4 text-[1rem] font-medium text-[#1d2755] dark:text-white">Click to upload a new file or drag and drop</p>
                                            <p className="mt-2 text-sm text-[#6b7a9c] dark:text-[#9eb0df]">PNG, JPG, JPEG up to 5MB</p>
                                            {logoFileName ? <p className="mt-3 text-sm font-medium text-[#2f65cb] dark:text-[#9bb6ff]">Selected file: {logoFileName}</p> : null}
                                        </button>
                                    </EditableCard>
                                    <EditableCard label="Contact Information">
                                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                            <Input className={`${inputClass} bg-[#f4f7ff] dark:bg-[#19234e]`} placeholder="Email" value={form.email} disabled />
                                            <Input className={inputClass} placeholder="Phone (10 digits)" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value.replace(/[^0-9]/g, "").slice(0, 10) }))} />
                                        </div>
                                    </EditableCard>
                                    <EditableCard label="Contact Person">
                                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                            <Input className={inputClass} placeholder="Contact Person Name" value={form.contact_person} onChange={(e) => setForm((p) => ({ ...p, contact_person: e.target.value.replace(/[^a-zA-Z\s.-]/g, "") }))} />
                                            <Input className={inputClass} placeholder="Contact Person Designation" value={form.contact_designation} onChange={(e) => setForm((p) => ({ ...p, contact_designation: e.target.value.replace(/[^a-zA-Z\s.-]/g, "") }))} />
                                        </div>
                                    </EditableCard>
                                    <EditableCard label="Bio">
                                        <textarea className={textareaClass} placeholder="Enter your bio" value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} />
                                    </EditableCard>
                                </>
                            ) : (
                                <>
                                    <ProfileField label="Company Name" value={form.company_name || "Not provided"} />
                                    <ProfileField label="Company Logo" value={logoFileName || "Not uploaded"} />
                                    <ProfileField label="Contact Information" value={`${form.email || "Not provided"}${form.phone ? ` • ${form.phone}` : ""}`} />
                                    <ProfileField label="Contact Person" value={`${form.contact_person || "Not provided"}${form.contact_designation ? ` • ${form.contact_designation}` : ""}`} />
                                    <ProfileField label="Bio" value={form.bio || "Not provided"} />
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="rounded-[20px] border border-[#d9e3f8] bg-white p-3.5 shadow-[0_14px_30px_rgba(66,98,170,0.08)] dark:border-[#223067] dark:bg-[#10193a]">
                        <div className="mb-4 flex flex-col gap-3 border-b border-[#e8eefb] pb-3.5 sm:flex-row sm:items-center sm:justify-between dark:border-[#1d294d]">
                            <div className="flex items-center gap-3">
                                <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[14px] bg-[#3b82f6] text-white shadow-[0_12px_22px_rgba(59,130,246,0.22)]">
                                    <Building2 className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-[0.95rem] font-semibold text-[#16213f] dark:text-white">Company Information</h3>
                                    <p className="text-[0.85rem] text-[#5f6f98] dark:text-[#93a4d1]">Business details and company profile</p>
                                </div>
                            </div>
                            <Button type="button" variant="ghost" size="sm" className="self-start px-1 text-[#2f65cb] hover:text-[#1f54ba] dark:text-[#8fb5ff] dark:hover:text-white sm:self-auto" onClick={() => setEditing("company")}>
                                <ChevronRight className="mr-1 h-4 w-4" />
                                Edit
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-3.5">
                            {editing === "company" ? (
                                <>
                                    <EditableCard label="Company Name">
                                        <Input className={inputClass} placeholder="Company name" value={form.company_name} onChange={(e) => setForm((p) => ({ ...p, company_name: e.target.value }))} />
                                    </EditableCard>
                                    <EditableCard label="Website URL">
                                        <Input className={inputClass} placeholder="Website URL" value={form.website_url} onChange={(e) => setForm((p) => ({ ...p, website_url: e.target.value }))} />
                                    </EditableCard>
                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                        <EditableCard label="Industry">
                                            <select className={selectClass} value={form.industry} onChange={(e) => setForm((p) => ({ ...p, industry: e.target.value }))}>
                                                <option value="">Select industry</option>
                                                {industryOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                                            </select>
                                        </EditableCard>
                                        <EditableCard label="Company Size">
                                            <select className={selectClass} value={form.company_size} onChange={(e) => setForm((p) => ({ ...p, company_size: e.target.value }))}>
                                                <option value="">Select company size</option>
                                                {companySizeOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                                            </select>
                                        </EditableCard>
                                    </div>
                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                        <EditableCard label="Founded Year">
                                            <Input className={inputClass} type="number" placeholder="Founded year" value={form.founded_year} onChange={(e) => setForm((p) => ({ ...p, founded_year: e.target.value }))} />
                                        </EditableCard>
                                        <EditableCard label="Company Type">
                                            <select className={selectClass} value={form.company_type} onChange={(e) => setForm((p) => ({ ...p, company_type: e.target.value }))}>
                                                <option value="">Select company type</option>
                                                {companyTypeOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                                            </select>
                                        </EditableCard>
                                    </div>
                                    <EditableCard label="Description">
                                        <textarea className={textareaClass} placeholder="Enter your description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
                                    </EditableCard>
                                    <EditableCard label="Address">
                                        <textarea className={textareaClass} placeholder="Enter company address" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
                                    </EditableCard>
                                </>
                            ) : (
                                <>
                                    <ProfileField label="Company Name" value={form.company_name || "Not provided"} />
                                    <ProfileField label="Website URL" value={form.website_url || "Not provided"} />
                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                        <ProfileField label="Industry" value={form.industry || "Not provided"} />
                                        <ProfileField label="Company Size" value={form.company_size || "Not provided"} />
                                    </div>
                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                        <ProfileField label="Founded Year" value={form.founded_year || "Not provided"} />
                                        <ProfileField label="Company Type" value={form.company_type || "Not provided"} />
                                    </div>
                                    <ProfileField label="Description" value={form.description || "Not provided"} />
                                    <ProfileField label="Address" value={form.address || "Not provided"} />
                                </>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                    <Button type="button" variant="outline" className="h-10 rounded-lg border-[#ccd7f5] bg-transparent px-5 text-[#42548d] hover:bg-[#edf3ff] hover:text-[#16213f] dark:border-[#223067] dark:text-[#c4d3ff] dark:hover:bg-[#1a2858] dark:hover:text-white" onClick={() => setEditing(null)}>
                        Cancel
                    </Button>
                    <Button type="submit" loading={saving} disabled={!editing} className="h-10 rounded-lg bg-[#2f65cb] px-5 text-white hover:bg-[#2a59b2]">
                        Save Changes
                    </Button>
                    {message ? <p className="text-sm text-green-600">{message}</p> : null}
                    {error ? <p className="text-sm text-red-600">{error}</p> : null}
                </div>
            </form>
        </div>
    )
}
