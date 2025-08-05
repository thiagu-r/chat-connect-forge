import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Contact {
  id: number;
  name: string;
  phone_number: string;
  country_code: string | null;
  unread_count: number;
  last_message: {
    content: string;
    timestamp: string;
    status: 'sent' | 'delivered' | 'read' | 'failed' | 'sending';
    is_from_user: boolean;
  };
}

interface ContactListProps {
  contacts: Contact[];
  selectedContactId?: number;
  onContactSelect: (contactId: number) => void;
  pagination?: {
    current_page: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
  onPageChange?: (page: number) => void;
}

// Mock data for demonstration
const mockContacts: Contact[] = [
  {
    id: 1,
    name: 'John Smith',
    phone_number: '+1234567890',
    country_code: '+1',
    unread_count: 2,
    last_message: {
      content: 'Thanks for the information!',
      timestamp: '2025-01-04T10:30:00Z',
      status: 'read',
      is_from_user: false,
    },
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    phone_number: '+1234567891',
    country_code: '+1',
    unread_count: 0,
    last_message: {
      content: 'When can we schedule the meeting?',
      timestamp: '2025-01-04T10:15:00Z',
      status: 'delivered',
      is_from_user: false,
    },
  },
];

export function ContactList({ contacts = mockContacts, selectedContactId, onContactSelect, pagination, onPageChange }: ContactListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone_number.includes(searchTerm)
  );

  // Infinite scroll handler
  const handleScroll = () => {
    if (!scrollContainerRef.current || !pagination || !onPageChange || isLoadingMore) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

    // Load more when user scrolls to 80% of the list
    if (scrollPercentage > 0.8 && pagination.has_next) {
      setIsLoadingMore(true);
      onPageChange(pagination.current_page + 1);
    }
  };

  // Reset loading state when pagination changes
  useEffect(() => {
    setIsLoadingMore(false);
  }, [pagination?.current_page]);

  // Add scroll event listener
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [pagination, onPageChange, isLoadingMore]);

  return (
    <div className="w-80 bg-sidebar-bg border-r border-sidebar-border flex flex-col">
      {/* Search Header */}
      <div className="p-4 border-b border-sidebar-border">
        <input
          type="text"
          placeholder="Search contacts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      
      {/* Contact List */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        {filteredContacts.map((contact, index) => (
          <div
            key={`${contact.id}-${index}`}
            onClick={() => onContactSelect(contact.id)}
            className={cn(
              "flex items-center gap-3 p-4 cursor-pointer border-b border-sidebar-border hover:bg-sidebar-hover transition-colors",
              selectedContactId === contact.id && "bg-sidebar-active"
            )}
          >
            {/* Avatar */}
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={contact.avatar} />
                <AvatarFallback className="bg-whatsapp-green text-white">
                  {contact.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {/* Online status indicator - disabled for now since API doesn't provide this */}
              {/* {contact.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-whatsapp-green rounded-full border-2 border-white" />
              )} */}
            </div>
            
            {/* Contact Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-foreground truncate">
                  {contact.name || contact.phone_number}
                </h3>
                <span className="text-xs text-muted-foreground">
                  {new Date(contact.last_message.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
              <p className="text-sm text-muted-foreground truncate mt-1">
                {contact.last_message.content}
              </p>
            </div>
            
            {/* Unread Badge */}
            {contact.unread_count > 0 && (
              <Badge className="bg-whatsapp-green text-white">
                {contact.unread_count}
              </Badge>
            )}
          </div>
        ))}
        
        {/* Loading indicator for infinite scroll */}
        {isLoadingMore && (
          <div className="p-4 text-center">
            <div className="inline-flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
              <span className="text-sm text-muted-foreground">Loading more contacts...</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Pagination - Hidden when using infinite scroll */}
      {pagination && onPageChange && !pagination.has_next && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="text-center">
            <span className="text-sm text-muted-foreground">
              Showing {pagination.total_contacts} contacts
            </span>
          </div>
        </div>
      )}
    </div>
  );
}