import React, { useEffect, useState } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

const icons = {
    success: <CheckCircle className="w-5 h-5 text-neonGreen" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-400" />
}

const styles = {
    dark: {
        success: 'border-neonGreen/20 bg-neonGreen/5 text-white',
        error: 'border-red-500/20 bg-red-500/5 text-white',
        info: 'border-blue-400/20 bg-blue-400/5 text-white',
        warning: 'border-yellow-400/20 bg-yellow-400/5 text-white',
        close: 'text-gray-400 hover:text-white'
    },
    light: {
        success: 'border-green-200 bg-white text-gray-900 shadow-lg',
        error: 'border-red-200 bg-white text-gray-900 shadow-lg',
        info: 'border-blue-200 bg-white text-gray-900 shadow-lg',
        warning: 'border-yellow-200 bg-white text-gray-900 shadow-lg',
        close: 'text-gray-400 hover:text-gray-600'
    }
}

export default function Toast({ toast, onDismiss, theme = 'dark' }) {
    const [isVisible, setIsVisible] = useState(false)
    const activeTheme = styles[theme] || styles.dark

    useEffect(() => {
        // Trigger enter animation
        requestAnimationFrame(() => setIsVisible(true))

        const timer = setTimeout(() => {
            setIsVisible(false)
            // Wait for exit animation to finish before removing
            setTimeout(() => onDismiss(toast.id), 300)
        }, toast.duration || 3000)

        return () => clearTimeout(timer)
    }, [toast, onDismiss])

    return (
        <div
            className={`
                flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md transition-all duration-300 transform
                ${activeTheme[toast.type] || activeTheme.info}
                ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[100%] opacity-0'}
            `}
            role="alert"
        >
            <div className="flex-shrink-0 mt-0.5">
                {icons[toast.type] || icons.info}
            </div>
            <div className="flex-1 min-w-[200px]">
                <p className="text-sm font-medium leading-5">{toast.message}</p>
            </div>
            <button
                onClick={() => {
                    setIsVisible(false)
                    setTimeout(() => onDismiss(toast.id), 300)
                }}
                className={`flex-shrink-0 transition ${activeTheme.close}`}
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    )
}

export function ToastContainer({ toasts, onDismiss, theme = 'dark' }) {
    return (
        <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 z-[100] flex flex-col gap-2 w-auto sm:w-full sm:max-w-sm pointer-events-none">
            <div className="flex flex-col gap-2 pointer-events-auto">
                {toasts.map((toast) => (
                    <Toast key={toast.id} toast={toast} onDismiss={onDismiss} theme={theme} />
                ))}
            </div>
        </div>
    )
}
