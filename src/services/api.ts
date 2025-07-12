// API service for backend endpoints
import { Language } from '@/types';

const API_BASE_URL = 'http://localhost:8000';

export interface CircularsResponse {
  success: boolean;
  states?: Array<{
    id: string;
    name: {
      hindi: string;
      hinglish: string;
    };
    schemes: Array<{
      title: {
        hindi: string;
        hinglish: string;
      };
      description: {
        hindi: string;
        hinglish: string;
      };
      url: string;
      category: 'scheme' | 'circular' | 'policy';
    }>;
  }>;
  schemes?: Array<{
    title: {
      hindi: string;
      hinglish: string;
    };
    description: {
      hindi: string;
      hinglish: string;
    };
    url: string;
    category: 'scheme' | 'circular' | 'policy';
  }>;
  message?: string;
}

export interface DocumentAnalysisResponse {
  success: boolean;
  analysis?: {
    document_type: string;
    detected_language: string;
    confidence: number;
    fields_detected: Array<{
      field_name: string;
      value: string;
      confidence: number;
    }>;
    suggestions: string[];
    main_information: string;
  };
  answer?: string;
  message?: string;
}

export interface AcademyResponse {
  success: boolean;
  modules?: Array<{
    id: number;
    emoji: string;
    color: string;
    title: {
      hindi: string;
      hinglish: string;
    };
    description: {
      hindi: string;
      hinglish: string;
    };
    content: {
      hindi: string[];
      hinglish: string[];
    };
  }>;
  module_content?: {
    id: number;
    emoji: string;
    color: string;
    title: {
      hindi: string;
      hinglish: string;
    };
    description: {
      hindi: string;
      hinglish: string;
    };
    content: {
      hindi: string[];
      hinglish: string[];
    };
  };
  message?: string;
}

export interface VideosResponse {
  success: boolean;
  videos?: Array<{
    title: {
      hindi: string;
      hinglish: string;
    };
    description: {
      hindi: string;
      hinglish: string;
    };
    url: string;
    importance: {
      hindi: string;
      hinglish: string;
    };
    duration: string;
  }>;
  message?: string;
}

export interface GlossaryResponse {
  success: boolean;
  terms?: Array<{
    id: number;
    term: {
      hindi: string;
      hinglish: string;
    };
    meaning: {
      hindi: string;
      hinglish: string;
    };
    example: {
      hindi: string;
      hinglish: string;
    };
    category: string;
  }>;
  categories?: Array<{
    id: string;
    name: string;
  }>;
  message?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatRequest {
  message: string;
  conversation_history?: ChatMessage[];
}

export interface ChatResponse {
  response: string;
  timestamp: string;
  conversation_id: string;
}

class APIClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async getCirculars(
    language: string = 'hinglish',
    stateId?: string,
    category: string = 'all'
  ): Promise<CircularsResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/circulars`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          state_id: stateId,
          category,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching circulars:', error);
      throw error;
    }
  }

  async analyzeDocument(
    file: File,
    language: string = 'hinglish'
  ): Promise<{
    summary: string;
    keyPoints: string[];
    translation?: string;
    recommendations?: string[];
  }> {
    try {
      // Convert file to base64 for API call
      const base64Data = await this.fileToBase64(file);
      
      const response = await fetch(`${this.baseUrl}/document`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_data: base64Data,
          document_type: file.type,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: DocumentAnalysisResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Document analysis failed');
      }

      // Convert backend response to expected format
      if (data.analysis) {
        return {
          summary: data.analysis.main_information || 'Document analyzed successfully',
          keyPoints: data.analysis.fields_detected.map(field => `${field.field_name}: ${field.value}`),
          recommendations: data.analysis.suggestions,
        };
      } else {
        throw new Error('No analysis data received');
      }
    } catch (error) {
      console.error('Error analyzing document:', error);
      throw error;
    }
  }

  async generateImage(
    prompt: string,
    language: string = 'hinglish'
  ): Promise<string> {
    try {
      console.log('🎨 Calling backend to generate image');
      
      const response = await fetch(`${this.baseUrl}/generate-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          language: language,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Image generation failed');
      }

      console.log('✅ Image generated successfully');
      return data.image_url;
      
    } catch (error) {
      console.error('❌ Error generating image:', error);
      throw error;
    }
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove data URL prefix (data:image/jpeg;base64,)
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  async getAcademyContent(
    language: string = 'hinglish',
    moduleId?: number
  ): Promise<AcademyResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/academy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          module_id: moduleId,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching academy content:', error);
      throw error;
    }
  }

  async getVideos(
    language: string = 'hinglish',
    category: string = 'all'
  ): Promise<VideosResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/videos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching videos:', error);
      throw error;
    }
  }

  async getGlossaryTerms(
    language: string = 'hinglish',
    searchQuery?: string,
    category: string = 'all'
  ): Promise<GlossaryResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/glossary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          search_query: searchQuery,
          category,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching glossary terms:', error);
      throw error;
    }
  }

  async sendChatMessage(message: string, conversationHistory: ChatMessage[] = []): Promise<string> {
    try {
      console.log('🚀 Sending message to backend');
      
      const response = await fetch(`${this.baseUrl}/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          conversation_history: conversationHistory
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Backend Error: ${errorData.detail || response.statusText}`);
      }

      const data: ChatResponse = await response.json();
      console.log('✅ Backend response received');
      
      return data.response;
      
    } catch (error) {
      console.error('❌ API Error:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return "❌ Backend server se connection nahi ho pa raha. Kripya ensure kariye ki FastAPI server http://localhost:8000 par chal raha hai.";
      }
      
      return "Sorry, kuch technical issue hai. Kripya baad mein try kariye.";
    }
  }

  async synthesizeSpeech(text: string, language: Language = 'hinglish'): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/tts/synthesize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          language: language,
          gender: 'female'
        })
      });

      if (!response.ok) {
        throw new Error(`TTS Error: ${response.statusText}`);
      }

      const audioBlob = await response.blob();
      return URL.createObjectURL(audioBlob);
      
    } catch (error) {
      console.error('❌ TTS Error:', error);
      throw error;
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const apiClient = new APIClient(); 