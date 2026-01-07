import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Trophy, Users, Calendar, BarChart2, Settings, Share2, ArrowLeft, Edit, Copy, Check } from 'lucide-react'
import Card, { CardContent, CardHeader } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import StandingsTable from '../../components/tournament/StandingsTable'
import MatchCard from '../../components/tournament/MatchCard'

// Sample data
const tournamentData = {
    id: 1,
    name: 'Warkop Cup Season 5',
    type: 'Liga',
    status: 'active',
    players: 8,
    matches: 28,
    completed: 12,
    startDate: '2024-01-15',
    description: 'Turnamen eFootball antar pemain regular warkop',
    shareLink: 'bikinliga.com/t/warkop-cup-5'
}

export default function TournamentDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('overview')
    const [copied, setCopied] = useState(false)

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Trophy },
        { id: 'standings', label: 'Klasemen', icon: BarChart2 },
        { id: 'fixtures', label: 'Jadwal', icon: Calendar },
        { id: 'players', label: 'Pemain', icon: Users },
    ]

    const copyShareLink = () => {
        navigator.clipboard.writeText(tournamentData.shareLink)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div>
                    <button
                        onClick={() => navigate('/dashboard/tournaments')}
                        className="text-gray-400 hover:text-white flex items-center gap-2 mb-4 transition"
                    >
                        <ArrowLeft className="w-4 h-4" /> Kembali ke daftar
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-neonGreen/20 to-neonPink/20 flex items-center justify-center">
                            <Trophy className="w-7 h-7 text-neonGreen" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-display font-bold">{tournamentData.name}</h1>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-gray-400">{tournamentData.type}</span>
                                <span className="text-xs px-2 py-1 rounded-full bg-neonGreen/20 text-neonGreen">Aktif</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={copyShareLink}>
                        {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                        {copied ? 'Tersalin!' : 'Share'}
                    </Button>
                    <Button variant="ghost">
                        <Settings className="w-4 h-4" />
                        Pengaturan
                    </Button>
                </div>
            </div>

            {/* Share Link */}
            <Card className="p-4">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <div className="text-sm text-gray-400 mb-1">Link Publik</div>
                        <div className="font-mono text-sm text-neonGreen">{tournamentData.shareLink}</div>
                    </div>
                    <button
                        onClick={copyShareLink}
                        className="p-2 rounded-lg hover:bg-white/10 transition"
                    >
                        {copied ? <Check className="w-5 h-5 text-neonGreen" /> : <Copy className="w-5 h-5 text-gray-400" />}
                    </button>
                </div>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 text-center">
                    <Users className="w-6 h-6 mx-auto mb-2 text-neonPink" />
                    <div className="text-2xl font-display font-bold">{tournamentData.players}</div>
                    <div className="text-xs text-gray-500">Pemain</div>
                </Card>
                <Card className="p-4 text-center">
                    <Calendar className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                    <div className="text-2xl font-display font-bold">{tournamentData.matches}</div>
                    <div className="text-xs text-gray-500">Total Match</div>
                </Card>
                <Card className="p-4 text-center">
                    <BarChart2 className="w-6 h-6 mx-auto mb-2 text-neonGreen" />
                    <div className="text-2xl font-display font-bold">{tournamentData.completed}</div>
                    <div className="text-xs text-gray-500">Selesai</div>
                </Card>
                <Card className="p-4 text-center">
                    <Trophy className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
                    <div className="text-2xl font-display font-bold">{Math.round((tournamentData.completed / tournamentData.matches) * 100)}%</div>
                    <div className="text-xs text-gray-500">Progress</div>
                </Card>
            </div>

            {/* Tabs */}
            <div className="border-b border-white/10">
                <div className="flex gap-1 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${activeTab === tab.id
                                    ? 'border-neonGreen text-neonGreen'
                                    : 'border-transparent text-gray-400 hover:text-white'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="grid lg:grid-cols-2 gap-6">
                    <Card hover={false}>
                        <CardHeader>
                            <h3 className="font-display font-bold">Klasemen Sementara</h3>
                        </CardHeader>
                        <CardContent className="p-0">
                            <StandingsTable compact />
                        </CardContent>
                    </Card>
                    <Card hover={false}>
                        <CardHeader>
                            <h3 className="font-display font-bold">Pertandingan Terakhir</h3>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <MatchCard home="FCB" away="MU" homeScore={3} awayScore={1} status="completed" />
                            <MatchCard home="RMA" away="ARS" homeScore={2} awayScore={2} status="completed" />
                            <MatchCard home="LIV" away="CHE" homeScore={1} awayScore={0} status="completed" />
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === 'standings' && (
                <Card hover={false}>
                    <CardHeader className="flex items-center justify-between">
                        <h3 className="font-display font-bold">Klasemen Liga</h3>
                        <Button variant="ghost" size="sm">Export Gambar</Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <StandingsTable />
                    </CardContent>
                </Card>
            )}

            {activeTab === 'fixtures' && (
                <div className="space-y-6">
                    <Card className="p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-display font-bold">Matchweek 5</h3>
                            <span className="text-sm text-gray-400">4 pertandingan</span>
                        </div>
                        <div className="space-y-3">
                            <MatchCard home="FCB" away="RMA" time="Hari ini, 20:00" status="upcoming" />
                            <MatchCard home="MU" away="ARS" time="Besok, 19:30" status="upcoming" />
                            <MatchCard home="LIV" away="CHE" time="Besok, 21:00" status="upcoming" />
                            <MatchCard home="PSG" away="BAY" time="Sabtu, 20:00" status="upcoming" />
                        </div>
                    </Card>
                </div>
            )}

            {activeTab === 'players' && (
                <Card hover={false}>
                    <CardHeader className="flex items-center justify-between">
                        <h3 className="font-display font-bold">Daftar Pemain</h3>
                        <Button size="sm">Tambah Pemain</Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-white/5">
                            {['Barcelona FC', 'Real Madrid', 'Manchester United', 'Arsenal', 'Liverpool', 'Chelsea', 'PSG', 'Bayern Munich'].map((team, i) => (
                                <div key={team} className="flex items-center justify-between p-4 hover:bg-white/5 transition">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-neonGreen/30 to-neonPink/30 flex items-center justify-center font-bold">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <div className="font-medium">{team}</div>
                                            <div className="text-xs text-gray-500">Player_{i + 1}</div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm">
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
