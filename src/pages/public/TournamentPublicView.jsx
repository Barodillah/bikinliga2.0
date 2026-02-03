import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Calendar, Trophy, Users, Lock, ChevronRight, Share2, MapPin, Grid, List, Shield, UserCheck } from 'lucide-react'
import Card, { CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import AdSlot from '../../components/ui/AdSlot'
import ShareModal from '../../components/ui/ShareModal'
import { authFetch } from '../../utils/api' // Assuming authFetch is available globally or need to import

// Mock Data
const tournamentData = {
    name: 'Warkop Cup Season 5',
    organizer: 'Komunitas PES Depok',
    logo: 'https://media.api-sports.io/football/leagues/39.png', // Premier League Logo for demo
    cover: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45?auto=format&fit=crop&q=80&w=1200', // Better stadium night shot
    status: 'Ongoing',
    participants: 16,
    type: 'League',
    location: 'Rental PS 88, Depok',
    description: 'Turnamen komunitas paling seru se-Depok. Memperebutkan hadiah total 5 Juta Rupiah dan trofi bergilir.',
}

const standingsData = [
    { rank: 1, team: 'Arsenal Rental', p: 10, w: 8, d: 1, l: 1, pts: 25, form: ['W', 'W', 'W', 'D', 'W'] },
    { rank: 2, team: 'Manchester Warnet', p: 10, w: 7, d: 2, l: 1, pts: 23, form: ['W', 'W', 'L', 'W', 'D'] },
    { rank: 3, team: 'Liverpool Ciledug', p: 10, w: 6, d: 3, l: 1, pts: 21, form: ['D', 'W', 'W', 'W', 'D'] },
    { rank: 4, team: 'Chelsea Pamulang', p: 10, w: 5, d: 2, l: 3, pts: 17, form: ['L', 'W', 'L', 'W', 'W'] },
    { rank: 5, team: 'Real Margonda', p: 10, w: 4, d: 3, l: 3, pts: 15, form: ['D', 'L', 'W', 'D', 'L'] },
]

const recentMatches = [
    { id: 1, home: 'Arsenal Rental', away: 'Chelsea Pamulang', score: '3-1', time: 'FT' },
    { id: 2, home: 'Liverpool Ciledug', away: 'Real Margonda', score: '2-2', time: 'FT' },
    { id: 3, home: 'Manchester Warnet', away: 'Barca Kukusan', score: '1-0', time: 'FT' },
]

const topScorers = [
    { rank: 1, player: 'Budi Sudarsono', team: 'Arsenal Rental', goals: 12, assists: 3 },
    { rank: 2, player: 'Cristian Gonzales', team: 'Manchester Warnet', goals: 9, assists: 1 },
    { rank: 3, player: 'Boaz Solossa', team: 'Liverpool Ciledug', goals: 8, assists: 5 },
    { rank: 4, player: 'Bambang Pamungkas', team: 'Chelsea Pamulang', goals: 7, assists: 2 },
    { rank: 5, player: 'Ilham Jaya Kesuma', team: 'Real Margonda', goals: 6, assists: 0 },
]

export default function TournamentPublicView() {
    const { slug } = useParams()
    const [activeTab, setActiveTab] = useState('standings')
    const [tournament, setTournament] = useState(null)
    const [loading, setLoading] = useState(true)
    const [standings, setStandings] = useState([])
    const [matches, setMatches] = useState([])
    const [topScorers, setTopScorers] = useState([])
    const [participants, setParticipants] = useState([])
    const [error, setError] = useState(null)
    const [isShareModalOpen, setIsShareModalOpen] = useState(false)

    useEffect(() => {
        const fetchTournament = async () => {
            try {
                const response = await fetch(`/api/tournaments/${slug}`)
                const data = await response.json()
                if (data.success) {
                    setTournament(data.data)
                    // Also set participants from tournament data (same as JoinCompetition.jsx)
                    setParticipants(data.data.participants || [])
                    // Set default tab based on status and type
                    if (data.data.status === 'draft') {
                        setActiveTab('pendaftar')
                    } else if (data.data.type === 'knockout') {
                        setActiveTab('bracket')
                    } else if (data.data.type === 'group' || data.data.type === 'group_knockout') {
                        setActiveTab('standings')
                    }
                } else {
                    setError(data.message)
                }
            } catch (err) {
                setError('Gagal memuat data turnamen')
            } finally {
                setLoading(false)
            }
        }
        fetchTournament()
    }, [slug])

    useEffect(() => {
        if (!tournament) return

        if (activeTab === 'standings' && standings.length === 0) {
            fetch(`/api/tournaments/${slug}/standings`)
                .then(res => res.json())
                .then(data => { if (data.success) setStandings(data.data) })
        }
        if (activeTab === 'matches' && matches.length === 0) {
            fetch(`/api/tournaments/${slug}/matches`)
                .then(res => res.json())
                .then(data => { if (data.success) setMatches(data.data) })
        }
        if (activeTab === 'topscore' && topScorers.length === 0) {
            fetch(`/api/tournaments/${slug}/top-scorers`)
                .then(res => res.json())
                .then(data => { if (data.success) setTopScorers(data.data) })
        }
        if (activeTab === 'bracket' && matches.length === 0) {
            fetch(`/api/tournaments/${slug}/matches`)
                .then(res => res.json())
                .then(data => { if (data.success) setMatches(data.data) })
        }
    }, [activeTab, tournament, slug])

    if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>
    if (error) return <div className="min-h-screen flex items-center justify-center text-white">{error}</div>
    if (!tournament) return <div className="min-h-screen flex items-center justify-center text-white">Turnamen tidak ditemukan</div>

    const isDraft = tournament.status === 'draft'

    const displayTabs = isDraft
        ? [{ id: 'pendaftar', label: 'Pendaftar', icon: UserCheck }]
        : [
            { id: 'standings', label: 'Klasemen', icon: List, hidden: tournament.type === 'knockout' },
            { id: 'matches', label: 'Jadwal & Hasil', icon: Calendar },
            { id: 'topscore', label: 'Top Score', icon: Users },
            { id: 'bracket', label: 'Bracket', icon: Grid, hidden: tournament.type === 'league' },
            { id: 'stats', label: 'Statistik', icon: Trophy, locked: true },
        ].filter(t => !t.hidden)

    return (
        <div className="space-y-6 pb-20">
            {/* Hero Header */}
            <div className="relative rounded-2xl overflow-hidden border border-white/10 group">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent z-10"></div>

                {/* Cover Image */}
                <div className="h-64 sm:h-80 w-full overflow-hidden">
                    <img
                        src={tournament.cover || 'https://images.unsplash.com/photo-1522770179533-24471fcdba45?auto=format&fit=crop&q=80&w=1200'}
                        alt="Cover"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                    />
                </div>

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 w-full p-4 sm:p-8 z-20 flex flex-col sm:flex-row items-start sm:items-end gap-6 justify-between">
                    <div className="flex flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto">
                        <img
                            src={tournament.logo || 'https://media.api-sports.io/football/leagues/39.png'}
                            alt="Logo"
                            className="w-16 h-16 sm:w-24 sm:h-24 bg-white/10 backdrop-blur-md rounded-2xl p-2 sm:p-3 border border-white/20 shadow-2xl flex-shrink-0 object-contain"
                        />
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className={`text-black text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider ${tournament.status === 'completed' ? 'bg-gray-400' : 'bg-neonGreen'
                                    }`}>
                                    {tournament.status}
                                </span>
                                <span className="text-gray-300 text-[10px] sm:text-xs flex items-center gap-1 truncate max-w-[200px] sm:max-w-none">
                                    <MapPin className="w-3 h-3" /> {tournament.location || 'Online'}
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-4xl font-display font-bold text-white mb-1 shadow-black drop-shadow-lg leading-tight">
                                {tournament.name}
                            </h1>
                            <p className="text-gray-300 text-xs sm:text-sm flex items-center gap-2">
                                Organized by <span className="text-neonGreen font-medium">{tournament.creator?.name || 'Organizer'}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3 w-full sm:w-auto">
                        <Button
                            onClick={() => setIsShareModalOpen(true)}
                            className="flex-1 sm:flex-none bg-white text-black hover:bg-gray-200 text-xs py-2 h-9 sm:text-sm sm:h-10"
                        >
                            <Share2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" /> Share
                        </Button>
                        {isDraft && (
                            <Link to={`/join/${tournament.id}`} className="flex-1 sm:flex-none">
                                <Button className="w-full bg-neonGreen text-black hover:bg-neonGreen/80 text-xs py-2 h-9 sm:text-sm sm:h-10">
                                    Join Tournament
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Ad Banner */}
            <AdSlot variant="banner" adId="public-header-ad" />

            {/* Navigation Tabs */}
            <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
                {displayTabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition border ${activeTab === tab.id
                            ? 'bg-white text-black border-white'
                            : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:border-white/30'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                        {tab.locked && <Lock className="w-3 h-3 ml-1 text-yellow-500" />}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Main Content */}
                <div className="lg:col-span-2 space-y-6">

                    {/* STANDINGS TAB */}
                    {activeTab === 'standings' && (
                        <Card>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-white/5 uppercase text-gray-400 font-bold text-xs">
                                            <tr>
                                                <th className="p-4 w-10 text-center">#</th>
                                                <th className="p-4">Tim</th>
                                                <th className="p-4 text-center">Main</th>
                                                <th className="p-4 text-center">Poin</th>
                                                <th className="p-4 text-center hidden sm:table-cell">Selisih Gol</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {standings.length === 0 ? (
                                                <tr><td colSpan="5" className="p-8 text-center text-gray-500">Belum ada data klasemen</td></tr>
                                            ) : (
                                                standings.map((row, index) => (
                                                    <tr key={index} className="hover:bg-white/5 transition">
                                                        <td className="p-4 text-center font-bold text-gray-500">{index + 1}</td>
                                                        <td className="p-4 font-bold flex items-center gap-3">
                                                            {row.team_logo ? (
                                                                <img src={row.team_logo} alt="" className="w-8 h-8 rounded-full bg-gray-800 object-contain" />
                                                            ) : (
                                                                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs">
                                                                    {(row.team_name || row.participant_name || '?').charAt(0)}
                                                                </div>
                                                            )}
                                                            {row.team_name || row.participant_name}
                                                        </td>
                                                        <td className="p-4 text-center text-gray-400">{row.played}</td>
                                                        <td className="p-4 text-center font-bold text-neonGreen text-base">{row.points}</td>
                                                        <td className="p-4 hidden sm:table-cell text-center">
                                                            <span className={row.goal_difference > 0 ? 'text-green-500' : row.goal_difference < 0 ? 'text-red-500' : 'text-gray-400'}>
                                                                {row.goal_difference > 0 ? `+${row.goal_difference}` : row.goal_difference}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* MATCHES TAB */}
                    {activeTab === 'matches' && (
                        <div className="space-y-4">
                            {matches.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">Belum ada jadwal pertandingan</div>
                            ) : (
                                matches.map((match) => (
                                    <Link key={match.id} to={`/t/${slug}/match/${match.id}`}>
                                        <Card className="hover:border-neonGreen/30 transition group cursor-pointer h-full">
                                            <CardContent className="p-4 sm:p-6 flex items-center justify-between">
                                                <div className="flex-1 text-right font-bold text-gray-300 sm:text-lg truncate">{match.home_team_name || match.home_player_name}</div>
                                                <div className="px-4 sm:px-8 flex flex-col items-center min-w-[100px]">
                                                    <span className="text-2xl sm:text-3xl font-display font-bold text-white group-hover:text-neonGreen transition">
                                                        {match.status === 'completed' || match.status === 'finished' ? `${match.home_score} - ${match.away_score}` : 'VS'}
                                                    </span>
                                                    <span className="text-[10px] text-gray-500 bg-white/10 px-2 py-0.5 rounded mt-1 uppercase tracking-tighter">
                                                        {match.status === 'completed' ? 'Full Time' : match.status === 'live' ? 'Live' : 'Scheduled'}
                                                    </span>
                                                </div>
                                                <div className="flex-1 text-left font-bold text-gray-300 sm:text-lg truncate">{match.away_team_name || match.away_player_name}</div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))
                            )}
                        </div>
                    )}

                    {/* TOP SCORE TAB */}
                    {activeTab === 'topscore' && (
                        <Card>
                            <CardContent className="p-0">
                                <div className="space-y-1">
                                    {topScorers.length === 0 ? (
                                        <div className="p-8 text-center text-gray-500">Belum ada data top scorer</div>
                                    ) : (
                                        topScorers.map((player, index) => (
                                            <div key={index} className="flex items-center justify-between p-4 hover:bg-white/5 transition border-b border-white/5 last:border-0">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-yellow-500 text-black' :
                                                        index === 1 ? 'bg-gray-400 text-black' :
                                                            index === 2 ? 'bg-orange-700 text-white' :
                                                                'bg-white/10 text-gray-400'
                                                        }`}>
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white">{player.name}</div>
                                                        <div className="text-xs text-gray-400">{player.team_name}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xl font-bold text-neonGreen">{player.goals}</div>
                                                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">Goals</div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* BRACKET TAB (Placeholder) */}
                    {activeTab === 'bracket' && (
                        <div className="h-96 flex items-center justify-center border border-white/10 rounded-xl bg-white/5 border-dashed">
                            <p className="text-gray-500">Bracket diagram will be rendered here.</p>
                        </div>
                    )}

                    {/* PENDAFTAR TAB (for draft status) */}
                    {activeTab === 'pendaftar' && (
                        <div className="space-y-4 animate-fadeIn">
                            {participants.length === 0 ? (
                                <div className="text-center py-12 text-gray-500 bg-white/5 rounded-xl border border-white/10">
                                    <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>Belum ada pendaftar</p>
                                </div>
                            ) : (
                                <>
                                    {participants.map((player, index) => (
                                        <div key={player.id || index} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition">
                                            <div className="flex items-center gap-4">
                                                {player.logo_url || player.team_logo ? (
                                                    <img src={player.logo_url || player.team_logo} alt={player.team_name} className="w-10 h-10 object-contain" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center text-blue-400 font-bold">
                                                        {player.team_name?.charAt(0) || player.name?.charAt(0) || '?'}
                                                    </div>
                                                )}
                                                <div>
                                                    <h4 className="font-bold text-white">{player.team_name || player.team}</h4>
                                                    <p className="text-sm text-gray-400">{player.name}</p>
                                                    {player.username && (
                                                        <p className="text-xs text-neonGreen mt-0.5">@{player.username}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <span className={`text-xs font-bold px-2 py-1 rounded-full border ${player.status === 'confirmed' || player.status === 'approved'
                                                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                                        : player.status === 'pending'
                                                            ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                                            : player.status === 'rejected'
                                                                ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                                                : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                                                    }`}>
                                                    {player.status || 'Pending'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="text-center p-4">
                                        <p className="text-sm text-gray-500">Menampilkan {participants.length} peserta terdaftar.</p>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* LOCKED STATS TAB */}
                    {activeTab === 'stats' && (
                        <div className="relative overflow-hidden rounded-xl border border-white/10">
                            {/* Blurred Content */}
                            <div className="filter blur-md opacity-50 pointer-events-none select-none">
                                <Card>
                                    <div className="p-6 space-y-4">
                                        <div className="h-8 bg-gray-800 rounded w-1/3"></div>
                                        <div className="space-y-2">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="h-12 bg-gray-800 rounded flex justify-between"></div>
                                            ))}
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            {/* CTA Overlay */}
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 p-6 text-center">
                                <Shield className="w-12 h-12 text-neonGreen mb-4" />
                                <h3 className="text-2xl font-bold text-white mb-2">Analisis & Statistik Lengkap</h3>
                                <p className="text-gray-300 mb-6 max-w-sm">
                                    Login untuk melihat statistik mendalam, top skor, assist, dan analisis performa tim.
                                </p>
                                <Link to="/login">
                                    <Button className="bg-neonGreen text-black font-bold px-8">
                                        Login Sekarang
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Sidebar Widgets */}
                <div class="space-y-6">
                    {/* About Card */}
                    <Card>
                        <div className="p-6">
                            <h3 className="font-bold mb-4 text-white">Tentang Turnamen</h3>
                            <p className="text-sm text-gray-400 leading-relaxed mb-4">
                                {tournamentData.description}
                            </p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <div className="text-gray-500 text-xs uppercase">Format</div>
                                    <div className="text-white font-medium capitalize">{tournament.type?.replace('_', ' + ')}</div>
                                </div>
                                <div>
                                    <div className="text-gray-500 text-xs uppercase">Peserta</div>
                                    <div className="text-white font-medium">{tournament.players || 0} / {tournament.maxParticipants} Tim</div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* CTA Login Widget */}
                    <div className="p-6 rounded-xl bg-gradient-to-br from-neonGreen/80 to-green-600 text-black">
                        <h3 className="font-bold text-xl mb-2">Punya Tim Hebat?</h3>
                        <p className="text-sm mb-4 opacity-90">
                            Daftarkan tim kamu sekarang dan ikuti turnamen seru lainnya di BikinLiga!
                        </p>
                        <Link to="/register">
                            <button className="w-full py-3 bg-black text-white rounded-lg font-bold hover:bg-gray-900 transition flex items-center justify-center gap-2">
                                Buat Akun Gratis <ChevronRight className="w-4 h-4" />
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Share Modal */}
            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                link={window.location.href}
                text={`Check out ${tournament.name} on BikinLiga!`}
                title="Bagikan Turnamen"
            />
        </div>
    )
}
