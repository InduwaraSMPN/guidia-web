"use client"

import { X, MessageSquare, Search, Clock, Archive, Trash2, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import { Drawer } from "vaul"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { API_URL } from "@/config"
import { useAuth } from "@/contexts/AuthContext"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

interface Conversation {
  conversationID: number
  title: string
  lastMessageTimestamp: string
  updatedAt: string
  createdAt: string
  messageCount: number
  isArchived: boolean
  tags?: string[]
  lastMessage?: string
  summary?: string
}

interface ChatHistoryDrawerProps {
  onSelectConversation: (conversationId: number) => void
  selectedConversationId?: number
  onNewConversation: () => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  isLoggedIn?: boolean
}

export function ChatHistoryDrawer({
  onSelectConversation,
  selectedConversationId,
  onNewConversation,
  isOpen,
  setIsOpen,
  isLoggedIn = true, // Default to true for backward compatibility
}: ChatHistoryDrawerProps) {
  const { user } = useAuth()
  const token = localStorage.getItem('token')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showArchived, setShowArchived] = useState(false)
  // No longer need contentHeight state for side drawer
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [conversationToDelete, setConversationToDelete] = useState<number | null>(null)

  // Fetch conversations with pagination support
  const fetchConversations = async (pageNum = 1, archived = false) => {
    if (!token) return

    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/api/chat-history/conversations?page=${pageNum}&archived=${archived}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch conversations")
      }

      const data = await response.json()

      if (pageNum === 1) {
        setConversations(data.data.conversations)
      } else {
        setConversations(prev => [...prev, ...data.data.conversations])
      }

      setHasMore(pageNum < data.data.pagination.pages)
      setPage(pageNum)
    } catch (error) {
      console.error("Error fetching conversations:", error)
      toast.error("Failed to load chat history")
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
        (conversation) =>
          conversation.title.toLowerCase().includes(query) ||
          (conversation.lastMessage && conversation.lastMessage.toLowerCase().includes(query)) ||
          (conversation.summary && conversation.summary.toLowerCase().includes(query))
      )
      setFilteredConversations(filtered)
    }
  }, [searchQuery, conversations])

  // Fetch conversations when drawer opens or archived status changes
  useEffect(() => {
    if (isOpen && isLoggedIn && user) {
      fetchConversations(1, showArchived)
      setPage(1) // Reset pagination when filters change
    }
  }, [isOpen, showArchived, user, isLoggedIn])

  // Handle archive/unarchive
  const handleArchiveToggle = async (conversationId: number, currentArchiveState: boolean, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent selecting the conversation
    if (!token) return

    try {
      const response = await fetch(`${API_URL}/api/chat-history/conversations/${conversationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isArchived: !currentArchiveState,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update conversation")
      }

      // Update local state
      setConversations(prev =>
        prev.map(conv =>
          conv.conversationID === conversationId
            ? { ...conv, isArchived: !currentArchiveState }
            : conv
        )
      )

      toast.success(
        currentArchiveState
          ? "Conversation restored from archive"
          : "Conversation archived"
      )

      // If we're viewing archived and unarchiving, or viewing active and archiving,
      // we should refresh the list
      if (showArchived === currentArchiveState) {
        fetchConversations(1, showArchived)
      }
    } catch (error) {
      console.error("Error toggling archive state:", error)
      toast.error("Failed to update conversation")
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!token || !conversationToDelete) return

    try {
      const response = await fetch(`${API_URL}/api/chat-history/conversations/${conversationToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete conversation")
      }

      // Remove from local state
      setConversations(prev => prev.filter(conv => conv.conversationID !== conversationToDelete))

      // If the deleted conversation was selected, clear selection
      if (selectedConversationId === conversationToDelete) {
        onSelectConversation(0)
        onNewConversation()
      }

      toast.success("Conversation deleted")
    } catch (error) {
      console.error("Error deleting conversation:", error)
      toast.error("Failed to delete conversation")
    } finally {
      setIsDeleteDialogOpen(false)
      setConversationToDelete(null)
    }
  }

  // No longer need to measure content height for side drawer

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
    <Drawer.Root open={isOpen} onOpenChange={setIsOpen} direction="left">
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
            width: "320px", // Fixed width for the side drawer
            height: "calc(100vh - 40px)", // Full height minus margin
            top: "20px", // Top margin
            bottom: "20px", // Bottom margin
            left: "20px", // Left margin
            '--vaul-drawer-initial-transform': 'translateX(-100%)', // Custom animation for left side
          } as React.CSSProperties}
          className="bg-card flex flex-col fixed z-[46] shadow-xl border border-border rounded-lg overflow-hidden"
        >
          <Drawer.Title className="sr-only">Chat History</Drawer.Title>
          <Drawer.Description className="sr-only">
            Panel for browsing and managing your chat history with Guidia AI
          </Drawer.Description>

          <div className="p-3 bg-card flex-1 overflow-auto">

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

            {/* Content based on login status */}
            {!isLoggedIn ? (
              // Not logged in state
              <div className="px-4 pb-4">
                <div className="flex flex-col items-center justify-center py-10 text-center pt-52">
                  <MessageSquare className="h-12 w-12 text-brand mb-4 opacity-80" />
                  <h3 className="font-medium text-lg mb-2">Sign in to access your chat history</h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    Create an account or sign in to save your conversations and access them later.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        setIsOpen(false)
                        window.location.href = "/auth/login"
                      }}
                      className="bg-brand hover:bg-brand-dark text-white"
                    >
                      Sign In
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsOpen(false)
                        window.location.href = "/auth/register"
                      }}
                    >
                      Create Account
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              // Logged in state - original content
              <>
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
                    <span
                      onClick={() => setShowArchived(!showArchived)}
                      className={`text-xs cursor-pointer hover:underline ${showArchived ? 'text-brand font-medium' : 'text-muted-foreground'}`}
                    >
                      {showArchived ? "View Active" : "View Archived"}
                    </span>
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
                  className="px-4 pb-4 max-h-[calc(100vh-220px)] overflow-y-auto custom-scrollbar"
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
                    <div className="flex flex-col items-center justify-center pt-56 py-10 text-center">
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
                            <div className="flex items-start justify-between">
                              <div className="flex items-start flex-1">
                                <div className="bg-secondary rounded-full p-2 mr-3">
                                  <Clock className="h-5 w-5 text-brand" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-medium text-sm text-foreground truncate">
                                    {conversation.title || "Untitled Conversation"}
                                  </h3>
                                  {conversation.lastMessage && (
                                    <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                                      {conversation.lastMessage}
                                    </p>
                                  )}
                                  <div className="flex items-center flex-wrap gap-1 mt-1">
                                    <p className="text-xs text-muted-foreground">
                                      {formatDate(conversation.lastMessageTimestamp)}
                                    </p>
                                    <span className="mx-1 text-muted-foreground">•</span>
                                    <p className="text-xs text-muted-foreground">
                                      {conversation.messageCount} {conversation.messageCount === 1 ? "message" : "messages"}
                                    </p>
                                    {conversation.isArchived && (
                                      <>
                                        <span className="mx-1 text-muted-foreground">•</span>
                                        <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5">
                                          Archived
                                        </Badge>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="icon" className="h-7 w-7">
                                    <ChevronRight className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={(e) => handleArchiveToggle(conversation.conversationID, conversation.isArchived, e)}
                                  >
                                    {conversation.isArchived ? (
                                      <>
                                        <Archive className="h-4 w-4 mr-2" />
                                        Unarchive
                                      </>
                                    ) : (
                                      <>
                                        <Archive className="h-4 w-4 mr-2" />
                                        Archive
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setConversationToDelete(conversation.conversationID)
                                      setIsDeleteDialogOpen(true)
                                    }}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {/* Load more button */}
                      {hasMore && (
                        <div className="mt-4 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => fetchConversations(page + 1, showArchived)}
                            disabled={isLoading}
                          >
                            {isLoading ? "Loading..." : "Load more"}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Conversation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this conversation? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Drawer.Root>
  )
}
