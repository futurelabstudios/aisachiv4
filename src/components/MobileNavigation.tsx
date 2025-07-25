import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  MessageCircle,
  Mic,
  FileText,
  GraduationCap,
  BookOpen,
  PlayCircle,
  Link as LinkIcon,
  ChevronUp,
  ChevronDown,
  Settings,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

export default function MobileNavigation() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { language, t } = useLanguage();
  const { user, userProfile } = useAuth();
  const location = useLocation();

  const toggleNavigation = () => {
    setIsExpanded(!isExpanded);
  };

  const navigationItems = [
    { to: '/', icon: Home, label: t('home'), key: 'home' },
    { to: '/chat', icon: MessageCircle, label: t('chat'), key: 'chat' },
    { to: '/voice-agent', icon: Mic, label: t('voice'), key: 'voice' },
    {
      to: '/circulars',
      icon: LinkIcon,
      label: language === 'hindi' ? 'परिपत्र' : 'Circulars',
      key: 'circulars',
    },
    {
      to: '/document',
      icon: FileText,
      label: language === 'hindi' ? 'दस्तावेज़' : 'Document',
      key: 'document',
    },
    {
      to: '/academy',
      icon: GraduationCap,
      label: language === 'hindi' ? 'अकादमी' : 'Academy',
      key: 'academy',
    },
    {
      to: '/glossary',
      icon: BookOpen,
      label: language === 'hindi' ? 'शब्दकोश' : 'Glossary',
      key: 'glossary',
    },
    {
      to: '/videos',
      icon: PlayCircle,
      label: language === 'hindi' ? 'वीडियो' : 'Videos',
      key: 'videos',
    },
  ];

  // Add admin link if user is admin
  if (userProfile?.is_admin) {
    navigationItems.push({
      to: '/admin',
      icon: Settings,
      label: language === 'hindi' ? 'एडमिन' : 'Admin',
      key: 'admin',
    });
  }

  const currentPath = location.pathname;

  // Show only 3 main items when collapsed
  const visibleItems = isExpanded
    ? navigationItems
    : navigationItems.slice(0, 3);
  const hiddenCount = navigationItems.length - 3;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 lg:hidden">
      {/* Navigation Items */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          currentPath === '/voice-agent'
            ? 'pb-32'
            : isExpanded
            ? 'pb-12'
            : 'pb-2'
        }`}
      >
        <div
          className={`grid gap-1 p-2 max-w-md mx-auto transition-all duration-300 ${
            isExpanded ? 'grid-cols-4' : 'grid-cols-3'
          }`}
        >
          {visibleItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentPath === item.to;

            return (
              <Link
                key={item.key}
                to={item.to}
                className={`flex flex-col items-center py-2 px-1 rounded-lg transition-all ${
                  isActive
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
                onClick={() => {
                  // Auto-collapse after navigation on mobile
                  if (window.innerWidth < 768) {
                    setTimeout(() => setIsExpanded(false), 300);
                  }
                }}
              >
                <IconComponent size={18} />
                <span className="text-xs mt-1 font-medium text-center leading-tight">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Toggle Button */}
      <div className="absolute bottom-0 right-0 left-0">
        <div className="flex justify-center">
          <button
            onClick={toggleNavigation}
            className={`bg-emerald-600 text-white p-2 rounded-t-lg shadow-lg transition-all duration-300 hover:bg-emerald-700 active:scale-95 ${
              isExpanded ? 'px-6' : 'px-4'
            }`}
            aria-label={
              isExpanded ? 'Collapse navigation' : 'Expand navigation'
            }
          >
            <div className="flex items-center gap-2">
              {isExpanded ? (
                <>
                  <ChevronDown size={16} />
                  <span className="text-xs font-medium">
                    {language === 'hindi' ? 'छुपाएं' : 'Hide'}
                  </span>
                </>
              ) : (
                <>
                  <ChevronUp size={16} />
                  <span className="text-xs font-medium">
                    +{hiddenCount} {language === 'hindi' ? 'और' : 'more'}
                  </span>
                </>
              )}
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
}
