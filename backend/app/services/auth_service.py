import supabase
from jose import jwt, JWTError
from app.core.config import settings
import logging

# Initialize Supabase client
supabase_client: supabase.Client = supabase.create_client(
    settings.SUPABASE_URL, settings.SUPABASE_KEY
)

def verify_jwt_token(token: str) -> dict | None:
    """
    Verify the JWT token using the secret key.
    """

    print(settings.SUPABASE_JWT_SECRET)
    print(token)
    try:
        decoded_token = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated"
        )
        return decoded_token
    except JWTError as e:
        logging.error(f"JWT Validation Error: {e}")
        return None 