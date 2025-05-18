import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => {
  const [hasRendered, setHasRendered] = React.useState(false)

  React.useEffect(() => {
    // Delay animation slightly for visual effect
    const timer = setTimeout(() => setHasRendered(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 bg-primary transition-all duration-500 ease-in-out"
        asChild
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value || 0}%` }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 15,
            delay: hasRendered ? 0 : 0.3
          }}
        />
      </ProgressPrimitive.Indicator>
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
