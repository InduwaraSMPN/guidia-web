import { useState, useRef, useEffect } from 'react';
import { CheckCheck, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

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
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications when the component mounts or user changes
  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const token = localStorage.getItem('token');

        const response = await axios.get('/api/notifications', {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 20 }
        });

        setNotifications(response.data);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();

    // Set up polling for new notifications (every 30 seconds)
    const intervalId = setInterval(fetchNotifications, 30000);

    return () => clearInterval(intervalId);
  }, [user]);

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

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;

    try {
      const token = localStorage.getItem('token');
      await axios.patch('/api/notifications/mark-all-read', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  };

  return (
    <div ref={popoverRef} className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full text-neutral-600 hover:bg-rose-100 hover:text-rose-800 transition-colors duration-300"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-5 h-5 px-1 text-xs font-bold text-white bg-[#800020] rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-[#800020] hover:text-rose-800 flex items-center gap-1"
                >
                  <CheckCheck className="h-4 w-4" />
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading && notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Loading notifications...
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">
                {error}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
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
                  low: 'bg-gray-100',
                  medium: 'bg-blue-100',
                  high: 'bg-orange-100',
                  urgent: 'bg-red-100'
                };

                return (
                  <div
                    key={notification.notificationID}
                    className={cn(
                      "p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer",
                      !notification.isRead && "bg-gray-50"
                    )}
                    onClick={async () => {
                      if (!notification.isRead) {
                        try {
                          const token = localStorage.getItem('token');
                          await axios.patch('/api/notifications/mark-read', {
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
                      }
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-[#800020] rounded-full mr-2"></span>
                        )}
                        <h4 className={cn(
                          "text-sm font-medium",
                          notification.isRead ? "text-gray-900" : "text-[#800020]"
                        )}>
                          {notification.title}
                        </h4>
                      </div>
                      <span className="text-xs text-gray-500 ml-2">{relativeTime}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>

                    {/* Priority indicator */}
                    <div className="mt-2 flex justify-between items-center">
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-full",
                        priorityColors[notification.priority] || 'bg-gray-100'
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