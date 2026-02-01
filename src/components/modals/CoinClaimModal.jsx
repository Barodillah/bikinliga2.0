import React, { useState } from 'react';
import { Coins, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export default function CoinClaimModal() {
    const { showCoinClaimModal, claimLoginCoin, user } = useAuth();
    const { success, error } = useToast();

    const [isClaiming, setIsClaiming] = useState(false);
    const [claimed, setClaimed] = useState(false);

    const handleClaim = async () => {
        setIsClaiming(true);
        try {
            const result = await claimLoginCoin();
            setClaimed(true);
            success(`Selamat! Kamu mendapat ${result.data.amount} Coin!`);
        } catch (err) {
            error(err.message || 'Gagal mengklaim bonus');
        } finally {
            setIsClaiming(false);
        }
    };

    if (!showCoinClaimModal) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>

            {/* Floating Coins Animation */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute animate-float-coin"
                        style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${3 + Math.random() * 2}s`
                        }}
                    >
                        <Coins className="w-6 h-6 text-yellow-400 opacity-60" />
                    </div>
                ))}
            </div>

            {/* Modal */}
            <div className="relative w-full max-w-md overflow-hidden animate-scale-in">
                {/* Glowing border */}
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-neonGreen to-yellow-400 rounded-3xl blur opacity-50 animate-pulse"></div>

                <div className="relative glass-panel rounded-3xl p-8 m-[2px]">
                    {/* Sparkles */}
                    <div className="absolute top-4 left-4 animate-pulse">
                        <Sparkles className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div className="absolute top-4 right-4 animate-pulse" style={{ animationDelay: '0.5s' }}>
                        <Sparkles className="w-6 h-6 text-yellow-400" />
                    </div>

                    {/* Coin Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/30 animate-bounce-slow">
                                <Coins className="w-12 h-12 text-yellow-900" />
                            </div>
                            {/* Glow ring */}
                            <div className="absolute inset-0 rounded-full bg-yellow-400/30 animate-ping"></div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="text-center mb-8">
                        <h2 className="font-display text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-neonGreen bg-clip-text text-transparent">
                            Selamat Datang!
                        </h2>
                        <p className="text-gray-300 mb-4">
                            Hai <span className="text-neonGreen font-semibold">@{user?.username}</span>! 🎉
                        </p>
                        <p className="text-gray-400">
                            Sebagai hadiah pendaftaran, kamu berhak mendapatkan:
                        </p>
                    </div>

                    {/* Coin Amount */}
                    <div className="bg-gradient-to-r from-yellow-400/10 to-neonGreen/10 border border-yellow-400/30 rounded-2xl p-6 mb-8">
                        <div className="flex items-center justify-center gap-3">
                            <Coins className="w-10 h-10 text-yellow-400" />
                            <span className="font-display text-5xl font-bold text-yellow-400">100</span>
                            <span className="text-2xl text-gray-300">Coin</span>
                        </div>
                    </div>

                    {/* Claim Button */}
                    {!claimed ? (
                        <button
                            onClick={handleClaim}
                            disabled={isClaiming}
                            className="w-full relative overflow-hidden rounded-xl py-4 font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
                        >
                            {/* Animated gradient background */}
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 bg-[length:200%_100%] animate-shimmer"></div>

                            <span className="relative text-yellow-900">
                                {isClaiming ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5 inline mr-2" />
                                        Klaim Sekarang!
                                    </>
                                )}
                            </span>
                        </button>
                    ) : (
                        <div className="text-center py-4 text-neonGreen font-bold text-lg">
                            ✨ Coin berhasil diklaim! ✨
                        </div>
                    )}

                    {/* Info */}
                    <p className="text-center mt-6 text-gray-500 text-xs">
                        Coin dapat digunakan untuk membuat turnamen dan fitur premium lainnya
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes scale-in {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .animate-scale-in {
                    animation: scale-in 0.3s ease-out forwards;
                }
                
                @keyframes float-coin {
                    0% {
                        transform: translateY(100vh) rotate(0deg);
                        opacity: 0;
                    }
                    10% {
                        opacity: 0.6;
                    }
                    90% {
                        opacity: 0.6;
                    }
                    100% {
                        transform: translateY(-100px) rotate(360deg);
                        opacity: 0;
                    }
                }
                .animate-float-coin {
                    animation: float-coin linear infinite;
                }
                
                @keyframes bounce-slow {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 2s ease-in-out infinite;
                }
                
                @keyframes shimmer {
                    0% {
                        background-position: 200% 0;
                    }
                    100% {
                        background-position: -200% 0;
                    }
                }
                .animate-shimmer {
                    animation: shimmer 3s linear infinite;
                }
            `}</style>
        </div>
    );
}
