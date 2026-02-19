import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Zap, PlayCircle, Trophy, Calendar, Users, TrendingUp, ChevronRight, Shield, Star, Brain, Sparkles, BarChart3, Target } from 'lucide-react'
import useReveal from '../../hooks/useReveal'

export default function Hero() {
    const revealRef = useReveal()
    const [activeScreen, setActiveScreen] = useState(0)
    const [isAnimating, setIsAnimating] = useState(false)

    const screens = [
        { id: 'standings', label: 'Klasemen', icon: Trophy },
        { id: 'bracket', label: 'Bracket', icon: Users },
        { id: 'live', label: 'Live Match', icon: TrendingUp },
        { id: 'ai', label: 'AI Analysis', icon: Brain },
    ]

    const [typingText, setTypingText] = useState('')
    const aiInsight = "Berdasarkan 45 pertandingan terakhir, FC Barcelona memiliki 78% peluang memenangkan Final melawan Real Madrid. Keunggulan mereka di possession (62%) dan akurasi passing (89%) menjadi faktor kunci."

    useEffect(() => {
        if (activeScreen === 3) {
            setTypingText('')
            let i = 0
            const typing = setInterval(() => {
                if (i < aiInsight.length) {
                    setTypingText(aiInsight.slice(0, i + 1))
                    i++
                } else {
                    clearInterval(typing)
                }
            }, 20)
            return () => clearInterval(typing)
        }
    }, [activeScreen])

    useEffect(() => {
        const interval = setInterval(() => {
            setIsAnimating(true)
            setTimeout(() => {
                setActiveScreen((prev) => (prev + 1) % screens.length)
                setIsAnimating(false)
            }, 300)
        }, 4000)
        return () => clearInterval(interval)
    }, [])

    const teams = [
        { name: 'FC Barcelona', logo: '🔵🔴', pts: 25, w: 8, d: 1, l: 1, gd: '+18' },
        { name: 'Real Madrid', logo: '⚪', pts: 22, w: 7, d: 1, l: 2, gd: '+12' },
        { name: 'Atletico Madrid', logo: '🔴⚪', pts: 19, w: 6, d: 1, l: 3, gd: '+8' },
        { name: 'Sevilla FC', logo: '🔴', pts: 15, w: 4, d: 3, l: 3, gd: '+2' },
    ]

    const bracketMatches = [
        { round: 'Semi Final', team1: 'FC Barcelona', team2: 'Atletico Madrid', score1: 2, score2: 1, status: 'done' },
        { round: 'Semi Final', team1: 'Real Madrid', team2: 'Sevilla FC', score1: 3, score2: 0, status: 'done' },
        { round: 'Final', team1: 'FC Barcelona', team2: 'Real Madrid', score1: '-', score2: '-', status: 'upcoming' },
    ]

    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neonGreen/30 bg-neonGreen/10 text-neonGreen text-sm font-semibold mb-6 animate-pulse-glow">
                        <span className="w-2 h-2 rounded-full bg-neonGreen"></span>
                        Platform #1 untuk Komunitas eFootball
                    </div>

                    <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-6 leading-tight">
                        Kelola Turnamen <br />
                        <span className="gradient-text">Semudah Kick-Off</span>
                    </h1>

                    <p className="mt-4 text-xl text-gray-400 max-w-2xl mx-auto mb-10">
                        BikinLiga adalah web apps pengelolaan kompetisi football game. Buat bracket, atur jadwal, dan pantau klasemen eFootball secara otomatis dan real-time.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link to="/dashboard/tournaments/new" className="btn-primary w-full sm:w-auto px-8 py-4 rounded-full text-lg flex items-center justify-center gap-2">
                            <Zap className="w-5 h-5" />
                            Buat Liga Sekarang
                        </Link>
                        <Link to="/tutorial" className="btn-secondary w-full sm:w-auto px-8 py-4 rounded-full text-lg flex items-center justify-center gap-2">
                            <PlayCircle className="w-5 h-5" />
                            Lihat Panduan
                        </Link>
                    </div>
                </div>

                {/* Hero Visual / Dashboard Preview */}
                <div className="mt-16 relative mx-auto max-w-5xl reveal" ref={revealRef}>
                    {/* Floating Elements */}
                    <div className="absolute -top-8 -left-8 w-16 h-16 bg-neonGreen/20 rounded-2xl blur-xl animate-float"></div>
                    <div className="absolute -bottom-8 -right-8 w-20 h-20 bg-neonPink/20 rounded-2xl blur-xl animate-float" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute top-1/2 -right-12 w-12 h-12 bg-purple-500/20 rounded-full blur-lg animate-float" style={{ animationDelay: '2s' }}></div>

                    <div className="absolute -inset-1 bg-gradient-to-r from-neonGreen via-purple-500 to-neonPink rounded-2xl blur opacity-30 animate-gradient-shift"></div>
                    <div className="relative rounded-2xl bg-cardBg border border-white/10 overflow-hidden shadow-2xl backdrop-blur-sm">
                        {/* Browser Header */}
                        <div className="h-10 bg-gradient-to-r from-[#1a1a1a] to-[#252525] border-b border-white/5 flex items-center px-4 gap-2">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors cursor-pointer"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors cursor-pointer"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 transition-colors cursor-pointer"></div>
                            </div>
                            <div className="ml-4 flex-1 max-w-md h-6 bg-white/5 rounded-lg flex items-center px-3 gap-2">
                                <Shield className="w-3 h-3 text-neonGreen" />
                                <span className="text-[11px] text-gray-400 font-mono">bikinliga.online/dashboard</span>
                            </div>
                            <div className="hidden sm:flex items-center gap-2 text-[10px] text-gray-500">
                                <span className="px-2 py-1 bg-neonGreen/20 text-neonGreen rounded">PRO</span>
                            </div>
                        </div>

                        {/* Dashboard Content */}
                        <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-4 gap-4 min-h-[360px]">
                            {/* Sidebar */}
                            <div className="hidden md:flex flex-col col-span-1 space-y-2">
                                <div className="p-3 bg-gradient-to-r from-neonGreen/10 to-transparent rounded-lg border-l-2 border-neonGreen mb-4">
                                    <div className="flex items-center gap-2">
                                        <Trophy className="w-4 h-4 text-neonGreen" />
                                        <span className="text-sm font-bold text-white">Liga Utama S1</span>
                                    </div>
                                    <span className="text-[10px] text-gray-500 mt-1">10 Tim • 45 Pertandingan</span>
                                </div>
                                {screens.map((screen, i) => (
                                    <button
                                        key={screen.id}
                                        onClick={() => {
                                            setIsAnimating(true)
                                            setTimeout(() => {
                                                setActiveScreen(i)
                                                setIsAnimating(false)
                                            }, 150)
                                        }}
                                        className={`h-10 rounded-lg w-full flex items-center px-3 gap-2 text-sm font-medium transition-all duration-300 ${activeScreen === i
                                            ? 'bg-white/10 text-white border border-white/10'
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        <screen.icon className={`w-4 h-4 ${activeScreen === i ? 'text-neonGreen' : ''}`} />
                                        {screen.label}
                                        {activeScreen === i && <ChevronRight className="w-3 h-3 ml-auto text-neonGreen" />}
                                    </button>
                                ))}
                                <div className="flex-1"></div>
                                <div className="p-3 bg-gradient-to-r from-neonPink/10 to-purple-500/10 rounded-lg border border-neonPink/20">
                                    <div className="flex items-center gap-2 text-[11px] text-neonPink font-semibold">
                                        <Calendar className="w-3 h-3" />
                                        Match Hari Ini: 3
                                    </div>
                                </div>
                            </div>

                            {/* Main Content */}
                            <div className={`col-span-3 transition-all duration-300 ${isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
                                {/* Screen Tabs for Mobile */}
                                <div className="flex md:hidden gap-2 mb-4 overflow-x-auto pb-2">
                                    {screens.map((screen, i) => (
                                        <button
                                            key={screen.id}
                                            onClick={() => {
                                                setIsAnimating(true)
                                                setTimeout(() => {
                                                    setActiveScreen(i)
                                                    setIsAnimating(false)
                                                }, 150)
                                            }}
                                            className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${activeScreen === i
                                                ? 'bg-neonGreen/20 text-neonGreen border border-neonGreen/30'
                                                : 'bg-white/5 text-gray-400'
                                                }`}
                                        >
                                            <screen.icon className="w-3 h-3" />
                                            {screen.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Klasemen Screen */}
                                {activeScreen === 0 && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                                <Trophy className="w-5 h-5 text-neonGreen" />
                                                Klasemen Liga
                                            </h3>
                                            <span className="text-[10px] px-2 py-1 bg-white/10 rounded-full text-gray-400">Matchweek 10</span>
                                        </div>
                                        <div className="bg-white/5 rounded-lg overflow-hidden border border-white/5">
                                            <div className="grid grid-cols-12 gap-2 px-4 py-2 text-[10px] font-semibold text-gray-500 border-b border-white/5 bg-white/5">
                                                <div className="col-span-1">#</div>
                                                <div className="col-span-5">Tim</div>
                                                <div className="col-span-1 text-center">M</div>
                                                <div className="col-span-1 text-center">S</div>
                                                <div className="col-span-1 text-center">K</div>
                                                <div className="col-span-1 text-center">SG</div>
                                                <div className="col-span-2 text-center">Poin</div>
                                            </div>
                                            {teams.map((team, i) => (
                                                <div
                                                    key={i}
                                                    className={`grid grid-cols-12 gap-2 px-4 py-3 items-center text-sm border-b border-white/5 last:border-0 transition-all duration-500 hover:bg-white/5 ${i === 0 ? 'bg-neonGreen/5' : ''
                                                        }`}
                                                    style={{ animationDelay: `${i * 100}ms` }}
                                                >
                                                    <div className="col-span-1">
                                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? 'bg-yellow-500 text-black' :
                                                            i === 1 ? 'bg-gray-400 text-black' :
                                                                i === 2 ? 'bg-orange-600 text-white' :
                                                                    'bg-white/10 text-gray-400'
                                                            }`}>{i + 1}</span>
                                                    </div>
                                                    <div className="col-span-5 flex items-center gap-2">
                                                        <span className="text-lg">{team.logo}</span>
                                                        <span className="text-white font-medium text-xs truncate">{team.name}</span>
                                                        {i === 0 && <Star className="w-3 h-3 text-yellow-500 flex-shrink-0" />}
                                                    </div>
                                                    <div className="col-span-1 text-center text-gray-400 text-xs">{team.w}</div>
                                                    <div className="col-span-1 text-center text-gray-400 text-xs">{team.d}</div>
                                                    <div className="col-span-1 text-center text-gray-400 text-xs">{team.l}</div>
                                                    <div className="col-span-1 text-center text-xs text-neonGreen">{team.gd}</div>
                                                    <div className="col-span-2 text-center">
                                                        <span className={`font-bold text-sm ${i === 0 ? 'text-neonGreen' : 'text-white'}`}>{team.pts}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Bracket Screen */}
                                {activeScreen === 1 && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                                <Users className="w-5 h-5 text-neonPink" />
                                                Bracket Turnamen
                                            </h3>
                                            <span className="text-[10px] px-2 py-1 bg-neonPink/20 text-neonPink rounded-full">Knockout Stage</span>
                                        </div>
                                        <div className="flex flex-col md:flex-row gap-4 justify-center items-stretch md:items-start">
                                            {/* Semi Finals */}
                                            <div className="flex-1">
                                                <div className="text-center text-xs text-gray-500 font-semibold mb-3">SEMI FINAL</div>
                                                <div className="grid grid-cols-2 md:grid-cols-1 gap-2 md:gap-3">
                                                    {bracketMatches.filter(m => m.round === 'Semi Final').map((match, i) => (
                                                        <div key={i} className="bg-white/5 rounded-lg p-2 md:p-3 border border-white/10 hover:border-neonGreen/30 transition-all">
                                                            <div className="flex items-center justify-between mb-1 md:mb-2">
                                                                <span className="text-white text-[10px] md:text-xs font-medium truncate mr-1">{match.team1}</span>
                                                                <span className={`font-bold text-xs md:text-sm ${match.score1 > match.score2 ? 'text-neonGreen' : 'text-gray-400'}`}>{match.score1}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-white text-[10px] md:text-xs font-medium truncate mr-1">{match.team2}</span>
                                                                <span className={`font-bold text-xs md:text-sm ${match.score2 > match.score1 ? 'text-neonGreen' : 'text-gray-400'}`}>{match.score2}</span>
                                                            </div>
                                                            <div className="mt-1.5 md:mt-2 text-center">
                                                                <span className="text-[8px] md:text-[9px] px-1.5 md:px-2 py-0.5 bg-green-500/20 text-green-400 rounded">Selesai</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            {/* Connector */}
                                            <div className="hidden md:flex items-center justify-center self-center">
                                                <div className="w-8 h-px bg-gradient-to-r from-white/20 to-neonPink/50"></div>
                                            </div>
                                            {/* Final */}
                                            <div className="flex-1">
                                                <div className="text-center text-xs text-gray-500 font-semibold mb-2">FINAL</div>
                                                <div className="bg-gradient-to-br from-neonPink/10 to-purple-500/10 rounded-lg p-4 border border-neonPink/30 relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 w-20 h-20 bg-neonPink/10 rounded-full blur-2xl"></div>
                                                    <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-3 animate-pulse" />
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-white text-xs font-medium">FC Barcelona</span>
                                                        <span className="text-gray-500 text-sm font-bold">-</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-white text-xs font-medium">Real Madrid</span>
                                                        <span className="text-gray-500 text-sm font-bold">-</span>
                                                    </div>
                                                    <div className="mt-3 text-center">
                                                        <span className="text-[9px] px-3 py-1 bg-neonPink/20 text-neonPink rounded-full animate-pulse">🏆 Minggu, 20:00 WIB</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Live Match Screen */}
                                {activeScreen === 2 && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                                <TrendingUp className="w-5 h-5 text-red-500" />
                                                Live Match
                                            </h3>
                                            <span className="text-[10px] px-2 py-1 bg-red-500/20 text-red-400 rounded-full flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
                                                LIVE
                                            </span>
                                        </div>
                                        <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-xl p-6 border border-red-500/20 relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl"></div>
                                            <div className="absolute bottom-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl"></div>

                                            <div className="flex items-center justify-between gap-4 relative z-10">
                                                <div className="flex-1 text-center">
                                                    <div className="text-3xl mb-2">🔵🔴</div>
                                                    <div className="text-white font-bold text-sm">FC Barcelona</div>
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="text-4xl font-black text-white">2</span>
                                                        <span className="text-2xl text-gray-500">:</span>
                                                        <span className="text-4xl font-black text-white">1</span>
                                                    </div>
                                                    <div className="px-3 py-1 bg-red-500/30 rounded-full">
                                                        <span className="text-xs font-bold text-red-400">67'</span>
                                                    </div>
                                                </div>
                                                <div className="flex-1 text-center">
                                                    <div className="text-3xl mb-2">⚪</div>
                                                    <div className="text-white font-bold text-sm">Real Madrid</div>
                                                </div>
                                            </div>

                                            <div className="mt-6 pt-4 border-t border-white/10 space-y-2">
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className="text-neonGreen">⚽</span>
                                                    <span className="text-white">Messi 23', 54'</span>
                                                    <span className="text-gray-500 ml-auto">Barcelona</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className="text-neonGreen">⚽</span>
                                                    <span className="text-white">Vinicius Jr 41'</span>
                                                    <span className="text-gray-500 ml-auto">Real Madrid</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Match Stats */}
                                        <div className="grid grid-cols-3 gap-3 mt-4">
                                            {[
                                                { label: 'Possession', home: '58%', away: '42%' },
                                                { label: 'Shots', home: '12', away: '8' },
                                                { label: 'Passes', home: '456', away: '312' },
                                            ].map((stat, i) => (
                                                <div key={i} className="bg-white/5 rounded-lg p-3 text-center">
                                                    <div className="text-[10px] text-gray-500 mb-1">{stat.label}</div>
                                                    <div className="flex items-center justify-center gap-2">
                                                        <span className="text-sm font-bold text-neonGreen">{stat.home}</span>
                                                        <span className="text-gray-600">-</span>
                                                        <span className="text-sm font-bold text-white">{stat.away}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* AI Analysis Screen */}
                                {activeScreen === 3 && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                                <Brain className="w-5 h-5 text-purple-400" />
                                                AI Analysis
                                            </h3>
                                            <span className="text-[10px] px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full flex items-center gap-1">
                                                <Sparkles className="w-3 h-3" />
                                                Powered by AI
                                            </span>
                                        </div>

                                        {/* AI Chat Response */}
                                        <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl p-4 border border-purple-500/20 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
                                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>

                                            <div className="flex gap-3 relative z-10">
                                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                                                    <Brain className="w-4 h-4 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-[10px] text-purple-400 font-semibold mb-1">BikinLiga AI Assistant</div>
                                                    <div className="text-sm text-gray-300 leading-relaxed">
                                                        {typingText}
                                                        <span className="inline-block w-2 h-4 bg-purple-400 ml-1 animate-pulse"></span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* AI Insights Grid */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-white/5 rounded-lg p-3 border border-white/5 hover:border-purple-500/30 transition-all">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Target className="w-4 h-4 text-neonGreen" />
                                                    <span className="text-[10px] text-gray-400 font-semibold">Win Prediction</span>
                                                </div>
                                                <div className="flex items-end gap-2">
                                                    <span className="text-2xl font-black text-neonGreen">78%</span>
                                                    <span className="text-xs text-gray-500 mb-1">FC Barcelona</span>
                                                </div>
                                                <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-neonGreen to-green-400 rounded-full" style={{ width: '78%' }}></div>
                                                </div>
                                            </div>

                                            <div className="bg-white/5 rounded-lg p-3 border border-white/5 hover:border-purple-500/30 transition-all">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <BarChart3 className="w-4 h-4 text-blue-400" />
                                                    <span className="text-[10px] text-gray-400 font-semibold">Form Rating</span>
                                                </div>
                                                <div className="flex items-center gap-1 mt-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star key={star} className={`w-4 h-4 ${star <= 4 ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`} />
                                                    ))}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">Excellent Form</div>
                                            </div>
                                        </div>

                                        {/* Key Stats */}
                                        <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                                            <div className="text-[10px] text-gray-400 font-semibold mb-3 flex items-center gap-2">
                                                <Sparkles className="w-3 h-3 text-purple-400" />
                                                KEY INSIGHTS
                                            </div>
                                            <div className="space-y-2">
                                                {[
                                                    { label: 'Possession Dominance', value: '62%', color: 'text-neonGreen' },
                                                    { label: 'Passing Accuracy', value: '89%', color: 'text-blue-400' },
                                                    { label: 'Goals per Match', value: '2.8', color: 'text-purple-400' },
                                                ].map((item, i) => (
                                                    <div key={i} className="flex items-center justify-between text-xs">
                                                        <span className="text-gray-400">{item.label}</span>
                                                        <span className={`font-bold ${item.color}`}>{item.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Progress Indicator */}
                        <div className="flex justify-center gap-2 pb-4">
                            {screens.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        setIsAnimating(true)
                                        setTimeout(() => {
                                            setActiveScreen(i)
                                            setIsAnimating(false)
                                        }, 150)
                                    }}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${activeScreen === i ? 'w-8 bg-neonGreen' : 'w-1.5 bg-white/20 hover:bg-white/40'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
                @keyframes gradient-shift {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 0.5; }
                }
                .animate-gradient-shift {
                    animation: gradient-shift 3s ease-in-out infinite;
                }
            `}</style>
        </section>
    )
}
