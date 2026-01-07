import React from 'react'

const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'bg-transparent border border-white/20 text-white font-bold hover:bg-white/10 transition',
    danger: 'bg-red-500 text-white font-bold hover:bg-red-600 transition',
}

const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
}

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    rounded = 'rounded-lg',
    icon: Icon,
    ...props
}) {
    return (
        <button
            className={`${variants[variant]} ${sizes[size]} ${rounded} flex items-center justify-center gap-2 ${className}`}
            {...props}
        >
            {Icon && <Icon className="w-5 h-5" />}
            {children}
        </button>
    )
}
