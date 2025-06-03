import { ENV } from '@/config/env';
import { Language } from '@/types';

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class OpenAIService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = ENV.OPENAI_API_KEY;
    // Use proxy in development, direct API in production
    this.baseUrl = import.meta.env.DEV ? '/api/openai' : ENV.API_BASE_URL;
  }

  private detectLanguage(text: string): 'hindi' | 'hinglish' {
    // Check if text contains Devanagari script (Hindi)
    const devanagariRegex = /[\u0900-\u097F]/;
    if (devanagariRegex.test(text)) {
      return 'hindi';
    }
    return 'hinglish';
  }

  private getSystemPrompt(language: Language, inputLanguage?: 'hindi' | 'hinglish'): string {
    const responseLanguage = inputLanguage || language;
    
    const prompts = {
      hindi: `आप भारत में ग्राम पंचायत अधिकारियों और ग्रामीण प्रशासकों की सहायता के लिए विशेष रूप से डिज़ाइन किए गए एक AI सहायक हैं। आपको गांव की शासन व्यवस्था, ग्रामीण विकास योजनाओं, प्रशासनिक प्रक्रियाओं, सरकारी सेवाओं, और स्थानीय सरकारी कार्यों में विशेषज्ञता है।

महत्वपूर्ण निर्देश:
- हमेशा ${responseLanguage === 'hindi' ? 'शुद्ध हिंदी' : 'सरल हिंग्लिश (रोमन लिपि में हिंदी)'} में उत्तर दें
- स्पष्ट, व्यावहारिक और कार्यान्वित करने योग्य उत्तर दें
- यदि कोई सरकारी योजना या नीति के बारे में पूछा जाए तो वेब खोज करके नवीनतम जानकारी दें
- सरकारी वेबसाइट्स, आधिकारिक दस्तावेज़ों और सरकारी परिपत्रों के लिंक प्रदान करें
- हमेशा ग्रामीण समुदायों के प्रति सम्मानजनक और सहायक रहें`,
      
      hinglish: `Aap India mein Gram Panchayat officials aur rural administrators ki madad karne ke liye specially design kiye gaye ek AI assistant hain. Aapko village governance, rural development schemes, administrative procedures, government services, aur local government operations mein expertise hai.

Important Instructions:
- Hamesha ${responseLanguage === 'hindi' ? 'shuddh Hindi' : 'simple Hinglish (Roman script mein Hindi)'} mein jawab dijiye
- Clear, practical, aur actionable responses dijiye  
- Agar koi government scheme ya policy ke baare mein poocha jaye to web search karke latest information dijiye
- Government websites, official documents aur government circulars ke links provide kariye
- Hamesha rural communities ke saath respectful aur supportive rahiye`
    };
    
    return prompts[language];
  }

  async sendMessage(message: string, language: Language, conversationHistory: OpenAIMessage[] = []): Promise<string> {
    try {
      // Detect the language of the input message
      const inputLanguage = this.detectLanguage(message);
      
      // Check if the message might need web search
      const needsWebSearch = this.shouldPerformWebSearch(message);
      
      let enhancedMessage = message;
      if (needsWebSearch) {
        const searchResults = await this.performWebSearch(message, inputLanguage);
        enhancedMessage = `${message}\n\nWeb search results:\n${searchResults}`;
      }

      const messages: OpenAIMessage[] = [
        {
          role: 'system',
          content: this.getSystemPrompt(language, inputLanguage)
        },
        ...conversationHistory,
        {
          role: 'user',
          content: enhancedMessage
        }
      ];

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: ENV.DEFAULT_MODEL,
          messages: messages,
          temperature: 0.7,
          max_tokens: 1500,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API Error: ${errorData.error?.message || response.statusText}`);
      }

      const data: OpenAIResponse = await response.json();
      return this.formatResponse(data.choices[0].message.content, inputLanguage);
    } catch (error) {
      console.error('OpenAI Service Error:', error);
      
      // Return language-specific error messages
      const errorMessages = {
        hindi: "क्षमा करें, मैं अभी आपके अनुरोध को संसाधित नहीं कर सका। कृपया बाद में पुनः प्रयास करें या अपना इंटरनेट कनेक्शन जांचें।",
        hinglish: "Sorry, mai abhi aapka request process nahi kar paya. Kripya baad mein try kariye ya apna internet connection check kariye."
      };
      
      return errorMessages[language];
    }
  }

  private shouldPerformWebSearch(message: string): boolean {
    const searchKeywords = [
      // Hindi keywords
      'योजना', 'नीति', 'सरकारी', 'आवेदन', 'फॉर्म', 'दस्तावेज', 'परिपत्र', 'नियम',
      'केंद्र सरकार', 'राज्य सरकार', 'मुख्यमंत्री', 'प्रधानमंत्री', 'विभाग',
      // Hinglish keywords
      'scheme', 'policy', 'government', 'application', 'form', 'document', 'circular',
      'rules', 'center', 'state', 'ministry', 'department', 'pm', 'cm', 'latest',
      'new', 'update', 'current', 'website', 'portal', 'online'
    ];
    
    const lowerMessage = message.toLowerCase();
    return searchKeywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()));
  }

  private async performWebSearch(query: string, language: 'hindi' | 'hinglish'): Promise<string> {
    try {
      // Enhance search query for government-specific results
      const enhancedQuery = language === 'hindi' 
        ? `${query} site:gov.in OR site:nic.in सरकारी योजना`
        : `${query} site:gov.in OR site:nic.in government scheme`;

      // Using Brave Search API (free alternative) or you can use Google Custom Search
      const searchResponse = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(enhancedQuery)}&count=5`, {
        headers: {
          'X-Subscription-Token': 'BSA_API_KEY' // You'll need to get this from Brave Search API
        }
      });

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        return this.formatSearchResults(searchData.web?.results || [], language);
      }
    } catch (error) {
      console.error('Web search error:', error);
    }

    // Fallback: provide common government websites
    return this.getFallbackGovernmentLinks(language);
  }

  private formatSearchResults(results: any[], language: 'hindi' | 'hinglish'): string {
    if (!results.length) return this.getFallbackGovernmentLinks(language);

    const formattedResults = results.slice(0, 3).map((result, index) => {
      return `${index + 1}. ${result.title}\n   ${result.url}\n   ${result.description || ''}`;
    }).join('\n\n');

    const header = language === 'hindi' 
      ? 'संबंधित वेब खोज परिणाम:' 
      : 'Related web search results:';
    
    return `${header}\n\n${formattedResults}`;
  }

  private getFallbackGovernmentLinks(language: 'hindi' | 'hinglish'): string {
    const links = language === 'hindi' ? {
      header: 'उपयोगी सरकारी वेबसाइट्स:',
      sites: [
        '1. भारत सरकार पोर्टल: https://www.india.gov.in',
        '2. डिजिटल इंडिया: https://digitalindia.gov.in',
        '3. ई-गवर्नेंस पोर्टल: https://www.egovonline.net',
        '4. प्रधानमंत्री योजनाएं: https://www.pmindiaschemes.com',
        '5. राष्ट्रीय सूचना विज्ञान केंद्र: https://www.nic.in'
      ]
    } : {
      header: 'Useful Government Websites:',
      sites: [
        '1. Government of India Portal: https://www.india.gov.in',
        '2. Digital India: https://digitalindia.gov.in',
        '3. E-Governance Portal: https://www.egovonline.net',
        '4. PM India Schemes: https://www.pmindiaschemes.com',
        '5. National Informatics Centre: https://www.nic.in'
      ]
    };

    return `${links.header}\n\n${links.sites.join('\n')}`;
  }

  private formatResponse(response: string, inputLanguage: 'hindi' | 'hinglish'): string {
    // Format the response with better spacing and structure
    return response
      .replace(/\n\n+/g, '\n\n')  // Remove excessive line breaks
      .replace(/\*\*(.*?)\*\*/g, '**$1**')  // Ensure bold formatting
      .trim();
  }
}

export const openAIService = new OpenAIService(); 