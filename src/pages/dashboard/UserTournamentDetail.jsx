import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Trophy, Users, Calendar, BarChart2, ArrowLeft, TrendingUp, Activity, Sparkles, Brain, Goal } from 'lucide-react'
import Card, { CardContent, CardHeader } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import StandingsTable from '../../components/tournament/StandingsTable'
import TopScorerList from '../../components/tournament/TopScorerList'
import TournamentStatistics from '../../components/tournament/TournamentStatistics'
import MatchCard from '../../components/tournament/MatchCard'
import AdSlot from '../../components/ui/AdSlot'
import Input from '../../components/ui/Input'

// Reusing same mock data logic as TournamentDetail (simplified)
const getTournamentData = (id) => {
    // For demo purposes, returning a generic active tournament data
    return {
        id: id,
        name: 'Open Liga Nusantara',
        type: 'Liga',
        status: 'active',
        players: 16,
        matches: 28,
        completed: 12,
        startDate: '2024-05-01',
        description: 'Liga terbuka untuk umum, semua skill level welcome!',
        shareLink: `bikinliga.com/t/${id}`,
        pointSystem: '3-1-0',
        homeAway: true,
        visibility: 'public',
        isParticipant: true // Flag to show this view is for a participant
    }
}

// Sample analysis prompts
const analysisPrompts = [
    "Siapa kandidat juara saat ini?",
    "Bagaimana performa tim saya?",
    "Prediksi pertandingan selanjutnya",
    "Analisis kelemahan lawan"
]

export default function UserTournamentDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const tournamentData = getTournamentData(id)
    const [activeTab, setActiveTab] = useState('overview')
    const [copied, setCopied] = useState(false)

    // AI Chat State
    const [chatMessages, setChatMessages] = useState([
        { id: 1, role: 'system', content: 'Halo! Saya asisten analisis AI khusus untuk turnamen ini. Tanyakan apa saja tentang statistik, prediksi, atau performa tim.' }
    ])
    const [chatInput, setChatInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)

    const isKnockout = tournamentData.type === 'Knockout'
    const isGroupKO = tournamentData.type === 'Group+KO'
    const isLeague = tournamentData.type === 'Liga'

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Trophy },
        { id: 'ai_analysis', label: 'AI Analysis', icon: Brain, isPremium: true },
        { id: 'standings', label: 'Klasemen', icon: BarChart2, hidden: !isLeague },
        { id: 'fixtures', label: 'Jadwal', icon: Calendar },
        { id: 'top_scores', label: 'Top Score', icon: TrendingUp },
        { id: 'statistics', label: 'Statistik', icon: Activity },
    ].filter(t => !t.hidden)

    const copyShareLink = () => {
        navigator.clipboard.writeText(tournamentData.shareLink)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleSendMessage = (e) => {
        e.preventDefault()
        if (!chatInput.trim()) return

        // User Message
        const userMsg = { id: Date.now(), role: 'user', content: chatInput }
        setChatMessages(prev => [...prev, userMsg])
        setChatInput('')
        setIsTyping(true)

        // Simulate AI Response
        setTimeout(() => {
            const aiMsg = {
                id: Date.now() + 1,
                role: 'system',
                content: `Berdasarkan data statistik terkini, pertanyaan Anda tentang "${userMsg.content}" menarik. Tim X menunjukkan performa signifikat di babak kedua, yang mungkin menjadi kunci.`
            }
            setChatMessages(prev => [...prev, aiMsg])
            setIsTyping(false)
        }, 1500)
    }

    const handlePromptClick = (prompt) => {
        setChatInput(prompt)
    }

    // Navigate to read-only match view
    const handleMatchClick = (matchId) => {
        navigate(`/dashboard/tournaments/${id}/view/match/${matchId}`)
    }

    return (
        <div className="space-y-4 md:space-y-6 overflow-x-hidden">
            {/* Header */}
            <div className="space-y-4">
                <button
                    onClick={() => navigate('/dashboard/competitions')}
                    className="text-gray-400 hover:text-white flex items-center gap-2 transition text-sm"
                >
                    <ArrowLeft className="w-4 h-4" /> Kembali ke kompetisi
                </button>

                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                            <Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold truncate">{tournamentData.name}</h1>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className="text-xs sm:text-sm px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                                    {tournamentData.type}
                                </span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                    Participant View
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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
                            <tab.icon className={`w-4 h-4 ${tab.isPremium ? 'text-yellow-400' : ''}`} />
                            {tab.label}
                            {tab.isPremium && (
                                <span className="ml-1 text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full font-bold">PRO</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}

            {/* AI Analysis Tab (Premium) */}
            {activeTab === 'ai_analysis' && (
                <div className="grid md:grid-cols-3 gap-6 h-[600px]">
                    {/* Chat Area */}
                    <div className="md:col-span-2 flex flex-col h-full bg-[#0a0a0a] rounded-xl border border-white/10 overflow-hidden relative">
                        {/* Premium Badge Background */}
                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                            <Sparkles className="w-64 h-64 text-yellow-500" />
                        </div>

                        {/* Chat Header */}
                        <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                                    <Brain className="w-5 h-5 text-black" />
                                </div>
                                <div>
                                    <div className="font-bold flex items-center gap-2">
                                        Tournament Analyst AI
                                        <span className="text-[10px] bg-yellow-500 text-black px-1.5 py-0.5 rounded font-bold">PRO</span>
                                    </div>
                                    <div className="text-xs text-gray-400">Powered by advanced match data</div>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-container relative z-10">
                            {chatMessages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-br-none'
                                        : 'bg-white/10 text-gray-200 rounded-bl-none border border-white/5'
                                        }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white/10 text-gray-400 rounded-2xl p-4 rounded-bl-none border border-white/5 flex gap-1">
                                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></span>
                                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-white/10 bg-white/5 relative z-10">
                            <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-hide">
                                {analysisPrompts.map((prompt, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handlePromptClick(prompt)}
                                        className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 hover:bg-white/10 hover:text-white transition"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <Input
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder="Tanyakan analisis tentang kompetisi ini..."
                                    className="flex-1"
                                />
                                <Button type="submit" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black border-none hover:opacity-90">
                                    <Sparkles className="w-5 h-5" />
                                </Button>
                            </form>
                        </div>
                    </div>

                    {/* Sidebar Stats */}
                    <div className="hidden md:flex flex-col gap-4">
                        <Card className="flex-1 bg-gradient-to-b from-blue-900/20 to-transparent border-blue-500/20">
                            <CardHeader>
                                <h3 className="font-bold flex items-center gap-2 text-blue-400">
                                    <Activity className="w-4 h-4" /> Insight Cepat
                                </h3>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                    <div className="text-xs text-gray-500 mb-1">Win Probability</div>
                                    <div className="font-bold text-lg text-white">High (Top 3)</div>
                                    <div className="h-1.5 w-full bg-white/10 rounded-full mt-2 overflow-hidden">
                                        <div className="h-full bg-neonGreen w-[75%]"></div>
                                    </div>
                                </div>
                                <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                    <div className="text-xs text-gray-500 mb-1">Next Opponent Difficulty</div>
                                    <div className="font-bold text-lg text-yellow-400">Medium</div>
                                    <div className="text-xs text-gray-400 mt-1">vs Real Madrid</div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="h-1/3 flex items-center justify-center p-6 text-center border-dashed border-white/20">
                            <div className="space-y-2 opacity-50">
                                <BarChart2 className="w-8 h-8 mx-auto text-gray-400" />
                                <div className="text-sm font-medium">More analytics coming soon</div>
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="p-4 text-center">
                            <Users className="w-5 h-5 mx-auto mb-2 text-blue-400" />
                            <div className="text-2xl font-display font-bold">{tournamentData.players}</div>
                            <div className="text-xs text-gray-500">Pemain</div>
                        </Card>
                        <Card className="p-4 text-center">
                            <Calendar className="w-5 h-5 mx-auto mb-2 text-neonGreen" />
                            <div className="text-2xl font-display font-bold">{tournamentData.matches}</div>
                            <div className="text-xs text-gray-500">Total Match</div>
                        </Card>
                        <Card className="p-4 text-center">
                            <Goal className="w-5 h-5 mx-auto mb-2 text-yellow-400" />
                            <div className="text-2xl font-display font-bold">45</div>
                            <div className="text-xs text-gray-500">Total Gol</div>
                        </Card>
                        <Card className="p-4 text-center">
                            <Activity className="w-5 h-5 mx-auto mb-2 text-neonPink" />
                            <div className="text-2xl font-display font-bold">2.4</div>
                            <div className="text-xs text-gray-500">Gol / Match</div>
                        </Card>
                    </div>

                    <AdSlot variant="banner" className="my-6" />

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Standings Preview */}
                        <Card hover={false}>
                            <CardHeader className="flex justify-between items-center">
                                <h3 className="font-display font-bold">Klasemen Sementara</h3>
                                <button onClick={() => setActiveTab('standings')} className="text-xs text-neonGreen hover:underline">Lihat Semua</button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <StandingsTable compact />
                            </CardContent>
                        </Card>

                        {/* Recent Matches */}
                        <Card hover={false}>
                            <CardHeader>
                                <h3 className="font-display font-bold">Hasil Pertandingan</h3>
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

            {/* Other Tabs (Reused Components) */}
            {activeTab === 'standings' && (
                <Card hover={false}>
                    <CardHeader>
                        <h3 className="font-display font-bold">Klasemen Liga</h3>
                    </CardHeader>
                    <CardContent className="p-0">
                        <StandingsTable />
                    </CardContent>
                </Card>
            )}

            {activeTab === 'fixtures' && (
                <div className="space-y-6">
                    <AdSlot variant="banner" />
                    <Card className="p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-display font-bold">Jadwal Pertandingan</h3>
                        </div>
                        <div className="space-y-3">
                            <MatchCard home="FCB" away="RMA" time="Hari ini, 20:00" status="upcoming" onClick={() => handleMatchClick(1)} />
                            <MatchCard home="MU" away="ARS" time="Besok, 19:30" status="upcoming" onClick={() => handleMatchClick(2)} />
                            <MatchCard home="LIV" away="CHE" time="Besok, 21:00" status="upcoming" onClick={() => handleMatchClick(3)} />
                        </div>
                    </Card>
                </div>
            )}

            {activeTab === 'top_scores' && <TopScorerList />}
            {activeTab === 'statistics' && <TournamentStatistics />}

        </div>
    )
}
