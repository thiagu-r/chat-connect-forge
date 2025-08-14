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

// Simple contact interface for the list endpoint
export interface SimpleContact {
  id: number;
  name: string;
  phone_number: string;
  country_code: string | null;
  is_blocked: boolean;
  created_at: string;
  updated_at: string;
  last_seen: string | null;
  profile_picture: string | null;
}

// Detailed contact interface for individual contact endpoint
export interface DetailedContact {
  id: number;
  name: string;
  phone_number: string;
  country_code: string | null;
  profile_picture: string | null;
  lables: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
  is_blocked: boolean;
  last_seen: string | null;
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
  contacts: SimpleContact[];
  pagination: Pagination;
}

// API endpoints for contacts
export const CONTACTS_ENDPOINTS = {
  SIMPLE_LIST: (page: number = 1, pageSize: number = 20) => 
    `/contacts/simple_list/?page_size=${pageSize}&page=${page}`,
  WITH_LAST_MESSAGE: (page: number = 1, pageSize: number = 10) => 
    `/contacts/with_last_message/?page_size=${pageSize}&page=${page}`,
  DETAIL: (id: number) => `/contacts/${id}/`,
  CREATE: '/contacts/',
  UPDATE: (id: number) => `/contacts/${id}/`,
  DELETE: (id: number) => `/contacts/${id}/`,
} as const;

// Import the API service
import { apiService } from './api';

// Fetch simple contacts list
export const fetchContactsList = async (page: number = 1, pageSize: number = 20): Promise<ContactListResponse> => {
  return apiService.makeAuthenticatedRequest(CONTACTS_ENDPOINTS.SIMPLE_LIST(page, pageSize)) as Promise<ContactListResponse>;
};

// Fetch detailed contact information
export const fetchContactDetail = async (contactId: number): Promise<DetailedContact> => {
  return apiService.makeAuthenticatedRequest(CONTACTS_ENDPOINTS.DETAIL(contactId)) as Promise<DetailedContact>;
}; 