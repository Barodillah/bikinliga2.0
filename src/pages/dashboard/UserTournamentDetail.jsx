import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Trophy, Users, Calendar, BarChart2, ArrowLeft, TrendingUp, Activity, Sparkles, Brain, Goal, Newspaper, Gift, ChevronRight, ArrowRight } from 'lucide-react'
import Card, { CardContent, CardHeader } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import StandingsTable from '../../components/tournament/StandingsTable'
import TopScorerList from '../../components/tournament/TopScorerList'
import TournamentStatistics from '../../components/tournament/TournamentStatistics'
import MatchCard from '../../components/tournament/MatchCard'
import AdSlot from '../../components/ui/AdSlot'
import Input from '../../components/ui/Input'
import LeagueNews from '../../components/tournament/LeagueNews'

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
        isParticipant: true, // Flag to show this view is for a participant
        prizeSettings: {
            enabled: true,
            totalPrizePool: 5000000,
            recipients: [
                { id: 1, label: 'Juara 1', percentage: 50, amount: 2500000 },
                { id: 2, label: 'Juara 2', percentage: 30, amount: 1500000 },
                { id: 3, label: 'Juara 3', percentage: 20, amount: 1000000 },
                { id: 4, label: 'Top Scorer', percentage: 0, amount: 500000 },
            ]
        }
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
        { id: 'prize', label: 'Hadiah', icon: Gift, hidden: !tournamentData.prizeSettings?.enabled },
        { id: 'league_news', label: 'League News', icon: Newspaper },
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
        <div className="space-y-4 md:space-y-6 overflow-x-hidden pb-24">
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
                <div className="flex flex-col gap-4 md:grid md:grid-cols-3 md:gap-6">
                    {/* Sidebar Stats - Shows first on mobile for quick insights */}
                    <div className="order-first md:order-last flex flex-col gap-3 md:gap-4 md:h-[500px]">
                        {/* Quick Insights - Horizontal scroll on mobile */}
                        <div className="flex md:flex-col gap-3 md:gap-4 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-hide md:flex-1">
                            <Card className="flex-shrink-0 w-[280px] md:w-auto md:flex-1 bg-gradient-to-b from-blue-900/20 to-transparent border-blue-500/20">
                                <CardHeader className="p-3 md:p-4">
                                    <h3 className="font-bold flex items-center gap-2 text-blue-400 text-sm md:text-base">
                                        <Activity className="w-4 h-4" /> Insight Cepat
                                    </h3>
                                </CardHeader>
                                <CardContent className="p-3 md:p-4 pt-0 md:pt-0 space-y-3 md:space-y-4">
                                    <div className="p-2.5 md:p-3 bg-white/5 rounded-lg border border-white/5">
                                        <div className="text-[10px] md:text-xs text-gray-500 mb-0.5 md:mb-1">Win Probability</div>
                                        <div className="font-bold text-base md:text-lg text-white">High (Top 3)</div>
                                        <div className="h-1 md:h-1.5 w-full bg-white/10 rounded-full mt-1.5 md:mt-2 overflow-hidden">
                                            <div className="h-full bg-neonGreen w-[75%]"></div>
                                        </div>
                                    </div>
                                    <div className="p-2.5 md:p-3 bg-white/5 rounded-lg border border-white/5">
                                        <div className="text-[10px] md:text-xs text-gray-500 mb-0.5 md:mb-1">Next Opponent Difficulty</div>
                                        <div className="font-bold text-base md:text-lg text-yellow-400">Medium</div>
                                        <div className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">vs Real Madrid</div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="flex-shrink-0 w-[200px] md:w-auto h-auto md:h-1/3 flex items-center justify-center p-4 md:p-6 text-center border-dashed border-white/20">
                                <div className="space-y-1 md:space-y-2 opacity-50">
                                    <BarChart2 className="w-6 h-6 md:w-8 md:h-8 mx-auto text-gray-400" />
                                    <div className="text-xs md:text-sm font-medium">More analytics coming soon</div>
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* Chat Area & Input */}
                    <div className="md:col-span-2 flex flex-col gap-3 md:gap-4">
                        {/* Messages Card */}
                        <div className="flex flex-col h-[calc(100vh-380px)] min-h-[320px] max-h-[450px] md:h-[500px] md:max-h-none bg-[#0a0a0a] rounded-xl border border-white/10 overflow-hidden relative">
                            {/* Premium Badge Background */}
                            <div className="absolute top-0 right-0 p-2 md:p-4 opacity-10 pointer-events-none">
                                <Sparkles className="w-32 h-32 md:w-64 md:h-64 text-yellow-500" />
                            </div>

                            {/* Chat Header */}
                            <div className="p-3 md:p-4 border-b border-white/10 bg-white/5 flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-2 md:gap-3">
                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                                        <Brain className="w-4 h-4 md:w-5 md:h-5 text-black" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-bold flex items-center gap-1.5 md:gap-2 text-sm md:text-base">
                                            <span className="truncate">Tournament Analyst AI</span>
                                            <span className="text-[9px] md:text-[10px] bg-yellow-500 text-black px-1 md:px-1.5 py-0.5 rounded font-bold flex-shrink-0">PRO</span>
                                        </div>
                                        <div className="text-[10px] md:text-xs text-gray-400 truncate">Powered by advanced match data</div>
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 scroll-container relative z-10">
                                {chatMessages.map((msg) => (
                                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] md:max-w-[80%] rounded-2xl p-3 md:p-4 text-sm md:text-base ${msg.role === 'user'
                                            ? 'bg-blue-600 text-white rounded-br-none'
                                            : 'bg-white/10 text-gray-200 rounded-bl-none border border-white/5'
                                            }`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                                {isTyping && (
                                    <div className="flex justify-start">
                                        <div className="bg-white/10 text-gray-400 rounded-2xl p-3 md:p-4 rounded-bl-none border border-white/5 flex gap-1">
                                            <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-500 rounded-full animate-bounce"></span>
                                            <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-500 rounded-full animate-bounce delay-100"></span>
                                            <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-500 rounded-full animate-bounce delay-200"></span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {/* Input Area */}
                            <div className="p-3 md:p-4 border-t border-white/10 bg-white/5 relative z-10">
                                <div className="flex gap-1.5 md:gap-2 mb-2 md:mb-3 overflow-x-auto pb-1.5 md:pb-2 scrollbar-hide -mx-1 px-1">
                                    {analysisPrompts.map((prompt, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handlePromptClick(prompt)}
                                            className="whitespace-nowrap px-2.5 md:px-3 py-1.5 md:py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] md:text-xs text-gray-400 hover:bg-white/10 hover:text-white active:bg-white/15 transition touch-manipulation"
                                        >
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                                <form onSubmit={handleSendMessage} className="flex gap-2">
                                    <Input
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        placeholder="Tanyakan analisis..."
                                        containerClassName="flex-1"
                                        className="w-full text-sm md:text-base"
                                    />
                                    <Button type="submit" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black border-none hover:opacity-90 active:opacity-80 px-3 md:px-4">
                                        <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Prize Tab (New) */}
            {activeTab === 'prize' && tournamentData.prizeSettings?.enabled && (
                <div className="space-y-6 animate-fadeIn">
                    <Card className="overflow-hidden relative">
                        {/* Background Effect */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-neonPurple/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                        <CardContent className="text-center py-8 relative z-10">
                            <Trophy className="w-12 h-12 mx-auto text-yellow-400 mb-3 animate-bounce-slow" />
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Total Prize Pool</h2>
                            <div className="text-3xl sm:text-4xl md:text-5xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300">
                                Rp {tournamentData.prizeSettings.totalPrizePool.toLocaleString('id-ID')}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <h3 className="font-display font-bold flex items-center gap-2">
                                    <Gift className="w-5 h-5 text-neonPink" />
                                    Distribusi Hadiah
                                </h3>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {tournamentData.prizeSettings.recipients.map((recipient, i) => (
                                    <div key={recipient.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                                                ${i === 0 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                                    i === 1 ? 'bg-gray-400/20 text-gray-300 border border-gray-400/30' :
                                                        i === 2 ? 'bg-orange-700/20 text-orange-400 border border-orange-700/30' :
                                                            'bg-white/10 text-gray-400'}`}>
                                                {i < 3 ? i + 1 : '#'}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white">{recipient.label}</div>
                                                {recipient.percentage > 0 && (
                                                    <div className="text-xs text-gray-500">{recipient.percentage}% dari total pool</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="font-mono font-bold text-neonGreen text-lg">
                                            Rp {recipient.amount.toLocaleString('id-ID')}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="h-full">
                            <CardHeader>
                                <h3 className="font-display font-bold flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-blue-400" />
                                    Syarat & Ketentuan
                                </h3>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <ul className="list-disc list-inside space-y-2 text-sm text-gray-400">
                                    <li>Hadiah akan didistribusikan selambat-lambatnya 3 hari setelah turnamen selesai.</li>
                                    <li>Pajak hadiah ditanggung oleh pemenang (jika ada).</li>
                                    <li>Keputusan panitia bersifat mutlak dan tidak dapat diganggu gugat.</li>
                                    <li>Pemenang wajib memiliki rekening bank yang aktif untuk proses transfer.</li>
                                </ul>
                                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-300 mt-4">
                                    <span className="font-bold block mb-1">Informasi Penting:</span>
                                    Pastikan data profil Anda sudah lengkap untuk memudahkan proses klaim hadiah.
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* Overview Tab - Social Feed Style */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Feed Header - Quick Stats */}
                    <div className="flex sm:grid sm:grid-cols-4 gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                        {[
                            { label: 'Pemain', value: tournamentData.players, icon: Users, color: 'text-blue-400' },
                            { label: 'Match', value: tournamentData.matches, icon: Calendar, color: 'text-neonGreen' },
                            { label: 'Gol', value: '45', icon: Goal, color: 'text-yellow-400' },
                            { label: 'G/M', value: '2.4', icon: Activity, color: 'text-neonPink' },
                        ].map((stat, i) => (
                            <div key={i} className="flex-shrink-0 flex flex-col items-center justify-center p-3 sm:p-4 bg-white/5 rounded-2xl border border-white/5 min-w-[100px] sm:min-w-0 w-[100px] sm:w-auto">
                                <stat.icon className={`w-5 h-5 mb-2 ${stat.color}`} />
                                <div className="text-lg sm:text-2xl font-display font-bold">{stat.value}</div>
                                <div className="text-[10px] sm:text-xs text-gray-500">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    <AdSlot variant="banner" />

                    {/* Prize Pool Teaser (if enabled) */}
                    {tournamentData.prizeSettings?.enabled && (
                        <div className="relative group cursor-pointer" onClick={() => setActiveTab('prize')}>
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition duration-500"></div>
                            <Card className="relative overflow-hidden border-neonPurple/30 bg-black/40 backdrop-blur-sm">
                                <CardContent className="p-5 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-neonPurple/20 flex items-center justify-center">
                                            <Gift className="w-6 h-6 text-neonPurple animate-pulse" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-neonPurple uppercase tracking-wider mb-1">Total Prize Pool</div>
                                            <div className="text-2xl font-mono font-bold text-white">
                                                Rp {tournamentData.prizeSettings.totalPrizePool.toLocaleString('id-ID')}
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-white transition group-hover:translate-x-1" />
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Latest News (Pinned) */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <Newspaper className="w-5 h-5 text-gray-400" />
                                Berita Terbaru
                            </h3>
                            <button onClick={() => setActiveTab('league_news')} className="text-xs text-neonGreen hover:text-white transition flex items-center gap-1">
                                Lihat Semua <ArrowRight className="w-3 h-3" />
                            </button>
                        </div>
                        <Link to={`/dashboard/tournaments/${id}/view/news/1`} className="block bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:bg-white/10 transition cursor-pointer">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition transform group-hover:scale-110 duration-500">
                                <Newspaper className="w-24 h-24" />
                            </div>
                            <div className="relative z-10">
                                <span className="inline-block px-2 py-1 rounded bg-neonGreen/20 text-neonGreen text-[10px] font-bold mb-2">PINNED</span>
                                <h4 className="font-bold text-lg sm:text-xl mb-2 line-clamp-2">Pendaftaran Liga Musim 2024 Telah Dibuka!</h4>
                                <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                                    Segera daftarkan tim mu untuk mengikuti kompetisi paling bergengsi tahun ini.
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span>Admin League</span>
                                    <span>•</span>
                                    <span>2 jam yang lalu</span>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Match Results Carousel */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <Activity className="w-5 h-5 text-gray-400" />
                                Hasil Terkini
                            </h3>
                            <button onClick={() => setActiveTab('fixtures')} className="text-xs text-gray-400 hover:text-white transition">Lihat Jadwal</button>
                        </div>
                        {/* Scroll Container - Added pr-4 for right padding on last item */}
                        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
                            {[
                                { home: 'FCB', away: 'MU', homeScore: 3, awayScore: 1 },
                                { home: 'RMA', away: 'ARS', homeScore: 2, awayScore: 2 },
                                { home: 'LIV', away: 'CHE', homeScore: 1, awayScore: 0 },
                                { home: 'PSG', away: 'BAY', homeScore: 0, awayScore: 2 },
                            ].map((match, i) => (
                                <div key={i} className="flex-shrink-0 w-[calc(100%-32px)] sm:w-[280px] snap-start first:ml-0 last:mr-4">
                                    <MatchCard
                                        {...match}
                                        status="completed"
                                        matchId={7 + i}
                                        onClick={() => handleMatchClick(7 + i)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Standings Snapshot - Full Width on Mobile */}
                    <Card className="w-full overflow-hidden">
                        <CardHeader className="flex flex-row justify-between items-center pb-2">
                            <h3 className="font-bold flex items-center gap-2">
                                <BarChart2 className="w-5 h-5 text-gray-400" />
                                Klasemen Papan Atas
                            </h3>
                            <button onClick={() => setActiveTab('standings')} className="p-1 rounded-full hover:bg-white/10 transition">
                                <ArrowRight className="w-5 h-5 text-gray-400" />
                            </button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <StandingsTable compact limit={4} />
                            <button
                                onClick={() => setActiveTab('standings')}
                                className="w-full py-3 text-xs text-center text-gray-500 hover:text-white hover:bg-white/5 transition border-t border-white/5"
                            >
                                Lihat Klasemen Lengkap
                            </button>
                        </CardContent>
                    </Card>

                    {/* Top Scorer Highlight - Full Width on Mobile */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-gray-400" />
                                Top Performance
                            </h3>
                            <button onClick={() => setActiveTab('top_scores')} className="text-xs text-neonGreen hover:text-white transition">
                                Lihat Semua
                            </button>
                        </div>

                        <Card className="bg-gradient-to-br from-gray-900 to-black border-white/10 w-full">
                            <CardContent className="p-4 flex flex-row items-center gap-4">
                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 p-0.5 flex-shrink-0">
                                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                                        <Users className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[10px] sm:text-xs text-yellow-500 font-bold uppercase mb-0.5">Top Scorer</div>
                                    <h4 className="font-bold text-base sm:text-lg text-white truncate">Lionel Messi</h4>
                                    <p className="text-xs sm:text-sm text-gray-400 truncate">Inter Miami</p>
                                </div>
                                <div className="text-center px-3 sm:px-4 py-2 bg-white/5 rounded-lg border border-white/5 flex-shrink-0">
                                    <div className="text-xl sm:text-2xl font-display font-bold text-white">12</div>
                                    <div className="text-[9px] sm:text-[10px] text-gray-500 uppercase">Gol</div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Upcoming Match Highlight - Full Width on Mobile */}
                    <Card className="border-l-4 border-l-blue-500 w-full">
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                                <div className="text-xs font-bold text-blue-400 uppercase">Next Big Match</div>
                                <div className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">20:00 WIB</div>
                            </div>
                            <div className="flex items-center justify-center gap-4 sm:gap-6 py-2">
                                <div className="text-center">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-sm sm:text-base font-bold mx-auto mb-1">FCB</div>
                                    <div className="text-xs text-gray-400">Barcelona</div>
                                </div>
                                <div className="text-lg sm:text-xl font-bold text-gray-500">VS</div>
                                <div className="text-center">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-sm sm:text-base font-bold mx-auto mb-1">RMA</div>
                                    <div className="text-xs text-gray-400">Real Madrid</div>
                                </div>
                            </div>
                            <button
                                onClick={() => handleMatchClick(1)}
                                className="w-full mt-3 py-2 rounded-lg bg-blue-500/10 text-blue-400 text-sm font-bold hover:bg-blue-500/20 transition"
                            >
                                Lihat Preview
                            </button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* League News Tab */}
            {activeTab === 'league_news' && <LeagueNews tournamentId={id} />}

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
