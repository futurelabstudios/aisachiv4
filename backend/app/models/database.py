import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, Boolean, func, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from ..core.database import Base

# User model, linked to auth.users
class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)  # Admin role field for dashboard access
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    conversations = relationship("Conversation", back_populates="user")

# Simplified SQLAlchemy Model - Single Table
class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    session_id = Column(UUID(as_uuid=True), nullable=True, index=True, unique=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="conversations")
    interactions = relationship("Interaction", back_populates="conversation", cascade="all, delete-orphan")

# NEW: Interaction model for individual exchanges
class Interaction(Base):
    __tablename__ = "interactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey('conversations.id'), nullable=False)
    
    interaction_type = Column(String(50), default='chat', nullable=False)
    user_question = Column(Text, nullable=False)
    assistant_answer = Column(Text, nullable=False)
    response_time_ms = Column(Integer, nullable=False)
    metadata = Column(JSON, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    conversation = relationship("Conversation", back_populates="interactions")
