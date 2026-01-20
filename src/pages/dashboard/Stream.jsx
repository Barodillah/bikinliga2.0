import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy, Goal, Clock, MessageSquare, Heart, Share2, Send, Users, Activity, ArrowLeft, Tv, Search } from 'lucide-react'
import Card, { CardContent, CardHeader } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import AdSlot from '../../components/ui/AdSlot'
import Input from '../../components/ui/Input'

// --- Mock Data ---

const liveMatches = [
    {
        id: 1,
        homeTeam: { name: 'RRQ Hoshi', id: 'h1', logo: 'R' },
        awayTeam: { name: 'ONIC Esports', id: 'a1', logo: 'O' },
        homeScore: 2,
        awayScore: 1,
        status: 'live',
        matchTime: '12:45',
        game: 'Mobile Legends',
        tournament: 'MPL Season 13 - Grand Final',
        viewers: 125430,
        thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600',
        events: [
            { id: 1, type: 'goal', time: '05:30', player: 'Skylar', team: 'home', detail: 'First Blood' },
            { id: 2, type: 'goal', time: '08:15', player: 'Kairi', team: 'away', detail: 'Turtle' },
            { id: 3, type: 'goal', time: '12:10', player: 'Alberttt', team: 'home', detail: 'Lord' },
        ],
        stats: { likes: 45200 }
    },
    {
        id: 2,
        homeTeam: { name: 'Alter Ego', id: 'h2', logo: 'AE' },
        awayTeam: { name: 'EVOS Legends', id: 'a2', logo: 'E' },
        homeScore: 0,
        awayScore: 0,
        status: 'live',
        matchTime: '05:20',
        game: 'Mobile Legends',
        tournament: 'MPL Season 13 - Regular Season',
        viewers: 45000,
        thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=600',
        events: [],
        stats: { likes: 12000 }
    },
    {
        id: 3,
        homeTeam: { name: 'Team Liquid', id: 'h3', logo: 'TL' },
        awayTeam: { name: 'Gaimin Gladiators', id: 'a3', logo: 'GG' },
        homeScore: 1,
        awayScore: 1,
        status: 'live',
        matchTime: '35:10',
        game: 'Dota 2',
        tournament: 'The International 2024',
        viewers: 210000,
        thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=600',
        events: [],
        stats: { likes: 89000 }
    }
]

const initialComments = [
    { id: 1, user: 'FanBoy99', text: 'RRQ WIN!!!', time: 'Just now' },
    { id: 2, user: 'OnicSlayer', text: 'Nice play Kairi!', time: '1m ago' },
    { id: 3, user: 'MobaZane', text: 'Na region looking strong...', time: '2m ago' },
]

// --- Components ---

const StreamList = ({ onSelectStream }) => {
    const [searchQuery, setSearchQuery] = useState('')

    // Sort matches by viewers to find trending
    const trendingMatch = [...liveMatches].sort((a, b) => b.viewers - a.viewers)[0]

    // Filter other matches
    const otherMatches = liveMatches.filter(m => m.id !== trendingMatch.id)

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
                                    <Users className="w-4 h-4" /> {(trendingMatch.viewers / 1000).toFixed(1)}K Viewers
                                </span>
                            </div>

                            <div>
                                <h2 className="text-2xl sm:text-4xl font-display font-bold text-white mb-2">{trendingMatch.tournament}</h2>
                                <p className="text-gray-400 text-sm uppercase tracking-widest">{trendingMatch.game}</p>
                            </div>
                        </div>

                        {/* Versus Display */}
                        <div className="flex items-center gap-6 sm:gap-12">
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition duration-500">
                                    <span className="text-3xl sm:text-4xl font-bold text-blue-400">{trendingMatch.homeTeam.logo}</span>
                                </div>
                                <span className="font-bold text-lg">{trendingMatch.homeTeam.name}</span>
                            </div>

                            <div className="flex flex-col items-center">
                                <div className="text-4xl sm:text-6xl font-display font-bold text-white tracking-widest">
                                    {trendingMatch.homeScore}:{trendingMatch.awayScore}
                                </div>
                                <div className="bg-red-600/20 text-red-500 px-3 py-1 rounded text-xs font-mono mt-2">
                                    {trendingMatch.matchTime}
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-2">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center shadow-lg shadow-red-500/20 group-hover:scale-110 transition duration-500">
                                    <span className="text-3xl sm:text-4xl font-bold text-red-400">{trendingMatch.awayTeam.logo}</span>
                                </div>
                                <span className="font-bold text-lg">{trendingMatch.awayTeam.name}</span>
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
                    {(searchQuery ? liveMatches : otherMatches).filter(m =>
                        m.tournament.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        m.homeTeam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        m.awayTeam.name.toLowerCase().includes(searchQuery.toLowerCase())
                    ).map((match) => (
                        <div
                            key={match.id}
                            onClick={() => onSelectStream(match)}
                            className="bg-[#111] border border-white/10 rounded-xl overflow-hidden hover:border-neonGreen/30 hover:bg-white/5 transition cursor-pointer group flex flex-col p-5"
                        >
                            {/* Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="text-xs text-neonGreen font-medium uppercase tracking-wider mb-1">{match.game}</div>
                                    <div className="text-sm text-gray-400 line-clamp-1">{match.tournament}</div>
                                </div>
                                <span className="bg-red-500/10 text-red-500 text-[10px] font-bold px-2 py-1 rounded animate-pulse flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> LIVE
                                </span>
                            </div>

                            {/* Score Display */}
                            <div className="flex items-center justify-between mb-6 flex-1">
                                <div className="flex flex-col items-center gap-3 w-1/3">
                                    <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center font-bold text-blue-400 text-xl border border-blue-500/20">{match.homeTeam.logo}</div>
                                    <span className="text-xs font-bold text-gray-300 text-center line-clamp-1">{match.homeTeam.name}</span>
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
                                    <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center font-bold text-red-500 text-xl border border-red-500/20">{match.awayTeam.logo}</div>
                                    <span className="text-xs font-bold text-gray-300 text-center line-clamp-1">{match.awayTeam.name}</span>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                    <Users className="w-3 h-3" /> {(match.viewers / 1000).toFixed(1)}K Viewers
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

    const handleSelectStream = (match) => {
        navigate(`/dashboard/stream/${match.id}`)
    }

    return (
        <div className="max-w-6xl mx-auto pb-10">
            <StreamList onSelectStream={handleSelectStream} />
        </div>
    )
}
