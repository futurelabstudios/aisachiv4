/**
 * Admin API service for dashboard functionality
 */
import { apiClient } from './api';

export interface AdminStatistics {
  total_users: number;
  active_users: number;
  total_conversations: number;
  avg_response_time: number;
  conversations_today: number;
  conversations_this_week: number;
  conversations_this_month: number;
}

export interface Conversation {
  id: string;
  user_id: string;
  user_email: string;
  user_question: string;
  assistant_answer: string;
  response_time: number;
  created_at: string;
  updated_at: string;
}

export interface ConversationsResponse {
  conversations: Conversation[];
  total_pages: number;
  total_count: number;
}

export interface ConversationFilters {
  user_email?: string;
  date_from?: string;
  date_to?: string;
  search_query?: string;
  sort_by?: string;
  sort_order?: string;
  page?: number;
  page_size?: number;
}

export const getStatistics = async (): Promise<AdminStatistics> => {
  const response = await apiClient.get('/admin/statistics');
  return response.data;
};

export const getConversations = async (
  filters: ConversationFilters
): Promise<ConversationsResponse> => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, value.toString());
    }
  });

  const response = await apiClient.get(`/admin/conversations?${params}`);
  return response.data;
};

export const exportConversations = async (
  filters: Omit<ConversationFilters, 'page' | 'page_size'>
): Promise<Blob> => {
  const response = await fetch(
    `${
      import.meta.env.VITE_API_URL || 'http://localhost:8000'
    }/admin/conversations/export`,
    {
      method: 'POST',
      headers: apiClient['getAuthHeaders'](), // eslint-disable-line @typescript-eslint/dot-notation
      body: JSON.stringify(filters),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to export conversations');
  }

  return response.blob();
};
