// Environment configuration
export const ENV = {
  APP_NAME: import.meta.env.VITE_APP_NAME || 'AI Sachiv',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  API_BASE_URL: 'https://api.openai.com/v1',
  DEFAULT_MODEL: 'gpt-4o',
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
} as const;
