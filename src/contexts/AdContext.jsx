import React, { createContext, useContext, useState, useMemo } from 'react'

/**
 * Ad Context for managing subscription state and ad visibility
 * 
 * Usage:
 * 1. Wrap your app with <AdProvider>
 * 2. Use `useAds()` hook to access ad state
 * 
 * Future database integration:
 * - Replace the useState with data fetched from API
 * - subscriptionTier can be: 'free', 'basic', 'premium'
 * - premium tier = no ads
 */

const AdContext = createContext(null)

// Subscription tiers that show ads
const TIERS_WITH_ADS = ['free', 'basic']

export function AdProvider({ children }) {
    // TODO: Replace with actual user subscription data from database/API
    const [subscriptionTier, setSubscriptionTier] = useState('free') // 'free' | 'basic' | 'premium'

    // Calculate if ads should be shown based on subscription
    const showAds = useMemo(() => {
        return TIERS_WITH_ADS.includes(subscriptionTier)
    }, [subscriptionTier])

    const value = useMemo(() => ({
        showAds,
        subscriptionTier,
        setSubscriptionTier, // For testing/admin purposes

        // Helper methods for future integration
        isPremium: subscriptionTier === 'premium',
        isBasic: subscriptionTier === 'basic',
        isFree: subscriptionTier === 'free',
    }), [showAds, subscriptionTier])

    return (
        <AdContext.Provider value={value}>
            {children}
        </AdContext.Provider>
    )
}

export function useAds() {
    const context = useContext(AdContext)
    if (!context) {
        throw new Error('useAds must be used within an AdProvider')
    }
    return context
}

export default AdContext
