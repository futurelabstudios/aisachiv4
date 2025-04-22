
export type Language = 'english' | 'hindi';

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
}
