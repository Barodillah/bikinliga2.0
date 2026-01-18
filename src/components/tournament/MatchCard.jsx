import React from 'react'
import { Edit } from 'lucide-react'

export default function MatchCard({
    home,
    away,
    homeScore,
    awayScore,
    time,
    status = 'upcoming',
    onInputScore,
    onClick
}) {
    const isCompleted = status === 'completed'
    const homeWin = isCompleted && homeScore > awayScore
    const awayWin = isCompleted && awayScore > homeScore

    return (
        <div
            onClick={onClick}
            className={`p-4 rounded-xl bg-white/5 border border-white/5 transition relative overflow-hidden ${onClick ? 'cursor-pointer hover:bg-white/10 hover:border-white/20' : 'hover:border-white/10'}`}
        >
            <div className="flex items-center justify-between">
                {/* Home Team */}
                <div className={`flex items-center gap-3 flex-1 ${homeWin ? 'opacity-100' : awayWin ? 'opacity-50' : ''}`}>
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold">
                        {home.charAt(0)}
                    </div>
                    <div>
                        <div className={`font-medium ${homeWin ? 'text-neonGreen' : ''}`}>{home}</div>
                        {homeWin && <div className="text-xs text-neonGreen">Menang</div>}
                    </div>
                </div>

                {/* Score / Time */}
                <div className="text-center px-4">
                    {isCompleted ? (
                        <div className="text-2xl font-display font-bold">
                            <span className={homeWin ? 'text-neonGreen' : ''}>{homeScore}</span>
                            <span className="text-gray-500 mx-2">-</span>
                            <span className={awayWin ? 'text-neonGreen' : ''}>{awayScore}</span>
                        </div>
                    ) : (
                        <div>
                            <div className="text-xl font-display font-bold text-gray-400">VS</div>
                        </div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                        {isCompleted ? 'FULL TIME' : time}
                    </div>
                </div>

                {/* Away Team */}
                <div className={`flex items-center gap-3 flex-1 justify-end ${awayWin ? 'opacity-100' : homeWin ? 'opacity-50' : ''}`}>
                    <div className="text-right">
                        <div className={`font-medium ${awayWin ? 'text-neonGreen' : ''}`}>{away}</div>
                        {awayWin && <div className="text-xs text-neonGreen">Menang</div>}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-sm font-bold">
                        {away.charAt(0)}
                    </div>
                </div>

                {/* Input Score Button */}
                {onInputScore && (
                    <button
                        onClick={onInputScore}
                        className="ml-4 p-2 rounded-lg bg-neonGreen/10 text-neonGreen hover:bg-neonGreen hover:text-black transition"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    )
}
