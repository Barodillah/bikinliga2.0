import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export default function OtpPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { verifyOtp, resendOtp } = useAuth();
    const { success, error } = useToast();

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const inputRefs = useRef([]);

    const userId = location.state?.userId;
    const email = location.state?.email;

    useEffect(() => {
        if (!userId) {
            navigate('/register');
        }
    }, [userId, navigate]);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    useEffect(() => {
        // Focus first input on mount
        inputRefs.current[0]?.focus();
    }, []);

    const handleChange = (index, value) => {
        // Only allow numbers
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Move to next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto submit when complete
        if (value && index === 5) {
            const code = newOtp.join('');
            if (code.length === 6) {
                handleSubmit(code);
            }
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (/^\d+$/.test(pastedData)) {
            const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
            setOtp(newOtp.slice(0, 6));

            if (pastedData.length === 6) {
                handleSubmit(pastedData);
            } else {
                inputRefs.current[pastedData.length]?.focus();
            }
        }
    };

    const handleSubmit = async (code) => {
        if (!code || code.length !== 6) {
            error('Masukkan kode OTP 6 digit');
            return;
        }

        setIsLoading(true);
        try {
            await verifyOtp(userId, code);
            success('Email berhasil diverifikasi!');
            navigate('/dashboard');
        } catch (err) {
            error(err.message || 'Kode OTP tidak valid');
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (countdown > 0) return;

        setIsResending(true);
        try {
            await resendOtp(userId);
            success('Kode OTP baru telah dikirim');
            setCountdown(60);
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } catch (err) {
            error(err.message || 'Gagal mengirim ulang OTP');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center py-12">
            {/* Animated Background Glows */}
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-neonGreen rounded-full filter blur-[150px] opacity-20 animate-pulse-glow"></div>
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-neonPink rounded-full filter blur-[150px] opacity-20 animate-pulse-glow" style={{ animationDelay: '1.5s' }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-neonGreen/10 to-neonPink/10 rounded-full filter blur-[200px] opacity-30"></div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

            {/* Main Content */}
            <div className="relative z-10 w-full max-w-md mx-4">
                {/* Back Link */}
                <Link to="/register" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali</span>
                </Link>

                {/* Logo */}
                <Link to="/" className="flex items-center justify-center gap-2 mb-8 group">
                    <img src="/logo.png" alt="BikinLiga" className="h-8 group-hover:scale-110 transition-transform duration-300" />
                    <span className="font-display font-bold text-3xl tracking-tight">
                        Bikin<span className="text-neonPink">Liga</span>
                    </span>
                </Link>

                {/* OTP Card */}
                <div className="glass-panel rounded-3xl p-8 relative overflow-hidden">
                    {/* Decorative Corner Gradients */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-neonPink/20 to-transparent rounded-bl-full"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-neonGreen/20 to-transparent rounded-tr-full"></div>

                    {/* Header */}
                    <div className="text-center mb-8 relative">
                        {/* Email Icon */}
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-neonGreen/20 to-neonPink/20 flex items-center justify-center">
                            <svg className="w-10 h-10 text-neonGreen" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h1 className="font-display text-2xl font-bold mb-2">
                            Verifikasi Email
                        </h1>
                        <p className="text-gray-400">
                            Masukkan kode 6 digit yang dikirim ke
                        </p>
                        <p className="text-neonGreen font-medium mt-1">{email}</p>
                    </div>

                    {/* OTP Inputs */}
                    <div className="flex justify-center gap-3 mb-8">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={el => inputRefs.current[index] = el}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={handlePaste}
                                disabled={isLoading}
                                className="w-12 h-14 text-center text-2xl font-bold bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-neonGreen focus:ring-2 focus:ring-neonGreen/20 transition-all duration-300 disabled:opacity-50"
                            />
                        ))}
                    </div>

                    {/* Verify Button */}
                    <button
                        onClick={() => handleSubmit(otp.join(''))}
                        disabled={isLoading || otp.join('').length !== 6}
                        className="w-full btn-primary rounded-xl py-4 font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            'Verifikasi'
                        )}
                    </button>

                    {/* Resend OTP */}
                    <div className="text-center mt-6">
                        <p className="text-gray-400 text-sm mb-2">
                            Tidak menerima kode?
                        </p>
                        <button
                            onClick={handleResend}
                            disabled={countdown > 0 || isResending}
                            className={`inline-flex items-center gap-2 font-semibold transition-colors ${countdown > 0
                                    ? 'text-gray-500 cursor-not-allowed'
                                    : 'text-neonPink hover:text-neonPink/80'
                                }`}
                        >
                            {isResending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <RefreshCw className="w-4 h-4" />
                            )}
                            {countdown > 0 ? `Kirim ulang (${countdown}s)` : 'Kirim ulang kode'}
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center mt-6 text-gray-500 text-sm">
                    &copy; 2024 BikinLiga. All rights reserved.
                </p>
            </div>
        </div>
    );
}
