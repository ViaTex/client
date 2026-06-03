import React, { useState, useMemo, useRef, useEffect } from "react";
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
} from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { postRequest, getRequest } from "../services/api";

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
    ChevronsLeft,
    ChevronsRight,
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
    Key,
} from "lucide-react";

import WrappedDynamicChart from "../components/charts/WrappedDynamicChart";

import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
    Dropdown,
    Form,
    Button,
    Badge,
    Spinner,
    Accordion,
    OverlayTrigger,
    Tooltip,
    Modal,
} from "react-bootstrap";

import { exportToPDF, exportToExcel } from "../utils/exportUtils";
import { getToken, stripHtml, formatCellValue } from "../services/helper";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import debounce from "lodash.debounce";
import { Envelope } from "react-bootstrap-icons";
import CustomDateRangePicker from "../components/CustomDateRangePicker";
import dayjs from "dayjs";

import { filterLabels } from "../utils/helpers";

// ─── Types ────────────────────────────────────────────────────────────────────

type DeviceTier = "mobile" | "tablet" | "desktop";
type ViewMode = "table" | "board" | "list" | "chart";
type ExportMode = "selected" | "all";
type SearchFormat = "array" | "string";
type ApiMethod = "GET" | "POST";

interface ApiConfig {
    searchKey: string;
    skipKey: string;
    limitKey: string;
    sortKey: string;
}

interface ResponsePaths {
    list: string;
    total: string;
}

interface ChartConfig {
    dataLabelKey?: string;
    chartType?: string;
    title?: string;
    topN?: number;
}

interface TimeRange {
    startDate: Date;
    endDate: Date;
}

interface ColumnConfig {
    id: string;
    label: string;
    visible: boolean;
}

interface CustomDataTableProps<TData = any> {
    columns?: ColumnDef<TData>[];
    data?: TData[];
    title?: string;
    onSelectionChange?: (selected: TData[]) => void;
    onAdd?: (e: React.MouseEvent) => void;
    refreshKey?: any;
    apiUrl?: string;
    apiMethod?: ApiMethod;
    dataMapper?: (data: any[], response?: any) => TData[];
    defaultPageSize?: number;
    onValueChange?: (data: TData[]) => void;
    excludeFilters?: string[];
    initialSort?: SortingState;
    extraPayload?: Record<string, any>;
    clearSelectionTrigger?: any;
    showTimeRange?: boolean;
    timeRangeKey?: string;
    defaultTimeRange?: string | null;
    serverSidePagination?: boolean;
    apiConfig?: ApiConfig;
    responsePaths?: ResponsePaths;
    onBulkDelete?: () => void;
    isLoading?: boolean;
    showSelection?: boolean;
    showSearch?: boolean;
    showFilters?: boolean;
    showColumnVisibility?: boolean;
    showExport?: boolean;
    showFullscreen?: boolean;
    showPagination?: boolean;
    showPageSize?: boolean;
    onSync?: (() => void) | false;
    onImport?: (() => void) | false;
    enableRowActions?: boolean;
    onEditRow?: (row: TData, e?: React.MouseEvent) => void;
    onDeleteRow?: (row: TData, e?: React.MouseEvent) => void;
    showDelete?: boolean;
    onDesign?: (row: TData) => void;
    onPreview?: (row: TData) => void;
    onMail?: (row: TData) => void;
    onPayment?: (row: TData) => void;
    onFollowUp?: (row: TData, e?: React.MouseEvent) => void;
    onTransferDataRow?: (row: TData, e?: React.MouseEvent) => void;
    onTransferLicenseRow?: (row: TData, e?: React.MouseEvent) => void;
    exportMode?: ExportMode;
    onExportError?: () => void;
    enableTable?: boolean;
    enableBoard?: boolean;
    enableList?: boolean;
    enableChart?: boolean;
    chartConfig?: ChartConfig;
    showViewToggles?: boolean;
    centerToolbarContent?: React.ReactNode;
    searchFormat?: SearchFormat;
    showBackButton?: boolean;
    backRoute?: string | null;
    showTooltips?: boolean;
    timeRangeStartKey?: string;
    timeRangeEndKey?: string;
    useFlatTimeRange?: boolean;
    timeRangeFormat?: string;
    isWidget?: boolean;
    onCloneRow?: (row: TData, e?: React.MouseEvent) => void;
    customHeaderActions?: React.ReactNode;
    onPaginationChange?: (pageIndex: number, pageSize: number) => void;
}

// ─── Sortable Column Item ─────────────────────────────────────────────────────

interface SortableColumnItemProps {
    col: ColumnConfig;
    onToggle: () => void;
}

const SortableColumnItem: React.FC<SortableColumnItemProps> = ({ col, onToggle }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: col.id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 2 : 1,
        opacity: isDragging ? 0.6 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center justify-between py-2 mb-1 px-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-all duration-200 hover:translate-x-0.5 border border-transparent hover:border-slate-200"
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
            <span className="text-sm font-bold text-slate-800 flex-grow">{col.label}</span>
            {/* Premium Switch */}
            <div
                className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-300 relative ${col.visible ? "bg-[var(--nav-active)]" : "bg-slate-200"
                    }`}
            >
                <div
                    className={`w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform duration-300 ${col.visible ? "translate-x-5" : "translate-x-0"
                        }`}
                />
            </div>
        </div>
    );
};

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
}: CustomDataTableProps<TData>): React.ReactElement => {
    const navigate = useNavigate();
    const [deviceTier, setDeviceTier] = useState<DeviceTier>("desktop");

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width < 768) setDeviceTier("mobile");
            else if (width >= 768 && width < 1200) setDeviceTier("tablet");
            else setDeviceTier("desktop");
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const isMobile = deviceTier === "mobile";
    const isTablet = deviceTier === "tablet";
    const isDesktop = deviceTier === "desktop";

    // ─── Tooltip/Truncation Helpers ──────────────────────────────────────────

    const getTooltipText = (content: React.ReactNode, rawValue: any): string => {
        const strip = (str: string): string =>
            str
                .replace(/<[^>]*>/g, "")
                .replace(/&nbsp;/g, " ")
                .replace(/&amp;/g, "&")
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")
                .trim();

        if (typeof content === "string") return strip(content);
        if (typeof content === "number") return String(content);
        if (typeof rawValue === "string" && rawValue.match(/^\d{4}-\d{2}-\d{2}T/)) {
            try {
                return new Date(rawValue).toLocaleString("en-IN");
            } catch {
                return rawValue;
            }
        }
        if (rawValue instanceof Date) return rawValue.toLocaleString();
        if (Array.isArray(rawValue)) {
            return rawValue
                .map((item: any) =>
                    typeof item === "object"
                        ? item.stage_name || item.name || item.label || ""
                        : item
                )
                .join(", ");
        }
        return strip(String(rawValue ?? ""));
    };

    interface TruncatedCellProps {
        content: React.ReactNode;
        rawValue: any;
        maxLength?: number;
    }

    const TruncatedCell: React.FC<TruncatedCellProps> = ({
        content,
        rawValue,
        maxLength = isMobile ? 12 : 20,
    }) => {
        let displayValue = "";
        if (typeof content === "string") {
            displayValue = content;
        } else if (Array.isArray(rawValue)) {
            displayValue = rawValue
                .map((item: any) =>
                    typeof item === "object"
                        ? item.stage_name || item.name || item.label || ""
                        : item
                )
                .join(", ");
        } else if (typeof rawValue === "object" && rawValue !== null) {
            displayValue = rawValue.name || rawValue.label || JSON.stringify(rawValue);
        } else {
            displayValue = String(rawValue || "");
        }

        const shouldTruncate = displayValue.length > maxLength;

        if (!shouldTruncate) return <>{content}</>;

        const truncated =
            typeof content === "string"
                ? content.substring(0, maxLength) + "..."
                : content;

        const contentNode = (
            <div
                className="truncate inline-block align-middle max-w-[200px] md:max-w-none"
                style={{ cursor: showTooltips ? "pointer" : "default" }}
            >
                {truncated}
            </div>
        );

        if (!showTooltips) return contentNode;

        return (
            <OverlayTrigger
                placement="top"
                overlay={
                    <Tooltip id={`tooltip-${String(rawValue).substring(0, 5)}`}>
                        {getTooltipText(content, rawValue)}
                    </Tooltip>
                }
            >
                {contentNode}
            </OverlayTrigger>
        );
    };

    // ─── State ───────────────────────────────────────────────────────────────

    const [sorting, setSorting] = useState<SortingState>(() => {
        if (!title) return initialSort;
        try {
            const saved = JSON.parse(localStorage.getItem(`${title}-filters`) || "null");
            return saved?.sorting ?? initialSort;
        } catch { return initialSort; }
    });

    const [globalFilter, setGlobalFilter] = useState<string>(() => {
        if (!title) return "";
        try {
            const saved = JSON.parse(localStorage.getItem(`${title}-filters`) || "null");
            return saved?.globalFilter ?? "";
        } catch { return ""; }
    });

    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(() => {
        if (!title) return [];
        try {
            const saved = JSON.parse(localStorage.getItem(`${title}-filters`) || "null");
            return saved?.columnFilters ?? [];
        } catch { return []; }
    });

    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [filterSearchTerms, setFilterSearchTerms] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [pagination, setPagination] = useState<PaginationState>(() => {
        let stored: number | null = null;
        if (title) {
            try {
                stored = JSON.parse(localStorage.getItem(`${title}-pageSize`) || "null");
            } catch { }
        }
        return { pageIndex: 0, pageSize: stored || defaultPageSize };
    });

    const [tableData, setTableData] = useState<TData[]>([]);
    const [columnConfig, setColumnConfig] = useState<ColumnConfig[]>([]);
    const [setAsDefault, setSetAsDefault] = useState(false);
    const [timeRange, setTimeRange] = useState<TimeRange | null>(null);
    const [timeLabel, setTimeLabel] = useState<string>(defaultTimeRange || "All");
    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        if (enableTable) return "table";
        if (enableBoard) return "board";
        if (enableList) return "list";
        if (enableChart) return "chart";
        return "table";
    });
    const [rawFilterData, setRawFilterData] = useState<TData[]>([]);
    const [columnOrder, setColumnOrder] = useState<string[]>([]);
    const [filterSuggestions, setFilterSuggestions] = useState<Record<string, any[]>>({});
    const [initialSuggestions, setInitialSuggestions] = useState<Record<string, any[]>>({});
    const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
    const [isFetchingGlobalFilters, setIsFetchingGlobalFilters] = useState(false);
    const [hasFetchedSuggestions, setHasFetchedSuggestions] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [showColumnVisibilityModal, setShowColumnVisibilityModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);

    const tableContainerRef = useRef<HTMLDivElement>(null);

    // ─── Effects ─────────────────────────────────────────────────────────────

    useEffect(() => {
        if (!showTimeRange) return;
        if (defaultTimeRange === "Today") {
            setTimeLabel("Today");
            setTimeRange({
                startDate: dayjs().startOf("day").toDate(),
                endDate: dayjs().endOf("day").toDate(),
            });
            return;
        }
        if (!defaultTimeRange || defaultTimeRange === "All") {
            setTimeLabel("All");
            setTimeRange(null);
        }
    }, [showTimeRange, defaultTimeRange]);

    const shouldWaitForTimeRange =
        showTimeRange &&
        timeLabel !== "All" &&
        (!timeRange?.startDate || !timeRange?.endDate);

    useEffect(() => {
        if (onPaginationChange) {
            onPaginationChange(pagination.pageIndex, pagination.pageSize);
        }
    }, [pagination.pageIndex, pagination.pageSize, onPaginationChange]);

    useEffect(() => {
        if (!onSelectionChange) return;
        const selected = table.getSelectedRowModel().rows.map((r) => r.original);
        onSelectionChange(selected);
    }, [rowSelection]);

    useEffect(() => {
        if (!title) return;
        localStorage.setItem(
            `${title}-filters`,
            JSON.stringify({ globalFilter, columnFilters, sorting })
        );
    }, [globalFilter, columnFilters, sorting, title]);

    useEffect(() => {
        if (clearSelectionTrigger) setRowSelection({});
    }, [clearSelectionTrigger]);

    useEffect(() => {
        if (!columns || columns.length === 0) return;
        let saved: Record<string, { visible: boolean }> = {};
        try {
            saved = JSON.parse(localStorage.getItem(`${title}-columns`) || "{}") || {};
        } catch { }
        const visibilityMap: VisibilityState = {};
        const config: ColumnConfig[] = [];

        columns.forEach((col: any) => {
            const colId = col.accessorKey || col.id;
            const meta = col.meta || col.columnDef?.meta || {};
            const label = typeof col.header === "string" ? col.header : col.id;
            if (meta.disableColumnManager) {
                visibilityMap[colId] = false;
                return;
            }
            const isVisible = saved[colId]?.visible ?? meta.defaultVisible ?? true;
            visibilityMap[colId] = isVisible;
            config.push({ id: colId, label, visible: isVisible });
        });

        setColumnVisibility(visibilityMap);

        let savedOrder: string[] | null = null;
        try {
            savedOrder = JSON.parse(localStorage.getItem(`${title}-columnOrder`) || "null");
        } catch { }

        if (savedOrder && Array.isArray(savedOrder)) {
            const validOrder = savedOrder.filter((id) =>
                columns.some((col: any) => (col.accessorKey || col.id) === id)
            );
            const newCols = columns
                .map((col: any) => col.accessorKey || col.id)
                .filter((id: string) => !validOrder.includes(id));
            const finalOrder = [...validOrder, ...newCols];
            setColumnOrder(finalOrder);
            const orderedConfig = finalOrder
                .map((id) => config.find((c) => c.id === id))
                .filter(Boolean) as ColumnConfig[];
            setColumnConfig(orderedConfig);
        } else {
            setColumnOrder(columns.map((col: any) => col.accessorKey || col.id));
            setColumnConfig(config);
        }
    }, [columns, title]);

    useEffect(() => {
        if (!rawFilterData.length) return;
        const uniqueMap: Record<string, any[]> = {};
        finalColumns.forEach((col: any) => {
            const id = col.accessorKey || col.id;
            const isDateCol =
                id.toLowerCase().includes("date") ||
                id.toLowerCase().includes("created_at") ||
                id.toLowerCase().includes("open_date") ||
                id.toLowerCase().includes("time");
            uniqueMap[id] = [
                ...new Set(
                    rawFilterData
                        .map((item: any) => {
                            const val = item[id];
                            if (isDateCol && val && typeof val === "string" && /^\d{4}-\d{2}-\d{2}/.test(val) && dayjs(val).isValid()) {
                                return dayjs(val).format("DD-MM-YYYY");
                            }
                            return val;
                        })
                        .filter((val: any) => val !== undefined && val !== null && val !== "")
                ),
            ].slice(0, 15);
        });
        setInitialSuggestions(uniqueMap);
    }, [rawFilterData]);

    // ─── Helpers ─────────────────────────────────────────────────────────────

    const getNestedValue = (obj: any, path: string): any =>
        path.split(".").reduce((acc, part) => acc && acc[part], obj);

    // ─── Action Column ────────────────────────────────────────────────────────

    const actionColumn: ColumnDef<TData> = {
        id: "action",
        header: "Action",
        enableSorting: false,
        enableColumnFilter: false,
        cell: ({ row }) => (
            <div className="flex gap-2 justify-center">
                {onFollowUp && (
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border border-transparent transition-all duration-200 hover:-translate-y-0.5 text-cyan-500 bg-cyan-50 border-cyan-100 hover:bg-cyan-500 hover:text-white"
                        onClick={(e) => { e.stopPropagation(); onFollowUp(row.original, e); }}
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
                        <Envelope size={15} />
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
                        onClick={(e) => { e.stopPropagation(); onCloneRow(row.original, e); }}
                        title={showTooltips ? "Clone Record" : ""}
                    >
                        <Copy size={15} />
                    </div>
                )}
                {onTransferDataRow && (
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border border-transparent transition-all duration-200 hover:-translate-y-0.5 text-amber-500 bg-amber-50 border-amber-100 hover:bg-amber-500 hover:text-white"
                        onClick={(e) => { e.stopPropagation(); onTransferDataRow(row.original, e); }}
                        title={showTooltips ? "Transfer Data" : ""}
                    >
                        <ArrowRightLeft size={15} />
                    </div>
                )}
                {onDeleteRow && showDelete && (
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border border-transparent transition-all duration-200 hover:-translate-y-0.5 bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-600 hover:text-white"
                        onClick={(e) => { e.stopPropagation(); onDeleteRow(row.original, e); }}
                        title={showTooltips ? "Delete Record" : ""}
                    >
                        <Trash2 size={15} />
                    </div>
                )}
            </div>
        ),
    };

    // ─── Final Columns ────────────────────────────────────────────────────────

    const finalColumns = useMemo<ColumnDef<TData>[]>(() => {
        let cols = showSelection
            ? [...columns]
            : columns.filter((col: any) => col.id !== "select");
        if (
            enableRowActions &&
            (onEditRow || onDeleteRow || onFollowUp || onDesign || onPreview || onMail || onPayment)
        ) {
            cols = [...cols, actionColumn];
        }
        return cols;
    }, [columns, showSelection, enableRowActions, onCloneRow, onFollowUp, onDesign, onPreview, onMail, onPayment, onTransferDataRow]);

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
    });

    // ─── Payload Builder ──────────────────────────────────────────────────────

    const buildPayload = (customSearch: string | null = null): Record<string, any> => {
        let searchArray: string[] = [];
        if (customSearch !== null) {
            searchArray = [customSearch];
        } else {
            if (globalFilter) searchArray.push(globalFilter);
            const columnTerms = table.getState().columnFilters.flatMap((f) => f.value as string[]);
            searchArray = [...new Set([...searchArray, ...columnTerms])];
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
        };

        if (searchArray.length > 0) {
            payload[apiConfig.searchKey] = searchFormat === "string" ? searchArray[0] : searchArray;
        }

        if (showTimeRange && timeLabel !== "All" && timeRange?.startDate && timeRange?.endDate) {
            const start = dayjs(timeRange.startDate).format(timeRangeFormat);
            const end = dayjs(timeRange.endDate).format(timeRangeFormat);
            if (useFlatTimeRange) {
                payload[timeRangeStartKey] = start;
                payload[timeRangeEndKey] = end;
            } else {
                payload[timeRangeKey] = { [timeRangeStartKey]: start, [timeRangeEndKey]: end };
            }
        }

        return payload;
    };

    // ─── Data Fetching ────────────────────────────────────────────────────────

    const fetchData = async () => {
        if (!apiUrl) return;
        if (shouldWaitForTimeRange) return;
        setLoading(true);
        try {
            const token = getToken();
            const payload = buildPayload();
            let response: any;

            if (apiMethod.toUpperCase() === "GET") {
                const queryParams = new URLSearchParams();
                if (serverSidePagination) {
                    Object.entries(payload).forEach(([key, value]) => {
                        queryParams.append(key, typeof value === "object" ? JSON.stringify(value) : String(value));
                    });
                }
                const finalUrl = queryParams.toString() ? `${apiUrl}?${queryParams.toString()}` : apiUrl;
                response = await getRequest(finalUrl, token);
            } else {
                response = await postRequest(apiUrl, payload, "json", token);
            }

            const rawList = getNestedValue(response, responsePaths.list) || [];
            const total = getNestedValue(response, responsePaths.total) || rawList.length;
            const processedData = dataMapper(rawList, response.data);
            setTableData(processedData);
            setTotalCount(serverSidePagination ? total : rawList.length);
            onValueChange?.(processedData);
        } catch (error) {
            console.error("Table API error detail:", error);
            setTableData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (serverSidePagination && !shouldWaitForTimeRange) fetchData();
    }, [globalFilter, pagination.pageIndex, pagination.pageSize, sorting, apiUrl, refreshKey, columnFilters, timeRange, timeLabel, shouldWaitForTimeRange, JSON.stringify(extraPayload)]);

    useEffect(() => {
        if (!serverSidePagination && !shouldWaitForTimeRange) fetchData();
    }, [apiUrl, refreshKey, JSON.stringify(extraPayload), timeRange, timeLabel, shouldWaitForTimeRange]);

    useEffect(() => {
        if (!apiUrl && data) {
            const processedData = dataMapper(data);
            setTableData(processedData);
            setTotalCount(processedData.length);
        }
    }, [data, apiUrl]);

    const fetchFilterSuggestions = useMemo(
        () =>
            debounce(async (columnId: string, searchTerm: string) => {
                if (!searchTerm || searchTerm.length < 1) {
                    setFilterSuggestions((prev) => ({ ...prev, [columnId]: [] }));
                    return;
                }
                setIsFetchingSuggestions(true);
                try {
                    const token = getToken();
                    let response: any;
                    if (apiMethod.toUpperCase() === "GET") {
                        const query = new URLSearchParams({ [apiConfig.searchKey]: JSON.stringify([searchTerm]) }).toString();
                        response = await getRequest(`${apiUrl}?${query}`, token);
                    } else {
                        const payload = buildPayload(searchTerm);
                        response = await postRequest(apiUrl!, payload, "json", token);
                    }
                    const raw = getNestedValue(response, responsePaths.list) || [];
                    const processed = dataMapper(raw, response.data);
                    const isDateCol = columnId.toLowerCase().includes("date") || columnId.toLowerCase().includes("created_at") || columnId.toLowerCase().includes("time");
                    const uniqueValues = [...new Set(
                        processed.map((item: any) => {
                            const val = item[columnId];
                            if (isDateCol && val && typeof val === "string" && /^\d{4}-\d{2}-\d{2}/.test(val) && dayjs(val).isValid()) {
                                return dayjs(val).format("DD-MM-YYYY");
                            }
                            return val;
                        }).filter(Boolean)
                    )];
                    setFilterSuggestions((prev) => ({ ...prev, [columnId]: uniqueValues }));
                } catch (error) {
                    console.error(error);
                } finally {
                    setIsFetchingSuggestions(false);
                }
            }, 500),
        [apiUrl, dataMapper, apiMethod]
    );

    const fetchGlobalFilters = async () => {
        if (!apiUrl || !serverSidePagination || hasFetchedSuggestions) return;
        setIsFetchingGlobalFilters(true);
        try {
            const token = getToken();
            const payload: Record<string, any> = {
                ...extraPayload,
                [apiConfig.skipKey]: 0,
                [apiConfig.limitKey]: 5,
            };
            if (searchFormat === "string") payload[apiConfig.searchKey] = "";
            const response = apiMethod === "GET"
                ? await getRequest(apiUrl!, token)
                : await postRequest(apiUrl!, payload, "json", token);
            const raw = getNestedValue(response, responsePaths.list) || [];
            const processed = typeof dataMapper === "function" ? dataMapper(raw, response.data) : raw;
            setRawFilterData(processed);
            setHasFetchedSuggestions(true);
        } catch (e) {
            console.error("Filter Suggestion Fetch Error:", e);
        } finally {
            setIsFetchingGlobalFilters(false);
        }
    };

    // ─── Export ───────────────────────────────────────────────────────────────

    const handleExport = async (type: "excel" | "pdf") => {
        let rowsToExport: any[] = [];
        if (exportMode === "selected" && showSelection) {
            const selectedRows = table.getSelectedRowModel().rows;
            if (!selectedRows.length) {
                onExportError?.() || toast.error("Please select rows to export");
                return;
            }
            rowsToExport = selectedRows;
        } else {
            if (!serverSidePagination) {
                rowsToExport = table.getFilteredRowModel().rows;
            } else {
                try {
                    const token = getToken();
                    const payload: Record<string, any> = {
                        ...extraPayload,
                        [apiConfig.searchKey]: globalFilter ? [globalFilter] : [],
                        [apiConfig.skipKey]: 0,
                        [apiConfig.limitKey]: totalCount,
                        [apiConfig.sortKey]: sorting.length
                            ? { field: sorting[0].id, direction: sorting[0].desc ? "desc" : "asc" }
                            : { field: "_id", direction: "desc" },
                    };
                    if (showTimeRange && timeLabel !== "All" && timeRange?.startDate && timeRange?.endDate) {
                        payload[timeRangeKey] = {
                            start_time: dayjs(timeRange.startDate).toISOString(),
                            end_time: dayjs(timeRange.endDate).toISOString(),
                        };
                    }
                    const response = apiMethod === "GET"
                        ? await getRequest(apiUrl!, token)
                        : await postRequest(apiUrl!, payload, "json", token);
                    const raw = getNestedValue(response, responsePaths.list) || [];
                    rowsToExport = raw.map((item: any) => ({
                        original: item,
                        getValue: (key: string) => item[key],
                    }));
                } catch {
                    toast.error("Failed to export all data");
                    return;
                }
            }
        }

        const exportCols = table
            .getAllLeafColumns()
            .filter((col) => col.getIsVisible() && col.id !== "select" && col.id !== "action")
            .map((col) => ({
                title: typeof col.columnDef.header === "string" ? col.columnDef.header : col.id,
                data: col.id,
            }));

        const exportData = rowsToExport.map((row: any) => {
            const item: Record<string, string> = {};
            exportCols.forEach((col) => {
                item[col.data] = stripHtml(String(row.getValue(col.data)));
            });
            return item;
        });

        if (type === "excel") {
            exportToExcel({ data: exportData, columns: exportCols, sheetName: title || "Export" });
        } else {
            exportToPDF({ data: exportData, columns: exportCols, title: title || "Export" });
        }
    };

    // ─── Misc Handlers ────────────────────────────────────────────────────────

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setColumnConfig((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                const newItems = arrayMove(items, oldIndex, newIndex);
                setColumnOrder(newItems.map((item) => item.id));
                return newItems;
            });
        }
    };

    const handleResetAllFilters = () => {
        setGlobalFilter("");
        setColumnFilters([]);
        table.resetColumnFilters();
        setFilterSearchTerms({});
        setFilterSuggestions({});
        if (title) localStorage.removeItem(`${title}-filters`);
    };

    const toggleFilterValue = (columnId: string, value: any) => {
        const column = table.getColumn(columnId);
        if (!column) return;
        const currentFilters = Array.isArray(column.getFilterValue()) ? (column.getFilterValue() as any[]) : [];
        const newFilters = currentFilters.includes(value)
            ? currentFilters.filter((v) => v !== value)
            : [...currentFilters, value];
        column.setFilterValue(newFilters.length ? newFilters : undefined);
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    };

    const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSize = Number(e.target.value);
        setPagination((prev) => ({ ...prev, pageSize: newSize, pageIndex: 0 }));
        if (title) localStorage.setItem(`${title}-pageSize`, JSON.stringify(newSize));
    };

    const handleSaveColumns = () => {
        const configMap: Record<string, { visible: boolean }> = {};
        columnConfig.forEach((col) => {
            configMap[col.id] = { visible: col.visible };
            table.getColumn(col.id)?.toggleVisibility(col.visible);
        });
        if (setAsDefault) {
            localStorage.setItem(`${title}-columns`, JSON.stringify(configMap));
            localStorage.setItem(`${title}-columnOrder`, JSON.stringify(columnOrder));
        }
        toast.success(setAsDefault ? "Column defaults saved" : "Column visibility updated");
    };

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullScreen(true);
        } else {
            document.exitFullscreen();
            setIsFullScreen(false);
        }
    };

    const getSerialNumber = (rowIndex: number): number => {
        const { pageIndex, pageSize } = table.getState().pagination;
        return pageIndex * pageSize + rowIndex + 1;
    };

    const activeFilterCount = table.getState().columnFilters.length + (globalFilter ? 1 : 0);
    const selectedCount = Object.keys(rowSelection).length;

    const totalPagesForButtons = table.getPageCount();
    const currentPageForButtons = table.getState().pagination.pageIndex;
    const maxButtons = 5;
    let startPage = Math.max(0, currentPageForButtons - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPagesForButtons, startPage + maxButtons);
    if (endPage - startPage < maxButtons) startPage = Math.max(0, endPage - maxButtons);
    const visiblePages = Array.from({ length: Math.max(0, endPage - startPage) }, (_, i) => startPage + i);

    // ─── Render: Filter Menu Content ──────────────────────────────────────────

    const renderFilterMenuContent = () => (
        <div className="bg-white rounded-[20px] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-gray-50 px-5 py-[18px] border-b border-gray-100 flex justify-between items-center">
                <span className="font-bold text-xs text-slate-500 uppercase tracking-widest">Filter Records</span>
                <button
                    className="text-red-500 text-xs font-bold bg-transparent border-none p-0 cursor-pointer hover:text-red-700 transition-colors"
                    onClick={handleResetAllFilters}
                >
                    Reset All
                </button>
            </div>

            {isFetchingGlobalFilters ? (
                <div className="p-5 flex flex-col items-center justify-center" style={{ minHeight: "200px" }}>
                    <Spinner animation="border" variant="primary" size="sm" />
                    <span className="mt-3 text-xs text-slate-400 font-bold">Loading Filters...</span>
                </div>
            ) : (
                <div
                    className="overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--nav-active)] scrollbar-track-transparent"
                    style={{ maxHeight: isDesktop ? "400px" : "60vh" }}
                >
                    <Accordion flush className="filter-accordion">
                        {table.getHeaderGroups().length > 0 &&
                            table.getHeaderGroups()[0].headers.map((header) => {
                                const columnId = header.column.id;
                                const columnHeader = typeof header.column.columnDef.header === "string" ? header.column.columnDef.header : "";
                                const meta = (header.column.columnDef as any).meta || {};
                                if (meta.disableFilter || !header.column.getCanFilter() || columnId === "select" || columnId === "action" || excludeFilters.includes(columnId) || excludeFilters.includes(columnHeader)) return null;

                                const searchTerm = filterSearchTerms[header.id] || "";
                                const currentValues = (header.column.getFilterValue() as any[]) || [];
                                const options = searchTerm.trim() === "" ? initialSuggestions[header.id] || [] : filterSuggestions[header.id] || [];
                                const isDateCol = header.id.toLowerCase().includes("date") || header.id.toLowerCase().includes("created_at") || header.id.toLowerCase().includes("time");

                                const formatVal = (v: any) => {
                                    if (isDateCol && v && typeof v === "string" && /^\d{4}-\d{2}-\d{2}/.test(v) && dayjs(v).isValid()) {
                                        return dayjs(v).format("DD-MM-YYYY");
                                    }
                                    return v;
                                };

                                const processedCurrent = currentValues.map(formatVal);
                                const processedOptions = options.map(formatVal);
                                const displaySuggestions = [...new Set([...processedCurrent, ...processedOptions])];

                                return (
                                    <Accordion.Item eventKey={header.id} key={header.id} className="border-none mb-1">
                                        <Accordion.Header>
                                            <div className="flex justify-between w-full pe-3 items-center">
                                                <span className="uppercase font-bold text-slate-500 text-[11px]">
                                                    {header.id.replace(/_/g, " ")}
                                                </span>
                                                {currentValues.length > 0 && (
                                                    <span className="bg-blue-600 text-white rounded-full px-2 text-[10px] font-bold ml-2">
                                                        {currentValues.length}
                                                    </span>
                                                )}
                                            </div>
                                        </Accordion.Header>
                                        <Accordion.Body className="p-0 pb-2">
                                            <div className="mx-2 my-2 px-3 py-2 bg-gray-50 rounded-2xl flex items-center border border-slate-200">
                                                <Search size={14} className="text-blue-600 mr-2 flex-shrink-0" />
                                                <input
                                                    placeholder="Search..."
                                                    className="border-0 shadow-none bg-transparent p-0 text-[13px] outline-none flex-grow"
                                                    value={searchTerm}
                                                    onChange={(e) => {
                                                        setFilterSearchTerms((prev) => ({ ...prev, [header.id]: e.target.value }));
                                                        if (e.target.value.trim() !== "") fetchFilterSuggestions(header.id, e.target.value);
                                                    }}
                                                />
                                                {isFetchingSuggestions && <Spinner animation="border" size="sm" style={{ width: "12px", height: "12px" }} />}
                                            </div>

                                            {/* Tree view */}
                                            <div className="relative mt-1 max-h-[200px] overflow-y-auto pl-0" style={{ overflow: "auto" }}>
                                                {/* trunk */}
                                                <div className="absolute left-[14px] top-[-10px] bottom-[14px] w-[1.5px] bg-[var(--nav-active)] rounded opacity-60 z-[1]" />
                                                {displaySuggestions.map((val, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="relative pl-8 min-h-[38px] flex items-center justify-between px-3 rounded-lg cursor-pointer hover:bg-slate-50 hover:translate-x-0.5 transition-all duration-200"
                                                        onClick={() => toggleFilterValue(header.id, val)}
                                                    >
                                                        {/* connector */}
                                                        <div className="absolute left-[14px] top-[-12px] w-[20px] h-[32px] border-l-[1.5px] border-b-[1.5px] border-[var(--nav-active)] rounded-bl-xl opacity-60 z-[1]" />
                                                        <span className="text-sm text-slate-800 font-medium pl-1">
                                                            {(() => {
                                                                if (isDateCol && val && typeof val === "string" && /^\d{4}-\d{2}-\d{2}/.test(val) && dayjs(val).isValid()) {
                                                                    return dayjs(val).format("DD-MM-YYYY");
                                                                }
                                                                return stripHtml(String(val));
                                                            })()}
                                                        </span>
                                                        <div className={`w-5 h-5 rounded-md border-2 transition-colors duration-200 relative flex items-center justify-center flex-shrink-0 ${currentValues.includes(val) ? "bg-[var(--nav-active)] border-[var(--nav-active)]" : "border-slate-300"}`}>
                                                            {currentValues.includes(val) && (
                                                                <div className="w-[10px] h-[5px] border-l-2 border-b-2 border-white -rotate-45 mb-0.5" />
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                );
                            })}
                    </Accordion>
                </div>
            )}

            {!isDesktop && (
                <div className="p-3 border-t flex gap-2 justify-end bg-gray-50">
                    <button
                        className="px-4 py-1.5 rounded-full border border-slate-300 text-sm font-bold text-slate-600 bg-white hover:bg-gray-50 transition-colors"
                        onClick={() => setShowFilterModal(false)}
                    >
                        Close
                    </button>
                    <button
                        className="px-4 py-1.5 rounded-full text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5"
                        style={{ background: "var(--nav-active)", border: "none" }}
                        onClick={() => setShowFilterModal(false)}
                    >
                        Apply Filters
                    </button>
                </div>
            )}
        </div>
    );

    // ─── Render: Column Visibility Content ───────────────────────────────────

    const renderColumnVisibilityContent = () => (
        <div className="bg-white rounded-[20px] overflow-hidden shadow-2xl">
            <div className="bg-gray-50 px-5 py-[18px] border-b border-gray-100 flex justify-between items-center">
                <span className="font-bold text-xs text-slate-500 uppercase">Columns</span>
            </div>
            <div className="p-3">
                <div
                    className="overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--nav-active)] pr-1"
                    style={{ maxHeight: isDesktop ? "180px" : "50vh" }}
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
                <div className="mt-3 pt-3 border-t">
                    <div
                        className="flex items-center gap-2 mb-3 cursor-pointer"
                        onClick={() => setSetAsDefault(!setAsDefault)}
                    >
                        <div className={`w-5 h-5 rounded-md border-2 transition-colors flex items-center justify-center ${setAsDefault ? "bg-[var(--nav-active)] border-[var(--nav-active)]" : "border-slate-300"}`}>
                            {setAsDefault && <div className="w-[10px] h-[5px] border-l-2 border-b-2 border-white -rotate-45 mb-0.5" />}
                        </div>
                        <span className="text-sm text-slate-500 font-bold">Set as default view</span>
                    </div>
                    <button
                        className="w-full rounded-full py-2 font-bold text-white text-sm transition-all duration-200 hover:-translate-y-0.5 shadow-md hover:shadow-blue-300/40"
                        style={{ background: "linear-gradient(135deg, var(--nav-active) 0%, #003a8a 100%)", border: "none" }}
                        onClick={() => {
                            handleSaveColumns();
                            if (!isDesktop) setShowColumnVisibilityModal(false);
                        }}
                    >
                        Save Preferences
                    </button>
                </div>
            </div>
        </div>
    );

    // ─── Render: Export Content ───────────────────────────────────────────────

    const renderExportContent = () => (
        <div className="bg-white rounded-[20px] overflow-hidden shadow-2xl">
            <div className="bg-gray-50 px-5 py-[18px] border-b border-gray-100">
                <span className="font-bold text-xs text-slate-500 uppercase">Download</span>
            </div>
            <div className="p-2">
                <button
                    onClick={() => { handleExport("excel"); if (!isDesktop) setShowExportModal(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 text-left bg-white hover:bg-slate-50 transition-colors"
                >
                    <div className="w-11 h-11 rounded-[14px] bg-emerald-50 flex items-center justify-center flex-shrink-0">
                        <FileSpreadsheet size={18} className="text-emerald-600" />
                    </div>
                    <div>
                        <div className="font-bold text-sm text-slate-800">Excel Sheet</div>
                        <div className="text-[10px] text-slate-400">Spreadsheet (.xlsx)</div>
                    </div>
                </button>
                <button
                    onClick={() => { handleExport("pdf"); if (!isDesktop) setShowExportModal(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left bg-white hover:bg-slate-50 transition-colors"
                >
                    <div className="w-11 h-11 rounded-[14px] bg-rose-50 flex items-center justify-center flex-shrink-0">
                        <FileText size={18} className="text-rose-600" />
                    </div>
                    <div>
                        <div className="font-bold text-sm text-slate-800">PDF File</div>
                        <div className="text-[10px] text-slate-400">Document (.pdf)</div>
                    </div>
                </button>
            </div>
            {!isDesktop && (
                <div className="p-3 border-t flex gap-2 justify-end bg-gray-50">
                    <button
                        className="px-4 py-1.5 rounded-full border border-slate-300 text-sm font-bold text-slate-600 bg-white"
                        onClick={() => setShowExportModal(false)}
                    >
                        Close
                    </button>
                </div>
            )}
        </div>
    );

    // ─── Action Icon Circle shared styles ────────────────────────────────────

    const actionIconBase =
        "w-[42px] h-[42px] bg-white rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 text-slate-500 border border-slate-200 shadow-sm hover:border-[var(--nav-active)] hover:text-[var(--nav-active)] hover:-translate-y-0.5 hover:shadow-[0_8px_16px_rgba(0,74,173,0.1)] flex-shrink-0";

    const paginationBtnBase =
        "w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white transition-all duration-200 text-slate-500 hover:border-[var(--nav-active)] hover:text-[var(--nav-active)] hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed";

    // ─── Render cell helper ───────────────────────────────────────────────────

    const renderCell = (cell: any) => {
        const isEmail = cell.column.id.toLowerCase() === "email";
        const cellContent = cell.column.columnDef.cell
            ? flexRender(cell.column.columnDef.cell, cell.getContext())
            : formatCellValue(cell.column.id, cell.getValue());

        if (isEmail) {
            return (
                <a href={`mailto:${cell.getValue()}`} className="lowercase text-[var(--nav-active)] underline transition-colors">
                    <TruncatedCell content={cellContent} rawValue={cell.getValue()} maxLength={20} />
                </a>
            );
        }
        return <TruncatedCell content={cellContent} rawValue={cell.getValue()} maxLength={20} />;
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════════════════

    return (
        <div
            ref={tableContainerRef}
            className={`bg-white flex flex-col h-full rounded-t-2xl shadow-[0_12px_40px_rgba(0,0,0,0.04),0_2px_8px_rgba(0,0,0,0.02)] border border-[#eef0f5] transition-all duration-300
        ${isFullScreen ? "fixed top-0 left-0 w-screen h-screen z-[1040] overflow-auto" : ""}
        ${isWidget ? "shadow-none border-none bg-transparent" : ""}
      `}
        >
            {/* ── 1. TOP HEADER ───────────────────────────────────────────────────── */}
            <div
                className={`flex flex-col md:flex-row justify-between items-start md:items-center py-3 px-4 border-b sticky top-0 rounded-t-2xl gap-3 z-10
          bg-white/80 backdrop-blur-[12px] backdrop-saturate-[180%]
          ${isFullScreen ? "bg-white!" : ""}
        `}
            >
                {/* Title */}
                <div
                    className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 group"
                    onClick={showBackButton ? () => (backRoute ? navigate(backRoute) : navigate(-1)) : undefined}
                    style={{ cursor: showBackButton ? "pointer" : "default" }}
                >
                    {showBackButton && (
                        <div className="w-1.5 h-[30px] rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-[400ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)] overflow-hidden shadow-[0_0_10px_rgba(0,74,173,0.4),0_0_20px_rgba(0,74,173,0.2)] group-hover:w-9 group-hover:h-9 group-hover:rounded-xl group-hover:shadow-[0_0_25px_rgba(0,74,173,0.6)]"
                            style={{ background: "linear-gradient(180deg, var(--nav-active) 0%, #4067ff 100%)" }}>
                            <ChevronLeft size={16} strokeWidth={3} className="text-white opacity-0 scale-50 -rotate-90 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100 group-hover:rotate-0" />
                        </div>
                    )}
                    {title && (
                        <h1 className="text-lg mb-0 font-bold text-slate-900 flex items-center gap-2">
                            {title}
                            {activeFilterCount > 0 && (
                                <span className="text-blue-600 border border-blue-200 bg-blue-50 rounded-full py-0.5 px-2 font-medium text-[11px]">
                                    {activeFilterCount} Active
                                </span>
                            )}
                        </h1>
                    )}
                </div>

                {/* Actions Row */}
                <div className={`flex items-center gap-2 flex-wrap justify-start md:justify-end w-full
          max-md:flex-nowrap max-md:overflow-x-auto max-md:pb-3 max-md:scrollbar-thin max-md:scrollbar-thumb-[var(--nav-active)] max-md:scrollbar-track-transparent max-md:[&>*]:flex-shrink-0`}>

                    {/* Date Range */}
                    {showTimeRange && (
                        <CustomDateRangePicker
                            triggerClassName="min-w-[42px] h-[42px] px-3 bg-white rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 text-blue-600 font-bold border border-slate-200 shadow-sm hover:border-[var(--nav-active)] hover:-translate-y-0.5 flex-shrink-0 whitespace-nowrap"
                            onApply={(payload: any, label: string) => {
                                const { selection } = payload;
                                setTimeLabel(label);
                                if (label === "All") { setTimeRange(null); return; }
                                setTimeRange({
                                    startDate: dayjs(selection.startDate).startOf("day").toDate(),
                                    endDate: dayjs(selection.endDate).endOf("day").toDate(),
                                });
                                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                            }}
                            selectedFilter={timeLabel}
                            defaultLabel={defaultTimeRange || "All"}
                            container={tableContainerRef.current}
                        />
                    )}

                    {/* Bulk Delete */}
                    {onBulkDelete && (
                        <div
                            className={`relative w-[42px] h-[42px] rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0
                ${selectedCount > 0 ? "bg-red-500 border-red-500 text-white shadow-sm cursor-pointer" : "bg-gray-100 text-slate-400 opacity-40 cursor-not-allowed"}`}
                            onClick={selectedCount > 0 ? onBulkDelete : undefined}
                            title={showTooltips ? "Delete Selected" : ""}
                        >
                            <Trash2 size={18} />
                            {selectedCount > 0 && (
                                <span className="absolute -top-1 left-full -translate-x-1/2 bg-slate-900 text-white border-2 border-white rounded-full text-[9px] px-1 font-bold">
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
                            <RotateCw size={18} className={isLoading ? "animate-spin" : ""} />
                        </div>
                    )}

                    {/* Import */}
                    {onImport && (
                        <div className={actionIconBase} onClick={onImport as () => void} title={showTooltips ? "Import Excel" : ""}>
                            <FileUp size={18} />
                        </div>
                    )}

                    {/* Filters – Desktop: Dropdown */}
                    {showFilters && isDesktop && (
                        <Dropdown autoClose="outside" className="relative" onToggle={(open) => { if (open) fetchGlobalFilters(); }}>
                            <Dropdown.Toggle as="div" className={`${actionIconBase} relative`} title={showTooltips ? "Filter Records" : ""}>
                                <SlidersHorizontal size={18} />
                                {activeFilterCount > 0 && (
                                    <span className="absolute -top-0.5 left-full -translate-x-1/2 bg-blue-600 text-white border-2 border-white rounded-full text-[9px] min-w-[18px] h-[18px] flex items-center justify-center px-1 font-bold shadow-sm z-[2]">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="p-0 border-0 rounded-[20px] shadow-2xl mt-3" align="end" style={{ minWidth: "340px", zIndex: 2050 }}>
                                {renderFilterMenuContent()}
                            </Dropdown.Menu>
                        </Dropdown>
                    )}

                    {/* Filters – Mobile: Modal */}
                    {showFilters && !isDesktop && (
                        <>
                            <div
                                className={`${actionIconBase} relative`}
                                onClick={() => { setShowFilterModal(true); fetchGlobalFilters(); }}
                            >
                                <SlidersHorizontal size={18} />
                                {activeFilterCount > 0 && (
                                    <span className="absolute -top-0.5 left-full -translate-x-1/2 bg-blue-600 text-white border-2 border-white rounded-full text-[9px] min-w-[18px] h-[18px] flex items-center justify-center px-1 font-bold z-[2]">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </div>
                            <Modal show={showFilterModal} onHide={() => setShowFilterModal(false)} centered container={tableContainerRef.current} contentClassName="border-0 rounded-2xl overflow-hidden">
                                <Modal.Header closeButton className="border-0 bg-white">
                                    <Modal.Title className="text-sm font-bold text-slate-500">Advanced Filters</Modal.Title>
                                </Modal.Header>
                                <Modal.Body className="p-0">{renderFilterMenuContent()}</Modal.Body>
                            </Modal>
                        </>
                    )}

                    {/* Column Visibility – Desktop */}
                    {showColumnVisibility && isDesktop && (
                        <Dropdown autoClose="outside" className="relative">
                            <Dropdown.Toggle as="div" className={actionIconBase} title={showTooltips ? "Manage Columns" : ""}>
                                <Eye size={18} />
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="p-0 border-0 rounded-[20px] shadow-2xl mt-3" align="end" style={{ minWidth: "300px", zIndex: 2050 }}>
                                {renderColumnVisibilityContent()}
                            </Dropdown.Menu>
                        </Dropdown>
                    )}

                    {/* Column Visibility – Mobile */}
                    {showColumnVisibility && !isDesktop && (
                        <>
                            <div className={actionIconBase} onClick={() => setShowColumnVisibilityModal(true)}>
                                <Eye size={18} />
                            </div>
                            <Modal show={showColumnVisibilityModal} onHide={() => setShowColumnVisibilityModal(false)} centered container={tableContainerRef.current} contentClassName="border-0 rounded-2xl overflow-hidden">
                                <Modal.Header closeButton className="border-0 bg-white">
                                    <Modal.Title className="text-sm font-bold text-slate-500">Column Visibility</Modal.Title>
                                </Modal.Header>
                                <Modal.Body className="p-0">{renderColumnVisibilityContent()}</Modal.Body>
                            </Modal>
                        </>
                    )}

                    {/* Export – Desktop */}
                    {showExport && isDesktop && (
                        <Dropdown className="relative">
                            <Dropdown.Toggle as="div" className={actionIconBase} title={showTooltips ? "Export Data" : ""}>
                                <FileDown size={18} />
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="p-0 border-0 rounded-[20px] shadow-2xl mt-3 md:mr-10" align="end" style={{ minWidth: "280px", zIndex: 2050 }}>
                                {renderExportContent()}
                            </Dropdown.Menu>
                        </Dropdown>
                    )}

                    {/* Export – Mobile */}
                    {showExport && !isDesktop && (
                        <>
                            <div className={actionIconBase} onClick={() => setShowExportModal(true)}>
                                <FileDown size={18} />
                            </div>
                            <Modal show={showExportModal} onHide={() => setShowExportModal(false)} centered container={tableContainerRef.current} contentClassName="border-0 rounded-2xl overflow-hidden">
                                <Modal.Header closeButton className="border-0 bg-white">
                                    <Modal.Title className="text-sm font-bold text-slate-500">Export Options</Modal.Title>
                                </Modal.Header>
                                <Modal.Body className="p-0">{renderExportContent()}</Modal.Body>
                            </Modal>
                        </>
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
                            className="w-[42px] h-[42px] rounded-full flex items-center justify-center text-white border-none shadow-[0_4px_12px_rgba(0,74,173,0.2)] transition-all duration-300 hover:scale-105 hover:rotate-90 hover:shadow-[0_8px_24px_rgba(0,74,173,0.3)] flex-shrink-0 ml-1"
                            style={{ background: "var(--nav-active)" }}
                            onClick={(e) => onAdd!(e)}
                        >
                            {isLoading ? <Spinner animation="border" size="sm" /> : <Plus size={24} />}
                        </button>
                    )}
                </div>
            </div>

            {/* ── 2. TOOLBAR ────────────────────────────────────────────────────────── */}
            {(showPageSize || showViewToggles || centerToolbarContent || showSearch) && (
                <div className="flex flex-col lg:flex-row items-center justify-between px-3 md:px-4 py-3 bg-white border-b gap-3">
                    {/* Rows Per Page */}
                    {showPageSize && !isWidget && (
                        <div className="flex items-center gap-2 flex-grow justify-center md:justify-start w-full">
                            <span className="text-sm text-slate-400 font-bold whitespace-nowrap">Rows Per Page:</span>
                            <select
                                className="rounded-lg border border-slate-200 text-sm py-1 px-2 bg-white text-slate-700 outline-none focus:border-blue-500"
                                style={{ width: "100px" }}
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
                        <div className="flex justify-center items-center gap-2 flex-wrap">
                            {showViewToggles && (
                                <div className="bg-gray-100 rounded-full p-1 border border-slate-200 flex shadow-sm">
                                    {enableTable && (
                                        <button
                                            className={`border-none px-4 py-1.5 rounded-full flex items-center transition-all duration-200 text-slate-500 cursor-pointer text-sm font-bold
                        ${viewMode === "table" ? "bg-white text-[var(--nav-active)] shadow-[0_4px_12px_rgba(0,74,173,0.1)]" : ""}`}
                                            onClick={() => setViewMode("table")}
                                        >
                                            <List size={16} /><span className="ml-2">Table</span>
                                        </button>
                                    )}
                                    {enableBoard && (
                                        <button
                                            className={`border-none px-4 py-1.5 rounded-full flex items-center transition-all duration-200 text-slate-500 cursor-pointer text-sm font-bold
                        ${viewMode === "board" ? "bg-white text-[var(--nav-active)] shadow-[0_4px_12px_rgba(0,74,173,0.1)]" : ""}`}
                                            onClick={() => setViewMode("board")}
                                        >
                                            <LayoutGrid size={16} /><span className="ml-2">Board</span>
                                        </button>
                                    )}
                                    {enableList && (
                                        <button
                                            className={`border-none px-4 py-1.5 rounded-full flex items-center transition-all duration-200 text-slate-500 cursor-pointer text-sm font-bold
                        ${viewMode === "list" ? "bg-white text-[var(--nav-active)] shadow-[0_4px_12px_rgba(0,74,173,0.1)]" : ""}`}
                                            onClick={() => setViewMode("list")}
                                        >
                                            <AlignJustify size={16} /><span className="ml-2">List</span>
                                        </button>
                                    )}
                                    {enableChart && (
                                        <button
                                            className={`border-none px-4 py-1.5 rounded-full flex items-center transition-all duration-200 text-slate-500 cursor-pointer text-sm font-bold
                        ${viewMode === "chart" ? "bg-white text-[var(--nav-active)] shadow-[0_4px_12px_rgba(0,74,173,0.1)]" : ""}`}
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
                        <div className="flex justify-center lg:justify-end flex-grow w-full">
                            <div className="relative w-full max-w-xs">
                                <input
                                    value={globalFilter ?? ""}
                                    onChange={(e) => setGlobalFilter(e.target.value)}
                                    placeholder="Search across records..."
                                    className="w-full pl-5 border-0 rounded-full shadow-sm py-2 bg-gray-100 text-[13.5px] outline-none focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-[var(--nav-active)] transition-all"
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── 3. DATA VIEW ─────────────────────────────────────────────────────── */}

            {viewMode === "table" && (
                <div className="overflow-x-auto px-2 md:px-4 py-3 md:py-4 flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--nav-active)]">
                    <table className="w-full table-auto border-collapse align-middle">
                        <thead>
                            {table.getHeaderGroups().length > 0 ? (
                                table.getHeaderGroups().map((hg) => (
                                    <tr key={hg.id}>
                                        <th className="bg-slate-50 py-3 px-4 uppercase border-b-0 text-[12px] font-semibold tracking-wide text-slate-500 w-[60px]">
                                            SL.
                                        </th>
                                        {hg.headers.map((header) => (
                                            <th
                                                key={header.id}
                                                className={`bg-slate-50 py-3 px-4 uppercase text-slate-500 border-b-0 text-[12px] font-semibold tracking-wide
                          ${header.id === "action" ? "sticky right-[-10px] z-[1] w-[150px] min-w-[150px] text-center shadow-[-4px_0_10px_rgba(0,0,0,0.05)]" : ""}`}
                                            >
                                                <div
                                                    className={header.column.getCanSort() ? "cursor-pointer flex items-center gap-2 hover:text-[var(--nav-active)] transition-colors" : ""}
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
                            ) : (loading || isLoading) ? (
                                <tr>
                                    {[...Array(5)].map((_, i) => (
                                        <th key={i} className="bg-slate-50 py-3 px-4">
                                            <div className="h-3 bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite_linear] rounded w-3/5" />
                                        </th>
                                    ))}
                                </tr>
                            ) : null}
                        </thead>
                        <tbody>
                            {loading || isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="transition-colors duration-200">
                                        <td className="py-4 px-4 text-center">
                                            <div className="h-3 bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite_linear] rounded w-10 mx-auto" />
                                        </td>
                                        {table.getVisibleFlatColumns().length > 0
                                            ? table.getVisibleFlatColumns().map((col) => (
                                                <td key={col.id} className="py-4 px-4">
                                                    {col.id === "action" ? (
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite_linear] mx-auto" />
                                                    ) : (
                                                        <div className="h-3 bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite_linear] rounded w-4/5" />
                                                    )}
                                                </td>
                                            ))
                                            : [...Array(5)].map((_, j) => (
                                                <td key={j} className="py-4 px-4">
                                                    <div className="h-3 bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite_linear] rounded w-4/5" />
                                                </td>
                                            ))}
                                    </tr>
                                ))
                            ) : table.getRowModel().rows.length > 0 ? (
                                table.getRowModel().rows.map((row) => (
                                    <tr
                                        key={row.id}
                                        className={`transition-colors duration-200 hover:bg-slate-50 ${row.getIsSelected() ? "bg-blue-50!" : ""}`}
                                    >
                                        <td className="px-4 py-3 text-center sticky left-0 z-[1] bg-white shadow-[4px_0_10px_rgba(0,0,0,0.05)]">
                                            <span className="inline-flex items-center justify-center w-8 h-8 bg-slate-50 text-slate-500 font-bold text-[11px] rounded-[10px] shadow-[0_4px_10px_rgba(0,0,0,0.05),inset_0_1px_1px_#fff] border border-slate-200 transition-all duration-300 group-hover/row:bg-[var(--nav-active)] group-hover/row:text-white">
                                                {getSerialNumber(row.index)}
                                            </span>
                                        </td>
                                        {row.getVisibleCells().map((cell) => (
                                            <td
                                                key={cell.id}
                                                className={`px-4 py-3 text-[14px] font-medium text-[#8a99af]
                          ${cell.column.id === "action" ? "sticky right-[-10px] z-[1] bg-white shadow-[-4px_0_10px_rgba(0,0,0,0.05)] text-center" : ""}`}
                                            >
                                                {renderCell(cell)}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={table.getAllColumns().length + 1} className="text-center py-10 text-slate-400">
                                        No data found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {viewMode === "board" && (
                <div className="px-2 md:px-4 py-3 md:py-4 flex-grow overflow-y-auto max-h-[70vh] scrollbar-thin scrollbar-thumb-[var(--nav-active)]">
                    {loading || isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="p-4 rounded-2xl border bg-white min-h-[200px] animate-pulse" />
                            ))}
                        </div>
                    ) : table.getRowModel().rows.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {table.getRowModel().rows.map((row) => (
                                <div
                                    key={row.id}
                                    className={`bg-white border border-[#eef2f6] rounded-[20px] p-4 flex flex-col transition-all duration-300 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:-translate-y-1 hover:border-[var(--nav-active)] hover:shadow-[0_15px_30px_rgba(0,74,173,0.08)] ${row.getIsSelected() ? "bg-blue-50! border-[var(--nav-active)]! shadow-[0_0_0_2px_var(--nav-active)]!" : ""}`}
                                >
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[12px] text-slate-400 font-bold">#{getSerialNumber(row.index)}</span>
                                            {showSelection && (
                                                <div
                                                    className={`w-[22px] h-[22px] rounded-md border-2 cursor-pointer flex items-center justify-center transition-colors ${row.getIsSelected() ? "bg-[var(--nav-active)] border-[var(--nav-active)] shadow-[0_6px_14px_rgba(0,74,173,0.18)]" : "border-slate-300 bg-white"}`}
                                                    onClick={(e) => { e.stopPropagation(); row.toggleSelected(); }}
                                                >
                                                    {row.getIsSelected() && <div className="w-[10px] h-[5px] border-l-2 border-b-2 border-white -rotate-45 mb-0.5" />}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-1">
                                            {onEditRow && (
                                                <div className="w-8 h-8 rounded-full bg-sky-50 text-sky-500 border border-sky-100 flex items-center justify-center cursor-pointer hover:bg-sky-500 hover:text-white transition-all" onClick={(e) => { e.stopPropagation(); onEditRow(row.original); }}>
                                                    <Pencil size={14} />
                                                </div>
                                            )}
                                            {onDeleteRow && (
                                                <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center cursor-pointer hover:bg-rose-600 hover:text-white transition-all" onClick={(e) => { e.stopPropagation(); onDeleteRow(row.original); }}>
                                                    <Trash2 size={14} />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mt-1">
                                        {row.getVisibleCells().filter((c) => !["select", "action"].includes(c.column.id)).map((cell) => (
                                            <div key={cell.id} className="min-w-0">
                                                <label className="block mb-1 text-[11px] font-extrabold uppercase tracking-[0.06em] text-slate-500">
                                                    {cell.column.id.replace(/_/g, " ")}
                                                </label>
                                                <div className="text-[14px] leading-[1.35] font-bold text-slate-900 truncate">
                                                    {renderCell(cell)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {onMail && (
                                        <div className="mt-auto pt-3 flex gap-2">
                                            <button className="bg-indigo-100 text-indigo-700 border-none rounded-lg px-3 py-1.5 text-sm hover:bg-indigo-700 hover:text-white transition-all" onClick={() => onMail!(row.original)}>
                                                <Envelope size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-slate-400">No records found</div>
                    )}
                </div>
            )}

            {viewMode === "chart" && (
                <div className={`flex-grow ${isWidget ? "p-2" : "px-4 py-4"}`} style={{ minHeight: "400px" }}>
                    {loading || isLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <Spinner animation="border" variant="primary" />
                        </div>
                    ) : table.getRowModel().rows.length > 0 ? (
                        <WrappedDynamicChart
                            data={tableData}
                            title={chartConfig?.title || title || "Data Overview"}
                            chartType={chartConfig?.chartType || "Bar"}
                            dataLabelKey={chartConfig?.dataLabelKey || Object.keys(tableData[0] || {})[0] || "name"}
                            showDateFilter={false}
                            showStatusFilter={false}
                            showExpandButton={true}
                            showUserFilter={false}
                            topN={chartConfig?.topN || 10}
                            tableColumns={columns}
                        />
                    ) : (
                        <div className="text-center py-10 text-slate-400">No records found</div>
                    )}
                </div>
            )}

            {viewMode === "list" && (
                <div className={`flex-grow overflow-y-auto max-h-[70vh] scrollbar-thin scrollbar-thumb-[var(--nav-active)] ${isWidget ? "p-2" : "px-2 md:px-4 py-3 md:py-4"}`}>
                    {loading || isLoading ? (
                        <div className="flex flex-col gap-3">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="p-3 rounded-2xl border flex items-center gap-3 min-h-[80px] animate-pulse bg-white" />
                            ))}
                        </div>
                    ) : table.getRowModel().rows.length > 0 ? (
                        <div className="flex flex-col gap-3">
                            {table.getRowModel().rows.map((row) => (
                                <div
                                    key={row.id}
                                    className={`bg-white rounded-2xl border p-3 transition-all duration-200 flex items-start justify-between gap-3 cursor-pointer hover:bg-slate-50 hover:border-[var(--nav-active)] hover:translate-x-1 hover:shadow-sm ${row.getIsSelected() ? "bg-blue-50! border-[var(--nav-active)]!" : "border-slate-100"}`}
                                    onClick={() => row.toggleSelected()}
                                >
                                    <div className="text-[12px] font-bold text-slate-400 pt-1 opacity-80">#{getSerialNumber(row.index)}</div>
                                    <div className="flex items-start gap-3 overflow-hidden flex-grow min-w-0">
                                        {showSelection && (
                                            <div
                                                className={`w-[22px] h-[22px] flex-shrink-0 mt-0.5 rounded-md border-2 cursor-pointer flex items-center justify-center transition-colors ${row.getIsSelected() ? "bg-[var(--nav-active)] border-[var(--nav-active)]" : "border-slate-300 bg-white"}`}
                                                onClick={(e) => { e.stopPropagation(); row.toggleSelected(); }}
                                            >
                                                {row.getIsSelected() && <div className="w-[10px] h-[5px] border-l-2 border-b-2 border-white -rotate-45 mb-0.5" />}
                                            </div>
                                        )}
                                        {(() => {
                                            const pic = (row.original as any)?.profile_pic || (row.original as any)?.product_image;
                                            return pic ? (
                                                <img src={pic} alt="Profile" className="w-9 h-9 rounded-full object-cover flex-shrink-0 border-2 border-gray-200" />
                                            ) : null;
                                        })()}
                                        <div className="flex flex-col overflow-hidden flex-grow">
                                            <div className="grid gap-x-[18px] gap-y-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))", lineHeight: "1.35" }}>
                                                {row.getVisibleCells().filter((c) => c.column.id !== "select" && c.column.id !== "action").map((cell) => (
                                                    <span key={cell.id} className="flex flex-col gap-0.5 min-w-0">
                                                        <span className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-slate-500">
                                                            {cell.column.id.replace(/_/g, " ")}:
                                                        </span>
                                                        <span className={`text-[14px] font-bold text-slate-900 min-w-0 leading-[1.25] ${cell.column.id.toLowerCase() === "email" ? "lowercase text-[var(--nav-active)]" : ""}`}>
                                                            {renderCell(cell)}
                                                        </span>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 ml-3 pt-1 flex-shrink-0">
                                        {onEditRow && (
                                            <div className="w-8 h-8 rounded-full bg-sky-50 text-sky-500 border border-sky-100 flex items-center justify-center cursor-pointer hover:bg-sky-500 hover:text-white transition-all" onClick={(e) => { e.stopPropagation(); onEditRow(row.original); }}>
                                                <Pencil size={14} />
                                            </div>
                                        )}
                                        {onDeleteRow && (
                                            <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center cursor-pointer hover:bg-rose-600 hover:text-white transition-all" onClick={(e) => { e.stopPropagation(); onDeleteRow(row.original); }}>
                                                <Trash2 size={14} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-slate-400">No records found</div>
                    )}
                </div>
            )}

            {/* ── 4. FOOTER / PAGINATION ───────────────────────────────────────────── */}
            {showPagination && (
                <div className="flex flex-col md:flex-row justify-between items-center p-3 md:p-4 bg-white border-t rounded-b-2xl gap-3">
                    <div className="text-slate-400 text-sm font-medium flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_0_4px_rgba(16,185,129,0.1)]" />
                            Showing{" "}
                            <span className="text-slate-800 font-bold">{table.getRowModel().rows.length}</span>{" "}
                            of <span className="text-slate-800 font-bold">{totalCount}</span> records
                        </div>
                    </div>
                    <div className="flex gap-2 items-center">
                        <button className={paginationBtnBase} onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
                            <i className="fi fi-rr-angle-double-left" style={{ fontSize: "14px" }} />
                        </button>
                        <button className={paginationBtnBase} onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                            <i className="fi fi-rr-angle-left" style={{ fontSize: "14px" }} />
                        </button>
                        <div className="flex gap-1 bg-gray-100 rounded-full border border-slate-200 px-1 py-1">
                            {visiblePages.map((i) => (
                                <button
                                    key={i}
                                    className={`border-none w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-all duration-200 cursor-pointer
                    ${table.getState().pagination.pageIndex === i
                                            ? "bg-[var(--nav-active)] text-white shadow-[0_4px_10px_rgba(0,74,173,0.3)]"
                                            : "bg-transparent text-slate-500 hover:bg-[rgba(0,74,173,0.05)] hover:text-[var(--nav-active)]"}`}
                                    onClick={() => table.setPageIndex(i)}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <button className={paginationBtnBase} onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                            <i className="fi fi-rr-angle-right" style={{ fontSize: "14px" }} />
                        </button>
                        <button className={paginationBtnBase} onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
                            <i className="fi fi-rr-angle-double-right" style={{ fontSize: "14px" }} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomDataTable;