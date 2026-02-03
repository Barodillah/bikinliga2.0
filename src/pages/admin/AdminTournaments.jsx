import React, { useState, useEffect } from 'react'
import { Search, Filter, Trophy, Calendar, Users, MoreVertical, ExternalLink, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useToast } from '../../contexts/ToastContext'
import AdaptiveLogo from '../../components/ui/AdaptiveLogo'

export default function AdminTournaments() {
    const { error: toastError } = useToast()
    const [tournaments, setTournaments] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [activeDropdown, setActiveDropdown] = useState(null)

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
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neonGreen/20 focus:border-neonGreen transition"
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
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${getStatusBadgeColor(tournament.status)}`}>
                                                {tournament.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-xs text-gray-600" title="Participants">
                                                    <Users className="w-3.5 h-3.5" />
                                                    <span className="font-medium">{tournament.players || 0}</span>
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
        </div>
    )
}
