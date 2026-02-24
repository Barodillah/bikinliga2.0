import React, { useState, useEffect } from 'react'
import { authFetch } from '../../utils/api'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import UserBadge from '../../components/ui/UserBadge'
import ShareModal from '../../components/ui/ShareModal'
import { useParams, Link, useLocation } from 'react-router-dom'
import {
    Heart, MessageSquare, Share2, Users, Search, Lock, Globe,
    MoreHorizontal, Image as ImageIcon, Send, ArrowLeft, Shield, Info, Edit, Trash2, Flag
} from 'lucide-react'
import AdSlot from '../../components/ui/AdSlot'
import Modal from '../../components/ui/Modal'

// Mock data removed
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

export default function CommunityDetail() {
    const { id } = useParams()
    const { user } = useAuth()
    const { success, error } = useToast()
    const [community, setCommunity] = useState(null)
    const [posts, setPosts] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [postContent, setPostContent] = useState('')
    const [isPosting, setIsPosting] = useState(false)
    const [isJoining, setIsJoining] = useState(false)
    const [isLeaving, setIsLeaving] = useState(false)
    const [leaveModalOpen, setLeaveModalOpen] = useState(false)
    const [shareModalOpen, setShareModalOpen] = useState(false)
    const location = useLocation()
    const [sharedContent, setSharedContent] = useState(null)
    const [expandedPostId, setExpandedPostId] = useState(null)
    const [comments, setComments] = useState({})
    const [loadingComments, setLoadingComments] = useState({})
    const [commentInputs, setCommentInputs] = useState({})
    const [activeDropdown, setActiveDropdown] = useState(null)
    const [deleteModalPostId, setDeleteModalPostId] = useState(null)
    const [shareModalPost, setShareModalPost] = useState(null)

    // Handle Shared Content from Navigation
    React.useEffect(() => {
        if (location.state?.shared_content) {
            setSharedContent(location.state.shared_content);
            if (!postContent) {
                if (location.state.shared_content.type === 'tournament') {
                    setPostContent(`Ayo ikutan turnamen ${location.state.shared_content.metadata.name}! 🏆`);
                } else if (location.state.shared_content.type === 'match') {
                    setPostContent(`Match seru nih! ${location.state.shared_content.metadata.homeTeam} vs ${location.state.shared_content.metadata.awayTeam} 🔥`);
                }
            }
        }
    }, [location.state]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [commRes, postsRes] = await Promise.all([
                    authFetch(`/api/communities/${id}`),
                    authFetch(`/api/posts?community_id=${id}`)
                ]);
                const commData = await commRes.json();
                const postsData = await postsRes.json();

                if (commData.success) setCommunity(commData.data);
                if (postsData.success) setPosts(postsData.data);
            } catch (err) {
                console.error('Fetch error:', err);
                error('Gagal memuat data komunitas');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleJoin = async () => {
        if (!community) return;
        setIsJoining(true);
        try {
            const res = await authFetch(`/api/communities/${id}/join`, { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                setCommunity({ ...community, isJoined: true, member_count: community.member_count + 1 });
                success(data.message);
            } else {
                error(data.message);
            }
        } catch (err) {
            console.error(err);
            error('Gagal bergabung');
        } finally {
            setIsJoining(false);
        }
    };

    const handleLeaveClick = () => {
        if (!community) return;
        setLeaveModalOpen(true);
    };

    const handleLeaveConfirm = async () => {
        if (!community) return;
        setIsLeaving(true);
        try {
            const res = await authFetch(`/api/communities/${id}/leave`, { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                setCommunity({ ...community, isJoined: false, member_count: Math.max(0, community.member_count - 1) });
                success(data.message);
            } else {
                error(data.message);
            }
        } catch (err) {
            console.error(err);
            error('Gagal keluar komunitas');
        } finally {
            setIsLeaving(false);
            setLeaveModalOpen(false);
        }
    };

    const handleCreatePost = async () => {
        if (!postContent.trim()) return;
        setIsPosting(true);
        try {
            const res = await authFetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: postContent,
                    community_id: id,
                    shared_content_type: sharedContent?.type || 'none',
                    shared_content_id: sharedContent?.id || null,
                    metadata: sharedContent?.metadata || null
                })
            });
            const data = await res.json();
            if (data.success) {
                setPosts([data.data, ...posts]);
                setPostContent('');
                success('Post berhasil dibuat');
            } else {
                error(data.message);
            }
        } catch (err) {
            console.error(err);
            error('Terjadi kesalahan');
        } finally {
            setIsPosting(false);
        }
    };

    const handleLike = async (postId) => {
        // Optimistic Update
        const updatedPosts = posts.map(p => {
            if (p.id === postId) {
                return {
                    ...p,
                    is_liked: !p.is_liked,
                    likes_count: p.is_liked ? p.likes_count - 1 : p.likes_count + 1
                }
            }
            return p
        })
        setPosts(updatedPosts)

        try {
            await authFetch(`/api/posts/${postId}/like`, { method: 'POST' })
        } catch (err) {
            console.error('Like error:', err)
        }
    }

    const toggleComments = async (postId) => {
        if (expandedPostId === postId) {
            setExpandedPostId(null)
            return
        }

        setExpandedPostId(postId)
        if (!comments[postId]) {
            setLoadingComments(prev => ({ ...prev, [postId]: true }))
            try {
                const res = await authFetch(`/api/posts/${postId}/comments`)
                const data = await res.json()
                if (data.success) {
                    setComments(prev => ({ ...prev, [postId]: data.data }))
                }
            } catch (err) {
                console.error('Fetch comments error:', err)
            } finally {
                setLoadingComments(prev => ({ ...prev, [postId]: false }))
            }
        }
    }

    const handleCommentSubmit = async (postId) => {
        const content = commentInputs[postId]
        if (!content || !content.trim()) return

        try {
            const res = await authFetch(`/api/posts/${postId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content })
            })
            const data = await res.json()

            if (data.success) {
                setComments(prev => ({
                    ...prev,
                    [postId]: [...(prev[postId] || []), data.data]
                }))
                setCommentInputs(prev => ({ ...prev, [postId]: '' }))

                // Update comment count in post list
                setPosts(posts.map(p =>
                    p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p
                ))
            }
        } catch (err) {
            console.error('Submit comment error:', err)
            error('Gagal mengirim komentar')
        }
    }

    const handleDeleteClick = (postId) => {
        setDeleteModalPostId(postId)
        setActiveDropdown(null)
    }

    const handleDeleteConfirm = async () => {
        if (!deleteModalPostId) return

        try {
            // Optimistic update
            setPosts(posts.filter(p => p.id !== deleteModalPostId));

            await authFetch(`/api/posts/${deleteModalPostId}`, { method: 'DELETE' });
            success('Postingan dihapus');
        } catch (err) {
            console.error(err);
            error('Gagal menghapus postingan');
        }
        setDeleteModalPostId(null)
    }

    const handleReportPost = (postId) => {
        success('Laporan terkirim. Terima kasih atas masukan Anda.');
        setActiveDropdown(null);
    }

    const handleSharePost = (post) => {
        setShareModalPost(post);
        setActiveDropdown(null);
    }

    if (isLoading) return <div className="text-center py-20 text-white">Loading...</div>;
    if (!community) return <div className="text-center py-20 text-white">Komunitas tidak ditemukan</div>;

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
                            className="w-32 h-32 rounded-xl border-4 border-cardBg shadow-lg"
                        />
                        <div className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-green-500 border-2 border-cardBg" title="Online" />
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
                            <span className="text-green-400 flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                {community.online} Online
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
                        {community.isJoined ? (
                            community.creator_id === user?.id ? (
                                <button
                                    disabled
                                    className="w-full md:w-auto px-6 py-2.5 rounded-lg font-bold bg-white/5 text-gray-400 border border-white/10 cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    Owner
                                </button>
                            ) : (
                                <button
                                    onClick={handleLeaveClick}
                                    disabled={isLeaving}
                                    className="w-full md:w-auto px-6 py-2.5 rounded-lg font-bold transition flex items-center justify-center gap-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
                                >
                                    {isLeaving ? 'Memproses...' : 'Keluar Komunitas'}
                                </button>
                            )
                        ) : (
                            <button
                                onClick={handleJoin}
                                disabled={isJoining}
                                className="w-full md:w-auto px-6 py-2.5 rounded-lg font-bold transition flex items-center justify-center gap-2 bg-gradient-to-r from-neonGreen to-neonPink text-black hover:opacity-90 disabled:opacity-50"
                            >
                                {isJoining ? 'Memproses...' : 'Gabung Komunitas'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Create Post */}
                    {community.isJoined && (
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
                                        value={postContent}
                                        onChange={(e) => setPostContent(e.target.value)}
                                        placeholder={`Tulis sesuatu di ${community.name}...`}
                                        className="w-full bg-darkBg border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neonGreen transition mb-3"
                                    />
                                    {/* Shared Content Preview */}
                                    {sharedContent && (
                                        <div className="mb-3 bg-darkBg/50 p-3 rounded-lg border border-white/5 relative group">
                                            <button
                                                onClick={() => setSharedContent(null)}
                                                className="absolute top-2 right-2 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                                            >
                                                &times;
                                            </button>
                                            {sharedContent.type === 'match' && (
                                                <div className="text-sm text-gray-300">
                                                    <p className="font-bold mb-1 text-neonGreen">Match Highlight</p>
                                                    <div className="flex justify-between items-center">
                                                        <span>{sharedContent.metadata.homeTeam}</span>
                                                        <span className="font-bold text-white mx-2">vs</span>
                                                        <span>{sharedContent.metadata.awayTeam}</span>
                                                    </div>
                                                </div>
                                            )}
                                            {sharedContent.type === 'tournament' && (
                                                <div className="text-sm text-gray-300">
                                                    <p className="font-bold mb-1 text-neonPink">Tournament</p>
                                                    <p className="text-white font-medium">{sharedContent.metadata.name}</p>
                                                    <p className="text-xs">{sharedContent.metadata.type}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center">
                                        <div className="flex gap-2">
                                            <button className="p-2 text-gray-400 hover:text-neonGreen hover:bg-neonGreen/10 rounded-lg transition">
                                                <ImageIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <button
                                            onClick={handleCreatePost}
                                            disabled={isPosting || !postContent.trim()}
                                            className="px-4 py-2 bg-white/5 text-white font-bold rounded-lg hover:bg-white/10 transition flex items-center gap-2 disabled:opacity-50"
                                        >
                                            <Send className="w-4 h-4" />
                                            {isPosting ? 'Mengirim...' : 'Kirim'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Posts */}
                    <div className="space-y-4">
                        {posts.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">Belum ada postingan di komunitas ini.</div>
                        ) : (
                            posts.map((post, index) => (
                                <React.Fragment key={post.id}>
                                    <div className="bg-cardBg border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition">
                                        <div className="p-4">
                                            {!!post.is_pinned && (
                                                <div className="flex items-center gap-2 text-xs text-neonGreen font-medium mb-3">
                                                    <Shield className="w-3 h-3" />
                                                    Pinned Post
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={post.user_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.user_name)}&background=random`}
                                                        alt={post.user_name}
                                                        className="w-10 h-10 rounded-full"
                                                    />
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-bold text-white">{post.user_name}</h3>
                                                            {post.user_role === 'admin' && (
                                                                <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-neonGreen/20 text-neonGreen font-bold">
                                                                    Admin
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-400">{post.user_username} • {formatTime(post.created_at)}</p>
                                                    </div>
                                                </div>
                                                <div className="relative">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveDropdown(activeDropdown === post.id ? null : post.id);
                                                        }}
                                                        className="text-gray-400 hover:text-white"
                                                    >
                                                        <MoreHorizontal className="w-5 h-5" />
                                                    </button>

                                                    {activeDropdown === post.id && (
                                                        <div className="absolute right-0 top-8 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
                                                            {post.user_id === user?.id ? (
                                                                <>
                                                                    <button
                                                                        onClick={() => {
                                                                            setPostContent(post.content);
                                                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                                                            setActiveDropdown(null);
                                                                        }}
                                                                        className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/5 flex items-center gap-2"
                                                                    >
                                                                        <Edit className="w-4 h-4" /> Edit Post
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteClick(post.id)}
                                                                        className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 flex items-center gap-2"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" /> Hapus Post
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleReportPost(post.id)}
                                                                    className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/5 flex items-center gap-2"
                                                                >
                                                                    <Flag className="w-4 h-4" /> Laporkan
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-gray-200 mb-4 whitespace-pre-wrap">{post.content}</p>

                                            {/* Shared Content Renderer */}
                                            {post.shared_content_type !== 'none' && post.metadata && (
                                                <div className="mb-4 bg-darkBg/50 p-3 rounded-lg border border-white/5">
                                                    {post.shared_content_type === 'match' && (
                                                        post.metadata?.tournament_id ? (
                                                            <Link
                                                                to={`/dashboard/competitions/${post.metadata.tournament_id}/view/match/${post.shared_content_id}`}
                                                                className="block hover:bg-white/5 transition rounded p-1 -m-1"
                                                            >
                                                                <div className="text-sm text-gray-300">
                                                                    <p className="font-bold mb-1 text-neonGreen">Match Result</p>
                                                                    <div className="flex justify-between items-center">
                                                                        <span>{post.metadata.homeTeam}</span>
                                                                        <span className="font-bold text-white">{post.metadata.homeScore} - {post.metadata.awayScore}</span>
                                                                        <span>{post.metadata.awayTeam}</span>
                                                                    </div>
                                                                </div>
                                                            </Link>
                                                        ) : (
                                                            <div className="text-sm text-gray-300">
                                                                <p className="font-bold mb-1 text-neonGreen">Match Result</p>
                                                                <div className="flex justify-between items-center">
                                                                    <span>{post.metadata.homeTeam}</span>
                                                                    <span className="font-bold text-white">{post.metadata.homeScore} - {post.metadata.awayScore}</span>
                                                                    <span>{post.metadata.awayTeam}</span>
                                                                </div>
                                                            </div>
                                                        )
                                                    )}
                                                    {post.shared_content_type === 'tournament' && (
                                                        <>
                                                            {post.metadata.visibility === 'public' ? (
                                                                <Link to={`/dashboard/competitions/${post.shared_content_id}/view`} className="block hover:bg-white/5 transition rounded p-1 -m-1">
                                                                    <div className="text-sm text-gray-300">
                                                                        <div className="flex justify-between items-start">
                                                                            <p className="font-bold mb-1 text-neonPink">Tournament</p>
                                                                            <Share2 className="w-3 h-3 text-gray-500" />
                                                                        </div>
                                                                        <p className="text-white font-medium">{post.metadata.name}</p>
                                                                        <div className="flex gap-2 text-xs mt-1 flex-wrap">
                                                                            <span>{post.metadata.type}</span>
                                                                            {post.metadata.participants > 0 && (
                                                                                <span>• {post.metadata.participants} peserta</span>
                                                                            )}
                                                                            {post.metadata.progress && (
                                                                                <span>• {post.metadata.progress}</span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </Link>
                                                            ) : (
                                                                <div className="text-sm text-gray-300">
                                                                    <p className="font-bold mb-1 text-neonPink">Tournament</p>
                                                                    <p className="text-white font-medium">{post.metadata.name}</p>
                                                                    <div className="flex gap-2 text-xs mt-1 flex-wrap">
                                                                        <span>{post.metadata.type}</span>
                                                                        {post.metadata.participants > 0 && (
                                                                            <span>• {post.metadata.participants} peserta</span>
                                                                        )}
                                                                        {post.metadata.progress && (
                                                                            <span>• {post.metadata.progress}</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            )}

                                            {post.image_url && (
                                                <div className="rounded-lg overflow-hidden mb-4 border border-white/10">
                                                    <img src={post.image_url} alt="Post content" className="w-full h-64 object-cover" />
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between border-t border-white/10 pt-3">
                                                <button
                                                    onClick={() => handleLike(post.id)}
                                                    className={`flex items-center gap-2 transition group ${post.is_liked ? 'text-pink-500' : 'text-gray-400 hover:text-pink-500'}`}
                                                >
                                                    <div className="p-2 rounded-full group-hover:bg-pink-500/10">
                                                        <Heart className={`w-5 h-5 ${post.is_liked ? 'fill-current' : ''}`} />
                                                    </div>
                                                    <span>{post.likes_count}</span>
                                                </button>
                                                <button
                                                    onClick={() => toggleComments(post.id)}
                                                    className={`flex items-center gap-2 transition group ${expandedPostId === post.id ? 'text-blue-400' : 'text-gray-400 hover:text-blue-400'}`}
                                                >
                                                    <div className="p-2 rounded-full group-hover:bg-blue-400/10">
                                                        <MessageSquare className="w-5 h-5" />
                                                    </div>
                                                    <span>{post.comments_count}</span>
                                                </button>
                                                <button
                                                    onClick={() => handleSharePost(post)}
                                                    className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition group"
                                                >
                                                    <div className="p-2 rounded-full group-hover:bg-green-400/10">
                                                        <Share2 className="w-5 h-5" />
                                                    </div>
                                                    <span>Share</span>
                                                </button>
                                            </div>

                                            {/* Comment Section */}
                                            {expandedPostId === post.id && (
                                                <div className="border-t border-white/10 pt-4 mt-4">
                                                    {loadingComments[post.id] ? (
                                                        <div className="text-center py-4 text-gray-500">Memuat komentar...</div>
                                                    ) : (
                                                        <>
                                                            <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                                                                {(comments[post.id] || []).length === 0 ? (
                                                                    <div className="text-center py-4 text-gray-500 text-sm">Belum ada komentar</div>
                                                                ) : (
                                                                    (comments[post.id] || []).map(comment => (
                                                                        <div key={comment.id} className="flex gap-3">
                                                                            <img
                                                                                src={comment.user_avatar || comment.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user_name || comment.name)}&background=random`}
                                                                                alt={comment.user_name || comment.name}
                                                                                className="w-8 h-8 rounded-full flex-shrink-0"
                                                                            />
                                                                            <div className="flex-1 bg-white/5 rounded-lg px-3 py-2">
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="font-bold text-white text-sm">{comment.user_name || comment.name}</span>
                                                                                    <span className="text-xs text-gray-500">{formatTime(comment.created_at)}</span>
                                                                                </div>
                                                                                <p className="text-gray-300 text-sm">{comment.content}</p>
                                                                            </div>
                                                                        </div>
                                                                    ))
                                                                )}
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    value={commentInputs[post.id] || ''}
                                                                    onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                                                                    onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit(post.id)}
                                                                    placeholder="Tulis komentar..."
                                                                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-neonGreen/50 text-sm"
                                                                />
                                                                <button
                                                                    onClick={() => handleCommentSubmit(post.id)}
                                                                    className="bg-neonGreen/20 hover:bg-neonGreen/30 text-neonGreen p-2 rounded-lg transition"
                                                                >
                                                                    <Send className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Ad Slot Injection */}
                                    {(index + 1) % 2 === 0 && (
                                        <AdSlot variant="inline" className="w-full max-w-none" />
                                    )}
                                </React.Fragment>
                            ))
                        )}
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

                    <div className="bg-cardBg border border-white/10 rounded-xl p-4">
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

                    <div className="bg-cardBg border border-white/10 rounded-xl p-4">
                        <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-neonPink" />
                            Member ({community.member_count || 0})
                        </h2>
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                            {community.members && community.members.length > 0 ? (
                                community.members.map(member => (
                                    <div key={member.id} className="flex items-center gap-3">
                                        <img
                                            src={member.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`}
                                            className="w-8 h-8 rounded-full"
                                            alt={member.name}
                                        />
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-white">{member.name}</div>
                                            <div className="text-xs text-gray-400">@{member.username}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-gray-500 text-sm">Belum ada member</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* Share Modal */}
            <ShareModal
                isOpen={shareModalOpen}
                onClose={() => setShareModalOpen(false)}
                link={`${window.location.origin}/eclub/${id}`}
                text={`Gabung komunitas ${community.name} di BikinLiga!`}
                title={`Bagikan ${community.name}`}
            />

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deleteModalPostId}
                onClose={() => setDeleteModalPostId(null)}
                title="Hapus Postingan?"
            >
                <div className="space-y-4">
                    <p className="text-gray-400">Apakah kamu yakin ingin menghapus postingan ini? Tindakan ini tidak dapat dibatalkan.</p>
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={() => setDeleteModalPostId(null)}
                            className="px-4 py-2 text-white hover:bg-white/5 rounded-lg transition"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleDeleteConfirm}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                        >
                            Hapus
                        </button>
                    </div>
                </div>
            </Modal>

            {shareModalPost && (
                <ShareModal
                    isOpen={!!shareModalPost}
                    onClose={() => setShareModalPost(null)}
                    link={`${window.location.origin}/dashboard/eclub/community/${id}`}
                    text={shareModalPost.content?.substring(0, 100)}
                    title="Bagikan Postingan"
                />
            )}

            {/* Leave Community Confirmation Modal */}
            <Modal
                isOpen={leaveModalOpen}
                onClose={() => setLeaveModalOpen(false)}
                title="Keluar Komunitas?"
            >
                <div className="space-y-4">
                    <p className="text-gray-400">Apakah Anda yakin ingin keluar dari komunitas <span className="text-white font-bold">{community.name}</span>? Anda tidak akan lagi menerima notifikasi atau bisa memposting di komunitas ini.</p>
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={() => setLeaveModalOpen(false)}
                            className="px-4 py-2 text-white hover:bg-white/5 rounded-lg transition"
                            disabled={isLeaving}
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleLeaveConfirm}
                            disabled={isLeaving}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition flex items-center gap-2"
                        >
                            {isLeaving ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Memproses...
                                </>
                            ) : (
                                'Keluar'
                            )}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
