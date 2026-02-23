import React, { useState } from 'react'
import { Trophy, Medal, Star, TrendingUp, Shield, Gamepad2, Swords, Loader2, Info, ArrowUp, ArrowDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AdSlot from '../../components/ui/AdSlot'
import Modal from '../../components/ui/Modal'
import UserBadge from '../../components/ui/UserBadge'

// Removed MOCK_RANKINGS
const MOCK_RANKINGS = []

export default function Ranking() {
    const [rankings, setRankings] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedPlayer, setSelectedPlayer] = useState(null)
    const navigate = useNavigate()

    React.useEffect(() => {
        const fetchRankings = async () => {
            try {
                const response = await fetch('/api/rankings')
                const json = await response.json()
                if (json.success) {
                    setRankings(json.data.map(item => ({
                        id: item.user_id,
                        name: item.name || item.username,
                        username: `@${item.username}`,
                        team: item.community_name || '-',
                        points: item.total_points,
                        totalTournaments: parseInt(item.total_matches) || 0, // Mapping Matches to "Tournaments" slot
                        winRate: `${item.win_rate}%`,
                        avatar: item.avatar_url || `https://ui-avatars.com/api/?name=${item.name || item.username}&background=random`,
                        role: '-',
                        tier: (item.tier_name || 'free').toLowerCase().replace(' ', '_'),
                        recentMatches: [], // Not fetched in list
                        rankChange: item.rankChange || 0
                    })))
                        .filter(item => item.totalTournaments > 0)
                }
            } catch (error) {
                console.error("Failed to fetch rankings:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchRankings()
    }, [])

    // Fetch detail when player selected (for recent matches/full stats)
    React.useEffect(() => {
        if (selectedPlayer && selectedPlayer.recentMatches.length === 0) {
            // Optional: Fetch detail specific stats here if needed, 
            // but for now we rely on the list data + maybe placeholder for recent
        }
    }, [selectedPlayer])


    const topThree = rankings.slice(0, 3)
    const restOfPlayers = rankings.slice(3)

    const handleProfileClick = (username) => {
        const cleanUsername = username.replace('@', '')
        navigate(`/dashboard/profile/${cleanUsername}`)
    }

    const handleDetailClick = async (player) => {
        setSelectedPlayer({ ...player, mostGoal: null });
        try {
            const cleanUsername = player.username.replace('@', '');

            // Fetch stats + most goal in parallel
            const [statsRes, goalRes] = await Promise.all([
                fetch(`/api/rankings/user/${cleanUsername}`),
                fetch(`/api/rankings/user/${cleanUsername}/most-goal`)
            ]);

            const statsData = await statsRes.json();
            const goalData = await goalRes.json();

            let mostGoal = null;
            if (goalData.success && goalData.data) {
                // Fetch face for the most-goal player
                let faceUrl = 'https://www.efootballdb.com/img/players/player_noface.png';
                try {
                    const faceRes = await fetch(`/api/external/player-face?q=${encodeURIComponent(goalData.data.name)}`);
                    if (faceRes.ok) {
                        const faceData = await faceRes.json();
                        if (faceData.status === true && faceData.data && faceData.data.length > 0) {
                            faceUrl = faceData.data[0].link;
                        }
                    }
                } catch (e) {
                    console.error("Failed to fetch face:", e);
                }
                mostGoal = { name: goalData.data.name, goals: goalData.data.goals, face: faceUrl };
            }

            setSelectedPlayer(prev => ({
                ...prev,
                recentMatches: statsData.success && statsData.recent_matches ? statsData.recent_matches : prev.recentMatches,
                totalTournaments: statsData.totalTournaments !== undefined ? statsData.totalTournaments : prev.totalTournaments,
                mostGoal
            }));
        } catch (err) {
            console.error("Failed to fetch player detail:", err);
        }
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

            {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="w-10 h-10 animate-spin text-neonGreen" />
                </div>
            ) : rankings.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4 bg-white/5 rounded-2xl border border-white/10 p-8">
                    <Trophy className="w-16 h-16 text-gray-600 mb-2" />
                    <h3 className="text-xl font-bold text-white">Belum Ada Data Ranking</h3>
                    <p className="text-gray-400 max-w-md">
                        Musim baru telah dimulai! Jadilah yang pertama menaiki papan peringkat dengan memenangkan turnamen.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 items-end mb-8 md:mb-12">
                    {/* 2nd Place */}
                    {topThree[1] ? (
                        <div
                            onClick={() => handleDetailClick(topThree[1])}
                            className={`order-1 relative rounded-xl md:rounded-2xl p-0.5 md:p-1 border backdrop-blur-sm cursor-pointer transition-transform active:scale-95 hover:bg-white/5 ${getRankStyle(1).bg} ${getRankStyle(1).border}`}
                        >
                            <div className="absolute -top-3 md:-top-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
                                <Medal className="w-5 h-5 md:w-8 md:h-8 text-gray-300" />
                            </div>
                            <div className="p-2 sm:p-4 md:p-6 text-center pt-5 md:pt-8">
                                <div className="relative inline-block mb-2 md:mb-4">
                                    <img
                                        src={topThree[1].avatar}
                                        alt={topThree[1].name}
                                        className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full border-2 md:border-4 border-gray-400 shadow-lg shadow-gray-400/20"
                                    />
                                    <div className="absolute -bottom-1 md:-bottom-2 left-1/2 -translate-x-1/2 px-1.5 md:px-3 py-0.5 md:py-1 bg-gray-800 rounded-full text-[10px] md:text-xs font-bold border border-gray-600 flex items-center gap-0.5">
                                        #2
                                        {topThree[1].rankChange < 0 ? (
                                            <ArrowDown className="w-2.5 h-2.5 md:w-3 md:h-3 text-red-500" />
                                        ) : topThree[1].rankChange > 0 ? (
                                            <ArrowUp className="w-2.5 h-2.5 md:w-3 md:h-3 text-green-500" />
                                        ) : null}
                                    </div>
                                </div>
                                <div className="flex items-center justify-center gap-1 mb-0.5 md:mb-1">
                                    <h3 className="text-xs sm:text-sm md:text-xl font-bold text-white truncate">{topThree[1].name}</h3>
                                    <div className="scale-75 origin-left">
                                        <UserBadge tier={topThree[1].tier} />
                                    </div>
                                </div>
                                <p className="text-[10px] md:text-sm text-gray-400 mb-1 md:mb-3 truncate">{topThree[1].team}</p>
                                <div className="flex items-center justify-center gap-1 md:gap-2">
                                    <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-500 fill-yellow-500" />
                                    <span className="text-sm sm:text-lg md:text-2xl font-display font-bold text-white">{topThree[1].points}</span>
                                    <span className="text-[10px] md:text-xs text-gray-500">pts</span>
                                </div>
                                <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 mt-2 rounded-full bg-white/10 text-xs text-gray-300">
                                    <TrendingUp className="w-3 h-3 text-neonGreen" />
                                    <span>{topThree[1].winRate} Win Rate</span>
                                </div>
                            </div>
                        </div>
                    ) : <div className="order-1" />}

                    {/* 1st Place */}
                    {topThree[0] ? (
                        <div
                            onClick={() => handleDetailClick(topThree[0])}
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
                                    <div className="absolute -bottom-1.5 md:-bottom-3 left-1/2 -translate-x-1/2 px-2 md:px-4 py-0.5 md:py-1.5 bg-yellow-600 rounded-full text-[10px] md:text-sm font-bold border border-yellow-400 text-white shadow-lg flex items-center gap-1">
                                        #1
                                        {topThree[0].rankChange < 0 ? (
                                            <ArrowDown className="w-3 h-3 md:w-4 md:h-4 text-red-300" strokeWidth={3} />
                                        ) : topThree[0].rankChange > 0 ? (
                                            <ArrowUp className="w-3 h-3 md:w-4 md:h-4 text-green-300" strokeWidth={3} />
                                        ) : null}
                                    </div>
                                </div>
                                <div className="flex items-center justify-center gap-1 mb-0.5 md:mb-1">
                                    <h3 className="text-sm sm:text-base md:text-2xl font-bold text-white truncate">{topThree[0].name}</h3>
                                    <UserBadge tier={topThree[0].tier} />
                                </div>
                                <p className="text-[10px] md:text-sm text-gray-400 mb-2 md:mb-4 truncate">{topThree[0].team}</p>
                                <div className="flex items-center justify-center gap-1 md:gap-2 mb-1 md:mb-2">
                                    <Star className="w-3 h-3 md:w-5 md:h-5 text-yellow-500 fill-yellow-500" />
                                    <span className="text-lg sm:text-xl md:text-3xl font-display font-bold text-white">{topThree[0].points}</span>
                                    <span className="text-[10px] md:text-sm text-gray-500">pts</span>
                                </div>
                                <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 mt-2 rounded-full bg-white/10 text-xs text-gray-300">
                                    <TrendingUp className="w-3 h-3 text-neonGreen" />
                                    <span>{topThree[0].winRate} Win Rate</span>
                                </div>
                            </div>
                        </div>
                    ) : <div className="order-2" />}

                    {/* 3rd Place */}
                    {topThree[2] ? (
                        <div
                            onClick={() => handleDetailClick(topThree[2])}
                            className={`order-3 relative rounded-xl md:rounded-2xl p-0.5 md:p-1 border backdrop-blur-sm cursor-pointer transition-transform active:scale-95 hover:bg-white/5 ${getRankStyle(2).bg} ${getRankStyle(2).border}`}
                        >
                            <div className="absolute -top-3 md:-top-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
                                <Medal className="w-5 h-5 md:w-8 md:h-8 text-orange-400" />
                            </div>
                            <div className="p-2 sm:p-4 md:p-6 text-center pt-5 md:pt-8">
                                <div className="relative inline-block mb-2 md:mb-4">
                                    <img
                                        src={topThree[2].avatar}
                                        alt={topThree[2].name}
                                        className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full border-2 md:border-4 border-orange-400 shadow-lg shadow-orange-400/20"
                                    />
                                    <div className="absolute -bottom-1 md:-bottom-2 left-1/2 -translate-x-1/2 px-1.5 md:px-3 py-0.5 md:py-1 bg-gray-800 rounded-full text-[10px] md:text-xs font-bold border border-gray-600 flex items-center gap-0.5">
                                        #3
                                        {topThree[2].rankChange < 0 ? (
                                            <ArrowDown className="w-2.5 h-2.5 md:w-3 md:h-3 text-red-500" />
                                        ) : topThree[2].rankChange > 0 ? (
                                            <ArrowUp className="w-2.5 h-2.5 md:w-3 md:h-3 text-green-500" />
                                        ) : null}
                                    </div>
                                </div>
                                <div className="flex items-center justify-center gap-1 mb-0.5 md:mb-1">
                                    <h3 className="text-xs sm:text-sm md:text-xl font-bold text-white truncate">{topThree[2].name}</h3>
                                    <div className="scale-75 origin-left">
                                        <UserBadge tier={topThree[2].tier} />
                                    </div>
                                </div>
                                <p className="text-[10px] md:text-sm text-gray-400 mb-1 md:mb-3 truncate">{topThree[2].team}</p>
                                <div className="flex items-center justify-center gap-1 md:gap-2">
                                    <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-500 fill-yellow-500" />
                                    <span className="text-sm sm:text-lg md:text-2xl font-display font-bold text-white">{topThree[2].points}</span>
                                    <span className="text-[10px] md:text-xs text-gray-500">pts</span>
                                </div>
                                <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 mt-2 rounded-full bg-white/10 text-xs text-gray-300">
                                    <TrendingUp className="w-3 h-3 text-neonGreen" />
                                    <span>{topThree[2].winRate} Win Rate</span>
                                </div>
                            </div>
                        </div>
                    ) : <div className="order-3" />}
                </div>
            )}

            {/* Ad Slot Injection */}
            <AdSlot variant="banner" className="mb-6 md:mb-8" />

            {/* Global Rank CTA Alert */}
            <div className="mb-6 md:mb-8 bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/30 rounded-xl p-4 md:p-6 flex flex-col md:flex-row items-center gap-4 md:gap-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Trophy className="w-24 h-24 rotate-12" />
                </div>

                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 border border-blue-500/30">
                    <Info className="w-6 h-6 text-blue-400" />
                </div>

                <div className="flex-1 text-center md:text-left z-10">
                    <h3 className="text-lg font-bold text-white mb-1">Ingin Masuk Global Ranking?</h3>
                    <p className="text-sm text-gray-300">
                        Ikuti kompetisi resmi menggunakan akun terdaftar untuk mencatatkan statistik. <span className="text-red-400 font-bold">Dilarang menggunakan Fake Competition (Match Fixing), akun Anda berisiko di-banned permanen!</span>
                    </p>
                </div>

                <button
                    onClick={() => navigate('/dashboard/competitions')}
                    className="z-10 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-all shadow-lg hover:shadow-blue-500/25 whitespace-nowrap"
                >
                    Cari Kompetisi
                </button>
            </div>

            {/* Ranking List - Table for Desktop */}
            <div className="hidden md:block bg-cardBg border border-white/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                                <th className="p-4 text-sm font-medium text-gray-400">Rank</th>
                                <th className="p-4 text-sm font-medium text-gray-400">Player</th>
                                <th className="p-4 text-sm font-medium text-gray-400 text-center">Matches</th>
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
                                    <td className="p-4 text-gray-400 font-medium whitespace-nowrap">
                                        <div className="flex items-center gap-1">
                                            #{index + 4}
                                            {player.rankChange < 0 ? (
                                                <ArrowDown className="w-3 h-3 text-red-500" />
                                            ) : player.rankChange > 0 ? (
                                                <ArrowUp className="w-3 h-3 text-green-500" />
                                            ) : null}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={player.avatar}
                                                alt={player.name}
                                                className="w-10 h-10 rounded-lg object-cover"
                                            />
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <div className="font-bold text-white">{player.name}</div>
                                                    <UserBadge tier={player.tier} />
                                                </div>
                                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                                    <Shield className="w-3 h-3" />
                                                    {player.team}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-300 text-center">
                                        {player.totalTournaments > 0 ? player.totalTournaments : '-'}
                                    </td>
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
                            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 flex flex-col items-center justify-center">
                                <span className="text-sm font-bold text-gray-400">#{index + 4}</span>
                                {player.rankChange < 0 ? (
                                    <ArrowDown className="w-2.5 h-2.5 text-red-500 -mt-1" />
                                ) : player.rankChange > 0 ? (
                                    <ArrowUp className="w-2.5 h-2.5 text-green-500 -mt-1" />
                                ) : null}
                            </div>

                            {/* Avatar */}
                            <img
                                src={player.avatar}
                                alt={player.name}
                                className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                            />

                            {/* Player Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1">
                                    <div className="font-bold text-white text-sm truncate">{player.name}</div>
                                    <UserBadge tier={player.tier} size="sm" className="scale-75 origin-left" />
                                </div>
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
                                <span className="text-xs text-gray-400">Matches:</span>
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
                                <div className="flex items-center gap-2">
                                    <h4 className="text-xl font-bold text-white">{selectedPlayer.name}</h4>
                                    <UserBadge tier={selectedPlayer.tier} size="md" />
                                </div>
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
                                    <span className="text-sm">Most Goal Played</span>
                                </div>
                                {selectedPlayer.mostGoal ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-purple-500/50 bg-black flex-shrink-0">
                                            <img
                                                src={selectedPlayer.mostGoal.face}
                                                alt={selectedPlayer.mostGoal.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => { e.target.src = 'https://www.efootballdb.com/img/players/player_noface.png' }}
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-sm font-bold text-white truncate">{selectedPlayer.mostGoal.name}</div>
                                            <div className="text-xs text-purple-400 font-medium">{selectedPlayer.mostGoal.goals} goals</div>
                                        </div>
                                    </div>
                                ) : selectedPlayer.mostGoal === null && selectedPlayer.recentMatches?.length > 0 ? (
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span className="text-sm">Loading...</span>
                                    </div>
                                ) : (
                                    <div className="text-lg font-display font-bold text-white">-</div>
                                )}
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div className="space-y-4">
                            <h5 className="text-white font-medium flex items-center gap-2">
                                <Swords className="w-4 h-4 text-red-500" />
                                Recent Performance
                            </h5>
                            <div className="flex gap-2">
                                {/* Ensure always 5 bars, newest on the left (index 0) */}
                                {(() => {
                                    const matches = selectedPlayer.recentMatches || [];
                                    const padded = [...matches];

                                    // Pad with null so there are always 5 shapes
                                    while (padded.length < 5) padded.push(null);

                                    return padded.map((result, i) => {
                                        let colorClass = 'bg-white/5'; // Empty/Default
                                        if (result === 'Win') colorClass = 'bg-green-500';
                                        else if (result === 'Draw') colorClass = 'bg-yellow-500';
                                        else if (result === 'Lose') colorClass = 'bg-red-500';

                                        return (
                                            <div
                                                key={i}
                                                className={`flex-1 h-2 rounded-full ${colorClass}`}
                                                title={result || 'No Data'}
                                            />
                                        );
                                    });
                                })()}
                            </div>
                            <div className="flex justify-between text-xs text-gray-400">
                                <span>All Time Stats</span>
                                <span>{selectedPlayer.winRate} Win Rate</span>
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
