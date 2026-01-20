import React, { useState, useEffect } from 'react'
import { Crown, Zap, History, PlayCircle, Plus, AlertCircle, ArrowRightLeft, Loader2, CheckCircle2 } from 'lucide-react'
import { useAds } from '../../contexts/AdContext'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'

const TOPUP_PACKAGES = [
    { coins: 100, price: 'Rp 15.000', bonus: 0, popular: false },
    { coins: 500, price: 'Rp 65.000', bonus: 50, popular: true },
    { coins: 1000, price: 'Rp 120.000', bonus: 150, popular: false },
]

const MOCK_TRANSACTIONS = [
    { id: 'TRX-882910', type: 'topup', category: 'Deposit', amount: 500, date: '18 Jan 2024, 14:30', status: 'success', desc: 'Top Up via GoPay', method: 'GoPay' },
    { id: 'TRX-882911', type: 'bonus', category: 'Reward', amount: 50, date: '18 Jan 2024, 14:31', status: 'success', desc: 'Bonus Top Up', method: 'System' },
    { id: 'TRX-773201', type: 'spend', category: 'Purchase', amount: -100, date: '17 Jan 2024, 09:15', status: 'success', desc: 'Create Tournament "Liga Santai"', method: 'Wallet' },
    { id: 'TRX-771102', type: 'ad_reward', category: 'Ad Reward', amount: 5, date: '16 Jan 2024, 20:45', status: 'success', desc: 'Watch Ad Reward', method: 'AdMob' },
    { id: 'TRX-662912', type: 'spend', category: 'Purchase', amount: -50, date: '15 Jan 2024, 11:20', status: 'pending', desc: 'Premium Badge Purchase', method: 'Wallet' },
    { id: 'TRX-551023', type: 'topup', category: 'Deposit', amount: 1000, date: '10 Jan 2024, 10:00', status: 'failed', desc: 'Top Up via Transfer', method: 'Bank Transfer' },
]

const COIN_RATE = 150 // 1 Coin = Rp 150
const MIN_IDR_TOPUP = 10000

export default function TopUp() {
    const { subscriptionTier, isFree, isPremium } = useAds()
    const [amountCoins, setAmountCoins] = useState('')
    const [amountIdr, setAmountIdr] = useState('')
    const [error, setError] = useState('')

    // State for interactive features
    const [balance, setBalance] = useState(1250)
    const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS)

    // Ad Watching State
    const [isAdModalOpen, setIsAdModalOpen] = useState(false)
    const [adTimer, setAdTimer] = useState(0)
    const [adStatus, setAdStatus] = useState('idle') // idle, playing, completed
    const adRef = React.useRef(null)

    // VAST Ad Logic (Google Sample) - GUARANTEED VIDEO APPEARANCE
    useEffect(() => {
        let videoElement = null

        if (isAdModalOpen && adStatus === 'playing' && adRef.current) {
            // Clear content
            adRef.current.innerHTML = ''

            // Show loading
            const loadingText = document.createElement('p')
            loadingText.className = 'text-gray-400 text-xs animate-pulse font-mono'
            loadingText.innerText = 'Initializing Video Ad...'
            adRef.current.appendChild(loadingText)

            // Google VAST Sample URL (Robust for localhost)
            // "Single Inline Linear" - Contains the MP4 file directly in the XML.
            const vastUrl = 'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dlinear&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&correlator='

            fetch(vastUrl)
                .then(res => res.text())
                .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
                .then(data => {
                    const mediaFiles = data.getElementsByTagName('MediaFile')
                    let videoSrc = ''
                    // Find MP4
                    for (let i = 0; i < mediaFiles.length; i++) {
                        if (mediaFiles[i].getAttribute('type') === 'video/mp4') {
                            videoSrc = mediaFiles[i].textContent.trim()
                            break
                        }
                    }

                    if (videoSrc && adRef.current) {
                        adRef.current.innerHTML = ''

                        // Native HTML5 Video Player
                        videoElement = document.createElement('video')
                        videoElement.src = videoSrc
                        videoElement.style.width = '100%'
                        videoElement.style.height = '100%'
                        videoElement.style.objectFit = 'contain' // Keep aspect ratio
                        videoElement.controls = false // Disable user seeking
                        videoElement.autoplay = true
                        videoElement.playsInline = true

                        // Prevent context menu
                        videoElement.oncontextmenu = (e) => e.preventDefault()

                        // Sync Timer with Video Duration
                        videoElement.ontimeupdate = () => {
                            const remaining = Math.ceil(videoElement.duration - videoElement.currentTime)
                            if (!isNaN(remaining) && remaining >= 0) {
                                setAdTimer(remaining)
                            }
                        }

                        // Completion Handler
                        videoElement.onended = () => {
                            setAdStatus('completed')
                        }

                        adRef.current.appendChild(videoElement)
                    }
                })
                .catch(err => {
                    console.error("VAST Error", err)
                    if (adRef.current) adRef.current.innerText = 'Failed to load video.'
                })
        }

        return () => {
            if (videoElement) {
                videoElement.pause()
                videoElement.src = ''
            }
        }
    }, [isAdModalOpen, adStatus])

    const handleCoinChange = (e) => {
        const val = e.target.value
        setAmountCoins(val)
        if (val) {
            const idr = val * COIN_RATE
            setAmountIdr(idr)
            validateAmount(idr)
        } else {
            setAmountIdr('')
            setError('')
        }
    }

    const handleIdrChange = (e) => {
        const val = e.target.value
        setAmountIdr(val)
        if (val) {
            const coins = Math.floor(val / COIN_RATE)
            setAmountCoins(coins)
            validateAmount(val)
        } else {
            setAmountCoins('')
            setError('')
        }
    }

    const validateAmount = (idr) => {
        if (idr < MIN_IDR_TOPUP) {
            setError('Minimal top up Rp 10.000')
        } else {
            setError('')
        }
    }

    const [activeFilter, setActiveFilter] = useState('All')

    const getFilteredTransactions = () => {
        if (activeFilter === 'All') return transactions
        if (activeFilter === 'Deposit') return transactions.filter(t => t.type === 'topup')
        if (activeFilter === 'Spend') return transactions.filter(t => t.type === 'spend')
        if (activeFilter === 'Reward') return transactions.filter(t => t.type === 'bonus' || t.type === 'ad_reward')
        return transactions
    }

    const filteredTransactions = getFilteredTransactions()

    const handleManualTopUp = (e) => {
        e.preventDefault()
        if (amountIdr < MIN_IDR_TOPUP) return

        // TODO: Implement payment gateway integration
        console.log('Manual top up:', { coins: amountCoins, idr: amountIdr })
    }

    const handleWatchAd = () => {
        // Reset Ad State
        setAdStatus('playing')
        setAdTimer(15) // 15 seconds ad
        setIsAdModalOpen(true)
    }

    // Timer handled by VAST Video Player
    useEffect(() => {
        // Placeholder for cleanup if needed
    }, [])

    // Claim Reward
    const handleClaimReward = () => {
        const rewardAmount = 5
        const newTx = {
            id: `TRX-${Math.floor(Math.random() * 900000) + 100000}`,
            type: 'ad_reward',
            category: 'Ad Reward',
            amount: rewardAmount,
            date: new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            status: 'success',
            desc: 'Watch Ad Reward',
            method: 'Ad Vendor'
        }

        setBalance(prev => prev + rewardAmount)
        setTransactions(prev => [newTx, ...prev])
        setIsAdModalOpen(false)
        setAdStatus('idle')
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold text-white">Top Up & Subscription</h1>
                    <p className="text-gray-400 mt-1">Manage your coins and premium features</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Subscription & Packages (spans 8) */}
                <div className="lg:col-span-8 space-y-6">
                    <Card className="bg-gradient-to-br from-cardBg to-cardBg/50 border-neonGreen/20">
                        <div className="p-6 sm:p-8">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-8 gap-4">
                                <div>
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Crown className={`w-6 h-6 ${isPremium ? 'text-yellow-400' : 'text-gray-400'}`} />
                                        Subscription Status
                                    </h2>
                                    <p className="text-gray-400 mt-1">Manage your plan and billing details</p>
                                </div>
                                <div className={`self-start px-4 py-1.5 rounded-full text-sm font-bold capitalize ${isPremium
                                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                                    : 'bg-gray-600/30 text-gray-300 border border-gray-600'
                                    }`}>
                                    {subscriptionTier} Plan
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                                    <div className="text-sm text-gray-400 mb-1">Current Balance</div>
                                    <div className="text-3xl font-display font-bold text-white flex items-center gap-2">
                                        <img src="/coin.png" alt="Coin" className="w-8 h-8" />
                                        {balance.toLocaleString()}
                                    </div>
                                </div>
                                <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                                    <div className="text-sm text-gray-400 mb-1">Status Validity</div>
                                    <div className="text-xl font-display font-bold text-white mt-1">
                                        {isPremium ? 'Unlimited Access' : 'Forever Free'}
                                    </div>
                                </div>
                            </div>

                            {!isPremium && (
                                <div className="flex flex-col sm:flex-row items-center gap-4 bg-gradient-to-r from-yellow-500/10 to-transparent p-4 rounded-xl border border-yellow-500/20">
                                    <div className="flex-1">
                                        <h4 className="font-bold text-yellow-500">Upgrade to Premium</h4>
                                        <p className="text-sm text-gray-400">Unlock exclusive features, remove ads, and get monthly coin bonuses.</p>
                                    </div>
                                    <Button variant="primary" className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-400 text-black border-none whitespace-nowrap">
                                        Upgrade Now
                                    </Button>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Popular Top Up Options */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-neonGreen" />
                            Popular Packages
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {TOPUP_PACKAGES.map((pkg, index) => (
                                <Card
                                    key={index}
                                    className={`relative transition-all hover:-translate-y-1 cursor-pointer group hover:shadow-lg hover:shadow-neonGreen/10 ${pkg.popular ? 'border-neonGreen/50 bg-neonGreen/5' : 'hover:border-white/30'
                                        }`}
                                >
                                    {pkg.popular && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-neonGreen text-black text-xs font-bold rounded-full shadow-lg shadow-neonGreen/20">
                                            BEST VALUE
                                        </div>
                                    )}
                                    <div className="p-5 text-center">
                                        <div className="text-3xl font-display font-bold text-white mb-1">
                                            {pkg.coins}
                                        </div>
                                        <div className="text-xs text-gray-400 mb-4 font-medium uppercase tracking-wider">Coins</div>

                                        {pkg.bonus > 0 ? (
                                            <div className="mb-4 text-xs font-bold text-neonGreen bg-neonGreen/10 py-1 px-2 rounded-full inline-block">
                                                +{pkg.bonus} Bonus
                                            </div>
                                        ) : (
                                            <div className="mb-4 h-6"></div>
                                        )}

                                        <div className="py-2.5 bg-white/5 rounded-lg text-white font-bold group-hover:bg-white/10 transition border border-white/5 group-hover:border-white/20">
                                            {pkg.price}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Actions & History (spans 4) */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Manual Top Up */}
                    <Card className="border-neonPink/20 overflow-visible">
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-neonPink" />
                                Manual Top Up
                            </h3>
                            <form onSubmit={handleManualTopUp} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="relative">
                                        <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
                                            Amount (IDR)
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">Rp</span>
                                            <Input
                                                type="number"
                                                placeholder="10.000"
                                                value={amountIdr}
                                                onChange={handleIdrChange}
                                                className="w-full pl-10"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-center">
                                        <div className="bg-white/5 rounded-full p-2 text-gray-400">
                                            <ArrowRightLeft className="w-4 h-4 rotate-90" />
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
                                            Get Coins
                                        </label>
                                        <div className="relative">
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                value={amountCoins}
                                                onChange={handleCoinChange}
                                                className="w-full pr-12 text-neonGreen font-bold"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">COINS</span>
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 text-red-400 text-xs">
                                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    variant="outline"
                                    className={`w-full ${error ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={!!error || !amountIdr}
                                >
                                    Continue Payment
                                </Button>

                                <div className="text-center">
                                    <p className="text-[10px] text-gray-500">Min. Top Up Rp 10.000 (Rate: 1 Coin = Rp {COIN_RATE})</p>
                                </div>
                            </form>
                        </div>
                    </Card>

                    {/* Free Coins Action */}
                    <Card className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-indigo-500/30">
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                <PlayCircle className="w-5 h-5 text-indigo-400" />
                                Free Coins
                            </h3>
                            <p className="text-sm text-gray-400 mb-4">
                                Watch a short video advertisement to earn free coins instantly.
                            </p>
                            <Button onClick={handleWatchAd} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white border-none shadow-lg shadow-indigo-900/20">
                                Watch Ads (+5 Coins)
                            </Button>
                        </div>
                    </Card>

                </div>
            </div>

            {/* Transaction History - Full Width */}
            <div className="w-full">
                <Card>
                    <div className="p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <History className="w-5 h-5 text-neonGreen" />
                                Transaction History
                            </h3>
                            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                                {['All', 'Deposit', 'Spend', 'Reward'].map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() => setActiveFilter(filter)}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap ${activeFilter === filter
                                            ? 'bg-white/10 text-white border border-white/10'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                                            }`}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Desktop View (Table) */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 text-xs text-gray-400 uppercase tracking-wider">
                                        <th className="px-4 py-3 font-medium">Transaction</th>
                                        <th className="px-4 py-3 font-medium">Amount</th>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                        <th className="px-4 py-3 font-medium">Date & Time</th>
                                        <th className="px-4 py-3 font-medium text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-white/5">
                                    {filteredTransactions.map((tx) => (
                                        <tr key={tx.id} className="group hover:bg-white/5 transition">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.amount > 0 ? 'bg-neonGreen/10 text-neonGreen' : 'bg-red-500/10 text-red-500'
                                                        }`}>
                                                        {tx.amount > 0 ? <Plus className="w-4 h-4" /> : <div className="w-3 h-0.5 bg-current" />}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white">{tx.desc}</div>
                                                        <div className="text-xs text-gray-500 flex items-center gap-2">
                                                            <span>{tx.id}</span>
                                                            <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                                                            <span>{tx.method}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className={`font-bold font-display ${tx.amount > 0 ? 'text-neonGreen' : 'text-white'}`}>
                                                    {tx.amount > 0 ? '+' : ''}{tx.amount} Coins
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tx.status === 'success' ? 'bg-green-500/10 text-green-400' :
                                                    tx.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                                                        'bg-red-500/10 text-red-400'
                                                    }`}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-gray-400">
                                                {tx.date}
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <button className="text-xs text-gray-500 hover:text-white transition">
                                                    Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile View (List Cards) */}
                        <div className="md:hidden space-y-4">
                            {filteredTransactions.map((tx) => (
                                <div key={tx.id} className="p-4 rounded-xl bg-white/5 border border-white/5">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${tx.amount > 0 ? 'bg-neonGreen/10 text-neonGreen' : 'bg-red-500/10 text-red-500'
                                                }`}>
                                                {tx.amount > 0 ? <Plus className="w-5 h-5" /> : <div className="w-3 h-0.5 bg-current" />}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white text-sm">{tx.desc}</div>
                                                <div className="text-xs text-gray-500">{tx.date}</div>
                                            </div>
                                        </div>
                                        <div className={`font-bold font-display text-sm ${tx.amount > 0 ? 'text-neonGreen' : 'text-white'}`}>
                                            {tx.amount > 0 ? '+' : ''}{tx.amount}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <span>{tx.id}</span>
                                            <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                                            <span>{tx.method}</span>
                                        </div>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase ${tx.status === 'success' ? 'bg-green-500/10 text-green-400' :
                                            tx.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                                                'bg-red-500/10 text-red-400'
                                            }`}>
                                            {tx.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredTransactions.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>No transactions found</p>
                            </div>
                        )}

                        {filteredTransactions.length > 0 && (
                            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                                <div className="text-xs text-gray-500">
                                    Showing {filteredTransactions.length} transactions
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" className="px-3 py-1.5 text-xs h-auto">Previous</Button>
                                    <Button variant="outline" className="px-3 py-1.5 text-xs h-auto">Next</Button>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Ad Watch Modal */}
            <Modal
                isOpen={isAdModalOpen}
                onClose={() => {
                    if (adStatus === 'completed') {
                        setIsAdModalOpen(false)
                        setAdStatus('idle')
                    } else {
                        // Optional: Confirm before closing if playing?
                        if (window.confirm("Close ad? You won't get the reward.")) {
                            setIsAdModalOpen(false)
                            setAdStatus('idle')
                        }
                    }
                }}
                title="Watch Ad for Free Coins"
            >
                <div className="flex flex-col items-center justify-center p-4">
                    {adStatus === 'playing' ? (
                        <>
                            <div id="adsterra-container" className="w-full aspect-video bg-black/50 rounded-xl overflow-hidden relative flex items-center justify-center">
                                {/* 
                                    INSTRUCTION:
                                    Paste your Adsterra Script below. 
                                    If it's a "Social Bar" or "Video Slider" script (usually one line src),
                                    you might want to put it in useEffect to load it when modal opens.
                                    
                                    For "Web Banner" / "Native Banner" (iframe/script combos):
                                */}
                                <div ref={adRef} className="w-full h-full flex items-center justify-center bg-black">
                                    {/* Video Player will be inserted here by useEffect */}
                                </div>
                                <p className="text-xs text-gray-500 mt-2 text-center">
                                    *Demo Commercial (Google VAST)* <br /> To earn real revenue, replace VAST URL with Adsterra/Monetag after domain approval.
                                </p>

                                {/* Timer Overlay: Keep it to simulate/enforce watch time */}
                                <div className="absolute bottom-4 left-4 right-4 z-10">
                                    <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-500 transition-all duration-1000 ease-linear"
                                            style={{ width: `${((15 - adTimer) / 15) * 100}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs text-white mt-2 font-medium drop-shadow-md">
                                        <span>Advertisement</span>
                                        <span>{adTimer}s remaining</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 text-center">
                                <h4 className="text-white font-bold mb-1">Watching Advertisement...</h4>
                                <p className="text-sm text-gray-400">Please wait to earn your reward.</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6 animate-in zoom-in duration-300">
                                <CheckCircle2 className="w-10 h-10 text-green-500" />
                            </div>
                            <h4 className="text-xl font-bold text-white mb-2">Reward Unlocked!</h4>
                            <p className="text-gray-400 text-center mb-8">
                                You have successfully earned <span className="text-neonGreen font-bold">+5 Coins</span>.
                            </p>
                            <Button
                                onClick={handleClaimReward}
                                className="w-full bg-green-600 hover:bg-green-500 border-none text-white shadow-lg shadow-green-900/20"
                            >
                                Claim 5 Coins
                            </Button>
                        </>
                    )}
                </div>
            </Modal>
        </div>
    )
}
