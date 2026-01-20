import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Trophy, Goal, Clock, MessageSquare, Heart, Share2, Send, Users, Activity, ArrowLeft, Brain, Percent, History, BarChart2 } from 'lucide-react'
import Card, { CardContent, CardHeader } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import AdSlot from '../../components/ui/AdSlot'

// --- Mock Data (Duplicated from Stream.jsx for independence) ---
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

export default function StreamDetail() {
    const { id } = useParams()
    const navigate = useNavigate()

    // Find match by ID
    const match = liveMatches.find(m => m.id === parseInt(id)) || liveMatches[0]

    const [likes, setLikes] = useState(match?.stats?.likes || 0)
    const [hasLiked, setHasLiked] = useState(false)
    const [comments, setComments] = useState(initialComments)
    const [newComment, setNewComment] = useState('')
    const [timer, setTimer] = useState(match?.matchTime || '00:00')
    const [activeTab, setActiveTab] = useState('timeline')

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    // Update likes if match changes (mock data sync issue workaround)
    useEffect(() => {
        if (match) setLikes(match.stats.likes)
    }, [match])

    if (!match) {
        return <div className="p-10 text-center">Match not found</div>
    }

    const handleLike = () => {
        if (hasLiked) {
            setLikes(prev => prev - 1)
            setHasLiked(false)
        } else {
            setLikes(prev => prev + 1)
            setHasLiked(true)
        }
    }

    const handleSendComment = (e) => {
        e.preventDefault()
        if (!newComment.trim()) return

        const comment = {
            id: Date.now(),
            user: 'You',
            text: newComment,
            time: 'Just now'
        }
        setComments([comment, ...comments])
        setNewComment('')
    }

    return (
        <div className="max-w-6xl mx-auto pb-10 space-y-6 animate-in slide-in-from-right duration-300">
            {/* Header Info */}
            <div className="flex flex-col gap-4">
                <button
                    onClick={() => navigate('/dashboard/stream')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition w-fit"
                >
                    <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar
                </button>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded animate-pulse">LIVE</span>
                            <span className="text-neonGreen text-sm font-medium">{match.game}</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-display font-bold">{match.tournament}</h1>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" /> {match.viewers.toLocaleString()} Watching
                        </div>
                        <div className="flex items-center gap-1">
                            <Activity className="w-4 h-4" /> Live Stats
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Content: Match Center */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Scoreboard Card */}
                    <Card className="overflow-hidden border-neonGreen/20">
                        <div className="bg-[#0a0a0a] p-6 sm:p-10 text-center relative">
                            {/* Timer Badge */}
                            <div className="absolute top-4 left-1/2 -translate-x-1/2">
                                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500 text-white animate-pulse font-mono">
                                    {timer}
                                </span>
                            </div>

                            <div className="flex items-center justify-between mt-4">
                                {/* Home Team */}
                                <div className="flex flex-col items-center flex-1">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-500/20 ring-4 ring-blue-500/10 flex items-center justify-center mb-3">
                                        <span className="text-2xl sm:text-3xl font-bold text-blue-400">{match.homeTeam.logo}</span>
                                    </div>
                                    <h2 className="text-lg sm:text-2xl font-display font-bold">{match.homeTeam.name}</h2>
                                    <div className="text-sm text-gray-500">Home</div>
                                </div>

                                {/* Score */}
                                <div className="px-4 sm:px-12">
                                    <div className="text-5xl sm:text-7xl font-display font-bold tracking-tighter flex items-center gap-4">
                                        <span className="text-white">{match.homeScore}</span>
                                        <span className="text-white/20">:</span>
                                        <span className="text-white">{match.awayScore}</span>
                                    </div>
                                </div>

                                {/* Away Team */}
                                <div className="flex flex-col items-center flex-1">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-500/20 ring-4 ring-red-500/10 flex items-center justify-center mb-3">
                                        <span className="text-2xl sm:text-3xl font-bold text-red-400">{match.awayTeam.logo}</span>
                                    </div>
                                    <h2 className="text-lg sm:text-2xl font-display font-bold">{match.awayTeam.name}</h2>
                                    <div className="text-sm text-gray-500">Away</div>
                                </div>
                            </div>
                        </div>

                        {/* Interaction Bar */}
                        <div className="border-t border-white/10 p-4 bg-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant={hasLiked ? "secondary" : "ghost"}
                                    className={hasLiked ? "text-neonPink bg-neonPink/10" : "text-gray-400 hover:text-neonPink"}
                                    onClick={handleLike}
                                >
                                    <Heart className={`w-5 h-5 mr-2 ${hasLiked ? 'fill-neonPink' : ''}`} />
                                    {likes.toLocaleString()} Likes
                                </Button>
                                <Button variant="ghost" className="text-gray-400 hover:text-white">
                                    <Share2 className="w-5 h-5 mr-2" /> Share
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Tabs & Content */}
                    <Card hover={false} className="overflow-hidden">
                        <div className="flex border-b border-white/10">
                            <button
                                onClick={() => setActiveTab('timeline')}
                                className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition relative ${activeTab === 'timeline' ? 'text-neonGreen' : 'text-gray-400 hover:text-white'}`}
                            >
                                <Clock className="w-4 h-4" /> Match Timeline
                                {activeTab === 'timeline' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-neonGreen"></div>}
                            </button>
                            <button
                                onClick={() => setActiveTab('analysis')}
                                className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition relative ${activeTab === 'analysis' ? 'text-neonGreen' : 'text-gray-400 hover:text-white'}`}
                            >
                                <Brain className="w-4 h-4" /> Match Analysis
                                {activeTab === 'analysis' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-neonGreen"></div>}
                            </button>
                        </div>

                        <CardContent className="p-0">
                            {/* TIMELINE TAB */}
                            {activeTab === 'timeline' && (
                                <div className="p-6">
                                    <div className="relative border-l border-white/10 ml-4 space-y-6 py-2">
                                        {match.events && match.events.length > 0 ? (
                                            match.events.map((event) => (
                                                <div key={event.id} className="relative pl-6">
                                                    <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full ${event.team === 'home' ? 'bg-blue-500' : 'bg-red-500'}`}></div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono font-bold text-neonGreen">{event.time}</span>
                                                        <span className="font-bold flex items-center gap-1 text-white">
                                                            {event.type === 'goal' && <Goal className="w-4 h-4 text-neonGreen" />}
                                                            {event.detail}
                                                        </span>
                                                        <span className="text-gray-400">- {event.player}</span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-gray-500 text-sm italic pl-4">Belum ada event moment penting.</div>
                                        )}
                                        <div className="relative pl-6 opacity-50">
                                            <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-gray-500"></div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-bold">00:00</span>
                                                <span className="text-gray-400">Match Started</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ANALYSIS TAB */}
                            {activeTab === 'analysis' && (
                                <div className="divide-y divide-white/5">
                                    {/* Win Probability */}
                                    <div className="p-6">
                                        <h3 className="font-display font-bold mb-4 flex items-center gap-2">
                                            <Percent className="w-5 h-5 text-neonPink" /> Win Probability (AI Prediction)
                                        </h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm font-bold mb-1">
                                                <span className="text-blue-400">{match.homeTeam.name} 45%</span>
                                                <span className="text-gray-400">Draw 25%</span>
                                                <span className="text-red-400">{match.awayTeam.name} 30%</span>
                                            </div>
                                            <div className="h-3 bg-white/10 rounded-full overflow-hidden flex">
                                                <div className="h-full bg-blue-500" style={{ width: '45%' }}></div>
                                                <div className="h-full bg-gray-500" style={{ width: '25%' }}></div>
                                                <div className="h-full bg-red-500" style={{ width: '30%' }}></div>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2 italic">
                                                "Berdasarkan performa 5 pertandingan terakhir, {match.homeTeam.name} memiliki sedikit keunggulan taktis."
                                            </p>
                                        </div>
                                    </div>

                                    {/* Head to Head */}
                                    <div className="p-6">
                                        <h3 className="font-display font-bold mb-4 flex items-center gap-2">
                                            <History className="w-5 h-5 text-yellow-400" /> Head to Head
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-blue-400">{match.homeTeam.logo}</span>
                                                    <span className="text-sm text-gray-400 font-mono">2 - 1</span>
                                                    <span className="font-bold text-red-400">{match.awayTeam.logo}</span>
                                                </div>
                                                <div className="text-xs text-gray-500">Last Season</div>
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-red-400">{match.awayTeam.logo}</span>
                                                    <span className="text-sm text-gray-400 font-mono">3 - 1</span>
                                                    <span className="font-bold text-blue-400">{match.homeTeam.logo}</span>
                                                </div>
                                                <div className="text-xs text-gray-500">Cup Final</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar: Chat */}
                <div className="space-y-6">
                    <Card className="flex flex-col h-[600px] border-white/10">
                        <CardHeader className="border-b border-white/10 bg-white/5 py-3">
                            <h3 className="font-display font-bold flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-neonPink" /> Live Chat
                            </h3>
                        </CardHeader>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
                            {comments.map((comment) => (
                                <div key={comment.id} className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex-shrink-0 flex items-center justify-center font-bold text-xs">
                                        {comment.user.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-baseline gap-2">
                                            <span className={`font-bold text-sm ${comment.user === 'You' ? 'text-neonGreen' : 'text-gray-300'}`}>
                                                {comment.user}
                                            </span>
                                            <span className="text-[10px] text-gray-500">{comment.time}</span>
                                        </div>
                                        <p className="text-sm text-gray-400 break-words">{comment.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t border-white/10 bg-black/20">
                            <form onSubmit={handleSendComment} className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Tulis komentar..."
                                    className="flex-1 bg-white/10 border-0 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-neonGreen outline-none placeholder:text-gray-500"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    className="p-2 bg-neonGreen text-black rounded-lg hover:bg-neonGreen/80 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!newComment.trim()}
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    </Card>

                    <AdSlot variant="rectangle" adId="stream-chat-ad" />
                </div>
            </div>
        </div>
    )
}
