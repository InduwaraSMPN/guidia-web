import { useState, useCallback, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { useDropdown } from '@/contexts/DropdownContext';
import { NotificationsDropdown } from './NotificationsDropdown';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import axios from 'axios';

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
  const { activeDropdown, setActiveDropdown } = useDropdown();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Handle receiving a new notification via WebSocket
  const handleNewNotification = useCallback((notification: Notification) => {
    // Show toast notification
    toast(notification.title, {
      description: notification.message,
      duration: 5000,
    });

    // Update unread count
    setUnreadCount(count => count + 1);
  }, []);

  // Fetch initial unread count
  useEffect(() => {
    if (!user) return;

    const fetchUnreadCount = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 20 }
        });

        // Count unread notifications
        const notificationsData = response.data as Array<{ isRead: boolean }>;
        const unreadNotifications = notificationsData.filter(n => !n.isRead);
        setUnreadCount(unreadNotifications.length);
      } catch (err) {
        console.error('Error fetching unread count:', err);
      }
    };

    fetchUnreadCount();
  }, [user]);

  // Register for real-time notifications
  useEffect(() => {
    if (!user) return;

    onNotification(handleNewNotification);

    return () => {
      offNotification(handleNewNotification);
    };
  }, [user, onNotification, offNotification, handleNewNotification]);

  // This component now handles the unread count directly

  // Create a reference to track if we're hovering on the dropdown
  const [isHoveringDropdown, setIsHoveringDropdown] = useState(false);

  // Function to handle mouse enter on the notification icon
  const handleMouseEnter = () => {
    // If another dropdown is open, close it
    if (activeDropdown && !activeDropdown.includes('Notifications')) {
      setActiveDropdown(null);
    }
    // Open this dropdown on hover
    setActiveDropdown("navbar-Notifications");
  };

  // Function to handle mouse leave on the notification icon
  const handleMouseLeave = () => {
    // Don't close if we're hovering over the dropdown
    if (!isHoveringDropdown) {
      // Add a small delay before closing to allow moving to the dropdown
      setTimeout(() => {
        if (!isHoveringDropdown) {
          setActiveDropdown(null);
        }
      }, 300);
    }
  };

  // Function to handle mouse enter on the dropdown
  const handleDropdownMouseEnter = () => {
    setIsHoveringDropdown(true);
  };

  // Function to handle mouse leave on the dropdown
  const handleDropdownMouseLeave = () => {
    setIsHoveringDropdown(false);
    // Add a small delay before closing
    setTimeout(() => {
      if (!isHoveringDropdown) {
        setActiveDropdown(null);
      }
    }, 300);
  };

  return (
    <div
      className="relative"
      onClick={(e) => e.stopPropagation()}
      data-dropdown-trigger="notifications"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Notification Bell with Badge - Original Styling */}
      <button
        className="relative p-2 rounded-full text-muted-foreground hover:bg-brand/10 hover:text-brand transition-colors duration-300"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-5 h-5 px-1 text-xs font-bold text-white bg-brand rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Invisible hover path between button and dropdown */}
      {activeDropdown === "navbar-Notifications" && (
        <div
          className="absolute left-1/2 transform -translate-x-1/2 h-8 w-16 top-full z-40"
          onMouseEnter={() => setIsHoveringDropdown(true)}
        />
      )}

      {/* Dropdown Content with Animation */}
      {activeDropdown === "navbar-Notifications" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute right-0 mt-2 z-50"
          data-dropdown-content="Notifications"
          onMouseEnter={handleDropdownMouseEnter}
          onMouseLeave={handleDropdownMouseLeave}
        >
          <NotificationsDropdown onUpdateUnreadCount={setUnreadCount} />
        </motion.div>
      )}
    </div>
  );
}

