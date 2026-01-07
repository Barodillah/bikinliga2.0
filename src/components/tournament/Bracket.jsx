import React from 'react'

// Sample bracket data for a 8-team knockout
const bracketData = {
    semifinals: [
        { id: 1, home: 'FCB', away: 'MU', homeScore: 3, awayScore: 1, winner: 'FCB' },
        { id: 2, home: 'RMA', away: 'LIV', homeScore: 2, awayScore: 2, penHome: 4, penAway: 3, winner: 'RMA' },
    ],
    final: { id: 3, home: 'FCB', away: 'RMA', homeScore: null, awayScore: null, winner: null },
}

function BracketMatch({ match, isFinal = false }) {
    const isCompleted = match.homeScore !== null
    const homeWin = match.winner === match.home
    const awayWin = match.winner === match.away
    const hasPenalties = match.penHome !== undefined

    return (
        <div className={`bg-cardBg border border-white/10 rounded-lg overflow-hidden ${isFinal ? 'border-neonGreen/50' : ''}`}>
            {/* Home */}
            <div className={`flex items-center justify-between p-3 border-b border-white/5 ${homeWin ? 'bg-neonGreen/10' : ''}`}>
                <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold`}>
                        {match.home?.charAt(0) || '?'}
                    </div>
                    <span className={`font-medium text-sm ${homeWin ? 'text-neonGreen' : ''}`}>
                        {match.home || 'TBD'}
                    </span>
                </div>
                {isCompleted && (
                    <div className="flex items-center gap-1">
                        <span className={`font-display font-bold ${homeWin ? 'text-neonGreen' : 'text-gray-400'}`}>
                            {match.homeScore}
                        </span>
                        {hasPenalties && (
                            <span className="text-xs text-gray-500">({match.penHome})</span>
                        )}
                    </div>
                )}
            </div>
            {/* Away */}
            <div className={`flex items-center justify-between p-3 ${awayWin ? 'bg-neonGreen/10' : ''}`}>
                <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-[10px] font-bold`}>
                        {match.away?.charAt(0) || '?'}
                    </div>
                    <span className={`font-medium text-sm ${awayWin ? 'text-neonGreen' : ''}`}>
                        {match.away || 'TBD'}
                    </span>
                </div>
                {isCompleted && (
                    <div className="flex items-center gap-1">
                        <span className={`font-display font-bold ${awayWin ? 'text-neonGreen' : 'text-gray-400'}`}>
                            {match.awayScore}
                        </span>
                        {hasPenalties && (
                            <span className="text-xs text-gray-500">({match.penAway})</span>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default function Bracket() {
    return (
        <div className="overflow-x-auto pb-4">
            <div className="min-w-[600px] flex items-center justify-center gap-8">
                {/* Semifinals */}
                <div className="space-y-8">
                    <div>
                        <div className="text-xs text-gray-500 mb-2 text-center">Semifinal 1</div>
                        <BracketMatch match={bracketData.semifinals[0]} />
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 mb-2 text-center">Semifinal 2</div>
                        <BracketMatch match={bracketData.semifinals[1]} />
                    </div>
                </div>

                {/* Connector Lines */}
                <div className="flex flex-col items-center">
                    <div className="w-8 h-[1px] bg-white/20"></div>
                    <div className="w-[1px] h-20 bg-white/20"></div>
                    <div className="w-8 h-[1px] bg-white/20"></div>
                </div>

                {/* Final */}
                <div>
                    <div className="text-xs text-gray-500 mb-2 text-center flex items-center gap-2 justify-center">
                        <span className="text-neonGreen">★</span> Final <span className="text-neonGreen">★</span>
                    </div>
                    <BracketMatch match={bracketData.final} isFinal />
                </div>

                {/* Winner Placeholder */}
                <div className="flex flex-col items-center">
                    <div className="w-8 h-[1px] bg-white/20"></div>
                </div>

                <div className="text-center">
                    <div className="text-xs text-gray-500 mb-2">Juara</div>
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                        <span className="text-2xl">🏆</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-400">TBD</div>
                </div>
            </div>
        </div>
    )
}
