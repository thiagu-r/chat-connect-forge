import React, { useState, useCallback, useEffect } from 'react';
import { ContactList } from './ContactList';
import { ChatWindow } from './ChatWindow';
import { useApi } from '@/hooks/useApi';
import { CONTACTS_ENDPOINTS, ContactListResponse, Contact } from '@/lib/contacts';
import { useWebSocket } from '@/contexts/WebSocketContext';

export function MessagesView() {
  const [selectedContactId, setSelectedContactId] = useState<number>();
  const [currentPage, setCurrentPage] = useState(1);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [pagination, setPagination] = useState<ContactListResponse['pagination'] | null>(null);
  const { useAuthenticatedQuery } = useApi();
  const { isConnected } = useWebSocket();

  // Fetch contacts from API with pagination
  const { data: contactsData, isLoading, error } = useAuthenticatedQuery<ContactListResponse>(
    ['contacts', currentPage.toString()],
    CONTACTS_ENDPOINTS.WITH_LAST_MESSAGE(currentPage, 10)
  );

  // Update contacts and pagination when data changes
  const updateContacts = useCallback((newData: ContactListResponse | undefined) => {
    if (newData) {
      if (currentPage === 1) {
        // First page - replace all contacts
        setAllContacts(newData.contacts);
      } else {
        // Subsequent pages - append contacts
        setAllContacts(prev => [...prev, ...newData.contacts]);
      }
      setPagination(newData.pagination);
    }
  }, [currentPage]);

  // Update contacts when data changes using useEffect
  useEffect(() => {
    if (contactsData) {
      updateContacts(contactsData);
    }
  }, [contactsData, updateContacts]);

  // Reset contacts when page changes to 1 (e.g., after search)
  const handlePageChange = (page: number) => {
    if (page === 1) {
      setAllContacts([]);
    }
    setCurrentPage(page);
  };

  // Find selected contact from API data
  const selectedContact = selectedContactId 
    ? allContacts.find(contact => contact.id === selectedContactId)
    : undefined;

  // WebSocket event listeners for real-time contact updates
  useEffect(() => {
    const handleContactUpdate = (event: CustomEvent) => {
      const data = event.detail;
      // Update contact's last message
      setAllContacts(prev => prev.map(contact => {
        if (contact.id === data.id) {
          return {
            ...contact,
            last_message: {
              content: data.last_message?.content || '',
              timestamp: data.last_message?.timestamp || '',
              status: data.last_message?.status || 'sent',
              is_from_user: false, // Assuming admin messages
            },
            unread_count: contact.unread_count + 1,
          };
        }
        return contact;
      }));
    };

    const handleNewMessage = (event: CustomEvent) => {
      const data = event.detail;
      console.log('MessagesView: New message received:', data);
      
      if (!data.contact_id) {
        console.log('MessagesView: No contact_id in message data');
        return;
      }

      // Check if contact exists in the list
      const existingContact = allContacts.find(contact => contact.id === data.contact_id);
      
      if (existingContact) {
        // Contact exists - update it
        console.log('MessagesView: Updating existing contact:', data.contact_id);
        setAllContacts(prev => {
          const updated = prev.map(contact => {
            if (contact.id === data.contact_id) {
              const isCurrentlySelected = contact.id === selectedContactId;
              console.log('MessagesView: Updating contact', contact.name, 'isSelected:', isCurrentlySelected);
              
              return {
                ...contact,
                last_message: {
                  content: data.content || '',
                  timestamp: data.timestamp || '',
                  status: data.status || 'sent',
                  is_from_user: data.is_from_user || false,
                  message_type: data.message_type || 'text',
                  delivered_at: data.delivered_at,
                  read_at: data.read_at,
                },
                // Only increment unread count if contact is not currently selected
                unread_count: isCurrentlySelected ? contact.unread_count : contact.unread_count + 1,
              };
            }
            return contact;
          });
          console.log('MessagesView: Updated contacts:', updated);
          return updated;
        });

        // If contact is currently selected, emit event for ChatWindow to handle
        if (data.contact_id === selectedContactId) {
          window.dispatchEvent(new CustomEvent('newMessageForSelectedContact', { detail: data }));
        }
      } else {
        // Contact doesn't exist - add it to the list
        const newContact: Contact = {
          id: data.contact_id,
          unread_count: 1, // New contact starts with 1 unread message
          last_message: {
            content: data.content || '',
            timestamp: data.timestamp || '',
            is_from_user: data.is_from_user || false,
            message_type: data.message_type || 'text',
            status: data.status || 'sent',
            delivered_at: data.delivered_at,
            read_at: data.read_at,
          },
          name: data.contact_name || data.phone_number || 'Unknown',
          phone_number: data.phone_number || '',
          country_code: data.phone_number?.startsWith('+') ? data.phone_number.substring(0, 3) : '+91',
          profile_picture: null,
          lables: [],
          notes: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_blocked: false,
          last_seen: new Date().toISOString(),
          iu_id: null,
        };

        // Add new contact to the beginning of the list
        setAllContacts(prev => [newContact, ...prev]);
      }
    };

    // Add event listeners
    window.addEventListener('contactUpdate', handleContactUpdate as EventListener);
    window.addEventListener('newMessage', handleNewMessage as EventListener);

    return () => {
      window.removeEventListener('contactUpdate', handleContactUpdate as EventListener);
      window.removeEventListener('newMessage', handleNewMessage as EventListener);
    };
  }, [selectedContactId, allContacts]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p>Loading contacts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center text-red-600">
          <p>Error loading contacts: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <ContactList
        contacts={allContacts}
        selectedContactId={selectedContactId}
        onContactSelect={setSelectedContactId}
        pagination={pagination}
        onPageChange={handlePageChange}
      />
      <ChatWindow
        contactId={selectedContact?.id}
        contactName={selectedContact?.name || selectedContact?.phone_number}
        contactPhone={selectedContact?.phone_number}
        isOnline={false} // We don't have online status from API yet
      />
    </div>
  );
}