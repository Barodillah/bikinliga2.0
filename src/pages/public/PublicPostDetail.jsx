import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, MessageSquare, Share2, ArrowLeft, Send, User } from 'lucide-react';
import AdSlot from '../../components/ui/AdSlot';
import ShareModal from '../../components/ui/ShareModal';
import UserBadge from '../../components/ui/UserBadge';

export default function PublicPostDetail() {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [shareModalOpen, setShareModalOpen] = useState(false);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                // Fetch from public endpoint (no auth needed)
                const res = await fetch(`/api/posts/public/${id}`);
                const data = await res.json();
                if (data.success) {
                    setPost(data.data);
                }
            } catch (err) {
                console.error('Error fetching post:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [id]);

    const formatTime = (dateString) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Baru saja';
            const now = new Date();
            const diffInSeconds = Math.floor((now - date) / 1000);
            if (diffInSeconds < 60) return 'Baru saja';
            if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit yang lalu`;
            if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`;
            if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} hari yang lalu`;
            return date.toLocaleDateString('id-ID');
        } catch (e) {
            return 'Baru saja';
        }
    };

    if (loading) return <div className="text-center py-20 text-white">Loading...</div>;
    if (!post) return <div className="text-center py-20 text-white">Postingan tidak ditemukan</div>;

    return (
        <div className="max-w-3xl mx-auto">
            {/* Post Card */}
            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden mb-6">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <img
                                src={post.user_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.user_name)}&background=random`}
                                alt={post.user_name}
                                className="w-12 h-12 rounded-full border border-white/10"
                            />
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-white text-lg">{post.user_name}</h3>
                                    {post.user_role === 'admin' && (
                                        <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-neonGreen/20 text-neonGreen font-bold">
                                            Admin
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-400">@{post.user_username} • {formatTime(post.created_at)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <p className="text-gray-200 mb-6 whitespace-pre-wrap text-lg leading-relaxed">{post.content}</p>
                    {post.image_url && (
                        <div className="rounded-xl overflow-hidden mb-6 border border-white/10">
                            <img src={post.image_url} alt="Post content" className="w-full h-auto max-h-[500px] object-cover" />
                        </div>
                    )}

                    {/* Shared Content Preview */}
                    {post.shared_content_type !== 'none' && post.metadata && (
                        <div className="mb-6 bg-white/5 p-4 rounded-xl border border-white/10">
                            {post.shared_content_type === 'match' && (
                                <div className="text-gray-300">
                                    <p className="font-bold mb-2 text-neonGreen text-sm uppercase tracking-wider">Match Highlight</p>
                                    <div className="flex justify-between items-center text-lg font-bold">
                                        <span>{post.metadata.homeTeam}</span>
                                        <span className="text-white/50 text-sm">vs</span>
                                        <span>{post.metadata.awayTeam}</span>
                                    </div>
                                    <div className="flex justify-between items-center mt-1 text-2xl font-display">
                                        <span>{post.metadata.homeScore}</span>
                                        <span>{post.metadata.awayScore}</span>
                                    </div>
                                </div>
                            )}
                            {post.shared_content_type === 'tournament' && (
                                <div className="text-gray-300">
                                    <p className="font-bold mb-2 text-neonPink text-sm uppercase tracking-wider">Tournament Invitation</p>
                                    <p className="text-white font-bold text-xl">{post.metadata.name}</p>
                                    <p className="text-sm mt-1 text-gray-400 capitalize">{post.metadata.type}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Stats & Actions */}
                    <div className="flex items-center gap-6 border-t border-white/10 pt-4 text-gray-400">
                        <div className="flex items-center gap-2">
                            <Heart className="w-6 h-6" />
                            <span className="text-lg font-medium">{post.likes_count}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MessageSquare className="w-6 h-6" />
                            <span className="text-lg font-medium">{post.comments_count}</span>
                        </div>
                        <button
                            onClick={() => setShareModalOpen(true)}
                            className="flex items-center gap-2 ml-auto hover:text-white transition"
                        >
                            <Share2 className="w-6 h-6" />
                            <span className="font-medium">Share</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Comments Preview */}
            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden mb-8 p-6">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-neonGreen" />
                    Komentar Terbaru
                </h3>

                <div className="space-y-4 mb-6">
                    {post.comments && post.comments.length > 0 ? (
                        post.comments.map(comment => (
                            <div key={comment.id} className="flex gap-4">
                                <img
                                    src={comment.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.name)}&background=random`}
                                    className="w-10 h-10 rounded-full"
                                    alt={comment.name}
                                />
                                <div className="flex-1">
                                    <div className="bg-white/5 rounded-xl p-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-bold text-white">{comment.name}</span>
                                            <span className="text-xs text-gray-500">{formatTime(comment.created_at)}</span>
                                        </div>
                                        <p className="text-gray-300">{comment.content}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 italic">Belum ada komentar.</p>
                    )}
                </div>

                {/* Guest Input Trigger */}
                <Link to="/register" className="block cursor-text">
                    <div className="flex gap-3 items-center">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="flex-1 bg-black border border-white/20 rounded-full px-4 py-3 text-gray-400 text-sm flex justify-between items-center hover:border-white/40 transition">
                            <span>Beri komentar...</span>
                            <Send className="w-4 h-4" />
                        </div>
                    </div>
                </Link>
            </div>

            {/* CTA Banner */}
            <div className="bg-gradient-to-r from-neonGreen to-blue-500 rounded-xl p-1">
                <div className="bg-black/90 rounded-lg p-6 text-center md:flex md:items-center md:justify-between md:text-left gap-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2 font-display">Gabung Komunitas Gamers!</h2>
                        <p className="text-gray-300">Ikuti diskusi seru, turnamen, dan bangun tim impianmu di BikinLiga.</p>
                    </div>
                    <Link
                        to="/register"
                        className="inline-block mt-4 md:mt-0 bg-white text-black font-bold px-8 py-3 rounded-full hover:scale-105 transition shadow-[0_0_20px_rgba(255,255,255,0.3)] whitespace-nowrap"
                    >
                        Daftar Sekarang 🚀
                    </Link>
                </div>
            </div>

            <ShareModal isOpen={shareModalOpen} onClose={() => setShareModalOpen(false)} post={post} />
        </div>
    );
}
