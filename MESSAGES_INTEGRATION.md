# Messages Page Integration

This document describes the Messages page integration with the WhatsApp CRM API.

## API Integration

### Contacts with Last Message Endpoint
- **URL**: `https://wp.dev-api.medyaan.com/api/contacts/with_last_message/`
- **Method**: GET
- **Headers**: `Authorization: Bearer {access_token}`
- **Parameters**:
  - `page_size`: Number of contacts per page (default: 10)
  - `page`: Page number (default: 1)

### API Response Structure

```typescript
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

interface Pagination {
  current_page: number;
  page_size: number;
  total_contacts: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
  next_page: number | null;
  previous_page: number | null;
}

interface ContactListResponse {
  contacts: Contact[];
  pagination: Pagination;
}
```

### Example API Response

```json
{
  "contacts": [
    {
      "id": 38,
      "name": "",
      "phone_number": "+918056472818",
      "country_code": "+91",
      "unread_count": 25,
      "last_message": {
        "content": "Template: inperson_appointment",
        "timestamp": "2025-08-04T04:26:36.199785Z",
        "status": "failed",
        "is_from_user": false
      }
    }
  ],
  "pagination": {
    "current_page": 2,
    "page_size": 5,
    "total_contacts": 15,
    "total_pages": 3,
    "has_next": true,
    "has_previous": true,
    "next_page": 3,
    "previous_page": 1
  }
}
```

## Features Implemented

### 1. Contact List Integration
- ✅ Fetches contacts with last message from API
- ✅ Displays contact name (or phone number if name is empty)
- ✅ Shows last message content and timestamp
- ✅ Displays unread message count badge
- ✅ Handles pagination with page controls

### 2. Contact Display
- ✅ Contact avatar with initials
- ✅ Contact name or phone number as fallback
- ✅ Last message preview
- ✅ Message timestamp in readable format
- ✅ Unread count badge
- ✅ Search functionality

### 3. Infinite Scroll Pagination
- ✅ Automatic loading when scrolling to 80% of the list
- ✅ Loading indicator while fetching more contacts
- ✅ Accumulates contacts from all pages
- ✅ Automatic page size of 10 contacts
- ✅ Smooth scrolling experience

### 4. Contact Selection
- ✅ Click to select contact
- ✅ Visual selection indicator
- ✅ Passes selected contact to chat window

### 5. Error Handling
- ✅ Loading states
- ✅ Error display
- ✅ Graceful fallbacks

## UI Components

### ContactList Component
- **Location**: `src/components/Messages/ContactList.tsx`
- **Features**:
  - Contact list with search
  - Pagination controls
  - Contact selection
  - Unread count badges
  - Message preview

### MessagesView Component
- **Location**: `src/components/Messages/MessagesView.tsx`
- **Features**:
  - API integration with React Query
  - Pagination state management
  - Contact selection state
  - Error and loading states

## Usage

### Making API Calls
```typescript
import { useApi } from '@/hooks/useApi';
import { CONTACTS_ENDPOINTS } from '@/lib/contacts';

const { useAuthenticatedQuery } = useApi();

// Fetch contacts with pagination
const { data, isLoading, error } = useAuthenticatedQuery(
  ['contacts', page.toString()],
  CONTACTS_ENDPOINTS.WITH_LAST_MESSAGE(page, 10)
);
```

### Infinite Scroll
```typescript
const [currentPage, setCurrentPage] = useState(1);
const [allContacts, setAllContacts] = useState<Contact[]>([]);

// Contacts accumulate as user scrolls
// API automatically loads next page when user scrolls to 80% of list
```

## Message Status Indicators

The API provides message status that can be used for visual indicators:
- `sent`: Message sent successfully
- `delivered`: Message delivered to recipient
- `read`: Message read by recipient
- `failed`: Message failed to send
- `sending`: Message currently being sent

## Next Steps

1. **✅ Chat Window Integration**: Connected chat window to message API
2. **Real-time Updates**: Implement WebSocket for live message updates
3. **✅ Message Status**: Added visual indicators for message status
4. **Online Status**: Add online/offline indicators
5. **Message Search**: Implement message search functionality
6. **Contact Actions**: Add contact actions (block, archive, etc.)
7. **Send Message**: Implement send message functionality
8. **✅ Infinite Scroll**: Added infinite scroll for messages (scroll up to load older messages)

## Testing

To test the Messages page:

1. **Login** to the application
2. **Navigate to Messages** from the sidebar
3. **View contacts** loaded from API
4. **Search contacts** using the search bar
5. **Navigate pages** using pagination controls
6. **Select a contact** to view chat window
7. **Check unread counts** and message previews
8. **View message history** in the chat window
9. **Check message status** indicators (✓, ✓✓, blue ✓✓)
10. **View different message types** (text, template, flow)
11. **Scroll up to load older messages** (infinite scroll)

## Chat Window Features

### Message Types Supported:
- **Text Messages**: Simple text content
- **Template Messages**: Shows template name and content
- **Flow Messages**: Shows flow responses and data

### Message Status Indicators:
- **Sending/Sent**: Single grey tick (✓) + created_at time
- **Delivered**: Double grey ticks (✓✓) + delivered_at time
- **Read**: Double blue ticks (✓✓) + read_at time
- **Failed**: Red X mark

**Note**: Status indicators are only shown for admin messages (right side, green background)

### Message Positioning:
- **User Messages**: Left side (grey background) - no status indicators
- **Admin Messages**: Right side (green background) - with status indicators

### Infinite Scroll:
- **Scroll Up**: Loads older messages automatically
- **Loading Indicator**: Shows "Loading older messages..." while fetching
- **Message Order**: Older messages appear at the top
- **Contact Reset**: Clears messages when switching contacts

The Messages page is now fully integrated with your API and ready for use! 