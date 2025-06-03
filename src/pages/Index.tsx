
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { MessageCircle, Mic, Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import MobileNavigation from "@/components/MobileNavigation";

export default function Index() {
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  

  
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
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-2xl w-full">
            <div className="text-center mb-12">
              <h1 className="text-6xl font-bold text-emerald-600 mb-4">{t('appTitle')}</h1>
              <p className="text-2xl text-gray-600 mb-8">{t('appSubtitle')}</p>
              <p className="text-gray-500 mb-8">{t('appDescription')}</p>
              
              <Button
                onClick={toggleLanguage}
                variant="outline"
                className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
              >
                <Globe className="w-4 h-4 mr-2" />
                {getLanguageButtonText()}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Link to="/chat" className="block">
                <Button className="primary-button w-full h-32 text-xl text-white flex flex-col items-center justify-center gap-4 rounded-xl">
                  <MessageCircle size={32} />
                  {t('chatMode')}
                </Button>
              </Link>
              
              <Link to="/voice-agent" className="block">
                <Button className="secondary-button w-full h-32 text-xl text-white flex flex-col items-center justify-center gap-4 rounded-xl">
                  <Mic size={32} />
                  {t('voiceAgentMode')}
                </Button>
              </Link>
            </div>

            <div className="mt-12 text-center">
              <p className="text-gray-500">{t('chooseMode')}</p>
            </div>
            
            {/* Desktop Footer */}
            <div className="mt-12 pt-8 border-t border-gray-200">
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
      <div className="lg:hidden min-h-screen flex flex-col">
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

        <main className="flex-1 flex flex-col items-center justify-center p-6 pb-24">
          <div className="mb-12 text-center max-w-md">
            <h1 className="text-4xl font-bold mb-4 text-emerald-600">
              {t('appTitle')}
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              {t('appSubtitle')}
            </p>
            <p className="text-gray-500 text-sm">
              {t('appDescription')}
            </p>
          </div>

          <div className="w-full max-w-sm space-y-6">
            <Link to="/chat" className="w-full block">
              <Button className="primary-button w-full h-20 text-xl text-white flex items-center justify-center gap-3 rounded-xl">
                <MessageCircle size={24} />
                {t('chatMode')}
              </Button>
            </Link>
            
            <Link to="/voice-agent" className="w-full block">
              <Button className="secondary-button w-full h-20 text-xl text-white flex items-center justify-center gap-3 rounded-xl">
                <Mic size={24} />
                {t('voiceAgentMode')}
              </Button>
            </Link>
          </div>
          
          <div className="mt-12 max-w-md text-center">
            <p className="text-gray-500 text-sm">
              {t('chooseMode')}
            </p>
          </div>
        </main>

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
