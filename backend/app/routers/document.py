from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import re
import base64
from openai import OpenAI
from ..core.config import get_settings
from ..utils.openai_helpers import analyze_document_with_assistant, ask_document_question, cleanup_document_resources
import io

router = APIRouter(tags=["document"])
settings = get_settings()
client = OpenAI(api_key=settings.OPENAI_API_KEY)


class DocumentAnalysisRequest(BaseModel):
    image_data: Optional[str] = None  # Base64 encoded image
    image_url: Optional[str] = None   # Image URL (fallback for generated images)
    document_type: Optional[str] = None
    question: Optional[str] = None
    language: str = "hinglish"


class DocumentAnalysisResponse(BaseModel):
    success: bool
    analysis: Optional[Dict[str, Any]] = None
    answer: Optional[str] = None
    message: Optional[str] = None
    # Add persistent resource IDs for follow-up questions
    assistant_id: Optional[str] = None
    thread_id: Optional[str] = None
    file_id: Optional[str] = None


class DocumentQuestionRequest(BaseModel):
    question: str
    assistant_id: str
    thread_id: str
    language: str = "hinglish"


class DocumentQuestionResponse(BaseModel):
    success: bool
    answer: Optional[str] = None
    message: Optional[str] = None


class DocumentCleanupRequest(BaseModel):
    assistant_id: str
    thread_id: str
    file_id: str


class ImageGenerationRequest(BaseModel):
    prompt: str
    language: str = "hinglish"


class ImageGenerationResponse(BaseModel):
    success: bool
    image_url: Optional[str] = None
    message: Optional[str] = None


async def fetch_image_from_url(image_url: str) -> str:
    """Fetch image from URL and convert to base64"""
    try:
        import httpx
        
        print(f"🌐 Fetching image from URL: {image_url}")
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(image_url)
            response.raise_for_status()
            
            # Get image data
            image_data = response.content
            
            # Convert to base64
            base64_data = base64.b64encode(image_data).decode('utf-8')
            
            print(f"✅ Successfully fetched and converted image ({len(image_data)} bytes)")
            return base64_data
            
    except Exception as e:
        print(f"❌ Error fetching image from URL: {e}")
        raise HTTPException(
            status_code=400, 
            detail=f"Failed to fetch image from URL: {str(e)}"
        )

async def generate_image_with_openai(prompt: str, language: str) -> str:
    """Generate image using OpenAI DALL-E API"""
    try:
        # Enhanced prompt for government-appropriate content
        if language == "hindi":
            enhanced_prompt = f"""सरकारी प्रस्तुति के लिए उपयुक्त, व्यावसायिक और शिक्षाप्रद छवि: {prompt}। 
            स्वच्छ, सरल और स्पष्ट डिज़ाइन। ग्रामीण भारत के संदर्भ में। पारंपरिक रंगों का उपयोग।"""
        else:
            enhanced_prompt = f"""Professional, educational image suitable for government presentation: {prompt}. 
            Clean, simple and clear design. In the context of rural India. Use traditional colors."""
        
        # Call OpenAI DALL-E API
        try:
            # Try DALL-E 3 first
            response = client.images.generate(
                model="dall-e-3",
                prompt=enhanced_prompt[:1000],  # DALL-E has prompt limits
                size="1024x1024",
                quality="standard",
                n=1
            )
            return response.data[0].url
        except Exception as e:
            # Fallback to DALL-E 2 if DALL-E 3 not available
            print(f"DALL-E 3 failed, trying DALL-E 2: {e}")
            try:
                response = client.images.generate(
                    model="dall-e-2",
                    prompt=enhanced_prompt[:1000],
                    size="1024x1024",
                    n=1
                )
                return response.data[0].url
            except Exception as e2:
                print(f"DALL-E 2 also failed: {e2}")
                raise HTTPException(
                    status_code=503, 
                    detail="Image generation service temporarily unavailable. Please try again later."
                )
        
    except Exception as e:
        print(f"Error in OpenAI image generation: {e}")
        # Return a government-themed placeholder
        if language == "hindi":
            placeholder_text = "सरकारी इन्फोग्राफिक"
        else:
            placeholder_text = "Government Infographic"
        
        return f"https://via.placeholder.com/1024x1024/2F855A/ffffff?text={placeholder_text.replace(' ', '%20')}"


def validate_image_prompt(prompt: str, language: str) -> Dict[str, Any]:
    """Validate image prompt for appropriate content"""
    # Check for inappropriate keywords
    inappropriate_keywords = [
        'violence', 'weapon', 'explicit', 'sexual', 'hate', 'discrimination',
        'हिंसा', 'हथियार', 'अश्लील', 'यौन', 'घृणा', 'भेदभाव'
    ]
    
    prompt_lower = prompt.lower()
    for keyword in inappropriate_keywords:
        if keyword in prompt_lower:
            return {
                "is_appropriate": False,
                "reason": "Inappropriate content detected" if language == "hinglish" 
                         else "अनुचित सामग्री का पता चला",
                "suggestion": "Please provide a description suitable for government/educational content" 
                            if language == "hinglish" 
                            else "कृपया सरकारी/शैक्षणिक सामग्री के लिए उपयुक्त विवरण प्रदान करें"
            }
    
    return {
        "is_appropriate": True,
        "enhanced_prompt": prompt
    }


@router.post("/document", response_model=DocumentAnalysisResponse)
async def analyze_document(request: DocumentAnalysisRequest):
    """
    Analyze uploaded documents using OpenAI Vision API
    """
    try:
        print(f"📥 Document analysis request received")
        print(f"🌍 Language: {request.language}")
        print(f"📋 Has image_data: {bool(request.image_data)}")
        print(f"🌐 Has image_url: {bool(request.image_url)}")
        print(f"📑 Document type: {request.document_type}")
        print(f"❓ Question: {request.question}")
        
        language = request.language or "hinglish"
        
        # Handle both image_data (base64) and image_url cases
        image_data = None
        
        if request.image_data:
            print("📋 Using provided base64 image data")
            print(f"📊 Image data length: {len(request.image_data)} characters")
            image_data = request.image_data
        elif request.image_url:
            print("🌐 Fetching image from URL")
            print(f"🔗 URL: {request.image_url}")
            image_data = await fetch_image_from_url(request.image_url)
        else:
            print("❌ No image data or URL provided")
            return DocumentAnalysisResponse(
                success=False,
                message="No image data or URL provided" if language == "hinglish" 
                       else "कोई छवि डेटा या URL प्रदान नहीं किया गया"
            )
        
        # Analyze document using OpenAI Assistant
        print(f"🎯 Starting document analysis with Assistant API...")
        analysis_result = await analyze_document_with_assistant(
            file_data_base64=image_data, 
            language=language, 
            question=request.question
        )
        print(f"✅ Analysis completed successfully")
        print(f"📋 Result type: {analysis_result.get('document_type', 'Unknown')}")
        print(f"📝 Main info: {analysis_result.get('main_information', 'No info')[:100]}...")
        
        # The answer is now part of the main_information from the assistant
        answer = analysis_result.get('main_information')

        response = DocumentAnalysisResponse(
            success=True,
            analysis=analysis_result,
            answer=answer,
            message="Document analyzed successfully" if language == "hinglish" 
                   else "दस्तावेज़ का विश्लेषण सफलतापूर्वक पूरा हुआ",
            assistant_id=analysis_result.get('assistant_id'),
            thread_id=analysis_result.get('thread_id'),
            file_id=analysis_result.get('file_id')
        )
        
        print(f"📤 Sending successful response")
        return response

    except Exception as e:
        print(f"❌ Error in document analysis endpoint: {type(e).__name__}: {str(e)}")
        error_msg = f"Error analyzing document: {str(e)}"
        return DocumentAnalysisResponse(
            success=False, 
            message=error_msg if request.language == "hinglish" 
                   else f"दस्तावेज़ विश्लेषण में त्रुटि: {str(e)}"
        )


@router.post("/generate-image", response_model=ImageGenerationResponse)
async def generate_image(request: ImageGenerationRequest):
    """
    Generate infographic/image using OpenAI DALL-E API
    """
    try:
        # Validate prompt
        validation = validate_image_prompt(request.prompt, request.language)
        
        if not validation["is_appropriate"]:
            return ImageGenerationResponse(
                success=False,
                message=f"{validation['reason']}. {validation['suggestion']}"
            )
        
        # Generate image using OpenAI DALL-E
        image_url = await generate_image_with_openai(request.prompt, request.language)
        
        return ImageGenerationResponse(
            success=True,
            image_url=image_url,
            message="Image generated successfully" if request.language == "hinglish" 
                   else "छवि सफलतापूर्वक बनाई गई"
        )

    except Exception as e:
        error_msg = f"Error generating image: {str(e)}"
        return ImageGenerationResponse(
            success=False, 
            message=error_msg if request.language == "hinglish" 
                   else f"छवि बनाने में त्रुटि: {str(e)}"
        )


@router.post("/document/question", response_model=DocumentQuestionResponse)
async def ask_document_question_endpoint(request: DocumentQuestionRequest):
    """
    Ask a follow-up question about a previously analyzed document
    """
    try:
        print(f"💬 Document question request received")
        print(f"🎯 Assistant ID: {request.assistant_id}")
        print(f"🧵 Thread ID: {request.thread_id}")
        print(f"❓ Question: {request.question}")
        print(f"🌍 Language: {request.language}")
        
        # Ask the question using the existing assistant and thread
        answer = await ask_document_question(
            question=request.question,
            assistant_id=request.assistant_id,
            thread_id=request.thread_id,
            language=request.language
        )
        
        return DocumentQuestionResponse(
            success=True,
            answer=answer,
            message="Question answered successfully" if request.language == "hinglish"
                   else "प्रश्न का उत्तर सफलतापूर्वक दिया गया"
        )
        
    except Exception as e:
        print(f"❌ Error in document question endpoint: {type(e).__name__}: {str(e)}")
        error_msg = f"Error processing question: {str(e)}"
        return DocumentQuestionResponse(
            success=False,
            message=error_msg if request.language == "hinglish"
                   else f"प्रश्न संसाधित करने में त्रुटि: {str(e)}"
        )


@router.post("/document/cleanup")
async def cleanup_document_endpoint(request: DocumentCleanupRequest):
    """
    Clean up document analysis resources when no longer needed
    """
    try:
        print(f"🧹 Document cleanup request received")
        print(f"🎯 Assistant ID: {request.assistant_id}")
        print(f"🧵 Thread ID: {request.thread_id}")
        print(f"📄 File ID: {request.file_id}")
        
        await cleanup_document_resources(
            assistant_id=request.assistant_id,
            thread_id=request.thread_id,
            file_id=request.file_id
        )
        
        return {"success": True, "message": "Resources cleaned up successfully"}
        
    except Exception as e:
        print(f"❌ Error in document cleanup endpoint: {type(e).__name__}: {str(e)}")
        return {"success": False, "message": f"Error cleaning up resources: {str(e)}"}
        raise HTTPException(status_code=500, detail=f"Cleanup failed: {str(e)}") 