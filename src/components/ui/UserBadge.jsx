import React from 'react'
import { Shield, Crown, BadgeCheck } from 'lucide-react'

export default function UserBadge({ tier = 'free', className = '', size = 'sm', showLabel = false }) {
    if (!tier || tier === 'free') return null

    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    }

    const badgeConfig = {
        captain: {
            icon: Shield,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/30',
            label: 'Captain'
        },
        pro_liga: {
            icon: Crown,
            color: 'text-yellow-400',
            bg: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20',
            border: 'border-yellow-500/50',
            label: 'Pro Liga',
            animate: true
        },
        pro_league: {
            icon: Crown,
            color: 'text-yellow-400',
            bg: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20',
            border: 'border-yellow-500/50',
            label: 'Pro League',
            animate: true
        }
    }

    const config = badgeConfig[tier]
    if (!config) return null

    const Icon = config.icon

    return (
        <div
            className={`
                inline-flex items-center gap-1.5 rounded-full ${showLabel ? 'px-3 py-1' : 'px-1.5 py-0.5'} border
                ${config.color} ${config.bg} ${config.border} ${className}
                ${config.animate ? 'animate-shimmer overflow-hidden relative' : ''}
            `}
            title={`${config.label} Member`}
        >
            <Icon className={`${sizeClasses[size]}`} />
            {showLabel && (
                <span className="text-xs font-bold tracking-wide uppercase">{config.label}</span>
            )}
            {config.animate && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            )}
        </div>
    )
}
