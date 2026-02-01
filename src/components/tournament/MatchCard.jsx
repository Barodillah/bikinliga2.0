import React from 'react'
import { Edit } from 'lucide-react'

export default function MatchCard({
    home,
    away,
    homeScore,
    awayScore,
    homePenalty,
    awayPenalty,
    time,
    status = 'upcoming',
    aggregate,
    leg,
    group,
    onInputScore,
    onClick,
    compact = false, // New prop
    highlightParticipantId,
    logoShape = 'circle' // 'circle' or 'square'
}) {
    const isCompleted = status === 'completed' || status === 'finished'

    // Determine winner mostly logic
    let homeWin = false
    let awayWin = false

    if (isCompleted) {
        if (homeScore > awayScore) {
            homeWin = true
        } else if (awayScore > homeScore) {
            awayWin = true
        } else if (homePenalty != null && awayPenalty != null) {
            if (homePenalty > awayPenalty) homeWin = true
            else if (awayPenalty > homePenalty) awayWin = true
        }
    }

    const isHomeHighlighted = highlightParticipantId && String(home?.id) === String(highlightParticipantId);
    const isAwayHighlighted = highlightParticipantId && String(away?.id) === String(highlightParticipantId);

    const logoRadius = logoShape === 'square' ? 'rounded-lg' : 'rounded-full';

    return (
        <div
            onClick={onClick}
            className={`${compact ? 'p-2.5 mb-2' : 'p-4 mb-3'} rounded-xl bg-white/5 border border-white/5 transition relative overflow-hidden ${onClick ? 'cursor-pointer hover:bg-white/10 hover:border-white/20' : 'hover:border-white/10'}`}
        >
            {/* Group Label */}
            {group && !compact && (
                <div className="absolute top-0 left-0 bg-white/10 px-2 py-0.5 rounded-br-lg text-[10px] sm:text-xs font-bold text-gray-400">
                    {group}
                </div>
            )}

            <div className={`flex items-center justify-between ${compact ? 'mt-0' : 'mt-2'}`}>
                {/* Home Team */}
                <div className={`flex items-center ${compact ? 'gap-2' : 'gap-3'} flex-1 ${homeWin ? 'opacity-100' : awayWin ? 'opacity-50' : ''}`}>
                    <div className={`${compact ? 'w-6 h-6 text-xs ring-1' : 'w-10 h-10 text-sm ring-2'} shrink-0 ${logoRadius} bg-blue-500/20 ring-blue-500/10 flex items-center justify-center font-bold overflow-hidden`}>
                        {/* Logic for Logo */}
                        {typeof home === 'object' && home.logo ? (
                            <img src={home.logo} alt={home.team || home.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-blue-400">{(typeof home === 'object' ? (home.team || home.name) : home).charAt(0)}</span>
                        )}
                    </div>
                    <div>
                        <div className={`font-medium ${compact ? 'text-xs' : ''} ${homeWin ? 'text-neonGreen' : ''} ${isHomeHighlighted ? 'text-neonGreen font-bold' : ''}`}>
                            {typeof home === 'object' ? (home.team || home.name) : home}
                        </div>
                        {/* Subtitle (Player Name) - Hide in compact if team name exists, or show smaller */}
                        {!compact && typeof home === 'object' && home.player && (
                            <div className="text-[10px] text-gray-400">{home.player}</div>
                        )}
                        {!compact && homeWin && <div className="text-xs text-neonGreen">Menang</div>}
                    </div>
                </div>

                {/* Score / Time */}
                <div className={`text-center ${compact ? 'px-2' : 'px-4'}`}>
                    {/* Aggregate Score - Above */}
                    {aggregate && !compact && (
                        <div className="text-xs text-neonPink font-bold mb-1">
                            {aggregate}
                        </div>
                    )}
                    {isCompleted ? (
                        <>
                            <div className={`${compact ? 'text-lg' : 'text-2xl'} font-display font-bold`}>
                                <span className={homeWin ? 'text-neonGreen' : ''}>{homeScore}</span>
                                <span className="text-gray-500 mx-1">-</span>
                                <span className={awayWin ? 'text-neonGreen' : ''}>{awayScore}</span>
                            </div>
                            {(homePenalty != null || awayPenalty != null) && !compact && (
                                <div className="text-xs text-gray-400 mt-1 font-mono">
                                    ({homePenalty} - {awayPenalty})
                                </div>
                            )}
                        </>
                    ) : (
                        <div>
                            <div className={`${compact ? 'text-sm' : 'text-xl'} font-display font-bold text-gray-400`}>VS</div>
                        </div>
                    )}
                    <div className={`text-xs text-gray-500 ${compact ? 'mt-0 scale-90' : 'mt-1'}`}>
                        {isCompleted ? (homePenalty != null ? 'PEN' : 'FT') : (
                            <>
                                {time}
                                {leg && !compact && <div className="text-[10px] text-neonPink font-mono mt-0.5">Leg {leg}</div>}
                            </>
                        )}
                    </div>
                </div>

                {/* Away Team */}
                <div className={`flex items-center ${compact ? 'gap-2' : 'gap-3'} flex-1 justify-end ${awayWin ? 'opacity-100' : homeWin ? 'opacity-50' : ''}`}>
                    <div className="text-right">
                        <div className={`font-medium ${compact ? 'text-xs' : ''} ${awayWin ? 'text-neonGreen' : ''} ${isAwayHighlighted ? 'text-neonGreen font-bold' : ''}`}>
                            {typeof away === 'object' ? (away.team || away.name) : away}
                        </div>
                        {!compact && typeof away === 'object' && away.player && (
                            <div className="text-[10px] text-gray-400">{away.player}</div>
                        )}
                        {!compact && awayWin && <div className="text-xs text-neonGreen">Menang</div>}
                    </div>
                    <div className={`${compact ? 'w-6 h-6 text-xs ring-1' : 'w-10 h-10 text-sm ring-2'} shrink-0 ${logoRadius} bg-red-500/20 ring-red-500/10 flex items-center justify-center font-bold overflow-hidden`}>
                        {typeof away === 'object' && away.logo ? (
                            <img src={away.logo} alt={away.team || away.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-red-400">{(typeof away === 'object' ? (away.team || away.name) : away).charAt(0)}</span>
                        )}
                    </div>
                </div>

                {/* Input Score Button */}
                {
                    onInputScore && !compact && (
                        <button
                            onClick={onInputScore}
                            className="ml-4 p-2 rounded-lg bg-neonGreen/10 text-neonGreen hover:bg-neonGreen hover:text-black transition"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                    )
                }
            </div>
        </div>
    )
}
