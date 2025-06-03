import { useState, useEffect, useRef } from "react";
import ChatMessage from "@/components/ChatMessage";
import MessageInput from "@/components/MessageInput";
import VoiceButton from "@/components/VoiceButton";
import { Message, ChatState, Language } from "@/types";
import { useSpeechRecognition } from "@/utils/speechRecognition";
import { v4 as uuidv4 } from "uuid";
import { openAIService, OpenAIMessage } from "@/services/openai";
import { Home, MessageCircle, Mic, Globe, FileText, Link as LinkIcon, GraduationCap, PlayCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

export default function ChatPage() {
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  
  const [chatState, setChatState] = useState<ChatState>(() => {
    return {
      messages: [],
      isLoading: false,
      language: language
    };
  });
  
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechRecognition = useSpeechRecognition();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages]);

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setChatState(prev => ({ ...prev, language: newLanguage }));
  };

  const addMessage = (content: string, role: 'user' | 'assistant', audioUrl?: string) => {
    const newMessage: Message = {
      id: uuidv4(),
      content,
      role,
      audioUrl
    };
    
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }));
  };

  const handleSendMessage = async (content: string) => {
    // Add user message
    addMessage(content, 'user');
    
    // Set loading state
    setChatState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Convert messages to OpenAI format for context
      const conversationHistory: OpenAIMessage[] = chatState.messages
        .slice(-10) // Keep last 10 messages for context
        .map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }));

      // Call OpenAI API
      const response = await openAIService.sendMessage(content, chatState.language, conversationHistory);
      
      // Add assistant message
      addMessage(response, 'assistant');
      
      // Set loading state to false
      setChatState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message in user's language
      const errorMessage = chatState.language === 'hindi'
        ? "मुझे अभी कनेक्ट करने में समस्या हो रही है। कृपया एक क्षण में पुनः प्रयास करें।"
        : "Mujhe abhi connect karne mein problem ho rahi hai. Kripya ek moment mein phir try kariye.";
      
      addMessage(errorMessage, 'assistant');
      setChatState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleStartListening = () => {
    setTranscript("");
    setIsListening(true);
    
    const started = speechRecognition.start({
      language: chatState.language,
      onResult: (text) => {
        setTranscript(text);
      },
      onEnd: () => {
        setIsListening(false);
        if (transcript.trim()) {
          handleSendMessage(transcript.trim());
        }
      },
      onError: (error) => {
        console.error('Speech recognition error:', error);
        setIsListening(false);
      }
    });
    
    if (!started) {
      setIsListening(false);
    }
  };

  const handleStopListening = () => {
    speechRecognition.stop();
    setIsListening(false);
    if (transcript.trim()) {
      handleSendMessage(transcript.trim());
    }
  };

  // Add a welcome message when the chat first loads
  useEffect(() => {
    if (chatState.messages.length === 0) {
      const welcomeMessage = t('welcomeMessage');
      addMessage(welcomeMessage, 'assistant');
    }
  }, []);

  // Language toggle function
  const toggleLanguage = () => {
    const languages: Language[] = ['hindi', 'hinglish'];
    const currentIndex = languages.indexOf(language);
    const nextIndex = (currentIndex + 1) % languages.length;
    handleLanguageChange(languages[nextIndex]);
  };

  const getLanguageButtonText = () => {
    switch(language) {
      case 'hindi': return t('switchToHinglish');
      case 'hinglish': return t('switchToHindi');
      default: return 'हिंदी';
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
              
              <div className="flex items-center p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <MessageCircle className="w-5 h-5 mr-3 text-emerald-600" />
                <span className="text-emerald-700 font-medium">{t('chat')}</span>
              </div>
              
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

              <Link to="/document" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <FileText className="w-5 h-5 mr-3 text-gray-500" />
                <span className="text-gray-700">{t('documentAnalysis')}</span>
              </Link>

              <Link to="/academy" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <GraduationCap className="w-5 h-5 mr-3 text-gray-500" />
                <span className="text-gray-700">
                  {language === 'hindi' ? 'सरपंच अकादमी' : 'Sarpanch Academy'}
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

          {/* Main Chat Area */}
          <div className="chat-main-desktop">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatState.messages.map((message) => (
                <div key={message.id} className="fade-in">
                  <ChatMessage 
                    message={message} 
                    language={language} 
                  />
                </div>
              ))}
              
              {isListening && (
                <div className="flex justify-center">
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl scale-in">
                    <p className="text-blue-600 text-center font-medium">{t('listening')}</p>
                    {transcript && (
                      <p className="mt-2 text-center text-gray-700 text-sm">{transcript}</p>
                    )}
                  </div>
                </div>
              )}
              
              {chatState.isLoading && (
                <div className="flex justify-center">
                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl animate-pulse">
                    <p className="text-emerald-600 text-center font-medium">{t('thinking')}</p>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Chat Input */}
            <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <p className="text-gray-500 text-sm">{t('tapToSpeak')}</p>
                </div>
                <VoiceButton 
                  isListening={isListening}
                  onStartListening={handleStartListening}
                  onStopListening={handleStopListening}
                  language={language}
                />
              </div>
              

              
              <MessageInput 
                onSendMessage={handleSendMessage}
                isLoading={chatState.isLoading}
                language={language}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-col h-screen">
        {/* Mobile Header */}
        <header className="bg-white border-b border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <div>
              <h1 className="text-xl font-bold text-emerald-600">{t('appTitle')}</h1>
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

        {/* Mobile Chat Area */}
        <main className="flex-1 overflow-y-auto bg-white mobile-padding">
          <div className="max-w-md mx-auto p-4 space-y-4">
            {chatState.messages.map((message) => (
              <div key={message.id} className="fade-in">
                <ChatMessage 
                  message={message} 
                  language={language} 
                />
              </div>
            ))}
            
            {isListening && (
              <div className="flex justify-center">
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl w-full scale-in">
                  <p className="text-blue-600 text-center text-sm font-medium">{t('listening')}</p>
                  {transcript && (
                    <p className="mt-2 text-center text-gray-700 text-sm">{transcript}</p>
                  )}
                </div>
              </div>
            )}
            
            {chatState.isLoading && (
              <div className="flex justify-center">
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl w-full animate-pulse">
                  <p className="text-emerald-600 text-center text-sm font-medium">{t('thinking')}</p>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </main>
        
        {/* Mobile Footer */}
        <footer className="bg-white border-t border-gray-200 p-4 pb-20">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <p className="text-gray-500 text-sm">{t('tapToSpeak')}</p>
              </div>
              <VoiceButton 
                isListening={isListening}
                onStartListening={handleStartListening}
                onStopListening={handleStopListening}
                language={language}
              />
            </div>
            

            
            <MessageInput 
              onSendMessage={handleSendMessage}
              isLoading={chatState.isLoading}
              language={language}
            />
          </div>
        </footer>

        {/* Mobile Navigation */}
        <nav className="nav-item fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-50">
          <div className="flex justify-center items-center space-x-3 max-w-md mx-auto">
            <Link 
              to="/" 
              className={`nav-item flex flex-col items-center p-1 rounded-xl transition-all ${
                location.pathname === '/' 
                  ? 'nav-item active text-white' 
                  : 'text-gray-500 hover:text-emerald-600'
              }`}
            >
              <Home size={16} />
              <span className="text-xs mt-1 font-medium">{t('home')}</span>
            </Link>
            
            <div className="nav-item active flex flex-col items-center p-1 rounded-xl">
              <MessageCircle size={16} />
              <span className="text-xs mt-1 font-medium">{t('chat')}</span>
            </div>
            
            <Link 
              to="/voice-agent" 
              className="nav-item flex flex-col items-center p-1 rounded-xl transition-all text-gray-500 hover:text-emerald-600"
            >
              <Mic size={16} />
              <span className="text-xs mt-1 font-medium">{t('voice')}</span>
            </Link>

            <Link 
              to="/circulars" 
              className="nav-item flex flex-col items-center p-1 rounded-xl transition-all text-gray-500 hover:text-emerald-600"
            >
              <LinkIcon size={16} />
              <span className="text-xs mt-1 font-medium">
                {language === 'hindi' ? 'परिपत्र' : 'Circulars'}
              </span>
            </Link>

            <Link 
              to="/document" 
              className="nav-item flex flex-col items-center p-1 rounded-xl transition-all text-gray-500 hover:text-emerald-600"
            >
              <FileText size={16} />
              <span className="text-xs mt-1 font-medium">
                {language === 'hindi' ? 'दस्तावेज़' : 'Document'}
              </span>
            </Link>

            <Link 
              to="/academy" 
              className="nav-item flex flex-col items-center p-1 rounded-xl transition-all text-gray-500 hover:text-emerald-600"
            >
              <GraduationCap size={16} />
              <span className="text-xs mt-1 font-medium">
                {language === 'hindi' ? 'अकादमी' : 'Academy'}
              </span>
            </Link>

            <Link 
              to="/videos" 
              className="nav-item flex flex-col items-center p-1 rounded-xl transition-all text-gray-500 hover:text-emerald-600"
            >
              <PlayCircle size={16} />
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
