import { Language } from '@/types';

// ElevenLabs API Configuration
const ELEVENLABS_API_KEY = 'sk_d6a0904bc5e605b5686c0f5fe47eb4d327029d9038a5ca2b';
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

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
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = ELEVENLABS_API_KEY;
    this.baseUrl = ELEVENLABS_BASE_URL;
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
      console.log('🗣️ ElevenLabs TTS - Input:', { text: text.substring(0, 50) + '...', language, gender });

      // Preprocess text for better pronunciation
      const processedText = this.preprocessText(text, language);
      
      // Get appropriate voice ID
      const voiceId = this.getVoiceId(language, gender);
      
      // Get voice settings
      const voiceSettings = this.getVoiceSettings(language);
      
      console.log('🎯 Using voice ID:', voiceId, 'Settings:', voiceSettings);

      // Make request to ElevenLabs API
      const response = await fetch(`${this.baseUrl}/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify({
          text: processedText,
          model_id: 'eleven_multilingual_v2', // Best model for multilingual content
          voice_settings: voiceSettings
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`ElevenLabs API Error: ${response.status} - ${errorData}`);
      }

      // Convert response to blob and create audio URL
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      console.log('✅ ElevenLabs TTS successful, audio URL created');
      
      return audioUrl;
    } catch (error) {
      console.error('❌ ElevenLabs TTS Error:', error);
      
      // Fallback to browser TTS if ElevenLabs fails
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

  // Get available voices from ElevenLabs
  async getAvailableVoices(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.status}`);
      }

      const data = await response.json();
      console.log('🎤 Available ElevenLabs voices:', data.voices?.length || 0);
      
      return data.voices || [];
    } catch (error) {
      console.error('Error fetching voices:', error);
      return [];
    }
  }

  // Test the service with a simple message
  async testService(language: Language = 'hinglish'): Promise<boolean> {
    try {
      const testText = language === 'hindi' 
        ? 'नमस्ते, यह एक परीक्षण संदेश है।'
        : 'Hello, this is a test message from AI Sachiv.';
      
      console.log('🧪 Testing ElevenLabs service...');
      const audioUrl = await this.textToSpeech(testText, language);
      
      if (audioUrl && audioUrl !== 'browser-tts') {
        console.log('✅ ElevenLabs service test successful');
        return true;
      } else {
        console.log('⚠️ ElevenLabs service using fallback');
        return false;
      }
    } catch (error) {
      console.error('❌ ElevenLabs service test failed:', error);
      return false;
    }
  }

  // Clean up audio URLs to prevent memory leaks
  cleanupAudioUrl(audioUrl: string): void {
    if (audioUrl && audioUrl !== 'browser-tts' && audioUrl.startsWith('blob:')) {
      URL.revokeObjectURL(audioUrl);
    }
  }
}

export const elevenLabsService = new ElevenLabsService(); 