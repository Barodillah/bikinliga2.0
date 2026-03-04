import React, { useState, useEffect, useRef } from 'react'
import { Clock, Loader2, AlertCircle, Filter, RotateCcw, ChevronLeft, ChevronRight, Calendar, User, Activity, ChevronDown, Search } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const TIME_PRESETS = [
    { label: 'Hari Ini', key: 'today' },
    { label: '3 Hari', key: '3days' },
    { label: '7 Hari', key: '7days' },
    { label: 'Bulan Ini', key: 'thisMonth' },
    { label: '30 Hari', key: '30days' },
]

function getPresetDates(key) {
    const today = new Date()
    const fmt = (d) => d.toISOString().slice(0, 10)

    switch (key) {
        case 'today':
            return { startDate: fmt(today), endDate: fmt(today) }
        case '3days': {
            const d = new Date(today)
            d.setDate(d.getDate() - 2)
            return { startDate: fmt(d), endDate: fmt(today) }
        }
        case '7days': {
            const d = new Date(today)
            d.setDate(d.getDate() - 6)
            return { startDate: fmt(d), endDate: fmt(today) }
        }
        case 'thisMonth': {
            const start = new Date(today.getFullYear(), today.getMonth(), 1)
            return { startDate: fmt(start), endDate: fmt(today) }
        }
        case '30days': {
            const d = new Date(today)
            d.setDate(d.getDate() - 29)
            return { startDate: fmt(d), endDate: fmt(today) }
        }
        default:
            return { startDate: '', endDate: '' }
    }
}

// Custom Searchable Select Component
const SearchableSelect = ({ options, value, onChange, placeholder, icon: Icon }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const selectRef = useRef(null)

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const selectedOption = options.find(opt => opt.value === value)

    return (
        <div className="relative w-full" ref={selectRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm bg-white border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-200 ${isOpen ? 'border-green-400 ring-2 ring-green-100' : 'border-gray-200 hover:border-gray-300'}`}
            >
                <div className="flex items-center gap-2 truncate">
                    {Icon && <Icon className="w-4 h-4 text-gray-400" />}
                    <span className={selectedOption ? "text-gray-900 font-medium" : "text-gray-500"}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-20 w-full mt-1.5 bg-white border border-gray-100 rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden">
                    <div className="p-2 border-b border-gray-50 bg-gray-50/50">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-gray-400" />
                            <input
                                type="text"
                                className="w-full pl-8 pr-3 py-1.5 text-sm bg-white border border-gray-200 rounded-md focus:ring-2 focus:ring-green-100 focus:border-green-400 focus:outline-none transition-all placeholder-gray-400"
                                placeholder={`Cari ${placeholder.toLowerCase()}...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto py-1 custom-scrollbar">
                        <button
                            type="button"
                            onClick={() => { onChange(''); setIsOpen(false); setSearchQuery('') }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${!value ? 'bg-green-50/50 text-green-700 font-medium' : 'text-gray-600'}`}
                        >
                            {placeholder}
                        </button>
                        {filteredOptions.length === 0 ? (
                            <div className="px-3 py-3 text-sm text-gray-400 text-center">Tidak ditemukan</div>
                        ) : (
                            filteredOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => { onChange(opt.value); setIsOpen(false); setSearchQuery('') }}
                                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 truncate transition-colors ${value === opt.value ? 'bg-green-50/50 text-green-700 font-medium' : 'text-gray-700'}`}
                                >
                                    {opt.label}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

const ITEMS_PER_PAGE = 20

export default function AdminHistory() {
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const { token } = useAuth()

    // Filter state
    const [timePreset, setTimePreset] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [selectedUser, setSelectedUser] = useState('')
    const [selectedAction, setSelectedAction] = useState('')

    // Custom date range popover state
    const [isCustomDateOpen, setIsCustomDateOpen] = useState(false)
    const customDateRef = useRef(null)

    // Dropdown options
    const [filterUsers, setFilterUsers] = useState([])
    const [filterActions, setFilterActions] = useState([])

    // Pagination
    const [currentPage, setCurrentPage] = useState(1)

    useEffect(() => {
        fetchFilterOptions()
    }, [])

    useEffect(() => {
        fetchHistory()
    }, [startDate, endDate, selectedUser, selectedAction])

    // Click outside for custom date popover
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (customDateRef.current && !customDateRef.current.contains(event.target)) {
                setIsCustomDateOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const fetchFilterOptions = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/history/filters`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await response.json()
            if (data.success) {
                setFilterUsers(data.data.users || [])
                setFilterActions(data.data.actions || [])
            }
        } catch (err) {
            console.error('Failed to fetch filter options:', err)
        }
    }

    const fetchHistory = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (startDate) params.append('startDate', startDate)
            if (endDate) params.append('endDate', endDate)
            if (selectedUser) params.append('userId', selectedUser)
            if (selectedAction) params.append('action', selectedAction)

            const url = `${import.meta.env.VITE_API_URL}/admin/history?${params.toString()}`
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await response.json()

            if (data.success) {
                setHistory(data.data)
                setCurrentPage(1)
            } else {
                setError(data.message)
            }
        } catch (err) {
            setError('Failed to fetch history')
        } finally {
            setLoading(false)
        }
    }

    const handleTimePreset = (key) => {
        if (key === timePreset) {
            setTimePreset('')
            setStartDate('')
            setEndDate('')
            return
        }
        setIsCustomDateOpen(false)
        setTimePreset(key)
        const { startDate: sd, endDate: ed } = getPresetDates(key)
        setStartDate(sd)
        setEndDate(ed)
    }

    const handleCustomDateToggle = () => {
        setTimePreset('custom')
        setIsCustomDateOpen(!isCustomDateOpen)
    }

    const handleReset = () => {
        setTimePreset('')
        setStartDate('')
        setEndDate('')
        setSelectedUser('')
        setSelectedAction('')
        setCurrentPage(1)
        setIsCustomDateOpen(false)
    }

    const userOptions = filterUsers.map(u => ({
        value: u.user_id,
        label: u.user_name || u.user_email
    }))

    const actionOptions = filterActions.map(a => ({
        value: a,
        label: a
    }))

    const activeFilterCount = [
        startDate || endDate ? 1 : 0,
        selectedUser ? 1 : 0,
        selectedAction ? 1 : 0,
    ].reduce((a, b) => a + b, 0)

    const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE)
    const paginatedHistory = history.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    if (error) {
        return (
            <div className="flex items-center gap-2 p-4 text-red-700 bg-red-50 border border-red-100 rounded-xl">
                <AlertCircle className="w-5 h-5" />
                <p className="font-medium">{error}</p>
            </div>
        )
    }

    const getFilterStatusText = () => {
        if (activeFilterCount === 0) return 'Menampilkan semua log terbaru';
        const parts = [];
        if (startDate && endDate) {
            if (startDate === endDate) parts.push(`Tanggal ${startDate}`);
            else parts.push(`Dari ${startDate} s/d ${endDate}`);
        } else if (startDate) {
            parts.push(`Sejak ${startDate}`);
        } else if (endDate) {
            parts.push(`Hingga ${endDate}`);
        }
        if (selectedUser) {
            const u = userOptions.find(o => o.value === selectedUser);
            if (u) parts.push(`User: ${u.label}`);
        }
        if (selectedAction) {
            parts.push(`Aksi: ${selectedAction}`);
        }
        return parts.join(' • ');
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 font-display">System History</h1>
                    <p className="text-sm text-gray-500 mt-1">Pantau semua aktivitas dan log sistem</p>
                </div>
                {activeFilterCount > 0 && (
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 rounded-lg transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Reset semua filter
                    </button>
                )}
            </div>

            {/* Filter Panel */}
            <div className="bg-white border text-gray-800 border-gray-200 rounded-2xl shadow-sm p-5 space-y-5">
                {/* Time Presets & Custom Date Tool */}
                <div className="space-y-3">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-widest">
                        <Calendar className="w-4 h-4" />
                        Rentang Waktu
                    </label>
                    <div className="flex flex-wrap items-center gap-2.5">
                        {TIME_PRESETS.map((p) => (
                            <button
                                key={p.key}
                                onClick={() => handleTimePreset(p.key)}
                                className={`px-4 py-2 text-sm pl-4 pr-4 font-medium rounded-xl border transition-all duration-200 ${timePreset === p.key
                                        ? 'bg-green-50/80 border-green-300 text-green-700 shadow-sm ring-1 ring-green-100'
                                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900'
                                    }`}
                            >
                                {p.label}
                            </button>
                        ))}

                        {/* Custom Date Popover Trigger */}
                        <div className="relative" ref={customDateRef}>
                            <button
                                onClick={handleCustomDateToggle}
                                className={`px-4 py-2 text-sm font-medium rounded-xl border transition-all duration-200 flex items-center gap-2 ${timePreset === 'custom' || (startDate && timePreset === '')
                                        ? 'bg-green-50/80 border-green-300 text-green-700 shadow-sm ring-1 ring-green-100'
                                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900'
                                    }`}
                            >
                                Kustom
                                <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform ${isCustomDateOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Custom Date Popover Content */}
                            {isCustomDateOpen && (
                                <div className="absolute top-full left-0 mt-2 z-20 w-72 p-4 bg-white border border-gray-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] rounded-2xl ring-1 ring-black/5">
                                    <h4 className="text-sm font-bold text-gray-800 mb-3">Pilih Rentang Tanggal</h4>
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-gray-500 pl-1">Mulai Dari</label>
                                            <input
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                className="w-full px-3 py-2 text-sm text-gray-700 bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-400 focus:bg-white transition-all"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-gray-500 pl-1">Sampai Dengan</label>
                                            <input
                                                type="date"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                className="w-full px-3 py-2 text-sm text-gray-700 bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-400 focus:bg-white transition-all"
                                            />
                                        </div>
                                        <button
                                            onClick={() => setIsCustomDateOpen(false)}
                                            className="w-full py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 shadow-sm transition-colors mt-2"
                                        >
                                            Terapkan Filter
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* divider */}
                <div className="h-px bg-gray-100 w-full"></div>

                {/* User & Action Searchable Selects */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-widest">
                            <User className="w-4 h-4" />
                            Filter User
                        </label>
                        <SearchableSelect
                            options={userOptions}
                            value={selectedUser}
                            onChange={setSelectedUser}
                            placeholder="Semua User"
                            icon={null}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-widest">
                            <Activity className="w-4 h-4" />
                            Filter Action
                        </label>
                        <SearchableSelect
                            options={actionOptions}
                            value={selectedAction}
                            onChange={setSelectedAction}
                            placeholder="Semua Action"
                            icon={null}
                        />
                    </div>
                </div>

                {/* Active Filter Summary Bar */}
                <div className="flex items-center gap-2 pt-3">
                    <div className="p-1.5 bg-green-100 text-green-700 rounded-md">
                        <Filter className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">
                        {getFilterStatusText()}
                        <span className="text-gray-400 font-normal ml-2">
                            ({history.length} hasil)
                        </span>
                    </p>
                </div>
            </div>

            {/* History List */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex flex-col justify-center items-center h-64 gap-3 bg-gray-50/30">
                        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
                        <span className="text-sm font-medium text-gray-500">Memuat log sistem...</span>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {paginatedHistory.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500 bg-gray-50/30">
                                <div className="w-12 h-12 mb-3 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <h3 className="text-base font-semibold text-gray-900 mb-1">Tidak ada aktivitas ditemukan</h3>
                                <p className="text-sm">
                                    {activeFilterCount > 0
                                        ? 'Coba sesuaikan filter pencarian Anda.'
                                        : 'Belum ada log sistem yang tercatat.'}
                                </p>
                                {activeFilterCount > 0 && (
                                    <button onClick={handleReset} className="mt-4 px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        ) : (
                            paginatedHistory.map((item) => (
                                <div key={item.id} className="p-4 sm:p-5 flex items-start gap-4 hover:bg-gray-50/80 transition-colors group">
                                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 shrink-0 overflow-hidden shadow-sm">
                                        {item.user_avatar ? (
                                            <img src={item.user_avatar} alt={item.user_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-5 h-5 text-gray-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 pt-0.5">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                                            <p className="text-sm font-medium text-gray-900">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 mr-2 border border-blue-100">
                                                    {item.action}
                                                </span>
                                                oleh <span className="font-bold ml-1">{item.user_name || item.user_email || 'Unknown User'}</span>
                                            </p>
                                            <span className="text-xs text-gray-400 whitespace-nowrap lg:group-hover:text-gray-500 transition-colors">
                                                {new Date(item.created_at).toLocaleString('id-ID', {
                                                    day: 'numeric', month: 'short', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1 sm:mt-0 leading-relaxed max-w-4xl">{item.description}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-4 border-t border-gray-200 bg-gray-50/50 gap-4">
                        <span className="text-xs font-medium text-gray-500">
                            Menampilkan <span className="text-gray-900">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> - <span className="text-gray-900">{Math.min(currentPage * ITEMS_PER_PAGE, history.length)}</span> dari <span className="text-gray-900">{history.length}</span> log
                        </span>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-gray-200 disabled:cursor-not-allowed transition-all shadow-sm text-gray-600"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <div className="flex gap-1 hidden sm:flex">
                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                    let page
                                    if (totalPages <= 5) page = i + 1
                                    else if (currentPage <= 3) page = i + 1
                                    else if (currentPage >= totalPages - 2) page = totalPages - 4 + i
                                    else page = currentPage - 2 + i

                                    return (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`min-w-[32px] h-8 px-2 text-xs font-semibold rounded-lg border transition-all ${currentPage === page
                                                    ? 'bg-green-600 border-green-600 text-white shadow-sm hover:bg-green-700 hover:border-green-700'
                                                    : 'bg-white border-transparent text-gray-600 hover:bg-gray-100 hover:border-gray-200'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    )
                                })}
                            </div>
                            <span className="sm:hidden text-xs font-medium text-gray-600 px-2">
                                Hal {currentPage} / {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-gray-200 disabled:cursor-not-allowed transition-all shadow-sm text-gray-600"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
