import React, { useState, useEffect } from 'react'
import { authFetch } from '../../utils/api'
import { Crown, Zap, History, PlayCircle, Plus, AlertCircle, ArrowRightLeft, Loader2, CheckCircle2, Star } from 'lucide-react'
import { useAds } from '../../contexts/AdContext'
import { useAuth } from '../../contexts/AuthContext'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import ConfirmationModal from '../../components/ui/ConfirmationModal'
import { useToast } from '../../contexts/ToastContext'
import ReactJoyride, { EVENTS, STATUS } from 'react-joyride'
import { useLocation } from 'react-router-dom'

const TOPUP_PACKAGES = [
    { coins: 100, price: 'Rp 15.000', bonus: 0, popular: false },
    { coins: 500, price: 'Rp 65.000', bonus: 50, popular: true },
    { coins: 1000, price: 'Rp 120.000', bonus: 150, popular: false },
]

const MOCK_TRANSACTIONS = [
    { id: 'TRX-882910', type: 'topup', category: 'Deposit', amount: 500, date: '18 Jan 2024, 14:30', status: 'success', desc: 'Top Up via GoPay', method: 'GoPay' },
    { id: 'TRX-882911', type: 'bonus', category: 'Reward', amount: 50, date: '18 Jan 2024, 14:31', status: 'success', desc: 'Bonus Top Up', method: 'System' },
    { id: 'TRX-773201', type: 'spend', category: 'Purchase', amount: -100, date: '17 Jan 2024, 09:15', status: 'success', desc: 'Create Tournament "Liga Santai"', method: 'Wallet' },
    { id: 'TRX-771102', type: 'reward', category: 'Ad Reward', amount: 5, date: '16 Jan 2024, 20:45', status: 'success', desc: 'Watch Ad Reward', method: 'AdMob' },
    { id: 'TRX-662912', type: 'spend', category: 'Purchase', amount: -50, date: '15 Jan 2024, 11:20', status: 'pending', desc: 'Premium Badge Purchase', method: 'Wallet' },
    { id: 'TRX-551023', type: 'topup', category: 'Deposit', amount: 1000, date: '10 Jan 2024, 10:00', status: 'failed', desc: 'Top Up via Transfer', method: 'Bank Transfer' },
]

const COIN_RATE = 150 // 1 Coin = Rp 150
const SUBSCRIPTION_PLANS = [
    {
        id: 'captain',
        name: 'Captain',
        db_id: 2,
        price: '1.960 Coins',
        coins: 1960,
        period: '/ 6 Bulan',
        features: [
            'Max 5 Tournaments',
            'Max 32 Participants',
            'Advanced Bracket',
            'Team Management',
            'Custom Rules',
            'Export Data'
        ]
    },
    {
        id: 'pro_league',
        name: 'Pro League',
        db_id: 3,
        price: '5.960 Coins',
        coins: 5960,
        period: '/ 6 Bulan',
        features: [
            'Unlimited Tournaments',
            'Max 64 Participants',
            'All Features',
            'Priority Support',
            'API Access',
            'White Label'
        ]
    }
]
const MIN_IDR_TOPUP = 10000
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export default function TopUp() {
    const { subscriptionTier, isFree, isPremium } = useAds()
    const { wallet, subscription, refreshWallet, user, refreshUser } = useAuth()
    const [amountCoins, setAmountCoins] = useState('')
    const [amountIdr, setAmountIdr] = useState('')
    const [error, setError] = useState('')
    const location = useLocation()

    // State for interactive features
    const [transactions, setTransactions] = useState([])
    const [isLoadingTx, setIsLoadingTx] = useState(true)

    // Ad Watching State
    const [isAdModalOpen, setIsAdModalOpen] = useState(false)
    const [adTimer, setAdTimer] = useState(0)
    const [maxDuration, setMaxDuration] = useState(15) // Default fallback
    const [adStatus, setAdStatus] = useState('idle') // idle, playing, completed

    const adRef = React.useRef(null)
    const { success, error: toastError } = useToast()

    // Get subscription tier styling
    const getSubscriptionStyle = (plan) => {
        switch (plan?.toLowerCase()) {
            case 'pro_league':
                return {
                    bg: 'bg-purple-500/20',
                    text: 'text-purple-400',
                    border: 'border-purple-500/50',
                    name: 'Pro League',
                    Icon: Crown,
                    gradient: 'from-purple-600/20 via-pink-500/20 to-purple-600/20',
                    cardBorder: 'border-purple-500/30',
                    crownColor: 'text-purple-400',
                    validity: 'Pro League Access'
                }
            case 'captain':
                return {
                    bg: 'bg-yellow-500/20',
                    text: 'text-yellow-400',
                    border: 'border-yellow-500/50',
                    name: 'Captain',
                    Icon: Star,
                    gradient: 'from-yellow-500/20 via-amber-500/20 to-yellow-500/20',
                    cardBorder: 'border-yellow-500/30',
                    crownColor: 'text-yellow-400',
                    validity: 'Captain Access'
                }
            default:
                return {
                    bg: 'bg-gray-600/30',
                    text: 'text-gray-300',
                    border: 'border-gray-600',
                    name: 'Free',
                    Icon: Zap,
                    gradient: 'from-cardBg to-cardBg/50',
                    cardBorder: 'border-neonGreen/20',
                    crownColor: 'text-gray-400',
                    validity: 'Forever Free'
                }
        }
    }

    const subStyle = getSubscriptionStyle(subscription?.plan)
    const isPremiumPlan = subscription?.plan && subscription.plan !== 'free'

    // Fetch transactions from API
    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const token = localStorage.getItem('token')
                if (!token) {
                    setIsLoadingTx(false)
                    return
                }

                const response = await authFetch(`${API_URL}/user/transactions?limit=20`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                    credentials: 'include'
                })

                const data = await response.json()
                if (data.success) {
                    // Map API data to display format
                    const mapped = data.data.map(tx => ({
                        id: tx.id,
                        type: tx.type,
                        category: tx.category || tx.type,
                        amount: tx.type === 'spend' ? -Math.abs(tx.amount) : tx.amount,
                        date: new Date(tx.created_at).toLocaleString('en-GB', {
                            day: 'numeric', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                        }),
                        status: tx.status,
                        desc: tx.description,
                        method: tx.reference_id || 'Wallet'
                    }))
                    setTransactions(mapped)

                    // Auto-check pending topup transactions
                    const pendingTopups = mapped.filter(tx => tx.type === 'topup' && tx.status === 'pending')
                    if (pendingTopups.length > 0) {
                        for (const pendingTx of pendingTopups) {
                            try {
                                const invoiceNumber = pendingTx.method;
                                const checkRes = await authFetch(`${API_URL}/user/topup/status/${invoiceNumber}`, {
                                    headers: { 'Authorization': `Bearer ${token}` }
                                });
                                const checkData = await checkRes.json();

                                if (checkData.success && checkData.status !== 'pending') {
                                    // Make a recursive or re-fetch call to update the UI
                                    const updatedRes = await authFetch(`${API_URL}/user/transactions?limit=20`, {
                                        headers: { 'Authorization': `Bearer ${token}` }
                                    });
                                    const updatedData = await updatedRes.json();
                                    if (updatedData.success) {
                                        setTransactions(updatedData.data.map(tx => ({
                                            id: tx.id,
                                            type: tx.type,
                                            category: tx.category || tx.type,
                                            amount: tx.type === 'spend' ? -Math.abs(tx.amount) : tx.amount,
                                            date: new Date(tx.created_at).toLocaleString('en-GB', {
                                                day: 'numeric', month: 'short', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            }),
                                            status: tx.status,
                                            desc: tx.description,
                                            method: tx.reference_id || 'Wallet'
                                        })))
                                    }
                                    if (typeof refreshWallet === 'function') refreshWallet();
                                    if (typeof refreshUser === 'function') refreshUser();

                                    if (checkData.status === 'success') {
                                        success(`Pembayaran untuk ${pendingTx.desc} berhasil!`)
                                    } else {
                                        toastError(`Pembayaran untuk ${pendingTx.desc} gagal atau kadaluarsa.`)
                                    }
                                }
                            } catch (e) {
                                console.error('Auto check pending error', e)
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Fetch transactions error:', error)
            } finally {
                setIsLoadingTx(false)
            }
        }

        fetchTransactions()
    }, [])

    // Tour State
    const [runTour, setRunTour] = useState(false);
    const [tourSteps, setTourSteps] = useState([
        {
            target: '#tour-topup-subscription',
            content: 'Di sini Anda dapat melihat status langganan saat ini dan saldo koin Anda. Anda juga bisa upgrade ke Premium untuk fitur tambahan.',
            title: 'Status Langganan',
            disableBeacon: true,
        },
        {
            target: '#tour-topup-packages',
            content: 'Pilih salah satu paket koin populer untuk Top Up instan. Dapatkan bonus koin untuk paket tertentu!',
            title: 'Paket Populer',
        },
        {
            target: '#tour-topup-manual',
            content: 'Atau, Anda bisa memasukkan nominal Rupiah secara manual. Sistem akan otomatis menghitung koin yang akan Anda dapatkan.',
            title: 'Top Up Manual',
        },
        {
            target: '#tour-topup-ads',
            content: 'Ingin koin gratis? Tonton video iklan pendek di sini dan dapatkan koin tambahan secara cuma-cuma!',
            title: 'Koin Gratis',
        },
        {
            target: '#tour-topup-history',
            content: 'Semua riwayat masuk dan keluarnya koin akan tercatat rapi di tabel transaksi ini.',
            title: 'Riwayat Transaksi',
        }
    ]);

    useEffect(() => {
        const tourSeen = localStorage.getItem('topup_tour_seen');
        if (!tourSeen) {
            setRunTour(true);
        }
    }, []);

    const handleJoyrideCallback = (data) => {
        const { status } = data;
        const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];
        if (finishedStatuses.includes(status)) {
            setRunTour(false);
            localStorage.setItem('topup_tour_seen', 'true');
        }
    };

    // Ad Warning Modal
    const [adWarningModal, setAdWarningModal] = useState(false)

    // Modal & Payment State
    const [showPremiumModal, setShowPremiumModal] = useState(false)
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [selectedPackage, setSelectedPackage] = useState(null)
    const [isClaiming, setIsClaiming] = useState(false)
    const [isUpgrading, setIsUpgrading] = useState(false)
    const [adClickUrl, setAdClickUrl] = useState('')
    const [isVideoLoading, setIsVideoLoading] = useState(false)
    const [hasAdTimeout, setHasAdTimeout] = useState(false)
    const [selectedTx, setSelectedTx] = useState(null)
    const [isCheckingStatus, setIsCheckingStatus] = useState(false)
    const [billingDetails, setBillingDetails] = useState({
        fullName: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        city: user?.city || '',
        zipCode: user?.zip_code || ''
    })

    // Sync billing details when user data is loaded
    useEffect(() => {
        if (user) {
            setBillingDetails(prev => ({
                ...prev,
                fullName: user.name || prev.fullName,
                email: user.email || prev.email,
                phone: user.phone || prev.phone,
                address: user.address || prev.address,
                city: user.city || prev.city,
                zipCode: user.zip_code || prev.zipCode
            }))
        }
    }, [user])

    // VAST Ad Logic (Dynamic Fetch)
    useEffect(() => {
        let videoElement = null
        let isCancelled = false
        let loadTimeoutMs = null

        const initAd = async () => {
            if (!adRef.current) return

            // Clear content
            adRef.current.innerHTML = ''

            // Standard Fallback Video from the provided VAST XML
            let videoSrc = 'https://www.silent-basis.pro/152327/199275/559488_449f5.mp4'
            const vastUrl = 'https://sadpicture.com/d.m/Fmz-dzGpNkv/ZqGwUV/IepmY9huWZSUzlTktPET/Yk4BM/TDgSzwNYDaUstCNoj/g/xbO-DfM/0KO/QR'

            try {
                // Fetch dynamic VAST URL
                const response = await fetch(vastUrl)
                const xmlText = await response.text()
                const parser = new DOMParser()
                const xmlDoc = parser.parseFromString(xmlText, "text/xml")

                // Track Impression
                const impressions = xmlDoc.getElementsByTagName('Impression')
                if (impressions.length > 0 && impressions[0].textContent) {
                    fetch(impressions[0].textContent.trim(), { mode: 'no-cors' }).catch(() => { })
                }

                // Get nearest MP4 MediaFile
                const mediaFiles = xmlDoc.getElementsByTagName('MediaFile')
                for (let i = 0; i < mediaFiles.length; i++) {
                    const type = mediaFiles[i].getAttribute('type')
                    if (type === 'video/mp4' || type === 'video/webm') {
                        videoSrc = mediaFiles[i].textContent.trim()
                        break
                    }
                }
                // Get ClickThrough URL
                const videoClicks = xmlDoc.getElementsByTagName('VideoClicks')
                if (videoClicks.length > 0) {
                    const clickThroughs = videoClicks[0].getElementsByTagName('ClickThrough')
                    if (clickThroughs.length > 0 && clickThroughs[0].textContent) {
                        setAdClickUrl(clickThroughs[0].textContent.trim())
                    }
                }
            } catch (error) {
                console.error("Failed to load VAST, using fallback video:", error)
            }

            if (isCancelled) return

            // Native HTML5 Video Player
            videoElement = document.createElement('video')
            videoElement.src = videoSrc
            videoElement.style.width = '100%'
            videoElement.style.height = '100%'
            videoElement.style.objectFit = 'contain' // Keep aspect ratio
            videoElement.controls = false // Disable user seeking
            videoElement.autoplay = true
            videoElement.playsInline = true
            videoElement.muted = false // Ensure sound is on if possible

            // Prevent context menu
            videoElement.oncontextmenu = (e) => e.preventDefault()

            videoElement.oncanplay = () => {
                if (!isCancelled) setIsVideoLoading(false)
            }
            videoElement.onerror = () => {
                if (!isCancelled) {
                    setHasAdTimeout(true)
                    setIsVideoLoading(false)
                }
            }

            // Sync Timer with Video Duration
            videoElement.ontimeupdate = () => {
                const duration = videoElement.duration
                if (!isNaN(duration) && duration > 0) {
                    setMaxDuration(Math.ceil(duration))
                    const remaining = Math.ceil(duration - videoElement.currentTime)
                    if (!isNaN(remaining) && remaining >= 0) {
                        setAdTimer(remaining)
                    }
                }
            }

            // Completion Handler
            videoElement.onended = () => {
                setAdStatus('completed')
            }

            adRef.current.appendChild(videoElement)

            loadTimeoutMs = setTimeout(() => {
                if (videoElement && (videoElement.readyState === 0 || videoElement.networkState === 3) && !isCancelled) {
                    setHasAdTimeout(true)
                    setIsVideoLoading(false)
                }
            }, 10000)
        }

        if (isAdModalOpen && adStatus === 'playing') {
            initAd()
        }

        return () => {
            isCancelled = true
            if (loadTimeoutMs) clearTimeout(loadTimeoutMs)
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
        if (activeFilter === 'Reward') return transactions.filter(t => t.type === 'bonus' || t.type === 'reward')
        return transactions
    }

    const filteredTransactions = getFilteredTransactions()

    const handleManualTopUp = (e) => {
        e.preventDefault()
        if (amountIdr < MIN_IDR_TOPUP) return

        setSelectedPackage({
            name: 'Manual Top Up',
            coins: amountCoins,
            price: `Rp ${Number(amountIdr).toLocaleString()}`,
            bonus: 0,
            amountIdr: amountIdr
        })
        setShowPaymentModal(true)
    }

    const handlePackageClick = (pkg) => {
        setSelectedPackage({
            ...pkg,
            name: `${pkg.coins} Coins Package`,
            amountIdr: parseInt(pkg.price.replace(/\D/g, ''))
        })
        setShowPaymentModal(true)
    }

    const handlePaymentConfirm = async (e) => {
        e.preventDefault()
        setIsLoadingTx(true) // Reuse loading state or add new one

        try {
            const token = localStorage.getItem('token')
            const response = await authFetch(`${API_URL}/user/topup/create-payment`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: selectedPackage.amountIdr,
                    coins: selectedPackage.coins + (selectedPackage.bonus || 0),
                    package_name: selectedPackage.name,
                    billing: billingDetails
                }),
                credentials: 'include'
            })

            const data = await response.json()
            if (data.success && data.data.payment_url) {
                // Redirect to DOKU Checkout
                window.location.href = data.data.payment_url
            } else {
                throw new Error(data.message || 'Gagal membuat pembayaran')
            }
        } catch (err) {
            console.error('Payment error:', err)
            toastError(err.message || 'Gagal memproses pembayaran')
        } finally {
            setIsLoadingTx(false)
        }
    }

    const handlePremiumConfirm = async (plan) => {
        setIsUpgrading(true)
        try {
            const token = localStorage.getItem('token')
            const res = await authFetch(`${API_URL}/user/subscription/upgrade`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ plan_id: plan.db_id }),
                credentials: 'include'
            })

            const data = await res.json()
            if (data.success) {
                success(`Berhasil upgrade ke paket ${plan.name}!`)
                setShowPremiumModal(false)
                if (typeof refreshWallet === 'function') refreshWallet()
                if (typeof refreshUser === 'function') refreshUser()
            } else {
                throw new Error(data.message || 'Gagal upgrade paket')
            }
        } catch (error) {
            console.error('Upgrade error:', error)
            toastError(error.message || 'Terjadi kesalahan saat upgrade')
        } finally {
            setIsUpgrading(false)
        }
    }

    const handleCheckStatus = async () => {
        if (!selectedTx || selectedTx.type !== 'topup') return;
        setIsCheckingStatus(true);

        try {
            const token = localStorage.getItem('token');
            // Untuk DOKU Checkout, Invoice Number disimpan di kolom reference_id.
            // Di mapping frontend, reference_id di-map ke property 'method'.
            const invoiceNumber = selectedTx.method;
            const response = await authFetch(`${API_URL}/user/topup/status/${invoiceNumber}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            if (data.success) {
                if (data.status !== selectedTx.status) {
                    success(`Status diperbarui menjadi: ${data.status}`);
                    // Perbarui state lokal
                    setSelectedTx({ ...selectedTx, status: data.status });

                    // Refresh data wallet & riwayat transaksi
                    if (typeof refreshWallet === 'function') refreshWallet();
                    if (typeof refreshUser === 'function') refreshUser();

                    // Re-fetch transactions
                    const txRes = await authFetch(`${API_URL}/user/transactions?limit=20`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const txData = await txRes.json();
                    if (txData.success) {
                        const mapped = txData.data.map(tx => ({
                            id: tx.id,
                            type: tx.type,
                            category: tx.category || tx.type,
                            amount: tx.type === 'spend' ? -Math.abs(tx.amount) : tx.amount,
                            date: new Date(tx.created_at).toLocaleString('en-GB', {
                                day: 'numeric', month: 'short', year: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                            }),
                            status: tx.status,
                            desc: tx.description,
                            method: tx.reference_id || 'Wallet'
                        }));
                        setTransactions(mapped);
                    }
                } else {
                    success('Status pembayaran masih pending');
                }
            } else {
                throw new Error(data.message || 'Gagal mengecek status');
            }
        } catch (error) {
            console.error('Check status error:', error);
            toastError(error.message);
        } finally {
            setIsCheckingStatus(false);
        }
    }

    const handleWatchAd = () => {
        // Reset Ad State
        setAdClickUrl('')
        setAdStatus('playing')
        setAdTimer(15) // 15 seconds ad
        setIsVideoLoading(true)
        setHasAdTimeout(false)
        setIsAdModalOpen(true)
    }

    // Timer handled by VAST Video Player
    useEffect(() => {
        // Placeholder for cleanup if needed
    }, [])

    // Handle Hash Scroll & Payment Status
    useEffect(() => {
        const query = new URLSearchParams(location.search)
        const status = query.get('status')
        const invoice = query.get('invoice')

        if (status === 'check' && invoice) {
            success(`Pembayaran sedang diproses untuk invoice ${invoice}`)
            // Remove query params from URL
            window.history.replaceState({}, document.title, window.location.pathname)

            // Refresh wallet after a short delay
            setTimeout(() => {
                if (typeof refreshWallet === 'function') refreshWallet()
                if (typeof refreshUser === 'function') refreshUser()
            }, 3000)
        }

        if (location.hash === '#tour-topup-ads') {
            const el = document.getElementById('tour-topup-ads')
            if (el) {
                setTimeout(() => {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    // Optional: highlight element briefly
                    el.classList.add('ring-4', 'ring-neonGreen', 'transition-all', 'duration-500')
                    setTimeout(() => el.classList.remove('ring-4', 'ring-neonGreen'), 2000)
                }, 300)
            }
        }
    }, [location.hash, location.search])

    // Claim Reward
    const handleClaimReward = async () => {
        setIsClaiming(true)
        // Rate: 5 coins per 30 seconds -> 1 coin per 6 seconds
        const rewardAmount = Math.max(1, Math.round((maxDuration / 30) * 5))

        try {
            const token = localStorage.getItem('token')
            if (!token) throw new Error("Please login to claim rewards")

            const response = await authFetch(`${API_URL}/user/claim-ad-reward`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ coins: rewardAmount }),
                credentials: 'include'
            })

            const data = await response.json()
            if (data.success) {
                success(`Successfully earned ${rewardAmount} coins!`)

                // Add the new transaction manually to reflect immediately, or just refresh
                const newTx = {
                    id: `TRX-${Math.floor(Math.random() * 900000) + 100000}`,
                    type: 'reward',
                    category: 'Ad Reward',
                    amount: rewardAmount,
                    date: new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
                    status: 'success',
                    desc: 'Watch Ad Reward',
                    method: 'Ad Vendor'
                }

                setTransactions(prev => [newTx, ...prev])
                // Refresh global wallet state if possible, or trigger a re-fetch
                if (typeof refreshWallet === 'function') {
                    refreshWallet()
                }
                if (typeof refreshUser === 'function') {
                    refreshUser()
                }
            } else {
                throw new Error(data.message || 'Failed to claim reward')
            }
        } catch (err) {
            console.error('Claim error:', err)
            // Error handling, maybe show a toast
        } finally {
            setIsClaiming(false)
            setIsAdModalOpen(false)
            setAdStatus('idle')
        }
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <ReactJoyride
                steps={tourSteps}
                run={runTour}
                continuous
                showProgress
                showSkipButton
                callback={handleJoyrideCallback}
                styles={{
                    options: {
                        arrowColor: '#121212',
                        backgroundColor: '#121212',
                        overlayColor: 'rgba(5, 5, 5, 0.5)',
                        primaryColor: '#02FE02',
                        textColor: '#fff',
                        zIndex: 1000,
                    },
                    tooltipContainer: {
                        textAlign: 'left'
                    },
                    buttonNext: {
                        backgroundColor: '#02FE02',
                        color: '#000',
                        fontFamily: 'Space Grotesk, sans-serif',
                        fontWeight: 'bold',
                        outline: 'none',
                    },
                    buttonBack: {
                        color: '#fff',
                        fontFamily: 'Space Grotesk, sans-serif',
                        outline: 'none',
                    },
                    buttonSkip: {
                        color: '#fff',
                        fontFamily: 'Space Grotesk, sans-serif'
                    }
                }}
                locale={{
                    back: 'Kembali',
                    close: 'Tutup',
                    last: 'Selesai',
                    next: 'Lanjut',
                    skip: 'Lewati',
                }}
            />
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold text-white">Top Up & Subscription</h1>
                    <p className="text-gray-400 mt-1">Manage your coins and premium features</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Subscription & Packages (spans 8) */}
                <div className="lg:col-span-8 space-y-6">
                    <Card id="tour-topup-subscription" className={`bg-gradient-to-br ${subStyle.gradient} ${subStyle.cardBorder} relative overflow-hidden`}>
                        {/* Decorative glow for premium tiers */}
                        {isPremiumPlan && (
                            <div className={`absolute -top-20 -right-20 w-40 h-40 ${subStyle.bg} rounded-full blur-3xl opacity-40`}></div>
                        )}
                        <div className="p-6 sm:p-8 relative">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-8 gap-4">
                                <div>
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Crown className={`w-6 h-6 ${subStyle.crownColor}`} />
                                        Subscription Status
                                    </h2>
                                    <p className="text-gray-400 mt-1">Manage your plan and billing details</p>
                                </div>
                                <div className={`self-start px-4 py-1.5 rounded-full text-sm font-bold capitalize ${subStyle.border} ${subStyle.bg} ${subStyle.text} flex items-center gap-1.5`}>
                                    <subStyle.Icon className="w-4 h-4" />
                                    {subStyle.name} Plan
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                <div className={`bg-black/20 rounded-xl p-4 border ${isPremiumPlan ? subStyle.border : 'border-white/5'}`}>
                                    <div className="text-sm text-gray-400 mb-1">Current Balance</div>
                                    <div className="text-3xl font-display font-bold text-white flex items-center gap-2">
                                        <img src="/coin.png" alt="Coin" className="w-8 h-8" />
                                        {Math.floor(wallet?.balance || 0).toLocaleString()}
                                    </div>
                                </div>
                                <div className={`bg-black/20 rounded-xl p-4 border ${isPremiumPlan ? subStyle.border : 'border-white/5'}`}>
                                    <div className="text-sm text-gray-400 mb-1">Status Validity</div>
                                    <div className={`text-xl font-display font-bold mt-1 ${isPremiumPlan ? subStyle.text : 'text-white'}`}>
                                        {isPremiumPlan && subscription?.end_date
                                            ? new Date(subscription.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                                            : subStyle.validity}
                                    </div>
                                </div>
                            </div>

                            {(!isPremiumPlan || subscription?.plan?.toLowerCase() === 'captain') && (
                                <div className="flex flex-col sm:flex-row items-center gap-4 bg-gradient-to-r from-yellow-500/10 to-transparent p-4 rounded-xl border border-yellow-500/20">
                                    <div className="flex-1">
                                        <h4 className="font-bold text-yellow-500">
                                            {subscription?.plan?.toLowerCase() === 'captain' ? 'Upgrade to Pro League' : 'Upgrade to Premium'}
                                        </h4>
                                        <p className="text-sm text-gray-400">
                                            {subscription?.plan?.toLowerCase() === 'captain'
                                                ? 'Unlock unlimited tournaments, max 64 participants, and white label features.'
                                                : 'Unlock exclusive features, remove ads, and get monthly coin bonuses.'}
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => setShowPremiumModal(true)}
                                        variant="primary"
                                        className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-400 text-black border-none whitespace-nowrap"
                                    >
                                        {subscription?.plan?.toLowerCase() === 'captain' ? 'Upgrade to Pro' : 'Upgrade Now'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Popular Top Up Options */}
                    <div id="tour-topup-packages">
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
                                    onClick={() => handlePackageClick(pkg)}
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
                    <Card id="tour-topup-manual" className="border-neonPink/20 overflow-visible">
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
                    <Card id="tour-topup-ads" className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-indigo-500/30">
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                <PlayCircle className="w-5 h-5 text-indigo-400" />
                                Free Coins
                            </h3>
                            <p className="text-sm text-gray-400 mb-4">
                                Watch a short video advertisement to earn free coins instantly.
                            </p>
                            <Button onClick={handleWatchAd} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white border-none shadow-lg shadow-indigo-900/20">
                                Watch Ads (Free Coins)
                            </Button>
                        </div>
                    </Card>

                </div>
            </div>

            {/* Transaction History - Full Width */}
            <div id="tour-topup-history" className="w-full">
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
                                                <button
                                                    onClick={() => setSelectedTx(tx)}
                                                    className="text-xs text-gray-500 hover:text-white transition"
                                                >
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
                                <div
                                    key={tx.id}
                                    onClick={() => setSelectedTx(tx)}
                                    className="p-4 rounded-xl bg-white/5 border border-white/5 active:bg-white/10 transition cursor-pointer"
                                >
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
                size="fullScreen"
                onClose={() => {
                    if (adStatus === 'playing') {
                        setAdWarningModal(true)
                    } else {
                        setIsAdModalOpen(false)
                        setAdStatus('idle')
                    }
                }}
                title="Watch Ad for Free Coins"
            >
                <div className="flex flex-col items-center justify-center w-full h-full p-4 lg:p-8">
                    {adStatus === 'playing' ? (
                        <div className="w-full h-full flex flex-col items-center">
                            <div
                                id="adsterra-container"
                                className={`flex-1 w-full bg-black/50 overflow-hidden relative flex items-center justify-center rounded-xl shadow-2xl ${adClickUrl && !hasAdTimeout ? 'cursor-pointer' : ''}`}
                                onClick={() => { if (adClickUrl && !hasAdTimeout) window.open(adClickUrl, '_blank') }}
                            >
                                {hasAdTimeout ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/95 z-30">
                                        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                                        <h4 className="text-white font-bold mb-2 text-xl">Video Gagal Dimuat</h4>
                                        <p className="text-gray-400 text-sm mb-6 text-center max-w-sm">
                                            Koneksi lambat atau iklan sedang tidak tersedia. Silakan dicoba lagi atau tutup iklan ini.
                                        </p>
                                        <div className="flex gap-4">
                                            <Button variant="outline" onClick={(e) => { e.stopPropagation(); setIsAdModalOpen(false); setAdStatus('idle') }}>Tutup</Button>
                                            <Button className="bg-neonGreen text-black hover:bg-neonGreen/80 border-none" onClick={(e) => { e.stopPropagation(); handleWatchAd() }}>Coba Lagi</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {isVideoLoading && (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
                                                <Loader2 className="w-10 h-10 animate-spin text-neonGreen mb-4" />
                                                <p className="text-white font-medium">Memuat Iklan...</p>
                                            </div>
                                        )}
                                        <div ref={adRef} className={`w-full h-full flex items-center justify-center bg-black pointer-events-none transition-opacity duration-300 ${isVideoLoading ? 'opacity-0' : 'opacity-100'}`}>
                                            {/* VAST Video Player will be inserted here by useEffect */}
                                        </div>

                                        {/* Timer Overlay */}
                                        <div className="absolute bottom-6 left-6 right-6 z-10 pointer-events-none">
                                            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden shadow-sm">
                                                <div
                                                    className="h-full bg-indigo-500 transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                                    style={{ width: `${maxDuration > 0 ? ((maxDuration - adTimer) / maxDuration) * 100 : 0}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-base md:text-lg text-white mt-3 font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                                                <span>Advertisement</span>
                                                <span>{adTimer}s remaining</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="mt-6 md:mt-8 text-center shrink-0">
                                <h4 className="text-xl md:text-2xl text-white font-bold mb-2">Watching Advertisement...</h4>
                                <p className="text-base md:text-lg text-gray-400">Please wait to earn your reward.</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6 animate-in zoom-in duration-300">
                                <CheckCircle2 className="w-10 h-10 text-green-500" />
                            </div>
                            <h4 className="text-xl font-bold text-white mb-2">Reward Unlocked!</h4>
                            <p className="text-gray-400 text-center mb-8">
                                You have successfully earned <span className="text-neonGreen font-bold">+{Math.max(1, Math.round((maxDuration / 30) * 5))} Coins</span>.
                            </p>
                            <Button
                                onClick={handleClaimReward}
                                disabled={isClaiming}
                                className="w-full bg-green-600 hover:bg-green-500 border-none text-white shadow-lg shadow-green-900/20"
                            >
                                {isClaiming ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    `Claim ${Math.max(1, Math.round((maxDuration / 30) * 5))} Coins`
                                )}
                            </Button>
                        </>
                    )}
                </div>
            </Modal>

            {/* Ad Close Warning Modal */}
            <ConfirmationModal
                isOpen={adWarningModal}
                onClose={() => setAdWarningModal(false)}
                onConfirm={() => {
                    setAdWarningModal(false)
                    setIsAdModalOpen(false)
                    setAdStatus('idle')
                }}
                title="Batalkan Iklan?"
                message="Jika Anda menutup iklan sekarang, Anda tidak akan mendapatkan hadiah koin. Lanjutkan menutup?"
                confirmText="Ya, Tutup"
                cancelText="Kembali Menonton"
                variant="danger"
            />

            {/* Premium Upgrade Modal */}
            <Modal
                isOpen={showPremiumModal}
                onClose={() => setShowPremiumModal(false)}
                title="Upgrade to Premium"
            >
                <div className="p-6">
                    <div className="text-center mb-8">
                        <h4 className="text-2xl font-bold text-white mb-2">Pilih Paket Premium</h4>
                        <p className="text-gray-400">Tingkatkan pengalaman Anda dengan fitur eksklusif</p>
                    </div>

                    <div className={`grid grid-cols-1 ${subscription?.plan?.toLowerCase() === 'captain' ? 'md:grid-cols-1 justify-items-center' : 'md:grid-cols-2'} gap-4`}>
                        {SUBSCRIPTION_PLANS.filter(plan => {
                            if (subscription?.plan?.toLowerCase() === 'captain') {
                                return plan.id === 'pro_league'
                            }
                            return true
                        }).map((plan) => {
                            const style = getSubscriptionStyle(plan.id)
                            return (
                                <div key={plan.id} className={`relative p-5 rounded-xl border ${style.cardBorder} bg-gradient-to-br ${style.gradient} flex flex-col w-full max-w-md`}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-black/20 ${style.text}`}>
                                            <style.Icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className={`font-bold ${style.text}`}>{plan.name}</div>
                                            <div className="text-xs text-gray-400">Subscription</div>
                                        </div>
                                    </div>

                                    <ul className="space-y-2 mb-6 flex-1">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                                                <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 ${style.text}`} />
                                                <span className="leading-tight">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="mt-auto">
                                        <div className="mb-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <img src="/coin.png" className="w-6 h-6 object-contain" alt="Coin" />
                                                <span className="text-xl font-bold text-white">{plan.price}</span>
                                            </div>
                                            <span className="text-xs text-gray-500">{plan.period}</span>
                                        </div>
                                        <Button
                                            onClick={() => handlePremiumConfirm(plan)}
                                            disabled={isUpgrading}
                                            className={`w-full bg-gradient-to-r ${style.buttonGradient || style.gradient} text-black font-bold border-none`}
                                        >
                                            {isUpgrading ? (
                                                <div className="flex items-center justify-center">
                                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                    Processing...
                                                </div>
                                            ) : (
                                                `Pilih ${plan.name}`
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </Modal>

            {/* Top Up Payment Modal */}
            <Modal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                title="Complete Payment"
            >
                <form onSubmit={handlePaymentConfirm} className="p-4 space-y-6">
                    {/* Transaction Summary */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-400 text-sm">Package</span>
                            <span className="text-white font-bold">{selectedPackage?.name}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-400 text-sm">Amount to Pay</span>
                            <span className="text-neonGreen font-bold font-mono text-lg">{selectedPackage?.price}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-white/10">
                            <span className="text-gray-400 text-sm">You Receive</span>
                            <div className="text-right">
                                <span className="text-white font-bold block">{selectedPackage?.coins} Coins</span>
                                {selectedPackage?.bonus > 0 && (
                                    <span className="text-xs text-neonGreen font-medium">+{selectedPackage.bonus} Bonus</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Billing Details Form */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                            <div className="w-1 h-4 bg-neonPink rounded-full"></div>
                            Billing Information
                        </h4>

                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                                <Input
                                    value={billingDetails.fullName}
                                    onChange={e => setBillingDetails({ ...billingDetails, fullName: e.target.value })}
                                    placeholder="Enter full name"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                                    <Input
                                        type="email"
                                        value={billingDetails.email}
                                        onChange={e => setBillingDetails({ ...billingDetails, email: e.target.value })}
                                        placeholder="email@example.com"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                                    <Input
                                        type="tel"
                                        value={billingDetails.phone}
                                        onChange={e => setBillingDetails({ ...billingDetails, phone: e.target.value })}
                                        placeholder="08..."
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Billing Address</label>
                                <Input
                                    value={billingDetails.address}
                                    onChange={e => setBillingDetails({ ...billingDetails, address: e.target.value })}
                                    placeholder="Street address, apartment, etc."
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">City</label>
                                    <Input
                                        value={billingDetails.city}
                                        onChange={e => setBillingDetails({ ...billingDetails, city: e.target.value })}
                                        placeholder="Jakarta"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Zip Code</label>
                                    <Input
                                        value={billingDetails.zipCode}
                                        onChange={e => setBillingDetails({ ...billingDetails, zipCode: e.target.value })}
                                        placeholder="12345"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button
                            type="submit"
                            disabled={isLoadingTx}
                            className="w-full bg-neonPink hover:bg-neonPink/90 border-none text-white shadow-lg shadow-neonPink/20 flex items-center justify-center"
                        >
                            {isLoadingTx ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                "Process Payment"
                            )}
                        </Button>
                        <p className="text-center text-[10px] text-gray-500 mt-3">
                            By continuing, you agree to our Terms of Service and Privacy Policy.
                        </p>
                    </div>
                </form>
            </Modal>

            {/* Transaction Detail Modal */}
            <Modal
                isOpen={!!selectedTx}
                onClose={() => setSelectedTx(null)}
                title="Transaction Detail"
            >
                {selectedTx && (
                    <div className="p-4 space-y-4 text-sm">
                        <div className="bg-white/5 rounded-xl p-4 border border-white/5 space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Transaction ID</span>
                                <span className="text-white font-mono text-xs">{selectedTx.id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Date</span>
                                <span className="text-white">{selectedTx.date}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Description</span>
                                <span className="text-white font-bold">{selectedTx.desc}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Amount</span>
                                <span className={`font-bold font-display ${selectedTx.amount > 0 ? 'text-neonGreen' : 'text-white'}`}>
                                    {selectedTx.amount > 0 ? '+' : ''}{selectedTx.amount} Coins
                                </span>
                            </div>
                            {selectedTx.method && selectedTx.method !== 'Wallet' && (
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Reference / Method</span>
                                    <span className="text-white font-mono text-xs">{selectedTx.method}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-3 border-t border-white/10">
                                <span className="text-gray-400">Status</span>
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium uppercase ${selectedTx.status === 'success' ? 'bg-green-500/10 text-green-400' :
                                    selectedTx.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                                        'bg-red-500/10 text-red-400'
                                    }`}>
                                    {selectedTx.status}
                                </span>
                            </div>

                            {selectedTx.status === 'pending' && selectedTx.type === 'topup' && (
                                <div className="pt-3">
                                    <Button
                                        onClick={handleCheckStatus}
                                        disabled={isCheckingStatus}
                                        className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all active:scale-95"
                                    >
                                        {isCheckingStatus ? 'Memeriksa...' : 'Refresh Status'}
                                    </Button>
                                    <p className="text-[10px] text-gray-500 text-center mt-2 leading-relaxed">
                                        Status pembayaran mungkin butuh beberapa menit untuk update.<br />
                                        Pastikan Anda sudah menyelesaikan pembayaran di merchant.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div >
    )
}
