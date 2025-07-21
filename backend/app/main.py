import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
import httpx

from .core.config import get_settings
from .core.database import init_db, close_db
from .routers import chat, health, tts, document, user, auth, admin

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    
    try:
        await init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down application")
    await close_db()


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI Assistant for Rural Government Officials in India",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan
)

# Configure CORS with specific origins (FIXED)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,  # Specific frontend URLs only
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat.router)
app.include_router(health.router)
app.include_router(tts.router)
app.include_router(document.router)
app.include_router(user.router)
app.include_router(auth.router)
app.include_router(admin.router)
# Health check endpoints
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "version": settings.APP_VERSION,
        "status": "healthy"
    }


@app.get("/health")
async def health_check():
    """Application health check"""
    from .core.database import check_db_health
    
    db_healthy = await check_db_health()
    
    return {
        "status": "healthy" if db_healthy else "unhealthy",
        "database": db_healthy,
        "version": settings.APP_VERSION
    }


@app.get("/download-image")
async def download_image(url: str):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            response.raise_for_status()
            
            content_type = response.headers.get('content-type', 'application/octet-stream')
            
            return Response(content=response.content, media_type=content_type)
    except httpx.RequestError as e:
        logger.error(f"Error downloading image: {e}")
        raise HTTPException(status_code=500, detail="Error downloading image from source.")
    except httpx.HTTPStatusError as e:
        logger.error(f"Error downloading image, status code: {e.response.status_code}")
        raise HTTPException(status_code=e.response.status_code, detail="Image source returned an error.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
