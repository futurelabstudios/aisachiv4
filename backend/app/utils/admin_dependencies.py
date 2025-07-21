from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from app.models.schemas import User
from app.utils.dependencies import get_current_user
from app.core.database import get_session

logger = logging.getLogger(__name__)

async def require_admin(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
) -> User:
    """
    Dependency that requires the current user to be an admin.
    Raises HTTP 403 if user is not an admin.
    """
    if not current_user.is_admin:
        logger.warning(f"Non-admin user {current_user.email} attempted to access admin endpoint")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    logger.info(f"Admin user {current_user.email} accessing admin endpoint")
    return current_user

async def get_admin_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Get current user and verify admin status without raising exception.
    Returns user with is_admin flag for conditional logic.
    """
    return current_user
