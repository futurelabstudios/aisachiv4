import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Home,
  MessageCircle,
  Mic,
  Globe,
  FileText,
  Link as LinkIcon,
  GraduationCap,
  PlayCircle,
  BookOpen,
  Settings,
  Download,
} from 'lucide-react';
import MobileNavigation from '@/components/MobileNavigation';
import { usePWAInstall } from '@/hooks/usePWAInstall';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { language, setLanguage, t } = useLanguage();
  const { isInstallable, handleInstallClick } = usePWAInstall();

  const { user, userProfile } = useAuth();
  const location = useLocation();

  const toggleLanguage = () => {
    if (language === 'hindi') setLanguage('hinglish');
    else setLanguage('hindi');
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

  const navLinks = [
    { to: '/', icon: Home, label: t('home') },
    { to: '/chat', icon: MessageCircle, label: t('chat') },
    { to: '/voice-agent', icon: Mic, label: t('voice') },
    {
      to: '/circulars',
      icon: LinkIcon,
      label: language === 'hindi' ? 'सरकारी परिपत्र' : 'Government Circulars',
    },
    { to: '/document', icon: FileText, label: t('documentAnalysis') },
    {
      to: '/academy',
      icon: GraduationCap,
      label: language === 'hindi' ? 'सरपंच अकादमी' : 'Sarpanch Academy',
    },
    {
      to: '/glossary',
      icon: BookOpen,
      label: language === 'hindi' ? 'शब्दकोश' : 'Glossary',
    },
    {
      to: '/videos',
      icon: PlayCircle,
      label: language === 'hindi' ? 'महत्वपूर्ण वीडियो' : 'Important Videos',
    },
  ];

  // Add admin link if user is admin
  const isAdmin = userProfile?.is_admin;
  if (isAdmin) {
    navLinks.push({
      to: '/admin',
      icon: Settings,
      label: language === 'hindi' ? 'एडमिन डैशबोर्ड' : 'Admin Dashboard',
    });
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-white">
      {/* Desktop Layout */}
      <div className="hidden lg:block desktop-layout">
        <div className="chat-desktop">
          {/* Sidebar */}
          <div className="bg-gray-50 border-r border-gray-200 p-4 flex flex-col">
            <div className="text-left mb-6 px-2">
              <h1 className="text-2xl font-bold text-emerald-600">
                {t('appTitle')}
              </h1>
              <p className="text-gray-500 text-sm">{t('appSubtitle')}</p>
            </div>

            <Button
              onClick={toggleLanguage}
              variant="outline"
              className="w-full mb-4 bg-white border-gray-200 text-gray-700 hover:bg-gray-100"
            >
              <Globe className="w-4 h-4 mr-2" />
              {getLanguageButtonText()}
            </Button>

            <nav className="space-y-1 flex-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                    isActive(link.to)
                      ? 'bg-emerald-100 border border-emerald-200 text-emerald-800'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <link.icon
                    className={`w-5 h-5 mr-3 ${
                      isActive(link.to) ? 'text-emerald-600' : 'text-gray-500'
                    }`}
                  />
                  <span
                    className={
                      isActive(link.to)
                        ? 'text-emerald-800 font-medium'
                        : 'text-gray-700'
                    }
                  >
                    {link.label}
                  </span>
                </Link>
              ))}
            </nav>
            <div className="mt-auto">
              <div className="bg-gray-100 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-600">
                  Built by Futurelab Ikigai & Piramal Foundation © 2025
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="chat-main-desktop bg-gray-100">{children}</div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-col h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <div>
              <h1 className="text-xl font-bold text-emerald-600">
                {t('appTitle')}
              </h1>
              <p className="text-xs text-gray-500">{t('appSubtitle')}</p>
            </div>
            <div className="flex items-center gap-2">
              {isInstallable && (
                <Button
                  onClick={handleInstallClick}
                  variant="outline"
                  size="sm"
                  className="p-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                  aria-label="Install App"
                >
                  <Download className="w-4 h-4" />
                </Button>
              )}
              
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
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>

        <MobileNavigation />
      </div>
    </div>
  );
}
