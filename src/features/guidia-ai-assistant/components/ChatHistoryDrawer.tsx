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
import { useNavigate } from "react-router-dom"
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
import { cn } from "@/lib/utils" // Assuming cn is available for conditional class merging

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
  const navigate = useNavigate()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showArchived, setShowArchived] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [conversationToDelete, setConversationToDelete] = useState<number | null>(null)

  // Fetch conversations with pagination support
  const fetchConversations = async (pageNum = 1, archived = false) => {
    if (!user) {
      console.log('No user available for chat history fetch')
      return
    }

    try {
      setIsLoading(true)
      const url = `${API_URL}/api/chat-history/conversations?page=${pageNum}&archived=${archived}`

      // Import the secure API request function
      const { secureApiRequest } = await import('@/lib/tokenHelper');

      // Use the secure API request function
      const response = await secureApiRequest(url)

      if (!response.ok) {
        throw new Error(`Failed to fetch conversations: ${response.status}`)
      }

      const data = await response.json()

      // Check if the data has the expected structure
      if (!data.data || !Array.isArray(data.data.conversations)) {
        console.error('Unexpected data structure:', data);
        toast.error('Invalid data format received from server');
        return;
      }

      if (pageNum === 1) {
        setConversations(data.data.conversations)
      } else {
        // Filter out duplicates before appending
        const newConversations = data.data.conversations.filter(
          (newItem: Conversation) => !conversations.some(existingItem => existingItem.conversationID === newItem.conversationID)
        );
        setConversations(prev => [...prev, ...newConversations]);
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
          (conversation.summary && conversation.summary.toLowerCase().includes(query)) ||
          (conversation.tags && conversation.tags.some(tag => tag.toLowerCase().includes(query))) // Added tag search
      )
      setFilteredConversations(filtered)
    }
  }, [searchQuery, conversations])

  // Fetch conversations when drawer opens or archived status changes
  useEffect(() => {
    if (isOpen && isLoggedIn && user) {
      // Reset conversations and fetch fresh data when filter changes
      setConversations([]);
      fetchConversations(1, showArchived);
    }
  }, [isOpen, showArchived, user, isLoggedIn]) // Added conversations state change as a dependency to potentially re-filter if list updates

  // Handle archive/unarchive
  const handleArchiveToggle = async (conversationId: number, currentArchiveState: boolean, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent selecting the conversation
    if (!user) return

    try {
      const { secureApiRequest } = await import('@/lib/tokenHelper');

      const response = await secureApiRequest(`${API_URL}/api/chat-history/conversations/${conversationId}`, {
        method: "PUT",
        body: JSON.stringify({
          isArchived: !currentArchiveState,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update conversation")
      }

      toast.success(
        currentArchiveState
          ? "Conversation restored from archive"
          : "Conversation archived"
      )

      // Re-fetch the current view to reflect the change
      // This is simpler than managing optimistic updates across filtered lists
      fetchConversations(1, showArchived)

    } catch (error) {
      console.error("Error toggling archive state:", error)
      toast.error("Failed to update conversation")
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!user || !conversationToDelete) return

    try {
      const { secureApiRequest } = await import('@/lib/tokenHelper');

      const response = await secureApiRequest(`${API_URL}/api/chat-history/conversations/${conversationToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete conversation")
      }

      // Remove from local state to update UI immediately
      setConversations(prev => prev.filter(conv => conv.conversationID !== conversationToDelete))

      // If the deleted conversation was selected, clear selection and start a new chat
      if (selectedConversationId === conversationToDelete) {
        onSelectConversation(0) // Assuming 0 means no selection or new chat
        onNewConversation() // Start a new empty chat
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
    if (!dateString) return ''; // Handle cases where dateString might be null/undefined

    const date = new Date(dateString)
    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)

    // Check for valid date
    if (isNaN(date.getTime())) {
      console.error("Invalid date string:", dateString);
      return 'Invalid Date';
    }


    if (date.toDateString() === now.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      // Ensure date-fns is imported and works
      try {
         return format(date, "MMM d, yyyy");
      } catch (e) {
         console.error("Error formatting date with date-fns:", e);
         return date.toLocaleDateString(); // Fallback
      }
    }
  }


  return (
    <Drawer.Root open={isOpen} onOpenChange={setIsOpen} direction="left">
      <Drawer.Portal>
        {/* Overlay with backdrop blur */}
        <Drawer.Overlay
          className="fixed inset-0 z-[45] transition-opacity duration-300 bg-black/20 backdrop-blur-sm" // Using tailwind classes for blur and opacity
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

          <div className="flex flex-col flex-1 overflow-hidden"> {/* Use flex-col and overflow-hidden */}

            {/* Enhanced header with clear visual hierarchy */}
            <div className="p-4 flex justify-between items-center"> {/* Added bottom border */}
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
              <div className="p-4 flex flex-col items-center justify-center text-center flex-1"> {/* Added p-4 and flex-1 */}
                <div className="py-10"> {/* Added padding for content */}
                   <MessageSquare className="h-12 w-12 text-brand mb-4 opacity-80" />
                   <h3 className="font-medium text-lg mb-2">Sign in to access your chat history</h3>
                   <p className="text-muted-foreground text-sm mb-6">
                     Create an account or sign in to save your conversations and access them later.
                   </p>
                   <div className="flex gap-3 justify-center"> {/* Centered buttons */}
                     <Button
                       onClick={() => {
                         setIsOpen(false)
                         navigate("/auth/login")
                       }}
                       className="bg-brand hover:bg-brand-dark text-white"
                     >
                       Sign In
                     </Button>
                     <Button
                       variant="outline"
                       onClick={() => {
                         setIsOpen(false)
                         navigate("/auth/register")
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
                <div className="p-4"> {/* Added padding and bottom border */}
                  <div className="relative mb-3">
                    <div className="absolute left-2.5 inset-y-0 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-muted-foreground" />
                    </div>
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
                      className={cn(
                        "text-xs cursor-pointer hover:underline transition-colors", // Added transition
                        showArchived ? 'text-brand font-medium' : 'text-muted-foreground'
                      )}
                    >
                      {showArchived ? "View Active" : "View Archived"}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onNewConversation}
                      className="text-xs h-7 px-3" // Adjusted size for consistency
                    >
                      New Chat
                    </Button>
                  </div>
                </div>

                {/* Content area with conversations list */}
                {isLoading ? (
                    // Loading state
                    <div className="p-4 space-y-3 overflow-hidden"> {/* Added padding */}
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
                    <div className="p-4 flex flex-col items-center justify-center text-center flex-1"> {/* Added padding and flex-1 */}
                      <div className="py-10"> {/* Added padding for content */}
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
                    </div>
                  ) : (
                    // Conversation list - Made scrollable
                    <div
                      id="history-drawer-list" // Renamed ID
                      className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-2" // Added padding, flex-1, overflow, custom-scrollbar, space-y
                      onScroll={(e) => {
                        const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
                        // Load more when scrolled near the bottom (e.g., within 100px)
                        if (scrollHeight - scrollTop - clientHeight < 100 && hasMore && !isLoading) {
                           fetchConversations(page + 1, showArchived);
                        }
                     }}
                    >
                      <AnimatePresence initial={false}> {/* initial={false} prevents initial animation on mount */}
                        {filteredConversations.map((conversation, index) => (
                          <motion.div
                            key={conversation.conversationID}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03, duration: 0.2 }} // Slightly adjusted transition
                            exit={{ opacity: 0, x: -20, transition: { duration: 0.15 } }} // Added horizontal exit animation
                            className={cn(
                              "p-3 rounded-lg border cursor-pointer transition-all flex items-start group", // Added 'group' class
                              selectedConversationId === conversation.conversationID
                                ? "border-brand bg-brand/5"
                                : "border-border hover:border-brand/30 hover:bg-secondary/50"
                            )}
                            onClick={() => {
                              onSelectConversation(conversation.conversationID)
                              setIsOpen(false)
                            }}
                          >
                            <div className="bg-secondary rounded-full p-2 mr-3 flex-shrink-0"> {/* Added flex-shrink-0 */}
                               <Clock className="h-5 w-5 text-brand" />
                            </div>
                            <div className="flex-1 min-w-0">
                               <h3 className="font-medium text-sm text-foreground truncate mb-1"> {/* Added mb-1 */}
                                 {conversation.title || `Chat ${conversation.conversationID}`} {/* Fallback title */}
                               </h3>
                               {conversation.lastMessage && (
                                 <p className="text-xs text-muted-foreground line-clamp-1 mb-1"> {/* Added mb-1 */}
                                   {conversation.lastMessage}
                                 </p>
                               )}
                               <div className="flex items-center flex-wrap gap-1"> {/* Removed mt-1, spacing handled by mb-1 above */}
                                 <p className="text-xs text-muted-foreground">
                                   {formatDate(conversation.updatedAt || conversation.createdAt)}
                                 </p>
                                 <span className="mx-0.5 text-muted-foreground">•</span> {/* Adjusted margin */}
                                 <p className="text-xs text-muted-foreground">
                                   {conversation.messageCount || 0} {(conversation.messageCount || 0) === 1 ? "message" : "messages"}
                                 </p>
                                 {conversation.isArchived && (
                                   <>
                                     <span className="mx-0.5 text-muted-foreground">•</span> {/* Adjusted margin */}
                                     <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5 font-normal"> {/* font-normal for less emphasis */}
                                       Archived
                                     </Badge>
                                   </>
                                 )}
                                  {/* Display tags if available */}
                                  {conversation.tags && conversation.tags.map(tag => (
                                     <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0 h-5 font-normal">
                                        {tag}
                                     </Badge>
                                  ))}
                               </div>
                            </div>

                            <DropdownMenu>
                               <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                 <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus:opacity-100 ml-2 flex-shrink-0" // Hide until hover, flex-shrink-0
                                    aria-label="Conversation options"
                                 >
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
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {/* Load more indicator */}
                      {hasMore && !isLoading && ( // Show load more if has more and not currently loading
                         <div className="mt-2 text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => fetchConversations(page + 1, showArchived)}
                              disabled={isLoading}
                              className="text-muted-foreground hover:text-foreground"
                           >
                              Load More
                           </Button>
                         </div>
                      )}
                       {isLoading && page > 1 && ( // Show skeleton only when loading subsequent pages
                           <div className="space-y-3 mt-2">
                              {[...Array(2)].map((_, index) => (
                                 <div key={index} className="flex items-center p-3 rounded-lg border border-border opacity-50">
                                    <Skeleton className="h-10 w-10 rounded-full mr-3" />
                                    <div className="space-y-2 flex-1">
                                       <Skeleton className="h-4 w-3/4" />
                                       <Skeleton className="h-3 w-1/2" />
                                    </div>
                                 </div>
                              ))}
                           </div>
                        )}
                    </div>
                  )}
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