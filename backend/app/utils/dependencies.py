from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.services.auth_service import verify_jwt_token
from app.models.schemas import User, TokenData
from app.services.database_service import database_service
from app.core.database import get_session

oauth2_scheme = HTTPBearer()

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
        raise credentials_exception
        
    token_data = TokenData(user_id=UUID(user_id))
    
    user = await database_service.get_user_by_id(db, user_id=token_data.user_id)
    if user is None:
        raise credentials_exception
        
    return user 