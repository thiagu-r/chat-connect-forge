import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, MoreVertical, Phone, Video, Check, CheckCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useApi } from '@/hooks/useApi';
import { MESSAGES_ENDPOINTS, MessagesResponse, Message } from '@/lib/messages';

interface ChatWindowProps {
  contactId?: number;
  contactName?: string;
  contactPhone?: string;
  isOnline?: boolean;
}

// Helper function to format timestamp
const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Helper function to get status icon
const getStatusIcon = (status: string, isFromUser: boolean) => {
  if (isFromUser) return null; // Only show status for admin messages (is_from_user = false)
  
  switch (status) {
    case 'sending':
    case 'sent':
      return <Check className="h-4 w-4 text-gray-400" />;
    case 'delivered':
      return <CheckCheck className="h-4 w-4 text-gray-400" />;
    case 'read':
      return <CheckCheck className="h-4 w-4 text-blue-500" />;
    case 'failed':
      return <span className="text-red-500">✗</span>;
    default:
      return null;
  }
};

// Helper function to get status time
const getStatusTime = (message: Message) => {
  if (message.status === 'read' && message.read_at) {
    return formatTimestamp(message.read_at);
  } else if (message.status === 'delivered' && message.delivered_at) {
    return formatTimestamp(message.delivered_at);
  } else {
    return formatTimestamp(message.created_at);
  }
};

// Helper function to format date for grouping
const formatDateForGrouping = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  
  // Reset time to start of day for accurate comparison
  const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const nowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const diffTime = nowStart.getTime() - dateStart.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  console.log('Date grouping debug:', {
    timestamp,
    date: date.toISOString(),
    dateStart: dateStart.toISOString(),
    nowStart: nowStart.toISOString(),
    diffDays,
    result: diffDays === 0 ? 'Today' : diffDays === 1 ? 'Yesterday' : 'Other'
  });
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays <= 7) {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }
};

// Helper function to group messages by date
const groupMessagesByDate = (messages: Message[]) => {
  const groups: { [key: string]: Message[] } = {};
  
  messages.forEach(message => {
    // Use created_at for more accurate date grouping
    const dateKey = formatDateForGrouping(message.created_at);
    
    // Debug logging for date grouping
    console.log('Message grouping:', {
      id: message.id,
      timestamp: message.timestamp,
      created_at: message.created_at,
      dateKey: dateKey,
      content: message.content.substring(0, 20) + '...'
    });
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(message);
  });
  
  // Sort messages within each group by created_at (oldest first)
  Object.keys(groups).forEach(dateKey => {
    groups[dateKey].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  });
  
  return groups;
};

export function ChatWindow({ contactId, contactName = 'Select a contact', contactPhone, isOnline }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { useAuthenticatedQuery } = useApi();

  // Track contact selection count to force cache invalidation
  const [contactSelectionCount, setContactSelectionCount] = useState(0);

  // Fetch messages from API
  const { data: messagesData, isLoading, error, refetch } = useAuthenticatedQuery<MessagesResponse>(
    ['messages', contactId?.toString() || '', currentPage.toString(), contactSelectionCount.toString()],
    contactId ? MESSAGES_ENDPOINTS.GET_MESSAGES(contactId, currentPage, 10) : '',
    {
      enabled: !!contactId,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Debug logging
  useEffect(() => {
    if (contactId) {
      const endpoint = MESSAGES_ENDPOINTS.GET_MESSAGES(contactId, currentPage, 10);
      console.log('ChatWindow Debug:', {
        contactId,
        currentPage,
        endpoint,
        messagesCount: messages.length,
        messagesDataCount: messagesData?.messages?.length || 0,
        messagesData: messagesData,
        isLoading,
        error: error?.message
      });
    }
  }, [contactId, currentPage, messages.length, messagesData, isLoading, error]);

  // Update messages when data changes
  useEffect(() => {
    console.log('MessagesData received:', messagesData);
    
    if (messagesData) {
      // Check if messages array exists and is valid
      const messagesArray = messagesData.messages || [];
      console.log('Messages array:', messagesArray);
      
      if (currentPage === 1) {
        console.log('Setting messages for page 1:', messagesArray.length);
        setMessages(messagesArray);
      } else {
        console.log('Prepending older messages for page', currentPage, ':', messagesArray.length);
        // Prepend older messages to the beginning (they come first chronologically)
        setMessages(prev => [...messagesArray, ...prev]);
      }
      setIsLoadingMore(false);
    }
  }, [messagesData, currentPage]);

  // Debug messages state changes
  useEffect(() => {
    console.log('Messages state changed:', messages.length, messages);
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to bottom when new messages are added (first page)
  useEffect(() => {
    if (currentPage === 1) {
      scrollToBottom();
    }
    // For older messages (currentPage > 1), maintain scroll position
  }, [messages, currentPage]);

  // Scroll to bottom when initial messages are loaded
  useEffect(() => {
    if (messages.length > 0 && currentPage === 1) {
      scrollToBottom();
    }
    // For older messages (currentPage > 1), scroll position is maintained automatically
  }, [messages.length, currentPage]);

  // Handle load older messages button click
  const handleLoadOlderMessages = () => {
    if (!messagesData?.pagination || isLoadingMore) return;
    
    if (messagesData.pagination.has_next) {
      setIsLoadingMore(true);
      setCurrentPage(prev => prev + 1);
    }
  };

  // Track scroll position for fallback button
  const [showFallbackButton, setShowFallbackButton] = useState(false);

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop } = messagesContainerRef.current;
    const shouldShowButton = scrollTop < 100; // Increased threshold for better UX
    setShowFallbackButton(shouldShowButton);
  };

  // Add scroll listener for fallback button
  useEffect(() => {
    const scrollContainer = messagesContainerRef.current;
    
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      
      // Check initial scroll position
      handleScroll();
      
      return () => {
        scrollContainer.removeEventListener('scroll', handleScroll);
      };
    }
  }, [messagesData]); // Re-run when messages data changes

  // Track previous contactId to detect actual changes
  const [prevContactId, setPrevContactId] = useState<number | undefined>();

  // Handle contact selection
  useEffect(() => {
    if (contactId) {
      console.log('Contact selected:', contactId);
      setPrevContactId(contactId);
      setCurrentPage(1);
      setMessages([]);
      setIsLoadingMore(false);
      // Increment selection count to force cache invalidation
      setContactSelectionCount(prev => prev + 1);
    }
  }, [contactId]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !contactId) return;

    // TODO: Implement send message API call
    console.log('Sending message:', newMessage);
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
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading && (
          <div className="flex justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading messages...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="flex justify-center">
            <div className="text-center text-red-600">
              <p>Error loading messages: {error.message}</p>
            </div>
          </div>
        )}

        {/* Load Old Messages Button - Only visible when scrolling to top */}
        {showFallbackButton && messagesData?.pagination?.has_next && !isLoading && !error && (
          <div className="flex justify-center p-2">
            <Button
              onClick={handleLoadOlderMessages}
              disabled={isLoadingMore}
              variant="ghost"
              size="sm"
              className="text-xs"
            >
              {isLoadingMore ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                  Loading older messages...
                </>
              ) : (
                'Load Old Messages'
              )}
            </Button>
          </div>
        )}

        {/* Loading indicator for older messages */}
        {isLoadingMore && (
          <div className="flex justify-center">
            <div className="text-center">
              <div className="inline-flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                <span className="text-sm text-muted-foreground">Loading older messages...</span>
              </div>
            </div>
          </div>
        )}


        
        {(() => {
          const groupedMessages = groupMessagesByDate(messages);
          
          // Sort date groups in chronological order (oldest first)
          const sortedDateKeys = Object.keys(groupedMessages).sort((a, b) => {
            // Convert date keys back to actual dates for comparison
            const getDateFromKey = (key: string) => {
              if (key === 'Today') return new Date();
              if (key === 'Yesterday') {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                return yesterday;
              }
              // For weekday names, find the most recent occurrence
              const now = new Date();
              const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
              const dayIndex = dayNames.indexOf(key);
              if (dayIndex !== -1) {
                const daysSince = (now.getDay() - dayIndex + 7) % 7;
                const targetDate = new Date();
                targetDate.setDate(now.getDate() - daysSince);
                return targetDate;
              }
              // For other dates, try to parse them
              return new Date(key);
            };
            
            return getDateFromKey(a).getTime() - getDateFromKey(b).getTime();
          });
          
          return sortedDateKeys.map((dateKey) => {
            const dateMessages = groupedMessages[dateKey];
            return (
            <div key={dateKey} className="space-y-4">
              {/* Date Header */}
              <div className="flex justify-center">
                <div className="bg-muted/50 text-muted-foreground text-xs px-3 py-1 rounded-full">
                  {dateKey}
                </div>
              </div>
              
              {/* Messages for this date */}
              {dateMessages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.is_from_user ? "justify-start" : "justify-end"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg",
                      message.is_from_user
                        ? "bg-message-received text-foreground border border-border"
                        : "bg-message-sent text-foreground"
                    )}
                  >
                    <div className="text-sm">
                      {message.message_type === 'text' && (
                        <p>{message.content}</p>
                      )}
                      {message.message_type === 'template' && (
                        <div>
                          <p className="font-semibold text-xs mb-1">Template: {message.template_name}</p>
                          <p>{message.content}</p>
                        </div>
                      )}
                      {message.message_type === 'flow' && message.is_from_user && (
                        <div>
                          <p className="font-semibold text-xs mb-1">Flow Response</p>
                          <p>{message.content}</p>
                          {message.flow_responses.length > 0 && (
                            <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                              <p className="font-semibold">{message.flow_responses[0].flow_name}</p>
                              <p>{message.flow_responses[0].screen_title}</p>
                            </div>
                          )}
                        </div>
                      )}
                      {message.message_type === 'flow' && !message.is_from_user && (
                        <p>{message.content}</p>
                      )}
                    </div>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-xs text-muted-foreground">{getStatusTime(message)}</span>
                      {getStatusIcon(message.status, message.is_from_user)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        });
        })()}
        
        {/* Show no messages only if we have no messages and are not loading */}
        {messages.length === 0 && !isLoading && !error && (
          <div className="flex justify-center items-center h-full">
            <div className="text-center text-muted-foreground">
              <p>No messages found</p>
              <p className="text-sm">Start a conversation with this contact</p>
              {messagesData && (
                <p className="text-xs mt-2">Debug: API returned {messagesData.messages?.length || 0} messages, but state has {messages.length}</p>
              )}
            </div>
          </div>
        )}
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

export default ChatWindow;