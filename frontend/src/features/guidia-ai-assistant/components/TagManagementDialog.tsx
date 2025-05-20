

import { useState, useEffect } from "react"
import { X, Plus, Tag } from "lucide-react"
import { toast } from "sonner"
import { API_URL } from "@/config"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"

interface TagManagementDialogProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  conversationId: number | null
  existingTags?: string[]
  onTagsUpdated: (tags: string[]) => void
}

export function TagManagementDialog({
  isOpen,
  setIsOpen,
  conversationId,
  existingTags = [],
  onTagsUpdated,
}: TagManagementDialogProps) {
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize tags from props only when the dialog opens or conversation changes
  useEffect(() => {
    if (isOpen && conversationId) {
      setTags(existingTags || [])
    }
  }, [conversationId, isOpen])

  const handleAddTag = () => {
    const trimmedTag = newTag.trim()
    if (!trimmedTag) return

    // Check for duplicates (case insensitive)
    if (tags.some(tag => tag.toLowerCase() === trimmedTag.toLowerCase())) {
      toast.error("This tag already exists")
      return
    }

    setTags(prev => [...prev, trimmedTag])
    setNewTag("")
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleSave = async () => {
    if (!conversationId) return

    try {
      setIsSubmitting(true)

      // Import the secure API request function
      const { secureApiRequest } = await import('@/lib/tokenHelper')

      const response = await secureApiRequest(`${API_URL}/api/chat-history/conversations/${conversationId}/tags`, {
        method: "POST",
        body: JSON.stringify({ tags }),
      })

      if (!response.ok) {
        throw new Error("Failed to update tags")
      }

      // Notify parent component of the update
      onTagsUpdated(tags)

      toast.success("Tags updated successfully")
      setIsOpen(false)
    } catch (error) {
      console.error("Error updating tags:", error)
      toast.error("Failed to update tags")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Tag className="h-5 w-5 mr-2 text-brand" />
            Manage Tags
          </DialogTitle>
          <DialogDescription>
            Add tags to organize your conversations. Tags help you find related conversations later.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center space-x-2 my-4">
          <div className="relative flex-1">
            <Input
              placeholder="Add a tag..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pr-10"
              maxLength={50}
            />
            {newTag && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setNewTag("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Button
            type="button"
            onClick={handleAddTag}
            disabled={!newTag.trim()}
            size="icon"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="min-h-[100px] max-h-[200px] overflow-y-auto">
          {tags.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">
              No tags added yet. Add tags to organize your conversations.
            </p>
          ) : (
            <AnimatePresence initial={false}>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <motion.div
                    key={tag}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                    className="group relative"
                  >
                    <Badge variant="secondary" className="pr-7 py-1.5 text-sm">
                      {tag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveTag(tag)}
                        className="absolute right-0 top-0 h-full w-7 p-0 opacity-70 hover:opacity-100 hover:bg-transparent"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className="bg-brand hover:bg-brand-dark text-white"
          >
            {isSubmitting ? "Saving..." : "Save Tags"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
