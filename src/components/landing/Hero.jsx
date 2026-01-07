import React from 'react'
import { Link } from 'react-router-dom'
import { Zap, PlayCircle } from 'lucide-react'
import useReveal from '../../hooks/useReveal'

export default function Hero() {
    const revealRef = useReveal()

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
                        <a href="#cara-kerja" className="btn-secondary w-full sm:w-auto px-8 py-4 rounded-full text-lg flex items-center justify-center gap-2">
                            <PlayCircle className="w-5 h-5" />
                            Lihat Demo
                        </a>
                    </div>
                </div>

                {/* Hero Visual / Dashboard Preview */}
                <div className="mt-16 relative mx-auto max-w-5xl reveal" ref={revealRef}>
                    <div className="absolute -inset-1 bg-gradient-to-r from-neonGreen to-neonPink rounded-2xl blur opacity-30"></div>
                    <div className="relative rounded-2xl bg-cardBg border border-white/10 overflow-hidden shadow-2xl">
                        {/* Browser Header */}
                        <div className="h-8 bg-[#1a1a1a] border-b border-white/5 flex items-center px-4 gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <div className="ml-4 h-4 w-64 bg-white/10 rounded-full text-[10px] flex items-center px-2 text-gray-500 font-mono">
                                BikinLiga.online
                            </div>
                        </div>

                        {/* Dashboard Preview */}
                        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Sidebar */}
                            <div className="hidden md:block col-span-1 space-y-4">
                                <div className="h-10 bg-white/5 rounded w-full dashboard-item" style={{ transitionDelay: '200ms' }}></div>
                                <div className="h-10 bg-gradient-to-r from-neonGreen/20 to-transparent border-l-2 border-neonGreen rounded w-full flex items-center px-3 text-neonGreen text-sm font-bold dashboard-item" style={{ transitionDelay: '300ms' }}>Klasemen Liga</div>
                                <div className="h-10 bg-white/5 rounded w-full dashboard-item" style={{ transitionDelay: '400ms' }}></div>
                                <div className="h-10 bg-white/5 rounded w-full dashboard-item" style={{ transitionDelay: '500ms' }}></div>
                            </div>
                            {/* Main Content */}
                            <div className="col-span-2 space-y-4">
                                <div className="flex justify-between items-center mb-6 dashboard-item" style={{ transitionDelay: '600ms' }}>
                                    <div className="h-8 w-48 bg-white/10 rounded"></div>
                                    <div className="h-8 w-24 bg-neonPink rounded animate-pulse"></div>
                                </div>
                                <div className="space-y-2">
                                    {[
                                        { color: 'bg-blue-500', num: 1, delay: '700ms' },
                                        { color: 'bg-red-500', num: 2, delay: '800ms' },
                                        { color: 'bg-yellow-500', num: 3, delay: '900ms', text: 'text-black' },
                                        { color: 'bg-white', num: 4, delay: '1000ms', text: 'text-black' },
                                    ].map((item, i) => (
                                        <div key={i} className="h-12 bg-white/5 rounded flex items-center px-4 justify-between border border-white/5 dashboard-item hover:bg-white/10 transition-colors cursor-default" style={{ transitionDelay: item.delay }}>
                                            <div className="flex gap-3">
                                                <div className={`w-6 h-6 ${item.color} rounded-full flex items-center justify-center text-[10px] font-bold ${item.text || ''}`}>{item.num}</div>
                                                <div className={`h-4 bg-white/20 rounded ${i === 0 || i === 3 ? 'w-32' : 'w-24'}`}></div>
                                            </div>
                                            <div className={`w-8 h-4 ${i === 0 ? 'bg-neonGreen/50' : 'bg-white/10'} rounded`}></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
