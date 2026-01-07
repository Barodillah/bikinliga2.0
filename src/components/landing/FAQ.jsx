import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import useReveal from '../../hooks/useReveal'

const faqData = [
    {
        question: 'Apakah aplikasi ini gratis?',
        answer: 'Ya! Paket dasar BikinLiga 100% gratis selamanya untuk komunitas kecil hingga 8 peserta. Cocok untuk mabar sirkel.'
    },
    {
        question: 'Game apa saja yang didukung?',
        answer: 'Fokus utama kami adalah eFootball (PES), namun sistem kami fleksibel dan bisa digunakan untuk FIFA (EA FC), Mobile Legends, atau futsal sungguhan.'
    },
    {
        question: 'Apakah ada fitur bracket knockout?',
        answer: 'Tentu saja. Anda bisa membuat format Full Liga (klasemen), Cup (Gugur), atau Group Stage + Knockout (seperti Piala Dunia).'
    },
    {
        question: 'Bagaimana cara menghitung klasemen?',
        answer: 'Cukup input skor pertandingan, sistem akan otomatis menghitung poin (3 menang, 1 seri, 0 kalah), selisih gol, dan head-to-head untuk menentukan peringkat.'
    },
    {
        question: 'Bisa export hasil pertandingan?',
        answer: 'Ya, Anda bisa export klasemen dan jadwal dalam format gambar yang siap dibagikan ke grup WhatsApp atau Instagram Story.'
    }
]

function FaqItem({ question, answer }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="border border-white/10 rounded-lg overflow-hidden">
            <button
                className={`w-full text-left px-6 py-4 bg-[#1a1a1a] hover:bg-[#222] flex justify-between items-center transition-colors focus:outline-none ${isOpen ? 'text-neonGreen' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="font-semibold">{question}</span>
                <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
            </button>
            <div className={`${isOpen ? 'block' : 'hidden'} px-6 py-4 bg-cardBg text-gray-400 text-sm border-t border-white/5`}>
                {answer}
            </div>
        </div>
    )
}

export default function FAQ() {
    const revealRef = useReveal()

    return (
        <section id="faq" className="py-20 bg-cardBg">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-display font-bold text-center mb-10">Pertanyaan Umum</h2>

                <div className="space-y-4 reveal" ref={revealRef}>
                    {faqData.map((item) => (
                        <FaqItem key={item.question} {...item} />
                    ))}
                </div>
            </div>
        </section>
    )
}
