export type Language = 'hindi' | 'hinglish';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  audioUrl?: string;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  language: Language;
  conversationId?: string | null;
}
