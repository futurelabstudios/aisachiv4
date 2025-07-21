"""Add is_admin field to users table

Revision ID: add_admin_field
Revises: 
Create Date: 2025-07-20 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_admin_field'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add is_admin field to users table and create performance indexes"""
    
    # Add is_admin column to users table
    op.add_column('users', sa.Column('is_admin', sa.Boolean(), nullable=False, server_default='false'))
    
    # Create indexes for performance optimization
    op.create_index('idx_conversations_user_id', 'conversations', ['user_id'])
    op.create_index('idx_conversations_created_at', 'conversations', ['created_at'])
    op.create_index('idx_conversations_response_time', 'conversations', ['response_time'])
    op.create_index('idx_conversations_user_created', 'conversations', ['user_id', 'created_at'])
    
    # Create index for admin users
    op.create_index('idx_users_is_admin', 'users', ['is_admin'])
    
    # Create index for active users
    op.create_index('idx_users_is_active', 'users', ['is_active'])


def downgrade() -> None:
    """Remove is_admin field and indexes"""
    
    # Drop indexes
    op.drop_index('idx_users_is_active')
    op.drop_index('idx_users_is_admin')
    op.drop_index('idx_conversations_user_created')
    op.drop_index('idx_conversations_response_time')
    op.drop_index('idx_conversations_created_at')
    op.drop_index('idx_conversations_user_id')
    
    # Drop is_admin column
    op.drop_column('users', 'is_admin')
