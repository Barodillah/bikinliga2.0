import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Users, Lock, Globe, Share2, Info, ArrowLeft, Send } from 'lucide-react';
import UserBadge from '../../components/ui/UserBadge';
import ShareModal from '../../components/ui/ShareModal';
import AdSlot from '../../components/ui/AdSlot';

export default function PublicCommunityDetail() {
    const { id } = useParams();
    const [community, setCommunity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [shareModalOpen, setShareModalOpen] = useState(false);

    // Dynamic title & favicon
    useEffect(() => {
        if (!community) return;
        document.title = `${community.name} - Komunitas BikinLiga`;
        const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
        link.rel = 'icon';
        link.href = community.icon_url || '/favicon.png';
        document.head.appendChild(link);
        return () => { document.title = 'BikinLiga - Platform Turnamen eFootball Terbaik'; link.href = '/favicon.png'; };
    }, [community]);

    useEffect(() => {
        const fetchCommunity = async () => {
            try {
                const res = await fetch(`/api/communities/public/${id}`);
                const data = await res.json();
                if (data.success) {
                    setCommunity(data.data);
                }
            } catch (err) {
                console.error('Error fetching public community:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCommunity();
    }, [id]);

    if (loading) return <div className="text-center py-20 text-white">Loading...</div>;
    if (!community) return <div className="text-center py-20 text-white">Komunitas tidak ditemukan</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Back Button */}
            <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition">
                <ArrowLeft className="w-5 h-5" />
                Kembali ke Beranda
            </Link>

            {/* Community Header */}
            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden mb-6">
                {/* Banner */}
                <div className="h-48 md:h-64 w-full relative bg-darkBg">
                    {community.banner_url ? (
                        <img src={community.banner_url} alt="Banner" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-gray-800 to-gray-900" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                </div>

                {/* Info */}
                <div className="px-6 pb-6 relative -mt-16 flex flex-col md:flex-row items-end md:items-center gap-6">
                    <div className="relative">
                        <img
                            src={community.icon_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(community.name)}&background=random`}
                            alt={community.name}
                            className="w-32 h-32 rounded-xl border-4 border-[#1a1a1a] shadow-lg"
                        />
                    </div>

                    <div className="flex-1 mb-2">
                        <h1 className="text-2xl md:text-3xl font-display font-bold text-white flex items-center gap-2">
                            {community.name}
                            {community.creator_tier && <UserBadge tier={community.creator_tier} />}
                            {community.type === 'private' && <Lock className="w-5 h-5 text-gray-400" />}
                            {community.type === 'public' && <Globe className="w-5 h-5 text-gray-400" />}
                        </h1>
                        <p className="text-gray-300 mt-1 max-w-2xl">{community.description}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {community.member_count} Anggota
                            </span>
                        </div>
                    </div>

                    <div className="w-full md:w-auto mt-4 md:mt-0 flex gap-3">
                        <button
                            onClick={() => setShareModalOpen(true)}
                            className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-lg transition border border-white/10"
                            title="Bagikan Komunitas"
                        >
                            <Share2 className="w-5 h-5" />
                        </button>
                        <Link
                            to={`/register?redirect=/dashboard/eclub/community/${id}`}
                            className="flex-1 md:flex-none px-6 py-2.5 rounded-lg font-bold bg-gradient-to-r from-neonGreen to-neonPink text-black hover:opacity-90 flex items-center justify-center gap-2"
                        >
                            Gabung Komunitas
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Locked Content */}
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-8 text-center space-y-4">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                            <Lock className="w-8 h-8 text-gray-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Konten Komunitas</h3>
                        <p className="text-gray-400 max-w-md mx-auto">
                            Bergabunglah dengan komunitas ini untuk melihat postingan, berinteraksi dengan anggota lain, dan mengikuti event eksklusif.
                        </p>
                        <Link
                            to={`/register?redirect=/dashboard/eclub/community/${id}`}
                            className="inline-block px-6 py-2.5 rounded-lg font-bold bg-white text-black hover:bg-gray-200 transition mt-4"
                        >
                            Daftar Sekarang
                        </Link>
                    </div>
                    <AdSlot variant="inline" className="w-full max-w-none" />
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4">
                        <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                            <Info className="w-5 h-5 text-neonGreen" />
                            Tentang Komunitas
                        </h2>
                        <div className="space-y-4 text-sm text-gray-400">
                            <div className="flex flex-col gap-1 border-b border-white/5 pb-3">
                                <span className="text-xs text-gray-500">Dibuat Pada</span>
                                <span className="text-white font-medium">
                                    {community.created_at ? new Date(community.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-gray-500">Deskripsi</span>
                                <span className="text-white">
                                    {community.description || 'Belum ada deskripsi'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4">
                        <h2 className="font-bold text-white mb-4">Admin & Moderator</h2>
                        <div className="space-y-3">
                            {community.admins && community.admins.length > 0 ? (
                                community.admins.map(admin => (
                                    <div key={admin.id} className="flex items-center gap-3">
                                        <img
                                            src={admin.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(admin.name)}&background=ef4444&color=fff`}
                                            className="w-8 h-8 rounded-full"
                                            alt={admin.name}
                                        />
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-white">{admin.name}</div>
                                            <div className={`text-xs ${admin.role === 'admin' ? 'text-neonGreen' : 'text-blue-400'}`}>
                                                {admin.role === 'admin' ? 'Admin' : 'Moderator'}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-gray-500 text-sm">Tidak ada admin terdaftar</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <ShareModal
                isOpen={shareModalOpen}
                onClose={() => setShareModalOpen(false)}
                link={window.location.href}
                text={`Lihat komunitas ${community.name} di BikinLiga!`}
                title={`Bagikan ${community.name}`}
            />
        </div>
    );
}
