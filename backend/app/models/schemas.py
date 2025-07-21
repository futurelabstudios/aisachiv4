from datetime import datetime
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, UUID4, Field, EmailStr
from uuid import UUID


# User and Auth models
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    id: str # Supabase ID is a string in the JWT, not a UUID object initially

class User(UserBase):
    id: UUID
    is_active: bool = True
    is_admin: bool = False  # NEW: Admin role field
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class Conversation(BaseModel):
    id: UUID4
    user_question: str
    assistant_answer: str
    created_at: datetime


# Chat models
class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    timestamp: Optional[datetime] = None


class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[ChatMessage]] = []
    conversation_id: Optional[str] = None


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

# Admin models
class AdminConversationResponse(BaseModel):
    id: UUID4
    user_id: UUID4
    user_email: str
    user_question: str
    assistant_answer: str
    response_time: int
    created_at: datetime
    updated_at: datetime

class AdminUserStats(BaseModel):
    total_users: int
    active_users: int
    total_conversations: int
    avg_response_time: float
    conversations_today: int
    conversations_this_week: int
    conversations_this_month: int

class ConversationFilter(BaseModel):
    user_email: Optional[str] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    min_response_time: Optional[int] = None
    max_response_time: Optional[int] = None
    search_query: Optional[str] = None
    
class ConversationListResponse(BaseModel):
    conversations: List[AdminConversationResponse]
    total_count: int
    page: int
    page_size: int
    total_pages: int

class AdminDashboardStats(BaseModel):
    total_users: int
    active_users: int
    total_conversations: int
    conversations_today: int
    avg_response_time: int 