import React from 'react'

export default function Card({ children, className = '', hover = true, ...props }) {
    return (
        <div
            className={`glass-panel rounded-2xl ${hover ? 'hover:border-white/20 transition-all duration-300' : ''} ${className}`}
            {...props}
        >
            {children}
        </div>
    )
}

export function CardHeader({ children, className = '' }) {
    return (
        <div className={`p-6 border-b border-white/10 ${className}`}>
            {children}
        </div>
    )
}

export function CardContent({ children, className = '' }) {
    return (
        <div className={`p-6 ${className}`}>
            {children}
        </div>
    )
}

export function CardFooter({ children, className = '' }) {
    return (
        <div className={`p-6 border-t border-white/10 ${className}`}>
            {children}
        </div>
    )
}
