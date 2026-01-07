/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                neonGreen: '#02FE02',
                neonPink: '#FE00C9',
                darkBg: '#050505',
                cardBg: '#121212',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Space Grotesk', 'sans-serif'],
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'pulse-glow': 'pulse-glow 3s infinite',
                'bounce-slow': 'bounce 2s infinite',
                'spin-slow': 'spin 4s linear infinite',
                'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
                'wiggle': 'wiggle 1s ease-in-out infinite',
                'grow-bar': 'grow-bar 2s ease-in-out infinite alternate',
                'clash': 'clash 2s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                'pulse-glow': {
                    '0%, 100%': { opacity: '0.6' },
                    '50%': { opacity: '1' },
                },
                wiggle: {
                    '0%, 100%': { transform: 'rotate(-3deg)' },
                    '50%': { transform: 'rotate(3deg)' },
                },
                'grow-bar': {
                    '0%': { transform: 'scaleY(0.7)' },
                    '100%': { transform: 'scaleY(1)' },
                },
                clash: {
                    '0%, 100%': { transform: 'rotate(0deg) scale(1)' },
                    '50%': { transform: 'rotate(15deg) scale(1.1)' },
                }
            }
        }
    },
    plugins: [],
}
