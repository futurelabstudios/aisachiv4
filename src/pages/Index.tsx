
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Language } from "@/types";

export default function Index() {
  const [language, setLanguage] = useState<Language>('english');
  
  const translations = {
    english: {
      title: 'AI Sachiv',
      subtitle: 'Your Gram Panchayat Assistant',
      chatMode: 'Chat Mode',
      voiceAgentMode: 'Voice Agent Mode',
      description: 'AI Sachiv helps Gram Panchayat Sarpanchs with their daily responsibilities. Choose a mode to get started.'
    },
    hindi: {
      title: 'एआई सचिव',
      subtitle: 'आपका ग्राम पंचायत सहायक',
      chatMode: 'चैट मोड',
      voiceAgentMode: 'वॉइस एजेंट मोड',
      description: 'एआई सचिव ग्राम पंचायत सरपंचों को उनकी दैनिक जिम्मेदारियों में मदद करता है। शुरू करने के लिए एक मोड चुनें।'
    },
    hinglish: {
      title: 'AI Sachiv',
      subtitle: 'Aapka Gram Panchayat Sahayak',
      chatMode: 'Chat Mode',
      voiceAgentMode: 'Voice Agent Mode',
      description: 'AI Sachiv Gram Panchayat Sarpancho ko unki daily responsibilities mein madad karta hai. Shuru karne ke liye ek mode chunein.'
    }
  };
  
  const toggleLanguage = () => {
    setLanguage(prev => {
      if (prev === 'english') return 'hindi';
      if (prev === 'hindi') return 'hinglish';
      return 'english';
    });
  };
  
  const getLanguageButtonText = () => {
    switch(language) {
      case 'english': return 'हिंदी';
      case 'hindi': return 'Hinglish';
      case 'hinglish': return 'English';
      default: return 'English';
    }
  };
  
  return <div className="min-h-screen flex flex-col bg-gradient-to-b from-sachiv-primary/10 to-white">
      <header className="p-4 flex justify-end">
        <Button onClick={toggleLanguage} variant="outline" className="px-4 py-2 rounded-lg border border-sachiv-primary text-sachiv-primary hover:bg-sachiv-primary/10">
          {getLanguageButtonText()}
        </Button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-2 text-sachiv-primary">
            {translations[language].title}
          </h1>
          <p className="text-xl text-sachiv-dark">
            {translations[language].subtitle}
          </p>
        </div>

        <div className="w-full max-w-sm space-y-6">
          <Link to="/chat" className="w-full block">
            <Button className="w-full btn-primary h-20 text-xl text-neutral-50 bg-sachiv-success">
              {translations[language].chatMode}
            </Button>
          </Link>
          
          <Link to="/voice-agent" className="w-full block">
            <Button className="w-full btn-secondary h-20 text-xl bg-sachiv-primary">
              {translations[language].voiceAgentMode}
            </Button>
          </Link>
        </div>
        
        <div className="mt-16 max-w-md text-center">
          <p className="text-sachiv-gray">
            {translations[language].description}
          </p>
        </div>
      </main>
    </div>;
}
