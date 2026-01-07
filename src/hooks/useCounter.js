import { useState, useEffect, useRef } from 'react'

export const useCounter = (end, duration = 2000) => {
    const [count, setCount] = useState(0)
    const elementRef = useRef(null)
    const hasAnimated = useRef(false)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated.current) {
                    hasAnimated.current = true
                    let startTime = null

                    const animate = (currentTime) => {
                        if (!startTime) startTime = currentTime
                        const progress = Math.min((currentTime - startTime) / duration, 1)

                        // Ease out quart function for smooth slowing down
                        const easeProgress = 1 - Math.pow(1 - progress, 4)

                        setCount(Math.floor(easeProgress * end))

                        if (progress < 1) {
                            requestAnimationFrame(animate)
                        }
                    }

                    requestAnimationFrame(animate)
                }
            },
            { threshold: 0.1 }
        )

        if (elementRef.current) {
            observer.observe(elementRef.current)
        }

        return () => {
            if (elementRef.current) observer.unobserve(elementRef.current)
        }
    }, [end, duration])

    return [count, elementRef]
}

export default useCounter
