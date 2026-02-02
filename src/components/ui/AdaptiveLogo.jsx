import React, { useState, useEffect, useRef } from 'react'
import { Trophy } from 'lucide-react'

export default function AdaptiveLogo({ src, alt, className = "w-12 h-12", fallbackSize = "w-6 h-6" }) {
    const [bgColor, setBgColor] = useState('bg-white/5') // Default neutral background
    const [hasError, setHasError] = useState(false)
    const imgRef = useRef(null)

    useEffect(() => {
        if (!src) return

        const img = new Image()
        img.crossOrigin = "Anonymous"
        img.src = src

        img.onload = () => {
            try {
                const canvas = document.createElement('canvas')
                const context = canvas.getContext('2d')
                canvas.width = img.width
                canvas.height = img.height
                context.drawImage(img, 0, 0, img.width, img.height)

                const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
                const data = imageData.data
                let r = 0, g = 0, b = 0, count = 0

                for (let i = 0; i < data.length; i += 4) {
                    if (data[i + 3] > 128) { // Only count opaque pixels
                        r += data[i]
                        g += data[i + 1]
                        b += data[i + 2]
                        count++
                    }
                }

                if (count > 0) {
                    r = Math.floor(r / count)
                    g = Math.floor(g / count)
                    b = Math.floor(b / count)

                    // Calculate brightness (standard formula)
                    const brightness = (r * 299 + g * 587 + b * 114) / 1000

                    // If image is dark, use light background. If light, use dark background.
                    if (brightness < 128) {
                        setBgColor('bg-gray-200') // Light background for dark logos
                    } else {
                        setBgColor('bg-gray-900') // Dark background for light logos
                    }
                }
            } catch (e) {
                console.warn("Could not analyze image colors (CORS?)", e)
                // Keep default
            }
        }

        img.onerror = () => {
            setHasError(true)
        }
    }, [src])

    if (!src) {
        return (
            <div className={`${className} rounded-lg bg-white/5 flex items-center justify-center overflow-hidden`}>
                <Trophy className={`${fallbackSize} text-neonGreen`} />
            </div>
        )
    }

    return (
        <div className={`${className} rounded-lg ${bgColor} flex items-center justify-center overflow-hidden transition-colors duration-300`}>
            <img
                ref={imgRef}
                src={src}
                alt={alt}
                className="w-full h-full object-contain p-1"
                onError={() => setHasError(true)}
            />
        </div>
    )
}
