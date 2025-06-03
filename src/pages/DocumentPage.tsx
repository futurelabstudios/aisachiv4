import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Camera, MessageCircle, Send, Loader2, Home, Mic, Globe, Link as LinkIcon, GraduationCap, PlayCircle, BookOpen, Image, Palette } from "lucide-react";
import { documentAnalysisService, DocumentAnalysisResult } from "@/services/documentAnalysis";
import { openAIService, OpenAIMessage } from "@/services/openai";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/components/ui/use-toast";
import { Link, useLocation } from "react-router-dom";
import { Message } from "@/types";
import { v4 as uuidv4 } from "uuid";

export default function DocumentPage() {
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<DocumentAnalysisResult | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleLanguage = () => {
    if (language === 'hindi') setLanguage('hinglish');
    else setLanguage('hindi');
  };

  const getLanguageButtonText = () => {
    switch(language) {
      case 'hindi': return t('switchToHinglish');
      case 'hinglish': return t('switchToHindi');
      default: return 'हिंदी';
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: language === 'hindi' ? 'फ़ाइल बहुत बड़ी है' : 'File too large',
          description: language === 'hindi' 
            ? 'कृपया 50MB से छोटी फ़ाइल अपलोड करें।'
            : 'Please upload a file smaller than 50MB.',
          variant: 'destructive'
        });
        return;
      }

      setUploadedFile(file);
      setAnalysisResult(null);
      setMessages([]);
      setCapturedImage(null);
    }
  };

  const startCamera = async () => {
    try {
      // Check if we're on mobile or desktop
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser');
      }
      
      // Request camera permission and get stream
      const constraints = { 
        video: { 
          facingMode: isMobile ? 'environment' : 'user', // Back camera on mobile, front camera on laptop
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
        };
        setShowCamera(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      
      let errorMessage = '';
      let errorTitle = '';
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorTitle = language === 'hindi' ? 'कैमरा अनुमति चाहिए' : 'Camera Permission Required';
          errorMessage = language === 'hindi' 
            ? 'कृपया ब्राउज़र में कैमरा का उपयोग करने की अनुमति दें।'
            : 'Please allow camera access in your browser settings.';
        } else if (error.name === 'NotFoundError') {
          errorTitle = language === 'hindi' ? 'कैमरा नहीं मिला' : 'Camera Not Found';
          errorMessage = language === 'hindi' 
            ? 'कोई कैमरा डिवाइस नहीं मिला।'
            : 'No camera device found.';
        } else {
          errorTitle = language === 'hindi' ? 'कैमरा त्रुटि' : 'Camera Error';
          errorMessage = language === 'hindi' 
            ? 'कैमरा एक्सेस नहीं हो सका। कृपया पुनः प्रयास करें।'
            : 'Could not access camera. Please try again.';
        }
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context) {
        context.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageData);
        setShowCamera(false);
        
        // Stop camera stream
        const stream = video.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        
        // Convert to file for analysis
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'captured-document.jpg', { type: 'image/jpeg' });
            setUploadedFile(file);
            setAnalysisResult(null);
            setMessages([]);
          }
        }, 'image/jpeg');
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
    setShowCamera(false);
  };

  const handleAnalyze = async () => {
    if (!uploadedFile && !capturedImage && !generatedImageUrl) return;

    setIsAnalyzing(true);
    try {
      let result: DocumentAnalysisResult;
      
      if (generatedImageUrl) {
        // For generated images, we'll create a simple analysis
        result = {
          summary: language === 'hindi' 
            ? 'यह एक AI द्वारा बनाई गई छवि है जो आपकी आवश्यकताओं के अनुसार तैयार की गई है।'
            : 'This is an AI-generated image created according to your requirements.',
          keyPoints: [
            language === 'hindi' ? 'AI द्वारा बनाई गई छवि' : 'AI-generated image',
            language === 'hindi' ? 'सरकारी कार्य के लिए उपयुक्त' : 'Suitable for government work',
            language === 'hindi' ? 'प्रस्तुति और प्रशिक्षण में उपयोग करें' : 'Use in presentations and training'
          ]
        };
      } else if (uploadedFile) {
        result = await documentAnalysisService.analyzeDocument(uploadedFile, language);
      } else {
        // For captured images, convert to blob and analyze
        const response = await fetch(capturedImage!);
        const blob = await response.blob();
        const file = new File([blob], 'captured-document.jpg', { type: 'image/jpeg' });
        result = await documentAnalysisService.analyzeDocument(file, language);
      }
      
      setAnalysisResult(result);
      
      // Add analysis as first message
      const analysisMessage: Message = {
        id: uuidv4(),
        content: formatAnalysisMessage(result),
        role: 'assistant'
      };
      setMessages([analysisMessage]);
      
      toast({
        title: language === 'hindi' ? 'विश्लेषण पूर्ण' : 'Analysis Complete',
        description: language === 'hindi' 
          ? 'दस्तावेज़ का विश्लेषण सफलतापूर्वक पूरा हुआ।'
          : 'Document analysis completed successfully.',
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: language === 'hindi' ? 'विश्लेषण त्रुटि' : 'Analysis Error',
        description: language === 'hindi' 
          ? 'दस्तावेज़ विश्लेषण में त्रुटि हुई। कृपया पुनः प्रयास करें।'
          : 'Error analyzing document. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatAnalysisMessage = (result: DocumentAnalysisResult): string => {
    const header = language === 'hindi' ? '📄 दस्तावेज़ विश्लेषण परिणाम:' : '📄 Document Analysis Results:';
    
    let message = `${header}\n\n`;
    
    message += `**${language === 'hindi' ? 'सारांश' : 'Summary'}:**\n${result.summary}\n\n`;
    
    message += `**${language === 'hindi' ? 'मुख्य बिंदु' : 'Key Points'}:**\n`;
    result.keyPoints.forEach((point, index) => {
      message += `${index + 1}. ${point}\n`;
    });
    
    if (result.translation) {
      message += `\n**${language === 'hindi' ? 'अनुवाद' : 'Translation'}:**\n${result.translation}\n`;
    }
    
    if (result.recommendations && result.recommendations.length > 0) {
      message += `\n**${language === 'hindi' ? 'सुझाव' : 'Recommendations'}:**\n`;
      result.recommendations.forEach((rec, index) => {
        message += `${index + 1}. ${rec}\n`;
      });
    }
    
    return message;
  };

  const handleQuestionSubmit = async () => {
    if (!currentQuestion.trim() || !analysisResult) return;

    const userMessage: Message = {
      id: uuidv4(),
      content: currentQuestion,
      role: 'user'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setCurrentQuestion("");
    setIsLoading(true);

    try {
      const conversationHistory: OpenAIMessage[] = messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }));

      const contextPrompt = language === 'hindi' 
        ? `आपने इस दस्तावेज़ का विश्लेषण किया है। कृपया इस दस्तावेज़ के संदर्भ में उत्तर दें: ${currentQuestion}`
        : `You have analyzed this document. Please answer in the context of this document: ${currentQuestion}`;

      const response = await openAIService.sendMessage(contextPrompt, language, conversationHistory);
      
      const assistantMessage: Message = {
        id: uuidv4(),
        content: response,
        role: 'assistant'
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending question:', error);
      
      const errorMessage = language === 'hindi'
        ? "क्षमा करें, मैं अभी आपके प्रश्न का उत्तर नहीं दे सका। कृपया पुनः प्रयास करें।"
        : "Sorry, mai abhi aapke question ka jawab nahi de saka. Kripya phir try kariye.";
      
      const assistantMessage: Message = {
        id: uuidv4(),
        content: errorMessage,
        role: 'assistant'
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;

    setIsGeneratingImage(true);
    try {
      const imageUrl = await documentAnalysisService.generateImage(imagePrompt, language);
      setGeneratedImageUrl(imageUrl);
      
      toast({
        title: language === 'hindi' ? 'छवि तैयार हुई' : 'Image Generated',
        description: language === 'hindi' 
          ? 'आपकी छवि सफलतापूर्वक बनाई गई है।'
          : 'Your image has been generated successfully.',
      });
    } catch (error) {
      console.error('Image generation error:', error);
      toast({
        title: language === 'hindi' ? 'छवि त्रुटि' : 'Image Error',
        description: error instanceof Error ? error.message : (language === 'hindi' 
          ? 'छवि बनाने में त्रुटि हुई। कृपया पुनः प्रयास करें।'
          : 'Error generating image. Please try again.'),
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const resetDocument = () => {
    setUploadedFile(null);
    setAnalysisResult(null);
    setMessages([]);
    setCapturedImage(null);
    setGeneratedImageUrl(null);
    setShowImageGenerator(false);
    setImagePrompt("");
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      {/* Desktop Layout */}
      <div className="hidden lg:block desktop-layout">
        <div className="chat-desktop">
          {/* Sidebar */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-emerald-600 mb-2">{t('appTitle')}</h1>
              <p className="text-gray-600 text-sm">{t('appSubtitle')}</p>
            </div>
            
            <Button
              onClick={toggleLanguage}
              variant="outline"
              className="w-full mb-4 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
            >
              <Globe className="w-4 h-4 mr-2" />
              {getLanguageButtonText()}
            </Button>

            <div className="space-y-3">
              <Link to="/" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <Home className="w-5 h-5 mr-3 text-gray-500" />
                <span className="text-gray-700">{t('home')}</span>
              </Link>
              
              <Link to="/chat" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <MessageCircle className="w-5 h-5 mr-3 text-gray-500" />
                <span className="text-gray-700">{t('chat')}</span>
              </Link>
              
              <Link to="/voice-agent" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <Mic className="w-5 h-5 mr-3 text-gray-500" />
                <span className="text-gray-700">{t('voice')}</span>
              </Link>

              <Link to="/circulars" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <LinkIcon className="w-5 h-5 mr-3 text-gray-500" />
                <span className="text-gray-700">
                  {language === 'hindi' ? 'सरकारी परिपत्र' : 'Government Circulars'}
                </span>
              </Link>

              <div className="flex items-center p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <FileText className="w-5 h-5 mr-3 text-emerald-600" />
                <span className="text-emerald-700 font-medium">{t('documentAnalysis')}</span>
              </div>

              <Link to="/academy" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <GraduationCap className="w-5 h-5 mr-3 text-gray-500" />
                <span className="text-gray-700">
                  {language === 'hindi' ? 'सरपंच अकादमी' : 'Sarpanch Academy'}
                </span>
              </Link>

              <Link to="/glossary" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <BookOpen className="w-5 h-5 mr-3 text-gray-500" />
                <span className="text-gray-700">
                  {language === 'hindi' ? 'शब्दकोश' : 'Glossary'}
                </span>
              </Link>

              <Link to="/videos" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <PlayCircle className="w-5 h-5 mr-3 text-gray-500" />
                <span className="text-gray-700">
                  {language === 'hindi' ? 'महत्वपूर्ण वीडियो' : 'Important Videos'}
                </span>
              </Link>
            </div>
          </div>

          {/* Main Document Area */}
          <div className="chat-main-desktop">
            <div className="flex-1 overflow-y-auto p-6">
              {/* Document Upload Section */}
              {!analysisResult && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      {t('documentAnalysis')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.bmp,.webp,.tiff"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      
                      {!uploadedFile && !capturedImage && !generatedImageUrl ? (
                        <div className="grid grid-cols-3 gap-4">
                          <div 
                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-emerald-500 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                            <p className="text-lg font-medium mb-2">
                              {language === 'hindi' ? 'फ़ाइल अपलोड करें' : 'Upload File'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {language === 'hindi' 
                                ? 'PDF, Word, PPT, छवि फ़ाइलें'
                                : 'PDF, Word, PPT, Image files'
                              }
                            </p>
                          </div>
                          
                          <div 
                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-emerald-500 transition-colors"
                            onClick={startCamera}
                          >
                            <Camera className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                            <p className="text-lg font-medium mb-2">
                              {language === 'hindi' ? 'फोटो लें' : 'Take Photo'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {language === 'hindi' 
                                ? 'दस्तावेज़ की फोटो खींचें'
                                : 'Capture document photo'
                              }
                            </p>
                          </div>

                          <div 
                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-emerald-500 transition-colors"
                            onClick={() => setShowImageGenerator(true)}
                          >
                            <Palette className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                            <p className="text-lg font-medium mb-2">
                              {language === 'hindi' ? 'छवि बनाएं' : 'Generate Image'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {language === 'hindi' 
                                ? 'इन्फोग्राफिक और चार्ट बनाएं'
                                : 'Create infographics & charts'
                              }
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            {capturedImage ? (
                              <img src={capturedImage} alt="Captured" className="w-16 h-16 object-cover rounded" />
                            ) : generatedImageUrl ? (
                              <img src={generatedImageUrl} alt="Generated" className="w-16 h-16 object-cover rounded" />
                            ) : (
                              <FileText className="w-6 h-6 text-emerald-600" />
                            )}
                            <div>
                              <p className="font-medium">
                                {uploadedFile?.name || 
                                 (capturedImage ? (language === 'hindi' ? 'कैप्चर किया गया दस्तावेज़' : 'Captured Document') : 
                                  generatedImageUrl ? (language === 'hindi' ? 'बनाई गई छवि' : 'Generated Image') : '')}
                              </p>
                              {uploadedFile && (
                                <p className="text-sm text-gray-500">
                                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={handleAnalyze}
                              disabled={isAnalyzing || (!uploadedFile && !capturedImage && !generatedImageUrl)}
                              className="primary-button"
                            >
                              {isAnalyzing ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  {t('analyzingDocument')}
                                </>
                              ) : (
                                t('analyzeDocument')
                              )}
                            </Button>
                            <Button
                              onClick={resetDocument}
                              variant="outline"
                              disabled={isAnalyzing}
                            >
                              {language === 'hindi' ? 'रीसेट' : 'Reset'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Camera Modal */}
              {showCamera && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
                    <h3 className="text-lg font-bold mb-4 text-center">
                      {language === 'hindi' ? 'दस्तावेज़ की फोटो लें' : 'Capture Document Photo'}
                    </h3>
                    <div className="relative">
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline
                        muted
                        className="w-full h-64 sm:h-80 bg-gray-200 rounded-lg mb-4 object-cover"
                        style={{ transform: 'scaleX(-1)' }} // Mirror effect for front camera
                      />
                      {!videoRef.current?.srcObject && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-lg">
                          <p className="text-gray-500">
                            {language === 'hindi' ? 'कैमरा लोड हो रहा है...' : 'Loading camera...'}
                          </p>
                        </div>
                      )}
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="flex gap-4 justify-center">
                      <Button onClick={capturePhoto} className="primary-button">
                        <Camera className="w-4 h-4 mr-2" />
                        {language === 'hindi' ? 'फोटो लें' : 'Capture'}
                      </Button>
                      <Button onClick={stopCamera} variant="outline">
                        {language === 'hindi' ? 'रद्द करें' : 'Cancel'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Image Generator Modal */}
              {showImageGenerator && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
                    <h3 className="text-xl font-bold mb-4 text-emerald-600">
                      {language === 'hindi' ? 'इन्फोग्राफिक और चार्ट बनाएं' : 'Generate Infographics & Charts'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {language === 'hindi' 
                        ? 'केवल सरकारी कार्य, प्रशिक्षण सामग्री और अधिकारिक प्रस्तुतियों के लिए छवियां बनाएं।'
                        : 'Create images only for government work, training materials and official presentations.'
                      }
                    </p>
                    <details className="mb-4">
                      <summary className="text-sm font-medium text-emerald-600 cursor-pointer">
                        {language === 'hindi' ? 'उदाहरण देखें' : 'View Examples'}
                      </summary>
                      <div className="mt-2 text-xs text-gray-600 space-y-1">
                        <p>• {language === 'hindi' ? 'MGNREGA कार्य प्रक्रिया का फ्लोचार्ट' : 'MGNREGA work process flowchart'}</p>
                        <p>• {language === 'hindi' ? 'ग्राम पंचायत बजट का पाई चार्ट' : 'Gram Panchayat budget pie chart'}</p>
                        <p>• {language === 'hindi' ? 'स्वच्छ भारत योजना के चरण' : 'Swachh Bharat scheme steps'}</p>
                        <p>• {language === 'hindi' ? 'पंचायत चुनाव प्रक्रिया डायग्राम' : 'Panchayat election process diagram'}</p>
                        <p>• {language === 'hindi' ? 'जल जीवन मिशन इन्फोग्राफिक' : 'Jal Jeevan Mission infographic'}</p>
                      </div>
                    </details>
                    <textarea
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      placeholder={language === 'hindi' 
                        ? 'विस्तार से बताएं कि आप क्या चार्ट या डायग्राम बनाना चाहते हैं...\nउदाहरण: MGNREGA के तहत मजदूरी भुगतान की प्रक्रिया दिखाने वाला स्टेप-बाई-स्टेप चार्ट बनाएं'
                        : 'Describe in detail what chart or diagram you want to create...\nExample: Create a step-by-step chart showing the wage payment process under MGNREGA'
                      }
                      className="w-full p-4 border border-gray-300 rounded-lg mb-4 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    {generatedImageUrl && (
                      <div className="mb-4">
                        <img src={generatedImageUrl} alt="Generated" className="w-full max-h-64 object-contain rounded-lg border" />
                      </div>
                    )}
                    <div className="flex gap-4 justify-end">
                      <Button
                        onClick={() => setShowImageGenerator(false)}
                        variant="outline"
                        disabled={isGeneratingImage}
                      >
                        {language === 'hindi' ? 'बंद करें' : 'Close'}
                      </Button>
                      <Button
                        onClick={handleGenerateImage}
                        disabled={isGeneratingImage || !imagePrompt.trim()}
                        className="primary-button"
                      >
                        {isGeneratingImage ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {language === 'hindi' ? 'बनाई जा रही है...' : 'Generating...'}
                          </>
                        ) : (
                          <>
                            <Palette className="w-4 h-4 mr-2" />
                            {language === 'hindi' ? 'छवि बनाएं' : 'Generate Image'}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Messages */}
              {messages.map((message) => (
                <div key={message.id} className="mb-4">
                  <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div 
                      className={`max-w-[85%] p-4 rounded-xl ${
                        message.role === 'user' 
                          ? 'bg-emerald-600 text-white rounded-tr-none' 
                          : 'bg-white text-gray-800 rounded-tl-none shadow-sm border border-gray-200'
                      }`}
                      dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br/>') }}
                    />
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-center">
                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl animate-pulse">
                    <p className="text-emerald-600 text-center font-medium">{t('thinking')}</p>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Question Input */}
            {analysisResult && (
              <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-xl">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentQuestion}
                    onChange={(e) => setCurrentQuestion(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleQuestionSubmit()}
                    placeholder={language === 'hindi' 
                      ? 'दस्तावेज़ के बारे में प्रश्न पूछें...'
                      : 'Ask questions about the document...'
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleQuestionSubmit}
                    disabled={isLoading || !currentQuestion.trim()}
                    className="primary-button"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-col h-screen">
        {/* Mobile Header */}
        <header className="bg-white border-b border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <div>
              <h1 className="text-xl font-bold text-emerald-600">{t('documentAnalysis')}</h1>
              <p className="text-xs text-gray-500">{t('appSubtitle')}</p>
            </div>
            <Button
              onClick={toggleLanguage}
              variant="outline"
              size="sm"
              className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
            >
              <Globe className="w-4 h-4 mr-1" />
              {getLanguageButtonText()}
            </Button>
          </div>
        </header>

        {/* Mobile Content */}
        <main className="flex-1 overflow-y-auto bg-white mobile-padding">
          <div className="max-w-md mx-auto p-4">
            {/* Same content as desktop but mobile optimized */}
            {!analysisResult && (
              <Card className="mb-6">
                <CardContent className="p-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.bmp,.webp,.tiff"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  {!uploadedFile && !capturedImage && !generatedImageUrl ? (
                    <div className="space-y-4">
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-emerald-500 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                        <p className="font-medium text-sm">
                          {language === 'hindi' ? 'फ़ाइल अपलोड करें' : 'Upload File'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {language === 'hindi' ? 'PDF, Word, PPT, छवि' : 'PDF, Word, PPT, Image'}
                        </p>
                      </div>
                      
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-emerald-500 transition-colors"
                        onClick={startCamera}
                      >
                        <Camera className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                        <p className="font-medium text-sm">
                          {language === 'hindi' ? 'फोटो लें' : 'Take Photo'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {language === 'hindi' ? 'दस्तावेज़ की फोटो' : 'Document photo'}
                        </p>
                      </div>

                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-emerald-500 transition-colors"
                        onClick={() => setShowImageGenerator(true)}
                      >
                        <Palette className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                        <p className="font-medium text-sm">
                          {language === 'hindi' ? 'छवि बनाएं' : 'Generate Image'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {language === 'hindi' ? 'चार्ट और इन्फोग्राफिक' : 'Charts & infographics'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        {capturedImage ? (
                          <img src={capturedImage} alt="Captured" className="w-12 h-12 object-cover rounded" />
                        ) : generatedImageUrl ? (
                          <img src={generatedImageUrl} alt="Generated" className="w-12 h-12 object-cover rounded" />
                        ) : (
                          <FileText className="w-6 h-6 text-emerald-600" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {uploadedFile?.name || 
                             (capturedImage ? (language === 'hindi' ? 'कैप्चर किया गया दस्तावेज़' : 'Captured Document') : 
                              generatedImageUrl ? (language === 'hindi' ? 'बनाई गई छवि' : 'Generated Image') : '')}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleAnalyze}
                          disabled={isAnalyzing || (!uploadedFile && !capturedImage && !generatedImageUrl)}
                          className="primary-button flex-1"
                          size="sm"
                        >
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              {language === 'hindi' ? 'विश्लेषण...' : 'Analyzing...'}
                            </>
                          ) : (
                            language === 'hindi' ? 'विश्लेषण करें' : 'Analyze'
                          )}
                        </Button>
                        <Button
                          onClick={resetDocument}
                          variant="outline"
                          disabled={isAnalyzing}
                          size="sm"
                        >
                          {language === 'hindi' ? 'रीसेट' : 'Reset'}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Messages */}
            {messages.map((message) => (
              <div key={message.id} className="mb-4">
                <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[85%] p-3 rounded-xl text-sm ${
                      message.role === 'user' 
                        ? 'bg-emerald-600 text-white rounded-tr-none' 
                        : 'bg-white text-gray-800 rounded-tl-none shadow-sm border border-gray-200'
                    }`}
                    dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br/>') }}
                  />
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-center mb-4">
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl animate-pulse">
                  <p className="text-emerald-600 text-center text-sm font-medium">{t('thinking')}</p>
                </div>
              </div>
            )}
          </div>
        </main>
        
        {/* Mobile Question Input */}
        {analysisResult && (
          <footer className="bg-white border-t border-gray-200 p-4 pb-20">
            <div className="max-w-md mx-auto flex gap-2">
              <input
                type="text"
                value={currentQuestion}
                onChange={(e) => setCurrentQuestion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleQuestionSubmit()}
                placeholder={language === 'hindi' 
                  ? 'प्रश्न पूछें...'
                  : 'Ask question...'
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                disabled={isLoading}
              />
              <Button
                onClick={handleQuestionSubmit}
                disabled={isLoading || !currentQuestion.trim()}
                className="primary-button"
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </footer>
        )}

        {/* Mobile Navigation */}
        <nav className="nav-item fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-3 z-50">
          <div className="flex justify-center items-center space-x-1 max-w-md mx-auto">
            <Link 
              to="/" 
              className="nav-item flex flex-col items-center p-1 rounded-xl transition-all text-gray-500 hover:text-emerald-600"
            >
              <Home size={14} />
              <span className="text-xs mt-1 font-medium">{t('home')}</span>
            </Link>
            
            <Link 
              to="/chat" 
              className="nav-item flex flex-col items-center p-1 rounded-xl transition-all text-gray-500 hover:text-emerald-600"
            >
              <MessageCircle size={14} />
              <span className="text-xs mt-1 font-medium">{t('chat')}</span>
            </Link>
            
            <Link 
              to="/voice-agent" 
              className="nav-item flex flex-col items-center p-1 rounded-xl transition-all text-gray-500 hover:text-emerald-600"
            >
              <Mic size={14} />
              <span className="text-xs mt-1 font-medium">{t('voice')}</span>
            </Link>

            <Link 
              to="/circulars" 
              className="nav-item flex flex-col items-center p-1 rounded-xl transition-all text-gray-500 hover:text-emerald-600"
            >
              <LinkIcon size={14} />
              <span className="text-xs mt-1 font-medium">
                {language === 'hindi' ? 'परिपत्र' : 'Circulars'}
              </span>
            </Link>

            <div className="nav-item active flex flex-col items-center p-1 rounded-xl">
              <FileText size={14} />
              <span className="text-xs mt-1 font-medium">
                {language === 'hindi' ? 'दस्तावेज़' : 'Document'}
              </span>
            </div>

            <Link 
              to="/academy" 
              className="nav-item flex flex-col items-center p-1 rounded-xl transition-all text-gray-500 hover:text-emerald-600"
            >
              <GraduationCap size={14} />
              <span className="text-xs mt-1 font-medium">
                {language === 'hindi' ? 'अकादमी' : 'Academy'}
              </span>
            </Link>

            <Link 
              to="/glossary" 
              className="nav-item flex flex-col items-center p-1 rounded-xl transition-all text-gray-500 hover:text-emerald-600"
            >
              <BookOpen size={14} />
              <span className="text-xs mt-1 font-medium">
                {language === 'hindi' ? 'शब्दकोश' : 'Glossary'}
              </span>
            </Link>

            <Link 
              to="/videos" 
              className="nav-item flex flex-col items-center p-1 rounded-xl transition-all text-gray-500 hover:text-emerald-600"
            >
              <PlayCircle size={14} />
              <span className="text-xs mt-1 font-medium">
                {language === 'hindi' ? 'वीडियो' : 'Videos'}
              </span>
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
} 