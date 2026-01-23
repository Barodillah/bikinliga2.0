import React, { useState } from 'react'
import { User, Shield, Trophy, Eye, EyeOff, Save, Check } from 'lucide-react'

// Mock Data for Badges
const AVAILABLE_BADGES = [
    { id: 1, name: 'Tournament Winner', icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { id: 2, name: 'MVP Season 1', icon: Star, color: 'text-neonPink', bg: 'bg-neonPink/10' },
    { id: 3, name: 'Early Adopter', icon: Shield, color: 'text-neonGreen', bg: 'bg-neonGreen/10' },
    { id: 4, name: 'Top Donator', icon: Heart, color: 'text-red-400', bg: 'bg-red-400/10' },
    { id: 5, name: 'Verified User', icon: Check, color: 'text-blue-400', bg: 'bg-blue-400/10' },
]

import { Star, Heart } from 'lucide-react'

export default function MyProfile() {
    const [isLoading, setIsLoading] = useState(false)

    // Privacy Settings State
    const [privacySettings, setPrivacySettings] = useState({
        showEmail: false,
        showWinRate: true,
        showRecentMatches: true,
        allowFriendRequests: true
    })

    // Selected Badges State (max 3 for showcase)
    const [selectedBadges, setSelectedBadges] = useState([1, 3])

    const handlePrivacyToggle = (key) => {
        setPrivacySettings(prev => ({
            ...prev,
            [key]: !prev[key]
        }))
    }

    const handleBadgeToggle = (id) => {
        if (selectedBadges.includes(id)) {
            setSelectedBadges(selectedBadges.filter(b => b !== id))
        } else {
            if (selectedBadges.length >= 3) {
                alert('You can only display up to 3 badges on your profile.')
                return
            }
            setSelectedBadges([...selectedBadges, id])
        }
    }

    const handleSave = () => {
        setIsLoading(true)
        setTimeout(() => {
            setIsLoading(false)
            alert('Settings saved successfully!')
        }, 1000)
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
                            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-neonGreen to-neonPink flex items-center justify-center text-black font-bold text-3xl">
                                A
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Admin User</h2>
                                <p className="text-neonGreen">@admin</p>
                            </div>

                            {/* Badges Preview */}
                            <div className="flex justify-center gap-2">
                                {selectedBadges.length > 0 ? (
                                    selectedBadges.map(id => {
                                        const badge = AVAILABLE_BADGES.find(b => b.id === id)
                                        return (
                                            <div key={id} className={`p-2 rounded-lg ${badge.bg} border border-white/5`}>
                                                <badge.icon className={`w-5 h-5 ${badge.color}`} />
                                            </div>
                                        )
                                    })
                                ) : (
                                    <span className="text-xs text-gray-500 italic">No badges selected</span>
                                )}
                            </div>

                            {/* Stats Preview based on Privacy */}
                            <div className="w-full grid grid-cols-2 gap-2 text-sm mt-4">
                                <div className="bg-white/5 p-2 rounded-lg">
                                    <div className="text-gray-400 text-xs">Points</div>
                                    <div className="text-white font-bold">9,999</div>
                                </div>
                                {privacySettings.showWinRate ? (
                                    <div className="bg-white/5 p-2 rounded-lg">
                                        <div className="text-gray-400 text-xs">Win Rate</div>
                                        <div className="text-neonGreen font-bold">100%</div>
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
                                { key: 'allowFriendRequests', label: 'Allow Friend Requests', desc: 'Let other users send you friend requests.' },
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
                    </div>

                    {/* Badge Showcase */}
                    <div className="bg-cardBg border border-white/10 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-400" />
                            Badge Showcase
                        </h3>
                        <p className="text-sm text-gray-400 mb-6">Select up to 3 badges to display on your profile.</p>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {AVAILABLE_BADGES.map((badge) => {
                                const isSelected = selectedBadges.includes(badge.id)
                                return (
                                    <div
                                        key={badge.id}
                                        onClick={() => handleBadgeToggle(badge.id)}
                                        className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-3 transition relative group ${isSelected
                                                ? 'bg-neonGreen/5 border-neonGreen shadow-[0_0_15px_-5px_theme(colors.neonGreen)]'
                                                : 'bg-white/5 border-white/10 hover:border-white/30'
                                            }`}
                                    >
                                        {isSelected && (
                                            <div className="absolute top-2 right-2 w-5 h-5 bg-neonGreen rounded-full flex items-center justify-center text-black">
                                                <Check className="w-3 h-3 font-bold" />
                                            </div>
                                        )}
                                        <div className={`p-3 rounded-full ${badge.bg}`}>
                                            <badge.icon className={`w-6 h-6 ${badge.color}`} />
                                        </div>
                                        <div className="text-center">
                                            <div className="text-sm font-medium text-white">{badge.name}</div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="flex items-center gap-2 bg-gradient-to-r from-neonGreen to-neonPink text-black font-bold px-8 py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50"
                        >
                            <Save className="w-5 h-5" />
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    )
}
