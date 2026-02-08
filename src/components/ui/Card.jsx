import React, { forwardRef } from 'react'

const Card = forwardRef(function Card({ children, className = '', hover = true, ...props }, ref) {
    return (
        <div
            ref={ref}
            className={`glass-panel rounded-2xl ${hover ? 'hover:border-white/20 transition-all duration-300' : ''} ${className}`}
            {...props}
        >
            {children}
        </div>
    )
})

export default Card

export function CardHeader({ children, className = '' }) {
    return (
        <div className={`p-6 border-b border-white/10 ${className}`}>
            {children}
        </div>
    )
}

export function CardTitle({ children, className = '' }) {
    return (
        <h3 className={`text-xl font-display font-bold ${className}`}>
            {children}
        </h3>
    )
}

export function CardDescription({ children, className = '' }) {
    return (
        <p className={`text-sm text-gray-400 mt-1 ${className}`}>
            {children}
        </p>
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
