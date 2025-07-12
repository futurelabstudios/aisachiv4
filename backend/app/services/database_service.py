import logging
from uuid import UUID
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from ..models.database import Conversation, User
from ..core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class DatabaseService:
    """User-centric database service for AISachi application"""
    
    def __init__(self):
        self.logger = logger

    async def get_user_by_id(self, session: AsyncSession, user_id: UUID) -> Optional[User]:
        """Get a user by their ID."""
        try:
            result = await session.execute(select(User).where(User.id == user_id))
            return result.scalars().first()
        except Exception as e:
            self.logger.error(f"Error getting user by ID {user_id}: {e}")
            raise

    async def save_conversation(
        self,
        session: AsyncSession,
        user_id: UUID,
        user_question: str,
        assistant_answer: str,
        response_time: int
    ) -> Dict[str, Any]:
        """Save a complete conversation for a user to the database"""
        try:
            conversation = Conversation(
                user_id=user_id,
                user_question=user_question,
                assistant_answer=assistant_answer,
                response_time=response_time
            )
            
            session.add(conversation)
            await session.commit()
            await session.refresh(conversation)
            
            self.logger.info(f"Saved conversation {conversation.id} for user {user_id}")
            
            return {
                "id": str(conversation.id),
                "user_id": str(conversation.user_id),
                "user_question": conversation.user_question,
                "assistant_answer": conversation.assistant_answer,
                "response_time": conversation.response_time,
                "created_at": conversation.created_at
            }
            
        except Exception as e:
            self.logger.error(f"Error saving conversation for user {user_id}: {e}")
            await session.rollback()
            raise

    async def get_user_conversations(
        self, 
        session: AsyncSession,
        user_id: UUID, 
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Get conversation history for a user"""
        try:
            result = await session.execute(
                select(Conversation)
                .where(Conversation.user_id == user_id)
                .order_by(Conversation.created_at.desc())
                .limit(limit)
            )
            conversations = result.scalars().all()
            
            return [
                {
                    "id": str(conv.id),
                    "user_id": str(conv.user_id),
                    "user_question": conv.user_question,
                    "assistant_answer": conv.assistant_answer,
                    "response_time": conv.response_time,
                    "created_at": conv.created_at
                }
                for conv in conversations
            ]
            
        except Exception as e:
            self.logger.error(f"Error getting conversations for user {user_id}: {e}")
            raise

    async def get_user_stats(self, session: AsyncSession, user_id: UUID) -> Dict[str, Any]:
        """Get basic stats for a user"""
        try:
            result = await session.execute(
                select(Conversation)
                .where(Conversation.user_id == user_id)
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
            self.logger.error(f"Error getting user stats: {e}")
            raise


# Create database service instance
database_service = DatabaseService() 