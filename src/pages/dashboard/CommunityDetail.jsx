import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
    Heart, MessageSquare, Share2, Users, Search, Lock, Globe,
    MoreHorizontal, Image as ImageIcon, Send, ArrowLeft, Shield, Info
} from 'lucide-react'
import AdSlot from '../../components/ui/AdSlot'

// Mock Data for specific community context
const MOCK_COMMUNITY_DATA = {
    1: {
        id: 1,
        name: 'Mobile Legends Indo',
        description: 'Komunitas terbesar pecinta Mobile Legends di Indonesia. Tempat diskusi meta, cari tim, dan info turnamen.',
        members: '12.5k',
        online: '1.2k',
        type: 'public',
        isJoined: true,
        image: 'https://ui-avatars.com/api/?name=ML&background=ef4444&color=fff',
        banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2000'
    },
    2: {
        id: 2,
        name: 'PUBG Mobile Scrim',
        description: 'Wadah latihan dan scrim rutin untuk tim PUBG Mobile. Jadwal scrim setiap malam jam 19.00 WIB.',
        members: '8.2k',
        online: '850',
        type: 'private',
        isJoined: false,
        image: 'https://ui-avatars.com/api/?name=PUBG&background=f59e0b&color=fff',
        banner: 'https://images.unsplash.com/photo-1593305841991-05c29736cef7?auto=format&fit=crop&q=80&w=2000'
    }
}

// Fallback if ID not found
const DEFAULT_COMMUNITY = MOCK_COMMUNITY_DATA[1]

const MOCK_COMMUNITY_POSTS = [
    {
        id: 101,
        user: {
            name: 'Admin ML Indo',
            username: '@admin_ml',
            avatar: 'https://ui-avatars.com/api/?name=Admin+ML&background=ef4444&color=fff',
            role: 'Admin'
        },
        content: '📢 PENGUMUMAN: Rules grup diperbarui per tanggal 18 Januari. Dilarang spam link tidak jelas. Yang melanggar akan di-kick. Harap dibaca di pin post.',
        likes: 543,
        comments: 89,
        time: '1 jam yang lalu',
        isPinned: true
    },
    {
        id: 102,
        user: {
            name: 'Pro Player Wannabe',
            username: '@wannabe_pro',
            avatar: 'https://ui-avatars.com/api/?name=Pro+Player&background=random'
        },
        content: 'Cari roam buat mabar push rank mythic immortal. Min WR 60%. Gas skrg!',
        likes: 32,
        comments: 15,
        time: '3 jam yang lalu'
    },
    {
        id: 103,
        user: {
            name: 'Event Organizer',
            username: '@eo_gaming',
            avatar: 'https://ui-avatars.com/api/?name=EO&background=random'
        },
        content: 'Turnamen Fast Cup berhadiah total 5 juta! Slot terbatas. Link pendaftaran di bio.',
        image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=1000',
        likes: 120,
        comments: 42,
        time: '5 jam yang lalu'
    }
]

export default function CommunityDetail() {
    const { id } = useParams()
    const community = MOCK_COMMUNITY_DATA[id] || DEFAULT_COMMUNITY
    const [isJoined, setIsJoined] = useState(community.isJoined)

    return (
        <div className="max-w-7xl mx-auto">
            {/* Back Button */}
            <Link to="/dashboard/eclub" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition">
                <ArrowLeft className="w-5 h-5" />
                Kembali ke eClub
            </Link>

            {/* Community Header */}
            <div className="bg-cardBg border border-white/10 rounded-xl overflow-hidden mb-6">
                {/* Banner */}
                <div className="h-48 md:h-64 w-full relative">
                    <img src={community.banner} alt="Banner" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                </div>

                {/* Info */}
                <div className="px-6 pb-6 relative -mt-16 flex flex-col md:flex-row items-end md:items-center gap-6">
                    <div className="relative">
                        <img
                            src={community.image}
                            alt={community.name}
                            className="w-32 h-32 rounded-xl border-4 border-cardBg shadow-lg"
                        />
                        <div className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-green-500 border-2 border-cardBg" title="Online" />
                    </div>

                    <div className="flex-1 mb-2">
                        <h1 className="text-2xl md:text-3xl font-display font-bold text-white flex items-center gap-2">
                            {community.name}
                            {community.type === 'private' && <Lock className="w-5 h-5 text-gray-400" />}
                            {community.type === 'public' && <Globe className="w-5 h-5 text-gray-400" />}
                        </h1>
                        <p className="text-gray-300 mt-1 max-w-2xl">{community.description}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {community.members} Anggota
                            </span>
                            <span className="text-green-400 flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                {community.online} Online
                            </span>
                        </div>
                    </div>

                    <div className="w-full md:w-auto mt-4 md:mt-0">
                        <button
                            onClick={() => setIsJoined(!isJoined)}
                            className={`w-full md:w-auto px-6 py-2.5 rounded-lg font-bold transition flex items-center justify-center gap-2 ${isJoined
                                ? 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                                : 'bg-gradient-to-r from-neonGreen to-neonPink text-black hover:opacity-90'
                                }`}
                        >
                            {isJoined ? (
                                <>Bergabung ✓</>
                            ) : (
                                <>Gabung Komunitas</>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Create Post */}
                    {isJoined && (
                        <div className="bg-cardBg border border-white/10 rounded-xl p-4">
                            <div className="flex gap-4">
                                <img
                                    src="https://ui-avatars.com/api/?name=Admin+User&background=10b981&color=fff"
                                    alt="User"
                                    className="w-10 h-10 rounded-full"
                                />
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        placeholder={`Tulis sesuatu di ${community.name}...`}
                                        className="w-full bg-darkBg border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neonGreen transition mb-3"
                                    />
                                    <div className="flex justify-between items-center">
                                        <div className="flex gap-2">
                                            <button className="p-2 text-gray-400 hover:text-neonGreen hover:bg-neonGreen/10 rounded-lg transition">
                                                <ImageIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <button className="px-4 py-2 bg-white/5 text-white font-bold rounded-lg hover:bg-white/10 transition flex items-center gap-2">
                                            <Send className="w-4 h-4" />
                                            Kirim
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Posts */}
                    <div className="space-y-4">
                        {MOCK_COMMUNITY_POSTS.map((post, index) => (
                            <React.Fragment key={post.id}>
                                <div className="bg-cardBg border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition">
                                    <div className="p-4">
                                        {post.isPinned && (
                                            <div className="flex items-center gap-2 text-xs text-neonGreen font-medium mb-3">
                                                <Shield className="w-3 h-3" />
                                                Pinned Post
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <img src={post.user.avatar} alt={post.user.name} className="w-10 h-10 rounded-full" />
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-bold text-white">{post.user.name}</h3>
                                                        {post.user.role && (
                                                            <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-neonGreen/20 text-neonGreen font-bold">
                                                                {post.user.role}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-400">{post.user.username} • {post.time}</p>
                                                </div>
                                            </div>
                                            <button className="text-gray-400 hover:text-white">
                                                <MoreHorizontal className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <p className="text-gray-200 mb-4 whitespace-pre-wrap">{post.content}</p>
                                        {post.image && (
                                            <div className="rounded-lg overflow-hidden mb-4 border border-white/10">
                                                <img src={post.image} alt="Post content" className="w-full h-64 object-cover" />
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between border-t border-white/10 pt-3">
                                            <button className="flex items-center gap-2 text-gray-400 hover:text-pink-500 transition group">
                                                <div className="p-2 rounded-full group-hover:bg-pink-500/10">
                                                    <Heart className="w-5 h-5" />
                                                </div>
                                                <span>{post.likes}</span>
                                            </button>
                                            <button className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition group">
                                                <div className="p-2 rounded-full group-hover:bg-blue-400/10">
                                                    <MessageSquare className="w-5 h-5" />
                                                </div>
                                                <span>{post.comments}</span>
                                            </button>
                                            <button className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition group">
                                                <div className="p-2 rounded-full group-hover:bg-green-400/10">
                                                    <Share2 className="w-5 h-5" />
                                                </div>
                                                <span>Share</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Ad Slot Injection */}
                                {(index + 1) % 2 === 0 && (
                                    <AdSlot variant="inline" className="w-full max-w-none" />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-cardBg border border-white/10 rounded-xl p-4">
                        <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                            <Info className="w-5 h-5 text-neonGreen" />
                            Tentang Komunitas
                        </h2>
                        <div className="space-y-4 text-sm text-gray-400">
                            <div className="flex justify-between">
                                <span>Dibuat</span>
                                <span className="text-white">12 Jan 2023</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Kategori</span>
                                <span className="text-white">MOBA / Esports</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Lokasi</span>
                                <span className="text-white">Indonesia</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-cardBg border border-white/10 rounded-xl p-4">
                        <h2 className="font-bold text-white mb-4">Admin & Moderator</h2>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <img src="https://ui-avatars.com/api/?name=Admin+ML&background=ef4444&color=fff" className="w-8 h-8 rounded-full" alt="Admin" />
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-white">Admin ML Indo</div>
                                    <div className="text-xs text-neonGreen">Admin Utama</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <img src="https://ui-avatars.com/api/?name=Mod+One&background=random" className="w-8 h-8 rounded-full" alt="Mod" />
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-white">Mod One</div>
                                    <div className="text-xs text-blue-400">Moderator</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
