import React from 'react'
import { Edit, Trophy, Target, Shield } from 'lucide-react'

export default function PlayerCard({
    name,
    playerName,
    rank,
    stats = {},
    compact = false,
    onEdit
}) {
    const { wins = 0, draws = 0, losses = 0, goals = 0, cleanSheets = 0 } = stats

    if (compact) {
        return (
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-neonGreen/30 to-neonPink/30 flex items-center justify-center font-bold text-sm">
                        {rank || '#'}
                    </div>
                    <div>
                        <div className="font-medium text-sm">{name}</div>
                        <div className="text-xs text-gray-500">{playerName}</div>
                    </div>
                </div>
                <div className="text-xs text-gray-400">
                    {wins}W {draws}D {losses}L
                </div>
            </div>
        )
    }

    return (
        <div className="glass-panel rounded-xl p-6 hover:border-white/20 transition group">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-neonGreen/20 to-neonPink/20 flex items-center justify-center">
                        <span className="text-2xl font-display font-bold text-neonGreen">{rank}</span>
                    </div>
                    <div>
                        <h3 className="font-display font-bold text-lg group-hover:text-neonGreen transition">{name}</h3>
                        <p className="text-sm text-gray-400">{playerName}</p>
                    </div>
                </div>
                {onEdit && (
                    <button
                        onClick={onEdit}
                        className="p-2 rounded-lg hover:bg-white/10 transition text-gray-400 hover:text-white"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-lg bg-white/5">
                    <Trophy className="w-4 h-4 mx-auto mb-1 text-neonGreen" />
                    <div className="font-display font-bold">{wins}</div>
                    <div className="text-xs text-gray-500">Menang</div>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                    <Target className="w-4 h-4 mx-auto mb-1 text-neonPink" />
                    <div className="font-display font-bold">{goals}</div>
                    <div className="text-xs text-gray-500">Gol</div>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                    <Shield className="w-4 h-4 mx-auto mb-1 text-blue-400" />
                    <div className="font-display font-bold">{cleanSheets}</div>
                    <div className="text-xs text-gray-500">CS</div>
                </div>
            </div>

            <div className="mt-4 flex gap-2">
                <span className="text-xs px-2 py-1 rounded bg-neonGreen/20 text-neonGreen">{wins}W</span>
                <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-400">{draws}D</span>
                <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400">{losses}L</span>
            </div>
        </div>
    )
}
