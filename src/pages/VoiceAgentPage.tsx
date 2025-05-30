
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Language } from "@/types";
import { toast } from "@/components/ui/use-toast";
import { useTranslations } from "@/hooks/useTranslations";

export default function VoiceAgentPage() {
  const [language, setLanguage] = useState<Language>('english');
  const [conversations, setConversations] = useState<Array<{timestamp: string, text: string}>>([]);
  const [apiKey, setApiKey] = useState<string>("");
  const { t } = useTranslations(language);

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

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
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
    <div className="flex flex-col h-screen bg-gray-50">
      <Header language={language} onLanguageChange={handleLanguageChange} />
      
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="text-center mb-8 max-w-sm">
          <h2 className="text-2xl font-semibold mb-4 text-sachiv-dark">
            {translations[language].title}
          </h2>
          <p className="text-sachiv-gray">
            {translations[language].description}
          </p>
        </div>

        {/* ElevenLabs Convai Widget */}
        <div className="w-full max-w-md mx-auto mb-8 flex justify-center">
          <elevenlabs-convai agent-id="o3Q9qV20D6Dr8KEvj9e1"></elevenlabs-convai>
        </div>

        {/* Recent Conversations */}
        <div className="w-full max-w-2xl mx-auto mt-8">
          <h3 className="text-xl font-semibold mb-4 text-sachiv-dark">
            {translations[language].recentConversations}
          </h3>
          <div className="space-y-4">
            {conversations.slice(-5).map((conv, index) => (
              <div key={index} className="p-4 bg-white rounded-lg shadow">
                <p className="text-sm text-sachiv-gray">
                  {formatDate(conv.timestamp)}
                </p>
                <p className="mt-2">{conv.text}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
