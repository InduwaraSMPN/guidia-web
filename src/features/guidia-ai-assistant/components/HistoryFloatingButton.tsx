"use client"

import { History } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface HistoryFloatingButtonProps {
  onClick: () => void
  isVisible: boolean
}

export function HistoryFloatingButton({ onClick, isVisible }: HistoryFloatingButtonProps) {
  if (!isVisible) {
    return null
  }

  // Refactored to display Icon + Text, matching the provided image style
  return (
    // Keep the motion wrapper for smooth transitions
    // Adjust animation for a horizontal reveal which fits the new shape better
    <motion.div
      className="fixed left-6 bottom-6 z-40" // Position at bottom-left
      initial={{ opacity: 0, x: -20 }}      // Slide in from left
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}         // Slide out to left
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {/* Keep Tooltip for accessibility and extra context if desired */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {/*
              Modify Button component:
              - Remove variant="ghost" and size="icon"
              - Add flex layout to position icon and text.
              - Add padding (e.g., px-3 py-2 or use default Button padding).
              - Set text color (e.g., text-foreground, text-white, or a specific light gray)
              - Add background on hover/focus for feedback (e.g., hover:bg-accent)
              - Adjust rounding (e.g., rounded-md).
              - NOTE: The image has a dark background, but this is a floating button.
                We'll style the button itself, assuming it floats over the page content.
                Using standard Shadcn styles like text-foreground and hover:bg-accent.
                Adjust colors if your specific theme requires it (e.g., text-gray-300 hover:bg-gray-700).
            */}
            <Button
              onClick={onClick}
              variant="secondary" // Use secondary for better visibility
              className="h-auto px-3 py-2 rounded-md text-brand bg- transparent hover:bg-accent hover:text-brand-dark focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 flex items-center gap-2 shadow-sm" // Use flex to align icon and text with a gap
            >
              {/* Use the History icon - adjust size if needed */}
              <History className="h-5 w-5" /> {/* Match icon size from image */}
              {/* Add the visible text "History" */}
              <span className="text-sm">History</span> {/* Match text style */}
              {/* Remove the sr-only span as text is now visible */}
            </Button>
          </TooltipTrigger>
          {/* Update Tooltip content if desired, maybe shorten it */}
          <TooltipContent side="top">
            <p>View Chat History</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </motion.div>
  )
}