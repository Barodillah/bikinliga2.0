import React, { useState } from 'react'
import { Trophy, Medal, Star, TrendingUp, Shield, Gamepad2, Swords, Calendar } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AdSlot from '../../components/ui/AdSlot'
import Modal from '../../components/ui/Modal'

const MOCK_RANKINGS = [
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
        recentMatches: ['Win', 'Win', 'Lose', 'Win', 'Win']
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
        recentMatches: ['Win', 'Lose', 'Win', 'Win', 'Lose']
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
        recentMatches: ['Lose', 'Win', 'Win', 'Lose', 'Win']
    },
    {
        id: 4,
        name: 'Windah Basudara',
        username: '@windah',
        team: 'RRQ',
        points: 1950,
        totalTournaments: 10,
        winRate: '65%',
        avatar: 'https://ui-avatars.com/api/?name=Windah+Basudara&background=random'
    },
    {
        id: 5,
        name: 'Lemon',
        username: '@lemon',
        team: 'RRQ Hoshi',
        points: 1800,
        totalTournaments: 12,
        winRate: '60%',
        avatar: 'https://ui-avatars.com/api/?name=Lemon&background=random'
    },
    {
        id: 6,
        name: 'Oura',
        username: '@oura',
        team: 'GPX',
        points: 1750,
        totalTournaments: 11,
        winRate: '62%',
        avatar: 'https://ui-avatars.com/api/?name=Oura&background=random'
    },
    {
        id: 7,
        name: 'Donkey',
        username: '@donkey',
        team: 'GPX',
        points: 1600,
        totalTournaments: 9,
        winRate: '58%',
        avatar: 'https://ui-avatars.com/api/?name=Donkey&background=random'
    },
    {
        id: 8,
        name: 'Marsha',
        username: '@marsha',
        team: 'GPX',
        points: 1550,
        totalTournaments: 10,
        winRate: '55%',
        avatar: 'https://ui-avatars.com/api/?name=Marsha&background=random'
    }
]

export default function Ranking() {
    const topThree = MOCK_RANKINGS.slice(0, 3)
    const restOfPlayers = MOCK_RANKINGS.slice(3)
    const navigate = useNavigate()
    const [selectedPlayer, setSelectedPlayer] = useState(null)

    const handleProfileClick = (username) => {
        // Remove @ if present for the URL, though preserving it is also fine but cleanliness helps
        const cleanUsername = username.replace('@', '')
        navigate(`/dashboard/profile/${cleanUsername}`)
    }

    const getRankStyle = (index) => {
        switch (index) {
            case 0:
                return {
                    bg: 'bg-gradient-to-b from-yellow-400/20 to-yellow-600/5',
                    border: 'border-yellow-500/50',
                    text: 'text-yellow-400',
                    icon: <Trophy className="w-8 h-8 text-yellow-400 mb-2" />,
                    badge: 'bg-yellow-500/20 text-yellow-400'
                }
            case 1:
                return {
                    bg: 'bg-gradient-to-b from-gray-300/20 to-gray-500/5',
                    border: 'border-gray-400/50',
                    text: 'text-gray-300',
                    icon: <Medal className="w-8 h-8 text-gray-300 mb-2" />,
                    badge: 'bg-gray-400/20 text-gray-300'
                }
            case 2:
                return {
                    bg: 'bg-gradient-to-b from-orange-400/20 to-orange-600/5',
                    border: 'border-orange-500/50',
                    text: 'text-orange-400',
                    icon: <Medal className="w-8 h-8 text-orange-400 mb-2" />,
                    badge: 'bg-orange-500/20 text-orange-400'
                }
            default:
                return {}
        }
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 px-2 sm:px-0">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">Global Rankings</h1>
                <p className="text-sm md:text-base text-gray-400">Peringkat pemain berdasarkan akumulasi poin dari semua turnamen.</p>
            </div>

            {/* Top 3 Podium */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 items-end mb-8 md:mb-12">
                {/* 2nd Place */}
                <div
                    onClick={() => setSelectedPlayer(topThree[1])}
                    className={`order-1 relative rounded-xl md:rounded-2xl p-0.5 md:p-1 border backdrop-blur-sm cursor-pointer transition-transform active:scale-95 hover:bg-white/5 ${getRankStyle(1).bg} ${getRankStyle(1).border}`}
                >
                    <div className="absolute -top-3 md:-top-4 left-1/2 -translate-x-1/2">
                        <Medal className="w-5 h-5 md:w-8 md:h-8 text-gray-300" />
                    </div>
                    <div className="p-2 sm:p-4 md:p-6 text-center pt-5 md:pt-8">
                        <div className="relative inline-block mb-2 md:mb-4">
                            <img
                                src={topThree[1].avatar}
                                alt={topThree[1].name}
                                className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full border-2 md:border-4 border-gray-400 shadow-lg shadow-gray-400/20"
                            />
                            <div className="absolute -bottom-1 md:-bottom-2 left-1/2 -translate-x-1/2 px-1.5 md:px-3 py-0.5 md:py-1 bg-gray-800 rounded-full text-[10px] md:text-xs font-bold border border-gray-600">
                                #2
                            </div>
                        </div>
                        <h3 className="text-xs sm:text-sm md:text-xl font-bold text-white mb-0.5 md:mb-1 truncate">{topThree[1].name}</h3>
                        <p className="text-[10px] md:text-sm text-gray-400 mb-1 md:mb-3 truncate">{topThree[1].team}</p>
                        <div className="flex items-center justify-center gap-1 md:gap-2">
                            <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm sm:text-lg md:text-2xl font-display font-bold text-white">{topThree[1].points}</span>
                        </div>
                        <span className="text-[10px] md:text-xs text-gray-500">pts</span>
                    </div>
                </div>

                {/* 1st Place */}
                <div
                    onClick={() => setSelectedPlayer(topThree[0])}
                    className={`order-2 relative rounded-xl md:rounded-2xl p-0.5 md:p-1 border md:scale-110 z-10 backdrop-blur-sm cursor-pointer transition-transform active:scale-95 hover:bg-white/5 ${getRankStyle(0).bg} ${getRankStyle(0).border}`}
                >
                    <div className="absolute -top-4 md:-top-6 left-1/2 -translate-x-1/2">
                        <Trophy className="w-6 h-6 md:w-8 md:h-8 text-yellow-400" />
                    </div>
                    <div className="p-2 sm:p-4 md:p-8 text-center pt-6 md:pt-10">
                        <div className="relative inline-block mb-2 md:mb-4">
                            <img
                                src={topThree[0].avatar}
                                alt={topThree[0].name}
                                className="w-14 h-14 sm:w-18 sm:h-18 md:w-24 md:h-24 rounded-full border-2 md:border-4 border-yellow-400 shadow-lg shadow-yellow-400/20"
                            />
                            <div className="absolute -bottom-1.5 md:-bottom-3 left-1/2 -translate-x-1/2 px-2 md:px-4 py-0.5 md:py-1.5 bg-yellow-600 rounded-full text-[10px] md:text-sm font-bold border border-yellow-400 text-white shadow-lg">
                                #1
                            </div>
                        </div>
                        <h3 className="text-sm sm:text-base md:text-2xl font-bold text-white mb-0.5 md:mb-1 truncate">{topThree[0].name}</h3>
                        <p className="text-[10px] md:text-sm text-gray-400 mb-2 md:mb-4 truncate">{topThree[0].team}</p>
                        <div className="flex items-center justify-center gap-1 md:gap-2 mb-1 md:mb-2">
                            <Star className="w-3 h-3 md:w-5 md:h-5 text-yellow-500 fill-yellow-500" />
                            <span className="text-lg sm:text-xl md:text-3xl font-display font-bold text-white">{topThree[0].points}</span>
                        </div>
                        <span className="text-[10px] md:text-sm text-gray-500">pts</span>
                        <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 mt-2 rounded-full bg-white/10 text-xs text-gray-300">
                            <TrendingUp className="w-3 h-3 text-neonGreen" />
                            <span>{topThree[0].winRate} Win Rate</span>
                        </div>
                    </div>
                </div>

                {/* 3rd Place */}
                <div
                    onClick={() => setSelectedPlayer(topThree[2])}
                    className={`order-3 relative rounded-xl md:rounded-2xl p-0.5 md:p-1 border backdrop-blur-sm cursor-pointer transition-transform active:scale-95 hover:bg-white/5 ${getRankStyle(2).bg} ${getRankStyle(2).border}`}
                >
                    <div className="absolute -top-3 md:-top-4 left-1/2 -translate-x-1/2">
                        <Medal className="w-5 h-5 md:w-8 md:h-8 text-orange-400" />
                    </div>
                    <div className="p-2 sm:p-4 md:p-6 text-center pt-5 md:pt-8">
                        <div className="relative inline-block mb-2 md:mb-4">
                            <img
                                src={topThree[2].avatar}
                                alt={topThree[2].name}
                                className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full border-2 md:border-4 border-orange-400 shadow-lg shadow-orange-400/20"
                            />
                            <div className="absolute -bottom-1 md:-bottom-2 left-1/2 -translate-x-1/2 px-1.5 md:px-3 py-0.5 md:py-1 bg-gray-800 rounded-full text-[10px] md:text-xs font-bold border border-gray-600">
                                #3
                            </div>
                        </div>
                        <h3 className="text-xs sm:text-sm md:text-xl font-bold text-white mb-0.5 md:mb-1 truncate">{topThree[2].name}</h3>
                        <p className="text-[10px] md:text-sm text-gray-400 mb-1 md:mb-3 truncate">{topThree[2].team}</p>
                        <div className="flex items-center justify-center gap-1 md:gap-2">
                            <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm sm:text-lg md:text-2xl font-display font-bold text-white">{topThree[2].points}</span>
                        </div>
                        <span className="text-[10px] md:text-xs text-gray-500">pts</span>
                    </div>
                </div>
            </div>

            {/* Ad Slot Injection */}
            <AdSlot variant="banner" className="mb-6 md:mb-8" />

            {/* Ranking List - Table for Desktop */}
            <div className="hidden md:block bg-cardBg border border-white/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                                <th className="p-4 text-sm font-medium text-gray-400">Rank</th>
                                <th className="p-4 text-sm font-medium text-gray-400">Player</th>
                                <th className="p-4 text-sm font-medium text-gray-400 text-center">Tournaments</th>
                                <th className="p-4 text-sm font-medium text-gray-400 text-center">Win Rate</th>
                                <th className="p-4 text-sm font-medium text-gray-400 text-right">Points</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {restOfPlayers.map((player, index) => (
                                <tr
                                    key={player.id}
                                    className="hover:bg-white/5 transition cursor-pointer"
                                    onClick={() => handleProfileClick(player.username)}
                                >
                                    <td className="p-4 text-gray-400 font-medium">#{index + 4}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={player.avatar}
                                                alt={player.name}
                                                className="w-10 h-10 rounded-lg object-cover"
                                            />
                                            <div>
                                                <div className="font-bold text-white">{player.name}</div>
                                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                                    <Shield className="w-3 h-3" />
                                                    {player.team}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-300 text-center">{player.totalTournaments}</td>
                                    <td className="p-4 text-center">
                                        <span className="px-2 py-1 rounded-md bg-green-500/10 text-green-400 text-xs font-medium border border-green-500/20">
                                            {player.winRate}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <span className="font-display font-bold text-white">{player.points}</span>
                                        <span className="text-xs text-gray-500 ml-1">pts</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Ranking List - Cards for Mobile */}
            <div className="md:hidden space-y-3">
                {restOfPlayers.map((player, index) => (
                    <div
                        key={player.id}
                        className="bg-cardBg border border-white/10 rounded-xl p-3 hover:bg-white/5 transition cursor-pointer"
                        onClick={() => handleProfileClick(player.username)}
                    >
                        <div className="flex items-center gap-3">
                            {/* Rank Badge */}
                            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                <span className="text-sm font-bold text-gray-400">#{index + 4}</span>
                            </div>

                            {/* Avatar */}
                            <img
                                src={player.avatar}
                                alt={player.name}
                                className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                            />

                            {/* Player Info */}
                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-white text-sm truncate">{player.name}</div>
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                    <Shield className="w-3 h-3" />
                                    <span className="truncate">{player.team}</span>
                                </div>
                            </div>

                            {/* Points */}
                            <div className="flex-shrink-0 text-right">
                                <div className="font-display font-bold text-white text-lg">{player.points}</div>
                                <div className="text-[10px] text-gray-500">pts</div>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                            <div className="flex items-center gap-1">
                                <span className="text-xs text-gray-400">Turnamen:</span>
                                <span className="text-xs font-medium text-gray-300">{player.totalTournaments}</span>
                            </div>
                            <span className="px-2 py-0.5 rounded-md bg-green-500/10 text-green-400 text-xs font-medium border border-green-500/20">
                                {player.winRate} WR
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Player Detail Modal */}
            <Modal
                isOpen={!!selectedPlayer}
                onClose={() => setSelectedPlayer(null)}
                title="Player Statistics"
            >
                {selectedPlayer && (
                    <div className="space-y-6">
                        {/* Player Header */}
                        <div className="flex items-center gap-4">
                            <img
                                src={selectedPlayer.avatar}
                                alt={selectedPlayer.name}
                                className="w-20 h-20 rounded-full border-4 border-white/10"
                            />
                            <div>
                                <h4 className="text-xl font-bold text-white">{selectedPlayer.name}</h4>
                                <div className="text-neonGreen font-medium">{selectedPlayer.username}</div>
                                <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
                                    <Shield className="w-4 h-4" />
                                    {selectedPlayer.team}
                                </div>
                            </div>
                        </div>

                        {/* Main Stats */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <div className="flex items-center gap-2 text-gray-400 mb-2">
                                    <Star className="w-4 h-4 text-yellow-500" />
                                    <span className="text-sm">Total Points</span>
                                </div>
                                <div className="text-2xl font-display font-bold text-white">{selectedPlayer.points}</div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <div className="flex items-center gap-2 text-gray-400 mb-2">
                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                    <span className="text-sm">Win Rate</span>
                                </div>
                                <div className="text-2xl font-display font-bold text-white">{selectedPlayer.winRate}</div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <div className="flex items-center gap-2 text-gray-400 mb-2">
                                    <Trophy className="w-4 h-4 text-orange-500" />
                                    <span className="text-sm">Tournaments</span>
                                </div>
                                <div className="text-2xl font-display font-bold text-white">{selectedPlayer.totalTournaments}</div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <div className="flex items-center gap-2 text-gray-400 mb-2">
                                    <Gamepad2 className="w-4 h-4 text-purple-500" />
                                    <span className="text-sm">Role</span>
                                </div>
                                <div className="text-lg font-display font-bold text-white">{selectedPlayer.role || 'Flex'}</div>
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div className="space-y-4">
                            <h5 className="text-white font-medium flex items-center gap-2">
                                <Swords className="w-4 h-4 text-red-500" />
                                Recent Performance
                            </h5>
                            <div className="flex gap-2">
                                {(selectedPlayer.recentMatches || ['Win', 'Win', 'Lose', 'Win', 'Win']).map((result, i) => (
                                    <div
                                        key={i}
                                        className={`flex-1 h-2 rounded-full ${result === 'Win' ? 'bg-green-500' : 'bg-red-500/50'
                                            }`}
                                        title={result}
                                    />
                                ))}
                            </div>
                            <div className="flex justify-between text-xs text-gray-400">
                                <span>Last 5 Matches</span>
                                <span>{(selectedPlayer.recentMatches || []).filter(r => r === 'Win').length * 20}% Win Rate</span>
                            </div>
                        </div>

                        {/* View Full Profile Button */}
                        <button
                            onClick={() => handleProfileClick(selectedPlayer.username)}
                            className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 transition text-white font-medium border border-white/10 flex items-center justify-center gap-2"
                        >
                            View Full Profile
                        </button>
                    </div>
                )}
            </Modal>
        </div>
    )
}
