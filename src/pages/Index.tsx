
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { MessageCircle, Mic, Globe, Home, FileText, Link as LinkIcon, GraduationCap, PlayCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

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

        {/* Mobile Navigation */}
        <nav className="nav-item fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-50">
          <div className="flex justify-center items-center space-x-3 max-w-md mx-auto">
            <div className="nav-item active flex flex-col items-center p-1 rounded-xl">
              <Home size={16} />
              <span className="text-xs mt-1 font-medium">{t('home')}</span>
            </div>
            
            <Link 
              to="/chat" 
              className="nav-item flex flex-col items-center p-1 rounded-xl transition-all text-gray-500 hover:text-emerald-600"
            >
              <MessageCircle size={16} />
              <span className="text-xs mt-1 font-medium">{t('chat')}</span>
            </Link>
            
            <Link 
              to="/voice-agent" 
              className="nav-item flex flex-col items-center p-1 rounded-xl transition-all text-gray-500 hover:text-emerald-600"
            >
              <Mic size={16} />
              <span className="text-xs mt-1 font-medium">{t('voice')}</span>
            </Link>

            <Link 
              to="/circulars" 
              className="nav-item flex flex-col items-center p-1 rounded-xl transition-all text-gray-500 hover:text-emerald-600"
            >
              <LinkIcon size={16} />
              <span className="text-xs mt-1 font-medium">
                {language === 'hindi' ? 'परिपत्र' : 'Circulars'}
              </span>
            </Link>

            <Link 
              to="/document" 
              className="nav-item flex flex-col items-center p-1 rounded-xl transition-all text-gray-500 hover:text-emerald-600"
            >
              <FileText size={16} />
              <span className="text-xs mt-1 font-medium">
                {language === 'hindi' ? 'दस्तावेज़' : 'Document'}
              </span>
            </Link>

            <Link 
              to="/academy" 
              className="nav-item flex flex-col items-center p-1 rounded-xl transition-all text-gray-500 hover:text-emerald-600"
            >
              <GraduationCap size={16} />
              <span className="text-xs mt-1 font-medium">
                {language === 'hindi' ? 'अकादमी' : 'Academy'}
              </span>
            </Link>

            <Link 
              to="/videos" 
              className="nav-item flex flex-col items-center p-1 rounded-xl transition-all text-gray-500 hover:text-emerald-600"
            >
              <PlayCircle size={16} />
              <span className="text-xs mt-1 font-medium">
                {language === 'hindi' ? 'वीडियो' : 'Videos'}
              </span>
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}
