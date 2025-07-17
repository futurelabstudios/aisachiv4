import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { elevenLabsService } from "@/services/elevenlabs";
import MainLayout from "@/components/layout/MainLayout";

export default function VoiceAgentPage() {
  const { language, setLanguage, t } = useLanguage();
  const [conversations, setConversations] = useState<
    Array<{ timestamp: string; text: string }>
  >([]);
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
    <MainLayout>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-emerald-600 mb-4">
            {t("voiceTitle")}
          </h2>
          <p className="text-gray-600">{t("voiceDescription")}</p>
        </div>

        {/* ElevenLabs Convai Widget */}
        <div className="flex justify-center mb-8">
          <elevenlabs-convai agent-id="o3Q9qV20D6Dr8KEvj9e1"></elevenlabs-convai>
        </div>

        {/* Recent Conversations */}
        <div className="max-w-2xl mx-auto">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            {t("recentConversations")}
          </h3>
          <div className="space-y-4">
            {conversations.slice(-5).map((conv, index) => (
              <div
                key={index}
                className="p-4 bg-white rounded-xl shadow-sm border border-gray-200"
              >
                <p className="text-sm text-gray-500 mb-2">
                  {formatDate(conv.timestamp)}
                </p>
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
    </MainLayout>
  );
}
