"use client"

import { motion } from "framer-motion"
import { Search, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

interface PromptGalleryProps {
  onPromptSelect: (prompt: string) => void
  className?: string
}

// Define all prompts in a flat array
const allPrompts = [
  // Career Advice
  "How to write a professional resume",
  "Tips for job interview preparation",
  "Career paths in software development",
  "How to negotiate a higher salary",
  // Education
  "Scholarships for graduate studies",
  "Online courses for data science",
  "Benefits of getting an MBA",
  // Job Search
  "How to find remote work",
  "Tips for using LinkedIn",
  "Questions to ask in interviews",
  // Additional prompts
  "How to start a side business",
  "Best practices for networking",
  "How to find a mentor in my field",
  "Balancing work and education",
  "Skills needed for future job market",
  "How to write a cover letter",
  "Strategies for job hunting"
]

export function PromptGallery({ onPromptSelect, className }: PromptGalleryProps) {
  // State for current displayed prompts
  const [displayedPrompts, setDisplayedPrompts] = useState<string[]>([])

  // Animation variants for container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  }

  // Animation variants for individual items
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  }

  // Function to shuffle and get random prompts
  const shufflePrompts = () => {
    // Create a copy of the array to avoid mutating the original
    const shuffled = [...allPrompts].sort(() => 0.5 - Math.random())
    // Take the first 4 items
    setDisplayedPrompts(shuffled.slice(0, 4))
  }

  // Initialize with random prompts on first render
  useEffect(() => {
    shufflePrompts()
  }, [])

  return (
    <div className={cn("w-full max-w-2xl mx-auto mt-8", className)}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-foreground px-1">
          Suggested Prompts
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={shufflePrompts}
          className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Shuffle</span>
        </Button>
      </div>

      <motion.div
        key={displayedPrompts.join('-')} // Key changes when prompts change to trigger animation
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        {displayedPrompts.map((prompt, index) => (
          <motion.div
            key={`prompt-${index}`}
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full"
          >
            <button
              onClick={() => onPromptSelect(prompt)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary/80 hover:bg-secondary text-foreground text-sm text-left transition-all duration-200 border border-border/30 hover:border-border hover:border-brand/30 shadow-sm hover:shadow min-h-[48px]"
            >
              <Search className="h-4 w-4 text-brand flex-shrink-0" />
              <span className="line-clamp-2">{prompt}</span>
            </button>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

export default PromptGallery
