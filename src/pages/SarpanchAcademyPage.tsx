import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, BookOpen, PlayCircle, Home, MessageCircle, Mic, Globe, FileText, Link as LinkIcon, GraduationCap, Volume2, VolumeX, Search, Filter, Star, Clock, Users, Award, Lightbulb, Target, TrendingUp, Zap, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link, useLocation } from "react-router-dom";

interface Module {
  id: number;
  title: {
    hindi: string;
    hinglish: string;
  };
  emoji: string;
  color: string;
  description: {
    hindi: string;
    hinglish: string;
  };
  content: {
    hindi: string[];
    hinglish: string[];
  };
}

const trainingModules: Module[] = [
  {
    id: 1,
    emoji: "🎯",
    color: "emerald",
    title: {
      hindi: 'सरपंच के मुख्य काम',
      hinglish: 'Sarpanch ke Main Kaam'
    },
    description: {
      hindi: 'आपकी जिम्मेदारियां और दैनिक कार्य',
      hinglish: 'Aapki responsibilities aur daily tasks'
    },
    content: {
      hindi: [
        'महीने में कम से कम 2 ग्राम पंचायत की बैठक करना',
        'गांव की समस्याओं को सुनना और हल करना',
        'सभी वर्गों के लोगों की बात सुनना',
        'ग्राम सभा की बैठक साल में 4 बार करना',
        'गांव के विकास के लिए योजना बनाना',
        'शिकायतों का जल्दी समाधान करना',
        'सभी के साथ निष्पक्ष व्यवहार करना'
      ],
      hinglish: [
        'Mahine mein kam se kam 2 Gram Panchayat meetings karna',
        'Gaon ki problems sunna aur solve karna',
        'Sabhi sections ke logo ki baat sunna',
        'Gram Sabha meeting saal mein 4 baar karna',
        'Gaon ke development ke liye plan banana',
        'Complaints ka jaldi solution karna',
        'Sabhi ke saath fair treatment karna'
      ]
    }
  },
  {
    id: 2,
    emoji: "🏛️",
    color: "blue",
    title: {
      hindi: 'सरकारी योजनाएं चलाना',
      hinglish: 'Government Schemes Chalana'
    },
    description: {
      hindi: 'मुख्य सरकारी योजनाओं को सही तरीके से लागू करना',
      hinglish: 'Important government schemes ko sahi tarike se implement karna'
    },
    content: {
      hindi: [
        'मनरेगा में काम देना और पेमेंट कराना',
        'प्रधानमंत्री आवास योजना में घर बनवाना',
        'शौचालय बनवाना (स्वच्छ भारत मिशन)',
        'बच्चों की पढ़ाई के लिए स्कॉलरशिप दिलवाना',
        'पेंशन योजनाओं में नाम जुड़वाना',
        'राशन कार्ड और अन्य दस्तावेज बनवाना',
        'गरीब परिवारों को योजनाओं का लाभ दिलवाना'
      ],
      hinglish: [
        'MGNREGA mein kaam dena aur payment karana',
        'PM Awas Yojana mein ghar banwana',
        'Toilet banwana (Swachh Bharat Mission)',
        'Baccho ki padhai ke liye scholarship dilwana',
        'Pension schemes mein naam judwana',
        'Ration card aur documents banwana',
        'Gareeb families ko schemes ka fayda dilwana'
      ]
    }
  },
  {
    id: 3,
    emoji: "💰",
    color: "yellow",
    title: {
      hindi: 'पैसे का हिसाब-किताब',
      hinglish: 'Paise ka Hisab-Kitab'
    },
    description: {
      hindi: 'ग्राम पंचायत के पैसे को सही तरीके से खर्च करना',
      hinglish: 'Gram Panchayat ke paise ko sahi tarike se spend karna'
    },
    content: {
      hindi: [
        'साल का बजट बनाना - कितना पैसा कहां खर्च होगा',
        'हर खर्च की रसीद रखना',
        'बैंक खाते की जांच नियमित करना',
        'योजनाओं का पैसा सही जगह खर्च करना',
        'गांव वालों को बताना कि पैसा कहां खर्च हुआ',
        'कोई भी खर्च छुपाना नहीं',
        'ऑडिट के लिए सभी कागजात तैयार रखना'
      ],
      hinglish: [
        'Saal ka budget banana - kitna paisa kaha spend hoga',
        'Har expense ki receipt rakhna',
        'Bank account ki checking regular karna',
        'Schemes ka paisa sahi jagah spend karna',
        'Gaon walo ko batana ki paisa kaha spend hua',
        'Koi bhi expense chupana nahi',
        'Audit ke liye sabhi papers ready rakhna'
      ]
    }
  },
  {
    id: 4,
    emoji: "👥",
    color: "purple",
    title: {
      hindi: 'लोगों के साथ अच्छे रिश्ते',
      hinglish: 'Logo ke saath Acche Rishte'
    },
    description: {
      hindi: 'गांव में एकता बनाना और सबको साथ लेकर चलना',
      hinglish: 'Gaon mein unity banana aur sabko saath lekar chalna'
    },
    content: {
      hindi: [
        'सभी जाति-धर्म के लोगों के साथ बराबरी का व्यवहार',
        'महिलाओं और युवाओं को काम में भागीदारी देना',
        'झगड़ों को प्यार से सुलझाना',
        'गांव की परंपराओं का सम्मान करना',
        'नशे और अपराध को रोकना',
        'त्योहारों और कार्यक्रमों में सभी को शामिल करना',
        'गांव के बुजुर्गों की सलाह लेना'
      ],
      hinglish: [
        'Sabhi caste-religion ke logo ke saath equal treatment',
        'Women aur youth ko kaam mein participation dena',
        'Fights ko pyaar se solve karna',
        'Gaon ki traditions ka respect karna',
        'Nasha aur crime ko rokna',
        'Festivals aur programs mein sabko include karna',
        'Gaon ke elders ki advice lena'
      ]
    }
  },
  {
    id: 5,
    emoji: "📋",
    color: "indigo",
    title: {
      hindi: 'कागजात और रिकॉर्ड रखना',
      hinglish: 'Papers aur Records Rakhna'
    },
    description: {
      hindi: 'जरूरी दस्तावेजों को व्यवस्थित रखना',
      hinglish: 'Important documents ko systematic rakhna'
    },
    content: {
      hindi: [
        'बैठकों का रिकॉर्ड लिखना और रखना',
        'जन्म-मृत्यु प्रमाणपत्र बनाना',
        'जाति-आय प्रमाणपत्र जारी करना',
        'सभी योजनाओं की फाइल अलग रखना',
        'गांव की जनसंख्या की जानकारी रखना',
        'सभी कागजात सुरक्षित स्थान पर रखना',
        'जरूरत पड़ने पर तुरंत कागजात निकालना'
      ],
      hinglish: [
        'Meetings ka record likhna aur rakhna',
        'Birth-death certificate banana',
        'Caste-income certificate issue karna',
        'Sabhi schemes ki file alag rakhna',
        'Gaon ki population ki information rakhna',
        'Sabhi papers safe place par rakhna',
        'Jarurat padne par turant papers nikalna'
      ]
         }
   },
   {
     id: 6,
     emoji: "💻",
     color: "cyan",
     title: {
       hindi: 'डिजिटल सेवा और ऑनलाइन काम',
       hinglish: 'Digital Service aur Online Kaam'
     },
     description: {
       hindi: 'कंप्यूटर और मोबाइल से सरकारी काम करना',
       hinglish: 'Computer aur mobile se government kaam karna'
     },
     content: {
       hindi: [
         'ई-ग्राम स्वराज पोर्टल का उपयोग करना',
         'PFMS (Public Financial Management System) पर पेमेंट करना',
         'योजनाओं की ऑनलाइन मॉनिटरिंग करना',
         'डिजिटल फॉर्म भरना और जमा करना',
         'ऑनलाइन रिपोर्ट तैयार करना',
         'वीडियो कॉल से मीटिंग करना',
         'मोबाइल ऐप से काम की जांच करना'
       ],
       hinglish: [
         'e-Gram Swaraj portal ka use karna',
         'PFMS (Public Financial Management System) par payment karna',
         'Schemes ki online monitoring karna',
         'Digital forms bharna aur submit karna',
         'Online reports taiyar karna',
         'Video call se meetings karna',
         'Mobile apps se kaam ki checking karna'
       ]
     }
   }
 ];

export default function SarpanchAcademyPage() {
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");

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

  // Module categories for better organization
  const moduleCategories = [
    { id: "all", name: { hindi: "सभी मॉड्यूल", hinglish: "All Modules" }, icon: BookOpen },
    { id: "basics", name: { hindi: "बुनियादी बातें", hinglish: "Basics" }, icon: Target },
    { id: "admin", name: { hindi: "प्रशासन", hinglish: "Administration" }, icon: Award },
    { id: "schemes", name: { hindi: "योजनाएं", hinglish: "Schemes" }, icon: TrendingUp },
    { id: "finance", name: { hindi: "वित्त", hinglish: "Finance" }, icon: Star },
    { id: "leadership", name: { hindi: "नेतृत्व", hinglish: "Leadership" }, icon: Zap }
  ];

  const difficultyLevels = [
    { id: "all", name: { hindi: "सभी स्तर", hinglish: "All Levels" } },
    { id: "beginner", name: { hindi: "शुरुआती", hinglish: "Beginner" } },
    { id: "intermediate", name: { hindi: "मध्यम", hinglish: "Intermediate" } },
    { id: "advanced", name: { hindi: "उन्नत", hinglish: "Advanced" } }
  ];

  // Filter modules based on search and category
  const filteredModules = trainingModules.filter(module => {
    const matchesSearch = module.title[language].toLowerCase().includes(searchQuery.toLowerCase()) ||
                         module.description[language].toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || module.color === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "all" || module.color === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Text-to-Speech functionality with Indian accent
  const startReading = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      
      utterance.lang = language === 'hindi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      
      const voices = window.speechSynthesis.getVoices();
      const indianVoice = voices.find(voice => 
        voice.lang === 'en-IN' || 
        voice.name.includes('Indian') || 
        voice.name.includes('India') ||
        (language === 'hindi' && voice.lang === 'hi-IN')
      );
      
      if (indianVoice) {
        utterance.voice = indianVoice;
      }
      
      utterance.onstart = () => setIsReading(true);
      utterance.onend = () => setIsReading(false);
      utterance.onerror = () => setIsReading(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopReading = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsReading(false);
    }
  };

  const toggleReading = (text: string) => {
    if (isReading) {
      stopReading();
    } else {
      startReading(text);
    }
  };

  const selectedModuleData = selectedModule ? trainingModules.find(m => m.id === selectedModule) : null;

  const getColorClasses = (color: string) => {
    switch(color) {
      case 'emerald': return 'from-emerald-400 to-emerald-600 border-emerald-200 bg-emerald-50';
      case 'blue': return 'from-blue-400 to-blue-600 border-blue-200 bg-blue-50';
      case 'yellow': return 'from-yellow-400 to-yellow-600 border-yellow-200 bg-yellow-50';
      case 'purple': return 'from-purple-400 to-purple-600 border-purple-200 bg-purple-50';
      case 'indigo': return 'from-indigo-400 to-indigo-600 border-indigo-200 bg-indigo-50';
      case 'cyan': return 'from-cyan-400 to-cyan-600 border-cyan-200 bg-cyan-50';
      default: return 'from-gray-400 to-gray-600 border-gray-200 bg-gray-50';
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

              <div className="flex items-center p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <GraduationCap className="w-5 h-5 mr-3 text-emerald-600" />
                <span className="text-emerald-700 font-medium">
                  {language === 'hindi' ? 'सरपंच अकादमी' : 'Sarpanch Academy'}
                </span>
              </div>

              <Link to="/glossary" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <BookOpen className="w-5 h-5 mr-3 text-gray-500" />
                <span className="text-gray-700">
                  {language === 'hindi' ? 'शब्दकोश' : 'Glossary'}
                </span>
              </Link>

              <Link to="/videos" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <PlayCircle className="w-5 h-5 mr-3 text-gray-500" />
                <span className="text-gray-700">
                  {language === 'hindi' ? 'महत्वपूर्ण वीडियो' : 'Important Videos'}
                </span>
              </Link>
            </div>
          </div>

          {/* Main Academy Area */}
          <div className="chat-main-desktop">
            <div className="flex-1 overflow-y-auto p-6">
              {!selectedModule ? (
                // Simple and Beautiful Module Selection
                <div>
                  <div className="text-center mb-12">
                    <div className="text-8xl mb-6">🎓</div>
                    <h2 className="text-4xl font-bold text-emerald-600 mb-4">
                      {language === 'hindi' ? 'सरपंच अकादमी' : 'Sarpanch Academy'}
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                      {language === 'hindi' 
                        ? 'सफल सरपंच बनने के लिए 6 आसान मॉड्यूल सीखें'
                        : 'Learn 6 easy modules to become a successful sarpanch'
                      }
                    </p>
                  </div>

                  {/* Beautiful Training Modules */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {trainingModules.map((module) => (
                      <Card 
                        key={module.id}
                        className="cursor-pointer hover:shadow-2xl transition-all duration-500 hover:scale-105 border-0 overflow-hidden group"
                        onClick={() => setSelectedModule(module.id)}
                      >
                        <div className={`h-2 bg-gradient-to-r ${getColorClasses(module.color).split(' ')[0]} ${getColorClasses(module.color).split(' ')[1]} ${getColorClasses(module.color).split(' ')[2]}`}></div>
                        <CardContent className="p-6 text-center">
                          <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                            {module.emoji}
                          </div>
                          <div className="bg-gray-100 text-gray-600 text-sm font-bold px-3 py-1 rounded-full inline-block mb-3">
                            {language === 'hindi' ? 'मॉड्यूल' : 'Module'} {module.id}
                          </div>
                          <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-emerald-600 transition-colors">
                            {module.title[language]}
                          </h3>
                          <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                            {module.description[language]}
                          </p>
                          <div className="flex items-center justify-center text-emerald-600 font-medium group-hover:text-emerald-700">
                            <BookOpen className="w-4 h-4 mr-2" />
                            {language === 'hindi' ? 'सीखना शुरू करें' : 'Start Learning'}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Motivational Section */}
                  <div className="text-center mt-16">
                    <Card className="max-w-3xl mx-auto bg-gradient-to-r from-emerald-500 to-blue-500 text-white border-0">
                      <CardContent className="p-8">
                        <div className="text-4xl mb-4">✨</div>
                        <h3 className="text-2xl font-bold mb-4">
                          {language === 'hindi' ? 'आप एक बेहतरीन सरपंच बन सकते हैं!' : 'You can become an excellent sarpanch!'}
                        </h3>
                                                 <p className="text-lg opacity-90">
                           {language === 'hindi' 
                             ? 'ये 6 मॉड्यूल आपको सब कुछ सिखाएंगे जो एक सफल सरपंच को जानना चाहिए'
                             : 'These 6 modules will teach you everything a successful sarpanch needs to know'
                           }
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                // Simple and Clear Module Content
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <Button
                      onClick={() => setSelectedModule(null)}
                      variant="outline"
                      className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      {language === 'hindi' ? 'वापस जाएं' : 'Go Back'}
                    </Button>
                    <Button
                      onClick={() => {
                        if (selectedModuleData) {
                          const fullText = `${selectedModuleData.title[language]}. ${selectedModuleData.content[language].join('. ')}`;
                          toggleReading(fullText);
                        }
                      }}
                      variant="outline"
                      className="border-blue-200 text-blue-600 hover:bg-blue-50"
                    >
                      {isReading ? <VolumeX className="w-4 h-4 mr-2" /> : <Volume2 className="w-4 h-4 mr-2" />}
                      {isReading 
                        ? (language === 'hindi' ? 'रोकें' : 'Stop') 
                        : (language === 'hindi' ? 'सुनें' : 'Listen')
                      }
                    </Button>
                  </div>

                  {selectedModuleData && (
                    <div className="max-w-4xl mx-auto">
                      {/* Module Header */}
                      <div className="text-center mb-12">
                        <div className="text-8xl mb-6">{selectedModuleData.emoji}</div>
                        <div className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">
                          {language === 'hindi' ? 'मॉड्यूल' : 'Module'} {selectedModuleData.id}
                        </div>
                        <h2 className="text-4xl font-bold text-emerald-600 mb-4">
                          {selectedModuleData.title[language]}
                        </h2>
                        <p className="text-xl text-gray-600">
                          {selectedModuleData.description[language]}
                        </p>
                      </div>

                      {/* Simple Content List */}
                      <Card className="border-l-4 border-l-emerald-500 shadow-lg">
                        <CardHeader className="bg-emerald-50">
                          <CardTitle className="text-emerald-600 text-xl">
                            {language === 'hindi' ? '📚 आपको ये सब सीखना है:' : '📚 You need to learn all this:'}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="space-y-0">
                            {selectedModuleData.content[language].map((point, index) => (
                              <div key={index} className="flex items-start gap-4 p-6 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                                <div className="bg-emerald-100 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-emerald-600 font-bold">{index + 1}</span>
                                </div>
                                <div className="flex-1">
                                  <p className="text-gray-800 text-lg leading-relaxed">
                                    {point}
                                  </p>
                                </div>
                                <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-1" />
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Encouragement */}
                      <div className="text-center mt-12">
                        <Card className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0">
                          <CardContent className="p-6">
                            <div className="text-3xl mb-3">🌟</div>
                            <h3 className="font-bold mb-2">
                              {language === 'hindi' ? 'बहुत बढ़िया!' : 'Very Good!'}
                            </h3>
                            <p className="text-sm opacity-90">
                              {language === 'hindi' 
                                ? 'अब आप एक्सपर्ट हो गए!'
                                : 'Now you are an expert!'
                              }
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout - Simple and Clean */}
      <div className="lg:hidden flex flex-col h-screen">
        {/* Mobile Header */}
        <header className="bg-white border-b border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <div className="flex items-center gap-2">
              {selectedModule && (
                <Button
                  onClick={() => setSelectedModule(null)}
                  variant="outline"
                  size="sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              <div>
                <h1 className="text-lg font-bold text-emerald-600">
                  🎓 {language === 'hindi' ? 'सरपंच अकादमी' : 'Sarpanch Academy'}
                </h1>
                <p className="text-xs text-gray-500">{t('appSubtitle')}</p>
              </div>
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
            {!selectedModule ? (
              <div>
                <div className="text-center mb-8">
                  <div className="text-6xl mb-4">🎓</div>
                  <h2 className="text-2xl font-bold text-emerald-600 mb-3">
                    {language === 'hindi' ? 'सरपंच अकादमी' : 'Sarpanch Academy'}
                  </h2>
                                     <p className="text-gray-600 text-sm">
                     {language === 'hindi' 
                       ? '6 आसान मॉड्यूल सीखें'
                       : 'Learn 6 easy modules'
                     }
                  </p>
                </div>

                {/* Mobile Training Modules */}
                <div className="space-y-4">
                  {trainingModules.map((module) => (
                    <Card 
                      key={module.id}
                      className="cursor-pointer hover:shadow-lg transition-all duration-300 border-l-4 border-l-emerald-500"
                      onClick={() => setSelectedModule(module.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="text-3xl">{module.emoji}</div>
                          <div className="flex-1">
                            <div className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full inline-block mb-2">
                              {language === 'hindi' ? 'मॉड्यूल' : 'Module'} {module.id}
                            </div>
                            <h3 className="font-bold text-gray-800 text-sm mb-1">
                              {module.title[language]}
                            </h3>
                            <p className="text-gray-600 text-xs">
                              {module.description[language]}
                            </p>
                          </div>
                          <div className="text-emerald-600">
                            <BookOpen className="w-5 h-5" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Mobile Motivation */}
                <div className="mt-8">
                  <Card className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white border-0">
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl mb-2">✨</div>
                      <h3 className="font-bold mb-2">
                        {language === 'hindi' ? 'आप कर सकते हैं!' : 'You can do it!'}
                      </h3>
                                             <p className="text-sm opacity-90">
                         {language === 'hindi' 
                           ? 'ये 6 मॉड्यूल आपको सब कुछ सिखाएंगे'
                           : 'These 6 modules will teach you everything'
                         }
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              // Mobile Module Content
              <div>
                {selectedModuleData && (
                  <div>
                    <div className="text-center mb-6">
                      <div className="text-5xl mb-3">{selectedModuleData.emoji}</div>
                      <div className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full inline-block mb-3">
                        {language === 'hindi' ? 'मॉड्यूल' : 'Module'} {selectedModuleData.id}
                      </div>
                      <h2 className="text-xl font-bold text-emerald-600 mb-2">
                        {selectedModuleData.title[language]}
                      </h2>
                      <p className="text-gray-600 text-sm mb-4">
                        {selectedModuleData.description[language]}
                      </p>
                      <Button
                        onClick={() => {
                          if (selectedModuleData) {
                            const fullText = `${selectedModuleData.title[language]}. ${selectedModuleData.content[language].join('. ')}`;
                            toggleReading(fullText);
                          }
                        }}
                        variant="outline"
                        size="sm"
                        className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
                      >
                        {isReading ? <VolumeX className="w-4 h-4 mr-2" /> : <Volume2 className="w-4 h-4 mr-2" />}
                        {isReading 
                          ? (language === 'hindi' ? 'रोकें' : 'Stop') 
                          : (language === 'hindi' ? 'सुनें' : 'Listen')
                        }
                      </Button>
                    </div>

                    {/* Mobile Simple Content */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold text-emerald-600 mb-3">
                        📚 {language === 'hindi' ? 'आपको ये सब सीखना है:' : 'You need to learn all this:'}
                      </h3>
                      {selectedModuleData.content[language].map((point, index) => (
                        <div key={index} className="flex items-start gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                          <div className="bg-emerald-100 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-emerald-600 text-sm font-bold">{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-800 text-sm leading-relaxed">
                              {point}
                            </p>
                          </div>
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-1" />
                        </div>
                      ))}
                    </div>

                    {/* Mobile Encouragement */}
                    <div className="mt-6">
                      <Card className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl mb-2">🌟</div>
                          <h3 className="font-bold mb-1">
                            {language === 'hindi' ? 'बहुत बढ़िया!' : 'Very Good!'}
                          </h3>
                          <p className="text-sm opacity-90">
                            {language === 'hindi' 
                              ? 'अब आप एक्सपर्ट हो गए!'
                              : 'Now you are an expert!'
                            }
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        {/* Mobile Navigation */}
        <nav className="nav-item fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-3 z-50">
          <div className="flex justify-center items-center space-x-1 max-w-md mx-auto">
            <Link to="/" className="nav-item flex flex-col items-center p-1 rounded-xl transition-all text-gray-500 hover:text-emerald-600">
              <Home size={14} />
              <span className="text-xs mt-1 font-medium">{t('home')}</span>
            </Link>
            
            <Link to="/chat" className="nav-item flex flex-col items-center p-1 rounded-xl transition-all text-gray-500 hover:text-emerald-600">
              <MessageCircle size={14} />
              <span className="text-xs mt-1 font-medium">{t('chat')}</span>
            </Link>
            
            <Link to="/voice-agent" className="nav-item flex flex-col items-center p-1 rounded-xl transition-all text-gray-500 hover:text-emerald-600">
              <Mic size={14} />
              <span className="text-xs mt-1 font-medium">{t('voice')}</span>
            </Link>

            <Link to="/circulars" className="nav-item flex flex-col items-center p-1 rounded-xl transition-all text-gray-500 hover:text-emerald-600">
              <LinkIcon size={14} />
              <span className="text-xs mt-1 font-medium">
                {language === 'hindi' ? 'परिपत्र' : 'Circulars'}
              </span>
            </Link>

            <Link to="/document" className="nav-item flex flex-col items-center p-1 rounded-xl transition-all text-gray-500 hover:text-emerald-600">
              <FileText size={14} />
              <span className="text-xs mt-1 font-medium">
                {language === 'hindi' ? 'दस्तावेज़' : 'Document'}
              </span>
            </Link>

            <div className="nav-item active flex flex-col items-center p-1 rounded-xl">
              <GraduationCap size={14} />
              <span className="text-xs mt-1 font-medium">
                {language === 'hindi' ? 'अकादमी' : 'Academy'}
              </span>
            </div>

            <Link to="/glossary" className="nav-item flex flex-col items-center p-1 rounded-xl transition-all text-gray-500 hover:text-emerald-600">
              <BookOpen size={14} />
              <span className="text-xs mt-1 font-medium">
                {language === 'hindi' ? 'शब्दकोश' : 'Glossary'}
              </span>
            </Link>

            <Link to="/videos" className="nav-item flex flex-col items-center p-1 rounded-xl transition-all text-gray-500 hover:text-emerald-600">
              <PlayCircle size={14} />
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