import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, MoreVertical, Phone, Video, Check, CheckCheck, ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useApi } from '@/hooks/useApi';
import { MESSAGES_ENDPOINTS, MessagesResponse, Message, ReplyToInfo } from '@/lib/messages';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { sendTextMessage } from '@/lib/api';
import { TemplateSelector } from './TemplateSelector';

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
  // Always use the message timestamp for display to maintain consistency
  return formatTimestamp(message.timestamp);
};

// Helper function to format message content with newlines
const formatMessageContent = (content: string) => {
  const lines = content.split('\n');
  return lines.map((line, index) => (
    <span key={index}>
      {line}
      {index < lines.length - 1 && <br />}
    </span>
  ));
};

// Component to display reply-to message
const ReplyToMessage = ({ replyToInfo }: { replyToInfo: ReplyToInfo }) => {
  return (
    <div className="bg-muted/30 rounded-t-lg p-2 mb-1 border-l-4 border-whatsapp-green">
      <div className="text-xs text-muted-foreground mb-1">
        {replyToInfo.is_from_user ? 'You' : replyToInfo.contact_name}
      </div>
      <div className="text-xs truncate">
        {replyToInfo.content.length > 50 
          ? `${replyToInfo.content.substring(0, 50)}...` 
          : replyToInfo.content
        }
      </div>
    </div>
  );
};

// Helper function to format date for grouping
const formatDateForGrouping = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  
  // Get local date components (not UTC)
  const dateYear = date.getFullYear();
  const dateMonth = date.getMonth();
  const dateDay = date.getDate();
  
  const nowYear = now.getFullYear();
  const nowMonth = now.getMonth();
  const nowDay = now.getDate();
  
  // Create local dates for comparison
  const dateStart = new Date(dateYear, dateMonth, dateDay);
  const nowStart = new Date(nowYear, nowMonth, nowDay);
  
  const diffTime = nowStart.getTime() - dateStart.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  // Only log date grouping for debugging specific issues
  // console.log('Date grouping debug:', {
  //   timestamp,
  //   date: date.toISOString(),
  //   dateLocal: `${dateYear}-${dateMonth + 1}-${dateDay}`,
  //   nowLocal: `${nowYear}-${nowMonth + 1}-${nowDay}`,
  //   dateStart: dateStart.toISOString(),
  //   nowStart: nowStart.toISOString(),
  //   diffDays,
  //   result: diffDays === 0 ? 'Today' : diffDays === 1 ? 'Yesterday' : diffDays <= 7 ? date.toLocaleDateString('en-US', { weekday: 'long' }) : 'Other'
  // });
  
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
      year: dateYear !== nowYear ? 'numeric' : undefined
    });
  }
};

// Helper function to group messages by date
const groupMessagesByDate = (messages: Message[]) => {
  const groups: { [key: string]: Message[] } = {};
  
  // console.log('Grouping messages by date:', messages.length, 'messages');
  
  messages.forEach(message => {
    // Use timestamp for more accurate date grouping
    const dateKey = formatDateForGrouping(message.timestamp);
    // console.log('Message grouping:', {
    //   id: message.id,
    //   content: message.content.substring(0, 20),
    //   timestamp: message.timestamp,
    //   dateKey: dateKey
    // });
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(message);
  });
  
  // Sort messages within each group by timestamp (oldest first)
  Object.keys(groups).forEach(dateKey => {
    groups[dateKey].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    // console.log(`Messages in group "${dateKey}":`, groups[dateKey].length);
  });
  
  return groups;
};

export function ChatWindow({ contactId, contactName = 'Select a contact', contactPhone, isOnline }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [messageType, setMessageType] = useState<'text' | 'template'>('text');
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { useAuthenticatedQuery } = useApi();
  const { isConnected } = useWebSocket();

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
      
      // The API returns messages in reverse chronological order (newest first)
      // We need to reverse them to get chronological order (oldest first)
      const chronologicalMessages = [...messagesArray].reverse();
      
      if (currentPage === 1) {
        console.log('Setting messages for page 1:', chronologicalMessages.length);
        setMessages(chronologicalMessages);
      } else {
        console.log('Prepending older messages for page', currentPage, ':', chronologicalMessages.length);
        // Prepend older messages to the beginning (they come first chronologically)
        setMessages(prev => [...chronologicalMessages, ...prev]);
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

  // State for new message notification
  const [showNewMessageNotification, setShowNewMessageNotification] = useState(false);

  // WebSocket event listeners for real-time updates
  useEffect(() => {
    console.log('Setting up WebSocket event listeners for contact:', contactId);
    
    const handleNewMessage = (event: CustomEvent) => {
      console.log('WebSocket: New message event received:', event.detail);
      const data = event.detail;
      if (data.contact_id === contactId) {
        // Check if message already exists to prevent duplicates
        setMessages(prev => {
          const messageExists = prev.some(msg => msg.message_id === data.message_id);
          if (messageExists) {
            console.log('Message already exists, skipping duplicate:', data.message_id);
            return prev; // Return previous state unchanged
          }

          // Add new message to the end of the list
          const newMessage: Message = {
            id: Date.now(), // Temporary ID
            contact_name: data.contact_name || '',
            contact_phone: data.phone_number || '',
            flow_responses: [],
            template_name: null,
            template_components: null,
            reply_to_info: null,
            message_id: data.message_id || '',
            content: data.content || '',
            message_type: data.message_type || 'text',
            is_from_user: data.is_from_user || false,
            status: data.status || 'sent',
            timestamp: data.timestamp || '',
            delivered_at: data.delivered_at,
            read_at: data.read_at,
            media_url: data.media_url || '',
            metadata: {},
            created_at: data.timestamp || '',
            iu_id: null,
            contact: contactId || 0,
            reply_to: null,
            template: null,
            flow: null,
          };

          console.log('Adding new message from WebSocket:', newMessage.message_id);
          return [...prev, newMessage];
        });
        scrollToBottom();
      }
    };

    const handleNewMessageForSelectedContact = (event: CustomEvent) => {
      console.log('WebSocket: New message for selected contact event received:', event.detail);
      const data = event.detail;
      if (data.contact_id === contactId) {
        // Check if message already exists to prevent duplicates
        setMessages(prev => {
          const messageExists = prev.some(msg => msg.message_id === data.message_id);
          if (messageExists) {
            console.log('Message already exists, skipping duplicate:', data.message_id);
            return prev; // Return previous state unchanged
          }

          // Add new message to the end of the list
          const newMessage: Message = {
            id: Date.now(), // Temporary ID
            contact_name: data.contact_name || '',
            contact_phone: data.phone_number || '',
            flow_responses: [],
            template_name: null,
            template_components: null,
            reply_to_info: null,
            message_id: data.message_id || '',
            content: data.content || '',
            message_type: data.message_type || 'text',
            is_from_user: data.is_from_user || false,
            status: data.status || 'sent',
            timestamp: data.timestamp || '',
            delivered_at: data.delivered_at,
            read_at: data.read_at,
            media_url: data.media_url || '',
            metadata: {},
            created_at: data.timestamp || '',
            iu_id: null,
            contact: contactId || 0,
            reply_to: null,
            template: null,
            flow: null,
          };

          console.log('Adding new message for selected contact:', newMessage.message_id);
          return [...prev, newMessage];
        });
        
        // Show "New Message" notification
        setShowNewMessageNotification(true);
        
        // Auto-hide notification after 3 seconds
        setTimeout(() => {
          setShowNewMessageNotification(false);
        }, 3000);
        
        scrollToBottom();
      }
    };

    const handleMessageStatusUpdate = (event: CustomEvent) => {
      console.log('WebSocket: Message status update event received:', event.detail);
      const data = event.detail;
      if (data.contact_id === contactId) {
        console.log('Updating message status for message_id:', data.message_id, 'new status:', data.status);
        // Update message status
        setMessages(prev => {
          const updated = prev.map(message => {
            if (message.message_id === data.message_id) {
              console.log('Found message to update:', message.id, 'old status:', message.status, 'new status:', data.status);
              return {
                ...message,
                status: data.status || message.status,
                delivered_at: data.delivered_at,
                read_at: data.read_at,
              };
            }
            return message;
          });
          console.log('Updated messages count:', updated.length);
          return updated;
        });
      }
    };

    // Add event listeners
    console.log('Adding WebSocket event listeners...');
    window.addEventListener('newMessage', handleNewMessage as EventListener);
    window.addEventListener('newMessageForSelectedContact', handleNewMessageForSelectedContact as EventListener);
    window.addEventListener('messageStatusUpdate', handleMessageStatusUpdate as EventListener);
    console.log('WebSocket event listeners added successfully');

    return () => {
      console.log('Removing WebSocket event listeners...');
      window.removeEventListener('newMessage', handleNewMessage as EventListener);
      window.removeEventListener('newMessageForSelectedContact', handleNewMessageForSelectedContact as EventListener);
      window.removeEventListener('messageStatusUpdate', handleMessageStatusUpdate as EventListener);
      console.log('WebSocket event listeners removed');
    };
  }, [contactId]);

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

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !contactId) return;

    setIsSendingMessage(true);
    
    try {
      const response = await sendTextMessage(contactId, newMessage.trim());
      console.log('Message sent successfully:', response);
      
      // Add the sent message to the messages list
      const sentMessage: Message = {
        id: response.id,
        contact_name: response.contact_name,
        contact_phone: response.contact_phone,
        flow_responses: response.flow_responses || [],
        template_name: response.template_name,
        template_components: response.template_components,
        reply_to_info: response.reply_to_info,
        message_id: response.message_id,
        content: response.content,
        message_type: response.message_type,
        is_from_user: response.is_from_user,
        status: response.status,
        timestamp: response.timestamp,
        delivered_at: response.delivered_at,
        read_at: response.read_at,
        media_url: response.media_url,
        metadata: response.metadata,
        created_at: response.created_at,
        iu_id: response.iu_id,
        contact: response.contact,
        reply_to: response.reply_to,
        template: response.template,
        flow: response.flow,
      };

      console.log('Adding sent message to chat:', sentMessage.message_id);
      setMessages(prev => {
        // Check if message already exists to prevent duplicates
        const messageExists = prev.some(msg => msg.message_id === sentMessage.message_id);
        if (messageExists) {
          console.log('Sent message already exists, skipping duplicate:', sentMessage.message_id);
          return prev;
        }
        return [...prev, sentMessage];
      });
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Failed to send message:', error);
      // TODO: Show error toast/notification
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleTemplateMessageSent = (response: Message) => {
    console.log('Template message sent successfully:', response);
    
    // Add the sent template message to the messages list
    const sentMessage: Message = {
      id: response.id,
      contact_name: response.contact_name,
      contact_phone: response.contact_phone,
      flow_responses: response.flow_responses || [],
      template_name: response.template_name,
      template_components: response.template_components,
      reply_to_info: response.reply_to_info,
      message_id: response.message_id,
      content: response.content,
      message_type: response.message_type,
      is_from_user: response.is_from_user,
      status: response.status,
      timestamp: response.timestamp,
      delivered_at: response.delivered_at,
      read_at: response.read_at,
      media_url: response.media_url,
      metadata: response.metadata,
      created_at: response.created_at,
      iu_id: response.iu_id,
      contact: response.contact,
      reply_to: response.reply_to,
      template: response.template,
      flow: response.flow,
    };

    console.log('Adding sent template message to chat:', sentMessage.message_id);
    setMessages(prev => {
      // Check if message already exists to prevent duplicates
      const messageExists = prev.some(msg => msg.message_id === sentMessage.message_id);
      if (messageExists) {
        console.log('Sent template message already exists, skipping duplicate:', sentMessage.message_id);
        return prev;
      }
      return [...prev, sentMessage];
    });
    scrollToBottom();
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
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 relative">
        {/* New Message Notification */}
        {showNewMessageNotification && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-whatsapp-green text-white px-4 py-2 rounded-full shadow-lg animate-bounce">
              <span className="text-sm font-medium">New Message</span>
            </div>
          </div>
        )}
        
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
          // console.log('Grouped messages:', groupedMessages);
          
          // Sort date groups in chronological order (oldest first)
          const sortedDateKeys = Object.keys(groupedMessages).sort((a, b) => {
            // Define the order of date groups (higher numbers = older dates)
            const dateOrder = {
              'Today': 0,
              'Yesterday': 1,
              'Sunday': 2,
              'Monday': 3,
              'Tuesday': 4,
              'Wednesday': 5,
              'Thursday': 6,
              'Friday': 7,
              'Saturday': 8
            };
            
            // For custom date formats (like "Aug 15"), we'll need to parse them
            // For now, let's handle the common cases
            const orderA = dateOrder[a as keyof typeof dateOrder] ?? 999;
            const orderB = dateOrder[b as keyof typeof dateOrder] ?? 999;
            
            console.log('Date group sorting:', { a, b, orderA, orderB });
            
            // Reverse the order so older dates (higher numbers) come first
            return orderB - orderA;
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
                      "max-w-xs lg:max-w-md xl:max-w-lg rounded-lg overflow-hidden",
                      message.is_from_user
                        ? "bg-message-received text-foreground border border-border"
                        : "bg-message-sent text-foreground"
                    )}
                  >
                    {/* Reply-to message */}
                    {message.reply_to_info && (
                      <ReplyToMessage replyToInfo={message.reply_to_info} />
                    )}
                    
                    <div className="px-4 py-2">
                      <div className="text-sm">
                        {message.message_type === 'text' && (
                          <p>{formatMessageContent(message.content)}</p>
                        )}
                        {message.message_type === 'template' && (
                          <div>
                            <p className="font-semibold text-xs mb-1">Template: {message.template_name}</p>
                            <p>{formatMessageContent(message.content)}</p>
                          </div>
                        )}
                        {message.message_type === 'flow' && message.is_from_user && (
                          <div>
                            <p className="font-semibold text-xs mb-1">Flow Response</p>
                            <p>{formatMessageContent(message.content)}</p>
                            {message.flow_responses.length > 0 && (
                              <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                                <p className="font-semibold">{message.flow_responses[0].flow_name}</p>
                                <p>{message.flow_responses[0].screen_title}</p>
                              </div>
                            )}
                          </div>
                        )}
                        {message.message_type === 'flow' && !message.is_from_user && (
                          <p>{formatMessageContent(message.content)}</p>
                        )}
                      </div>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-xs text-muted-foreground">{getStatusTime(message)}</span>
                        {getStatusIcon(message.status, message.is_from_user)}
                      </div>
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
        {/* Message Type Selector */}
        <div className="flex items-center gap-2 mb-2">
          <Select value={messageType} onValueChange={(value: 'text' | 'template') => setMessageType(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text Message</SelectItem>
              <SelectItem value="template">Template</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Paperclip className="h-5 w-5" />
          </Button>
          
          {messageType === 'text' ? (
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
          ) : (
            <div className="flex-1 flex items-center">
              <Button 
                onClick={() => setShowTemplateSelector(true)}
                variant="outline" 
                className="flex-1 justify-start text-left"
              >
                Select Template...
              </Button>
            </div>
          )}
          
          <Button
            onClick={handleSendMessage}
            disabled={(messageType === 'text' && !newMessage.trim()) || isSendingMessage}
            className="bg-whatsapp-green hover:bg-whatsapp-green-hover text-white"
            size="icon"
          >
            {isSendingMessage ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Template Selector Modal */}
      {showTemplateSelector && contactId && (
        <TemplateSelector
          contactId={contactId}
          onClose={() => setShowTemplateSelector(false)}
          onMessageSent={handleTemplateMessageSent}
        />
      )}
    </div>
  );
}

export default ChatWindow;