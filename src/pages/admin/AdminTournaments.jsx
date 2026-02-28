import React, { useState, useEffect } from 'react'
import { Search, Filter, Trophy, Calendar, Users, MoreVertical, ExternalLink, Eye, Settings, Archive, CheckCircle, Clock, X, AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useToast } from '../../contexts/ToastContext'
import AdaptiveLogo from '../../components/ui/AdaptiveLogo'

export default function AdminTournaments() {
    const { error: toastError, success: toastSuccess } = useToast()
    const [tournaments, setTournaments] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [activeDropdown, setActiveDropdown] = useState(null)

    // Status Setting Modal
    const [statusModal, setStatusModal] = useState(false)
    const [statusModalData, setStatusModalData] = useState(null)
    const [statusModalLoading, setStatusModalLoading] = useState(false)
    const [statusUpdating, setStatusUpdating] = useState(false)
    const [confirmDialog, setConfirmDialog] = useState(null) // { newStatus, label, description }

    useEffect(() => {
        fetchTournaments()
    }, [])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveDropdown(null)
        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
    }, [])

    const fetchTournaments = async () => {
        try {
            const response = await fetch('/api/admin/tournaments')
            const result = await response.json()
            if (result.success) {
                setTournaments(result.data)
            } else {
                toastError(result.message || 'Failed to fetch tournaments')
            }
        } catch (err) {
            console.error('Error fetching tournaments:', err)
            toastError('Failed to load tournaments')
        } finally {
            setLoading(false)
        }
    }

    const openStatusModal = async (tournamentId) => {
        setStatusModal(true)
        setStatusModalLoading(true)
        setStatusModalData(null)
        setActiveDropdown(null)
        try {
            const response = await fetch(`/api/admin/tournaments/${tournamentId}/status-info`)
            const result = await response.json()
            if (result.success) {
                setStatusModalData(result.data)
            } else {
                toastError(result.message || 'Failed to fetch status info')
                setStatusModal(false)
            }
        } catch (err) {
            console.error('Error fetching status info:', err)
            toastError('Failed to load status info')
            setStatusModal(false)
        } finally {
            setStatusModalLoading(false)
        }
    }

    const requestStatusChange = (newStatus) => {
        if (!statusModalData) return
        if (newStatus === 'archived') {
            setConfirmDialog({
                newStatus: 'archived',
                label: 'Archive Tournament',
                description: `Turnamen "${statusModalData.name}" akan diarsipkan dan tidak akan terlihat oleh pengguna. Apakah Anda yakin?`
            })
        } else if (newStatus === 'completed') {
            setConfirmDialog({
                newStatus: 'completed',
                label: 'Complete Tournament',
                description: `Turnamen "${statusModalData.name}" akan ditandai sebagai selesai. Apakah Anda yakin?`
            })
        }
    }

    const executeStatusChange = async () => {
        if (!confirmDialog || !statusModalData) return
        const { newStatus } = confirmDialog
        setConfirmDialog(null)
        setStatusUpdating(true)
        try {
            const response = await fetch(`/api/admin/tournaments/${statusModalData.id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ new_status: newStatus })
            })
            const result = await response.json()
            if (result.success) {
                toastSuccess(result.message || `Tournament ${newStatus} successfully`)
                setStatusModal(false)
                fetchTournaments()
            } else {
                toastError(result.message || 'Failed to update status')
            }
        } catch (err) {
            console.error('Error updating status:', err)
            toastError('Failed to update tournament status')
        } finally {
            setStatusUpdating(false)
        }
    }

    const filteredTournaments = tournaments.filter(tournament => {
        const matchesSearch = tournament.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tournament.creator_name?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = filterStatus === 'all' || tournament.status === filterStatus
        return matchesSearch && matchesStatus
    })

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-700 border-green-200';
            case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'draft': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'archived': return 'bg-gray-100 text-gray-500 border-gray-300';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neonGreen"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 font-display">Tournament Management</h1>
                    <p className="text-sm text-gray-500">View and manage all user tournaments</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Tournaments</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{tournaments.length}</h3>
                    </div>
                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                        <Trophy className="w-5 h-5" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Active Now</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">
                            {tournaments.filter(t => t.status === 'active').length}
                        </h3>
                    </div>
                    <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                        <Trophy className="w-5 h-5" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Completed</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">
                            {tournaments.filter(t => t.status === 'completed').length}
                        </h3>
                    </div>
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <Trophy className="w-5 h-5" />
                    </div>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden min-h-[500px]">
                <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by tournament name or creator..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neonGreen/20 focus:border-neonGreen transition text-black"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 focus:outline-none focus:border-neonGreen"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="draft">Draft</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-visible">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
                            <tr>
                                <th className="px-6 py-3">Tournament</th>
                                <th className="px-6 py-3">Organizer</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Stats</th>
                                <th className="px-6 py-3">Created Date</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredTournaments.length > 0 ? (
                                filteredTournaments.map((tournament) => (
                                    <tr key={tournament.id} className="hover:bg-gray-50 transition group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <AdaptiveLogo
                                                    src={tournament.logo_url}
                                                    alt={tournament.name}
                                                    className="w-10 h-10"
                                                    fallbackSize="w-5 h-5"
                                                />
                                                <div>
                                                    <div className="font-medium text-gray-900">{tournament.name}</div>
                                                    <div className="text-xs text-gray-500">{tournament.type}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
                                                    <img
                                                        src={tournament.creator_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${tournament.creator_username}`}
                                                        alt={tournament.creator_name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="text-sm text-gray-900">
                                                    {tournament.creator_name}
                                                    <span className="text-xs text-gray-500 block">@{tournament.creator_username}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border w-fit ${getStatusBadgeColor(tournament.status)}`}>
                                                    {tournament.status}
                                                </span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border w-fit ${tournament.visibility === 'public' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-orange-100 text-orange-700 border-orange-200'}`}>
                                                    {tournament.visibility || 'public'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-xs text-gray-600" title="Participants">
                                                    <Users className="w-3.5 h-3.5" />
                                                    <span className="font-medium">{tournament.participant_count || 0}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-600" title="Matches">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    <span className="font-medium">{tournament.match_count || 0}</span> Matches
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-500">
                                                {new Date(tournament.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                            {['draft', 'active'].includes(tournament.status) && (() => {
                                                const now = new Date()
                                                const ref = tournament.status === 'active' && tournament.latest_match_updated_at
                                                    ? new Date(tournament.latest_match_updated_at)
                                                    : new Date(tournament.updated_at)
                                                const diffMs = now - ref
                                                const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
                                                const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
                                                const colorClass = days > 7 ? 'text-red-500' : days >= 5 ? 'text-amber-500' : 'text-green-500'
                                                return (
                                                    <div className={`text-[10px] font-semibold mt-0.5 ${colorClass}`}>
                                                        ⏱ {days}d {hours}h idle
                                                    </div>
                                                )
                                            })()}
                                            {(tournament.match_count || 0) > 0 && (() => {
                                                const total = tournament.match_count || 0
                                                const completed = tournament.completed_match_count || 0
                                                const pct = Math.round((completed / total) * 100)
                                                return (
                                                    <div className="mt-1.5">
                                                        <div className="flex items-center justify-between text-[10px] text-gray-500 mb-0.5">
                                                            <span>{completed}/{total}</span>
                                                            <span className="font-semibold">{pct}%</span>
                                                        </div>
                                                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-blue-500' : 'bg-neonGreen'}`}
                                                                style={{ width: `${pct}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                )
                                            })()}
                                        </td>
                                        <td className="px-6 py-4 text-right relative">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveDropdown(activeDropdown === tournament.id ? null : tournament.id);
                                                }}
                                                className={`text-gray-400 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition ${activeDropdown === tournament.id ? 'bg-gray-100 text-gray-900' : ''}`}
                                            >
                                                <MoreVertical className="w-5 h-5" />
                                            </button>

                                            {/* Dropdown Menu */}
                                            {activeDropdown === tournament.id && (
                                                <div className="absolute right-8 top-8 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50 py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                                                    <Link
                                                        to={`/dashboard/tournaments/${tournament.slug}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                        onClick={() => setActiveDropdown(null)}
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                        Open in New Tab
                                                    </Link>
                                                    <button
                                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openStatusModal(tournament.id);
                                                        }}
                                                    >
                                                        <Settings className="w-4 h-4" />
                                                        Status Setting
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        No tournaments found matching your criteria
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination (Static for now) */}
                <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                    <p className="text-sm text-gray-500">Showing <span className="font-medium">{filteredTournaments.length}</span> results</p>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 border border-gray-200 rounded text-sm disabled:opacity-50" disabled>Previous</button>
                        <button className="px-3 py-1 border border-gray-200 rounded text-sm disabled:opacity-50" disabled>Next</button>
                    </div>
                </div>
            </div>

            {/* Confirmation Dialog */}
            {confirmDialog && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4" onClick={() => setConfirmDialog(null)}>
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-in fade-in zoom-in-95 duration-200 p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className={`p-3 rounded-full mb-4 ${confirmDialog.newStatus === 'archived' ? 'bg-amber-100' : 'bg-blue-100'}`}>
                                {confirmDialog.newStatus === 'archived'
                                    ? <AlertTriangle className="w-6 h-6 text-amber-600" />
                                    : <CheckCircle className="w-6 h-6 text-blue-600" />
                                }
                            </div>
                            <h4 className="text-lg font-bold text-gray-900 mb-1">{confirmDialog.label}</h4>
                            <p className="text-sm text-gray-500 leading-relaxed">{confirmDialog.description}</p>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setConfirmDialog(null)}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                            >
                                Batal
                            </button>
                            <button
                                onClick={executeStatusChange}
                                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition ${confirmDialog.newStatus === 'archived'
                                    ? 'bg-amber-500 hover:bg-amber-600'
                                    : 'bg-blue-500 hover:bg-blue-600'
                                    }`}
                            >
                                Ya, Lanjutkan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Setting Modal */}
            {statusModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => !statusUpdating && setStatusModal(false)}>
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-5 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-gray-100 rounded-lg">
                                    <Settings className="w-4 h-4 text-gray-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Status Setting</h3>
                            </div>
                            <button
                                onClick={() => !statusUpdating && setStatusModal(false)}
                                className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                                disabled={statusUpdating}
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-5">
                            {statusModalLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neonGreen"></div>
                                </div>
                            ) : statusModalData ? (
                                <div className="space-y-5">
                                    {/* Tournament Info */}
                                    <div>
                                        <h4 className="font-semibold text-gray-900 text-base">{statusModalData.name}</h4>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${getStatusBadgeColor(statusModalData.status)}`}>
                                                {statusModalData.status}
                                            </span>
                                            {statusModalData.match_count > 0 && (
                                                <span className="text-xs text-gray-500">
                                                    Progress: <span className="font-semibold">{statusModalData.progress}%</span> ({statusModalData.completed_match_count}/{statusModalData.match_count})
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Competition Age */}
                                    <div className="bg-gradient-to-br from-slate-50 to-gray-50 border border-gray-200 rounded-xl p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Clock className="w-4 h-4 text-amber-500" />
                                            <span className="text-sm font-semibold text-gray-700">Umur Kompetisi</span>
                                        </div>
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-3xl font-bold text-gray-900">{statusModalData.age_days}</span>
                                            <span className="text-sm text-gray-500 font-medium">hari</span>
                                            <span className="text-xl font-bold text-gray-600 ml-1">{statusModalData.age_hours}</span>
                                            <span className="text-sm text-gray-500 font-medium">jam</span>
                                        </div>
                                        <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
                                            {statusModalData.status === 'active'
                                                ? statusModalData.latest_match_updated_at
                                                    ? `Dihitung dari aktivitas pertandingan terakhir (${new Date(statusModalData.latest_match_updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })})`
                                                    : `Dihitung dari update terakhir tournament (${new Date(statusModalData.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })})`
                                                : `Dihitung dari update terakhir tournament (${new Date(statusModalData.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })})`
                                            }
                                        </p>
                                    </div>

                                    {/* Status Actions */}
                                    <div className="space-y-2.5">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ubah Status</p>

                                        {/* Archive Button - for draft/active with progress < 100% */}
                                        {['draft', 'active'].includes(statusModalData.status) && statusModalData.progress < 100 && (
                                            <button
                                                onClick={() => requestStatusChange('archived')}
                                                disabled={statusUpdating}
                                                className="w-full flex items-center gap-3 p-3.5 rounded-xl border-2 border-amber-200 bg-amber-50 hover:bg-amber-100 hover:border-amber-300 transition-all group disabled:opacity-60 disabled:cursor-not-allowed"
                                            >
                                                <div className="p-2 bg-amber-200 rounded-lg group-hover:bg-amber-300 transition">
                                                    <Archive className="w-4 h-4 text-amber-700" />
                                                </div>
                                                <div className="text-left flex-1">
                                                    <p className="text-sm font-semibold text-amber-800">Archive Tournament</p>
                                                    <p className="text-[11px] text-amber-600">Arsipkan turnamen yang tidak aktif</p>
                                                </div>
                                                {statusUpdating && (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600"></div>
                                                )}
                                            </button>
                                        )}

                                        {/* Complete Button - for active with progress = 100% */}
                                        {statusModalData.status === 'active' && statusModalData.progress >= 100 && (
                                            <button
                                                onClick={() => requestStatusChange('completed')}
                                                disabled={statusUpdating}
                                                className="w-full flex items-center gap-3 p-3.5 rounded-xl border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 transition-all group disabled:opacity-60 disabled:cursor-not-allowed"
                                            >
                                                <div className="p-2 bg-blue-200 rounded-lg group-hover:bg-blue-300 transition">
                                                    <CheckCircle className="w-4 h-4 text-blue-700" />
                                                </div>
                                                <div className="text-left flex-1">
                                                    <p className="text-sm font-semibold text-blue-800">Complete Tournament</p>
                                                    <p className="text-[11px] text-blue-600">Tandai turnamen sebagai selesai</p>
                                                </div>
                                                {statusUpdating && (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                                )}
                                            </button>
                                        )}

                                        {/* No action available message */}
                                        {!['draft', 'active'].includes(statusModalData.status) && (
                                            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-500">
                                                <AlertTriangle className="w-4 h-4 text-gray-400" />
                                                <p className="text-sm">Tidak ada perubahan status yang tersedia untuk tournament dengan status <span className="font-semibold">{statusModalData.status}</span>.</p>
                                            </div>
                                        )}

                                        {/* Active 100% but showing both if applicable */}
                                        {statusModalData.status === 'active' && statusModalData.progress >= 100 && (
                                            <p className="text-[11px] text-gray-400 text-center">
                                                Progress sudah 100% — turnamen bisa ditandai selesai
                                            </p>
                                        )}
                                        {statusModalData.status === 'active' && statusModalData.progress < 100 && (
                                            <p className="text-[11px] text-gray-400 text-center">
                                                Progress {statusModalData.progress}% — hanya bisa diarsipkan
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    <p>Failed to load data</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
