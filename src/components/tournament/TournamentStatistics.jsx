import React from 'react'
import { BarChart, Activity, ShieldAlert, Award, TrendingUp, Percent } from 'lucide-react'
import Card, { CardContent, CardHeader } from '../ui/Card'
import AdSlot from '../ui/AdSlot'

// Mock Data
const tournamentStats = {
    totalGoals: 124,
    goalsPerMatch: 2.8,
    mostGoalsTeam: { name: 'Barcelona FC', count: 18 },
    mostConcededTeam: { name: 'Bayern Munich', count: 16 }
}

const teamStats = [
    { id: 1, name: 'Barcelona FC', productivity: 2.25, topScorer: 'Lionel Messi', winRate: 62.5, chance: 45 },
    { id: 2, name: 'Man City', productivity: 2.1, topScorer: 'Erling Haaland', winRate: 58.3, chance: 35 },
    { id: 3, name: 'Real Madrid', productivity: 1.9, topScorer: 'Jude Bellingham', winRate: 50.0, chance: 30 },
    { id: 4, name: 'Arsenal', productivity: 1.5, topScorer: 'Bukayo Saka', winRate: 37.5, chance: 15 },
    { id: 5, name: 'Liverpool', productivity: 1.4, topScorer: 'Mo Salah', winRate: 37.5, chance: 12 },
    { id: 6, name: 'PSG', productivity: 1.1, topScorer: 'Kylian Mbappe', winRate: 25.0, chance: 8 },
    { id: 7, name: 'Bayern Munich', productivity: 0.9, topScorer: 'Harry Kane', winRate: 12.5, chance: 5 },
    { id: 8, name: 'Chelsea', productivity: 1.25, topScorer: 'Cole Palmer', winRate: 25.0, chance: 5 },
]

export default function TournamentStatistics() {
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
                        <div className="text-lg font-bold font-display">{tournamentStats.mostGoalsTeam.name}</div>
                        <div className="text-xs text-gray-400">{tournamentStats.mostGoalsTeam.count} Goals</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex flex-col items-center text-center">
                        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center mb-2">
                            <ShieldAlert className="w-5 h-5 text-red-400" />
                        </div>
                        <div className="text-lg font-bold font-display">{tournamentStats.mostConcededTeam.name}</div>
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
                                    <tr key={team.id} className="hover:bg-white/5 transition">
                                        <td className="p-4 font-medium">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                                                    {team.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                {team.name}
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="font-bold text-neonGreen">{team.productivity}</span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-300">{team.topScorer}</td>
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
