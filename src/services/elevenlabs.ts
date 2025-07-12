import { Language } from '@/types';


// Indian accent voice IDs from ElevenLabs
const VOICE_IDS = {
  // Custom Indian accent voice (primary)
  custom_indian: 'HBwtuRG9VQfaoE2YVMYf', // User's custom Indian accent voice
  
  // Backup Indian English voices
  indian_male: '21m00Tcm4TlvDq8ikWAM', // Rachel (can be configured for Indian accent)
  indian_female: 'AZnzlk1XvdvUeBnXmlld', // Domi (can be configured for Indian accent)
  
  // For Hindi content, we'll use multilingual voices
  hindi_male: 'onwK4e9ZLuTAKqWW03F9', // Daniel (multilingual)
  hindi_female: 'EXAVITQu4vr4xnSDxMaL', // Bella (multilingual)
  
  // Fallback voices
  default_male: '21m00Tcm4TlvDq8ikWAM',
  default_female: 'AZnzlk1XvdvUeBnXmlld'
};

export interface ElevenLabsVoiceSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

export class ElevenLabsService {
  private backendUrl: string;

  constructor() {
    // Use backend proxy instead of direct API calls  
    // Default to localhost:8000 for backend
    const backendBaseUrl = 'http://localhost:8000';
    this.backendUrl = `${backendBaseUrl}/tts`;
  }

  private getVoiceId(language: Language, gender: 'male' | 'female' = 'female'): string {
    // Always use the custom Indian accent voice as primary choice
    return VOICE_IDS.custom_indian;
    
    // Fallback logic (kept for reference but commented out)
    /*
    // Select appropriate voice based on language and gender
    if (language === 'hindi') {
      return gender === 'male' ? VOICE_IDS.hindi_male : VOICE_IDS.hindi_female;
    } else {
      // For Hinglish and English, use Indian accent voices
      return gender === 'male' ? VOICE_IDS.indian_male : VOICE_IDS.indian_female;
    }
    */
  }

  private getVoiceSettings(language: Language): ElevenLabsVoiceSettings {
    // Optimized settings for Indian accent and multilingual content
    return {
      stability: 0.75, // Good stability for clear pronunciation
      similarity_boost: 0.85, // High similarity for consistent voice
      style: 0.20, // Slight style variation for natural speech
      use_speaker_boost: true // Enhanced clarity
    };
  }

  private preprocessText(text: string, language: Language): string {
    // Preprocess text for better pronunciation
    let processedText = text;

    // For Hindi content, ensure proper pronunciation
    if (language === 'hindi') {
      // Add brief pauses for better readability
      processedText = processedText
        .replace(/([।।])/g, '$1 ') // Add pause after Hindi punctuation
        .replace(/([,])/g, '$1 ') // Add pause after commas
        .replace(/(\d+)/g, ' $1 '); // Add space around numbers
    } else {
      // For Hinglish/English, improve pronunciation of common terms
      processedText = processedText
        .replace(/\b(Sarpanch|sarpanch)\b/g, 'Sur-punch') // Better pronunciation
        .replace(/\b(Panchayat|panchayat)\b/g, 'Pun-cha-yut') // Better pronunciation
        .replace(/\b(Sachiv|sachiv)\b/g, 'Su-cheev') // Better pronunciation
        .replace(/\b(Gram|gram)\b/g, 'Grahm') // Better pronunciation
        .replace(/([.!?])/g, '$1 ') // Add pause after sentences
        .replace(/(\d+)/g, ' $1 '); // Add space around numbers
    }

    // Remove excessive whitespace
    return processedText.replace(/\s+/g, ' ').trim();
  }

  async textToSpeech(
    text: string, 
    language: Language, 
    gender: 'male' | 'female' = 'female'
  ): Promise<string> {
    try {
      console.log('🗣️ Backend TTS - Input:', { text: text.substring(0, 50) + '...', language, gender });

      // Call backend TTS proxy (secure)
      const response = await fetch(`${this.backendUrl}/synthesize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          language: language,
          gender: gender
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Backend TTS Error: ${response.status} - ${errorData}`);
      }

      // Convert response to blob and create audio URL
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      console.log('✅ Backend TTS successful, audio URL created');
      
      return audioUrl;
    } catch (error) {
      console.error('❌ Backend TTS Error:', error);
      
      // Fallback to browser TTS if backend fails
      return this.fallbackTTS(text, language);
    }
  }

  private fallbackTTS(text: string, language: Language): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        console.log('🔄 Using browser TTS as fallback');
        
        // Use browser's Speech Synthesis API as fallback
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(text);
          
          // Configure utterance for Indian accent
          utterance.lang = language === 'hindi' ? 'hi-IN' : 'en-IN';
          utterance.rate = 0.9; // Slightly slower for clarity
          utterance.pitch = 1.0;
          utterance.volume = 1.0;

          // Try to find an Indian voice
          const voices = speechSynthesis.getVoices();
          const indianVoice = voices.find(voice => 
            voice.lang.includes('IN') || 
            voice.name.toLowerCase().includes('indian') ||
            voice.name.toLowerCase().includes('hindi')
          );
          
          if (indianVoice) {
            utterance.voice = indianVoice;
            console.log('🎯 Using Indian voice:', indianVoice.name);
          }

          // Since browser TTS doesn't return audio URL, we'll return a placeholder
          speechSynthesis.speak(utterance);
          resolve('browser-tts'); // Special identifier for browser TTS
        } else {
          reject(new Error('Text-to-speech not supported'));
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  // Get available voices from backend
  async getAvailableVoices(): Promise<any[]> {
    try {
      const response = await fetch(`${this.backendUrl}/voices`);

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.status}`);
      }

      const data = await response.json();
      console.log('🎤 Available voices from backend:', data.voices?.length || 0);
      
      return data.voices || [];
    } catch (error) {
      console.error('❌ Error fetching voices from backend:', error);
      return [];
    }
  }

  // Test the backend TTS service
  async testService(language: Language = 'hinglish'): Promise<boolean> {
    try {
      const testText = language === 'hindi' ? 
        'नमस्ते, यह एक परीक्षण संदेश है।' : 
        'Hello, this is a test message from AI Sachiv.';
      
      const audioUrl = await this.textToSpeech(testText, language);
      
      // Clean up test audio
      if (audioUrl && audioUrl !== 'browser-tts') {
        this.cleanupAudioUrl(audioUrl);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Backend TTS service test failed:', error);
      return false;
    }
  }

  // Clean up audio URL to prevent memory leaks
  cleanupAudioUrl(audioUrl: string): void {
    if (audioUrl && audioUrl !== 'browser-tts' && audioUrl.startsWith('blob:')) {
      URL.revokeObjectURL(audioUrl);
    }
  }

  // Check backend TTS health
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.backendUrl}/health`);
      const data = await response.json();
      return data.status === 'healthy';
    } catch (error) {
      console.error('❌ Backend TTS health check failed:', error);
      return false;
    }
  }
}

// Create singleton instance
export const elevenLabsService = new ElevenLabsService(); 