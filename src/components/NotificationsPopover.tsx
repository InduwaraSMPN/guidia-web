import { useState, useRef, useEffect, useCallback } from 'react';
import { CheckCheck, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface Notification {
  notificationID: number;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  notificationType: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  relatedJobID?: number;
  relatedUserID?: number;
  relatedApplicationID?: number;
  relatedProfileID?: number;
  relatedMessageID?: number;
  metadata?: any;
}

export function NotificationsPopover() {
  const { user } = useAuth();
  const { onNotification, offNotification } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Handle receiving a new notification via WebSocket
  const handleNewNotification = useCallback((notification: Notification) => {
    setNotifications(prev => {
      // Check if notification already exists
      const exists = prev.some(n => n.notificationID === notification.notificationID);
      if (exists) return prev;

      // Add new notification at the beginning of the array
      const updated = [notification, ...prev];

      // Show toast notification
      toast(notification.title, {
        description: notification.message,
        duration: 5000,
      });

      // Update unread count
      setUnreadCount(count => count + 1);

      return updated;
    });
  }, []);

  // Fetch notifications when the component mounts or user changes
  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const token = localStorage.getItem('token');

        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 20 }
        });

        // Type assertion since we know the structure
        const notificationsData = response.data as Notification[];
        setNotifications(notificationsData);

        // Count unread notifications
        const unreadNotifications = notificationsData.filter(n => !n.isRead);
        setUnreadCount(unreadNotifications.length);
      } catch (err: any) {
        console.error('Error fetching notifications:', err);

        // Provide more specific error messages based on the error
        if (err.response) {
          if (err.response.status === 500) {
            setError('Server error. The notification service is currently unavailable.');
          } else if (err.response.status === 401) {
            setError('Authentication error. Please log in again.');
          } else {
            setError(`Error: ${err.response.status} - ${err.response.data?.message || 'Failed to load notifications'}`);
          }
        } else if (err.request) {
          setError('Network error. Please check your connection.');
        } else {
          setError('Failed to load notifications');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();

    // Register for real-time notifications
    onNotification(handleNewNotification);

    return () => {
      // Clean up event listener
      offNotification(handleNewNotification);
    };
  }, [user, onNotification, offNotification, handleNewNotification]);

  // Handle clicking outside to close the popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    // Add event listener when popover is open
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // We now track unreadCount in state

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;

    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/notifications/mark-all-read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));

      // Reset unread count
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  };

  return (
    <div ref={popoverRef} className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full text-muted-foreground hover:bg-brand/10 hover:text-brand transition-colors duration-300"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-5 h-5 px-1 text-xs font-bold text-white bg-brand rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-border z-50">
          <div className="p-4 border-b border-border">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-adaptive-dark">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-brand hover:text-brand-dark flex items-center gap-1"
                >
                  <CheckCheck className="h-4 w-4" />
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading && notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground dark:text-neutral-400">
                Loading notifications...
              </div>
            ) : error ? (
              <div className="p-4 text-center text-error">
                {error}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground dark:text-neutral-400">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => {
                // Format the date as a relative time (e.g., "2 hours ago")
                const relativeTime = formatDistanceToNow(
                  new Date(notification.createdAt),
                  { addSuffix: true }
                );

                // Determine priority color
                const priorityColors = {
                  low: 'bg-secondary',
                  medium: 'bg-info/20',
                  high: 'bg-warning/20',
                  urgent: 'bg-error/20'
                };

                return (
                  <div
                    key={notification.notificationID}
                    className={cn(
                      "p-4 border-b border-border hover:bg-secondary transition-colors cursor-pointer",
                      !notification.isRead && "bg-secondary"
                    )}
                    onClick={async () => {
                      if (!notification.isRead) {
                        try {
                          const token = localStorage.getItem('token');
                          await axios.patch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/notifications/mark-read`, {
                            notificationIDs: [notification.notificationID]
                          }, {
                            headers: { Authorization: `Bearer ${token}` }
                          });

                          // Update local state
                          setNotifications(notifications.map(n =>
                            n.notificationID === notification.notificationID
                              ? { ...n, isRead: true }
                              : n
                          ));

                          // Update unread count
                          setUnreadCount(prev => Math.max(0, prev - 1));
                        } catch (err) {
                          console.error('Error marking notification as read:', err);
                        }
                      }

                      // Handle notification click based on type
                      if (notification.relatedJobID) {
                        window.location.href = `/jobs/${notification.relatedJobID}`;
                      } else if (notification.relatedApplicationID) {
                        window.location.href = `/applications`;
                      } else if (notification.relatedProfileID) {
                        // Determine profile type and redirect accordingly
                        // This would need more logic based on your app structure
                      } else if (notification.relatedMessageID) {
                        // Redirect to messages
                        if (user) {
                          window.location.href = `/${user.userType.toLowerCase()}/${user.userID}/messages`;
                        }
                      } else if (
                        notification.notificationType.includes('MEETING_') ||
                        (notification.metadata && notification.metadata.meetingID)
                      ) {
                        // Redirect to meetings page for any meeting-related notifications
                        window.location.href = '/meetings/meetings';
                      } else if (
                        notification.notificationType === 'PENDING_REGISTRATIONS' ||
                        (notification.metadata && notification.metadata.redirectUrl)
                      ) {
                        // Use the redirectUrl from metadata if available
                        const redirectUrl = notification.metadata?.redirectUrl || '/admin/registrations/pending';
                        window.location.href = redirectUrl;
                      }
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-brand rounded-full mr-2"></span>
                        )}
                        <h4 className={cn(
                          "text-sm font-medium",
                          notification.isRead ? "text-adaptive-dark" : "text-brand"
                        )}>
                          {notification.title}
                        </h4>
                      </div>
                      <span className="text-xs text-muted-foreground ml-2">{relativeTime}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>

                    {/* Priority indicator */}
                    <div className="mt-2 flex justify-between items-center">
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-full",
                        priorityColors[notification.priority] || 'bg-secondary-light'
                      )}>
                        {notification.notificationType.replace(/_/g, ' ').toLowerCase()}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}


