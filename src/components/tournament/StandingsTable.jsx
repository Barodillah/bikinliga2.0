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

export default function StandingsTable({ compact = false }) {
    const data = compact ? standingsData.slice(0, 5) : standingsData

    const getPositionStyle = (pos) => {
        if (pos === 1) return 'bg-neonGreen text-black'
        if (pos === 2) return 'bg-neonGreen/50 text-white'
        if (pos === 3) return 'bg-neonGreen/30 text-white'
        if (pos >= standingsData.length - 1) return 'bg-red-500/30 text-white'
        return 'bg-white/10'
    }

    return (
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
            <table className="w-full min-w-[500px]">
                <thead>
                    <tr className="border-b border-white/10 text-sm text-gray-400">
                        <th className="py-3 px-3 text-left w-12">#</th>
                        <th className="py-3 px-3 text-left">Tim</th>
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
                    {data.map((row) => (
                        <tr
                            key={row.pos}
                            className="border-b border-white/5 hover:bg-white/5 transition"
                        >
                            <td className="py-3 px-3">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${getPositionStyle(row.pos)}`}>
                                    {row.pos}
                                </div>
                            </td>
                            <td className="py-3 px-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                                        {row.team.substring(0, 2).toUpperCase()}
                                    </div>
                                    <span className="font-medium">{row.team}</span>
                                </div>
                            </td>
                            <td className="py-3 px-3 text-center text-gray-400">{row.played}</td>
                            {!compact && (
                                <>
                                    <td className="py-3 px-3 text-center text-neonGreen">{row.won}</td>
                                    <td className="py-3 px-3 text-center text-yellow-400">{row.drawn}</td>
                                    <td className="py-3 px-3 text-center text-red-400">{row.lost}</td>
                                    <td className="py-3 px-3 text-center text-gray-400 hidden md:table-cell">{row.gf}</td>
                                    <td className="py-3 px-3 text-center text-gray-400 hidden md:table-cell">{row.ga}</td>
                                </>
                            )}
                            <td className="py-3 px-3 text-center">
                                <span className={row.gd > 0 ? 'text-neonGreen' : row.gd < 0 ? 'text-red-400' : 'text-gray-400'}>
                                    {row.gd > 0 ? '+' : ''}{row.gd}
                                </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                                <span className="font-display font-bold text-lg">{row.pts}</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
