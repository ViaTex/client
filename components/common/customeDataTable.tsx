"use client"

import React, { useState, useMemo, useRef, useEffect } from "react"
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    flexRender,
    ColumnDef,
    SortingState,
    ColumnFiltersState,
    VisibilityState,
    RowSelectionState,
    PaginationState,
} from "@tanstack/react-table"
export type { ColumnDef } from "@tanstack/react-table"
import { useRouter } from "next/navigation"
import { postRequest, getRequest } from "@/lib/httpClient"

import {
    Download,
    Eye,
    Maximize,
    Minimize,
    Search,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Trash2,
    SlidersHorizontal,
    Plus,
    FileDown,
    FileSpreadsheet,
    FileText,
    Pencil,
    LayoutGrid,
    List,
    AlignJustify,
    RotateCw,
    FileUp,
    CalendarPlus,
    GripVertical,
    Copy,
    BarChart3,
    ArrowRightLeft,
    ChevronDown,
    Mail,
    Check
} from "lucide-react"

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip
} from "recharts"

import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core"
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import { Modal } from "@/components/ui/modal"
import toast from "react-hot-toast"
import dayjs from "dayjs"

// ─── Helpers ─────────────────────────────────────────────────────────────

const getToken = () => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("access_token")
    }
    return null
}

const stripHtml = (html: string) => {
    if (typeof window === "undefined") return html
    const doc = new DOMParser().parseFromString(html, "text/html")
    return doc.body.textContent || ""
}

const formatCellValue = (id: string, value: any) => {
    if (value === null || value === undefined) return ""
    return String(value)
}

// ─── Types ────────────────────────────────────────────────────────────────────

type DeviceTier = "mobile" | "tablet" | "desktop"
type ViewMode = "table" | "board" | "list" | "chart"
type ExportMode = "selected" | "all"
type SearchFormat = "array" | "string"
type ApiMethod = "GET" | "POST"

interface ApiConfig {
    searchKey: string
    skipKey: string
    limitKey: string
    sortKey: string
}

interface ResponsePaths {
    list: string
    total: string
}

interface ChartConfig {
    dataLabelKey?: string
    chartType?: string
    title?: string
    topN?: number
}

interface TimeRange {
    startDate: Date
    endDate: Date
}

interface ColumnConfig {
    id: string
    label: string
    visible: boolean
}

interface CustomDataTableProps<TData = any> {
    columns?: ColumnDef<TData>[]
    data?: TData[]
    title?: string
    onSelectionChange?: (selected: TData[]) => void
    onAdd?: (e: React.MouseEvent) => void
    refreshKey?: any
    apiUrl?: string
    apiMethod?: ApiMethod
    dataMapper?: (data: any[], response?: any) => TData[]
    defaultPageSize?: number
    onValueChange?: (data: TData[]) => void
    excludeFilters?: string[]
    initialSort?: SortingState
    extraPayload?: Record<string, any>
    clearSelectionTrigger?: any
    showTimeRange?: boolean
    timeRangeKey?: string
    defaultTimeRange?: string | null
    serverSidePagination?: boolean
    apiConfig?: ApiConfig
    responsePaths?: ResponsePaths
    onBulkDelete?: () => void
    isLoading?: boolean
    showSelection?: boolean
    showSearch?: boolean
    showFilters?: boolean
    showColumnVisibility?: boolean
    showExport?: boolean
    showFullscreen?: boolean
    showPagination?: boolean
    showPageSize?: boolean
    onSync?: (() => void) | false
    onImport?: (() => void) | false
    enableRowActions?: boolean
    onEditRow?: (row: TData, e?: React.MouseEvent) => void
    onDeleteRow?: (row: TData, e?: React.MouseEvent) => void
    showDelete?: boolean
    onDesign?: (row: TData) => void
    onPreview?: (row: TData) => void
    onMail?: (row: TData) => void
    onPayment?: (row: TData) => void
    onFollowUp?: (row: TData, e?: React.MouseEvent) => void
    onTransferDataRow?: (row: TData, e?: React.MouseEvent) => void
    onTransferLicenseRow?: (row: TData, e?: React.MouseEvent) => void
    exportMode?: ExportMode
    onExportError?: () => void
    enableTable?: boolean
    enableBoard?: boolean
    enableList?: boolean
    enableChart?: boolean
    chartConfig?: ChartConfig
    showViewToggles?: boolean
    centerToolbarContent?: React.ReactNode
    searchFormat?: SearchFormat
    showBackButton?: boolean
    backRoute?: string | null
    showTooltips?: boolean
    timeRangeStartKey?: string
    timeRangeEndKey?: string
    useFlatTimeRange?: boolean
    timeRangeFormat?: string
    isWidget?: boolean
    onCloneRow?: (row: TData, e?: React.MouseEvent) => void
    customHeaderActions?: React.ReactNode
    onPaginationChange?: (pageIndex: number, pageSize: number) => void

    // External pagination and search states (for parent-managed modes)
    pageIndex?: number
    pageSize?: number
    searchTerm?: string
    onSearchChange?: (term: string) => void
    onExport?: () => void
    loading?: boolean
    error?: string | null
    searchPlaceholder?: string
    totalCount?: number
    showCopyColumn?: boolean
}

// ─── Sortable Column Item ─────────────────────────────────────────────────────

interface SortableColumnItemProps {
    col: ColumnConfig
    onToggle: () => void
}

const SortableColumnItem: React.FC<SortableColumnItemProps> = ({ col, onToggle }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: col.id })

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 2 : 1,
        opacity: isDragging ? 0.6 : 1,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center justify-between py-2 mb-1 px-2 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200 hover:translate-x-0.5 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            onClick={onToggle}
        >
            <div
                {...attributes}
                {...listeners}
                className="mr-2 cursor-grab text-slate-400"
                onClick={(e) => e.stopPropagation()}
            >
                <GripVertical size={16} />
            </div>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200 flex-grow">{col.label}</span>
            {/* Custom Switch */}
            <div
                className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-300 relative ${
                    col.visible ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"
                }`}
            >
                <div
                    className={`w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform duration-300 ${
                        col.visible ? "translate-x-5" : "translate-x-0"
                    }`}
                />
            </div>
        </div>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────

const CustomDataTable = <TData extends Record<string, any>>({
    columns = [],
    data = [],
    title,
    onSelectionChange,
    onAdd,
    refreshKey,
    apiUrl,
    apiMethod = "POST",
    dataMapper = (d: any[]) => d,
    defaultPageSize = 5,
    onValueChange,
    excludeFilters = [],
    initialSort = [],
    extraPayload = {},
    clearSelectionTrigger,
    showTimeRange = false,
    timeRangeKey = "time_range",
    defaultTimeRange = null,
    serverSidePagination = true,
    apiConfig = {
        searchKey: "searchText",
        skipKey: "skip",
        limitKey: "limit",
        sortKey: "order",
    },
    responsePaths = {
        list: "data.data",
        total: "data.count",
    },
    onBulkDelete,
    isLoading = false,
    showSelection = true,
    showSearch = true,
    showFilters = true,
    showColumnVisibility = true,
    showExport = true,
    showFullscreen = true,
    showPagination = true,
    showPageSize = true,
    onSync = false,
    onImport = false,
    enableRowActions = false,
    onEditRow,
    onDeleteRow,
    showDelete = true,
    onDesign,
    onPreview,
    onMail,
    onPayment,
    onFollowUp,
    onTransferDataRow,
    onTransferLicenseRow,
    exportMode = "selected",
    onExportError,
    enableTable = true,
    enableBoard = true,
    enableList = true,
    enableChart = false,
    chartConfig = {},
    showViewToggles = true,
    centerToolbarContent = null,
    searchFormat = "array",
    showBackButton = true,
    backRoute = null,
    showTooltips = true,
    timeRangeStartKey = "start_time",
    timeRangeEndKey = "end_time",
    useFlatTimeRange = false,
    timeRangeFormat = "YYYY-MM-DD HH:mm:ss",
    isWidget = false,
    onCloneRow,
    customHeaderActions,
    onPaginationChange,
    
    // External Pagination & Search overrides
    pageIndex: pageIndexProp,
    pageSize: pageSizeProp,
    searchTerm: searchTermProp,
    onSearchChange: onSearchChangeProp,
    onExport,
    loading,
    error,
    searchPlaceholder = "Search...",
    totalCount: totalCountProp,
    showCopyColumn = true
}: CustomDataTableProps<TData>): React.ReactElement => {
    const router = useRouter()
    
    // Compatibility navigate wrapper
    const navigate = (route: string | number) => {
        if (typeof route === "number") {
            if (route === -1) router.back()
        } else {
            router.push(route)
        }
    }

    const [deviceTier, setDeviceTier] = useState<DeviceTier>("desktop")

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth
            if (width < 768) setDeviceTier("mobile")
            else if (width >= 768 && width < 1200) setDeviceTier("tablet")
            else setDeviceTier("desktop")
        }
        handleResize()
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    const isMobile = deviceTier === "mobile"
    const isTablet = deviceTier === "tablet"
    const isDesktop = deviceTier === "desktop"

    // ─── Tooltip/Truncation Helpers ──────────────────────────────────────────

    const getTooltipText = (content: React.ReactNode, rawValue: any): string => {
        const strip = (str: string): string =>
            str
                .replace(/<[^>]*>/g, "")
                .replace(/&nbsp;/g, " ")
                .replace(/&amp;/g, "&")
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")
                .trim()

        if (typeof content === "string") return strip(content)
        if (typeof content === "number") return String(content)
        if (typeof rawValue === "string" && rawValue.match(/^\d{4}-\d{2}-\d{2}T/)) {
            try {
                return new Date(rawValue).toLocaleString("en-IN")
            } catch {
                return rawValue
            }
        }
        if (rawValue instanceof Date) return rawValue.toLocaleString()
        if (Array.isArray(rawValue)) {
            return rawValue
                .map((item: any) =>
                    typeof item === "object"
                        ? item.stage_name || item.name || item.label || ""
                        : item
                )
                .join(", ")
        }
        return strip(String(rawValue ?? ""))
    }

    interface TruncatedCellProps {
        content: React.ReactNode
        rawValue: any
        maxLength?: number
    }

    const TruncatedCell: React.FC<TruncatedCellProps> = ({
        content,
        rawValue,
        maxLength = isMobile ? 12 : 20,
    }) => {
        let displayValue = ""
        if (typeof content === "string") {
            displayValue = content
        } else if (Array.isArray(rawValue)) {
            displayValue = rawValue
                .map((item: any) =>
                    typeof item === "object"
                        ? item.stage_name || item.name || item.label || ""
                        : item
                )
                .join(", ")
        } else if (typeof rawValue === "object" && rawValue !== null) {
            displayValue = rawValue.name || rawValue.label || JSON.stringify(rawValue)
        } else {
            displayValue = String(rawValue || "")
        }

        const shouldTruncate = displayValue.length > maxLength

        if (!shouldTruncate) return <>{content}</>

        const truncated =
            typeof content === "string"
                ? content.substring(0, maxLength) + "..."
                : content

        const contentNode = (
            <div
                className="truncate inline-block align-middle max-w-[200px] md:max-w-none"
                style={{ cursor: showTooltips ? "pointer" : "default" }}
            >
                {truncated}
            </div>
        )

        if (!showTooltips) return contentNode

        return (
            <div className="group relative inline-block">
                {contentNode}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-xl z-50 whitespace-nowrap">
                    {getTooltipText(content, rawValue)}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45 -mt-1" />
                </div>
            </div>
        )
    }

    // ─── State ───────────────────────────────────────────────────────────────

    const [sorting, setSorting] = useState<SortingState>(() => {
        if (!title) return initialSort
        try {
            const saved = JSON.parse(localStorage.getItem(`${title}-filters`) || "null")
            return saved?.sorting ?? initialSort
        } catch { return initialSort }
    })

    const [globalFilter, setGlobalFilter] = useState<string>(() => {
        if (searchTermProp !== undefined) return searchTermProp
        if (!title) return ""
        try {
            const saved = JSON.parse(localStorage.getItem(`${title}-filters`) || "null")
            return saved?.globalFilter ?? ""
        } catch { return "" }
    })

    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(() => {
        if (!title) return []
        try {
            const saved = JSON.parse(localStorage.getItem(`${title}-filters`) || "null")
            return saved?.columnFilters ?? []
        } catch { return [] }
    })

    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
    const [isFullScreen, setIsFullScreen] = useState(false)
    const [filterSearchTerms, setFilterSearchTerms] = useState<Record<string, string>>({})
    const [apiLoading, setApiLoading] = useState(false)
    const [totalCount, setTotalCount] = useState(0)
    const isTableLoading = isLoading || loading || apiLoading
    const [pagination, setPagination] = useState<PaginationState>(() => {
        let stored: number | null = null
        if (title) {
            try {
                stored = JSON.parse(localStorage.getItem(`${title}-pageSize`) || "null")
            } catch { }
        }
        return {
            pageIndex: pageIndexProp !== undefined ? pageIndexProp : 0,
            pageSize: pageSizeProp !== undefined ? pageSizeProp : (stored || defaultPageSize)
        }
    })

    const [tableData, setTableData] = useState<TData[]>([])
    const [columnConfig, setColumnConfig] = useState<ColumnConfig[]>([])
    const [setAsDefault, setSetAsDefault] = useState(false)
    const [timeRange, setTimeRange] = useState<TimeRange | null>(null)
    const [timeLabel, setTimeLabel] = useState<string>(defaultTimeRange || "All")
    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        if (enableTable) return "table"
        if (enableBoard) return "board"
        if (enableList) return "list"
        if (enableChart) return "chart"
        return "table"
    })
    const [rawFilterData, setRawFilterData] = useState<TData[]>([])
    const [columnOrder, setColumnOrder] = useState<string[]>([])
    const [filterSuggestions, setFilterSuggestions] = useState<Record<string, any[]>>({})
    const [initialSuggestions, setInitialSuggestions] = useState<Record<string, any[]>>({})
    const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false)
    const [isFetchingGlobalFilters, setIsFetchingGlobalFilters] = useState(false)
    const [hasFetchedSuggestions, setHasFetchedSuggestions] = useState(false)
    
    // Custom Dropdown Overlays State
    const [activeOverlay, setActiveOverlay] = useState<"filters" | "columns" | "export" | "datePicker" | null>(null)
    const [openAccordion, setOpenAccordion] = useState<string | null>(null)

    const tableContainerRef = useRef<HTMLDivElement>(null)
    const onPaginationChangeRef = useRef<typeof onPaginationChange>(onPaginationChange)

    // ─── Effects ─────────────────────────────────────────────────────────────

    useEffect(() => {
        if (pageIndexProp !== undefined && pageIndexProp !== pagination.pageIndex) {
            setPagination((prev) => ({ ...prev, pageIndex: pageIndexProp }))
        }
    }, [pageIndexProp])

    useEffect(() => {
        onPaginationChangeRef.current = onPaginationChange
    }, [onPaginationChange])

    useEffect(() => {
        if (pageSizeProp !== undefined && pageSizeProp !== pagination.pageSize) {
            setPagination((prev) => ({ ...prev, pageSize: pageSizeProp }))
        }
    }, [pageSizeProp])

    useEffect(() => {
        if (searchTermProp !== undefined && searchTermProp !== globalFilter) {
            setGlobalFilter(searchTermProp)
        }
    }, [searchTermProp])

    useEffect(() => {
        if (onSearchChangeProp) {
            onSearchChangeProp(globalFilter)
        }
    }, [globalFilter])

    useEffect(() => {
        if (totalCountProp !== undefined && totalCountProp !== totalCount) {
            setTotalCount(totalCountProp)
        }
    }, [totalCountProp, totalCount])

    useEffect(() => {
        if (!showTimeRange) return
        if (defaultTimeRange === "Today") {
            setTimeLabel("Today")
            setTimeRange({
                startDate: dayjs().startOf("day").toDate(),
                endDate: dayjs().endOf("day").toDate(),
            })
            return
        }
        if (!defaultTimeRange || defaultTimeRange === "All") {
            setTimeLabel("All")
            setTimeRange(null)
        }
    }, [showTimeRange, defaultTimeRange])

    const shouldWaitForTimeRange =
        showTimeRange &&
        timeLabel !== "All" &&
        (!timeRange?.startDate || !timeRange?.endDate)

    useEffect(() => {
        if (onPaginationChangeRef.current) {
            onPaginationChangeRef.current(pagination.pageIndex, pagination.pageSize)
        }
    }, [pagination.pageIndex, pagination.pageSize])

    useEffect(() => {
        if (!onSelectionChange) return
        const selected = table.getSelectedRowModel().rows.map((r) => r.original)
        onSelectionChange(selected)
    }, [rowSelection])

    useEffect(() => {
        if (!title) return
        localStorage.setItem(
            `${title}-filters`,
            JSON.stringify({ globalFilter, columnFilters, sorting })
        )
    }, [globalFilter, columnFilters, sorting, title])

    useEffect(() => {
        if (clearSelectionTrigger) setRowSelection({})
    }, [clearSelectionTrigger])

    useEffect(() => {
        if (!columns || columns.length === 0) return
        let saved: Record<string, { visible: boolean }> = {}
        try {
            saved = JSON.parse(localStorage.getItem(`${title}-columns`) || "{}") || {}
        } catch { }
        const visibilityMap: VisibilityState = {}
        const config: ColumnConfig[] = []

        columns.forEach((col: any) => {
            const colId = col.accessorKey || col.id
            const meta = col.meta || col.columnDef?.meta || {}
            const label = typeof col.header === "string" ? col.header : col.id
            if (meta.disableColumnManager) {
                visibilityMap[colId] = false
                return
            }
            const isVisible = saved[colId]?.visible ?? meta.defaultVisible ?? true
            visibilityMap[colId] = isVisible
            config.push({ id: colId, label, visible: isVisible })
        })

        setColumnVisibility(visibilityMap)

        let savedOrder: string[] | null = null
        try {
            savedOrder = JSON.parse(localStorage.getItem(`${title}-columnOrder`) || "null")
        } catch { }

        if (savedOrder && Array.isArray(savedOrder)) {
            const validOrder = savedOrder.filter((id) =>
                columns.some((col: any) => (col.accessorKey || col.id) === id)
            )
            const newCols = columns
                .map((col: any) => col.accessorKey || col.id)
                .filter((id: string) => !validOrder.includes(id))
            const finalOrder = [...validOrder, ...newCols]
            setColumnOrder(finalOrder)
            const orderedConfig = finalOrder
                .map((id) => config.find((c) => c.id === id))
                .filter(Boolean) as ColumnConfig[]
            setColumnConfig(orderedConfig)
        } else {
            setColumnOrder(columns.map((col: any) => col.accessorKey || col.id))
            setColumnConfig(config)
        }
    }, [columns, title])

    useEffect(() => {
        if (!rawFilterData.length) return
        const uniqueMap: Record<string, any[]> = {}
        finalColumns.forEach((col: any) => {
            const id = col.accessorKey || col.id
            const isDateCol =
                id.toLowerCase().includes("date") ||
                id.toLowerCase().includes("created_at") ||
                id.toLowerCase().includes("open_date") ||
                id.toLowerCase().includes("time")
            uniqueMap[id] = [
                ...new Set(
                    rawFilterData
                        .map((item: any) => {
                            const val = item[id]
                            if (isDateCol && val && typeof val === "string" && /^\d{4}-\d{2}-\d{2}/.test(val) && dayjs(val).isValid()) {
                                return dayjs(val).format("DD-MM-YYYY")
                            }
                            return val
                        })
                        .filter((val: any) => val !== undefined && val !== null && val !== "")
                ),
            ].slice(0, 15)
        })
        setInitialSuggestions(uniqueMap)
    }, [rawFilterData])

    // ─── Action Column ────────────────────────────────────────────────────────

    const actionColumn: ColumnDef<TData> = {
        id: "action",
        header: "Action",
        enableSorting: false,
        cell: ({ row }) => (
            <div className="flex gap-2 justify-center">
                {onFollowUp && (
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border border-transparent transition-all duration-200 hover:-translate-y-0.5 text-cyan-500 bg-cyan-50 border-cyan-100 hover:bg-cyan-500 hover:text-white"
                        onClick={(e) => { e.stopPropagation(); onFollowUp(row.original, e) }}
                        title={showTooltips ? "Follow Up" : ""}
                    >
                        <CalendarPlus size={15} />
                    </div>
                )}
                {onDesign && !(row.original as any)?.raw?.template_id && (
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border border-transparent transition-all duration-200 hover:-translate-y-0.5 bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-600 hover:text-white"
                        onClick={() => onDesign(row.original)}
                        title={showTooltips ? "Attach Template" : ""}
                    >
                        <Plus size={16} strokeWidth={2.5} />
                    </div>
                )}
                {onPreview && (
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border border-transparent transition-all duration-200 hover:-translate-y-0.5 bg-emerald-50 text-emerald-500 border-emerald-100 hover:bg-emerald-500 hover:text-white"
                        onClick={() => onPreview(row.original)}
                        title={showTooltips ? "Preview PDF" : ""}
                    >
                        <Eye size={16} />
                    </div>
                )}
                {onMail && (
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border border-transparent transition-all duration-200 hover:-translate-y-0.5 bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-600 hover:text-white"
                        onClick={() => onMail(row.original)}
                        title={showTooltips ? "Send Mail" : ""}
                    >
                        <Mail size={15} />
                    </div>
                )}
                {onPayment && (row.original as any).status === "accepted" && !(row.original as any).is_paid && (
                    <button
                        className="bg-emerald-500 text-white border-none px-3 rounded-lg text-[10px] font-black tracking-wide h-8 flex items-center justify-center transition-all duration-200 hover:bg-emerald-700 hover:-translate-y-0.5 shadow-sm hover:shadow-emerald-300"
                        onClick={() => onPayment!(row.original)}
                    >
                        PAY
                    </button>
                )}
                {onEditRow && (
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border border-transparent transition-all duration-200 hover:-translate-y-0.5 bg-sky-50 text-sky-500 border-sky-100 hover:bg-sky-500 hover:text-white"
                        onClick={(e) => onEditRow(row.original, e)}
                        title={showTooltips ? "Edit Record" : ""}
                    >
                        <Pencil size={15} />
                    </div>
                )}
                {onCloneRow && (
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border border-transparent transition-all duration-200 hover:-translate-y-0.5 bg-violet-50 text-violet-600 border-violet-100 hover:bg-violet-600 hover:text-white"
                        onClick={(e) => { e.stopPropagation(); onCloneRow(row.original, e) }}
                        title={showTooltips ? "Clone Record" : ""}
                    >
                        <Copy size={15} />
                    </div>
                )}
                {onTransferDataRow && (
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border border-transparent transition-all duration-200 hover:-translate-y-0.5 text-amber-500 bg-amber-50 border-amber-100 hover:bg-amber-500 hover:text-white"
                        onClick={(e) => { e.stopPropagation(); onTransferDataRow(row.original, e) }}
                        title={showTooltips ? "Transfer Data" : ""}
                    >
                        <ArrowRightLeft size={15} />
                    </div>
                )}
                {onDeleteRow && showDelete && (
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border border-transparent transition-all duration-200 hover:-translate-y-0.5 bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-600 hover:text-white"
                        onClick={(e) => { e.stopPropagation(); onDeleteRow(row.original, e) }}
                        title={showTooltips ? "Delete Record" : ""}
                    >
                        <Trash2 size={15} />
                    </div>
                )}
            </div>
        ),
    }

    // ─── Final Columns ────────────────────────────────────────────────────────

    const selectColumn: ColumnDef<TData> = {
        id: "select",
        header: ({ table }) => (
            <div className="flex justify-center items-center">
                <input
                    type="checkbox"
                    className="w-[18px] h-[18px] rounded border border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    checked={table.getIsAllPageRowsSelected()}
                    onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
                />
            </div>
        ),
        cell: ({ row }) => (
            <div className="flex justify-center items-center">
                <input
                    type="checkbox"
                    className="w-[18px] h-[18px] rounded border border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    checked={row.getIsSelected()}
                    onChange={(e) => row.toggleSelected(e.target.checked)}
                />
            </div>
        ),
        enableSorting: false,
    }

    const copyColumn: ColumnDef<TData> = {
        id: "copy",
        header: "COPY",
        enableSorting: false,
        cell: ({ row }) => (
            <div className="flex justify-center items-center">
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation()
                        const val = row.original.email || row.original.phone || row.original.name || row.original.id || JSON.stringify(row.original)
                        navigator.clipboard.writeText(String(val))
                        toast.success("Copied to clipboard!")
                    }}
                    className="text-cyan-500 hover:text-cyan-600 transition-colors p-1"
                    title="Copy row data"
                >
                    <Copy size={16} />
                </button>
            </div>
        )
    }

    const finalColumns = useMemo<ColumnDef<TData>[]>(() => {
        let cols = [...columns]

        // Filter out any pre-existing select, copy or action columns to avoid duplicates
        cols = cols.filter((col: any) => col.id !== "select" && col.id !== "copy" && col.id !== "action")

        // Prepend Copy Column if enabled
        if (showCopyColumn) {
            cols = [copyColumn, ...cols]
        }

        // Prepend Select/Checkbox Column if enabled
        if (showSelection) {
            cols = [selectColumn, ...cols]
        }

        if (
            enableRowActions &&
            (onEditRow || onDeleteRow || onFollowUp || onDesign || onPreview || onMail || onPayment)
        ) {
            cols = [...cols, actionColumn]
        }
        return cols
    }, [columns, showSelection, showCopyColumn, enableRowActions, onCloneRow, onFollowUp, onDesign, onPreview, onMail, onPayment, onTransferDataRow])

    // ─── Table Instance ───────────────────────────────────────────────────────

    const table = useReactTable<TData>({
        data: tableData,
        columns: finalColumns,
        getRowId: (row: any) => row.id || row._id,
        state: { sorting, globalFilter, columnFilters, columnVisibility, rowSelection, pagination, columnOrder },
        onColumnOrderChange: setColumnOrder,
        enableRowSelection: true,
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        manualPagination: serverSidePagination,
        manualSorting: serverSidePagination,
        manualFiltering: serverSidePagination,
        pageCount: serverSidePagination
            ? Math.ceil(totalCount / pagination.pageSize)
            : undefined,
    })

    // ─── Payload Builder ──────────────────────────────────────────────────────

    const buildPayload = (customSearch: string | null = null): Record<string, any> => {
        let searchArray: string[] = []
        if (customSearch !== null) {
            searchArray = [customSearch]
        } else {
            if (globalFilter) searchArray.push(globalFilter)
            const columnTerms = table.getState().columnFilters.flatMap((f) => f.value as string[])
            searchArray = [...new Set([...searchArray, ...columnTerms])]
        }

        const payload: Record<string, any> = {
            ...extraPayload,
            ...(serverSidePagination
                ? {
                    [apiConfig.skipKey]: pagination.pageIndex * pagination.pageSize,
                    [apiConfig.limitKey]: pagination.pageSize,
                }
                : {}),
            [apiConfig.sortKey]: sorting.length
                ? { field: sorting[0].id, direction: sorting[0].desc ? "desc" : "asc" }
                : { field: "_id", direction: "desc" },
        }

        if (searchArray.length > 0) {
            payload[apiConfig.searchKey] = searchFormat === "string" ? searchArray[0] : searchArray
        }

        if (showTimeRange && timeLabel !== "All" && timeRange?.startDate && timeRange?.endDate) {
            const start = dayjs(timeRange.startDate).format(timeRangeFormat)
            const end = dayjs(timeRange.endDate).format(timeRangeFormat)
            if (useFlatTimeRange) {
                payload[timeRangeStartKey] = start
                payload[timeRangeEndKey] = end
            } else {
                payload[timeRangeKey] = { [timeRangeStartKey]: start, [timeRangeEndKey]: end }
            }
        }

        return payload
    }

    // ─── Data Fetching ────────────────────────────────────────────────────────

    const fetchData = async () => {
        if (!apiUrl) return
        if (shouldWaitForTimeRange) return
        setApiLoading(true)
        try {
            const payload = buildPayload()
            let response: any

            if (apiMethod.toUpperCase() === "GET") {
                const queryParams = new URLSearchParams()
                if (serverSidePagination) {
                    Object.entries(payload).forEach(([key, value]) => {
                        queryParams.append(key, typeof value === "object" ? JSON.stringify(value) : String(value))
                    })
                }
                const finalUrl = queryParams.toString() ? `${apiUrl}?${queryParams.toString()}` : apiUrl
                response = await getRequest(finalUrl)
            } else {
                response = await postRequest(apiUrl, payload)
            }

            const rawList = response.data?.data || response.data || []
            const total = response.data?.count || rawList.length
            const processedData = dataMapper(rawList, response.data)
            setTableData(processedData)
            setTotalCount(serverSidePagination ? total : rawList.length)
            onValueChange?.(processedData)
        } catch (error) {
            console.error("Table API error detail:", error)
            setTableData([])
        } finally {
            setApiLoading(false)
        }
    }

    useEffect(() => {
        if (serverSidePagination && !shouldWaitForTimeRange) fetchData()
    }, [globalFilter, pagination.pageIndex, pagination.pageSize, sorting, apiUrl, refreshKey, columnFilters, timeRange, timeLabel, shouldWaitForTimeRange, JSON.stringify(extraPayload)])

    useEffect(() => {
        if (!serverSidePagination && !shouldWaitForTimeRange) fetchData()
    }, [apiUrl, refreshKey, JSON.stringify(extraPayload), timeRange, timeLabel, shouldWaitForTimeRange])

    useEffect(() => {
        if (!apiUrl && data) {
            const processedData = dataMapper(data)
            setTableData(processedData)
            setTotalCount(processedData.length)
        }
    }, [data, apiUrl])

    const fetchFilterSuggestions = useMemo(
        () =>
            async (columnId: string, searchTerm: string) => {
                if (!searchTerm || searchTerm.length < 1) {
                    setFilterSuggestions((prev) => ({ ...prev, [columnId]: [] }))
                    return
                }
                setIsFetchingSuggestions(true)
                try {
                    let response: any
                    if (apiMethod.toUpperCase() === "GET") {
                        const query = new URLSearchParams({ [apiConfig.searchKey]: JSON.stringify([searchTerm]) }).toString()
                        response = await getRequest(`${apiUrl}?${query}`)
                    } else {
                        const payload = buildPayload(searchTerm)
                        response = await postRequest(apiUrl!, payload)
                    }
                    const raw = response.data?.data || response.data || []
                    const processed = dataMapper(raw, response.data)
                    const isDateCol = columnId.toLowerCase().includes("date") || columnId.toLowerCase().includes("created_at") || columnId.toLowerCase().includes("time")
                    const uniqueValues = [...new Set(
                        processed.map((item: any) => {
                            const val = item[columnId]
                            if (isDateCol && val && typeof val === "string" && /^\d{4}-\d{2}-\d{2}/.test(val) && dayjs(val).isValid()) {
                                return dayjs(val).format("DD-MM-YYYY")
                            }
                            return val
                        }).filter(Boolean)
                    )]
                    setFilterSuggestions((prev) => ({ ...prev, [columnId]: uniqueValues }))
                } catch (error) {
                    console.error(error)
                } finally {
                    setIsFetchingSuggestions(false)
                }
            },
        [apiUrl, dataMapper, apiMethod]
    )

    const fetchGlobalFilters = async () => {
        if (!apiUrl || !serverSidePagination || hasFetchedSuggestions) return
        setIsFetchingGlobalFilters(true)
        try {
            const payload: Record<string, any> = {
                ...extraPayload,
                [apiConfig.skipKey]: 0,
                [apiConfig.limitKey]: 5,
            }
            if (searchFormat === "string") payload[apiConfig.searchKey] = ""
            const response = apiMethod === "GET"
                ? await getRequest(apiUrl!)
                : await postRequest(apiUrl!, payload)
            const raw = response.data?.data || response.data || []
            const processed = typeof dataMapper === "function" ? dataMapper(raw, response.data) : raw
            setRawFilterData(processed)
            setHasFetchedSuggestions(true)
        } catch (e) {
            console.error("Filter Suggestion Fetch Error:", e)
        } finally {
            setIsFetchingGlobalFilters(false)
        }
    }

    // ─── Export ───────────────────────────────────────────────────────────────

    const handleExport = async (type: "excel" | "pdf") => {
        if (onExport) {
            onExport()
            return
        }

        let rowsToExport: any[] = []
        if (exportMode === "selected" && showSelection) {
            const selectedRows = table.getSelectedRowModel().rows
            if (!selectedRows.length) {
                onExportError?.() || toast.error("Please select rows to export")
                return
            }
            rowsToExport = selectedRows
        } else {
            if (!serverSidePagination) {
                rowsToExport = table.getFilteredRowModel().rows
            } else {
                try {
                    const payload: Record<string, any> = {
                        ...extraPayload,
                        [apiConfig.searchKey]: globalFilter ? [globalFilter] : [],
                        [apiConfig.skipKey]: 0,
                        [apiConfig.limitKey]: totalCount,
                        [apiConfig.sortKey]: sorting.length
                            ? { field: sorting[0].id, direction: sorting[0].desc ? "desc" : "asc" }
                            : { field: "_id", direction: "desc" },
                    }
                    if (showTimeRange && timeLabel !== "All" && timeRange?.startDate && timeRange?.endDate) {
                        payload[timeRangeKey] = {
                            start_time: dayjs(timeRange.startDate).toISOString(),
                            end_time: dayjs(timeRange.endDate).toISOString(),
                        }
                    }
                    const response = apiMethod === "GET"
                        ? await getRequest(apiUrl!)
                        : await postRequest(apiUrl!, payload)
                    const raw = response.data?.data || response.data || []
                    rowsToExport = raw.map((item: any) => ({
                        original: item,
                        getValue: (key: string) => item[key],
                    }))
                } catch {
                    toast.error("Failed to export all data")
                    return
                }
            }
        }

        const exportCols = table
            .getAllLeafColumns()
            .filter((col) => col.getIsVisible() && col.id !== "select" && col.id !== "action")
            .map((col) => ({
                title: typeof col.columnDef.header === "string" ? col.columnDef.header : col.id,
                data: col.id,
            }))

        const exportData = rowsToExport.map((row: any) => {
            const item: Record<string, string> = {}
            exportCols.forEach((col) => {
                item[col.data] = stripHtml(String(row.getValue(col.data)))
            })
            return item
        })

        const headers = exportCols.map((c) => c.title)

        if (type === "excel") {
            const csvRows = [
                headers.join(","),
                ...exportData.map((row) => exportCols.map((c) => `"${String(row[c.data] || "").replace(/"/g, '""')}"`).join(","))
            ]
            const blob = new Blob(["\uFEFF" + csvRows.join("\n")], { type: "text/csv;charset=utf-8;" })
            const link = document.createElement("a")
            link.href = URL.createObjectURL(blob)
            link.download = `${title || "export"}_${new Date().toISOString().split("T")[0]}.csv`
            link.click()
        } else {
            const printWindow = window.open("", "_blank")
            if (!printWindow) return
            const html = `
                <html>
                <head>
                    <title>${title || "Export"}</title>
                    <style>
                        body { font-family: sans-serif; padding: 20px; color: #333; }
                        h1 { margin-bottom: 20px; font-size: 20px; font-weight: bold; }
                        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; }
                        th { background-color: #f8fafc; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <h1>${title || "Data Export"}</h1>
                    <table>
                        <thead>
                            <tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>
                        </thead>
                        <tbody>
                            ${exportData.map((row) => `<tr>${exportCols.map((c) => `<td>${row[c.data] || ""}</td>`).join("")}</tr>`).join("")}
                        </tbody>
                    </table>
                    <script>
                        window.onload = function() { window.print(); window.close(); }
                    </script>
                </body>
                </html>
            `
            printWindow.document.write(html)
            printWindow.document.close()
        }
    }

    // ─── Misc Handlers ────────────────────────────────────────────────────────

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (over && active.id !== over.id) {
            setColumnConfig((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id)
                const newIndex = items.findIndex((item) => item.id === over.id)
                const newItems = arrayMove(items, oldIndex, newIndex)
                setColumnOrder(newItems.map((item) => item.id))
                return newItems
            })
        }
    }

    const handleResetAllFilters = () => {
        setGlobalFilter("")
        setColumnFilters([])
        table.resetColumnFilters()
        setFilterSearchTerms({})
        setFilterSuggestions({})
        if (title) localStorage.removeItem(`${title}-filters`)
    }

    const toggleFilterValue = (columnId: string, value: any) => {
        const column = table.getColumn(columnId)
        if (!column) return
        const currentFilters = Array.isArray(column.getFilterValue()) ? (column.getFilterValue() as any[]) : []
        const newFilters = currentFilters.includes(value)
            ? currentFilters.filter((v) => v !== value)
            : [...currentFilters, value]
        column.setFilterValue(newFilters.length ? newFilters : undefined)
        setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    }

    const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSize = Number(e.target.value)
        setPagination((prev) => ({ ...prev, pageSize: newSize, pageIndex: 0 }))
        if (title) localStorage.setItem(`${title}-pageSize`, JSON.stringify(newSize))
    }

    const handleSaveColumns = () => {
        const configMap: Record<string, { visible: boolean }> = {}
        columnConfig.forEach((col) => {
            configMap[col.id] = { visible: col.visible }
            table.getColumn(col.id)?.toggleVisibility(col.visible)
        })
        if (setAsDefault) {
            localStorage.setItem(`${title}-columns`, JSON.stringify(configMap))
            localStorage.setItem(`${title}-columnOrder`, JSON.stringify(columnOrder))
        }
        toast.success(setAsDefault ? "Column defaults saved" : "Column visibility updated")
    }

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen()
            setIsFullScreen(true)
        } else {
            document.exitFullscreen()
            setIsFullScreen(false)
        }
    }

    const getSerialNumber = (rowIndex: number): number => {
        const { pageIndex, pageSize } = table.getState().pagination
        return pageIndex * pageSize + rowIndex + 1
    }

    const activeFilterCount = table.getState().columnFilters.length + (globalFilter ? 1 : 0)
    const selectedCount = Object.keys(rowSelection).length

    const totalPagesForButtons = table.getPageCount()
    const currentPageForButtons = table.getState().pagination.pageIndex
    const maxButtons = 5
    let startPage = Math.max(0, currentPageForButtons - Math.floor(maxButtons / 2))
    let endPage = Math.min(totalPagesForButtons, startPage + maxButtons)
    if (endPage - startPage < maxButtons) startPage = Math.max(0, endPage - maxButtons)
    const visiblePages = Array.from({ length: Math.max(0, endPage - startPage) }, (_, i) => startPage + i)

    // ─── Render: Filter Menu Content ──────────────────────────────────────────

    const renderFilterMenuContent = () => (
        <div className="bg-white dark:bg-gray-800 rounded-[20px] overflow-hidden">
            {/* Header */}
            <div className="bg-gray-50 dark:bg-gray-700/50 px-5 py-[18px] border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <span className="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest">Filter Records</span>
                <button
                    className="text-red-500 text-xs font-bold bg-transparent border-none p-0 cursor-pointer hover:text-red-700 transition-colors"
                    onClick={handleResetAllFilters}
                >
                    Reset All
                </button>
            </div>

            {isFetchingGlobalFilters ? (
                <div className="p-5 flex flex-col items-center justify-center min-h-[200px]">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="mt-3 text-xs text-slate-400 font-bold">Loading Filters...</span>
                </div>
            ) : (
                <div
                    className="overflow-y-auto max-h-[300px] md:max-h-[400px]"
                >
                    {table.getHeaderGroups().length > 0 &&
                        table.getHeaderGroups()[0].headers.map((header) => {
                            const columnId = header.column.id
                            const columnHeader = typeof header.column.columnDef.header === "string" ? header.column.columnDef.header : ""
                            const meta = (header.column.columnDef as any).meta || {}
                            if (meta.disableFilter || !header.column.getCanFilter() || columnId === "select" || columnId === "action" || excludeFilters.includes(columnId) || excludeFilters.includes(columnHeader)) return null

                            const searchTerm = filterSearchTerms[header.id] || ""
                            const currentValues = (header.column.getFilterValue() as any[]) || []
                            const options = searchTerm.trim() === "" ? initialSuggestions[header.id] || [] : filterSuggestions[header.id] || []
                            const isDateCol = header.id.toLowerCase().includes("date") || header.id.toLowerCase().includes("created_at") || header.id.toLowerCase().includes("time")

                            const formatVal = (v: any) => {
                                if (isDateCol && v && typeof v === "string" && /^\d{4}-\d{2}-\d{2}/.test(v) && dayjs(v).isValid()) {
                                    return dayjs(v).format("DD-MM-YYYY")
                                }
                                return v
                            }

                            const processedCurrent = currentValues.map(formatVal)
                            const processedOptions = options.map(formatVal)
                            const displaySuggestions = [...new Set([...processedCurrent, ...processedOptions])]
                            const isAccordionOpen = openAccordion === header.id

                            return (
                                <div key={header.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                                    <button
                                        type="button"
                                        className="w-full flex justify-between px-5 py-3 text-left font-bold text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                                        onClick={() => setOpenAccordion(isAccordionOpen ? null : header.id)}
                                    >
                                        <span className="uppercase text-[11px] tracking-wider">
                                            {header.id.replace(/_/g, " ")}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            {currentValues.length > 0 && (
                                                <span className="bg-blue-600 text-white rounded-full px-2 py-0.5 text-[10px] font-bold">
                                                    {currentValues.length}
                                                </span>
                                            )}
                                            <ChevronDown className={`w-4 h-4 transition-transform ${isAccordionOpen ? "rotate-180" : ""}`} />
                                        </div>
                                    </button>
                                    
                                    {isAccordionOpen && (
                                        <div className="px-5 pb-3 pt-1 space-y-2">
                                            <div className="flex items-center bg-gray-50 dark:bg-gray-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl">
                                                <Search size={14} className="text-blue-600 mr-2 flex-shrink-0" />
                                                <input
                                                    placeholder="Search options..."
                                                    className="border-0 bg-transparent text-[13px] outline-none w-full text-slate-800 dark:text-slate-200"
                                                    value={searchTerm}
                                                    onChange={(e) => {
                                                        setFilterSearchTerms((prev) => ({ ...prev, [header.id]: e.target.value }))
                                                        if (e.target.value.trim() !== "") fetchFilterSuggestions(header.id, e.target.value)
                                                    }}
                                                />
                                            </div>

                                            <div className="max-h-[150px] overflow-y-auto space-y-1 pr-1">
                                                {displaySuggestions.map((val, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center justify-between py-1.5 px-2 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/40 text-slate-700 dark:text-slate-300"
                                                        onClick={() => toggleFilterValue(header.id, val)}
                                                    >
                                                        <span className="text-sm font-medium">
                                                            {isDateCol && val && typeof val === "string" && /^\d{4}-\d{2}-\d{2}/.test(val) && dayjs(val).isValid()
                                                                ? dayjs(val).format("DD-MM-YYYY")
                                                                : stripHtml(String(val))
                                                            }
                                                        </span>
                                                        <div className={`w-4.5 h-4.5 rounded border transition-colors flex items-center justify-center ${
                                                            currentValues.includes(val) ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300 dark:border-slate-600"
                                                        }`}>
                                                            {currentValues.includes(val) && <Check className="w-3 h-3" />}
                                                        </div>
                                                    </div>
                                                ))}
                                                {displaySuggestions.length === 0 && (
                                                    <p className="text-xs text-slate-400 text-center py-2">No matching options</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                </div>
            )}
        </div>
    )

    // ─── Render: Column Visibility Content ───────────────────────────────────

    const renderColumnVisibilityContent = () => (
        <div className="bg-white dark:bg-gray-800 rounded-[20px] overflow-hidden p-4">
            <div className="pb-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center mb-3">
                <span className="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest">Columns visibility</span>
            </div>
            <div
                className="overflow-y-auto pr-1"
                style={{ maxHeight: isDesktop ? "220px" : "50vh" }}
            >
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={columnConfig.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                        {columnConfig.map((col) => (
                            <SortableColumnItem
                                key={col.id}
                                col={col}
                                onToggle={() =>
                                    setColumnConfig((prev) => prev.map((c) => c.id === col.id ? { ...c, visible: !c.visible } : c))
                                }
                            />
                        ))}
                    </SortableContext>
                </DndContext>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <div
                    className="flex items-center gap-2 mb-3 cursor-pointer select-none"
                    onClick={() => setSetAsDefault(!setAsDefault)}
                >
                    <div className={`w-5 h-5 rounded-md border-2 transition-colors flex items-center justify-center ${
                        setAsDefault ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300 dark:border-slate-600"
                    }`}>
                        {setAsDefault && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-sm text-slate-500 dark:text-slate-400 font-bold">Set as default view</span>
                </div>
                <button
                    className="w-full rounded-full py-2 font-bold text-white text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-[1.02] shadow-md hover:shadow-blue-300/40 transition-all duration-200"
                    onClick={() => {
                        handleSaveColumns()
                        setActiveOverlay(null)
                    }}
                >
                    Save Preferences
                </button>
            </div>
        </div>
    )

    // ─── Render: Export Content ───────────────────────────────────────────────

    const renderExportContent = () => (
        <div className="bg-white dark:bg-gray-800 rounded-[20px] overflow-hidden p-2">
            <button
                onClick={() => { handleExport("excel"); setActiveOverlay(null) }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 text-left transition-colors"
            >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center flex-shrink-0">
                    <FileSpreadsheet size={18} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                    <div className="font-bold text-sm text-slate-800 dark:text-slate-200">Excel Sheet</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500">Spreadsheet (.csv)</div>
                </div>
            </button>
            <button
                onClick={() => { handleExport("pdf"); setActiveOverlay(null) }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 text-left transition-colors"
            >
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center flex-shrink-0">
                    <FileText size={18} className="text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                    <div className="font-bold text-sm text-slate-800 dark:text-slate-200">PDF Document</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500">Formatted (.pdf)</div>
                </div>
            </button>
        </div>
    )

    // ─── Shared Styles ────────────────────────────────────

    const actionIconBase =
        "w-[42px] h-[42px] bg-white dark:bg-gray-800 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 text-slate-500 border border-slate-200 dark:border-gray-700 shadow-sm hover:border-blue-600 hover:text-blue-600 hover:-translate-y-0.5 hover:shadow-md flex-shrink-0"

    const paginationBtnBase =
        "w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-200 text-slate-500 hover:border-blue-600 hover:text-blue-600 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"

    // ─── Render Cell Helper ───────────────────────────────────────────────────

    const renderCell = (cell: any) => {
        const isEmail = cell.column.id.toLowerCase() === "email"
        const cellContent = cell.column.columnDef.cell
            ? flexRender(cell.column.columnDef.cell, cell.getContext())
            : formatCellValue(cell.column.id, cell.getValue())

        if (isEmail) {
            return (
                <a href={`mailto:${cell.getValue()}`} className="lowercase text-blue-600 dark:text-blue-400 underline transition-colors">
                    <TruncatedCell content={cellContent} rawValue={cell.getValue()} maxLength={20} />
                </a>
            )
        }
        return <TruncatedCell content={cellContent} rawValue={cell.getValue()} maxLength={20} />
    }

    return (
        <div
            ref={tableContainerRef}
            className={`bg-white dark:bg-gray-900 flex flex-col h-full rounded-2xl border border-slate-200 dark:border-gray-800 shadow-sm transition-all duration-300 ${
                isFullScreen ? "fixed inset-0 w-screen h-screen z-[999] overflow-auto bg-white dark:bg-gray-900 p-4" : ""
            } ${isWidget ? "shadow-none border-none bg-transparent" : ""}`}
        >
            {/* ── 1. TOP HEADER ───────────────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-3 px-4 border-b border-slate-200 dark:border-gray-800 gap-3 z-25 relative bg-white dark:bg-gray-900 rounded-t-2xl">
                {/* Title */}
                <div
                    className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 group"
                    onClick={showBackButton ? () => (backRoute ? navigate(backRoute) : navigate(-1)) : undefined}
                >
                    {showBackButton && (
                        <div className="w-1.5 h-[30px] rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 bg-gradient-to-b from-blue-600 to-indigo-600 group-hover:w-9 group-hover:h-9 group-hover:rounded-xl">
                            <ChevronLeft size={16} className="text-white opacity-0 scale-50 -rotate-90 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100 group-hover:rotate-0" />
                        </div>
                    )}
                    {title && (
                        <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-0 select-none">
                            <span className="w-1.5 h-6 bg-blue-600 rounded-full inline-block mr-1.5 flex-shrink-0" />
                            {title}
                            {activeFilterCount > 0 && (
                                <span className="text-blue-600 border border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-900 dark:text-blue-400 rounded-full py-0.5 px-2 font-medium text-[11px]">
                                    {activeFilterCount} Active
                                </span>
                            )}
                        </h1>
                    )}
                </div>

                {/* Actions Row */}
                <div className="flex items-center gap-2 flex-wrap justify-start md:justify-end w-full md:w-auto relative">
                    {/* Date Picker trigger */}
                    {showTimeRange && (
                        <div className="relative">
                            <button
                                type="button"
                                className="min-w-[42px] h-[42px] px-3 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 text-blue-600 dark:text-blue-400 font-bold border border-slate-200 dark:border-gray-700 shadow-sm hover:border-blue-600 hover:-translate-y-0.5 text-xs whitespace-nowrap"
                                onClick={() => setActiveOverlay(activeOverlay === "datePicker" ? null : "datePicker")}
                            >
                                {timeLabel}
                            </button>
                            {activeOverlay === "datePicker" && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setActiveOverlay(null)} />
                                    <div className="absolute right-0 mt-2 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[20px] shadow-2xl z-50 w-64 space-y-3">
                                        <div className="space-y-1">
                                            {["All", "Today", "Yesterday", "Last 7 Days", "Last 30 Days"].map((preset) => (
                                                <button
                                                    key={preset}
                                                    type="button"
                                                    onClick={() => {
                                                        setTimeLabel(preset)
                                                        setActiveOverlay(null)
                                                        if (preset === "All") {
                                                            setTimeRange(null)
                                                        } else {
                                                            const diffMap: Record<string, number> = { Today: 0, Yesterday: 1, "Last 7 Days": 7, "Last 30 Days": 30 }
                                                            const start = dayjs().subtract(diffMap[preset], "day").startOf("day").toDate()
                                                            const end = dayjs().endOf("day").toDate()
                                                            setTimeRange({ startDate: start, endDate: end })
                                                        }
                                                        setPagination((prev) => ({ ...prev, pageIndex: 0 }))
                                                    }}
                                                    className="w-full text-left py-1.5 px-2 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium"
                                                >
                                                    {preset}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Bulk Delete */}
                    {onBulkDelete && (
                        <div
                            className={`relative w-[42px] h-[42px] rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0
                            ${selectedCount > 0 ? "bg-red-500 border-red-500 text-white shadow-sm cursor-pointer" : "bg-gray-100 dark:bg-gray-800 text-slate-400 dark:text-slate-600 opacity-40 cursor-not-allowed border border-slate-200 dark:border-gray-700"}`}
                            onClick={selectedCount > 0 ? onBulkDelete : undefined}
                            title={showTooltips ? "Delete Selected" : ""}
                        >
                            <Trash2 size={18} />
                            {selectedCount > 0 && (
                                <span className="absolute -top-1 left-full -translate-x-1/2 bg-slate-900 text-white border-2 border-white rounded-full text-[9px] px-1.5 font-bold">
                                    {selectedCount}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Custom Header Actions */}
                    {customHeaderActions && (
                        <div className="flex items-center gap-2">{customHeaderActions}</div>
                    )}

                    {/* Sync */}
                    {onSync && (
                        <div className={actionIconBase} onClick={onSync as () => void} title={showTooltips ? "Sync Leads" : ""}>
                            <RotateCw size={18} className={isTableLoading ? "animate-spin" : ""} />
                        </div>
                    )}

                    {/* Import */}
                    {onImport && (
                        <div className={actionIconBase} onClick={onImport as () => void} title={showTooltips ? "Import Excel" : ""}>
                            <FileUp size={18} />
                        </div>
                    )}

                    {/* Filters Dropdown */}
                    {showFilters && (
                        <div className="relative">
                            <div
                                className={`${actionIconBase} relative`}
                                onClick={() => {
                                    setActiveOverlay(activeOverlay === "filters" ? null : "filters")
                                    fetchGlobalFilters()
                                }}
                            >
                                <SlidersHorizontal size={18} />
                                {activeFilterCount > 0 && (
                                    <span className="absolute -top-0.5 left-full -translate-x-1/2 bg-blue-600 text-white border-2 border-white rounded-full text-[9px] min-w-[18px] h-[18px] flex items-center justify-center px-1 font-bold z-[2]">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </div>
                            {activeOverlay === "filters" && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setActiveOverlay(null)} />
                                    <div className="absolute right-0 mt-2 w-[300px] md:w-[340px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[20px] shadow-2xl z-50">
                                        {renderFilterMenuContent()}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Column Visibility */}
                    {showColumnVisibility && (
                        <div className="relative">
                            <div className={actionIconBase} onClick={() => setActiveOverlay(activeOverlay === "columns" ? null : "columns")}>
                                <Eye size={18} />
                            </div>
                            {activeOverlay === "columns" && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setActiveOverlay(null)} />
                                    <div className="absolute right-0 mt-2 w-[280px] md:w-[300px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[20px] shadow-2xl z-50">
                                        {renderColumnVisibilityContent()}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Export Dropdown */}
                    {showExport && (
                        <div className="relative">
                            <div className={actionIconBase} onClick={() => setActiveOverlay(activeOverlay === "export" ? null : "export")}>
                                <FileDown size={18} />
                            </div>
                            {activeOverlay === "export" && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setActiveOverlay(null)} />
                                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[20px] shadow-2xl z-50">
                                        {renderExportContent()}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Fullscreen */}
                    {showFullscreen && (
                        <div className={actionIconBase} onClick={toggleFullScreen}>
                            {isFullScreen ? <Minimize size={18} /> : <Maximize size={18} />}
                        </div>
                    )}

                    {/* Add Button */}
                    {onAdd && (
                        <button
                            type="button"
                            className="w-[42px] h-[42px] rounded-full flex items-center justify-center text-white border-none shadow-[0_4px_12px_rgba(37,99,235,0.3)] hover:scale-105 hover:rotate-90 hover:shadow-lg transition-all duration-300 bg-blue-600"
                            onClick={(e) => onAdd!(e)}
                        >
                            {isLoading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                                <Plus size={24} />
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* ── 2. TOOLBAR ────────────────────────────────────────────────────────── */}
            {(showPageSize || showViewToggles || centerToolbarContent || showSearch) && (
                <div className="flex flex-col lg:flex-row items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 gap-3">
                    {/* Rows Per Page */}
                    {showPageSize && !isWidget && (
                        <div className="flex items-center gap-2 w-full lg:w-auto justify-center lg:justify-start">
                            <span className="text-sm text-slate-400 dark:text-slate-500 font-bold whitespace-nowrap">Rows Per Page:</span>
                            <select
                                className="rounded-xl border border-slate-200 dark:border-gray-700 text-sm py-1.5 px-3 bg-gray-50 dark:bg-gray-800 text-slate-700 dark:text-slate-300 outline-none focus:bg-white dark:focus:bg-gray-950 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 w-[100px] font-medium"
                                value={pagination.pageSize}
                                onChange={handlePageSizeChange}
                            >
                                {[5, 10, 20, 50, 100, 200, 500].map((size) => (
                                    <option key={size} value={size}>{size}</option>
                                ))}
                                {![5, 10, 20, 50, 100, 200, 500].includes(totalCount) && totalCount > 0 && (
                                    <option value={totalCount}>All ({totalCount})</option>
                                )}
                            </select>
                        </div>
                    )}

                    {/* View Toggles */}
                    {(showViewToggles || centerToolbarContent) && !isWidget && (
                        <div className="flex justify-center items-center gap-2 flex-wrap w-full lg:w-auto">
                            {showViewToggles && (
                                <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-1 border border-slate-200 dark:border-gray-700 flex shadow-sm">
                                    {enableTable && (
                                        <button
                                            type="button"
                                            className={`border-none px-4 py-1.5 rounded-full flex items-center transition-all duration-200 text-slate-500 dark:text-slate-400 cursor-pointer text-sm font-bold ${
                                                viewMode === "table" ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-[0_4px_12px_rgba(0,0,0,0.05)]" : ""
                                            }`}
                                            onClick={() => setViewMode("table")}
                                        >
                                            <List size={16} /><span className="ml-2">Table</span>
                                        </button>
                                    )}
                                    {enableBoard && (
                                        <button
                                            type="button"
                                            className={`border-none px-4 py-1.5 rounded-full flex items-center transition-all duration-200 text-slate-500 dark:text-slate-400 cursor-pointer text-sm font-bold ${
                                                viewMode === "board" ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-[0_4px_12px_rgba(0,0,0,0.05)]" : ""
                                            }`}
                                            onClick={() => setViewMode("board")}
                                        >
                                            <LayoutGrid size={16} /><span className="ml-2">Board</span>
                                        </button>
                                    )}
                                    {enableList && (
                                        <button
                                            type="button"
                                            className={`border-none px-4 py-1.5 rounded-full flex items-center transition-all duration-200 text-slate-500 dark:text-slate-400 cursor-pointer text-sm font-bold ${
                                                viewMode === "list" ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-[0_4px_12px_rgba(0,0,0,0.05)]" : ""
                                            }`}
                                            onClick={() => setViewMode("list")}
                                        >
                                            <AlignJustify size={16} /><span className="ml-2">List</span>
                                        </button>
                                    )}
                                    {enableChart && (
                                        <button
                                            type="button"
                                            className={`border-none px-4 py-1.5 rounded-full flex items-center transition-all duration-200 text-slate-500 dark:text-slate-400 cursor-pointer text-sm font-bold ${
                                                viewMode === "chart" ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-[0_4px_12px_rgba(0,0,0,0.05)]" : ""
                                            }`}
                                            onClick={() => setViewMode("chart")}
                                        >
                                            <BarChart3 size={16} /><span className="ml-2">Graph</span>
                                        </button>
                                    )}
                                </div>
                            )}
                            {centerToolbarContent && <div>{centerToolbarContent}</div>}
                        </div>
                    )}

                    {/* Search */}
                    {showSearch && (
                        <div className="flex justify-center lg:justify-end flex-grow w-full lg:w-auto">
                            <div className="relative w-full max-w-xs">
                                <input
                                    value={globalFilter ?? ""}
                                    onChange={(e) => setGlobalFilter(e.target.value)}
                                    placeholder={searchPlaceholder}
                                    className="w-full pl-5 border-0 rounded-full shadow-sm py-2 bg-gray-100 dark:bg-gray-800 text-[13.5px] outline-none focus:bg-white dark:focus:bg-gray-950 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-950/20 text-slate-900 dark:text-slate-100 transition-all font-medium"
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── 3. DATA VIEW ─────────────────────────────────────────────────────── */}
            {viewMode === "table" && (
                <div className="overflow-x-auto px-4 py-4 flex-grow overflow-y-auto max-h-[60vh]">
                    <table className="w-full border-collapse align-middle">
                        <thead>
                            {table.getHeaderGroups().length > 0 ? (
                                table.getHeaderGroups().map((hg) => (
                                    <tr key={hg.id}>
                                        <th className="bg-slate-50 dark:bg-gray-800/40 py-3 px-4 uppercase border-b-0 text-[11px] font-extrabold tracking-wider text-slate-500 dark:text-slate-400 w-[60px] text-center">
                                            SL.
                                        </th>
                                        {hg.headers.map((header) => (
                                            <th
                                                key={header.id}
                                                className={`bg-slate-50 dark:bg-gray-800/40 py-3 px-4 uppercase text-slate-500 dark:text-slate-400 border-b-0 text-[11px] font-extrabold tracking-wider ${
                                                    header.id === "action" ? "sticky right-[-10px] z-[1] w-[150px] min-w-[150px] text-center bg-slate-50 dark:bg-gray-850 shadow-[-4px_0_10px_rgba(0,0,0,0.03)]" : ""
                                                }`}
                                            >
                                                <div
                                                    className={header.column.getCanSort() ? "cursor-pointer flex items-center gap-2 hover:text-blue-600 transition-colors" : ""}
                                                    onClick={header.column.getToggleSortingHandler()}
                                                >
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                    {header.column.getCanSort() && (
                                                        <span>
                                                            {header.column.getIsSorted() === "asc" ? (
                                                                <ArrowUp size={12} className="text-blue-600" />
                                                            ) : header.column.getIsSorted() === "desc" ? (
                                                                <ArrowDown size={12} className="text-blue-600" />
                                                            ) : (
                                                                <ArrowUpDown size={12} className="opacity-30" />
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                ))
                            ) : null}
                        </thead>
                        <tbody>
                            {error ? (
                                <tr>
                                    <td colSpan={table.getAllColumns().length + 1} className="text-center py-12 text-red-500 font-bold">
                                        {error}
                                    </td>
                                </tr>
                            ) : isTableLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse border-b border-slate-100 dark:border-gray-800">
                                        <td className="py-4 px-4 text-center">
                                            <div className="h-3.5 bg-slate-100 dark:bg-gray-800 rounded w-8 mx-auto" />
                                        </td>
                                        {table.getAllColumns().map((col) => (
                                            <td key={col.id} className="py-4 px-4">
                                                <div className="h-3.5 bg-slate-100 dark:bg-gray-800 rounded w-24" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : table.getRowModel().rows.length > 0 ? (
                                table.getRowModel().rows.map((row) => (
                                    <tr
                                        key={row.id}
                                        className={`group/row transition-colors border-b border-slate-100 dark:border-gray-800/60 hover:bg-slate-50/70 dark:hover:bg-gray-800/20 ${
                                            row.getIsSelected() ? "bg-blue-50/30 dark:bg-blue-950/15" : ""
                                        }`}
                                    >
                                        <td className="px-4 py-3 text-center sticky left-0 z-[1] bg-white dark:bg-gray-900 group-hover/row:bg-slate-50 dark:group-hover/row:bg-slate-800/10">
                                            <span className="inline-flex items-center justify-center w-8 h-8 bg-slate-50 text-slate-500 font-bold text-[11px] rounded-[10px] border border-slate-200/80 dark:bg-gray-800 dark:text-slate-400 dark:border-gray-700 transition-all duration-300 group-hover/row:bg-blue-600 group-hover/row:text-white group-hover/row:border-blue-600">
                                                {getSerialNumber(row.index)}
                                            </span>
                                        </td>
                                        {row.getVisibleCells().map((cell) => (
                                            <td
                                                key={cell.id}
                                                className={`px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-300 ${
                                                    cell.column.id === "action" ? "sticky right-[-10px] z-[1] bg-white dark:bg-gray-900 group-hover/row:bg-slate-50 dark:group-hover/row:bg-slate-800/10 text-center shadow-[-4px_0_10px_rgba(0,0,0,0.03)]" : ""
                                                }`}
                                            >
                                                {renderCell(cell)}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={table.getAllColumns().length + 1} className="text-center py-12 text-slate-400 dark:text-slate-500 font-medium">
                                        No records found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {viewMode === "board" && (
                <div className="px-4 py-4 flex-grow overflow-y-auto max-h-[60vh] bg-slate-50/50 dark:bg-transparent">
                    {loading || isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="p-5 rounded-[20px] border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 min-h-[180px] animate-pulse" />
                            ))}
                        </div>
                    ) : table.getRowModel().rows.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {table.getRowModel().rows.map((row) => (
                                <div
                                    key={row.id}
                                    className={`bg-white dark:bg-gray-800/40 border border-slate-100 dark:border-gray-800/80 rounded-[20px] p-4 flex flex-col transition-all duration-300 shadow-sm hover:-translate-y-0.5 hover:border-blue-600/30 hover:shadow-md ${
                                        row.getIsSelected() ? "border-blue-600 dark:border-blue-500 bg-blue-50/10" : ""
                                    }`}
                                >
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-400 font-extrabold">#{getSerialNumber(row.index)}</span>
                                            {showSelection && (
                                                <input
                                                    type="checkbox"
                                                    checked={row.getIsSelected()}
                                                    onChange={(e) => row.toggleSelected(e.target.checked)}
                                                    className="h-4.5 w-4.5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                />
                                            )}
                                        </div>
                                        <div className="flex gap-1.5">
                                            {onEditRow && (
                                                <div
                                                    className="w-7 h-7 rounded-full bg-sky-50 text-sky-600 dark:bg-sky-950/20 dark:text-sky-400 flex items-center justify-center cursor-pointer hover:bg-sky-600 hover:text-white dark:hover:bg-sky-500 transition-all"
                                                    onClick={(e) => { e.stopPropagation(); onEditRow(row.original) }}
                                                >
                                                    <Pencil size={13} />
                                                </div>
                                            )}
                                            {onDeleteRow && (
                                                <div
                                                    className="w-7 h-7 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 flex items-center justify-center cursor-pointer hover:bg-rose-600 hover:text-white dark:hover:bg-rose-500 transition-all"
                                                    onClick={(e) => { e.stopPropagation(); onDeleteRow(row.original) }}
                                                >
                                                    <Trash2 size={13} />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3.5 mt-1">
                                        {row.getVisibleCells().filter((c) => !["select", "action"].includes(c.column.id)).map((cell) => (
                                            <div key={cell.id} className="min-w-0">
                                                <label className="block mb-0.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                                    {cell.column.id.replace(/_/g, " ")}
                                                </label>
                                                <div className="text-[13.5px] leading-tight font-bold text-slate-800 dark:text-slate-200 truncate">
                                                    {renderCell(cell)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-400 dark:text-slate-500 font-medium">No records found</div>
                    )}
                </div>
            )}

            {viewMode === "chart" && (
                <div className="flex-grow px-4 py-4 min-h-[350px]">
                    {loading || isLoading ? (
                        <div className="flex justify-center items-center h-full min-h-[300px]">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : tableData.length > 0 ? (
                        <div className="w-full h-full min-h-[300px] flex flex-col bg-white dark:bg-gray-800/20 p-5 rounded-[20px] border border-slate-100 dark:border-gray-800 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 uppercase tracking-widest">
                                {chartConfig?.title || title || "Data Overview"}
                            </h3>
                            <div className="flex-grow w-full h-[280px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={
                                        (() => {
                                            const labelKey = chartConfig?.dataLabelKey || "status"
                                            const counts: Record<string, number> = {}
                                            tableData.forEach((item: any) => {
                                                const key = item[labelKey] ? String(item[labelKey]) : "Other"
                                                counts[key] = (counts[key] || 0) + 1
                                            })
                                            return Object.entries(counts)
                                                .map(([name, count]) => ({ name, count }))
                                                .slice(0, chartConfig?.topN || 10)
                                        })()
                                    }>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-gray-850" />
                                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                        <RechartsTooltip
                                            contentStyle={{
                                                backgroundColor: "rgba(15, 23, 42, 0.9)",
                                                borderRadius: "10px",
                                                border: "none",
                                                color: "#fff",
                                                fontSize: "12px",
                                            }}
                                        />
                                        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-400 dark:text-slate-500 font-medium">No records found</div>
                    )}
                </div>
            )}

            {viewMode === "list" && (
                <div className="flex-grow overflow-y-auto max-h-[60vh] px-4 py-4 bg-slate-50/50 dark:bg-transparent">
                    {loading || isLoading ? (
                        <div className="flex flex-col gap-3">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="p-4 rounded-[20px] border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 min-h-[80px] animate-pulse" />
                            ))}
                        </div>
                    ) : table.getRowModel().rows.length > 0 ? (
                        <div className="flex flex-col gap-3">
                            {table.getRowModel().rows.map((row) => (
                                <div
                                    key={row.id}
                                    className={`bg-white dark:bg-gray-850 rounded-[20px] border border-slate-100 dark:border-gray-800/80 p-4 transition-all duration-300 flex items-start justify-between gap-3 hover:bg-slate-50 dark:hover:bg-gray-800/20 hover:-translate-y-0.5 hover:shadow-sm ${
                                        row.getIsSelected() ? "border-blue-600 dark:border-blue-500 bg-blue-50/10" : ""
                                    }`}
                                >
                                    <div className="text-xs font-extrabold text-slate-400 mt-1 opacity-70">#{getSerialNumber(row.index)}</div>
                                    <div className="flex items-start gap-3 flex-grow overflow-hidden">
                                        {showSelection && (
                                            <input
                                                type="checkbox"
                                                checked={row.getIsSelected()}
                                                onChange={(e) => row.toggleSelected(e.target.checked)}
                                                className="h-4.5 w-4.5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 cursor-pointer mt-1"
                                            />
                                        )}
                                        <div className="flex flex-col overflow-hidden flex-grow pt-0.5">
                                            <div className="grid gap-x-4 gap-y-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                                {row.getVisibleCells().filter((c) => c.column.id !== "select" && c.column.id !== "action").map((cell) => (
                                                    <span key={cell.id} className="flex flex-col min-w-0">
                                                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">
                                                            {cell.column.id.replace(/_/g, " ")}:
                                                        </span>
                                                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                                                            {renderCell(cell)}
                                                        </span>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1.5 flex-shrink-0">
                                        {onEditRow && (
                                            <div
                                                className="w-7 h-7 rounded-full bg-sky-50 text-sky-600 dark:bg-sky-950/20 dark:text-sky-400 flex items-center justify-center cursor-pointer hover:bg-sky-600 hover:text-white dark:hover:bg-sky-500 transition-all"
                                                onClick={(e) => { e.stopPropagation(); onEditRow(row.original) }}
                                            >
                                                <Pencil size={13} />
                                            </div>
                                        )}
                                        {onDeleteRow && (
                                            <div
                                                className="w-7 h-7 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 flex items-center justify-center cursor-pointer hover:bg-rose-600 hover:text-white dark:hover:bg-rose-500 transition-all"
                                                onClick={(e) => { e.stopPropagation(); onDeleteRow(row.original) }}
                                            >
                                                <Trash2 size={13} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-400 dark:text-slate-500 font-medium">No records found</div>
                    )}
                </div>
            )}

            {/* ── 4. FOOTER / PAGINATION ───────────────────────────────────────────── */}
            {showPagination && (
                <div className="flex flex-col md:flex-row justify-between items-center p-3 md:p-4 bg-white dark:bg-gray-900 border-t border-slate-200 dark:border-gray-800 rounded-b-2xl gap-3">
                    <div className="text-slate-400 dark:text-slate-500 text-sm font-medium flex items-center gap-3">
                        <div className="flex items-center gap-2 select-none">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_0_4px_rgba(16,185,129,0.1)]" />
                            Showing{" "}
                            <span className="text-slate-800 dark:text-slate-200 font-bold">{table.getRowModel().rows.length}</span>{" "}
                            of <span className="text-slate-800 dark:text-slate-200 font-bold">{totalCount}</span> records
                        </div>
                    </div>
                    <div className="flex gap-2 items-center">
                        <button
                            type="button"
                            className={paginationBtnBase}
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <ChevronLeft className="w-4 h-4 -mr-1" />
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            className={paginationBtnBase}
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-full border border-slate-200 dark:border-gray-700 px-1 py-1">
                            {visiblePages.map((i) => (
                                <button
                                    key={i}
                                    type="button"
                                    className={`border-none w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-all duration-200 cursor-pointer ${
                                        table.getState().pagination.pageIndex === i
                                            ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                                            : "bg-transparent text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200"
                                    }`}
                                    onClick={() => table.setPageIndex(i)}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <button
                            type="button"
                            className={paginationBtnBase}
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            className={paginationBtnBase}
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            <ChevronRight className="w-4 h-4" />
                            <ChevronRight className="w-4 h-4 -ml-1" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CustomDataTable