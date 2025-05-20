

import { useRef, useEffect, useState, ReactNode } from "react"
import { motion } from "framer-motion"

interface AnimatedChartContainerProps {
  children: ReactNode
  className?: string
  delay?: number
}

/**
 * A container that animates its children (charts) when they come into view
 */
export function AnimatedChartContainer({
  children,
  className = "",
  delay = 0,
}: AnimatedChartContainerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        threshold: 0.1, // Trigger when at least 10% of the element is visible
      }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: delay,
      }}
    >
      {children}
    </motion.div>
  )
}
