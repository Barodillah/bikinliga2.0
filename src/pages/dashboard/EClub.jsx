import React, { useState } from 'react'
import { Link, Link as RouterLink, useLocation } from 'react-router-dom'
import { Heart, MessageSquare, Share2, Users, Search, Lock, Globe, MoreHorizontal, Image as ImageIcon, Send, Edit, Trash2, Flag } from 'lucide-react'
import AdSlot from '../../components/ui/AdSlot'
import UserBadge from '../../components/ui/UserBadge'
import ShareModal from '../../components/ui/ShareModal'
import Modal from '../../components/ui/Modal'
import { authFetch } from '../../utils/api'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'

// Simple formatter if date-fns not available or issues, but assuming standard install. 
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

// MOCK_POSTS and MOCK_COMMUNITIES removed

export default function EClub() {
    const { user } = useAuth()
    const { success, error } = useToast()
    const [activeTab, setActiveTab] = useState('feed')
    const [posts, setPosts] = useState([])
    const [communities, setCommunities] = useState([])
    const [postContent, setPostContent] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isPosting, setIsPosting] = useState(false)
    const [sharedContent, setSharedContent] = useState(null)
    const [expandedPostId, setExpandedPostId] = useState(null)
    const [comments, setComments] = useState({}) // { postId: [comments] }
    const [loadingComments, setLoadingComments] = useState({}) // { postId: bool }
    const [commentInputs, setCommentInputs] = useState({}) // { postId: string }
    const [activeDropdown, setActiveDropdown] = useState(null)
    const [shareModalPost, setShareModalPost] = useState(null)
    const [deleteModalPostId, setDeleteModalPostId] = useState(null)

    const location = useLocation()

    // Handle Shared Content from Navigation
    React.useEffect(() => {
        if (location.state?.shared_content) {
            setSharedContent(location.state.shared_content);
            // Optional: Prefill text
            if (!postContent) {
                if (location.state.shared_content.type === 'tournament') {
                    const meta = location.state.shared_content.metadata;
                    if (meta.status === 'draft') {
                        setPostContent(`Ayo ikutan kompetisi ${meta.name}! Masih buka slot nih 🔥`);
                    } else {
                        setPostContent(`Yuk lihat turnamen yang saya ikuti: ${meta.name}! ${meta.progress !== 'Belum dimulai' ? `(${meta.progress})` : ''} 🏆`);
                    }
                } else if (location.state.shared_content.type === 'match') {
                    setPostContent(`Match seru nih! ${location.state.shared_content.metadata.homeTeam} vs ${location.state.shared_content.metadata.awayTeam} 🔥`);
                }
            }
            // Clear state so it doesn't persist on refresh/back (optional, but good UX)
            // window.history.replaceState({}, document.title) // minimal clear
        }
    }, [location.state]);

    // Fetch Initial Data
    React.useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [postsRes, commsRes] = await Promise.all([
                    authFetch('/api/posts'),
                    authFetch('/api/communities')
                ]);

                const postsData = await postsRes.json();
                const commsData = await commsRes.json();

                if (postsData.success) setPosts(postsData.data);
                if (commsData.success) setCommunities(commsData.data);

            } catch (err) {
                console.error('Error fetching E-Club data:', err);
                // toast error if needed
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleCreatePost = async () => {
        if (!postContent.trim()) return;
        setIsPosting(true);
        try {
            const res = await authFetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: postContent,
                    shared_content_type: sharedContent?.type || 'none',
                    shared_content_id: sharedContent?.id || null,
                    metadata: sharedContent?.metadata || null
                })
            });
            const data = await res.json();
            if (data.success) {
                setPosts([data.data, ...posts]);
                setPostContent('');
                setSharedContent(null);
                success('Post berhasil dibuat');
            } else {
                error(data.message || 'Gagal membuat post');
            }
        } catch (err) {
            console.error(err);
            error('Terjadi kesalahan');
        } finally {
            setIsPosting(false);
        }
    };

    const handleJoinCommunity = async (commId) => {
        try {
            const res = await authFetch(`/api/communities/${commId}/join`, { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                setCommunities(communities.map(c =>
                    c.id === commId ? { ...c, isJoined: true } : c
                ));
                success(data.message);
            } else {
                error(data.message);
            }
        } catch (err) {
            console.error(err);
            error('Gagal bergabung');
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
            // Revert logic omitted for brevity
        }
        setDeleteModalPostId(null)
    }

    const handleReportPost = (postId) => {
        success('Laporan terkirim. Terima kasih atas masukan Anda.');
        setActiveDropdown(null);
    }

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
                                src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=10b981&color=fff`}
                                alt={user?.name || "User"}
                                className="w-10 h-10 rounded-full"
                            />
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={postContent}
                                    onChange={(e) => setPostContent(e.target.value)}
                                    placeholder="Apa yang sedang terjadi?"
                                    className="w-full bg-darkBg border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neonGreen transition mb-3"
                                />

                                {/* Shared Content Preview input area */}
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
                                                <div className="flex gap-3 text-xs mt-1">
                                                    <span>{sharedContent.metadata.type}</span>
                                                    {sharedContent.metadata.participants > 0 && (
                                                        <span>• {sharedContent.metadata.participants} peserta</span>
                                                    )}
                                                    {sharedContent.metadata.progress && (
                                                        <span>• {sharedContent.metadata.progress}</span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex justify-between items-center">
                                    <div className="flex gap-2">
                                        <button className="p-2 text-gray-400 hover:text-neonGreen hover:bg-neonGreen/10 rounded-lg transition">
                                            <ImageIcon className="w-5 h-5" />
                                        </button>
                                        <button className="p-2 text-gray-400 hover:text-neonGreen hover:bg-neonGreen/10 rounded-lg transition">
                                            <Globe className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleCreatePost}
                                        disabled={isPosting || !postContent.trim()}
                                        className="px-4 py-2 bg-gradient-to-r from-neonGreen to-neonPink text-black font-bold rounded-lg hover:opacity-90 transition flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <Send className="w-4 h-4" />
                                        {isPosting ? 'Mengirim...' : 'Posting'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Posts Feed */}
                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="text-center py-10 text-gray-400">Memuat Feed...</div>
                        ) : posts.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">Belum ada postingan. Jadilah yang pertama!</div>
                        ) : (
                            posts.map((post, index) => (
                                <React.Fragment key={post.id}>
                                    <div className="bg-cardBg border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition">
                                        <div className="p-4">
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
                                                            {/* Assuming simple logic for badge or hide if unknown */}
                                                            <UserBadge tier={post.user_role === 'admin' ? 'pro_liga' : 'free'} />
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
                                                                            // Handle Edit (Not fully implemented yet, maybe fill form?)
                                                                            setPostContent(post.content);
                                                                            // Scroll to top?
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
                                                    <div className={`p-2 rounded-full group-hover:bg-pink-500/10 ${post.is_liked ? 'bg-pink-500/10' : ''}`}>
                                                        <Heart className={`w-5 h-5 ${post.is_liked ? 'fill-current' : ''}`} />
                                                    </div>
                                                    <span>{post.likes_count}</span>
                                                </button>
                                                <button
                                                    onClick={() => toggleComments(post.id)}
                                                    className={`flex items-center gap-2 transition group ${expandedPostId === post.id ? 'text-blue-400' : 'text-gray-400 hover:text-blue-400'}`}
                                                >
                                                    <div className={`p-2 rounded-full group-hover:bg-blue-400/10 ${expandedPostId === post.id ? 'bg-blue-400/10' : ''}`}>
                                                        <MessageSquare className="w-5 h-5" />
                                                    </div>
                                                    <span>{post.comments_count}</span>
                                                </button>
                                                <button
                                                    onClick={() => setShareModalPost(post)}
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
                                                <div className="mt-4 pt-4 border-t border-white/10 animate-fade-in">
                                                    {/* Comment List */}
                                                    <div className="space-y-4 mb-4 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                                                        {loadingComments[post.id] ? (
                                                            <div className="text-center text-gray-500 py-2">Memuat komentar...</div>
                                                        ) : comments[post.id]?.length === 0 ? (
                                                            <div className="text-center text-gray-500 py-2">Belum ada komentar.</div>
                                                        ) : (
                                                            comments[post.id]?.map(comment => (
                                                                <div key={comment.id} className="flex gap-3">
                                                                    <img
                                                                        src={comment.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.name || 'User')}&background=random`}
                                                                        alt={comment.name}
                                                                        className="w-8 h-8 rounded-full"
                                                                    />
                                                                    <div className="flex-1">
                                                                        <div className="bg-white/5 rounded-lg p-3">
                                                                            <div className="flex items-center justify-between mb-1">
                                                                                <span className="font-bold text-sm text-white">{comment.name}</span>
                                                                                <span className="text-xs text-gray-500">{formatTime(comment.created_at)}</span>
                                                                            </div>
                                                                            <p className="text-sm text-gray-300">{comment.content}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>

                                                    {/* Add Comment Input */}
                                                    <div className="flex gap-3 items-center">
                                                        <img
                                                            src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=10b981&color=fff`}
                                                            alt={user?.name}
                                                            className="w-8 h-8 rounded-full"
                                                        />
                                                        <div className="flex-1 relative">
                                                            <input
                                                                type="text"
                                                                value={commentInputs[post.id] || ''}
                                                                onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                                                                onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit(post.id)}
                                                                placeholder="Tulis komentar..."
                                                                className="w-full bg-darkBg border border-white/10 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-neonGreen pr-10"
                                                            />
                                                            <button
                                                                onClick={() => handleCommentSubmit(post.id)}
                                                                disabled={!commentInputs[post.id]?.trim()}
                                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-neonGreen disabled:opacity-50 hover:bg-neonGreen/10 p-1 rounded-full transition"
                                                            >
                                                                <Send className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Ad Slot Injection */}
                                    {(index + 1) % 5 === 0 && (
                                        <AdSlot variant="inline" className="w-full max-w-none" />
                                    )}
                                </React.Fragment>
                            ))
                        )}
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
                            {communities.map((community) => (
                                <div key={community.id} className="flex items-center justify-between">
                                    <Link to={`/dashboard/eclub/community/${community.id}`} className="flex items-center gap-3 flex-1 hover:bg-white/5 p-2 rounded-lg transition -ml-2">
                                        <img
                                            src={community.icon_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(community.name)}&background=random`}
                                            alt={community.name}
                                            className="w-10 h-10 rounded-lg"
                                        />
                                        <div>
                                            <div className="flex items-center gap-1">
                                                <h4 className="font-medium text-white text-sm hover:text-neonGreen transition">{community.name}</h4>
                                                {community.creator_tier && <UserBadge tier={community.creator_tier} size="sm" />}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                                <span>{community.member_count} Members</span>
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
                                        onClick={() => !community.isJoined && handleJoinCommunity(community.id)}
                                        disabled={community.isJoined}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ml-2 ${community.isJoined
                                            ? 'bg-white/5 text-gray-400 hover:bg-white/10 cursor-default'
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

                    {/* Create Community CTA */}
                    <div className="bg-gradient-to-br from-neonGreen/10 to-blue-500/10 border border-neonGreen/20 rounded-xl p-6 text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-neonGreen/5 opacity-0 group-hover:opacity-100 transition duration-500"></div>

                        <div className="relative z-10">
                            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-neonGreen to-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-neonGreen/20">
                                <Users className="w-8 h-8 text-black" />
                            </div>

                            <h3 className="text-lg font-bold text-white mb-2">Punya Komunitas Sendiri?</h3>
                            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                                Buat E-Club untuk turnamenmu, kumpulkan member, dan bangun komunitas solid!
                            </p>

                            <Link
                                to="/dashboard/settings?tab=eclub"
                                className="inline-block w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-neonGreen transition hover:shadow-lg hover:shadow-neonGreen/20"
                            >
                                Buat Komunitas
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            {/* Share Modal */}
            <ShareModal
                isOpen={!!shareModalPost}
                onClose={() => setShareModalPost(null)}
                post={shareModalPost}
            />
            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deleteModalPostId}
                onClose={() => setDeleteModalPostId(null)}
                title="Hapus Postingan?"
                size="sm"
            >
                <div>
                    <p className="text-gray-300 mb-6">
                        Apakah Anda yakin ingin menghapus postingan ini? Tindakan ini tidak dapat dibatalkan.
                    </p>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setDeleteModalPostId(null)}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleDeleteConfirm}
                            className="px-4 py-2 rounded-lg text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition"
                        >
                            Hapus
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
