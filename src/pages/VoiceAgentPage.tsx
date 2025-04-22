
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Language } from "@/types";
import { toast } from "@/components/ui/use-toast";

export default function VoiceAgentPage() {
  const [language, setLanguage] = useState<Language>('english');
  const [conversations, setConversations] = useState<Array<{timestamp: string, text: string}>>([]);

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

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
        title: language === 'english' ? "Conversation saved" : "वार्तालाप सहेजा गया",
        description: language === 'english' ? 
          "Your conversation has been recorded locally" : 
          "आपकी वार्तालाप स्थानीय रूप से दर्ज की गई है"
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

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header language={language} onLanguageChange={handleLanguageChange} />
      
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="text-center mb-8 max-w-sm">
          <h2 className="text-2xl font-semibold mb-4 text-sachiv-dark">
            {language === 'english' 
              ? 'Voice Agent Mode' 
              : 'वॉइस एजेंट मोड'}
          </h2>
          <p className="text-sachiv-gray">
            {language === 'english' 
              ? 'Speak with your AI Sachiv assistant.' 
              : 'अपने एआई सचिव सहायक से बात करें।'}
          </p>
        </div>

        {/* ElevenLabs Convai Widget */}
        <div className="w-full max-w-2xl mx-auto mb-8">
          <elevenlabs-convai 
            agent-id="o3Q9qV20D6Dr8KEvj9e1"
            className="w-full h-[600px] rounded-lg shadow-lg"
          ></elevenlabs-convai>
        </div>

        {/* Recent Conversations */}
        <div className="w-full max-w-2xl mx-auto mt-8">
          <h3 className="text-xl font-semibold mb-4 text-sachiv-dark">
            {language === 'english' ? 'Recent Conversations' : 'हाल की बातचीत'}
          </h3>
          <div className="space-y-4">
            {conversations.slice(-5).map((conv, index) => (
              <div key={index} className="p-4 bg-white rounded-lg shadow">
                <p className="text-sm text-sachiv-gray">
                  {new Date(conv.timestamp).toLocaleString()}
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
