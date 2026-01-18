import React from 'react'
import { Trophy, Medal, Star, TrendingUp, Shield } from 'lucide-react'
import AdSlot from '../../components/ui/AdSlot'

const MOCK_RANKINGS = [
    {
        id: 1,
        name: 'Budi Santoso',
        username: '@budigaming',
        team: 'RRQ Hoshi',
        points: 2450,
        totalTournaments: 15,
        winRate: '75%',
        avatar: 'https://ui-avatars.com/api/?name=Budi+Santoso&background=random&size=150'
    },
    {
        id: 2,
        name: 'Sarah Wijaya',
        username: '@sarahpros',
        team: 'EVOS Legends',
        points: 2300,
        totalTournaments: 14,
        winRate: '70%',
        avatar: 'https://ui-avatars.com/api/?name=Sarah+Wijaya&background=random&size=150'
    },
    {
        id: 3,
        name: 'Reza Arap',
        username: '@ybrap',
        team: 'Morph Team',
        points: 2150,
        totalTournaments: 12,
        winRate: '68%',
        avatar: 'https://ui-avatars.com/api/?name=Reza+Arap&background=random&size=150'
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
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-display font-bold text-white mb-2">Global Rankings</h1>
                <p className="text-gray-400">Peringkat pemain berdasarkan akumulasi poin dari semua turnamen.</p>
            </div>

            {/* Top 3 Podium */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mb-12">
                {/* 2nd Place */}
                <div className={`order-2 md:order-1 relative rounded-2xl p-1 border backdrop-blur-sm ${getRankStyle(1).bg} ${getRankStyle(1).border}`}>
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        {getRankStyle(1).icon}
                    </div>
                    <div className="p-6 text-center pt-8">
                        <div className="relative inline-block mb-4">
                            <img
                                src={topThree[1].avatar}
                                alt={topThree[1].name}
                                className="w-20 h-20 rounded-full border-4 border-gray-400 shadow-lg shadow-gray-400/20"
                            />
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-800 rounded-full text-xs font-bold border border-gray-600">
                                #2
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">{topThree[1].name}</h3>
                        <p className="text-sm text-gray-400 mb-3">{topThree[1].team}</p>
                        <div className="flex items-center justify-center gap-2">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-2xl font-display font-bold text-white">{topThree[1].points}</span>
                            <span className="text-xs text-gray-500">pts</span>
                        </div>
                    </div>
                </div>

                {/* 1st Place */}
                <div className={`order-1 md:order-2 relative rounded-2xl p-1 border scale-110 z-10 backdrop-blur-sm ${getRankStyle(0).bg} ${getRankStyle(0).border}`}>
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                        {getRankStyle(0).icon}
                    </div>
                    <div className="p-8 text-center pt-10">
                        <div className="relative inline-block mb-4">
                            <img
                                src={topThree[0].avatar}
                                alt={topThree[0].name}
                                className="w-24 h-24 rounded-full border-4 border-yellow-400 shadow-lg shadow-yellow-400/20"
                            />
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-yellow-600 rounded-full text-sm font-bold border border-yellow-400 text-white shadow-lg">
                                #1
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-1">{topThree[0].name}</h3>
                        <p className="text-sm text-gray-400 mb-4">{topThree[0].team}</p>
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                            <span className="text-3xl font-display font-bold text-white">{topThree[0].points}</span>
                            <span className="text-sm text-gray-500">pts</span>
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs text-gray-300">
                            <TrendingUp className="w-3 h-3 text-neonGreen" />
                            <span>{topThree[0].winRate} Win Rate</span>
                        </div>
                    </div>
                </div>

                {/* 3rd Place */}
                <div className={`order-3 relative rounded-2xl p-1 border backdrop-blur-sm ${getRankStyle(2).bg} ${getRankStyle(2).border}`}>
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        {getRankStyle(2).icon}
                    </div>
                    <div className="p-6 text-center pt-8">
                        <div className="relative inline-block mb-4">
                            <img
                                src={topThree[2].avatar}
                                alt={topThree[2].name}
                                className="w-20 h-20 rounded-full border-4 border-orange-400 shadow-lg shadow-orange-400/20"
                            />
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-800 rounded-full text-xs font-bold border border-gray-600">
                                #3
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">{topThree[2].name}</h3>
                        <p className="text-sm text-gray-400 mb-3">{topThree[2].team}</p>
                        <div className="flex items-center justify-center gap-2">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-2xl font-display font-bold text-white">{topThree[2].points}</span>
                            <span className="text-xs text-gray-500">pts</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ad Slot Injection */}
            <AdSlot variant="banner" className="mb-8" />

            {/* Ranking List */}
            <div className="bg-cardBg border border-white/10 rounded-xl overflow-hidden">
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
                                <tr key={player.id} className="hover:bg-white/5 transition">
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
        </div>
    )
}
