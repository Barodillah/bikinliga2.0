
// Generate matches
router.post('/:idOrSlug/matches/generate', authenticateToken, async (req, res) => {
    const { idOrSlug } = req.params;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Get Tournament
        // Also fetch type and match_format to decide logic
        const [tournaments] = await connection.query(
            `SELECT id, organizer_id, type, match_format FROM tournaments WHERE id = ? OR slug = ?`,
            [idOrSlug, idOrSlug]
        );

        if (tournaments.length === 0) {
            return res.status(404).json({ success: false, message: 'Turnamen tidak ditemukan' });
        }

        const tournament = tournaments[0];
        if (tournament.organizer_id !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Anda tidak memiliki izin' });
        }

        // 2. Fetch Approved Participants
        const [participants] = await connection.query(
            `SELECT id FROM participants WHERE tournament_id = ? AND status = 'approved'`,
            [tournament.id]
        );

        if (participants.length < 2) {
            return res.status(400).json({ success: false, message: 'Minimal butuh 2 peserta approved untuk generate jadwal' });
        }

        // 3. Check if matches already exist
        const [existingMatches] = await connection.query(
            `SELECT COUNT(*) as count FROM matches WHERE tournament_id = ?`,
            [tournament.id]
        );

        if (existingMatches[0].count > 0) {
            return res.status(400).json({ success: false, message: 'Jadwal sudah dibuat sebelumnya' });
        }

        const isHomeAway = tournament.match_format === 'home_away';
        let matches = [];

        // 4. Generate Logic
        if (tournament.type === 'league') {
            // Round Robin Algorithm
            const teams = participants.map(p => p.id);
            if (teams.length % 2 !== 0) {
                teams.push(null); // Dummy team for bye
            }

            const numRounds = teams.length - 1;
            const halfSize = teams.length / 2;
            const rounds = [];

            // Standard Round Robin
            for (let round = 0; round < numRounds; round++) {
                const roundMatches = [];
                for (let i = 0; i < halfSize; i++) {
                    const home = teams[i];
                    const away = teams[teams.length - 1 - i];

                    if (home && away) {
                        // Alternate home/away each round for fairness (simplified)
                        // Or use standard rotation
                        if (round % 2 === 1) {
                            roundMatches.push({ home, away });
                        } else {
                            roundMatches.push({ home: away, away: home });
                        }
                    }
                }
                rounds.push(roundMatches);

                // Rotate array (keep first fixed)
                teams.splice(1, 0, teams.pop());
            }

            // Create match objects
            rounds.forEach((roundMatches, index) => {
                roundMatches.forEach(match => {
                    matches.push({
                        id: uuidv4(),
                        tournament_id: tournament.id,
                        home_participant_id: match.home,
                        away_participant_id: match.away,
                        round: index + 1,
                        status: 'scheduled'
                    });
                });
            });

            // If Home/Away (double round robin), mirror the matches
            if (isHomeAway) {
                const firstLegMatches = [...matches];
                const nextRoundStart = numRounds + 1;

                firstLegMatches.forEach((m) => {
                    matches.push({
                        id: uuidv4(),
                        tournament_id: tournament.id,
                        home_participant_id: m.away_participant_id, // Swap
                        away_participant_id: m.home_participant_id, // Swap
                        round: m.round + numRounds,
                        status: 'scheduled'
                    });
                });
            }

        } else if (tournament.type === 'knockout') {
            // Simple Single Elimination Bracket
            // Needs careful power of 2 check or byes (simplified: just take power of 2 for now, or error if not perfect?)
            // Ideally: handle byes.

            // Shuffle participants
            const shuffled = participants.map(p => p.id).sort(() => Math.random() - 0.5);

            // Calculate next power of 2
            let powerOf2 = 2;
            while (powerOf2 < shuffled.length) powerOf2 *= 2;

            // Byes calculation
            const byes = powerOf2 - shuffled.length;
            const firstRoundMatchesCount = (shuffled.length - byes) / 2;
            // Actually, standard way:
            // Round 1 has N matches to reduce participants to a power of 2.
            // If 6 participants (next pow2 is 8), 6 < 8.
            // Wait, usually we structure slots.

            // For MVP: Let's assume user provides correct number or we truncate/randomly pick?
            // Safer: Just generate slots for the bracket based on powerOf2.

            // Let's stick to a simpler logic:
            // Create Quarter Finals (8), Semi (4), Final (2) etc.
            // Group Knockout is 'nanti dulu' as per user.

            // Let's implement full bracket tree generation.
            // Matches for Round 1
            // If imperfect number, some matches in Round 1 will have NULL opponent (automatic win/bye logic handled later or manually).
            // BUT schema says home/away can be NULL.

            // Better approach: Generate the FULL tree struct.
            // Total rounds = log2(powerOf2)

            let totalRounds = Math.log2(powerOf2);
            let currentRoundParticipants = [...shuffled];

            // Pad with nulls to match powerOf2 for easy pairing key
            while (currentRoundParticipants.length < powerOf2) {
                currentRoundParticipants.push(null); // Bye slot
            }

            // We only generate the matches.
            // However, we only know the participants for Round 1.
            // Future rounds have TBD participants.

            let matchCountInRound = powerOf2 / 2;

            for (let r = 1; r <= totalRounds; r++) {
                // Generate matches for this round
                for (let i = 0; i < matchCountInRound; i++) {
                    const matchId = uuidv4();

                    // For Round 1, we slot in real participants
                    // For Round > 1, participants are NULL (TBD)

                    let home = null;
                    let away = null;

                    if (r === 1) {
                        home = currentRoundParticipants[i * 2];
                        away = currentRoundParticipants[i * 2 + 1];
                        // If away is null (bye), home automatically advances? (Handled in game logic usually)
                    }

                    // Note: If Home/Away format used in knockout (2 legs)
                    if (isHomeAway && tournament.type !== 'final?') {
                        // Usually final is single leg? depends.
                        // Let's assume all rounds 2 legs if chosen.

                        // Leg 1
                        matches.push({
                            id: matchId,
                            tournament_id: tournament.id,
                            home_participant_id: home,
                            away_participant_id: away,
                            round: r,
                            status: 'scheduled',
                            details: JSON.stringify({ leg: 1 })
                        });

                        // Leg 2
                        matches.push({
                            id: uuidv4(),
                            tournament_id: tournament.id,
                            home_participant_id: away,
                            away_participant_id: home,
                            round: r,
                            status: 'scheduled',
                            details: JSON.stringify({ leg: 2 })
                        });
                    } else {
                        matches.push({
                            id: matchId,
                            tournament_id: tournament.id,
                            home_participant_id: home,
                            away_participant_id: away,
                            round: r,
                            status: 'scheduled'
                        });
                    }
                }
                matchCountInRound /= 2;
            }
        }

        // 5. Bulk Insert Matches
        if (matches.length > 0) {
            const values = matches.map(m => [
                m.id, m.tournament_id, m.home_participant_id, m.away_participant_id,
                m.round, m.status, m.details || null
            ]);

            // Note: multi-row insert syntax
            // INSERT INTO matches (id, tournament_id...) VALUES ?
            // mysql2 supports this if we pass array of arrays

            await connection.query(
                `INSERT INTO matches (id, tournament_id, home_participant_id, away_participant_id, round, status, details) VALUES ?`,
                [values]
            );

            // 6. Update Tournament Status to 'active'
            await connection.query(
                `UPDATE tournaments SET status = 'active' WHERE id = ?`,
                [tournament.id]
            );
        } else {
            // Rollback if nothing generated (shouldn't happen for valid inputs)
            throw new Error('No matches generated');
        }

        await connection.commit();
        res.status(201).json({ success: true, message: 'Jadwal berhasil digenerate', count: matches.length });

    } catch (error) {
        await connection.rollback();
        console.error('Generate matches error:', error);
        res.status(500).json({ success: false, message: 'Gagal generate jadwal' });
    } finally {
        connection.release();
    }
});

// Get Matches
router.get('/:idOrSlug/matches', authenticateToken, async (req, res) => {
    const { idOrSlug } = req.params;

    try {
        const [tournaments] = await db.query(
            `SELECT id FROM tournaments WHERE id = ? OR slug = ?`,
            [idOrSlug, idOrSlug]
        );

        if (tournaments.length === 0) {
            return res.status(404).json({ success: false, message: 'Turnamen tidak ditemukan' });
        }

        const tournamentId = tournaments[0].id;

        const [matches] = await db.query(
            `SELECT m.*, 
                p1.name as home_team, p1.logo_url as home_logo,
                p2.name as away_team, p2.logo_url as away_logo
             FROM matches m
             LEFT JOIN participants p1 ON m.home_participant_id = p1.id
             LEFT JOIN participants p2 ON m.away_participant_id = p2.id
             WHERE m.tournament_id = ?
             ORDER BY m.round ASC, m.created_at ASC`,
            [tournamentId]
        );

        res.json({ success: true, data: matches });
    } catch (error) {
        console.error('Get matches error:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil jadwal' });
    }
});
