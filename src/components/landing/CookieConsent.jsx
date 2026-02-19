import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, X } from 'lucide-react'

export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Check if user has already accepted cookies
        const hasConsented = localStorage.getItem('cookieConsent')
        if (!hasConsented) {
            // Show banner after a short delay for better UX
            const timer = setTimeout(() => {
                setIsVisible(true)
            }, 1000)
            return () => clearTimeout(timer)
        }
    }, [])

    const handleAccept = () => {
        localStorage.setItem('cookieConsent', 'true')
        setIsVisible(false)
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
                >
                    <div className="max-w-7xl mx-auto">
                        <div className="bg-neutral-900/95 backdrop-blur-md border border-white/10 rounded-xl p-4 md:p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
                            <div className="flex-1 flex gap-4">
                                <div className="hidden md:flex items-start pt-1">
                                    <div className="w-10 h-10 rounded-full bg-neonGreen/10 flex items-center justify-center">
                                        <Cookie className="w-5 h-5 text-neonGreen" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-white font-bold mb-1">Kami menggunakan cookies</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">
                                        Website ini menggunakan cookies untuk memastikan Anda mendapatkan pengalaman terbaik.
                                        Dengan melanjutkan, Anda menyetujui <Link to="/privacy" className="text-neonGreen hover:underline">Kebijakan Privasi</Link> kami.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <button
                                    onClick={handleAccept}
                                    className="flex-1 md:flex-none px-6 py-2.5 bg-neonGreen text-black font-bold rounded-lg hover:bg-neonGreen/90 transition shadow-[0_0_15px_rgba(34,197,94,0.3)] whitespace-nowrap"
                                >
                                    Terima Semua
                                </button>
                                <button
                                    onClick={() => setIsVisible(false)}
                                    className="p-2.5 text-gray-400 hover:text-white transition rounded-lg hover:bg-white/5 md:hidden"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
