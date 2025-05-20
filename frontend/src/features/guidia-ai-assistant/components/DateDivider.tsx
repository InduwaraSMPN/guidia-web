

import { motion } from "framer-motion"

interface DateDividerProps {
  date: string
}

export function DateDivider({ date }: DateDividerProps) {
  return (
    <motion.div
      className="flex justify-center my-6"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <div className="bg-secondary/80 dark:bg-secondary/60 text-muted-foreground dark:text-muted-foreground text-xs px-4 py-1.5 rounded-full font-medium shadow-sm border border-border/30 backdrop-blur-sm">
        {date}
      </div>
    </motion.div>
  )
}

export default DateDivider
