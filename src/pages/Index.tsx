import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Language } from "@/types";
export default function Index() {
  const [language, setLanguage] = useState<Language>('english');
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'english' ? 'hindi' : 'english');
  };
  return <div className="min-h-screen flex flex-col bg-gradient-to-b from-sachiv-primary/10 to-white">
      <header className="p-4 flex justify-end">
        <Button onClick={toggleLanguage} variant="outline" className="px-4 py-2 rounded-lg border border-sachiv-primary text-sachiv-primary hover:bg-sachiv-primary/10">
          {language === 'english' ? 'हिंदी' : 'English'}
        </Button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-2 text-sachiv-primary">
            {language === 'english' ? 'AI Sachiv' : 'एआई सचिव'}
          </h1>
          <p className="text-xl text-sachiv-dark">
            {language === 'english' ? 'Your Gram Panchayat Assistant' : 'आपका ग्राम पंचायत सहायक'}
          </p>
        </div>

        <div className="w-full max-w-sm space-y-6">
          <Link to="/chat" className="w-full block">
            <Button className="w-full btn-primary h-20 text-xl text-neutral-50 bg-sachiv-success">
              {language === 'english' ? 'Chat Mode' : 'चैट मोड'}
            </Button>
          </Link>
          
          <Link to="/voice-agent" className="w-full block">
            <Button className="w-full btn-secondary h-20 text-xl bg-sachiv-primary">
              {language === 'english' ? 'Voice Agent Mode' : 'वॉइस एजेंट मोड'}
            </Button>
          </Link>
        </div>
        
        <div className="mt-16 max-w-md text-center">
          <p className="text-sachiv-gray">
            {language === 'english' ? 'AI Sachiv helps Gram Panchayat Sarpanchs with their daily responsibilities. Choose a mode to get started.' : 'एआई सचिव ग्राम पंचायत सरपंचों को उनकी दैनिक जिम्मेदारियों में मदद करता है। शुरू करने के लिए एक मोड चुनें।'}
          </p>
        </div>
      </main>
    </div>;
}