import logging
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Request, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.responses import StreamingResponse
from typing import List
import json

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
    """Main chat endpoint - now user-centric and conversation-aware"""
    try:
        start_time = datetime.now()
        
        # Detect language of user input
        input_language = detect_language(request.message)
        
        # Check if language is supported
        if input_language not in ["hindi", "hinglish"]:
            error_response = "मुझे खुशी होगी आपकी मदद करने में! लेकिन मैं सिर्फ हिंदी या हिंग्लिश में बात कर सकता हूं। कृपया इन भाषाओं में से किसी एक में अपना सवाल पूछें।\n\nI'd be happy to help you! But I can only communicate in Hindi or Hinglish. Please ask your question in one of these languages."
            
            async def error_stream():
                # Format error as an SSE message
                yield f"data: {json.dumps({'error': error_response})}\n\n"
            return StreamingResponse(error_stream(), media_type="text/event-stream")
        
        # Get conversation history for context
        if request.conversation_id:
            conversation_history = await database_service.get_conversation_by_id(
                db, request.conversation_id, str(current_user.id)
            )
        else:
            conversation_history = []
        
        # Prepare context for OpenAI from previous conversations
        conversation_context = []
        for conv in conversation_history:
            conversation_context.extend([
                {"role": "user", "content": conv.user_question},
                {"role": "assistant", "content": conv.assistant_answer}
            ])
        
        async def stream_generator():
            full_response = ""
            new_conversation_id = request.conversation_id

            try:
                # If it's a new chat, create the conversation entry first to get an ID
                if not new_conversation_id:
                    saved_conv = await database_service.save_conversation(
                        db,
                        user_id=str(current_user.id),
                        user_question=request.message,
                        assistant_answer="", # Save empty first
                        response_time=0
                    )
                    new_conversation_id = str(saved_conv.id)
                
                # Send the conversation_id as the first event
                yield f"event: conversation_id\ndata: {new_conversation_id}\n\n"
                
                response_stream = get_openai_response(
                    request.message, 
                    conversation_context,
                    language=input_language
                )
                
                async for chunk in response_stream:
                    if chunk:
                        full_response += chunk
                        # Send each chunk as a data-only SSE message
                        # Use json.dumps to handle special characters like newlines correctly
                        yield f"data: {json.dumps(chunk)}\n\n"
            
            finally:
                # Update the conversation with the full response at the end
                if new_conversation_id:
                    processing_time = int((datetime.now() - start_time).total_seconds() * 1000)
                    await database_service.update_conversation(
                        db,
                        conversation_id=new_conversation_id,
                        assistant_answer=full_response,
                        response_time=processing_time
                    )
        
        # Use text/event-stream media type
        return StreamingResponse(stream_generator(), media_type="text/event-stream")
        
    except Exception as e:
        logger.error(f"Chat endpoint error: {e}")
        async def exception_stream():
            error_data = {"error": "An unexpected error occurred."}
            yield f"data: {json.dumps(error_data)}\n\n"
        return StreamingResponse(exception_stream(), media_type="text/event-stream", status_code=500)



@router.get("/history", response_model=List[ConversationSchema])
async def get_chat_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """Get chat history for the current user"""
    try:
        conversations = await database_service.get_user_conversations(
            db, str(current_user.id), limit=100
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
        stats = await database_service.get_user_stats(db, str(current_user.id))
        return stats
        
    except Exception as e:
        logger.error(f"Error getting stats for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail=str(e)) 