from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import re
import base64
from openai import OpenAI
from ..core.config import get_settings
import PyPDF2
from PIL import Image
import io

router = APIRouter(tags=["document"])
settings = get_settings()
client = OpenAI(api_key=settings.OPENAI_API_KEY)


class DocumentAnalysisRequest(BaseModel):
    image_data: Optional[str] = None  # Base64 encoded image
    image_url: Optional[str] = None   # Image URL (fallback for generated images)
    document_type: Optional[str] = None
    question: Optional[str] = None
    language: str = "hinglish" # Default language is now hinglish


class DocumentAnalysisResponse(BaseModel):
    success: bool
    analysis: Optional[Dict[str, Any]] = None
    answer: Optional[str] = None
    message: Optional[str] = None


class ImageGenerationRequest(BaseModel):
    prompt: str
    language: str = "hinglish" # Default language is now hinglish


class ImageGenerationResponse(BaseModel):
    success: bool
    image_url: Optional[str] = None
    message: Optional[str] = None

class DocumentChatRequest(BaseModel):
    question: str
    analysis_text: str # The document summary to provide context
    language: str = "hinglish"

class DocumentChatResponse(BaseModel):
    response: str
    timestamp: str
    conversation_id: Optional[str] = None # Will be null for this stateless endpoint

def is_pdf_data(data: str) -> bool:
    """Check if the base64 data represents a PDF file"""
    try:
        decoded_data = base64.b64decode(data[:100])  # Check first 100 bytes
        return decoded_data.startswith(b'%PDF-')
    except:
        return False

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

def extract_text_from_pdf_advanced(pdf_data: str) -> str:
    """Extract text from PDF using PyPDF2"""
    try:
        pdf_bytes = base64.b64decode(pdf_data)
        pdf_file = io.BytesIO(pdf_bytes)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        full_text = ""
        for page_num in range(len(pdf_reader.pages)):
            page = pdf_reader.pages[page_num]
            page_text = page.extract_text()
            if page_text and page_text.strip():
                full_text += f"\n--- Page {page_num + 1} ---\n{page_text}\n"
        return full_text.strip()
    except Exception as e:
        print(f"PyPDF2 extraction failed: {e}")
        return extract_text_from_pdf_fallback(pdf_data)

def extract_text_from_pdf_fallback(pdf_data: str) -> str:
    """Fallback PDF text extraction using PyMuPDF"""
    try:
        import fitz  # PyMuPDF
        pdf_bytes = base64.b64decode(pdf_data)
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        text_content = ""
        for page_num in range(len(doc)):
            page = doc[page_num]
            text_content += f"\n--- Page {page_num + 1} ---\n"
            text_content += page.get_text()
        doc.close()
        return text_content.strip()
    except Exception as e:
        print(f"PDF text extraction failed: {e}")
        return ""

def summarize_pdf_iteratively(pdf_data: str, language: str) -> Dict[str, Any]:
    """Summarize PDF using PyPDF2 page-by-page approach"""
    try:
        pdf_bytes = base64.b64decode(pdf_data)
        pdf_file = io.BytesIO(pdf_bytes)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        print(f"📄 Processing PDF: {len(pdf_reader.pages)} pages")

        if language == "hindi":
            system_prompt = "आप एक सहायक अनुसंधान सहायक हैं।"
        else: # Hinglish
            system_prompt = "You are a helpful research assistant. Respond in Hinglish."

        all_summaries = []
        for page_num in range(len(pdf_reader.pages)):
            print(f"📝 Processing page {page_num + 1}/{len(pdf_reader.pages)}")
            page_text = pdf_reader.pages[page_num].extract_text()
            if not page_text or not page_text.strip():
                print(f"⚠️ Page {page_num + 1} has no extractable text")
                continue
            
            if language == "hindi":
                user_prompt = f"इस पेज का सारांश बताएं: {page_text}"
            else: # Hinglish
                user_prompt = f"Is page ko summarize karein: {page_text}"

            try:
                response = client.chat.completions.create(
                    model="gpt-4o",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    max_tokens=1000,
                    temperature=0.3
                )
                page_summary = response.choices[0].message.content
                all_summaries.append(f"Page {page_num + 1}: {page_summary}")
                print(f"✅ Page {page_num + 1} summarized successfully")
            except Exception as e:
                print(f"❌ Error summarizing page {page_num + 1}: {e}")
                continue
        
        if all_summaries:
            combined_summary = "\n\n".join(all_summaries)
        else:
            combined_summary = "Koi saaransh uplabdh nahi hai" if language == "hinglish" else "सारांश उपलब्ध नहीं है"
        
        result = {
            "document_type": "PDF Summary",
            "detected_language": language,
            "confidence": 0.9,
            "fields_detected": [
                {"field_name": "Pages", "value": str(len(pdf_reader.pages)), "confidence": 1.0},
                {"field_name": "Summarized Pages", "value": str(len(all_summaries)), "confidence": 1.0}
            ],
            "suggestions": [
                "Neeche diye gaye detailed summary ko review karein" if language == "hinglish" else "विस्तृत सारांश की समीक्षा करें",
                "Zaroorat padne par original document se milaan karein" if language == "hinglish" else "मूल दस्तावेज़ से तुलना करें"
            ],
            "main_information": combined_summary
        }
        return result
    except Exception as e:
        print(f"❌ PyPDF2 summarization failed: {e}")
        return None

def convert_pdf_to_images(pdf_data: str) -> list[str]:
    """Convert PDF pages to base64 image data"""
    try:
        import fitz
        pdf_bytes = base64.b64decode(pdf_data)
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        images = []
        max_pages = min(3, len(doc))
        for page_num in range(max_pages):
            page = doc[page_num]
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
            img_data = pix.tobytes("png")
            img_base64 = base64.b64encode(img_data).decode('utf-8')
            images.append(img_base64)
        doc.close()
        return images
    except Exception as e:
        print(f"PDF to image conversion failed: {e}")
        return []

async def analyze_pdf_document(pdf_data: str, language: str) -> Dict[str, Any]:
    """Analyze PDF document using text extraction and LLM"""
    try:
        pdf_text = extract_text_from_pdf_advanced(pdf_data)
        if not pdf_text or len(pdf_text.strip()) < 50:
            print("PDF text extraction failed or insufficient text, trying image conversion")
            pdf_images = convert_pdf_to_images(pdf_data)
            if pdf_images:
                return await analyze_document_with_vision(pdf_images[0], language, "png")
            else:
                return get_fallback_analysis(language)
        
        if language == "hindi":
            system_prompt = """आप भारत में सरकारी दस्तावेज़ों के विश्लेषण में विशेषज्ञ हैं। दिए गए PDF टेक्स्ट का विश्लेषण करें। प्रतिक्रिया को मार्कडाउन में प्रारूपित करें।

निम्नलिखित प्रारूप में उत्तर दें:
Document Type: [दस्तावेज़ का प्रकार]
Main Information: [मुख्य विषय पर एक विस्तृत पैराग्राफ]
Key Points:
• [बिंदु 1]
• [बिंदु 2]
Suggestions:
• [सुझाव 1]"""
            user_prompt = f"कृपया इस PDF दस्तावेज़ का विस्तृत विश्लेषण करें:\n\n{pdf_text[:4000]}"
        else: # Hinglish
            system_prompt = """Aap India ke government documents ke expert analyst hain. Diye gaye PDF text ko analyze karein. Response ko markdown mein format karein.

Is format mein jawab dein:
Document Type: [document ka prakar]
Main Information: [Mukhya vishay par ek detailed paragraph]
Key Points:
• [Point 1]
• [Point 2]
Suggestions:
• [Suggestion 1]"""
            user_prompt = f"Please is PDF document ka vistar se analysis karein:\n\n{pdf_text[:4000]}"
        
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=1500, temperature=0.3
        )
        analysis_text = response.choices[0].message.content
        return parse_analysis_response(analysis_text, language)
    except Exception as e:
        print(f"PDF analysis failed: {e}")
        return get_fallback_analysis(language)

async def analyze_document_with_vision(image_data: str, language: str, image_format: str) -> Dict[str, Any]:
    """Analyzes an image using the Vision API with updated prompts."""
    print(f"🔍 Starting Vision API analysis for language: {language}")
    
    if language == "hindi":
        system_prompt = """आप भारत में सरकारी दस्तावेज़ों के विश्लेषण में विशेषज्ञ हैं। दस्तावेज़ का विस्तृत विश्लेषण करें। प्रतिक्रिया को मार्कडाउन में प्रारूपित करें।

निम्नलिखित प्रारूप में उत्तर दें:
Document Type: [दस्तावेज़ का प्रकार]
Main Information: [मुख्य जानकारी का सारांश]
Fields:
• फ़ील्ड1: मान1
• फ़ील्ड2: मान2
Suggestions:
• सुझाव1
• सुझाव2"""
        user_prompt = "कृपया इस दस्तावेज़ का विस्तृत विश्लेषण करें।"
    else: # Hinglish
        system_prompt = """Aap India ke government documents ke expert analyst hain. Document ka detail mein analysis karein. Response ko markdown mein format karein.

Is format mein jawab dein:
Document Type: [document ka prakar]
Main Information: [Mukhya jaankari ka summary]
Fields:
• Field1: Value1
• Field2: Value2
Suggestions:
• Suggestion1
• Suggestion2"""
        user_prompt = "Please is document ka detail mein analysis karein."

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": [
                    {"type": "text", "text": user_prompt},
                    {"type": "image_url", "image_url": {
                        "url": f"data:image/{image_format};base64,{image_data}"}}
                ]}
            ],
            max_tokens=1500, temperature=0.3
        )
        analysis_text = response.choices[0].message.content
        return parse_analysis_response(analysis_text, language)
    except Exception as e:
        print(f"❌ Vision API failed: {str(e)}")
        return get_fallback_analysis(language)

def convert_image_to_supported_format(image_data: str) -> tuple[str, str]:
    """Convert image to a supported format (PNG) and return format and base64 data"""
    try:
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to PNG for consistency and quality
        output_buffer = io.BytesIO()
        image.save(output_buffer, format='PNG')
        output_buffer.seek(0)
        
        converted_base64 = base64.b64encode(output_buffer.getvalue()).decode('utf-8')
        return 'png', converted_base64
    except Exception as e:
        print(f"Image conversion failed: {e}")
        return 'jpeg', image_data # Fallback to jpeg

async def analyze_document_with_openai(image_data: str, language: str) -> Dict[str, Any]:
    """Main analysis function, routes to PDF or Vision analysis."""
    try:
        if 'data:' in image_data and 'base64,' in image_data:
            image_data = image_data.split('base64,')[1]
        
        if is_pdf_data(image_data):
            print("📄 Detected PDF file - using text extraction and analysis")
            return await analyze_pdf_document(image_data, language)
        else:
            print("🖼️ Detected image file - proceeding with Vision API")
            image_format, converted_image_data = convert_image_to_supported_format(image_data)
            return await analyze_document_with_vision(converted_image_data, language, image_format)
    except Exception as e:
        print(f"❌ Critical error in OpenAI analysis: {str(e)}")
        return get_fallback_analysis(language)

def parse_analysis_response(response: str, language: str) -> Dict[str, Any]:
    """Parse OpenAI response into a structured format."""
    try:
        document_type_match = re.search(r"Document Type:(.*?)\n", response, re.IGNORECASE)
        main_info_match = re.search(r"Main Information:(.*?)\n(Fields:|Key Points:|Suggestions:)", response, re.DOTALL | re.IGNORECASE)
        
        document_type = document_type_match.group(1).strip() if document_type_match else "Analysis Result"
        main_information = main_info_match.group(1).strip() if main_info_match else response
        
        fields = []
        fields_section_match = re.search(r"(Fields:|Key Points:)(.*?)\n(Suggestions:|$)", response, re.DOTALL | re.IGNORECASE)
        if fields_section_match:
            fields_text = fields_section_match.group(2)
            for line in fields_text.strip().split('\n'):
                line = line.strip().lstrip('•*- ').strip()
                if ':' in line:
                    parts = line.split(':', 1)
                    fields.append({"field_name": parts[0].strip(), "value": parts[1].strip(), "confidence": 0.9})
                elif line: # Handle bullet points without colons
                    fields.append({"field_name": "Key Point", "value": line, "confidence": 0.9})

        suggestions = []
        suggestions_match = re.search(r"Suggestions:(.*)", response, re.DOTALL | re.IGNORECASE)
        if suggestions_match:
            suggestions_text = suggestions_match.group(1)
            for line in suggestions_text.strip().split('\n'):
                line = line.strip().lstrip('•*- ').strip()
                if line:
                    suggestions.append(line)
        
        # If parsing fails, use the whole response
        if not fields and not suggestions and len(main_information) > 200:
             main_information = response

        return {
            "document_type": document_type,
            "detected_language": language,
            "confidence": 0.9,
            "fields_detected": fields,
            "suggestions": suggestions,
            "main_information": main_information,
        }
    except Exception as e:
        print(f"❌ Error parsing analysis response: {e}")
        return get_fallback_analysis(language, error_message=response)

def get_fallback_analysis(language: str, error_message: Optional[str] = None) -> Dict[str, Any]:
    """Fallback analysis when API fails or parsing fails."""
    is_hinglish = language == "hinglish"
    main_info = error_message or (
        "Document ka safaltapoorvak vishleshan ho gaya hai." if is_hinglish 
        else "दस्तावेज़ का सफल विश्लेषण हुआ है।"
    )
    if error_message:
        main_info = f"Analysis mein samasya aayi: {error_message}" if is_hinglish else f"विश्लेषण में समस्या: {error_message}"

    return {
        "document_type": "Sarkari Dastavez" if is_hinglish else "सरकारी दस्तावेज़",
        "detected_language": language,
        "confidence": 0.7,
        "fields_detected": [{"field_name": "Status", "value": "Analyzed", "confidence": 0.8}],
        "suggestions": [
            "Document ko dhyaan se check karein" if is_hinglish else "दस्तावेज़ को ध्यान से जांचें",
            "Zaroori ho to office se sampark karein" if is_hinglish else "आवश्यक हो तो संबंधित कार्यालय से संपर्क करें"
        ],
        "main_information": main_info
    }

async def generate_image_with_openai(prompt: str, language: str) -> str:
    """Generate image using OpenAI DALL-E API with updated prompts."""
    try:
        if language == "hindi":
            enhanced_prompt = f"सरकारी प्रस्तुति के लिए एक व्यावसायिक, शिक्षाप्रद छवि: {prompt}। स्वच्छ, सरल और स्पष्ट डिज़ाइन। ग्रामीण भारत के संदर्भ में।"
        else: # Hinglish
            enhanced_prompt = f"Sarkari presentation ke liye ek professional, educational image: {prompt}. Saaf, saral aur spasht design. Gramin Bharat ke sandarbh mein."
        
        response = client.images.generate(
            model="dall-e-3",
            prompt=enhanced_prompt[:1000],
            size="1024x1024", quality="standard", n=1
        )
        return response.data[0].url
    except Exception as e:
        print(f"DALL-E 3 failed: {e}, trying DALL-E 2")
        try:
             response = client.images.generate(
                model="dall-e-2",
                prompt=enhanced_prompt[:1000],
                size="1024x1024", n=1
            )
             return response.data[0].url
        except Exception as e2:
             print(f"Error in OpenAI image generation: {e2}")
             raise HTTPException(status_code=503, detail="Image generation service unavailable.")

def validate_image_prompt(prompt: str, language: str) -> Dict[str, Any]:
    """Validate image prompt for appropriate content"""
    inappropriate_keywords = ['violence', 'weapon', 'explicit', 'sexual', 'hate', 'हिंसा', 'हथियार', 'अश्लील']
    if any(keyword in prompt.lower() for keyword in inappropriate_keywords):
        return {
            "is_appropriate": False,
            "reason": "Anuchit content ka pata chala" if language == "hinglish" else "अनुचित सामग्री का पता चला",
            "suggestion": "Kripya sarkari/educational content ke liye suitable description dein" if language == "hinglish" else "कृपया सरकारी/शैक्षणिक सामग्री के लिए उपयुक्त विवरण प्रदान करें"
        }
    return {"is_appropriate": True}

@router.post("/document", response_model=DocumentAnalysisResponse)
async def analyze_document(request: DocumentAnalysisRequest):
    """Analyze uploaded documents using OpenAI, with Hinglish as default."""
    try:
        language = request.language or "hinglish"
        image_data = request.image_data or (await fetch_image_from_url(request.image_url) if request.image_url else None)

        if not image_data:
            return DocumentAnalysisResponse(
                success=False,
                message="Koi image data ya URL nahi diya gaya" if language == "hinglish" else "कोई छवि डेटा या URL प्रदान नहीं किया गया"
            )

        analysis_result = await analyze_document_with_openai(image_data, language)
        
        answer = None
        if request.question:
            if language == "hindi":
                answer = f"आपके प्रश्न '{request.question}' के आधार पर: {analysis_result.get('main_information', 'विश्लेषण पूर्ण')}"
            else: # Hinglish
                answer = f"Aapke sawaal '{request.question}' ke basis par: {analysis_result.get('main_information', 'Analysis poora hua')}"

        return DocumentAnalysisResponse(
            success=True,
            analysis=analysis_result,
            answer=answer,
            message="Document ka vishleshan safaltapoorvak ho gaya hai" if language == "hinglish" else "दस्तावेज़ का विश्लेषण सफलतापूर्वक पूरा हुआ"
        )
    except Exception as e:
        error_msg = f"Document analyze karne mein error: {str(e)}"
        return DocumentAnalysisResponse(
            success=False, 
            message=error_msg if request.language != "hindi" else f"दस्तावेज़ विश्लेषण में त्रुटि: {str(e)}"
        )

@router.post("/generate-image", response_model=ImageGenerationResponse)
async def generate_image(request: ImageGenerationRequest):
    """Generate image using DALL-E, with Hinglish as default."""
    try:
        language = request.language or "hinglish"
        validation = validate_image_prompt(request.prompt, language)
        if not validation["is_appropriate"]:
            return ImageGenerationResponse(success=False, message=f"{validation['reason']}. {validation.get('suggestion', '')}")
        
        image_url = await generate_image_with_openai(request.prompt, language)
        
        return ImageGenerationResponse(
            success=True,
            image_url=image_url,
            message="Image safaltapoorvak ban gayi hai" if language == "hinglish" else "छवि सफलतापूर्वक बनाई गई"
        )
    except Exception as e:
        error_msg = f"Image banane mein error: {str(e)}"
        return ImageGenerationResponse(
            success=False, 
            message=error_msg if request.language != "hindi" else f"छवि बनाने में त्रुटि: {str(e)}"
        )
    

@router.post("/ask", response_model=DocumentChatResponse)
async def ask_document_question(request: DocumentChatRequest):
    """
    A simple, non-streaming endpoint to answer a question based on
    a provided document analysis context.
    This is stateless and does not require user authentication.
    """
    try:
        # Determine the system prompt based on language
        if request.language == "hindi":
            system_prompt = "आप एक सहायक हैं जो एक प्रदान किए गए दस्तावेज़ विश्लेषण के आधार पर सवालों का जवाब देते हैं। केवल दिए गए संदर्भ से जानकारी का उपयोग करें और कोई भी बाहरी जानकारी न जोड़ें।"
        else: # Hinglish
            system_prompt = "You are a helpful assistant that answers questions based on a provided document analysis. Use only information from the given context and do not add any external information."
            
        # Create a clear context for the AI
        context = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Here is the document analysis context I have:\n\n---CONTEXT BEGIN---\n{request.analysis_text}\n---CONTEXT END---\n\nBased on this context, please answer the following question."},
            {"role": "assistant", "content": "Okay, I have the context. I will answer based only on what you provided. What is the question?"},
            {"role": "user", "content": request.question}
        ]

        # Use a direct, non-streaming call to the OpenAI client
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=context,
            max_tokens=500,
            temperature=0.1 # Lower temperature for more factual, less creative answers
        )
        
        full_response = response.choices[0].message.content or "No response generated."

        # Return a simple JSON response, not a stream
        return DocumentChatResponse(
            response=full_response,
            timestamp=datetime.now(timezone.utc).isoformat()
        )

    except Exception as e:
        print(f"Error in /ask endpoint: {e}")
        raise HTTPException(status_code=500, detail="Error processing document question.")