export interface LastMessage {
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'sending';
  is_from_user: boolean;
  message_type?: string;
  delivered_at?: string | null;
  read_at?: string | null;
}

export interface Contact {
  id: number;
  name: string;
  phone_number: string;
  country_code: string;
  unread_count: number;
  last_message: LastMessage;
  profile_picture: string | null;
  lables: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
  is_blocked: boolean;
  last_seen: string;
  iu_id: string | null;
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