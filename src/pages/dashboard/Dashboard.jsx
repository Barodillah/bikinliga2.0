import React from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trophy, Calendar, Users, TrendingUp, ArrowRight, BarChart2 } from 'lucide-react'
import Card, { CardContent, CardHeader } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import AdSlot from '../../components/ui/AdSlot'

// Sample data  
const recentTournaments = [
    { id: 1, name: 'Warkop Cup Season 5', type: 'Liga', players: 16, status: 'active', matches: 12 },
    { id: 2, name: 'Ramadhan Cup 2024', type: 'Knockout', players: 32, status: 'completed', matches: 31 },
    { id: 3, name: 'Sunday League', type: 'Liga', players: 8, status: 'active', matches: 4 },
]

const upcomingMatches = [
    { id: 1, home: 'FCB', away: 'RMA', time: 'Hari ini, 20:00', tournament: 'Warkop Cup' },
    { id: 2, home: 'MU', away: 'ARS', time: 'Besok, 19:30', tournament: 'Warkop Cup' },
    { id: 3, home: 'LIV', away: 'CHE', time: 'Besok, 21:00', tournament: 'Sunday League' },
]

const stats = [
    { label: 'Total Turnamen', value: 5, icon: Trophy, color: 'text-neonGreen' },
    { label: 'Pertandingan', value: 47, icon: BarChart2, color: 'text-neonPink' },
    { label: 'Pemain Terdaftar', value: 64, icon: Users, color: 'text-blue-400' },
    { label: 'Aktif Minggu Ini', value: 12, icon: TrendingUp, color: 'text-yellow-400' },
]

export default function Dashboard() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-display font-bold">Dashboard</h1>
                    <p className="text-gray-400 mt-1">Selamat datang kembali di BikinLiga!</p>
                </div>
                <Link to="/dashboard/tournaments/new">
                    <Button icon={Plus}>Buat Turnamen Baru</Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <Card key={stat.label} className="p-6">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-2xl font-display font-bold">{stat.value}</div>
                                <div className="text-sm text-gray-400">{stat.label}</div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Ad Slot - Banner */}
            <AdSlot variant="banner" adId="dashboard-main" />

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Recent Tournaments */}
                <Card hover={false}>
                    <CardHeader className="flex items-center justify-between">
                        <h2 className="text-lg font-display font-bold">Turnamen Terbaru</h2>
                        <Link to="/dashboard/tournaments" className="text-sm text-neonGreen hover:text-neonGreen/80 flex items-center gap-1">
                            Lihat Semua <ArrowRight className="w-4 h-4" />
                        </Link>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-white/5">
                            {recentTournaments.map((tournament) => (
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
                                            <div className="text-xs text-gray-500">{tournament.type} • {tournament.players} Pemain</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-xs px-2 py-1 rounded-full ${tournament.status === 'active'
                                            ? 'bg-neonGreen/20 text-neonGreen'
                                            : 'bg-gray-500/20 text-gray-400'
                                            }`}>
                                            {tournament.status === 'active' ? 'Aktif' : 'Selesai'}
                                        </span>
                                        <div className="text-xs text-gray-500 mt-1">{tournament.matches} pertandingan</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Upcoming Matches */}
                <Card hover={false}>
                    <CardHeader className="flex items-center justify-between">
                        <h2 className="text-lg font-display font-bold">Pertandingan Mendatang</h2>
                        <Link to="#" className="text-sm text-neonGreen hover:text-neonGreen/80 flex items-center gap-1">
                            Lihat Semua <ArrowRight className="w-4 h-4" />
                        </Link>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-white/5">
                            {upcomingMatches.map((match) => (
                                <div key={match.id} className="p-4 hover:bg-white/5 transition">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs text-gray-500">{match.tournament}</span>
                                        <span className="text-xs text-neonPink">{match.time}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">
                                                {match.home.charAt(0)}
                                            </div>
                                            <span className="font-medium">{match.home}</span>
                                        </div>
                                        <div className="text-gray-500 font-display font-bold">VS</div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-medium">{match.away}</span>
                                            <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-xs font-bold">
                                                {match.away.charAt(0)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card className="p-6">
                <h2 className="text-lg font-display font-bold mb-4">Aksi Cepat</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link to="/dashboard/tournaments/new" className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition text-center">
                        <Plus className="w-8 h-8 mx-auto mb-2 text-neonGreen" />
                        <div className="text-sm font-medium">Buat Turnamen</div>
                    </Link>
                    <Link to="#" className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition text-center">
                        <Users className="w-8 h-8 mx-auto mb-2 text-neonPink" />
                        <div className="text-sm font-medium">Tambah Pemain</div>
                    </Link>
                    <Link to="#" className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition text-center">
                        <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                        <div className="text-sm font-medium">Atur Jadwal</div>
                    </Link>
                    <Link to="#" className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition text-center">
                        <BarChart2 className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                        <div className="text-sm font-medium">Lihat Statistik</div>
                    </Link>
                </div>
            </Card>
        </div>
    )
}
