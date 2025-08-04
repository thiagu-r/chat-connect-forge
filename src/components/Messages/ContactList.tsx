import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Contact {
  id: string;
  name: string;
  phone: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  avatar?: string;
  isOnline: boolean;
}

interface ContactListProps {
  contacts: Contact[];
  selectedContactId?: string;
  onContactSelect: (contactId: string) => void;
}

// Mock data for demonstration
const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'John Smith',
    phone: '+1234567890',
    lastMessage: 'Thanks for the information!',
    timestamp: '2m',
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    phone: '+1234567891',
    lastMessage: 'When can we schedule the meeting?',
    timestamp: '15m',
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: '3',
    name: 'Mike Davis',
    phone: '+1234567892',
    lastMessage: 'Perfect! I\'ll send the documents.',
    timestamp: '1h',
    unreadCount: 1,
    isOnline: true,
  },
  {
    id: '4',
    name: 'Emily Wilson',
    phone: '+1234567893',
    lastMessage: 'Can you send me the pricing details?',
    timestamp: '2h',
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: '5',
    name: 'Robert Brown',
    phone: '+1234567894',
    lastMessage: 'Great service! Highly recommend.',
    timestamp: '1d',
    unreadCount: 0,
    isOnline: true,
  },
];

export function ContactList({ contacts = mockContacts, selectedContactId, onContactSelect }: ContactListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone.includes(searchTerm)
  );

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
      <div className="flex-1 overflow-y-auto">
        {filteredContacts.map((contact) => (
          <div
            key={contact.id}
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
              {contact.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-whatsapp-green rounded-full border-2 border-white" />
              )}
            </div>
            
            {/* Contact Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-foreground truncate">{contact.name}</h3>
                <span className="text-xs text-muted-foreground">{contact.timestamp}</span>
              </div>
              <p className="text-sm text-muted-foreground truncate mt-1">
                {contact.lastMessage}
              </p>
            </div>
            
            {/* Unread Badge */}
            {contact.unreadCount > 0 && (
              <Badge className="bg-whatsapp-green text-white">
                {contact.unreadCount}
              </Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}