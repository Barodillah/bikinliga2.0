import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Trophy, Users, Calendar, BarChart2, Settings, Share2, ArrowLeft, Edit, Copy, Check, GitMerge, Grid3X3 } from 'lucide-react'
import Card, { CardContent, CardHeader } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import StandingsTable from '../../components/tournament/StandingsTable'
import MatchCard from '../../components/tournament/MatchCard'
import Bracket from '../../components/tournament/Bracket'

// Sample data - simulate different tournament types based on ID
const getTournamentData = (id) => {
    const tournaments = {
        '1': {
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
        },
        '2': {
            id: 2,
            name: 'Ramadhan Cup 2024',
            type: 'Knockout',
            status: 'active',
            players: 16,
            matches: 15,
            completed: 8,
            startDate: '2024-03-10',
            description: 'Turnamen knockout Ramadhan',
            shareLink: 'bikinliga.com/t/ramadhan-cup'
        },
        '3': {
            id: 3,
            name: 'Sunday League',
            type: 'Group+KO',
            status: 'active',
            players: 16,
            matches: 24,
            completed: 16,
            startDate: '2024-02-01',
            description: 'Group stage + knockout format',
            shareLink: 'bikinliga.com/t/sunday-league'
        }
    }
    return tournaments[id] || tournaments['1']
}

// Group Stage Component
function GroupStage({ groups }) {
    return (
        <div className="grid md:grid-cols-2 gap-6">
            {groups.map((group) => (
                <Card key={group.name} hover={false}>
                    <CardHeader className="py-3">
                        <h3 className="font-display font-bold text-neonGreen">{group.name}</h3>
                    </CardHeader>
                    <CardContent className="p-0">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/10 text-gray-400">
                                    <th className="py-2 px-3 text-left">#</th>
                                    <th className="py-2 px-3 text-left">Tim</th>
                                    <th className="py-2 px-3 text-center">P</th>
                                    <th className="py-2 px-3 text-center">W</th>
                                    <th className="py-2 px-3 text-center">D</th>
                                    <th className="py-2 px-3 text-center">L</th>
                                    <th className="py-2 px-3 text-center">GD</th>
                                    <th className="py-2 px-3 text-center">Pts</th>
                                </tr>
                            </thead>
                            <tbody>
                                {group.teams.map((team, i) => (
                                    <tr key={team.name} className={`border-b border-white/5 ${i < 2 ? 'bg-neonGreen/5' : ''}`}>
                                        <td className="py-2 px-3">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i < 2 ? 'bg-neonGreen text-black' : 'bg-white/10'
                                                }`}>
                                                {i + 1}
                                            </div>
                                        </td>
                                        <td className="py-2 px-3 font-medium">{team.name}</td>
                                        <td className="py-2 px-3 text-center text-gray-400">{team.played}</td>
                                        <td className="py-2 px-3 text-center text-neonGreen">{team.won}</td>
                                        <td className="py-2 px-3 text-center text-yellow-400">{team.drawn}</td>
                                        <td className="py-2 px-3 text-center text-red-400">{team.lost}</td>
                                        <td className="py-2 px-3 text-center">
                                            <span className={team.gd > 0 ? 'text-neonGreen' : team.gd < 0 ? 'text-red-400' : ''}>
                                                {team.gd > 0 ? '+' : ''}{team.gd}
                                            </span>
                                        </td>
                                        <td className="py-2 px-3 text-center font-display font-bold">{team.pts}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="p-2 text-xs text-gray-500 flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-neonGreen/30"></div>
                            Lolos ke Knockout Stage
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

// Enhanced Bracket for knockout tournaments
function KnockoutBracket({ rounds }) {
    return (
        <div className="overflow-x-auto pb-4">
            <div className="min-w-[800px] flex items-start justify-center gap-4">
                {rounds.map((round, roundIdx) => (
                    <div key={round.name} className="flex flex-col items-center">
                        <div className="text-sm font-medium text-gray-400 mb-4 text-center">
                            {round.name}
                        </div>
                        <div className="space-y-4" style={{ marginTop: roundIdx * 40 }}>
                            {round.matches.map((match) => (
                                <div
                                    key={match.id}
                                    className={`w-48 bg-cardBg border rounded-lg overflow-hidden ${round.name === 'Final' ? 'border-yellow-500/50' : 'border-white/10'
                                        }`}
                                >
                                    <div className={`flex items-center justify-between p-2 border-b border-white/5 ${match.homeWin ? 'bg-neonGreen/10' : ''
                                        }`}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded bg-blue-500/30 flex items-center justify-center text-xs font-bold">
                                                {match.home?.charAt(0) || '?'}
                                            </div>
                                            <span className={`text-sm ${match.homeWin ? 'font-bold text-neonGreen' : ''}`}>
                                                {match.home || 'TBD'}
                                            </span>
                                        </div>
                                        <span className={`font-display font-bold ${match.homeWin ? 'text-neonGreen' : 'text-gray-400'}`}>
                                            {match.homeScore ?? '-'}
                                        </span>
                                    </div>
                                    <div className={`flex items-center justify-between p-2 ${match.awayWin ? 'bg-neonGreen/10' : ''
                                        }`}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded bg-red-500/30 flex items-center justify-center text-xs font-bold">
                                                {match.away?.charAt(0) || '?'}
                                            </div>
                                            <span className={`text-sm ${match.awayWin ? 'font-bold text-neonGreen' : ''}`}>
                                                {match.away || 'TBD'}
                                            </span>
                                        </div>
                                        <span className={`font-display font-bold ${match.awayWin ? 'text-neonGreen' : 'text-gray-400'}`}>
                                            {match.awayScore ?? '-'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Champion */}
                <div className="flex flex-col items-center" style={{ marginTop: 80 }}>
                    <div className="text-sm font-medium text-yellow-400 mb-4">🏆 Juara</div>
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                        <Trophy className="w-10 h-10 text-white" />
                    </div>
                    <div className="mt-2 text-center font-display font-bold">TBD</div>
                </div>
            </div>
        </div>
    )
}

// Sample group stage data
const groupsData = [
    {
        name: 'Group A',
        teams: [
            { name: 'Barcelona', played: 3, won: 3, drawn: 0, lost: 0, gd: 7, pts: 9 },
            { name: 'Arsenal', played: 3, won: 2, drawn: 0, lost: 1, gd: 2, pts: 6 },
            { name: 'PSG', played: 3, won: 1, drawn: 0, lost: 2, gd: -3, pts: 3 },
            { name: 'Ajax', played: 3, won: 0, drawn: 0, lost: 3, gd: -6, pts: 0 },
        ]
    },
    {
        name: 'Group B',
        teams: [
            { name: 'Real Madrid', played: 3, won: 2, drawn: 1, lost: 0, gd: 5, pts: 7 },
            { name: 'Liverpool', played: 3, won: 2, drawn: 0, lost: 1, gd: 3, pts: 6 },
            { name: 'Juventus', played: 3, won: 1, drawn: 0, lost: 2, gd: -2, pts: 3 },
            { name: 'Porto', played: 3, won: 0, drawn: 1, lost: 2, gd: -6, pts: 1 },
        ]
    },
    {
        name: 'Group C',
        teams: [
            { name: 'Man United', played: 3, won: 2, drawn: 1, lost: 0, gd: 4, pts: 7 },
            { name: 'Bayern', played: 3, won: 2, drawn: 1, lost: 0, gd: 3, pts: 7 },
            { name: 'Inter', played: 3, won: 1, drawn: 0, lost: 2, gd: -1, pts: 3 },
            { name: 'Benfica', played: 3, won: 0, drawn: 0, lost: 3, gd: -6, pts: 0 },
        ]
    },
    {
        name: 'Group D',
        teams: [
            { name: 'Man City', played: 3, won: 3, drawn: 0, lost: 0, gd: 8, pts: 9 },
            { name: 'Chelsea', played: 3, won: 1, drawn: 1, lost: 1, gd: 1, pts: 4 },
            { name: 'Dortmund', played: 3, won: 1, drawn: 1, lost: 1, gd: 0, pts: 4 },
            { name: 'Napoli', played: 3, won: 0, drawn: 0, lost: 3, gd: -9, pts: 0 },
        ]
    }
]

// Sample knockout bracket data
const knockoutRounds = [
    {
        name: 'Quarter Finals',
        matches: [
            { id: 1, home: 'Barcelona', away: 'Liverpool', homeScore: 3, awayScore: 1, homeWin: true },
            { id: 2, home: 'Real Madrid', away: 'Arsenal', homeScore: 2, awayScore: 2, pen: '4-3', homeWin: true },
            { id: 3, home: 'Man United', away: 'Man City', homeScore: 1, awayScore: 2, awayWin: true },
            { id: 4, home: 'Bayern', away: 'Chelsea', homeScore: 3, awayScore: 0, homeWin: true },
        ]
    },
    {
        name: 'Semi Finals',
        matches: [
            { id: 5, home: 'Barcelona', away: 'Real Madrid', homeScore: 2, awayScore: 1, homeWin: true },
            { id: 6, home: 'Man City', away: 'Bayern', homeScore: null, awayScore: null },
        ]
    },
    {
        name: 'Final',
        matches: [
            { id: 7, home: 'Barcelona', away: null, homeScore: null, awayScore: null },
        ]
    },
]

export default function TournamentDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('overview')
    const [copied, setCopied] = useState(false)

    const tournamentData = getTournamentData(id)
    const isKnockout = tournamentData.type === 'Knockout'
    const isGroupKO = tournamentData.type === 'Group+KO'
    const isLeague = tournamentData.type === 'Liga'

    // Dynamic tabs based on tournament type
    const getTabs = () => {
        const baseTabs = [
            { id: 'overview', label: 'Overview', icon: Trophy },
        ]

        if (isLeague) {
            baseTabs.push({ id: 'standings', label: 'Klasemen', icon: BarChart2 })
        }

        if (isGroupKO) {
            baseTabs.push({ id: 'groups', label: 'Group Stage', icon: Grid3X3 })
            baseTabs.push({ id: 'bracket', label: 'Knockout', icon: GitMerge })
        }

        if (isKnockout) {
            baseTabs.push({ id: 'bracket', label: 'Bracket', icon: GitMerge })
        }

        baseTabs.push({ id: 'fixtures', label: 'Jadwal', icon: Calendar })
        baseTabs.push({ id: 'players', label: 'Pemain', icon: Users })

        return baseTabs
    }

    const tabs = getTabs()

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
                                <span className={`text-sm px-2 py-0.5 rounded ${isKnockout ? 'bg-neonPink/20 text-neonPink' :
                                        isGroupKO ? 'bg-blue-500/20 text-blue-400' :
                                            'bg-gray-500/20 text-gray-300'
                                    }`}>
                                    {tournamentData.type}
                                </span>
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

            {/* Overview - different based on type */}
            {activeTab === 'overview' && (
                <div className="grid lg:grid-cols-2 gap-6">
                    {isLeague && (
                        <Card hover={false}>
                            <CardHeader>
                                <h3 className="font-display font-bold">Klasemen Sementara</h3>
                            </CardHeader>
                            <CardContent className="p-0">
                                <StandingsTable compact />
                            </CardContent>
                        </Card>
                    )}

                    {(isKnockout || isGroupKO) && (
                        <Card hover={false}>
                            <CardHeader>
                                <h3 className="font-display font-bold flex items-center gap-2">
                                    <GitMerge className="w-5 h-5 text-neonPink" />
                                    Bracket Preview
                                </h3>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="text-sm text-gray-400 mb-2">Semi Finals</div>
                                    <MatchCard home="Barcelona" away="Real Madrid" homeScore={2} awayScore={1} status="completed" />
                                    <MatchCard home="Man City" away="Bayern" time="TBD" status="upcoming" />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {isGroupKO && (
                        <Card hover={false}>
                            <CardHeader>
                                <h3 className="font-display font-bold flex items-center gap-2">
                                    <Grid3X3 className="w-5 h-5 text-blue-400" />
                                    Group Stage Status
                                </h3>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-3">
                                    {groupsData.slice(0, 4).map(group => (
                                        <div key={group.name} className="p-3 bg-white/5 rounded-lg">
                                            <div className="text-sm font-bold text-neonGreen mb-2">{group.name}</div>
                                            <div className="text-xs text-gray-400">
                                                {group.teams[0].name} & {group.teams[1].name}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">lolos ke knockout</div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

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

            {/* Standings - Liga only */}
            {activeTab === 'standings' && isLeague && (
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

            {/* Group Stage - Group+KO only */}
            {activeTab === 'groups' && isGroupKO && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="font-display font-bold text-xl flex items-center gap-2">
                            <Grid3X3 className="w-6 h-6 text-blue-400" />
                            Group Stage
                        </h3>
                        <div className="text-sm text-gray-400">
                            Top 2 dari setiap grup lolos ke Knockout Stage
                        </div>
                    </div>
                    <GroupStage groups={groupsData} />
                </div>
            )}

            {/* Bracket - Knockout & Group+KO */}
            {activeTab === 'bracket' && (isKnockout || isGroupKO) && (
                <div className="space-y-6">
                    <Card hover={false}>
                        <CardHeader className="flex items-center justify-between">
                            <h3 className="font-display font-bold flex items-center gap-2">
                                <GitMerge className="w-5 h-5 text-neonPink" />
                                {isGroupKO ? 'Knockout Stage' : 'Tournament Bracket'}
                            </h3>
                            <Button variant="ghost" size="sm">Export Gambar</Button>
                        </CardHeader>
                        <CardContent>
                            <KnockoutBracket rounds={knockoutRounds} />
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Fixtures */}
            {activeTab === 'fixtures' && (
                <div className="space-y-6">
                    <Card className="p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-display font-bold">
                                {isKnockout ? 'Quarter Finals' : isGroupKO ? 'Knockout Round' : 'Matchweek 5'}
                            </h3>
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

            {/* Players */}
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
