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

  const addMessage = async (content: string, role: 'user' | 'assistant', audioUrl?: string) => {
    const newMessage: Message = {
      id: uuidv4(),
      content,
      role,
      audioUrl
    };
    
    // Generate audio for assistant messages using ElevenLabs
    if (role === 'assistant' && !audioUrl) {
      try {
        console.log('🎵 Generating audio for assistant message...');
        const generatedAudioUrl = await elevenLabsService.textToSpeech(content, chatState.language);
        newMessage.audioUrl = generatedAudioUrl;
        console.log('✅ Audio generated successfully');
      } catch (error) {
        console.error('❌ Failed to generate audio:', error);
        // Continue without audio if generation fails
      }
    }
    
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }));
  };

  const handleSendMessage = async (content: string) => {
    console.log('📤 Sending message:', content);
    console.log('🌍 Current language:', chatState.language);
    
    // Add user message
    await addMessage(content, 'user');
    
    // Set loading state
    setChatState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Convert messages to API format for context
      const conversationHistory: APIChatMessage[] = chatState.messages
        .slice(-10) // Keep last 10 messages for context
        .map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          timestamp: new Date().toISOString()
        }));

      console.log('📚 Conversation history:', conversationHistory.length, 'messages');

      // Call Backend API
      const response = await apiClient.sendChatMessage(content, conversationHistory);
      
      console.log('✅ Received response:', response.substring(0, 100) + '...');
      
      // Add assistant message (with ElevenLabs audio generation)
      await addMessage(response, 'assistant');
      
      // Set loading state to false
      setChatState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error('❌ Error sending message:', error);
      
      // Add detailed error message based on error type
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
      
      // Add helpful troubleshooting tips
      const helpMessage = chatState.language === 'hindi'
        ? "\n\n💡 सुझाव:\n• इंटरनेट कनेक्शन जांचें\n• पेज को रीफ्रेश करें\n• कुछ देर बाद प्रयास करें"
        : "\n\n💡 Suggestions:\n• Internet connection check kariye\n• Page ko refresh kariye\n• Kuch der baad try kariye";
      
      await addMessage(errorMessage + helpMessage, 'assistant');
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
            
            {/* Desktop Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <p className="text-xs text-gray-500 font-medium tracking-wide">
                  Built by Futurelab Ikigai and Piramal Foundation © 2025
                </p>
              </div>
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
        <footer className="bg-white border-t border-gray-200 p-4 pb-24">
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

        {/* Mobile Footer */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 px-6 py-4 text-center mb-20">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-xs text-gray-600 font-medium tracking-wide">
              Built by Futurelab Ikigai and Piramal Foundation © 2025
            </p>
          </div>
        </div>

        {/* Mobile Navigation */}
        <MobileNavigation />
      </div>
    </div>
  );
}
