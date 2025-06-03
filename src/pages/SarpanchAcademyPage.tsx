import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen, CheckCircle, PlayCircle, Home, MessageCircle, Mic, Globe, FileText, Link as LinkIcon, GraduationCap, Volume2, VolumeX, ExternalLink } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link, useLocation } from "react-router-dom";

interface Module {
  id: number;
  title: {
    hindi: string;
    hinglish: string;
  };
  description: {
    hindi: string;
    hinglish: string;
  };
  content: {
    hindi: string[];
    hinglish: string[];
  };
  completed?: boolean;
}

const trainingModules: Module[] = [
  {
    id: 1,
    title: {
      hindi: 'सरपंच के मूलभूत कर्तव्य और जिम्मेदारियां',
      hinglish: 'Sarpanch ke Basic Duties aur Responsibilities'
    },
    description: {
      hindi: 'एक सरपंच के रूप में आपकी मुख्य जिम्मेदारियों को समझें और मास्टर करें',
      hinglish: 'Ek sarpanch ke roop mein aapki main responsibilities ko samjhe aur master kare'
    },
    content: {
      hindi: [
        'ग्राम पंचायत की बैठकों की अध्यक्षता करना - हर महीने कम से कम दो बैठकें',
        'गांव की समस्याओं का समाधान करना - प्राथमिकता के आधार पर',
        'सरकारी योजनाओं का सही क्रियान्वयन सुनिश्चित करना - मनरेगा, आवास, स्वच्छता',
        'ग्रामीणों की शिकायतों को सुनना और हल करना - निष्पक्ष तरीके से',
        'गांव के विकास कार्यों की निगरानी करना - गुणवत्ता और समय सीमा',
        'पारदर्शिता और जवाबदेही बनाए रखना - सभी कार्यों में',
        'ग्राम सभा की बैठकों का आयोजन करना - वर्ष में न्यूनतम 4 बैठकें',
        'सामाजिक न्याय और समानता सुनिश्चित करना',
        'महिलाओं और बच्चों के अधिकारों की सुरक्षा करना',
        'पर्यावरण संरक्षण में नेतृत्व प्रदान करना'
      ],
      hinglish: [
        'Gram Panchayat ki meetings ki adhyakshata karna - har mahine kam se kam do meetings',
        'Gaon ki problems ka solution karna - priority ke base par',
        'Government schemes ka sahi implementation ensure karna - MGNREGA, Awas, Swachhata',
        'Gramin logo ki complaints sunna aur solve karna - fair tarike se',
        'Gaon ke development works ki monitoring karna - quality aur time limit',
        'Transparency aur accountability maintain karna - sabhi kaam mein',
        'Gram Sabha ki meetings ka aayojan karna - saal mein minimum 4 meetings',
        'Social justice aur equality ensure karna',
        'Women aur children ke rights ki protection karna',
        'Environment conservation mein leadership provide karna'
      ]
    }
  },
  {
    id: 2,
    title: {
      hindi: 'ग्राम पंचायत प्रशासन और रिकॉर्ड रखरखाव',
      hinglish: 'Gram Panchayat Administration aur Record Keeping'
    },
    description: {
      hindi: 'सही प्रशासनिक प्रक्रियाओं और रिकॉर्ड रखरखाव में विशेषज्ञता प्राप्त करें',
      hinglish: 'Sahi administrative processes aur record keeping mein expertise hasil kare'
    },
    content: {
      hindi: [
        'ग्राम पंचायत के आवश्यक दस्तावेजों की जानकारी - व्यापक फाइलिंग सिस्टम',
        'बैठकों के कार्यवृत्त का रखरखाव - कानूनी आवश्यकताओं के अनुसार',
        'वित्तीय रिकॉर्ड और खातों का प्रबंधन - ऑडिट के लिए तैयार',
        'जन्म-मृत्यु प्रमाणपत्र की प्रक्रिया - ऑनलाइन और ऑफलाइन दोनों',
        'आय-जाति प्रमाणपत्र जारी करना - सत्यापन प्रक्रिया सहित',
        'डिजिटल रिकॉर्ड का महत्व - ई-गवर्नेंस एप्लीकेशन का उपयोग',
        'सूचना का अधिकार (RTI) का अनुपालन - 30 दिन की समय सीमा',
        'ग्राम पंचायत विकास योजना (GPDP) का निर्माण',
        'सामाजिक लेखा परीक्षा (Social Audit) की तैयारी',
        'डेटा बैकअप और सुरक्षा प्रोटोकॉल'
      ],
      hinglish: [
        'Gram Panchayat ke essential documents ki jaankari - comprehensive filing system',
        'Meetings ke karyavritt ka rakhrakhaav - legal requirements ke according',
        'Financial records aur accounts ka management - audit ke liye ready',
        'Janam-mrityu certificate ki process - online aur offline dono',
        'Income-caste certificate issue karna - verification process ke saath',
        'Digital records ka importance - e-governance applications ka use',
        'Right to Information (RTI) ka compliance - 30 din ki time limit',
        'Gram Panchayat Development Plan (GPDP) ka formation',
        'Social Audit ki preparation',
        'Data backup aur security protocols'
      ]
    }
  },
  {
    id: 3,
    title: {
      hindi: 'सरकारी योजनाएं और उनका क्रियान्वयन',
      hinglish: 'Government Schemes aur unka Implementation'
    },
    description: {
      hindi: 'प्रमुख सरकारी योजनाओं को समझें और उन्हें सफलतापूर्वक लागू करें',
      hinglish: 'Major government schemes ko samjhe aur unhe successfully implement kare'
    },
    content: {
      hindi: [
        'महात्मा गांधी नरेगा योजना का संचालन',
        'प्रधानमंत्री आवास योजना की जानकारी',
        'स्वच्छ भारत मिशन का क्रियान्वयन',
        'पीएम किसान सम्मान निधि योजना',
        'आयुष्मान भारत योजना की जानकारी',
        'बेटी बचाओ बेटी पढ़ाओ योजना',
        'योजनाओं के लाभार्थियों की पहचान और चयन'
      ],
      hinglish: [
        'Mahatma Gandhi NREGA scheme ka sanchaalan',
        'Pradhan Mantri Awas Yojana ki jaankari',
        'Swachh Bharat Mission ka implementation',
        'PM Kisan Samman Nidhi Yojana',
        'Ayushman Bharat Yojana ki jaankari',
        'Beti Bachao Beti Padhao Yojana',
        'Schemes ke beneficiaries ki pehchaan aur selection'
      ]
    }
  },
  {
    id: 4,
    title: {
      hindi: 'वित्तीय प्रबंधन और बजट नियोजन',
      hinglish: 'Financial Management aur Budget Planning'
    },
    description: {
      hindi: 'ग्राम पंचायत के वित्त का सही प्रबंधन और बजट बनाना सीखें',
      hinglish: 'Gram Panchayat ke finance ka sahi management aur budget banana sikhe'
    },
    content: {
      hindi: [
        'ग्राम पंचायत के आय के स्रोत',
        'वार्षिक बजट तैयार करना',
        'खर्चों की निगरानी और नियंत्रण',
        'लेखा-जोखा और ऑडिट की प्रक्रिया',
        'बैंक खाते का संचालन',
        'वित्तीय पारदर्शिता बनाए रखना',
        'केंद्र और राज्य से प्राप्त होने वाले फंड का उपयोग'
      ],
      hinglish: [
        'Gram Panchayat ke income ke sources',
        'Annual budget taiyar karna',
        'Expenses ki monitoring aur control',
        'Lekha-jokha aur audit ki process',
        'Bank account ka sanchaalan',
        'Financial transparency maintain karna',
        'Center aur state se milne wale funds ka upyog'
      ]
    }
  },
  {
    id: 5,
    title: {
      hindi: 'सामुदायिक नेतृत्व और समस्या समाधान',
      hinglish: 'Community Leadership aur Problem Solving'
    },
    description: {
      hindi: 'एक प्रभावी नेता बनें और गांव की समस्याओं का समाधान करें',
      hinglish: 'Ek effective leader bane aur gaon ki problems ka solution kare'
    },
    content: {
      hindi: [
        'प्रभावी संवाद और बातचीत की कला',
        'विवादों का निपटारा और मध्यस्थता',
        'सामुदायिक सहयोग को बढ़ावा देना',
        'गांव में एकता बनाए रखना',
        'महिलाओं और युवाओं की भागीदारी सुनिश्चित करना',
        'पर्यावरण संरक्षण के उपाय',
        'डिजिटल तकनीक का उपयोग'
      ],
      hinglish: [
        'Effective communication aur conversation ki kala',
        'Disputes ka niptara aur mediation',
        'Community cooperation ko badhawa dena',
        'Gaon mein unity maintain karna',
        'Women aur youth ki participation ensure karna',
        'Environment protection ke upaay',
        'Digital technology ka upyog'
      ]
    }
  }
];

// Enhanced training modules with more comprehensive content

export default function SarpanchAcademyPage() {
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  const [isReading, setIsReading] = useState(false);

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

  const markModuleComplete = (moduleId: number) => {
    if (!completedModules.includes(moduleId)) {
      setCompletedModules([...completedModules, moduleId]);
      // Store completion in localStorage
      localStorage.setItem('completed-modules', JSON.stringify([...completedModules, moduleId]));
    }
  };

  // Text-to-Speech functionality with Indian accent
  const startReading = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set language and try to get Indian English voice
      utterance.lang = language === 'hindi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.7;
      utterance.pitch = 1.0;
      
      // Try to find Indian English voice
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
                // Module Selection
                <div>
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-emerald-600 mb-4">
                      {language === 'hindi' ? '🎓 सरपंच अकादमी' : '🎓 Sarpanch Academy'}
                    </h2>
                    <p className="text-gray-600">
                      {language === 'hindi' 
                        ? 'एक सफल सरपंच बनने के लिए आवश्यक प्रशिक्षण मॉड्यूल'
                        : 'Essential training modules to become a successful sarpanch'
                      }
                    </p>
                  </div>

                  {/* Training Modules */}
                  <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto mb-8">
                    {trainingModules.map((module) => (
                      <Card 
                        key={module.id}
                        className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
                        onClick={() => setSelectedModule(module.id)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="bg-emerald-100 p-3 rounded-full">
                                <BookOpen className="w-6 h-6 text-emerald-600" />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                  मॉड्यूल {module.id}: {module.title[language]}
                                </h3>
                                <p className="text-gray-600 text-sm">
                                  {module.description[language]}
                                </p>
                              </div>
                            </div>
                            {completedModules.includes(module.id) && (
                              <CheckCircle className="w-6 h-6 text-green-500" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Quick Assessment Section */}
                  <div className="max-w-4xl mx-auto">
                    <h3 className="text-2xl font-bold text-emerald-600 mb-6">
                      {language === 'hindi' ? '📋 स्व-मूल्यांकन परीक्षा' : '📋 Self Assessment Quiz'}
                    </h3>
                    
                    <Card className="mb-6">
                      <CardContent className="p-6">
                        <div className="text-center">
                          <div className="bg-yellow-100 p-6 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                            <span className="text-3xl">🏆</span>
                          </div>
                          <h4 className="text-lg font-bold text-gray-800 mb-2">
                            {language === 'hindi' ? 'प्रगति ट्रैकर' : 'Progress Tracker'}
                          </h4>
                          <p className="text-gray-600 mb-4">
                            {language === 'hindi' 
                              ? `${completedModules.length}/5 मॉड्यूल पूर्ण किए गए`
                              : `${completedModules.length}/5 modules completed`
                            }
                          </p>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-emerald-500 h-3 rounded-full transition-all duration-300"
                              style={{ width: `${(completedModules.length / 5) * 100}%` }}
                            ></div>
                          </div>
                          <p className="text-sm text-gray-500 mt-2">
                            {language === 'hindi' 
                              ? `${Math.round((completedModules.length / 5) * 100)}% पूर्ण`
                              : `${Math.round((completedModules.length / 5) * 100)}% Complete`
                            }
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {completedModules.length === 5 && (
                      <Card className="border-green-200 bg-green-50">
                        <CardContent className="p-6 text-center">
                          <div className="text-4xl mb-4">🎉</div>
                          <h4 className="text-xl font-bold text-green-800 mb-2">
                            {language === 'hindi' ? 'बधाई हो!' : 'Congratulations!'}
                          </h4>
                          <p className="text-green-700">
                            {language === 'hindi' 
                              ? 'आपने सभी प्रशिक्षण मॉड्यूल सफलतापूर्वक पूरे कर लिए हैं। अब आप एक कुशल सरपंच बनने के लिए तैयार हैं!'
                              : 'You have successfully completed all training modules. You are now ready to become a skilled sarpanch!'
                            }
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              ) : (
                // Module Content
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <Button
                      onClick={() => setSelectedModule(null)}
                      variant="outline"
                      size="sm"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      {language === 'hindi' ? 'वापस' : 'Back'}
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          if (selectedModuleData) {
                            const fullText = `${selectedModuleData.title[language]}. ${selectedModuleData.content[language].join('. ')}`;
                            toggleReading(fullText);
                          }
                        }}
                        variant="outline"
                        size="sm"
                        className="border-blue-200 text-blue-600 hover:bg-blue-50"
                      >
                        {isReading ? <VolumeX className="w-4 h-4 mr-2" /> : <Volume2 className="w-4 h-4 mr-2" />}
                        {isReading 
                          ? (language === 'hindi' ? 'रोकें' : 'Stop') 
                          : (language === 'hindi' ? 'सुनें' : 'Listen')
                        }
                      </Button>
                      <Button
                        onClick={() => markModuleComplete(selectedModule)}
                        className="primary-button"
                        disabled={completedModules.includes(selectedModule)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {completedModules.includes(selectedModule) 
                          ? (language === 'hindi' ? 'पूर्ण' : 'Completed')
                          : (language === 'hindi' ? 'पूर्ण करें' : 'Mark Complete')
                        }
                      </Button>
                    </div>
                  </div>

                  {selectedModuleData && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-emerald-600">
                          मॉड्यूल {selectedModuleData.id}: {selectedModuleData.title[language]}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {selectedModuleData.content[language].map((point, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                              <div className="bg-emerald-100 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                <span className="text-emerald-600 text-xs font-bold">{index + 1}</span>
                              </div>
                              <p className="text-gray-700">{point}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
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
                  {language === 'hindi' ? 'सरपंच अकादमी' : 'Sarpanch Academy'}
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
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-emerald-600 mb-2">
                    {language === 'hindi' ? '🎓 प्रशिक्षण मॉड्यूल' : '🎓 Training Modules'}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {language === 'hindi' 
                      ? 'सफल सरपंच बनने के लिए सीखें'
                      : 'Learn to become a successful sarpanch'
                    }
                  </p>
                </div>

                {/* Mobile Training Modules */}
                <div className="space-y-4 mb-8">
                  {trainingModules.map((module) => (
                    <Card 
                      key={module.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedModule(module.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="bg-emerald-100 p-2 rounded-full">
                              <BookOpen className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800 text-sm mb-1">
                                मॉड्यूल {module.id}
                              </h3>
                              <p className="text-gray-600 text-xs">
                                {module.title[language]}
                              </p>
                            </div>
                          </div>
                          {completedModules.includes(module.id) && (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Mobile Progress Tracker */}
                <div>
                  <h3 className="text-lg font-bold text-emerald-600 mb-4">
                    {language === 'hindi' ? '📋 प्रगति ट्रैकर' : '📋 Progress Tracker'}
                  </h3>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="bg-yellow-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                          <span className="text-xl">🏆</span>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">
                          {language === 'hindi' 
                            ? `${completedModules.length}/5 मॉड्यूल पूर्ण`
                            : `${completedModules.length}/5 modules completed`
                          }
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(completedModules.length / 5) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {Math.round((completedModules.length / 5) * 100)}% 
                          {language === 'hindi' ? ' पूर्ण' : ' Complete'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              // Mobile Module Content
              <div>
                {selectedModuleData && (
                  <div>
                    <div className="mb-4">
                      <h2 className="text-lg font-bold text-emerald-600 mb-2">
                        मॉड्यूल {selectedModuleData.id}
                      </h2>
                      <h3 className="font-semibold text-gray-800 text-sm mb-3">
                        {selectedModuleData.title[language]}
                      </h3>
                      
                      <Button
                        onClick={() => markModuleComplete(selectedModule)}
                        className="primary-button w-full mb-4"
                        size="sm"
                        disabled={completedModules.includes(selectedModule)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {completedModules.includes(selectedModule) 
                          ? (language === 'hindi' ? 'पूर्ण ✓' : 'Completed ✓')
                          : (language === 'hindi' ? 'पूर्ण करें' : 'Mark Complete')
                        }
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {selectedModuleData.content[language].map((point, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="bg-emerald-100 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-emerald-600 text-xs font-bold">{index + 1}</span>
                          </div>
                          <p className="text-gray-700 text-sm">{point}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        {/* Mobile Navigation */}
        <nav className="nav-item fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-50">
          <div className="flex justify-center items-center space-x-6 max-w-md mx-auto">
            <Link 
              to="/" 
              className="nav-item flex flex-col items-center p-2 rounded-xl transition-all text-gray-500 hover:text-emerald-600"
            >
              <Home size={18} />
              <span className="text-xs mt-1 font-medium">{t('home')}</span>
            </Link>
            
            <Link 
              to="/chat" 
              className="nav-item flex flex-col items-center p-2 rounded-xl transition-all text-gray-500 hover:text-emerald-600"
            >
              <MessageCircle size={18} />
              <span className="text-xs mt-1 font-medium">{t('chat')}</span>
            </Link>
            
            <Link 
              to="/voice-agent" 
              className="nav-item flex flex-col items-center p-2 rounded-xl transition-all text-gray-500 hover:text-emerald-600"
            >
              <Mic size={18} />
              <span className="text-xs mt-1 font-medium">{t('voice')}</span>
            </Link>

            <Link 
              to="/circulars" 
              className="nav-item flex flex-col items-center p-2 rounded-xl transition-all text-gray-500 hover:text-emerald-600"
            >
              <LinkIcon size={18} />
              <span className="text-xs mt-1 font-medium">
                {language === 'hindi' ? 'परिपत्र' : 'Circulars'}
              </span>
            </Link>

            <Link 
              to="/document" 
              className="nav-item flex flex-col items-center p-2 rounded-xl transition-all text-gray-500 hover:text-emerald-600"
            >
              <FileText size={18} />
              <span className="text-xs mt-1 font-medium">
                {language === 'hindi' ? 'दस्तावेज़' : 'Document'}
              </span>
            </Link>

            <div className="nav-item active flex flex-col items-center p-2 rounded-xl">
              <GraduationCap size={18} />
              <span className="text-xs mt-1 font-medium">
                {language === 'hindi' ? 'अकादमी' : 'Academy'}
              </span>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
} 