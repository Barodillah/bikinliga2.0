import React, { useState, useEffect } from 'react'
import { Users, BarChart2, Calendar, Share2, Swords, ShieldCheck, Plus, Check, Trophy, ArrowUp, ArrowDown, Link2, Copy, Upload, Image } from 'lucide-react'
import useReveal from '../../hooks/useReveal'

// Animation Components for each feature
function ParticipantAnimation() {
    const [players, setPlayers] = useState([false, false, false])

    useEffect(() => {
        const timers = players.map((_, i) =>
            setTimeout(() => setPlayers(prev => {
                const next = [...prev]
                next[i] = true
                return next
            }), 800 + i * 400)
        )
        const reset = setTimeout(() => setPlayers([false, false, false]), 3500)
        const loop = setInterval(() => {
            setPlayers([false, false, false])
            players.forEach((_, i) =>
                setTimeout(() => setPlayers(prev => {
                    const next = [...prev]
                    next[i] = true
                    return next
                }), 800 + i * 400)
            )
        }, 4000)
        return () => {
            timers.forEach(clearTimeout)
            clearTimeout(reset)
            clearInterval(loop)
        }
    }, [])

    return (
        <div className="h-24 flex items-center justify-center gap-2">
            {['🔵', '🔴', '🟡'].map((emoji, i) => (
                <div key={i} className={`transition-all duration-500 ${players[i] ? 'opacity-100 scale-100' : 'opacity-0 scale-50 translate-y-4'}`}>
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg border border-white/20">
                        {emoji}
                    </div>
                    {players[i] && (
                        <div className="flex justify-center mt-1">
                            <Check className="w-3 h-3 text-neonGreen animate-bounce" />
                        </div>
                    )}
                </div>
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center">
                <Plus className="w-4 h-4 text-gray-500" />
            </div>
        </div>
    )
}

function StandingsAnimation() {
    const [standings, setStandings] = useState([
        { pos: 1, name: 'Team A', pts: 15 },
        { pos: 2, name: 'Team B', pts: 12 },
        { pos: 3, name: 'Team C', pts: 10 },
    ])
    const [updating, setUpdating] = useState(false)

    useEffect(() => {
        const interval = setInterval(() => {
            setUpdating(true)
            setTimeout(() => {
                setStandings(prev => {
                    const shuffled = [...prev]
                    // Swap positions randomly
                    const i = Math.floor(Math.random() * 2)
                    const temp = shuffled[i]
                    shuffled[i] = shuffled[i + 1]
                    shuffled[i + 1] = temp
                    return shuffled.map((t, idx) => ({ ...t, pos: idx + 1, pts: t.pts + Math.floor(Math.random() * 3) }))
                })
                setUpdating(false)
            }, 300)
        }, 2500)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="h-24 flex flex-col justify-center gap-1">
            {standings.map((team, i) => (
                <div key={team.name} className={`flex items-center gap-2 text-xs px-2 py-1 rounded transition-all duration-300 ${updating ? 'bg-neonPink/20' : 'bg-white/5'} ${i === 0 ? 'border-l-2 border-neonGreen' : ''}`}>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? 'bg-yellow-500 text-black' : 'bg-white/10'}`}>{team.pos}</span>
                    <span className="flex-1 text-gray-300">{team.name}</span>
                    <span className="text-neonGreen font-bold">{team.pts}</span>
                    {i < 2 && <ArrowUp className="w-3 h-3 text-green-500" />}
                    {i === 2 && <ArrowDown className="w-3 h-3 text-red-500" />}
                </div>
            ))}
        </div>
    )
}

function ScheduleAnimation() {
    const [currentMatch, setCurrentMatch] = useState(0)
    const matches = [
        { home: 'A', away: 'B', time: '19:00' },
        { home: 'C', away: 'D', time: '20:00' },
        { home: 'E', away: 'F', time: '21:00' },
    ]

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMatch(prev => (prev + 1) % matches.length)
        }, 1500)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="h-24 flex flex-col justify-center gap-1.5">
            {matches.map((match, i) => (
                <div key={i} className={`flex items-center gap-2 text-xs px-2 py-1.5 rounded transition-all duration-300 ${currentMatch === i ? 'bg-neonGreen/20 border border-neonGreen/30 scale-105' : 'bg-white/5'}`}>
                    <Calendar className={`w-3 h-3 ${currentMatch === i ? 'text-neonGreen' : 'text-gray-500'}`} />
                    <span className="text-gray-400">{match.time}</span>
                    <span className="flex-1 text-center text-white font-medium">
                        {match.home} <span className="text-gray-500">vs</span> {match.away}
                    </span>
                    {currentMatch === i && <span className="w-2 h-2 bg-neonGreen rounded-full animate-pulse"></span>}
                </div>
            ))}
        </div>
    )
}

function PublicLinkAnimation() {
    const [copied, setCopied] = useState(false)
    const [sharing, setSharing] = useState(false)

    useEffect(() => {
        const interval = setInterval(() => {
            setCopied(true)
            setTimeout(() => {
                setSharing(true)
                setTimeout(() => {
                    setCopied(false)
                    setSharing(false)
                }, 1500)
            }, 1000)
        }, 3500)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="h-24 flex flex-col items-center justify-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border transition-all duration-300 ${copied ? 'border-neonPink bg-neonPink/10' : 'border-white/10'}`}>
                <Link2 className="w-4 h-4 text-neonPink" />
                <span className="text-xs text-gray-300 font-mono">bikinliga.online/t/...</span>
                <div className={`transition-all duration-300 ${copied ? 'text-neonPink' : 'text-gray-500'}`}>
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </div>
            </div>
            <div className={`flex gap-2 transition-all duration-500 ${sharing ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-[10px]">WA</div>
                <div className="w-6 h-6 rounded-full bg-[#5865F2] flex items-center justify-center text-[10px]">DC</div>
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px]">TG</div>
            </div>
        </div>
    )
}

function H2HAnimation() {
    const [showVS, setShowVS] = useState(false)
    const [scores, setScores] = useState({ left: 0, right: 0 })

    useEffect(() => {
        const interval = setInterval(() => {
            setShowVS(true)
            setTimeout(() => {
                setScores({ left: Math.floor(Math.random() * 5) + 1, right: Math.floor(Math.random() * 5) + 1 })
            }, 800)
            setTimeout(() => {
                setShowVS(false)
                setScores({ left: 0, right: 0 })
            }, 2500)
        }, 3500)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="h-24 flex items-center justify-center gap-4">
            <div className={`transition-all duration-500 ${showVS ? 'translate-x-0' : '-translate-x-4 opacity-50'}`}>
                <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-xl">🔵</div>
                {scores.left > 0 && <div className="text-center mt-1 text-lg font-bold text-white">{scores.left}</div>}
            </div>
            <div className={`transition-all duration-300 ${showVS ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-neonGreen to-neonPink flex items-center justify-center">
                    <Swords className="w-5 h-5 text-white" />
                </div>
            </div>
            <div className={`transition-all duration-500 ${showVS ? 'translate-x-0' : 'translate-x-4 opacity-50'}`}>
                <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center text-xl">🔴</div>
                {scores.right > 0 && <div className="text-center mt-1 text-lg font-bold text-white">{scores.right}</div>}
            </div>
        </div>
    )
}

function ValidationAnimation() {
    const [step, setStep] = useState(0) // 0: idle, 1: uploading, 2: validated

    useEffect(() => {
        const interval = setInterval(() => {
            setStep(1)
            setTimeout(() => setStep(2), 1000)
            setTimeout(() => setStep(0), 2500)
        }, 3500)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="h-24 flex items-center justify-center">
            <div className={`relative transition-all duration-500 ${step >= 1 ? 'scale-100' : 'scale-90 opacity-70'}`}>
                <div className="w-20 h-14 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                    {step === 0 && <Image className="w-6 h-6 text-gray-500" />}
                    {step === 1 && (
                        <div className="flex flex-col items-center gap-1">
                            <Upload className="w-5 h-5 text-neonGreen animate-bounce" />
                            <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-neonGreen rounded-full animate-loading-bar"></div>
                            </div>
                        </div>
                    )}
                    {step === 2 && (
                        <div className="text-center">
                            <div className="text-lg font-bold text-white">2 - 1</div>
                            <div className="text-[8px] text-gray-500">FINAL</div>
                        </div>
                    )}
                </div>
                {step === 2 && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-neonGreen flex items-center justify-center animate-scale-in">
                        <Check className="w-4 h-4 text-black" />
                    </div>
                )}
            </div>
        </div>
    )
}

// Animation mapping
const AnimationComponents = {
    'Manajemen Peserta': ParticipantAnimation,
    'Klasemen Otomatis': StandingsAnimation,
    'Jadwal Pintar': ScheduleAnimation,
    'Public Link': PublicLinkAnimation,
    'Head-to-Head': H2HAnimation,
    'Validasi Skor': ValidationAnimation,
}

const features = [
    {
        icon: Users,
        title: 'Manajemen Peserta',
        desc: 'Input data peserta, nama tim eFootball, dan kontak dengan mudah. Mendukung format liga atau sistem gugur.',
        color: 'green'
    },
    {
        icon: BarChart2,
        title: 'Klasemen Otomatis',
        desc: 'Cukup masukkan skor akhir, sistem akan otomatis menghitung poin, selisih gol, dan mengurutkan klasemen.',
        color: 'pink'
    },
    {
        icon: Calendar,
        title: 'Jadwal Pintar',
        desc: 'Generate jadwal pertandingan Home & Away secara otomatis tanpa bentrok. Export jadwal ke gambar untuk dishare.',
        color: 'green'
    },
    {
        icon: Share2,
        title: 'Public Link',
        desc: 'Setiap turnamen memiliki link unik. Bagikan ke grup WhatsApp atau Discord agar peserta bisa pantau sendiri.',
        color: 'pink'
    },
    {
        icon: Swords,
        title: 'Head-to-Head',
        desc: 'Lihat sejarah pertemuan antar player. Siapa yang benar-benar raja eFootball di tongkronganmu.',
        color: 'green'
    },
    {
        icon: ShieldCheck,
        title: 'Validasi Skor',
        desc: 'Fitur upload screenshot hasil pertandingan untuk meminimalisir sengketa skor antar pemain.',
        color: 'pink'
    }
]

function FeatureCard({ icon: Icon, title, desc, color, delay }) {
    const revealRef = useReveal()
    const AnimationComponent = AnimationComponents[title]

    const colorClasses = {
        green: {
            bg: 'bg-neonGreen/10',
            text: 'text-neonGreen',
            hoverBg: 'group-hover:bg-neonGreen',
            hoverBorder: 'hover:border-neonGreen/50',
            gradient: 'from-neonGreen/5 to-transparent',
        },
        pink: {
            bg: 'bg-neonPink/10',
            text: 'text-neonPink',
            hoverBg: 'group-hover:bg-neonPink',
            hoverBorder: 'hover:border-neonPink/50',
            gradient: 'from-neonPink/5 to-transparent',
        }
    }

    const c = colorClasses[color]

    return (
        <div
            ref={revealRef}
            className={`glass-panel p-6 rounded-2xl ${c.hoverBorder} transition-all duration-300 group reveal overflow-hidden`}
            style={{ transitionDelay: delay }}
        >
            {/* Animation Preview */}
            <div className={`mb-4 rounded-xl bg-gradient-to-b ${c.gradient} border border-white/5 overflow-hidden`}>
                {AnimationComponent && <AnimationComponent />}
            </div>

            {/* Icon & Title */}
            <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center ${c.hoverBg} group-hover:text-black transition-colors ${c.text}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold font-display">{title}</h3>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
        </div>
    )
}

export default function Features() {
    const revealRef = useReveal()

    return (
        <section id="fitur" className="py-20 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16 reveal" ref={revealRef}>
                    <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
                        Fitur <span className="text-neonPink">Pro Player</span>
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Kami menyediakan alat yang dibutuhkan admin turnamen agar kompetisi berjalan adil, seru, dan profesional.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <FeatureCard
                            key={feature.title}
                            {...feature}
                            delay={`${(index % 3) * 100}ms`}
                        />
                    ))}
                </div>
            </div>

            <style jsx>{`
                @keyframes loading-bar {
                    0% { width: 0%; }
                    100% { width: 100%; }
                }
                .animate-loading-bar {
                    animation: loading-bar 1s ease-out forwards;
                }
                @keyframes scale-in {
                    0% { transform: scale(0); }
                    100% { transform: scale(1); }
                }
                .animate-scale-in {
                    animation: scale-in 0.3s ease-out forwards;
                }
            `}</style>
        </section>
    )
}

