import React, { createContext, useContext, useEffect, useState } from 'react';
import { websocketService, WebSocketMessage } from '@/lib/websocket';
import { useAuth } from './AuthContext';

interface WebSocketContextType {
  isConnected: boolean;
  lastMessage: WebSocketMessage | null;
}

const WebSocketContext = createContext<WebSocketContextType>({
  isConnected: false,
  lastMessage: null,
});

export const useWebSocket = () => useContext(WebSocketContext);

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      websocketService.disconnect();
      setIsConnected(false);
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) return;

    websocketService.connect(token, {
      onConnect: () => {
        console.log('WebSocket connected in context');
        setIsConnected(true);
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected in context');
        setIsConnected(false);
      },
      onError: (error) => {
        console.error('WebSocket error in context:', error);
        setIsConnected(false);
      },
      onMessageStatusUpdate: (data) => {
        console.log('Message status update received:', data);
        setLastMessage(data);
        // You can emit custom events here for components to listen to
        window.dispatchEvent(new CustomEvent('messageStatusUpdate', { detail: data }));
      },
      onContactUpdate: (data) => {
        console.log('Contact update received:', data);
        setLastMessage(data);
        window.dispatchEvent(new CustomEvent('contactUpdate', { detail: data }));
      },
      onNewMessage: (data) => {
        console.log('New message received:', data);
        setLastMessage(data);
        window.dispatchEvent(new CustomEvent('newMessage', { detail: data }));
      },
    });

    return () => {
      websocketService.disconnect();
    };
  }, [isAuthenticated]);

  return (
    <WebSocketContext.Provider value={{ isConnected, lastMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
}; 