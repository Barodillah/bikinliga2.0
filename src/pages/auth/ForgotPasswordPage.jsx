import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, Mail } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'

export default function ForgotPasswordPage() {
    const navigate = useNavigate()
    const { forgotPassword } = useAuth()
    const { success, error } = useToast()

    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const result = await forgotPassword(email)
            success(result.message || 'Kode OTP telah dikirim ke email Anda')
            // Navigate to OTP page with isReset flag
            navigate('/verify-otp', {
                state: {
                    userId: result.data?.userId,
                    email: email,
                    isReset: true
                }
            })
        } catch (err) {
            error(err.message || 'Gagal memproses permintaan')
        } finally {
            setIsLoading(false)
        }
    }

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
                <Link to="/login" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali ke Login</span>
                </Link>

                {/* Logo */}
                <Link to="/" className="flex items-center justify-center gap-2 mb-8 group">
                    <img src="/logo.png" alt="BikinLiga" className="h-8 group-hover:scale-110 transition-transform duration-300" />
                    <span className="font-display font-bold text-3xl tracking-tight">
                        Bikin<span className="text-neonPink">Liga</span>
                    </span>
                </Link>

                {/* Card */}
                <div className="glass-panel rounded-3xl p-8 relative overflow-hidden">
                    {/* Decorative Corner Gradients */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-neonPink/20 to-transparent rounded-bl-full"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-neonGreen/20 to-transparent rounded-tr-full"></div>

                    {/* Header */}
                    <div className="text-center mb-8 relative">
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                            <Mail className="w-8 h-8 text-neonGreen" />
                        </div>
                        <h1 className="font-display text-2xl font-bold mb-2">
                            Lupa Password?
                        </h1>
                        <p className="text-gray-400 text-sm">
                            Masukkan email yang terdaftar untuk menerima kode OTP reset password
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative group">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="nama@email.com"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-neonGreen focus:ring-2 focus:ring-neonGreen/20 transition-all duration-300"
                            />
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-neonGreen/20 to-neonPink/20 opacity-0 group-focus-within:opacity-100 -z-10 blur-xl transition-opacity duration-300"></div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn-primary rounded-xl py-4 font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                'Kirim Kode OTP'
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center mt-6 text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} BikinLiga. All rights reserved.
                </p>
            </div>
        </div>
    )
}
