export interface LastMessage {
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'sending';
  is_from_user: boolean;
}

export interface Contact {
  id: number;
  name: string;
  phone_number: string;
  country_code: string | null;
  unread_count: number;
  last_message: LastMessage;
}

export interface Pagination {
  current_page: number;
  page_size: number;
  total_contacts: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
  next_page: number | null;
  previous_page: number | null;
}

export interface ContactListResponse {
  contacts: Contact[];
  pagination: Pagination;
}

// API endpoints for contacts
export const CONTACTS_ENDPOINTS = {
  WITH_LAST_MESSAGE: (page: number = 1, pageSize: number = 10) => 
    `/contacts/with_last_message/?page_size=${pageSize}&page=${page}`,
  DETAIL: (id: number) => `/contacts/${id}/`,
  CREATE: '/contacts/',
  UPDATE: (id: number) => `/contacts/${id}/`,
  DELETE: (id: number) => `/contacts/${id}/`,
} as const; 