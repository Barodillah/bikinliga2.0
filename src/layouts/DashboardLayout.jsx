import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router-dom'
import {
    Trophy, LayoutDashboard, List, Plus, Users, Tv,
    Calendar, BarChart2, Settings, LogOut, Menu, X,
    ChevronRight, Wallet, Shield, FileText, Globe, Bell,
    User, Key, Crown, Star
} from 'lucide-react'
import ChatWidget from '../components/ChatWidget'
import { useAuth } from '../contexts/AuthContext'

const sidebarLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, exact: true },
    { name: 'Turnamen Saya', href: '/dashboard/tournaments', icon: List, exclude: ['/dashboard/tournaments/new'] },
    { name: 'Buat Turnamen', href: '/dashboard/tournaments/new', icon: Plus },
    { name: 'Kompetisi', href: '/dashboard/competitions', icon: Globe },
    { name: 'Stream', href: '/dashboard/stream', icon: Tv },
    { name: 'Top Up', href: '/dashboard/topup', icon: Wallet },
    { name: 'eClub', href: '/dashboard/eclub', icon: Shield },
    { name: 'Ranking', href: '/dashboard/ranking', icon: BarChart2 },
]

export default function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [notificationsOpen, setNotificationsOpen] = useState(false)
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()
    const { logout, user, wallet, subscription } = useAuth()

    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)

    // Fetch Notifications
    const fetchNotifications = async () => {
        if (!user) return
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/notifications?limit=5&unread_only=false', {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (response.data.success) {
                setNotifications(response.data.data)
                setUnreadCount(response.data.unreadCount)
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error)
        }
    }

    useEffect(() => {
        fetchNotifications()
        // Optional: Poll every minute
        const interval = setInterval(fetchNotifications, 60000)
        return () => clearInterval(interval)
    }, [user])

    const handleMarkAllRead = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch('/api/notifications/read-all', {}, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
            setUnreadCount(0)
        } catch (error) {
            console.error('Failed to mark all as read:', error)
        }
    }

    const [activeSidebarOverride, setActiveSidebarOverride] = useState(null)

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    // Get subscription tier styling
    // Get subscription tier styling
    const getSubscriptionStyle = (plan) => {
        switch (plan?.toLowerCase()) {
            case 'pro_league':
                return {
                    bg: 'bg-purple-500/20',
                    text: 'text-purple-400',
                    border: 'border-purple-500/50',
                    name: 'Pro League',
                    Icon: Crown,
                    gradient: 'from-purple-600/20 via-pink-500/20 to-purple-600/20',
                    cardBorder: 'border-purple-500/30',
                    buttonGradient: 'from-purple-500 to-pink-500'
                }
            case 'captain':
                return {
                    bg: 'bg-yellow-500/20',
                    text: 'text-yellow-400',
                    border: 'border-yellow-500/50',
                    name: 'Captain',
                    Icon: Star,
                    gradient: 'from-yellow-500/20 via-amber-500/20 to-yellow-500/20',
                    cardBorder: 'border-yellow-500/30',
                    buttonGradient: 'from-yellow-500 to-amber-500'
                }
            default:
                return {
                    bg: 'bg-neonGreen/20',
                    text: 'text-neonGreen',
                    border: 'border-neonGreen/50',
                    name: 'Free',
                    Icon: Shield,
                    gradient: 'from-white/5 to-white/10',
                    cardBorder: 'border-white/10',
                    buttonGradient: 'from-neonGreen to-neonPink'
                }
        }
    }

    const subStyle = getSubscriptionStyle(subscription?.plan)



    const getNotificationLink = (notification) => {
        const { type, data } = notification;
        switch (type) {
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
        // Mark as read
        if (!notification.is_read) {
            try {
                const token = localStorage.getItem('token');
                await axios.patch(`/api/notifications/${notification.id}/read`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch (error) {
                console.error('Failed to mark as read:', error);
            }
        }

        const link = getNotificationLink(notification);
        setNotificationsOpen(false); // Close dropdown
        if (link && link !== '#') {
            navigate(link);
        } else {
            // Default to list if no link
            navigate('/dashboard/notifications');
        }
    };

    const isActive = (href, exact = false, exclude = []) => {
        if (activeSidebarOverride) {
            return activeSidebarOverride === href
        }
        if (exclude && exclude.length > 0) {
            if (exclude.some(path => location.pathname.startsWith(path))) {
                return false
            }
        }
        if (exact) return location.pathname === href
        return location.pathname.startsWith(href)
    }

    return (
        <div className="h-screen bg-darkBg flex overflow-hidden">
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:flex lg:flex-col w-64 h-screen border-r border-white/10 bg-cardBg flex-shrink-0 sticky top-0">
                {/* Logo */}
                <div className="h-16 flex items-center gap-2 px-6 border-b border-white/10 flex-shrink-0">
                    <img src="/logo.png" alt="BikinLiga" className="h-7" />
                    <span className="font-display font-bold text-xl">
                        Bikin<span className="text-neonPink">Liga</span>
                    </span>
                </div>

                {/* Navigation (Scrollable) */}
                <nav className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-2">
                    {sidebarLinks.map((link) => (
                        <NavLink
                            key={link.href}
                            to={link.href}
                            end={link.exact}
                            className={() => {
                                const active = isActive(link.href, link.exact, link.exclude)
                                return `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${active
                                    ? 'bg-neonGreen/10 text-neonGreen border-l-2 border-neonGreen'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`
                            }}
                        >
                            <link.icon className="w-5 h-5" />
                            {link.name}
                        </NavLink>
                    ))}
                </nav>

                {/* Fixed Footer Content (Subscription + Actions) */}
                <div className="flex-shrink-0">
                    {/* Subscription Card */}
                    <div className="p-4 border-t border-white/10">
                        <div className={`bg-gradient-to-br ${subStyle.gradient} rounded-xl p-4 border ${subStyle.cardBorder} relative overflow-hidden`}>
                            {/* Decorative glow for premium tiers */}
                            {subscription?.plan !== 'free' && (
                                <div className={`absolute -top-10 -right-10 w-24 h-24 ${subStyle.bg} rounded-full blur-2xl opacity-50`}></div>
                            )}
                            <div className="relative flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <img src="/coin.png" alt="Coin" className="w-5 h-5" />
                                    <span className="font-display font-bold text-lg text-yellow-400">
                                        {Math.floor(wallet?.balance || 0).toLocaleString()}
                                    </span>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${subStyle.bg} ${subStyle.text} flex items-center gap-1`}>
                                    <subStyle.Icon className="w-3 h-3" />
                                    {subStyle.name}
                                </span>
                            </div>
                            <Link
                                to="/dashboard/topup"
                                className={`relative block w-full text-center py-2 rounded-lg bg-gradient-to-r ${subStyle.buttonGradient} text-black text-sm font-bold hover:opacity-90 transition`}
                            >
                                {subscription?.plan === 'free' ? 'Upgrade' : 'Top Up'}
                            </Link>
                        </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="p-4 border-t border-white/10 space-y-2">
                        {(user?.role === 'admin' || user?.role === 'superadmin') && (
                            <Link
                                to="/admin"
                                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition"
                            >
                                <Shield className="w-5 h-5" />
                                Admin Panel
                            </Link>
                        )}
                        <Link
                            to="/dashboard/settings"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${location.pathname === '/dashboard/settings'
                                ? 'bg-neonGreen/10 text-neonGreen border-l-2 border-neonGreen'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <Settings className="w-5 h-5" />
                            Pengaturan
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-red-400 transition"
                        >
                            <LogOut className="w-5 h-5" />
                            Keluar
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-40 bg-black/60"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar - Mobile */}
            <aside className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-cardBg border-r border-white/10 transform transition-transform duration-300 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Mobile Header */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="BikinLiga" className="h-7" />
                        <span className="font-display font-bold text-xl">
                            Bikin<span className="text-neonPink">Liga</span>
                        </span>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="p-2 text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Mobile Navigation (Scrollable) */}
                <nav className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-2">
                    {sidebarLinks.map((link) => (
                        <NavLink
                            key={link.href}
                            to={link.href}
                            end={link.exact}
                            onClick={() => setSidebarOpen(false)}
                            className={() => {
                                const active = isActive(link.href, link.exact, link.exclude)
                                return `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${active
                                    ? 'bg-neonGreen/10 text-neonGreen border-l-2 border-neonGreen'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`
                            }}
                        >
                            <link.icon className="w-5 h-5" />
                            {link.name}
                        </NavLink>
                    ))}
                </nav>

                {/* Mobile Fixed Footer Actions */}
                <div className="flex-shrink-0">
                    <div className="p-4 border-t border-white/10 space-y-2">
                        {(user?.role === 'admin' || user?.role === 'superadmin') && (
                            <Link
                                to="/admin"
                                onClick={() => setSidebarOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition"
                            >
                                <Shield className="w-5 h-5" />
                                Admin Panel
                            </Link>
                        )}
                        <Link
                            to="/dashboard/settings"
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${location.pathname === '/dashboard/settings'
                                ? 'bg-neonGreen/10 text-neonGreen border-l-2 border-neonGreen'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <Settings className="w-5 h-5" />
                            Pengaturan
                        </Link>
                        <button
                            onClick={() => { setSidebarOpen(false); handleLogout(); }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-red-400 transition"
                        >
                            <LogOut className="w-5 h-5" />
                            Keluar
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                {/* Top Header */}
                <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-white/10 bg-cardBg/80 backdrop-blur-sm flex-shrink-0 z-30">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    {/* Breadcrumb */}
                    <div className="hidden lg:flex items-center gap-2 text-sm text-gray-400">
                        <Link to="/dashboard" className="hover:text-white transition">Dashboard</Link>
                        {location.pathname !== '/dashboard' && (
                            <>
                                <ChevronRight className="w-4 h-4" />
                                <span className="text-white capitalize">
                                    {location.pathname.split('/').pop().replace('-', ' ') || 'Overview'}
                                </span>
                            </>
                        )}
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center gap-4">
                        {/* Virtual Coins */}
                        <Link
                            to="/dashboard/topup"
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 transition"
                        >
                            <img src="/coin.png" alt="Coin" className="w-5 h-5" />
                            <span className="font-display font-bold text-yellow-400">
                                {Math.floor(wallet?.balance || 0).toLocaleString()}
                            </span>
                        </Link>

                        {/* Notification Bell */}
                        <div className="relative">
                            <button
                                onClick={() => setNotificationsOpen(!notificationsOpen)}
                                className="text-gray-400 hover:text-white transition relative mr-2 p-1 rounded-full hover:bg-white/5"
                            >
                                <Bell className="w-6 h-6" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-neonPink border-2 border-cardBg flex items-center justify-center"></span>
                                )}
                            </button>

                            {/* Dropdown */}
                            {notificationsOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40 bg-black/50 md:bg-transparent"
                                        onClick={() => setNotificationsOpen(false)}
                                    ></div>
                                    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 pointer-events-none md:block md:static md:p-0">
                                        <div className="w-[90vw] max-w-sm bg-cardBg border border-white/10 rounded-xl shadow-xl overflow-hidden pointer-events-auto md:absolute md:top-full md:left-auto md:right-0 md:w-80 md:mt-2">
                                            <div className="p-3 border-b border-white/10 flex items-center justify-between bg-white/5">
                                                <h3 className="font-medium text-white">Notifikasi</h3>
                                                <span
                                                    onClick={handleMarkAllRead}
                                                    className="text-xs text-neonPink cursor-pointer hover:underline"
                                                >
                                                    Tandai dibaca
                                                </span>
                                            </div>
                                            <div className="max-h-96 overflow-y-auto">
                                                {notifications.length === 0 ? (
                                                    <div className="p-4 text-center text-gray-500 text-xs">Tidak ada notifikasi</div>
                                                ) : (
                                                    notifications.map((notification) => (
                                                        <div
                                                            key={notification.id}
                                                            onClick={() => handleNotificationClick(notification)}
                                                            className={`p-4 border-b border-white/5 hover:bg-white/5 transition cursor-pointer ${!notification.is_read ? 'bg-white/[0.02]' : ''}`}
                                                        >
                                                            <div className="flex justify-between items-start mb-1">
                                                                <h4 className={`text-sm font-medium ${!notification.is_read ? 'text-white' : 'text-gray-400'}`}>
                                                                    {notification.title}
                                                                </h4>
                                                                {/* Helper to format time relative or just display raw if helper missing in layout */}
                                                                <span className="text-[10px] text-gray-500">Baru saja</span>
                                                            </div>
                                                            <p className="text-xs text-gray-400 line-clamp-2">
                                                                {notification.message}
                                                            </p>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                            <div className="p-2 text-center border-t border-white/10 bg-white/5">
                                                <button
                                                    onClick={() => {
                                                        setNotificationsOpen(false);
                                                        navigate('/dashboard/notifications');
                                                    }}
                                                    className="text-xs text-neonGreen hover:text-white transition"
                                                >
                                                    Lihat Semua
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                className="flex items-center gap-3 hover:bg-white/5 p-1 rounded-lg transition"
                            >
                                <div className="text-right hidden sm:block">
                                    <div className="text-sm font-medium">{user?.name || 'User'}</div>
                                    <div className="text-xs text-gray-500">{user?.email}</div>
                                </div>
                                {user?.avatar_url ? (
                                    <img
                                        src={user.avatar_url}
                                        alt={user.name}
                                        className="w-10 h-10 rounded-full object-cover border-2 border-neonGreen"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-neonGreen to-neonPink flex items-center justify-center text-black font-bold">
                                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                )}
                            </button>

                            {/* Profile Dropdown */}
                            {profileDropdownOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40 bg-black/50 md:bg-transparent"
                                        onClick={() => setProfileDropdownOpen(false)}
                                    ></div>
                                    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 pointer-events-none md:block md:static md:p-0">
                                        <div className="w-[90vw] max-w-sm bg-cardBg border border-white/10 rounded-xl shadow-xl overflow-hidden pointer-events-auto md:absolute md:top-full md:right-0 md:w-56 md:mt-2">
                                            {/* Mobile User Info Header */}
                                            <div className="p-4 border-b border-white/10 flex items-center gap-3 md:hidden bg-white/5">
                                                {user?.avatar_url ? (
                                                    <img
                                                        src={user.avatar_url}
                                                        alt={user.name}
                                                        className="w-10 h-10 rounded-full object-cover border-2 border-neonGreen"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-neonGreen to-neonPink flex items-center justify-center text-black font-bold">
                                                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="text-sm font-medium text-white">{user?.name || 'User'}</div>
                                                    <div className="text-xs text-gray-400">{user?.email}</div>
                                                </div>
                                            </div>

                                            <div className="p-2 space-y-1">
                                                <Link
                                                    to="/dashboard/my-profile"
                                                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition"
                                                    onClick={() => setProfileDropdownOpen(false)}
                                                >
                                                    <User className="w-4 h-4" />
                                                    My Profile
                                                </Link>
                                                <Link
                                                    to="/dashboard/settings?tab=password"
                                                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition"
                                                    onClick={() => setProfileDropdownOpen(false)}
                                                >
                                                    <Key className="w-4 h-4" />
                                                    Change Password
                                                </Link>
                                                <div className="h-px bg-white/10 my-1"></div>
                                                <button
                                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-white/5 transition"
                                                    onClick={() => { setProfileDropdownOpen(false); handleLogout(); }}
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    Log Out
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-8 overflow-y-auto overflow-x-hidden">
                    <Outlet context={{ setActiveSidebarOverride }} />
                </main>

                {/* AI Chat Widget */}
                <ChatWidget />
            </div>
        </div>
    )
}
