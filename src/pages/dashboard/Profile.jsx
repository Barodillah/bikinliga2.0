import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Trophy, Medal, Star, Shield, Gamepad2, Calendar, Swords, ArrowLeft, Twitch, Instagram, Twitter, MessageCircle, AlertCircle, Loader2 } from 'lucide-react'
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

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true)
            setError(null)
            try {
                // If username starts with @, strip it
                const searchUsername = username.startsWith('@') ? username : username;

                const response = await authFetch(`/api/user/public/${searchUsername}`)
                const data = await response.json()

                if (!data.success) {
                    throw new Error(data.message || 'User not found')
                }

                setUser(data.data)
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
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-neonGreen" />
            </div>
        )
    }

    if (error || !user) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-white">Profil Tidak Ditemukan</h2>
                <p className="text-gray-400 max-w-md">
                    Pengguna dengan username <span className="text-white font-mono">{username}</span> tidak ditemukan atau tidak tersedia.
                </p>
                <Button onClick={() => navigate(-1)} icon={ArrowLeft}>
                    Kembali
                </Button>
            </div>
        )
    }

    return (
        <div className="w-full space-y-6">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition group"
            >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                Back
            </button>

            {/* Profile Header Card */}
            <div className="bg-cardBg border border-white/10 rounded-2xl p-6 md:p-8 relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-neonGreen/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
                    <img
                        src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random&size=150`}
                        alt={user.name}
                        className="w-32 h-32 rounded-full border-4 border-white/10 shadow-xl object-cover"
                    />

                    <div className="flex-1 text-center md:text-left space-y-2">
                        <div>
                            <h1 className="text-3xl font-display font-bold text-white">{user.name}</h1>
                            <p className="text-neonGreen text-lg font-medium">{user.username}</p>
                        </div>

                        <div className="flex flex-wrap justify-center md:justify-start gap-3 text-sm text-gray-400">

                            {/* User Tier Badge (if any) */}
                            <UserBadge tier={user.tier} showLabel={true} />

                            <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                <Shield className="w-4 h-4" />
                                {user.team}
                            </span>

                            {/* Default Role Badge (Only if no tier) */}
                            {(!user.tier || user.tier === 'free') && (
                                <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                    <Gamepad2 className="w-4 h-4" />
                                    {user.role || 'Player'}
                                </span>
                            )}

                            <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                <Calendar className="w-4 h-4" />
                                Joined {user.joinDate}
                            </span>
                        </div>

                        <p className="text-gray-300 max-w-xl mx-auto md:mx-0 mt-4 leading-relaxed">
                            {user.bio}
                        </p>

                        {/* Socials */}
                        <div className="flex justify-center md:justify-start gap-4 pt-2">
                            {user.socials?.twitch && (
                                <a href="#" className="text-gray-400 hover:text-[#9146FF] transition"><Twitch className="w-5 h-5" /></a>
                            )}
                            {user.socials?.instagram && (
                                <a href="#" className="text-gray-400 hover:text-[#E4405F] transition"><Instagram className="w-5 h-5" /></a>
                            )}
                            {user.socials?.twitter && (
                                <a href="#" className="text-gray-400 hover:text-[#1DA1F2] transition"><Twitter className="w-5 h-5" /></a>
                            )}
                        </div>
                    </div>

                    {/* Quick Stats Block (Desktop) */}
                    <div className="hidden md:flex flex-col gap-4 min-w-[150px]">
                        <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                            <div className="text-2xl font-display font-bold text-white">{user.points}</div>
                            <div className="text-xs text-gray-400">Total Points</div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                            <div className="text-2xl font-display font-bold text-neonGreen">{user.winRate}</div>
                            <div className="text-xs text-gray-400">Win Rate</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Stats Grid */}
            <div className="grid grid-cols-2 gap-3 md:hidden">
                <div className="bg-cardBg border border-white/10 rounded-xl p-4 text-center">
                    <div className="text-2xl font-display font-bold text-white">{user.points}</div>
                    <div className="text-xs text-gray-400">Total Points</div>
                </div>
                <div className="bg-cardBg border border-white/10 rounded-xl p-4 text-center">
                    <div className="text-2xl font-display font-bold text-neonGreen">{user.winRate}</div>
                    <div className="text-xs text-gray-400">Win Rate</div>
                </div>
            </div>

            {/* Ad Slot between Header and Content */}
            <AdSlot variant="banner" className="w-full" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Content Area */}
                <div className="md:col-span-2 space-y-6">
                    {/* Recent Matches */}
                    <div className="bg-cardBg border border-white/10 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Swords className="w-5 h-5 text-red-500" />
                            Recent Matches
                        </h3>
                        <div className="space-y-3">
                            {user.recentMatchesDetails?.length > 0 ? (
                                user.recentMatchesDetails.map((match, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-10 rounded-full ${match.result === 'Win' ? 'bg-green-500' :
                                                match.result === 'Draw' ? 'bg-yellow-500' : 'bg-red-500'
                                                }`} />
                                            <div>
                                                <div className="text-white font-medium">vs {match.opponent}</div>
                                                <div className="text-xs text-gray-500">{new Date(match.date).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${match.result === 'Win'
                                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                : match.result === 'Draw'
                                                    ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                }`}>
                                                {match.result.toUpperCase()}
                                            </span>
                                            <span className="text-xs font-mono text-gray-400">{match.score}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500 bg-white/5 rounded-lg border border-dashed border-white/10">
                                    Belum ada pertandingan yang dimainkan.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Achievements (Mock) */}
                    <div className="bg-cardBg border border-white/10 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-500" />
                            Achievements
                        </h3>
                        <div className="grid grid-cols-3 gap-2">
                            {[1, 2, 3].map((_, i) => (
                                <div key={i} className="aspect-square rounded-lg bg-white/5 flex items-center justify-center border border-white/5 hover:border-neonGreen/50 transition cursor-pointer group">
                                    <Medal className="w-6 h-6 text-gray-500 group-hover:text-neonGreen transition" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Joined Tournaments */}
                    <div className="bg-cardBg border border-white/10 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-neonPink" />
                                Kompetisi
                            </h3>
                            <span className="bg-white/10 text-white text-xs px-2 py-1 rounded-full">
                                {user.totalTournaments} Joined
                            </span>
                        </div>

                        <div className="space-y-3">
                            {user.joinedTournaments?.length > 0 ? (
                                user.joinedTournaments.map((t) => (
                                    <Link
                                        key={t.id}
                                        to={`/t/${t.slug}`}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition border border-white/5 group"
                                    >
                                        <img
                                            src={t.logo_url}
                                            alt={t.name}
                                            className="w-10 h-10 rounded object-contain bg-black/20 p-1"
                                            onError={(e) => {
                                                e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🏆</text></svg>'
                                            }}
                                        />
                                        <div className="overflow-hidden">
                                            <div className="text-sm font-medium text-white truncate group-hover:text-neonGreen transition">{t.name}</div>
                                            <div className="text-xs text-gray-500 capitalize">{t.type?.replace('_', ' ')}</div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="text-sm text-gray-500 text-center py-4">
                                    Belum mengikuti turnamen apapun.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
