import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
    Trophy, Medal, Star, Shield, Gamepad2, Calendar, Swords,
    ArrowLeft, Twitch, Instagram, Twitter, AlertCircle,
    Loader2, TrendingUp, MapPin, ExternalLink, Check,
    Crown, Coins, Gem, Users, UserPlus, Rocket, Mail
} from 'lucide-react'
import AdSlot from '../../components/ui/AdSlot'
import { authFetch } from '../../utils/api'
import Button from '../../components/ui/Button'
import UserBadge from '../../components/ui/UserBadge'

export default function Profile() {
    const { username } = useParams()
    const navigate = useNavigate()

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [user, setUser] = useState(null)
    const [mostGoal, setMostGoal] = useState(null)
    const [showAllMatches, setShowAllMatches] = useState(false)

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true)
            setError(null)
            try {
                // If username starts with @, strip it
                const searchUsername = username.startsWith('@') ? username.substring(1) : username;

                // Parallel Fetch: User Profile & Ranking Stats & Achievements & Most Goal
                const [profileRes, statsRes, achievementsRes, goalRes] = await Promise.all([
                    authFetch(`/api/user/public/${searchUsername}`),
                    fetch(`/api/rankings/user/${searchUsername}`),
                    fetch(`/api/achievements/user/${searchUsername}`),
                    fetch(`/api/rankings/user/${searchUsername}/most-goal`)
                ]);

                const profileData = await profileRes.json()
                const statsData = await statsRes.json()
                const achievementsData = await achievementsRes.json()
                const goalData = await goalRes.json()

                // Fetch face for most-goal player
                if (goalData.success && goalData.data) {
                    let faceUrl = 'https://www.efootballdb.com/img/players/player_noface.png';
                    try {
                        const faceRes = await fetch(`/api/external/player-face?q=${encodeURIComponent(goalData.data.name)}`);
                        if (faceRes.ok) {
                            const faceData = await faceRes.json();
                            if (faceData.status === true && faceData.data && faceData.data.length > 0) {
                                faceUrl = faceData.data[0].link;
                            }
                        }
                    } catch (e) { console.error('Failed to fetch face:', e); }
                    setMostGoal({ name: goalData.data.name, goals: goalData.data.goals, face: faceUrl });
                } else {
                    setMostGoal(null);
                }

                if (!profileData.success) {
                    throw new Error(profileData.message || 'User not found')
                }

                // Merge Data
                const mergedUser = {
                    ...profileData.data,
                    // Stats and History come from rankings API
                    stats: statsData.success ? statsData.stats : null,
                    history: statsData.success ? statsData.history : [],
                    achievements: achievementsData.success ? achievementsData.achievements : [],
                    // DO NOT overwrite recentMatchesDetails. It comes correctly from profileData.data
                }

                if (mergedUser.preferences && typeof mergedUser.preferences === 'string') {
                    try {
                        mergedUser.preferences = JSON.parse(mergedUser.preferences);
                    } catch (e) {
                        console.error('Failed to parse user preferences:', e);
                    }
                }

                setUser(mergedUser)
            } catch (err) {
                console.error('Fetch profile error:', err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        if (username) {
            fetchProfile()
        }
    }, [username])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-neonGreen/30 border-t-neonGreen rounded-full animate-spin"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <UserBadge tier="pro" size="sm" className="opacity-50" />
                    </div>
                </div>
            </div>
        )
    }

    if (error || !user) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
                <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                    <AlertCircle className="w-12 h-12 text-red-500" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white">Profil Tidak Ditemukan</h2>
                    <p className="text-gray-400 max-w-md mx-auto">
                        Pengguna <span className="text-white font-mono bg-white/10 px-2 py-0.5 rounded">@{username}</span> tidak dapat ditemukan.
                    </p>
                </div>
                <Button onClick={() => navigate(-1)} variant="outline" icon={ArrowLeft}>
                    Kembali
                </Button>
            </div>
        )
    }

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 pb-12">
            {/* Header Section */}
            <div className="relative">
                {/* Banner / Cover */}
                <div className="h-48 md:h-64 w-full rounded-2xl md:rounded-3xl overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-purple-900 to-black"></div>
                    <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                    {/* Floating Tier Icon Background */}
                    <div className="absolute -right-10 -top-10 opacity-10 rotate-12 transition-transform group-hover:scale-110 duration-700">
                        <Trophy className="w-64 h-64 text-white" />
                    </div>

                    <button
                        onClick={() => navigate(-1)}
                        className="absolute top-4 left-4 md:top-6 md:left-6 p-2 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white transition-all border border-white/10 z-20 group-btn"
                    >
                        <ArrowLeft className="w-5 h-5 group-btn-hover:-translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* Profile Info Layer */}
                <div className="px-4 md:px-8 relative -mt-20 md:-mt-24 z-10 flex flex-col md:flex-row items-end md:items-end gap-6">
                    {/* Avatar */}
                    <div className="relative group">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-cardBg bg-cardBg p-1 shadow-2xl relative z-10">
                            <img
                                src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random&size=150`}
                                alt={user.name}
                                className="w-full h-full rounded-full object-cover bg-gray-800"
                            />
                        </div>
                        {user.tier && (
                            <div className="absolute bottom-2 right-2 z-20 scale-110">
                                <UserBadge tier={user.tier} showLabel={false} size="lg" />
                            </div>
                        )}
                    </div>

                    {/* Basic Info */}
                    <div className="flex-1 text-center md:text-left pb-2 space-y-1">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                            <h1 className="text-3xl md:text-4xl font-display font-bold text-white shadow-sm">{user.name}</h1>
                            {user.tier && <UserBadge tier={user.tier} className="shadow-lg" />}
                        </div>
                        <p className="text-gray-300 font-medium flex items-center justify-center md:justify-start gap-2">
                            <span className="text-neonGreen">{user.username}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                            <span>{user.team || 'Free Agent'}</span>
                        </p>
                        {/* Bio & Socials */}
                        <div className="pt-3 flex flex-col md:flex-row gap-4 items-center md:items-start text-sm text-gray-400">
                            {user.bio && <p className="max-w-lg leading-relaxed">{user.bio}</p>}

                            <div className="flex gap-3">
                                {user.email && (
                                    <a href={`mailto:${user.email}`} className="p-2 rounded-lg bg-white/5 hover:bg-neonGreen/20 hover:text-neonGreen transition border border-white/5" title={user.email}>
                                        <Mail className="w-4 h-4" />
                                    </a>
                                )}
                                {(user.preferences?.twitch || user.socials?.twitch) && (
                                    <a href={`https://twitch.tv/${user.preferences?.twitch || user.socials?.twitch}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 hover:bg-[#9146FF]/20 hover:text-[#9146FF] transition border border-white/5">
                                        <Twitch className="w-4 h-4" />
                                    </a>
                                )}
                                {(user.preferences?.instagram || user.socials?.instagram) && (
                                    <a href={`https://instagram.com/${user.preferences?.instagram || user.socials?.instagram}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 hover:bg-[#E4405F]/20 hover:text-[#E4405F] transition border border-white/5">
                                        <Instagram className="w-4 h-4" />
                                    </a>
                                )}
                                {(user.preferences?.twitter || user.socials?.twitter) && (
                                    <a href={`https://twitter.com/${user.preferences?.twitter || user.socials?.twitter}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 hover:bg-[#1DA1F2]/20 hover:text-[#1DA1F2] transition border border-white/5">
                                        <Twitter className="w-4 h-4" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Action / Status */}
                    <div className="flex gap-3 pb-2 w-full md:w-auto justify-center">
                        <div className="flex flex-col items-center md:items-end gap-1">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-xs text-gray-300">Joined {user.joinDate || '2024'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 md:px-0">
                <StatCard
                    label="Total Points"
                    value={user.stats?.total_points || 0}
                    icon={Star}
                    color="text-yellow-400"
                    bg="bg-yellow-400/10"
                    trend="+12 this week"
                />
                {(user.preferences?.showWinRate !== false) && (
                    <StatCard
                        label="Win Rate"
                        value={`${user.stats?.win_rate || 0}%`}
                        icon={Trophy}
                        color="text-neonGreen"
                        bg="bg-neonGreen/10"
                    />
                )}
                <StatCard
                    label="Matches"
                    value={user.stats?.total_matches || 0}
                    icon={Gamepad2}
                    color="text-blue-400"
                    bg="bg-blue-400/10"
                />
                <StatCard
                    label="Goal Diff"
                    value={user.stats?.goal_difference || 0}
                    valueClassName={user.stats?.goal_difference > 0 ? "text-green-400" : "text-red-400"}
                    icon={Swords}
                    color="text-purple-400"
                    bg="bg-purple-400/10"
                />
            </div>

            {/* Main Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 md:px-0">

                {/* Left Column: Matches & Performance */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Performance Chart */}
                    <div className="bg-cardBg border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-display font-bold text-white text-lg flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-neonGreen" />
                                Performance History
                            </h3>
                            <select className="bg-black/20 border border-white/10 rounded-lg text-xs px-2 py-1 text-gray-400 outline-none">
                                <option>Current Season</option>
                                <option>All Time</option>
                            </select>
                        </div>

                        <div className="h-48 w-full bg-black/20 rounded-xl border border-white/5 p-4 relative">
                            {/* Chart Placeholder / Implementation */}
                            {user.history && user.history.length > 0 ? (
                                <div className="w-full h-full flex items-end justify-between px-2 gap-1 overflow-x-auto">
                                    {user.history.map((h, i) => {
                                        // Handle potential schema naming diffs
                                        const pointVal = h.points !== undefined ? h.points : (h.total_points || 0);
                                        const safePoints = Number(pointVal);

                                        const allValues = user.history.map(x => Number(x.points !== undefined ? x.points : (x.total_points || 0)));
                                        const maxPoints = Math.max(...allValues, 50); // Scale at least to 50

                                        let height = (safePoints / maxPoints) * 100;
                                        if (height < 4) height = 4; // Min height for visibility

                                        return (
                                            <div key={i} className="group relative flex flex-col items-center flex-1 min-w-[10px] h-full justify-end">
                                                <div
                                                    className="w-full max-w-[12px] md:max-w-[16px] bg-neonGreen/20 border-t-2 border-neonGreen rounded-t-sm transition-all hover:bg-neonGreen/50 relative"
                                                    style={{ height: `${height}%` }}
                                                >
                                                    {/* Tooltip */}
                                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 border border-white/10 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-20 shadow-xl">
                                                        <span className="font-bold text-neonGreen">{safePoints} pts</span>
                                                        <div className="text-[9px] text-gray-500 text-center">
                                                            {h.recorded_at ? new Date(h.recorded_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : '-'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-2">
                                    <TrendingUp className="w-8 h-8 opacity-20" />
                                    <span className="text-sm">Belum ada data history statistik</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Ad Slot */}
                    <AdSlot variant="banner" />

                    {/* Recent Matches Feed */}
                    {(user.preferences?.showRecentMatches !== false) && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-display font-bold text-white text-lg flex items-center gap-2">
                                    <Swords className="w-5 h-5 text-neonPink" />
                                    Recent Matches
                                </h3>
                                {user.recentMatchesDetails?.length > 5 && (
                                    <button
                                        className="text-xs text-neonGreen hover:underline"
                                        onClick={() => setShowAllMatches(prev => !prev)}
                                    >
                                        {showAllMatches ? 'Show Less' : `View All (${user.recentMatchesDetails.length})`}
                                    </button>
                                )}
                            </div>

                            <div className="space-y-3">
                                {user.recentMatchesDetails?.length > 0 ? (
                                    (showAllMatches ? user.recentMatchesDetails.slice(0, 10) : user.recentMatchesDetails.slice(0, 5)).map((match, i) => (
                                        <div key={i} className="group flex flex-col md:flex-row items-center justify-between p-4 rounded-xl bg-cardBg border border-white/5 hover:border-white/10 hover:bg-white/5 transition relative overflow-hidden">

                                            {/* Status Strip */}
                                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${match.result === 'Win' ? 'bg-green-500' : match.result === 'Draw' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>

                                            <div className="flex items-center gap-4 w-full md:w-auto mb-3 md:mb-0">
                                                <div className="w-12 h-12 rounded-lg bg-black/30 flex items-center justify-center border border-white/5 text-xs font-bold text-gray-500">
                                                    VS
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-white text-lg group-hover:text-neonPink transition">{match.opponent}</h4>
                                                    {match.tournamentName && (
                                                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mt-0.5">
                                                            <Trophy className="w-3 h-3 text-yellow-500/60" />
                                                            <Link to={`/t/${match.tournamentSlug}`} className="hover:text-neonGreen transition truncate max-w-[180px]" onClick={e => e.stopPropagation()}>
                                                                {match.tournamentName}
                                                            </Link>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(match.date).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                                <div className="text-right">
                                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-1 ${match.result === 'Win' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                        match.result === 'Draw' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                                            'bg-red-500/10 text-red-400 border border-red-500/20'
                                                        }`}>
                                                        {match.result}
                                                    </span>
                                                </div>
                                                <div className="text-2xl font-display font-bold text-white tracking-widest bg-black/20 px-3 py-1 rounded-lg border border-white/5">
                                                    {match.score}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 rounded-xl bg-white/5 border border-dashed border-white/10">
                                        <Swords className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                                        <p className="text-gray-400">Belum ada history pertandingan</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Sidebar */}
                <div className="space-y-8">

                    {/* Most Goal Played */}
                    {mostGoal && (
                        <div className="bg-cardBg border border-white/10 rounded-2xl p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Gamepad2 className="w-5 h-5 text-purple-500" />
                                <h3 className="font-display font-bold text-white text-lg">Most Goal Played</h3>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-purple-500/50 bg-black flex-shrink-0">
                                    <img
                                        src={mostGoal.face}
                                        alt={mostGoal.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.src = 'https://www.efootballdb.com/img/players/player_noface.png' }}
                                    />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-base font-bold text-white truncate">{mostGoal.name}</div>
                                    <div className="text-sm text-purple-400 font-medium">{mostGoal.goals} goals</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Achievements */}
                    <div className="bg-cardBg border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-display font-bold text-white text-lg flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-yellow-500" />
                                Achievements
                            </h3>
                            <span className="text-xs text-gray-500">
                                {user.achievements?.filter(a => a.unlocked_at).length || 0} unlocked
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {user.achievements && user.achievements.filter(a => a.unlocked_at && a.is_showcased).length > 0 ? (
                                user.achievements.filter(a => a.unlocked_at && a.is_showcased).map((achievement) => {
                                    const isShowcased = !!achievement.is_showcased;
                                    // Map icon string to Lucide component if possible, else default
                                    const IconComponent = {
                                        'Trophy': Trophy,
                                        'Medal': Medal,
                                        'Star': Star,
                                        'Shield': Shield,
                                        'Target': Swords,
                                        'Check': Check,
                                        'Crown': Crown,
                                        'Coins': Coins,
                                        'Gem': Gem,
                                        'CheckCircle': Check,
                                        'Users': Users,
                                        'UserPlus': UserPlus,
                                        'Rocket': Rocket
                                    }[achievement.icon] || Medal;

                                    const colorMap = {
                                        tournament: {
                                            text: 'text-yellow-400',
                                            border: 'border-yellow-500/50',
                                            shadow: 'shadow-yellow-500/50',
                                            iconBg: 'bg-yellow-500/20',
                                            gradient: 'from-yellow-500/20 to-yellow-500/5',
                                            shadowColor: '#eab308'
                                        },
                                        match: {
                                            text: 'text-red-500',
                                            border: 'border-red-500/50',
                                            shadow: 'shadow-red-500/50',
                                            iconBg: 'bg-red-500/20',
                                            gradient: 'from-red-500/20 to-red-500/5',
                                            shadowColor: '#ef4444'
                                        },
                                        social: {
                                            text: 'text-blue-400',
                                            border: 'border-blue-500/50',
                                            shadow: 'shadow-blue-500/50',
                                            iconBg: 'bg-blue-500/20',
                                            gradient: 'from-blue-500/20 to-blue-500/5',
                                            shadowColor: '#3b82f6'
                                        },
                                        economy: {
                                            text: 'text-emerald-400',
                                            border: 'border-emerald-500/50',
                                            shadow: 'shadow-emerald-500/50',
                                            iconBg: 'bg-emerald-500/20',
                                            gradient: 'from-emerald-500/20 to-emerald-500/5',
                                            shadowColor: '#10b981'
                                        },
                                        membership: {
                                            text: 'text-purple-400',
                                            border: 'border-purple-500/50',
                                            shadow: 'shadow-purple-500/50',
                                            iconBg: 'bg-purple-500/20',
                                            gradient: 'from-purple-500/20 to-purple-500/5',
                                            shadowColor: '#a855f7'
                                        },
                                        special: {
                                            text: 'text-pink-400',
                                            border: 'border-pink-500/50',
                                            shadow: 'shadow-pink-500/50',
                                            iconBg: 'bg-pink-500/20',
                                            gradient: 'from-pink-500/20 to-pink-500/5',
                                            shadowColor: '#ec4899'
                                        },
                                        season: {
                                            text: 'text-cyan-400',
                                            border: 'border-cyan-500/50',
                                            shadow: 'shadow-cyan-500/50',
                                            iconBg: 'bg-cyan-500/20',
                                            gradient: 'from-cyan-500/20 to-cyan-500/5',
                                            shadowColor: '#06b6d4'
                                        },
                                        default: {
                                            text: 'text-gray-400',
                                            border: 'border-gray-500/50',
                                            shadow: 'shadow-gray-500/50',
                                            iconBg: 'bg-gray-500/20',
                                            gradient: 'from-gray-500/20 to-gray-500/5',
                                            shadowColor: '#6b7280'
                                        }
                                    };

                                    const colors = colorMap[achievement.category] || colorMap.default;

                                    return (
                                        <div
                                            key={achievement.id}
                                            className={`cursor-default border rounded-xl p-3 flex flex-col items-center gap-2 transition relative group hover:z-50
                                                ${isShowcased
                                                    ? `bg-gradient-to-br ${colors.gradient} via-black ${colors.border} shadow-[0_0_20px_-5px_var(--tw-shadow-color)] ${colors.shadow}`
                                                    : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
                                                }`}
                                            title={`${achievement.name}: ${achievement.description}`}
                                            style={isShowcased ? { '--tw-shadow-color': colors.shadowColor } : {}}
                                        >
                                            {/* Shine effect wrapper - contained within card bounds */}
                                            <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                                                {isShowcased && (
                                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-700 transform -translate-x-full group-hover:translate-x-full" />
                                                )}
                                            </div>

                                            <div className={`relative z-10 p-2 rounded-full ${isShowcased ? `${colors.iconBg} shadow-[0_0_10px_var(--tw-shadow-color)] ${colors.shadow}` : 'bg-white/5'}`}>
                                                <IconComponent className={`w-5 h-5 ${isShowcased ? `${colors.text} drop-shadow-[0_0_3px_currentColor]` : 'text-gray-400'} transition`} />
                                            </div>

                                            <div className="relative z-10 text-center w-full">
                                                <div className={`text-xs font-bold line-clamp-1 ${isShowcased ? `${colors.text} drop-shadow-[0_0_2px_currentColor]` : 'text-white'}`}>{achievement.name}</div>
                                                <div className="text-[9px] text-gray-400 mt-0.5 font-mono opacity-80">
                                                    {new Date(achievement.unlocked_at).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric', year: '2-digit' })}
                                                </div>
                                            </div>

                                            {/* Tooltip on hover - Outside overflow-hidden */}
                                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-gray-900 border border-white/10 p-2 rounded-lg text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition z-50 shadow-xl">
                                                <div className="font-bold text-white mb-1">{achievement.name}</div>
                                                <div className="text-gray-400">{achievement.description}</div>
                                                {achievement.unlocked_at && <div className={`${colors.text} mt-1 text-[10px]`}>Unlocked: {new Date(achievement.unlocked_at).toLocaleDateString()}</div>}
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="col-span-3 text-center text-gray-500 text-xs italic py-4">
                                    No achievements available
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Joined Competitions */}
                    {(user.preferences?.showRecentTournaments !== false) && (
                        <div className="bg-cardBg border border-white/10 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-display font-bold text-white text-lg flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-blue-400" />
                                    Competitions
                                </h3>
                                <span className="bg-blue-500/20 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-500/30">
                                    {user.totalTournaments || 0} Active
                                </span>
                            </div>

                            <div className="space-y-3">
                                {user.joinedTournaments?.length > 0 ? (
                                    user.joinedTournaments.map((t) => (
                                        <Link key={t.id} to={`/t/${t.slug}`} className="block group">
                                            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-blue-500/10 hover:border-blue-500/30 transition">
                                                <div className="w-10 h-10 rounded-lg bg-black/30 flex-shrink-0 flex items-center justify-center p-1">
                                                    <img
                                                        src={t.logo_url}
                                                        alt={t.name}
                                                        className="w-full h-full object-contain"
                                                        onError={e => e.target.src = 'https://via.placeholder.com/40?text=T'}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-bold text-white truncate group-hover:text-blue-300 transition">{t.name}</h4>
                                                    <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                                        <span className="capitalize">{t.type?.replace('_', ' ')}</span>
                                                        <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                                                        <span>{t.status}</span>
                                                    </div>
                                                </div>
                                                <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-blue-400 transition" />
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="text-center py-6">
                                        <p className="text-sm text-gray-500 italic">Not joined any tournaments yet.</p>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="mt-3 w-full border-dashed"
                                            onClick={() => navigate('/dashboard/competitions')}
                                        >
                                            Join Competition
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}

function StatCard({ label, value, icon: Icon, color, bg, trend, valueClassName }) {
    return (
        <div className="bg-cardBg border border-white/10 rounded-2xl p-4 md:p-5 flex flex-col justify-between hover:border-white/20 transition group">
            <div className="flex justify-between items-start mb-2">
                <div className={`p-2 rounded-lg ${bg} ${color}`}>
                    <Icon className="w-5 h-5" />
                </div>
                {trend && <span className="text-[10px] text-gray-400 font-mono">{trend}</span>}
            </div>
            <div>
                <div className={`text-2xl md:text-3xl font-display font-bold ${valueClassName || 'text-white'} mb-1`}>
                    {value}
                </div>
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</div>
            </div>
        </div>
    )
}
