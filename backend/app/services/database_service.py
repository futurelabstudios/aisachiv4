import logging
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from ..models.database import Conversation
from ..core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class DatabaseService:
    """Simplified database service for AISachi application"""
    
    def __init__(self):
        self.logger = logger

    async def save_conversation(
        self,
        session: AsyncSession,
        session_id: str,
        user_question: str,
        assistant_answer: str,
        response_time: int
    ) -> Dict[str, Any]:
        """Save a complete conversation (question + answer) to database"""
        try:
            conversation = Conversation(
                session_id=session_id,
                user_question=user_question,
                assistant_answer=assistant_answer,
                response_time=response_time
            )
            
            session.add(conversation)
            await session.commit()
            await session.refresh(conversation)
            
            self.logger.info(f"Saved conversation {conversation.id} for session {session_id}")
            
            return {
                "id": str(conversation.id),
                "session_id": conversation.session_id,
                "user_question": conversation.user_question,
                "assistant_answer": conversation.assistant_answer,
                "response_time": conversation.response_time,
                "created_at": conversation.created_at
            }
            
        except Exception as e:
            self.logger.error(f"Error saving conversation: {e}")
            await session.rollback()
            raise

    async def get_session_conversations(
        self, 
        session: AsyncSession,
        session_id: str, 
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Get conversation history for a session"""
        try:
            result = await session.execute(
                select(Conversation)
                .where(Conversation.session_id == session_id)
                .order_by(Conversation.created_at.desc())
                .limit(limit)
            )
            conversations = result.scalars().all()
            
            return [
                {
                    "id": str(conv.id),
                    "session_id": conv.session_id,
                    "user_question": conv.user_question,
                    "assistant_answer": conv.assistant_answer,
                    "response_time": conv.response_time,
                    "created_at": conv.created_at
                }
                for conv in conversations
            ]
            
        except Exception as e:
            self.logger.error(f"Error getting session conversations: {e}")
            raise

    async def cleanup_old_conversations(self, session: AsyncSession, days: int = 30) -> int:
        """Cleanup old conversations (older than specified days)"""
        try:
            from datetime import timedelta
            cutoff_date = datetime.now(timezone.utc) - timedelta(days=days)
            
            result = await session.execute(
                delete(Conversation).where(Conversation.created_at < cutoff_date)
            )
            
            deleted_count = result.rowcount
            await session.commit()
            
            self.logger.info(f"Cleaned up {deleted_count} old conversations")
            return deleted_count
            
        except Exception as e:
            self.logger.error(f"Error cleaning up conversations: {e}")
            await session.rollback()
            raise

    async def get_session_stats(self, session: AsyncSession, session_id: str) -> Dict[str, Any]:
        """Get basic stats for a session"""
        try:
            result = await session.execute(
                select(Conversation)
                .where(Conversation.session_id == session_id)
                .order_by(Conversation.created_at.asc())
            )
            conversations = result.scalars().all()
            
            if not conversations:
                return {
                    "total_conversations": 0,
                    "first_conversation": None,
                    "last_conversation": None,
                    "average_response_time": 0
                }
            
            total_response_time = sum(conv.response_time for conv in conversations)
            average_response_time = total_response_time / len(conversations)
            
            return {
                "total_conversations": len(conversations),
                "first_conversation": conversations[0].created_at,
                "last_conversation": conversations[-1].created_at,
                "average_response_time": round(average_response_time, 2)
            }
            
        except Exception as e:
            self.logger.error(f"Error getting session stats: {e}")
            raise


# Create database service instance
database_service = DatabaseService() 