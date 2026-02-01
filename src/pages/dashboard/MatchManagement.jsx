import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Timer, User, Goal, Flag, Play, Square, Save, Clock, Trophy, ChevronRight, CheckCircle, RotateCcw, Brain, Percent, History, BarChart2, Search } from 'lucide-react'
import Card, { CardContent, CardHeader } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import AsyncPlayerSelect from '../../components/ui/AsyncPlayerSelect'
import { authFetch } from '../../utils/api'

// Initial State (will be populated from API)
const initialMatchData = {
    id: null,
    homeTeam: { name: 'Home', id: null, players: [] },
    awayTeam: { name: 'Away', id: null, players: [] },
    homeScore: 0,
    awayScore: 0,
    status: 'scheduled',
    startTime: null,
    events: [],
    penalties: null,
    analysis: null // Will be populated from API
}

export default function MatchManagement() {
    const { id, matchId } = useParams()
    const navigate = useNavigate()

    // State
    // State
    const [match, setMatch] = useState(initialMatchData)
    const [loading, setLoading] = useState(true)
    const [isPlaying, setIsPlaying] = useState(false)
    const [matchTime, setMatchTime] = useState(0) // in seconds
    const [halfDuration, setHalfDuration] = useState(6) // default 6 minutes per half
    const [showRedirectModal, setShowRedirectModal] = useState(false) // New state
    const [leg1Data, setLeg1Data] = useState(null) // For aggregate calculation
    const [showLeg1PendingModal, setShowLeg1PendingModal] = useState(false)
    const [pendingLeg1MatchId, setPendingLeg1MatchId] = useState(null)
    // New state for Previous Round Check
    const [showPreviousRoundModal, setShowPreviousRoundModal] = useState(false)
    const [previousRoundNumber, setPreviousRoundNumber] = useState(null)

    const [isSubmitting, setIsSubmitting] = useState(false)

    // Fetch Match Data Function
    const fetchMatchData = async () => {
        setLeg1Data(null); // Reset leg 1 data
        setShowLeg1PendingModal(false); // Reset modal state
        try {
            const response = await authFetch(`/api/matches/${matchId}`)
            const data = await response.json()
            if (data.success) {
                let localStatus = data.data.status

                // VALIDATION: Redirect if participants not ready (TBD)
                if (!data.data.homeTeam.id || !data.data.awayTeam.id) {
                    setShowRedirectModal(true)
                    return
                }

                let details = data.data.details || {}
                try {
                    if (typeof details === 'string') details = JSON.parse(details)
                } catch (e) {
                    console.error("Failed to parse match details", e)
                    details = {}
                }

                // Map DB status to Local Status
                if (data.data.status === 'live') {
                    if (details.period === 'fulltime') {
                        localStatus = 'fulltime_pending'
                    } else {
                        localStatus = details.period || '1st_half'
                    }
                } else if (data.data.status === 'completed') {
                    localStatus = 'finished'
                }

                // Deduplicate is good backup, but reloading replaces state anyway
                const uniqueEvents = (data.data.events || []).filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);

                setMatch({
                    ...data.data,
                    status: localStatus,
                    // Ensure defaults if null
                    homeScore: data.data.homeScore || 0,
                    awayScore: data.data.awayScore || 0,
                    events: uniqueEvents
                })

                // Penalty State
                if (data.data.homePenaltyScore != null || data.data.awayPenaltyScore != null) {
                    setPenaltyScore({
                        home: data.data.homePenaltyScore || 0,
                        away: data.data.awayPenaltyScore || 0
                    })
                    // If match is finished/completed and we have penalty scores, show them
                    if (['finished', 'fulltime_pending'].includes(localStatus)) {
                        setShowPenalties(true)
                        setIsPenaltyFinished(true) // Assume finished if loaded from DB with scores
                    }
                }
            }

            // Check for Leg 2 and fetch aggregate data
            let details = data.data.details || {}
            try {
                if (typeof details === 'string') details = JSON.parse(details)
            } catch (e) { }

            console.log('DEBUG: Match Details:', details);
            console.log('DEBUG: Leg Check:', details.leg, 'Is Leg 2?', details.leg == 2);
            // ALWAYS fetch tournament matches to check for Previous Round Completion & Leg 1
            const tId = data.data.tournamentId || data.data.tournament_id;
            if (tId) {
                try {
                    const tResponse = await authFetch(`/api/tournaments/${tId}/matches`);
                    const tData = await tResponse.json();

                    if (tData.success && tData.data) {
                        const matches = tData.data;
                        const currentRound = data.data.round;

                        // CHECK 1: Previous Round Completion
                        if (data.data.round > 1) {
                            const currentRoundNum = Number(data.data.round);

                            // Find actual previous round (to handle gaps like Group(1-3) -> KO(10))
                            // Extract unique rounds from matches
                            const allRounds = [...new Set(matches.map(m => m.round))].sort((a, b) => a - b);
                            const currentRoundIndex = allRounds.indexOf(currentRoundNum);

                            // If current round is found and has a predecessor
                            if (currentRoundIndex > 0) {
                                const prevRound = allRounds[currentRoundIndex - 1];
                                const prevRoundMatches = matches.filter(m => m.round == prevRound);

                                // Check if ANY match in previous round is NOT completed
                                const incompleteMatch = prevRoundMatches.find(m => m.status !== 'completed');

                                if (incompleteMatch) {
                                    setPreviousRoundNumber(prevRound);
                                    setShowPreviousRoundModal(true);
                                }
                            }
                        }

                        // CHECK 2: Leg 2 Logic (Existing)
                        if (details.leg == 2) {
                            const leg1 = matches.find(m => {
                                let d = {};
                                try { d = typeof m.details === 'string' ? JSON.parse(m.details) : m.details || {}; } catch (e) { }

                                // Strategy 1: strict groupId match
                                if (d.groupId && details.groupId && d.groupId == details.groupId && d.leg == 1) return true;

                                // Strategy 2: Fuzzy match
                                if (d.round === details.round && d.leg == 1) {
                                    const currentHomeId = data.data.homeTeam.id;
                                    const currentAwayId = data.data.awayTeam.id;
                                    const mHomeId = m.home_participant_id;
                                    const mAwayId = m.away_participant_id;

                                    const isTeamMatch =
                                        (mHomeId == currentHomeId && mAwayId == currentAwayId) ||
                                        (mHomeId == currentAwayId && mAwayId == currentHomeId);

                                    if (isTeamMatch) return true;
                                }
                                return false;
                            });

                            if (leg1) {
                                setLeg1Data(leg1);
                                if (leg1.status !== 'completed' && leg1.status !== 'finished') {
                                    setPendingLeg1MatchId(leg1.id);
                                    setShowLeg1PendingModal(true);
                                }
                            }
                        }
                    }
                } catch (err) {
                    console.error("Failed to fetch tournament matches for validation", err);
                }
            }
        } catch (err) {
            console.error("Fetch match error", err)
        } finally {
            setLoading(false)
        }
    }

    // Initial Fetch
    useEffect(() => {
        if (matchId) fetchMatchData()
    }, [matchId])

    // ... 

    const submitEvent = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        saveState()
        const finalPlayerName = isManualInput ? manualPlayerName : selectedPlayer

        if (!finalPlayerName) {
            setIsSubmitting(false);
            return
        }

        const finalType = (eventType === 'goal' && goalType === 'Own Goal') ? 'own_goal' : eventType

        const newEvent = {
            id: Date.now(), // Temporary ID for optimistic UI
            type: finalType,
            team: selectedTeam,
            player: finalPlayerName,
            time: eventTime,
            detail: eventType === 'goal' ? goalType : cardType
        }

        // Optimistic Update
        setMatch(prev => {
            const updates = { events: [...prev.events, newEvent].sort((a, b) => parseInt(a.time) - parseInt(b.time)) }
            let homeScore = prev.homeScore
            let awayScore = prev.awayScore

            if (eventType === 'goal') {
                if (selectedTeam === 'home') homeScore += 1
                else awayScore += 1

                updates.homeScore = homeScore
                updates.awayScore = awayScore

                // Trigger Celebration
                setCelebrationData({
                    player: finalPlayerName,
                    teamName: selectedTeam === 'home' ? prev.homeTeam.name : prev.awayTeam.name,
                    teamSide: selectedTeam
                })
                setShowGoalCelebration(true)
            }
            return { ...prev, ...updates }
        })

        try {
            // Sync to server (Create Event)
            await createEventServer({
                type: finalType,
                team: selectedTeam,
                player: finalPlayerName,
                time: eventTime,
                detail: eventType === 'goal' ? goalType : cardType
            })
            // RELOAD DATA TO GET REAL IDs (Fixes Double Goal)
            await fetchMatchData()
        } catch (error) {
            console.error("Submit failed", error)
        } finally {
            setIsSubmitting(false)
        }

        setShowEventModal(false)
        setSelectedPlayer('')
        setManualPlayerName('')
        setIsManualInput(false)
    }

    // Create Event on Server
    const createEventServer = async (eventData) => {
        const response = await authFetch(`/api/matches/${matchId}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData)
        })
        const data = await response.json()
        if (!data.success) throw new Error(data.message)
        return data
    }

    // Update Match to Server (Status only)
    const updateMatchServer = async (localUpdates) => {
        try {
            // Map Local Status to DB Status & Period
            const dbUpdates = {}

            if (localUpdates.status) {
                if (['1st_half', '2nd_half', 'halftime'].includes(localUpdates.status)) {
                    dbUpdates.status = 'live'
                    dbUpdates.period = localUpdates.status
                } else if (localUpdates.status === 'fulltime_pending') {
                    dbUpdates.status = 'live'
                    dbUpdates.period = 'fulltime'
                } else if (localUpdates.status === 'finished') {
                    dbUpdates.status = 'completed'
                    dbUpdates.period = 'fulltime'
                } else {
                    dbUpdates.status = localUpdates.status
                }
            }

            // Pass other updates
            if (localUpdates.hasOwnProperty('homeScore')) dbUpdates.homeScore = localUpdates.homeScore
            if (localUpdates.hasOwnProperty('awayScore')) dbUpdates.awayScore = localUpdates.awayScore
            if (localUpdates.hasOwnProperty('homePenaltyScore')) dbUpdates.homePenaltyScore = localUpdates.homePenaltyScore
            if (localUpdates.hasOwnProperty('awayPenaltyScore')) dbUpdates.awayPenaltyScore = localUpdates.awayPenaltyScore

            await authFetch(`/api/matches/${matchId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dbUpdates)
            })
        } catch (err) {
            console.error("Update match error", err)
        }
    }

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
    const [cardType, setCardType] = useState('Yellow Card') // Yellow Card, Red Card
    const [isManualInput, setIsManualInput] = useState(false)
    const [manualPlayerName, setManualPlayerName] = useState('')

    // Celebration State
    const [showGoalCelebration, setShowGoalCelebration] = useState(false)
    const [celebrationData, setCelebrationData] = useState(null)

    // Tab State (Analysis vs Timeline)
    const [activeTab, setActiveTab] = useState('analysis')

    // Auto specific tab on kickoff or completed
    useEffect(() => {
        if (match.status === '1st_half' || match.status === 'finished' || match.status === 'completed') {
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
        updateMatchServer({ status: '1st_half' })
    }

    const handleEndFirstHalf = () => {
        saveState()
        setMatch(prev => ({ ...prev, status: 'halftime' }))
        setIsPlaying(false)
        updateMatchServer({ status: 'halftime' })
    }

    const handleStartSecondHalf = () => {
        saveState()
        setMatch(prev => ({ ...prev, status: '2nd_half' }))
        setMatchTime(45 * 60) // Start 2nd half at 45:00
        setIsPlaying(true)
        updateMatchServer({ status: '2nd_half' })
    }

    const handlePauseMatch = () => {
        setIsPlaying(false)
    }

    const handleResumeMatch = () => {
        setIsPlaying(true)
    }

    const handleRollback = async () => {
        // Special case: Rollback from Fulltime Pending with empty history (e.g. after refresh)
        if (historyRef.current.length === 0 && match.status === 'fulltime_pending') {
            setMatch(prev => ({ ...prev, status: '2nd_half' }))
            updateMatchServer({ status: '2nd_half' })
            return
        }

        if (historyRef.current.length === 0) return

        const previousState = historyRef.current.pop()

        // Check if we need to rollback duplicate event on server
        // Detect if the previous state had FEWER events than current
        if (previousState.match.events.length < match.events.length) {
            try {
                await authFetch(`/api/matches/${matchId}/events/last`, {
                    method: 'DELETE'
                })
            } catch (err) {
                console.error("Server rollback failed", err)
            }
        }

        setMatch(previousState.match)
        setIsPlaying(previousState.isPlaying)
        setMatchTime(previousState.matchTime)
        setPenaltyScore(previousState.penaltyScore)
        setPenaltyHistory(previousState.penaltyHistory)
        setIsPenaltyFinished(previousState.isPenaltyFinished)
        setWinner(previousState.winner)

        // Also sync status to server if it changed (e.g. un-finish match)
        if (previousState.match.status !== match.status) {
            updateMatchServer({ status: previousState.match.status })
        }
    }


    const handleFinishMatch = () => {
        saveState()
        setIsPlaying(false)
        setMatch(prev => ({ ...prev, status: 'fulltime_pending' }))
        updateMatchServer({ status: 'fulltime_pending' })
    }

    const [showConfirmModal, setShowConfirmModal] = useState(false)

    const handleConfirmMatch = () => {
        setShowConfirmModal(true)
    }

    const confirmMatchFinal = () => {
        // No saveState here because we don't want to rollback from Completed
        saveState()
        setMatch(prev => ({ ...prev, status: 'completed' }))
        const isLeg1 = match.details?.leg === 1

        // Only save penalties if they were actually part of the match
        const hasPenalties = showPenalties && !isLeg1

        updateMatchServer({
            status: 'completed',
            homePenaltyScore: hasPenalties ? penaltyScore.home : null,
            awayPenaltyScore: hasPenalties ? penaltyScore.away : null
        })

        // Determine Winner (Regular Time)
        if (match.homeScore > match.awayScore) {
            setWinner(match.homeTeam.name)
        } else if (match.awayScore > match.homeScore) {
            setWinner(match.awayTeam.name)
        } else {
            setWinner('Draw')
        }
        setShowConfirmModal(false)
    }

    const handleAddEvent = (type, team) => {
        setEventType(type)
        setSelectedTeam(team)
        // Default to current minute (e.g. 0-59s = 1')
        const currentMinute = Math.floor(matchTime / 60) + 1
        setEventTime(currentMinute.toString())
        setEventTime(currentMinute.toString())
        setGoalType('Open Play')
        setCardType('Yellow Card')
        setIsManualInput(false)
        setManualPlayerName('')
        setShowEventModal(true)
    }



    // ... existing render ...

    const handlePenaltyUpdate = (team, isGoal) => {
        saveState()
        const newHistory = [...penaltyHistory, { team, isGoal }]
        setPenaltyHistory(newHistory)

        const newScore = { ...penaltyScore }
        if (isGoal) {
            newScore[team] += 1
        }
        setPenaltyScore(newScore)

        // Optimistic update to server
        const updates = {}
        if (team === 'home') updates.homePenaltyScore = newScore.home
        else updates.awayPenaltyScore = newScore.away

        updateMatchServer(updates)
    }

    const handleFinishPenalties = () => {
        setIsPenaltyFinished(true)
        // Determine Winner including penalties
        if (penaltyScore.home > penaltyScore.away) {
            setWinner(match.homeTeam.name)
        } else if (penaltyScore.away > penaltyScore.home) {
            setWinner(match.awayTeam.name)
        }

        // Note: We DO NOT finish the match here anymore.
        // We leave it in 'fulltime_pending' so the "Confirm Match Result" button appears.
    }

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

            {/* Leg 1 Pending Modal */}
            <Modal isOpen={showLeg1PendingModal} onClose={() => navigate(`/dashboard/tournaments/${id}`)}>
                <div className="text-center p-4">
                    <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold font-display mb-2">Leg 1 Belum Selesai!</h2>
                    <p className="text-gray-400 mb-6">
                        Pertandingan Leg 1 harus diselesaikan terlebih dahulu sebelum memulai Leg 2.
                        Silakan selesaikan Leg 1 untuk mendapatkan skor agregat yang valid.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Button variant="outline" onClick={() => navigate(`/dashboard/tournaments/${id}`)}>
                            Kembali ke Bracket
                        </Button>
                        <Button className="bg-neonGreen text-black" onClick={() => navigate(`/dashboard/tournaments/${id}/match/${pendingLeg1MatchId}`)}>
                            Buka Match Leg 1 <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Previous Round Pending Modal */}
            <Modal isOpen={showPreviousRoundModal} onClose={() => navigate(`/dashboard/tournaments/${id}`)}>
                <div className="text-center p-4">
                    <History className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold font-display mb-2 text-white">
                        {match.tournamentType === 'league' ? 'Matchday' : 'Ronde'} {previousRoundNumber} Belum Selesai
                    </h2>
                    <p className="text-gray-400 mb-6">
                        Maaf, Anda tidak dapat mengakses pertandingan di {match.tournamentType === 'league' ? 'Matchday' : 'Ronde'} ini karena pertandingan di
                        <strong className="text-white"> {match.tournamentType === 'league' ? 'Matchday' : 'Ronde'} {previousRoundNumber}</strong> belum selesai sepenuhnya.
                        Silakan selesaikan semua pertandingan di {match.tournamentType === 'league' ? 'Matchday' : 'putaran'} sebelumnya terlebih dahulu.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Button
                            className="bg-neonGreen text-black w-full"
                            onClick={() => navigate(`/dashboard/tournaments/${id}`)}
                        >
                            <Clock className="w-4 h-4 mr-2" /> Kembali ke Jadwal
                        </Button>
                    </div>
                </div>
            </Modal>

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
                    {/* Match Info Bar - Round/Stage */}
                    <div className="absolute top-2 left-4 flex items-center gap-2 text-xs text-gray-500">
                        <span className="bg-white/5 px-2 py-1 rounded">
                            {match.tournamentType === 'league'
                                ? `Matchday ${match.round}`
                                : match.details?.roundName
                                    ? match.details.roundName
                                    : `Round ${match.round}`}
                        </span>
                        {match.details?.groupName && (
                            <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                                {match.details.groupName}
                            </span>
                        )}
                        {match.details?.leg && (
                            <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                                Leg {match.details.leg}
                            </span>
                        )}
                    </div>

                    {/* Winner/Result Banner */}
                    {match.status === 'finished' && (
                        <div className="absolute top-0 left-0 w-full bg-neonGreen/20 py-2 border-b border-neonGreen/20 animate-in slide-in-from-top-4 fade-in duration-500">
                            <span className="text-neonGreen font-display font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                                <Trophy className="w-4 h-4" />
                                {(() => {
                                    // Determine result text
                                    const hasPenalties = penaltyScore.home > 0 || penaltyScore.away > 0;
                                    const homeWins = match.homeScore > match.awayScore;
                                    const awayWins = match.awayScore > match.homeScore;
                                    const isDraw = match.homeScore === match.awayScore;

                                    if (isDraw && hasPenalties) {
                                        // Penalty winner
                                        if (penaltyScore.home > penaltyScore.away) {
                                            return `${match.homeTeam.teamName || match.homeTeam.name} Menang (Adu Penalti ${penaltyScore.home}-${penaltyScore.away})`;
                                        } else if (penaltyScore.away > penaltyScore.home) {
                                            return `${match.awayTeam.teamName || match.awayTeam.name} Menang (Adu Penalti ${penaltyScore.away}-${penaltyScore.home})`;
                                        }
                                    }

                                    if (homeWins) {
                                        return `${match.homeTeam.teamName || match.homeTeam.name} Menang`;
                                    } else if (awayWins) {
                                        return `${match.awayTeam.teamName || match.awayTeam.name} Menang`;
                                    } else {
                                        return 'Hasil Seri';
                                    }
                                })()}
                            </span>
                        </div>
                    )}
                    {/* Status Badge */}
                    <div className={`absolute left-1/2 -translate-x-1/2 transition-all duration-500 ${match.status === 'finished' ? 'top-16' : 'top-10'}`}>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${['1st_half', '2nd_half'].includes(match.status) ? 'bg-red-500 text-white animate-pulse' :
                            match.status === 'finished' ? 'bg-neonGreen/20 text-neonGreen' :
                                'bg-white/10 text-gray-400'
                            }`}>
                            {['1st_half', '2nd_half'].includes(match.status) ? <span className="font-mono">LIVE • {formatTime(matchTime)}</span> :
                                match.status === 'halftime' ? 'HALF TIME' :
                                    match.status === 'fulltime_pending' ? 'FULL TIME (Pending)' :
                                        match.status === 'finished' ? 'FULL TIME' :
                                            new Date(match.startTime).toLocaleDateString()}
                        </span>
                    </div>

                    <div className="flex items-center justify-between mt-8">
                        {/* Home Team */}
                        <div className="flex flex-col items-center flex-1">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-blue-500/20 ring-4 ring-blue-500/10 flex items-center justify-center mb-4 overflow-hidden">
                                {match.homeTeam.logo ? (
                                    <img src={match.homeTeam.logo} alt={match.homeTeam.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-2xl sm:text-3xl font-bold text-blue-400">{match.homeTeam.name.charAt(0)}</span>
                                )}
                            </div>
                            <h2 className="text-xl sm:text-2xl font-display font-bold">{match.homeTeam.teamName || match.homeTeam.name}</h2>
                            {match.homeTeam.teamName && <div className="text-sm text-gray-400 mt-1">{match.homeTeam.name}</div>}

                            {/* Home Scorers */}
                            <div className="mt-4 space-y-1">
                                {match.events
                                    .filter(e => (e.type === 'goal' || e.type === 'own_goal' || e.detail === 'Own Goal') && e.team === 'home')
                                    .map(e => (
                                        <div key={e.id} className="text-sm text-gray-400 flex items-center justify-center gap-1">
                                            <Goal className="w-3 h-3 text-neonGreen" /> {e.player} {e.time}' {(e.type === 'own_goal' || e.detail === 'Own Goal') ? '(OG)' : (e.detail === 'Penalty' && '(P)')}
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

                            {/* Aggregate Score Display */}
                            {/* Aggregate Score Display */}
                            {leg1Data && (() => {
                                // Robustly calculate aggregate based on Team IDs
                                const currentHomeId = match.homeTeam.id;
                                const currentAwayId = match.awayTeam.id;

                                // Helper to get score and participant id irrespective of case
                                const getVal = (obj, keySnake, keyCamel) => obj[keySnake] !== undefined ? obj[keySnake] : obj[keyCamel];
                                const getNestedId = (obj, keySnake, keyCamel, nestedKey) => {
                                    if (obj[keySnake]) return obj[keySnake];
                                    if (obj[keyCamel]) return typeof obj[keyCamel] === 'object' ? obj[keyCamel][nestedKey] : obj[keyCamel];
                                    return undefined;
                                }

                                const l1HomeId = getNestedId(leg1Data, 'home_participant_id', 'homeTeam', 'id') || leg1Data.homeParticipantId;
                                const l1AwayId = getNestedId(leg1Data, 'away_participant_id', 'awayTeam', 'id') || leg1Data.awayParticipantId;

                                const l1HomeScore = getVal(leg1Data, 'home_score', 'homeScore') || 0;
                                const l1AwayScore = getVal(leg1Data, 'away_score', 'awayScore') || 0;

                                let leg1ScoreForHome = 0;
                                let leg1ScoreForAway = 0;

                                // Check Home Team's score in Leg 1
                                if (l1HomeId == currentHomeId) {
                                    leg1ScoreForHome = l1HomeScore;
                                } else if (l1AwayId == currentHomeId) {
                                    leg1ScoreForHome = l1AwayScore;
                                }

                                // Check Away Team's score in Leg 1
                                if (l1HomeId == currentAwayId) {
                                    leg1ScoreForAway = l1HomeScore;
                                } else if (l1AwayId == currentAwayId) {
                                    leg1ScoreForAway = l1AwayScore;
                                }

                                const aggHome = match.homeScore + leg1ScoreForHome;
                                const aggAway = match.awayScore + leg1ScoreForAway;

                                return (
                                    <div className="mt-2 text-sm font-mono font-bold text-neonPink animate-fadeIn">
                                        (Agg {aggHome} - {aggAway})
                                    </div>
                                )
                            })()}

                            {/* Penalty Score Subtitle */}
                            {(penaltyHistory.length > 0 || penaltyScore.home > 0 || penaltyScore.away > 0) && (
                                <div className={`mt-4 flex flex-col items-center justify-center animate-fadeIn ${match.status === 'finished' ? 'scale-110' : ''}`}>
                                    <span className="text-yellow-400 text-xs font-bold tracking-widest mb-1 font-display">PENALTIES</span>
                                    <div className="font-mono text-xl font-bold flex items-center gap-3 bg-white/5 px-4 py-1 rounded-full border border-white/10">
                                        <span className={penaltyScore.home > penaltyScore.away ? 'text-neonGreen' : 'text-gray-300'}>
                                            {penaltyScore.home}
                                        </span>
                                        <span className="text-gray-500 text-sm">-</span>
                                        <span className={penaltyScore.away > penaltyScore.home ? 'text-neonGreen' : 'text-gray-300'}>
                                            {penaltyScore.away}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Away Team */}
                        <div className="flex flex-col items-center flex-1">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-red-500/20 ring-4 ring-red-500/10 flex items-center justify-center mb-4 overflow-hidden">
                                {match.awayTeam.logo ? (
                                    <img src={match.awayTeam.logo} alt={match.awayTeam.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-2xl sm:text-3xl font-bold text-red-400">{match.awayTeam.name.charAt(0)}</span>
                                )}
                            </div>
                            <h2 className="text-xl sm:text-2xl font-display font-bold">{match.awayTeam.teamName || match.awayTeam.name}</h2>
                            {match.awayTeam.teamName && <div className="text-sm text-gray-400 mt-1">{match.awayTeam.name}</div>}

                            {/* Away Scorers */}
                            <div className="mt-4 space-y-1">
                                {match.events
                                    .filter(e => (e.type === 'goal' || e.type === 'own_goal' || e.detail === 'Own Goal') && e.team === 'away')
                                    .map(e => (
                                        <div key={e.id} className="text-sm text-gray-400 flex items-center justify-center gap-1">
                                            <Goal className="w-3 h-3 text-neonGreen" /> {e.player} {e.time}' {(e.type === 'own_goal' || e.detail === 'Own Goal') ? '(OG)' : (e.detail === 'Penalty' && '(P)')}
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

                        <div className="flex flex-wrap justify-center gap-2">
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

                            {/* Fulltime / Confirm */}
                            {(match.status === '1st_half' || match.status === '2nd_half' || match.status === 'halftime') && (
                                <Button variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={handleFinishMatch}>
                                    <Flag className="w-4 h-4 mr-2" /> Fulltime
                                </Button>
                            )}
                            {match.status === 'fulltime_pending' && (
                                <>
                                    {/* Show Confirm:
                                        1. Always if penalties finished.
                                        2. If NOT a draw -> always confirmable.
                                        3. If DRAW -> check if it's knockout.
                                           - If knockout AND leg 1 -> allow confirmed (Draw).
                                           - If knockout AND NOT leg 1 (e.g. single match or leg 2) -> REQUIRE penalties.
                                        4. If group_knockout group stage -> allow confirmed (Draw) - NO PENALTIES.
                                        5. For Leg 2 matches, check AGGREGATE score, not just current match score.
                                     */}
                                    {(() => {
                                        // Helper: Is this a group stage match? (Only group stage has groupName)
                                        const isGroupStageMatch = match.tournamentType === 'group_knockout' && match.details?.groupName;

                                        // Helper: Calculate aggregate for leg 2 matches
                                        let isAggregateDraw = (match.homeScore === match.awayScore);

                                        if (match.details?.leg === 2 && leg1Data) {
                                            // Calculate aggregate score
                                            const currentHomeId = match.homeTeam?.id;
                                            const currentAwayId = match.awayTeam?.id;

                                            const l1HomeId = leg1Data.home_participant_id || leg1Data.homeTeam?.id || leg1Data.homeParticipantId;
                                            const l1AwayId = leg1Data.away_participant_id || leg1Data.awayTeam?.id || leg1Data.awayParticipantId;
                                            const l1HomeScore = leg1Data.home_score ?? leg1Data.homeScore ?? 0;
                                            const l1AwayScore = leg1Data.away_score ?? leg1Data.awayScore ?? 0;

                                            let leg1ScoreForHome = 0;
                                            let leg1ScoreForAway = 0;

                                            if (l1HomeId == currentHomeId) leg1ScoreForHome = l1HomeScore;
                                            else if (l1AwayId == currentHomeId) leg1ScoreForHome = l1AwayScore;

                                            if (l1HomeId == currentAwayId) leg1ScoreForAway = l1HomeScore;
                                            else if (l1AwayId == currentAwayId) leg1ScoreForAway = l1AwayScore;

                                            const aggHome = match.homeScore + leg1ScoreForHome;
                                            const aggAway = match.awayScore + leg1ScoreForAway;

                                            isAggregateDraw = (aggHome === aggAway);
                                        }

                                        // Determine if penalties are needed
                                        const needsPenalty =
                                            !isPenaltyFinished &&
                                            isAggregateDraw &&
                                            !isGroupStageMatch &&
                                            (match.tournamentType === 'knockout' || match.tournamentType === 'group_knockout') &&
                                            match.details?.leg !== 1;

                                        if (!needsPenalty) {
                                            return (
                                                <Button className="bg-neonGreen hover:bg-neonGreen/80 text-black animate-pulse" onClick={handleConfirmMatch}>
                                                    <CheckCircle className="w-4 h-4 mr-2" /> Confirm Match Result
                                                </Button>
                                            );
                                        } else if (!showPenalties) {
                                            return (
                                                <Button variant="outline" className="animate-bounce border-yellow-400 text-yellow-400" onClick={() => { saveState(); setShowPenalties(true); }}>
                                                    <Trophy className="w-4 h-4 mr-2" /> Mulai Adu Penalti
                                                </Button>
                                            );
                                        }
                                        return null;
                                    })()}
                                </>
                            )}

                            {/* Rollback - Available unless finished or completed */}
                            {match.status !== 'finished' && match.status !== 'completed' && match.status !== 'scheduled' && (
                                <Button variant="ghost" className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10" onClick={handleRollback}>
                                    <RotateCcw className="w-4 h-4 mr-2" /> Rollback
                                </Button>
                            )}

                            {match.status === 'finished' && match.homeScore === match.awayScore && !showPenalties && match.tournamentType !== 'league' && match.details?.leg !== 1 && !(match.tournamentType === 'group_knockout' && match.details?.groupName) && (
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
            </Card >

            {/* Penalty Section (Conditional) - Hide if finished or completed */}
            {
                (showPenalties || penaltyHistory.length > 0) && match.status !== 'finished' && match.status !== 'completed' && (
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
                )
            }

            {/* Tabs & Content */}
            <Card hover={false} className="overflow-hidden">
                <div className="flex border-b border-white/10">
                    {match.status !== 'scheduled' && (
                        <button
                            onClick={() => setActiveTab('timeline')}
                            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition relative ${activeTab === 'timeline' ? 'text-neonGreen' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Clock className="w-4 h-4" /> Match Timeline
                            {activeTab === 'timeline' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-neonGreen"></div>}
                        </button>
                    )}
                    <button
                        onClick={() => setActiveTab('analysis')}
                        className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition relative ${activeTab === 'analysis' ? 'text-neonGreen' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Brain className="w-4 h-4" /> Match Analysis
                        {activeTab === 'analysis' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-neonGreen"></div>}
                    </button>
                </div>

                <CardContent className="p-0">
                    {/* ANALYSIS TAB */}
                    {activeTab === 'analysis' && (
                        <div className="divide-y divide-white/5">
                            {/* Win Probability */}
                            <div className="p-6">
                                <h3 className="font-display font-bold mb-4 flex items-center gap-2">
                                    <Percent className="w-5 h-5 text-neonPink" /> Win Probability ({match.analysis?.historyType === 'all_time' ? 'All Time User History' : 'Tournament History'})
                                </h3>
                                {match.analysis ? (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm font-bold mb-1">
                                            <span className="text-blue-400">Home {match.analysis.winProbability.home}%</span>
                                            <span className="text-gray-400">Draw {match.analysis.winProbability.draw}%</span>
                                            <span className="text-red-400">Away {match.analysis.winProbability.away}%</span>
                                        </div>
                                        <div className="h-3 bg-white/10 rounded-full overflow-hidden flex">
                                            <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${match.analysis.winProbability.home}%` }}></div>
                                            <div className="h-full bg-gray-500 transition-all duration-1000" style={{ width: `${match.analysis.winProbability.draw}%` }}></div>
                                            <div className="h-full bg-red-500 transition-all duration-1000" style={{ width: `${match.analysis.winProbability.away}%` }}></div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2 italic">
                                            {match.analysis.historyType === 'all_time'
                                                ? "Prediksi AI: Gabungan statistik riwayat pertemuan User (All Time) dan tren 3 pertandingan terakhir."
                                                : "Prediksi AI: Berdasarkan performa head-to-head di turnamen ini (weighted)."}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="text-gray-500 text-sm italic animate-pulse">Memuat data analisis...</div>
                                )}
                            </div>

                            {/* Head to Head */}
                            <div className="p-6">
                                <h3 className="font-display font-bold mb-4 flex items-center gap-2">
                                    <History className="w-5 h-5 text-yellow-400" /> Head to Head (Last 3 Meetings)
                                </h3>
                                <div className="space-y-3">
                                    {match.analysis?.headToHead?.length > 0 ? (
                                        match.analysis.headToHead.map((h2h) => (
                                            <div key={h2h.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                                <div className="flex items-center gap-3">
                                                    {/* Home in H2H context means the Home Team of THAT match, not necessarily current match home */}
                                                    {/* But for clarity, we should probably stick to Left/Right alignment or keep it simple */}
                                                    <div className="flex items-center gap-2 min-w-[80px]">
                                                        <span className={`font-bold text-sm truncate max-w-[100px] ${h2h.isHome ? 'text-blue-400' : 'text-red-400'}`} title={h2h.homeTeam}>
                                                            {h2h.homeTeam}
                                                        </span>
                                                    </div>

                                                    <div className="px-2 py-1 bg-black/40 rounded text-sm font-mono text-gray-300">
                                                        {h2h.homeScore} - {h2h.awayScore}
                                                    </div>

                                                    <div className="flex items-center gap-2 min-w-[80px] justify-end">
                                                        <span className={`font-bold text-sm truncate max-w-[100px] ${!h2h.isHome ? 'text-blue-400' : 'text-red-400'}`} title={h2h.awayTeam}>
                                                            {h2h.awayTeam}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right ml-4">
                                                    <div className="text-xs text-neonGreen/80 truncate max-w-[120px]" title={h2h.tournament}>{h2h.tournament}</div>
                                                    <div className="text-[10px] text-gray-500">{new Date(h2h.date).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-6 border border-dashed border-white/10 rounded-lg">
                                            <History className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                                            <p className="text-gray-500 text-sm">Belum ada riwayat pertemuan sebelumnya.</p>
                                        </div>
                                    )}
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
                                            <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full ${['kickoff', 'fulltime', 'halftime'].includes(event.type) ? 'bg-gray-400' :
                                                event.team === 'home' ? 'bg-blue-500' : 'bg-red-500'
                                                }`}></div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-bold text-neonGreen">{event.time}'</span>
                                                <span className="font-bold flex items-center gap-1">
                                                    {(event.type === 'goal' || event.type === 'own_goal' || event.detail === 'Own Goal') && <Goal className="w-4 h-4 text-neonGreen" />}
                                                    {event.type === 'card' && <div className="w-3 h-4 bg-yellow-500 rounded-sm"></div>}
                                                    {['kickoff', 'fulltime', 'halftime'].includes(event.type) && <Clock className="w-4 h-4 text-gray-400" />}
                                                    {(event.type === 'own_goal' || event.detail === 'Own Goal') ? 'OWN GOAL' : event.type.toUpperCase().replace('_', ' ')}
                                                </span>
                                                {!['kickoff', 'fulltime', 'halftime'].includes(event.type) && (
                                                    <span className="text-gray-400">- {event.player} {(event.type === 'own_goal' || event.detail === 'Own Goal') ? '(OG)' : (event.detail === 'Penalty' && '(P)')} ({event.team === 'home' ? match.homeTeam.name : match.awayTeam.name})</span>
                                                )}
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
            {
                showEventModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-[#111] border border-white/10 rounded-xl w-full max-w-md p-6">
                            <h3 className="font-display font-bold text-xl mb-4">
                                Tambah {eventType === 'goal' ? 'Gol' : 'Kartu'} - {selectedTeam === 'home' ? match.homeTeam.name : match.awayTeam.name}
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Pilih Pemain</label>
                                    {isManualInput ? (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 outline-none focus:border-neonGreen text-white placeholder-gray-500 capitalize"
                                                placeholder="Masukkan nama pemain..."
                                                value={manualPlayerName}
                                                onChange={e => setManualPlayerName(e.target.value.replace(/\b\w/g, l => l.toUpperCase()))}
                                                autoFocus
                                            />
                                            <Button variant="outline" onClick={() => setIsManualInput(false)} className="px-3">
                                                <Search className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <AsyncPlayerSelect
                                            value={selectedPlayer}
                                            onChange={(val) => {
                                                if (val === 'MANUAL_INPUT') {
                                                    setIsManualInput(true)
                                                    setSelectedPlayer('')
                                                } else {
                                                    setSelectedPlayer(val)
                                                }
                                            }}
                                            placeholder="Cari pemain di database..."
                                        />
                                    )}
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
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="goalType"
                                                    value="Own Goal"
                                                    checked={goalType === 'Own Goal'}
                                                    onChange={(e) => setGoalType(e.target.value)}
                                                    className="accent-red-500"
                                                />
                                                <span className="text-white">Own Goal</span>
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {eventType === 'card' && (
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Tipe Kartu</label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="cardType"
                                                    value="Yellow Card"
                                                    checked={cardType === 'Yellow Card'}
                                                    onChange={(e) => setCardType(e.target.value)}
                                                    className="accent-yellow-400"
                                                />
                                                <span className="text-yellow-400">Yellow Card</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="cardType"
                                                    value="Red Card"
                                                    checked={cardType === 'Red Card'}
                                                    onChange={(e) => setCardType(e.target.value)}
                                                    className="accent-red-500"
                                                />
                                                <span className="text-red-500">Red Card</span>
                                            </label>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Waktu (Menit)</label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        className="w-full bg-black/50 border border-white/10 rounded-lg p-3 outline-none focus:border-neonGreen"
                                        value={eventTime}
                                        onChange={(e) => {
                                            const val = e.target.value
                                            if (val === '' || /^\d+$/.test(val)) {
                                                setEventTime(val)
                                            }
                                        }}
                                    />
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <Button className="flex-1" variant="ghost" onClick={() => setShowEventModal(false)}>Batal</Button>
                                    <Button className="flex-1 bg-neonGreen text-black" onClick={submitEvent} disabled={isManualInput ? !manualPlayerName : !selectedPlayer}>Simpan</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Confirmation Modal */}
            {
                showConfirmModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                        <Card className="w-full max-w-md bg-gray-900 border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
                            <CardHeader className="border-b border-white/10 pb-4">
                                <h3 className="text-xl font-display font-bold flex items-center gap-2 text-white">
                                    <CheckCircle className="w-6 h-6 text-neonGreen" /> Konfirmasi Hasil
                                </h3>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <div className="text-center space-y-4">
                                    <div className="text-gray-400">Skor Akhir</div>
                                    <div className="flex flex-col items-center w-full">
                                        <div className="flex items-center justify-between w-full gap-2 md:gap-4">
                                            {/* Home Team */}
                                            <div className={`text-right flex-1 font-bold text-lg md:text-xl leading-tight ${match.homeScore > match.awayScore ? 'text-neonGreen' : 'text-white'}`}>
                                                {match.homeTeam.teamName || match.homeTeam.name}
                                            </div>

                                            {/* Score Box */}
                                            <div className="flex items-center justify-center gap-3 text-4xl md:text-5xl font-display font-bold bg-white/5 px-4 py-2 rounded-xl border border-white/10 mx-2">
                                                <span className={match.homeScore > match.awayScore ? 'text-neonGreen' : 'text-white'}>
                                                    {match.homeScore}
                                                </span>
                                                <span className="text-white/20 text-3xl">:</span>
                                                <span className={match.awayScore > match.homeScore ? 'text-neonGreen' : 'text-white'}>
                                                    {match.awayScore}
                                                </span>
                                            </div>

                                            {/* Away Team */}
                                            <div className={`text-left flex-1 font-bold text-lg md:text-xl leading-tight ${match.awayScore > match.homeScore ? 'text-neonGreen' : 'text-white'}`}>
                                                {match.awayTeam.teamName || match.awayTeam.name}
                                            </div>
                                        </div>
                                        {/* Penalty Score Display in Modal */}
                                        {(penaltyScore.home > 0 || penaltyScore.away > 0 || isPenaltyFinished) && (
                                            <div className="flex flex-col items-center mt-4">
                                                <div className="text-sm font-mono text-yellow-400 mb-1">PENALTY SHOOTOUT</div>
                                                <div className="flex items-center gap-4 text-2xl font-bold font-mono bg-white/5 px-3 py-1 rounded">
                                                    <span className={penaltyScore.home > penaltyScore.away ? 'text-neonGreen' : 'text-gray-400'}>{penaltyScore.home}</span>
                                                    <span className="text-xs text-gray-500">-</span>
                                                    <span className={penaltyScore.away > penaltyScore.home ? 'text-neonGreen' : 'text-gray-400'}>{penaltyScore.away}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg flex gap-3 text-sm text-yellow-200">
                                    <Flag className="w-5 h-5 shrink-0" />
                                    <div>
                                        Pastikan skor{isPenaltyFinished ? ' dan hasil penalti' : ''} sudah benar. Aksi ini <strong>tidak dapat dibatalkan</strong>.
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <Button variant="outline" className="flex-1" onClick={() => setShowConfirmModal(false)}>
                                        Batal
                                    </Button>
                                    <Button className="flex-1 bg-neonGreen text-black hover:bg-neonGreen/90" onClick={confirmMatchFinal}>
                                        Ya, Selesai
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )
            }


            {/* REDIRECT WARNING MODAL */}
            {
                showRedirectModal && (
                    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <Card className="w-full max-w-sm border-white/10 bg-[#111]">
                            <CardHeader>
                                <h3 className="text-xl font-bold flex items-center gap-2 text-yellow-400">
                                    <Flag className="w-5 h-5" /> Belum Siap
                                </h3>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-gray-300">
                                    Pertandingan ini belum memiliki peserta yang ditentukan (TBD). Silakan kembali ke halaman turnamen.
                                </p>
                                <Button
                                    className="w-full bg-neonGreen text-black font-bold hover:bg-neonGreen/80"
                                    onClick={() => navigate(`/dashboard/tournaments/${id}`)}
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Turnamen
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                )
            }
            {/* DEBUG INFO - REMOVE BEFORE PRODUCTION */}
            <div className="bg-black/80 p-4 rounded text-xs font-mono text-green-400 overflow-auto border border-green-500/30">
                <h4 className="font-bold border-b border-green-500/30 mb-2">DEBUG MATCH STATE</h4>
                <p>MATCH ID: {matchId}</p>
                <p>TOURNAMENT ID: {match.tournamentId || 'Missing'}</p>
                <p>DETAILS: {JSON.stringify(match.details)}</p>
                <p>IS LEG 2?: {match.details?.leg == 2 ? 'YES' : 'NO'}</p>
                <p>LEG 1 DATA: {leg1Data ? 'FOUND' : 'NULL'}</p>
                {leg1Data && (
                    <div className="pl-4 border-l border-green-500/30 mt-1">
                        <p>ID: {leg1Data.id}</p>
                        <p>Home: {leg1Data.home_team_name} ({leg1Data.home_score})</p>
                        <p>Away: {leg1Data.away_team_name} ({leg1Data.away_score})</p>
                    </div>
                )}
            </div>
        </div >
    )
}
