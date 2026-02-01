import React, { useState, useEffect } from 'react';
import { User, Check, X, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export default function UsernameModal() {
    const { showUsernameModal, setUsername, checkUsername } = useAuth();
    const { success, error } = useToast();

    const [username, setUsernameValue] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [availability, setAvailability] = useState(null); // null, 'available', 'taken', 'invalid'
    const [debounceTimer, setDebounceTimer] = useState(null);

    useEffect(() => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        if (!username || username.length < 5) {
            setAvailability(null);
            return;
        }

        const timer = setTimeout(async () => {
            setIsChecking(true);
            try {
                const result = await checkUsername(username);
                if (!result.success && !result.available) {
                    setAvailability('invalid');
                } else {
                    setAvailability(result.available ? 'available' : 'taken');
                }
            } catch (err) {
                console.error('Check username error:', err);
            } finally {
                setIsChecking(false);
            }
        }, 500);

        setDebounceTimer(timer);

        return () => clearTimeout(timer);
    }, [username]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (availability !== 'available') {
            error('Pilih username yang valid');
            return;
        }

        setIsSubmitting(true);
        try {
            await setUsername(username);
            success('Username berhasil diatur!');
        } catch (err) {
            error(err.message || 'Gagal mengatur username');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!showUsernameModal) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>

            {/* Modal */}
            <div className="relative w-full max-w-md glass-panel rounded-3xl p-8 overflow-hidden animate-scale-in">
                {/* Decorative elements */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-neonGreen/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-neonPink/20 rounded-full blur-3xl"></div>

                {/* Icon */}
                <div className="relative flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-neonGreen to-neonPink p-[2px]">
                        <div className="w-full h-full rounded-full bg-darkBg flex items-center justify-center">
                            <User className="w-10 h-10 text-neonGreen" />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="relative text-center mb-8">
                    <h2 className="font-display text-2xl font-bold mb-2">
                        Pilih Username Kamu
                    </h2>
                    <p className="text-gray-400">
                        Username ini akan menjadi identitas unikmu di BikinLiga
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="relative space-y-6">
                    <div>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsernameValue(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                                placeholder="username"
                                className={`w-full bg-white/5 border-2 rounded-xl pl-9 pr-12 py-4 text-white placeholder-gray-500 focus:outline-none transition-all duration-300 ${availability === 'available' ? 'border-neonGreen focus:ring-2 focus:ring-neonGreen/20' :
                                    availability === 'taken' || availability === 'invalid' ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' :
                                        'border-white/10 focus:border-neonGreen focus:ring-2 focus:ring-neonGreen/20'
                                    }`}
                                maxLength={20}
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                {isChecking ? (
                                    <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                                ) : availability === 'available' ? (
                                    <Check className="w-5 h-5 text-neonGreen" />
                                ) : availability === 'taken' || availability === 'invalid' ? (
                                    <X className="w-5 h-5 text-red-500" />
                                ) : null}
                            </div>
                        </div>

                        {/* Feedback */}
                        <div className="mt-2 min-h-[20px]">
                            {username.length > 0 && username.length < 5 && (
                                <p className="text-sm text-red-500">Minimal 5 karakter</p>
                            )}
                            {availability === 'available' && (
                                <p className="text-sm text-neonGreen flex items-center gap-1">
                                    <Check className="w-3 h-3" /> Username tersedia
                                </p>
                            )}
                            {availability === 'taken' && (
                                <p className="text-sm text-red-500 flex items-center gap-1">
                                    <X className="w-3 h-3" /> Username sudah digunakan
                                </p>
                            )}
                            {availability === 'invalid' && (
                                <p className="text-sm text-red-500 flex items-center gap-1">
                                    <X className="w-3 h-3" /> Hanya huruf, angka, titik, dan underscore
                                </p>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || availability !== 'available'}
                        className="w-full btn-primary rounded-xl py-4 font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            'Konfirmasi Username'
                        )}
                    </button>
                </form>

                {/* Tips */}
                <p className="relative text-center mt-6 text-gray-500 text-xs">
                    Tips: Pilih username yang mudah diingat!
                </p>
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
            `}</style>
        </div>
    );
}
