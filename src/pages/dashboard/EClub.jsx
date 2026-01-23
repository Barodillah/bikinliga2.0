import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, MessageSquare, Share2, Users, Search, Lock, Globe, MoreHorizontal, Image as ImageIcon, Send } from 'lucide-react'
import AdSlot from '../../components/ui/AdSlot'
import UserBadge from '../../components/ui/UserBadge'

const MOCK_POSTS = [
    {
        id: 1,
        user: {
            name: 'Budi Santoso',
            username: '@budigaming',
            avatar: 'https://ui-avatars.com/api/?name=Budi+Santoso&background=random',
            tier: 'pro_liga'
        },
        content: 'Baru saja memenangkan turnamen FIFA lokal! GGWP untuk semua peserta. 🔥🏆 #FIFA #Esports',
        image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1000',
        likes: 124,
        comments: 45,
        time: '2 jam yang lalu'
    },
    {
        id: 2,
        user: {
            name: 'Siti Aminah',
            username: '@siti_pro',
            avatar: 'https://ui-avatars.com/api/?name=Siti+Aminah&background=random',
            tier: 'captain'
        },
        content: 'Mencari tim untuk turnamen Mobile Legends minggu depan. Role: Mage/Support. DM ya! 👇',
        likes: 89,
        comments: 23,
        time: '4 jam yang lalu'
    },
    {
        id: 3,
        user: {
            name: 'Komunitas PES Indo',
            username: '@pesindo_official',
            avatar: 'https://ui-avatars.com/api/?name=PES+Indo&background=random',
            tier: 'free'
        },
        content: 'Jangan lupa registrasi untuk Liga Mingguan kita ditutup besok jam 12 malam! Segera daftarkan tim kalian.',
        likes: 256,
        comments: 12,
        time: '6 jam yang lalu'
    }
]

const MOCK_COMMUNITIES = [
    {
        id: 1,
        name: 'Mobile Legends Indo',
        members: '12.5k',
        type: 'public',
        isJoined: true,
        image: 'https://ui-avatars.com/api/?name=ML&background=ef4444&color=fff'
    },
    {
        id: 2,
        name: 'PUBG Mobile Scrim',
        members: '8.2k',
        type: 'private',
        isJoined: false,
        image: 'https://ui-avatars.com/api/?name=PUBG&background=f59e0b&color=fff'
    },
    {
        id: 3,
        name: 'FIFA 24 Community',
        members: '5.1k',
        type: 'public',
        isJoined: false,
        image: 'https://ui-avatars.com/api/?name=FIFA&background=3b82f6&color=fff'
    },
    {
        id: 4,
        name: 'Valorant Tactics',
        members: '3.4k',
        type: 'private',
        isJoined: true,
        image: 'https://ui-avatars.com/api/?name=VL&background=ef4444&color=fff'
    }
]

export default function EClub() {
    const [activeTab, setActiveTab] = useState('feed')

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-display font-bold text-white mb-2">eClub Timeline</h1>
                <p className="text-gray-400">Terhubung dengan komunitas dan pemain lainnya.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Feed Column */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Create Post Card */}
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
                                    placeholder="Apa yang sedang terjadi?"
                                    className="w-full bg-darkBg border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neonGreen transition mb-3"
                                />
                                <div className="flex justify-between items-center">
                                    <div className="flex gap-2">
                                        <button className="p-2 text-gray-400 hover:text-neonGreen hover:bg-neonGreen/10 rounded-lg transition">
                                            <ImageIcon className="w-5 h-5" />
                                        </button>
                                        <button className="p-2 text-gray-400 hover:text-neonGreen hover:bg-neonGreen/10 rounded-lg transition">
                                            <Globe className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <button className="px-4 py-2 bg-gradient-to-r from-neonGreen to-neonPink text-black font-bold rounded-lg hover:opacity-90 transition flex items-center gap-2">
                                        <Send className="w-4 h-4" />
                                        Posting
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Posts Feed */}
                    <div className="space-y-4">
                        {MOCK_POSTS.map((post, index) => (
                            <React.Fragment key={post.id}>
                                <div className="bg-cardBg border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition">
                                    <div className="p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <img src={post.user.avatar} alt={post.user.name} className="w-10 h-10 rounded-full" />
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-bold text-white">{post.user.name}</h3>
                                                        <UserBadge tier={post.user.tier} />
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

                {/* Right Sidebar - Communities */}
                <div className="space-y-6">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari komunitas..."
                            className="w-full bg-cardBg border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-neonGreen transition"
                        />
                    </div>

                    {/* Community List */}
                    <div className="bg-cardBg border border-white/10 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-white flex items-center gap-2">
                                <Users className="w-5 h-5 text-neonGreen" />
                                Komunitas Rekomendasi
                            </h2>
                        </div>

                        <div className="space-y-4">
                            {MOCK_COMMUNITIES.map((community) => (
                                <div key={community.id} className="flex items-center justify-between">
                                    <Link to={`/dashboard/eclub/community/${community.id}`} className="flex items-center gap-3 flex-1 hover:bg-white/5 p-2 rounded-lg transition -ml-2">
                                        <img src={community.image} alt={community.name} className="w-10 h-10 rounded-lg" />
                                        <div>
                                            <h4 className="font-medium text-white text-sm hover:text-neonGreen transition">{community.name}</h4>
                                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                                <span>{community.members} Members</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    {community.type === 'private' ? (
                                                        <><Lock className="w-3 h-3" /> Private</>
                                                    ) : (
                                                        <><Globe className="w-3 h-3" /> Public</>
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                    <button
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ml-2 ${community.isJoined
                                            ? 'bg-white/5 text-gray-400 hover:bg-white/10'
                                            : 'bg-neonGreen/10 text-neonGreen hover:bg-neonGreen/20'
                                            }`}
                                    >
                                        {community.isJoined ? 'Joined' : 'Join'}
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-4 py-2 text-sm text-neonGreen hover:text-white transition">
                            Lihat Semua
                        </button>
                    </div>

                    {/* Trending Topics */}
                    <div className="bg-cardBg border border-white/10 rounded-xl p-4">
                        <h2 className="font-bold text-white mb-4">Trending Topik</h2>
                        <div className="space-y-3">
                            <div className="hover:bg-white/5 p-2 rounded-lg cursor-pointer transition">
                                <div className="text-xs text-gray-400 mb-1">Olahraga • Trending</div>
                                <div className="font-bold text-white">#TimnasDay</div>
                                <div className="text-xs text-gray-500">24.5k Posts</div>
                            </div>
                            <div className="hover:bg-white/5 p-2 rounded-lg cursor-pointer transition">
                                <div className="text-xs text-gray-400 mb-1">Gaming • Live</div>
                                <div className="font-bold text-white">#MPLSeason13</div>
                                <div className="text-xs text-gray-500">12.1k Posts</div>
                            </div>
                            <div className="hover:bg-white/5 p-2 rounded-lg cursor-pointer transition">
                                <div className="text-xs text-gray-400 mb-1">Tournament</div>
                                <div className="font-bold text-white">BikinLiga Cup 2024</div>
                                <div className="text-xs text-gray-500">5.3k Posts</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
