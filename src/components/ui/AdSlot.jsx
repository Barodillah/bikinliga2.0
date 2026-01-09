import React, { useEffect, useRef, useState } from 'react'
import { useAds } from '../../contexts/AdContext'
import { Megaphone } from 'lucide-react'

/**
 * AdSlot Component - Flexible, responsive ad placement
 * 
 * Props:
 * @param {string} variant - 'banner' | 'sidebar' | 'inline' | 'leaderboard'
 * @param {boolean} keepSpace - If true, maintains space when ads are hidden (prevents layout shift)
 * @param {string} className - Additional CSS classes
 * @param {string} adId - Unique identifier for the ad slot (for future ad network integration)
 * 
 * Variants:
 * - banner: Full-width horizontal banner (good for between sections)
 * - sidebar: Vertical sidebar ad (good for side columns)
 * - inline: Small inline ad (good for within content)
 * - leaderboard: Wide horizontal ad (good for page top/bottom)
 */

// Ad Network Configuration
// IMPORTANT: The ad script looks for this EXACT container ID
const AD_SCRIPT_URL = 'https://pl28434666.effectivegatecpm.com/99ff15a9ee1fae5859f94e4c8f92adb5/invoke.js'
const AD_CONTAINER_ID = 'container-99ff15a9ee1fae5859f94e4c8f92adb5'

// Track if script has been loaded globally
let scriptLoaded = false
let scriptLoadPromise = null

const variantStyles = {
    banner: {
        container: 'w-full',
        inner: 'min-h-[96px] sm:min-h-[112px] md:min-h-[128px]',
        label: 'Banner Ad',
    },
    sidebar: {
        container: 'w-full lg:w-64 xl:w-72',
        inner: 'min-h-[256px] lg:min-h-[288px]',
        label: 'Sidebar Ad',
    },
    inline: {
        container: 'w-full max-w-md mx-auto',
        inner: 'min-h-[80px] sm:min-h-[96px]',
        label: 'Sponsored',
    },
    leaderboard: {
        container: 'w-full',
        inner: 'min-h-[80px] sm:min-h-[96px] md:min-h-[112px]',
        label: 'Advertisement',
    },
}

// Function to load ad script
const loadAdScript = () => {
    if (scriptLoadPromise) return scriptLoadPromise

    scriptLoadPromise = new Promise((resolve, reject) => {
        // Check if script already exists
        const existingScript = document.querySelector(`script[src="${AD_SCRIPT_URL}"]`)
        if (existingScript) {
            scriptLoaded = true
            resolve()
            return
        }

        const script = document.createElement('script')
        script.src = AD_SCRIPT_URL
        script.async = true
        script.setAttribute('data-cfasync', 'false')

        script.onload = () => {
            scriptLoaded = true
            resolve()
        }

        script.onerror = () => {
            reject(new Error('Ad script failed to load'))
        }

        document.body.appendChild(script)
    })

    return scriptLoadPromise
}

export default function AdSlot({
    variant = 'banner',
    keepSpace = false,
    className = '',
    adId = 'default'
}) {
    const { showAds } = useAds()
    const [adLoaded, setAdLoaded] = useState(scriptLoaded)
    const [adError, setAdError] = useState(false)

    const styles = variantStyles[variant] || variantStyles.banner

    // Load ad script dynamically
    useEffect(() => {
        if (!showAds) return

        loadAdScript()
            .then(() => setAdLoaded(true))
            .catch(() => setAdError(true))
    }, [showAds])

    // If ads are hidden and we don't want to keep space, return nothing
    if (!showAds && !keepSpace) {
        return null
    }

    // If ads are hidden but we want to keep space, return invisible placeholder
    if (!showAds && keepSpace) {
        return (
            <div
                className={`${styles.container} ${className}`}
                aria-hidden="true"
            >
                <div className={`${styles.inner}`} />
            </div>
        )
    }

    return (
        <div
            className={`${styles.container} ${className}`}
            data-ad-id={adId}
            role="complementary"
            aria-label="Advertisement"
        >
            <div
                className={`
                    ${styles.inner}
                    relative overflow-hidden
                    bg-gradient-to-br from-white/5 to-white/10
                    border border-white/10 border-dashed
                    rounded-xl
                    flex flex-col items-center justify-center
                    transition-all duration-300
                `}
            >
                {/* Ad Container - MUST use exact ID that ad network expects */}
                <div className="relative z-10 w-full flex items-center justify-center">
                    {/* 
                        The ad network script looks for this EXACT container ID.
                        Only one ad will show per page because they all share the same ID.
                        If you need multiple ad slots, you need multiple ad placements from the network.
                    */}
                    <div id={AD_CONTAINER_ID}></div>

                    {/* Fallback placeholder when ad is loading or failed */}
                    {(!adLoaded || adError) && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-500 py-4">
                            <Megaphone className="w-6 h-6 sm:w-8 sm:h-8 opacity-50" />
                            <span className="text-xs font-medium tracking-wider uppercase">
                                {adError ? 'Ad Unavailable' : styles.label}
                            </span>
                            <span className="text-[10px] opacity-60">
                                {adError ? 'Please refresh' : 'Loading...'}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

/**
 * AdSlotWrapper - Wrapper for responsive ad layouts
 * Use this to create side-by-side content + ad layouts
 */
export function AdSlotWrapper({ children, adPosition = 'right', showSidebarAd = true }) {
    const { showAds } = useAds()

    if (!showAds || !showSidebarAd) {
        return <div className="w-full">{children}</div>
    }

    return (
        <div className={`flex flex-col lg:flex-row gap-6 ${adPosition === 'left' ? 'lg:flex-row-reverse' : ''}`}>
            <div className="flex-1 min-w-0">
                {children}
            </div>
            <div className="lg:w-64 xl:w-72 flex-shrink-0">
                <div className="lg:sticky lg:top-24">
                    <AdSlot variant="sidebar" adId="sidebar-sticky" />
                </div>
            </div>
        </div>
    )
}
