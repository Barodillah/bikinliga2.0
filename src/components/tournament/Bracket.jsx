import React from 'react'
import { Trophy } from 'lucide-react'

// Enhanced Bracket for knockout tournaments
export default function Bracket({ rounds, onMatchClick, champion, onGenerate3rdPlace, show3rdPlaceButton, highlightParticipantId }) {
    // Helper to render connectors between rounds
    const renderConnectors = (matchCount) => {
        const connectors = []
        // We need (matchCount / 2) connectors for the next round
        for (let i = 0; i < matchCount / 2; i++) {
            connectors.push(
                <div key={i} className="relative flex-1 w-full">
                    {/* Top Arm: 25% down (center of first match), left to middle */}
                    <div className="absolute top-1/4 left-0 w-1/2 h-[1px] bg-white/20"></div>
                    {/* Bottom Arm: 75% down (center of second match), left to middle */}
                    <div className="absolute top-3/4 left-0 w-1/2 h-[1px] bg-white/20"></div>
                    {/* Vertical Bar: at middle, spans from 25% to 75% */}
                    <div className="absolute top-1/4 left-1/2 w-[1px] h-1/2 bg-white/20"></div>
                    {/* Output Arm: 50% down (center of next round match), middle to right */}
                    <div className="absolute top-1/2 right-0 w-1/2 h-[1px] bg-white/20"></div>
                </div>
            )
        }
        return (
            <div className="flex flex-col w-12 justify-around mt-8">
                {connectors}
            </div>
        )
    }

    // Helper to render straight lines for the final winner
    const renderFinalConnector = () => (
        <div className="flex items-center w-12 justify-center mt-8">
            <div className="h-0.5 w-full bg-white/20"></div>
        </div>
    )

    return (
        <div className="w-full overflow-x-auto pb-4">
            <div className="flex items-stretch justify-center gap-0 p-4 min-w-[800px] h-[500px]">
                {rounds.map((round, roundIdx) => (
                    <React.Fragment key={round.name}>
                        {/* Round Column */}
                        <div className="flex flex-col flex-1 justify-around relative">
                            <div className="absolute top-0 w-full text-center text-sm font-medium text-gray-400 mb-4 h-8 flex items-center justify-center">
                                {round.name}
                            </div>

                            <div className={`flex flex-col flex-1 mt-8 ${(round.name === 'Final' || round.name === 'Finals') ? 'justify-center' : 'justify-around'}`}>
                                {round.matches
                                    .filter(m => !m.is3rdPlace)
                                    .map((match) => {
                                        const isHomeHighlighted = highlightParticipantId && String(match.home?.id || match.home_participant_id) === String(highlightParticipantId);
                                        const isAwayHighlighted = highlightParticipantId && String(match.away?.id || match.away_participant_id) === String(highlightParticipantId);

                                        return (
                                            <div
                                                key={match.id}
                                                onClick={() => onMatchClick && onMatchClick(match.id)}
                                                className={`w-48 bg-cardBg border rounded-lg overflow-hidden relative z-10 mx-auto cursor-pointer transition hover:scale-105 hover:border-neonGreen/50 ${(round.name === 'Final' || round.name === 'Finals') ? 'border-yellow-500/50' : 'border-white/10'
                                                    }`}
                                            >
                                                <div className={`flex items-center justify-between p-2 border-b border-white/5 ${match.homeWin ? 'bg-neonGreen/10' : ''
                                                    }`}>
                                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                                        <div className="w-6 h-6 rounded bg-blue-500/30 flex items-center justify-center text-xs font-bold overflow-hidden flex-shrink-0">
                                                            {match.home?.logo ? (
                                                                <img src={match.home.logo} alt="Home" className="w-full h-full object-cover" />
                                                            ) : (
                                                                (match.home?.name || match.home || '?').charAt(0)
                                                            )}
                                                        </div>
                                                        <span className={`text-sm truncate ${match.homeWin ? 'font-bold text-neonGreen' : ''} ${isHomeHighlighted ? 'text-neonGreen font-bold' : ''}`}>
                                                            {match.home?.name || match.home || 'TBD'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center ml-2 border-l border-white/10">
                                                        {match.scores && match.scores.length > 0 ? (
                                                            match.scores.map((score, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className={`w-8 text-center font-display font-bold ${idx > 0 ? 'border-l border-white/5' : ''} ${match.homeWin ? 'text-neonGreen' : 'text-gray-400'}`}
                                                                >
                                                                    {score.home ?? '-'}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className={`w-8 text-center font-display font-bold ${match.homeWin ? 'text-neonGreen' : 'text-gray-400'}`}>
                                                                {match.homeScore ?? '-'}
                                                            </span>
                                                        )}
                                                        {match.homePenalty != null && (
                                                            <span className="w-8 text-center font-mono text-xs text-gray-400 border-l border-white/10">
                                                                ({match.homePenalty})
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className={`flex items-center justify-between p-2 ${match.awayWin ? 'bg-neonGreen/10' : ''
                                                    }`}>
                                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                                        <div className="w-6 h-6 rounded bg-red-500/30 flex items-center justify-center text-xs font-bold overflow-hidden flex-shrink-0">
                                                            {match.away?.logo ? (
                                                                <img src={match.away.logo} alt="Away" className="w-full h-full object-cover" />
                                                            ) : (
                                                                (match.away?.name || match.away || '?').charAt(0)
                                                            )}
                                                        </div>
                                                        <span className={`text-sm truncate ${match.awayWin ? 'font-bold text-neonGreen' : ''} ${isAwayHighlighted ? 'text-neonGreen font-bold' : ''}`}>
                                                            {match.away?.name || match.away || 'TBD'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center ml-2 border-l border-white/10">
                                                        {match.scores && match.scores.length > 0 ? (
                                                            match.scores.map((score, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className={`w-8 text-center font-display font-bold ${idx > 0 ? 'border-l border-white/5' : ''} ${match.awayWin ? 'text-neonGreen' : 'text-gray-400'}`}
                                                                >
                                                                    {score.away ?? '-'}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className={`w-8 text-center font-display font-bold ${match.awayWin ? 'text-neonGreen' : 'text-gray-400'}`}>
                                                                {match.awayScore ?? '-'}
                                                            </span>
                                                        )}
                                                        {match.awayPenalty != null && (
                                                            <span className="w-8 text-center font-mono text-xs text-gray-400 border-l border-white/10">
                                                                ({match.awayPenalty})
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>

                            {/* Render 3rd Place Match & Button positioned to not disrupt final alignment */}
                            {(round.name === 'Final' || round.name === 'Finals') && (
                                <div className="absolute bottom-0 w-full pb-2 flex flex-col items-center gap-3">
                                    {round.matches.filter(m => m.is3rdPlace).map((match) => {
                                        const isHomeHighlighted = highlightParticipantId && String(match.home?.id || match.home_participant_id) === String(highlightParticipantId);
                                        const isAwayHighlighted = highlightParticipantId && String(match.away?.id || match.away_participant_id) === String(highlightParticipantId);
                                        return (
                                            <div key={match.id} className="w-full">
                                                <div className="text-[10px] text-center uppercase tracking-widest font-black text-gray-500 mb-2">
                                                    Juara 3
                                                </div>
                                                <div
                                                    onClick={() => onMatchClick && onMatchClick(match.id)}
                                                    className="w-48 bg-cardBg border border-neonPink/30 rounded-lg overflow-hidden relative z-10 mx-auto cursor-pointer transition hover:scale-105 hover:border-neonPink/50"
                                                >
                                                    <div className={`flex items-center justify-between p-2 border-b border-white/5 ${match.homeWin ? 'bg-neonPink/10' : ''}`}>
                                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                                            <div className="w-6 h-6 rounded bg-blue-500/30 flex items-center justify-center text-xs font-bold overflow-hidden flex-shrink-0">
                                                                {match.home?.logo ? (
                                                                    <img src={match.home.logo} alt="Home" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    (match.home?.name || match.home || '?').charAt(0)
                                                                )}
                                                            </div>
                                                            <span className={`text-sm truncate ${match.homeWin ? 'font-bold text-neonPink' : ''} ${isHomeHighlighted ? 'text-neonGreen font-bold' : ''}`}>
                                                                {match.home?.name || match.home || 'TBD'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center ml-2 border-l border-white/10">
                                                            <span className={`w-8 text-center font-display font-bold ${match.homeWin ? 'text-neonPink' : 'text-gray-400'}`}>
                                                                {match.scores?.[0]?.home ?? match.homeScore ?? '-'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className={`flex items-center justify-between p-2 ${match.awayWin ? 'bg-neonPink/10' : ''}`}>
                                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                                            <div className="w-6 h-6 rounded bg-red-500/30 flex items-center justify-center text-xs font-bold overflow-hidden flex-shrink-0">
                                                                {match.away?.logo ? (
                                                                    <img src={match.away.logo} alt="Away" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    (match.away?.name || match.away || '?').charAt(0)
                                                                )}
                                                            </div>
                                                            <span className={`text-sm truncate ${match.awayWin ? 'font-bold text-neonPink' : ''} ${isAwayHighlighted ? 'text-neonGreen font-bold' : ''}`}>
                                                                {match.away?.name || match.away || 'TBD'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center ml-2 border-l border-white/10">
                                                            <span className={`w-8 text-center font-display font-bold ${match.awayWin ? 'text-neonPink' : 'text-gray-400'}`}>
                                                                {match.scores?.[0]?.away ?? match.awayScore ?? '-'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {show3rdPlaceButton && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onGenerate3rdPlace && onGenerate3rdPlace();
                                            }}
                                            className="px-4 py-2 bg-neonGreen/10 border border-neonGreen/30 text-neonGreen text-[10px] uppercase font-black tracking-widest rounded-lg hover:bg-neonGreen/20 transition mx-auto"
                                        >
                                            Generate Juara 3
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Connector Column (render if not the last round) */}
                        {roundIdx < rounds.length - 1 && renderConnectors(round.matches.length)}

                        {/* Final to Winner connector */}
                        {roundIdx === rounds.length - 1 && renderFinalConnector()}
                    </React.Fragment>
                ))}

                {/* Champion Column */}
                <div className="flex flex-col flex-1 justify-around relative max-w-[200px]">
                    <div className="absolute top-0 w-full text-center text-sm font-medium text-yellow-500 mb-4 h-8 flex items-center justify-center">
                        🏆 Juara
                    </div>
                    <div className="flex flex-col items-center justify-center flex-1 mt-8">
                        <div className="w-24 h-24 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 z-10 overflow-hidden relative border-4 border-yellow-400/20">
                            {champion ? (
                                champion.logo ? (
                                    <img src={champion.logo} alt="Champion" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl font-bold text-white">{(champion.name || '?').charAt(0)}</span>
                                )
                            ) : (
                                <Trophy className="w-10 h-10 text-white" />
                            )}
                        </div>
                        <div className="mt-4 text-center font-display font-bold text-lg text-yellow-400">
                            {champion ? (champion.name || 'Unknown') : 'TBD'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
