import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.schemas import HealthResponse
from ..core.database import get_db, check_db_health

router = APIRouter(prefix="/health", tags=["health"])
logger = logging.getLogger(__name__)


@router.get("/", response_model=HealthResponse)
async def health_check():
    """Application health check"""
    db_healthy = await check_db_health()
    
    return HealthResponse(
        status="healthy" if db_healthy else "unhealthy",
        database=db_healthy,
        timestamp=datetime.now(timezone.utc)
    )


@router.get("/database")
async def check_database_health():
    """Detailed database health check"""
    try:
        db_healthy = await check_db_health()
        
        if db_healthy:
            return {
                "status": "healthy",
                "message": "Database connection successful",
                "timestamp": datetime.now(timezone.utc)
            }
        else:
            return {
                "status": "unhealthy", 
                "message": "Database connection failed",
                "timestamp": datetime.now(timezone.utc)
            }
    except Exception as e:
        logger.error(f"Database health check error: {e}")
        return {
            "status": "error",
            "message": str(e),
            "timestamp": datetime.now(timezone.utc)
        } 