import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Card, { CardHeader, CardContent } from '../ui/Card'
import { Calendar, ChevronRight, Newspaper, MessageSquare, Phone, Users, MessageCircle, ChevronDown, Send, Loader2 } from 'lucide-react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { authFetch } from '../../utils/api'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'

export default function LeagueNews({ tournamentId, initialNews = [], participants = [], organizerId }) {
    const { user } = useAuth()
    const { success: showSuccess, error: showError } = useToast()

    const [newsList, setNewsList] = useState(initialNews)
    const [isNewsLoading, setIsNewsLoading] = useState(false)
    const [commentsMap, setCommentsMap] = useState({})
    const [newComment, setNewComment] = useState('')
    const [openThreadNewsId, setOpenThreadNewsId] = useState(null)

    // Sync newsList with props or fetch if needed
    useEffect(() => {
        if (initialNews && initialNews.length > 0) {
            setNewsList(initialNews)
        } else {
            const fetchNews = async () => {
                setIsNewsLoading(true)
                try {
                    const response = await authFetch(`/api/tournaments/${tournamentId}/news`)
                    const data = await response.json()
                    if (data.success) {
                        setNewsList(data.data)
                    }
                } catch (err) {
                    console.error('Failed to fetch news:', err)
                } finally {
                    setIsNewsLoading(false)
                }
            }
            if (tournamentId) fetchNews()
        }
    }, [initialNews, tournamentId])

    // Interaction Handlers
    const toggleComments = async (newsId) => {
        if (openThreadNewsId === newsId) {
            setOpenThreadNewsId(null)
            return
        }

        setOpenThreadNewsId(newsId)
        try {
            const response = await authFetch(`/api/tournaments/${tournamentId}/news/${newsId}/comments`)
            const data = await response.json()
            if (data.success) {
                setCommentsMap(prev => ({ ...prev, [newsId]: data.data }))
            }
        } catch (err) { console.error(err) }
    }

    const handlePostComment = async (e, newsId) => {
        e.preventDefault()
        if (!newComment.trim()) return

        try {
            const response = await authFetch(`/api/tournaments/${tournamentId}/news/${newsId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newComment })
            })
            const data = await response.json()

            if (data.success) {
                setNewComment('')
                const res = await authFetch(`/api/tournaments/${tournamentId}/news/${newsId}/comments`)
                const d = await res.json()
                if (d.success) {
                    setCommentsMap(prev => ({ ...prev, [newsId]: d.data }))
                }
            } else {
                showError(data.message || 'Gagal mengirim komentar')
            }
        } catch (err) {
            console.error('Post comment error:', err)
            showError('Gagal mengirim komentar')
        }
    }

    const isMemberOfTournament = participants.some(p => String(p.user_id) === String(user?.id))
    const isOrganizer = organizerId && user && String(organizerId) === String(user.id)

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

            <div className="space-y-4 animate-fadeIn">
                {/* Welcome Message Card */}
                {newsList.filter(n => n.is_welcome).map(news => (
                    <div key={news.id} className="bg-gradient-to-br from-neonGreen/20 to-blue-600/20 border border-neonGreen/30 rounded-xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <MessageSquare className="w-24 h-24 text-neonGreen" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="bg-neonGreen text-black text-[10px] font-bold px-2 py-0.5 rounded uppercase">Pinned</span>
                                    <h3 className="font-bold text-xl text-white">{news.title}</h3>
                                </div>
                            </div>
                            <p className="text-gray-200 mb-6 whitespace-pre-wrap">{news.content}</p>

                            <div className="flex flex-wrap gap-3">
                                {news.contact_info && (
                                    <a href={`https://wa.me/${news.contact_info.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer"
                                        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition">
                                        <Phone className="w-4 h-4" />
                                        Hubungi Admin
                                    </a>
                                )}
                                {news.group_link && (
                                    <a href={news.group_link} target="_blank" rel="noreferrer"
                                        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition">
                                        <Users className="w-4 h-4" />
                                        Gabung Grup
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {isNewsLoading ? (
                    <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto text-neonGreen" /></div>
                ) : newsList.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 bg-white/5 rounded-xl border border-white/10">
                        <Newspaper className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>Belum ada berita yang dipublish.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {newsList.filter(n => !n.is_welcome).map((news) => (
                            <div key={news.id} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition group relative">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg text-white">{news.title}</h3>
                                    <span className="text-xs text-gray-500 bg-black/20 px-2 py-1 rounded">
                                        {new Date(news.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </span>
                                </div>
                                <p className="text-gray-300 text-sm whitespace-pre-wrap mb-4">{news.content}</p>

                                {/* Interaction Bar */}
                                {news.open_thread && (
                                    <div className="border-t border-white/10 pt-3">
                                        <button
                                            onClick={() => toggleComments(news.id)}
                                            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
                                        >
                                            <MessageCircle className="w-4 h-4" />
                                            {news.comment_count || 0} Komentar
                                            <ChevronDown className={`w-3 h-3 transition-transform ${openThreadNewsId === news.id ? 'rotate-180' : ''}`} />
                                        </button>

                                        {/* Comments Section */}
                                        {openThreadNewsId === news.id && (
                                            <div className="mt-4 space-y-4 pl-4 border-l-2 border-white/10">
                                                {/* Comment List */}
                                                {commentsMap[news.id]?.length > 0 ? (
                                                    <div className="space-y-3">
                                                        {commentsMap[news.id].map(comment => (
                                                            <div key={comment.id} className="flex gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden flex-shrink-0">
                                                                    {comment.participant_logo || comment.user_avatar ? (
                                                                        <img src={comment.participant_logo || comment.user_avatar} alt="" className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <Users className="w-4 h-4 m-auto text-gray-400 h-full" />
                                                                    )}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className="text-sm font-bold text-white">{comment.team_name || comment.participant_name || comment.user_name || 'User'}</span>
                                                                        <span className="text-[10px] text-gray-500">{new Date(comment.created_at).toLocaleString()}</span>
                                                                    </div>
                                                                    <p className="text-sm text-gray-300">{comment.content}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-500 italic">Belum ada komentar.</p>
                                                )}

                                                {/* Comment Input */}
                                                {(isOrganizer || isMemberOfTournament) ? (
                                                    <form onSubmit={(e) => handlePostComment(e, news.id)} className="flex gap-2 mt-4">
                                                        <Input
                                                            value={newComment}
                                                            onChange={(e) => setNewComment(e.target.value)}
                                                            placeholder="Tulis komentar..."
                                                            className="flex-1 bg-black/20"
                                                        />
                                                        <Button type="submit" size="sm" icon={Send}>
                                                            Kirim
                                                        </Button>
                                                    </form>
                                                ) : (
                                                    <p className="text-xs text-gray-500 mt-2">Hanya peserta yang dapat berkomentar.</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
