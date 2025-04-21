"use client"

import { PanelLeft } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface AdminSidebarFloatingButtonProps {
  onClick: () => void
  isVisible: boolean
}

export function AdminSidebarFloatingButton({ onClick, isVisible }: AdminSidebarFloatingButtonProps) {
  if (!isVisible) {
    return null
  }

  return (
    <motion.div
      className="fixed left-6 bottom-6 z-40"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClick}
              className="text-xs flex items-center gap-1 text-rose-800 hover:text-foreground"
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Open Admin Navigation</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </motion.div>
  )
}

export default AdminSidebarFloatingButton
