import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    Book, Trophy, Users, Shield, Zap, Target, BarChart2,
    Share2, Cpu, Globe, Lock, MessageSquare, Heart,
    ChevronRight, Menu, X, PlayCircle, Calendar,
    UserCheck, FileText, Settings, Award
} from 'lucide-react'

export default function TutorialPage() {
    const [activeSection, setActiveSection] = useState('intro')
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    // Scroll spy effect
    useEffect(() => {
        const handleScroll = () => {
            const sections = document.querySelectorAll('section[id]')
            const scrollPosition = window.scrollY + 100

            sections.forEach(section => {
                const top = section.offsetTop
                const height = section.offsetHeight
                const id = section.getAttribute('id')

                if (scrollPosition >= top && scrollPosition < top + height) {
                    setActiveSection(id)
                }
            })
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const scrollToSection = (id) => {
        const element = document.getElementById(id)
        if (element) {
            // Offset for fixed navbar
            const y = element.getBoundingClientRect().top + window.scrollY - 100
            window.scrollTo({ top: y, behavior: 'smooth' })
            setActiveSection(id)
            setIsMobileMenuOpen(false)
        }
    }

    const navItems = [
        { id: 'intro', label: 'Pengenalan', icon: Book },
        {
            label: 'Panduan Penyelenggara',
            icon: Trophy,
            items: [
                { id: 'create-tournament', label: 'Membuat Kompetisi' },
                { id: 'manage-participants', label: 'Mengelola Peserta' },
                { id: 'manage-matches', label: 'Update Skor & Jadwal' },
                { id: 'tournament-settings', label: 'Pengaturan & Share' },
            ]
        },
        {
            label: 'Panduan Peserta',
            icon: Users,
            items: [
                { id: 'join-competition', label: 'Cara Bergabung' },
                { id: 'participant-view', label: 'Tampilan Kompetisi' },
                { id: 'ai-analysis', label: 'Fitur AI Analyst' },
            ]
        },
        {
            label: 'Fitur Komunitas',
            icon: Globe,
            items: [
                { id: 'e-club', label: 'E-Club Community' },
                { id: 'global-ranking', label: 'Global Ranking' },
            ]
        }
    ]

    const MockImage = ({ label, height = "h-48" }) => (
        <div className={`w-full ${height} bg-white/5 border border-white/10 rounded-xl flex items-center justify-center relative overflow-hidden group`}>
            <div className="absolute inset-0 bg-gradient-to-br from-neonGreen/5 to-purple-500/5 group-hover:opacity-100 opacity-50 transition-opacity"></div>
            <div className="text-center p-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 mb-2">
                    <div className="w-6 h-6 text-gray-400" />
                    {/* Icon placeholder */}
                </div>
                <p className="text-gray-400 font-medium text-sm">{label}</p>
                <p className="text-gray-600 text-xs mt-1">(Tampilan Screenshot)</p>
            </div>
        </div>
    )

    return (
        <div className="flex gap-8 items-start relative">
            {/* Sidebar Navigation - Desktop */}
            <aside className="hidden lg:block w-72 shrink-0 sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto border-r border-white/10 pr-6 scrollbar-thin scrollbar-thumb-white/10">
                <div className="mb-8 pl-2">
                    <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
                        <Book className="w-5 h-5 text-neonGreen" />
                        Dokumentasi
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">Panduan lengkap BikinLiga</p>
                </div>

                <nav className="space-y-6">
                    {navItems.map((group, idx) => (
                        <div key={idx} className="space-y-2">
                            {group.id ? (
                                <button
                                    onClick={() => scrollToSection(group.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeSection === group.id
                                        ? 'bg-neonGreen/10 text-neonGreen'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <group.icon className="w-4 h-4" />
                                    {group.label}
                                </button>
                            ) : (
                                <div>
                                    <div className="flex items-center gap-2 px-3 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        <group.icon className="w-3 h-3" />
                                        {group.label}
                                    </div>
                                    <div className="space-y-1 pl-2 border-l border-white/5 ml-2">
                                        {group.items.map(item => (
                                            <button
                                                key={item.id}
                                                onClick={() => scrollToSection(item.id)}
                                                className={`w-full text-left px-3 py-1.5 rounded-r-lg text-sm transition-all ${activeSection === item.id
                                                    ? 'text-neonGreen border-l-2 border-neonGreen bg-neonGreen/5 -ml-[1px]'
                                                    : 'text-gray-400 hover:text-white'
                                                    }`}
                                            >
                                                {item.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </nav>
            </aside>

            {/* Mobile Menu Button */}
            <div className="lg:hidden fixed bottom-6 right-6 z-50">
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="w-12 h-12 bg-neonGreen text-black rounded-full flex items-center justify-center shadow-lg shadow-neonGreen/20"
                >
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {/* Mobile Menu Drawer */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
                    <div className="relative w-80 bg-[#1a1a1a] h-full shadow-2xl p-6 overflow-y-auto">
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <h2 className="text-xl font-display font-bold text-white mb-6">Menu Panduan</h2>
                        <nav className="space-y-6">
                            {navItems.map((group, idx) => (
                                <div key={idx}>
                                    {group.id ? (
                                        <button
                                            onClick={() => scrollToSection(group.id)}
                                            className={`block text-base font-medium mb-2 ${activeSection === group.id ? 'text-neonGreen' : 'text-gray-300'}`}
                                        >
                                            {group.label}
                                        </button>
                                    ) : (
                                        <div>
                                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                <group.icon className="w-3 h-3" /> {group.label}
                                            </h3>
                                            <div className="pl-4 space-y-3 border-l border-white/10">
                                                {group.items.map(item => (
                                                    <button
                                                        key={item.id}
                                                        onClick={() => scrollToSection(item.id)}
                                                        className={`block text-sm ${activeSection === item.id ? 'text-neonGreen font-bold' : 'text-gray-400'}`}
                                                    >
                                                        {item.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </nav>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 min-w-0 py-2">

                {/* Introduction */}
                <section id="intro" className="mb-20 scroll-mt-32">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
                        Panduan Penggunaan <span className="text-neonGreen">BikinLiga</span>
                    </h1>
                    <p className="text-xl text-gray-300 leading-relaxed max-w-3xl mb-8">
                        Selamat datang di dokumentasi resmi BikinLiga. Pelajari cara membuat turnamen, mengelola peserta, hingga menggunakan fitur canggih seperti AI Analysis untuk komunitas eFootball Anda.
                    </p>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-white/5 border border-white/10 p-6 rounded-xl">
                            <Trophy className="w-8 h-8 text-neonGreen mb-4" />
                            <h3 className="text-lg font-bold text-white mb-2">Untuk Penyelenggara</h3>
                            <p className="text-gray-400 text-sm mb-4">Buat liga, atur jadwal otomatis, dan kelola skor pertandingan dengan mudah.</p>
                            <button onClick={() => scrollToSection('create-tournament')} className="text-neonGreen text-sm font-bold hover:underline flex items-center gap-1">
                                Pelajari Cara Buat Liga <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-6 rounded-xl">
                            <Users className="w-8 h-8 text-blue-400 mb-4" />
                            <h3 className="text-lg font-bold text-white mb-2">Untuk Peserta</h3>
                            <p className="text-gray-400 text-sm mb-4">Bergabung ke turnamen, pantau statistik match, dan naikkan Global Ranking.</p>
                            <button onClick={() => scrollToSection('join-competition')} className="text-blue-400 text-sm font-bold hover:underline flex items-center gap-1">
                                Cara Gabung Kompetisi <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </section>

                <hr className="border-white/10 mb-20" />

                {/* Organizer Guide */}
                <div className="mb-12">
                    <h2 className="flex items-center gap-3 text-2xl font-bold text-white mb-8">
                        <span className="w-10 h-10 rounded-lg bg-neonGreen/10 flex items-center justify-center text-neonGreen">
                            <Trophy className="w-6 h-6" />
                        </span>
                        Panduan Penyelenggara
                    </h2>

                    <section id="create-tournament" className="mb-16 scroll-mt-32">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            1. Membuat Kompetisi
                        </h3>
                        <p className="text-gray-400 mb-6">
                            Langkah pertama untuk memulai liga Anda. Pastikan Anda sudah login ke akun BikinLiga.
                        </p>
                        <MockImage label="Form Buat Turnamen (Isi Nama, Tipe Liga, Format Match)" />
                        <ul className="mt-6 space-y-4 text-gray-300">
                            <li className="flex gap-3">
                                <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold shrink-0">1</span>
                                <div>
                                    <strong className="text-white block mb-1">Akses Dashboard</strong>
                                    Masuk ke Dashboard dan klik tombol <span className="text-neonGreen">"Buat Kompetisi"</span>.
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold shrink-0">2</span>
                                <div>
                                    <strong className="text-white block mb-1">Pilih Format & Tipe</strong>
                                    Pilih tipe kompetisi:
                                    <ul className="list-disc ml-4 mt-2 space-y-1 text-gray-400 text-sm">
                                        <li><span className="text-white">League</span>: Sistem klasemen poin penuh.</li>
                                        <li><span className="text-white">Knockout</span>: Sistem gugur (Bracket).</li>
                                        <li><span className="text-white">Group + Knockout</span>: Fase grup dilanjutkan fase gugur (seperti Piala Dunia).</li>
                                    </ul>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold shrink-0">3</span>
                                <div>
                                    <strong className="text-white block mb-1">Set Tanggal & Slot</strong>
                                    Tentukan tanggal mulai dan jumlah maksimal peserta (misal: 16 tim).
                                </div>
                            </li>
                        </ul>
                    </section>

                    <section id="manage-participants" className="mb-16 scroll-mt-32">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            2. Mengelola Peserta
                        </h3>
                        <p className="text-gray-400 mb-6">
                            Setelah liga dibuat, Anda perlu mengisi slot peserta. Ada 2 cara: Share Link atau Input Manual.
                        </p>
                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <div className="space-y-4">
                                <h4 className="font-bold text-white">Cara 1: Open Registration</h4>
                                <p className="text-sm text-gray-400">Bagikan link publik turnamen Anda ke grup WhatsApp/Discord.</p>
                                <div className="bg-black/30 p-4 rounded-lg border border-white/5 text-sm font-mono text-neonGreen">
                                    bikinliga.online/join/tournament-slug
                                </div>
                                <p className="text-sm text-gray-400">
                                    Pemain yang mendaftar akan masuk status <span className="text-yellow-500">Pending</span>. Anda harus <strong>Approve</strong> mereka di halaman Manage Participants.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <h4 className="font-bold text-white">Cara 2: Input Manual</h4>
                                <p className="text-sm text-gray-400">Anda juga bisa menambahkan peserta secara manual jika sudah memiliki datanya.</p>
                                <MockImage label="Tombol 'Add Participant' & Form Manual" height="h-32" />
                            </div>
                        </div>
                    </section>

                    <section id="manage-matches" className="mb-16 scroll-mt-32">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            3. Update Skor & Jadwal
                        </h3>
                        <p className="text-gray-400 mb-6">
                            Jadwal (Fixtures) akan digenerate otomatis saat Anda mengklik "Start Tournament".
                        </p>
                        <MockImage label="Halaman Match Management (Input Skor)" />
                        <div className="mt-6 space-y-4">
                            <div className="bg-white/5 p-4 rounded-lg border-l-4 border-neonGreen">
                                <h4 className="font-bold text-white mb-1">Input Skor</h4>
                                <p className="text-sm text-gray-400">
                                    Klik tombol "Edit" pada match card &gt; Masukkan skor Home & Away &gt; Klik "Simpan". Klasemen akan otomatis terupdate seketika.
                                    ...
                                    Masuk ke tab <strong>Settings</strong> &gt; Scroll ke bagian <strong>Sharing Tools</strong> untuk mendownload gambar-gambar ini.
                                </p>
                            </div>
                            <div className="bg-white/5 p-4 rounded-lg border-l-4 border-blue-500">
                                <h4 className="font-bold text-white mb-1">Fitur Live Match</h4>
                                <p className="text-sm text-gray-400">
                                    Jika match sedang berlangsung, Anda bisa mengupdate skor secara berkala agar penonton bisa melihat Live Score.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section id="tournament-settings" className="mb-16 scroll-mt-32">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            4. Pengaturan & Widget
                        </h3>
                        <p className="text-gray-400 mb-6">
                            Bagikan update turnamen ke media sosial dengan fitur Widget Generator.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="aspect-square bg-white/5 rounded-lg flex flex-col items-center justify-center p-4 text-center">
                                <BarChart2 className="w-8 h-8 text-neonGreen mb-2" />
                                <span className="text-sm font-bold text-white">Klasemen Widget</span>
                            </div>
                            <div className="aspect-square bg-white/5 rounded-lg flex flex-col items-center justify-center p-4 text-center">
                                <Calendar className="w-8 h-8 text-blue-400 mb-2" />
                                <span className="text-sm font-bold text-white">Jadwal Widget</span>
                            </div>
                            <div className="aspect-square bg-white/5 rounded-lg flex flex-col items-center justify-center p-4 text-center">
                                <Target className="w-8 h-8 text-red-400 mb-2" />
                                <span className="text-sm font-bold text-white">Bracket Widget</span>
                            </div>
                            <div className="aspect-square bg-white/5 rounded-lg flex flex-col items-center justify-center p-4 text-center">
                                <Share2 className="w-8 h-8 text-purple-400 mb-2" />
                                <span className="text-sm font-bold text-white">Export Image</span>
                            </div>
                        </div>
                        <p className="text-sm text-gray-400">
                            Masuk ke tab <strong>Settings</strong> &gt; Scroll ke bagian <strong>Sharing Tools</strong> untuk mendownload gambar-gambar ini.
                        </p>
                    </section>
                </div>

                <hr className="border-white/10 mb-20" />

                {/* Participant Guide */}
                <div className="mb-12">
                    <h2 className="flex items-center gap-3 text-2xl font-bold text-white mb-8">
                        <span className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <Users className="w-6 h-6" />
                        </span>
                        Panduan Peserta
                    </h2>

                    <section id="join-competition" className="mb-16 scroll-mt-32">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            1. Cara Bergabung
                        </h3>
                        <MockImage label="Halaman Join Competition (Pilih Tim)" />
                        <div className="mt-6 grid md:grid-cols-3 gap-4">
                            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                <Lock className="w-6 h-6 text-neonGreen mb-3" />
                                <h4 className="font-bold text-white mb-2">Login Wajib</h4>
                                <p className="text-xs text-gray-400">
                                    Peserta wajib memiliki akun dan login untuk menjamin validitas data Global Ranking.
                                </p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                <Shield className="w-6 h-6 text-neonPink mb-3" />
                                <h4 className="font-bold text-white mb-2">Pilih Tim</h4>
                                <p className="text-xs text-gray-400">
                                    Pilih tim yang akan Anda gunakan (Real Madrid, MU, dll) dari database resmi kami.
                                </p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                <UserCheck className="w-6 h-6 text-blue-400 mb-3" />
                                <h4 className="font-bold text-white mb-2">Approval</h4>
                                <p className="text-xs text-gray-400">
                                    Tunggu konfirmasi dari admin liga. Cek notifikasi atau email untuk update status.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section id="participant-view" className="mb-16 scroll-mt-32">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            2. Tampilan Kompetisi
                        </h3>
                        <p className="text-gray-400 mb-6">
                            Pantau perjalanan turnamen Anda melalui dashboard peserta yang lengkap.
                        </p>
                        <div className="space-y-6">
                            <div className="flex gap-4 items-start">
                                <BarChart2 className="w-6 h-6 text-neonGreen shrink-0 mt-1" />
                                <div>
                                    <h4 className="font-bold text-white">Klasemen Live</h4>
                                    <p className="text-sm text-gray-400">Posisi klasemen terupdate otomatis setiap skor dimasukkan oleh admin.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <Calendar className="w-6 h-6 text-blue-400 shrink-0 mt-1" />
                                <div>
                                    <h4 className="font-bold text-white">Jadwal & Riwayat</h4>
                                    <p className="text-sm text-gray-400">Lihat lawan Anda berikutnya dan riwayat hasil pertandingan sebelumnya.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <Target className="w-6 h-6 text-red-400 shrink-0 mt-1" />
                                <div>
                                    <h4 className="font-bold text-white">Statistik Personal</h4>
                                    <p className="text-sm text-gray-400">Klik nama Anda di klasemen untuk melihat detail performa: Win Rate, Goal Aggregates, dan Form Guide (W-D-L).</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section id="ai-analysis" className="mb-16 scroll-mt-32">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            3. Fitur AI Analyst <span className="px-2 py-0.5 rounded text-[10px] bg-gradient-to-r from-neonGreen to-blue-500 text-black font-bold uppercase">Pro</span>
                        </h3>
                        <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border border-purple-500/30 rounded-xl p-6">
                            <div className="flex gap-4 items-start">
                                <Cpu className="w-10 h-10 text-purple-400 shrink-0" />
                                <div>
                                    <h4 className="text-lg font-bold text-white mb-2">Asisten Cerdas Anda</h4>
                                    <p className="text-gray-300 text-sm mb-4">
                                        Gunakan tab <strong>AI Analysis</strong> untuk bertanya hal-hal seperti:
                                        <br />
                                        <em>"Siapa lawan terberat saya di grup B?"</em>
                                        <br />
                                        <em>"Berapa peluang saya lolos ke knockout?"</em>
                                    </p>
                                    <MockImage label="Chat Interface dengan AI" height="h-40" />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <hr className="border-white/10 mb-20" />

                {/* Community Features */}
                <div className="mb-12">
                    <h2 className="flex items-center gap-3 text-2xl font-bold text-white mb-8">
                        <span className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-500">
                            <Globe className="w-6 h-6" />
                        </span>
                        Fitur Komunitas
                    </h2>

                    <section id="e-club" className="mb-16 scroll-mt-32">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            1. E-Club Community
                        </h3>
                        <p className="text-gray-400 mb-6">
                            E-Club adalah sosial media khusus pemain eFootball. Bergabunglah dengan komunitas atau buat komunitas Anda sendiri.
                        </p>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white/5 p-5 rounded-xl">
                                <MessageSquare className="w-6 h-6 text-neonGreen mb-3" />
                                <h4 className="font-bold text-white mb-2">Timeline Feed</h4>
                                <p className="text-sm text-gray-400">
                                    Bagikan hasil pertandingan, komentar, atau cari lawan sparring di Timeline publik.
                                </p>
                            </div>
                            <div className="bg-white/5 p-5 rounded-xl">
                                <Heart className="w-6 h-6 text-pink-500 mb-3" />
                                <h4 className="font-bold text-white mb-2">Interaksi</h4>
                                <p className="text-sm text-gray-400">
                                    Like dan Comment pada postingan teman. Bagikan pencapaian turnamen Anda langsung ke E-Club.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section id="global-ranking" className="mb-16 scroll-mt-32">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            2. Global Ranking
                        </h3>
                        <p className="text-gray-400 mb-6">
                            Buktikan bahwa Anda adalah yang terbaik. Setiap pertandingan kompetitif yang Anda mainkan di BikinLiga akan dihitung ke dalam Global Ranking.
                        </p>
                        <MockImage label="Leaderboard Global Ranking" />
                        <div className="mt-6 flex flex-col md:flex-row gap-6 items-center bg-gradient-to-r from-yellow-900/20 to-transparent p-6 rounded-xl border border-yellow-500/20">
                            <Award className="w-16 h-16 text-yellow-500 shrink-0" />
                            <div>
                                <h4 className="text-lg font-bold text-white mb-2">Sistem Poin</h4>
                                <ul className="text-sm text-gray-300 space-y-1">
                                    <li>• <strong>Menang</strong>: +3 Poin Ranking</li>
                                    <li>• <strong>Seri</strong>: +1 Poin Ranking</li>
                                    <li>• <strong>Juara Turnamen</strong>: +50 Bonus Poin</li>
                                </ul>
                                <p className="text-xs text-gray-500 mt-2">*Hanya berlaku untuk turnamen yang diset sebagai "Official/Ranked" oleh admin.</p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* CTA Final */}
                <div className="bg-gradient-to-r from-neonGreen to-blue-600 rounded-2xl p-8 text-center">
                    <h2 className="text-2xl font-bold text-black mb-4">Siap Memulai Karir eFootball Anda?</h2>
                    <p className="text-black/80 mb-6 max-w-xl mx-auto">
                        Daftar sekarang dan rasakan pengalaman turnamen yang profesional, otomatis, dan seru.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link to="/register" className="bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-gray-900 transition flex items-center gap-2">
                            <Zap className="w-4 h-4" /> Daftar Akun
                        </Link>
                        <Link to="/dashboard/tournaments/new" className="bg-white/20 text-black border border-black/10 px-8 py-3 rounded-full font-bold hover:bg-white/30 transition flex items-center gap-2">
                            <PlayCircle className="w-4 h-4" /> Buat Kompetisi
                        </Link>
                    </div>
                </div>

                <div className="h-24"></div> {/* Bottom Spacer */}
            </main>
        </div>
    )
}
