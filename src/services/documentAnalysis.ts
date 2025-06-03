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
    
    // For text files, read directly
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const result = event.target?.result as string;
          
          if (file.type === 'application/pdf') {
            // For now, we'll show an error message suggesting text files
            reject(new Error('PDF files are not yet supported. Please use text files or take a photo of the document.'));
          } else if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
            resolve(result || '');
          } else if (file.type.includes('word') || file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
            reject(new Error('Word documents are not yet supported. Please use text files or take a photo of the document.'));
          } else {
            reject(new Error('Unsupported file type. Please upload TXT files or take a photo of the document.'));
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
                      text: 'Please extract and transcribe all the text from this document image. Provide the exact text content as it appears in the document.'
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
      ? `आप एक विशेषज्ञ दस्तावेज़ विश्लेषक हैं जो सरकारी दस्तावेज़ों, नीतियों, और प्रशासनिक पत्रों का विश्लेषण करते हैं। 

आपको निम्नलिखित कार्य करने हैं:
1. दस्तावेज़ का संक्षिप्त सारांश दें (2-3 वाक्यों में)
2. मुख्य बिंदुओं की सूची बनाएं (5-7 बिंदु)
3. यदि दस्तावेज़ अंग्रेजी में है तो उसका हिंदी अनुवाद दें
4. व्यावहारिक सुझाव दें कि ग्राम पंचायत अधिकारी इस जानकारी का उपयोग कैसे कर सकते हैं

हमेशा शुद्ध हिंदी में उत्तर दें और स्पष्ट, संरचित तरीके से जानकारी प्रस्तुत करें।`
      
      : `You are an expert document analyst specializing in government documents, policies, and administrative communications.

Your tasks:
1. Provide a brief summary of the document (2-3 sentences)
2. List key points (5-7 points)
3. If the document is in Hindi, provide English translation
4. Provide practical recommendations on how Gram Panchayat officials can use this information

Always respond in simple Hinglish (Roman script Hindi) and present information in a clear, structured manner.`;
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
}

export const documentAnalysisService = new DocumentAnalysisService(); 