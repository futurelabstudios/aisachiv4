from datetime import datetime
from typing import Dict, List, Optional, Any
from pydantic import BaseModel


# Chat models
class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    timestamp: Optional[datetime] = None


class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[ChatMessage]] = []


class ChatResponse(BaseModel):
    response: str
    timestamp: datetime
    conversation_id: Optional[str] = None


# Voice Agent models
class VoiceMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    timestamp: Optional[datetime] = None


class VoiceRequest(BaseModel):
    message: str
    language: Optional[str] = "hinglish"  # "hindi", "hinglish", or "english"
    conversation_history: Optional[List[VoiceMessage]] = []


class VoiceResponse(BaseModel):
    response: str
    timestamp: datetime
    conversation_id: Optional[str] = None
    language: str


class ConversationSaveRequest(BaseModel):
    text: str
    timestamp: Optional[datetime] = None


# Circulars models
class CircularsRequest(BaseModel):
    state_id: Optional[str] = None
    category: Optional[str] = "all"
    language: str = "hinglish"


class CircularsResponse(BaseModel):
    success: bool
    states: Optional[List[Dict[str, Any]]] = None
    schemes: Optional[List[Dict[str, Any]]] = None
    message: Optional[str] = None


# Document analysis models
class DocumentAnalysisRequest(BaseModel):
    image_data: Optional[str] = None  # Base64 encoded image
    document_type: Optional[str] = None
    question: Optional[str] = None
    language: str = "hinglish"


class DocumentAnalysisResponse(BaseModel):
    success: bool
    analysis: Optional[Dict[str, Any]] = None
    answer: Optional[str] = None
    message: Optional[str] = None


# Academy models
class AcademyRequest(BaseModel):
    module_id: Optional[int] = None
    language: str = "hinglish"


class AcademyResponse(BaseModel):
    success: bool
    modules: Optional[List[Dict[str, Any]]] = None
    module_content: Optional[Dict[str, Any]] = None
    message: Optional[str] = None


# Videos models
class VideosRequest(BaseModel):
    category: Optional[str] = "all"
    language: str = "hinglish"


class VideosResponse(BaseModel):
    success: bool
    videos: Optional[List[Dict[str, Any]]] = None
    message: Optional[str] = None


# Glossary models
class GlossaryRequest(BaseModel):
    search_query: Optional[str] = None
    category: Optional[str] = "all"
    language: str = "hinglish"


class GlossaryResponse(BaseModel):
    success: bool
    terms: Optional[List[Dict[str, Any]]] = None
    categories: Optional[List[Dict[str, str]]] = None
    message: Optional[str] = None


# Health check models
class HealthResponse(BaseModel):
    status: str
    database: bool
    timestamp: datetime 