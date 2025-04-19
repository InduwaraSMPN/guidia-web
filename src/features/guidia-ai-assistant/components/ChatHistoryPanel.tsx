"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Calendar, Tag, Archive, Trash2, ChevronRight, MessageSquare, Clock, Filter } from "lucide-react"
import { format } from "date-fns"
import { API_URL } from "@/config"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface Conversation {
  conversationID: number
  title: string
  createdAt: string
  updatedAt: string
  summary?: string
  isArchived: boolean
  lastMessage?: string
  messageCount: number
}

interface ChatHistoryPanelProps {
  onSelectConversation: (conversationId: number) => void
  selectedConversationId?: number
  className?: string
}

export function ChatHistoryPanel({
  onSelectConversation,
  selectedConversationId,
  className,
}: ChatHistoryPanelProps) {
  const { user, token } = useAuth()
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

  // Fetch conversations
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
      const filtered = conversations.filter(
        conv => 
          conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (conv.lastMessage && conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (conv.summary && conv.summary.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      setFilteredConversations(filtered)
    }
  }, [searchQuery, conversations])

  // Initial fetch
  useEffect(() => {
    if (token) {
      fetchConversations(1, showArchived)
    }
  }, [token, showArchived])

  // Handle archive/unarchive
  const handleArchiveToggle = async (conversationId: number, currentArchiveState: boolean) => {
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

  // Load more conversations
  const loadMore = () => {
    if (hasMore && !isLoading) {
      fetchConversations(page + 1, showArchived)
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    
    // If it's today, show time
    if (date.toDateString() === now.toDateString()) {
      return format(date, "h:mm a")
    }
    
    // If it's this year, show month and day
    if (date.getFullYear() === now.getFullYear()) {
      return format(date, "MMM d")
    }
    
    // Otherwise show full date
    return format(date, "MMM d, yyyy")
  }

  return (
    <div className={cn("flex flex-col h-full border-r border-border", className)}>
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold mb-2">Chat History</h2>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between mt-3">
          <Button
            variant={showArchived ? "default" : "outline"}
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
            className="text-xs"
          >
            {showArchived ? "View Active" : "View Archived"}
          </Button>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Filter className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Filter options (coming soon)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading && page === 1 ? (
          // Loading skeletons
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
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
          <div className="divide-y divide-border">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.conversationID}
                className={cn(
                  "p-4 hover:bg-secondary/50 cursor-pointer transition-colors",
                  selectedConversationId === conversation.conversationID && "bg-secondary"
                )}
                onClick={() => onSelectConversation(conversation.conversationID)}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium truncate pr-4">{conversation.title}</h3>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(conversation.updatedAt)}
                  </span>
                </div>
                
                {conversation.lastMessage && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {conversation.lastMessage}
                  </p>
                )}
                
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs px-1.5 py-0 h-5">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      {conversation.messageCount}
                    </Badge>
                    
                    {conversation.isArchived && (
                      <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5">
                        Archived
                      </Badge>
                    )}
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          handleArchiveToggle(conversation.conversationID, conversation.isArchived)
                        }}
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
              </div>
            ))}
            
            {hasMore && (
              <div className="p-4 text-center">
                <Button variant="ghost" size="sm" onClick={loadMore} disabled={isLoading}>
                  {isLoading ? "Loading..." : "Load more"}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

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
    </div>
  )
}

export default ChatHistoryPanel
