import React, { useState, useEffect } from 'react'
import { PlusSquare, Share2, Copy, ArrowRight } from 'lucide-react'
import useReveal from '../../hooks/useReveal'

const steps = [
    { id: 1, title: 'Buat Turnamen', desc: 'Pilih jenis kompetisi (Liga/Cup), atur jumlah peserta, dan sistem poin.' },
    { id: 2, title: 'Undang Pemain', desc: 'Share link pendaftaran atau input manual nama teman mabar kamu.' },
    { id: 3, title: 'Main & Update', desc: 'Mainkan match eFootball kalian, input skor, dan lihat klasemen berubah.' },
]

export default function HowItWorks() {
    const [activeStep, setActiveStep] = useState(1)
    const [progressHeight, setProgressHeight] = useState('0%')
    const revealRef = useReveal()
    const visualRef = useReveal()

    // Auto-rotate steps
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStep((prev) => (prev >= 3 ? 1 : prev + 1))
        }, 4000)
        return () => clearInterval(interval)
    }, [])

    // Update progress bar
    useEffect(() => {
        if (activeStep === 1) setProgressHeight('0%')
        if (activeStep === 2) setProgressHeight('50%')
        if (activeStep === 3) setProgressHeight('100%')
    }, [activeStep])

    return (
        <section id="cara-kerja" className="py-20 bg-cardBg border-t border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="reveal relative" ref={revealRef}>
                        <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
                            Mulai Turnamen dalam <span className="text-neonGreen">3 Langkah</span>
                        </h2>

                        <div className="step-list-container space-y-4 relative z-10">
                            {/* Timeline Line */}
                            <div className="hidden md:block absolute left-[calc(1rem+1.25rem-1px)] top-[2.25rem] bottom-[2.25rem] w-[2px] bg-[#333] z-0">
                                <div
                                    className="w-full bg-neonGreen shadow-[0_0_15px_#02FE02] transition-[height] duration-500 ease-in-out"
                                    style={{ height: progressHeight }}
                                ></div>
                            </div>

                            {steps.map((step) => (
                                <div
                                    key={step.id}
                                    className={`step-trigger flex gap-4 items-start p-4 rounded-xl border border-transparent relative z-10 ${activeStep === step.id ? 'active' : ''}`}
                                    onClick={() => setActiveStep(step.id)}
                                >
                                    <div
                                        className={`flex-shrink-0 w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center text-lg step-circle transition-all relative z-10 font-bold
                    ${activeStep >= step.id ? 'bg-neonGreen text-black shadow-[0_0_15px_rgba(2,254,2,0.5)] border-neonGreen' : 'bg-cardBg text-white'}`}
                                    >
                                        {step.id}
                                    </div>
                                    <div className="pt-1">
                                        <h4 className={`text-xl font-bold mb-2 transition-colors ${activeStep === step.id ? 'text-neonGreen' : 'text-white'}`}>
                                            {step.title}
                                        </h4>
                                        <p className="text-gray-400 text-sm">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-10 pl-14">
                            <a href="#" className="text-neonGreen font-semibold hover:text-white transition-colors flex items-center gap-2">
                                Pelajari dokumentasi lengkap <ArrowRight className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Visuals */}
                    <div className="relative reveal h-[350px] w-full" ref={visualRef}>
                        <div className="relative w-full h-full rounded-2xl overflow-hidden border border-neonPink/30 shadow-[0_0_50px_rgba(254,0,201,0.2)] bg-[#1a1a1a]">

                            {/* Visual Step 1 */}
                            <div className={`step-visual ${activeStep === 1 ? 'active' : ''}`}>
                                <div className="w-full max-w-sm p-6 bg-[#252525] rounded-xl border border-white/10 shadow-xl">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded bg-neonGreen/20 flex items-center justify-center text-neonGreen">
                                            <PlusSquare className="w-6 h-6" />
                                        </div>
                                        <div className="font-bold text-white">Buat Liga Baru</div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="h-10 bg-black/40 rounded border border-white/5 w-full flex items-center px-3 text-sm text-gray-500">Nama Liga (e.g. Warkop Cup)</div>
                                        <div className="flex gap-2">
                                            <div className="h-10 bg-neonGreen rounded border border-neonGreen w-1/2 flex items-center justify-center text-sm text-black font-bold">Liga</div>
                                            <div className="h-10 bg-black/40 rounded border border-white/5 w-1/2 flex items-center justify-center text-sm text-gray-500">Cup</div>
                                        </div>
                                        <div className="h-2 w-full bg-white/5 rounded mt-2"></div>
                                        <div className="h-8 w-full bg-neonPink rounded flex items-center justify-center text-sm font-bold mt-4">Simpan</div>
                                    </div>
                                </div>
                            </div>

                            {/* Visual Step 2 */}
                            <div className={`step-visual ${activeStep === 2 ? 'active' : ''}`}>
                                <div className="w-full max-w-sm p-6 bg-[#252525] rounded-xl border border-white/10 shadow-xl text-center">
                                    <div className="w-16 h-16 bg-neonPink/20 rounded-full flex items-center justify-center text-neonPink mx-auto mb-4 animate-bounce">
                                        <Share2 className="w-8 h-8" />
                                    </div>
                                    <h4 className="text-white font-bold mb-2">Undang Teman</h4>
                                    <p className="text-xs text-gray-400 mb-4">Bagikan link ini ke grup WhatsApp</p>

                                    <div className="bg-black/40 p-3 rounded border border-white/5 flex items-center justify-between mb-4">
                                        <span className="text-xs text-neonGreen truncate">bikinliga.com/invite/xyz123</span>
                                        <Copy className="w-4 h-4 text-gray-400" />
                                    </div>

                                    <div className="flex justify-center -space-x-2">
                                        <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-[#252525]"></div>
                                        <div className="w-8 h-8 rounded-full bg-green-500 border-2 border-[#252525]"></div>
                                        <div className="w-8 h-8 rounded-full bg-yellow-500 border-2 border-[#252525]"></div>
                                        <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-[#252525] flex items-center justify-center text-[10px] text-white">+5</div>
                                    </div>
                                </div>
                            </div>

                            {/* Visual Step 3 */}
                            <div className={`step-visual ${activeStep === 3 ? 'active' : ''}`}>
                                <div className="w-full max-w-sm space-y-4 px-6">
                                    <div className="bg-[#252525] p-4 rounded-xl border border-white/5 flex items-center justify-between animate-float">
                                        <div className="flex flex-col items-center">
                                            <div className="w-10 h-10 bg-blue-600 rounded-full mb-2"></div>
                                            <span className="font-bold text-sm">FCB</span>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold font-display text-neonGreen">3 - 1</div>
                                            <div className="text-xs text-gray-500">FULL TIME</div>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <div className="w-10 h-10 bg-red-600 rounded-full mb-2"></div>
                                            <span className="font-bold text-sm">MU</span>
                                        </div>
                                    </div>
                                    <div className="bg-[#252525] p-4 rounded-xl border border-white/5 flex items-center justify-between opacity-50 scale-95">
                                        <div className="flex flex-col items-center">
                                            <div className="w-10 h-10 bg-white rounded-full mb-2"></div>
                                            <span className="font-bold text-sm">RMA</span>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold font-display text-gray-400">VS</div>
                                            <div className="text-xs text-gray-500">20:00</div>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <div className="w-10 h-10 bg-yellow-500 rounded-full mb-2"></div>
                                            <span className="font-bold text-sm">ARS</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
