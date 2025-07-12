import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import Column, String, Integer, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID

from ..core.database import Base


# Simplified SQLAlchemy Model - Single Table
class Conversation(Base):
    __tablename__ = "conversations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(String, nullable=False)
    user_question = Column(Text, nullable=False)
    assistant_answer = Column(Text, nullable=False)
    response_time = Column(Integer, nullable=False)  # Response time in milliseconds
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
