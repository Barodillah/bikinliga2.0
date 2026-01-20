import React, { useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, Goal, Brain, Percent, History, MessageCircle, Send, ChevronRight } from 'lucide-react'
import Card, { CardContent, CardHeader } from '../../components/ui/Card'
import AdSlot from '../../components/ui/AdSlot'
import Button from '../../components/ui/Button'

// Mock Data (Shared structure with MatchManagement but simplified/static for demo)
const matchData = {
    id: 1,
    homeTeam: { name: 'Barcelona FC', id: 'h1', players: ['Ter Stegen', 'Araujo', 'Pedri', 'Lewandowski', 'Gavi', 'De Jong'] },
    awayTeam: { name: 'Real Madrid', id: 'a1', players: ['Courtois', 'Alaba', 'Modric', 'Vinicius', 'Bellingham', 'Rodrygo'] },
    homeScore: 2,
    awayScore: 1,
    status: '2nd_half', // scheduled, live, finished
    startTime: '2024-03-20T20:00:00',
    matchTime: 68, // minutes
    events: [
        { id: 1, type: 'goal', team: 'home', player: 'Lewandowski', time: '12', detail: 'Open Play' },
        { id: 2, type: 'card', team: 'away', player: 'Vinicius Jr', time: '34', detail: 'Yellow' },
        { id: 3, type: 'goal', team: 'away', player: 'Bellingham', time: '41', detail: 'Open Play' },
        { id: 4, type: 'goal', team: 'home', player: 'Pedri', time: '55', detail: 'Open Play' },
    ]
}

const mockChatMessages = [
    { id: 1, user: 'Budi01', team: 'Barca', msg: 'Visca Barca!! 🔥', time: '10:05' },
    { id: 2, user: 'RianHala', team: 'Madrid', msg: 'Masih bisa balikk, tenang aja.', time: '10:06' },
    { id: 3, user: 'AdminGanteng', team: 'Neutral', msg: 'Pertandingan sengit malam ini!', time: '10:07' },
    { id: 4, user: 'Siti_Aisyah', team: 'Barca', msg: 'Lewy gacor parah sih', time: '10:08' },
    { id: 5, user: 'JokoKendil', team: 'Madrid', msg: 'Wasit berat sebelah wkwk', time: '10:10' },
]

const LiveChat = ({ className, isWidget = false }) => {
    const [messages, setMessages] = useState(mockChatMessages)
    const [input, setInput] = useState('')
    const bottomRef = useRef(null)

    const sendMessage = (e) => {
        e.preventDefault()
        if (!input.trim()) return
        const newMsg = {
            id: Date.now(),
            user: 'You',
            team: 'Neutral',
            msg: input,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
        setMessages([...messages, newMsg])
        setInput('')
    }

    const Content = () => (
        <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
                {messages.map(m => (
                    <div key={m.id} className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-gray-300">{m.user}</span>
                            <span className="text-[10px] text-gray-500">{m.time}</span>
                        </div>
                        <div className={`p-3 rounded-lg text-sm leading-relaxed max-w-[85%] ${m.user === 'You' ? 'bg-neonGreen/20 text-neonGreen self-end rounded-tr-none' : 'bg-white/5 text-gray-300 self-start rounded-tl-none'
                            }`}>
                            {m.msg}
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>
            <form onSubmit={sendMessage} className="p-3 border-t border-white/10 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Tulis pesan..."
                    className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-neonGreen/50 transition"
                />
                <Button className="bg-neonGreen text-black p-2 rounded-lg" type="submit">
                    <Send className="w-4 h-4" />
                </Button>
            </form>
        </>
    )

    if (isWidget) {
        return (
            <Card className={`flex flex-col h-[500px] ${className}`}>
                <CardHeader className="border-b border-white/10 pb-3">
                    <h3 className="font-bold flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-neonGreen" /> Live Chat
                        <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse">LIVE</span>
                    </h3>
                </CardHeader>
                <Content />
            </Card>
        )
    }

    return (
        <div className={`flex flex-col h-full ${className}`}>
            <Content />
        </div>
    )
}

export default function UserMatchDetail() {
    const { id, matchId } = useParams()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('timeline')

    // Simple formatted time helper
    const getStatusDisplay = () => {
        if (matchData.status === 'scheduled') return new Date(matchData.startTime).toLocaleDateString()
        if (matchData.status === 'finished') return 'FULL TIME'
        if (matchData.status === 'halftime') return 'HALF TIME'
        return `LIVE • ${matchData.matchTime}'`
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-20">
            {/* Header / Nav */}
            <button
                onClick={() => navigate(`/dashboard/tournaments/${id}/view`)}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition"
            >
                <ArrowLeft className="w-4 h-4" /> Kembali ke Turnamen
            </button>

            {/* Scoreboard Main */}
            <Card className="overflow-hidden">
                <div className="bg-[#0a0a0a] p-6 sm:p-10 text-center relative">
                    {/* Status Badge */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 transition-all duration-500">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${['1st_half', '2nd_half'].includes(matchData.status) ? 'bg-red-500 text-white animate-pulse' :
                            matchData.status === 'finished' ? 'bg-neonGreen/20 text-neonGreen' :
                                'bg-white/10 text-gray-400'
                            }`}>
                            {getStatusDisplay()}
                        </span>
                    </div>

                    <div className="flex items-center justify-between mt-8">
                        {/* Home Team */}
                        <div className="flex flex-col items-center flex-1">
                            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-blue-500/20 ring-4 ring-blue-500/10 flex items-center justify-center mb-4">
                                <span className="text-2xl sm:text-3xl font-bold text-blue-400">{matchData.homeTeam.name.charAt(0)}</span>
                            </div>
                            <h2 className="text-lg sm:text-2xl font-display font-bold">{matchData.homeTeam.name}</h2>
                        </div>

                        {/* Score */}
                        <div className="px-4 sm:px-12">
                            <div className="text-4xl sm:text-7xl font-display font-bold tracking-tighter flex items-center gap-4">
                                <span className={matchData.homeScore > matchData.awayScore ? 'text-neonGreen' : 'text-white'}>
                                    {matchData.homeScore}
                                </span>
                                <span className="text-white/20">:</span>
                                <span className={matchData.awayScore > matchData.homeScore ? 'text-neonGreen' : 'text-white'}>
                                    {matchData.awayScore}
                                </span>
                            </div>
                        </div>

                        {/* Away Team */}
                        <div className="flex flex-col items-center flex-1">
                            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-red-500/20 ring-4 ring-red-500/10 flex items-center justify-center mb-4">
                                <span className="text-2xl sm:text-3xl font-bold text-red-400">{matchData.awayTeam.name.charAt(0)}</span>
                            </div>
                            <h2 className="text-lg sm:text-2xl font-display font-bold">{matchData.awayTeam.name}</h2>
                        </div>
                    </div>

                    {/* Scorers Summary (Below Scoreboard) */}
                    <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-2 gap-8">
                        <div className="text-right space-y-1">
                            {matchData.events.filter(e => e.type === 'goal' && e.team === 'home').map(e => (
                                <div key={e.id} className="text-sm text-gray-400 flex items-center justify-end gap-2">
                                    {e.player} <span className="text-neonGreen font-bold">{e.time}'</span> <Goal className="w-3 h-3 text-neonGreen" />
                                </div>
                            ))}
                        </div>
                        <div className="text-left space-y-1">
                            {matchData.events.filter(e => e.type === 'goal' && e.team === 'away').map(e => (
                                <div key={e.id} className="text-sm text-gray-400 flex items-center justify-start gap-2">
                                    <Goal className="w-3 h-3 text-neonGreen" /> <span className="text-neonGreen font-bold">{e.time}'</span> {e.player}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Ad Slot */}
                    <AdSlot variant="banner" adId="match-detail-ad" />

                    {/* Tabs & Content */}
                    <Card hover={false} className="overflow-hidden">
                        <div className="flex border-b border-white/10 overflow-x-auto">
                            <button
                                onClick={() => setActiveTab('timeline')}
                                className={`flex-1 min-w-[100px] py-4 text-sm font-bold flex items-center justify-center gap-2 transition relative ${activeTab === 'timeline' ? 'text-neonGreen' : 'text-gray-400 hover:text-white'}`}
                            >
                                <Clock className="w-4 h-4" /> Timeline
                                {activeTab === 'timeline' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-neonGreen"></div>}
                            </button>
                            <button
                                onClick={() => setActiveTab('analysis')}
                                className={`flex-1 min-w-[100px] py-4 text-sm font-bold flex items-center justify-center gap-2 transition relative ${activeTab === 'analysis' ? 'text-neonGreen' : 'text-gray-400 hover:text-white'}`}
                            >
                                <Brain className="w-4 h-4" /> Analysis
                                {activeTab === 'analysis' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-neonGreen"></div>}
                            </button>
                            {/* Chat Tab - Only visible on Mobile */}
                            <button
                                onClick={() => setActiveTab('chat')}
                                className={`lg:hidden flex-1 min-w-[100px] py-4 text-sm font-bold flex items-center justify-center gap-2 transition relative ${activeTab === 'chat' ? 'text-neonGreen' : 'text-gray-400 hover:text-white'}`}
                            >
                                <MessageCircle className="w-4 h-4" /> Chat
                                {activeTab === 'chat' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-neonGreen"></div>}
                            </button>
                        </div>

                        <CardContent className="p-0">
                            {/* TIMELINE TAB */}
                            {activeTab === 'timeline' && (
                                <div className="p-6">
                                    {matchData.events.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">Belum ada kejadian</div>
                                    ) : (
                                        <div className="relative border-l border-white/10 ml-4 space-y-6 py-2">
                                            {matchData.events.map((event) => (
                                                <div key={event.id} className="relative pl-6">
                                                    <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full ${event.team === 'home' ? 'bg-blue-500' : 'bg-red-500'}`}></div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono font-bold text-neonGreen">{event.time}'</span>
                                                        <span className="font-bold flex items-center gap-1">
                                                            {event.type === 'goal' && <Goal className="w-4 h-4 text-neonGreen" />}
                                                            {event.type === 'card' && <div className="w-3 h-4 bg-yellow-500 rounded-sm"></div>}
                                                            {event.type.toUpperCase()}
                                                        </span>
                                                        <span className="text-gray-400">- {event.player} {event.detail === 'Penalty' && '(P)'} ({event.team === 'home' ? matchData.homeTeam.name : matchData.awayTeam.name})</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
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
                                                <span className="text-blue-400">Home 45%</span>
                                                <span className="text-gray-400">Draw 25%</span>
                                                <span className="text-red-400">Away 30%</span>
                                            </div>
                                            <div className="h-3 bg-white/10 rounded-full overflow-hidden flex">
                                                <div className="h-full bg-blue-500" style={{ width: '45%' }}></div>
                                                <div className="h-full bg-gray-500" style={{ width: '25%' }}></div>
                                                <div className="h-full bg-red-500" style={{ width: '30%' }}></div>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2 italic">
                                                "Berdasarkan sistem AI kami, Barcelona FC memiliki momentum serangan yang lebih baik dalam 15 menit terakhir."
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
                                                    <span className="font-bold text-blue-400">BAR</span>
                                                    <span className="text-sm text-gray-400 font-mono">2 - 1</span>
                                                    <span className="font-bold text-red-400">RMA</span>
                                                </div>
                                                <div className="text-xs text-gray-500">Last Season</div>
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-red-400">RMA</span>
                                                    <span className="text-sm text-gray-400 font-mono">3 - 1</span>
                                                    <span className="font-bold text-blue-400">BAR</span>
                                                </div>
                                                <div className="text-xs text-gray-500">Cup Final</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* CHAT TAB - Mobile Only Content */}
                            {activeTab === 'chat' && (
                                <div className="h-[500px]">
                                    <LiveChat className="h-full border-none" isWidget={false} />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Chat (Desktop Only) */}
                <div className="hidden lg:block space-y-6">
                    <LiveChat isWidget={true} />
                </div>
            </div>
        </div>
    )
}
