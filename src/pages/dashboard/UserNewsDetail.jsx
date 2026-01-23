import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, User, MessageSquare, Send, Share2, ThumbsUp } from 'lucide-react'
import Card, { CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

// Mock Detailed News Data (extended from LeagueNews.jsx)
const mockNewsDetails = {
    1: {
        id: 1,
        title: "Pendaftaran Liga Musim 2024 Telah Dibuka!",
        author: "Admin League",
        date: "15 April 2024",
        category: "Announcement",
        image: "https://images.unsplash.com/flagged/photo-1550413231-202a9d53a331?q=80&w=2070&auto=format&fit=crop",
        content: `
            <p class="mb-4">Kami dengan bangga mengumumkan bahwa pendaftaran untuk Liga Musim 2024 kini telah resmi dibuka! Ini adalah kesempatan bagi tim-tim terbaik untuk menunjukkan kemampuan mereka dan bersaing memperebutkan gelar juara tahun ini.</p>
            <p class="mb-4">Musim ini akan menghadirkan format kompetisi yang lebih seru dengan total hadiah yang lebih besar dari sebelumnya. Kami juga telah meningkatkan fasilitas pertandingan dan broadcast untuk memastikan pengalaman terbaik bagi seluruh peserta.</p>
            <h3 class="text-xl font-bold text-white mt-6 mb-3">Syarat dan Ketentuan Pendaftaran</h3>
            <ul class="list-disc list-inside space-y-2 mb-4">
                <li>Setiap tim wajib memiliki minimal 11 pemain dan maksimal 18 pemain.</li>
                <li>Biaya pendaftaran sebesar Rp 500.000 per tim.</li>
                <li>Seluruh pemain wajib melampirkan identitas diri (KTP/Kartu Pelajar).</li>
                <li>Batas akhir pendaftaran adalah 30 April 2024.</li>
            </ul>
            <p class="mb-4">Jangan lewatkan kesempatan ini! Daftarkan tim Anda sekarang juga melalui dashboard kapten tim atau hubungi admin kami untuk informasi lebih lanjut.</p>
            <p>Mari junjung tinggi sportivitas dan jadilah bagian dari sejarah Liga Musim 2024!</p>
        `,
        comments: [
            { id: 1, user: "Budi Santoso", avatar: "B", time: "2 jam yang lalu", text: "Mantap! Tim Garuda siap mendaftar 🔥", likes: 12 },
            { id: 2, user: "Rian Pratama", avatar: "R", time: "3 jam yang lalu", text: "Min, untuk lokasi pertandingannya dimana ya?", likes: 5 },
        ]
    },
    2: {
        id: 2,
        title: "Perubahan Jadwal Pertandingan Pekan ke-3",
        author: "Panitia Pelaksana",
        date: "10 Mei 2024",
        category: "Schedule",
        image: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=600&auto=format&fit=crop",
        content: `
            <p class="mb-4">Diberitahukan kepada seluruh peserta liga bahwa terdapat perubahan jadwal untuk pertandingan pekan ke-3 dikarenakan prakiraan cuaca buruk yang ekstrem.</p>
            <p class="mb-4">Keselamatan pemain adalah prioritas utama kami. Oleh karena itu, seluruh pertandingan yang dijadwalkan pada hari Sabtu, 12 Mei 2024, akan digeser ke hari Minggu, 13 Mei 2024.</p>
            <p>Harap cek jadwal terbaru di menu 'Jadwal' pada dashboard masing-masing. Terima kasih atas pengertiannya.</p>
        `,
        comments: [
            { id: 3, user: "Andi Saputra", avatar: "A", time: "1 jam yang lalu", text: "Waduh, untung belum booking lapangan latihan.", likes: 2 },
        ]
    },
    3: {
        id: 3,
        title: "Highlight: FCB vs RMA (3-2)",
        author: "Sport Journalist",
        date: "12 Mei 2024",
        category: "Match Report",
        image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=600&auto=format&fit=crop",
        content: `
            <p class="mb-4">Pertandingan Super Big Match antara FCB melawan RMA berakhir dramatis dengan skor tipis 3-2. Laga yang berlangsung di Stadion Utama ini menyajikan tontonan kelas dunia.</p>
            <p class="mb-4">FCB sempat tertinggal 0-2 di babak pertama, namun berhasil bangkit di babak kedua melalui hattrick dari striker andalan mereka.</p>
        `,
        comments: []
    },
    4: {
        id: 4,
        title: "Wawancara Eksklusif dengan Top Scorer Sementara",
        author: "Media Team",
        date: "14 Mei 2024",
        category: "Interview",
        image: "https://plus.unsplash.com/premium_photo-1664908314252-4b847d39a9ed?q=80&w=2070&auto=format&fit=crop",
        content: `
            <p class="mb-4">Simak wawancara eksklusif kami dengan Lionel Messi, top scorer sementara liga musim ini.</p>
        `,
        comments: []
    }
}

export default function UserNewsDetail() {
    const { id, newsId } = useParams()
    const navigate = useNavigate()
    const [commentText, setCommentText] = useState('')

    // Get news data
    const news = mockNewsDetails[newsId]
    const [comments, setComments] = useState(news ? news.comments : [])

    // Handle missing news
    if (!news) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold text-white mb-4">Berita tidak ditemukan</h2>
                <Button onClick={() => navigate(-1)}>Kembali</Button>
            </div>
        )
    }

    const handlePostComment = (e) => {
        e.preventDefault()
        if (!commentText.trim()) return

        const newComment = {
            id: comments.length + 1,
            user: "Anda", // Placeholder user
            avatar: "U",
            time: "Baru saja",
            text: commentText,
            likes: 0
        }

        setComments([newComment, ...comments])
        setCommentText('')
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-20">
            {/* Header Navigation */}
            <div className="flex items-center gap-4 sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-md p-4 z-20 -mx-4 sm:mx-0 sm:p-0 sm:bg-transparent sm:backdrop-blur-none sm:static">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <div className="text-xs text-neonGreen font-bold uppercase tracking-wider mb-0.5">
                        {news.category}
                    </div>
                    <div className="text-xs text-gray-400 flex items-center gap-2">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" /> {news.author}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {news.date}</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                <img
                    src={news.image}
                    alt={news.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
            </div>

            <div className="px-1 sm:px-0">
                <h1 className="text-2xl sm:text-4xl font-display font-bold text-white leading-tight mb-6">
                    {news.title}
                </h1>

                <div
                    className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: news.content }}
                />
            </div>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-8" />

            {/* Comments Section */}
            <div className="space-y-6 px-1 sm:px-0">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-neonGreen" />
                        Komentar ({comments.length})
                    </h3>
                    <button className="text-gray-400 hover:text-white transition">
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>

                {/* Comment Form */}
                <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-4">
                        <form onSubmit={handlePostComment} className="flex gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white shrink-0">
                                U
                            </div>
                            <div className="flex-1 space-y-2">
                                <Input
                                    placeholder="Tulis komentar..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    className="bg-black/20 border-white/10 focus:border-neonGreen/50"
                                />
                                <div className="flex justify-end">
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        disabled={!commentText.trim()}
                                        className="py-1.5 px-4 text-xs"
                                    >
                                        <Send className="w-3 h-3 mr-2" />
                                        Kirim
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Comments List */}
                <div className="space-y-4">
                    {comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 animate-slideIn">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-gray-300 shrink-0 border border-white/5">
                                {comment.avatar}
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm text-white">{comment.user}</span>
                                    <span className="text-xs text-gray-500">• {comment.time}</span>
                                </div>
                                <div className="p-3 bg-white/5 rounded-r-xl rounded-bl-xl border border-white/5 text-sm text-gray-300">
                                    {comment.text}
                                </div>
                                <div className="flex items-center gap-4 px-2">
                                    <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-neonGreen transition">
                                        <ThumbsUp className="w-3 h-3" />
                                        {comment.likes > 0 && comment.likes}
                                    </button>
                                    <button className="text-xs text-gray-500 hover:text-white transition">Balas</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
