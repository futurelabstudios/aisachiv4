import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language } from '@/types';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Comprehensive translations
const translations = {
  hindi: {
    // App title and branding
    appTitle: 'AI सचिव',
    appSubtitle: 'आपका ग्राम पंचायत सहायक',
    appDescription: 'AI सचिव ग्राम पंचायत अधिकारियों को उनके दैनिक कार्यों में मदद करता है।',
    
    // Navigation
    home: 'होम',
    chat: 'चैट',
    voice: 'आवाज़',
    settings: 'सेटिंग्स',
    
    // Home page
    chatMode: 'मैसेज लिखें',
    voiceAgentMode: 'बात करें',
    getStarted: 'शुरू करें',
    chooseMode: 'शुरू करने के लिए एक मोड चुनें',
    
    // Chat page
    welcomeMessage: 'नमस्ते! मैं आपका AI सचिव हूं। मैं आपके ग्राम पंचायत के काम में मदद करने के लिए हूं। आप अपने सवाल लिख सकते हैं या बोलने के लिए माइक वाले बटन पर टैप कर सकते हैं।',
    typePlaceholder: 'अपना संदेश लिखें...',
    tapToSpeak: 'बोलने के लिए टैप करें',
    listening: 'सुन रहा हूं...',
    thinking: 'सोच रहा हूं...',
    send: 'भेजें',
    
    // Voice page
    voiceTitle: 'वॉइस एजेंट मोड',
    voiceDescription: 'अपने AI सचिव सहायक से बात करें',
    recentConversations: 'हाल की बातचीत',
    startConversation: 'वॉइस बातचीत शुरू करें',
    
    // Common messages
    errorConnection: 'मुझे अभी कनेक्ट करने में समस्या हो रही है। कृपया एक क्षण में पुनः प्रयास करें।',
    errorGeneral: 'कुछ गलत हुआ है। कृपया पुनः प्रयास करें।',
    loading: 'लोड हो रहा है...',
    
    // UI elements
    close: 'बंद करें',
    back: 'वापस',
    next: 'अगला',
    continue: 'जारी रखें',
    cancel: 'रद्द करें',
    
    // Language switching
    switchToHindi: 'हिंदी',
    switchToHinglish: 'Hinglish',
    
    // New features
    webSearch: 'वेब सर्च',
    searchResults: 'खोज परिणाम',
    documentAnalysis: 'दस्तावेज़ विश्लेषण',
    uploadDocument: 'दस्तावेज़ अपलोड करें',
    analyzeDocument: 'दस्तावेज़ का विश्लेषण करें',
    documentSummary: 'दस्तावेज़ सारांश',
    searchingWeb: 'वेब में खोज रहे हैं...',
    analyzingDocument: 'दस्तावेज़ का विश्लेषण हो रहा है...',
  },
  hinglish: {
    // App title and branding
    appTitle: 'AI Sachiv',
    appSubtitle: 'Aapka Gram Panchayat Sahayak',
    appDescription: 'AI Sachiv Gram Panchayat officials ko unki daily responsibilities mein madad karta hai.',
    
    // Navigation
    home: 'Home',
    chat: 'Chat',
    voice: 'Voice',
    settings: 'Settings',
    
    // Home page
    chatMode: 'Message Likhe',
    voiceAgentMode: 'Baat Karein',
    getStarted: 'Start Karen',
    chooseMode: 'Shuru karne ke liye ek mode chuniye',
    
    // Chat page
    welcomeMessage: 'Namaste! Mai aapka AI Sachiv hu. Mai aapke Gram Panchayat ke kaam mein madad karne ke liye hu. Aap apne sawal likh sakte hain ya bolne ke liye mic wale button par tap kar sakte hain.',
    typePlaceholder: 'Apna message type kariye...',
    tapToSpeak: 'Bolne ke liye tap kariye',
    listening: 'Sun raha hu...',
    thinking: 'Soch raha hu...',
    send: 'Bhejiye',
    
    // Voice page
    voiceTitle: 'Voice Agent Mode',
    voiceDescription: 'Apne AI Sachiv assistant se baat kariye',
    recentConversations: 'Recent Conversations',
    startConversation: 'Voice Conversation Start Kariye',
    
    // Common messages
    errorConnection: 'Mujhe abhi connect karne mein problem ho rahi hai. Kripya ek moment mein phir try kariye.',
    errorGeneral: 'Kuch galat hua hai. Kripya phir try kariye.',
    loading: 'Load ho raha hai...',
    
    // UI elements
    close: 'Band Kariye',
    back: 'Wapas',
    next: 'Agla',
    continue: 'Continue Kariye',
    cancel: 'Cancel Kariye',
    
    // Language switching
    switchToHindi: 'हिंदी',
    switchToHinglish: 'Hinglish',
    
    // New features
    webSearch: 'Web Search',
    searchResults: 'Search Results',
    documentAnalysis: 'Document Analysis',
    uploadDocument: 'Document Upload Karen',
    analyzeDocument: 'Document Analyze Karen',
    documentSummary: 'Document Summary',
    searchingWeb: 'Web mein search kar rahe hain...',
    analyzingDocument: 'Document analyze ho raha hai...',
  },
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('preferred-language') as Language;
    return savedLanguage || 'hinglish';
  });

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('preferred-language', newLanguage);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.hindi] || key;
  };

  useEffect(() => {
    localStorage.setItem('preferred-language', language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 