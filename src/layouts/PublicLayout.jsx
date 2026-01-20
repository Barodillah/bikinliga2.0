import React from 'react'
import { Outlet, Link } from 'react-router-dom'
import Navbar from '../components/landing/Navbar'

export default function PublicLayout() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-neonGreen selection:text-black flex flex-col">
            {/* Shared Navbar */}
            <Navbar />

            {/* Main Content */}
            {/* Main Content (with top padding for fixed navbar) */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 animate-in fade-in duration-500">
                <Outlet />
            </main>

            {/* Simple Footer */}
            <footer className="border-t border-white/10 bg-black py-8">
                <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} BikinLiga. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}
