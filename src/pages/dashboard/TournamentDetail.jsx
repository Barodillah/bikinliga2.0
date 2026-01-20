
import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Trophy, Users, Calendar, BarChart2, Settings, Share2, ArrowLeft, Edit, Copy, Check, GitMerge, Grid3X3, UserPlus, Clock, CheckCircle, XCircle, CreditCard, TrendingUp, Activity, Info, Newspaper, Plus, Trash2 } from 'lucide-react'
import Card, { CardContent, CardHeader } from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import Input, { Textarea } from '../../components/ui/Input'
import StandingsTable from '../../components/tournament/StandingsTable'
import TopScorerList from '../../components/tournament/TopScorerList'
import TournamentStatistics from '../../components/tournament/TournamentStatistics'
import MatchCard from '../../components/tournament/MatchCard'
import Bracket from '../../components/tournament/Bracket'
import AdSlot from '../../components/ui/AdSlot'

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
            shareLink: 'bikinliga.com/t/warkop-cup-5',
            pointSystem: '3-1-0',
            homeAway: true,
            visibility: 'public',
            paymentMode: 'manual',
            lastRegistrationDate: '2024-01-10'
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
            name: 'Weekend Warriors Cup',
            type: 'Liga',
            status: 'draft',
            players: 0,
            matches: 0,
            completed: 0,
            startDate: '2024-04-01',
            description: 'Turnamen akhir pekan untuk komunitas gaming',
            shareLink: 'bikinliga.com/t/weekend-warriors'
        }
    }
    return tournaments[id] || tournaments['1']
}

// Sample draft players data
const draftPlayersData = [
    { id: 1, name: 'Ahmad Fadli', team: 'Barcelona FC', status: 'approved', paymentStatus: 'paid', registeredAt: '2024-03-25' },
    { id: 2, name: 'Budi Santoso', team: 'Real Madrid', status: 'approved', paymentStatus: 'unpaid', registeredAt: '2024-03-26' },
    { id: 3, name: 'Candra Wijaya', team: 'Manchester United', status: 'queued', paymentStatus: 'unpaid', registeredAt: '2024-03-27' },
    { id: 4, name: 'Deni Pratama', team: 'Arsenal', status: 'queued', paymentStatus: 'unpaid', registeredAt: '2024-03-27' },
    { id: 5, name: 'Eko Saputra', team: 'Liverpool', status: 'rejected', paymentStatus: 'unpaid', registeredAt: '2024-03-26' },
    { id: 6, name: 'Fajar Ramadhan', team: 'Chelsea', status: 'approved', paymentStatus: 'paid', registeredAt: '2024-03-25' },
    { id: 7, name: 'Gilang Permana', team: 'PSG', status: 'queued', paymentStatus: 'unpaid', registeredAt: '2024-03-28' },
    { id: 8, name: 'Hadi Kusuma', team: 'Bayern Munich', status: 'rejected', paymentStatus: 'unpaid', registeredAt: '2024-03-24' },
]

// Draft Players List Component
function DraftPlayerList({ players, tournamentId, navigate }) {
    const [filter, setFilter] = useState('all')

    const filteredPlayers = filter === 'all'
        ? players
        : players.filter(p => p.status === filter)

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-neonGreen/20 text-neonGreen">
                        <CheckCircle className="w-3 h-3" /> Approved
                    </span>
                )
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                        <XCircle className="w-3 h-3" /> Rejected
                    </span>
                )
            case 'queued':
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                        <Clock className="w-3 h-3" /> Queued
                    </span>
                )
        }
    }

    const getPaymentBadge = (paymentStatus) => {
        if (paymentStatus === 'paid') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                    <CreditCard className="w-3 h-3" /> Paid
                </span>
            )
        }
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">
                <CreditCard className="w-3 h-3" /> Unpaid
            </span>
        )
    }

    const statusCounts = {
        all: players.length,
        queued: players.filter(p => p.status === 'queued').length,
        approved: players.filter(p => p.status === 'approved').length,
        rejected: players.filter(p => p.status === 'rejected').length,
    }

    return (
        <Card hover={false}>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h3 className="font-display font-bold flex items-center gap-2">
                        <Users className="w-5 h-5 text-neonGreen" />
                        Daftar Pendaftar
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">Kelola pemain yang mendaftar di turnamen ini</p>
                </div>
                <Button size="sm" onClick={() => navigate(`/dashboard/tournaments/${tournamentId}/players/add`)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Tambah Pemain
                </Button>
            </CardHeader>
            <CardContent>
                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-white/10">
                    {['all', 'queued', 'approved', 'rejected'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${filter === status
                                ? 'bg-neonGreen/20 text-neonGreen'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            {status === 'all' ? 'Semua' : status.charAt(0).toUpperCase() + status.slice(1)}
                            <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs bg-white/10">
                                {statusCounts[status]}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Players List */}
                {filteredPlayers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Belum ada pemain dengan status ini</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {filteredPlayers.map((player) => (
                            <div key={player.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-neonGreen/30 to-neonPink/30 flex items-center justify-center font-bold text-sm">
                                        {player.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-medium">{player.name}</div>
                                        <div className="text-xs text-gray-500">{player.team}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                                    {getStatusBadge(player.status)}
                                    {getPaymentBadge(player.paymentStatus)}
                                    <div className="text-xs text-gray-500">
                                        {new Date(player.registeredAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                    </div>
                                    <Button variant="ghost" size="sm">
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

// Group Stage Component
function GroupStage({ groups }) {
    return (
        <div className="grid md:grid-cols-2 gap-6">
            {groups.map((group) => (
                <Card key={group.name} hover={false} className="min-w-0">
                    <CardHeader className="py-3">
                        <h3 className="font-display font-bold text-neonGreen">{group.name}</h3>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto scroll-container">
                        <table className="w-full text-sm" style={{ minWidth: '500px' }}>
                            <thead>
                                <tr className="border-b border-white/10 text-gray-400">
                                    <th className="py-2 px-1 text-center w-8 sticky left-0 z-10 bg-[#0a0a0a]">#</th>
                                    <th className="py-2 px-1 text-left sticky left-8 z-10 bg-[#0a0a0a] border-r border-white/5 shadow-xl w-12 md:w-32">Tim</th>
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
                                        <td className="py-2 px-1 sticky left-0 z-10 bg-[#0a0a0a]">
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${i < 2 ? 'bg-neonGreen text-black' : 'bg-white/10'
                                                }`}>
                                                {i + 1}
                                            </div>
                                        </td>
                                        <td className="py-2 px-1 font-medium sticky left-8 z-10 bg-[#0a0a0a] border-r border-white/5 shadow-xl w-12 md:w-32 whitespace-normal leading-tight text-[10px] md:text-sm break-words">{team.name}</td>
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
    const tournamentData = getTournamentData(id)
    const isDraft = tournamentData.status === 'draft'

    const [activeTab, setActiveTab] = useState(isDraft ? 'players' : 'overview')
    const [copied, setCopied] = useState(false)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

    // League News State
    const [isNewsModalOpen, setIsNewsModalOpen] = useState(false)
    const [newsList, setNewsList] = useState([
        { id: 1, title: 'Selamat Datang di Turnamen!', content: 'Terima kasih telah mendaftar. Pantau terus tab ini untuk informasi terbaru seputar jadwal dan peraturan.', date: '2024-01-15' }
    ])
    const [newNews, setNewNews] = useState({ title: '', content: '' })

    const isKnockout = tournamentData.type === 'Knockout'
    const isGroupKO = tournamentData.type === 'Group+KO'
    const isLeague = tournamentData.type === 'Liga'

    // Dynamic tabs based on tournament type
    const getTabs = () => {
        // Draft tournaments only show players tab
        if (isDraft) {
            return [
                { id: 'players', label: 'Pendaftar', icon: Users },
                { id: 'news', label: 'League News', icon: Newspaper },
            ]
        }

        const baseTabs = [
            { id: 'overview', label: 'Overview', icon: Trophy },
            { id: 'news', label: 'League News', icon: Newspaper },
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


        baseTabs.push({ id: 'top_scores', label: 'Top Score', icon: TrendingUp })
        baseTabs.push({ id: 'statistics', label: 'Statistic', icon: Activity })
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

    const handleMatchClick = (matchId = 1) => {
        navigate(`/dashboard/tournaments/${id}/match/${matchId}`)
    }

    const handleSaveNews = (e) => {
        e.preventDefault()
        if (!newNews.title || !newNews.content) return

        const newsItem = {
            id: Date.now(),
            title: newNews.title,
            content: newNews.content,
            date: new Date().toISOString().split('T')[0]
        }

        setNewsList([newsItem, ...newsList])
        setNewNews({ title: '', content: '' })
        setIsNewsModalOpen(false)
    }

    const handleDeleteNews = (newsId) => {
        if (window.confirm('Hapus berita ini?')) {
            setNewsList(newsList.filter(n => n.id !== newsId))
        }
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
                                <span className={`text-xs px-2 py-0.5 rounded-full ${isDraft
                                    ? 'bg-yellow-500/20 text-yellow-400'
                                    : 'bg-neonGreen/20 text-neonGreen'
                                    }`}>
                                    {isDraft ? 'Draft' : 'Aktif'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 sm:gap-3 flex-shrink-0">
                        <Button variant="secondary" size="sm" onClick={copyShareLink}>
                            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                            <span className="hidden sm:inline">{copied ? 'Tersalin!' : 'Share'}</span>
                        </Button>
                        {isDraft ? (
                            <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/tournaments/${id}/settings`)}>
                                <Settings className="w-4 h-4" />
                                <span className="hidden sm:inline">Pengaturan</span>
                            </Button>
                        ) : (
                            <Button variant="ghost" size="sm" onClick={() => setIsDetailModalOpen(true)}>
                                <Info className="w-4 h-4" />
                                <span className="hidden sm:inline">Detail</span>
                            </Button>
                        )}
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

            {/* Ad Slot */}
            <AdSlot variant="banner" adId="tournament-detail" />

            {/* Quick Stats - different for draft vs active */}
            {isDraft ? (
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    <Card className="p-3 sm:p-4 text-center">
                        <Clock className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-yellow-400" />
                        <div className="text-xl sm:text-2xl font-display font-bold">
                            {draftPlayersData.filter(p => p.status === 'queued').length}
                        </div>
                        <div className="text-xs text-gray-500">Menunggu</div>
                    </Card>
                    <Card className="p-3 sm:p-4 text-center">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-neonGreen" />
                        <div className="text-xl sm:text-2xl font-display font-bold">
                            {draftPlayersData.filter(p => p.status === 'approved').length}
                        </div>
                        <div className="text-xs text-gray-500">Diterima</div>
                    </Card>
                    <Card className="p-3 sm:p-4 text-center">
                        <XCircle className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-red-400" />
                        <div className="text-xl sm:text-2xl font-display font-bold">
                            {draftPlayersData.filter(p => p.status === 'rejected').length}
                        </div>
                        <div className="text-xs text-gray-500">Ditolak</div>
                    </Card>
                </div>
            ) : (
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

            {/* League News */}
            {activeTab === 'news' && (
                <div className="space-y-4 animate-fadeIn">
                    <div className="flex justify-between items-center">
                        <h3 className="font-display font-bold text-lg">Berita & Pengumuman</h3>
                        <Button size="sm" onClick={() => setIsNewsModalOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah Berita
                        </Button>
                    </div>

                    {newsList.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 bg-white/5 rounded-xl border border-white/10">
                            <Newspaper className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>Belum ada berita yang dipublish.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {newsList.map((news) => (
                                <div key={news.id} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition group relative">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg text-white">{news.title}</h3>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-gray-500 bg-black/20 px-2 py-1 rounded">{news.date}</span>
                                            <button
                                                onClick={() => handleDeleteNews(news.id)}
                                                className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                                                title="Hapus berita"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-gray-300 text-sm whitespace-pre-wrap">{news.content}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Overview - different based on type */}
            {activeTab === 'overview' && (
                <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        {isLeague && (
                            <Card hover={false} className="min-w-0">
                                <CardHeader>
                                    <h3 className="font-display font-bold">Klasemen Sementara</h3>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <StandingsTable compact />
                                </CardContent>
                            </Card>
                        )}

                        {(isKnockout || isGroupKO) && (
                            <Card hover={false} className="min-w-0">
                                <CardHeader>
                                    <h3 className="font-display font-bold flex items-center gap-2">
                                        <GitMerge className="w-5 h-5 text-neonPink" />
                                        Bracket Preview
                                    </h3>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="text-sm text-gray-400 mb-2">Semi Finals</div>
                                        <MatchCard home="BAR" away="RMA" homeScore={2} awayScore={1} status="completed" onClick={() => handleMatchClick(5)} />
                                        <MatchCard home="MCI" away="BAY" time="TBD" status="upcoming" onClick={() => handleMatchClick(6)} />
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {isGroupKO && (
                            <Card hover={false} className="min-w-0">
                                <CardHeader>
                                    <h3 className="font-display font-bold flex items-center gap-2">
                                        <Grid3X3 className="w-5 h-5 text-blue-400" />
                                        Group Stage Status
                                    </h3>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                        <Card hover={false} className="min-w-0">
                            <CardHeader>
                                <h3 className="font-display font-bold">Pertandingan Terakhir</h3>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <MatchCard home="FCB" away="MU" homeScore={3} awayScore={1} status="completed" onClick={() => handleMatchClick(7)} />
                                <MatchCard home="RMA" away="ARS" homeScore={2} awayScore={2} status="completed" onClick={() => handleMatchClick(8)} />
                                <MatchCard home="LIV" away="CHE" homeScore={1} awayScore={0} status="completed" onClick={() => handleMatchClick(9)} />
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
                        <Bracket rounds={knockoutRounds} onMatchClick={handleMatchClick} />
                    </CardContent>
                </Card>
            )}


            {/* Top Scores */}
            {activeTab === 'top_scores' && (
                <TopScorerList />
            )}

            {/* Statistics */}
            {activeTab === 'statistics' && (
                <TournamentStatistics />
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
                        <MatchCard home="FCB" away="RMA" time="Hari ini, 20:00" status="upcoming" onClick={() => handleMatchClick(1)} />
                        <MatchCard home="MU" away="ARS" time="Besok, 19:30" status="upcoming" onClick={() => handleMatchClick(2)} />
                        <MatchCard home="LIV" away="CHE" time="Besok, 21:00" status="upcoming" onClick={() => handleMatchClick(3)} />
                        <MatchCard home="PSG" away="BAY" time="Sabtu, 20:00" status="upcoming" onClick={() => handleMatchClick(4)} />
                    </div>
                </Card>
            )}

            {/* Players - Different view for draft vs active */}
            {activeTab === 'players' && isDraft && (
                <DraftPlayerList
                    players={draftPlayersData}
                    tournamentId={id}
                    navigate={navigate}
                />
            )}

            {activeTab === 'players' && !isDraft && (
                <Card hover={false}>
                    <CardHeader className="flex items-center justify-between">
                        <h3 className="font-display font-bold">Daftar Pemain</h3>
                        <Button size="sm" onClick={() => navigate(`/dashboard/tournaments/${id}/players/add`)}>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Tambah Pemain
                        </Button>
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

            {/* Detail Modal */}
            <Modal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                title="Detail Pengaturan Turnamen"
            >
                <div className="space-y-4">
                    <div className="p-4 bg-white/5 rounded-lg flex items-center gap-4">
                        <div className="w-14 h-14 rounded-lg bg-white/10 flex items-center justify-center">
                            <Trophy className="w-6 h-6 text-neonGreen" />
                        </div>
                        <div>
                            <div className="text-sm text-gray-500 mb-1">Nama Turnamen</div>
                            <div className="font-bold text-lg">{tournamentData.name}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white/5 rounded-lg">
                            <div className="text-sm text-gray-500 mb-1">Jenis</div>
                            <div className="font-medium">{tournamentData.type}</div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-lg">
                            <div className="text-sm text-gray-500 mb-1">Total Peserta</div>
                            <div className="font-medium">{tournamentData.players} Tim</div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-lg">
                            <div className="text-sm text-gray-500 mb-1">Sistem Poin</div>
                            <div className="font-medium">{tournamentData.pointSystem || '3-1-0'}</div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-lg">
                            <div className="text-sm text-gray-500 mb-1">Format</div>
                            <div className="font-medium">{tournamentData.homeAway ? 'Home & Away' : 'Single Match'}</div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-lg">
                            <div className="text-sm text-gray-500 mb-1">Visibilitas</div>
                            <div className="font-medium capitalize">{tournamentData.visibility || 'public'}</div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-lg">
                            <div className="text-sm text-gray-500 mb-1">Pembayaran</div>
                            <div className="font-medium">
                                {tournamentData.paymentMode === 'system' ? 'System (Auto)' : 'Manual'}
                            </div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-lg col-span-2">
                            <div className="text-sm text-gray-500 mb-1">Batas Pendaftaran</div>
                            <div className="font-medium">
                                {tournamentData.lastRegistrationDate || new Date(tournamentData.startDate).toLocaleDateString()}
                            </div>
                        </div>
                    </div>

                    {tournamentData.description && (
                        <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                            <div className="text-sm text-gray-500 mb-1">Deskripsi Turnamen</div>
                            <p className="text-gray-300 italic">"{tournamentData.description}"</p>
                        </div>
                    )}

                    <div className="flex justify-end pt-2">
                        <Button onClick={() => setIsDetailModalOpen(false)}>Tutup</Button>
                    </div>
                </div>
            </Modal>

            {/* Add News Modal */}
            <Modal
                isOpen={isNewsModalOpen}
                onClose={() => setIsNewsModalOpen(false)}
                title="Tambah Berita Baru"
            >
                <form onSubmit={handleSaveNews} className="space-y-4">
                    <Input
                        label="Judul Berita"
                        placeholder="Contoh: Perubahan Jadwal Matchday 1"
                        value={newNews.title}
                        onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
                        required
                    />
                    <Textarea
                        label="Isi Berita"
                        placeholder="Tulis detail informasi di sini..."
                        value={newNews.content}
                        onChange={(e) => setNewNews({ ...newNews, content: e.target.value })}
                        rows={6}
                        required
                    />
                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="ghost" onClick={() => setIsNewsModalOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit">
                            Publish Berita
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
