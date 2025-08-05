import React, { useState, useCallback, useEffect } from 'react';
import { ContactList } from './ContactList';
import { ChatWindow } from './ChatWindow';
import { useApi } from '@/hooks/useApi';
import { CONTACTS_ENDPOINTS, ContactListResponse, Contact } from '@/lib/contacts';

export function MessagesView() {
  const [selectedContactId, setSelectedContactId] = useState<number>();
  const [currentPage, setCurrentPage] = useState(1);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [pagination, setPagination] = useState<ContactListResponse['pagination'] | null>(null);
  const { useAuthenticatedQuery } = useApi();

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