import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Timer, User, Goal, Flag, Play, Square, Save, Clock, Trophy, ChevronRight, CheckCircle, RotateCcw, Brain, Percent, History, BarChart2 } from 'lucide-react'
import Card, { CardContent, CardHeader } from '../../components/ui/Card'
import Button from '../../components/ui/Button'

// Mock Data for initial state (since we don't have a real backend yet)
const initialMatchData = {
    id: 1,
    homeTeam: { name: 'Barcelona FC', id: 'h1', players: ['Ter Stegen', 'Araujo', 'Pedri', 'Lewandowski', 'Gavi', 'De Jong'] },
    awayTeam: { name: 'Real Madrid', id: 'a1', players: ['Courtois', 'Alaba', 'Modric', 'Vinicius', 'Bellingham', 'Rodrygo'] },
    homeScore: 0,
    awayScore: 0,
    status: 'scheduled', // scheduled, live, finished
    startTime: '2024-03-20T20:00:00',
    events: [], // { id, type: 'goal'|'card', team: 'home'|'away', player, time, detail }
    penalties: null // { home: [], away: [] } if knockout & draw
}

export default function MatchManagement() {
    const { id, matchId } = useParams()
    const navigate = useNavigate()

    // State
    const [match, setMatch] = useState(initialMatchData)
    const [isPlaying, setIsPlaying] = useState(false)
    const [matchTime, setMatchTime] = useState(0) // in seconds
    const [halfDuration, setHalfDuration] = useState(6) // default 6 minutes per half

    // History Stack for Rollback
    const historyRef = useRef([])

    // Modal State for adding events
    const [showEventModal, setShowEventModal] = useState(false)
    const [eventType, setEventType] = useState('goal') // goal, card
    const [selectedTeam, setSelectedTeam] = useState(null) // 'home' or 'away'
    const [selectedPlayer, setSelectedPlayer] = useState('')
    // eventTime will store minutes as string for the input
    const [eventTime, setEventTime] = useState('')
    const [goalType, setGoalType] = useState('Open Play') // Open Play, Penalty

    // Celebration State
    const [showGoalCelebration, setShowGoalCelebration] = useState(false)
    const [celebrationData, setCelebrationData] = useState(null)

    // Tab State (Analysis vs Timeline)
    const [activeTab, setActiveTab] = useState('analysis')

    // Auto specific tab on kickoff
    useEffect(() => {
        if (match.status === '1st_half') {
            setActiveTab('timeline')
        }
    }, [match.status])

    // Penalty State (for knockout)
    const [showPenalties, setShowPenalties] = useState(false)
    const [penaltyScore, setPenaltyScore] = useState({ home: 0, away: 0 })
    const [penaltyHistory, setPenaltyHistory] = useState([]) // Array of kicks
    const [isPenaltyFinished, setIsPenaltyFinished] = useState(false)
    const [winner, setWinner] = useState(null)

    // Timer Logic
    useEffect(() => {
        let interval
        if (isPlaying && (match.status === '1st_half' || match.status === '2nd_half')) {
            const multiplier = 45 / halfDuration
            interval = setInterval(() => {
                setMatchTime(prev => prev + multiplier)
            }, 1000) // Real time seconds
        }
        return () => clearInterval(interval)
    }, [isPlaying, match.status, halfDuration])

    // Celebration Timer
    useEffect(() => {
        if (showGoalCelebration) {
            const timer = setTimeout(() => {
                setShowGoalCelebration(false)
                setCelebrationData(null)
            }, 3000)
            return () => clearTimeout(timer)
        }
    }, [showGoalCelebration])

    // Format Time Helper
    const formatTime = (totalSeconds) => {
        const total = Math.floor(totalSeconds)
        const minutes = Math.floor(total / 60)
        return `${minutes}'`
    }

    // State Saver Helper
    const saveState = () => {
        historyRef.current.push({
            match: JSON.parse(JSON.stringify(match)),
            isPlaying,
            matchTime,
            penaltyScore: { ...penaltyScore },
            penaltyHistory: [...penaltyHistory],
            isPenaltyFinished,
            winner
        })
    }

    // Handlers
    const handleStartMatch = () => {
        saveState()
        setMatch(prev => ({ ...prev, status: '1st_half' }))
        setMatchTime(0)
        setIsPlaying(true)
    }

    const handleEndFirstHalf = () => {
        saveState()
        setMatch(prev => ({ ...prev, status: 'halftime' }))
        setIsPlaying(false)
    }

    const handleStartSecondHalf = () => {
        saveState()
        setMatch(prev => ({ ...prev, status: '2nd_half' }))
        setMatchTime(45 * 60) // Start 2nd half at 45:00
        setIsPlaying(true)
    }

    const handlePauseMatch = () => {
        setIsPlaying(false)
    }

    const handleResumeMatch = () => {
        setIsPlaying(true)
    }

    const handleRollback = () => {
        if (historyRef.current.length === 0) return

        const previousState = historyRef.current.pop()
        setMatch(previousState.match)
        setIsPlaying(previousState.isPlaying)
        setMatchTime(previousState.matchTime)
        setPenaltyScore(previousState.penaltyScore)
        setPenaltyHistory(previousState.penaltyHistory)
        setIsPenaltyFinished(previousState.isPenaltyFinished)
        setWinner(previousState.winner)
    }


    const handleFinishMatch = () => {
        saveState()
        setIsPlaying(false)
        setMatch(prev => ({ ...prev, status: 'finished' }))

        // Determine Winner (Regular Time)
        if (match.homeScore > match.awayScore) {
            setWinner(match.homeTeam.name)
        } else if (match.awayScore > match.homeScore) {
            setWinner(match.awayTeam.name)
        } else {
            setWinner('Draw')
        }
    }

    const handleAddEvent = (type, team) => {
        setEventType(type)
        setSelectedTeam(team)
        // Default to current minute (e.g. 0-59s = 1')
        const currentMinute = Math.floor(matchTime / 60) + 1
        setEventTime(currentMinute.toString())
        setGoalType('Open Play')
        setShowEventModal(true)
    }

    const submitEvent = () => {
        saveState()
        const newEvent = {
            id: Date.now(),
            type: eventType,
            team: selectedTeam,
            player: selectedPlayer,
            time: eventTime, // We keep the manual input minute
            detail: eventType === 'goal' ? goalType : null
        }

        setMatch(prev => {
            const updates = { events: [...prev.events, newEvent].sort((a, b) => parseInt(a.time) - parseInt(b.time)) }

            if (eventType === 'goal') {
                if (selectedTeam === 'home') updates.homeScore = prev.homeScore + 1
                else updates.awayScore = prev.awayScore + 1

                // Trigger Celebration
                setCelebrationData({
                    player: selectedPlayer,
                    teamName: selectedTeam === 'home' ? prev.homeTeam.name : prev.awayTeam.name,
                    teamSide: selectedTeam
                })
                setShowGoalCelebration(true)
            }

            return { ...prev, ...updates }
        })

        setShowEventModal(false)
        setSelectedPlayer('')
    }

    // ... existing render ...

    // Render Helpers
    const getTeamPlayers = (teamSide) => {
        if (!teamSide) return []
        return teamSide === 'home' ? match.homeTeam.players : match.awayTeam.players
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto relative">
            {/* Goal Celebration Overlay */}
            {showGoalCelebration && celebrationData && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="relative z-10 text-center animate-in zoom-in-50 duration-500 slide-in-from-bottom-10">
                        <h1 className="text-8xl md:text-9xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 drop-shadow-[0_0_30px_rgba(234,179,8,0.5)] transform -rotate-6 animate-bounce">
                            GOAL!!!
                        </h1>
                        <div className="mt-8 space-y-2">
                            <div className="text-4xl md:text-6xl font-display font-bold text-white tracking-wider uppercase drop-shadow-2xl">
                                {celebrationData.player}
                            </div>
                            <div className={`text-xl md:text-2xl font-bold uppercase tracking-widest ${celebrationData.teamSide === 'home' ? 'text-blue-400' : 'text-red-400'}`}>
                                {celebrationData.teamName}
                            </div>
                        </div>
                    </div>
                    {/* Confetti or particle effects can be simulated with simple divs or background if desired, but keeping it clean for now */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-yellow-400 rounded-full animate-ping opacity-75 duration-1000"></div>
                        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-red-500 rounded-full animate-ping opacity-75 duration-700 delay-100"></div>
                        <div className="absolute bottom-1/4 left-1/3 w-5 h-5 bg-blue-400 rounded-full animate-ping opacity-75 duration-1200 delay-200"></div>
                    </div>
                </div>
            )}

            {/* Header / Nav */}
            <button
                onClick={() => navigate(`/dashboard/tournaments/${id}`)}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition"
            >
                <ArrowLeft className="w-4 h-4" /> Kembali ke Turnamen
            </button>

            {/* Scoreboard Main */}
            <Card className="overflow-hidden">
                <div className="bg-[#0a0a0a] p-6 sm:p-10 text-center relative">
                    {/* Winner Banner */}
                    {match.status === 'finished' && winner && (
                        <div className="absolute top-0 left-0 w-full bg-neonGreen/20 py-2 border-b border-neonGreen/20 animate-in slide-in-from-top-4 fade-in duration-500">
                            <span className="text-neonGreen font-display font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                                <Trophy className="w-4 h-4" /> Winner: {winner}
                            </span>
                        </div>
                    )}
                    {/* Status Badge */}
                    <div className={`absolute left-1/2 -translate-x-1/2 transition-all duration-500 ${match.status === 'finished' && winner ? 'top-16' : 'top-4'}`}>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${['1st_half', '2nd_half'].includes(match.status) ? 'bg-red-500 text-white animate-pulse' :
                            match.status === 'finished' ? 'bg-neonGreen/20 text-neonGreen' :
                                'bg-white/10 text-gray-400'
                            }`}>
                            {['1st_half', '2nd_half'].includes(match.status) ? <span className="font-mono">LIVE • {formatTime(matchTime)}</span> :
                                match.status === 'halftime' ? 'HALF TIME' :
                                    match.status === 'finished' ? 'FULL TIME' :
                                        new Date(match.startTime).toLocaleDateString()}
                        </span>
                    </div>

                    <div className="flex items-center justify-between mt-8">
                        {/* Home Team */}
                        <div className="flex flex-col items-center flex-1">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-blue-500/20 ring-4 ring-blue-500/10 flex items-center justify-center mb-4">
                                <span className="text-2xl sm:text-3xl font-bold text-blue-400">{match.homeTeam.name.charAt(0)}</span>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-display font-bold">{match.homeTeam.name}</h2>

                            {/* Home Scorers */}
                            <div className="mt-4 space-y-1">
                                {match.events
                                    .filter(e => e.type === 'goal' && e.team === 'home')
                                    .map(e => (
                                        <div key={e.id} className="text-sm text-gray-400 flex items-center justify-center gap-1">
                                            <Goal className="w-3 h-3 text-neonGreen" /> {e.player} {e.time}' {e.detail === 'Penalty' && '(P)'}
                                        </div>
                                    ))}
                            </div>
                        </div>

                        {/* Score */}
                        <div className="px-4 sm:px-12">
                            <div className="text-5xl sm:text-7xl font-display font-bold tracking-tighter flex items-center gap-4">
                                <span className={match.homeScore > match.awayScore ? 'text-neonGreen' : 'text-white'}>
                                    {match.homeScore}
                                </span>
                                <span className="text-white/20">:</span>
                                <span className={match.awayScore > match.homeScore ? 'text-neonGreen' : 'text-white'}>
                                    {match.awayScore}
                                </span>
                            </div>
                            {/* Penalty Score Subtitle */}
                            {penaltyHistory.length > 0 && (
                                <div className="text-sm text-gray-400 mt-2 font-mono">
                                    (Pen: {penaltyScore.home} - {penaltyScore.away})
                                </div>
                            )}
                        </div>

                        {/* Away Team */}
                        <div className="flex flex-col items-center flex-1">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-red-500/20 ring-4 ring-red-500/10 flex items-center justify-center mb-4">
                                <span className="text-2xl sm:text-3xl font-bold text-red-400">{match.awayTeam.name.charAt(0)}</span>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-display font-bold">{match.awayTeam.name}</h2>

                            {/* Away Scorers */}
                            <div className="mt-4 space-y-1">
                                {match.events
                                    .filter(e => e.type === 'goal' && e.team === 'away')
                                    .map(e => (
                                        <div key={e.id} className="text-sm text-gray-400 flex items-center justify-center gap-1">
                                            <Goal className="w-3 h-3 text-neonGreen" /> {e.player} {e.time}' {e.detail === 'Penalty' && '(P)'}
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls Bar */}
                <div className="border-t border-white/5 bg-white/5 p-4 flex flex-wrap items-center justify-between gap-3">
                    {/* Left: Home Actions */}
                    <div className="flex-1 flex justify-start">
                        {['1st_half', '2nd_half'].includes(match.status) && (
                            <Button variant="secondary" onClick={() => handleAddEvent('goal', 'home')}>
                                + Goal Home
                            </Button>
                        )}
                    </div>

                    {/* Center: Game Flow */}
                    <div className="flex flex-col items-center gap-2">
                        {/* Duration Selector */}
                        {match.status === 'scheduled' && (
                            <div className="flex flex-col sm:flex-row items-center gap-2 mb-2 bg-black/30 p-2 rounded-lg w-full sm:w-auto">
                                <span className="text-xs text-gray-400 whitespace-nowrap">Waktu Match:</span>
                                <div className="flex flex-wrap justify-center gap-1">
                                    {[4, 5, 6, 7, 8, 9, 10, 12, 15, 45].map(d => (
                                        <button
                                            key={d}
                                            onClick={() => setHalfDuration(d)}
                                            className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold transition-all ${halfDuration === d
                                                ? 'bg-neonGreen text-black scale-110'
                                                : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white'
                                                }`}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            {match.status === 'scheduled' && (
                                <Button onClick={handleStartMatch} className="bg-neonGreen hover:bg-neonGreen/80 text-black">
                                    <Play className="w-4 h-4 mr-2" /> Kick Off ({halfDuration}')
                                </Button>
                            )}

                            {match.status === '1st_half' && (
                                <Button variant="outline" onClick={handleEndFirstHalf}>
                                    <Timer className="w-4 h-4 mr-2" /> End 1st Half
                                </Button>
                            )}

                            {match.status === 'halftime' && (
                                <Button className="bg-neonGreen text-black" onClick={handleStartSecondHalf}>
                                    <Play className="w-4 h-4 mr-2" /> Start 2nd Half
                                </Button>
                            )}

                            {/* Pause/Resume only active during play */}
                            {['1st_half', '2nd_half'].includes(match.status) && (
                                <Button variant="outline" onClick={isPlaying ? handlePauseMatch : handleResumeMatch}>
                                    {isPlaying ? <><Square className="w-4 h-4 mr-2" /> Pause</> : <><Play className="w-4 h-4 mr-2" /> Resume</>}
                                </Button>
                            )}

                            {/* Fulltime always available after kickoff */}
                            {match.status !== 'scheduled' && match.status !== 'finished' && (
                                <Button variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={handleFinishMatch}>
                                    <Flag className="w-4 h-4 mr-2" /> Fulltime
                                </Button>
                            )}

                            {/* Rollback */}
                            {historyRef.current.length > 0 && (
                                <Button variant="ghost" className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10" onClick={handleRollback}>
                                    <RotateCcw className="w-4 h-4 mr-2" /> Rollback
                                </Button>
                            )}

                            {match.status === 'finished' && match.homeScore === match.awayScore && !showPenalties && (
                                <Button variant="outline" onClick={() => { saveState(); setShowPenalties(true); }}>
                                    <Trophy className="w-4 h-4 mr-2" /> Adu Penalti
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Right: Away Actions */}
                    <div className="flex-1 flex justify-end">
                        {['1st_half', '2nd_half'].includes(match.status) && (
                            <Button variant="secondary" onClick={() => handleAddEvent('goal', 'away')}>
                                + Goal Away
                            </Button>
                        )}
                    </div>
                </div>
            </Card>

            {/* Penalty Section (Conditional) */}
            {(showPenalties || penaltyHistory.length > 0) && (
                <Card>
                    <CardHeader>
                        <h3 className="font-display font-bold flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-400" /> Penalty Shootout
                        </h3>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-center mb-6 px-4 py-3 bg-white/5 rounded-lg">
                            <div className="text-center">
                                <div className="text-xl font-bold">{penaltyScore.home}</div>
                                <div className="text-xs text-gray-400">{match.homeTeam.name}</div>
                            </div>
                            <div className="text-sm font-mono text-gray-500">VS</div>
                            <div className="text-center">
                                <div className="text-xl font-bold">{penaltyScore.away}</div>
                                <div className="text-xs text-gray-400">{match.awayTeam.name}</div>
                            </div>
                        </div>

                        <div className="flex gap-8 justify-center">
                            {/* Home Buttons */}
                            <div className="space-y-2 text-center">
                                <div className="text-xs text-gray-500 mb-2">Home Kick</div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handlePenaltyUpdate('home', true)}
                                        className="w-10 h-10 rounded-full bg-neonGreen/20 hover:bg-neonGreen text-neonGreen hover:text-black flex items-center justify-center transition"
                                    >
                                        <Goal className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handlePenaltyUpdate('home', false)}
                                        className="w-10 h-10 rounded-full bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white flex items-center justify-center transition"
                                    >
                                        <Flag className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Away Buttons */}
                            <div className="space-y-2 text-center">
                                <div className="text-xs text-gray-500 mb-2">Away Kick</div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handlePenaltyUpdate('away', true)}
                                        className="w-10 h-10 rounded-full bg-neonGreen/20 hover:bg-neonGreen text-neonGreen hover:text-black flex items-center justify-center transition"
                                    >
                                        <Goal className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handlePenaltyUpdate('away', false)}
                                        className="w-10 h-10 rounded-full bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white flex items-center justify-center transition"
                                    >
                                        <Flag className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* History Visualization */}
                        <div className="mt-6 flex justify-center gap-2">
                            {penaltyHistory.map((kick, i) => (
                                <div key={i} className={`w-3 h-3 rounded-full ${kick.isGoal ? 'bg-neonGreen' : 'bg-red-500'}`} title={`${kick.team} - ${kick.isGoal ? 'Goal' : 'Miss'}`}></div>
                            ))}
                        </div>

                        {/* Finish Penalty Button */}
                        {!isPenaltyFinished && (
                            <div className="mt-6 flex justify-center">
                                <Button
                                    className="bg-white/10 hover:bg-white/20 text-white"
                                    onClick={handleFinishPenalties}
                                    disabled={penaltyHistory.length < 2 && Math.abs(penaltyScore.home - penaltyScore.away) === 0}
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" /> Selesai Penalti
                                </Button>
                            </div>
                        )}

                        {isPenaltyFinished && (
                            <div className="mt-6 text-center text-sm text-gray-400">
                                <span className="text-neonGreen">Penalti Selesai.</span> Hasil akhir ditentukan.
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Tabs & Content */}
            <Card hover={false} className="overflow-hidden">
                <div className="flex border-b border-white/10">
                    <button
                        onClick={() => setActiveTab('analysis')}
                        className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition relative ${activeTab === 'analysis' ? 'text-neonGreen' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Brain className="w-4 h-4" /> match Analysis
                        {activeTab === 'analysis' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-neonGreen"></div>}
                    </button>
                    {match.status !== 'scheduled' && (
                        <button
                            onClick={() => setActiveTab('timeline')}
                            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition relative ${activeTab === 'timeline' ? 'text-neonGreen' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Clock className="w-4 h-4" /> Match Timeline
                            {activeTab === 'timeline' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-neonGreen"></div>}
                        </button>
                    )}
                </div>

                <CardContent className="p-0">
                    {/* ANALYSIS TAB */}
                    {activeTab === 'analysis' && (
                        <div className="divide-y divide-white/5">
                            {/* Win Probability */}
                            <div className="p-6">
                                <h3 className="font-display font-bold mb-4 flex items-center gap-2">
                                    <Percent className="w-5 h-5 text-neonPink" /> Win Probability (AI Prediction)
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm font-bold mb-1">
                                        <span className="text-blue-400">Home 45%</span>
                                        <span className="text-gray-400">Draw 25%</span>
                                        <span className="text-red-400">Away 30%</span>
                                    </div>
                                    <div className="h-3 bg-white/10 rounded-full overflow-hidden flex">
                                        <div className="h-full bg-blue-500" style={{ width: '45%' }}></div>
                                        <div className="h-full bg-gray-500" style={{ width: '25%' }}></div>
                                        <div className="h-full bg-red-500" style={{ width: '30%' }}></div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2 italic">
                                        "Berdasarkan performa 5 pertandingan terakhir, Barcelona FC memiliki sedikit keunggulan taktis di lini tengah, namun serangan balik Real Madrid patut diwaspadai."
                                    </p>
                                </div>
                            </div>

                            {/* Head to Head */}
                            <div className="p-6">
                                <h3 className="font-display font-bold mb-4 flex items-center gap-2">
                                    <History className="w-5 h-5 text-yellow-400" /> Head to Head
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-blue-400">BAR</span>
                                            <span className="text-sm text-gray-400 font-mono">2 - 1</span>
                                            <span className="font-bold text-red-400">RMA</span>
                                        </div>
                                        <div className="text-xs text-gray-500">Last Season</div>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-red-400">RMA</span>
                                            <span className="text-sm text-gray-400 font-mono">3 - 1</span>
                                            <span className="font-bold text-blue-400">BAR</span>
                                        </div>
                                        <div className="text-xs text-gray-500">Cup Final</div>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-blue-400">BAR</span>
                                            <span className="text-sm text-gray-400 font-mono">0 - 0</span>
                                            <span className="font-bold text-red-400">RMA</span>
                                        </div>
                                        <div className="text-xs text-gray-500">Friendly</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TIMELINE TAB */}
                    {activeTab === 'timeline' && (
                        <div className="p-6">
                            {match.events.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">Belum ada kejadian</div>
                            ) : (
                                <div className="relative border-l border-white/10 ml-4 space-y-6 py-2">
                                    {match.events.map((event) => (
                                        <div key={event.id} className="relative pl-6">
                                            <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full ${event.team === 'home' ? 'bg-blue-500' : 'bg-red-500'}`}></div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-bold text-neonGreen">{event.time}'</span>
                                                <span className="font-bold flex items-center gap-1">
                                                    {event.type === 'goal' && <Goal className="w-4 h-4 text-neonGreen" />}
                                                    {event.type === 'card' && <div className="w-3 h-4 bg-yellow-500 rounded-sm"></div>}
                                                    {event.type.toUpperCase()}
                                                </span>
                                                <span className="text-gray-400">- {event.player} {event.detail === 'Penalty' && '(P)'} ({event.team === 'home' ? match.homeTeam.name : match.awayTeam.name})</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Event Modal */}
            {showEventModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#111] border border-white/10 rounded-xl w-full max-w-md p-6">
                        <h3 className="font-display font-bold text-xl mb-4">
                            Tambah {eventType === 'goal' ? 'Gol' : 'Kartu'} - {selectedTeam === 'home' ? match.homeTeam.name : match.awayTeam.name}
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Pilih Pemain</label>
                                <select
                                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 outline-none focus:border-neonGreen"
                                    value={selectedPlayer}
                                    onChange={(e) => setSelectedPlayer(e.target.value)}
                                >
                                    <option value="">-- Pilih Pemain --</option>
                                    {getTeamPlayers(selectedTeam).map(p => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                            </div>

                            {eventType === 'goal' && (
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Tipe Gol</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="goalType"
                                                value="Open Play"
                                                checked={goalType === 'Open Play'}
                                                onChange={(e) => setGoalType(e.target.value)}
                                                className="accent-neonGreen"
                                            />
                                            <span className="text-white">Open Play</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="goalType"
                                                value="Penalty"
                                                checked={goalType === 'Penalty'}
                                                onChange={(e) => setGoalType(e.target.value)}
                                                className="accent-neonGreen"
                                            />
                                            <span className="text-white">Penalty</span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Waktu (Menit)</label>
                                <input
                                    type="number"
                                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 outline-none focus:border-neonGreen"
                                    value={eventTime}
                                    onChange={(e) => setEventTime(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-3 mt-6">
                                <Button className="flex-1" variant="ghost" onClick={() => setShowEventModal(false)}>Batal</Button>
                                <Button className="flex-1 bg-neonGreen text-black" onClick={submitEvent} disabled={!selectedPlayer}>Simpan</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
