const API_BASE_URL = 'https://wp.dev-api.medyaan.com/api';
import { Message } from './messages';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: Record<string, unknown>;
}

export interface ApiError {
  message: string;
  status?: number;
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async refreshToken(): Promise<LoginResponse> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${API_BASE_URL}/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  }

  async makeAuthenticatedRequest(endpoint: string, options: RequestInit = {}): Promise<unknown> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      });

      if (response.status === 401) {
        // Token expired, try to refresh
        try {
          const newTokens = await this.refreshToken();
          localStorage.setItem('access_token', newTokens.access_token);
          localStorage.setItem('refresh_token', newTokens.refresh_token);
          
          // Retry the original request with new token
          const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
              ...this.getAuthHeaders(),
              ...options.headers,
            },
          });

          if (!retryResponse.ok) {
            throw new Error(`HTTP error! status: ${retryResponse.status}`);
          }

          return await retryResponse.json();
        } catch (refreshError) {
          // Refresh failed, redirect to login
          this.logout();
          throw new Error('Authentication failed');
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }
}

export const apiService = new ApiService(); 

// Send text message to contact
export const sendTextMessage = async (contactId: number, content: string): Promise<Message> => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    throw new Error('No access token found');
  }

  const response = await fetch(`${API_BASE_URL}/templates/send_text_to_contact/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      contact_id: contactId,
      content: content,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to send message: ${response.statusText}`);
  }

  return response.json();
};

// Template interfaces
export interface TemplateParameter {
  name: string;
  type: string;
  example: string | null;
  description: string;
}

export interface TemplateComponent {
  text?: string;
  type: string;
  format?: string;
  example?: Record<string, unknown>;
  buttons?: Record<string, unknown>[];
}

export interface Template {
  id: number;
  name: string;
  status: string;
  category: string;
  language: string;
  components: TemplateComponent[];
  created_at: string;
  updated_at: string;
  is_active: boolean;
  payload_structure: {
    parameters: TemplateParameter[];
  };
  template_id: string;
}

export interface TemplatesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Template[];
}

// Fetch templates
export const fetchTemplates = async (): Promise<TemplatesResponse> => {
  return apiService.makeAuthenticatedRequest('/templates/') as Promise<TemplatesResponse>;
};

// Fetch single template
export const fetchTemplate = async (templateId: number): Promise<Template> => {
  return apiService.makeAuthenticatedRequest(`/templates/${templateId}/`) as Promise<Template>;
};

// Send template message to contact
export const sendTemplateMessage = async (
  templateId: number, 
  contactId: number, 
  parameters: Record<string, string>
): Promise<Message> => {
  return apiService.makeAuthenticatedRequest(`/templates/${templateId}/send_to_contact/`, {
    method: 'POST',
    body: JSON.stringify({
      contact_id: contactId,
      parameters: parameters,
    }),
  }) as Promise<Message>;
};

// Flow interfaces
export interface FlowComponent {
  id: number;
  component_type: string;
  component_id: string;
  config: Record<string, unknown>;
  order: number;
  conditions: Record<string, unknown>;
  created_at: string;
  iu_id: number | null;
  screen: number;
}

export interface FlowScreen {
  id: number;
  components: FlowComponent[];
  screen_id: string;
  title: string;
  terminal: boolean;
  data: Record<string, unknown>;
  layout: Record<string, unknown>;
  created_at: string;
  iu_id: number | null;
  flow: number;
}

export interface Flow {
  id: number;
  flow_id: string;
  name: string;
  status: string;
  categories: string[];
  preview: Record<string, unknown>;
  validation_errors: string[];
  routing_model: Record<string, string[]>;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  screens?: FlowScreen[];
}

export interface FlowsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Flow[];
}

// Fetch flows
export const fetchFlows = async (): Promise<FlowsResponse> => {
  return apiService.makeAuthenticatedRequest('/flows/') as Promise<FlowsResponse>;
};

// Fetch single flow
export const fetchFlow = async (flowId: number): Promise<Flow> => {
  return apiService.makeAuthenticatedRequest(`/flows/${flowId}/`) as Promise<Flow>;
}; 