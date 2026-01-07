import React from 'react'
import useCounter from '../../hooks/useCounter'
import useReveal from '../../hooks/useReveal'

function StatItem({ end, label, colorClass, suffix = "+" }) {
    const [count, ref] = useCounter(end)
    const revealRef = useReveal()

    return (
        <div ref={revealRef} className="reveal text-center">
            <div ref={ref} className={`text-3xl md:text-4xl font-display font-bold ${colorClass}`}>
                {count}{suffix}
            </div>
            <div className="text-sm text-gray-400 mt-1">{label}</div>
        </div>
    )
}

export default function Stats() {
    return (
        <section className="py-10 border-y border-white/5 bg-white/5 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    <StatItem end={500} label="Liga Terbuat" colorClass="text-neonGreen" />
                    <StatItem end={10} label="Pertandingan" colorClass="text-white" suffix="k+" />
                    <StatItem end={5} label="Pemain Terdaftar" colorClass="text-neonPink" suffix="k+" />

                    <div className="reveal active text-center">
                        <div className="text-3xl md:text-4xl font-display font-bold text-white">
                            24/7
                        </div>
                        <div className="text-sm text-gray-400 mt-1">Sistem Aktif</div>
                    </div>
                </div>
            </div>
        </section>
    )
}
