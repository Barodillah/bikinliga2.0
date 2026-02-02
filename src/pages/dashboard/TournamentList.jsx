import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Filter, Trophy, Calendar, Users, MoreVertical, Grid, List as ListIcon } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import AdSlot from '../../components/ui/AdSlot'
import AdaptiveLogo from '../../components/ui/AdaptiveLogo'
import { authFetch } from '../../utils/api'

// Sample data
import { useToast } from '../../contexts/ToastContext'

export default function TournamentList() {
    const { error } = useToast()
    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState('grid')
    const [filterStatus, setFilterStatus] = useState('all')
    const [tournaments, setTournaments] = useState([])
    const [loading, setLoading] = useState(true)

    // Fetch tournaments
    React.useEffect(() => {
        const fetchTournaments = async () => {
            try {
                const response = await authFetch('/api/tournaments')
                const data = await response.json()

                if (data.success) {
                    setTournaments(data.data)
                } else {
                    throw new Error(data.message)
                }
            } catch (err) {
                console.error('Failed to fetch tournaments:', err)
                error('Gagal memuat data turnamen')
            } finally {
                setLoading(false)
            }
        }

        fetchTournaments()
    }, [])

    const filteredTournaments = tournaments.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = filterStatus === 'all' || t.status === filterStatus
        return matchesSearch && matchesStatus
    })

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-neonGreen/20 text-neonGreen'
            case 'completed': return 'bg-gray-500/20 text-gray-400'
            case 'draft': return 'bg-yellow-500/20 text-yellow-400'
            default: return 'bg-gray-500/20 text-gray-400'
        }
    }

    const getStatusLabel = (status) => {
        switch (status) {
            case 'active': return 'Aktif'
            case 'completed': return 'Selesai'
            case 'draft': return 'Draft'
            default: return status
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-display font-bold">Turnamen Saya</h1>
                    <p className="text-gray-400 mt-1">Kelola semua turnamen yang kamu buat</p>
                </div>
                <Link to="/dashboard/tournaments/new">
                    <Button icon={Plus}>Buat Turnamen</Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
                    <Input
                        placeholder="Cari turnamen..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neonGreen"
                    >
                        <option value="all">Semua Status</option>
                        <option value="active">Aktif</option>
                        <option value="completed">Selesai</option>
                        <option value="draft">Draft</option>
                    </select>
                    <div className="flex border border-white/10 rounded-lg overflow-hidden">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-3 ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
                        >
                            <Grid className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-3 ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
                        >
                            <ListIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Ad Slot */}
            <AdSlot variant="leaderboard" adId="tournament-list" />

            {/* Tournament Grid/List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neonGreen"></div>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTournaments.map((tournament) => (
                        <Link key={tournament.id} to={`/dashboard/tournaments/${tournament.slug}`}>
                            <Card className="p-6 hover:border-neonGreen/30 transition-all group">
                                <div className="flex items-start justify-between mb-4">
                                    <AdaptiveLogo
                                        src={tournament.logo}
                                        alt={tournament.name}
                                        className="w-12 h-12"
                                        fallbackSize="w-6 h-6"
                                    />
                                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(tournament.status)}`}>
                                        {getStatusLabel(tournament.status)}
                                    </span>
                                </div>
                                <h3 className="font-display font-bold text-lg mb-2 group-hover:text-neonGreen transition">{tournament.name}</h3>
                                <p className="text-sm text-gray-500 mb-4">{tournament.type}</p>

                                <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                                    <span className="flex items-center gap-1">
                                        <Users className="w-4 h-4" /> {tournament.players}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" /> {tournament.matches} Match
                                    </span>
                                </div>

                                {/* Progress Bar */}
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-neonGreen to-neonPink transition-all"
                                        style={{ width: `${tournament.progress}%` }}
                                    />
                                </div>
                                <div className="text-xs text-gray-500 mt-2">{tournament.progress}% completed</div>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : (
                <Card hover={false} className="overflow-hidden">
                    <div className="divide-y divide-white/5">
                        {filteredTournaments.map((tournament) => (
                            <Link
                                key={tournament.id}
                                to={`/dashboard/tournaments/${tournament.slug}`}
                                className="flex items-center justify-between p-4 hover:bg-white/5 transition"
                            >
                                <div className="flex items-center gap-4">
                                    <AdaptiveLogo
                                        src={tournament.logo}
                                        alt={tournament.name}
                                        className="w-10 h-10"
                                        fallbackSize="w-5 h-5"
                                    />
                                    <div>
                                        <div className="font-medium">{tournament.name}</div>
                                        <div className="text-xs text-gray-500">{tournament.type} • {tournament.players} Pemain • {tournament.matches} Match</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(tournament.status)}`}>
                                        {getStatusLabel(tournament.status)}
                                    </span>
                                    <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-neonGreen to-neonPink"
                                            style={{ width: `${tournament.progress}%` }}
                                        />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </Card>
            )}

            {!loading && filteredTournaments.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Trophy className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                    <h3 className="font-display font-bold text-xl mb-2">Tidak ada turnamen</h3>
                    <p className="text-gray-500 mb-6">Buat turnamen pertamamu dan mulai kompetisi!</p>
                    <Link to="/dashboard/tournaments/new">
                        <Button icon={Plus}>Buat Turnamen Baru</Button>
                    </Link>
                </div>
            )}
        </div>
    )
}
