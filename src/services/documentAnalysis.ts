import { ENV } from '@/config/env';
import { Language } from '@/types';

export interface DocumentAnalysisResult {
  summary: string;
  keyPoints: string[];
  translation?: string;
  recommendations?: string[];
}

export class DocumentAnalysisService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = ENV.OPENAI_API_KEY;
    this.baseUrl = ENV.API_BASE_URL;
  }

  async analyzeDocument(file: File, language: Language): Promise<DocumentAnalysisResult> {
    try {
      // Extract text from the document
      const documentText = await this.extractTextFromFile(file);
      
      if (!documentText.trim()) {
        throw new Error('No text could be extracted from the document');
      }

      // Analyze the document using OpenAI
      const analysis = await this.performDocumentAnalysis(documentText, language, file.name);
      
      // Store analysis in local storage for future reference
      this.saveAnalysisToLocalStorage(file.name, analysis);
      
      return analysis;
    } catch (error) {
      console.error('Document analysis error:', error);
      throw error;
    }
  }

  private saveAnalysisToLocalStorage(fileName: string, analysis: DocumentAnalysisResult): void {
    try {
      const existingAnalyses = JSON.parse(localStorage.getItem('document-analyses') || '[]');
      const newAnalysis = {
        fileName,
        timestamp: new Date().toISOString(),
        analysis
      };
      
      existingAnalyses.push(newAnalysis);
      
      // Keep only the last 50 analyses to prevent storage bloat
      if (existingAnalyses.length > 50) {
        existingAnalyses.splice(0, existingAnalyses.length - 50);
      }
      
      localStorage.setItem('document-analyses', JSON.stringify(existingAnalyses));
    } catch (error) {
      console.warn('Failed to save analysis to local storage:', error);
    }
  }

  getStoredAnalyses(): Array<{fileName: string, timestamp: string, analysis: DocumentAnalysisResult}> {
    try {
      return JSON.parse(localStorage.getItem('document-analyses') || '[]');
    } catch (error) {
      console.warn('Failed to retrieve stored analyses:', error);
      return [];
    }
  }

  private async extractTextFromFile(file: File): Promise<string> {
    // For image files, we'll use OpenAI's vision API
    if (file.type.startsWith('image/')) {
      return await this.analyzeImageDocument(file);
    }
    
    // For PDF, Word, PPT files, we'll use vision API to analyze them as images
    if (file.type === 'application/pdf' || 
        file.type.includes('word') || 
        file.type.includes('presentation') ||
        file.type.includes('powerpoint') ||
        file.name.endsWith('.pdf') ||
        file.name.endsWith('.doc') ||
        file.name.endsWith('.docx') ||
        file.name.endsWith('.ppt') ||
        file.name.endsWith('.pptx')) {
      
      // For now, suggest taking a photo or using vision API
      throw new Error(
        'PDF, Word, and PowerPoint files require special handling. Please take a photo of the document pages for analysis, or convert to image format first.'
      );
    }
    
    // For text files, read directly
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const result = event.target?.result as string;
          
          if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
            resolve(result || '');
          } else {
            // Fallback: try to read as text
            resolve(result || '');
          }
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  private async analyzeImageDocument(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const base64Image = event.target?.result as string;
          const base64Data = base64Image.split(',')[1]; // Remove data:image/jpeg;base64, prefix
          
          // Use OpenAI Vision API to extract text from image
          const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
              model: 'gpt-4o',
              messages: [
                {
                  role: 'user',
                  content: [
                    {
                      type: 'text',
                      text: 'Please analyze this image/document. Extract all text content and provide a summary of what you see. If it contains text, transcribe it. If it\'s a visual document (chart, diagram, etc.), describe its content in detail.'
                    },
                    {
                      type: 'image_url',
                      image_url: {
                        url: `data:image/jpeg;base64,${base64Data}`
                      }
                    }
                  ]
                }
              ],
              max_tokens: 2000
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`OpenAI Vision API Error: ${errorData.error?.message || response.statusText}`);
          }

          const data = await response.json();
          const extractedText = data.choices[0].message.content;
          resolve(extractedText || '');
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
    });
  }

  private async performDocumentAnalysis(text: string, language: Language, fileName: string): Promise<DocumentAnalysisResult> {
    const systemPrompt = this.getAnalysisPrompt(language);
    
    const userPrompt = language === 'hindi' 
      ? `कृपया निम्नलिखित दस्तावेज़ का विश्लेषण करें (फ़ाइल: ${fileName}):\n\n${text}`
      : `Please analyze the following document (file: ${fileName}):\n\n${text}`;

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: ENV.DEFAULT_MODEL,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return this.parseAnalysisResponse(data.choices[0].message.content, language);
  }

  private getAnalysisPrompt(language: Language): string {
    return language === 'hindi' 
      ? `आप एक विशेषज्ञ दस्तावेज़ विश्लेषक हैं जो ELI10 (Explain Like I'm 10) शैली में सरकारी दस्तावेज़ों का विश्लेषण करते हैं। 

आपको निम्नलिखित कार्य करने हैं:
1. दस्तावेज़ का सारांश बहुत सरल हिंदी में दें (जैसे 10 साल के बच्चे को समझाते हों)
2. मुख्य बिंदुओं की सूची सरल भाषा में बनाएं (5-7 बिंदु)
3. यदि दस्तावेज़ अंग्रेजी में है तो आसान हिंदी में अनुवाद दें
4. व्यावहारिक सुझाव दें कि सरपंच और पंचायत सदस्य इसका उपयोग कैसे करें

हमेशा सरल, साफ हिंदी में उत्तर दें। कठिन शब्दों का प्रयोग न करें। ऐसे समझाएं जैसे गांव के किसी व्यक्ति को समझा रहे हों।`
      
      : `You are an expert document analyst who explains government documents in ELI10 (Explain Like I'm 10) style using simple Hinglish.

Your tasks:
1. Provide a summary in very simple Hinglish (as if explaining to a 10-year-old)
2. List key points in easy language (5-7 points)
3. If the document is in Hindi, provide simple Hinglish translation
4. Give practical tips on how Sarpanch and Panchayat members can use this

Always respond in simple Hinglish (mix of Hindi and English). Use everyday words that village people understand. Avoid complex terms. Explain like you're talking to a friend in the village.`;
  }

  private parseAnalysisResponse(response: string, language: Language): DocumentAnalysisResult {
    const lines = response.split('\n').filter(line => line.trim());
    
    let summary = '';
    let keyPoints: string[] = [];
    let translation = '';
    let recommendations: string[] = [];
    
    let currentSection = '';
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (language === 'hindi') {
        if (trimmedLine.includes('सारांश') || trimmedLine.includes('Summary')) {
          currentSection = 'summary';
          continue;
        } else if (trimmedLine.includes('मुख्य बिंदु') || trimmedLine.includes('Key Points')) {
          currentSection = 'keyPoints';
          continue;
        } else if (trimmedLine.includes('अनुवाद') || trimmedLine.includes('Translation')) {
          currentSection = 'translation';
          continue;
        } else if (trimmedLine.includes('सुझाव') || trimmedLine.includes('Recommendations')) {
          currentSection = 'recommendations';
          continue;
        }
      } else {
        if (trimmedLine.toLowerCase().includes('summary')) {
          currentSection = 'summary';
          continue;
        } else if (trimmedLine.toLowerCase().includes('key points')) {
          currentSection = 'keyPoints';
          continue;
        } else if (trimmedLine.toLowerCase().includes('translation')) {
          currentSection = 'translation';
          continue;
        } else if (trimmedLine.toLowerCase().includes('recommendations')) {
          currentSection = 'recommendations';
          continue;
        }
      }
      
      switch (currentSection) {
        case 'summary':
          if (trimmedLine && !trimmedLine.match(/^\d+\./)) {
            summary += trimmedLine + ' ';
          }
          break;
        case 'keyPoints':
          if (trimmedLine.match(/^\d+\./) || trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
            keyPoints.push(trimmedLine.replace(/^\d+\.|\•|\-/, '').trim());
          }
          break;
        case 'translation':
          if (trimmedLine && !trimmedLine.match(/^\d+\./)) {
            translation += trimmedLine + ' ';
          }
          break;
        case 'recommendations':
          if (trimmedLine.match(/^\d+\./) || trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
            recommendations.push(trimmedLine.replace(/^\d+\.|\•|\-/, '').trim());
          }
          break;
      }
    }
    
    return {
      summary: summary.trim() || response.substring(0, 200) + '...',
      keyPoints: keyPoints.length > 0 ? keyPoints : [response.substring(0, 100) + '...'],
      translation: translation.trim() || undefined,
      recommendations: recommendations.length > 0 ? recommendations : undefined
    };
  }

  async generateImage(prompt: string, language: Language): Promise<string> {
    try {
      // First, check if the prompt is appropriate for formal/work purposes
      const contentCheck = await this.checkImagePromptContent(prompt, language);
      
      if (!contentCheck.isAppropriate) {
        throw new Error(contentCheck.reason);
      }

      // Generate image using DALL-E 3 with enhanced settings
      const enhancedPrompt = `Professional government infographic: ${contentCheck.refinedPrompt}. Clean design, clear typography, official color scheme (blues, greens), modern layout, readable text, chart-style visualization, suitable for official presentations and training materials.`;
      
      const response = await fetch(`${this.baseUrl}/images/generations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: enhancedPrompt,
          size: '1024x1024',
          quality: 'hd', // Use HD quality for better professional images
          style: 'natural', // More realistic style for professional documents
          n: 1
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Image generation failed: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.data[0].url;
    } catch (error) {
      console.error('Image generation error:', error);
      throw error;
    }
  }

  private async checkImagePromptContent(prompt: string, language: Language): Promise<{isAppropriate: boolean, reason?: string, refinedPrompt: string}> {
    const systemPrompt = language === 'hindi' 
      ? `आप एक content moderator और professional prompt enhancer हैं। आपका काम है:

1. चेक करना कि request सरकारी कार्य के लिए है या entertainment के लिए
2. अगर appropriate है तो एक बेहतर professional prompt बनाना

ALLOW करें: 
- Government charts, infographics, flowcharts
- Educational diagrams और training materials  
- Official presentations और policy graphics
- Administrative process diagrams
- Budget charts और statistical visualizations
- Scheme illustrations और program explanations

REFUSE करें:
- Entertainment images
- Personal fun images
- Inappropriate content
- Non-work related images

अगर appropriate है तो एक detailed, professional prompt दें जो clear visualization के लिए हो।`
      
      : `You are a content moderator and professional prompt enhancer. Your job is to:

1. Check if the request is for government work or entertainment
2. If appropriate, create a better professional prompt

ALLOW:
- Government charts, infographics, flowcharts
- Educational diagrams and training materials  
- Official presentations and policy graphics
- Administrative process diagrams
- Budget charts and statistical visualizations
- Scheme illustrations and program explanations

REFUSE:
- Entertainment images
- Personal fun images
- Inappropriate content
- Non-work related images

If appropriate, provide a detailed, professional prompt for clear visualization.`;

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: ENV.DEFAULT_MODEL,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: language === 'hindi' 
              ? `कृपया इस image request को check करें: "${prompt}"`
              : `Please check this image request: "${prompt}"`
          }
        ],
        temperature: 0.1,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error('Content check failed');
    }

    const data = await response.json();
    const result = data.choices[0].message.content.toLowerCase();
    
    if (result.includes('refuse') || result.includes('entertainment') || result.includes('inappropriate')) {
      return {
        isAppropriate: false,
        reason: language === 'hindi' 
          ? 'क्षमा करें, यह सेवा केवल सरकारी कार्य, infographics और formal presentations के लिए है। Entertainment के लिए images नहीं बना सकते।'
          : 'Sorry, this service is only for government work, infographics and formal presentations. Cannot create images for entertainment purposes.',
        refinedPrompt: prompt
      };
    }

    // Extract improved prompt from the response
    let refinedPrompt = prompt;
    const lines = data.choices[0].message.content.split('\n');
    for (const line of lines) {
      if (line.toLowerCase().includes('improved') || line.toLowerCase().includes('refined') || line.toLowerCase().includes('better')) {
        const promptMatch = line.match(/"([^"]+)"/);
        if (promptMatch) {
          refinedPrompt = promptMatch[1];
          break;
        }
      }
    }

    return {
      isAppropriate: true,
      refinedPrompt: refinedPrompt
    };
  }
}

export const documentAnalysisService = new DocumentAnalysisService(); 