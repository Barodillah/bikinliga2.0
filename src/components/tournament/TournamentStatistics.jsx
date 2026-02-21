import React from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart, Activity, ShieldAlert, Award, TrendingUp, Percent } from 'lucide-react'
import Card, { CardContent, CardHeader } from '../ui/Card'
import AdSlot from '../ui/AdSlot'

export default function TournamentStatistics({ stats, loading }) {
    const navigate = useNavigate()

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[40vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neonGreen"></div>
            </div>
        )
    }

    if (!stats || !stats.tournamentStats) {
        return (
            <div className="text-center py-12 text-gray-500">
                <BarChart className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Belum ada statistik yang tersedia.</p>
            </div>
        )
    }

    const { tournamentStats, teamStats } = stats

    return (
        <div className="space-y-6">
            {/* Tournament Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 flex flex-col items-center text-center">
                        <div className="w-10 h-10 rounded-full bg-neonGreen/20 flex items-center justify-center mb-2">
                            <Activity className="w-5 h-5 text-neonGreen" />
                        </div>
                        <div className="text-2xl font-bold font-display">{tournamentStats.totalGoals}</div>
                        <div className="text-xs text-gray-400">Total Goal</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex flex-col items-center text-center">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mb-2">
                            <Percent className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="text-2xl font-bold font-display">{tournamentStats.goalsPerMatch}</div>
                        <div className="text-xs text-gray-400">Avg Goal/Match</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex flex-col items-center text-center">
                        <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center mb-2">
                            <Award className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div className="text-lg font-bold font-display truncate w-full">{tournamentStats.mostGoalsTeam.name}</div>
                        <div className="text-xs text-gray-400">{tournamentStats.mostGoalsTeam.count} Goals</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex flex-col items-center text-center">
                        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center mb-2">
                            <ShieldAlert className="w-5 h-5 text-red-400" />
                        </div>
                        <div className="text-lg font-bold font-display truncate w-full">{tournamentStats.mostConcededTeam.name}</div>
                        <div className="text-xs text-gray-400">{tournamentStats.mostConcededTeam.count} Conceded</div>
                    </CardContent>
                </Card>
            </div>

            {/* Team Statistics Table */}
            <AdSlot variant="banner" />
            <Card hover={false}>
                <CardHeader>
                    <h3 className="font-display font-bold flex items-center gap-2">
                        <BarChart className="w-5 h-5 text-neonGreen" />
                        Statistic of Team
                    </h3>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 text-xs uppercase text-gray-400">
                                    <th className="p-4">Team</th>
                                    <th className="p-4 text-center">Productivity (G/M)</th>
                                    <th className="p-4">Top Scorer</th>
                                    <th className="p-4 text-center">Win %</th>
                                    <th className="p-4 text-center">Chance Winning</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {teamStats.map((team, idx) => (
                                    <tr
                                        key={team.id}
                                        className={`transition ${team.username ? 'hover:bg-white/10 cursor-pointer' : 'hover:bg-white/5'}`}
                                        onClick={() => team.username && navigate(`/dashboard/profile/${team.username}`)}
                                    >
                                        <td className="p-4 font-medium">
                                            <div className="flex items-center gap-3">
                                                {team.logo ? (
                                                    <img src={team.logo} alt={team.name} className="w-8 h-8 rounded-lg object-contain bg-white/5 shrink-0" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold shrink-0">
                                                        {team.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <span className="truncate block max-w-[150px]">{team.name}</span>
                                                    {team.playerName && (
                                                        <span className="truncate block max-w-[150px] text-[11px] text-gray-500">{team.playerName}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="font-bold text-neonGreen">{team.productivity}</span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-300">{team.topScorer !== '-' ? team.topScorer : <span className="text-gray-600">-</span>}</td>
                                        <td className="p-4 text-center">
                                            <div className="inline-block px-2 py-1 rounded text-xs font-bold bg-blue-500/20 text-blue-400">
                                                {team.winRate}%
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                    <div className="h-full bg-neonGreen" style={{ width: `${team.chance}%` }}></div>
                                                </div>
                                                <span className="text-xs font-bold text-gray-400">{team.chance}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
