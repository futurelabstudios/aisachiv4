// Environment configuration
export const ENV = {
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY || '',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'AI Sachiv',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  API_BASE_URL: import.meta.env.DEV ? '/api/openai' : 'https://api.openai.com/v1',
  DEFAULT_MODEL: 'gpt-4o',
  ELEVENLABS_API_KEY: import.meta.env.VITE_ELEVENLABS_API_KEY || '',
  ELEVENLABS_VOICE_ID: import.meta.env.VITE_ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB',
} as const;

export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
export const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || '';

// Validate required environment variables
export const validateEnv = () => {
  const missingVars: string[] = [];
  
  if (!ENV.OPENAI_API_KEY) {
    missingVars.push('VITE_OPENAI_API_KEY');
    console.warn('OpenAI API key not found. Some features may not work.');
  }
  
  if (!ENV.ELEVENLABS_API_KEY) {
    console.warn('ElevenLabs API key not found. Using fallback TTS.');
  }
  
  if (missingVars.length > 0) {
    console.warn(`Missing environment variables: ${missingVars.join(', ')}`);
    console.warn('Please add these to your .env file for full functionality.');
  }
  
  return missingVars.length === 0;
};

// Call validation on module load
validateEnv(); 