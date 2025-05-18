import { useState, useEffect } from "react"
import { CheckCheck } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import axios from "axios"
import { useAuth } from "@/contexts/AuthContext"
import { Skeleton } from "./ui/skeleton"
import { cn } from "@/lib/utils"

interface NotificationsDropdownProps {
  onUpdateUnreadCount?: (count: number) => void
}

interface Notification {
  notificationID: number
  title: string
  message: string
  createdAt: string
  isRead: boolean
  notificationType: string
  priority: "low" | "medium" | "high" | "urgent"
  relatedJobID?: number
  relatedUserID?: number
  relatedApplicationID?: number
  relatedProfileID?: number
  relatedMessageID?: number
  metadata?: any
}

export function NotificationsDropdown({ onUpdateUnreadCount }: NotificationsDropdownProps) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState<number>(0)

  // Fetch notifications when the component mounts or user changes
  useEffect(() => {
    if (!user) return

    const fetchNotifications = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const token = localStorage.getItem("token")

        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL || "http://localhost:3001"}/api/notifications`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { limit: 10 }, // Limit to 10 notifications for the dropdown
          }
        )

        // Type assertion since we know the structure
        const notificationsData = response.data as Notification[]

        // Log notifications data to help diagnose issues
        console.log("Notifications data:", notificationsData)

        setNotifications(notificationsData)

        // Count unread notifications
        const unreadNotifications = notificationsData.filter((n) => !n.isRead)
        setUnreadCount(unreadNotifications.length)

        // Update parent component with unread count
        if (onUpdateUnreadCount) {
          onUpdateUnreadCount(unreadNotifications.length)
        }
      } catch (err: any) {
        console.error("Error fetching notifications:", err)

        // Provide more specific error messages based on the error
        if (err.response) {
          if (err.response.status === 500) {
            setError("Server error. The notification service is currently unavailable.")
          } else if (err.response.status === 401) {
            setError("Authentication error. Please log in again.")
          } else {
            setError(
              `Error: ${err.response.status} - ${
                err.response.data?.message || "Failed to load notifications"
              }`
            )
          }
        } else if (err.request) {
          setError("Network error. Please check your connection.")
        } else {
          setError("Failed to load notifications")
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()
  }, [user])

  const markAllAsRead = async () => {
    if (unreadCount === 0) return

    try {
      const token = localStorage.getItem("token")
      await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:3001"}/api/notifications/mark-all-read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      // Update local state
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })))

      // Reset unread count
      setUnreadCount(0)

      // Update parent component
      if (onUpdateUnreadCount) {
        onUpdateUnreadCount(0)
      }
    } catch (err) {
      console.error("Error marking notifications as read:", err)
    }
  }

  const markAsRead = async (notificationID: number) => {
    try {
      const token = localStorage.getItem("token")
      await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:3001"}/api/notifications/mark-read`,
        {
          notificationIDs: [notificationID],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      // Update local state
      setNotifications(
        notifications.map((n) =>
          n.notificationID === notificationID ? { ...n, isRead: true } : n
        )
      )

      // Update unread count
      const newCount = Math.max(0, unreadCount - 1)
      setUnreadCount(newCount)

      // Update parent component
      if (onUpdateUnreadCount) {
        onUpdateUnreadCount(newCount)
      }
    } catch (err) {
      console.error("Error marking notification as read:", err)
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    // Log notification details when clicked
    console.log("Notification clicked:", notification)

    // Mark as read if not already read
    if (!notification.isRead) {
      await markAsRead(notification.notificationID)
    }

    // Handle notification click based on type
    if (notification.relatedJobID) {
      window.location.href = `/jobs/${notification.relatedJobID}`
    } else if (notification.relatedApplicationID) {
      window.location.href = `/applications`
    } else if (notification.relatedProfileID) {
      // Determine profile type and redirect accordingly
      // This would need more logic based on your app structure
    } else if (notification.relatedMessageID) {
      // Redirect to messages
      if (user) {
        window.location.href = `/${user.userType.toLowerCase()}/${user.userID}/messages`
      }
    } else if (
      notification.notificationType.includes("MEETING_") ||
      (notification.metadata && notification.metadata.meetingID)
    ) {
      // Redirect to meetings page for any meeting-related notifications
      window.location.href = "/meetings/meetings"
    } else if (
      notification.notificationType === "PENDING_REGISTRATIONS" ||
      (notification.metadata && notification.metadata.redirectUrl)
    ) {
      // Use the redirectUrl from metadata if available
      const redirectUrl = notification.metadata?.redirectUrl || "/admin/registrations/pending"
      window.location.href = redirectUrl
    }
  }

  // Determine priority color
  const getPriorityColor = (priority: string | undefined) => {
    if (!priority) return "bg-secondary" // Default color if priority is undefined or null

    const priorityColors = {
      low: "bg-secondary",
      medium: "bg-info/20",
      high: "bg-warning/20",
      urgent: "bg-error/20",
    }
    return priorityColors[priority.toLowerCase() as keyof typeof priorityColors] || "bg-secondary"
  }

  if (isLoading) {
    return (
      <div className="flex flex-col p-4 w-80 bg-white rounded-lg shadow-lg border border-border">
        <div className="flex justify-between items-center border-b border-border pb-2 mb-4">
          <h3 className="text-lg font-semibold">Notifications</h3>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex items-start space-x-2 p-2">
              <Skeleton className="h-2 w-2 rounded-full mt-1.5" />
              <div className="flex-1">
                <Skeleton className="h-4 w-3/4 mb-1" />
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col p-4 w-80 bg-white rounded-lg shadow-lg border border-border">
        <div className="flex justify-between items-center border-b border-border pb-2 mb-4">
          <h3 className="text-lg font-semibold">Notifications</h3>
        </div>
        <div className="p-4 text-center text-error">{error}</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col p-4 w-80 bg-white rounded-lg shadow-lg border border-border">
      <div className="flex justify-between items-center border-b border-border pb-2 mb-4">
        <h3 className="text-lg font-semibold">Notifications</h3>
        {unreadCount > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              markAllAsRead()
            }}
            className="text-sm text-brand hover:text-brand-dark flex items-center gap-1"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </button>
        )}
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">No notifications</div>
        ) : (
          <div className="space-y-1">
            {notifications.map((notification) => {
              // Format the date as a relative time (e.g., "2 hours ago")
              const relativeTime = formatDistanceToNow(new Date(notification.createdAt), {
                addSuffix: true,
              })

              return (
                <div
                  key={notification.notificationID}
                  className={cn(
                    "p-3 hover:bg-secondary/50 transition-colors cursor-pointer rounded-md",
                    !notification.isRead && "bg-secondary/80"
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleNotificationClick(notification)
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      {!notification.isRead && (
                        <span className="w-2 h-2 bg-brand rounded-full mr-2 flex-shrink-0"></span>
                      )}
                      <h4
                        className={cn(
                          "text-sm font-medium",
                          notification.isRead ? "text-foreground" : "text-brand"
                        )}
                      >
                        {notification.title}
                      </h4>
                    </div>
                    <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                      {relativeTime}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {notification.message}
                  </p>

                  {/* Priority indicator */}
                  <div className="mt-2">
                    <span
                      className={cn(
                        "text-xs px-2 py-1 rounded-full",
                        getPriorityColor(notification.priority)
                      )}
                    >
                      {notification.notificationType ?
                        notification.notificationType.replace(/_/g, " ").toLowerCase() :
                        notification.priority || "notification"
                      }
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
