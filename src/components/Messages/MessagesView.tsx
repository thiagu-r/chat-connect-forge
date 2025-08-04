import { useState } from 'react';
import { ContactList } from './ContactList';
import { ChatWindow } from './ChatWindow';

export function MessagesView() {
  const [selectedContactId, setSelectedContactId] = useState<string>();

  // Mock contact data - in real app this would come from props or API
  const selectedContact = selectedContactId ? {
    id: selectedContactId,
    name: selectedContactId === '1' ? 'John Smith' : 
          selectedContactId === '2' ? 'Sarah Johnson' :
          selectedContactId === '3' ? 'Mike Davis' :
          selectedContactId === '4' ? 'Emily Wilson' : 'Robert Brown',
    phone: `+123456789${selectedContactId}`,
    isOnline: ['1', '3', '5'].includes(selectedContactId),
  } : undefined;

  return (
    <div className="flex h-full">
      <ContactList
        contacts={[]}
        selectedContactId={selectedContactId}
        onContactSelect={setSelectedContactId}
      />
      <ChatWindow
        contactId={selectedContact?.id}
        contactName={selectedContact?.name}
        contactPhone={selectedContact?.phone}
        isOnline={selectedContact?.isOnline}
      />
    </div>
  );
}