import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import {
    Bell, Check, Filter, CheckCircle, XCircle, UserPlus,
    Calendar, Trophy, Mail, PlayCircle, Megaphone,
    Wallet, AlertTriangle, Users, Heart, MessageCircle, Flag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Notifications = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'unread'

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/notifications?limit=50&offset=0', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setNotifications(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch('/api/notifications/read-all', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };



    const filteredNotifications = filter === 'unread'
        ? notifications.filter(n => !n.is_read)
        : notifications;

    const getNotificationLink = (notification) => {
        const { type, data } = notification;
        switch (type) {
            case 'tournament_invite_accepted':
            case 'tournament_invite_declined':
            case 'tournament_join_request':
                return `/dashboard/tournaments/${data.tournament_id}`;
            case 'tournament_join_approved':
            case 'tournament_join_rejected':
            case 'tournament_started':
                return `/dashboard/competitions/${data.tournament_id}/view`;
            case 'tournament_invite':
                return `/dashboard/competitions/${data.tournament_id}/join`;
            case 'tournament_news':
                return `/dashboard/competitions/${data.tournament_id}/view`;
            case 'match_scheduled':
            case 'match_completed':
                if (data.tournament_id && data.match_id) {
                    return `/dashboard/competitions/${data.tournament_id}/view/match/${data.match_id}`;
                }
                return '#';
            case 'community_join_request':
            case 'community_join_approved':
                return `/dashboard/eclub/community/${data.community_id}`;
            case 'post_like':
            case 'post_comment':
                return `/post/${data.post_id}`;
            case 'complaint_update':
                return `/dashboard/settings`;
            case 'coin_adjustment':
                return `/dashboard/topup`;
            default:
                return '#';
        }
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.is_read) {
            handleMarkAsRead(notification.id);
        }

        const link = getNotificationLink(notification);
        if (link && link !== '#') {
            navigate(link);
        }
    };

    const getIconConfig = (type) => {
        switch (type) {
            case 'tournament_invite_accepted': return { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10' };
            case 'tournament_invite_declined': return { icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10' };
            case 'tournament_join_request': return { icon: UserPlus, color: 'text-blue-400', bg: 'bg-blue-400/10' };
            case 'match_scheduled': return { icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-400/10' };
            case 'match_completed': return { icon: Flag, color: 'text-green-400', bg: 'bg-green-400/10' };
            case 'tournament_invite': return { icon: Mail, color: 'text-purple-400', bg: 'bg-purple-400/10' };
            case 'tournament_started': return { icon: PlayCircle, color: 'text-neonGreen', bg: 'bg-neonGreen/10' };
            case 'tournament_news': return { icon: Megaphone, color: 'text-orange-400', bg: 'bg-orange-400/10' };
            case 'coin_adjustment': return { icon: Wallet, color: 'text-yellow-400', bg: 'bg-yellow-400/10' };
            case 'admin_announcement': return { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-400/10' };
            case 'community_join_request':
            case 'community_join_approved': return { icon: Users, color: 'text-pink-400', bg: 'bg-pink-400/10' };
            case 'post_like': return { icon: Heart, color: 'text-red-500', bg: 'bg-red-500/10' };
            case 'post_comment': return { icon: MessageCircle, color: 'text-blue-300', bg: 'bg-blue-300/10' };
            default: return { icon: Bell, color: 'text-gray-400', bg: 'bg-gray-400/10' };
        }
    };

    return (
        <div className="p-4 md:p-8 ml-0 md:ml-64 bg-darkBg min-h-screen text-white font-sans">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neonGreen to-emerald-400 mb-1">
                            Notifikasi
                        </h1>
                        <p className="text-gray-400">Pantau semua aktivitas terbaru Anda</p>
                    </div>

                    <div className="flex gap-3">
                        {notifications.some(n => !n.is_read) && (
                            <button
                                onClick={handleMarkAllRead}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-neonGreen/20 to-emerald-500/20 hover:from-neonGreen/30 hover:to-emerald-500/30 border border-neonGreen/30 hover:border-neonGreen/50 rounded-xl text-sm transition-all text-neonGreen font-medium backdrop-blur-sm"
                            >
                                <CheckCircle size={18} />
                                <span>Tandai Semua Dibaca</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-6 border-b border-white/5 pb-0.5 sticky top-0 bg-darkBg/80 backdrop-blur-md z-10 pt-2">
                    {['all', 'unread'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`pb-3 px-4 text-sm font-medium transition-all relative ${filter === f
                                ? 'text-neonGreen'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            {f === 'all' ? 'Semua' : 'Belum Dibaca'}
                            {filter === f && (
                                <motion.div
                                    layoutId="underline"
                                    className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-neonGreen to-emerald-400"
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="space-y-3 pb-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <div className="w-8 h-8 border-2 border-neonGreen border-t-transparent rounded-full animate-spin" />
                            <p className="text-gray-500 text-sm">Memuat notifikasi...</p>
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="text-center py-20 flex flex-col items-center bg-cardBg/30 rounded-3xl border border-white/5 mx-4 md:mx-0">
                            <div className="w-20 h-20 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center mb-6 shadow-xl border border-white/5">
                                <Bell size={32} className="text-gray-500 opacity-50" />
                            </div>
                            <h3 className="text-lg font-medium text-white mb-2">Tidak ada notifikasi</h3>
                            <p className="text-gray-500 max-w-xs mx-auto text-sm">
                                {filter === 'unread'
                                    ? "Anda sudah membaca semua notifikasi."
                                    : "Belum ada aktivitas baru yang perlu ditampilkan."}
                            </p>
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {filteredNotifications.map((notif) => {
                                const { icon: Icon, color, bg } = getIconConfig(notif.type);
                                return (
                                    <motion.div
                                        key={notif.id}
                                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                                        onClick={() => handleNotificationClick(notif)}
                                        className={`
                                            group relative p-4 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden
                                            ${notif.is_read
                                                ? 'bg-cardBg/40 border-white/5 hover:bg-cardBg/60'
                                                : 'bg-cardBg border-white/10 shadow-lg shadow-black/20 hover:border-neonGreen/30'
                                            }
                                        `}
                                    >
                                        <div className="flex gap-4 items-start relative z-10">
                                            {/* Icon */}
                                            <div className={`
                                                flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-xl
                                                ${bg} ${color} shadow-inner
                                            `}>
                                                <Icon size={24} strokeWidth={1.5} />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0 pt-0.5">
                                                <div className="flex justify-between items-start mb-1.5 gap-2">
                                                    <h3 className={`font-semibold text-sm md:text-base leading-snug group-hover:text-neonGreen transition-colors ${notif.is_read ? 'text-gray-300' : 'text-white'}`}>
                                                        {notif.title}
                                                    </h3>
                                                    <span className="text-[10px] md:text-xs font-medium text-gray-500 whitespace-nowrap bg-black/20 px-2 py-1 rounded-full border border-white/5">
                                                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: id })}
                                                    </span>
                                                </div>
                                                <p className={`text-sm leading-relaxed pr-8 ${notif.is_read ? 'text-gray-500' : 'text-gray-300'}`}>
                                                    {notif.message}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Unread Indicator */}
                                        {!notif.is_read && (
                                            <div className="absolute top-1/2 -translate-y-1/2 left-0 w-1 h-12 bg-neonGreen rounded-r-full shadow-[0_0_10px_2px_rgba(34,197,94,0.3)]" />
                                        )}
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notifications;
