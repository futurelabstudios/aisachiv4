import logging
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Request, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.schemas import ChatRequest, ChatResponse
from ..services.database_service import database_service
from ..core.database import get_db
from ..utils.openai_helpers import get_openai_response, detect_language

router = APIRouter(prefix="/chat", tags=["chat"])
logger = logging.getLogger(__name__)


def get_session_id_from_request(request: Request) -> str:
    """Extract session ID from request headers or create new one"""
    session_id = request.headers.get("X-Session-ID")
    if not session_id:
        # Generate session ID based on client info
        user_agent = request.headers.get("user-agent", "unknown")
        client_ip = request.client.host if request.client else "unknown"
        session_id = f"{client_ip}_{user_agent}"[:50]
    return session_id


@router.post("/", response_model=ChatResponse)
async def chat(
    request: ChatRequest, 
    http_request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Main chat endpoint - simplified to save complete conversations"""
    try:
        start_time = datetime.now()
        session_id = get_session_id_from_request(http_request)
        
        # Detect language of user input
        input_language = detect_language(request.message)
        
        # Check if language is supported
        if input_language not in ["hindi", "hinglish"]:
            error_response = "मुझे खुशी होगी आपकी मदद करने में! लेकिन मैं सिर्फ हिंदी या हिंग्लिश में बात कर सकता हूं। कृपया इन भाषाओं में से किसी एक में अपना सवाल पूछें।\n\nI'd be happy to help you! But I can only communicate in Hindi or Hinglish. Please ask your question in one of these languages."
            
            return ChatResponse(
                response=error_response,
                timestamp=datetime.now(timezone.utc),
                conversation_id=None
            )
        
        # Get conversation history for context (last 5 conversations)
        conversation_history = await database_service.get_session_conversations(
            db, session_id, limit=5
        )
        
        # Prepare context for OpenAI from previous conversations
        conversation_context = []
        for conv in reversed(conversation_history):  # Most recent last
            conversation_context.extend([
                {"role": "user", "content": conv["user_question"]},
                {"role": "assistant", "content": conv["assistant_answer"]}
            ])
        
        # Get OpenAI response
        response_text = await get_openai_response(
            request.message, 
            conversation_context,
            language=input_language
        )
        
        # Calculate processing time
        processing_time = int((datetime.now() - start_time).total_seconds() * 1000)
        
        # Save the complete conversation (question + answer + response time)
        saved_conversation = await database_service.save_conversation(
            db,
            session_id=session_id,
            user_question=request.message,
            assistant_answer=response_text,
            response_time=processing_time
        )
        
        return ChatResponse(
            response=response_text,
            timestamp=datetime.now(timezone.utc),
            conversation_id=saved_conversation["id"]
        )
        
    except Exception as e:
        logger.error(f"Chat endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history/{session_id}")
async def get_chat_history(
    session_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get chat history for a session"""
    try:
        conversations = await database_service.get_session_conversations(
            db, session_id, limit=50
        )
        
        return {
            "session_id": session_id,
            "conversations": conversations,
            "total_count": len(conversations)
        }
        
    except Exception as e:
        logger.error(f"Error getting chat history: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats/{session_id}")
async def get_session_stats(
    session_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get session statistics"""
    try:
        stats = await database_service.get_session_stats(db, session_id)
        return stats
        
    except Exception as e:
        logger.error(f"Error getting session stats: {e}")
        raise HTTPException(status_code=500, detail=str(e)) 