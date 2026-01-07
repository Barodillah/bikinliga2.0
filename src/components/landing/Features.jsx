import React from 'react'
import { Users, BarChart2, Calendar, Share2, Swords, ShieldCheck } from 'lucide-react'
import useReveal from '../../hooks/useReveal'

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
    const colorClasses = {
        green: {
            bg: 'bg-neonGreen/10',
            text: 'text-neonGreen',
            hoverBg: 'group-hover:bg-neonGreen',
            hoverBorder: 'hover:border-neonGreen/50',
        },
        pink: {
            bg: 'bg-neonPink/10',
            text: 'text-neonPink',
            hoverBg: 'group-hover:bg-neonPink',
            hoverBorder: 'hover:border-neonPink/50',
        }
    }

    const c = colorClasses[color]

    return (
        <div
            ref={revealRef}
            className={`glass-panel p-8 rounded-2xl ${c.hoverBorder} transition-all duration-300 group reveal`}
            style={{ transitionDelay: delay }}
        >
            <div className={`w-14 h-14 rounded-full ${c.bg} flex items-center justify-center mb-6 ${c.hoverBg} group-hover:text-black transition-colors ${c.text}`}>
                <div className="relative">
                    <Icon className="w-7 h-7 relative z-10" />
                    <div className="absolute inset-0 bg-current rounded-full opacity-0 group-hover:animate-ping-slow"></div>
                </div>
            </div>
            <h3 className="text-xl font-bold mb-3 font-display">{title}</h3>
            <p className="text-gray-400 leading-relaxed">{desc}</p>
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <FeatureCard
                            key={feature.title}
                            {...feature}
                            delay={`${(index % 3) * 100}ms`}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}
