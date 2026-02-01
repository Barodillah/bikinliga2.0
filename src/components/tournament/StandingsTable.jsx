import React from 'react'

const standingsData = [
    { pos: 1, team: 'Barcelona FC', played: 8, won: 5, drawn: 2, lost: 1, gf: 18, ga: 8, gd: 10, pts: 17 },
    { pos: 2, team: 'Real Madrid', played: 8, won: 4, drawn: 3, lost: 1, gf: 15, ga: 9, gd: 6, pts: 15 },
    { pos: 3, team: 'Manchester United', played: 8, won: 4, drawn: 2, lost: 2, gf: 14, ga: 10, gd: 4, pts: 14 },
    { pos: 4, team: 'Arsenal', played: 8, won: 3, drawn: 3, lost: 2, gf: 12, ga: 10, gd: 2, pts: 12 },
    { pos: 5, team: 'Liverpool', played: 8, won: 3, drawn: 2, lost: 3, gf: 11, ga: 11, gd: 0, pts: 11 },
    { pos: 6, team: 'Chelsea', played: 8, won: 2, drawn: 4, lost: 2, gf: 10, ga: 10, gd: 0, pts: 10 },
    { pos: 7, team: 'PSG', played: 8, won: 2, drawn: 2, lost: 4, gf: 9, ga: 14, gd: -5, pts: 8 },
    { pos: 8, team: 'Bayern Munich', played: 8, won: 1, drawn: 2, lost: 5, gf: 7, ga: 16, gd: -9, pts: 5 },
]

export default function StandingsTable({ compact = false, limit = 5, standings = [], highlightParticipantId }) {
    // Standings are passed as prop. If empty, use mock or empty array?
    // Let's use empty array or passed data.
    // If mock data is needed for preview, we can keep it as fallback but better to rely on real data if possible or passed prop.
    const data = compact ? standings.slice(0, limit) : standings

    if (!standings || standings.length === 0) {
        return <div className="p-4 text-center text-gray-500">Belum ada data klasemen</div>
    }

    const getPositionStyle = (pos) => {
        if (pos === 1) return 'bg-neonGreen text-black'
        if (pos === 2) return 'bg-neonGreen/50 text-white'
        if (pos === 3) return 'bg-neonGreen/30 text-white'
        if (pos >= standingsData.length - 1) return 'bg-red-500/30 text-white'
        return 'bg-white/10'
    }

    return (
        <div className="overflow-x-auto scroll-container">
            <table className="w-full" style={{ minWidth: '450px' }}>
                <thead>
                    <tr className="border-b border-white/10 text-sm text-gray-400">
                        <th className="py-3 px-1 text-center w-8 sticky left-0 z-10 bg-[#0a0a0a]">#</th>
                        <th className="py-3 px-1 text-left sticky left-8 z-10 bg-[#0a0a0a] border-r border-white/5 shadow-xl w-12 md:w-32">Tim</th>
                        <th className="py-3 px-3 text-center w-10">P</th>
                        {!compact && (
                            <>
                                <th className="py-3 px-3 text-center w-10">W</th>
                                <th className="py-3 px-3 text-center w-10">D</th>
                                <th className="py-3 px-3 text-center w-10">L</th>
                                <th className="py-3 px-3 text-center w-10 hidden md:table-cell">GF</th>
                                <th className="py-3 px-3 text-center w-10 hidden md:table-cell">GA</th>
                            </>
                        )}
                        <th className="py-3 px-3 text-center w-10">GD</th>
                        <th className="py-3 px-3 text-center w-12">Pts</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => {
                        const isUserTeam = String(row.participant_id) === String(highlightParticipantId);
                        return (
                            <tr
                                key={row.id || index}
                                className={`border-b border-white/5 transition ${isUserTeam ? 'bg-neonGreen/10' : 'hover:bg-white/5'}`}
                            >
                                <td className="py-3 px-1 sticky left-0 z-10 bg-[#0a0a0a]">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${getPositionStyle(index + 1)}`}>
                                        {index + 1}
                                    </div>
                                </td>
                                <td className="py-3 px-1 sticky left-8 z-10 bg-[#0a0a0a] border-r border-white/5 shadow-xl w-12 md:w-32">
                                    <div className="flex items-center gap-1">
                                        <div className="w-6 h-6 shrink-0 flex items-center justify-center text-[10px] font-bold text-white">
                                            {row.team_logo ? (
                                                <img src={row.team_logo} alt={row.team_name} className="w-full h-full object-contain" />
                                            ) : (
                                                (row.team_name || '??').substring(0, 2).toUpperCase()
                                            )}
                                        </div>
                                        <span className={`font-medium text-[10px] md:text-sm whitespace-normal leading-tight flex-1 min-w-0 break-words ${isUserTeam ? 'text-neonGreen font-bold' : ''}`}>{row.team_name}</span>
                                    </div>
                                </td>
                                <td className="py-3 px-3 text-center text-gray-400">{row.played}</td>
                                {!compact && (
                                    <>
                                        <td className="py-3 px-3 text-center text-neonGreen">{row.won}</td>
                                        <td className="py-3 px-3 text-center text-yellow-400">{row.drawn}</td>
                                        <td className="py-3 px-3 text-center text-red-400">{row.lost}</td>
                                        <td className="py-3 px-3 text-center text-gray-400 hidden md:table-cell">{row.goals_for}</td>
                                        <td className="py-3 px-3 text-center text-gray-400 hidden md:table-cell">{row.goals_against}</td>
                                    </>
                                )}
                                <td className="py-3 px-3 text-center">
                                    <span className={(row.goal_difference) > 0 ? 'text-neonGreen' : (row.goal_difference) < 0 ? 'text-red-400' : 'text-gray-400'}>
                                        {(row.goal_difference) > 0 ? '+' : ''}{row.goal_difference}
                                    </span>
                                </td>
                                <td className="py-3 px-3 text-center">
                                    <span className="font-display font-bold text-lg">{row.points}</span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    )
}
