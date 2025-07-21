import logging
from uuid import UUID, uuid4
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, update, func, desc, asc, or_

from ..models.database import Conversation, User
from ..models.schemas import UserCreate, ConversationFilter
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
            current_time = datetime.now(timezone.utc)
            db_user = User(
                id=user_uuid, 
                email=user.email,
                created_at=current_time,
                updated_at=current_time
            )
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
        try:
            user_uuid = UUID(user_id)
            conversation = Conversation(
                user_id=user_uuid,
                user_question=user_question,
                assistant_answer=assistant_answer,
                response_time=response_time,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc)
            )
            db.add(conversation)
            await db.commit()
            await db.refresh(conversation)
            self.logger.info(f"Conversation saved for user {user_id}")
            return conversation
        except Exception as e:
            self.logger.error(f"Error saving conversation for user {user_id}: {e}")
            await db.rollback()
            raise

    async def update_conversation(
        self,
        db: AsyncSession,
        conversation_id: str,
        assistant_answer: str,
        response_time: int,
    ) -> bool:
        """Update an existing conversation with the final response"""
        try:
            conversation_uuid = UUID(conversation_id)
            result = await db.execute(
                update(Conversation)
                .where(Conversation.id == conversation_uuid)
                .values(
                    assistant_answer=assistant_answer,
                    response_time=response_time,
                    updated_at=datetime.now(timezone.utc)
                )
            )
            await db.commit()
            return result.rowcount > 0
        except Exception as e:
            self.logger.error(f"Error updating conversation {conversation_id}: {e}")
            await db.rollback()
            raise

    async def delete_conversation(self, db: AsyncSession, conversation_id: str, user_id: str) -> bool:
        """Delete a conversation"""
        try:
            conversation_uuid = UUID(conversation_id)
            user_uuid = UUID(user_id)
            result = await db.execute(
                delete(Conversation).where(
                    Conversation.id == conversation_uuid,
                    Conversation.user_id == user_uuid
                )
            )
            await db.commit()
            return result.rowcount > 0
        except Exception as e:
            self.logger.error(f"Error deleting conversation {conversation_id}: {e}")
            await db.rollback()
            raise

    async def get_user_stats(self, db: AsyncSession, user_id: str) -> Dict[str, Any]:
        """Get statistics for a specific user"""
        try:
            user_uuid = UUID(user_id)
            
            # Get total conversations
            total_conversations_result = await db.execute(
                select(func.count(Conversation.id)).where(Conversation.user_id == user_uuid)
            )
            total_conversations = total_conversations_result.scalar()
            
            # Get average response time
            avg_response_time_result = await db.execute(
                select(func.avg(Conversation.response_time)).where(Conversation.user_id == user_uuid)
            )
            avg_response_time = avg_response_time_result.scalar()
            
            # Get most recent conversation
            recent_conversation_result = await db.execute(
                select(Conversation.created_at)
                .where(Conversation.user_id == user_uuid)
                .order_by(Conversation.created_at.desc())
                .limit(1)
            )
            recent_conversation = recent_conversation_result.scalar()
            
            return {
                "total_conversations": total_conversations or 0,
                "avg_response_time": int(avg_response_time) if avg_response_time else 0,
                "last_conversation": recent_conversation.isoformat() if recent_conversation else None
            }
        except Exception as e:
            self.logger.error(f"Error getting user stats for {user_id}: {e}")
            raise

    # Admin-specific methods
    async def get_all_conversations_admin(
        self, 
        db: AsyncSession, 
        skip: int = 0, 
        limit: int = 100,
        sort_by: str = "created_at",
        sort_order: str = "desc",
        filters: Optional[ConversationFilter] = None
    ) -> Tuple[List[Dict[str, Any]], int]:
        """Get all conversations with user details for admin dashboard"""
        try:
            # Base query with user join
            query = select(Conversation, User.email).join(User, Conversation.user_id == User.id)
            
            # Apply filters
            if filters:
                if filters.user_email:
                    query = query.where(User.email.ilike(f"%{filters.user_email}%"))
                if filters.date_from:
                    query = query.where(Conversation.created_at >= filters.date_from)
                if filters.date_to:
                    query = query.where(Conversation.created_at <= filters.date_to)
                if filters.min_response_time:
                    query = query.where(Conversation.response_time >= filters.min_response_time)
                if filters.max_response_time:
                    query = query.where(Conversation.response_time <= filters.max_response_time)
                if filters.search_query:
                    search_term = f"%{filters.search_query}%"
                    query = query.where(
                        or_(
                            Conversation.user_question.ilike(search_term),
                            Conversation.assistant_answer.ilike(search_term)
                        )
                    )
            
            # Get total count
            count_query = select(func.count()).select_from(query.subquery())
            total_result = await db.execute(count_query)
            total_count = total_result.scalar()
            
            # Apply sorting
            sort_column = getattr(Conversation, sort_by, Conversation.created_at)
            if sort_order.lower() == "desc":
                query = query.order_by(desc(sort_column))
            else:
                query = query.order_by(asc(sort_column))
            
            # Apply pagination
            query = query.offset(skip).limit(limit)
            
            result = await db.execute(query)
            conversations_data = []
            
            for conversation, user_email in result:
                conversations_data.append({
                    "id": str(conversation.id),
                    "user_id": str(conversation.user_id),
                    "user_email": user_email,
                    "user_question": conversation.user_question,
                    "assistant_answer": conversation.assistant_answer,
                    "response_time": conversation.response_time,
                    "created_at": conversation.created_at,
                    "updated_at": conversation.updated_at
                })
            
            return conversations_data, total_count
            
        except Exception as e:
            self.logger.error(f"Error getting all conversations for admin: {e}")
            raise

    async def get_dashboard_stats(self, db: AsyncSession) -> Dict[str, Any]:
        """Get overall dashboard statistics for admin"""
        try:
            # Date calculations
            now = datetime.now(timezone.utc)
            today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
            week_start = today_start - timedelta(days=7)
            month_start = today_start - timedelta(days=30)
            
            # Total users
            total_users_result = await db.execute(select(func.count(User.id)))
            total_users = total_users_result.scalar()
            
            # Total conversations
            total_conversations_result = await db.execute(select(func.count(Conversation.id)))
            total_conversations = total_conversations_result.scalar()
            
            # Today's conversations
            today_conversations_result = await db.execute(
                select(func.count(Conversation.id))
                .where(Conversation.created_at >= today_start)
            )
            today_conversations = today_conversations_result.scalar()
            
            # This week's conversations
            week_conversations_result = await db.execute(
                select(func.count(Conversation.id))
                .where(Conversation.created_at >= week_start)
            )
            week_conversations = week_conversations_result.scalar()
            
            # This month's conversations
            month_conversations_result = await db.execute(
                select(func.count(Conversation.id))
                .where(Conversation.created_at >= month_start)
            )
            month_conversations = month_conversations_result.scalar()
            
            # Average response time
            avg_response_time_result = await db.execute(
                select(func.avg(Conversation.response_time))
            )
            avg_response_time = avg_response_time_result.scalar()
            
            # Active users (users with conversations in last 30 days)
            active_users_result = await db.execute(
                select(func.count(func.distinct(Conversation.user_id)))
                .where(Conversation.created_at >= month_start)
            )
            active_users = active_users_result.scalar()
            
            return {
                "total_users": total_users or 0,
                "total_conversations": total_conversations or 0,
                "today_conversations": today_conversations or 0,
                "week_conversations": week_conversations or 0,
                "month_conversations": month_conversations or 0,
                "avg_response_time": int(avg_response_time) if avg_response_time else 0,
                "active_users": active_users or 0
            }
            
        except Exception as e:
            self.logger.error(f"Error getting dashboard stats: {e}")
            raise

    async def get_users_with_conversation_count(
        self, 
        db: AsyncSession, 
        skip: int = 0, 
        limit: int = 100,
        sort_by: str = "created_at",
        sort_order: str = "desc"
    ) -> Tuple[List[Dict[str, Any]], int]:
        """Get all users with their conversation count for admin dashboard"""
        try:
            # Subquery for conversation count
            conversation_count_subq = (
                select(
                    Conversation.user_id,
                    func.count(Conversation.id).label("conversation_count"),
                    func.max(Conversation.created_at).label("last_conversation")
                )
                .group_by(Conversation.user_id)
                .subquery()
            )
            
            # Main query with left join to include users with no conversations
            query = select(
                User,
                func.coalesce(conversation_count_subq.c.conversation_count, 0).label("conversation_count"),
                conversation_count_subq.c.last_conversation
            ).outerjoin(conversation_count_subq, User.id == conversation_count_subq.c.user_id)
            
            # Get total count
            count_query = select(func.count(User.id))
            total_result = await db.execute(count_query)
            total_count = total_result.scalar()
            
            # Apply sorting
            if sort_by == "conversation_count":
                if sort_order.lower() == "desc":
                    query = query.order_by(desc("conversation_count"))
                else:
                    query = query.order_by(asc("conversation_count"))
            else:
                sort_column = getattr(User, sort_by, User.created_at)
                if sort_order.lower() == "desc":
                    query = query.order_by(desc(sort_column))
                else:
                    query = query.order_by(asc(sort_column))
            
            # Apply pagination
            query = query.offset(skip).limit(limit)
            result = await db.execute(query)
            
            users_data = []
            for row in result:
                users_data.append({
                    "id": str(row.id),
                    "email": row.email,
                    "is_active": row.is_active,
                    "is_admin": row.is_admin,
                    "created_at": row.created_at,
                    "conversation_count": row.conversation_count,
                    "last_conversation": row.last_conversation
                })
            
            return users_data, total_count
            
        except Exception as e:
            self.logger.error(f"Error getting users with conversation count: {e}")
            raise

    async def toggle_user_admin_status(self, db: AsyncSession, user_id: str) -> Optional[User]:
        """Toggle admin status for a user"""
        try:
            user_uuid = UUID(user_id)
            
            # Get current user
            result = await db.execute(select(User).where(User.id == user_uuid))
            user = result.scalars().first()
            
            if not user:
                return None
            
            # Toggle admin status
            new_admin_status = not user.is_admin
            await db.execute(
                update(User)
                .where(User.id == user_uuid)
                .values(is_admin=new_admin_status)
            )
            await db.commit()
            
            # Refresh and return updated user
            await db.refresh(user)
            return user
            
        except Exception as e:
            self.logger.error(f"Error toggling admin status for user {user_id}: {e}")
            await db.rollback()
            raise


# Create a single instance to use throughout the application
database_service = DatabaseService()