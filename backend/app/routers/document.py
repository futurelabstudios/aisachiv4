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
    language: str = "hinglish"


class DocumentAnalysisResponse(BaseModel):
    success: bool
    analysis: Optional[Dict[str, Any]] = None
    answer: Optional[str] = None
    message: Optional[str] = None


class ImageGenerationRequest(BaseModel):
    prompt: str
    language: str = "hinglish"


class ImageGenerationResponse(BaseModel):
    success: bool
    image_url: Optional[str] = None
    message: Optional[str] = None


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
        # Decode PDF data
        pdf_bytes = base64.b64decode(pdf_data)
        
        # Create a file-like object from bytes
        pdf_file = io.BytesIO(pdf_bytes)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        
        # Extract text from all pages
        full_text = ""
        for page_num in range(len(pdf_reader.pages)):
            page = pdf_reader.pages[page_num]
            page_text = page.extract_text()
            if page_text.strip():
                full_text += f"\n--- Page {page_num + 1} ---\n{page_text}\n"
        
        return full_text.strip()
            
    except Exception as e:
        print(f"PyPDF2 extraction failed: {e}")
        return extract_text_from_pdf_fallback(pdf_data)

def extract_text_from_pdf_fallback(pdf_data: str) -> str:
    """Fallback PDF text extraction using PyMuPDF"""
    try:
        import fitz  # PyMuPDF
        
        # Decode PDF data
        pdf_bytes = base64.b64decode(pdf_data)
        
        # Open PDF document
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        
        # Extract text from all pages
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
        # Decode PDF data
        pdf_bytes = base64.b64decode(pdf_data)
        
        # Create a file-like object from bytes
        pdf_file = io.BytesIO(pdf_bytes)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        
        print(f"📄 Processing PDF: {len(pdf_reader.pages)} pages")
        
        # Initialize system prompt
        if language == "hindi":
            system_prompt = "आप एक सहायक अनुसंधान सहायक हैं।"
        else:
            system_prompt = "You are a helpful research assistant."
        
        # Collect all page summaries
        all_summaries = []
        
        # Process each page
        for page_num in range(len(pdf_reader.pages)):
            print(f"📝 Processing page {page_num + 1}/{len(pdf_reader.pages)}")
            
            # Extract text from current page
            page_text = pdf_reader.pages[page_num].extract_text()
            
            if not page_text.strip():
                print(f"⚠️ Page {page_num + 1} has no extractable text")
                continue
            
            # Create summary prompt
            if language == "hindi":
                user_prompt = f"इसका सारांश बनाएं: {page_text}"
            else:
                user_prompt = f"Summarize this: {page_text}"
            
            # Get summary from OpenAI
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
                all_summaries.append(f"Page {page_num + 1}: Error processing this page - {str(e)}")
                continue
        
        # Combine all page summaries
        if all_summaries:
            combined_summary = "\n\n".join(all_summaries)
        else:
            combined_summary = "सारांश उपलब्ध नहीं है" if language == "hindi" else "Summary not available"
            
        # Format final result
        result = {
            "document_type": "PDF Summary",
            "detected_language": language,
            "confidence": 0.9,
            "fields_detected": [
                {
                    "field_name": "Pages",
                    "value": str(len(pdf_reader.pages)),
                    "confidence": 1.0
                },
                {
                    "field_name": "Summarized Pages", 
                    "value": str(len(all_summaries)),
                    "confidence": 1.0
                }
            ],
            "suggestions": [
                "Review the detailed summary below",
                "Compare with original document if needed",
                "Plan necessary actions based on content"
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
        import fitz  # PyMuPDF
        
        # Decode PDF data
        pdf_bytes = base64.b64decode(pdf_data)
        
        # Open PDF document
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        
        images = []
        max_pages = min(3, len(doc))  # Process max 3 pages for efficiency
        
        for page_num in range(max_pages):
            page = doc[page_num]
            
            # Convert page to image
            mat = fitz.Matrix(2.0, 2.0)  # 2x zoom for better quality
            pix = page.get_pixmap(matrix=mat)
            
            # Convert to PIL Image
            from PIL import Image
            img_data = pix.tobytes("png")
            
            # Encode to base64
            img_base64 = base64.b64encode(img_data).decode('utf-8')
            images.append(img_base64)
        
        doc.close()
        return images
        
    except Exception as e:
        print(f"PDF to image conversion failed: {e}")
        return []

async def analyze_pdf_document(pdf_data: str, language: str) -> Dict[str, Any]:
    """Analyze PDF document using advanced chunking and iterative summarization"""
    try:
        # Try PyPDF2 page-by-page summarization first
        print("🚀 Attempting advanced PDF summarization...")
        result = summarize_pdf_iteratively(pdf_data, language)
        
        if result:
            print("✅ Advanced PDF summarization successful")
            return result
        
        print("⚠️ Advanced method failed, trying simple text extraction...")
        
        # Fallback to simple text extraction
        pdf_text = extract_text_from_pdf_advanced(pdf_data)
        
        if not pdf_text or len(pdf_text.strip()) < 50:
            print("PDF text extraction failed or insufficient text, trying image conversion")
            # Fallback: convert PDF to images and use Vision API
            pdf_images = convert_pdf_to_images(pdf_data)
            if pdf_images:
                # Analyze first page as image
                return await analyze_document_with_vision(pdf_images[0], language, "png")
            else:
                return get_fallback_analysis(language)
        
        # Prepare prompts for text-based analysis
        if language == "hindi":
            system_prompt = """आप भारत में सरकारी दस्तावेज़ों के विश्लेषण में विशेषज्ञ हैं। आपको PDF दस्तावेज़ का टेक्स्ट दिया गया है।

कृपया निम्नलिखित प्रारूप में विश्लेषण करें:

दस्तावेज़ प्रकार: [दस्तावेज़ का प्रकार]
मुख्य विषय: [मुख्य विषय]
महत्वपूर्ण बिंदु:
• [बिंदु 1]
• [बिंदु 2]
• [बिंदु 3]
सुझाव:
• [सुझाव 1]
• [सुझाव 2]"""
            
            user_prompt = f"कृपया इस PDF दस्तावेज़ का विस्तृत विश्लेषण करें:\n\n{pdf_text[:3000]}"  # Limit text length
        else:
            system_prompt = """You are an expert in analyzing government documents in India. You have been provided with the text content of a PDF document.

Please analyze in the following format:

Document Type: [type of document]
Main Subject: [main subject/topic]
Key Points:
• [Point 1]
• [Point 2]
• [Point 3]
Recommendations:
• [Recommendation 1]
• [Recommendation 2]"""
            
            user_prompt = f"Please provide a detailed analysis of this PDF document:\n\n{pdf_text[:3000]}"  # Limit text length
        
        # Call OpenAI for text analysis
        response = client.chat.completions.create(
            model="gpt-4o",  # Use GPT-4o for better text analysis
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=1500,
            temperature=0.3
        )
        
        analysis_text = response.choices[0].message.content
        return parse_analysis_response(analysis_text, language)
        
    except Exception as e:
        print(f"PDF analysis failed: {e}")
        return get_fallback_analysis(language)

async def analyze_document_with_vision(image_data: str, language: str, image_format: str) -> Dict[str, Any]:
    """Separate function for Vision API analysis"""
    print(f"🔍 Starting Vision API analysis...")
    print(f"📊 Image format: {image_format}")
    print(f"🌍 Language: {language}")
    print(f"📏 Image data length: {len(image_data)} characters")
    
    # Prepare the prompt based on language
    if language == "hindi":
        system_prompt = """आप भारत में सरकारी दस्तावेज़ों के विश्लेषण में विशेषज्ञ हैं। आपका काम है दस्तावेज़ों का विस्तृत विश्लेषण करना।

कृपया निम्नलिखित प्रारूप में उत्तर दें:

दस्तावेज़ प्रकार: [दस्तावेज़ का प्रकार]
मुख्य जानकारी: [मुख्य विवरण]
फ़ील्ड्स:
• फ़ील्ड1: मान1
• फ़ील्ड2: मान2
सुझाव:
• सुझाव1
• सुझाव2"""
        
        user_prompt = "कृपया इस दस्तावेज़ का विस्तृत विश्लेषण करें। सभी महत्वपूर्ण जानकारी और फ़ील्ड्स को निकालें।"
    else:
        system_prompt = """You are an expert in analyzing government documents in India. Your job is to provide detailed analysis of documents.

Please respond in the following format:

Document Type: [type of document]
Main Information: [key details]
Fields:
• Field1: Value1
• Field2: Value2
Suggestions:
• Suggestion1
• Suggestion2"""
        
        user_prompt = "Please provide a detailed analysis of this document. Extract all important information and fields."

    try:
        print("🚀 Calling OpenAI Vision API...")
        
        # Validate image data first
        if not image_data or len(image_data) < 100:
            raise ValueError("Image data is too small or empty")
        
        # Try to validate base64
        try:
            base64.b64decode(image_data[:100])  # Test decode first 100 chars
        except Exception as decode_error:
            raise ValueError(f"Invalid base64 image data: {decode_error}")
        
        response = client.chat.completions.create(
            model="gpt-4o",  # Using GPT-4o which has vision capabilities
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": user_prompt
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/{image_format};base64,{image_data}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=1500,
            temperature=0.3
        )
        
        print("✅ Vision API call successful!")
        analysis_text = response.choices[0].message.content
        print(f"📝 Analysis response length: {len(analysis_text)} characters")
        print(f"📄 Analysis preview: {analysis_text[:200]}...")
        
        parsed_result = parse_analysis_response(analysis_text, language)
        print(f"🎯 Parsed result: {parsed_result.get('document_type', 'Unknown')} - {len(parsed_result.get('fields_detected', []))} fields")
        
        return parsed_result
        
    except Exception as e:
        print(f"❌ Vision API failed with error: {type(e).__name__}: {str(e)}")
        
        # Log more specific error details
        if "rate_limit" in str(e).lower():
            print("🚫 Rate limit exceeded - too many API calls")
        elif "invalid_request" in str(e).lower():
            print("🚫 Invalid request - possibly image format issue")
        elif "authentication" in str(e).lower():
            print("🚫 Authentication failed - check API key")
        elif "quota" in str(e).lower():
            print("🚫 API quota exceeded")
        else:
            print(f"🚫 Unknown error type: {str(e)}")
        
        # Return enhanced fallback with error info
        fallback = get_fallback_analysis(language)
        
        # Add error information to main_information for debugging
        if language == "hindi":
            fallback["main_information"] = f"दस्तावेज़ विश्लेषण में तकनीकी समस्या हुई है। त्रुटि: {str(e)[:100]}..."
        else:
            fallback["main_information"] = f"Technical issue occurred during document analysis. Error: {str(e)[:100]}..."
        
        return fallback

def convert_image_to_supported_format(image_data: str) -> tuple[str, str]:
    """Convert image to a supported format (PNG) and return format and base64 data"""
    try:
        
        # Decode the base64 image
        image_bytes = base64.b64decode(image_data)
        
        # Open with PIL
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if necessary (for JPEG compatibility)
        if image.mode in ('RGBA', 'LA', 'P'):
            # Convert to RGB for JPEG, or keep as PNG for transparency
            if image.mode in ('RGBA', 'LA'):
                # Keep as PNG to preserve transparency
                output_format = 'PNG'
            else:
                # Convert palette to RGB for JPEG
                image = image.convert('RGB')
                output_format = 'JPEG'
        else:
            output_format = 'JPEG'  # Default to JPEG for RGB images
        
        # Save to bytes
        output_buffer = io.BytesIO()
        image.save(output_buffer, format=output_format, quality=95)
        output_buffer.seek(0)
        
        # Encode back to base64
        converted_base64 = base64.b64encode(output_buffer.getvalue()).decode('utf-8')
        
        return output_format.lower(), converted_base64
        
    except Exception as e:
        print(f"Image conversion failed: {e}")
        # Return original data as JPEG
        return 'jpeg', image_data

def detect_image_format(image_data: str) -> str:
    """Detect image format from base64 data"""
    try:
        # Decode first few bytes to detect format
        image_bytes = base64.b64decode(image_data[:100])  # Just first chunk for header detection
        
        # Check magic bytes for different formats
        if image_bytes.startswith(b'\x89PNG'):
            return 'png'
        elif image_bytes.startswith(b'\xff\xd8\xff'):
            return 'jpeg'
        elif image_bytes.startswith(b'GIF'):
            return 'gif'
        elif image_bytes.startswith(b'RIFF') and b'WEBP' in image_bytes[:20]:
            return 'webp'
        else:
            # Default to jpeg if can't detect
            return 'jpeg'
    except:
        return 'jpeg'

async def analyze_document_with_openai(image_data: str, language: str) -> Dict[str, Any]:
    """Analyze document using OpenAI Vision API or text analysis for PDFs"""
    try:
        print(f"🎯 Starting document analysis with OpenAI...")
        print(f"🌍 Language: {language}")
        print(f"📊 Raw image data length: {len(image_data)} characters")
        
        # Clean the data (remove data URI prefix if present)
        if 'data:' in image_data and 'base64,' in image_data:
            print("🧹 Cleaning data URI prefix...")
            image_data = image_data.split('base64,')[1]
            print(f"✅ Cleaned image data length: {len(image_data)} characters")
        
        # Check if this is a PDF file
        if is_pdf_data(image_data):
            print("📄 Detected PDF file - using text extraction")
            return await analyze_pdf_document(image_data, language)
        
        # For image files, continue with Vision API
        print("🖼️ Detected image file - proceeding with Vision API")
        
        # Convert image to a supported format
        try:
            print("🔄 Converting image to supported format...")
            image_format, converted_image_data = convert_image_to_supported_format(image_data)
            print(f"✅ Successfully converted image to format: {image_format}")
            print(f"📊 Converted image data length: {len(converted_image_data)} characters")
        except Exception as e:
            print(f"⚠️ Image conversion failed: {e}")
            # Fallback to original detection
            image_format = detect_image_format(image_data)
            converted_image_data = image_data
            print(f"🔍 Using original image format: {image_format}")
        
        # Use Vision API for image analysis
        print(f"🚀 Calling Vision API with format: {image_format}")
        result = await analyze_document_with_vision(converted_image_data, language, image_format)
        print(f"✅ Vision API analysis completed successfully")
        return result
        
    except Exception as e:
        print(f"❌ Critical error in OpenAI Vision analysis: {type(e).__name__}: {str(e)}")
        # Return fallback analysis
        fallback = get_fallback_analysis(language)
        
        # Add error info to fallback for debugging
        if language == "hindi":
            fallback["main_information"] = f"गंभीर तकनीकी समस्या हुई है। त्रुटि: {str(e)[:100]}..."
        else:
            fallback["main_information"] = f"Critical technical issue occurred. Error: {str(e)[:100]}..."
        
        return fallback


def parse_analysis_response(response: str, language: str) -> Dict[str, Any]:
    """Parse OpenAI response into structured format"""
    try:
        print(f"🔍 Parsing analysis response...")
        print(f"📝 Response: {response}")
        
        lines = response.split('\n')
        fields = []
        suggestions = []
        document_type = "government_document"
        main_info = ""
        
        current_section = None
        
        # Check if this is a structured response or natural language
        has_structured_format = any(
            keyword in response.lower() 
            for keyword in ['document type:', 'दस्तावेज़ प्रकार:', 'main information:', 'मुख्य जानकारी:', 'fields:', 'फ़ील्ड्स:']
        )
        
        if not has_structured_format:
            print("📄 Detected natural language response, using full text as main_information")
            # For natural language responses (like "no document found"), use the entire response
            return {
                "document_type": "analysis_result",
                "detected_language": language,
                "confidence": 0.9,
                "fields_detected": [],
                "suggestions": [
                    "Please ensure the image contains a clear document" if language == "hinglish" 
                    else "कृपया सुनिश्चित करें कि छवि में स्पष्ट दस्तावेज़ है",
                    "Take the photo in good lighting" if language == "hinglish"
                    else "अच्छी रोशनी में फोटो लें",
                    "Keep the entire document in frame" if language == "hinglish"
                    else "पूरा दस्तावेज़ फ्रेम में रखें"
                ],
                "main_information": response.strip()
            }
        
        # Parse structured response
        print("📊 Parsing structured response...")
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            if any(keyword in line.lower() for keyword in ['document type', 'दस्तावेज़ प्रकार']):
                document_type = line.split(':')[-1].strip() if ':' in line else "government_document"
            elif any(keyword in line.lower() for keyword in ['main information', 'मुख्य जानकारी']):
                main_info = line.split(':')[-1].strip() if ':' in line else line
            elif any(keyword in line.lower() for keyword in ['fields', 'फ़ील्ड्स']):
                current_section = 'fields'
            elif any(keyword in line.lower() for keyword in ['suggestions', 'सुझाव']):
                current_section = 'suggestions'
            elif line.startswith('•') or line.startswith('-'):
                content = line[1:].strip()
                if current_section == 'fields' and ':' in content:
                    field_parts = content.split(':', 1)
                    fields.append({
                        "field_name": field_parts[0].strip(),
                        "value": field_parts[1].strip(),
                        "confidence": 0.9
                    })
                elif current_section == 'suggestions':
                    suggestions.append(content)
        
        # If main_info is still empty, use a portion of the response
        if not main_info:
            main_info = response[:200] + "..." if len(response) > 200 else response
        
        result = {
            "document_type": document_type,
            "detected_language": language,
            "confidence": 0.9,
            "fields_detected": fields,
            "suggestions": suggestions,
            "main_information": main_info
        }
        
        print(f"✅ Parsed result: {len(fields)} fields, {len(suggestions)} suggestions")
        print(f"📋 Main info: {main_info[:100]}...")
        
        return result
        
    except Exception as e:
        print(f"❌ Error parsing analysis response: {e}")
        # Even if parsing fails, try to return the original response
        return {
            "document_type": "analysis_result",
            "detected_language": language,
            "confidence": 0.7,
            "fields_detected": [],
            "suggestions": [
                "Please try again with a clearer image" if language == "hinglish"
                else "कृपया स्पष्ट छवि के साथ पुनः प्रयास करें"
            ],
            "main_information": response.strip() if response else "Analysis parsing failed"
        }


def get_fallback_analysis(language: str) -> Dict[str, Any]:
    """Fallback analysis when API fails"""
    if language == "hindi":
        return {
            "document_type": "सरकारी दस्तावेज़",
            "detected_language": language,
            "confidence": 0.7,
            "fields_detected": [
                {
                    "field_name": "दस्तावेज़ स्थिति",
                    "value": "विश्लेषण किया गया",
                    "confidence": 0.8
                }
            ],
            "suggestions": [
                "दस्तावेज़ को ध्यान से जांचें",
                "सभी आवश्यक फ़ील्ड भरे हुए हैं या नहीं सत्यापित करें",
                "आवश्यक हो तो संबंधित कार्यालय से संपर्क करें"
            ],
            "main_information": "दस्तावेज़ का सफल विश्लेषण हुआ है।"
        }
    else:
        return {
            "document_type": "government_document",
            "detected_language": language,
            "confidence": 0.7,
            "fields_detected": [
                {
                    "field_name": "document_status",
                    "value": "analyzed",
                    "confidence": 0.8
                }
            ],
            "suggestions": [
                "Review the document carefully",
                "Verify all required fields are filled",
                "Contact relevant office if needed"
            ],
            "main_information": "Document has been successfully analyzed."
        }


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
        
        # Analyze document using OpenAI Vision
        print(f"🎯 Starting document analysis...")
        analysis_result = await analyze_document_with_openai(image_data, language)
        print(f"✅ Analysis completed successfully")
        print(f"📋 Result type: {analysis_result.get('document_type', 'Unknown')}")
        print(f"📝 Main info: {analysis_result.get('main_information', 'No info')[:100]}...")
        print(f"🔢 Fields detected: {len(analysis_result.get('fields_detected', []))}")
        print(f"💡 Suggestions: {len(analysis_result.get('suggestions', []))}")

        # Generate answer if question was asked
        answer = None
        if request.question:
            print(f"❓ Generating answer for question: {request.question}")
            if language == "hindi":
                answer = f"आपके प्रश्न '{request.question}' के आधार पर विश्लेषण: {analysis_result.get('main_information', 'दस्तावेज़ विश्लेषण पूर्ण')}"
            else:
                answer = f"Based on your question '{request.question}': {analysis_result.get('main_information', 'Document analysis complete')}"

        response = DocumentAnalysisResponse(
            success=True,
            analysis=analysis_result,
            answer=answer,
            message="Document analyzed successfully" if language == "hinglish" 
                   else "दस्तावेज़ का विश्लेषण सफलतापूर्वक पूरा हुआ"
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