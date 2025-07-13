from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
import logging

from app.services.auth_service import verify_jwt_token
from app.models.schemas import User, UserCreate
from app.services.database_service import database_service
from app.core.database import get_session

oauth2_scheme = HTTPBearer()
logger = logging.getLogger(__name__)

async def get_current_user(
    token: HTTPAuthorizationCredentials = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_session),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = verify_jwt_token(token.credentials)
    if payload is None:
        raise credentials_exception
        
    user_id = payload.get("sub")
    if user_id is None:
        logger.warning("No 'sub' (user_id) in JWT payload.")
        raise credentials_exception
        
    user = await database_service.get_user_by_id(db, user_id=user_id)
    
    if user is None:
        logger.info(f"User with ID {user_id} not found. Creating new user.")
        email = payload.get("email")
        if email is None:
            logger.warning(f"No 'email' in JWT payload for user {user_id}. Cannot create user.")
            raise credentials_exception
            
        new_user_data = UserCreate(id=user_id, email=email)
        try:
            user = await database_service.create_user(db, user=new_user_data)
            logger.info(f"Successfully created and returned new user with ID: {user_id}")
        except Exception as e:
            logger.error(f"Database error while creating user {user_id}: {e}")
            raise credentials_exception

    return user 