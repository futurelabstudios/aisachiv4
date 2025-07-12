# API route handlers 
from .chat import router as chat_router
from .health import router as health_router
from .tts import router as tts_router
from .document import router as document_router

__all__ = ["chat_router", "health_router", "tts_router", "document_router"] 