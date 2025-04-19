"use client"

import { History } from "lucide-react" // Keep lucide-react icon
import { motion } from "framer-motion" // Keep animations
import { Button } from "@/components/ui/button" // Keep Shadcn Button
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip" // Keep Tooltip

interface HistoryFloatingButtonProps {
  onClick: () => void
  isVisible: boolean
}

export function HistoryFloatingButton({ onClick, isVisible }: HistoryFloatingButtonProps) {
  if (!isVisible) {
    return null
  }

  // Refactored to use the History icon as the primary visual element,
  // removing the solid background circle.
  return (
    // Keep the motion wrapper for smooth transitions
    <motion.div
      className="fixed left-6 bottom-6 z-40"
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {/* Keep Tooltip for accessibility and clarity */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {/*
              Use Shadcn Button for click handling and accessibility attributes.
              - variant="ghost": Removes default button background and border.
              - size="icon": Applies standard sizing/padding for icon buttons (adjust if not available/desired).
              - rounded-full: Makes the hover/focus effect circular if a background appears.
              - text-brand: Sets the icon color to the brand color. Inherited by the icon.
              - hover:text-brand-dark: Darkens icon color on hover.
              - hover:bg-brand/10: Adds a subtle circular background matching the brand color (with 10% opacity) on hover for feedback.
              - Remove previous explicit size (h-14 w-14), background (bg-brand), text-white and shadow (shadow-lg).
            */}
            <Button
              onClick={onClick}
              variant="ghost" // Removes background/border
              size="icon"     // Standard padding for icon buttons, adjust if needed
              className="rounded-full text-brand hover:text-brand-dark hover:bg-brand/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" // Added focus-visible styles for accessibility
            >
              {/* Increased icon size for better visibility as the primary element */}
              <History className="h-6 w-6" /> {/* Example: Increased size */}
              {/* Keep screen reader text */}
              <span className="sr-only">View Chat History</span>
            </Button>
          </TooltipTrigger>
          {/* Keep Tooltip content */}
          <TooltipContent side="right">
            <p>View Chat History</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </motion.div>
  )
}