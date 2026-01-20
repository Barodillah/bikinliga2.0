import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Trophy, Calendar, Users, Grid, List as ListIcon, PlayCircle, ShieldCheck, Sparkles, Clock, TrendingUp, Filter } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import AdSlot from '../../components/ui/AdSlot'

// Sample data for Public Competitions
const publicCompetitions = [
    {
        id: 101,
        name: 'Open Liga Nusantara',
        type: 'Liga',
        players: 16,
        currentPlayers: 12, // 4 slots left
        matches: 0,
        status: 'register',
        startDate: '2024-05-01',
        registrationDeadline: '2024-04-28',
        description: 'Liga terbuka untuk umum, semua skill level welcome!',
        isPublic: true,
        creator: { name: 'Official IndoLeague', isTrusted: true },
        userStatus: 'registered' // Example: User has registered
    },
    {
        id: 102,
        name: 'Amateur Cup 2024',
        type: 'Knockout',
        players: 8,
        currentPlayers: 2,
        matches: 0,
        status: 'draft',
        startDate: '2024-06-15',
        registrationDeadline: '2024-06-10',
        description: 'Turnamen santai akhir pekan.',
        isPublic: true,
        creator: { name: 'Komunitas Santai', isTrusted: false }
    },
    {
        id: 103,
        name: 'Pro Valorant Scrim',
        type: 'Liga',
        players: 6,
        currentPlayers: 6, // Full
        matches: 0,
        status: 'register',
        startDate: '2024-05-10',
        registrationDeadline: '2024-05-08',
        description: 'Scrim mingguan untuk tim semi-pro.',
        isPublic: true,
        creator: { name: 'ProScouts ID', isTrusted: true },
        userStatus: 'pending' // Example: User request pending
    },
    {
        id: 104,
        name: 'Badminton Fun Match',
        type: 'Group',
        players: 16,
        currentPlayers: 10,
        matches: 0,
        status: 'draft',
        startDate: '2024-05-20',
        registrationDeadline: '2024-05-18',
        description: 'Cari lawan sparing badminton.',
        isPublic: true,
        creator: { name: 'Gor Asoy', isTrusted: false }
    },
    {
        id: 105,
        name: 'Weekly FIFA Tournament',
        type: 'Knockout',
        players: 32,
        currentPlayers: 32,
        matches: 15,
        status: 'ongoing',
        startDate: '2024-04-20',
        registrationDeadline: '2024-04-18',
        description: 'Turnamen mingguan FIFA 24.',
        isPublic: true,
        creator: { name: 'FIFA ID', isTrusted: true },
        userStatus: 'playing' // Example: User is playing
    },
    {
        id: 106,
        name: 'Mobile Legends Community Cup',
        type: 'Group',
        players: 8,
        currentPlayers: 8,
        matches: 12,
        status: 'finished',
        startDate: '2024-01-10',
        registrationDeadline: '2024-01-05',
        description: 'Turnamen komunitas MLBB.',
        isPublic: true,
        creator: { name: 'MLBB Community', isTrusted: false },
        userStatus: 'finished' // Example: User participated and finished
    }
]

export default function Competitions() {
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState('grid')
    const [filterType, setFilterType] = useState('all') // 'all' | 'participating'

    // Logic to find the "Featured" competition
    // Priority: Trusted Creator -> Status Register -> Closest Deadline / Fewest Slots
    const featuredCompetition = publicCompetitions.find(c =>
        c.creator?.isTrusted && c.status === 'register' && c.currentPlayers < c.players
    ) || publicCompetitions.find(c => c.status === 'register')

    const filteredCompetitions = publicCompetitions.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase())

        // Filter logic based on filterType
        let matchesFilter = false;
        if (filterType === 'all') {
            // Show competitions that are 'register' or 'draft' (Open/Not Started)
            // AND implicitly public (as per original logic)
            matchesFilter = (c.status === 'register' || c.status === 'draft') && c.isPublic
        } else if (filterType === 'participating') {
            // Show competitions where userStatus exists (registered, pending, playing, finished, etc.)
            matchesFilter = !!c.userStatus
        }

        // Exclude featured competition from list if it is already displayed as highlighted (no search query)
        if (!searchQuery && featuredCompetition && c.id === featuredCompetition.id) {
            return false
        }

        return matchesSearch && matchesFilter
    })

    const getStatusColor = (status) => {
        switch (status) {
            case 'register': return 'bg-neonGreen/20 text-neonGreen'
            case 'draft': return 'bg-yellow-500/20 text-yellow-400'
            case 'ongoing': return 'bg-blue-500/20 text-blue-400'
            case 'finished': return 'bg-gray-500/20 text-gray-400'
            default: return 'bg-gray-500/20 text-gray-400'
        }
    }

    const getStatusLabel = (status) => {
        switch (status) {
            case 'register': return 'Registrasi Buka'
            case 'draft': return 'Coming Soon'
            case 'ongoing': return 'Sedang Berlangsung'
            case 'finished': return 'Selesai'
            default: return status
        }
    }

    const getUserStatusLabel = (status) => {
        switch (status) {
            case 'registered': return 'Terdaftar'
            case 'pending': return 'Menunggu Konfirmasi'
            case 'playing': return 'Sedang Main'
            case 'finished': return 'Selesai'
            default: return null
        }
    }

    const calculateProgress = (current, max) => {
        return Math.min(100, (current / max) * 100)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-display font-bold">Kompetisi Publik</h1>
                    <p className="text-gray-400 mt-1">Temukan dan ikuti turnamen yang terbuka untuk umum</p>
                </div>
            </div>

            {/* Featured Competition */}
            {featuredCompetition && !searchQuery && (
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900/50 to-purple-900/50 border border-white/10 p-6 sm:p-8">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Trophy className="w-64 h-64 rotate-12" />
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
                        <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" /> FEATURED
                                </span>
                                {featuredCompetition.creator?.isTrusted && (
                                    <span className="bg-blue-500/20 text-blue-400 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                        <ShieldCheck className="w-3 h-3" /> OFFICIAL
                                    </span>
                                )}
                            </div>

                            <div>
                                <h2 className="text-3xl font-display font-bold text-white mb-2">{featuredCompetition.name}</h2>
                                <p className="text-gray-300 max-w-xl">{featuredCompetition.description}</p>
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                                <div className="flex items-center gap-2 bg-black/20 px-3 py-2 rounded-lg">
                                    <Clock className="w-4 h-4 text-neonGreen" />
                                    <span>Deadline: {featuredCompetition.registrationDeadline}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-black/20 px-3 py-2 rounded-lg">
                                    <Users className="w-4 h-4 text-blue-400" />
                                    <span>{featuredCompetition.players - featuredCompetition.currentPlayers} Slot Tersisa</span>
                                </div>
                            </div>
                        </div>

                        <div className="w-full md:w-auto bg-black/20 backdrop-blur-sm p-6 rounded-xl border border-white/10 min-w-[300px]">
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-400">Kuota Pemain</span>
                                    <span className="text-white font-medium">{featuredCompetition.currentPlayers}/{featuredCompetition.players}</span>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                                        style={{ width: `${calculateProgress(featuredCompetition.currentPlayers, featuredCompetition.players)}%` }}
                                    ></div>
                                </div>
                                <Button
                                    className="w-full"
                                    size="lg"
                                    icon={PlayCircle}
                                    onClick={() => navigate(`/dashboard/competitions/${featuredCompetition.id}/join`)}
                                >
                                    Daftar Sekarang
                                </Button>
                                <div className="text-center">
                                    <span className="text-xs text-gray-500">Diselenggarakan oleh {featuredCompetition.creator?.name}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
                    <Input
                        placeholder="Cari kompetisi..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2">
                    {/* Filter Type Toggle */}
                    <div className="flex border border-white/10 rounded-lg overflow-hidden bg-black/20 p-1 gap-1">
                        <button
                            onClick={() => setFilterType('all')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${filterType === 'all'
                                ? 'bg-white/10 text-white shadow-sm'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            Publik
                        </button>
                        <button
                            onClick={() => setFilterType('participating')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${filterType === 'participating'
                                ? 'bg-white/10 text-white shadow-sm'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            Diikuti
                        </button>
                    </div>

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

            {/* Competitions Grid/List */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCompetitions.map((comp, index) => (
                        <React.Fragment key={comp.id}>
                            <Card className="p-6 hover:border-neonGreen/30 transition-all group flex flex-col h-full">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center group-hover:scale-110 transition">
                                        <Trophy className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(comp.status)}`}>
                                            {getStatusLabel(comp.status)}
                                        </span>
                                        {comp.creator?.isTrusted && (
                                            <span className="text-[10px] text-blue-400 flex items-center gap-1">
                                                <ShieldCheck className="w-3 h-3" /> Trusted
                                            </span>
                                        )}
                                        {comp.userStatus && (
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                                {getUserStatusLabel(comp.userStatus)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <h3 className="font-display font-bold text-lg mb-2 group-hover:text-blue-400 transition">{comp.name}</h3>
                                <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-grow">{comp.description}</p>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center justify-between text-xs text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <Users className="w-4 h-4" /> {comp.currentPlayers}/{comp.players} Peserta
                                        </span>
                                        <span>{Math.round((comp.currentPlayers / comp.players) * 100)}%</span>
                                    </div>
                                    <div className="w-full bg-white/5 rounded-full h-1.5">
                                        <div
                                            className="bg-blue-500 h-1.5 rounded-full"
                                            style={{ width: `${(comp.currentPlayers / comp.players) * 100}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" /> {comp.startDate}
                                        </span>
                                    </div>
                                </div>

                                <Button className="w-full mt-auto" icon={PlayCircle} onClick={() => {
                                    if (comp.userStatus) {
                                        navigate(`/dashboard/tournaments/${comp.id}/view`)
                                    } else {
                                        navigate(`/dashboard/competitions/${comp.id}/join`)
                                    }
                                }}>
                                    {comp.userStatus ? 'Lihat Detail' : 'Ikuti Kompetisi'}
                                </Button>
                            </Card>
                            {/* Insert AdSlot after every 3 items */}
                            {(index + 1) % 3 === 0 && (
                                <div className="col-span-full py-4">
                                    <AdSlot variant="banner" adId={`comp-grid-ad-${index}`} />
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            ) : (
                <Card hover={false} className="overflow-hidden">
                    <div className="divide-y divide-white/5">
                        {filteredCompetitions.map((comp) => (
                            <div
                                key={comp.id}
                                className="flex items-center justify-between p-4 hover:bg-white/5 transition"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                                        <Trophy className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <div className="font-medium">{comp.name}</div>
                                            {comp.creator?.isTrusted && (
                                                <ShieldCheck className="w-3 h-3 text-blue-400" />
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500">{comp.type} • {comp.description}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right hidden sm:block">
                                        <div className="text-xs text-gray-400">{comp.currentPlayers}/{comp.players} Slot</div>
                                        <div className="text-[10px] text-gray-500">Deadline: {comp.registrationDeadline}</div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(comp.status)}`}>
                                            {getStatusLabel(comp.status)}
                                        </span>
                                        {comp.userStatus && (
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                                {getUserStatusLabel(comp.userStatus)}
                                            </span>
                                        )}
                                    </div>
                                    <Button size="sm" icon={PlayCircle} onClick={() => {
                                        if (comp.userStatus) {
                                            navigate(`/dashboard/tournaments/${comp.id}/view`)
                                        } else {
                                            navigate(`/dashboard/competitions/${comp.id}/join`)
                                        }
                                    }}>
                                        {comp.userStatus ? 'Detail' : 'Ikuti'}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {filteredCompetitions.length === 0 && (
                <div className="text-center py-12">
                    <Trophy className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                    <h3 className="font-display font-bold text-xl mb-2">Belum ada kompetisi publik</h3>
                    <p className="text-gray-500 mb-6">Cek lagi nanti untuk turnamen terbaru!</p>
                </div>
            )}
        </div>
    )
}
