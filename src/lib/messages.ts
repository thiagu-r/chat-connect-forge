export interface FlowResponse {
  id: number;
  flow_name: string;
  screen_title: string;
  response_data: Record<string, any>;
  action: string;
  created_at: string;
  iu_id: string | null;
  message: number;
  flow: number;
  screen: number;
  component: number | null;
}

export interface TemplateComponent {
  text?: string;
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
  format?: 'DOCUMENT' | 'IMAGE' | 'VIDEO';
  example?: {
    header_handle?: string[];
    body_text?: string[][];
  };
  code_expiration_minutes?: number;
  buttons?: Array<{
    url?: string;
    text: string;
    type: 'URL' | 'FLOW';
    flow_id?: number;
    flow_action?: string;
    navigate_screen?: string;
    example?: string[];
  }>;
}

export interface Message {
  id: number;
  contact_name: string;
  contact_phone: string;
  flow_responses: FlowResponse[];
  template_name: string | null;
  template_components: TemplateComponent[] | null;
  message_id: string;
  content: string;
  message_type: 'text' | 'template' | 'flow';
  is_from_user: boolean;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  delivered_at: string | null;
  read_at: string | null;
  media_url: string;
  metadata: Record<string, any>;
  created_at: string;
  iu_id: string | null;
  contact: number;
  reply_to: number | null;
  template: number | null;
  flow: number | null;
}

export interface ContactInfo {
  id: number;
  unread_count: number;
  last_message: {
    content: string;
    timestamp: string;
    is_from_user: boolean;
    message_type: string;
    status: string;
    delivered_at: string | null;
    read_at: string | null;
  };
  name: string;
  phone_number: string;
  country_code: string;
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
  total_messages: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
  next_page: number | null;
  previous_page: number | null;
}

export interface MessagesResponse {
  contact: ContactInfo;
  messages: Message[];
  pagination: Pagination;
}

// API endpoints for messages
export const MESSAGES_ENDPOINTS = {
  GET_MESSAGES: (contactId: number, page: number = 1, pageSize: number = 10) => 
    `/contacts/${contactId}/messages/?page_size=${pageSize}&page=${page}`,
  SEND_MESSAGE: (contactId: number) => `/contacts/${contactId}/messages/`,
} as const; 