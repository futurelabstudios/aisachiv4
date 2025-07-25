import { useState, useEffect, useRef } from 'react';
import ChatMessage from '@/components/ChatMessage';
import MessageInput from '@/components/MessageInput';
import { Message, ChatState, Language } from '@/types';
import { speechRecognitionService } from '@/utils/speechRecognition';
import { v4 as uuidv4 } from 'uuid';
import { apiClient, ChatMessage as APIChatMessage } from '@/services/api';
import { elevenLabsService } from '@/services/elevenlabs';
import {
  MessageCircle,
  Globe,
  Home,
  Mic,
  FileText,
  Link as LinkIcon,
  GraduationCap,
  PlayCircle,
  BookOpen,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import MainLayout from '@/components/layout/MainLayout';
import { useToast } from '@/components/ui/use-toast';

import { Button } from '@/components/ui/button';

export default function ChatPage() {
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const { toast } = useToast();

  const [chatState, setChatState] = useState<ChatState>(() => {
    return {
      messages: [],
      isLoading: false,
      language: language,
      conversationId: null, // Add conversationId to state
    };
  });

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechRecognition = speechRecognitionService;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // A small delay to allow the DOM to update before scrolling.
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timer);
  }, [chatState.messages]);

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setChatState((prev) => ({ ...prev, language: newLanguage }));
  };

  const addMessage = async (
    content: string,
    role: 'user' | 'assistant',
    audioUrl?: string
  ) => {
    const newMessage: Message = {
      id: uuidv4(),
      content,
      role,
      audioUrl,
    };

    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));

    return newMessage.id;
  };

  const updateMessage = (id: string, content: string) => {
    setChatState((prev) => ({
      ...prev,
      messages: prev.messages.map((m) =>
        m.id === id ? { ...m, content: m.content + content } : m
      ),
    }));
  };

  const finalizeMessage = async (id: string) => {
    setChatState((prev) => {
      const finalMessage = prev.messages.find((m) => m.id === id);
      if (finalMessage) {
        elevenLabsService
          .textToSpeech(finalMessage.content, prev.language)
          .then((audioUrl) => {
            setChatState((subPrev) => ({
              ...subPrev,
              messages: subPrev.messages.map((m) =>
                m.id === id ? { ...m, audioUrl } : m
              ),
            }));
          })
          .catch((error) =>
            console.error('❌ Failed to generate audio:', error)
          );
      }
      return prev;
    });
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;
    console.log('📤 Sending message:', content);

    // Add user message to local state
    await addMessage(content, 'user');

    setChatState((prev) => ({ ...prev, isLoading: true }));

    // Create conversation history from state, excluding the latest message
    const conversationHistory = chatState.messages.slice(-10).map((m) => ({
      role: m.role,
      content: m.content,
      timestamp: new Date().toISOString(),
    }));

    // Add empty assistant message for streaming
    const assistantMessageId = await addMessage('', 'assistant');

    await apiClient.streamChat({
      message: content,
      conversationId: chatState.conversationId,
      conversationHistory,
      onChunk: (chunk, conversationId) => {
        if (conversationId && !chatState.conversationId) {
          setChatState((prev) => ({ ...prev, conversationId }));
        }
        updateMessage(assistantMessageId, chunk);
        scrollToBottom();
      },
      onComplete: () => {
        finalizeMessage(assistantMessageId);
        setChatState((prev) => ({ ...prev, isLoading: false }));
      },
      onError: (error) => {
        console.error('❌ Error sending message:', error);

        let errorMessage = '';

        if (error instanceof Error) {
          if (
            error.message.includes('fetch') ||
            error.message.includes('network')
          ) {
            errorMessage =
              chatState.language === 'hindi'
                ? '🌐 इंटरनेट कनेक्शन की समस्या है। कृपया अपना कनेक्शन जांचें और पुनः प्रयास करें।'
                : '🌐 Internet connection problem hai. Kripya apna connection check kariye aur phir try kariye.';
          } else if (
            error.message.includes('401') ||
            error.message.includes('API')
          ) {
            errorMessage =
              chatState.language === 'hindi'
                ? '🔑 सर्विस में अस्थायी समस्या है। कृपया बाद में पुनः प्रयास करें।'
                : '🔑 Service mein temporary problem hai. Kripya baad mein phir try kariye.';
          } else {
            errorMessage =
              chatState.language === 'hindi'
                ? '⚠️ कुछ गलत हुआ है। कृपया पुनः प्रयास करें।'
                : '⚠️ Kuch galat hua hai. Kripya phir try kariye.';
          }
        } else {
          errorMessage =
            chatState.language === 'hindi'
              ? '❓ अज्ञात त्रुटि हुई है। कृपया पुनः प्रयास करें।'
              : '❓ Unknown error hui hai. Kripya phir try kariye.';
        }

        const helpMessage =
          chatState.language === 'hindi'
            ? '\n\n💡 सुझाव:\n• इंटरनेट कनेक्शन जांचें\n• पेज को रीफ्रेश करें\n• कुछ देर बाद प्रयास करें'
            : '\n\n💡 Suggestions:\n• Internet connection check kariye\n• Page ko refresh kariye\n• Kuch der baad try kariye';

        updateMessage(assistantMessageId, errorMessage + helpMessage);
        setChatState((prev) => ({ ...prev, isLoading: false }));
      },
    });
  };

  const handleStartListening = () => {
    setTranscript('');
    setIsListening(true);
  };

  const handleStopListening = () => {
    setIsListening(false);
  };

  useEffect(() => {
    // This effect manages the entire lifecycle of speech recognition.
    if (isListening) {
      let finalTranscript = '';

      const handleResult = (text: string) => {
        finalTranscript = text;
        setTranscript(text);
      };

      const handleEnd = () => {
        if (finalTranscript.trim()) {
          handleSendMessage(finalTranscript.trim());
        }
        setTranscript('');
        setIsListening(false); // Ensure listening is set to false
      };

      const handleError = (error: string) => {
        console.error('Speech recognition error:', error);
        setIsListening(false);

        let description = t('speechErrorGeneric');
        if (error === 'network') {
          description = t('speechErrorNetwork');
        } else if (error === 'not-allowed' || error === 'service-not-allowed') {
          description = t('speechErrorNotAllowed');
        } else if (error === 'no-speech') {
          description = t('speechErrorNoSpeech');
        }

        toast({
          title: t('speechErrorTitle'),
          description,
          variant: 'destructive',
        });
      };

      const started = speechRecognitionService.start({
        language: chatState.language,
        onResult: handleResult,
        onEnd: handleEnd,
        onError: handleError,
      });

      if (!started) {
        setIsListening(false);
      }
    } else {
      speechRecognitionService.stop();
    }

    return () => {
      speechRecognitionService.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening, chatState.language, t, toast]);

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
    switch (language) {
      case 'hindi':
        return t('switchToHinglish');
      case 'hinglish':
        return t('switchToHindi');
      default:
        return 'हिंदी';
    }
  };

  return (
    <MainLayout>
      <div className="flex-1 h-[calc(100vh-300px)] lg:h-auto overflow-y-auto p-6">
        <div
          className="max-w-4xl mx-auto max-h-[calc(100vh-200px)] pb-24  space-y-4"
          style={{ scrollBehavior: 'smooth' }}
        >
          {chatState.messages.map((message) => (
            <div key={message.id} className="fade-in pb-4">
              <ChatMessage message={message} language={language} />
            </div>
          ))}

          {isListening && (
            <div className="flex justify-center">
              <div className="bg-blue-100 border border-blue-200 p-4 rounded-xl scale-in">
                <p className="text-blue-700 text-center font-medium">
                  {t('listening')}
                </p>
                {transcript && (
                  <p className="mt-2 text-center text-gray-700">{transcript}</p>
                )}
              </div>
            </div>
          )}

          {chatState.isLoading && (
            <div className="flex justify-center">
              <div className="bg-emerald-100 border border-emerald-200 p-4 rounded-xl animate-pulse">
                <p className="text-emerald-700 text-center font-medium">
                  {t('thinking')}
                </p>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-6 bg-gray-100 mb-10 lg:mb-0 border-t border-gray-200">
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
    </MainLayout>
  );
}
