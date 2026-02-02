import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, Loader2, Check, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'

export default function RegisterPage() {
    const navigate = useNavigate()
    const { register, googleAuth, isAuthenticated } = useAuth()
    const { success, error } = useToast()

    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isGoogleLoading, setIsGoogleLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    })

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard')
        }
    }, [isAuthenticated, navigate])

    // Initialize Google Sign-In
    useEffect(() => {
        const initGoogle = () => {
            if (window.google) {
                window.google.accounts.id.initialize({
                    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                    callback: handleGoogleCallback,
                    cancel_on_tap_outside: false,
                    use_fedcm_for_prompt: false
                })
            }
        }

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

        if (formData.password !== formData.confirmPassword) {
            error('Password tidak cocok!')
            return
        }

        setIsLoading(true)
        try {
            const result = await register(formData.name, formData.email, formData.password)
            success('Registrasi berhasil! Cek email untuk kode OTP')
            navigate('/verify-otp', {
                state: {
                    userId: result.data.userId,
                    email: result.data.email
                }
            })
        } catch (err) {
            error(err.message || 'Registrasi gagal')
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleCallback = async (response) => {
        setIsGoogleLoading(true)
        try {
            await googleAuth(response.credential)
            success('Registrasi Google berhasil!')
            navigate('/dashboard')
        } catch (err) {
            error(err.message || 'Registrasi Google gagal')
        } finally {
            setIsGoogleLoading(false)
        }
    }

    const handleGoogleRegister = () => {
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

    // Password strength checker
    const getPasswordStrength = () => {
        const password = formData.password
        if (!password) return { level: 0, text: '', color: '' }

        let strength = 0
        if (password.length >= 8) strength++
        if (/[A-Z]/.test(password)) strength++
        if (/[0-9]/.test(password)) strength++
        if (/[^A-Za-z0-9]/.test(password)) strength++

        const levels = [
            { level: 1, text: 'Lemah', color: 'bg-red-500' },
            { level: 2, text: 'Cukup', color: 'bg-yellow-500' },
            { level: 3, text: 'Bagus', color: 'bg-neonGreen/70' },
            { level: 4, text: 'Kuat', color: 'bg-neonGreen' }
        ]

        return levels[strength - 1] || { level: 0, text: '', color: '' }
    }

    const passwordStrength = getPasswordStrength()

    const passwordRequirements = [
        { met: formData.password.length >= 8, text: 'Minimal 8 karakter' },
        { met: /[A-Z]/.test(formData.password), text: 'Huruf kapital' },
        { met: /[0-9]/.test(formData.password), text: 'Angka' },
        { met: /[^A-Za-z0-9]/.test(formData.password), text: 'Karakter khusus' },
    ]

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center py-12">
            {/* Animated Background Glows */}
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-neonPink rounded-full filter blur-[150px] opacity-20 animate-pulse-glow"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-neonGreen rounded-full filter blur-[150px] opacity-20 animate-pulse-glow" style={{ animationDelay: '1.5s' }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-neonPink/10 to-neonGreen/10 rounded-full filter blur-[200px] opacity-30"></div>

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

                {/* Register Card */}
                <div className="glass-panel rounded-3xl p-8 relative overflow-hidden">
                    {/* Decorative Corner Gradients */}
                    <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-neonGreen/20 to-transparent rounded-br-full"></div>
                    <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-neonPink/20 to-transparent rounded-tl-full"></div>

                    {/* Header */}
                    <div className="text-center mb-8 relative">
                        <h1 className="font-display text-3xl font-bold mb-2">
                            Buat Akun Baru
                        </h1>
                        <p className="text-gray-400">
                            Mulai kelola liga Anda sekarang
                        </p>
                    </div>

                    {/* Google Register Button */}
                    <button
                        onClick={handleGoogleRegister}
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
                                <span className="group-hover:text-white transition-colors">Daftar dengan Google</span>
                            </>
                        )}
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                        <span className="text-gray-500 text-sm">atau</span>
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    </div>

                    {/* Register Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name Input */}
                        <div className="relative group">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Nama Lengkap
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="John Doe"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-neonGreen focus:ring-2 focus:ring-neonGreen/20 transition-all duration-300"
                            />
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-neonGreen/20 to-neonPink/20 opacity-0 group-focus-within:opacity-100 -z-10 blur-xl transition-opacity duration-300"></div>
                        </div>

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

                            {/* Password Strength Indicator */}
                            {formData.password && (
                                <div className="mt-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${passwordStrength.color} transition-all duration-300`}
                                                style={{ width: `${(passwordStrength.level / 4) * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className={`text-xs font-medium ${passwordStrength.color.replace('bg-', 'text-')}`}>
                                            {passwordStrength.text}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-1.5">
                                        {passwordRequirements.map((req, idx) => (
                                            <div key={idx} className="flex items-center gap-1.5">
                                                {req.met ? (
                                                    <Check className="w-3 h-3 text-neonGreen" />
                                                ) : (
                                                    <X className="w-3 h-3 text-gray-500" />
                                                )}
                                                <span className={`text-xs ${req.met ? 'text-gray-300' : 'text-gray-500'}`}>
                                                    {req.text}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-neonGreen/20 to-neonPink/20 opacity-0 group-focus-within:opacity-100 -z-10 blur-xl transition-opacity duration-300"></div>
                        </div>

                        {/* Confirm Password Input */}
                        <div className="relative group">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Konfirmasi Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                    className={`w-full bg-white/5 border rounded-xl px-4 py-3.5 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 ${formData.confirmPassword && formData.password !== formData.confirmPassword
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                        : formData.confirmPassword && formData.password === formData.confirmPassword
                                            ? 'border-neonGreen focus:border-neonGreen focus:ring-neonGreen/20'
                                            : 'border-white/10 focus:border-neonGreen focus:ring-neonGreen/20'
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                                    <X className="w-3 h-3" /> Password tidak cocok
                                </p>
                            )}
                            {formData.confirmPassword && formData.password === formData.confirmPassword && (
                                <p className="mt-1.5 text-xs text-neonGreen flex items-center gap-1">
                                    <Check className="w-3 h-3" /> Password cocok
                                </p>
                            )}
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-neonGreen/20 to-neonPink/20 opacity-0 group-focus-within:opacity-100 -z-10 blur-xl transition-opacity duration-300"></div>
                        </div>

                        {/* Terms & Conditions */}
                        <p className="text-xs text-gray-400 text-center">
                            Dengan mendaftar, Anda menyetujui{' '}
                            <a href="#" className="text-neonPink hover:underline">Syarat & Ketentuan</a>
                            {' '}dan{' '}
                            <a href="#" className="text-neonPink hover:underline">Kebijakan Privasi</a>
                            {' '}kami.
                        </p>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading || formData.password !== formData.confirmPassword}
                            className="w-full btn-primary rounded-xl py-4 font-bold text-lg flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Daftar Sekarang</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Login Link */}
                    <p className="text-center mt-8 text-gray-400">
                        Sudah punya akun?{' '}
                        <Link to="/login" className="text-neonGreen hover:text-neonGreen/80 font-semibold transition-colors">
                            Masuk disini
                        </Link>
                    </p>
                </div>

                {/* Footer */}
                <p className="text-center mt-6 text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} BikinLiga. All rights reserved.
                </p>
            </div>
        </div>
    )
}
