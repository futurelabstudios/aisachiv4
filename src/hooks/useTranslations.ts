
import { Language } from '@/types';

type TranslationKey = 
  | 'welcomeMessage'
  | 'sendMessage'
  | 'listening'
  | 'tapToSpeak'
  | 'processing'
  | 'errorMessage'
  | 'voiceAgentTitle'
  | 'voiceAgentDescription'
  | 'recentConversations'
  | 'thinking'
  | 'inputPlaceholder'
  | 'speakNow';

const translations: Record<Language, Record<TranslationKey, string>> = {
  english: {
    welcomeMessage: "Welcome to AI Sachiv! How can I help you today?",
    sendMessage: "Send message",
    listening: "Listening...",
    tapToSpeak: "Tap and hold to speak",
    processing: "Processing...",
    errorMessage: "Something went wrong. Please try again.",
    voiceAgentTitle: "Voice Agent Mode",
    voiceAgentDescription: "Speak with your AI Sachiv assistant.",
    recentConversations: "Recent Conversations",
    thinking: "Thinking...",
    inputPlaceholder: "Type your message...",
    speakNow: "Speak now"
  },
  hindi: {
    welcomeMessage: "एआई सचिव में आपका स्वागत है! मैं आपकी कैसे मदद कर सकता हूं?",
    sendMessage: "संदेश भेजें",
    listening: "सुन रहा हूं...",
    tapToSpeak: "बोलने के लिए दबाएं और पकड़ें",
    processing: "प्रोसेसिंग हो रही है...",
    errorMessage: "कुछ गलत हुआ। कृपया पुनः प्रयास करें।",
    voiceAgentTitle: "वॉइस एजेंट मोड",
    voiceAgentDescription: "अपने एआई सचिव सहायक से बात करें।",
    recentConversations: "हाल की बातचीत",
    thinking: "सोच रहा हूं...",
    inputPlaceholder: "अपना संदेश लिखें...",
    speakNow: "अब बोलें"
  },
  hinglish: {
    welcomeMessage: "AI Sachiv me aapka swagat hai! Mai aapki kaise help kar sakta hu?",
    sendMessage: "Message bheje",
    listening: "Sun raha hu...",
    tapToSpeak: "Bolne ke liye dabaye aur pakde",
    processing: "Processing ho raha hai...",
    errorMessage: "Kuch galat ho gaya. Phirse koshish kare.",
    voiceAgentTitle: "Voice Agent Mode",
    voiceAgentDescription: "Apne AI Sachiv assistant se baat karen.",
    recentConversations: "Recent Conversations",
    thinking: "Soch raha hu...",
    inputPlaceholder: "Apna message likhe...",
    speakNow: "Ab bolo"
  }
};

export const useTranslations = (language: Language) => {
  const t = (key: TranslationKey): string => {
    return translations[language][key];
  };

  return { t };
};
