import re
from openai import AsyncOpenAI, OpenAI
from typing import List, Dict, Any, AsyncGenerator, Optional
import base64
import time
import asyncio

from ..core.config import get_settings

settings = get_settings()

client = AsyncOpenAI(
    api_key=settings.OPENAI_API_KEY,
    default_headers={"OpenAI-Beta": "assistants=v2"}
)
openai_client = OpenAI(
    api_key=settings.OPENAI_API_KEY,
    default_headers={"OpenAI-Beta": "assistants=v2"}
)


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
- हमेशा ग्रामीण समुदायों के प्रति सम्मानजनक और सहायक रहें


""",

        "hinglish": f"""Aap India mein Gram Panchayat officials aur rural administrators ki madad karne ke liye specially design kiye gaye ek AI assistant hain. Aapko village governance, rural development schemes, administrative procedures, government services, aur local government operations mein expertise hai.

Important Instructions:
- Hamesha {'shuddh Hindi' if response_language == 'hindi' else 'simple Hinglish (Roman script mein Hindi)'} mein jawab dijiye
- Clear, practical, aur actionable responses dijiye  
- Agar koi government scheme ya policy ke baare mein poocha jaye to web search karke latest information dijiye
- Government websites, official documents aur government circulars ke links provide kariye
- Hamesha rural communities ke saath respectful aur supportive rahiye


""",
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
    conversation_context: list,
    language: str,
    rag_context: str | None = None
) -> AsyncGenerator[str, None]:
    """
    Generates a streaming response from OpenAI's chat model, dynamically
    adjusting the system prompt based on the availability of RAG context.
    """
    try:
        # Detect the language of the input message
        input_language = detect_language(message)
        # Get system prompt
        default_system_prompt = get_system_prompt(language, input_language)

        # Add language-specific instruction based on user's input language
        language_instructions = {
            "hindi": "\n\nमहत्वपूर्ण: उपयोगकर्ता हिंदी में लिख रहा है, इसलिए केवल शुद्ध हिंदी में उत्तर दें।",
            "hinglish": "\n\nIMPORTANT: User Hinglish mein likh raha hai, so please respond ONLY in simple Hinglish (Roman script mein Hindi)."
        }

        system_prompt = default_system_prompt + language_instructions.get(input_language, language_instructions["hinglish"])

        if rag_context:
            rag_system_prompt = f"""
            {system_prompt}
            You are Sarathi, an expert AI assistant for Jharkhand Gram Panchayat officials.
            Your goal is to answer questions using the provided context from official documents.
            - Respond ONLY in the user's language ({language}).
            - Base your answer STRICTLY on the context provided below. Do not use outside knowledge.
            - If the answer is not in the context, state that you cannot find the information in the provided documents.
            - Structure your answers clearly and concisely.

            Context:
            ---
            {rag_context}
            ---
            """
            if rag_context:
                system_prompt = rag_system_prompt

        # Prepare messages
        messages = [{"role": "system", "content": system_prompt}]

        # Add conversation history
        if conversation_context:
            for msg in conversation_context[-10:]:  # Last 10 messages
                messages.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })

        # Add current message
        messages.append({"role": "user", "content": message})

        # Call OpenAI API
        response_stream = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=messages,
            stream=True,
        )
        # Yield each chunk from the stream
        async for chunk in response_stream:
            content = chunk.choices[0].delta.content
            if content:
                yield content

        # Add government links if needed
        if should_perform_web_search(message):
            links = f"\n\n{get_fallback_government_links(language)}"
            yield links

    except Exception as e:
        print(f"OpenAI Service Error: {e}")

        # Return language-specific error messages
        error_messages = {
            "hindi": "क्षमा करें, मैं अभी आपके अनुरोध को संसाधित नहीं कर सका। कृपया बाद में पुनः प्रयास करें या अपना इंटरनेट कनेक्शन जांचें।",
            "hinglish": "Sorry, mai abhi aapka request process nahi kar paya. Kripya baad mein try kariye ya apna internet connection check kariye."
        }

        yield error_messages.get(language, error_messages["hinglish"])


async def analyze_document_with_assistant(file_data_base64: str, language: str, question: Optional[str], keep_resources: bool = True) -> Dict[str, Any]:
    """
    Analyze a document (PDF or image) using the OpenAI Assistants API with file search.
    If keep_resources=True, keeps assistant, thread, and file for follow-up questions.
    """
    print("🚀 Analyzing document with Assistant API...")
    
    assistant = None
    thread = None
    uploaded_file = None

    try:
        # Decode the base64 data to bytes
        try:
            if 'base64,' in file_data_base64:
                file_data_base64 = file_data_base64.split('base64,')[1]
            file_bytes = base64.b64decode(file_data_base64)
            filename = "document.pdf" if file_bytes.startswith(b'%PDF-') else "document.png"
        except Exception as e:
            print(f"❌ Invalid base64 data: {e}")
            return {"main_information": "Error: Invalid file data."}

        # 1. Upload the file to OpenAI
        uploaded_file = await client.files.create(
            file=(filename, file_bytes),
            purpose='assistants'
        )
        print(f"📄 File uploaded to OpenAI with ID: {uploaded_file.id}")

        # 2. Create an Assistant with file_search enabled
        if language == "hindi":
            assistant_instructions = "आप एक विशेषज्ञ दस्तावेज़ विश्लेषक हैं। उपयोगकर्ता द्वारा अपलोड किए गए दस्तावेज़ का विश्लेषण करें और उनके प्रश्नों का उत्तर दें। यदि कोई प्रश्न नहीं है, तो दस्तावेज़ का विस्तृत सारांश प्रदान करें।"
        else:
            assistant_instructions = "You are an expert document analyst. Your role is to analyze the document provided by the user, and answer their questions. If there is no question, provide a detailed summary of the document."

        assistant = await client.beta.assistants.create(
            name="Document Analyzer",
            instructions=assistant_instructions,
            model="gpt-4o",
            tools=[{"type": "file_search"}]
        )
        print(f"🤖 Assistant created with ID: {assistant.id}")

        # 3. Create a Thread and add the message with the file attachment
        if language == "hindi":
            user_prompt = question or "कृपया इस दस्तावेज़ का एक विस्तृत सारांश प्रदान करें।"
        else:
            user_prompt = question or "Please provide a detailed summary of this document."

        thread = await client.beta.threads.create(
            messages=[
                {
                    "role": "user",
                    "content": user_prompt,
                    "attachments": [{"file_id": uploaded_file.id, "tools": [{"type": "file_search"}]}]
                }
            ]
        )
        print(f"🧵 Thread created with ID: {thread.id}")

        # 4. Run the Assistant and poll for completion
        print("⏳ Running assistant...")
        run = await client.beta.threads.runs.create(
            thread_id=thread.id,
            assistant_id=assistant.id
        )

        while run.status in ['queued', 'in_progress']:
            await asyncio.sleep(1)
            run = await client.beta.threads.runs.retrieve(
                thread_id=thread.id,
                run_id=run.id
            )
            print(f"🏃 Run status: {run.status}")

        # 5. Retrieve and return the response
        if run.status == 'completed':
            messages = await client.beta.threads.messages.list(thread_id=thread.id, order="asc")
            assistant_response = ""
            async for msg in messages:
                if msg.role == "assistant":
                    for content_block in msg.content:
                        if content_block.type == 'text':
                            assistant_response += content_block.text.value + "\n"
            
            if assistant_response:
                print("✅ Assistant run completed successfully.")
                result = {
                    "document_type": "AI Analysis",
                    "detected_language": language,
                    "confidence": 0.95,
                    "fields_detected": [],
                    "suggestions": ["Review the provided analysis.", "Ask follow-up questions if you need more details."],
                    "main_information": assistant_response.strip()
                }
                
                # Add persistent IDs for follow-up questions if keeping resources
                if keep_resources:
                    result.update({
                        "assistant_id": assistant.id,
                        "thread_id": thread.id,
                        "file_id": uploaded_file.id
                    })
                    print(f"💾 Keeping resources for follow-up: assistant={assistant.id}, thread={thread.id}, file={uploaded_file.id}")
                
                return result
            else:
                raise Exception("Assistant finished but returned no response.")
        else:
            raise Exception(f"Assistant run failed with status: {run.status} - {run.last_error}")

    except Exception as e:
        print(f"❌ Error in Assistant API call: {e}")
        error_message = "An error occurred during document analysis."
        if language == "hindi":
            error_message = "दस्तावेज़ विश्लेषण के दौरान एक त्रुटि हुई।"
        return {"main_information": f"{error_message} Error: {str(e)}"}
    
    finally:
        # 6. Clean up resources only if not keeping them
        if not keep_resources:
            try:
                if assistant:
                    await client.beta.assistants.delete(assistant.id)
                    print(f"✅ Deleted assistant: {assistant.id}")
                if thread:
                    await client.beta.threads.delete(thread.id)
                    print(f"✅ Deleted thread: {thread.id}")
                if uploaded_file:
                    await client.files.delete(uploaded_file.id)
                    print(f"✅ Deleted file: {uploaded_file.id}")
            except Exception as cleanup_error:
                print(f"⚠️ Error during resource cleanup: {cleanup_error}")
        else:
            print(f"💾 Resources kept for follow-up questions")


async def ask_document_question(
    question: str,
    assistant_id: str,
    thread_id: str,
    language: str
) -> str:
    """
    Ask a follow-up question to an existing document analysis assistant.
    """
    try:
        print(f"💬 Asking follow-up question to assistant {assistant_id}")
        print(f"🧵 Using thread {thread_id}")
        print(f"❓ Question: {question}")
        
        # Add the question to the existing thread
        await client.beta.threads.messages.create(
            thread_id=thread_id,
            role="user",
            content=question
        )
        
        # Run the assistant again
        run = await client.beta.threads.runs.create(
            thread_id=thread_id,
            assistant_id=assistant_id
        )
        
        # Poll for completion
        while run.status in ['queued', 'in_progress']:
            await asyncio.sleep(1)
            run = await client.beta.threads.runs.retrieve(
                thread_id=thread_id,
                run_id=run.id
            )
            print(f"🏃 Run status: {run.status}")
        
        if run.status == 'completed':
            # Get the latest assistant response
            messages = await client.beta.threads.messages.list(
                thread_id=thread_id, 
                order="desc", 
                limit=1
            )
            
            async for msg in messages:
                if msg.role == "assistant":
                    assistant_response = ""
                    for content_block in msg.content:
                        if content_block.type == 'text':
                            assistant_response += content_block.text.value
                    
                    print(f"✅ Follow-up question answered successfully")
                    return assistant_response.strip()
            
            raise Exception("No assistant response found")
        else:
            raise Exception(f"Assistant run failed with status: {run.status}")
            
    except Exception as e:
        print(f"❌ Error in follow-up question: {e}")
        error_message = "An error occurred while processing your question."
        if language == "hindi":
            error_message = "आपके प्रश्न को संसाधित करते समय एक त्रुटि हुई।"
        return f"{error_message} Error: {str(e)}"


async def cleanup_document_resources(assistant_id: str, thread_id: str, file_id: str):
    """
    Clean up document analysis resources when no longer needed.
    """
    try:
        print(f"🧹 Cleaning up document resources...")
        
        await client.beta.assistants.delete(assistant_id)
        print(f"✅ Deleted assistant: {assistant_id}")
        
        await client.beta.threads.delete(thread_id)
        print(f"✅ Deleted thread: {thread_id}")
        
        await client.files.delete(file_id)
        print(f"✅ Deleted file: {file_id}")
        
    except Exception as cleanup_error:
        print(f"⚠️ Error during resource cleanup: {cleanup_error}")
        raise cleanup_error