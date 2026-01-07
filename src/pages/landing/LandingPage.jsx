import React from 'react'
import Navbar from '../../components/landing/Navbar'
import Hero from '../../components/landing/Hero'
import Stats from '../../components/landing/Stats'
import Features from '../../components/landing/Features'
import HowItWorks from '../../components/landing/HowItWorks'
import Pricing from '../../components/landing/Pricing'
import FAQ from '../../components/landing/FAQ'
import Footer from '../../components/landing/Footer'

export default function LandingPage() {
    return (
        <div className="min-h-screen">
            {/* Decorative Background Glows */}
            <div className="ambient-glow bg-neonGreen top-0 left-0"></div>
            <div className="ambient-glow bg-neonPink bottom-0 right-0"></div>

            <Navbar />
            <Hero />
            <Stats />
            <Features />
            <HowItWorks />
            <Pricing />
            <FAQ />
            <Footer />
        </div>
    )
}
