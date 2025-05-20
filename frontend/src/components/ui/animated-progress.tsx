

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface AnimatedProgressProps {
  label: string
  value: number
  className?: string
  colorClass?: string
  showBadge?: boolean
  delay?: number
}

/**
 * An animated progress bar component with label and optional badge
 */
export function AnimatedProgress({
  label,
  value,
  className,
  colorClass,
  showBadge = true,
  delay = 0
}: AnimatedProgressProps) {
  // Cap value at 100%
  const cappedValue = Math.min(Math.max(0, value), 100)
  
  // Determine color class based on value if not provided
  const defaultColorClass = () => {
    if (cappedValue < 40) return "bg-red-400 dark:bg-red-500"
    if (cappedValue < 70) return "bg-yellow-400 dark:bg-yellow-500"
    return "bg-green-400 dark:bg-green-500"
  }
  
  const progressColor = colorClass || defaultColorClass()
  
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between mb-1">
        <div className="font-medium">{label}</div>
        {showBadge && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 0.3, 
              delay: delay + 0.4,
              type: "spring",
              stiffness: 200,
              damping: 15
            }}
          >
            <Badge variant="outline">{cappedValue}%</Badge>
          </motion.div>
        )}
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-primary/20">
        <motion.div
          className={cn("h-full rounded-full", progressColor)}
          initial={{ width: 0 }}
          animate={{ width: `${cappedValue}%` }}
          transition={{ 
            duration: 1, 
            delay: delay,
            type: "spring",
            stiffness: 60,
            damping: 15
          }}
        />
      </div>
    </div>
  )
}
