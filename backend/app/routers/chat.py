import logging
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Request, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.responses import StreamingResponse
from typing import List

from ..models.schemas import ChatRequest, User, Conversation as ConversationSchema
from ..services.database_service import database_service
from ..core.database import get_session
from ..utils.openai_helpers import get_openai_response, detect_language
from ..utils.dependencies import get_current_user

router = APIRouter(prefix="/chat", tags=["chat"])
logger = logging.getLogger(__name__)


@router.post("/")
async def chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """Main chat endpoint - now user-centric"""
    try:
        start_time = datetime.now()
        
        # Detect language of user input
        input_language = detect_language(request.message)
        
        # Check if language is supported
        if input_language not in ["hindi", "hinglish"]:
            error_response = "मुझे खुशी होगी आपकी मदद करने में! लेकिन मैं सिर्फ हिंदी या हिंग्लिश में बात कर सकता हूं। कृपया इन भाषाओं में से किसी एक में अपना सवाल पूछें।\n\nI'd be happy to help you! But I can only communicate in Hindi or Hinglish. Please ask your question in one of these languages."
            
            async def error_stream():
                yield error_response
            return StreamingResponse(error_stream(), media_type="text/plain")
        
        # Get conversation history for context (last 5 conversations)
        conversation_history = await database_service.get_user_conversations(
            db, current_user.id, limit=5
        )
        
        # Prepare context for OpenAI from previous conversations
        conversation_context = []
        for conv in reversed(conversation_history):  # Most recent last
            conversation_context.extend([
                {"role": "user", "content": conv["user_question"]},
                {"role": "assistant", "content": conv["assistant_answer"]}
            ])
        
        async def stream_generator():
            full_response = ""
            try:
                # Get OpenAI response stream
                response_stream = get_openai_response(
                    request.message, 
                    conversation_context,
                    language=input_language
                )
                
                async for chunk in response_stream:
                    full_response += chunk
                    yield chunk
            
            finally:
                # This block will run even if the client disconnects
                processing_time = int((datetime.now() - start_time).total_seconds() * 1000)
                
                # Use the same db session
                await database_service.save_conversation(
                    db,
                    user_id=current_user.id,
                    user_question=request.message,
                    assistant_answer=full_response,
                    response_time=processing_time
                )

        return StreamingResponse(stream_generator(), media_type="text/plain")
        
    except Exception as e:
        logger.error(f"Chat endpoint error: {e}")
        async def exception_stream():
            yield "An unexpected error occurred."
        return StreamingResponse(exception_stream(), media_type="text/plain", status_code=500)


@router.get("/history", response_model=List[ConversationSchema])
async def get_chat_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """Get chat history for the current user"""
    try:
        conversations = await database_service.get_user_conversations(
            db, current_user.id, limit=100
        )
        return conversations
        
    except Exception as e:
        logger.error(f"Error getting chat history for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats")
async def get_user_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """Get user statistics"""
    try:
        stats = await database_service.get_user_stats(db, current_user.id)
        return stats
        
    except Exception as e:
        logger.error(f"Error getting stats for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail=str(e)) 