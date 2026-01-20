import React from 'react'
import Card, { CardHeader, CardContent } from '../ui/Card'
import { Calendar, Tag, ChevronRight, Newspaper } from 'lucide-react'

// Mock Data
const mockNews = [
    {
        id: 1,
        title: "Pendaftaran Liga Musim 2024 Telah Dibuka!",
        excerpt: "Segera daftarkan tim mu untuk mengikuti kompetisi paling bergengsi tahun ini.",
        date: "2024-04-15",
        category: "Announcement",
        image: "https://images.unsplash.com/flagged/photo-1550413231-202a9d53a331?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
        id: 2,
        title: "Perubahan Jadwal Pertandingan Pekan ke-3",
        excerpt: "Dikarenakan cuaca buruk, beberapa pertandingan akan dijadwalkan ulang.",
        date: "2024-05-10",
        category: "Schedule",
        image: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=600&auto=format&fit=crop"
    },
    {
        id: 3,
        title: "Highlight: FCB vs RMA (3-2)",
        excerpt: "Pertandingan sengit berakhir dengan kemenangan dramatis FCB di menit terakhir.",
        date: "2024-05-12",
        category: "Match Report",
        image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=600&auto=format&fit=crop"
    },
    {
        id: 4,
        title: "Wawancara Eksklusif dengan Top Scorer Sementara",
        excerpt: "Simak rahasia latihan dan motivasi di balik performa gemilang striker andalan.",
        date: "2024-05-14",
        category: "Interview",
        image: "https://plus.unsplash.com/premium_photo-1664908314252-4b847d39a9ed?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    }
]

export default function LeagueNews() {
    return (
        <div className="space-y-6">
            <Card className="bg-gradient-to-r from-blue-900/10 to-purple-900/10 border-blue-500/10">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                            <h2 className="text-xl font-bold font-display text-white">Berita & Update Liga</h2>
                            <p className="text-gray-400 text-sm max-w-2xl">
                                Dapatkan informasi terbaru seputar turnamen, hasil pertandingan, dan pengumuman penting lainnya langsung dari panitia.
                            </p>
                        </div>
                        <div className="p-3 rounded-xl bg-blue-500/10 hidden sm:block">
                            <Newspaper className="w-8 h-8 text-blue-400" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
                {mockNews.map((news) => (
                    <Card key={news.id} className="group cursor-pointer hover:border-blue-500/30 transition-all duration-300">
                        <div className="relative aspect-video w-full overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                            <img
                                src={news.image}
                                alt={news.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute bottom-3 left-3 right-3 z-20">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${news.category === 'Announcement' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                    news.category === 'Schedule' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                        'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                    }`}>
                                    {news.category}
                                </span>
                            </div>
                        </div>
                        <CardContent className="p-4 space-y-3">
                            <div className="space-y-2">
                                <h3 className="font-bold text-lg leading-tight text-white group-hover:text-blue-400 transition-colors">
                                    {news.title}
                                </h3>
                                <p className="text-sm text-gray-400 line-clamp-2">
                                    {news.excerpt}
                                </p>
                            </div>

                            <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Calendar className="w-3 h-3" />
                                    {news.date}
                                </div>
                                <div className="flex items-center gap-1 text-xs font-medium text-blue-400 group-hover:translate-x-1 transition-transform">
                                    Baca Selengkapnya <ChevronRight className="w-3 h-3" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
