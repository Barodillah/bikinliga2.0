import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'

export default function LoginPage() {
    const navigate = useNavigate()
    const { login, googleAuth, isAuthenticated } = useAuth()
    const { success, error } = useToast()

    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isGoogleLoading, setIsGoogleLoading] = useState(false)
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard')
        }
    }, [isAuthenticated, navigate])

    // Initialize Google Sign-In
    useEffect(() => {
        const initGoogle = () => {
            console.log('Initializing Google Auth with Client ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);
            if (window.google) {
                window.google.accounts.id.initialize({
                    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                    callback: handleGoogleCallback,
                    cancel_on_tap_outside: false,
                    use_fedcm_for_prompt: false
                })
            }
        }

        // Load Google script if not loaded
        if (!window.google) {
            const script = document.createElement('script')
            script.src = 'https://accounts.google.com/gsi/client'
            script.async = true
            script.defer = true
            script.onload = initGoogle
            document.body.appendChild(script)
        } else {
            initGoogle()
        }
    }, [])

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const result = await login(formData.email, formData.password)

            if (result.data?.needsVerification) {
                navigate('/verify-otp', { state: { userId: result.data.userId, email: formData.email } })
                return
            }

            success('Login berhasil!')
            navigate('/dashboard')
        } catch (err) {
            if (err.message?.includes('belum diverifikasi')) {
                error(err.message)
                // Could redirect to OTP page if userId is available
            } else {
                error(err.message || 'Login gagal')
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleCallback = async (response) => {
        setIsGoogleLoading(true)
        try {
            await googleAuth(response.credential)
            success('Login Google berhasil!')
            navigate('/dashboard')
        } catch (err) {
            error(err.message || 'Login Google gagal')
        } finally {
            setIsGoogleLoading(false)
        }
    }

    const handleGoogleLogin = () => {
        if (window.google) {
            window.google.accounts.id.prompt((notification) => {
                if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                    console.log('Google Auth Prompt Notification Debug:', {
                        isNotDisplayed: notification.isNotDisplayed(),
                        isSkippedMoment: notification.isSkippedMoment(),
                        getNotDisplayedReason: notification.getNotDisplayedReason(),
                        getSkippedReason: notification.getSkippedReason(),
                        getMomentType: notification.getMomentType()
                    });
                }
            })
        } else {
            error('Google Sign-In tidak tersedia')
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
                {/* Logo */}
                <Link to="/" className="flex items-center justify-center gap-2 mb-8 group">
                    <img src="/logo.png" alt="BikinLiga" className="h-8 group-hover:scale-110 transition-transform duration-300" />
                    <span className="font-display font-bold text-3xl tracking-tight">
                        Bikin<span className="text-neonPink">Liga</span>
                    </span>
                </Link>

                {/* Login Card */}
                <div className="glass-panel rounded-3xl p-8 relative overflow-hidden">
                    {/* Decorative Corner Gradients */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-neonPink/20 to-transparent rounded-bl-full"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-neonGreen/20 to-transparent rounded-tr-full"></div>

                    {/* Header */}
                    <div className="text-center mb-8 relative">
                        <h1 className="font-display text-3xl font-bold mb-2">
                            Selamat Datang!
                        </h1>
                        <p className="text-gray-400">
                            Masuk untuk mengelola liga Anda
                        </p>
                    </div>

                    {/* Google Login Button */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={isGoogleLoading}
                        className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3.5 font-medium transition-all duration-300 group mb-6 disabled:opacity-70"
                    >
                        {isGoogleLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span className="group-hover:text-white transition-colors">Masuk dengan Google</span>
                            </>
                        )}
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                        <span className="text-gray-500 text-sm">atau</span>
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email Input */}
                        <div className="relative group">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="nama@email.com"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-neonGreen focus:ring-2 focus:ring-neonGreen/20 transition-all duration-300"
                            />
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-neonGreen/20 to-neonPink/20 opacity-0 group-focus-within:opacity-100 -z-10 blur-xl transition-opacity duration-300"></div>
                        </div>

                        {/* Password Input */}
                        <div className="relative group">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-neonGreen focus:ring-2 focus:ring-neonGreen/20 transition-all duration-300"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-neonGreen/20 to-neonPink/20 opacity-0 group-focus-within:opacity-100 -z-10 blur-xl transition-opacity duration-300"></div>
                        </div>

                        {/* Forgot Password Link */}
                        <div className="text-right">
                            <Link to="/forgot-password" className="text-sm text-neonPink hover:text-neonPink/80 transition-colors">
                                Lupa password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn-primary rounded-xl py-4 font-bold text-lg flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Masuk</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Register Link */}
                    <p className="text-center mt-8 text-gray-400">
                        Belum punya akun?{' '}
                        <Link to="/register" className="text-neonGreen hover:text-neonGreen/80 font-semibold transition-colors">
                            Daftar sekarang
                        </Link>
                    </p>
                </div>

                {/* Footer */}
                <p className="text-center mt-6 text-gray-500 text-sm">
                    &copy; 2024 BikinLiga. All rights reserved.
                </p>
            </div>
        </div>
    )
}
