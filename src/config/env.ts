// Environment configuration
export const ENV = {
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY || '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',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'AI Sachiv',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  API_BASE_URL: 'https://api.openai.com/v1',
  DEFAULT_MODEL: 'gpt-4o',
} as const;

// Validate required environment variables
export const validateEnv = () => {
  if (!ENV.OPENAI_API_KEY) {
    console.warn('OpenAI API key not found. Using fallback key.');
  }
};

// Call validation on module load
validateEnv(); 