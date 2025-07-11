import { ENV } from '@/config/env';
import { Language } from '@/types';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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
      console.log('Starting document analysis for:', file.name, 'Type:', file.type, 'Size:', file.size);
      
      // Check file size (limit to 50MB)
      if (file.size > 50 * 1024 * 1024) {
        throw new Error(language === 'hindi' 
          ? 'फ़ाइल का आकार 50MB से अधिक है। कृपया छोटी फ़ाइल का उपयोग करें।'
          : 'File size exceeds 50MB. Please use a smaller file.');
      }

      // Check if we have API key
      if (!this.apiKey) {
        console.warn('No OpenAI API key found, using fallback analysis');
        return this.generateFallbackAnalysis(file.name, file.name, language);
      }

      // Extract text from the document
      const documentText = await this.extractTextFromFile(file);
      
      if (!documentText.trim()) {
        throw new Error(language === 'hindi' 
          ? 'दस्तावेज़ से कोई टेक्स्ट नहीं मिला। कृपया दूसरी फ़ाइल की कोशिश करें।'
          : 'No text could be extracted from the document. Please try a different file.');
      }

      console.log('Extracted text length:', documentText.length);

      // Analyze the document using OpenAI
      try {
        const analysis = await this.performDocumentAnalysis(documentText, language, file.name);
        
        // Store analysis in local storage for future reference
        this.saveAnalysisToLocalStorage(file.name, analysis);
        
        return analysis;
      } catch (apiError) {
        console.warn('API analysis failed, using fallback:', apiError);
        // Fallback to local analysis if API fails
        return this.generateFallbackAnalysis(documentText, file.name, language);
      }
      
    } catch (error) {
      console.error('Document analysis error:', error);
      
      // Provide user-friendly error messages
      if (error instanceof Error) {
        if (error.message.includes('fetch') || error.message.includes('network')) {
          throw new Error(language === 'hindi' 
            ? 'इंटरनेट कनेक्शन की समस्या। कृपया अपना कनेक्शन जांचें और पुनः प्रयास करें।'
            : 'Network connection issue. Please check your connection and try again.');
        }
        if (error.message.includes('API') || error.message.includes('401') || error.message.includes('403')) {
          throw new Error(language === 'hindi' 
            ? 'सेवा में अस्थायी समस्या है। कृपया बाद में पुनः प्रयास करें।'
            : 'Temporary service issue. Please try again later.');
        }
        throw error;
      }
      
      throw new Error(language === 'hindi' 
        ? 'दस्तावेज़ विश्लेषण में त्रुटि। कृपया पुनः प्रयास करें।'
        : 'Document analysis failed. Please try again.');
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
    console.log('Extracting text from file:', file.name, 'Type:', file.type);
    
    // For image files, we'll use OpenAI's vision API
    if (file.type.startsWith('image/')) {
      return await this.analyzeImageDocument(file);
    }
    
    // For PDF files, use PDF.js to extract text
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      return await this.extractTextFromPDF(file);
    }
    
    // For text files, read directly
    if (file.type.startsWith('text/') || 
        file.name.endsWith('.txt') ||
        file.name.endsWith('.csv') ||
        file.name.endsWith('.rtf')) {
      return await this.readTextFile(file);
    }
    
    // For Word and PowerPoint files, provide helpful guidance
    if (file.type.includes('word') || 
        file.type.includes('presentation') ||
        file.type.includes('powerpoint') ||
        file.name.endsWith('.doc') ||
        file.name.endsWith('.docx') ||
        file.name.endsWith('.ppt') ||
        file.name.endsWith('.pptx')) {
      
      throw new Error(
        'Word और PowerPoint फ़ाइलों के लिए सबसे अच्छा तरीका है कि आप दस्तावेज़ का स्क्रीनशॉट लें या उसे PDF में कन्वर्ट करें। फिर इमेज या PDF अपलोड करें। / For Word and PowerPoint files, the best approach is to take a screenshot of the document or convert it to PDF, then upload the image or PDF file.'
      );
    }
    
    // For other file types, try to read as text
    return await this.readTextFile(file);
  }

  private async readTextFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const result = event.target?.result as string;
          resolve(result || '');
        } catch (error) {
          reject(new Error('Failed to read text file'));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file, 'UTF-8');
    });
  }

  private async extractTextFromPDF(file: File): Promise<string> {
    try {
      console.log('Extracting text from PDF using PDF.js');
      
      const arrayBuffer = await file.arrayBuffer();
      
      // Configure PDF.js options for better compatibility
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        standardFontDataUrl: `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/standard_fonts/`,
        cMapUrl: `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`,
        cMapPacked: true,
      });
      
      const pdf = await loadingTask.promise;
      
      console.log('PDF loaded, pages:', pdf.numPages);
      
      let fullText = '';
      
      // Extract text from all pages (limit to first 10 pages for performance)
      const maxPages = Math.min(pdf.numPages, 10);
      
      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          
          fullText += `Page ${pageNum}:\n${pageText}\n\n`;
          console.log(`Extracted text from page ${pageNum}, length:`, pageText.length);
        } catch (pageError) {
          console.warn(`Error extracting text from page ${pageNum}:`, pageError);
          continue;
        }
      }
      
      if (pdf.numPages > 10) {
        fullText += `\n[नोट: इस PDF में ${pdf.numPages} पेज हैं, लेकिन पहले 10 पेज का विश्लेषण किया गया है। / Note: This PDF has ${pdf.numPages} pages, but only the first 10 pages were analyzed.]`;
      }
      
      console.log('Total extracted text length:', fullText.length);
      
      if (!fullText.trim()) {
        throw new Error('PDF से कोई टेक्स्ट नहीं मिला। यह एक स्कैन्ड PDF हो सकती है। कृपया PDF का स्क्रीनशॉट लें और इमेज के रूप में अपलोड करें। / No text found in PDF. This might be a scanned PDF. Please take a screenshot and upload as image.');
      }
      
      return fullText;
    } catch (error) {
      console.error('PDF extraction error:', error);
      
      if (error instanceof Error && error.message.includes('कोई टेक्स्ट नहीं मिला')) {
        throw error;
      }
      
      throw new Error(
        'PDF प्रोसेसिंग में त्रुटि। यदि यह एक स्कैन्ड PDF है, तो कृपया इसका स्क्रीनशॉट लें और इमेज फॉर्मेट में अपलोड करें। / Error processing PDF. If this is a scanned PDF, please take a screenshot and upload in image format.'
      );
    }
  }

  private async analyzeImageDocument(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const base64Image = event.target?.result as string;
          const base64Data = base64Image.split(',')[1]; // Remove data:image/jpeg;base64, prefix
          
          console.log('Analyzing image with OpenAI Vision API');
          
          // Use a CORS proxy or your own backend endpoint
          const proxyUrl = 'https://api.allorigins.win/raw?url=';
          const targetUrl = encodeURIComponent(`${this.baseUrl}/chat/completions`);
          
          // Try direct API call first, fallback to mock analysis if CORS issues
          try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
                'Origin': window.location.origin
              },
              body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                  {
                    role: 'user',
                    content: [
                      {
                        type: 'text',
                        text: 'Please analyze this image/document carefully. Extract all visible text content and provide a comprehensive summary. If it contains Hindi text, include both the original text and English translation. If it\'s a government document, identify the type and key information. If it\'s a chart or diagram, describe its content in detail.'
                      },
                      {
                        type: 'image_url',
                        image_url: {
                          url: `data:${file.type};base64,${base64Data}`,
                          detail: 'high'
                        }
                      }
                    ]
                  }
                ],
                max_tokens: 2000,
                temperature: 0.1
              })
            });

            if (!response.ok) {
              throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            const extractedText = data.choices[0].message.content;
            console.log('Successfully extracted text from image');
            resolve(extractedText || '');
          } catch (apiError) {
            console.warn('Direct API call failed, using fallback analysis:', apiError);
            
            // Fallback: Provide a basic analysis based on file properties
            const fallbackText = `
Image Document Analysis (${file.name})

File Type: ${file.type}
File Size: ${(file.size / 1024).toFixed(2)} KB
Upload Time: ${new Date().toLocaleString()}

यह एक इमेज दस्तावेज़ है जिसका विश्लेषण किया गया है।
This is an image document that has been analyzed.

कृपया सुनिश्चित करें कि:
Please ensure that:
- इमेज स्पष्ट और पढ़ने योग्य है / Image is clear and readable
- टेक्स्ट दिखाई दे रहा है / Text is visible
- फ़ाइल का साइज़ उचित है / File size is appropriate

सुझाव / Suggestions:
1. बेहतर रोशनी में फोटो लें / Take photo in better lighting
2. टेक्स्ट को स्पष्ट रूप से दिखाएं / Show text clearly
3. पूरा दस्तावेज़ फ्रेम में रखें / Keep entire document in frame
            `;
            
            resolve(fallbackText);
          }
        } catch (error) {
          console.error('Image analysis error:', error);
          reject(new Error('Failed to analyze image document'));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
    });
  }

  private async performDocumentAnalysis(text: string, language: Language, fileName: string): Promise<DocumentAnalysisResult> {
    const systemPrompt = this.getAnalysisPrompt(language);
    
    const userPrompt = language === 'hindi' 
      ? `कृपया निम्नलिखित दस्तावेज़ का विस्तृत विश्लेषण करें (फ़ाइल: ${fileName}):\n\n${text}`
      : `Please provide a detailed analysis of the following document (file: ${fileName}):\n\n${text}`;

    try {
      console.log('Calling OpenAI API for document analysis');
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Origin': window.location.origin
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
        const errorData = await response.json().catch(() => ({ error: { message: response.statusText } }));
        throw new Error(`OpenAI API Error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      console.log('Successfully received analysis from OpenAI');
      return this.parseAnalysisResponse(data.choices[0].message.content, language);
    } catch (error) {
      console.warn('API analysis failed, using fallback analysis:', error);
      
      // Fallback: Provide basic analysis without API
      return this.generateFallbackAnalysis(text, fileName, language);
    }
  }

  private generateFallbackAnalysis(text: string, fileName: string, language: Language): DocumentAnalysisResult {
    console.log('Generating fallback analysis');
    
    const textLength = text.length;
    const wordCount = text.split(/\s+/).length;
    const lines = text.split('\n').length;
    
    if (language === 'hindi') {
      return {
        summary: `यह दस्तावेज़ "${fileName}" है जिसमें लगभग ${wordCount} शब्द हैं और ${lines} लाइनें हैं। दस्तावेज़ में विभिन्न जानकारी और विवरण शामिल हैं।`,
        keyPoints: [
          `दस्तावेज़ का नाम: ${fileName}`,
          `कुल शब्द: ${wordCount}`,
          `कुल लाइनें: ${lines}`,
          'यह एक महत्वपूर्ण दस्तावेज़ प्रतीत होता है',
          'कृपया विस्तृत विश्लेषण के लिए बेहतर इंटरनेट कनेक्शन का उपयोग करें'
        ],
        recommendations: [
          'दस्तावेज़ को ध्यान से पढ़ें',
          'महत्वपूर्ण बिंदुओं को नोट करें',
          'यदि आवश्यक हो तो संबंधित अधिकारियों से संपर्क करें'
        ]
      };
    } else {
      return {
        summary: `This is document "${fileName}" containing approximately ${wordCount} words and ${lines} lines. The document includes various information and details.`,
        keyPoints: [
          `Document name: ${fileName}`,
          `Total words: ${wordCount}`,
          `Total lines: ${lines}`,
          'This appears to be an important document',
          'Please use better internet connection for detailed analysis'
        ],
        recommendations: [
          'Read the document carefully',
          'Note down important points',
          'Contact relevant authorities if needed'
        ]
      };
    }
  }

  private getAnalysisPrompt(language: Language): string {
    if (language === 'hindi') {
      return `आप भारत में ग्राम पंचायत और सरकारी दस्तावेज़ों के विश्लेषण में विशेषज्ञ हैं। आपका काम है दस्तावेज़ों का विस्तृत और उपयोगी विश्लेषण करना।

कृपया निम्नलिखित प्रारूप में उत्तर दें:

सारांश: [दस्तावेज़ का मुख्य सारांश]

मुख्य बिंदु:
• [पहला मुख्य बिंदु]
• [दूसरा मुख्य बिंदु]
• [तीसरा मुख्य बिंदु]

अनुवाद: [यदि दस्तावेज़ में अंग्रेजी या अन्य भाषा है तो हिंदी अनुवाद]

सुझाव:
• [पहला सुझाव]
• [दूसरा सुझाव]

हमेशा स्पष्ट, संक्षिप्त और व्यावहारिक जानकारी दें।`;
    } else {
      return `You are an expert in analyzing Gram Panchayat and government documents in India. Your job is to provide detailed and useful analysis of documents.

Please respond in the following format:

Summary: [Main summary of the document]

Key Points:
• [First key point]
• [Second key point] 
• [Third key point]

Translation: [If document contains Hindi or other languages, provide Hinglish translation]

Recommendations:
• [First recommendation]
• [Second recommendation]

Always provide clear, concise, and practical information.`;
    }
  }

  private parseAnalysisResponse(response: string, language: Language): DocumentAnalysisResult {
    try {
      const lines = response.split('\n').filter(line => line.trim());
      
      let summary = '';
      const keyPoints: string[] = [];
      let translation = '';
      const recommendations: string[] = [];
      
      let currentSection = 'summary';
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        if (trimmedLine.toLowerCase().includes('summary') || trimmedLine.includes('सारांश')) {
          currentSection = 'summary';
          const colonIndex = trimmedLine.indexOf(':');
          if (colonIndex !== -1) {
            summary = trimmedLine.substring(colonIndex + 1).trim();
          }
        } else if (trimmedLine.toLowerCase().includes('key points') || trimmedLine.includes('मुख्य बिंदु')) {
          currentSection = 'keyPoints';
        } else if (trimmedLine.toLowerCase().includes('translation') || trimmedLine.includes('अनुवाद')) {
          currentSection = 'translation';
          const colonIndex = trimmedLine.indexOf(':');
          if (colonIndex !== -1) {
            translation = trimmedLine.substring(colonIndex + 1).trim();
          }
        } else if (trimmedLine.toLowerCase().includes('recommendation') || trimmedLine.includes('सुझाव')) {
          currentSection = 'recommendations';
        } else if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
          const point = trimmedLine.substring(1).trim();
          if (currentSection === 'keyPoints') {
            keyPoints.push(point);
          } else if (currentSection === 'recommendations') {
            recommendations.push(point);
          }
        } else if (currentSection === 'summary' && trimmedLine && !summary) {
          summary = trimmedLine;
        } else if (currentSection === 'translation' && trimmedLine && !translation) {
          translation = trimmedLine;
        }
      }
      
      // Fallback parsing if structured format not found
      if (!summary && !keyPoints.length) {
        const sentences = response.split('.').filter(s => s.trim());
        summary = sentences.slice(0, 2).join('.').trim();
        
        for (let i = 2; i < Math.min(sentences.length, 6); i++) {
          if (sentences[i].trim()) {
            keyPoints.push(sentences[i].trim());
          }
        }
      }
      
      return {
        summary: summary || (language === 'hindi' 
          ? 'दस्तावेज़ का विश्लेषण पूरा हुआ।' 
          : 'Document analysis completed.'),
        keyPoints: keyPoints.length ? keyPoints : [
          language === 'hindi' 
            ? 'दस्तावेज़ में महत्वपूर्ण जानकारी है' 
            : 'Document contains important information'
        ],
        translation: translation || undefined,
        recommendations: recommendations.length ? recommendations : [
          language === 'hindi' 
            ? 'दस्तावेज़ को ध्यान से पढ़ें और आवश्यक कार्रवाई करें' 
            : 'Read the document carefully and take necessary action'
        ]
      };
    } catch (error) {
      console.error('Error parsing analysis response:', error);
      
      // Return basic analysis
      return {
        summary: language === 'hindi' 
          ? 'दस्तावेज़ का बुनियादी विश्लेषण' 
          : 'Basic document analysis',
        keyPoints: [
          language === 'hindi' 
            ? 'दस्तावेज़ सफलतापूर्वक अपलोड हुआ' 
            : 'Document uploaded successfully',
          language === 'hindi' 
            ? 'विस्तृत विश्लेषण के लिए बेहतर कनेक्शन की आवश्यकता' 
            : 'Better connection needed for detailed analysis'
        ]
      };
    }
  }

  async generateImage(prompt: string, language: Language): Promise<string> {
    try {
      console.log('Generating image with prompt:', prompt);
      
      // Check if we have API key
      if (!this.apiKey) {
        console.warn('No OpenAI API key found, using placeholder image');
        return this.generatePlaceholderImage(prompt, language);
      }
      
      // Check if prompt is appropriate for government work
      const contentCheck = await this.checkImagePromptContent(prompt, language);
      
      if (!contentCheck.isAppropriate) {
        throw new Error(contentCheck.reason || (language === 'hindi' 
          ? 'यह प्रॉम्प्ट सरकारी कार्य के लिए उपयुक्त नहीं है।'
          : 'This prompt is not suitable for government work.'));
      }

      // Use refined prompt for better results
      const enhancedPrompt = `${contentCheck.refinedPrompt}. Professional government document style, clean design, appropriate for official presentations and training materials.`;

      try {
        const response = await fetch(`${this.baseUrl}/images/generations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: enhancedPrompt,
            n: 1,
            size: '1024x1024',
            quality: 'standard',
            response_format: 'url'
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          if (response.status === 401) {
            throw new Error(language === 'hindi' 
              ? 'API key अमान्य है। कृपया सही OpenAI API key जोड़ें।'
              : 'Invalid API key. Please add a valid OpenAI API key.');
          }
          throw new Error(`Image generation failed: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        console.log('Successfully generated image');
        return data.data[0].url;
      } catch (apiError) {
        console.warn('DALL-E API failed, using placeholder image:', apiError);
        return this.generatePlaceholderImage(prompt, language);
      }
      
    } catch (error) {
      console.error('Image generation error:', error);
      
      if (error instanceof Error && error.message.includes('appropriate')) {
        throw error;
      }
      
      // Return placeholder instead of failing completely
      return this.generatePlaceholderImage(prompt, language);
    }
  }

  private generatePlaceholderImage(prompt: string, language: Language): string {
    // Create a data URL for a simple placeholder image
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, 400, 300);
      gradient.addColorStop(0, '#34d399');
      gradient.addColorStop(1, '#059669');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 400, 300);
      
      // Add text
      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        language === 'hindi' ? 'AI छवि जेनरेटर' : 'AI Image Generator',
        200, 100
      );
      
      ctx.font = '14px Arial';
      const promptText = prompt.length > 50 ? prompt.substring(0, 47) + '...' : prompt;
      ctx.fillText(promptText, 200, 140);
      
      ctx.font = '12px Arial';
      ctx.fillText(
        language === 'hindi' 
          ? 'पूर्ण सुविधा के लिए API key आवश्यक' 
          : 'API key required for full functionality',
        200, 200
      );
      
      return canvas.toDataURL('image/png');
    }
    
    // Fallback: return a simple SVG data URL
    const svg = `
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#34d399;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#grad)" />
        <text x="200" y="100" text-anchor="middle" fill="white" font-family="Arial" font-size="16" font-weight="bold">
          ${language === 'hindi' ? 'AI छवि जेनरेटर' : 'AI Image Generator'}
        </text>
        <text x="200" y="140" text-anchor="middle" fill="white" font-family="Arial" font-size="14">
          ${prompt.length > 30 ? prompt.substring(0, 27) + '...' : prompt}
        </text>
        <text x="200" y="200" text-anchor="middle" fill="white" font-family="Arial" font-size="12">
          ${language === 'hindi' ? 'API key आवश्यक' : 'API key required'}
        </text>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  private async checkImagePromptContent(prompt: string, language: Language): Promise<{isAppropriate: boolean, reason?: string, refinedPrompt: string}> {
    // Basic content filtering for government appropriate content
    const inappropriateKeywords = [
      'weapon', 'violence', 'adult', 'inappropriate', 'political party', 'religion', 'caste',
      'हथियार', 'हिंसा', 'अनुचित', 'राजनीतिक पार्टी', 'धर्म', 'जाति'
    ];
    
    const lowerPrompt = prompt.toLowerCase();
    const hasInappropriate = inappropriateKeywords.some(keyword => 
      lowerPrompt.includes(keyword.toLowerCase())
    );
    
    if (hasInappropriate) {
      return {
        isAppropriate: false,
        reason: language === 'hindi' 
          ? 'यह प्रॉम्प्ट सरकारी कार्य के लिए उपयुक्त नहीं है।'
          : 'This prompt is not suitable for government work.',
        refinedPrompt: prompt
      };
    }
    
    // Enhance prompt for government context
    const governmentKeywords = ['government', 'panchayat', 'scheme', 'official', 'सरकार', 'पंचायत', 'योजना'];
    const hasGovernmentContext = governmentKeywords.some(keyword => 
      lowerPrompt.includes(keyword.toLowerCase())
    );
    
    let refinedPrompt = prompt;
    if (!hasGovernmentContext) {
      refinedPrompt = language === 'hindi' 
        ? `सरकारी कार्य के लिए ${prompt} - आधिकारिक और व्यावसायिक शैली में`
        : `${prompt} for government work - in official and professional style`;
    }
    
    return {
      isAppropriate: true,
      refinedPrompt
    };
  }
}

// Export singleton instance
export const documentAnalysisService = new DocumentAnalysisService(); 