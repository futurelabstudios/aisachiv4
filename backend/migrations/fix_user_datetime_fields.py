"""Fix users with null created_at or updated_at fields

Revision ID: fix_user_datetime_fields
Revises: add_admin_field
Create Date: 2025-01-21 16:10:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import text
from datetime import datetime, timezone

# revision identifiers, used by Alembic.
revision = 'fix_user_datetime_fields'
down_revision = 'add_admin_field'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Fix users with null created_at or updated_at fields"""
    
    # Get current timestamp
    current_timestamp = datetime.now(timezone.utc)
    
    # Update users with null created_at
    op.execute(
        text("""
            UPDATE users 
            SET created_at = :timestamp 
            WHERE created_at IS NULL
        """).bindparam(timestamp=current_timestamp)
    )
    
    # Update users with null updated_at
    op.execute(
        text("""
            UPDATE users 
            SET updated_at = :timestamp 
            WHERE updated_at IS NULL
        """).bindparam(timestamp=current_timestamp)
    )
    
    # Make the columns non-nullable if they aren't already
    op.alter_column('users', 'created_at', nullable=False)
    op.alter_column('users', 'updated_at', nullable=False)


def downgrade() -> None:
    """Revert changes - make columns nullable again"""
    op.alter_column('users', 'created_at', nullable=True)
    op.alter_column('users', 'updated_at', nullable=True) 