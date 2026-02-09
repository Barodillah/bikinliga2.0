import React, { useState, useEffect } from 'react';
import { Phone, Check, Loader2, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { authFetch } from '../../utils/api';

export default function WhatsAppModal({ isOpen, onClose, onCancel }) {
    const { user, setUser } = useAuth();
    const { success, error } = useToast();

    const [phone, setPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && user) {
            setPhone(user.phone || '');
        }
    }, [isOpen, user]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!phone || phone.length < 10) {
            error('Nomor WhatsApp tidak valid (minimal 10 digit)');
            return;
        }

        setIsSubmitting(true);
        try {
            // We need to send all profile fields because the endpoint expects a full update
            // However, we only WANT to update the phone.
            // So we send existing user values for other fields.
            const payload = {
                name: user.name,
                username: user.username,
                bio: user.bio,
                phone: phone
            };

            const res = await authFetch('/api/auth/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (data.success) {
                success('Nomor WhatsApp berhasil disimpan!');
                // Update local user context
                setUser(prev => ({ ...prev, phone: data.data.user.phone }));
                onClose();
                window.location.reload();
            } else {
                error(data.message || 'Gagal menyimpan nomor WhatsApp');
            }
        } catch (err) {
            console.error('Update phone error:', err);
            error('Terjadi kesalahan saat menyimpan data');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>

            {/* Modal */}
            <div className="relative w-full max-w-md glass-panel rounded-3xl p-8 overflow-hidden animate-scale-in">
                {/* Decorative elements */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-green-500/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>

                {/* Close Button (Optional, maybe we want to force them?) 
                    For now, allowing close so they aren't stuck if they don't want to provide it right now.
                */}
                <button
                    onClick={() => {
                        if (onCancel) onCancel();
                        onClose();
                    }}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Icon */}
                <div className="relative flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-blue-500 p-[2px]">
                        <div className="w-full h-full rounded-full bg-darkBg flex items-center justify-center">
                            <Phone className="w-10 h-10 text-green-400" />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="relative text-center mb-8">
                    <h2 className="font-display text-2xl font-bold mb-2">
                        Nomor WhatsApp
                    </h2>
                    <p className="text-gray-400">
                        Simpan nomor WhatsApp kamu agar mudah dihubungi oleh organizer kompetisi.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="relative space-y-6">
                    <div>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">+62</span>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => {
                                    // Allow only numbers and typical phone characters
                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                    setPhone(val);
                                }}
                                placeholder="81234567890"
                                className="w-full bg-white/5 border-2 border-white/10 rounded-xl pl-14 pr-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300"
                                required
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2 text-left">
                            *Pastikan nomor aktif dan terhubung dengan WhatsApp
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || !phone}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl py-4 font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <Check className="w-5 h-5" />
                                Simpan Nomor
                            </>
                        )}
                    </button>
                </form>
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
