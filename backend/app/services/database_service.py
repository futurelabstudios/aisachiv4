import logging
from uuid import UUID, uuid4
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, update

from ..models.database import Conversation, User
from ..models.schemas import UserCreate
from ..core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class DatabaseService:
    """User-centric database service for AISachi application"""
    
    def __init__(self):
        self.logger = logger

    async def create_user(self, session: AsyncSession, user: UserCreate) -> User:
        """Create a new user in the database."""
        try:
            # Note: The 'id' from UserCreate is a string, but the DB model expects a UUID.
            # We must convert it here.
            user_uuid = UUID(user.id)
            db_user = User(id=user_uuid, email=user.email)
            session.add(db_user)
            await session.commit()
            await session.refresh(db_user)
            self.logger.info(f"User {user.email} with ID {user.id} created successfully.")
            return db_user
        except Exception as e:
            self.logger.error(f"Error creating user {user.email}: {e}")
            await session.rollback()
            raise

    async def get_user_by_id(self, session: AsyncSession, user_id: str) -> Optional[User]:
        """Get a user by their ID."""
        try:
            user_uuid = UUID(user_id)
            result = await session.execute(select(User).where(User.id == user_uuid))
            return result.scalars().first()
        except (ValueError, TypeError) as e:
            self.logger.error(f"Invalid UUID format for user_id: {user_id}. Error: {e}")
            return None
        except Exception as e:
            self.logger.error(f"Error getting user by ID {user_id}: {e}")
            raise

    async def get_user_conversations(self, db: AsyncSession, user_id: str, limit: int = 10) -> List[Conversation]:
        """Get all conversations for a specific user"""
        user_uuid = UUID(user_id)
        result = await db.execute(
            select(Conversation)
            .where(Conversation.user_id == user_uuid)
            .order_by(Conversation.created_at.desc())
            .limit(limit)
        )
        return result.scalars().all()

    async def get_conversation_by_id(self, db: AsyncSession, conversation_id: str, user_id: str) -> List[Conversation]:
        """Get a specific conversation by its ID"""
        user_uuid = UUID(user_id)
        result = await db.execute(
            select(Conversation).where(
                Conversation.id == conversation_id,
                Conversation.user_id == user_uuid
            )
        )
        return result.scalars().all()

    async def save_conversation(
        self,
        db: AsyncSession,
        user_id: str,
        user_question: str,
        assistant_answer: str,
        response_time: int,
    ) -> Conversation:
        """Save a new conversation to the database"""
        user_uuid = UUID(user_id)
        new_conversation = Conversation(
            id=uuid4(),
            user_id=user_uuid,
            user_question=user_question,
            assistant_answer=assistant_answer,
            response_time=response_time,
        )
        db.add(new_conversation)
        await db.commit()
        await db.refresh(new_conversation)
        return new_conversation

    async def update_conversation(
        self,
        db: AsyncSession,
        conversation_id: str,
        assistant_answer: str,
        response_time: int
    ):
        """Update an existing conversation"""
        await db.execute(
            update(Conversation)
            .where(Conversation.id == conversation_id)
            .values(
                assistant_answer=assistant_answer,
                response_time=response_time,
                updated_at=datetime.now(timezone.utc)
            )
        )
        await db.commit()

    async def get_user_stats(self, db: AsyncSession, user_id: str):
        """Get usage statistics for a user"""
        try:
            user_uuid = UUID(user_id)
            result = await db.execute(
                select(Conversation)
                .where(Conversation.user_id == user_uuid)
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