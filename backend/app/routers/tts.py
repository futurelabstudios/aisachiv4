import logging
import httpx
from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional

from ..core.config import get_settings

router = APIRouter(prefix="/tts", tags=["text-to-speech"])
logger = logging.getLogger(__name__)

# Get settings from environment
settings = get_settings()

# Indian accent voice IDs
VOICE_IDS = {
    'custom_indian': 'HBwtuRG9VQfaoE2YVMYf', # User's custom Indian accent voice
  
    # Backup Indian English voices
    'indian_male': '21m00Tcm4TlvDq8ikWAM', # Rachel (can be configured for Indian accent)
    'indian_female': 'AZnzlk1XvdvUeBnXmlld', # Domi (can be configured for Indian accent)
    
    # For Hindi content, we'll use multilingual voices
    'hindi_male': 'onwK4e9ZLuTAKqWW03F9', # Daniel (multilingual)
    'hindi_female': 'EXAVITQu4vr4xnSDxMaL', # Bella (multilingual)
    
    # Fallback voices
    'default_male': '21m00Tcm4TlvDq8ikWAM',
    'default_female': 'AZnzlk1XvdvUeBnXmlld'
}

class TTSRequest(BaseModel):
    text: str
    language: str = "hinglish"
    gender: str = "female"
    voice_id: Optional[str] = None

def preprocess_text(text: str, language: str) -> str:
    """Preprocess text for better pronunciation"""
    import re
    processed_text = text
    
    if language == 'hindi':
        # Add pauses after Hindi punctuation
        processed_text = re.sub(r'([।।])', r'\1 ', processed_text)
        processed_text = re.sub(r'([,])', r'\1 ', processed_text)
        processed_text = re.sub(r'(\d+)', r' \1 ', processed_text)
    else:
        # Hinglish/English improvements
        processed_text = processed_text.replace('Sarpanch', 'Sur-punch')
        processed_text = processed_text.replace('Panchayat', 'Pun-cha-yut')
        processed_text = processed_text.replace('Sachiv', 'Su-cheev')
        processed_text = processed_text.replace('Gram', 'Grahm')
        # Add pauses after sentences
        processed_text = re.sub(r'([.!?])', r'\1 ', processed_text)
        processed_text = re.sub(r'(\d+)', r' \1 ', processed_text)
    
    # Remove excessive whitespace
    return re.sub(r'\s+', ' ', processed_text).strip()

def get_voice_settings(language: str):
    """Get optimized voice settings"""
    return {
        "stability": 0.75,
        "similarity_boost": 0.85,
        "style": 0.20,
        "use_speaker_boost": True
    }

@router.post("/synthesize")
async def synthesize_speech(request: TTSRequest):
    """
    Synthesize speech using ElevenLabs API (Secure Proxy)
    Returns audio stream directly without storing files
    """
    try:
        # Preprocess text
        processed_text = preprocess_text(request.text, request.language)
        
        # Select voice ID
        voice_id = request.voice_id or VOICE_IDS.get("custom_indian", VOICE_IDS["indian_female"])
        
        # Get voice settings
        voice_settings = get_voice_settings(request.language)
        
        logger.info(f"TTS request: {len(processed_text)} chars, voice: {voice_id}")
        
        # Prepare ElevenLabs API request (using correct format)
        elevenlabs_url = f"{settings.ELEVENLABS_BASE_URL}/text-to-speech/{voice_id}"
        headers = {
            "Content-Type": "application/json",
            "xi-api-key": settings.ELEVENLABS_API_KEY
        }
        payload = {
            "text": processed_text,
            "model_id": "eleven_multilingual_v2",
            "voice_settings": voice_settings
        }
        
        # Make request to ElevenLabs (stream response)
        async with httpx.AsyncClient() as client:
            response = await client.post(
                elevenlabs_url,
                headers=headers,
                json=payload,
                timeout=30.0
            )
            
            if response.status_code != 200:
                logger.error(f"ElevenLabs API error: {response.status_code}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"ElevenLabs API error: {response.text}"
                )
            
            # Stream audio directly to frontend (no storage)
            return StreamingResponse(
                content=response.iter_bytes(),
                media_type="audio/mpeg",
                headers={
                    "Content-Disposition": "attachment; filename=speech.mp3",
                    "Cache-Control": "no-cache"
                }
            )
            
    except httpx.TimeoutException:
        logger.error("ElevenLabs API timeout")
        raise HTTPException(status_code=504, detail="Text-to-speech service timeout")
    except Exception as e:
        logger.error(f"TTS synthesis error: {e}")
        raise HTTPException(status_code=500, detail="Text-to-speech synthesis failed")

@router.get("/voices")
async def get_available_voices():
    """Get available ElevenLabs voices"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.ELEVENLABS_BASE_URL}/voices",
                headers={"xi-api-key": settings.ELEVENLABS_API_KEY},
                timeout=10.0
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail="Failed to fetch voices"
                )
                
    except Exception as e:
        logger.error(f"Error fetching voices: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch voices")

@router.get("/health")
async def tts_health_check():
    """Check TTS service health"""
    try:
        # Quick API key validation
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.ELEVENLABS_BASE_URL}/voices",
                headers={"xi-api-key": settings.ELEVENLABS_API_KEY},
                timeout=5.0
            )
            
            return {
                "status": "healthy" if response.status_code == 200 else "unhealthy",
                "elevenlabs_api": response.status_code == 200,
                "available_voices": len(VOICE_IDS)
            }
            
    except Exception as e:
        return {
            "status": "unhealthy",
            "elevenlabs_api": False,
            "error": str(e)
        } 