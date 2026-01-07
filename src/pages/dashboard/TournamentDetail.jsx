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
        },
        '4': {
            id: 4,
            name: 'Merdeka Tournament',
            type: 'Liga',
            status: 'draft',
            players: 24,
            matches: 0,
            completed: 0,
            startDate: '2024-08-17',
            description: 'Turnamen kemerdekaan (Draft Mode)',
            shareLink: 'bikinliga.com/t/merdeka-cup'
        }
    }
    return tournaments[id] || tournaments['1']
}

// ... existing components ...

export default function TournamentDetail() {
    const { id } = useParams()
    const navigate = useNavigate()

    // Get data
    const tournamentData = getTournamentData(id)
    const isKnockout = tournamentData.type === 'Knockout'
    const isGroupKO = tournamentData.type === 'Group+KO'
    const isLeague = tournamentData.type === 'Liga'

    // Check if draft
    const isDraft = tournamentData.status === 'draft'

    // Initialize state - default to 'players' if draft
    const [activeTab, setActiveTab] = useState(isDraft ? 'players' : 'overview')
    const [copied, setCopied] = useState(false)

    // Dynamic tabs based on tournament type and status
    const getTabs = () => {
        // If draft, only show Overview and Players
        if (isDraft) {
            return [
                { id: 'overview', label: 'Overview', icon: Trophy },
                { id: 'players', label: 'Pemain', icon: Users }
            ]
        }

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
        <div className="space-y-4 md:space-y-6 overflow-x-hidden">
            {/* Header */}
            <div className="space-y-4">
                <button
                    onClick={() => navigate('/dashboard/tournaments')}
                    className="text-gray-400 hover:text-white flex items-center gap-2 transition text-sm"
                >
                    <ArrowLeft className="w-4 h-4" /> Kembali ke daftar
                </button>

                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-r from-neonGreen/20 to-neonPink/20 flex items-center justify-center flex-shrink-0">
                            <Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-neonGreen" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold truncate">{tournamentData.name}</h1>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className={`text-xs sm:text-sm px-2 py-0.5 rounded ${isKnockout ? 'bg-neonPink/20 text-neonPink' :
                                    isGroupKO ? 'bg-blue-500/20 text-blue-400' :
                                        'bg-gray-500/20 text-gray-300'
                                    }`}>
                                    {tournamentData.type}
                                </span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-neonGreen/20 text-neonGreen">Aktif</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 sm:gap-3 flex-shrink-0">
                        <Button variant="secondary" size="sm" onClick={copyShareLink}>
                            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                            <span className="hidden sm:inline">{copied ? 'Tersalin!' : 'Share'}</span>
                        </Button>
                        <Button variant="ghost" size="sm">
                            <Settings className="w-4 h-4" />
                            <span className="hidden sm:inline">Pengaturan</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Share Link */}
            <Card className="p-3 sm:p-4">
                <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <div className="text-xs sm:text-sm text-gray-400 mb-1">Link Publik</div>
                        <div className="font-mono text-xs sm:text-sm text-neonGreen truncate">{tournamentData.shareLink}</div>
                    </div>
                    <button
                        onClick={copyShareLink}
                        className="p-2 rounded-lg hover:bg-white/10 transition flex-shrink-0"
                    >
                        {copied ? <Check className="w-5 h-5 text-neonGreen" /> : <Copy className="w-5 h-5 text-gray-400" />}
                    </button>
                </div>
            </Card>

            {/* Quick Stats - always 2x2 grid (Hidden in Draft) */}
            {!isDraft && (
                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    <Card className="p-3 sm:p-4 text-center">
                        <Users className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-neonPink" />
                        <div className="text-xl sm:text-2xl font-display font-bold">{tournamentData.players}</div>
                        <div className="text-xs text-gray-500">Pemain</div>
                    </Card>
                    <Card className="p-3 sm:p-4 text-center">
                        <Calendar className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-blue-400" />
                        <div className="text-xl sm:text-2xl font-display font-bold">{tournamentData.matches}</div>
                        <div className="text-xs text-gray-500">Total Match</div>
                    </Card>
                    <Card className="p-3 sm:p-4 text-center">
                        <BarChart2 className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-neonGreen" />
                        <div className="text-xl sm:text-2xl font-display font-bold">{tournamentData.completed}</div>
                        <div className="text-xs text-gray-500">Selesai</div>
                    </Card>
                    <Card className="p-3 sm:p-4 text-center">
                        <Trophy className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-yellow-400" />
                        <div className="text-xl sm:text-2xl font-display font-bold">{Math.round((tournamentData.completed / tournamentData.matches) * 100)}%</div>
                        <div className="text-xs text-gray-500">Progress</div>
                    </Card>
                </div>
            )}

            {/* Draft Mode Notice */}
            {isDraft && (
                <Card className="p-6 text-center border-yellow-500/20 bg-yellow-500/5">
                    <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-3">
                        <Settings className="w-6 h-6 text-yellow-500" />
                    </div>
                    <h3 className="font-display font-bold text-lg text-yellow-500 mb-2">Turnamen dalam Mode Draft</h3>
                    <p className="text-gray-400 text-sm max-w-sm mx-auto mb-4">
                        Tambahkan pemain dan atur jadwal pertandingan untuk memulai turnamen ini.
                    </p>
                    <Button onClick={() => setActiveTab('players')} size="sm">
                        Kelola Pemain
                    </Button>
                </Card>
            )}

            {/* Tabs */}
            <div className="border-b border-white/10 -mx-4 px-4 lg:mx-0 lg:px-0">
                <div className="flex gap-1 overflow-x-auto scrollbar-hide">
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
                <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
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
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <h3 className="font-display font-bold text-lg flex items-center gap-2">
                            <Grid3X3 className="w-5 h-5 text-blue-400" />
                            Group Stage
                        </h3>
                        <div className="text-xs sm:text-sm text-gray-400">
                            Top 2 dari setiap grup lolos ke Knockout Stage
                        </div>
                    </div>
                    <GroupStage groups={groupsData} />
                </div>
            )}

            {/* Bracket - Knockout & Group+KO */}
            {activeTab === 'bracket' && (isKnockout || isGroupKO) && (
                <Card hover={false}>
                    <CardHeader className="flex items-center justify-between">
                        <h3 className="font-display font-bold flex items-center gap-2">
                            <GitMerge className="w-5 h-5 text-neonPink" />
                            {isGroupKO ? 'Knockout Stage' : 'Tournament Bracket'}
                        </h3>
                        <Button variant="ghost" size="sm">Export Gambar</Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <KnockoutBracket rounds={knockoutRounds} />
                    </CardContent>
                </Card>
            )}

            {/* Fixtures */}
            {activeTab === 'fixtures' && (
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
