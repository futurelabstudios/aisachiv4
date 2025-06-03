import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Camera, MessageCircle, Send, Loader2, Home, Mic, Globe, Link as LinkIcon, GraduationCap } from "lucide-react";
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
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: language === 'hindi' ? 'फ़ाइल बहुत बड़ी है' : 'File too large',
          description: language === 'hindi' 
            ? 'कृपया 10MB से छोटी फ़ाइल अपलोड करें।'
            : 'Please upload a file smaller than 10MB.',
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
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: language === 'hindi' ? 'कैमरा त्रुटि' : 'Camera Error',
        description: language === 'hindi' 
          ? 'कैमरा एक्सेस नहीं हो सका। कृपया अनुमति दें।'
          : 'Could not access camera. Please allow permission.',
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
    if (!uploadedFile) return;

    setIsAnalyzing(true);
    try {
      const result = await documentAnalysisService.analyzeDocument(uploadedFile, language);
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

  const resetDocument = () => {
    setUploadedFile(null);
    setAnalysisResult(null);
    setMessages([]);
    setCapturedImage(null);
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
                        accept=".txt,.jpg,.jpeg,.png"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      
                      {!uploadedFile && !capturedImage ? (
                        <div className="grid grid-cols-2 gap-4">
                          <div 
                            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-emerald-500 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <p className="text-lg font-medium mb-2">
                              {language === 'hindi' ? 'फ़ाइल अपलोड करें' : 'Upload File'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {language === 'hindi' 
                                ? 'TXT या Image फ़ाइलें'
                                : 'TXT or Image files'
                              }
                            </p>
                          </div>
                          
                          <div 
                            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-emerald-500 transition-colors"
                            onClick={startCamera}
                          >
                            <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
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
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            {capturedImage ? (
                              <img src={capturedImage} alt="Captured" className="w-16 h-16 object-cover rounded" />
                            ) : (
                              <FileText className="w-6 h-6 text-emerald-600" />
                            )}
                            <div>
                              <p className="font-medium">
                                {uploadedFile?.name || (language === 'hindi' ? 'कैप्चर किया गया दस्तावेज़' : 'Captured Document')}
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
                              disabled={isAnalyzing}
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                    <video ref={videoRef} autoPlay className="w-full rounded-lg mb-4" />
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
                    accept=".txt,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  {!uploadedFile && !capturedImage ? (
                    <div className="space-y-4">
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-emerald-500 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="font-medium mb-1">
                          {language === 'hindi' ? 'फ़ाइल अपलोड करें' : 'Upload File'}
                        </p>
                      </div>
                      
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-emerald-500 transition-colors"
                        onClick={startCamera}
                      >
                        <Camera className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="font-medium mb-1">
                          {language === 'hindi' ? 'फोटो लें' : 'Take Photo'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        {capturedImage ? (
                          <img src={capturedImage} alt="Captured" className="w-12 h-12 object-cover rounded" />
                        ) : (
                          <FileText className="w-6 h-6 text-emerald-600" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {uploadedFile?.name || (language === 'hindi' ? 'कैप्चर किया गया दस्तावेज़' : 'Captured Document')}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleAnalyze}
                          disabled={isAnalyzing}
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
        <nav className="nav-item fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-50">
          <div className="flex justify-center items-center space-x-6 max-w-md mx-auto">
            <Link 
              to="/" 
              className="nav-item flex flex-col items-center p-2 rounded-xl transition-all text-gray-500 hover:text-emerald-600"
            >
              <Home size={18} />
              <span className="text-xs mt-1 font-medium">{t('home')}</span>
            </Link>
            
            <Link 
              to="/chat" 
              className="nav-item flex flex-col items-center p-2 rounded-xl transition-all text-gray-500 hover:text-emerald-600"
            >
              <MessageCircle size={18} />
              <span className="text-xs mt-1 font-medium">{t('chat')}</span>
            </Link>
            
            <Link 
              to="/voice-agent" 
              className="nav-item flex flex-col items-center p-2 rounded-xl transition-all text-gray-500 hover:text-emerald-600"
            >
              <Mic size={18} />
              <span className="text-xs mt-1 font-medium">{t('voice')}</span>
            </Link>

            <Link 
              to="/circulars" 
              className="nav-item flex flex-col items-center p-2 rounded-xl transition-all text-gray-500 hover:text-emerald-600"
            >
              <LinkIcon size={18} />
              <span className="text-xs mt-1 font-medium">
                {language === 'hindi' ? 'परिपत्र' : 'Circulars'}
              </span>
            </Link>

            <div className="nav-item active flex flex-col items-center p-2 rounded-xl">
              <FileText size={18} />
              <span className="text-xs mt-1 font-medium">
                {language === 'hindi' ? 'दस्तावेज़' : 'Document'}
              </span>
            </div>

            <Link 
              to="/academy" 
              className="nav-item flex flex-col items-center p-2 rounded-xl transition-all text-gray-500 hover:text-emerald-600"
            >
              <GraduationCap size={18} />
              <span className="text-xs mt-1 font-medium">
                {language === 'hindi' ? 'अकादमी' : 'Academy'}
              </span>
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
} 