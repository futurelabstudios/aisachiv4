import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { Link, useLocation } from "react-router-dom";
import { Home, MessageCircle, Mic, Globe, FileText, Link as LinkIcon, GraduationCap, PlayCircle, BookOpen } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

export default function VoiceAgentPage() {
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const [conversations, setConversations] = useState<Array<{timestamp: string, text: string}>>([]);
  const [apiKey, setApiKey] = useState<string>("");

  // Set translations for this page
  const translations = {
    english: {
      title: 'Voice Agent Mode',
      description: 'Speak with your AI Sachiv assistant.',
      recentConversations: 'Recent Conversations',
      conversationSaved: "Conversation saved",
      conversationSavedDesc: "Your conversation has been recorded locally",
      startConversation: "Start Voice Conversation"
    },
    hindi: {
      title: 'वॉइस एजेंट मोड',
      description: 'अपने एआई सचिव सहायक से बात करें।',
      recentConversations: 'हाल की बातचीत',
      conversationSaved: "वार्तालाप सहेजा गया",
      conversationSavedDesc: "आपकी वार्तालाप स्थानीय रूप से दर्ज की गई है",
      startConversation: "वॉइस वार्तालाप शुरू करें"
    },
    hinglish: {
      title: 'Voice Agent Mode',
      description: 'Apne AI Sachiv assistant se baat karen.',
      recentConversations: 'Recent Conversations',
      conversationSaved: "Conversation save ho gaya",
      conversationSavedDesc: "Aapki conversation local device par save ho gayi hai",
      startConversation: "Voice Conversation Start Karen"
    }
  };

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

  // Load OpenAI API key 
  useEffect(() => {
    const storedApiKey = localStorage.getItem('openai-api-key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    } else {
      // Set default API key - should be stored more securely in a production environment
      const defaultKey = "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";
      setApiKey(defaultKey);
      localStorage.setItem('openai-api-key', defaultKey);
    }
  }, []);

  // Save conversation snippets
  const saveConversation = (text: string) => {
    const newConversation = {
      timestamp: new Date().toISOString(),
      text
    };
    setConversations(prev => [...prev, newConversation]);
    
    // Save to localStorage
    try {
      const savedConversations = JSON.parse(localStorage.getItem('sachiv-conversations') || '[]');
      localStorage.setItem('sachiv-conversations', JSON.stringify([...savedConversations, newConversation]));
      toast({
        title: translations[language].conversationSaved,
        description: translations[language].conversationSavedDesc
      });
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  };

  // Load saved conversations on mount
  useEffect(() => {
    try {
      const savedConversations = JSON.parse(localStorage.getItem('sachiv-conversations') || '[]');
      setConversations(savedConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  }, []);

  // Format date according to selected language
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(
      language === 'hindi' ? 'hi-IN' : 'en-US'
    );
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
              
              <div className="flex items-center p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <Mic className="w-5 h-5 mr-3 text-emerald-600" />
                <span className="text-emerald-700 font-medium">{t('voice')}</span>
              </div>

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

          {/* Main Voice Area */}
          <div className="chat-main-desktop">
            <div className="flex-1 overflow-y-auto p-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-emerald-600 mb-4">{t('voiceTitle')}</h2>
                <p className="text-gray-600">{t('voiceDescription')}</p>
              </div>

              {/* ElevenLabs Convai Widget */}
              <div className="flex justify-center mb-8">
                <elevenlabs-convai agent-id="o3Q9qV20D6Dr8KEvj9e1"></elevenlabs-convai>
              </div>

              {/* Recent Conversations */}
              <div className="max-w-2xl mx-auto">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">{t('recentConversations')}</h3>
                <div className="space-y-4">
                  {conversations.slice(-5).map((conv, index) => (
                    <div key={index} className="p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                      <p className="text-sm text-gray-500 mb-2">{formatDate(conv.timestamp)}</p>
                      <p className="text-gray-700">{conv.text}</p>
                    </div>
                  ))}
                </div>
              </div>
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

        {/* Mobile Voice Area */}
        <main className="flex-1 overflow-y-auto bg-white mobile-padding">
          <div className="max-w-md mx-auto p-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-emerald-600 mb-4">{t('voiceTitle')}</h2>
              <p className="text-gray-600">{t('voiceDescription')}</p>
            </div>

            {/* ElevenLabs Convai Widget */}
            <div className="flex justify-center mb-8">
              <elevenlabs-convai agent-id="o3Q9qV20D6Dr8KEvj9e1"></elevenlabs-convai>
            </div>

            {/* Recent Conversations */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">{t('recentConversations')}</h3>
              <div className="space-y-4">
                {conversations.slice(-5).map((conv, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-500 mb-2">{formatDate(conv.timestamp)}</p>
                    <p className="text-gray-700 text-sm">{conv.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* Mobile Footer */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 px-6 py-4 text-center mb-16">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-xs text-gray-600 font-medium tracking-wide">
              Built by Futurelab Ikigai and Piramal Foundation © 2025
            </p>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
          <div className="grid grid-cols-4 gap-1 p-2 max-w-md mx-auto">
            <Link 
              to="/" 
              className="flex flex-col items-center py-2 px-1 rounded-lg transition-all text-gray-500 hover:bg-gray-50"
            >
              <Home size={18} />
              <span className="text-xs mt-1 font-medium text-center">{t('home')}</span>
            </Link>
            
            <Link 
              to="/chat" 
              className="flex flex-col items-center py-2 px-1 rounded-lg transition-all text-gray-500 hover:bg-gray-50"
            >
              <MessageCircle size={18} />
              <span className="text-xs mt-1 font-medium text-center">{t('chat')}</span>
            </Link>
            
            <div className="bg-emerald-50 border border-emerald-200 flex flex-col items-center py-2 px-1 rounded-lg">
              <Mic size={18} className="text-emerald-600" />
              <span className="text-xs mt-1 font-medium text-emerald-700 text-center">{t('voice')}</span>
            </div>

            <Link 
              to="/circulars" 
              className="flex flex-col items-center py-2 px-1 rounded-lg transition-all text-gray-500 hover:bg-gray-50"
            >
              <LinkIcon size={18} />
              <span className="text-xs mt-1 font-medium text-center">
                {language === 'hindi' ? 'परिपत्र' : 'Circulars'}
              </span>
            </Link>

            <Link 
              to="/document" 
              className="flex flex-col items-center py-2 px-1 rounded-lg transition-all text-gray-500 hover:bg-gray-50"
            >
              <FileText size={18} />
              <span className="text-xs mt-1 font-medium text-center">
                {language === 'hindi' ? 'दस्तावेज़' : 'Document'}
              </span>
            </Link>

            <Link 
              to="/academy" 
              className="flex flex-col items-center py-2 px-1 rounded-lg transition-all text-gray-500 hover:bg-gray-50"
            >
              <GraduationCap size={18} />
              <span className="text-xs mt-1 font-medium text-center">
                {language === 'hindi' ? 'अकादमी' : 'Academy'}
              </span>
            </Link>

            <Link 
              to="/glossary" 
              className="flex flex-col items-center py-2 px-1 rounded-lg transition-all text-gray-500 hover:bg-gray-50"
            >
              <BookOpen size={18} />
              <span className="text-xs mt-1 font-medium text-center">
                {language === 'hindi' ? 'शब्दकोश' : 'Glossary'}
              </span>
            </Link>

            <Link 
              to="/videos" 
              className="flex flex-col items-center py-2 px-1 rounded-lg transition-all text-gray-500 hover:bg-gray-50"
            >
              <PlayCircle size={18} />
              <span className="text-xs mt-1 font-medium text-center">
                {language === 'hindi' ? 'वीडियो' : 'Videos'}
              </span>
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}
