/**
 * Service for handling real-time notifications via WebSockets
 */
class NotificationSocketService {
  constructor(io) {
    this.io = io;
    this.userSockets = new Map(); // Map of userID -> socket.id
  }

  /**
   * Initialize socket event handlers
   */
  initialize() {
    this.io.on("connection", (socket) => {
      console.log("Socket connected:", socket.id);

      // Handle user authentication
      socket.on("authenticate", (userData) => {
        if (userData && userData.userID) {
          this.registerUser(userData.userID, socket.id);
          console.log(
            `User ${userData.userID} authenticated on socket ${socket.id}`
          );
        }
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        this.removeSocketFromUsers(socket.id);
        console.log("Socket disconnected:", socket.id);
      });
    });
  }

  /**
   * Register a user with their socket ID
   * @param {string} userID - The user ID
   * @param {string} socketID - The socket ID
   */
  registerUser(userID, socketID) {
    this.userSockets.set(userID.toString(), socketID);
  }

  /**
   * Remove a socket from the user map
   * @param {string} socketID - The socket ID to remove
   */
  removeSocketFromUsers(socketID) {
    for (const [userID, sid] of this.userSockets.entries()) {
      if (sid === socketID) {
        this.userSockets.delete(userID);
        console.log(`Removed user ${userID} with socket ${socketID}`);
        break;
      }
    }
  }

  /**
   * Send a notification to a specific user
   * @param {string} userID - The recipient user ID
   * @param {Object} notification - The notification object
   */
  sendNotificationToUser(userID, notification) {
    const socketID = this.userSockets.get(userID.toString());

    if (socketID) {
      this.io.to(socketID).emit("notification", notification);
      console.log(`Sent notification to user ${userID} on socket ${socketID}`);
      return true;
    } else {
      console.log(
        `User ${userID} not connected, notification not sent in real-time`
      );
      return false;
    }
  }

  /**
   * Send a notification to multiple users
   * @param {Array<string>} userIDs - Array of recipient user IDs
   * @param {Object} notification - The notification object
   * @returns {Array<string>} - Array of user IDs that received the notification
   */
  sendNotificationToUsers(userIDs, notification) {
    const sentTo = [];

    for (const userID of userIDs) {
      if (this.sendNotificationToUser(userID, notification)) {
        sentTo.push(userID);
      }
    }

    return sentTo;
  }

  /**
   * Send a notification to all users with a specific role
   * @param {string} role - The user role (Admin, Student, Counselor, Company)
   * @param {Object} notification - The notification object
   */
  sendNotificationToRole(role, notification) {
    // This would require maintaining a map of roles to user IDs
    // For simplicity, we'll broadcast to all users and let the client filter
    this.io.emit("notification", {
      ...notification,
      targetRole: role,
    });

    console.log(`Broadcast notification to all users with role ${role}`);
  }

  /**
   * Send a notification to all connected users
   * @param {Object} notification - The notification object
   */
  broadcastNotification(notification) {
    this.io.emit("notification", notification);
    console.log("Broadcast notification to all users");
  }

  /**
   * Update unread count for a user
   * @param {string} userID - The user ID
   * @param {number} count - The new unread count
   */
  updateUnreadCount(userID, count) {
    const socketID = this.userSockets.get(userID.toString());

    if (socketID) {
      this.io.to(socketID).emit("unread_count", { count });
      console.log(`Updated unread count for user ${userID}: ${count}`);
      return true;
    }

    return false;
  }

  /**
   * Send admin dashboard update to all admin users
   * @param {Object} data - The update data
   * @param {Array<number>} adminUserIds - Array of admin user IDs (optional)
   */
  sendAdminDashboardUpdate(data, adminUserIds = []) {
    // Check if we've sent a similar update recently
    const now = Date.now();
    const updateType = data.type || 'general_update';

    // Initialize the update tracking if it doesn't exist
    if (!this.lastUpdateTimes) {
      this.lastUpdateTimes = new Map();
    }

    // Check if we've sent this type of update recently (within 5 seconds)
    const lastUpdateTime = this.lastUpdateTimes.get(updateType) || 0;
    const UPDATE_THROTTLE_MS = 5000; // 5 seconds

    if (now - lastUpdateTime < UPDATE_THROTTLE_MS) {
      // Skip this update as it's too soon after the last one
      console.log(`Skipping ${updateType} update (throttled)`);
      return false;
    }

    // Update the last update time for this type
    this.lastUpdateTimes.set(updateType, now);

    // If specific admin IDs are provided, send only to those admins
    if (adminUserIds.length > 0) {
      for (const adminId of adminUserIds) {
        const socketID = this.userSockets.get(adminId.toString());
        if (socketID) {
          this.io.to(socketID).emit("admin_dashboard_update", data);
          console.log(`Sent admin dashboard update to admin ${adminId}`);
        }
      }
    } else {
      // Otherwise broadcast to all connected users (client-side filtering will occur)
      this.io.emit("admin_dashboard_update", {
        ...data,
        targetRole: "Admin",
        timestamp: now
      });
      console.log(`Broadcast ${updateType} update to all admins`);
    }

    return true;
  }
}

module.exports = NotificationSocketService;
