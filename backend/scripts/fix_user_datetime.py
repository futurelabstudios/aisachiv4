#!/usr/bin/env python3
"""
Standalone script to fix users with null created_at or updated_at fields.
This script can be run directly to fix the datetime validation issue.
"""

import asyncio
import logging
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, text

# Add the backend directory to Python path
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import engine, AsyncSessionLocal
from app.models.database import User

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def fix_user_datetime_fields():
    """Fix users with null created_at or updated_at fields."""
    
    async with AsyncSessionLocal() as session:
        try:
            current_timestamp = datetime.now(timezone.utc)
            
            # Check for users with null created_at
            result = await session.execute(
                select(User).where(User.created_at.is_(None))
            )
            users_without_created_at = result.scalars().all()
            
            if users_without_created_at:
                logger.info(f"Found {len(users_without_created_at)} users without created_at")
                await session.execute(
                    update(User)
                    .where(User.created_at.is_(None))
                    .values(created_at=current_timestamp)
                )
            else:
                logger.info("No users found with null created_at")
            
            # Check for users with null updated_at
            result = await session.execute(
                select(User).where(User.updated_at.is_(None))
            )
            users_without_updated_at = result.scalars().all()
            
            if users_without_updated_at:
                logger.info(f"Found {len(users_without_updated_at)} users without updated_at")
                await session.execute(
                    update(User)
                    .where(User.updated_at.is_(None))
                    .values(updated_at=current_timestamp)
                )
            else:
                logger.info("No users found with null updated_at")
            
            # Commit the changes
            await session.commit()
            logger.info("Successfully updated users with missing datetime fields")
            
            # Verify the fix
            result = await session.execute(
                select(User.id, User.email, User.created_at, User.updated_at)
                .where(User.created_at.is_(None) | User.updated_at.is_(None))
            )
            remaining_issues = result.all()
            
            if remaining_issues:
                logger.warning(f"Still found {len(remaining_issues)} users with null datetime fields")
                for user in remaining_issues:
                    logger.warning(f"User {user.email} ({user.id}): created_at={user.created_at}, updated_at={user.updated_at}")
            else:
                logger.info("All users now have valid datetime fields")
                
        except Exception as e:
            logger.error(f"Error fixing user datetime fields: {e}")
            await session.rollback()
            raise
        finally:
            await session.close()


async def main():
    """Main function to run the fix."""
    logger.info("Starting fix for user datetime fields...")
    await fix_user_datetime_fields()
    logger.info("Fix completed successfully")


if __name__ == "__main__":
    asyncio.run(main()) 