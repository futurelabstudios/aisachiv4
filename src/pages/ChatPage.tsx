import { useState, useEffect, useRef } from "react";
import ChatMessage from "@/components/ChatMessage";
import MessageInput from "@/components/MessageInput";
import { Message, ChatState, Language } from "@/types";
import { useSpeechRecognition } from "@/utils/speechRecognition";
import { v4 as uuidv4 } from "uuid";
import { apiClient, ChatMessage as APIChatMessage } from "@/services/api";
import { elevenLabsService } from "@/services/elevenlabs";
import { MessageCircle, Globe, Home, Mic, FileText, Link as LinkIcon, GraduationCap, PlayCircle, BookOpen } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import MobileNavigation from "@/components/MobileNavigation";

import { Button } from "@/components/ui/button";

export default function ChatPage() {
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();

  
  const [chatState, setChatState] = useState<ChatState>(() => {
    return {
      messages: [],
      isLoading: false,
      language: language,
      conversationId: null, // Add conversationId to state
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

  const addMessage = async (content: string, role: 'user' | 'assistant', audioUrl?: string) => {
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

    return newMessage.id;
  };

  const updateMessage = (id: string, content: string) => {
    setChatState(prev => ({
      ...prev,
      messages: prev.messages.map(m =>
        m.id === id ? { ...m, content: m.content + content } : m
      )
    }));
  };

  const finalizeMessage = async (id: string) => {
    setChatState(prev => {
      const finalMessage = prev.messages.find(m => m.id === id);
      if (finalMessage) {
        elevenLabsService.textToSpeech(finalMessage.content, prev.language)
          .then(audioUrl => {
            setChatState(subPrev => ({
              ...subPrev,
              messages: subPrev.messages.map(m =>
                m.id === id ? { ...m, audioUrl } : m
              )
            }));
          })
          .catch(error => console.error('❌ Failed to generate audio:', error));
      }
      return prev;
    });
  };

  const handleSendMessage = async (content: string) => {
    console.log('📤 Sending message:', content);
    
    // Add user message to local state
    await addMessage(content, 'user');
    
    setChatState(prev => ({ ...prev, isLoading: true }));
    
    // Create conversation history from state, excluding the latest message
    const conversationHistory = chatState.messages.slice(-10).map(m => ({
      role: m.role,
      content: m.content,
      timestamp: new Date().toISOString()
    }));

    // Add empty assistant message for streaming
    const assistantMessageId = await addMessage("", 'assistant');

    await apiClient.streamChat({
      message: content,
      conversationId: chatState.conversationId,
      conversationHistory,
      onChunk: (chunk, conversationId) => {
        if (conversationId && !chatState.conversationId) {
          setChatState(prev => ({ ...prev, conversationId }));
        }
        updateMessage(assistantMessageId, chunk);
      },
      onComplete: () => {
        finalizeMessage(assistantMessageId);
        setChatState(prev => ({ ...prev, isLoading: false }));
      },
      onError: (error) => {
        console.error('❌ Error sending message:', error);
      
        let errorMessage = '';
        
        if (error instanceof Error) {
          if (error.message.includes('fetch') || error.message.includes('network')) {
            errorMessage = chatState.language === 'hindi'
              ? "🌐 इंटरनेट कनेक्शन की समस्या है। कृपया अपना कनेक्शन जांचें और पुनः प्रयास करें।"
              : "🌐 Internet connection problem hai. Kripya apna connection check kariye aur phir try kariye.";
          } else if (error.message.includes('401') || error.message.includes('API')) {
            errorMessage = chatState.language === 'hindi'
              ? "🔑 सर्विस में अस्थायी समस्या है। कृपया बाद में पुनः प्रयास करें।"
              : "🔑 Service mein temporary problem hai. Kripya baad mein phir try kariye.";
          } else {
            errorMessage = chatState.language === 'hindi'
              ? "⚠️ कुछ गलत हुआ है। कृपया पुनः प्रयास करें।"
              : "⚠️ Kuch galat hua hai. Kripya phir try kariye.";
          }
        } else {
          errorMessage = chatState.language === 'hindi'
            ? "❓ अज्ञात त्रुटि हुई है। कृपया पुनः प्रयास करें।"
            : "❓ Unknown error hui hai. Kripya phir try kariye.";
        }
        
        const helpMessage = chatState.language === 'hindi'
          ? "\n\n💡 सुझाव:\n• इंटरनेट कनेक्शन जांचें\n• पेज को रीफ्रेश करें\n• कुछ देर बाद प्रयास करें"
          : "\n\n💡 Suggestions:\n• Internet connection check kariye\n• Page ko refresh kariye\n• Kuch der baad try kariye";
        
        updateMessage(assistantMessageId, errorMessage + helpMessage);
        setChatState(prev => ({ ...prev, isLoading: false }));
      }
    });
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
      setTranscript(""); // Clear transcript after sending
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
    <div className="min-h-screen bg-white">
      {/* Desktop Layout */}
      <div className="hidden lg:block desktop-layout">
        <div className="chat-desktop">
          {/* Sidebar */}
          <div className="bg-gray-50 border-r border-gray-200 p-4 flex flex-col">
            <div className="text-left mb-6 px-2">
              <h1 className="text-2xl font-bold text-emerald-600">{t('appTitle')}</h1>
              <p className="text-gray-500 text-sm">{t('appSubtitle')}</p>
            </div>
            
            <Button
              onClick={toggleLanguage}
              variant="outline"
              className="w-full mb-4 bg-white border-gray-200 text-gray-700 hover:bg-gray-100"
            >
              <Globe className="w-4 h-4 mr-2" />
              {getLanguageButtonText()}
            </Button>

            <nav className="space-y-1 flex-1">
              <Link to="/" className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors">
                <Home className="w-5 h-5 mr-3 text-gray-500" />
                <span className="text-gray-700">{t('home')}</span>
              </Link>
              
              <div className="flex items-center px-3 py-2 rounded-lg bg-emerald-100 border border-emerald-200 text-emerald-800">
                <MessageCircle className="w-5 h-5 mr-3 text-emerald-600" />
                <span className="text-emerald-800 font-medium">{t('chat')}</span>
              </div>
              
              <Link to="/voice-agent" className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors">
                <Mic className="w-5 h-5 mr-3 text-gray-500" />
                <span className="text-gray-700">{t('voice')}</span>
              </Link>

              <Link to="/circulars" className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors">
                <LinkIcon className="w-5 h-5 mr-3 text-gray-500" />
                <span className="text-gray-700">
                  {language === 'hindi' ? 'सरकारी परिपत्र' : 'Government Circulars'}
                </span>
              </Link>

              <Link to="/document" className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors">
                <FileText className="w-5 h-5 mr-3 text-gray-500" />
                <span className="text-gray-700">{t('documentAnalysis')}</span>
              </Link>

              <Link to="/academy" className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors">
                <GraduationCap className="w-5 h-5 mr-3 text-gray-500" />
                <span className="text-gray-700">
                  {language === 'hindi' ? 'सरपंच अकादमी' : 'Sarpanch Academy'}
                </span>
              </Link>

              <Link to="/glossary" className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors">
                <BookOpen className="w-5 h-5 mr-3 text-gray-500" />
                <span className="text-gray-700">
                  {language === 'hindi' ? 'शब्दकोश' : 'Glossary'}
                </span>
              </Link>

              <Link to="/videos" className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors">
                <PlayCircle className="w-5 h-5 mr-3 text-gray-500" />
                <span className="text-gray-700">
                  {language === 'hindi' ? 'महत्वपूर्ण वीडियो' : 'Important Videos'}
                </span>
              </Link>
            </nav>
            <div className="mt-auto">
                <div className="bg-gray-100 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-600">
                    Built by Futurelab Ikigai & Piramal Foundation © 2025
                    </p>
                </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="chat-main-desktop bg-gray-100">
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-4xl mx-auto max-h-[calc(100vh-200px)] pb-24  space-y-4" style={{ scrollBehavior: "smooth" }}>
                {chatState.messages.map((message) => (
                  <div key={message.id} className="fade-in pb-4">
                    <ChatMessage 
                      message={message} 
                      language={language} 
                    />
                  </div>
                ))}
                
                {isListening && (
                  <div className="flex justify-center">
                    <div className="bg-blue-100 border border-blue-200 p-4 rounded-xl scale-in">
                      <p className="text-blue-700 text-center font-medium">{t('listening')}</p>
                      {transcript && (
                        <p className="mt-2 text-center text-gray-700">{transcript}</p>
                      )}
                    </div>
                  </div>
                )}
                
                {chatState.isLoading && (
                  <div className="flex justify-center">
                    <div className="bg-emerald-100 border border-emerald-200 p-4 rounded-xl animate-pulse">
                      <p className="text-emerald-700 text-center font-medium">{t('thinking')}</p>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            {/* Chat Input */}
            <div className="p-6 bg-gray-100 border-t border-gray-200">
              <div className="max-w-4xl mx-auto">
                <MessageInput 
                  onSendMessage={handleSendMessage}
                  isLoading={chatState.isLoading}
                  language={language}
                  isListening={isListening}
                  onStartListening={handleStartListening}
                  onStopListening={handleStopListening}
                  transcript={transcript}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-col h-screen bg-gray-50">
        {/* Mobile Header */}
        <header className="bg-white border-b border-gray-200 p-4 shadow-sm sticky top-0 z-10">
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
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
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
                <div className="bg-blue-100 border border-blue-200 p-3 rounded-xl w-full scale-in">
                  <p className="text-blue-700 text-center text-sm font-medium">{t('listening')}</p>
                  {transcript && (
                    <p className="mt-2 text-center text-gray-700 text-sm">{transcript}</p>
                  )}
                </div>
              </div>
            )}
            
            {chatState.isLoading && (
              <div className="flex justify-center">
                <div className="bg-emerald-100 border border-emerald-200 p-3 rounded-xl w-full animate-pulse">
                  <p className="text-emerald-700 text-center text-sm font-medium">{t('thinking')}</p>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </main>
        
        {/* Mobile Footer */}
        <footer className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-md mx-auto">
            <MessageInput 
              onSendMessage={handleSendMessage}
              isLoading={chatState.isLoading}
              language={language}
              isListening={isListening}
              onStartListening={handleStartListening}
              onStopListening={handleStopListening}
              transcript={transcript}
            />
          </div>
        </footer>

        {/* Mobile Navigation */}
        <MobileNavigation />
      </div>
    </div>
  );
}
