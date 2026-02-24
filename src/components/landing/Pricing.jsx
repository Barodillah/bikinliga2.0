import React from 'react'
import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import useReveal from '../../hooks/useReveal'

const plans = [
    {
        name: 'Komunitas Kecil',
        price: 'Rp 0',
        period: '/selamanya',
        features: ['1 Turnamen Aktif', 'Maks. 8 Peserta', 'Klasemen Dasar', 'Iklan Tampil'],
        cta: 'Daftar Gratis',
        highlight: false,
        color: 'green'
    },
    {
        name: 'Rental / Warkop',
        price: 'Rp 49rb',
        period: '/6 Bulan',
        features: ['Unlimited Turnamen', 'Maks. 32 Peserta/Liga', 'Export Klasemen ke Image', 'Halaman Publik Custom', 'Tanpa Iklan'],
        cta: 'Langganan Sekarang',
        highlight: true,
        color: 'pink'
    },
    {
        name: 'Event Organizer',
        price: 'Rp 199rb',
        period: '/6 Bulan',
        features: ['Bracket Hingga 128 Peserta', 'Sistem Registrasi Online', 'Ticket Management', 'API Access'],
        cta: 'Hubungi Sales',
        highlight: false,
        color: 'green'
    }
]

export default function Pricing() {
    const headerRef = useReveal()

    return (
        <section id="harga" className="py-20 relative">
            <div className="ambient-glow bg-neonGreen/20 bottom-10 left-10 w-64 h-64"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16 reveal" ref={headerRef}>
                    <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
                        Pilih <span className="text-neonGreen">Paketmu</span>
                    </h2>
                    <p className="text-gray-400">Mulai gratis, upgrade untuk fitur turnamen skala besar.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    {plans.map((plan, index) => {
                        const revealRef = useReveal()
                        return (
                            <div
                                key={plan.name}
                                ref={revealRef}
                                className={`reveal p-8 rounded-2xl ${plan.highlight
                                    ? 'bg-[#1a1a1a] border-2 border-neonPink relative transform md:-translate-y-4 shadow-[0_0_30px_rgba(254,0,201,0.15)]'
                                    : 'glass-panel'
                                    }`}
                                style={{ transitionDelay: `${index * 100}ms` }}
                            >
                                {plan.highlight && (
                                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-neonPink text-white text-xs font-bold px-3 py-1 rounded-full">
                                        POPULER
                                    </div>
                                )}
                                <h3 className={`text-xl font-bold ${plan.highlight ? 'text-neonPink' : 'text-gray-300'}`}>
                                    {plan.name}
                                </h3>
                                <div className="my-4">
                                    <span className={`text-4xl font-display font-bold ${plan.highlight ? 'text-white' : ''}`}>
                                        {plan.price}
                                    </span>
                                    <span className="text-gray-500">{plan.period}</span>
                                </div>
                                <ul className={`space-y-3 mb-8 text-sm ${plan.highlight ? 'text-gray-300' : 'text-gray-400'}`}>
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-center gap-2">
                                            <Check className={`w-4 h-4 ${plan.color === 'pink' ? 'text-neonPink' : 'text-neonGreen'}`} />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    to="/dashboard"
                                    className={`block w-full py-3 rounded-lg text-center font-bold transition ${plan.highlight
                                        ? 'bg-neonPink text-white hover:bg-pink-600 shadow-lg shadow-pink-500/30'
                                        : 'border border-white/20 hover:bg-white/10'
                                        }`}
                                >
                                    {plan.cta}
                                </Link>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
