export interface WebSocketMessage {
  contact_id?: number;
  message_id?: string;
  contact_name?: string;
  phone_number?: string;
  content?: string;
  media_url?: string;
  is_from_user?: boolean;
  timestamp?: string;
  message_type?: string;
  delivered_at?: string | null;
  read_at?: string | null;
  status?: string;
  event_type?: string | null;
  id?: number;
  name?: string;
  last_message?: {
    message_id: string;
    content: string;
    timestamp: string;
    status: string;
    delivered_at: string | null;
    read_at: string | null;
  };
}

export interface WebSocketCallbacks {
  onMessageStatusUpdate?: (data: WebSocketMessage) => void;
  onContactUpdate?: (data: WebSocketMessage) => void;
  onNewMessage?: (data: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private callbacks: WebSocketCallbacks = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(token: string, callbacks: WebSocketCallbacks) {
    this.callbacks = callbacks;
    
    try {
      this.ws = new WebSocket(`wss://wp.dev-api.medyaan.com/ws/contacts/?token=${token}`);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.callbacks.onConnect?.();
      };

      this.ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.callbacks.onDisconnect?.();
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.callbacks.onError?.(error);
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
    }
  }

  private handleMessage(data: WebSocketMessage) {
    console.log('Handling WebSocket message:', {
      event_type: data.event_type,
      contact_id: data.contact_id,
      message_id: data.message_id,
      id: data.id,
      name: data.name
    });

    if (data.event_type === 'message_status_update') {
      // Check if this is actually a new message with status update
      if (data.contact_id && data.message_id && data.content) {
        // This is a new message that also includes status info
        console.log('Treating message_status_update as new message');
        this.callbacks.onNewMessage?.(data);
      } else {
        // This is just a status update for an existing message
        console.log('Treating as message status update only');
        this.callbacks.onMessageStatusUpdate?.(data);
      }
    } else if (data.event_type === null && data.id && data.name) {
      // Handle contact update (last message update)
      console.log('Treating as contact update');
      this.callbacks.onContactUpdate?.(data);
    } else if (data.event_type === null && data.contact_id && data.message_id) {
      // Handle new message
      console.log('Treating as new message');
      this.callbacks.onNewMessage?.(data);
    } else {
      console.log('Unknown message type, treating as new message if it has contact_id and message_id');
      if (data.contact_id && data.message_id) {
        this.callbacks.onNewMessage?.(data);
      }
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        if (this.ws?.readyState === WebSocket.CLOSED) {
          // Get token from localStorage and reconnect
          const token = localStorage.getItem('access_token');
          if (token) {
            this.connect(token, this.callbacks);
          }
        }
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const websocketService = new WebSocketService(); 