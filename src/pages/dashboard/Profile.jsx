import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Trophy, Medal, Star, TrendingUp, Shield, Gamepad2, Calendar, Swords, ArrowLeft, Twitch, Instagram, Twitter } from 'lucide-react'
import AdSlot from '../../components/ui/AdSlot'

// Mock Data (Shared with Ranking for consistency)
const MOCK_USERS = [
    {
        id: 1,
        name: 'Budi Santoso',
        username: '@budigaming',
        team: 'RRQ Hoshi',
        points: 2450,
        totalTournaments: 15,
        winRate: '75%',
        avatar: 'https://ui-avatars.com/api/?name=Budi+Santoso&background=random&size=150',
        role: 'Jungler',
        recentMatches: ['Win', 'Win', 'Lose', 'Win', 'Win'],
        joinDate: 'January 2024',
        bio: 'Professional Mobile Legends Player for RRQ Hoshi. Focus on Jungler role. #VivaRRQ',
        socials: {
            twitch: 'budigaming',
            instagram: 'budigaming.official',
            twitter: 'budigaming'
        }
    },
    {
        id: 2,
        name: 'Sarah Wijaya',
        username: '@sarahpros',
        team: 'EVOS Legends',
        points: 2300,
        totalTournaments: 14,
        winRate: '70%',
        avatar: 'https://ui-avatars.com/api/?name=Sarah+Wijaya&background=random&size=150',
        role: 'Roamer',
        recentMatches: ['Win', 'Lose', 'Win', 'Win', 'Lose'],
        joinDate: 'February 2024',
        bio: 'Support main. Always ready to heal!',
        socials: {
            instagram: 'sarahpros'
        }
    },
    {
        id: 3,
        name: 'Reza Arap',
        username: '@ybrap',
        team: 'Morph Team',
        points: 2150,
        totalTournaments: 12,
        winRate: '68%',
        avatar: 'https://ui-avatars.com/api/?name=Reza+Arap&background=random&size=150',
        role: 'Gold Laner',
        recentMatches: ['Lose', 'Win', 'Win', 'Lose', 'Win'],
        joinDate: 'March 2024',
        bio: 'Gamer ganteng idaman.',
        socials: {
            youtube: 'yb'
        }
    },
    // Generic fallback for others
]

export default function Profile() {
    const { username } = useParams() // Get username from URL
    const navigate = useNavigate()

    // Find user based on username (remove @ for comparison if needed)
    const user = MOCK_USERS.find(u => u.username.replace('@', '') === username) || {
        // Fallback user if not found in top lists
        name: 'Unknown Player',
        username: `@${username}`,
        team: 'Free Agent',
        points: 0,
        totalTournaments: 0,
        winRate: '0%',
        avatar: `https://ui-avatars.com/api/?name=${username}&background=random`,
        role: 'Unknown',
        recentMatches: [],
        joinDate: 'Unknown',
        bio: 'This player has not set up their bio yet.',
        socials: {}
    }

    return (
        <div className="w-full space-y-6">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition group"
            >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                Back to Ranking
            </button>

            {/* Profile Header Card */}
            <div className="bg-cardBg border border-white/10 rounded-2xl p-6 md:p-8 relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-neonGreen/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
                    <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-32 h-32 rounded-full border-4 border-white/10 shadow-xl"
                    />

                    <div className="flex-1 text-center md:text-left space-y-2">
                        <div>
                            <h1 className="text-3xl font-display font-bold text-white">{user.name}</h1>
                            <p className="text-neonGreen text-lg font-medium">{user.username}</p>
                        </div>

                        <div className="flex flex-wrap justify-center md:justify-start gap-3 text-sm text-gray-400">
                            <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                <Shield className="w-4 h-4" />
                                {user.team}
                            </span>
                            <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                <Gamepad2 className="w-4 h-4" />
                                {user.role || 'Flex'}
                            </span>
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
                            {(user.recentMatches?.length > 0 ? user.recentMatches : ['Win', 'Lose', 'Win']).map((result, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-10 rounded-full ${result === 'Win' ? 'bg-green-500' : 'bg-red-500'}`} />
                                        <div>
                                            <div className="text-white font-medium">Ranked Match</div>
                                            <div className="text-xs text-gray-500">2 hours ago</div>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${result === 'Win'
                                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                        }`}>
                                        {result.toUpperCase()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
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


                </div>
            </div>
        </div>
    )
}
