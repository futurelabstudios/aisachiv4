import os
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings with environment variable support"""
    
    # Application settings
    APP_NAME: str = "AI Sachiv API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"
    
    # Server settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Frontend URL for CORS
    FRONTEND_URL: str = "http://localhost:8080"
    ALLOWED_ORIGINS: List[str] = ["http://localhost:8080", "http://127.0.0.1:8080"]
    
    # Database settings
    DATABASE_URL: str
    DB_ECHO: bool = False  # Disable SQL logging in production
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 30
    DB_POOL_RECYCLE: int = 3600
    
    # OpenAI settings
    OPENAI_API_KEY: str
    OPENAI_MODEL: str = "gpt-3.5-turbo"
    OPENAI_MAX_TOKENS: int = 1500
    
    # ElevenLabs TTS settings
    ELEVENLABS_API_KEY: str
    ELEVENLABS_BASE_URL: str = "https://api.elevenlabs.io/v1"

    # Supabase settings
    SUPABASE_URL: str
    SUPABASE_KEY: str
    SUPABASE_JWT_SECRET: str
    
    # Session settings
    SESSION_TIMEOUT_DAYS: int = 30
    CLEANUP_INTERVAL_HOURS: int = 24
    
    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_PER_HOUR: int = 1000
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Create global settings instance
settings = Settings()


def get_settings() -> Settings:
    """Get application settings"""
    return settings 