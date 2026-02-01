import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy, Goal, Clock, MessageSquare, Heart, Share2, Send, Users, Activity, ArrowLeft, Tv, Search } from 'lucide-react'
import Card, { CardContent, CardHeader } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import AdSlot from '../../components/ui/AdSlot'
import Input from '../../components/ui/Input'
import { authFetch } from '../../utils/api'
import UserBadge from '../../components/ui/UserBadge'

// --- Components ---

const StreamList = ({ matches, loading, onSelectStream }) => {
    const [searchQuery, setSearchQuery] = useState('')

    // Backend already provides sorted matches (Chat Count > Tier > Newest)
    const trendingMatch = matches[0]

    // Filter other matches
    const otherMatches = matches.length > 1 ? matches.slice(1) : []

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <Activity className="w-12 h-12 animate-pulse mb-4 text-neonGreen" />
                <p className="font-display font-bold">Memuat Live Matches...</p>
            </div>
        )
    }

    if (matches.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-[#111] rounded-2xl border border-white/5">
                <Tv className="w-16 h-16 text-gray-700 mb-4" />
                <h3 className="text-xl font-display font-bold text-white mb-2">Tidak ada pertandingan LIVE</h3>
                <p className="text-gray-500 text-center max-w-md px-6">
                    Saat ini tidak ada pertandingan yang sedang berlangsung. Cek lagi nanti atau lihat jadwal turnamen mendatang.
                </p>
            </div>
        )
    }

    const filteredLiveMatches = (searchQuery ? matches : otherMatches).filter(m =>
        m.tournamentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.homeTeam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.awayTeam.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-8">
            {/* Trending Match Highlight */}
            {trendingMatch && !searchQuery && (
                <div
                    onClick={() => onSelectStream(trendingMatch)}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-900/40 to-black border border-red-500/30 p-1 cursor-pointer group"
                >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                    <div className="absolute -right-20 -top-20 text-red-600/10 rotate-12">
                        <Trophy className="w-96 h-96" />
                    </div>

                    <div className="relative z-10 bg-black/40 backdrop-blur-sm rounded-xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                        {/* Event Info */}
                        <div className="space-y-4 flex-1 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-3">
                                <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 animate-pulse">
                                    <Activity className="w-3 h-3" /> TRENDING LIVE
                                </span>
                                <span className="text-neonPink font-medium tracking-wide flex items-center gap-1 text-sm">
                                    <MessageSquare className="w-4 h-4" /> {(trendingMatch.chatCount)} Komentar
                                </span>
                            </div>

                            <div>
                                <h2 className="text-2xl sm:text-4xl font-display font-bold text-white mb-2">{trendingMatch.tournamentName}</h2>
                                <div className="flex items-center gap-2 text-gray-400 text-sm tracking-widest">
                                    <span className="uppercase">{trendingMatch.creator?.name || 'Organizer'}</span>
                                    <UserBadge tier={trendingMatch.creator?.tier} size="sm" />
                                </div>
                            </div>
                        </div>

                        {/* Versus Display */}
                        <div className="flex items-center gap-6 sm:gap-12">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition duration-500 overflow-hidden">
                                    {trendingMatch.homeTeam.logo ? (
                                        <img src={trendingMatch.homeTeam.logo} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-3xl sm:text-4xl font-bold text-blue-400">{trendingMatch.homeTeam.name?.charAt(0)}</span>
                                    )}
                                </div>
                                <span className="font-bold text-lg max-w-[120px] text-center line-clamp-1">{trendingMatch.homeTeam.teamName || trendingMatch.homeTeam.name}</span>
                            </div>

                            <div className="flex flex-col items-center">
                                <div className="text-4xl sm:text-6xl font-display font-bold text-white tracking-widest">
                                    {trendingMatch.homeScore}:{trendingMatch.awayScore}
                                </div>
                                <div className="bg-red-600/20 text-red-500 px-3 py-1 rounded text-xs font-mono mt-2 uppercase">
                                    {trendingMatch.status.replace('_', ' ')}
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-4">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center shadow-lg shadow-red-500/20 group-hover:scale-110 transition duration-500 overflow-hidden">
                                    {trendingMatch.awayTeam.logo ? (
                                        <img src={trendingMatch.awayTeam.logo} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-3xl sm:text-4xl font-bold text-red-400">{trendingMatch.awayTeam.name?.charAt(0)}</span>
                                    )}
                                </div>
                                <span className="font-bold text-lg max-w-[120px] text-center line-clamp-1">{trendingMatch.awayTeam.teamName || trendingMatch.awayTeam.name}</span>
                            </div>
                        </div>

                        {/* Action CTA */}
                        <div className="hidden md:block">
                            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-neonGreen group-hover:text-neonGreen transition">
                                <Activity className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Ad Slot */}
            <AdSlot variant="leaderboard" adId="stream-list-ad" />

            {/* Live Matches List */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h2 className="text-xl font-display font-bold flex items-center gap-2">
                        <Tv className="w-5 h-5 text-neonGreen" /> Live Scores
                    </h2>
                    <div className="w-full sm:w-64 relative">
                        <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <Input
                            placeholder="Cari match..."
                            className="pl-9 bg-white/5"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLiveMatches.map((match) => (
                        <div
                            key={match.id}
                            onClick={() => onSelectStream(match)}
                            className="bg-[#111] border border-white/10 rounded-xl overflow-hidden hover:border-neonGreen/30 hover:bg-white/5 transition cursor-pointer group flex flex-col p-5"
                        >
                            {/* Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="text-xs text-neonGreen font-medium uppercase tracking-wider mb-1">{match.game}</div>
                                    <div className="text-sm text-gray-400 line-clamp-1">{match.tournamentName}</div>
                                </div>
                                <span className="bg-red-500/10 text-red-500 text-[10px] font-bold px-2 py-1 rounded animate-pulse flex items-center gap-1 uppercase">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> {match.status.replace('_', ' ')}
                                </span>
                            </div>

                            {/* Score Display */}
                            <div className="flex items-center justify-between mb-6 flex-1">
                                <div className="flex flex-col items-center gap-3 w-1/3">
                                    <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center overflow-hidden border border-blue-500/20">
                                        {match.homeTeam.logo ? (
                                            <img src={match.homeTeam.logo} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="font-bold text-blue-400 text-xl">{match.homeTeam.name?.charAt(0)}</span>
                                        )}
                                    </div>
                                    <span className="text-xs font-bold text-gray-300 text-center line-clamp-1">{match.homeTeam.teamName || match.homeTeam.name}</span>
                                </div>

                                <div className="flex flex-col items-center w-1/3">
                                    <div className="text-3xl font-display font-bold text-white tracking-widest">
                                        {match.homeScore}-{match.awayScore}
                                    </div>
                                    <div className="text-xs text-gray-500 font-mono mt-1">
                                        {match.matchTime}
                                    </div>
                                </div>

                                <div className="flex flex-col items-center gap-3 w-1/3">
                                    <div className="w-14 h-14 rounded-xl bg-red-500/10 flex items-center justify-center overflow-hidden border border-red-500/20">
                                        {match.awayTeam.logo ? (
                                            <img src={match.awayTeam.logo} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="font-bold text-red-500 text-xl">{match.awayTeam.name?.charAt(0)}</span>
                                        )}
                                    </div>
                                    <span className="text-xs font-bold text-gray-300 text-center line-clamp-1">{match.awayTeam.teamName || match.awayTeam.name}</span>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                    <MessageSquare className="w-3 h-3" /> {match.chatCount} Komentar
                                </div>
                                <span className="text-xs text-neonGreen group-hover:underline flex items-center gap-1">
                                    Match Details <ArrowLeft className="w-3 h-3 rotate-180" />
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// --- Main Container ---

export default function Stream() {
    const navigate = useNavigate()
    const [matches, setMatches] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async (showLoading = true) => {
            try {
                if (showLoading) setLoading(true)
                const res = await authFetch('/api/matches/live')
                const data = await res.json()
                if (data.success) {
                    setMatches(data.data)
                }
            } catch (error) {
                console.error('Error fetching live matches:', error)
            } finally {
                if (showLoading) setLoading(false)
            }
        }

        fetchData(true)
        const interval = setInterval(() => fetchData(false), 10000)
        return () => clearInterval(interval)
    }, [])

    const handleSelectStream = (match) => {
        // Navigate to UserMatchDetail
        // Route: /dashboard/tournaments/:id/view/match/:matchId
        // or /dashboard/competitions/:id/view/match/:matchId
        // We use tournaments for general match viewing from stream
        navigate(`/dashboard/tournaments/${match.tournamentSlug || match.tournamentId}/view/match/${match.id}`, { state: { from: 'stream' } })
    }

    return (
        <div className="max-w-6xl mx-auto pb-10">
            <StreamList
                matches={matches}
                loading={loading}
                onSelectStream={handleSelectStream}
            />
        </div>
    )
}
