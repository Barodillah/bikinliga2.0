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
// Desktop Ad - IMPORTANT: The ad script looks for this EXACT container ID
const DESKTOP_AD_SCRIPT_URL = 'https://pl28434666.effectivegatecpm.com/99ff15a9ee1fae5859f94e4c8f92adb5/invoke.js'
const DESKTOP_AD_CONTAINER_ID = 'container-99ff15a9ee1fae5859f94e4c8f92adb5'

// Mobile Ad Configuration (300x250 iframe)
const MOBILE_AD_KEY = '77d06d0717ff8488648f7775c049c5de'
const MOBILE_AD_SCRIPT_URL = `https://www.highperformanceformat.com/${MOBILE_AD_KEY}/invoke.js`

// Track if desktop script has been loaded globally
let desktopScriptLoaded = false
let desktopScriptLoadPromise = null

// Check if device is mobile (screen width <= 768px)
const isMobileDevice = () => {
    if (typeof window === 'undefined') return false
    return window.innerWidth <= 768
}

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

// Function to load desktop ad script
const loadDesktopAdScript = () => {
    if (desktopScriptLoadPromise) return desktopScriptLoadPromise

    desktopScriptLoadPromise = new Promise((resolve, reject) => {
        // Check if script already exists
        const existingScript = document.querySelector(`script[src="${DESKTOP_AD_SCRIPT_URL}"]`)
        if (existingScript) {
            desktopScriptLoaded = true
            resolve()
            return
        }

        const script = document.createElement('script')
        script.src = DESKTOP_AD_SCRIPT_URL
        script.async = true
        script.setAttribute('data-cfasync', 'false')

        script.onload = () => {
            desktopScriptLoaded = true
            resolve()
        }

        script.onerror = () => {
            reject(new Error('Desktop ad script failed to load'))
        }

        document.body.appendChild(script)
    })

    return desktopScriptLoadPromise
}

export default function AdSlot({
    variant = 'banner',
    keepSpace = false,
    className = '',
    adId = 'default'
}) {
    const { showAds } = useAds()
    const [adLoaded, setAdLoaded] = useState(false)
    const [adError, setAdError] = useState(false)
    const [isMobile, setIsMobile] = useState(isMobileDevice())
    const mobileAdContainerRef = useRef(null)

    const styles = variantStyles[variant] || variantStyles.banner

    // Handle resize to detect mobile/desktop switch
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(isMobileDevice())
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // Load desktop ad script
    useEffect(() => {
        if (!showAds || isMobile) return

        setAdLoaded(false)
        setAdError(false)

        loadDesktopAdScript()
            .then(() => setAdLoaded(true))
            .catch(() => setAdError(true))
    }, [showAds, isMobile])

    // Load mobile ad script directly into container
    useEffect(() => {
        if (!showAds || !isMobile || !mobileAdContainerRef.current) return

        setAdLoaded(false)
        setAdError(false)

        const container = mobileAdContainerRef.current

        // Clear previous content
        container.innerHTML = ''

        // Create and append the atOptions script
        const optionsScript = document.createElement('script')
        optionsScript.type = 'text/javascript'
        optionsScript.text = `
            atOptions = {
                'key' : '${MOBILE_AD_KEY}',
                'format' : 'iframe',
                'height' : 250,
                'width' : 300,
                'params' : {}
            };
        `
        container.appendChild(optionsScript)

        // Create and append the invoke script
        const invokeScript = document.createElement('script')
        invokeScript.type = 'text/javascript'
        invokeScript.src = MOBILE_AD_SCRIPT_URL

        invokeScript.onload = () => {
            setAdLoaded(true)
        }

        invokeScript.onerror = () => {
            setAdError(true)
        }

        container.appendChild(invokeScript)

        // Cleanup function
        return () => {
            if (container) {
                container.innerHTML = ''
            }
        }
    }, [showAds, isMobile])

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
                {/* Ad Container - Shows different ad based on device */}
                <div className="relative z-10 w-full flex items-center justify-center">
                    {isMobile ? (
                        /* Mobile Ad - 300x250 iframe ad - script loaded directly here */
                        <div
                            ref={mobileAdContainerRef}
                            className="flex items-center justify-center"
                            style={{ minHeight: '250px', minWidth: '300px' }}
                        />
                    ) : (
                        /* Desktop Ad - Uses exact container ID that ad network expects */
                        <div id={DESKTOP_AD_CONTAINER_ID}></div>
                    )}

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
