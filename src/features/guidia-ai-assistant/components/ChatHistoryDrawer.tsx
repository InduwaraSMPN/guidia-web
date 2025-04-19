"use client"

import { X, MessageSquare, ChevronDown, Search, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import { Drawer } from "vaul"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { API_URL } from "@/config"
import { useAuth } from "@/contexts/AuthContext"
import { Skeleton } from "@/components/ui/skeleton"

interface Conversation {
  conversationID: number
  title: string
  lastMessageTimestamp: string
  messageCount: number
  isArchived: boolean
  tags?: string[]
}

interface ChatHistoryDrawerProps {
  onSelectConversation: (conversationId: number) => void
  selectedConversationId?: number
  onNewConversation: () => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export function ChatHistoryDrawer({
  onSelectConversation,
  selectedConversationId,
  onNewConversation,
  isOpen,
  setIsOpen,
}: ChatHistoryDrawerProps) {
  const { user } = useAuth()
  const token = localStorage.getItem('token')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showArchived, setShowArchived] = useState(false)
  const [contentHeight, setContentHeight] = useState<number | null>(null)

  // Fetch conversations
  const fetchConversations = async (archived = false) => {
    if (!token) return

    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/api/chat-history/conversations?archived=${archived}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch conversations")
      }

      const data = await response.json()
      setConversations(data.data.conversations)
    } catch (error) {
      console.error("Error fetching conversations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter conversations based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredConversations(conversations)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = conversations.filter(
        (conversation) => conversation.title.toLowerCase().includes(query)
      )
      setFilteredConversations(filtered)
    }
  }, [searchQuery, conversations])

  // Fetch conversations when drawer opens or archived status changes
  useEffect(() => {
    if (isOpen && user) {
      fetchConversations(showArchived)
    }
  }, [isOpen, showArchived, user])

  // Measure content height for dynamic drawer sizing
  useEffect(() => {
    if (!isOpen) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Add a small buffer (80px) for padding
        setContentHeight(entry.contentRect.height + 80)
      }
    })

    const contentElement = document.getElementById("history-drawer-content")
    if (contentElement) {
      resizeObserver.observe(contentElement)
    }

    return () => {
      if (contentElement) {
        resizeObserver.unobserve(contentElement)
      }
    }
  }, [isOpen])

  // Handle body scroll lock and navigation bar styling
  useEffect(() => {
    const navElement = document.querySelector("nav") || document.querySelector("header")

    if (isOpen) {
      // Lock body scroll when drawer is open
      document.body.style.overflow = "hidden"

      // Apply desaturation to navigation if it exists
      if (navElement) {
        navElement.style.filter = "saturate(0.85) brightness(0.95)"
        navElement.style.transition = "filter 0.3s ease"
      }
    } else {
      // Restore body scroll when drawer is closed
      document.body.style.overflow = ""

      // Remove desaturation from navigation
      if (navElement) {
        navElement.style.filter = ""
      }
    }

    return () => {
      document.body.style.overflow = ""
      if (navElement) {
        navElement.style.filter = ""
      }
    }
  }, [isOpen])

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === now.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return format(date, "MMM d, yyyy")
    }
  }

  return (
    <Drawer.Root open={isOpen} onOpenChange={setIsOpen}>
      <Drawer.Portal>
        <Drawer.Overlay
          className="fixed inset-0 z-[45] transition-all duration-300"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.25)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
          }}
        />
        <Drawer.Content
          style={{
            height: contentHeight ? `${Math.min(contentHeight, window.innerHeight * 0.85)}px` : "auto",
            maxHeight: "85vh",
          }}
          className="bg-card flex flex-col rounded-t-[20px] mt-24 fixed bottom-0 left-0 right-0 z-[46] shadow-xl border-t border-border"
        >
          <Drawer.Title className="sr-only">Chat History</Drawer.Title>
          <Drawer.Description className="sr-only">
            Panel for browsing and managing your chat history with Guidia AI
          </Drawer.Description>

          <div className="p-3 bg-card rounded-t-[20px] flex-1 overflow-auto">
            {/* Improved drag handle with subtle animation */}
            <div className="flex justify-center mb-3">
              <motion.div
                className="w-12 h-1.5 flex-shrink-0 rounded-full bg-muted"
                initial={{ opacity: 0.7 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
              />
            </div>

            {/* Enhanced header with better visual hierarchy */}
            <div className="px-4 py-2 flex justify-between items-center mb-4">
              <div className="flex items-center gap-2.5">
                <MessageSquare className="h-5 w-5 text-brand" />
                <h2 className="font-semibold text-foreground text-xl">Chat History</h2>
              </div>
              <motion.button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground p-2.5 rounded-full hover:bg-muted/80 transition-colors"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Close history panel"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>

            {/* Search and filter controls */}
            <div className="px-4 mb-4">
              <div className="relative mb-3">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Button
                  variant={showArchived ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowArchived(!showArchived)}
                  className="text-xs"
                >
                  {showArchived ? "View Active" : "View Archived"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onNewConversation}
                  className="text-xs"
                >
                  New Chat
                </Button>
              </div>
            </div>

            {/* Content area with conversations list */}
            <div
              id="history-drawer-content"
              className="px-4 pb-4 max-h-[calc(70vh-180px)] overflow-y-auto custom-scrollbar"
            >
              {isLoading ? (
                // Loading state
                <div className="space-y-3">
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="flex items-center p-3 rounded-lg border border-border">
                      <Skeleton className="h-10 w-10 rounded-full mr-3" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredConversations.length === 0 ? (
                // Empty state
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-2 opacity-50" />
                  <h3 className="font-medium text-lg">No conversations found</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    {searchQuery
                      ? "Try a different search term"
                      : showArchived
                      ? "No archived conversations"
                      : "Start a new chat to begin"}
                  </p>
                </div>
              ) : (
                // Conversation list
                <div className="space-y-2">
                  <AnimatePresence>
                    {filteredConversations.map((conversation, index) => (
                      <motion.div
                        key={conversation.conversationID}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedConversationId === conversation.conversationID
                            ? "border-brand bg-brand/5"
                            : "border-border hover:border-brand/30 hover:bg-secondary/50"
                        }`}
                        onClick={() => {
                          onSelectConversation(conversation.conversationID)
                          setIsOpen(false)
                        }}
                      >
                        <div className="flex items-start">
                          <div className="bg-secondary rounded-full p-2 mr-3">
                            <Clock className="h-5 w-5 text-brand" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm text-foreground truncate">
                              {conversation.title || "Untitled Conversation"}
                            </h3>
                            <div className="flex items-center mt-1">
                              <p className="text-xs text-muted-foreground">
                                {formatDate(conversation.lastMessageTimestamp)}
                              </p>
                              <span className="mx-1.5 text-muted-foreground">•</span>
                              <p className="text-xs text-muted-foreground">
                                {conversation.messageCount} {conversation.messageCount === 1 ? "message" : "messages"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
