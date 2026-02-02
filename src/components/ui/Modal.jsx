import React, { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ isOpen, onClose, title, children, size = 'md', variant = 'dark' }) {
    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    }

    const variants = {
        dark: {
            panel: 'glass-panel text-white',
            header: 'border-white/10',
            close: 'text-gray-400 hover:text-white hover:bg-white/10',
            title: ''
        },
        light: {
            panel: 'bg-white text-gray-900 border border-gray-200',
            header: 'border-gray-200',
            close: 'text-gray-400 hover:text-gray-600 hover:bg-gray-100',
            title: 'text-gray-900'
        }
    }

    const theme = variants[variant] || variants.dark

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose()
        }

        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
            document.body.style.overflow = 'hidden'
        }

        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = 'unset'
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="min-h-full flex items-center justify-center p-4">
                <div className={`relative ${sizes[size]} w-full rounded-2xl shadow-2xl transform transition-all ${theme.panel}`}>
                    {/* Header */}
                    <div className={`flex items-center justify-between p-6 border-b ${theme.header}`}>
                        <h3 className={`text-xl font-display font-bold ${theme.title}`}>{title}</h3>
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-lg transition ${theme.close}`}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}
