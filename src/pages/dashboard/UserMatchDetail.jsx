import React, { useState, useRef, useEffect } from 'react'
import { useParams, Link, useNavigate, useLocation, useOutletContext } from 'react-router-dom'
import { ArrowLeft, Clock, Goal, Brain, Percent, History, MessageCircle, Send, ChevronRight, Share2 } from 'lucide-react'
import Card, { CardContent, CardHeader } from '../../components/ui/Card'
import AdSlot from '../../components/ui/AdSlot'
import Button from '../../components/ui/Button'
import ShareDestinationModal from '../../components/ui/ShareDestinationModal'

import { authFetch } from '../../utils/api'

// Helper to format date
const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })
}

// ... imports
import { useAuth } from '../../contexts/AuthContext'

const LiveChat = ({ className, isWidget = false, status, matchId }) => {
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const bottomRef = useRef(null)
    const [isSending, setIsSending] = useState(false)
    const { user: currentUser } = useAuth()

    const fetchMessages = async () => {
        try {
            const res = await authFetch(`/api/matches/${matchId}/chat`)
            const data = await res.json()
            if (data.success) {
                // Map backend format to UI format
                // Backend: { id, message, user_id, username, name, created_at, team }
                const formatted = data.data.map(m => ({
                    id: m.id,
                    user: m.username || m.name || 'User',
                    team: m.team || 'Spectator',
                    msg: m.message,
                    time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isMe: currentUser && m.user_id === currentUser.id
                }))
                setMessages(formatted)
            }
        } catch (err) {
            console.error("Failed to load chat", err)
        }
    }

    // Initial load and polling
    useEffect(() => {
        if (!matchId) return
        fetchMessages()
        const interval = setInterval(fetchMessages, 5000) // Poll every 5s
        return () => clearInterval(interval)
    }, [matchId, currentUser])

    // Auto scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const sendMessage = async (e) => {
        e.preventDefault()
        if (!input.trim() || isSending) return
        if (!currentUser) {
            alert('Silakan login untuk berkomentar')
            return
        }

        const msgText = input
        setInput('')
        setIsSending(true)

        // Optimistic update
        const tempId = Date.now()
        const optimizeMsg = {
            id: tempId,
            user: currentUser.username || currentUser.name,
            team: 'Spectator',
            msg: msgText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: true
        }
        setMessages(prev => [...prev, optimizeMsg])

        try {
            const res = await authFetch(`/api/matches/${matchId}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: msgText })
            })
            const data = await res.json()
            if (!data.success) {
                // Revert if failed (simple way: refetch)
                fetchMessages()
                alert('Gagal mengirim pesan')
            } else {
                // Replace temp ID or just let polling fix it eventually, but fetching now is safer to get server time/ID
                fetchMessages()
            }
        } catch (err) {
            console.error(err)
            alert('Error sending message')
        } finally {
            setIsSending(false)
        }
    }

    const chatContent = (
        <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 text-sm py-4">Belum ada komentar. Jadilah yang pertama!</div>
                )}
                {messages.map(m => (
                    <div key={m.id} className={`flex flex-col gap-1 ${m.isMe ? 'items-end' : 'items-start'}`}>
                        <div className={`flex items-center gap-2 ${m.isMe ? 'flex-row-reverse' : ''}`}>
                            <span className={`font-bold text-sm ${m.isMe ? 'text-neonGreen' : 'text-gray-300'}`}>{m.user}</span>
                            <span className="text-[10px] text-gray-500">{m.time}</span>
                        </div>
                        <div className={`p-3 rounded-lg text-sm leading-relaxed max-w-[85%] ${m.isMe ? 'bg-neonGreen/20 text-neonGreen rounded-tr-none' : 'bg-white/5 text-gray-300 rounded-tl-none'
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
                    placeholder={currentUser ? "Tulis komentar..." : "Login untuk berkomentar"}
                    disabled={!currentUser}
                    className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-neonGreen/50 transition disabled:opacity-50"
                />
                <Button
                    className="bg-neonGreen text-black p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    type="submit"
                    disabled={!currentUser || isSending}
                >
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
                        {status === 'live' && (
                            <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse">LIVE</span>
                        )}
                    </h3>
                </CardHeader>
                {chatContent}
            </Card>
        )
    }

    return (
        <div className={`flex flex-col h-full ${className}`}>
            {chatContent}
        </div>
    )
}

export default function UserMatchDetail() {
    const { id, matchId } = useParams()
    const navigate = useNavigate()
    const { setActiveSidebarOverride } = useOutletContext()
    const [activeTab, setActiveTab] = useState('timeline')

    const [match, setMatch] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [shareModalOpen, setShareModalOpen] = useState(false)
    const location = useLocation()
    const isCompetition = location.pathname.includes('/competitions')

    useEffect(() => {
        if (match) {
            if (match.status === 'live' || match.status === '1st_half' || match.status === '2nd_half' || match.status === 'halftime') {
                setActiveSidebarOverride('/dashboard/stream')
            } else {
                setActiveSidebarOverride('/dashboard/competitions')
            }
        }
        return () => {
            setActiveSidebarOverride(null)
        }
    }, [match, setActiveSidebarOverride])

    useEffect(() => {
        const fetchMatch = async () => {
            try {
                const response = await authFetch(`/api/matches/${matchId}`)
                const data = await response.json()
                if (data.success) {
                    setMatch(data.data)
                    // Set default tab based on status
                    if (data.data.status === 'scheduled') {
                        setActiveTab('analysis')
                    } else {
                        setActiveTab('timeline')
                    }
                } else {
                    setError(data.message)
                }
            } catch (err) {
                console.error("Error fetching match:", err)
                setError('Gagal memuat data pertandingan')
            } finally {
                setLoading(false)
            }
        }
        if (matchId) fetchMatch()
    }, [matchId])

    // Simple formatted time helper
    const getStatusDisplay = () => {
        if (!match) return ''
        if (match.status === 'scheduled') return formatDate(match.startTime)
        if (match.status === 'completed' || match.status === 'finished') return 'FULL TIME'
        if (match.status === 'halftime' || match.details?.period === 'halftime') return 'HALF TIME'
        return `LIVE • ${match.details?.period?.replace('_', ' ') || 'In Game'}`
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>
    if (error) return <div className="min-h-screen flex items-center justify-center text-white">{error}</div>
    if (!match) return <div className="min-h-screen flex items-center justify-center text-white">Pertandingan tidak ditemukan</div>

    const handleShare = () => {
        if (!match) return;
        setShareModalOpen(true);
    };

    const sharedContent = match ? {
        type: 'match',
        id: match.id,
        metadata: {
            homeTeam: match.homeTeam.name,
            awayTeam: match.awayTeam.name,
            homeScore: match.homeScore,
            awayScore: match.awayScore,
            status: match.status,
            tournament_id: id // from useParams
        }
    } : null;

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-20">
            {/* Header / Nav */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition"
                >
                    <ArrowLeft className="w-4 h-4" /> {location.state?.from === 'stream' ? 'Kembali ke Stream' : (isCompetition ? 'Kembali ke Kompetisi' : 'Kembali ke Turnamen')}
                </button>
                <button
                    onClick={handleShare}
                    className="text-gray-400 hover:text-neonGreen flex items-center gap-2 transition text-sm"
                    title="Bagikan ke E-Club"
                >
                    <Share2 className="w-4 h-4" /> Bagikan ke E-Club
                </button>
            </div>

            {/* Scoreboard Main */}
            <Card className="overflow-hidden">
                <div className="bg-[#0a0a0a] p-6 sm:p-10 text-center relative">
                    {/* Status Badge */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 transition-all duration-500">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${match.status === 'live' ? 'bg-red-500 text-white animate-pulse' :
                            (match.status === 'completed' || match.status === 'finished') ? 'bg-neonGreen/20 text-neonGreen' :
                                'bg-white/10 text-gray-400'
                            }`}>
                            {getStatusDisplay()}
                        </span>
                    </div>

                    <div className="flex items-center justify-between mt-8">
                        {/* Home Team */}
                        <div className="flex flex-col items-center flex-1">
                            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl bg-blue-500/20 ring-4 ring-blue-500/10 flex items-center justify-center mb-4 overflow-hidden">
                                {match.homeTeam.logo ? (
                                    <img src={match.homeTeam.logo} alt="" className="w-full h-full object-contain" />
                                ) : (
                                    <span className="text-2xl sm:text-3xl font-bold text-blue-400">{match.homeTeam.name?.charAt(0)}</span>
                                )}
                            </div>
                            <h2 className="text-lg sm:text-2xl font-display font-bold">{match.homeTeam.teamName || match.homeTeam.name}</h2>
                            <p className="text-xs text-gray-500 mt-1">{match.homeTeam.name}</p>
                        </div>

                        {/* Score */}
                        <div className="px-4 sm:px-12">
                            <div className="text-4xl sm:text-7xl font-display font-bold tracking-tighter flex items-center gap-4">
                                <span className={match.homeScore > match.awayScore ? 'text-neonGreen' : 'text-white'}>
                                    {match.homeScore}
                                </span>
                                <span className="text-white/20">:</span>
                                <span className={match.awayScore > match.homeScore ? 'text-neonGreen' : 'text-white'}>
                                    {match.awayScore}
                                </span>
                            </div>
                            {match.homePenaltyScore !== null && match.awayPenaltyScore !== null && (
                                <div className="text-sm text-gray-400 mt-2 font-mono">
                                    Penalty: ({match.homePenaltyScore} - {match.awayPenaltyScore})
                                </div>
                            )}
                        </div>

                        {/* Away Team */}
                        <div className="flex flex-col items-center flex-1">
                            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl bg-red-500/20 ring-4 ring-red-500/10 flex items-center justify-center mb-4 overflow-hidden">
                                {match.awayTeam.logo ? (
                                    <img src={match.awayTeam.logo} alt="" className="w-full h-full object-contain" />
                                ) : (
                                    <span className="text-2xl sm:text-3xl font-bold text-red-400">{match.awayTeam.name?.charAt(0)}</span>
                                )}
                            </div>
                            <h2 className="text-lg sm:text-2xl font-display font-bold">{match.awayTeam.teamName || match.awayTeam.name}</h2>
                            <p className="text-xs text-gray-500 mt-1">{match.awayTeam.name}</p>
                        </div>
                    </div>

                    {/* Scorers Summary (Below Scoreboard) */}
                    <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-2 gap-8">
                        <div className="text-right space-y-1">
                            {match.events.filter(e => e.type === 'goal' && e.team === 'home').map(e => (
                                <div key={e.id} className="text-sm text-gray-400 flex items-center justify-end gap-2">
                                    {e.player} <span className="text-neonGreen font-bold">{e.time}'</span> <Goal className="w-3 h-3 text-neonGreen" />
                                </div>
                            ))}
                        </div>
                        <div className="text-left space-y-1">
                            {match.events.filter(e => e.type === 'goal' && e.team === 'away').map(e => (
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
                            {match.status !== 'scheduled' && (
                                <button
                                    onClick={() => setActiveTab('timeline')}
                                    className={`flex-1 min-w-[100px] py-4 text-sm font-bold flex items-center justify-center gap-2 transition relative ${activeTab === 'timeline' ? 'text-neonGreen' : 'text-gray-400 hover:text-white'}`}
                                >
                                    <Clock className="w-4 h-4" /> Timeline
                                    {activeTab === 'timeline' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-neonGreen"></div>}
                                </button>
                            )}
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
                                    {match.events.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">Belum ada kejadian</div>
                                    ) : (
                                        <div className="relative border-l border-white/10 ml-4 space-y-6 py-2">
                                            {match.events.map((event) => (
                                                <div key={event.id} className="relative pl-6">
                                                    <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full ${event.team === 'home' ? 'bg-blue-500' : 'bg-red-500'}`}></div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono font-bold text-neonGreen">{event.time}'</span>
                                                        <span className="font-bold flex items-center gap-1">
                                                            {event.type === 'goal' && <Goal className="w-4 h-4 text-neonGreen" />}
                                                            {event.type === 'card' && <div className={`w-3 h-4 rounded-sm ${event.detail.includes('Red') ? 'bg-red-500' : 'bg-yellow-500'}`}></div>}
                                                            {event.type.toUpperCase()}
                                                        </span>
                                                        <span className="text-gray-400">- {event.player} {event.detail === 'Penalty' && '(P)'} ({event.team === 'home' ? match.homeTeam.teamName || match.homeTeam.name : match.awayTeam.teamName || match.awayTeam.name})</span>
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
                                            <Percent className="w-5 h-5 text-neonPink" /> Win Probability ({match.analysis?.historyType === 'all_time' ? 'All Time User History' : 'Tournament History'})
                                        </h3>
                                        {match.analysis ? (
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm font-bold mb-1">
                                                    <span className="text-blue-400">Home {match.analysis.winProbability.home}%</span>
                                                    <span className="text-gray-400">Draw {match.analysis.winProbability.draw}%</span>
                                                    <span className="text-red-400">Away {match.analysis.winProbability.away}%</span>
                                                </div>
                                                <div className="h-3 bg-white/10 rounded-full overflow-hidden flex">
                                                    <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${match.analysis.winProbability.home}%` }}></div>
                                                    <div className="h-full bg-gray-500 transition-all duration-1000" style={{ width: `${match.analysis.winProbability.draw}%` }}></div>
                                                    <div className="h-full bg-red-500 transition-all duration-1000" style={{ width: `${match.analysis.winProbability.away}%` }}></div>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-2 italic">
                                                    {match.analysis.historyType === 'all_time'
                                                        ? "Prediksi AI: Kombinasi H2H (20%), performa liga (50%), dan statistik gol (30%)."
                                                        : "Prediksi AI: Kombinasi H2H turnamen, klasemen, dan statistik gol (weighted)."}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="text-gray-500 text-sm italic animate-pulse">Memuat data analisis...</div>
                                        )}
                                    </div>

                                    {/* Head to Head */}
                                    <div className="p-6">
                                        <h3 className="font-display font-bold mb-4 flex items-center gap-2">
                                            <History className="w-5 h-5 text-yellow-400" /> Head to Head (Last 3 Meetings)
                                        </h3>
                                        <div className="space-y-3">
                                            {match.analysis?.headToHead?.length > 0 ? (
                                                match.analysis.headToHead.map((h2h) => (
                                                    <div key={h2h.id} className="flex flex-col sm:flex-row items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 gap-2 sm:gap-0">
                                                        {/* Match Result Row */}
                                                        <div className="flex items-center justify-between w-full sm:w-auto sm:justify-start gap-2 sm:gap-3">
                                                            {/* Home Team */}
                                                            <div className="flex items-center gap-2 flex-1 sm:flex-initial sm:min-w-[80px] justify-end sm:justify-start">
                                                                <span className={`font-bold text-sm truncate max-w-[80px] sm:max-w-[100px] ${h2h.isHome ? 'text-blue-400' : 'text-red-400'} text-right sm:text-left`} title={h2h.homeTeam}>
                                                                    {h2h.homeTeam}
                                                                </span>
                                                            </div>

                                                            {/* Score */}
                                                            <div className="px-2 py-1 bg-black/40 rounded text-xs sm:text-sm font-mono text-gray-300 whitespace-nowrap min-w-[50px] text-center">
                                                                {h2h.homeScore} - {h2h.awayScore}
                                                            </div>

                                                            {/* Away Team */}
                                                            <div className="flex items-center gap-2 flex-1 sm:flex-initial sm:min-w-[80px] justify-start sm:justify-end">
                                                                <span className={`font-bold text-sm truncate max-w-[80px] sm:max-w-[100px] ${!h2h.isHome ? 'text-blue-400' : 'text-red-400'} text-left sm:text-right`} title={h2h.awayTeam}>
                                                                    {h2h.awayTeam}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Info Row (Stacked on mobile) */}
                                                        <div className="w-full sm:w-auto flex sm:block items-center justify-between sm:text-right text-xs gap-2 pt-1 sm:pt-0 border-t sm:border-t-0 border-white/5 sm:ml-4">
                                                            <div className="text-neonGreen/80 truncate max-w-[120px] sm:max-w-[150px]" title={h2h.tournament}>{h2h.tournament}</div>
                                                            <div className="text-gray-500">{new Date(h2h.date).toLocaleDateString()}</div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-6 border border-dashed border-white/10 rounded-lg">
                                                    <History className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                                                    <p className="text-gray-500 text-sm">Belum ada riwayat pertemuan sebelumnya.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* CHAT TAB - Mobile Only Content */}
                            {activeTab === 'chat' && (
                                <div className="h-[500px]">
                                    <LiveChat className="h-full border-none" isWidget={false} status={match?.status} matchId={matchId} />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div > {/* End Left Column */}

                {/* Right Column: Chat (Desktop Only) */}
                <div className="hidden lg:block space-y-6">
                    <LiveChat isWidget={true} status={match?.status} matchId={matchId} />
                </div>
            </div>

            {/* Share Destination Modal */}
            <ShareDestinationModal
                isOpen={shareModalOpen}
                onClose={() => setShareModalOpen(false)}
                sharedContent={sharedContent}
            />
        </div>
    )
}
