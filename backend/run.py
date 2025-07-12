#!/usr/bin/env python3
"""
Startup script for AI Sachiv Backend
"""

import os
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

if __name__ == "__main__":
    import uvicorn
    from app.core.config import get_settings
    
    settings = get_settings()
    
    print(f"🚀 Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    print(f"📝 Environment: {settings.ENVIRONMENT}")
    print(f"🌐 Server: {settings.HOST}:{settings.PORT}")
    print(f"🔗 Frontend URL: {settings.FRONTEND_URL}")
    print(f"🛡️  CORS Origins: {settings.ALLOWED_ORIGINS}")
    print("=" * 50)
    
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    ) 