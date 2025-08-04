import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, MoreVertical, Phone, Video } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  text: string;
  timestamp: string;
  isOutgoing: boolean;
  status: 'sent' | 'delivered' | 'read';
}

interface ChatWindowProps {
  contactId?: string;
  contactName?: string;
  contactPhone?: string;
  isOnline?: boolean;
}

// Mock messages for demonstration
const mockMessages: Message[] = [
  {
    id: '1',
    text: 'Hello! I\'m interested in your services.',
    timestamp: '10:30 AM',
    isOutgoing: false,
    status: 'read',
  },
  {
    id: '2',
    text: 'Hi! Thanks for reaching out. I\'d be happy to help you with information about our services.',
    timestamp: '10:32 AM',
    isOutgoing: true,
    status: 'read',
  },
  {
    id: '3',
    text: 'Great! Can you tell me more about your pricing plans?',
    timestamp: '10:35 AM',
    isOutgoing: false,
    status: 'read',
  },
  {
    id: '4',
    text: 'Absolutely! We have three main plans: Basic ($29/month), Professional ($79/month), and Enterprise ($199/month). Each plan includes different features and support levels.',
    timestamp: '10:36 AM',
    isOutgoing: true,
    status: 'delivered',
  },
  {
    id: '5',
    text: 'That sounds perfect. Can we schedule a call to discuss this further?',
    timestamp: '10:40 AM',
    isOutgoing: false,
    status: 'read',
  },
];

export function ChatWindow({ contactId, contactName = 'Select a contact', contactPhone, isOnline }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(contactId ? mockMessages : []);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !contactId) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOutgoing: true,
      status: 'sent',
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!contactId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-chat-bg">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">WhatsApp CRM</h2>
          <p className="text-muted-foreground">Select a contact to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-chat-bg">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 bg-background border-b border-border">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-whatsapp-green text-white">
              {contactName.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-foreground">{contactName}</h2>
            <p className="text-sm text-muted-foreground">
              {isOnline ? 'Online' : `Last seen recently • ${contactPhone}`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.isOutgoing ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg",
                message.isOutgoing
                  ? "bg-message-sent text-foreground"
                  : "bg-message-received text-foreground border border-border"
              )}
            >
              <p className="text-sm">{message.text}</p>
              <div className="flex items-center justify-end gap-1 mt-1">
                <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                {message.isOutgoing && (
                  <div className="text-xs text-muted-foreground">
                    {message.status === 'sent' && '✓'}
                    {message.status === 'delivered' && '✓✓'}
                    {message.status === 'read' && <span className="text-whatsapp-green">✓✓</span>}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 bg-background border-t border-border">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Paperclip className="h-5 w-5" />
          </Button>
          
          <div className="flex-1 flex items-center bg-input border border-border rounded-lg">
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 px-3 py-2 bg-transparent border-none focus:outline-none"
            />
            <Button variant="ghost" size="icon">
              <Smile className="h-5 w-5" />
            </Button>
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="bg-whatsapp-green hover:bg-whatsapp-green-hover text-white"
            size="icon"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}