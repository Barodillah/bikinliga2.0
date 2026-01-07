import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Filter, Trophy, Calendar, Users, MoreVertical, Grid, List as ListIcon } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

// Sample data
const tournaments = [
    { id: 1, name: 'Warkop Cup Season 5', type: 'Liga', players: 16, matches: 12, status: 'active', startDate: '2024-01-15', progress: 65 },
    { id: 2, name: 'Ramadhan Cup 2024', type: 'Knockout', players: 32, matches: 31, status: 'completed', startDate: '2024-03-10', progress: 100 },
    { id: 3, name: 'Sunday League', type: 'Group+KO', players: 8, matches: 4, status: 'active', startDate: '2024-02-01', progress: 35 },
    { id: 4, name: 'Merdeka Tournament', type: 'Liga', players: 24, matches: 0, status: 'draft', startDate: '2024-08-17', progress: 0 },
    { id: 5, name: 'Weekend Warriors', type: 'Liga', players: 12, matches: 22, status: 'completed', startDate: '2023-12-01', progress: 100 },
]

export default function TournamentList() {
    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState('grid')
    const [filterStatus, setFilterStatus] = useState('all')

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

            {/* Tournament Grid/List */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTournaments.map((tournament) => (
                        <Link key={tournament.id} to={`/dashboard/tournaments/${tournament.id}`}>
                            <Card className="p-6 hover:border-neonGreen/30 transition-all group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-neonGreen/20 to-neonPink/20 flex items-center justify-center group-hover:scale-110 transition">
                                        <Trophy className="w-6 h-6 text-neonGreen" />
                                    </div>
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
                                    {tournament.status !== 'draft' && (
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" /> {tournament.matches} Match
                                        </span>
                                    )}
                                </div>

                                {/* Progress Bar - Hide if draft */}
                                {tournament.status !== 'draft' ? (
                                    <>
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-neonGreen to-neonPink transition-all"
                                                style={{ width: `${tournament.progress}%` }}
                                            />
                                        </div>
                                        <div className="text-xs text-gray-500 mt-2">{tournament.progress}% completed</div>
                                    </>
                                ) : (
                                    <div className="text-xs text-yellow-500 font-medium mt-2">Menunggu setup...</div>
                                )}
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
                                to={`/dashboard/tournaments/${tournament.id}`}
                                className="flex items-center justify-between p-4 hover:bg-white/5 transition"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-neonGreen/20 to-neonPink/20 flex items-center justify-center">
                                        <Trophy className="w-5 h-5 text-neonGreen" />
                                    </div>
                                    <div>
                                        <div className="font-medium">{tournament.name}</div>
                                        <div className="text-xs text-gray-500">
                                            {tournament.type} • {tournament.players} Pemain
                                            {tournament.status !== 'draft' && ` • ${tournament.matches} Match`}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(tournament.status)}`}>
                                        {getStatusLabel(tournament.status)}
                                    </span>
                                    {tournament.status !== 'draft' && (
                                        <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-neonGreen to-neonPink"
                                                style={{ width: `${tournament.progress}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </Card>
            )}

            {filteredTournaments.length === 0 && (
                <div className="text-center py-12">
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
