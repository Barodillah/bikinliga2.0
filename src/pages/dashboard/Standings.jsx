import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Trophy } from 'lucide-react'
import Card, { CardHeader, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import StandingsTable from '../../components/tournament/StandingsTable'
import AdSlot from '../../components/ui/AdSlot'

export default function Standings() {
    const { id } = useParams()
    const navigate = useNavigate()

    return (
        <div className="space-y-6">
            <div>
                <button
                    onClick={() => navigate(`/dashboard/tournaments/${id}`)}
                    className="text-gray-400 hover:text-white flex items-center gap-2 mb-4 transition"
                >
                    <ArrowLeft className="w-4 h-4" /> Kembali ke turnamen
                </button>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-display font-bold">Klasemen</h1>
                        <p className="text-gray-400 mt-1">Warkop Cup Season 5</p>
                    </div>
                    <Button variant="secondary" icon={Download}>Export Gambar</Button>
                </div>
            </div>

            <Card hover={false}>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Trophy className="w-5 h-5 text-neonGreen" />
                        <h3 className="font-display font-bold">Klasemen Liga</h3>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <StandingsTable />
                </CardContent>
            </Card>

            {/* Ad Slot */}
            <AdSlot variant="inline" adId="standings-stats" />

            {/* Top Stats */}
            <div className="grid md:grid-cols-3 gap-6">
                <Card className="p-6">
                    <h3 className="text-sm text-gray-400 mb-3">Top Scorer</h3>
                    <div className="space-y-3">
                        {[
                            { name: 'Player_1', team: 'FCB', goals: 12 },
                            { name: 'Player_3', team: 'RMA', goals: 9 },
                            { name: 'Player_5', team: 'MU', goals: 7 },
                        ].map((player, i) => (
                            <div key={player.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-500 text-black' : 'bg-white/10'
                                        }`}>
                                        {i + 1}
                                    </div>
                                    <div>
                                        <div className="font-medium">{player.name}</div>
                                        <div className="text-xs text-gray-500">{player.team}</div>
                                    </div>
                                </div>
                                <div className="font-display font-bold text-neonGreen">{player.goals}</div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="text-sm text-gray-400 mb-3">Clean Sheets</h3>
                    <div className="space-y-3">
                        {[
                            { name: 'Player_2', team: 'LIV', sheets: 5 },
                            { name: 'Player_1', team: 'FCB', sheets: 4 },
                            { name: 'Player_6', team: 'CHE', sheets: 3 },
                        ].map((player, i) => (
                            <div key={player.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-blue-500 text-white' : 'bg-white/10'
                                        }`}>
                                        {i + 1}
                                    </div>
                                    <div>
                                        <div className="font-medium">{player.name}</div>
                                        <div className="text-xs text-gray-500">{player.team}</div>
                                    </div>
                                </div>
                                <div className="font-display font-bold text-blue-400">{player.sheets}</div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="text-sm text-gray-400 mb-3">Form Guide</h3>
                    <div className="space-y-3">
                        {[
                            { team: 'FCB', form: ['W', 'W', 'W', 'D', 'W'] },
                            { team: 'RMA', form: ['W', 'L', 'W', 'W', 'D'] },
                            { team: 'LIV', form: ['D', 'W', 'W', 'L', 'W'] },
                        ].map((item) => (
                            <div key={item.team} className="flex items-center justify-between">
                                <div className="font-medium">{item.team}</div>
                                <div className="flex gap-1">
                                    {item.form.map((result, i) => (
                                        <div key={i} className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${result === 'W' ? 'bg-neonGreen text-black' :
                                            result === 'D' ? 'bg-yellow-500 text-black' :
                                                'bg-red-500 text-white'
                                            }`}>
                                            {result}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    )
}
