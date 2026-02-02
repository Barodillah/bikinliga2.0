import React, { useState, useRef } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { Trophy, Users, Calendar, BarChart2, ArrowLeft, TrendingUp, Activity, Sparkles, Brain, Goal, Newspaper, Gift, ChevronRight, ArrowRight, Grid3X3, GitMerge, DollarSign, Medal, Crown, Percent, Target } from 'lucide-react'
import confetti from 'canvas-confetti'
import Card, { CardContent, CardHeader } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import StandingsTable from '../../components/tournament/StandingsTable'
import TopScorerList from '../../components/tournament/TopScorerList'
import TournamentStatistics from '../../components/tournament/TournamentStatistics'
import MatchCard from '../../components/tournament/MatchCard'
import Bracket from '../../components/tournament/Bracket'
import AdSlot from '../../components/ui/AdSlot'
import Input from '../../components/ui/Input'
import UserBadge from '../../components/ui/UserBadge'
import LeagueNews from '../../components/tournament/LeagueNews'

import { authFetch } from '../../utils/api'
import { useAuth } from '../../contexts/AuthContext'

// Helper to format date
const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric'
    })
}

// Group Stage Component (Local Definition)
function GroupStage({ groups, highlightParticipantId }) {
    return (
        <div className="grid md:grid-cols-2 gap-6">
            {groups.map((group) => (
                <Card key={group.name} hover={false} className="min-w-0">
                    <CardHeader className="py-3">
                        <h3 className="font-display font-bold text-neonGreen">{group.name}</h3>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto scroll-container">
                        <table className="w-full text-sm" style={{ minWidth: '500px' }}>
                            <thead>
                                <tr className="border-b border-white/10 text-gray-400">
                                    <th className="py-2 px-1 text-center w-8 sticky left-0 z-10 bg-[#0a0a0a]">#</th>
                                    <th className="py-2 px-1 text-left sticky left-8 z-10 bg-[#0a0a0a] border-r border-white/5 shadow-xl w-12 md:w-32">Tim</th>
                                    <th className="py-2 px-3 text-center">P</th>
                                    <th className="py-2 px-3 text-center">W</th>
                                    <th className="py-2 px-3 text-center">D</th>
                                    <th className="py-2 px-3 text-center">L</th>
                                    <th className="py-2 px-3 text-center">GD</th>
                                    <th className="py-2 px-3 text-center">Pts</th>
                                </tr>
                            </thead>
                            <tbody>
                                {group.teams.map((team, i) => {
                                    const isUserTeam = String(team.participant_id) === String(highlightParticipantId);
                                    return (
                                        <tr key={team.name} className={`border-b border-white/5 ${isUserTeam ? 'bg-neonGreen/10' : (i < 2 ? 'bg-neonGreen/5' : '')}`}>
                                            <td className="py-2 px-1 sticky left-0 z-10 bg-[#0a0a0a]">
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${i < 2 ? 'bg-neonGreen text-black' : 'bg-white/10'
                                                    }`}>
                                                    {i + 1}
                                                </div>
                                            </td>
                                            <td className="py-2 px-1 font-medium sticky left-8 z-10 bg-[#0a0a0a] border-r border-white/5 shadow-xl w-12 md:w-32">
                                                <div className="flex items-center gap-2">
                                                    {team.logo ? (
                                                        <img src={team.logo} alt={team.name} className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                                                    ) : (
                                                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[8px] font-bold flex-shrink-0">
                                                            {team.name?.substring(0, 2).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <span className={`whitespace-normal leading-tight text-[10px] md:text-sm break-words ${isUserTeam ? 'text-neonGreen font-bold' : ''}`}>{team.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-2 px-3 text-center text-gray-400">{team.played}</td>
                                            <td className="py-2 px-3 text-center text-neonGreen">{team.won}</td>
                                            <td className="py-2 px-3 text-center text-yellow-400">{team.drawn}</td>
                                            <td className="py-2 px-3 text-center text-red-400">{team.lost}</td>
                                            <td className="py-2 px-3 text-center">
                                                <span className={team.gd > 0 ? 'text-neonGreen' : team.gd < 0 ? 'text-red-400' : ''}>
                                                    {team.gd > 0 ? '+' : ''}{team.gd}
                                                </span>
                                            </td>
                                            <td className="py-2 px-3 text-center font-display font-bold">{team.pts}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        <div className="p-2 text-xs text-gray-500 flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-neonGreen/30"></div>
                            Lolos ke Knockout Stage
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
// For demo purposes, returning a generic active tournament data

// Sample analysis prompts
const analysisPrompts = [
    "Siapa kandidat juara saat ini?",
    "Bagaimana performa tim saya?",
    "Prediksi pertandingan selanjutnya",
    "Analisis kelemahan lawan"
]

export default function UserTournamentDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [tournamentData, setTournamentData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Data States
    const [standings, setStandings] = useState([])
    const [matches, setMatches] = useState([])
    const [topScorers, setTopScorers] = useState([])
    const [newsList, setNewsList] = useState([])
    const [stats, setStats] = useState({ goals: 0, goalsPerMatch: 0 })
    const [statistics, setStatistics] = useState(null)
    const [statisticsLoading, setStatisticsLoading] = useState(false)

    const [activeTab, setActiveTab] = useState('overview')
    const [copied, setCopied] = useState(false)
    const [winnerData, setWinnerData] = useState(null)
    const carouselRef = useRef(null)

    // AI Chat State
    const [chatMessages, setChatMessages] = useState([
        { id: 1, role: 'system', content: 'Halo! Saya asisten analisis AI khusus untuk turnamen ini. Tanyakan apa saja tentang statistik, prediksi, atau performa tim.' }
    ])
    const [chatInput, setChatInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)

    // Derived user's participant ID
    const userParticipantId = React.useMemo(() => {
        if (!user || !standings.length) return null;
        const myStanding = standings.find(s => String(s.user_id) === String(user.id));
        return myStanding ? myStanding.participant_id : null;
    }, [user, standings]);


    // Fetch All Data
    React.useEffect(() => {
        const fetchAllData = async () => {
            try {
                // 1. Fetch Tournament Detail
                const resTour = await authFetch(`/api/tournaments/${id}`)
                const dataTour = await resTour.json()

                if (!dataTour.success) throw new Error(dataTour.message)
                setTournamentData(dataTour.data)

                // 2. Fetch Standings
                const resStandings = await authFetch(`/api/tournaments/${id}/standings`)
                const dataStandings = await resStandings.json()
                if (dataStandings.success) setStandings(dataStandings.data)

                // 3. Fetch Matches
                const resMatches = await authFetch(`/api/tournaments/${id}/matches`)
                const dataMatches = await resMatches.json()
                if (dataMatches.success) setMatches(dataMatches.data)

                // 4. Fetch Top Scorers
                const resTop = await authFetch(`/api/tournaments/${id}/top-scorers`)
                const dataTop = await resTop.json()
                if (dataTop.success) setTopScorers(dataTop.data)

                // 5. Fetch News
                const resNews = await authFetch(`/api/tournaments/${id}/news`)
                const dataNews = await resNews.json()
                if (dataNews.success) setNewsList(dataNews.data)

                // 6. Fetch Statistics
                const resStats = await authFetch(`/api/tournaments/${id}/statistics`)
                const dataStats = await resStats.json()
                if (dataStats.success) setStatistics(dataStats.data)

            } catch (err) {
                console.error("Error fetching user tournament data:", err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        if (id) fetchAllData()
    }, [id])

    // Calculate generic stats from matches
    React.useEffect(() => {
        if (matches.length > 0) {
            const completedMatches = matches.filter(m => m.status === 'completed' || m.status === 'finished')
            const totalGoals = completedMatches.reduce((acc, m) => acc + (m.home_score || 0) + (m.away_score || 0), 0)
            const gpm = completedMatches.length > 0 ? (totalGoals / completedMatches.length).toFixed(1) : 0
            setStats({ goals: totalGoals, goalsPerMatch: gpm })
        }
    }, [matches])

    // Confetti Effect
    React.useEffect(() => {
        if (tournamentData?.status === 'completed') {
            const duration = 3000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

            const randomInRange = (min, max) => Math.random() * (max - min) + min;

            const interval = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                // since particles fall down, start a bit higher than random
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
            }, 250);

            return () => clearInterval(interval);
        }
    }, [tournamentData?.status])

    // Calculate Winner
    React.useEffect(() => {
        if (!tournamentData || !statistics) return;

        const isKnockout = tournamentData.type === 'knockout'
        const isGroupKO = tournamentData.type === 'group_knockout' || tournamentData.type === 'group'
        const isLeague = tournamentData.type === 'league'

        let potentialWinner = null;

        if (isLeague) {
            if (standings.length > 0) {
                potentialWinner = {
                    id: standings[0].participant_id,
                    name: standings[0].team_name || standings[0].name,
                    logo: standings[0].logo_url,
                };
            }
        } else if ((isKnockout || isGroupKO) && matches.length > 0) {
            // Find final match
            const maxRound = Math.max(...matches.map(m => m.round));
            const finalMatches = matches.filter(m => {
                let d = {};
                try { d = typeof m.details === 'string' ? JSON.parse(m.details) : m.details || {}; } catch (e) { }
                return m.round === maxRound && !d.is3rdPlace;
            });

            if (finalMatches.length === 1) {
                const final = finalMatches[0];
                if (final.status === 'completed' || final.status === 'finished') {
                    let homeWin = final.home_score > final.away_score;
                    let awayWin = final.away_score > final.home_score;

                    if (final.home_score == final.away_score) {
                        if ((final.home_penalty_score || 0) > (final.away_penalty_score || 0)) homeWin = true;
                        else if ((final.away_penalty_score || 0) > (final.home_penalty_score || 0)) awayWin = true;
                    }

                    if (homeWin) {
                        potentialWinner = {
                            id: final.home_participant_id, // We need participant ID to link with stats
                            name: final.home_team_name,
                            logo: final.home_logo
                        };
                    } else if (awayWin) {
                        potentialWinner = {
                            id: final.away_participant_id,
                            name: final.away_team_name,
                            logo: final.away_logo
                        };
                    }
                }
            }
        }

        if (potentialWinner) {
            // Find detailed stats
            const statsArray = statistics.teamStats || (Array.isArray(statistics) ? statistics : []);
            const winnerStats = statsArray.find(s => s.id === potentialWinner.id);

            // Enrich with participant data if available for correct names
            let enrichedWinner = { ...potentialWinner };
            if (tournamentData.participants) {
                const winnerParticipant = tournamentData.participants.find(p => p.id === potentialWinner.id);
                if (winnerParticipant) {
                    enrichedWinner.name = winnerParticipant.team_name || winnerParticipant.name; // Prefer Team Name for main display
                    enrichedWinner.playerName = winnerParticipant.name;
                    enrichedWinner.logo = winnerParticipant.logo_url || enrichedWinner.logo;
                }
            }

            setWinnerData({
                ...enrichedWinner,
                stats: winnerStats || {}
            });
        }

    }, [tournamentData, matches, standings, statistics]);

    // Carousel Auto-Scroll
    React.useEffect(() => {
        const carousel = carouselRef.current;
        if (!carousel) return;

        const completedMatches = matches.filter(m => m.status === 'completed' || m.status === 'finished');
        if (completedMatches.length < 3) return;

        const scrollInterval = setInterval(() => {
            if (carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 10) {
                // Reset to start gently
                carousel.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                // Scroll next item width (approx 280px + gap)
                carousel.scrollBy({ left: 290, behavior: 'smooth' });
            }
        }, 3000);

        return () => clearInterval(scrollInterval);
    }, [matches]);

    // Aggregate Info Helper
    const getAggregateInfo = (match) => {
        if (!match) return null;
        let details = {};
        try {
            details = typeof match.details === 'string' ? JSON.parse(match.details) : match.details || {};
        } catch (e) { return null; }

        // Only show aggregate for leg 2 matches
        if (details.leg !== 2) return null;

        // Check if this is a knockout match:
        const isKnockoutType = tournamentData?.type === 'knockout';
        const isGroupKOKnockoutStage = tournamentData?.type === 'group_knockout' && details.stage === 'knockout';

        if (!isKnockoutType && !isGroupKOKnockoutStage) return null;

        // Need groupId to find leg 1
        if (!details.groupId) return null;

        const leg1 = matches.find(m => {
            let d = {};
            try {
                d = typeof m.details === 'string' ? JSON.parse(m.details) : m.details || {};
            } catch (e) { }
            return d.groupId === details.groupId && d.leg === 1;
        });

        if (!leg1) return null;

        // Calculate aggregate based on participant IDs
        const currentHomeId = match.home_participant_id;
        // const currentAwayId = match.away_participant_id; 

        const l1HomeId = leg1.home_participant_id;
        const l1AwayId = leg1.away_participant_id;
        const l1HomeScore = Number(leg1.home_score || 0);
        const l1AwayScore = Number(leg1.away_score || 0);

        // Find leg 1 scores for current match's home and away teams
        let leg1ScoreForHome = 0;
        let leg1ScoreForAway = 0;

        if (l1HomeId === currentHomeId) {
            leg1ScoreForHome = l1HomeScore;
            leg1ScoreForAway = l1AwayScore;
        } else if (l1AwayId === currentHomeId) {
            leg1ScoreForHome = l1AwayScore;
            leg1ScoreForAway = l1HomeScore;
        }

        const l2HomeScore = Number(match.home_score || 0);
        const l2AwayScore = Number(match.away_score || 0);

        const aggHome = l2HomeScore + leg1ScoreForHome;
        const aggAway = l2AwayScore + leg1ScoreForAway;

        return `(Agg ${aggHome}-${aggAway})`;
    }
    const processedGroups = React.useMemo(() => {
        if (!standings || standings.length === 0) return [];

        // Group by group_name
        const groups = {};
        standings.forEach(s => {
            const gName = s.group_name || 'Unassigned';
            if (!groups[gName]) groups[gName] = [];
            groups[gName].push({
                participant_id: s.participant_id, // Add participant_id
                name: s.team_name || s.participant_name || 'Team',
                played: s.played,
                won: s.won,
                drawn: s.drawn,
                lost: s.lost,
                gd: s.goal_difference,
                pts: s.points,
                logo: s.team_logo
            });
        });

        // Convert to array and sort
        return Object.entries(groups)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([name, teams]) => ({ name, teams }));
    }, [standings]);

    const isKnockout = tournamentData?.type === 'knockout'
    const isGroupKO = tournamentData?.type === 'group_knockout' || tournamentData?.type === 'group'
    const isLeague = tournamentData?.type === 'league'

    // Transform matches for Bracket
    const bracketData = React.useMemo(() => {
        if (!matches || matches.length === 0) return { rounds: [], champion: null };

        // Transform flat matches to bracket rounds structure
        const roundsMap = {};

        // Filter matches for Bracket logic
        // For Group+Knockout, we only want to show the knockout stage in the bracket view
        const bracketMatches = isGroupKO
            ? matches.filter(m => {
                try {
                    const d = typeof m.details === 'string' ? JSON.parse(m.details) : m.details || {};
                    return d.stage === 'knockout';
                } catch (e) { return false; }
            })
            : matches;

        if (bracketMatches.length === 0) return { rounds: [], champion: null };

        const maxRound = Math.max(...bracketMatches.map(m => m.round));

        bracketMatches.forEach(m => {
            let details = {};
            try {
                details = typeof m.details === 'string' ? JSON.parse(m.details) : m.details || {};
            } catch (e) {
                console.error("Parse error", e);
            }

            if (!roundsMap[m.round]) {
                let roundName = details.roundName || `Round ${m.round}`;

                // Fallback naming for standard knockout if no name in details
                if ((isKnockout || isGroupKO) && !details.roundName) {
                    if (m.round === maxRound) roundName = 'Final';
                    else if (m.round === maxRound - 1) roundName = 'Semi Final';
                }

                // If it's the final round and has 3rd place match
                if (m.round === maxRound && bracketMatches.some(bm => {
                    try {
                        const d = typeof bm.details === 'string' ? JSON.parse(bm.details) : bm.details || {};
                        return bm.round === m.round && d.is3rdPlace;
                    } catch (e) { return false; }
                })) {
                    roundName = 'Finals';
                }

                roundsMap[m.round] = {
                    name: roundName,
                    matchesMap: {}
                };
            }

            const groupId = details.groupId || m.id;

            if (!roundsMap[m.round].matchesMap[groupId]) {
                roundsMap[m.round].matchesMap[groupId] = {
                    id: m.id,
                    home: {
                        name: m.home_team_name || m.home_player_name || 'TBD',
                        logo: m.home_logo,
                        id: m.home_team_id || m.home_player_id
                    },
                    away: {
                        name: m.away_team_name || m.away_player_name || 'TBD',
                        logo: m.away_logo,
                        id: m.away_team_id || m.away_player_id
                    },
                    scores: [],
                    homeWin: false,
                    awayWin: false,
                    isDoubleLeg: false,
                    matchIndex: details.matchIndex !== undefined ? Number(details.matchIndex) : 999,
                    is3rdPlace: details.is3rdPlace || false,
                    homePenalty: null,
                    awayPenalty: null
                };
            }

            const bracketMatch = roundsMap[m.round].matchesMap[groupId];

            const normalizeHomeName = (name) => (name || '').toLowerCase().trim();
            const isHome =
                (m.home_team_id && m.home_team_id === bracketMatch.home.id) ||
                (m.home_player_id && m.home_player_id === bracketMatch.home.id) ||
                (normalizeHomeName(m.home_team_name || m.home_player_name) === normalizeHomeName(bracketMatch.home.name));

            const homeScore = isHome ? m.home_score : m.away_score;
            const awayScore = isHome ? m.away_score : m.home_score;

            bracketMatch.scores.push({
                leg: details.leg || 1,
                home: homeScore,
                away: awayScore
            });

            // Capture penalty scores
            if (m.home_penalty_score != null || m.away_penalty_score != null) {
                bracketMatch.homePenalty = isHome ? m.home_penalty_score : m.away_penalty_score;
                bracketMatch.awayPenalty = isHome ? m.away_penalty_score : m.home_penalty_score;
            }

            bracketMatch.scores.sort((a, b) => a.leg - b.leg);

            if (details.leg && bracketMatches.filter(mx => {
                const d = typeof mx.details === 'string' ? JSON.parse(mx.details) : mx.details || {};
                return (d.groupId === groupId);
            }).length > 1) {
                bracketMatch.isDoubleLeg = true;
                const allScoresPresent = bracketMatch.scores.length === 2 &&
                    bracketMatch.scores.every(s => s.home !== null && s.away !== null);

                if (allScoresPresent) {
                    const aggHome = bracketMatch.scores.reduce((sum, s) => sum + Number(s.home), 0);
                    const aggAway = bracketMatch.scores.reduce((sum, s) => sum + Number(s.away), 0);
                    bracketMatch.homeWin = aggHome > aggAway;
                    bracketMatch.awayWin = aggAway > aggHome;

                    if (aggHome === aggAway) {
                        const hp = bracketMatch.homePenalty || 0;
                        const ap = bracketMatch.awayPenalty || 0;
                        if (hp > ap) bracketMatch.homeWin = true;
                        else if (ap > hp) bracketMatch.awayWin = true;
                    }
                }
            } else {
                if (m.home_score !== null && m.away_score !== null) {
                    if (m.home_score > m.away_score) {
                        bracketMatch.homeWin = true;
                    } else if (m.away_score > m.home_score) {
                        bracketMatch.awayWin = true;
                    } else {
                        // Check penalties
                        const hp = m.home_penalty_score || 0;
                        const ap = m.away_penalty_score || 0;
                        if (hp > ap) bracketMatch.homeWin = true;
                        else if (ap > hp) bracketMatch.awayWin = true;
                    }
                }
            }
        });

        const roundsData = Object.values(roundsMap).map(r => {
            const matches = Object.values(r.matchesMap);
            matches.sort((a, b) => (a.matchIndex ?? 999) - (b.matchIndex ?? 999));
            return {
                name: r.name,
                matches: matches
            };
        });

        let champion = null;
        if (roundsData.length > 0) {
            const finalRound = roundsData[roundsData.length - 1];
            if (finalRound) {
                const finalMatch = finalRound.matches.find(m => !m.is3rdPlace);
                if (finalMatch) {
                    if (finalMatch.homeWin) champion = finalMatch.home;
                    else if (finalMatch.awayWin) champion = finalMatch.away;
                }
            }
        }

        return { rounds: roundsData, champion };
    }, [matches, isKnockout, isGroupKO]);

    // Helper to determine winner based on label
    const getAutomaticWinner = (recipient) => {
        if (!tournamentData || tournamentData.status !== 'completed') return null
        const label = recipient.label.toLowerCase()

        // League Logic
        if (tournamentData.type === 'league' && standings.length > 0) {
            if (label.includes('1') || label.includes('juara 1') || label.includes('champion') || label.includes('winner')) return { name: standings[0].team_name, logo: standings[0].team_logo, sub: 'Peringkat 1' }
            if (label.includes('2') || label.includes('juara 2') || label.includes('runner')) return { name: standings[1].team_name, logo: standings[1].team_logo, sub: 'Peringkat 2' }
            if (label.includes('3') || label.includes('juara 3')) return { name: standings[2].team_name, logo: standings[2].team_logo, sub: 'Peringkat 3' }
        }

        // Knockout Logic
        if ((tournamentData.type === 'knockout' || tournamentData.type === 'group_knockout') && matches.length > 0) {
            const maxRound = Math.max(...matches.map(m => m.round))
            // Check for Final
            const finalMatches = matches.filter(m => m.round === maxRound && !m.details?.is3rdPlace)
            // Check for 3rd Place
            const thirdPlaceMatch = matches.find(m => m.details?.is3rdPlace) || matches.find(m => m.round === maxRound && m.details?.is3rdPlace)

            // Final Winner
            if (finalMatches.length > 0) {
                const final = finalMatches[0] // Assuming single leg final for now or logic to handle leg
                if (final.status === 'completed' || final.status === 'finished') {
                    const isHomeWin = (final.home_score > final.away_score) || (final.home_penalty_score > final.away_penalty_score)
                    const winner = isHomeWin
                        ? { name: final.home_team_name || final.home_player_name, logo: final.home_logo, sub: 'Winner Final' }
                        : { name: final.away_team_name || final.away_player_name, logo: final.away_logo, sub: 'Winner Final' }
                    const loser = isHomeWin
                        ? { name: final.away_team_name || final.away_player_name, logo: final.away_logo, sub: 'Runner-up' }
                        : { name: final.home_team_name || final.home_player_name, logo: final.home_logo, sub: 'Runner-up' }

                    if (label.includes('1') || label.includes('juara 1') || label.includes('champion') || label.includes('winner')) return winner
                    if (label.includes('2') || label.includes('juara 2') || label.includes('runner')) return loser
                }
            }

            // 3rd Place Winner
            if (thirdPlaceMatch && (thirdPlaceMatch.status === 'completed' || thirdPlaceMatch.status === 'finished')) {
                const isHomeWin = (thirdPlaceMatch.home_score > thirdPlaceMatch.away_score) || (thirdPlaceMatch.home_penalty_score > thirdPlaceMatch.away_penalty_score)
                const winner3rd = isHomeWin
                    ? { name: thirdPlaceMatch.home_team_name || thirdPlaceMatch.home_player_name, logo: thirdPlaceMatch.home_logo, sub: 'Winner 3rd Place' }
                    : { name: thirdPlaceMatch.away_team_name || thirdPlaceMatch.away_player_name, logo: thirdPlaceMatch.away_logo, sub: 'Winner 3rd Place' }

                if (label.includes('3') || label.includes('juara 3')) return winner3rd
            }
        }
        return null
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>
    if (error) return <div className="min-h-screen flex items-center justify-center text-white">{error}</div>
    if (!tournamentData) return <div className="min-h-screen flex items-center justify-center text-white">Turnamen tidak ditemukan</div>


    const getTabs = () => {
        const baseTabs = [
            { id: 'overview', label: 'Overview', icon: Trophy },
            { id: 'ai_analysis', label: 'AI Analysis', icon: Brain, isPremium: true },
        ]

        if (tournamentData.prizeSettings?.enabled) {
            baseTabs.push({ id: 'prize', label: 'Hadiah', icon: Gift })
        }

        baseTabs.push({ id: 'league_news', label: 'League News', icon: Newspaper })

        if (isLeague) {
            baseTabs.push({ id: 'standings', label: 'Klasemen', icon: BarChart2 })
        }

        if (isGroupKO) {
            baseTabs.push({ id: 'groups', label: 'Group Stage', icon: Grid3X3 })
            baseTabs.push({ id: 'bracket', label: 'Knockout', icon: GitMerge })
        }

        if (isKnockout) {
            baseTabs.push({ id: 'bracket', label: 'Bracket', icon: GitMerge })
        }

        baseTabs.push({ id: 'fixtures', label: 'Jadwal', icon: Calendar })
        baseTabs.push({ id: 'top_scores', label: 'Top Score', icon: TrendingUp })
        baseTabs.push({ id: 'statistics', label: 'Statistik', icon: Activity })

        return baseTabs
    }

    const tabs = getTabs()

    const copyShareLink = () => {
        const link = `${window.location.origin}/t/${tournamentData.slug}`
        navigator.clipboard.writeText(link)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleSendMessage = (e) => {
        e.preventDefault()
        if (!chatInput.trim()) return

        // User Message
        const userMsg = { id: Date.now(), role: 'user', content: chatInput }
        setChatMessages(prev => [...prev, userMsg])
        setChatInput('')
        setIsTyping(true)

        // Simulate AI Response
        setTimeout(() => {
            const aiMsg = {
                id: Date.now() + 1,
                role: 'system',
                content: `Berdasarkan data statistik terkini, pertanyaan Anda tentang "${userMsg.content}" menarik. Tim X menunjukkan performa signifikat di babak kedua, yang mungkin menjadi kunci.`
            }
            setChatMessages(prev => [...prev, aiMsg])
            setIsTyping(false)
        }, 1500)
    }

    const handlePromptClick = (prompt) => {
        setChatInput(prompt)
    }

    const location = useLocation()

    // Navigate to read-only match view
    const handleMatchClick = (matchId) => {
        const basePath = location.pathname.includes('/competitions') ? 'competitions' : 'tournaments'
        navigate(`/dashboard/${basePath}/${id}/view/match/${matchId}`)
    }

    return (
        <div className="space-y-4 md:space-y-6 overflow-x-hidden pb-24">
            {/* Header */}
            <div className="space-y-4">
                <button
                    onClick={() => navigate('/dashboard/competitions')}
                    className="text-gray-400 hover:text-white flex items-center gap-2 transition text-sm"
                >
                    <ArrowLeft className="w-4 h-4" /> Kembali ke kompetisi
                </button>

                {/* Tournament Detail Summary Card */}
                <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-white/10 rounded-xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Trophy className="w-32 h-32 rotate-12" />
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
                        {tournamentData.logo ? (
                            <img
                                src={tournamentData.logo}
                                alt={tournamentData.name}
                                className="w-24 h-24 rounded-2xl object-cover border-2 border-white/10 shadow-lg"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                <Trophy className="w-10 h-10 text-white/20" />
                            </div>
                        )}

                        <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="bg-blue-500/20 text-blue-400 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/30 uppercase">
                                    {tournamentData.type?.replace('_', ' ')}
                                </span>
                                {tournamentData.match_format && (
                                    <span className="bg-purple-500/20 text-purple-400 text-xs font-bold px-3 py-1 rounded-full border border-purple-500/30 uppercase">
                                        {tournamentData.match_format?.replace('_', ' ')}
                                    </span>
                                )}
                            </div>

                            <div>
                                <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-1">{tournamentData.name}</h2>
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <span>Diselenggarakan oleh</span>
                                    <span className="text-white font-medium">{tournamentData.creator?.name || 'Panitia'}</span>
                                    {tournamentData.creator?.tier && (
                                        <UserBadge
                                            tier={tournamentData.creator.tier.toLowerCase().replace(' ', '_')}
                                            size="sm"
                                        />
                                    )}
                                </div>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">{tournamentData.description}</p>
                        </div>

                        <div className="w-full max-w-xs mt-2 bg-black/20 p-3 rounded-xl border border-white/5">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-xs text-gray-400">Liga Progress</span>
                                <span className="text-neonGreen font-bold font-mono">
                                    {matches.length > 0 ? Math.round((matches.filter(m => m.status === 'completed' || m.status === 'finished').length / matches.length) * 100) : 0}%
                                </span>
                            </div>
                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-neonGreen transition-all duration-1000"
                                    style={{
                                        width: `${matches.length > 0
                                            ? Math.min(
                                                (matches.filter(m => m.status === 'completed' || m.status === 'finished').length / matches.length) * 100,
                                                100
                                            )
                                            : 0}%`
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>



            {/* Winner Card */}
            {
                tournamentData.status === 'completed' && winnerData && (
                    <div className="relative mb-8 animate-fadeIn">
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-neonGreen/10 to-neonPink/20 rounded-2xl blur-xl"></div>
                        <Card className="relative border-yellow-500/50 overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Crown className="w-64 h-64 text-yellow-500 transform rotate-12" />
                            </div>

                            <CardContent className="p-6 md:p-8 flex flex-col items-center justify-center text-center relative z-10">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-sm font-bold mb-6 animate-bounce">
                                    <Trophy className="w-4 h-4" />
                                    TOURNAMENT CHAMPION
                                </div>

                                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full p-1 bg-gradient-to-br from-yellow-400 via-yellow-200 to-yellow-600 mb-6 shadow-[0_0_30px_rgba(234,179,8,0.4)]">
                                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden border-4 border-black">
                                        {winnerData.logo ? (
                                            <img src={winnerData.logo} alt={winnerData.name} className="w-full h-full object-contain" />
                                        ) : (
                                            <Trophy className="w-12 h-12 text-yellow-400" />
                                        )}
                                    </div>
                                </div>

                                <h2 className="text-3xl md:text-5xl font-black font-display text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 mb-2">
                                    {winnerData.name}
                                </h2>
                                <p className="text-lg text-yellow-500/80 font-medium mb-8">
                                    {winnerData.playerName || winnerData.stats.team_name || 'Champion Player'}
                                </p>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
                                    <div className="p-4 rounded-xl bg-black/40 border border-yellow-500/20 backdrop-blur-sm">
                                        <div className="text-yellow-500/60 text-xs font-bold uppercase tracking-wider mb-2 flex items-center justify-center gap-1">
                                            <Percent className="w-3 h-3" /> Win Rate
                                        </div>
                                        <div className="text-2xl md:text-3xl font-black text-white">
                                            {winnerData.stats.winRate}%
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-black/40 border border-yellow-500/20 backdrop-blur-sm">
                                        <div className="text-yellow-500/60 text-xs font-bold uppercase tracking-wider mb-2 flex items-center justify-center gap-1">
                                            <Activity className="w-3 h-3" /> Productivity
                                        </div>
                                        <div className="text-2xl md:text-3xl font-black text-white">
                                            {winnerData.stats.productivity} <span className="text-xs text-gray-500 font-normal">G/M</span>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-black/40 border border-yellow-500/20 backdrop-blur-sm col-span-2 md:col-span-2">
                                        <div className="text-yellow-500/60 text-xs font-bold uppercase tracking-wider mb-2 flex items-center justify-center gap-1">
                                            <Target className="w-3 h-3" /> Top Scorer
                                        </div>
                                        <div className="text-xl md:text-2xl font-black text-white flex items-center justify-center gap-2">
                                            {winnerData.stats.topScorer !== '-' ? winnerData.stats.topScorer : 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )
            }

            {/* Tabs */}
            <div className="border-b border-white/10 -mx-4 px-4 lg:mx-0 lg:px-0">
                <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${activeTab === tab.id
                                ? 'border-neonGreen text-neonGreen'
                                : 'border-transparent text-gray-400 hover:text-white'
                                }`}
                        >
                            <tab.icon className={`w-4 h-4 ${tab.isPremium ? 'text-yellow-400' : ''}`} />
                            {tab.label}
                            {tab.isPremium && (
                                <span className="ml-1 text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full font-bold">PRO</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}

            {/* AI Analysis Tab (Premium) */}
            {
                activeTab === 'ai_analysis' && (
                    <div className="flex flex-col gap-4 md:grid md:grid-cols-3 md:gap-6">
                        {/* Sidebar Stats - Shows first on mobile for quick insights */}
                        <div className="order-first md:order-last flex flex-col gap-3 md:gap-4 md:h-[500px]">
                            {/* Quick Insights - Horizontal scroll on mobile */}
                            <div className="flex md:flex-col gap-3 md:gap-4 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-hide md:flex-1">
                                <Card className="flex-shrink-0 w-[280px] md:w-auto md:flex-1 bg-gradient-to-b from-blue-900/20 to-transparent border-blue-500/20">
                                    <CardHeader className="p-3 md:p-4">
                                        <h3 className="font-bold flex items-center gap-2 text-blue-400 text-sm md:text-base">
                                            <Activity className="w-4 h-4" /> Insight Cepat
                                        </h3>
                                    </CardHeader>
                                    <CardContent className="p-3 md:p-4 pt-0 md:pt-0 space-y-3 md:space-y-4">
                                        <div className="p-2.5 md:p-3 bg-white/5 rounded-lg border border-white/5">
                                            <div className="text-[10px] md:text-xs text-gray-500 mb-0.5 md:mb-1">Win Probability</div>
                                            <div className="font-bold text-base md:text-lg text-white">High (Top 3)</div>
                                            <div className="h-1 md:h-1.5 w-full bg-white/10 rounded-full mt-1.5 md:mt-2 overflow-hidden">
                                                <div className="h-full bg-neonGreen w-[75%]"></div>
                                            </div>
                                        </div>
                                        <div className="p-2.5 md:p-3 bg-white/5 rounded-lg border border-white/5">
                                            <div className="text-[10px] md:text-xs text-gray-500 mb-0.5 md:mb-1">Next Opponent Difficulty</div>
                                            <div className="font-bold text-base md:text-lg text-yellow-400">Medium</div>
                                            <div className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">vs Real Madrid</div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="flex-shrink-0 w-[200px] md:w-auto h-auto md:h-1/3 flex items-center justify-center p-4 md:p-6 text-center border-dashed border-white/20">
                                    <div className="space-y-1 md:space-y-2 opacity-50">
                                        <BarChart2 className="w-6 h-6 md:w-8 md:h-8 mx-auto text-gray-400" />
                                        <div className="text-xs md:text-sm font-medium">More analytics coming soon</div>
                                    </div>
                                </Card>
                            </div>
                        </div>

                        {/* Chat Area & Input */}
                        <div className="md:col-span-2 flex flex-col gap-3 md:gap-4">
                            {/* Messages Card */}
                            <div className="flex flex-col h-[calc(100vh-380px)] min-h-[320px] max-h-[450px] md:h-[500px] md:max-h-none bg-[#0a0a0a] rounded-xl border border-white/10 overflow-hidden relative">
                                {/* Premium Badge Background */}
                                <div className="absolute top-0 right-0 p-2 md:p-4 opacity-10 pointer-events-none">
                                    <Sparkles className="w-32 h-32 md:w-64 md:h-64 text-yellow-500" />
                                </div>

                                {/* Chat Header */}
                                <div className="p-3 md:p-4 border-b border-white/10 bg-white/5 flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                                            <Brain className="w-4 h-4 md:w-5 md:h-5 text-black" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-bold flex items-center gap-1.5 md:gap-2 text-sm md:text-base">
                                                <span className="truncate">Tournament Analyst AI</span>
                                                <span className="text-[9px] md:text-[10px] bg-yellow-500 text-black px-1 md:px-1.5 py-0.5 rounded font-bold flex-shrink-0">PRO</span>
                                            </div>
                                            <div className="text-[10px] md:text-xs text-gray-400 truncate">Powered by advanced match data</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 scroll-container relative z-10">
                                    {chatMessages.map((msg) => (
                                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] md:max-w-[80%] rounded-2xl p-3 md:p-4 text-sm md:text-base ${msg.role === 'user'
                                                ? 'bg-blue-600 text-white rounded-br-none'
                                                : 'bg-white/10 text-gray-200 rounded-bl-none border border-white/5'
                                                }`}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    ))}
                                    {isTyping && (
                                        <div className="flex justify-start">
                                            <div className="bg-white/10 text-gray-400 rounded-2xl p-3 md:p-4 rounded-bl-none border border-white/5 flex gap-1">
                                                <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-500 rounded-full animate-bounce"></span>
                                                <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-500 rounded-full animate-bounce delay-100"></span>
                                                <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-500 rounded-full animate-bounce delay-200"></span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {/* Input Area */}
                                <div className="p-3 md:p-4 border-t border-white/10 bg-white/5 relative z-10">
                                    <div className="flex gap-1.5 md:gap-2 mb-2 md:mb-3 overflow-x-auto pb-1.5 md:pb-2 scrollbar-hide -mx-1 px-1">
                                        {analysisPrompts.map((prompt, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handlePromptClick(prompt)}
                                                className="whitespace-nowrap px-2.5 md:px-3 py-1.5 md:py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] md:text-xs text-gray-400 hover:bg-white/10 hover:text-white active:bg-white/15 transition touch-manipulation"
                                            >
                                                {prompt}
                                            </button>
                                        ))}
                                    </div>
                                    <form onSubmit={handleSendMessage} className="flex gap-2">
                                        <Input
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                            placeholder="Tanyakan analisis..."
                                            containerClassName="flex-1"
                                            className="w-full text-sm md:text-base"
                                        />
                                        <Button type="submit" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black border-none hover:opacity-90 active:opacity-80 px-3 md:px-4">
                                            <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }



            {/* Prize Tab (New) */}
            {
                activeTab === 'prize' && tournamentData.prizeSettings?.enabled && (
                    <div className="space-y-6 animate-fadeIn pb-20">
                        {/* Header Section */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 p-6 rounded-2xl border border-white/10">
                            <div>
                                <h3 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                                    <Gift className="w-6 h-6 text-neonPink" />
                                    Hadiah Turnamen
                                </h3>
                                <p className="text-gray-400 text-sm mt-1">Informasi distribusi hadiah turnamen dan para pemenang.</p>
                            </div>
                        </div>

                        {/* Calculation Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Breakdown Layout - Visible Publicly - Expanded to take full width if needed or centered */}
                            <Card hover={false} className="lg:col-span-3 overflow-hidden border-white/5 bg-black/40 backdrop-blur-sm">
                                <CardHeader className="border-b border-white/5 bg-white/5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-blue-500/10 rounded-lg">
                                                <DollarSign className="w-4 h-4 text-blue-400" />
                                            </div>
                                            <h4 className="font-bold">Total Prize Pool</h4>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="p-6 bg-neonGreen/5 border border-neonGreen/20 rounded-xl shadow-lg shadow-neonGreen/5 text-center">
                                        <div className="text-sm font-bold text-neonGreen uppercase tracking-wider mb-2">Total Hadiah Diperebutkan</div>
                                        <div className="text-4xl md:text-5xl font-display font-black text-white">
                                            Rp {parseInt(tournamentData.prizeSettings.totalPrizePool || 0).toLocaleString('id-ID')}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recipients Management */}
                        <Card hover={false} className="border-white/5 bg-black/40 backdrop-blur-sm overflow-hidden">
                            <CardHeader className="border-b border-white/5 flex flex-row items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-neonPink/10 rounded-lg">
                                        <Medal className="w-4 h-4 text-neonPink" />
                                    </div>
                                    <h4 className="font-bold">Daftar Pemenang & Distribusi</h4>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-white/5 border-b border-white/5">
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Kategori / Gelar</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Nominal Hadiah</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Pemenang</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {tournamentData.prizeSettings.recipients.map((recipient) => (
                                                <tr key={recipient.id} className="group hover:bg-white/[0.02] transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-white">{recipient.label}</div>
                                                    </td>
                                                    <td className="px-6 py-4 font-mono">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-gray-500 text-xs">Rp</span>
                                                            <span className="font-bold text-white text-lg">
                                                                {Number(recipient.amount).toLocaleString('id-ID')}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {(() => {
                                                            const autoWinner = tournamentData.status === 'completed' ? getAutomaticWinner(recipient) : null;
                                                            if (autoWinner) {
                                                                return (
                                                                    <div className="flex items-center gap-3 p-2 bg-gradient-to-r from-neonGreen/10 to-transparent border-l-2 border-neonGreen rounded-r-lg">
                                                                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                                            {autoWinner.logo ? (
                                                                                <img src={autoWinner.logo} alt="" className="w-full h-full object-cover" />
                                                                            ) : (
                                                                                <Users className="w-4 h-4 text-neonPink" />
                                                                            )}
                                                                        </div>
                                                                        <div className="flex flex-col min-w-0">
                                                                            <span className="text-sm font-bold text-white truncate">{autoWinner.name}</span>
                                                                            <span className="text-[10px] text-neonGreen font-medium">{autoWinner.sub || 'Winner'}</span>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            }
                                                            return (
                                                                <div className="flex items-center gap-2 opacity-50">
                                                                    <div className="w-8 h-8 rounded-full bg-white/5 border border-dashed border-white/10 flex items-center justify-center">
                                                                        <Users className="w-4 h-4 text-gray-600" />
                                                                    </div>
                                                                    <span className="text-xs text-gray-500 italic">Belum ditentukan</span>
                                                                </div>
                                                            );
                                                        })()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="h-full">
                            <CardHeader>
                                <h3 className="font-display font-bold flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-blue-400" />
                                    Syarat & Ketentuan
                                </h3>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <ul className="list-disc list-inside space-y-2 text-sm text-gray-400">
                                    <li>Hadiah akan didistribusikan selambat-lambatnya 3 hari setelah turnamen selesai.</li>
                                    <li>Pajak hadiah ditanggung oleh pemenang (jika ada).</li>
                                    <li>Keputusan panitia bersifat mutlak dan tidak dapat diganggu gugat.</li>
                                    <li>Pemenang wajib memiliki rekening bank yang aktif untuk proses transfer.</li>
                                </ul>
                                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-300 mt-4">
                                    <span className="font-bold block mb-1">Informasi Penting:</span>
                                    Pastikan data profil Anda sudah lengkap untuk memudahkan proses klaim hadiah.
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )
            }

            {/* Overview Tab - Social Feed Style */}
            {
                activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Feed Header - Quick Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                            {[
                                { label: 'Pemain', value: tournamentData.current_participants || tournamentData.players || 0, icon: Users, color: 'text-blue-400' },
                                { label: 'Match', value: matches.length, icon: Calendar, color: 'text-neonGreen' },
                                { label: 'Gol', value: stats.goals, icon: Goal, color: 'text-yellow-400' },
                                { label: 'G/M', value: stats.goalsPerMatch, icon: Activity, color: 'text-neonPink' },
                            ].map((stat, i) => (
                                <div key={i} className="flex flex-col items-center justify-center p-3 sm:p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <stat.icon className={`w-5 h-5 mb-2 ${stat.color}`} />
                                    <div className="text-lg sm:text-2xl font-display font-bold">{stat.value}</div>
                                    <div className="text-[10px] sm:text-xs text-gray-500">{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        <AdSlot variant="banner" />

                        {/* Prize Pool Teaser (if enabled) */}
                        {tournamentData.prizeSettings?.enabled && (
                            <div className="relative group cursor-pointer" onClick={() => setActiveTab('prize')}>
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition duration-500"></div>
                                <Card className="relative overflow-hidden border-neonPurple/30 bg-black/40 backdrop-blur-sm">
                                    <CardContent className="p-5 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-neonPurple/20 flex items-center justify-center">
                                                <Gift className="w-6 h-6 text-neonPurple animate-pulse" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-neonPurple uppercase tracking-wider mb-1">Total Prize Pool</div>
                                                <div className="text-2xl font-mono font-bold text-white">
                                                    Rp {parseInt(tournamentData.prizeSettings?.totalPrizePool || 0).toLocaleString('id-ID')}
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-white transition group-hover:translate-x-1" />
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Latest News (Pinned) */}
                        {/* Latest News (Pinned) */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between px-1">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <Newspaper className="w-5 h-5 text-gray-400" />
                                    Berita Terbaru
                                </h3>
                                <button onClick={() => setActiveTab('league_news')} className="text-xs text-neonGreen hover:text-white transition flex items-center gap-1">
                                    Lihat Semua <ArrowRight className="w-3 h-3" />
                                </button>
                            </div>
                            {newsList && newsList.length > 0 ? (
                                (() => {
                                    // Prioritize pinned/welcome news, otherwise the latest one
                                    const pinnedNews = newsList.find(n => n.is_welcome) || newsList[0];
                                    return (
                                        <div onClick={() => setActiveTab('league_news')} className="block bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:bg-white/10 transition cursor-pointer">
                                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition transform group-hover:scale-110 duration-500">
                                                <Newspaper className="w-24 h-24" />
                                            </div>
                                            <div className="relative z-10">
                                                {pinnedNews.is_welcome && (
                                                    <span className="inline-block px-2 py-1 rounded bg-neonGreen/20 text-neonGreen text-[10px] font-bold mb-2">PINNED</span>
                                                )}
                                                <h4 className="font-bold text-lg sm:text-xl mb-2 line-clamp-2">{pinnedNews.title}</h4>
                                                <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                                                    {pinnedNews.content}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <span>Admin League</span>
                                                    <span>•</span>
                                                    <span>{new Date(pinnedNews.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()
                            ) : (
                                <div className="text-center py-8 text-gray-500 bg-white/5 rounded-2xl border border-white/10">
                                    <Newspaper className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                    <p className="text-sm">Belum ada berita yang dipublish.</p>
                                </div>
                            )}
                        </div>

                        {/* Match Results Carousel */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between px-1">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-gray-400" />
                                    Hasil Terkini
                                </h3>
                                <button onClick={() => setActiveTab('fixtures')} className="text-xs text-gray-400 hover:text-white transition">Lihat Jadwal</button>
                            </div>
                            {/* Scroll Container - Added pr-4 for right padding on last item */}
                            <div
                                ref={carouselRef}
                                className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory scroll-smooth"
                                style={{ scrollBehavior: 'smooth' }}
                            >
                                {matches.filter(m => m.status === 'completed' || m.status === 'finished').slice(0, 8).map((match, i) => (
                                    <div key={match.id} className="flex-shrink-0 w-[calc(100%-32px)] sm:w-[280px] snap-start first:ml-0 last:mr-4">
                                        <MatchCard
                                            home={{
                                                name: (match.home_team_name || match.home_player_name || '?').substring(0, 3).toUpperCase(),
                                                logo: match.home_logo
                                            }}
                                            away={{
                                                name: (match.away_team_name || match.away_player_name || '?').substring(0, 3).toUpperCase(),
                                                logo: match.away_logo
                                            }}
                                            homeScore={match.home_score}
                                            awayScore={match.away_score}
                                            time={formatDate(match.start_time)}
                                            status="completed"
                                            matchId={match.id}
                                            onClick={() => handleMatchClick(match.id)}
                                            logoShape="square"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Standings Snapshot - Logic Updated for Group/Stage Context */}
                        {!isKnockout && (isLeague || (isGroupKO && standings.some(s => String(s.user_id) === String(user?.id)))) && (
                            <Card className="w-full overflow-hidden">
                                <CardHeader className="flex flex-row justify-between items-center pb-2">
                                    <h3 className="font-bold flex items-center gap-2">
                                        <BarChart2 className="w-5 h-5 text-gray-400" />
                                        {isGroupKO
                                            ? `Klasemen ${standings.find(s => String(s.user_id) === String(user?.id))?.group_name || 'Group'}`
                                            : 'Klasemen Papan Atas'
                                        }
                                    </h3>
                                    <button onClick={() => setActiveTab(isGroupKO ? 'groups' : 'standings')} className="p-1 rounded-full hover:bg-white/10 transition">
                                        <ArrowRight className="w-5 h-5 text-gray-400" />
                                    </button>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <StandingsTable
                                        compact
                                        limit={isGroupKO ? 100 : 4}
                                        standings={isGroupKO
                                            ? standings.filter(s => s.group_name === (standings.find(st => String(st.user_id) === String(user?.id))?.group_name))
                                            : standings
                                        }
                                        highlightParticipantId={userParticipantId}
                                    />
                                    <button
                                        onClick={() => setActiveTab(isGroupKO ? 'groups' : 'standings')}
                                        className="w-full py-3 text-xs text-center text-gray-500 hover:text-white hover:bg-white/5 transition border-t border-white/5"
                                    >
                                        {isGroupKO ? 'Lihat Detail Group' : 'Lihat Klasemen Lengkap'}
                                    </button>
                                </CardContent>
                            </Card>
                        )}

                        {/* Top Scorer Highlight - Full Width on Mobile */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between px-1">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-gray-400" />
                                    Top Performance
                                </h3>
                                <button onClick={() => setActiveTab('top_scores')} className="text-xs text-neonGreen hover:text-white transition">
                                    Lihat Semua
                                </button>
                            </div>

                            <Card className="bg-gradient-to-br from-gray-900 to-black border-white/10 w-full">
                                {topScorers.length > 0 ? (
                                    <CardContent className="p-4 flex flex-row items-center gap-4">
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 p-0.5 flex-shrink-0">
                                            <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                                                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[10px] sm:text-xs text-yellow-500 font-bold uppercase mb-0.5">Top Scorer</div>
                                            <h4 className="font-bold text-base sm:text-lg text-white truncate">{topScorers[0].name}</h4>
                                            <p className="text-xs sm:text-sm text-gray-400 truncate">{topScorers[0].team_name}</p>
                                        </div>
                                        <div className="text-center px-3 sm:px-4 py-2 bg-white/5 rounded-lg border border-white/5 flex-shrink-0">
                                            <div className="text-xl sm:text-2xl font-display font-bold text-white">{topScorers[0].goals}</div>
                                            <div className="text-[9px] sm:text-[10px] text-gray-500 uppercase">Gol</div>
                                        </div>
                                    </CardContent>
                                ) : (
                                    <CardContent className="p-4 text-center text-gray-500">Belum ada data top scorer</CardContent>
                                )}
                            </Card>
                        </div>

                        {/* Upcoming Match Highlight - Full Width on Mobile */}
                        <Card className="border-l-4 border-l-blue-500 w-full">
                            <CardContent className="p-4">
                                {matches.find(m => m.status === 'scheduled') ? (
                                    (() => {
                                        const nextMatch = matches.find(m => m.status === 'scheduled');
                                        return (
                                            <div className="text-center w-full">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="text-xs font-bold text-blue-400 uppercase">Next Big Match</div>
                                                    <div className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">{formatDate(nextMatch.start_time)}</div>
                                                </div>
                                                <div className="flex items-center justify-center gap-4 sm:gap-6 py-2">
                                                    <div className="text-center">
                                                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-blue-500/20 text-blue-400 ring-4 ring-blue-500/10 flex items-center justify-center text-sm sm:text-base font-bold mx-auto mb-1 overflow-hidden">
                                                            {nextMatch.home_logo ? (
                                                                <img src={nextMatch.home_logo} alt={nextMatch.home_team_name || nextMatch.home_player_name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                (nextMatch.home_team_name || nextMatch.home_player_name || '?').charAt(0)
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-gray-400 truncate max-w-[80px]">{nextMatch.home_team_name || nextMatch.home_player_name}</div>
                                                    </div>
                                                    <div className="text-lg sm:text-xl font-bold text-gray-500">VS</div>
                                                    <div className="text-center">
                                                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-red-500/20 text-red-400 ring-4 ring-red-500/10 flex items-center justify-center text-sm sm:text-base font-bold mx-auto mb-1 overflow-hidden">
                                                            {nextMatch.away_logo ? (
                                                                <img src={nextMatch.away_logo} alt={nextMatch.away_team_name || nextMatch.away_player_name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                (nextMatch.away_team_name || nextMatch.away_player_name || '?').charAt(0)
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-gray-400 truncate max-w-[80px]">{nextMatch.away_team_name || nextMatch.away_player_name}</div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleMatchClick(nextMatch.id)}
                                                    className="w-full mt-3 py-2 rounded-lg bg-blue-500/10 text-blue-400 text-sm font-bold hover:bg-blue-500/20 transition"
                                                >
                                                    Lihat Preview
                                                </button>
                                            </div>
                                        )
                                    })()
                                ) : (
                                    <div className="text-center text-gray-500 py-8">Tidak ada pertandingan mendatang</div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )
            }

            {/* Group Stage Tab */}
            {
                activeTab === 'groups' && (
                    <div className="space-y-6">
                        <AdSlot variant="banner" />
                        {processedGroups.length > 0 ? (
                            <GroupStage groups={processedGroups} highlightParticipantId={userParticipantId} />
                        ) : (
                            <div className="text-center py-12 text-gray-500 bg-white/5 rounded-xl border border-white/10">
                                <Grid3X3 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>Data penyisihan grup belum tersedia</p>
                            </div>
                        )}
                    </div>
                )
            }

            {/* Bracket Tab */}
            {
                activeTab === 'bracket' && (
                    <div className="space-y-6">
                        <AdSlot variant="banner" />
                        {bracketData.rounds.length > 0 ? (
                            <Bracket
                                rounds={bracketData.rounds}
                                champion={bracketData.champion}
                                onMatchClick={handleMatchClick}
                                highlightParticipantId={userParticipantId}
                            />
                        ) : (
                            <div className="text-center py-12 text-gray-500 bg-white/5 rounded-xl border border-white/10">
                                <GitMerge className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>Data bracket belum tersedia</p>
                            </div>
                        )}
                    </div>
                )
            }

            {/* League News Tab */}
            {
                activeTab === 'league_news' && (
                    <LeagueNews
                        tournamentId={id}
                        initialNews={newsList}
                        participants={tournamentData?.participants || []}
                        organizerId={tournamentData?.organizer_id}
                    />
                )
            }

            {/* Other Tabs (Reused Components) */}
            {
                activeTab === 'standings' && (
                    <Card hover={false}>
                        <CardHeader>
                            <h3 className="font-display font-bold">Klasemen Liga</h3>
                        </CardHeader>
                        <CardContent className="p-0">
                            <StandingsTable standings={standings} highlightParticipantId={userParticipantId} />
                        </CardContent>
                    </Card>
                )
            }

            {
                activeTab === 'fixtures' && (
                    <div className="space-y-6">
                        <AdSlot variant="banner" />
                        <Card className="p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-display font-bold">Jadwal Pertandingan</h3>
                            </div>
                            <div className="space-y-8">
                                {matches.length > 0 ? (
                                    /* Group Matches by Round */
                                    Object.entries(matches.reduce((acc, match) => {
                                        const roundKey = match.round;
                                        if (!acc[roundKey]) acc[roundKey] = [];
                                        acc[roundKey].push(match);
                                        return acc;
                                    }, {})).map(([round, roundMatches]) => (
                                        <div key={round} className="space-y-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-px bg-white/10 flex-1"></div>
                                                <h3 className="font-display font-bold text-neonGreen">
                                                    {(() => {
                                                        if (isLeague) return `Matchday ${round}`;
                                                        const maxRound = Math.max(...matches.map(m => m.round));
                                                        const r = parseInt(round);

                                                        if (r === maxRound) return 'Final';
                                                        if (r === maxRound - 1) return 'Semi Final';
                                                        return `Round ${round}`;
                                                    })()}
                                                </h3>
                                                <div className="h-px bg-white/10 flex-1"></div>
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                {roundMatches
                                                    .map(m => {
                                                        let d = {};
                                                        try { d = typeof m.details === 'string' ? JSON.parse(m.details) : m.details || {}; } catch (e) { }
                                                        return { ...m, _details: d };
                                                    })
                                                    .sort((a, b) => (a._details.leg || 0) - (b._details.leg || 0))
                                                    .map(match => {
                                                        let roundName = '';
                                                        if (match._details.is3rdPlace) roundName = 'Perebutan Juara 3';

                                                        return (
                                                            <div key={match.id} className="space-y-2">
                                                                {roundName && (
                                                                    <div className="text-[10px] uppercase tracking-widest font-bold text-gray-500 px-1">
                                                                        {roundName}
                                                                    </div>
                                                                )}
                                                                <MatchCard
                                                                    key={match.id}
                                                                    home={{
                                                                        name: (match.home_team_name || match.home_player_name || 'TBD').substring(0, 3).toUpperCase(),
                                                                        team: match.home_team_name,
                                                                        player: match.home_team_name ? match.home_player_name : null,
                                                                        logo: match.home_logo,
                                                                        id: match.home_participant_id || match.home_player_id
                                                                    }}
                                                                    away={{
                                                                        name: (match.away_team_name || match.away_player_name || 'TBD').substring(0, 3).toUpperCase(),
                                                                        team: match.away_team_name,
                                                                        player: match.away_team_name ? match.away_player_name : null,
                                                                        logo: match.away_logo,
                                                                        id: match.away_participant_id || match.away_player_id
                                                                    }}
                                                                    homeScore={match.home_score}
                                                                    awayScore={match.away_score}
                                                                    homePenalty={match.home_penalty_score}
                                                                    awayPenalty={match.away_penalty_score}
                                                                    status={match.status}
                                                                    leg={match._details.leg}
                                                                    group={match._details.groupName}
                                                                    time={match.start_time ? new Date(match.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                                                                    onClick={() => handleMatchClick(match.id)}
                                                                    aggregate={getAggregateInfo(match)}
                                                                    highlightParticipantId={userParticipantId}
                                                                    logoShape="square"
                                                                />
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-gray-500 py-8">Belum ada jadwal pertandingan</div>
                                )}
                            </div>
                        </Card>
                    </div>
                )
            }

            {activeTab === 'top_scores' && <TopScorerList scorers={topScorers} highlightParticipantId={userParticipantId} />}

            {activeTab === 'statistics' && <TournamentStatistics stats={statistics} loading={statisticsLoading} />}

        </div >
    )
}
