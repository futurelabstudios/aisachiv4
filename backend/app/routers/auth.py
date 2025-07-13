from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.auth_service import supabase_client
from app.models.schemas import UserLogin, Token
from app.core.database import get_session

router = APIRouter(tags=["authentication"])

@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Logs in a user and returns an access token.
    """
    try:
        user_response = supabase_client.auth.sign_in_with_password(
            {"email": form_data.username, "password": form_data.password}
        )
        return {
            "access_token": user_response.session.access_token,
            "token_type": "bearer",
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        ) 