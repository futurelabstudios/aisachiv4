import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, MessageCircle, Mic, Globe, FileText, Link as LinkIcon, GraduationCap, PlayCircle, ExternalLink, BookOpen } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";

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
    <MainLayout>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-emerald-600 mb-4">
            {language === "hindi"
              ? "📹 सरपंच के लिए जरूरी वीडियो"
              : "📹 Essential Videos for Sarpanch"}
          </h2>
          <p className="text-gray-600">
            {language === "hindi"
              ? "एक सफल सरपंच बनने के लिए सबसे आवश्यक 10 वीडियो"
              : "Top 10 most essential videos to become a successful sarpanch"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {essentialVideos.map((video, index) => (
            <Card
              key={index}
              className="hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
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
                          {language === "hindi"
                            ? "📌 क्यों जरूरी: "
                            : "📌 Why Important: "}
                        </span>
                        {video.importance[language]}
                      </p>
                    </div>
                    <Button
                      onClick={() => window.open(video.url, "_blank")}
                      className="w-full primary-button"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {language === "hindi" ? "अभी देखें" : "Watch Now"}
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
    </MainLayout>
  );
} 