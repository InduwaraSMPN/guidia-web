"use client";

import type React from "react";

import {
  X,
  MessageSquare,
  Search,
  Clock,
  Archive,
  Trash2,
  ChevronRight,
  Tag,
  Loader2,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Drawer } from "vaul";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { API_URL } from "@/config";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TagManagementDialog } from "./TagManagementDialog";
import { ChatPreferencesDialog } from "./ChatPreferencesDialog";

interface Conversation {
  conversationID: number;
  title: string;
  lastMessageTimestamp: string;
  updatedAt: string;
  createdAt: string;
  messageCount: number;
  isArchived: boolean;
  tags?: string[];
  lastMessage?: string;
  summary?: string;
  unreadCount?: number; // Added this property based on the analysis
}

interface ChatHistoryDrawerProps {
  onSelectConversation: (conversationId: number) => void;
  selectedConversationId?: number;
  onNewConversation: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isLoggedIn?: boolean;
}

export function ChatHistoryDrawer({
  onSelectConversation,
  selectedConversationId,
  onNewConversation,
  isOpen,
  setIsOpen,
  isLoggedIn = true,
}: ChatHistoryDrawerProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<
    Conversation[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<
    number | null
  >(null);
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [conversationForTags, setConversationForTags] = useState<number | null>(
    null
  );
  const [selectedConversationTags, setSelectedConversationTags] = useState<
    string[]
  >([]);
  const [isPreferencesDialogOpen, setIsPreferencesDialogOpen] = useState(false);

  // Fetch conversations with pagination support
  const fetchConversations = async (pageNum = 1, archived = false) => {
    if (!user) {
      console.log("No user available for chat history fetch");
      return;
    }

    try {
      if (pageNum === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const url = `${API_URL}/api/chat-history/conversations?page=${pageNum}&archived=${archived}`;

      // Import the secure API request function
      const { secureApiRequest } = await import("@/lib/tokenHelper");

      // Use the secure API request function
      const response = await secureApiRequest(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch conversations: ${response.status}`);
      }

      const data = await response.json();

      // Check if the data has the expected structure
      if (!data.data || !Array.isArray(data.data.conversations)) {
        console.error("Unexpected data structure:", data);
        toast.error("Invalid data format received from server");
        return;
      }

      if (pageNum === 1) {
        setConversations(data.data.conversations);
      } else {
        // Filter out duplicates before appending
        const newConversations = data.data.conversations.filter(
          (newItem: Conversation) =>
            !conversations.some(
              (existingItem) =>
                existingItem.conversationID === newItem.conversationID
            )
        );
        setConversations((prev) => [...prev, ...newConversations]);
      }

      setHasMore(pageNum < data.data.pagination.pages);
      setPage(pageNum);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast.error("Failed to load chat history");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Search conversations using server-side search
  useEffect(() => {
    // If search query is empty, just use the regular conversations
    if (searchQuery.trim() === "") {
      setFilteredConversations(conversations);
      return;
    }

    // Debounce function to avoid too many requests
    const debounceTimeout = setTimeout(async () => {
      try {
        setIsLoading(true);

        // Import the secure API request function
        const { secureApiRequest } = await import("@/lib/tokenHelper");

        // Call the server-side search endpoint
        console.log(`Calling search API with query: ${searchQuery}`);
        const searchUrl = `${API_URL}/api/chat-history/search?query=${encodeURIComponent(searchQuery)}`;
        console.log(`Search URL: ${searchUrl}`);
        const response = await secureApiRequest(searchUrl);

        if (!response.ok) {
          throw new Error(`Search failed: ${response.status}`);
        }

        const data = await response.json();
        console.log("Search API response:", data);

        // Check if the data has the expected structure
        if (!data.data || !Array.isArray(data.data.conversations)) {
          console.error("Unexpected search result structure:", data);
          toast.error("Invalid search results format");
          return;
        }

        console.log(`Found ${data.data.conversations.length} conversations matching search query`);
        setFilteredConversations(data.data.conversations);
      } catch (error) {
        console.error("Error searching conversations:", error);
        toast.error("Failed to search conversations");

        // Fallback to client-side filtering if server search fails
        const query = searchQuery.toLowerCase();
        const filtered = conversations.filter(
          (conversation) =>
            conversation.title.toLowerCase().includes(query) ||
            (conversation.lastMessage &&
              conversation.lastMessage.toLowerCase().includes(query)) ||
            (conversation.summary &&
              conversation.summary.toLowerCase().includes(query)) ||
            (conversation.tags &&
              conversation.tags.some((tag) => tag.toLowerCase().includes(query)))
        );
        setFilteredConversations(filtered);
      } finally {
        setIsLoading(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery, conversations, API_URL]);

  // Fetch conversations when drawer opens or archived status changes
  useEffect(() => {
    if (isOpen && isLoggedIn && user) {
      // Reset conversations and fetch fresh data when filter changes
      setConversations([]);
      fetchConversations(1, showArchived);
    }
  }, [isOpen, showArchived, user, isLoggedIn]);

  // Handle archive/unarchive
  const handleArchiveToggle = async (
    conversationId: number,
    currentArchiveState: boolean,
    e: React.MouseEvent
  ) => {
    e.stopPropagation(); // Prevent selecting the conversation
    if (!user) return;

    try {
      const { secureApiRequest } = await import("@/lib/tokenHelper");

      const response = await secureApiRequest(
        `${API_URL}/api/chat-history/conversations/${conversationId}`,
        {
          method: "PUT",
          body: JSON.stringify({
            isArchived: !currentArchiveState,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update conversation");
      }

      toast.success(
        currentArchiveState
          ? "Conversation restored from archive"
          : "Conversation archived"
      );

      // Re-fetch the current view to reflect the change
      fetchConversations(1, showArchived);
    } catch (error) {
      console.error("Error toggling archive state:", error);
      toast.error("Failed to update conversation");
    }
  };

  // Handle tags update
  const handleTagsUpdated = (updatedTags: string[]) => {
    // Update the tags in the local state
    if (conversationForTags) {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.conversationID === conversationForTags
            ? { ...conv, tags: updatedTags }
            : conv
        )
      );
    }
  };

  // Handle opening tag management dialog
  const handleManageTags = (
    conversationId: number,
    currentTags: string[] = [],
    e: React.MouseEvent
  ) => {
    e.stopPropagation(); // Prevent selecting the conversation
    setConversationForTags(conversationId);
    setSelectedConversationTags(currentTags);
    setIsTagDialogOpen(true);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!user || !conversationToDelete) return;

    try {
      const { secureApiRequest } = await import("@/lib/tokenHelper");

      const response = await secureApiRequest(
        `${API_URL}/api/chat-history/conversations/${conversationToDelete}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete conversation");
      }

      // Remove from local state to update UI immediately
      setConversations((prev) =>
        prev.filter((conv) => conv.conversationID !== conversationToDelete)
      );

      // If the deleted conversation was selected, clear selection and start a new chat
      if (selectedConversationId === conversationToDelete) {
        onSelectConversation(0); // Assuming 0 means no selection or new chat
        onNewConversation(); // Start a new empty chat
      }

      toast.success("Conversation deleted");
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Failed to delete conversation");
    } finally {
      setIsDeleteDialogOpen(false);
      setConversationToDelete(null);
    }
  };

  // Handle body scroll lock and navigation bar styling
  useEffect(() => {
    const navElement =
      document.querySelector("nav") || document.querySelector("header");

    if (isOpen) {
      // Lock body scroll when drawer is open
      document.body.style.overflow = "hidden";

      // Apply desaturation to navigation if it exists
      if (navElement) {
        navElement.style.filter = "saturate(0.85) brightness(0.95)";
        navElement.style.transition = "filter 0.3s ease";
      }
    } else {
      // Restore body scroll when drawer is closed
      document.body.style.overflow = "";

      // Remove desaturation from navigation
      if (navElement) {
        navElement.style.filter = "";
      }
    }

    return () => {
      document.body.style.overflow = "";
      if (navElement) {
        navElement.style.filter = "";
      }
    };
  }, [isOpen]);

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return ""; // Handle cases where dateString might be null/undefined

    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check for valid date
    if (isNaN(date.getTime())) {
      console.error("Invalid date string:", dateString);
      return "Invalid Date";
    }

    if (date.toDateString() === now.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      // Ensure date-fns is imported and works
      try {
        return format(date, "MMM d, yyyy");
      } catch (e) {
        console.error("Error formatting date with date-fns:", e);
        return date.toLocaleDateString(); // Fallback
      }
    }
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={setIsOpen} direction="left">
      <Drawer.Portal>
        {/* Overlay with backdrop blur */}
        <Drawer.Overlay className="fixed inset-0 z-[45] bg-black/30 backdrop-blur-sm transition-all duration-300" />
        <Drawer.Content
          style={
            {
              width: "350px", // Slightly wider for better readability
              height: "calc(100vh - 40px)",
              top: "20px",
              bottom: "20px",
              left: "20px",
              "--vaul-drawer-initial-transform": "translateX(-100%)",
            } as React.CSSProperties
          }
          className="bg-card flex flex-col fixed z-[46] shadow-xl border border-border rounded-lg overflow-hidden transition-transform duration-300"
        >
          <Drawer.Title className="sr-only">Chat History</Drawer.Title>
          <Drawer.Description className="sr-only">
            Panel for browsing and managing your chat history with Guidia AI
          </Drawer.Description>

          <div className="flex flex-col h-full">
            {/* Enhanced header with clear visual hierarchy */}
            <div className="p-5 border-b flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <h2 className="font-semibold text-foreground text-xl">
                  Chat History
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={() => setIsPreferencesDialogOpen(true)}
                  className="text-muted-foreground hover:text-foreground p-2 rounded-full hover:bg-muted transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Chat preferences"
                >
                  <Settings className="h-5 w-5" />
                </motion.button>
                <motion.button
                  onClick={() => setIsOpen(false)}
                  className="text-muted-foreground hover:text-foreground p-2 rounded-full hover:bg-muted transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95, rotate: 90 }}
                  aria-label="Close history panel"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>
            </div>

            {/* Content based on login status */}
            {!isLoggedIn ? (
              // Not logged in state
              <div className="flex flex-col items-center justify-center text-center flex-1 p-8">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-xs"
                >
                  <div className="bg-primary/10 p-4 rounded-full inline-block mb-6">
                    <MessageSquare className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="font-medium text-xl mb-3">
                    Sign in to access your chat history
                  </h3>
                  <p className="text-muted-foreground mb-8">
                    Create an account or sign in to save your conversations and
                    access them later.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={() => {
                        setIsOpen(false);
                        navigate("/auth/login");
                      }}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
                      size="lg"
                    >
                      Sign In
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsOpen(false);
                        navigate("/auth/register");
                      }}
                      size="lg"
                      className="px-6"
                    >
                      Create Account
                    </Button>
                  </div>
                </motion.div>
              </div>
            ) : (
              // Logged in state - enhanced content
              <>
                {/* Search and filter controls */}
                <div className="p-5 border-b">
                  <div className="relative mb-4">
                    <div className="absolute left-3 inset-y-0 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      placeholder="Search conversations..."
                      className="pl-10 h-10 bg-muted/50 border-muted focus-visible:ring-primary/30"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <motion.button
                      onClick={() => setShowArchived(!showArchived)}
                      className={cn(
                        "text-sm flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors",
                        showArchived
                          ? "text-primary font-medium"
                          : "text-muted-foreground hover:bg-muted"
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Archive className="h-3.5 w-3.5" />
                      {showArchived ? "View Active" : "View Archived"}
                    </motion.button>
                    <Button
                      onClick={onNewConversation}
                      className="text-sm gap-1.5"
                      size="sm"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      New Chat
                    </Button>
                  </div>
                </div>

                {/* Content area with conversations list */}
                {isLoading ? (
                  // Loading state with improved skeletons
                  <div className="p-5 space-y-3 flex-1">
                    {[...Array(5)].map((_, index) => (
                      <motion.div
                        key={index}
                        className="flex items-start p-4 rounded-lg border border-border bg-card"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.2 }}
                      >
                        <Skeleton className="h-10 w-10 rounded-full mr-4 flex-shrink-0" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                          <div className="flex gap-2 mt-1">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-3 w-12" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : filteredConversations.length === 0 ? (
                  // Empty state with improved visuals
                  <div className="flex flex-col items-center justify-center text-center flex-1 p-8">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="max-w-xs"
                    >
                      <div className="bg-muted p-4 rounded-full inline-block mb-6">
                        <MessageSquare className="h-10 w-10 text-muted-foreground opacity-50" />
                      </div>
                      <h3 className="font-medium text-xl mb-3">
                        No conversations found
                      </h3>
                      <p className="text-muted-foreground">
                        {searchQuery
                          ? "Try a different search term"
                          : showArchived
                          ? "No archived conversations"
                          : "Start a new chat to begin"}
                      </p>
                      {searchQuery && (
                        <Button
                          variant="outline"
                          className="mt-6"
                          onClick={() => setSearchQuery("")}
                        >
                          Clear Search
                        </Button>
                      )}
                    </motion.div>
                  </div>
                ) : (
                  // Conversation list - enhanced with better spacing and animations
                  <div
                    className="p-5 flex-1 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/30"
                    onScroll={(e) => {
                      const { scrollTop, clientHeight, scrollHeight } =
                        e.currentTarget;
                      // Load more when scrolled near the bottom (e.g., within 100px)
                      if (
                        scrollHeight - scrollTop - clientHeight < 100 &&
                        hasMore &&
                        !isLoading &&
                        !isLoadingMore
                      ) {
                        fetchConversations(page + 1, showArchived);
                      }
                    }}
                  >
                    <AnimatePresence initial={false}>
                      {filteredConversations.map((conversation, index) => (
                        <motion.div
                          key={conversation.conversationID}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03, duration: 0.2 }}
                          exit={{
                            opacity: 0,
                            x: -20,
                            transition: { duration: 0.15 },
                          }}
                          className={cn(
                            "p-4 rounded-lg border cursor-pointer transition-all flex items-start group relative",
                            selectedConversationId ===
                              conversation.conversationID
                              ? "border-primary shadow-sm"
                              : "border-border hover:border-primary/30 hover:bg-secondary/50"
                          )}
                          onClick={() => {
                            onSelectConversation(conversation.conversationID);
                            setIsOpen(false);
                          }}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div
                            className={cn(
                              "rounded-full p-2.5 mr-4 flex-shrink-0 transition-colors",
                              selectedConversationId ===
                                conversation.conversationID
                                ? "bg-primary/10"
                                : "bg-secondary"
                            )}
                          >
                            <Clock
                              className={cn(
                                "h-5 w-5",
                                selectedConversationId ===
                                  conversation.conversationID
                                  ? "text-primary"
                                  : "text-muted-foreground"
                              )}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm text-foreground truncate mb-1.5">
                              {conversation.title ||
                                `Chat ${conversation.conversationID}`}
                            </h3>
                            {conversation.lastMessage && (
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
                                {conversation.lastMessage}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Date */}
                              <span className="inline-flex items-center text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                                {formatDate(
                                  conversation.updatedAt ||
                                    conversation.createdAt
                                )}
                              </span>
                              {/* Message count - Only show if greater than 0 */}
                              {conversation.messageCount &&
                                conversation.messageCount > 0 && (
                                  <span className="inline-flex items-center text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-lg">
                                    {conversation.messageCount}{" "}
                                    {conversation.messageCount === 1
                                      ? "message"
                                      : "messages"}
                                  </span>
                                )}
                              {/* If unreadCount exists and is greater than 0, display it as a badge */}
                              {conversation.unreadCount &&
                              conversation.unreadCount > 0 ? (
                                <Badge
                                  variant="secondary"
                                  className="text-xs px-2 py-0.5 h-5 font-normal"
                                >
                                  {conversation.unreadCount}
                                </Badge>
                              ) : null}
                              {/* Archive badge */}
                              {conversation.isArchived === true && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs px-2 py-0.5 h-5 font-normal"
                                >
                                  Archived
                                </Badge>
                              )}
                              {/* Tags */}
                              {conversation.tags && conversation.tags.length > 0 &&
                                conversation.tags.map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant="outline"
                                    className="text-xs px-2 py-0.5 h-5 font-normal"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger
                              asChild
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus:opacity-100 ml-2 flex-shrink-0 absolute top-3 right-3"
                                aria-label="Conversation options"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onClick={(e) =>
                                  handleManageTags(
                                    conversation.conversationID,
                                    conversation.tags,
                                    e
                                  )
                                }
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <Tag className="h-4 w-4" />
                                Manage Tags
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) =>
                                  handleArchiveToggle(
                                    conversation.conversationID,
                                    conversation.isArchived,
                                    e
                                  )
                                }
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <Archive className="h-4 w-4" />
                                {conversation.isArchived
                                  ? "Unarchive"
                                  : "Archive"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConversationToDelete(
                                    conversation.conversationID
                                  );
                                  setIsDeleteDialogOpen(true);
                                }}
                                className="text-destructive focus:text-destructive flex items-center gap-2 cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {/* Load more indicator */}
                    {hasMore && (
                      <div className="mt-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            fetchConversations(page + 1, showArchived)
                          }
                          disabled={isLoadingMore}
                          className="text-muted-foreground hover:text-foreground flex items-center gap-2"
                        >
                          {isLoadingMore ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            "Load More"
                          )}
                        </Button>
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Conversation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this conversation? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="mb-2 sm:mb-0"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tag management dialog */}
      <TagManagementDialog
        isOpen={isTagDialogOpen}
        setIsOpen={setIsTagDialogOpen}
        conversationId={conversationForTags}
        existingTags={selectedConversationTags}
        onTagsUpdated={handleTagsUpdated}
      />

      {/* Chat preferences dialog */}
      <ChatPreferencesDialog
        isOpen={isPreferencesDialogOpen}
        setIsOpen={setIsPreferencesDialogOpen}
      />
    </Drawer.Root>
  );
}
