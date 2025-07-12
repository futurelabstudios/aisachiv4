import re
from openai import OpenAI
from typing import List, Dict, Any

from ..core.config import get_settings

settings = get_settings()
client = OpenAI(api_key=settings.OPENAI_API_KEY)


def detect_language(text: str) -> str:
    """Simple language detection - check for Devanagari script"""
    # Check if text contains Devanagari script (Hindi)
    devanagari_regex = re.compile(r'[\u0900-\u097F]')
    if devanagari_regex.search(text):
        return 'hindi'
    return 'hinglish'


def get_system_prompt(language: str, input_language: str = None) -> str:
    """Get the system prompt based on language"""
    response_language = input_language or language

    prompts = {
        "hindi": f"""आप भारत में ग्राम पंचायत अधिकारियों और ग्रामीण प्रशासकों की सहायता के लिए विशेष रूप से डिज़ाइन किए गए एक AI सहायक हैं। आपको गांव की शासन व्यवस्था, ग्रामीण विकास योजनाओं, प्रशासनिक प्रक्रियाओं, सरकारी सेवाओं, और स्थानीय सरकारी कार्यों में विशेषज्ञता है।

महत्वपूर्ण निर्देश:
- हमेशा {'शुद्ध हिंदी' if response_language == 'hindi' else 'सरल हिंग्लिश (रोमन लिपि में हिंदी)'} में उत्तर दें
- स्पष्ट, व्यावहारिक और कार्यान्वित करने योग्य उत्तर दें
- यदि कोई सरकारी योजना या नीति के बारे में पूछा जाए तो वेब खोज करके नवीनतम जानकारी दें
- सरकारी वेबसाइट्स, आधिकारिक दस्तावेज़ों और सरकारी परिपत्रों के लिंक प्रदान करें
- हमेशा ग्रामीण समुदायों के प्रति सम्मानजनक और सहायक रहें""",

        "hinglish": f"""Aap India mein Gram Panchayat officials aur rural administrators ki madad karne ke liye specially design kiye gaye ek AI assistant hain. Aapko village governance, rural development schemes, administrative procedures, government services, aur local government operations mein expertise hai.

Important Instructions:
- Hamesha {'shuddh Hindi' if response_language == 'hindi' else 'simple Hinglish (Roman script mein Hindi)'} mein jawab dijiye
- Clear, practical, aur actionable responses dijiye  
- Agar koi government scheme ya policy ke baare mein poocha jaye to web search karke latest information dijiye
- Government websites, official documents aur government circulars ke links provide kariye
- Hamesha rural communities ke saath respectful aur supportive rahiye""",
    }

    return prompts.get(language, prompts["hinglish"])


def should_perform_web_search(message: str) -> bool:
    """Check if message requires web search"""
    search_keywords = [
        # Hindi keywords
        'योजना', 'नीति', 'सरकारी', 'आवेदन', 'फॉर्म', 'दस्तावेज', 'परिपत्र', 'नियम',
        'केंद्र सरकार', 'राज्य सरकार', 'मुख्यमंत्री', 'प्रधानमंत्री', 'विभाग',
        # Hinglish/English keywords
        'scheme', 'policy', 'government', 'application', 'form', 'document', 
        'circular', 'rules', 'center', 'state', 'ministry', 'department', 'pm', 'cm',
        'latest', 'new', 'update', 'current', 'website', 'portal', 'online'
    ]
    
    return any(keyword.lower() in message.lower() for keyword in search_keywords)


def get_fallback_government_links(language: str) -> str:
    """Get fallback government links when web search fails"""
    links = {
        "hindi": {
            "header": "उपयोगी सरकारी वेबसाइट्स:",
            "sites": [
                "1. भारत सरकार पोर्टल: https://www.india.gov.in",
                "2. डिजिटल इंडिया: https://digitalindia.gov.in",
                "3. ई-गवर्नेंस पोर्टल: https://www.egovonline.net",
                "4. प्रधानमंत्री योजनाएं: https://www.pmindiaschemes.com",
                "5. राष्ट्रीय सूचना विज्ञान केंद्र: https://www.nic.in"
            ]
        },
        "hinglish": {
            "header": "Useful Government Websites:",
            "sites": [
                "1. Government of India Portal: https://www.india.gov.in",
                "2. Digital India: https://digitalindia.gov.in",
                "3. E-Governance Portal: https://www.egovonline.net",
                "4. PM India Schemes: https://www.pmindiaschemes.com",
                "5. National Informatics Centre: https://www.nic.in"
            ]
        }
    }
    
    link_data = links.get(language, links["hinglish"])
    return f"{link_data['header']}\n\n" + "\n".join(link_data['sites'])


async def get_openai_response(
    message: str, 
    conversation_history: List[Dict[str, Any]] = None,
    language: str = "hinglish"
) -> str:
    """Get response from OpenAI API"""
    try:
        # Detect the language of the input message
        input_language = detect_language(message)
        
        # Get system prompt
        system_prompt = get_system_prompt(language, input_language)
        
        # Add language-specific instruction based on user's input language
        language_instructions = {
            "hindi": "\n\nमहत्वपूर्ण: उपयोगकर्ता हिंदी में लिख रहा है, इसलिए केवल शुद्ध हिंदी में उत्तर दें।",
            "hinglish": "\n\nIMPORTANT: User Hinglish mein likh raha hai, so please respond ONLY in simple Hinglish (Roman script mein Hindi)."
        }
        
        system_prompt += language_instructions.get(input_language, language_instructions["hinglish"])
        
        # Prepare messages
        messages = [{"role": "system", "content": system_prompt}]
        
        # Add conversation history
        if conversation_history:
            for msg in conversation_history[-10:]:  # Last 10 messages
                messages.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })
        
        # Add current message
        messages.append({"role": "user", "content": message})
        
        # Call OpenAI API
        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=messages,
            max_tokens=settings.OPENAI_MAX_TOKENS,
            temperature=0.7,
            top_p=1,
            frequency_penalty=0,
            presence_penalty=0,
        )
        
        assistant_response = response.choices[0].message.content
        
        # Add government links if needed
        if should_perform_web_search(message):
            assistant_response += f"\n\n{get_fallback_government_links(language)}"
        
        # Format response
        return assistant_response.replace('\n\n+', '\n\n').strip()
        
    except Exception as e:
        print(f"OpenAI Service Error: {e}")
        
        # Return language-specific error messages
        error_messages = {
            "hindi": "क्षमा करें, मैं अभी आपके अनुरोध को संसाधित नहीं कर सका। कृपया बाद में पुनः प्रयास करें या अपना इंटरनेट कनेक्शन जांचें।",
            "hinglish": "Sorry, mai abhi aapka request process nahi kar paya. Kripya baad mein try kariye ya apna internet connection check kariye."
        }
        
        return error_messages.get(language, error_messages["hinglish"]) 