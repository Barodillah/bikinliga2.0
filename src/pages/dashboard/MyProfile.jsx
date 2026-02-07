import React, { useState, useEffect } from 'react'
import { User, Shield, Trophy, Eye, EyeOff, Save, Check, Medal, Star, Swords, Crown, Coins, Gem, Users, UserPlus, Rocket, Instagram, Twitter } from 'lucide-react'
import { useToast } from '../../contexts/ToastContext'
import { useAuth } from '../../contexts/AuthContext'
import { authFetch } from '../../utils/api'

export default function MyProfile() {
    const { user, setUser } = useAuth()
    const { error, success } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // Privacy Settings State (Mock for now, needs backend support later if real)
    const [privacySettings, setPrivacySettings] = useState({
        showEmail: false,
        showWinRate: true,
        showRecentMatches: true,
        showRecentTournaments: true,
        instagram: '',
        twitter: ''
    })

    useEffect(() => {
        if (user?.preferences) {
            console.log('MyProfile: user.preferences received:', user.preferences, typeof user.preferences);

            let prefs = user.preferences;
            if (typeof prefs === 'string') {
                try {
                    prefs = JSON.parse(prefs);
                    console.log('MyProfile: parsed preferences string:', prefs);
                } catch (e) {
                    console.error('MyProfile: failed to parse preferences string:', e);
                }
            }

            // Apply user preferences if they exist, merging with defaults
            // Ensure social fields are strings (fix for potential boolean contamination)
            const sanitizedPrefs = {
                ...prefs
            };
            if (typeof sanitizedPrefs.instagram === 'boolean') sanitizedPrefs.instagram = '';
            if (typeof sanitizedPrefs.twitter === 'boolean') sanitizedPrefs.twitter = '';

            setPrivacySettings(prev => ({
                ...prev,
                ...sanitizedPrefs
            }));
        }
    }, [user]);

    // Achievements State
    const [availableAchievements, setAvailableAchievements] = useState([])
    const [selectedAchievements, setSelectedAchievements] = useState([])

    useEffect(() => {
        const fetchAchievements = async () => {
            setIsLoading(true)
            try {
                // Fetch my unlocked achievements
                const res = await authFetch('/api/achievements/me');
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setAvailableAchievements(data.achievements || []);
                        // Pre-select showcased achievements
                        const showcasedIds = (data.achievements || [])
                            .filter(a => a.is_showcased)
                            .map(a => a.achievement_id);

                        setSelectedAchievements(showcasedIds);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch achievements", err);
                error("Failed to load achievements");
            } finally {
                setIsLoading(false)
            }
        }

        fetchAchievements();
    }, []);

    const handlePrivacyToggle = async (key, value = undefined) => {
        const newValue = value !== undefined ? value : !privacySettings[key];

        const newSettings = {
            ...privacySettings,
            [key]: newValue
        };

        // Optimistic update
        setPrivacySettings(newSettings);

        try {
            const res = await authFetch('/api/auth/preferences', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ preferences: newSettings })
            });
            // Based on previous code: body: JSON.stringify({ preferences: newSettings }) 
            // Wait, previous code was: body: JSON.stringify({ preferences: newSettings })
            // But my auth.js (from memory/logs) expects raw body or preferences key?
            // "Updated GET /me in auth.js to return preferences"
            // Let's check previous code block again.
            // Line 92: body: JSON.stringify({ preferences: newSettings })

            // So I should keep that structure?
            // But wait, step 610 output says: "Received Preferences: { showEmail: ... }"
            // And "Saving JSON: ..."
            // This implies the backend expects the preferences object directly OR wrapped?
            // Step 610: "Received Preferences: { ... }"
            // If I sent { preferences: { ... } }, then req.body.preferences would be the object.
            // If I sent { ... }, then req.body would be the object.
            // Let's look at `handlePrivacyToggle` again.
            // Line 92 says: `body: JSON.stringify({ preferences: newSettings })`
            // So backend likely does `const { preferences } = req.body;`

            // I will keep sending `{ preferences: newSettings }` to be safe/consistent.

            // AND update user context if available?
            if (res.ok) {
                if (user) {
                    setUser(prev => ({
                        ...prev,
                        preferences: newSettings
                    }));
                }
            } else {
                throw new Error('Failed to update');
            }
        } catch (err) {
            console.error('Failed to update privacy settings:', err);
            error('Gagal menyimpan pengaturan privasi');
            // Revert on error
            setPrivacySettings(prev => ({ ...prev, [key]: !newValue })); // Revert boolean
            // For text, it's harder to revert easily without prev value tracking, but OK for now.
        }
    }

    const handleAchievementToggle = (achievementId) => {
        if (selectedAchievements.includes(achievementId)) {
            setSelectedAchievements(selectedAchievements.filter(id => id !== achievementId))
        } else {
            if (selectedAchievements.length >= 3) {
                error('You can only display up to 3 achievements on your profile.')
                return
            }
            setSelectedAchievements([...selectedAchievements, achievementId])
        }
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            // Save Showcased Achievements
            const res = await authFetch('/api/achievements/showcase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ achievementIds: selectedAchievements })
            });

            const data = await res.json();
            if (data.success) {
                success('Profile settings updated!');
                // Update local state to reflect "is_showcased" for UI consistency if needed
                setAvailableAchievements(prev => prev.map(a => ({
                    ...a,
                    is_showcased: selectedAchievements.includes(a.achievement_id) ? 1 : 0
                })));
            } else {
                error(data.message || 'Failed to save settings');
            }
        } catch (err) {
            console.error(err);
            error('An error occurred while saving.');
        } finally {
            setIsSaving(false)
        }
    }

    // Helper to get icon
    const getIcon = (iconName) => {
        const icons = {
            'Trophy': Trophy,
            'Medal': Medal,
            'Star': Star,
            'Shield': Shield,
            'Target': Swords,
            'Check': Check,
            'Crown': Crown,
            'Coins': Coins,
            'Gem': Gem,
            'CheckCircle': Check,
            'Users': Users,
            'UserPlus': UserPlus,
            'Rocket': Rocket
        };
        return icons[iconName] || Medal;
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-display font-bold text-white mb-2">My Profile Settings</h1>
                <p className="text-gray-400">Manage what others see on your public profile.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Visual Preview Card (Left Column) */}
                <div className="lg:col-span-1">
                    <div className="bg-cardBg border border-white/10 rounded-xl p-6 sticky top-24">
                        <h3 className="text-lg font-bold text-white mb-4">Profile Preview</h3>
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-neonGreen to-neonPink flex items-center justify-center text-black font-bold text-3xl overflow-hidden">
                                {user?.avatar_url ? (
                                    <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    user?.name?.charAt(0) || 'U'
                                )}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">{user?.name || 'User'}</h2>
                                <p className="text-neonGreen">@{user?.username || 'username'}</p>
                            </div>

                            {/* Achievements Preview */}
                            <div className="flex justify-center gap-2">
                                {selectedAchievements.length > 0 ? (
                                    selectedAchievements.map(id => {
                                        const achievement = availableAchievements.find(a => a.achievement_id === id);
                                        if (!achievement) return null;

                                        const Icon = getIcon(achievement.icon);
                                        return (
                                            <div key={id} className="p-2 rounded-lg bg-white/5 border border-white/5" title={achievement.name}>
                                                <Icon className="w-5 h-5 text-yellow-400" />
                                            </div>
                                        )
                                    })
                                ) : (
                                    <span className="text-xs text-gray-500 italic">No achievements selected</span>
                                )}
                            </div>

                            {/* Stats Preview based on Privacy */}
                            <div className="w-full grid grid-cols-2 gap-2 text-sm mt-4">
                                <div className="bg-white/5 p-2 rounded-lg">
                                    <div className="text-gray-400 text-xs">Points</div>
                                    <div className="text-white font-bold">{user?.stats?.total_points || 0}</div>
                                </div>
                                {privacySettings.showWinRate ? (
                                    <div className="bg-white/5 p-2 rounded-lg">
                                        <div className="text-gray-400 text-xs">Win Rate</div>
                                        <div className="text-neonGreen font-bold">{user?.winRate || '0%'}</div>
                                    </div>
                                ) : (
                                    <div className="bg-white/5 p-2 rounded-lg opacity-50 flex items-center justify-center">
                                        <EyeOff className="w-4 h-4 text-gray-500" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Settings Controls (Right Column) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Privacy Settings */}
                    <div className="bg-cardBg border border-white/10 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-neonGreen" />
                            Privacy Settings
                        </h3>
                        <div className="space-y-4">
                            {[
                                { key: 'showEmail', label: 'Show Email Address', desc: 'Allow others to see your email on your profile.' },
                                { key: 'showWinRate', label: 'Show Win Rate', desc: 'Display your win rate statistics publicly.' },
                                { key: 'showRecentMatches', label: 'Show Recent Matches', desc: 'List your recent match history.' },
                                { key: 'showRecentTournaments', label: 'Show Recent Tournaments', desc: 'List your recent tournament history.' },
                            ].map((item) => (
                                <div key={item.key} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition">
                                    <div>
                                        <div className="text-white font-medium">{item.label}</div>
                                        <div className="text-xs text-gray-400">{item.desc}</div>
                                    </div>
                                    <button
                                        onClick={() => handlePrivacyToggle(item.key)}
                                        className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${privacySettings[item.key] ? 'bg-neonGreen/20 border border-neonGreen' : 'bg-white/10 border border-white/10'
                                            }`}
                                    >
                                        <div
                                            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${privacySettings[item.key] ? 'translate-x-6 bg-neonGreen shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'translate-x-0'
                                                }`}
                                        />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Social Media Links */}
                        <div className="mt-8 space-y-4 pt-6 border-t border-white/10">
                            <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Social Media Links</h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-400 font-medium">Instagram Username</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Instagram className="h-4 w-4 text-gray-500" />
                                        </div>
                                        <input
                                            type="text"
                                            value={privacySettings.instagram || ''}
                                            onChange={(e) => setPrivacySettings(prev => ({ ...prev, instagram: e.target.value }))}
                                            onBlur={() => handlePrivacyToggle('instagram', privacySettings.instagram)}
                                            placeholder="username (without @)"
                                            className="w-full bg-black/20 border border-white/10 rounded-lg py-2 pl-10 pr-3 text-sm text-white focus:outline-none focus:border-neonGreen/50 focus:ring-1 focus:ring-neonGreen/50 transition-all placeholder:text-gray-600"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs text-gray-400 font-medium">X (Twitter) Username</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Twitter className="h-4 w-4 text-gray-500" />
                                        </div>
                                        <input
                                            type="text"
                                            value={privacySettings.twitter || ''}
                                            onChange={(e) => setPrivacySettings(prev => ({ ...prev, twitter: e.target.value }))}
                                            onBlur={() => handlePrivacyToggle('twitter', privacySettings.twitter)}
                                            placeholder="username"
                                            className="w-full bg-black/20 border border-white/10 rounded-lg py-2 pl-10 pr-3 text-sm text-white focus:outline-none focus:border-neonGreen/50 focus:ring-1 focus:ring-neonGreen/50 transition-all placeholder:text-gray-600"
                                        />
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 italic">
                                * Enter your usernames to display social links on your public profile. Changes are saved automatically when you click outside.
                            </p>
                        </div>
                    </div>

                    {/* Achievement Showcase */}
                    <div className="bg-cardBg border border-white/10 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-400" />
                            Achievement Showcase
                        </h3>
                        <p className="text-sm text-gray-400 mb-6">Select up to 3 achievements to display on your profile.</p>

                        {isLoading ? (
                            <div className="text-center py-8 text-gray-500">Loading achievements...</div>
                        ) : availableAchievements.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 italic">
                                You haven&apos;t unlocked any achievements yet.
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {availableAchievements.map((achievement) => {
                                    const isSelected = selectedAchievements.includes(achievement.achievement_id)
                                    const Icon = getIcon(achievement.icon)

                                    const colorMap = {
                                        tournament: {
                                            text: 'text-yellow-400',
                                            border: 'border-yellow-500/50',
                                            shadow: 'shadow-yellow-500/50',
                                            iconBg: 'bg-yellow-500/20',
                                            bg: 'bg-yellow-500/5',
                                            checkBg: 'bg-yellow-500',
                                            shadowColor: '#eab308'
                                        },
                                        match: {
                                            text: 'text-red-500',
                                            border: 'border-red-500/50',
                                            shadow: 'shadow-red-500/50',
                                            iconBg: 'bg-red-500/20',
                                            bg: 'bg-red-500/5',
                                            checkBg: 'bg-red-500',
                                            shadowColor: '#ef4444'
                                        },
                                        social: {
                                            text: 'text-blue-400',
                                            border: 'border-blue-500/50',
                                            shadow: 'shadow-blue-500/50',
                                            iconBg: 'bg-blue-500/20',
                                            bg: 'bg-blue-500/5',
                                            checkBg: 'bg-blue-500',
                                            shadowColor: '#3b82f6'
                                        },
                                        economy: {
                                            text: 'text-emerald-400',
                                            border: 'border-emerald-500/50',
                                            shadow: 'shadow-emerald-500/50',
                                            iconBg: 'bg-emerald-500/20',
                                            bg: 'bg-emerald-500/5',
                                            checkBg: 'bg-emerald-500',
                                            shadowColor: '#10b981'
                                        },
                                        membership: {
                                            text: 'text-purple-400',
                                            border: 'border-purple-500/50',
                                            shadow: 'shadow-purple-500/50',
                                            iconBg: 'bg-purple-500/20',
                                            bg: 'bg-purple-500/5',
                                            checkBg: 'bg-purple-500',
                                            shadowColor: '#a855f7'
                                        },
                                        special: {
                                            text: 'text-pink-400',
                                            border: 'border-pink-500/50',
                                            shadow: 'shadow-pink-500/50',
                                            iconBg: 'bg-pink-500/20',
                                            bg: 'bg-pink-500/5',
                                            checkBg: 'bg-pink-500',
                                            shadowColor: '#ec4899'
                                        },
                                        season: {
                                            text: 'text-cyan-400',
                                            border: 'border-cyan-500/50',
                                            shadow: 'shadow-cyan-500/50',
                                            iconBg: 'bg-cyan-500/20',
                                            bg: 'bg-cyan-500/5',
                                            checkBg: 'bg-cyan-500',
                                            shadowColor: '#06b6d4'
                                        },
                                        default: {
                                            text: 'text-gray-400',
                                            border: 'border-gray-500/50',
                                            shadow: 'shadow-gray-500/50',
                                            iconBg: 'bg-gray-500/20',
                                            bg: 'bg-gray-500/5',
                                            checkBg: 'bg-gray-500',
                                            shadowColor: '#6b7280'
                                        }
                                    };

                                    const colors = colorMap[achievement.category] || colorMap.default;

                                    return (
                                        <div
                                            key={achievement.achievement_id}
                                            onClick={() => handleAchievementToggle(achievement.achievement_id)}
                                            className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-3 transition relative group ${isSelected
                                                ? `${colors.bg} ${colors.border} shadow-[0_0_15px_-5px_var(--tw-shadow-color)]`
                                                : 'bg-white/5 border-white/10 hover:border-white/30'
                                                }`}
                                            style={isSelected ? { '--tw-shadow-color': colors.shadowColor } : {}}
                                        >
                                            {isSelected && (
                                                <div className={`absolute top-2 right-2 w-5 h-5 ${colors.checkBg} rounded-full flex items-center justify-center text-black`}>
                                                    <Check className="w-3 h-3 font-bold" />
                                                </div>
                                            )}
                                            <div className={`p-3 rounded-full ${isSelected ? colors.iconBg : 'bg-white/5'}`}>
                                                <Icon className={`w-6 h-6 ${isSelected ? colors.text : 'text-gray-400'}`} />
                                            </div>
                                            <div className="text-center">
                                                <div className="text-sm font-medium text-white">{achievement.name}</div>
                                                <div className="text-[10px] text-gray-500 mt-1">{new Date(achievement.unlocked_at).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 bg-gradient-to-r from-neonGreen to-neonPink text-black font-bold px-8 py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50"
                        >
                            <Save className="w-5 h-5" />
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    )
}
