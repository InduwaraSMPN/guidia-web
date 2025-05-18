import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface Notification {
  notificationID: number;
  userID: number;
  notificationType: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  targetUserRole?: string;
  relatedJobID?: number;
  relatedUserID?: number;
  relatedApplicationID?: number;
  relatedProfileID?: number;
  relatedMessageID?: number;
  metadata?: any;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onNotification: (callback: (notification: Notification) => void) => void;
  offNotification: (callback: (notification: Notification) => void) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  onNotification: () => {},
  offNotification: () => {}
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    // Create socket connection
    const newSocket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001', {
      auth: { token }
    });

    // Authenticate with user ID for notifications
    newSocket.emit('authenticate', { userID: user.id });

    // Set up event listeners
    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    setSocket(newSocket);

    // Clean up on unmount
    return () => {
      console.log('Cleaning up socket connection');
      newSocket.disconnect();
    };
  }, [user]);

  // Notification event handlers
  const onNotification = useCallback((callback: (notification: Notification) => void) => {
    if (!socket) return;
    socket.on('notification', callback);
  }, [socket]);

  const offNotification = useCallback((callback: (notification: Notification) => void) => {
    if (!socket) return;
    socket.off('notification', callback);
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, onNotification, offNotification }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
