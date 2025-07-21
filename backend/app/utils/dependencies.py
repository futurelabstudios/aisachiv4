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
    logger.debug(f"Attempting to get current user with token: {token.credentials[:30]}...")
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = verify_jwt_token(token.credentials)
    if payload is None:
        logger.warning("JWT verification failed. Payload is None.")
        raise credentials_exception
    
    logger.debug(f"JWT payload decoded successfully: {payload}")
        
    user_id = payload.get("sub")
    if user_id is None:
        logger.warning("No 'sub' (user_id) in JWT payload.")
        raise credentials_exception
        
    logger.debug(f"Extracted user_id: {user_id}")
    user = await database_service.get_user_by_id(db, user_id=user_id)
    
    if user:
        logger.debug(f"Found user in DB: {user.email}, is_active: {user.is_active}, is_admin: {user.is_admin}")
    
    if user is None:
        logger.info(f"User with ID {user_id} not found. Creating new user.")
        email = payload.get("email")
        if email is None:
            logger.warning(f"No 'email' in JWT payload for user {user_id}. Cannot create user.")
            raise credentials_exception
            
        logger.debug(f"User not found. Creating new user with email: {email}")
        new_user_data = UserCreate(id=user_id, email=email)
        try:
            user = await database_service.create_user(db, user=new_user_data)
            logger.info(f"Successfully created and returned new user with ID: {user_id}")
        except Exception as e:
            logger.error(f"Database error while creating user {user_id}: {e}")
            raise credentials_exception

    if not user.is_active:
        logger.warning(f"Authentication failed for user {user.email} (ID: {user.id}). User is inactive.")
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user")
        
    logger.debug(f"User {user.email} authenticated successfully.")
    return user


async def get_current_active_admin(
    token: HTTPAuthorizationCredentials = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_session),
) -> User:
    logger.debug(f"Attempting to get current active admin with token: {token.credentials[:30]}...")
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = verify_jwt_token(token.credentials)
    if payload is None:
        logger.warning("JWT verification failed. Payload is None.")
        raise credentials_exception
    
    logger.debug(f"JWT payload decoded successfully: {payload}")
        
    user_id = payload.get("sub")
    if user_id is None:
        logger.warning("No 'sub' (user_id) in JWT payload.")
        raise credentials_exception
        
    logger.debug(f"Extracted user_id: {user_id}")
    user = await database_service.get_user_by_id(db, user_id=user_id)
    
    if user:
        logger.debug(f"Found user in DB: {user.email}, is_active: {user.is_active}, is_admin: {user.is_admin}")
    
    if user is None or not user.is_admin:
        logger.warning(f"Authentication failed for user ID {user_id}. User not found or not an admin.")
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
        
    logger.debug(f"Admin {user.email} authenticated successfully.")
    return user