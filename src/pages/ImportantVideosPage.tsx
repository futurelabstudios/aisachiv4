import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, MessageCircle, Mic, Globe, FileText, Link as LinkIcon, GraduationCap, PlayCircle, ExternalLink, BookOpen } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";

const essentialVideos = [
  {
    title: {
      hindi: 'सरपंच का अनुभव - गांव का विकास कैसे करें',
      hinglish: 'Sarpanch ka Experience - Gaon ka Vikas kaise kare'
    },
    description: {
      hindi: 'अनुभवी सरपंच अपने गांव के विकास की कहानी बताते हैं',
      hinglish: 'Experienced sarpanch apne gaon ke development ki kahani batate hain'
    },
    url: 'https://www.youtube.com/watch?v=opJndJE67x4',
    importance: {
      hindi: 'गांव विकास की व्यावहारिक जानकारी',
      hinglish: 'Practical village development knowledge'
    },
    duration: '12 मिनट / 12 minutes'
  },
  {
    title: {
      hindi: 'मनरेगा की संपूर्ण जानकारी और क्रियान्वयन',
      hinglish: 'MGNREGA Complete Information aur Implementation'
    },
    description: {
      hindi: 'महात्मा गांधी राष्ट्रीय रोजगार गारंटी अधिनियम की संपूर्ण जानकारी',
      hinglish: 'Complete MGNREGA implementation guide for sarpanches'
    },
    url: 'https://www.youtube.com/watch?v=XHxbdRh4tI0',
    importance: {
      hindi: 'सबसे महत्वपूर्ण रोजगार योजना',
      hinglish: 'Most important employment scheme'
    },
    duration: '25 मिनट / 25 minutes'
  },
  {
    title: {
      hindi: 'ग्राम पंचायत के कार्यों का प्रशिक्षण',
      hinglish: 'Gram Panchayat Functions Training'
    },
    description: {
      hindi: 'ग्रामीण विकास विभाग द्वारा आधिकारिक प्रशिक्षण मॉड्यूल',
      hinglish: 'Official training module by Rural Development Department'
    },
    url: 'https://www.youtube.com/watch?v=DI_2pRLlbQE',
    importance: {
      hindi: 'आधिकारिक कार्यों की जानकारी',
      hinglish: 'Official duties and functions'
    },
    duration: '45 मिनट / 45 minutes'
  },
  {
    title: {
      hindi: 'पीएफएमएस पोर्टल पर पेमेंट प्रक्रिया',
      hinglish: 'PFMS Portal Payment Process'
    },
    description: {
      hindi: 'सभी सरकारी योजनाओं के लिए पीएफएमएस पर भुगतान प्रक्रिया',
      hinglish: 'Payment process on PFMS for all government schemes'
    },
    url: 'https://www.youtube.com/watch?v=3xukYeRPDlg',
    importance: {
      hindi: 'वित्तीय प्रबंधन जरूरी',
      hinglish: 'Essential financial management'
    },
    duration: '35 मिनट / 35 minutes'
  },
  {
    title: {
      hindi: 'प्रधानमंत्री आवास योजना का क्रियान्वयन',
      hinglish: 'PM Awas Yojana Implementation'
    },
    description: {
      hindi: 'प्रधानमंत्री आवास योजना की पूरी प्रक्रिया और लाभार्थी चयन',
      hinglish: 'Complete PM Awas Yojana process and beneficiary selection'
    },
    url: 'https://www.youtube.com/watch?v=K8VFmGd7h6c',
    importance: {
      hindi: 'आवास योजना का सही प्रबंधन',
      hinglish: 'Proper housing scheme management'
    },
    duration: '30 मिनट / 30 minutes'
  },
  {
    title: {
      hindi: 'स्वच्छ भारत मिशन - ग्रामीण कार्यान्वयन',
      hinglish: 'Swachh Bharat Mission - Rural Implementation'
    },
    description: {
      hindi: 'स्वच्छता अभियान का सफल क्रियान्वयन और ODF प्राप्ति',
      hinglish: 'Successful sanitation campaign implementation and ODF achievement'
    },
    url: 'https://www.youtube.com/watch?v=9wHlyKlS5C4',
    importance: {
      hindi: 'स्वच्छता मिशन जरूरी',
      hinglish: 'Essential sanitation mission'
    },
    duration: '28 मिनट / 28 minutes'
  },
  {
    title: {
      hindi: 'ग्राम सभा की बैठक कैसे करें',
      hinglish: 'Gram Sabha Meeting kaise kare'
    },
    description: {
      hindi: 'प्रभावी ग्राम सभा बैठक आयोजन और निर्णय प्रक्रिया',
      hinglish: 'Effective Gram Sabha meeting organization and decision process'
    },
    url: 'https://www.youtube.com/watch?v=mT8B7gkq2nQ',
    importance: {
      hindi: 'लोकतांत्रिक प्रक्रिया की आधारशिला',
      hinglish: 'Foundation of democratic process'
    },
    duration: '22 मिनट / 22 minutes'
  },
  {
    title: {
      hindi: 'जल जीवन मिशन - पानी कनेक्शन प्रक्रिया',
      hinglish: 'Jal Jeevan Mission - Water Connection Process'
    },
    description: {
      hindi: 'हर घर नल का जल योजना का क्रियान्वयन और प्रबंधन',
      hinglish: 'Har Ghar Nal Ka Jal scheme implementation and management'
    },
    url: 'https://www.youtube.com/watch?v=7RG5vF3zKL0',
    importance: {
      hindi: 'जल आपूर्ति योजना महत्वपूर्ण',
      hinglish: 'Critical water supply scheme'
    },
    duration: '26 मिनट / 26 minutes'
  },
  {
    title: {
      hindi: 'डिजिटल इंडिया - ग्राम पंचायत में तकनीक',
      hinglish: 'Digital India - Technology in Gram Panchayat'
    },
    description: {
      hindi: 'डिजिटल सेवाओं और ऑनलाइन प्रक्रियाओं का उपयोग',
      hinglish: 'Using digital services and online processes effectively'
    },
    url: 'https://www.youtube.com/watch?v=R4vBqF8jY2M',
    importance: {
      hindi: 'आधुनिक प्रशासन जरूरी',
      hinglish: 'Essential modern administration'
    },
    duration: '20 मिनट / 20 minutes'
  },
  {
    title: {
      hindi: 'सरपंच की सफलता की कहानी',
      hinglish: 'Successful Sarpanch Success Story'
    },
    description: {
      hindi: 'पुरस्कार प्राप्त सरपंच के अनुभव और उपलब्धियां',
      hinglish: 'Award-winning sarpanch experiences and achievements'
    },
    url: 'https://www.youtube.com/watch?v=xZF0GAkIPv8',
    importance: {
      hindi: 'प्रेरणा और व्यावहारिक सुझाव',
      hinglish: 'Inspiration and practical tips'
    },
    duration: '18 मिनट / 18 minutes'
  }
];

export default function ImportantVideosPage() {
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
      <div className="hidden lg:block desktop-layout">
        <div className="chat-desktop">
          {/* Sidebar */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-emerald-600 mb-2">{t('appTitle')}</h1>
              <p className="text-gray-600 text-sm">{t('appSubtitle')}</p>
            </div>
            
            <Button
              onClick={toggleLanguage}
              variant="outline"
              className="w-full mb-4 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
            >
              <Globe className="w-4 h-4 mr-2" />
              {getLanguageButtonText()}
            </Button>

            <div className="space-y-3">
              <Link to="/" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <Home className="w-5 h-5 mr-3 text-gray-500" />
                <span className="text-gray-700">{t('home')}</span>
              </Link>
              
              <Link to="/chat" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <MessageCircle className="w-5 h-5 mr-3 text-gray-500" />
                <span className="text-gray-700">{t('chat')}</span>
              </Link>
              
              <Link to="/voice-agent" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <Mic className="w-5 h-5 mr-3 text-gray-500" />
                <span className="text-gray-700">{t('voice')}</span>
              </Link>

              <Link to="/circulars" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <LinkIcon className="w-5 h-5 mr-3 text-gray-500" />
                <span className="text-gray-700">
                  {language === 'hindi' ? 'सरकारी परिपत्र' : 'Government Circulars'}
                </span>
              </Link>

              <Link to="/document" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <FileText className="w-5 h-5 mr-3 text-gray-500" />
                <span className="text-gray-700">{t('documentAnalysis')}</span>
              </Link>

              <Link to="/academy" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <GraduationCap className="w-5 h-5 mr-3 text-gray-500" />
                <span className="text-gray-700">
                  {language === 'hindi' ? 'सरपंच अकादमी' : 'Sarpanch Academy'}
                </span>
              </Link>

              <Link to="/glossary" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <BookOpen className="w-5 h-5 mr-3 text-gray-500" />
                <span className="text-gray-700">
                  {language === 'hindi' ? 'शब्दकोश' : 'Glossary'}
                </span>
              </Link>

              <div className="flex items-center p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <PlayCircle className="w-5 h-5 mr-3 text-emerald-600" />
                <span className="text-emerald-700 font-medium">
                  {language === 'hindi' ? 'महत्वपूर्ण वीडियो' : 'Important Videos'}
                </span>
              </div>
            </div>
          </div>

          {/* Main Videos Area */}
          <div className="chat-main-desktop">
            <div className="flex-1 overflow-y-auto p-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-emerald-600 mb-4">
                  {language === 'hindi' ? '📹 सरपंच के लिए जरूरी वीडियो' : '📹 Essential Videos for Sarpanch'}
                </h2>
                <p className="text-gray-600">
                  {language === 'hindi' 
                    ? 'एक सफल सरपंच बनने के लिए सबसे आवश्यक 10 वीडियो'
                    : 'Top 10 most essential videos to become a successful sarpanch'
                  }
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
                {essentialVideos.map((video, index) => (
                  <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-emerald-100 p-3 rounded-full flex-shrink-0">
                          <PlayCircle className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div className="bg-emerald-500 text-white px-2 py-1 rounded text-xs font-bold">
                              #{index + 1}
                            </div>
                            <span className="text-emerald-600 text-sm font-medium">
                              {video.duration}
                            </span>
                          </div>
                          <h3 className="font-bold text-gray-800 mb-2 text-lg">
                            {video.title[language]}
                          </h3>
                          <p className="text-gray-600 text-sm mb-3">
                            {video.description[language]}
                          </p>
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                            <p className="text-yellow-800 text-sm font-medium">
                              <span className="font-bold">
                                {language === 'hindi' ? '📌 क्यों जरूरी: ' : '📌 Why Important: '}
                              </span>
                              {video.importance[language]}
                            </p>
                          </div>
                          <Button
                            onClick={() => window.open(video.url, '_blank')}
                            className="w-full primary-button"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            {language === 'hindi' ? 'अभी देखें' : 'Watch Now'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            {/* Desktop Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200">
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
      <div className="lg:hidden flex flex-col h-screen">
        {/* Mobile Header */}
        <header className="bg-white border-b border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <div>
              <h1 className="text-lg font-bold text-emerald-600">
                {language === 'hindi' ? 'जरूरी वीडियो' : 'Important Videos'}
              </h1>
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

        {/* Mobile Content */}
        <main className="flex-1 overflow-y-auto bg-white mobile-padding">
          <div className="max-w-md mx-auto p-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-emerald-600 mb-2">
                {language === 'hindi' ? '📹 टॉप 10 वीडियो' : '📹 Top 10 Videos'}
              </h2>
              <p className="text-gray-600 text-sm">
                {language === 'hindi' 
                  ? 'सरपंच बनने के लिए सबसे जरूरी वीडियो'
                  : 'Most essential videos for sarpanch'
                }
              </p>
            </div>

            <div className="space-y-4">
              {essentialVideos.map((video, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-emerald-100 p-2 rounded-full">
                        <PlayCircle className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="bg-emerald-500 text-white px-2 py-1 rounded text-xs font-bold">
                            #{index + 1}
                          </div>
                          <span className="text-emerald-600 text-xs">
                            {video.duration}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-800 text-sm mb-1">
                          {video.title[language]}
                        </h3>
                        <p className="text-gray-600 text-xs mb-2">
                          {video.importance[language]}
                        </p>
                        <Button
                          onClick={() => window.open(video.url, '_blank')}
                          size="sm"
                          className="w-full primary-button"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          {language === 'hindi' ? 'देखें' : 'Watch'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>

        {/* Mobile Footer */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 px-6 py-4 text-center mb-16">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-xs text-gray-600 font-medium tracking-wide">
              Built by Futurelab Ikigai and Piramal Foundation © 2025
            </p>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
          <div className="grid grid-cols-4 gap-1 p-2 max-w-md mx-auto">
            <Link 
              to="/" 
              className="flex flex-col items-center py-2 px-1 rounded-lg transition-all text-gray-500 hover:bg-gray-50"
            >
              <Home size={18} />
              <span className="text-xs mt-1 font-medium text-center">{t('home')}</span>
            </Link>
            
            <Link 
              to="/chat" 
              className="flex flex-col items-center py-2 px-1 rounded-lg transition-all text-gray-500 hover:bg-gray-50"
            >
              <MessageCircle size={18} />
              <span className="text-xs mt-1 font-medium text-center">{t('chat')}</span>
            </Link>
            
            <Link 
              to="/voice-agent" 
              className="flex flex-col items-center py-2 px-1 rounded-lg transition-all text-gray-500 hover:bg-gray-50"
            >
              <Mic size={18} />
              <span className="text-xs mt-1 font-medium text-center">{t('voice')}</span>
            </Link>

            <Link 
              to="/circulars" 
              className="flex flex-col items-center py-2 px-1 rounded-lg transition-all text-gray-500 hover:bg-gray-50"
            >
              <LinkIcon size={18} />
              <span className="text-xs mt-1 font-medium text-center">
                {language === 'hindi' ? 'परिपत्र' : 'Circulars'}
              </span>
            </Link>

            <Link 
              to="/document" 
              className="flex flex-col items-center py-2 px-1 rounded-lg transition-all text-gray-500 hover:bg-gray-50"
            >
              <FileText size={18} />
              <span className="text-xs mt-1 font-medium text-center">
                {language === 'hindi' ? 'दस्तावेज़' : 'Document'}
              </span>
            </Link>

            <Link 
              to="/academy" 
              className="flex flex-col items-center py-2 px-1 rounded-lg transition-all text-gray-500 hover:bg-gray-50"
            >
              <GraduationCap size={18} />
              <span className="text-xs mt-1 font-medium text-center">
                {language === 'hindi' ? 'अकादमी' : 'Academy'}
              </span>
            </Link>

            <Link 
              to="/glossary" 
              className="flex flex-col items-center py-2 px-1 rounded-lg transition-all text-gray-500 hover:bg-gray-50"
            >
              <BookOpen size={18} />
              <span className="text-xs mt-1 font-medium text-center">
                {language === 'hindi' ? 'शब्दकोश' : 'Glossary'}
              </span>
            </Link>

            <div className="bg-emerald-50 border border-emerald-200 flex flex-col items-center py-2 px-1 rounded-lg">
              <PlayCircle size={18} className="text-emerald-600" />
              <span className="text-xs mt-1 font-medium text-emerald-700 text-center">
                {language === 'hindi' ? 'वीडियो' : 'Videos'}
              </span>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
} 